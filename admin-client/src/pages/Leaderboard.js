import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Trophy, CheckCircle, Clock } from 'lucide-react';

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
      const staffRes = await fetch('https://sankara-id.vercel.app/staff/');
      const staffData = await staffRes.json();
      setStaffList(staffData);

      // Sort by score desc for leaderboard
      const sortedLeaderboard = [...staffData].sort((a, b) => b.score - a.score);
      setLeaderboard(sortedLeaderboard);

      // Get all tasks
      const tasksRes = await fetch('https://sankara-id.vercel.app/tasks/');
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
      const res = await fetch('https://sankara-id.vercel.app/tasks/', {
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
      const res = await fetch(`https://sankara-id.vercel.app/tasks/${taskId}/approve`, {
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

  return html`
    <div>
      <header style=${{ marginBottom: '2rem' }}>
        <h1>Leaderboard & Tasks</h1>
        <p>Manage assignments and reward performance.</p>
      </header>

      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="glass-panel" style=${{ padding: '1.5rem', alignSelf: 'start' }}>
          <h2 style=${{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <${Trophy} size=${24} color="var(--secondary)" /> Top Performers
          </h2>
          
          <div style=${{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            ${leaderboard.length === 0 ? html`
              <p style=${{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No staff registered yet.</p>
            ` : leaderboard.map((staff, index) => html`
              <div key=${staff.id} style=${{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style=${{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: index === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  ${index + 1}
                </div>
                <div style=${{ flex: 1 }}>
                  <div style=${{ fontWeight: 600, color: 'var(--text-primary)' }}>${staff.full_name}</div>
                  <div style=${{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>${staff.score} points</div>
                </div>
              </div>
            `)}
          </div>
        </div>

        <div className="glass-panel" style=${{ padding: '1.5rem' }}>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style=${{ fontSize: '1.25rem', margin: 0 }}>Recent Tasks</h2>
            <button className="btn btn-primary" style=${{ padding: '0.5rem 1rem' }} onClick=${() => setShowModal(true)}>Assign Task</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${tasks.length === 0 ? html`
                  <tr>
                    <td colSpan="5" style=${{ textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No tasks assigned yet.
                    </td>
                  </tr>
                ` : tasks.map(task => html`
                  <tr key=${task.id}>
                    <td style=${{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      <div>${task.title}</div>
                      <div style=${{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>${task.description}</div>
                    </td>
                    <td>${getStaffName(task.staff_id)}</td>
                    <td><span style=${{ color: 'var(--secondary)', fontWeight: 'bold' }}>+${task.points}</span></td>
                    <td>
                      ${task.status === 'completed' ? html`
                        <span className="badge badge-success" style=${{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <${CheckCircle} size=${12} /> Pending Approval
                        </span>
                      ` : task.status === 'approved' ? html`
                        <span className="badge badge-success" style=${{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', opacity: 0.7 }}>
                          <${CheckCircle} size=${12} /> Approved
                        </span>
                      ` : html`
                        <span className="badge badge-warning" style=${{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <${Clock} size=${12} /> Pending
                        </span>
                      `}
                    </td>
                    <td>
                      ${task.status === 'completed' && html`
                        <button className="btn btn-primary" style=${{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick=${() => handleApproveTask(task.id)}>
                          Approve
                        </button>
                      `}
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      ${showModal && html`
        <div style=${{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style=${{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 style=${{ marginTop: 0 }}>Assign New Task</h2>
            <form onSubmit=${handleAssignTask}>
              <div style=${{ marginBottom: '1rem' }}>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Assign To</label>
                <select 
                  className="input-field" 
                  value=${newTask.staff_id}
                  onChange=${e => setNewTask({...newTask, staff_id: e.target.value})}
                  required
                >
                  ${staffList.map(s => html`
                    <option key=${s.id} value=${s.id}>${s.full_name} (${s.role})</option>
                  `)}
                </select>
              </div>
              <div style=${{ marginBottom: '1rem' }}>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Task Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value=${newTask.title}
                  onChange=${e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div style=${{ marginBottom: '1rem' }}>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Description</label>
                <textarea 
                  className="input-field" 
                  style=${{ minHeight: '60px' }}
                  required 
                  value=${newTask.description}
                  onChange=${e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div style=${{ marginBottom: '1.5rem' }}>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Points Reward</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  min="1"
                  value=${newTask.points}
                  onChange=${e => setNewTask({...newTask, points: e.target.value})}
                />
              </div>
              <div style=${{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-glass" onClick=${() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}
