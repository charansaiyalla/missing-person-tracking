import { useState } from 'react';

export default function Login({ onLogin }) {
  // Police Form State
  const [policeUser, setPoliceUser] = useState('');
  const [policePass, setPolicePass] = useState('');
  const [policeError, setPoliceError] = useState('');

  // Citizen Form State
  const [citizenUser, setCitizenUser] = useState('');
  const [citizenPass, setCitizenPass] = useState('');
  const [citizenError, setCitizenError] = useState('');

  const handlePoliceSubmit = (e) => {
    e.preventDefault();
    setPoliceError('');
    if (!policeUser.trim() || !policePass.trim()) {
      setPoliceError('Please enter both username and password.');
      return;
    }
    const trimmedUser = policeUser.trim().toLowerCase();
    if (trimmedUser === 'admin' || trimmedUser === 'police') {
      onLogin('police', trimmedUser);
    } else {
      setPoliceError('Invalid Police/Admin credentials.');
    }
  };

  const handleCitizenSubmit = (e) => {
    e.preventDefault();
    setCitizenError('');
    if (!citizenUser.trim() || !citizenPass.trim()) {
      setCitizenError('Please enter a username and password.');
      return;
    }
    const trimmedUser = citizenUser.trim().toLowerCase();
    onLogin('citizen', trimmedUser);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '40px 20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Select Portal Access</h1>
        <p style={{ color: 'var(--text-dim)', maxWidth: '600px' }}>
          Welcome to the Missing Person Tracking System. Please login to your respective portal to continue.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '1000px' 
      }}>
        
        {/* Left: Police / Admin */}
        <div className="state-card" style={{ padding: '40px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div className="state-icon" style={{ fontSize: '32px', marginBottom: '16px' }}>🚓</div>
          <h2 className="state-title" style={{ fontSize: '24px', marginBottom: '8px' }}>For Police/Admin</h2>
          <p className="state-desc" style={{ marginBottom: '32px', color: 'var(--text-dim)' }}>
            Authorized personnel access for active case tracking and management.
          </p>

          <form onSubmit={handlePoliceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            {policeError && (
              <div className="info-banner" style={{ background: 'var(--danger-dim)', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '12px' }} role="alert">
                <span className="info-banner-icon">⚠️</span>
                {policeError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="police or admin"
                value={policeUser}
                onChange={(e) => setPoliceUser(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={policePass}
                onChange={(e) => setPolicePass(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', background: 'var(--accent)', padding: '12px', fontWeight: 'bold' }}>
              Login to Dashboard
            </button>
          </form>
        </div>

        {/* Right: Citizen / User */}
        <div className="state-card" style={{ padding: '40px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div className="state-icon" style={{ fontSize: '32px', marginBottom: '16px' }}>👤</div>
          <h2 className="state-title" style={{ fontSize: '24px', marginBottom: '8px' }}>For Citizens</h2>
          <p className="state-desc" style={{ marginBottom: '32px', color: 'var(--text-dim)' }}>
            Public access to report sightings or search the active dataset.
          </p>

          <form onSubmit={handleCitizenSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            {citizenError && (
              <div className="info-banner" style={{ background: 'var(--danger-dim)', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '12px' }} role="alert">
                <span className="info-banner-icon">⚠️</span>
                {citizenError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="citizen123"
                value={citizenUser}
                onChange={(e) => setCitizenUser(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={citizenPass}
                onChange={(e) => setCitizenPass(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', background: 'var(--card-2)', border: '1px solid var(--border-bright)', color: 'var(--text)', padding: '12px', fontWeight: 'bold' }}>
              Access Upload Portal
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
