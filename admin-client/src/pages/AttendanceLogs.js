import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Search, ShieldAlert, CheckCircle, RefreshCw, Calendar, Users, ShieldCheck } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function fetchLogs() {
    setIsLoading(true);
    try {
      const res = await fetch('https://sankara-id.vercel.app/attendance/');
      const data = await res.json();
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(data);
    } catch (err) {
      console.error("Error fetching attendance logs:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const logIdStr = `#ATT-${String(log.id).padStart(5, '0')}`.toLowerCase();
    const staffIdStr = String(log.staff_id);
    const staffNameLower = (log.staff_name || '').toLowerCase();
    
    const matchesSearch = 
      staffNameLower.includes(searchLower) ||
      logIdStr.includes(searchLower) ||
      staffIdStr.includes(searchLower);

    let matchesDate = true;
    if (filterDate) {
      const logDate = log.date.substring(0, 10); // extract YYYY-MM-DD
      matchesDate = logDate === filterDate;
    }

    return matchesSearch && matchesDate;
  });

  // Calculate high-end metrics based on filtered results
  const totalCount = filteredLogs.length;
  const verifiedCount = filteredLogs.filter(log => !log.is_proxy).length;
  const proxyCount = filteredLogs.filter(log => log.is_proxy).length;

  return html`
    <div className="animate-slide-up">
      <!-- Page Header -->
      <header style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style=${{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px' }}>Attendance Log Hub</h1>
          <p style=${{ margin: 0, color: 'var(--text-secondary)', fontWeight: 500 }}>Real-time clock-in monitoring with secure anti-proxy matching.</p>
        </div>
        <button className="btn btn-primary" onClick=${fetchLogs} style=${{ display: 'inline-flex', alignItems: 'center', gap: '10px', borderRadius: '12px', padding: '12px 24px', fontWeight: 700 }}>
          <${RefreshCw} size=${18} /> Refresh Records
        </button>
      </header>

      <!-- Stats Summary Widget Cards -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <!-- Stat Card 1 -->
        <div className="glass-panel" style=${{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--glass-border)' }}>
          <div style=${{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <${Users} size=${22} />
          </div>
          <div>
            <div style=${{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Shifts</div>
            <div style=${{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>${isLoading ? '...' : totalCount}</div>
          </div>
        </div>

        <!-- Stat Card 2 -->
        <div className="glass-panel" style=${{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--glass-border)' }}>
          <div style=${{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <${ShieldCheck} size=${22} />
          </div>
          <div>
            <div style=${{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Passes</div>
            <div style=${{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>${isLoading ? '...' : verifiedCount}</div>
          </div>
        </div>

        <!-- Stat Card 3 -->
        <div className="glass-panel" style=${{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--glass-border)' }}>
          <div style=${{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <${ShieldAlert} size=${22} />
          </div>
          <div>
            <div style=${{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proxy Alarms</div>
            <div style=${{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>${isLoading ? '...' : proxyCount}</div>
          </div>
        </div>
      </div>

      <!-- Main Logs Panel -->
      <div className="glass-panel" style=${{ padding: '2rem', border: '1px solid var(--glass-border)' }}>
        <!-- Filters Control Bar -->
        <div style=${{ display: 'flex', gap: '16px', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <!-- Search -->
          <div style=${{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <${Search} size=${20} style=${{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search staff name, Log ID, or Staff ID..." 
              style=${{ paddingLeft: '3rem', borderRadius: '12px', border: '1px solid var(--glass-border)', paddingRight: '16px' }} 
              value=${searchTerm}
              onChange=${e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <!-- Daily Date Picker -->
          <div style=${{ position: 'relative', width: '220px' }}>
            <${Calendar} size=${18} style=${{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <input
              type="date"
              className="input-field"
              value=${filterDate}
              onChange=${e => setFilterDate(e.target.value)}
              title="Filter by Specific Date"
              style=${{ paddingLeft: '3rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
            />
          </div>

          <!-- Reset Filter Button -->
          ${filterDate && html`
            <button className="btn btn-glass" onClick=${() => setFilterDate('')} style=${{ borderRadius: '12px', padding: '12px 20px', fontWeight: 600 }}>
              Clear Date
            </button>
          `}
        </div>

        <!-- Attendance Data Table -->
        <div className="table-container" style=${{ borderRadius: '14px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <table style=${{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style=${{ background: '#f8fafc' }}>
                <th style=${{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Log ID</th>
                <th style=${{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Staff Name</th>
                <th style=${{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Date</th>
                <th style=${{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Clock In</th>
                <th style=${{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Clock Out</th>
                <th style=${{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Anti-Proxy Status</th>
              </tr>
            </thead>
            <tbody>
              ${isLoading ? html`
                <tr>
                  <td colSpan="6" style=${{ textAlign: 'center', padding: '4rem' }}>
                    <div style=${{ color: 'var(--text-secondary)', fontWeight: 600 }}>Syncing log database...</div>
                  </td>
                </tr>
              ` : filteredLogs.length === 0 ? html`
                <tr>
                  <td colSpan="6" style=${{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <div style=${{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>No Attendance Logs Found</div>
                    <div style=${{ fontSize: '0.95rem' }}>No activity records match the selected date or search term.</div>
                  </td>
                </tr>
              ` : filteredLogs.map((log) => html`
                <tr key=${log.id} style=${{ transition: 'background-color 0.2s' }}>
                  <td style=${{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>#ATT-${String(log.id).padStart(5, '0')}</td>
                  <td style=${{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-primary)' }}>${log.staff_name || `Staff ID: ${log.staff_id}`}</td>
                  <td style=${{ padding: '18px 24px', color: 'var(--text-secondary)' }}>${new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td style=${{ padding: '18px 24px' }}>
                    ${log.clock_in_time ? html`
                      <span style=${{ color: 'var(--success)', fontWeight: 700 }}>
                        ${new Date(log.clock_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    ` : html`<span style=${{ color: 'var(--text-secondary)' }}>--</span>`}
                  </td>
                  <td style=${{ padding: '18px 24px' }}>
                    ${log.clock_out_time ? html`
                      <span style=${{ color: '#f59e0b', fontWeight: 700 }}>
                        ${new Date(log.clock_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    ` : html`<span style=${{ color: 'var(--text-secondary)' }}>--</span>`}
                  </td>
                  <td style=${{ padding: '18px 24px' }}>
                    ${log.is_proxy ? html`
                      <span className="badge badge-danger" style=${{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', fontWeight: 700 }}>
                        <${ShieldAlert} size=${14} /> PROXY ALARM
                      </span>
                    ` : html`
                      <span className="badge badge-success" style=${{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', fontWeight: 700 }}>
                        <${CheckCircle} size=${14} /> VERIFIED PASS
                      </span>
                    `}
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
