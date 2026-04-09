import MatchesTimeline from './MatchesTimeline';
import ZoomModal from './ZoomModal';
import { useState } from 'react';

export default function CaseDetailModal({ caseData, apiUrl, onClose }) {
  const [zoomedImage, setZoomedImage] = useState(null);

  if (!caseData) return null;

  return (
    <div 
      className="zoom-modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div 
        className="zoom-modal-content animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '90vw',
          maxWidth: '800px',
          maxHeight: '90vh',
          background: 'var(--bg)',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          boxShadow: '0 10px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,102,255,0.2)',
          border: '1px solid var(--border-bright)'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--danger)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          ✕
        </button>
        
        <div style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Case Details: {caseData.personDetails.name}</h2>
          <div style={{ color: 'var(--text-dim)', marginBottom: '24px', fontSize: '13px' }}>
            Reported: {new Date(caseData.createdAt).toLocaleString()}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '24px' }}>
            <div>
              <img 
                src={`${apiUrl}${caseData.queryImage}`} 
                alt="Source" 
                style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '16px', cursor: 'zoom-in' }} 
                onClick={() => setZoomedImage(`${apiUrl}${caseData.queryImage}`)}
              />
            </div>
            
            <div style={{ background: 'var(--card)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <span className="navbar-badge" style={{ background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text)' }}>
                  Age: {caseData.personDetails.age}
                </span>
                <span className="navbar-badge" style={{ background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text)' }}>
                  Gender: {caseData.personDetails.gender}
                </span>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Last Seen Location</div>
                <div style={{ fontWeight: 'bold' }}>{caseData.personDetails.lastSeenLocation}</div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Missing Date / Time</div>
                <div style={{ fontWeight: 'bold' }}>{caseData.personDetails.missingDate}</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Contact Information</div>
                <div style={{ fontWeight: 'bold' }}>{caseData.personDetails.contactInfo}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--accent-light)' }}>Tracking Route</h3>
            {caseData.results?.matches && caseData.results.matches.length > 0 ? (
              <MatchesTimeline 
                matches={caseData.results.matches} 
                lastSeenCamera={caseData.results.lastSeen?.camera} 
                apiUrl={apiUrl} 
                onZoom={setZoomedImage}
              />
            ) : (
              <div className="info-banner" role="alert">
                <span className="info-banner-icon">⚠️</span>
                No CCTV matches have been found for this individual yet.
              </div>
            )}
          </div>

        </div>
      </div>
      
      {zoomedImage && <ZoomModal imgSrc={zoomedImage} onClose={() => setZoomedImage(null)} />}
    </div>
  );
}
