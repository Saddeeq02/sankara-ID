import React, { useState } from 'react';
import htm from 'htm';
import Dashboard from './pages/Dashboard.js';
import StaffManagement from './pages/StaffManagement.js';
import Leaderboard from './pages/Leaderboard.js';
import AttendanceLogs from './pages/AttendanceLogs.js';
import QRCodeGenerator from './pages/QRCodeGenerator.js';
import DevSettings from './pages/DevSettings.js';
import { LayoutDashboard, Users, Trophy, Calendar, QrCode, Settings, Menu, X } from 'lucide-react';

const html = htm.bind(React.createElement);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  // Sync state changes back to URL hash
  React.useEffect(() => {
    window.location.hash = currentPage;
    // Close sidebar on mobile when navigating
    setSidebarOpen(false);
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
