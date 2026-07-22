import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Trophy, CheckCircle, Clock, Plus, Target, Award, CheckSquare } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../config';

const html = htm.bind(React.createElement);

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', points: 10, staff_id: '' });

  async function fetchData() {
    try {
      // Get all staff
      const staffRes = await fetch(`${API_BASE_URL}/staff/`);
      const staffData = await staffRes.json();
      setStaffList(staffData);

      // Sort by score desc for leaderboard
      const sortedLeaderboard = [...staffData].sort((a, b) => b.score - a.score);
      setLeaderboard(sortedLeaderboard);

      // Get all tasks
      const tasksRes = await fetch(`${API_BASE_URL}/tasks/`);
      const tasksData = await tasksRes.json();
      setTasks(tasksData);

      if (staffData.length > 0 && !newTask.staff_id) {
        setNewTask(prev => ({ ...prev, staff_id: staffData[0].id }));
      }
    } catch (err) {
      console.error("Error fetching leaderboard/tasks:", err);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTask,
          points: parseInt(newTask.points),
          staff_id: parseInt(newTask.staff_id)
        })
      });
      if (res.ok) {
        setNewTask(prev => ({ ...prev, title: '', description: '', points: 10 }));
        setShowModal(false);
        fetchData();
        alert("Success: Task assigned successfully!");
      } else {
        const err = await res.json();
        alert(err.detail || "Error assigning task");
      }
    } catch (err) {
      console.error("Error assigning task:", err);
      alert("Error: A network error occurred while assigning the task.");
    }
  };

  const handleApproveTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/approve`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchData();
        alert("Success: Task approved and points awarded!");
      } else {
        const err = await res.json();
        alert(err.detail || "Error approving task");
      }
    } catch (err) {
      console.error("Error approving task:", err);
      alert("Error: A network error occurred while approving the task.");
    }
  };

  const getStaffName = (staffId) => {
    const s = staffList.find(x => x.id === staffId);
    return s ? s.full_name : `Staff #${staffId}`;
  };

  const getRankBadgeStyles = (index) => {
    switch (index) {
      case 0:
        return { background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: 'white', boxShadow: '0 4px 10px rgba(234, 179, 8, 0.4)' };
      case 1:
        return { background: 'linear-gradient(135deg, #cbd5e1, #94a3b8)', color: 'white', boxShadow: '0 4px 10px rgba(148, 163, 184, 0.4)' };
      case 2:
        return { background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.4)' };
      default:
        return { background: 'rgba(0, 0, 0, 0.05)', color: 'var(--text-secondary)', boxShadow: 'none' };
    }
  };

  // Metrics calculation
  const totalTasks = tasks.length;
  const pendingApprovals = tasks.filter(t => t.status === 'completed').length;
  const topPerformer = leaderboard.length > 0 ? leaderboard[0].full_name : 'No staff yet';

  return html`
    <div className="animate-slide-up">
      <!-- Page Header -->
      <header style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style=${{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px' }}>Leaderboard & Tasks</h1>
          <p style=${{ margin: 0, color: 'var(--text-secondary)', fontWeight: 500 }}>Track team accomplishments, assign tasks, and incentivize high performance.</p>
        </div>
        <button className="btn btn-primary" onClick=${() => setShowModal(true)} style=${{ display: 'inline-flex', alignItems: 'center', gap: '10px', borderRadius: '12px', padding: '12px 24px', fontWeight: 700 }}>
          <${Plus} size=${18} /> Assign New Task
        </button>
      </header>

      <!-- Stats Summary Widget Cards -->
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <!-- Stat Card 1 -->
        <div className="glass-panel" style=${{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--glass-border)' }}>
          <div style=${{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <${Target} size=${22} />
          </div>
          <div>
            <div style=${{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Tasks</div>
            <div style=${{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>${totalTasks}</div>
          </div>
        </div>

        <!-- Stat Card 2 -->
        <div className="glass-panel" style=${{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--glass-border)' }}>
          <div style=${{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <${CheckSquare} size=${22} />
          </div>
          <div>
            <div style=${{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Approvals</div>
            <div style=${{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>${pendingApprovals}</div>
          </div>
        </div>

        <!-- Stat Card 3 -->
        <div className="glass-panel" style=${{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--glass-border)' }}>
          <div style=${{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <${Award} size=${22} />
          </div>
          <div>
            <div style=${{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MVP Leader</div>
            <div style=${{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }} title=${topPerformer}>${topPerformer}</div>
          </div>
        </div>
      </div>

      <!-- Main Layout Columns -->
      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '2.5rem', alignItems: 'start' }}>
        
        <!-- Left: Leaderboard Stack -->
        <div className="glass-panel" style=${{ padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h2 style=${{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
            <${Trophy} size=${22} style=${{ color: '#eab308' }} /> Top Performers
          </h2>
          
          <div style=${{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            ${leaderboard.length === 0 ? html`
              <div style=${{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No active staff records.</div>
            ` : leaderboard.map((staff, index) => html`
              <div key=${staff.id} style=${{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--glass-border)', transition: 'all 0.2s' }}>
                <!-- Placement Circle Badge -->
                <div style=${{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem',
                  ...getRankBadgeStyles(index)
                }}>
                  ${index + 1}
                </div>
                
                <!-- Avatar with Profile Picture -->
                <img 
                  src=${getImageUrl(staff.picture_path)}
                  style=${{
                    width: '36px', height: '36px', borderRadius: '10px',
                    objectFit: 'cover', border: '1px solid var(--border-color)'
                  }}
                  alt=${staff.full_name}
                />
                
                <!-- Staff Info -->
                <div style=${{ flex: 1, minWidth: 0 }}>
                  <div style=${{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${staff.full_name}</div>
                  <div style=${{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>${staff.role || 'Staff'}</div>
                </div>

                <!-- Points Tag -->
                <div style=${{ padding: '6px 12px', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '100px', border: '1px solid rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' }}>
                  ${staff.score} pts
                </div>
              </div>
            `)}
          </div>
        </div>

        <!-- Right: Recent Tasks Panel -->
        <div className="glass-panel" style=${{ padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h2 style=${{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Assigned Activity Tasks</h2>

          <div className="table-container" style=${{ borderRadius: '14px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <table style=${{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style=${{ background: '#f8fafc' }}>
                  <th style=${{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Task Description</th>
                  <th style=${{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Assigned To</th>
                  <th style=${{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Points</th>
                  <th style=${{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Status</th>
                  <th style=${{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${tasks.length === 0 ? html`
                  <tr>
                    <td colSpan="5" style=${{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)' }}>
                      <div style=${{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>No Assigned Tasks</div>
                      <div style=${{ fontSize: '0.9rem' }}>Create a task above to incentivize staff performance.</div>
                    </td>
                  </tr>
                ` : tasks.map(task => html`
                  <tr key=${task.id}>
                    <td style=${{ padding: '16px 20px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                      <div>${task.title}</div>
                      <div style=${{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '3px' }}>${task.description}</div>
                    </td>
                    <td style=${{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>${getStaffName(task.staff_id)}</td>
                    <td style=${{ padding: '16px 20px' }}>
                      <span style=${{ color: 'var(--primary)', fontWeight: 800 }}>+${task.points}</span>
                    </td>
                    <td style=${{ padding: '16px 20px' }}>
                      ${task.status === 'completed' ? html`
                        <span className="badge badge-success" style=${{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
                          <${CheckCircle} size=${12} /> PENDING REVIEW
                        </span>
                      ` : task.status === 'approved' ? html`
                        <span className="badge badge-success" style=${{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, opacity: 0.7 }}>
                          <${CheckCircle} size=${12} /> APPROVED
                        </span>
                      ` : html`
                        <span className="badge badge-warning" style=${{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
                          <${Clock} size=${12} /> PENDING
                        </span>
                      `}
                    </td>
                    <td style=${{ padding: '16px 20px', textAlign: 'right' }}>
                      ${task.status === 'completed' ? html`
                        <button className="btn btn-primary" style=${{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px', fontWeight: 700 }} onClick=${() => handleApproveTask(task.id)}>
                          Approve
                        </button>
                      ` : html`
                        <span style=${{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>--</span>
                      `}
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Redesigned Glassmorphic Assign Modal -->
      ${showModal && html`
        <div style=${{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-slide-up" style=${{ width: '100%', maxWidth: '460px', padding: '2.5rem', border: '1px solid var(--glass-border)', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
            <h2 style=${{ marginTop: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Assign New Task</h2>
            
            <form onSubmit=${handleAssignTask} style=${{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign To</label>
                <select 
                  className="input-field" 
                  value=${newTask.staff_id}
                  onChange=${e => setNewTask({...newTask, staff_id: e.target.value})}
                  required
                  style=${{ borderRadius: '12px', border: '1px solid var(--glass-border)', fontWeight: 600 }}
                >
                  ${staffList.map(s => html`
                    <option key=${s.id} value=${s.id}>${s.full_name} (${s.role || 'Staff'})</option>
                  `)}
                </select>
              </div>
              
              <div>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  placeholder="e.g. Clean workspace counter"
                  value=${newTask.title}
                  onChange=${e => setNewTask({...newTask, title: e.target.value})}
                  style=${{ borderRadius: '12px', border: '1px solid var(--glass-border)', fontWeight: 500 }}
                />
              </div>
              
              <div>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                <textarea 
                  className="input-field" 
                  style=${{ minHeight: '70px', borderRadius: '12px', border: '1px solid var(--glass-border)', resize: 'vertical', fontWeight: 500 }}
                  required 
                  placeholder="Provide precise details of assignment..."
                  value=${newTask.description}
                  onChange=${e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              
              <div>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points Reward</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  min="1"
                  value=${newTask.points}
                  onChange=${e => setNewTask({...newTask, points: e.target.value})}
                  style=${{ borderRadius: '12px', border: '1px solid var(--glass-border)', fontWeight: 600 }}
                />
              </div>
              
              <div style=${{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <button type="button" className="btn btn-glass" onClick=${() => setShowModal(false)} style=${{ borderRadius: '10px', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style=${{ borderRadius: '10px', fontWeight: 700 }}>Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}
