import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Users, UserCheck, UserX, Activity } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    absentToday: 0,
    tasksCompleted: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all staff
        const staffRes = await fetch('http://localhost:8000/staff/');
        const staffData = await staffRes.json();
        
        // Fetch all attendance
        const attendanceRes = await fetch('http://localhost:8000/attendance/');
        const attendanceData = await attendanceRes.json();
        
        // Fetch all tasks
        const tasksRes = await fetch('http://localhost:8000/tasks/');
        const tasksData = await tasksRes.json();

        // Calculate today's date string YYYY-MM-DD
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Find staff who clocked in today
        const presentStaffIds = new Set(
          attendanceData
            .filter(record => record.date === todayStr && record.clock_in_time !== null)
            .map(record => record.staff_id)
        );

        const totalStaff = staffData.length;
        const presentToday = presentStaffIds.size;
        const absentToday = Math.max(0, totalStaff - presentToday);
        const tasksCompleted = tasksData.filter(t => t.status === 'approved').length;

        setStats({
          totalStaff,
          presentToday,
          absentToday,
          tasksCompleted
        });

        // Set recent logs (last 5 clock ins/outs or task actions)
        const logs = [];
        // Add attendance logs
        attendanceData.forEach(att => {
          const staffObj = staffData.find(s => s.id === att.staff_id);
          const name = staffObj ? staffObj.full_name : `Staff #${att.staff_id}`;
          
          if (att.clock_in_time) {
            logs.push({
              id: `att-in-${att.id}`,
              time: new Date(att.clock_in_time),
              text: `${name} clocked in ${att.is_proxy ? '(⚠️ PROXY DETECTED)' : ''}`,
              type: att.is_proxy ? 'warning' : 'info'
            });
          }
          
          if (att.clock_out_time) {
            logs.push({
              id: `att-out-${att.id}`,
              time: new Date(att.clock_out_time),
              text: `${name} clocked out`,
              type: 'info'
            });
          }
        });
        
        // Add approved tasks logs
        tasksData.forEach(task => {
          if (task.status === 'approved') {
            const staffObj = staffData.find(s => s.id === task.staff_id);
            const name = staffObj ? staffObj.full_name : `Staff #${task.staff_id}`;
            logs.push({
              id: `task-${task.id}`,
              // Use current date as placeholder since we don't store task completion time in schema
              time: new Date(), 
              text: `${name} earned +${task.points} points for "${task.title}"`,
              type: 'success'
            });
          }
        });

        // Sort by time desc and take 5
        logs.sort((a, b) => b.time - a.time);
        setRecentLogs(logs.slice(0, 5));

      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    }
    fetchData();
  }, []);

  return html`
    <div>
      <header style=${{ marginBottom: '2rem' }}>
        <h1>Overview</h1>
        <p>Welcome back, MD. Here's what's happening today.</p>
      </header>

      <div className="dashboard-grid">
        <div className="glass-card">
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Total Staff</h3>
            <${Users} size=${24} color="var(--primary)" />
          </div>
          <p className="stat-value">${stats.totalStaff}</p>
        </div>
        
        <div className="glass-card">
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Present Today</h3>
            <${UserCheck} size=${24} color="var(--success)" />
          </div>
          <p className="stat-value">${stats.presentToday}</p>
        </div>

        <div className="glass-card">
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Absent Today</h3>
            <${UserX} size=${24} color="var(--danger)" />
          </div>
          <p className="stat-value">${stats.absentToday}</p>
        </div>

        <div className="glass-card">
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Tasks Completed</h3>
            <${Activity} size=${24} color="var(--secondary)" />
          </div>
          <p className="stat-value">${stats.tasksCompleted}</p>
        </div>
      </div>

      <h2>Recent Activity</h2>
      <div className="glass-panel" style=${{ padding: '1.5rem' }}>
        ${recentLogs.length === 0 ? html`
          <p style=${{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No recent activity to display.
          </p>
        ` : html`
          <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            ${recentLogs.map(log => html`
              <div key=${log.id} style=${{ 
                padding: '0.75rem 1rem', 
                background: log.type === 'warning' ? '#fee2e2' : log.type === 'success' ? '#d1fae5' : '#f1f5f9',
                borderLeft: `4px solid ${log.type === 'warning' ? 'var(--danger)' : log.type === 'success' ? 'var(--success)' : 'var(--primary)'}`,
                borderRadius: '8px',
                color: log.type === 'warning' ? 'var(--danger)' : log.type === 'success' ? 'var(--success)' : 'var(--text-primary)',
                fontSize: '0.95rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>${log.text}</span>
                <span style=${{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  ${log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            `)}
          </div>
        `}
      </div>
    </div>
  `;
}
