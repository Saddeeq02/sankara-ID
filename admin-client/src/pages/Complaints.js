import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { MessageSquare, CheckCircle, XCircle, Award, Calendar, User, Eye } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [points, setPoints] = useState(10);
  const [statusAction, setStatusAction] = useState('approved_without_points'); // approved_with_points, approved_without_points, rejected
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchComplaints = async () => {
    try {
      const res = await fetch('https://sankara-id.vercel.app/complaints/');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const res = await fetch(`https://sankara-id.vercel.app/complaints/${selectedComplaint.id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusAction,
          points_awarded: statusAction === 'approved_with_points' ? parseInt(points) : 0,
          md_response: responseMsg
        })
      });

      if (res.ok) {
        alert("Success: Complaint responded to successfully!");
        setSelectedComplaint(null);
        setResponseMsg('');
        fetchComplaints();
      } else {
        alert("Error: Failed to send response.");
      }
    } catch (err) {
      console.error("Error responding to complaint:", err);
      alert("Error: Network failure.");
    }
  };

  if (isLoading) {
    return html`
      <div style=${{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <p>Loading complaints...</p>
      </div>
    `;
  }

  const filteredComplaints = complaints.filter(c => {
    const matchType = filterType === 'all' || c.type === filterType;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchType && matchStatus;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'approved_with_points':
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'approved_without_points':
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'rejected':
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
      default:
        return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved_with_points': return 'Approved + Points';
      case 'approved_without_points': return 'Approved (No Points)';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  return html`
    <div>
      <header style=${{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Staff Complaints & Absences</h1>
          <p>Review excuse/complaint submissions and award points or respond.</p>
        </div>
      </header>

      <!-- Filters -->
      <div className="glass-panel" style=${{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style=${{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Type</label>
          <select 
            value=${filterType} 
            onChange=${e => setFilterType(e.target.value)} 
            className="input-field" 
            style=${{ padding: '0.5rem', minWidth: '150px' }}
          >
            <option value="all">All Types</option>
            <option value="absence">Absence</option>
            <option value="delay">Delay</option>
            <option value="other">Other Complaint</option>
          </select>
        </div>

        <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style=${{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Status</label>
          <select 
            value=${filterStatus} 
            onChange=${e => setFilterStatus(e.target.value)} 
            className="input-field" 
            style=${{ padding: '0.5rem', minWidth: '180px' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved_with_points">Approved + Points</option>
            <option value="approved_without_points">Approved (No Points)</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Complaints List -->
      <div className="glass-panel" style=${{ padding: '0', overflowX: 'auto' }}>
        <table className="staff-table" style=${{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style=${{ padding: '1rem 1.5rem' }}>Staff Name</th>
              <th>Date</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${filteredComplaints.length === 0 ? html`
              <tr>
                <td colSpan="6" style=${{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No complaints found matching the criteria.
                </td>
              </tr>
            ` : filteredComplaints.map(c => html`
              <tr key=${c.id} style=${{ borderBottom: '1px solid var(--border-color)' }}>
                <td style=${{ padding: '1rem 1.5rem', fontWeight: '600' }}>
                  <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <${User} size=${16} color="var(--primary-color)" />
                    ${c.staff_name || `Staff ID: ${c.staff_id}`}
                  </div>
                </td>
                <td>
                  <div style=${{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                    <${Calendar} size=${14} />
                    ${new Date(c.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td style=${{ textTransform: 'capitalize', fontWeight: '500' }}>${c.type}</td>
                <td style=${{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${c.title}</td>
                <td>
                  <span style=${{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '50px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    ...getStatusBadgeStyle(c.status)
                  }}>
                    ${getStatusLabel(c.status)}
                  </span>
                </td>
                <td>
                  <button 
                    onClick=${() => {
                      setSelectedComplaint(c);
                      setStatusAction(c.status === 'pending' ? 'approved_without_points' : c.status);
                      setPoints(c.points_awarded || 10);
                      setResponseMsg(c.md_response || '');
                    }} 
                    className="btn btn-secondary" 
                    style=${{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                  >
                    <${Eye} size=${14} /> Review
                  </button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>

      <!-- Action Modal -->
      ${selectedComplaint && html`
        <div style=${{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card" style=${{ width: '90%', maxWidth: '600px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style=${{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <${MessageSquare} size=${24} color="var(--primary-color)" />
              Review Excuse / Complaint
            </h2>

            <div style=${{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <strong style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Submitted By</strong>
                <span>${selectedComplaint.staff_name || `Staff ID: ${selectedComplaint.staff_id}`}</span>
              </div>
              <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type</strong>
                  <span style=${{ textTransform: 'capitalize' }}>${selectedComplaint.type}</span>
                </div>
                <div>
                  <strong style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date Submitted</strong>
                  <span>${new Date(selectedComplaint.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <strong style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Subject</strong>
                <span style=${{ fontWeight: '600' }}>${selectedComplaint.title}</span>
              </div>
              <div style=${{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style=${{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description / Explanation</strong>
                <p style=${{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>${selectedComplaint.description}</p>
              </div>
            </div>

            <form onSubmit=${handleRespond} style=${{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style=${{ fontWeight: '600', fontSize: '0.9rem' }}>MD Action</label>
                <div style=${{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style=${{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="statusAction" 
                      value="approved_without_points" 
                      checked=${statusAction === 'approved_without_points'}
                      onChange=${() => setStatusAction('approved_without_points')}
                    />
                    <span>Accept (No Points)</span>
                  </label>
                  <label style=${{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="statusAction" 
                      value="approved_with_points" 
                      checked=${statusAction === 'approved_with_points'}
                      onChange=${() => setStatusAction('approved_with_points')}
                    />
                    <span style=${{ color: '#10b981', fontWeight: '500' }}>Accept + Award Points</span>
                  </label>
                  <label style=${{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="statusAction" 
                      value="rejected" 
                      checked=${statusAction === 'rejected'}
                      onChange=${() => setStatusAction('rejected')}
                    />
                    <span style=${{ color: '#ef4444', fontWeight: '500' }}>Reject</span>
                  </label>
                </div>
              </div>

              ${statusAction === 'approved_with_points' && html`
                <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style=${{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Points to Award</label>
                  <input 
                    type="number" 
                    value=${points} 
                    onChange=${e => setPoints(e.target.value)} 
                    className="input-field" 
                    min="1" 
                    required
                  />
                </div>
              `}

              <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style=${{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>MD Response Message</label>
                <textarea 
                  value=${responseMsg} 
                  onChange=${e => setResponseMsg(e.target.value)} 
                  className="input-field" 
                  rows="3" 
                  placeholder="Enter response or feedback for the staff member..."
                ></textarea>
              </div>

              <div style=${{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style=${{ flex: 1, padding: '0.75rem' }}>
                  Submit Decision
                </button>
                <button 
                  type="button" 
                  onClick=${() => setSelectedComplaint(null)} 
                  className="btn btn-secondary" 
                  style=${{ padding: '0.75rem' }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}
