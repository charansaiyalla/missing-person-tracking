export default function Navbar({ activeNav, onNav, view, onLogout, username }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon" aria-hidden="true">🎯</div>
          <div>
            <div className="navbar-title">TrackAI</div>
            <div className="navbar-subtitle">Missing Person Tracker</div>
          </div>
        </div>

        {/* Nav Links */}
        <ul className="navbar-nav">
          <li>
            <a
              href="#home"
              id="nav-home"
              className={activeNav === 'home' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); onNav('home'); }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#about"
              id="nav-about"
              className={activeNav === 'about' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); onNav('about'); }}
            >
              How It Works
            </a>
          </li>
          {view !== 'login' ? (
            <>
              <li>
                <span className="navbar-badge" style={{ background: view === 'police' ? 'var(--danger)' : 'var(--accent)' }}>
                  {view === 'police' ? '🚔 POLICE / ADMIN' : `👤 ${username || 'CITIZEN'}`}
                </span>
              </li>
              <li>
                <button 
                  className="btn btn-ghost" 
                  style={{ padding: '4px 12px', fontSize: '11px', minHeight: 'auto' }}
                  onClick={onLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <span className="navbar-badge">AI Prototype</span>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
