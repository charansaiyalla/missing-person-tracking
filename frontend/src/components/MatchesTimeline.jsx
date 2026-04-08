import { useState } from 'react';

function TimelineCard({ match, isLast, apiUrl }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = match.imageUrl ? `${apiUrl}${match.imageUrl}` : null;

  return (
    <div className={`timeline-card ${isLast ? 'last-seen' : ''}`} role="article" aria-label={`${match.camera} sighting`}>
      {/* Image */}
      {imgSrc && !imgError ? (
        <div className="timeline-card-img">
          <img
            src={imgSrc}
            alt={`CCTV capture from ${match.camera}`}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="timeline-card-img-placeholder" aria-hidden="true">
          📹
        </div>
      )}

      {/* Body */}
      <div className="timeline-card-body">
        {isLast && (
          <span className="timeline-label last">Last Seen</span>
        )}
        <div className="timeline-cam">{match.camera?.toUpperCase()}</div>
        <div className="timeline-location">{match.location}</div>
        <div className="timeline-time">🕐 {match.time}</div>
        {match.confidence && (
          <div className="timeline-confidence">🎯 {match.confidence}% match</div>
        )}
      </div>
    </div>
  );
}

export default function MatchesTimeline({ matches, lastSeenCamera, apiUrl }) {
  return (
    <div className="timeline-section" role="region" aria-label="CCTV sighting timeline">
      <div className="timeline-title">
        📍 Movement Timeline
      </div>

      <div className="timeline-track" role="list">
        {matches.map((match, idx) => {
          const isLast = match.camera === lastSeenCamera;
          const isLastItem = idx === matches.length - 1;

          return (
            <div className="timeline-item" key={`${match.camera}-${idx}`} role="listitem">
              {/* Connector */}
              <div className="timeline-connector">
                {idx > 0 && <div className="timeline-line" aria-hidden="true" />}
                <div className={`timeline-dot${isLast ? ' last' : ''}`} aria-hidden="true" />
                {!isLastItem && <div className="timeline-right-line" aria-hidden="true" />}
              </div>

              {/* Card */}
              <TimelineCard match={match} isLast={isLast} apiUrl={apiUrl} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
