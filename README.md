# 🎯 Missing Person Tracking System using AI

An AI-powered prototype system that uses face recognition to identify the last known location of a missing person by scanning simulated CCTV footage.

---

## 🖼️ Overview

| Layer | Tech | Purpose |
|---|---|---|
| Frontend | React + Vite | Dark dashboard UI |
| Backend | Node.js + Express | File upload, API, Python bridge |
| AI Module | Python + face_recognition | Face encoding & comparison |
| Dataset | Local images | Simulated CCTV frames |

---

## 📁 Project Structure

```
missing-person-tracking/
├── frontend/          ← React Vite app (port 5173)
├── backend/           ← Express API (port 5000)
├── ai/
│   ├── match_face.py       ← Core face recognition script
│   ├── generate_dataset.py ← Dataset image generator
│   └── requirements.txt    ← Python dependencies
├── dataset/           ← CCTV placeholder images
└── README.md
```

---

## 🚀 Quick Start

### Step 1 — Start the Backend

```bash
cd backend
npm install
node server.js
```

Backend runs at `http://localhost:5000`

### Step 2 — Start the Frontend

```bash
cd frontend
npm install   # (already done during scaffold)
npm run dev
```

Frontend runs at `http://localhost:5173`

### Step 3 — (Optional) Set up Python AI

```bash
# Install Python dependencies
cd ai
pip install -r requirements.txt

# Generate placeholder CCTV dataset
python generate_dataset.py
```

> ⚠️ `face_recognition` requires `dlib` which needs CMake + C++ compiler.
> See https://github.com/ageitgey/face_recognition for setup help.
> **If Python is not set up, the system will automatically run in Demo Mode.**

---

## 🎮 Demo Mode (No Python Required)

If `face_recognition` is not installed, the backend automatically falls back to **mock mode**, which:
- Returns simulated match results
- Shows the full UI/dashboard experience
- Clearly labels results as "Demo Mode"

This is ideal for presentations without a full Python setup.

---

## 📷 Dataset Images

The `dataset/` folder contains simulated CCTV images named:

```
cam<id>_<time>.jpg

Examples:
  cam1_10am.jpg   → Camera 1, 10:00 AM
  cam2_11am.jpg   → Camera 2, 11:00 AM
  cam3_12pm.jpg   → Camera 3, 12:00 PM
```

### Using Real Images

1. Add your photos to `dataset/`
2. Name them using the format above
3. The AI will automatically scan them

---

## 🧠 How the AI Works

1. **Upload** → User uploads photo of missing person
2. **Encode** → face_recognition extracts 128-point facial signature
3. **Scan** → System loops through all dataset images
4. **Compare** → `compare_faces()` with 0.55 tolerance threshold
5. **Extract** → Camera ID & time from filename
6. **Report** → Last seen location + confidence score

---

## ⚠️ Limitations

- No real-time CCTV processing
- Small local dataset
- Accuracy depends on image quality
- No multi-camera live tracking
- Prototype only — not for production use

---

## 🎤 Presentation Notes

- AI face recognition is **real** (dlib/face_recognition library)
- CCTV is **simulated** using local dataset images
- Location data is **derived from filename metadata**
- System demonstrates the **concept** of AI-assisted tracking

---

## 📦 Dependencies

### Backend
- express, multer, cors, uuid

### Frontend  
- React 18, Vite, Inter (Google Fonts)

### Python AI
- face_recognition, dlib, Pillow, numpy
