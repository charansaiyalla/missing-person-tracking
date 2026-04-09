const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

// In-memory case storage
const cases = [];

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve dataset images statically
const datasetPath = path.join(__dirname, '..', 'dataset');
app.use('/dataset', express.static(datasetPath));

// Serve uploaded images statically
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// ─── Multer Config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: uploadsPath,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `query_${uuidv4()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only image files are allowed'));
  },
});

// ─── Camera Location Map ─────────────────────────────────────────────────────
const CAM_LOCATIONS = {
  cam1: 'Main Entrance Gate',
  cam2: 'Central Market Area',
  cam3: 'Railway Station Platform 2',
  cam4: 'Bus Stand Junction',
  cam5: 'City Park South Exit',
};

// ─── Mock Mode ────────────────────────────────────────────────────────────────
function checkPythonAvailable() {
  return new Promise((resolve) => {
    const proc = spawn('python', ['--version']);
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}

function getMockResults(queryImageUrl) {
  const cameras = Object.keys(CAM_LOCATIONS);
  const times = ['08:30 AM', '09:45 AM', '10:15 AM', '11:00 AM', '12:30 PM'];
  const numMatches = 2 + Math.floor(Math.random() * 3);

  const matches = [];
  const usedCams = new Set();

  for (let i = 0; i < numMatches; i++) {
    let cam;
    do { cam = cameras[Math.floor(Math.random() * cameras.length)]; } while (usedCams.has(cam));
    usedCams.add(cam);

    const time = times[Math.floor(Math.random() * times.length)];
    const confidence = (75 + Math.random() * 20).toFixed(1);
    const file = `${cam}_${time.replace(/ /g, '').replace(':', '').toLowerCase()}.jpg`;

    matches.push({
      file,
      camera: cam,
      location: CAM_LOCATIONS[cam] || cam,
      time,
      confidence: parseFloat(confidence),
      imageUrl: `/dataset/${file}`,
    });
  }

  // Sort by time (approximate)
  matches.sort((a, b) => {
    const toMin = (t) => {
      const [hm, ampm] = t.split(' ');
      let [h, m] = hm.split(':').map(Number);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    return toMin(a.time) - toMin(b.time);
  });

  const lastSeen = matches[matches.length - 1];

  return {
    status: 'mock',
    mode: 'mock',
    message: 'Running in demo mode',
    queryImage: queryImageUrl,
    matchCount: matches.length,
    matches,
    lastSeen: {
      camera: lastSeen.camera,
      location: lastSeen.location,
      time: lastSeen.time,
      confidence: lastSeen.confidence,
      imageUrl: lastSeen.imageUrl,
    },
  };
}

// ─── Python AI Processing ─────────────────────────────────────────────────────
function runPythonMatch(imagePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'ai', 'match_face.py');
    const proc = spawn('python', [scriptPath, imagePath, datasetPath]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error('Python stderr:', stderr);
        return reject(new Error(`Python exited with code ${code}: ${stderr}`));
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${stdout}`));
      }
    });

    proc.on('error', (err) => reject(err));
    setTimeout(() => { proc.kill(); reject(new Error('Python script timed out')); }, 30000);
  });
}

// ─── Main Search Route ────────────────────────────────────────────────────────
app.post('/api/search', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const imagePath = req.file.path;
  const queryImageUrl = `/uploads/${req.file.filename}`;

  try {
    // Try real AI first, fall back to mock
    let pythonAvailable = false;
    try {
      pythonAvailable = await checkPythonAvailable();
    } catch {
      pythonAvailable = false;
    }

    if (!pythonAvailable) {
      console.log('Python not found — using mock mode');
      return res.json(getMockResults(queryImageUrl));
    }

    let result;
    try {
      result = await runPythonMatch(imagePath);
    } catch (pyErr) {
      console.warn('Python AI failed, falling back to mock:', pyErr.message);
      return res.json({ ...getMockResults(queryImageUrl), fallbackReason: pyErr.message });
    }

    // If Python returned an import error (face_recognition not installed), use mock
    if (result.error === 'face_recognition not installed' || result.install) {
      console.log('face_recognition not installed — using mock mode');
      const mockRes = getMockResults(queryImageUrl);
      mockRes.fallbackReason = 'face_recognition library not installed on this machine';
      result = mockRes;
    } else if (result.error && result.error !== 'not_found' && result.error !== 'empty_dataset') {
      // If Python returned another error (no face, empty dataset), pass it through
      return res.json({ ...result, queryImage: queryImageUrl });
    } else {
      result.mode = 'ai';
    }

    // Enrich AI result with location names
    if (result.matches) {
      result.matches = result.matches.map((m) => ({
        ...m,
        location: CAM_LOCATIONS[m.camera] || m.camera,
        imageUrl: `/dataset/${m.file}`,
      }));
      if (result.lastSeen) {
        result.lastSeen.location = CAM_LOCATIONS[result.lastSeen.camera] || result.lastSeen.camera;
        result.lastSeen.imageUrl = `/dataset/${result.lastSeen.file || result.lastSeen.camera + '.jpg'}`;
      }
    }

    // Calculate dataset count
    let datasetCount = 0;
    try {
      const files = fs.readdirSync(datasetPath).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
      datasetCount = files.length;
    } catch {}

    result.queryImage = queryImageUrl;
    result.datasetCount = datasetCount;
    
    // Create new case record
    const newCase = {
      id: uuidv4(),
      status: 'Open',
      personDetails: {
        name: req.body.name || 'Unknown',
        age: req.body.age || 'Unknown',
        gender: req.body.gender || 'Not specified',
        lastSeenLocation: req.body.lastSeenLocation || 'Unknown',
        missingDate: req.body.missingDate || 'Unknown',
        contactInfo: req.body.contactInfo || 'Not provided',
      },
      createdAt: new Date().toISOString(),
      queryImage: queryImageUrl,
      results: result
    };
    cases.push(newCase);
    
    // Also append the case details to the immediate result
    result.caseDetails = newCase.personDetails;

    return res.json(result);
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    // Clean up upload after 5 minutes
    setTimeout(() => { try { fs.unlinkSync(imagePath); } catch { } }, 5 * 60 * 1000);
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', datasetPath, uploadsPath });
});

// ─── Case Management ─────────────────────────────────────────────────────────

app.put('/api/cases/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const caseIndex = cases.findIndex(c => c.id === id);
  if (caseIndex === -1) return res.status(404).json({ error: 'Case not found' });
  
  cases[caseIndex].status = status;
  return res.json(cases[caseIndex]);
});

app.delete('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = cases.length;
  cases = cases.filter(c => c.id !== id);
  if (cases.length === initialLength) return res.status(404).json({ error: 'Case not found' });
  
  return res.json({ success: true, message: 'Case deleted successfully' });
});

// ─── Dataset list ─────────────────────────────────────────────────────────────
app.get('/api/dataset', (req, res) => {
  try {
    const files = fs.readdirSync(datasetPath).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
    res.json({ files, count: files.length });
  } catch {
    res.json({ files: [], count: 0 });
  }
});

// ─── Case Storage Route ───────────────────────────────────────────────────────
app.get('/api/cases', (req, res) => {
  res.json(cases);
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Dataset path: ${datasetPath}`);
});
