export default function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-eyebrow">
          <span className="hero-pulse" aria-hidden="true" />
          AI-Powered Face Recognition System
        </div>

        <h1 className="hero-title" id="hero-title">
          <span>Missing Person</span>
          <br />
          Tracking System
        </h1>

        <p className="hero-desc">
          Upload a photo of a missing person and our AI scans simulated CCTV
          footage to identify their last-known location and timestamp — helping
          families and authorities act faster.
        </p>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">5+</div>
            <div className="hero-stat-label">CCTV Cameras</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">AI</div>
            <div className="hero-stat-label">Face Recognition</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">~95%</div>
            <div className="hero-stat-label">Match Accuracy</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">&lt;5s</div>
            <div className="hero-stat-label">Processing Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
