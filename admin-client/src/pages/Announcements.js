import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Megaphone, Send, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config';

const html = htm.bind(React.createElement);

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/announcements/`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    
    setIsPosting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/announcements/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (res.ok) {
        alert("Success: Announcement posted and notifications sent!");
        setTitle('');
        setContent('');
        fetchAnnouncements();
      } else {
        alert("Error: Failed to post announcement.");
      }
    } catch (err) {
      console.error("Error posting announcement:", err);
      alert("Error: Network failure.");
    } finally {
      setIsPosting(false);
    }
  };

  return html`
    <div style=${{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
      <header>
        <h1>General Announcements</h1>
        <p>Post announcements to all staff members (notifications will be dispatched instantly).</p>
      </header>

      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
        <!-- New Announcement Form -->
        <div className="glass-panel" style=${{ padding: '2rem' }}>
          <h2 style=${{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <${Megaphone} size=${22} color="var(--primary-color)" />
            Create Announcement
          </h2>

          <form onSubmit=${handlePost} style=${{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style=${{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Title</label>
              <input 
                type="text" 
                value=${title} 
                onChange=${e => setTitle(e.target.value)} 
                className="input-field" 
                placeholder="Enter announcement title" 
                required
              />
            </div>

            <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style=${{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Content Message</label>
              <textarea 
                value=${content} 
                onChange=${e => setContent(e.target.value)} 
                className="input-field" 
                rows="6" 
                placeholder="Enter details of the announcement..." 
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled=${isPosting} style=${{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem' }}>
              <${Send} size=${18} />
              ${isPosting ? 'Broadcasting...' : 'Broadcast Announcement'}
            </button>
          </form>
        </div>

        <!-- Past Announcements List -->
        <div className="glass-panel" style=${{ padding: '2rem', maxHeight: '75vh', overflowY: 'auto' }}>
          <h2 style=${{ marginBottom: '1.5rem' }}>History</h2>
          
          ${isLoading ? html`<p>Loading history...</p>` : (
            announcements.length === 0 ? html`
              <div style=${{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                No past announcements found.
              </div>
            ` : announcements.map(a => html`
              <div key=${a.id} className="announcement-item" style=${{
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginBottom: '1rem',
                background: 'rgba(255,255,255,0.01)'
              }}>
                <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                  <h3 style=${{ fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>${a.title}</h3>
                  <span style=${{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    <${Calendar} size=${12} />
                    ${new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style=${{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                  ${a.content}
                </p>
              </div>
            `))
          }
        </div>
      </div>
    </div>
  `;
}
