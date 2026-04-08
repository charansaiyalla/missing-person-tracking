const STEPS = [
  {
    number: '01',
    icon: '📤',
    title: 'Upload Photo',
    desc: 'Upload a clear, front-facing photo of the missing person from any device.',
  },
  {
    number: '02',
    icon: '🤖',
    title: 'AI Encoding',
    desc: 'The face_recognition library creates a 128-point facial signature from the uploaded photo.',
  },
  {
    number: '03',
    icon: '📷',
    title: 'CCTV Dataset Scan',
    desc: 'The system scans all simulated CCTV images and extracts face encodings from each frame.',
  },
  {
    number: '04',
    icon: '🔍',
    title: 'Face Comparison',
    desc: 'Encodings are compared using Euclidean distance. Matches below 0.55 tolerance are flagged.',
  },
  {
    number: '05',
    icon: '📍',
    title: 'Location Extraction',
    desc: 'Camera ID and timestamp are parsed from the filename (e.g. cam2_11am.jpg → Cam 2, 11 AM).',
  },
  {
    number: '06',
    icon: '✅',
    title: 'Results Displayed',
    desc: 'All matches are shown in a timeline. The latest sighting is highlighted as "Last Known Location".',
  },
];

export default function HowItWorks() {
  return (
    <div className="how-section" id="how-it-works">
      <h2 className="how-title">How It Works</h2>
      <div className="how-grid">
        {STEPS.map((step) => (
          <div className="how-card" key={step.number}>
            <div className="how-card-number">Step {step.number}</div>
            <div className="how-card-icon" aria-hidden="true">{step.icon}</div>
            <div className="how-card-title">{step.title}</div>
            <div className="how-card-desc">{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
