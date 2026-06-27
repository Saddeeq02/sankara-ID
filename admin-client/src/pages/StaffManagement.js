import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Plus, Download, Search, Edit2, Trash2 } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Registration Modal State
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    full_name: '',
    role: '',
    department: '',
    phone: '',
    email: '',
    address: '',
    education: '',
    username: '',
    password: ''
  });
  const [pictureFile, setPictureFile] = useState(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editPictureFile, setEditPictureFile] = useState(null);

  // Delete Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(null);

  // Download Modal State
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadingStaff, setDownloadingStaff] = useState(null);

  async function fetchStaff() {
    try {
      const res = await fetch('https://sankara-id.vercel.app/staff/');
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('full_name', newStaff.full_name);
      formData.append('role', newStaff.role);
      formData.append('department', newStaff.department);
      formData.append('phone', newStaff.phone);
      if (newStaff.email) formData.append('email', newStaff.email);
      formData.append('address', newStaff.address);
      formData.append('education', newStaff.education);
      formData.append('username', newStaff.username);
      formData.append('password', newStaff.password);
      if (pictureFile) {
        formData.append('picture', pictureFile);
      }

      const res = await fetch('https://sankara-id.vercel.app/staff/', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setNewStaff({
          full_name: '',
          role: '',
          department: '',
          phone: '',
          email: '',
          address: '',
          education: '',
          username: '',
          password: ''
        });
        setPictureFile(null);
        setShowModal(false);
        fetchStaff();
      } else {
        const err = await res.json();
        alert(err.detail || "Error registering staff");
      }
    } catch (err) {
      console.error("Error creating staff:", err);
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    try {
      // 1. Update text details
      const updateData = {
        full_name: editingStaff.full_name,
        role: editingStaff.role,
        department: editingStaff.department,
        phone: editingStaff.phone,
        email: editingStaff.email || null,
        address: editingStaff.address,
        education: editingStaff.education,
        is_active: editingStaff.is_active,
        score: editingStaff.score
      };
      
      if (editingStaff.password && editingStaff.password.trim() !== "") {
        updateData.password = editingStaff.password;
      }

      const res = await fetch(`https://sankara-id.vercel.app/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Error updating staff");
        return;
      }

      // 2. Upload new photo if provided
      if (editPictureFile) {
        const formData = new FormData();
        formData.append('picture', editPictureFile);
        
        const picRes = await fetch(`https://sankara-id.vercel.app/staff/${editingStaff.id}/picture`, {
          method: 'POST',
          body: formData
        });
        
        if (!picRes.ok) {
          alert("Error uploading profile photo");
        }
      }

      setEditModalOpen(false);
      setEditingStaff(null);
      setEditPictureFile(null);
      fetchStaff();
    } catch (err) {
      console.error("Error updating staff:", err);
    }
  };

  const handleResetMonthlyScores = async () => {
    if (window.confirm("Are you sure you want to reset all staff scores to 0 and archive them for this month?")) {
      try {
        const res = await fetch('https://sankara-id.vercel.app/staff/reset_monthly_scores', {
          method: 'POST'
        });
        if (res.ok) {
          alert("Monthly scores reset and archived successfully!");
          fetchStaff();
        } else {
          alert("Failed to reset scores.");
        }
      } catch (err) {
        console.error("Error resetting scores:", err);
      }
    }
  };

  const filteredStaff = staff.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return html`
    <div>
      <header style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Staff Management</h1>
          <p>Register, edit, and delete staff profiles.</p>
        </div>
        <div style=${{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-glass" onClick=${handleResetMonthlyScores}>
            Monthly Score Reset
          </button>
          <button className="btn btn-primary" onClick=${() => setShowModal(true)}>
            <${Plus} size=${20} /> Register Staff
          </button>
        </div>
      </header>

      <div className="glass-panel" style=${{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style=${{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style=${{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <${Search} size=${20} style=${{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search staff..." 
              style=${{ paddingLeft: '2.5rem' }} 
              value=${searchTerm}
              onChange=${e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStaff.map((s) => html`
                <tr key=${s.id}>
                  <td>SANK-ID-${String(s.id).padStart(5, '0')}</td>
                  <td style=${{ fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img 
                      src=${s.picture_path ? (s.picture_path.startsWith('http') ? s.picture_path : `https://sankara-id.vercel.app/${s.picture_path}?t=${new Date().getTime()}`) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                      style=${{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                    ${s.full_name}
                  </td>
                  <td>${s.role}</td>
                  <td>${s.department}</td>
                  <td style=${{ fontWeight: 'bold', color: 'var(--primary-color)' }}>${s.score} pts</td>
                  <td>
                    <span className=${s.is_active ? "badge badge-success" : "badge badge-danger"}>
                      ${s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style=${{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        onClick=${() => { setDownloadingStaff(s); setDownloadModalOpen(true); }}
                        className="btn btn-glass" 
                        style=${{ padding: '0.4rem 0.6rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        <${Download} size=${14} /> Card
                      </button>
                      <button 
                        onClick=${() => { setEditingStaff({...s, password: ''}); setEditModalOpen(true); }}
                        className="btn btn-glass" 
                        style=${{ padding: '0.4rem 0.6rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        <${Edit2} size=${14} /> Edit
                      </button>
                      <button 
                        onClick=${() => { setDeletingStaff(s); setDeleteConfirmOpen(true); }}
                        className="btn btn-danger" 
                        style=${{ padding: '0.4rem 0.6rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        <${Trash2} size=${14} /> Del
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>

      ${showModal && html`
        <div style=${{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style=${{ width: '90%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style=${{ marginTop: 0, marginBottom: '1.5rem' }}>Register New Staff</h2>
            <form onSubmit=${handleAddStaff}>
              <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${newStaff.full_name}
                    onChange=${e => {
                      const val = e.target.value;
                      const firstName = val.split(' ')[0].toLowerCase();
                      setNewStaff({...newStaff, full_name: val, username: firstName});
                    }}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${newStaff.phone}
                    onChange=${e => setNewStaff({...newStaff, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email (Optional)</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value=${newStaff.email}
                    onChange=${e => setNewStaff({...newStaff, email: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Role</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${newStaff.role}
                    onChange=${e => setNewStaff({...newStaff, role: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Department</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${newStaff.department}
                    onChange=${e => setNewStaff({...newStaff, department: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Level of Education</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    placeholder="B.Sc, MSc, High School, etc."
                    value=${newStaff.education}
                    onChange=${e => setNewStaff({...newStaff, education: e.target.value})}
                  />
                </div>
                <div style=${{ gridColumn: 'span 2' }}>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Residential Address</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${newStaff.address}
                    onChange=${e => setNewStaff({...newStaff, address: e.target.value})}
                  />
                </div>
                <div style=${{ gridColumn: 'span 2' }}>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Profile Photo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="input-field" 
                    onChange=${e => setPictureFile(e.target.files[0])}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Username (Auto-generated)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    readOnly
                    style=${{ backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                    value=${newStaff.username}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password (Login)</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    required 
                    value=${newStaff.password}
                    onChange=${e => setNewStaff({...newStaff, password: e.target.value})}
                  />
                </div>
              </div>
              <div style=${{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-glass" onClick=${() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register</button>
              </div>
            </form>
          </div>
        </div>
      `}

      ${editModalOpen && editingStaff && html`
        <div style=${{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style=${{ width: '90%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style=${{ marginTop: 0, marginBottom: '1.5rem' }}>Edit Staff Details</h2>
            <form onSubmit=${handleEditStaff}>
              <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${editingStaff.full_name}
                    onChange=${e => setEditingStaff({...editingStaff, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${editingStaff.phone}
                    onChange=${e => setEditingStaff({...editingStaff, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email (Optional)</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value=${editingStaff.email || ''}
                    onChange=${e => setEditingStaff({...editingStaff, email: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Role</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${editingStaff.role}
                    onChange=${e => setEditingStaff({...editingStaff, role: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Department</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${editingStaff.department}
                    onChange=${e => setEditingStaff({...editingStaff, department: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Level of Education</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${editingStaff.education}
                    onChange=${e => setEditingStaff({...editingStaff, education: e.target.value})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Score (Points)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    required 
                    value=${editingStaff.score}
                    onChange=${e => setEditingStaff({...editingStaff, score: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</label>
                  <select 
                    className="input-field" 
                    value=${editingStaff.is_active ? 'true' : 'false'}
                    onChange=${e => setEditingStaff({...editingStaff, is_active: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div style=${{ gridColumn: 'span 2' }}>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Residential Address</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value=${editingStaff.address}
                    onChange=${e => setEditingStaff({...editingStaff, address: e.target.value})}
                  />
                </div>
                <div style=${{ gridColumn: 'span 2' }}>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Update Profile Photo (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="input-field" 
                    onChange=${e => setEditPictureFile(e.target.files[0])}
                  />
                </div>
                <div style=${{ gridColumn: 'span 2' }}>
                  <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>New Password (Leave blank to keep unchanged)</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value=${editingStaff.password || ''}
                    placeholder="Enter new password"
                    onChange=${e => setEditingStaff({...editingStaff, password: e.target.value})}
                  />
                </div>
              </div>
              <div style=${{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-glass" onClick=${() => { setEditModalOpen(false); setEditingStaff(null); setEditPictureFile(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      `}

      ${deleteConfirmOpen && deletingStaff && html`
        <div style=${{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="glass-panel" style=${{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <h2 style=${{ marginTop: 0, marginBottom: '1rem', color: '#EF4444' }}>Delete Staff Profile?</h2>
            <p style=${{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Are you sure you want to delete <strong>${deletingStaff.full_name}</strong>? All of their tasks and attendance logs will be permanently removed.
            </p>
            <div style=${{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn btn-glass" 
                onClick=${() => { setDeleteConfirmOpen(false); setDeletingStaff(null); }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick=${async () => {
                  try {
                    const res = await fetch(`https://sankara-id.vercel.app/staff/${deletingStaff.id}`, {
                      method: 'DELETE'
                    });
                    if (res.ok) {
                      setDeleteConfirmOpen(false);
                      setDeletingStaff(null);
                      fetchStaff();
                    } else {
                      const err = await res.json();
                      alert(err.detail || "Error deleting staff");
                    }
                  } catch (err) {
                    console.error("Error deleting staff:", err);
                  }
                }}
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      `}

      ${downloadModalOpen && downloadingStaff && html`
        <div style=${{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70 }}>
          <div className="glass-panel" style=${{ width: '90%', maxWidth: '350px', padding: '2rem', textAlign: 'center' }}>
            <h2 style=${{ marginTop: 0, marginBottom: '1rem' }}>Select ID Template</h2>
            <p style=${{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Choose a template style for <strong>${downloadingStaff.full_name}</strong>'s ID Card.
            </p>
            <div style=${{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <a 
                href=${`https://sankara-id.vercel.app/staff/${downloadingStaff.id}/id_card?template=agri`} 
                target="_blank"
                className="btn btn-primary" 
                onClick=${() => { setDownloadModalOpen(false); setDownloadingStaff(null); }}
                style=${{ textDecoration: 'none' }}
              >
                Template 1
              </a>
              <a 
                href=${`https://sankara-id.vercel.app/staff/${downloadingStaff.id}/id_card?template=techco`} 
                target="_blank"
                className="btn btn-glass" 
                onClick=${() => { setDownloadModalOpen(false); setDownloadingStaff(null); }}
                style=${{ textDecoration: 'none' }}
              >
                Template 2
              </a>
              <button 
                type="button" 
                className="btn btn-glass" 
                onClick=${() => { setDownloadModalOpen(false); setDownloadingStaff(null); }}
                style=${{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}
