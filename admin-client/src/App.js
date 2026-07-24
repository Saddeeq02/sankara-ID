import React, { useState } from 'react';
import htm from 'htm';
import Dashboard from './pages/Dashboard.js';
import StaffManagement from './pages/StaffManagement.js';
import Leaderboard from './pages/Leaderboard.js';
import AttendanceLogs from './pages/AttendanceLogs.js';
import QRCodeGenerator from './pages/QRCodeGenerator.js';
import DevSettings from './pages/DevSettings.js';
import Complaints from './pages/Complaints.js';
import Announcements from './pages/Announcements.js';
import { LayoutDashboard, Users, Trophy, Calendar, QrCode, Settings, Menu, X, LogOut, ExternalLink, MessageSquare, Megaphone } from 'lucide-react';

const html = htm.bind(React.createElement);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  // Sync state changes back to URL hash
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.hash = currentPage;
    }
    // Close sidebar on mobile when navigating
    setSidebarOpen(false);
  }, [currentPage, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'sankara' && password === 'admin2026') {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return html`
      <div style=${{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style=${{ maxWidth: '400px', width: '90%', padding: '2.5rem' }}>
          <div style=${{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="Sankara Logo" style=${{ height: '80px', marginBottom: '1rem', objectFit: 'contain' }} />
            <h2 style=${{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Sankara Admin</h2>
            <p style=${{ color: 'var(--text-secondary)' }}>Welcome back, Sir. Please sign in.</p>
          </div>
          
          <form onSubmit=${handleLogin} style=${{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            ${loginError && html`
              <div style=${{ padding: '0.75rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid #fecaca' }}>
                ${loginError}
              </div>
            `}
            
            <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style=${{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Username</label>
              <input 
                type="text" 
                value=${username}
                onChange=${e => setUsername(e.target.value)}
                className="input-field" 
                placeholder="Enter username"
                required
              />
            </div>
            
            <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style=${{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
              <input 
                type="password" 
                value=${password}
                onChange=${e => setPassword(e.target.value)}
                className="input-field" 
                placeholder="Enter password"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style=${{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}>
              Sign In
            </button>
          </form>
          <div style=${{ marginTop: '2rem', textAlign: 'center' }}>
            <p style=${{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Developed by <a href="https://brainiacs.ng/" target="_blank" rel="noopener noreferrer" style=${{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Brainiacs Innovation</a>
            </p>
          </div>
        </div>
      </div>
    `;
  }


  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return html`<${Dashboard} />`;
      case 'staff':
        return html`<${StaffManagement} />`;
      case 'leaderboard':
        return html`<${Leaderboard} />`;
      case 'attendance':
        return html`<${AttendanceLogs} />`;
      case 'qr':
        return html`<${QRCodeGenerator} />`;
      case 'complaints':
        return html`<${Complaints} />`;
      case 'announcements':
        return html`<${Announcements} />`;
      case 'settings':
        return html`<${DevSettings} />`;
      default:
        return html`<${Dashboard} />`;
    }
  };

  return html`
    <div className="layout">
      <div 
        className=${`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick=${() => setSidebarOpen(false)}
      ></div>
      
      <aside className=${`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(226, 232, 240, 0.6)' }}>
          <div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" style=${{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <div>
              <h2 style=${{ fontSize: '1.25rem', margin: 0, fontWeight: '700', color: 'var(--primary)', lineHeight: '1.2' }}>Sankara Admin</h2>
              <p style=${{ fontSize: '0.75rem', margin: 0, color: 'var(--text-secondary)' }}>Control & Operations</p>
            </div>
          </div>
          <button 
            className="mobile-menu-btn" 
            style=${{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            onClick=${() => setSidebarOpen(false)}
          >
            <${X} size=${22} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            onClick=${() => { setCurrentPage('dashboard'); setSidebarOpen(false); }} 
            className=${`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <${LayoutDashboard} size=${19} /> Dashboard
          </button>
          <button 
            onClick=${() => { setCurrentPage('staff'); setSidebarOpen(false); }} 
            className=${`nav-link ${currentPage === 'staff' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <${Users} size=${19} /> Staff Management
          </button>
          <button 
            onClick=${() => { setCurrentPage('attendance'); setSidebarOpen(false); }} 
            className=${`nav-link ${currentPage === 'attendance' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <${Calendar} size=${19} /> Attendance Logs
          </button>
          <button 
            onClick=${() => { setCurrentPage('qr'); setSidebarOpen(false); }} 
            className=${`nav-link ${currentPage === 'qr' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <${QrCode} size=${19} /> QR Generator
          </button>
          <button 
            onClick=${() => { setCurrentPage('leaderboard'); setSidebarOpen(false); }} 
            className=${`nav-link ${currentPage === 'leaderboard' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <${Trophy} size=${19} /> Leaderboard
          </button>
          <button 
            onClick=${() => { setCurrentPage('complaints'); setSidebarOpen(false); }} 
            className=${`nav-link ${currentPage === 'complaints' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <${MessageSquare} size=${19} /> Complaints
          </button>
          <button 
            onClick=${() => { setCurrentPage('announcements'); setSidebarOpen(false); }} 
            className=${`nav-link ${currentPage === 'announcements' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <${Megaphone} size=${19} /> Announcements
          </button>
          
          <div style=${{ margin: '1rem 0', borderTop: '1px solid var(--glass-border)' }}></div>
          
          <button 
            onClick=${() => { setCurrentPage('settings'); setSidebarOpen(false); }} 
            className=${`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <${Settings} size=${19} /> Dev Mode
          </button>

          <a 
            href="https://sankaranigerialimited.com/admin" 
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', textDecoration: 'none' }}
          >
            <${ExternalLink} size=${19} /> Manage Website
          </a>
          
          <button 
            onClick=${handleLogout} 
            className="nav-link"
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginTop: 'auto' }}
          >
            <${LogOut} size=${19} /> Logout
          </button>
          <div style=${{ marginTop: '1rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
            <p style=${{ fontSize: '0.725rem', color: 'var(--text-secondary)', margin: 0 }}>
              Developed by<br />
              <a href="https://brainiacs.ng/" target="_blank" rel="noopener noreferrer" style=${{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Brainiacs Innovation</a>
            </p>
          </div>
        </nav>
      </aside>
      <main className="main-content">
        <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button 
            className="mobile-menu-btn" 
            onClick=${() => setSidebarOpen(true)}
            aria-label="Toggle Menu"
          >
            <${Menu} size=${22} />
          </button>
        </div>
        ${renderPage()}
      </main>
    </div>
  `;
}

export default App;
