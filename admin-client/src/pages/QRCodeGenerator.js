import React, { useState } from 'react';
import htm from 'htm';
import { Printer, MapPin, ShieldCheck, QrCode } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function QRCodeGenerator() {
  const [location, setLocation] = useState('Sankara Nigeria Limited Head Office');
  const [deviceUuidRequired, setDeviceUuidRequired] = useState(true);

  const qrData = JSON.stringify({
    workplace: location,
    device_uuid_required: deviceUuidRequired,
    timestamp: new Date().toISOString()
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}`;
  const logoUrl = 'https://sankara-id.vercel.app/uploads/logo.png';
  const tractorBg = 'https://sankara-id.vercel.app/tractor_bg.png';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Staff Attendance Poster</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            body {
              margin: 0;
              padding: 0;
              font-family: 'Outfit', sans-serif;
              -webkit-print-color-adjust: exact;
            }
            .poster {
              width: 100vw;
              height: 100vh;
              background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8)), url('${tractorBg}');
              background-size: cover;
              background-position: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
            }
            .logo {
              max-height: 120px;
              max-width: 300px;
              margin-bottom: 2vh;
              filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
              object-fit: contain;
            }
            h1 {
              font-size: 5rem;
              font-weight: 800;
              margin: 0 0 10px 0;
              letter-spacing: 2px;
              text-shadow: 0 4px 10px rgba(0,0,0,0.5);
              text-transform: uppercase;
              color: #f8fafc;
            }
            h2 {
              font-size: 2.2rem;
              font-weight: 600;
              margin: 0 0 4vh 0;
              color: #38bdf8;
              text-shadow: 0 2px 5px rgba(0,0,0,0.5);
              letter-spacing: 1px;
            }
            .glass-card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              border: 2px solid rgba(255, 255, 255, 0.2);
              border-radius: 32px;
              padding: 50px;
              display: flex;
              flex-direction: column;
              align-items: center;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .qr-wrapper {
              background: white;
              padding: 20px;
              border-radius: 20px;
              margin-bottom: 30px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            .qr-img {
              width: 350px;
              height: 350px;
              display: block;
            }
            .location {
              font-size: 1.8rem;
              font-weight: 600;
              margin: 0;
              text-align: center;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .proxy-badge {
              margin-top: 20px;
              background: #10b981;
              color: white;
              padding: 10px 24px;
              border-radius: 9999px;
              font-size: 1.1rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <img src="${logoUrl}" alt="Company Logo" class="logo" onerror="this.style.display='none'" />
            <h1>Staff Only</h1>
            <h2>SCAN TO CLOCK IN & OUT</h2>
            
            <div class="glass-card">
              <div class="qr-wrapper">
                <img class="qr-img" src="${qrImageUrl}" alt="Attendance QR Code" />
              </div>
              <p class="location">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${location}
              </p>
              ${deviceUuidRequired ? '<div class="proxy-badge">Anti-Proxy Protection Active</div>' : ''}
            </div>
          </div>
          <script>
            window.onload = function() { setTimeout(() => window.print(), 800); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return html`
    <div>
      <header style=${{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Attendance Poster Generator</h1>
          <p>Create a beautiful, printable poster with your company logo and a cinematic tractor background.</p>
        </div>
        <button className="btn btn-primary" onClick=${handlePrint} style=${{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          <${Printer} size=${20} /> Print Full Poster
        </button>
      </header>

      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        <div className="glass-panel" style=${{ padding: '2rem' }}>
          <h2 style=${{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
            <${QrCode} size=${20} style=${{ color: 'var(--primary)' }} /> Configure Poster
          </h2>
          
          <div style=${{ marginBottom: '1.5rem' }}>
            <label style=${{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Workplace Location Name</label>
            <div style=${{ position: 'relative' }}>
              <${MapPin} size=${18} style=${{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-field" 
                style=${{ paddingLeft: '2.5rem' }}
                value=${location}
                onChange=${e => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div style=${{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <input 
              type="checkbox" 
              id="device_uuid" 
              checked=${deviceUuidRequired}
              onChange=${e => setDeviceUuidRequired(e.target.checked)}
              style=${{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="device_uuid" style=${{ fontSize: '0.95rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 500 }}>
              Enable Anti-Proxy Verification
            </label>
          </div>

          <p style=${{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <${ShieldCheck} size=${14} style=${{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>
            When enabled, staff must use their registered personal device. This prevents buddy punching.
          </p>
        </div>

        <div style=${{ 
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          aspectRatio: '1 / 1.1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style=${{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "url('" + tractorBg + "')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1
          }}></div>
          <div style=${{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8))',
            zIndex: 2
          }}></div>

          <div style=${{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white', width: '100%', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
            <img src=${logoUrl} alt="Logo" style=${{ maxHeight: '60px', marginBottom: '1rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} onError=${e => e.target.style.display = 'none'} />
            
            <h1 style=${{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'white', textTransform: 'uppercase', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>Staff Only</h1>
            <h2 style=${{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 2rem 0', color: '#38bdf8', textShadow: '0 2px 5px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>SCAN TO CLOCK IN & OUT</h2>
            
            <div style=${{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <div style=${{ background: 'white', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <img src=${qrImageUrl} style=${{ width: '220px', height: '220px', display: 'block' }} alt="QR Code" />
              </div>
              <p style=${{ fontSize: '1.25rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <${MapPin} size=${24} /> {location}
              </p>
              ${deviceUuidRequired ? html`
                <div style=${{ marginTop: '1rem', background: '#10b981', padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Anti-Proxy Protection Active
                </div>
              ` : null}
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}
