import React, { useCallback, useEffect, useRef, useState } from 'react';

const TRACK = {
  youtubeId: '5dPwBWvmcbQ',
  title: 'Flower In A Hurricane',
  artist: 'Justice ft. Tame Impala, SZA, King Gizzard & the Lizard Wizard',
  tag: 'GTA VI SOUNDTRACK • FULL TRACK',
  cover: 'https://i.ytimg.com/vi/5dPwBWvmcbQ/hqdefault.jpg',
};

const SPOTIFY_GREEN = '#1db954';

/**
 * Carrega a YouTube IFrame API uma única vez e resolve com o objeto global `YT`.
 */
function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (window.__ytApiPromise) return window.__ytApiPromise;

  window.__ytApiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') previousCallback();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.id = 'youtube-iframe-api';
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.body.appendChild(script);
  });
  return window.__ytApiPromise;
}

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function RadioPlayer({ autoStart }) {
  const [minimized, setMinimized] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [needsTap, setNeedsTap] = useState(false);

  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const autoStartRef = useRef(autoStart);

  // Cria o player do YouTube (invisível) assim que o componente monta,
  // para que ele já esteja pronto quando o visitante clicar em "Entrar em Vice City".
  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;
      playerRef.current = new YT.Player(hostRef.current, {
        videoId: TRACK.youtubeId,
        width: '200',
        height: '113',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: TRACK.youtubeId,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            setReady(true);
            setDuration(event.target.getDuration() || 0);
            event.target.setVolume(70);
            if (autoStartRef.current) event.target.playVideo();
          },
          onStateChange: (event) => {
            const { PlayerState } = window.YT;
            if (event.data === PlayerState.PLAYING) {
              setPlaying(true);
              setNeedsTap(false);
              setDuration(event.target.getDuration() || 0);
            } else if (event.data === PlayerState.PAUSED || event.data === PlayerState.ENDED) {
              setPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
  }, []);

  // Dispara o play logo após o clique em "Entrar em Vice City".
  // O clique conta como interação do usuário e a permissão é delegada ao iframe via allow="autoplay".
  useEffect(() => {
    autoStartRef.current = autoStart;
    if (!autoStart) return undefined;

    if (ready && playerRef.current) playerRef.current.playVideo();

    // Se o navegador ainda assim bloquear, mostra o aviso para um toque no play.
    const fallbackTimer = setTimeout(() => {
      const player = playerRef.current;
      const isPlaying = player && window.YT && player.getPlayerState?.() === window.YT.PlayerState.PLAYING;
      if (!isPlaying) setNeedsTap(true);
    }, 2500);
    return () => clearTimeout(fallbackTimer);
  }, [autoStart, ready]);

  // Atualiza a barra de progresso enquanto toca.
  useEffect(() => {
    if (!playing) return undefined;
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (player?.getCurrentTime) setCurrentTime(player.getCurrentTime());
    }, 500);
    return () => clearInterval(interval);
  }, [playing]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || !ready) return;
    if (playing) {
      player.pauseVideo();
    } else {
      player.unMute();
      setMuted(false);
      player.playVideo();
    }
  }, [playing, ready]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player || !ready) return;
    if (muted) {
      player.unMute();
    } else {
      player.mute();
    }
    setMuted((prev) => !prev);
  }, [muted, ready]);

  const seekTo = useCallback(
    (event) => {
      const player = playerRef.current;
      if (!player || !ready || !duration) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      const target = ratio * duration;
      player.seekTo(target, true);
      setCurrentTime(target);
    },
    [duration, ready],
  );

  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  const iconButton = {
    background: 'transparent',
    border: 'none',
    color: '#b3b3b3',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
  };

  return (
    <div className="radio-dock">
      {/* Player do YouTube invisível: fornece o áudio completo sem exigir login */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          bottom: 0,
          width: '200px',
          height: '113px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div ref={hostRef} />
      </div>

      <div
        style={{
          width: '100%',
          background: 'rgba(14, 6, 26, 0.94)',
          border: `1.5px solid ${SPOTIFY_GREEN}`,
          borderRadius: '16px',
          padding: '10px 12px',
          boxShadow: '0 14px 40px rgba(0,0,0,0.9), 0 0 25px rgba(29, 185, 84, 0.35)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Cabeçalho estilo Spotify */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: minimized ? 0 : '10px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <i className="fa-brands fa-spotify" style={{ color: SPOTIFY_GREEN, fontSize: '20px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                className="gta-title"
                style={{ color: '#fff', fontSize: '15px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
              >
                VICE CITY SPOTIFY RADIO
              </span>
              <span style={{ color: SPOTIFY_GREEN, fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>
                {TRACK.tag}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {minimized && (
              <button
                type="button"
                onClick={togglePlay}
                title={playing ? 'Pausar' : 'Tocar'}
                style={{
                  background: SPOTIFY_GREEN,
                  border: 'none',
                  color: '#000',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMinimized((prev) => !prev)}
              title={minimized ? 'Expandir Player' : 'Minimizar Player'}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(29, 185, 84, 0.4)',
                color: '#fff',
                borderRadius: '8px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <i className={`fa-solid ${minimized ? 'fa-chevron-up' : 'fa-minus'}`} />
              <span style={{ fontSize: '10px', fontWeight: 700 }}>{minimized ? 'EXPANDIR' : 'MIN'}</span>
            </button>
          </div>
        </div>

        {/* Corpo do player estilo Spotify */}
        <div
          style={{
            display: minimized ? 'none' : 'block',
            background: '#121212',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img
              src={TRACK.cover}
              alt="Capa da faixa"
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'cover',
                borderRadius: '6px',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '15px', margin: 0 }}>{TRACK.title}</p>
              <p
                style={{
                  color: '#b3b3b3',
                  fontSize: '12px',
                  margin: '2px 0 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={TRACK.artist}
              >
                {TRACK.artist}
              </p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div style={{ marginTop: '12px' }}>
            <div
              role="slider"
              aria-label="Progresso da faixa"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(currentTime)}
              tabIndex={0}
              onClick={seekTo}
              style={{
                height: '4px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '2px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: SPOTIFY_GREEN,
                  borderRadius: '2px',
                  transition: 'width 0.4s linear',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#b3b3b3',
                fontSize: '10px',
                marginTop: '4px',
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controles */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', marginTop: '4px' }}>
            <button type="button" onClick={toggleMute} title={muted ? 'Ativar som' : 'Silenciar'} style={iconButton}>
              <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!ready}
              title={playing ? 'Pausar' : 'Tocar'}
              style={{
                background: '#fff',
                border: 'none',
                color: '#000',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: ready ? 'pointer' : 'wait',
                fontSize: '14px',
                opacity: ready ? 1 : 0.5,
              }}
            >
              <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} style={{ marginLeft: playing ? 0 : '2px' }} />
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${TRACK.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              title="Abrir no YouTube"
              style={{ ...iconButton, textDecoration: 'none' }}
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
            </a>
          </div>

          {needsTap && !playing && (
            <p style={{ color: SPOTIFY_GREEN, fontSize: '11px', textAlign: 'center', margin: '8px 0 0' }}>
              Seu navegador bloqueou o autoplay. Toque no play para começar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
