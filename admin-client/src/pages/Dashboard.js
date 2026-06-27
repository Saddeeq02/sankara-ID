import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Users, UserCheck, UserX, Activity, Sparkles, TrendingUp, Clock, CheckCircle, ShieldAlert, Trophy } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    absentToday: 0,
    tasksCompleted: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [topPerformer, setTopPerformer] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all staff
        const staffRes = await fetch('https://sankara-id.vercel.app/staff/');
        const staffData = await staffRes.json();
        
        // Fetch leaderboard for top performer
        const leadRes = await fetch('https://sankara-id.vercel.app/staff/leaderboard?limit=1');
        const leadData = await leadRes.json();
        if(leadData && leadData.length > 0) {
          setTopPerformer(leadData[0]);
        }

        // Fetch all attendance
        const attendanceRes = await fetch('https://sankara-id.vercel.app/attendance/');
        const attendanceData = await attendanceRes.json();
        
        // Fetch all tasks
        const tasksRes = await fetch('https://sankara-id.vercel.app/tasks/');
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
              text: `${name} clocked in`,
              isWarning: att.is_proxy,
              icon: att.is_proxy ? ShieldAlert : Clock,
              color: att.is_proxy ? 'var(--danger)' : 'var(--primary)'
            });
          }
          
          if (att.clock_out_time) {
            logs.push({
              id: `att-out-${att.id}`,
              time: new Date(att.clock_out_time),
              text: `${name} clocked out`,
              isWarning: false,
              icon: Clock,
              color: 'var(--text-secondary)'
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
              time: new Date(), 
              text: `${name} completed: "${task.title}"`,
              isWarning: false,
              icon: CheckCircle,
              color: 'var(--success)',
              points: task.points
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return html`
    <div className="animate-slide-up">
      <header style=${{ 
        marginBottom: '2rem', 
        padding: '2rem', 
        background: 'linear-gradient(135deg, var(--primary) 0%, #312e81 100%)',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.4), 0 10px 10px -5px rgba(79, 70, 229, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style=${{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style=${{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem' }}>
              ${getGreeting()}, MD <${Sparkles} size=${28} color="#fbbf24" />
            </h1>
            <p style=${{ color: '#c7d2fe', fontSize: '1.1rem', margin: 0 }}>Here is your high-level overview for today.</p>
          </div>
          
          ${topPerformer && html`
            <div style=${{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style=${{ background: '#fbbf24', borderRadius: '50%', padding: '0.5rem' }}>
                <${Trophy} size=${20} color="#78350f" />
              </div>
              <div>
                <div style=${{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe' }}>Top Performer</div>
                <div style=${{ fontWeight: 'bold', fontSize: '1.1rem' }}>${topPerformer.full_name}</div>
              </div>
              <div style=${{ marginLeft: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                ${topPerformer.score} pts
              </div>
            </div>
          `}
        </div>
        
        {/* Decorative Background Elements */}
        <div style=${{ position: 'absolute', right: '-5%', top: '-20%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style=${{ position: 'absolute', left: '20%', bottom: '-50%', width: '200px', height: '200px', background: 'rgba(99,102,241,0.5)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
      </header>

      <div className="dashboard-grid animate-slide-up delay-1">
        <div className="glass-card" style=${{ borderTop: '4px solid var(--primary)' }}>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Workforce</h3>
            <div style=${{ background: 'var(--primary-glow)', padding: '0.5rem', borderRadius: '8px' }}>
              <${Users} size=${22} color="var(--primary)" />
            </div>
          </div>
          <p className="stat-value" style=${{ fontSize: '2.5rem' }}>${stats.totalStaff}</p>
        </div>
        
        <div className="glass-card" style=${{ borderTop: '4px solid var(--success)' }}>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Present Today</h3>
            <div style=${{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '8px' }}>
              <${UserCheck} size=${22} color="var(--success)" />
            </div>
          </div>
          <p className="stat-value" style=${{ fontSize: '2.5rem' }}>${stats.presentToday}</p>
          <div style=${{ marginTop: '1rem', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style=${{ height: '100%', background: 'var(--success)', width: (stats.totalStaff > 0 ? (stats.presentToday/stats.totalStaff)*100 : 0) + '%', transition: 'width 1s ease-out' }}></div>
          </div>
        </div>

        <div className="glass-card" style=${{ borderTop: '4px solid var(--danger)' }}>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Absent Today</h3>
            <div style=${{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.5rem', borderRadius: '8px' }}>
              <${UserX} size=${22} color="var(--danger)" />
            </div>
          </div>
          <p className="stat-value" style=${{ fontSize: '2.5rem' }}>${stats.absentToday}</p>
        </div>

        <div className="glass-card" style=${{ borderTop: '4px solid var(--secondary)' }}>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style=${{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasks Completed</h3>
            <div style=${{ background: 'rgba(14, 165, 233, 0.15)', padding: '0.5rem', borderRadius: '8px' }}>
              <${Activity} size=${22} color="var(--secondary)" />
            </div>
          </div>
          <p className="stat-value" style=${{ fontSize: '2.5rem' }}>${stats.tasksCompleted}</p>
          <div style=${{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <${TrendingUp} size=${16} /> <span>High Productivity</span>
          </div>
        </div>
      </div>

      <div className="animate-slide-up delay-2">
        <h2 style=${{ fontSize: '1.25rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <${Activity} size=${20} color="var(--primary)" /> Live Operations Feed
        </h2>
        <div className="glass-card" style=${{ padding: '0' }}>
          ${recentLogs.length === 0 ? html`
            <div style=${{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <${Clock} size=${40} style=${{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style=${{ fontSize: '1.1rem' }}>No recent activity to display.</p>
            </div>
          ` : html`
            <div style=${{ display: 'flex', flexDirection: 'column' }}>
              ${recentLogs.map((log, index) => html`
                <div key=${log.id} style=${{ 
                  padding: '1.25rem 1.5rem', 
                  borderBottom: index < recentLogs.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'background 0.2s ease',
                  cursor: 'default',
                  backgroundColor: log.isWarning ? 'rgba(254, 226, 226, 0.3)' : 'transparent'
                }}
                onMouseOver=${e => e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.5)'}
                onMouseOut=${e => e.currentTarget.style.backgroundColor = log.isWarning ? 'rgba(254, 226, 226, 0.3)' : 'transparent'}
                >
                  <div style=${{ 
                    background: log.isWarning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(241, 245, 249, 0.8)', 
                    padding: '0.75rem', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: log.isWarning ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none'
                  }}>
                    <${log.icon} size=${20} color=${log.color} />
                  </div>
                  
                  <div style=${{ flex: 1 }}>
                    <div style=${{ fontWeight: '500', color: log.isWarning ? 'var(--danger)' : 'var(--text-primary)', fontSize: '1rem' }}>
                      ${log.text}
                      ${log.isWarning ? html`<span style=${{ marginLeft: '0.5rem', fontSize: '0.75rem', background: 'var(--danger)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '99px', fontWeight: 'bold' }}>PROXY ALERT</span>` : null}
                    </div>
                    <div style=${{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      ${log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  ${log.points ? html`
                    <div style=${{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.4rem 0.75rem', borderRadius: '99px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      +${log.points} pts
                    </div>
                  ` : null}
                </div>
              `)}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
