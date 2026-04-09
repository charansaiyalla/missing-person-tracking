import { useState, useEffect } from 'react';
import CaseDetailModal from './CaseDetailModal';

export default function PoliceDashboard({ apiUrl }) {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const fetchCases = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/cases`);
      if (!res.ok) throw new Error('Failed to fetch cases');
      const data = await res.json();
      setCases(data.reverse()); // Show newest first
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [apiUrl]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiUrl}/api/cases/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setCases(cases.map(c => c.id === id ? { ...c, status } : c));
        if (selectedCase && selectedCase.id === id) {
          setSelectedCase({ ...selectedCase, status });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCase = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/cases/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCases(cases.filter(c => c.id !== id));
        if (selectedCase && selectedCase.id === id) setSelectedCase(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    let bg = 'var(--text-dim)', text = '#fff';
    if (status === 'Found') bg = 'var(--success)';
    if (status === 'Investigating') bg = 'var(--warning)';
    if (status === 'Closed') bg = 'var(--danger)';
    
    return (
      <span style={{ 
        background: bg, color: text, padding: '4px 10px', 
        borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' 
      }}>
        {status || 'Open'}
      </span>
    );
  };

  return (
    <div className="police-dashboard animate-slide-up" style={{ paddingBottom: '60px' }}>
      <div className="results-header" style={{ marginTop: '40px' }}>
        <h2 className="results-title">👮 Police & Admin Dashboard</h2>
        <div className="results-mode-badge ai">
          Authorized Personnel Only
        </div>
      </div>

      <div className="info-banner" role="note" style={{ marginBottom: '24px' }}>
        <span className="info-banner-icon">ℹ️</span>
        <span>
          <strong>Dashboard Overview:</strong> This view lists all reported missing person cases and their tracking status. All data is real-time from the backend's in-memory storage.
        </span>
      </div>

      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      ) : error ? (
        <div className="state-card error">
          <span className="state-icon">⚠️</span>
          <h2 className="state-title">Error Loading Cases</h2>
          <p className="state-desc">{error}</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="state-card">
          <span className="state-icon">📂</span>
          <h2 className="state-title">No Active Cases</h2>
          <p className="state-desc">There are currently no missing person situations reported in the system.</p>
        </div>
      ) : (
        <div className="cases-grid" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {cases.map((c) => (
            <div key={c.id} className="case-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div 
                className="case-image" 
                style={{ height: '200px', width: '100%', background: 'var(--card-2)', cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedCase(c)}
              >
                <img src={apiUrl + c.queryImage} alt="Missing Person" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  {getStatusBadge(c.status)}
                </div>
              </div>
              <div className="case-body" style={{ padding: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{c.personDetails.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                  <strong>Age:</strong> {c.personDetails.age} • <strong>Gender:</strong> {c.personDetails.gender}<br/>
                  <strong>Date:</strong> {c.personDetails.missingDate}<br/>
                  <strong>Contact:</strong> {c.personDetails.contactInfo}
                </div>
                
                <div style={{ background: 'var(--bg-2)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '12px', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedCase(c)}>
                  <div style={{ color: 'var(--accent-light)', fontWeight: 'bold', marginBottom: '4px' }}>Tracking Status</div>
                  {c.results && c.results.lastSeen ? (
                    <>
                      <div>🚨 Last seen at <strong>{c.results.lastSeen.location}</strong> ({c.results.lastSeen.time})</div>
                      <div style={{ marginTop: '4px' }}>Matches found: {c.results.matchCount}</div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--warning)' }}>No matches found in CCTV data</div>
                  )}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button onClick={() => updateStatus(c.id, 'Found')} style={{ flex: 1, padding: '6px', fontSize: '11px', background: 'var(--success)', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>✅ Found</button>
                  <button onClick={() => updateStatus(c.id, 'Investigating')} style={{ flex: 1, padding: '6px', fontSize: '11px', background: 'var(--warning)', border: 'none', borderRadius: '4px', color: '#111', cursor: 'pointer', fontWeight: 'bold' }}>⚠️ Investigate</button>
                  <button onClick={() => updateStatus(c.id, 'Closed')} style={{ flex: 1, padding: '6px', fontSize: '11px', background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', cursor: 'pointer', fontWeight: 'bold' }}>❌ Close</button>
                  <button onClick={() => deleteCase(c.id)} style={{ padding: '6px', fontSize: '11px', background: 'transparent', border: '1px solid var(--danger)', borderRadius: '4px', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold' }}>🗑 Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCase && (
        <CaseDetailModal 
          caseData={selectedCase} 
          apiUrl={apiUrl} 
          onClose={() => setSelectedCase(null)} 
        />
      )}
    </div>
  );
}
