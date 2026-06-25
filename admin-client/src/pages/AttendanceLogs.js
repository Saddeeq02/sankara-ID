import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Search, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function fetchLogs() {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/attendance/');
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

    let matchesMonth = true;
    if (filterMonth) {
      const logMonth = log.date.substring(0, 7); // extract YYYY-MM
      matchesMonth = logMonth === filterMonth;
    }

    return matchesSearch && matchesMonth;
  });

  return html`
    <div>
      <header style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Attendance Logs</h1>
          <p>Daily clock-in and clock-out activity with anti-proxy verification.</p>
        </div>
        <button className="btn btn-glass" onClick=${fetchLogs} style=${{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <${RefreshCw} size=${18} /> Refresh Logs
        </button>
      </header>

      <div className="glass-panel" style=${{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style=${{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style=${{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <${Search} size=${20} style=${{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name, Log ID, or Staff ID..." 
              style=${{ paddingLeft: '2.5rem' }} 
              value=${searchTerm}
              onChange=${e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style=${{ width: '200px' }}>
            <input
              type="month"
              className="input-field"
              value=${filterMonth}
              onChange=${e => setFilterMonth(e.target.value)}
              title="Filter by Month"
              style=${{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Staff Name</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Anti-Proxy Status</th>
              </tr>
            </thead>
            <tbody>
              ${isLoading ? html`
                <tr>
                  <td colSpan="6" style=${{ textAlign: 'center', padding: '3rem' }}>
                    <div style=${{ color: 'var(--text-primary)' }}>Loading logs...</div>
                  </td>
                </tr>
              ` : filteredLogs.length === 0 ? html`
                <tr>
                  <td colSpan="6" style=${{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No attendance logs found.
                  </td>
                </tr>
              ` : filteredLogs.map((log) => html`
                <tr key=${log.id}>
                  <td>#ATT-${String(log.id).padStart(5, '0')}</td>
                  <td style=${{ fontWeight: 500, color: 'var(--text-primary)' }}>${log.staff_name || `Staff ID: ${log.staff_id}`}</td>
                  <td>${new Date(log.date).toLocaleDateString()}</td>
                  <td>
                    ${log.clock_in_time ? html`
                      <span style=${{ color: 'var(--success-color)', fontWeight: 'bold' }}>
                        ${new Date(log.clock_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    ` : html`<span style=${{ color: 'var(--text-secondary)' }}>--</span>`}
                  </td>
                  <td>
                    ${log.clock_out_time ? html`
                      <span style=${{ color: 'var(--warning-color)', fontWeight: 'bold' }}>
                        ${new Date(log.clock_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    ` : html`<span style=${{ color: 'var(--text-secondary)' }}>--</span>`}
                  </td>
                  <td>
                    ${log.is_proxy ? html`
                      <span className="badge badge-danger" style=${{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <${ShieldAlert} size=${14} /> PROXY DETECTED
                      </span>
                    ` : html`
                      <span className="badge badge-success" style=${{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <${CheckCircle} size=${14} /> VERIFIED MATCH
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
