import React, { useState } from 'react';
import htm from 'htm';
import Dashboard from './pages/Dashboard.js';
import StaffManagement from './pages/StaffManagement.js';
import Leaderboard from './pages/Leaderboard.js';
import AttendanceLogs from './pages/AttendanceLogs.js';
import QRCodeGenerator from './pages/QRCodeGenerator.js';
import DevSettings from './pages/DevSettings.js';
import { LayoutDashboard, Users, Trophy, Calendar, QrCode, Settings } from 'lucide-react';

const html = htm.bind(React.createElement);

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  // Sync state changes back to URL hash
  React.useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);


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
      <aside className="sidebar">
        <div>
          <h2 style=${{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sankara ID</h2>
          <p style=${{ fontSize: '0.875rem' }}>Admin Portal</p>
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
        </nav>
      </aside>
      <main className="main-content">
        ${renderPage()}
      </main>
    </div>
  `;
}

export default App;
