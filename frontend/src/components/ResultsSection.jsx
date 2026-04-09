import { useState, useEffect } from 'react';
import MatchesTimeline from './MatchesTimeline';
import ZoomModal from './ZoomModal';

export default function ResultsSection({ isLoading, results, error, onReset, apiUrl }) {
  const [barWidth, setBarWidth] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    if (results?.lastSeen?.confidence) {
      setTimeout(() => setBarWidth(results.lastSeen.confidence), 100);
    } else {
      setBarWidth(0);
    }
  }, [results]);

  // ── Loading State ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="loading-overlay" role="status" aria-live="polite">
        <div className="loading-scanner" aria-hidden="true">
          <div className="loading-scanner-face">🧑</div>
          <div className="loading-scan-line" />
        </div>
        <div className="loading-title">🔍 Scanning CCTV footage...</div>
        <div className="loading-sub">AI is comparing facial encodings against dataset</div>
        <div className="loading-dots" aria-hidden="true">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
    );
  }

  // ── API Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="results-section" aria-live="polite">
        <div className="state-card error" role="alert">
          <span className="state-icon">⚠️</span>
          <h2 className="state-title">Search Error</h2>
          <p className="state-desc">{error}</p>
          <button id="reset-btn-error" className="btn btn-ghost" onClick={onReset} style={{ marginTop: '24px' }}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!results) return null;

  // ── No Face Detected ─────────────────────────────────────────────
  if (results.error === 'no_face') {
    return (
      <section className="results-section" aria-live="polite">
        <div className="state-card error" role="alert">
          <span className="state-icon">😶</span>
          <h2 className="state-title">No face detected in uploaded image</h2>
          <p className="state-desc">
            The uploaded image does not appear to contain a detectable face.
            Try uploading a clearer image.
          </p>
          <button id="reset-btn-noface" className="btn btn-ghost" onClick={onReset} style={{ marginTop: '24px' }}>
            Upload Different Image
          </button>
        </div>
      </section>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────
  if (results.status === 'not_found' || (results.matches && results.matches.length === 0)) {
    return (
      <section className="results-section" aria-live="polite">
        <div className="state-card not-found" role="alert">
          <span className="state-icon">🔎</span>
          <h2 className="state-title">No match found in available CCTV data</h2>
          <p className="state-desc">
            No matching face was found in the CCTV dataset. The person may not
            have appeared in any of the monitored locations, or the image quality
            may be too low. Try uploading a clearer image.
          </p>
          <button id="reset-btn-notfound" className="btn btn-ghost" onClick={onReset} style={{ marginTop: '24px' }}>
            Try Another Image
          </button>
        </div>
      </section>
    );
  }

  // ── Results Found ─────────────────────────────────────────────────
  const { lastSeen, matches, mode, message, matchCount, datasetCount } = results;
  const isMock = mode === 'mock';

  return (
    <section className="results-section" aria-live="polite" aria-label="Search results">
      {/* Header */}
      <div className="results-header">
        <h2 className="results-title">
          🎯 Matches Found: {matchCount || matches?.length || 0}
        </h2>
        <div className={`results-mode-badge ${isMock ? 'mock' : 'ai'}`}>
          {isMock ? 'Mode: Demo (Simulated Data)' : 'Mode: AI Processing'}
        </div>
      </div>
      
      {datasetCount !== undefined && (
        <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center' }}>
          Scanning {datasetCount} CCTV frames...
        </div>
      )}

      {/* Mock Warning */}
      {isMock && (
        <div className="info-banner" role="note" style={{ marginBottom: '24px' }}>
          <span className="info-banner-icon">🔶</span>
          <span>
            <strong>Demo Mode Active:</strong> {message || 'Results are simulated for demonstration purposes. Install face_recognition for real AI matching.'}
          </span>
        </div>
      )}

      {/* Last Seen Card */}
      {lastSeen && (
        <div className="last-seen-card" role="region" aria-label="Last known location">
          <div className="last-seen-eyebrow" style={{ color: 'var(--danger)', fontSize: '14px' }}>
            🚨 LAST SEEN
          </div>
          <div className="last-seen-grid">
            <div className="last-seen-stat">
              <div className="last-seen-stat-icon">📷</div>
              <div className="last-seen-stat-label">Camera</div>
              <div className="last-seen-stat-value">{lastSeen.camera?.toUpperCase()}</div>
              <div className="last-seen-stat-sub">{lastSeen.location}</div>
            </div>
            <div className="last-seen-stat">
              <div className="last-seen-stat-icon">🕐</div>
              <div className="last-seen-stat-label">Last Seen At</div>
              <div className="last-seen-stat-value">{lastSeen.time}</div>
              <div className="last-seen-stat-sub">Timestamp</div>
            </div>
            {lastSeen.confidence && (
              <div className="last-seen-stat">
                <div className="last-seen-stat-icon">🎯</div>
                <div className="last-seen-stat-label">Confidence Score</div>
                <div className="last-seen-stat-value">Confidence: {lastSeen.confidence}%</div>
                <div className="last-seen-stat-sub">({lastSeen.confidence > 85 ? 'High Match' : 'Match'})</div>
                <div className="confidence-bar-wrap">
                  <div
                    className="confidence-bar"
                    style={{ width: `${barWidth}%` }}
                    role="progressbar"
                    aria-valuenow={lastSeen.confidence}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            )}
            <div className="last-seen-stat">
              <div className="last-seen-stat-icon">📍</div>
              <div className="last-seen-stat-label">Total Sightings</div>
              <div className="last-seen-stat-value">{matches?.length || 0}</div>
              <div className="last-seen-stat-sub">CCTV locations</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {matches && matches.length > 0 && (
        <MatchesTimeline matches={matches} lastSeenCamera={lastSeen?.camera} apiUrl={apiUrl} onZoom={setZoomedImage} />
      )}

      {/* New Search */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button id="new-search-btn" className="btn btn-ghost" onClick={onReset}>
          🔄 Clear Results
        </button>
      </div>

      {zoomedImage && <ZoomModal imgSrc={zoomedImage} onClose={() => setZoomedImage(null)} />}
    </section>
  );
}
