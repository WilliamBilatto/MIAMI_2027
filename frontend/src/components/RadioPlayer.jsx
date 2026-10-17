import React, { useEffect, useRef, useState } from 'react';

const SPOTIFY_TRACKS = [
  {
    id: 'gta6_main',
    label: 'GTA VI Official Track',
    uri: 'spotify:track:4HCOHRCSQelz2GPX8iTamO',
    embedUrl: 'https://open.spotify.com/embed/track/4HCOHRCSQelz2GPX8iTamO?utm_source=generator&theme=0',
  },
  {
    id: 'vice_city_playlist',
    label: 'Flash FM — Vice City Classics',
    uri: 'spotify:playlist:1Ver90a8cR5U3pD9eF7hD1',
    embedUrl: 'https://open.spotify.com/embed/track/2WfaOiMkCvy7F5fcp2zZ8L?utm_source=generator&theme=0',
  },
];

export default function RadioPlayer({ autoStart }) {
  const [minimized, setMinimized] = useState(false);
  const [selectedTrackIdx, setSelectedTrackIdx] = useState(0);
  const [synthBackupActive, setSynthBackupActive] = useState(false);

  const embedRef = useRef(null);
  const spotifyControllerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);

  const currentTrack = SPOTIFY_TRACKS[selectedTrackIdx];

  // Carrega a API oficial de IFrame do Spotify para disparar .play() automaticamente
  useEffect(() => {
    const existingScript = document.getElementById('spotify-iframe-api');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'spotify-iframe-api';
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      if (!embedRef.current) return;
      const options = {
        uri: currentTrack.uri,
        width: '100%',
        height: '80',
        theme: 'dark',
      };
      IFrameAPI.createController(embedRef.current, options, (EmbedController) => {
        spotifyControllerRef.current = EmbedController;
        if (autoStart) {
          try {
            EmbedController.play();
          } catch {
            // fallback
          }
        }
      });
    };
  }, []);

  // Dispara o play no Spotify assim que o usuário clica em "Entrar em Vice City"
  useEffect(() => {
    if (autoStart && spotifyControllerRef.current) {
      try {
        spotifyControllerRef.current.play();
      } catch {
        // Caso o navegador peça clique direto no iframe
      }
    }
  }, [autoStart]);

  const switchSpotifyTrack = () => {
    const nextIdx = (selectedTrackIdx + 1) % SPOTIFY_TRACKS.length;
    setSelectedTrackIdx(nextIdx);
    if (spotifyControllerRef.current) {
      try {
        spotifyControllerRef.current.loadUri(SPOTIFY_TRACKS[nextIdx].uri);
        spotifyControllerRef.current.play();
      } catch {
        // ignore
      }
    }
  };

  // Sintetizador auxiliar opcional caso o usuário não esteja logado no Spotify no navegador
  const toggleSynthBackup = () => {
    if (synthBackupActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setSynthBackupActive(false);
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const bassNotes = [55, 55, 65.41, 73.42, 82.41, 82.41, 73.42, 65.41];
    const arpNotes = [220, 277.18, 329.63, 440, 329.63, 277.18, 246.94, 329.63];

    timerRef.current = setInterval(() => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;
      const step = stepRef.current;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassNotes[step % bassNotes.length], now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);

      const arp = ctx.createOscillator();
      const arpGain = ctx.createGain();
      arp.type = 'triangle';
      arp.frequency.setValueAtTime(arpNotes[step % arpNotes.length], now);
      arpGain.gain.setValueAtTime(0.04, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      arp.connect(arpGain);
      arpGain.connect(ctx.destination);
      arp.start(now);
      arp.stop(now + 0.21);

      stepRef.current += 1;
    }, 260);

    setSynthBackupActive(true);
  };

  return (
    <div className="radio-dock">
      <div
        style={{
          width: '100%',
          background: 'rgba(14, 6, 26, 0.94)',
          border: '1.5px solid #1db954',
          borderRadius: '14px',
          padding: '10px 12px',
          boxShadow: '0 14px 40px rgba(0,0,0,0.9), 0 0 25px rgba(29, 185, 84, 0.35)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Barra Superior do Player Spotify Vice City */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: minimized ? 0 : '8px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-brands fa-spotify" style={{ color: '#1db954', fontSize: '18px' }} />
            <span className="gta-title" style={{ color: '#fff', fontSize: '17px', letterSpacing: '1.5px' }}>
              VICE CITY SPOTIFY RADIO
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={switchSpotifyTrack}
              title="Trocar faixa do Spotify"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'var(--neon-cyan)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-forward-step" style={{ marginRight: '4px' }} />
              FAIXA
            </button>

            <button
              type="button"
              onClick={toggleSynthBackup}
              title="Ligar/Desligar batida Synthwave auxiliar"
              style={{
                background: synthBackupActive ? 'var(--neon-pink)' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,42,133,0.4)',
                color: '#fff',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              SYNTH
            </button>

            <button
              type="button"
              onClick={() => setMinimized((prev) => !prev)}
              title={minimized ? 'Expandir Player' : 'Minimizar Player'}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <i className={`fa-solid ${minimized ? 'fa-expand' : 'fa-minus'}`} />
            </button>
          </div>
        </div>

        {/* Container do Spotify Embed (Prioritário) */}
        <div style={{ display: minimized ? 'none' : 'block' }}>
          <div ref={embedRef}>
            <iframe
              title="Spotify Vice City Player"
              style={{ borderRadius: '10px', display: 'block' }}
              src={`${currentTrack.embedUrl}&autoplay=1`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
