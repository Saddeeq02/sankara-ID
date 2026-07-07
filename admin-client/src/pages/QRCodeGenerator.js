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
          <title>Staff Attendance Poster - A4 Print</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
            
            @page {
              size: A4 portrait;
              margin: 0;
            }
            
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              font-family: 'Outfit', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: #090d16;
            }
            
            .poster {
              width: 210mm;
              height: 297mm;
              box-sizing: border-box;
              padding: 24mm 20mm;
              background-image: linear-gradient(rgba(9, 13, 22, 0.45), rgba(9, 13, 22, 0.85)), url('${tractorBg}');
              background-size: cover;
              background-position: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              color: white;
              position: relative;
              page-break-inside: avoid;
              page-break-after: always;
            }
            
            .header-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            
            .logo {
              max-height: 80px;
              max-width: 240px;
              margin-bottom: 15px;
              filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
              object-fit: contain;
            }
            
            h1 {
              font-size: 3.8rem;
              font-weight: 800;
              margin: 0 0 8px 0;
              letter-spacing: 2px;
              text-shadow: 0 4px 12px rgba(0,0,0,0.6);
              text-transform: uppercase;
              color: #ffffff;
            }
            
            h2 {
              font-size: 1.6rem;
              font-weight: 700;
              margin: 0;
              color: #38bdf8;
              text-shadow: 0 2px 6px rgba(0,0,0,0.5);
              letter-spacing: 1.5px;
              text-transform: uppercase;
            }
            
            .glass-card {
              background: rgba(255, 255, 255, 0.08);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              border: 2px solid rgba(255, 255, 255, 0.15);
              border-radius: 36px;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6);
              width: 130mm;
              box-sizing: border-box;
            }
            
            .qr-wrapper {
              background: white;
              padding: 24px;
              border-radius: 24px;
              margin-bottom: 25px;
              box-shadow: 0 15px 35px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .qr-img {
              width: 240px;
              height: 240px;
              display: block;
            }
            
            .location {
              font-size: 1.35rem;
              font-weight: 700;
              margin: 0;
              text-align: center;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              width: 100%;
              line-height: 1.4;
            }
            
            .proxy-badge {
              margin-top: 20px;
              background: #10b981;
              color: white;
              padding: 8px 24px;
              border-radius: 9999px;
              font-size: 0.9rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
            }
            
            .attribution {
              font-size: 0.95rem;
              color: rgba(255, 255, 255, 0.5);
              letter-spacing: 1px;
              text-align: center;
              text-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .attribution span {
              color: #38bdf8;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="header-section">
              <img src="${logoUrl}" alt="Company Logo" class="logo" onerror="this.style.display='none'" />
              <h1>Staff Only</h1>
              <h2>Scan to Clock In & Out</h2>
            </div>
            
            <div class="glass-card">
              <div class="qr-wrapper">
                <img class="qr-img" src="${qrImageUrl}" alt="Attendance QR Code" />
              </div>
              <p class="location">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${location}
              </p>
              ${deviceUuidRequired ? '<div class="proxy-badge">Anti-Proxy Verification Active</div>' : ''}
            </div>
            
            <div class="attribution">
              Sankara Admin Portal &bull; Developed by <span>Brainiacs Innovation</span>
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
      <header style=${{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style=${{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px' }}>Attendance Poster Generator</h1>
          <p style=${{ margin: 0, color: 'var(--text-secondary)', fontWeight: 500 }}>Generate and print a professional A4 poster for staff clock-ins.</p>
        </div>
        <button className="btn btn-primary" onClick=${handlePrint} style=${{ display: 'inline-flex', alignItems: 'center', gap: '10px', borderRadius: '12px', padding: '12px 24px', fontWeight: 700 }}>
          <${Printer} size=${18} /> Print A4 Poster
        </button>
      </header>

      <!-- Two-Column Layout -->
      <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem', alignItems: 'start' }}>
        
        <!-- Left: Configuration Form -->
        <div className="glass-panel" style=${{ padding: '2rem', border: '1px solid var(--glass-border)' }}>
          <h2 style=${{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700 }}>
            <${QrCode} size=${20} style=${{ color: 'var(--primary)' }} /> Configure Poster Details
          </h2>
          
          <div style=${{ marginBottom: '1.75rem' }}>
            <label style=${{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workplace Location Name</label>
            <div style=${{ position: 'relative' }}>
              <${MapPin} size=${18} style=${{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-field" 
                style=${{ paddingLeft: '3rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                value=${location}
                onChange=${e => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div style=${{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(79, 70, 229, 0.04)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
            <input 
              type="checkbox" 
              id="device_uuid" 
              checked=${deviceUuidRequired}
              onChange=${e => setDeviceUuidRequired(e.target.checked)}
              style=${{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <div>
              <label htmlFor="device_uuid" style=${{ fontSize: '0.95rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700 }}>
                Enable Anti-Proxy Verification
              </label>
              <span style=${{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Staff must use their pre-registered device.</span>
            </div>
          </div>

          <p style=${{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <${ShieldCheck} size=${16} style=${{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: 'var(--success)' }}/>
            Once printed, hang this poster at the designated entrance. The secure QR token will auto-authenticate matching location coordinates.
          </p>
        </div>

        <!-- Right: Real-time A4 Aspect Ratio Preview -->
        <div>
          <div style=${{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Live A4 Aspect Ratio Preview</div>
          
          <div style=${{ 
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            aspectRatio: '1 / 1.414',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2.5rem 2rem',
            background: '#090d16',
            boxSizing: 'border-box'
          }}>
            <!-- Tractor Background Image with Dim Overlay -->
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
              background: 'linear-gradient(rgba(9, 13, 22, 0.45), rgba(9, 13, 22, 0.85))',
              zIndex: 2
            }}></div>

            <!-- Content Elements styled identically to Print -->
            <div style=${{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white', width: '100%', textAlign: 'center' }}>
              <img src=${logoUrl} alt="Logo" style=${{ maxHeight: '45px', marginBottom: '10px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} onError=${e => e.target.style.display = 'none'} />
              
              <h1 style=${{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 4px 0', color: 'white', textTransform: 'uppercase', textShadow: '0 3px 8px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>Staff Only</h1>
              <h2 style=${{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#38bdf8', textShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>Scan to Clock In & Out</h2>
              
              <div style=${{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                width: '85%',
                boxSizing: 'border-box'
              }}>
                <div style=${{ background: 'white', padding: '12px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                  <img src=${qrImageUrl} style=${{ width: '150px', height: '150px', display: 'block' }} alt="QR Code" />
                </div>
                
                <p style=${{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.3)', width: '100%', lineHeight: '1.3' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  ${location}
                </p>
                
                ${deviceUuidRequired ? html`
                  <div style=${{ marginTop: '14px', background: '#10b981', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                    Anti-Proxy Active
                  </div>
                ` : null}
              </div>
            </div>

            <!-- Footer developed by info -->
            <div style=${{ position: 'relative', zIndex: 3, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', marginTop: '1.5rem', textAlign: 'center' }}>
              Sankara Admin Portal &bull; Developed by <span style=${{ color: '#38bdf8', fontWeight: '700' }}>Brainiacs Innovation</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}
