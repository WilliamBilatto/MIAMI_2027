import React from 'react';

export default function GtaHud({ wantedStars = 2, confirmedCount = 1, apiBaseUrl = '' }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="gta-hud">
      <div className="wanted-stars" title="Nível de Hype da Viagem (Sobe a cada amigo confirmado!)">
        <span
          className="gta-title"
          style={{
            color: '#fff',
            fontSize: '16px',
            marginRight: '6px',
            letterSpacing: '1px',
          }}
        >
          HYPE LEVEL:
        </span>
        {stars.map((star) => (
          <i
            key={star}
            className={`fa-solid fa-star ${star <= wantedStars ? 'star-active' : 'star-inactive'}`}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <a
          href="#slide9"
          style={{
            background: 'rgba(15, 6, 28, 0.85)',
            border: '1px solid var(--neon-pink)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 800,
            backdropFilter: 'blur(8px)',
          }}
        >
          <i className="fa-solid fa-user-check" style={{ color: 'var(--neon-cyan)', marginRight: '6px' }} />
          {confirmedCount} TÁ DENTRO
        </a>

        <a
          href={`${apiBaseUrl}/api/dossier/download`}
          target="_blank"
          rel="noreferrer"
          style={{
            background: 'rgba(13, 240, 227, 0.16)',
            border: '1px solid var(--neon-cyan)',
            color: 'var(--neon-cyan)',
            padding: '6px 14px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 800,
            backdropFilter: 'blur(8px)',
          }}
        >
          <i className="fa-solid fa-file-arrow-down" style={{ marginRight: '6px' }} />
          BAIXAR DOSSIÊ
        </a>
      </div>
    </div>
  );
}

