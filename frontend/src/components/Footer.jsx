export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <p className="footer-text">
          <strong>TrackAI</strong> — Missing Person Tracking System &nbsp;|&nbsp;
          Built as an AI Prototype &nbsp;|&nbsp;
          Powered by{' '}
          <a href="https://github.com/ageitgey/face_recognition" target="_blank" rel="noopener noreferrer">
            face_recognition
          </a>
        </p>
        <p className="footer-disclaimer">
          ⚠️ This is a <strong>prototype system</strong> for educational and demonstration purposes only.
          It does not process real-time CCTV feeds. All CCTV footage is simulated using a local dataset.
          Accuracy depends on image quality and dataset size.
        </p>
      </div>
    </footer>
  );
}
