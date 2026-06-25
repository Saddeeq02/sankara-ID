import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Settings, MapPin, ShieldAlert } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function DevSettings() {
  const [settings, setSettings] = useState({
    COMPANY_LAT: 11.9804,
    COMPANY_LON: 8.4958,
    ENFORCE_GEOFENCING: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('https://sankara-id.vercel.app/settings/');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('https://sankara-id.vercel.app/settings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return html`<div>Loading settings...</div>`;
  }

  return html`
    <div>
      <header style=${{ marginBottom: '2rem' }}>
        <h1>Developer Settings</h1>
        <p>Configure global variables and testing overrides.</p>
      </header>

      <div className="glass-panel" style=${{ padding: '2rem', maxWidth: '600px' }}>
        <form onSubmit=${handleSave}>
          <div style=${{ marginBottom: '2rem' }}>
            <h3 style=${{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <${ShieldAlert} size=${20} color="var(--primary-color)" />
              Geofencing Override
            </h3>
            <label style=${{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
              <input 
                type="checkbox" 
                checked=${settings.ENFORCE_GEOFENCING}
                onChange=${e => setSettings({...settings, ENFORCE_GEOFENCING: e.target.checked})}
                style=${{ width: '20px', height: '20px' }}
              />
              <div>
                <strong style=${{ display: 'block', color: 'var(--text-color)' }}>Enforce Location Geofencing</strong>
                <span style=${{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  If disabled, staff can clock in from anywhere without penalty. Useful for local testing.
                </span>
              </div>
            </label>
          </div>

          <div style=${{ marginBottom: '2rem' }}>
            <h3 style=${{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <${MapPin} size=${20} color="var(--primary-color)" />
              Company Office Coordinates
            </h3>
            <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Latitude</label>
                <input 
                  type="number" 
                  step="any"
                  className="input-field" 
                  required 
                  value=${settings.COMPANY_LAT}
                  onChange=${e => setSettings({...settings, COMPANY_LAT: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Longitude</label>
                <input 
                  type="number" 
                  step="any"
                  className="input-field" 
                  required 
                  value=${settings.COMPANY_LON}
                  onChange=${e => setSettings({...settings, COMPANY_LON: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <p style=${{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              Tip: You can get exact coordinates by dropping a pin on Google Maps.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled=${isSaving} style=${{ width: '100%', padding: '0.75rem' }}>
            ${isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  `;
}
