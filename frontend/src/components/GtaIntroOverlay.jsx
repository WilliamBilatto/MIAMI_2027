import React from 'react';

export default function GtaIntroOverlay({ onEnter }) {
  return (
    <div className="gta-intro-overlay">
      <div
        style={{
          maxWidth: '760px',
          background: 'rgba(15, 6, 28, 0.82)',
          border: '2px solid rgba(255, 42, 133, 0.6)',
          borderRadius: '24px',
          padding: '44px 32px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 40px rgba(255,42,133,0.3)',
        }}
      >
        <p
          className="gta-cursive"
          style={{
            color: 'var(--neon-cyan)',
            fontSize: '42px',
            marginBottom: '-12px',
            transform: 'rotate(-4deg)',
          }}
        >
          Rockstar Presents • Missão Férias
        </p>

        <h1
          className="gta-title"
          style={{
            fontSize: 'clamp(64px, 12vw, 130px)',
            color: 'var(--neon-pink)',
            lineHeight: 0.9,
            textShadow: '4px 4px 0px var(--neon-cyan), 0 0 35px rgba(255,42,133,0.6)',
            margin: '12px 0',
          }}
        >
          MIAMI 2027
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: '#e4e4e7',
            maxWidth: '560px',
            margin: '0 auto 28px auto',
            lineHeight: 1.6,
          }}
        >
          <strong>Lionel Messi</strong> no Inter Miami • <strong>Fórmula 1 GP de Miami</strong> •{' '}
          <strong>Vice City Lifestyle</strong>. Prepare o som: a rádio de Vice City vai tocar durante
          toda a convocação.
        </p>

        <button type="button" className="gta-btn-primary" onClick={onEnter}>
          <i className="fa-solid fa-play" style={{ marginRight: '10px' }} />
          ENTRAR EM VICE CITY (LIGAR RÁDIO)
        </button>

        <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '18px', letterSpacing: '1px' }}>
          🎵 ÁUDIO CONTÍNUO ATIVADO + DOSSIÊ REAL DE VOOS, AIRBNB E ROTEIRO
        </p>
      </div>
    </div>
  );
}

