import React, { useState } from 'react';
import htm from 'htm';
import Dashboard from './pages/Dashboard.js';
import StaffManagement from './pages/StaffManagement.js';
import Leaderboard from './pages/Leaderboard.js';
import AttendanceLogs from './pages/AttendanceLogs.js';
import QRCodeGenerator from './pages/QRCodeGenerator.js';
import DevSettings from './pages/DevSettings.js';
import { LayoutDashboard, Users, Trophy, Calendar, QrCode, Settings, Menu, X, LogOut } from 'lucide-react';

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
      <div style=${{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style=${{ maxWidth: '400px', width: '90%', padding: '2.5rem' }}>
          <div style=${{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style=${{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Sankara Admin</h2>
            <p style=${{ color: 'var(--text-secondary)' }}>Sign in to access the portal</p>
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
        <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style=${{ fontSize: '1.5rem', margin: 0 }}>Sankara ID</h2>
            <p style=${{ fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Admin Portal</p>
          </div>
          <button 
            className="mobile-menu-btn" 
            style=${{ border: 'none', background: 'transparent' }}
            onClick=${() => setSidebarOpen(false)}
          >
            <${X} size=${24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            onClick=${() => setCurrentPage('dashboard')} 
            className=${`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <${LayoutDashboard} size=${20} /> Dashboard
          </button>
          <button 
            onClick=${() => setCurrentPage('staff')} 
            className=${`nav-link ${currentPage === 'staff' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <${Users} size=${20} /> Staff Management
          </button>
          <button 
            onClick=${() => setCurrentPage('attendance')} 
            className=${`nav-link ${currentPage === 'attendance' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <${Calendar} size=${20} /> Attendance Logs
          </button>
          <button 
            onClick=${() => setCurrentPage('qr')} 
            className=${`nav-link ${currentPage === 'qr' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <${QrCode} size=${20} /> QR Generator
          </button>
          <button 
            onClick=${() => setCurrentPage('leaderboard')} 
            className=${`nav-link ${currentPage === 'leaderboard' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <${Trophy} size=${20} /> Leaderboard
          </button>
          
          <div style=${{ margin: '1.5rem 0', borderTop: '1px solid var(--border-color)' }}></div>
          
          <button 
            onClick=${() => setCurrentPage('settings')} 
            className=${`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <${Settings} size=${20} /> Dev Mode
          </button>
          
          <button 
            onClick=${handleLogout} 
            className="nav-link"
            style=${{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginTop: 'auto' }}
          >
            <${LogOut} size=${20} /> Logout
          </button>
        </nav>
      </aside>
      <main className="main-content">
        <div style=${{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <button 
            className="mobile-menu-btn" 
            onClick=${() => setSidebarOpen(true)}
          >
            <${Menu} size=${24} />
          </button>
        </div>
        ${renderPage()}
      </main>
    </div>
  `;
}

export default App;
