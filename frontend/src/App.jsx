import React, { useEffect, useState } from 'react';
import GtaIntroOverlay from './components/GtaIntroOverlay.jsx';
import GtaHud from './components/GtaHud.jsx';
import RadioPlayer from './components/RadioPlayer.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

const FALLBACK_TRIP_DATA = {
  flights: [
    {
      airline: 'LATAM Airlines',
      route: 'São Paulo (GRU) ➔ Miami (MIA)',
      type: 'Voo Direto (~8h20)',
      price_range_brl: 'R$ 2.800 – R$ 4.100',
      highlight: 'Voos diários diretos noturnos e diurnos; sem fila de conexão e imigração direto em MIA.',
      badge: 'Mais Prático',
    },
    {
      airline: 'American Airlines',
      route: 'São Paulo (GRU) ➔ Miami (MIA)',
      type: 'Voo Direto (~8h25)',
      price_range_brl: 'R$ 3.000 – R$ 4.300',
      highlight: 'Hub principal em Miami, com ampla oferta de horários e aeronaves Boeing 777/787.',
      badge: 'Alta Frequência',
    },
    {
      airline: 'Copa Airlines / Avianca',
      route: 'São Paulo (GRU) ➔ MIA (1 conexão)',
      type: '1 Conexão no Panamá (PTY) ou Bogotá (~11h30)',
      price_range_brl: 'R$ 2.450 – R$ 3.100',
      highlight: 'Campeã de preço na janela de maio comprando de 3 a 5 meses antes.',
      badge: 'Melhor Preço',
    },
    {
      airline: 'Azul Linhas Aéreas',
      route: 'Campinas (VCP) / Conexões ➔ Fort Lauderdale (FLL)',
      type: 'Direto de VCP (~8h30) ou 1 conexão',
      price_range_brl: 'R$ 2.600 – R$ 3.700',
      highlight: 'Desembarque no aeroporto FLL, literalmente ao lado do Chase Stadium (casa do Inter Miami/Messi).',
      badge: 'Colado no Messi',
    },
  ],
  accommodations: [
    {
      neighborhood: 'Brickell (Manhattan do Sul)',
      vibe: 'Arranha-céus iluminados, Metromover gratuito, rooftops de luxo e vida noturna sofisticada.',
      airbnb_options:
        'Condos inteiros no Icon Brickell ou W Residences (2 a 3 quartos com piscina gigante de borda infinita para a baía).',
      airbnb_daily_usd: 'US$ 180 – US$ 280 / noite (dividido pelo grupo)',
      hotel_options: 'Novotel Miami Brickell (4★ com rooftop), citizenM Miami Worldcenter e SLS Lux Brickell.',
      hotel_daily_usd: 'US$ 170 – US$ 310 / noite (quarto duplo)',
      best_for: 'Mobilidade sem carro, rooftops e estética Vice City moderna.',
      tag: 'TOP ESCOLHA GRUPO',
    },
    {
      neighborhood: 'South Beach (Ocean Drive & Art Déco)',
      vibe: 'Pé na areia, prédios Art Déco em neon, calçadão da Ocean Drive, praia cristalina e festas.',
      airbnb_options: 'Apart-hotéis e lofts licenciados próximos à Collins Ave, Española Way e Lincoln Road.',
      airbnb_daily_usd: 'US$ 190 – US$ 320 / noite',
      hotel_options: 'The Goodtime Hotel (do Pharrell Williams), Arlo South Beach, Moxy South Beach e 1 Hotel.',
      hotel_daily_usd: 'US$ 210 – US$ 360 / noite',
      best_for: 'Fazer praia e balada a pé como no clássico GTA Vice City.',
      tag: 'CLÁSSICO VICE CITY',
    },
    {
      neighborhood: 'Wynwood & Midtown',
      vibe: 'O bairro mais jovem e criativo de Miami: murais de grafite, cervejarias artesanais, speakeasies e lofts.',
      airbnb_options: 'Casas reformadas com piscina privativa ou lofts industriais amplos para 4 a 8 amigos.',
      airbnb_daily_usd: 'US$ 150 – US$ 250 / noite (excelente divisão por pessoa)',
      hotel_options: 'Arlo Wynwood (rooftop com piscina e DJ), Moxy Miami Wynwood e Hampton Inn Midtown.',
      hotel_daily_usd: 'US$ 180 – US$ 290 / noite',
      best_for: 'Melhor custo-benefício em casa inteira no Airbnb e bares descolados.',
      tag: 'MELHOR CUSTO/GRUPO',
    },
  ],
  places: [
    {
      category: 'Baladas de Miami',
      icon: 'fa-martini-glass-citrus',
      accent: 'pink',
      image: '/assets/gta_club_miami.png',
      spots: [
        {
          name: 'E11EVEN Miami & LIV (Fontainebleau)',
          desc: 'As duas superbaladas mais lendárias dos EUA: shows internacionais, lasers e festa sem hora pra acabar.',
        },
        {
          name: 'Sugar (40º andar do EAST Miami - Brickell)',
          desc: 'O rooftop mais disputado de Miami, jardim asiático com vista 360º dos arranha-céus iluminados.',
        },
        {
          name: 'Rosa Sky & Space Miami',
          desc: 'De drinks panorâmicos sob luz neon ao nascer do sol no lendário terraço do Club Space.',
        },
      ],
    },
    {
      category: 'Miami Beach',
      icon: 'fa-umbrella-beach',
      accent: 'cyan',
      image: '/assets/gta_miami_beach.png',
      spots: [
        {
          name: 'Ocean Drive & Lummus Park',
          desc: 'O cenário real de Vice City: postos salva-vidas Art Déco coloridos, coqueiros e mar azul-turquesa.',
        },
        {
          name: 'South Pointe Park & Pier',
          desc: 'Pôr do sol cinematográfico no extremo sul da ilha vendo os megacruzeiros partirem.',
        },
        {
          name: 'Joe’s Stone Crab & Lincoln Road',
          desc: 'Gastronomia histórica desde 1913 e caminhada de fim de tarde pelo calçadão de South Beach.',
        },
      ],
    },
    {
      category: 'Wynwood',
      icon: 'fa-spray-can-sparkles',
      accent: 'orange',
      image: '/assets/gta_wynwood.png',
      spots: [
        {
          name: 'Wynwood Walls & Street Art District',
          desc: 'Galeria mundial de grafites gigantes a céu aberto, galerias conceito e carros clássicos nas ruas.',
        },
        {
          name: 'Coyo Taco & Astra Rooftop',
          desc: 'Tacos mexicanos com bar speakeasy secreto nos fundos e pôr do sol no terraço grego Astra.',
        },
        {
          name: 'Gramps & Cervejarias Artesanais',
          desc: 'Bares alternativos com música ao vivo, DJs, fliperamas e a melhor atmosfera jovem da cidade.',
        },
      ],
    },
    {
      category: 'Fort Lauderdale',
      icon: 'fa-water',
      accent: 'cyan',
      image: '/assets/gta_fort_lauderdale.png',
      spots: [
        {
          name: "Canais de Las Olas ('Veneza da América')",
          desc: 'Passeio de Water Taxi passando pelas mansões bilionárias e superiates ancorados nos canais.',
        },
        {
          name: 'Chase Stadium (Casa do Inter Miami / Messi)',
          desc: 'O palco onde o camisa 10 joga em casa — clima de tailgate americano e festa rosa e preta.',
        },
        {
          name: 'Sawgrass Mills (Maior Outlet da Flórida)',
          desc: 'A 15 minutos de Fort Lauderdale: mais de 350 lojas (Nike, Adidas, Apple, Prada, North Face) com descontos brutais.',
        },
      ],
    },
  ],
  itinerary: [
    {
      phase: 'DIAS 1 A 4 — FIM DE SEMANA 1',
      title: 'Fórmula 1 Miami Grand Prix',
      location: 'Hard Rock Stadium (Miami Gardens) + Fan Zone Wynwood',
      details:
        'Chegada na quinta/sexta, treinos livres, Sprint Race no sábado, Grande Prêmio no domingo (30 Abr – 02 Mai) e after-parties oficiais da F1 em Wynwood e Brickell.',
      accent: 'cyan',
    },
    {
      phase: 'DIAS 5 A 8 — MEIO DA SEMANA',
      title: 'Miami Lifestyle & Compras',
      location: 'Miami Beach, Brickell, Wynwood & Fort Lauderdale',
      details:
        'Praia em South Beach, pôr do sol no South Pointe Pier, tarde em Wynwood Walls + Coyo Taco, noite nas baladas/rooftops e dia de compras pesadas no Sawgrass Mills.',
      accent: 'pink',
    },
    {
      phase: 'DIAS 9 A 11 — FIM DE SEMANA 2',
      title: 'Matchday: O Efeito Messi',
      location: 'Chase Stadium (Fort Lauderdale) / Miami Freedom Park',
      details:
        'Pré-jogo estilo tailgate americano, camisa rosa do Inter Miami e assistir Lionel Messi ao vivo na Sprint Season da MLS.',
      accent: 'orange',
    },
  ],
  budget: {
    base_breakdown: {
      flight_avg_brl: 2800,
      stay_share_brl: 3200,
      base_total_brl: 6000,
      shopping_avg_brl: 3000,
      messi_ticket_brl: 950,
      f1_ticket_brl: 2400,
    },
    plans: [
      {
        id: 'plan_base',
        name: 'Plano 1 — Turista Vice City (Base)',
        badge: 'Mais Econômico',
        accent: 'cyan',
        includes: [
          'Passagem Aérea Ida e Volta (~R$ 2.800)',
          'Estadia 10 dias dividida em Casa/Condo Airbnb (~R$ 3.200)',
          'Praias de Miami Beach, Wynwood, Fan Fest gratuita e Passeios',
        ],
        excludes: 'Sem ingressos pagos de F1 ou Jogo do Messi',
        base_price_brl: 'R$ 6.000',
        with_shopping_brl: 'R$ 9.000 (c/ R$ 3k de compras)',
      },
      {
        id: 'plan_messi',
        name: 'Plano 2 — Camisa 10 (Base + Jogo do Messi)',
        badge: 'Foco Futebol',
        accent: 'pink',
        includes: [
          'Passagem + Estadia 10 dias (R$ 6.000)',
          'Ingresso Inter Miami no Chase Stadium (~R$ 950)',
          'Praias, Wynwood, Fort Lauderdale e Vida Noturna',
        ],
        excludes: 'Sem ingresso do autódromo da F1',
        base_price_brl: 'R$ 6.950',
        with_shopping_brl: 'R$ 9.950 (c/ R$ 3k de compras)',
      },
      {
        id: 'plan_f1',
        name: 'Plano 3 — Velocidade Máxima (Base + Fórmula 1)',
        badge: 'Foco Motor',
        accent: 'orange',
        includes: [
          'Passagem + Estadia 10 dias (R$ 6.000)',
          'Ingresso F1 Miami GP - Campus Pass / Arquibancada (~R$ 2.400)',
          'Praias, Wynwood, Fort Lauderdale e Vida Noturna',
        ],
        excludes: 'Sem ingresso do jogo do Messi',
        base_price_brl: 'R$ 8.400',
        with_shopping_brl: 'R$ 11.400 (c/ R$ 3k de compras)',
      },
      {
        id: 'plan_boss',
        name: 'Plano 4 — Chefão de Vice City (Combo Completo)',
        badge: 'Experiência 100%',
        accent: 'cyan',
        includes: [
          'Passagem + Estadia 10 dias (R$ 6.000)',
          'Ingresso F1 Miami GP (~R$ 2.400)',
          'Ingresso Jogo do Messi (~R$ 950)',
        ],
        excludes: 'Experiência completa nos 2 megaeventos!',
        base_price_brl: 'R$ 9.350',
        with_shopping_brl: 'R$ 12.350 (c/ R$ 3k de compras)',
      },
    ],
  },
};

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [tripData, setTripData] = useState(FALLBACK_TRIP_DATA);
  const [logisticsTab, setLogisticsTab] = useState('flights');

  // Simulador interativo de orçamento no Slide 8
  const [simIncludeF1, setSimIncludeF1] = useState(true);
  const [simIncludeMessi, setSimIncludeMessi] = useState(true);
  const [simIncludeShopping, setSimIncludeShopping] = useState(true);

  const [participants, setParticipants] = useState({
    confirmed: [{ id: 1, name: 'Will (Organizador)', role_style: 'Chefe da Missão Vice City' }],
    invited: [
      { id: 2, name: 'Guilherme Nannini', role_style: 'Convocado Vice City' },
      { id: 3, name: 'Lucas Belizario', role_style: 'Convocado Vice City' },
      { id: 4, name: 'Franscico Carvalho', role_style: 'Convocado Vice City' },
      { id: 5, name: 'Alexia Lima', role_style: 'Convocada Vice City' },
      { id: 6, name: 'Bruna Siqueira', role_style: 'Convocada Vice City' },
    ],
    confirmed_count: 1,
    wanted_stars: 1,
  });

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState('Combo Completo: F1 + Messi + Vice City');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [newInviteName, setNewInviteName] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/trip-data`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.flights) {
          setTripData({
            ...FALLBACK_TRIP_DATA,
            ...data,
            budget: data.budget || FALLBACK_TRIP_DATA.budget,
          });
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/participants`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.confirmed) {
          setParticipants(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [tripData, logisticsTab]);

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/participants/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput,
          email: emailInput,
          role_style: roleInput,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Erro ao confirmar presença.');
      }

      setParticipants(result.participants);
      setFeedback({
        type: 'success',
        participantName: result.participant.name,
        emailMsg: result.email_dispatch.message,
      });
      setNameInput('');
      setEmailInput('');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Não foi possível conectar ao servidor FastAPI.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInvite = async (e) => {
    e.preventDefault();
    if (!newInviteName.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/api/participants/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newInviteName.trim(), role_style: 'Convocado Vice City' }),
      });
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants);
        setNewInviteName('');
      }
    } catch {
      // ignore offline
    }
  };

  const handleRemoveParticipant = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/participants/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants);
      }
    } catch {
      // ignore offline
    }
  };

  const budgetData = tripData.budget || FALLBACK_TRIP_DATA.budget;
  const simulatedTotal =
    budgetData.base_breakdown.base_total_brl +
    (simIncludeF1 ? budgetData.base_breakdown.f1_ticket_brl : 0) +
    (simIncludeMessi ? budgetData.base_breakdown.messi_ticket_brl : 0) +
    (simIncludeShopping ? budgetData.base_breakdown.shopping_avg_brl : 0);

  return (
    <>
      {!hasEntered && <GtaIntroOverlay onEnter={() => setHasEntered(true)} />}

      <GtaHud
        wantedStars={participants.wanted_stars || 1}
        confirmedCount={participants.confirmed_count || participants.confirmed.length}
        apiBaseUrl={API_BASE}
      />

      <nav className="slide-nav" aria-label="Navegação de slides">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <a key={num} href={`#slide${num}`} className="slide-dot" title={`Ir para Slide ${num}`} />
        ))}
      </nav>

      <RadioPlayer autoStart={hasEntered} />

      {/* SLIDE 1 — HERO GTA VI MIAMI 2027 (FUNDO TELA CHEIA) */}
      <section id="slide1" className="bg-slide-hero">
        <div style={{ textAlign: 'center', zIndex: 2, padding: '20px', maxWidth: '1100px' }}>
          <div
            className="reveal"
            style={{
              display: 'inline-block',
              background: 'rgba(20, 8, 36, 0.85)',
              border: '1px solid var(--neon-cyan)',
              padding: '6px 18px',
              borderRadius: '999px',
              marginBottom: '18px',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '2px',
              color: 'var(--neon-cyan)',
            }}
          >
            ★ CONVOCAÇÃO OFICIAL • MAIO DE 2027 ★
          </div>

          <p
            className="gta-cursive reveal"
            style={{
              color: 'var(--neon-cyan)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              margin: '0 0 15px 0',
              transform: 'rotate(-4deg)',
            }}
          >
            Projeto Férias — Vice City Edition
          </p>

          <h1
            className="gta-title reveal"
            style={{
              fontSize: 'clamp(78px, 15vw, 195px)',
              color: 'var(--neon-pink)',
              lineHeight: 0.86,
              margin: 0,
              textShadow: '6px 6px 0px var(--neon-cyan), 0 0 45px rgba(255,42,133,0.65)',
            }}
          >
            MIAMI 2027
          </h1>

          <p
            className="reveal"
            style={{
              fontSize: 'clamp(18px, 2.6vw, 26px)',
              color: '#fafafa',
              margin: '28px 0 36px 0',
              fontWeight: 800,
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            LIONEL MESSI <span style={{ color: 'var(--neon-cyan)' }}>•</span> FÓRMULA 1 GP{' '}
            <span style={{ color: 'var(--neon-pink)' }}>•</span> MIAMI LIFESTYLE
          </p>

          <div className="reveal" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#slide8"
              className="gta-btn-primary"
              style={{ textDecoration: 'none', fontSize: '22px', padding: '12px 30px' }}
            >
              VER PLANOS DE ORÇAMENTO
            </a>
            <a
              href="#slide9"
              style={{
                background: 'rgba(15, 6, 28, 0.85)',
                border: '2px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '22px',
                letterSpacing: '2px',
                padding: '12px 30px',
                borderRadius: '999px',
                textDecoration: 'none',
              }}
            >
              GARANTIR VAGA NO ESQUADRÃO
            </a>
          </div>
        </div>
      </section>

      {/* SLIDE 2 — A PROPOSTA (ARTE VICE CITY COMO FUNDO DO SLIDE) */}
      <section id="slide2" className="bg-slide-proposta">
        <div className="slide-container">
          <div className="reveal" style={{ maxWidth: '680px' }}>
            <p className="gta-marker" style={{ color: 'var(--neon-cyan)', fontSize: '24px', marginBottom: '14px' }}>
              A Proposta
            </p>
            <h2
              className="gta-title neon-text-pink"
              style={{ fontSize: 'clamp(54px, 8vw, 96px)', lineHeight: 0.92, marginBottom: '26px' }}
            >
              DOIS GIGANTES.
              <br />
              <span style={{ color: '#fff', textShadow: 'none' }}>UMA VIAGEM HISTÓRICA.</span>
            </h2>
            <p
              style={{
                fontSize: '20px',
                color: '#f4f4f5',
                marginBottom: '36px',
                lineHeight: 1.65,
                textShadow: '0 2px 10px rgba(0,0,0,0.9)',
              }}
            >
              Uma viagem para guardar na memória: Vamos alinhar na mesma janela de <strong>Maio de 2027</strong> dois dos maiores
              espetáculos do planeta na Flórida: <strong>Fórmula 1 no Hard Rock Stadium</strong> e{' '}
              <strong>Lionel Messi ao vivo pelo Inter Miami</strong>, vivendo a estética real de GTA VI / Vice City.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="glass-card neon-border-cyan" style={{ padding: '24px' }}>
                <p className="gta-title" style={{ fontSize: '42px', color: 'var(--neon-cyan)' }}>
                  MAIO 2027
                </p>
                <p style={{ fontSize: '15px', color: '#e4e4e7', marginTop: '4px' }}>
                  Clima perfeito de primavera e baixa temporada de voos
                </p>
              </div>
              <div className="glass-card neon-border-pink" style={{ padding: '24px' }}>
                <p className="gta-title" style={{ fontSize: '42px', color: 'var(--neon-pink)' }}>
                  9 A 11 DIAS
                </p>
                <p style={{ fontSize: '15px', color: '#e4e4e7', marginTop: '4px' }}>
                  F1 no FDS 1 + Lifestyle & Compras + Jogo do Messi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE 3 — O EFEITO MESSI (ARTE GTA DO MESSI NO FUNDO EM TELA CHEIA) */}
      <section id="slide3" className="bg-slide-messi">
        <div className="slide-container">
          <div className="reveal" style={{ maxWidth: '640px' }}>
            <p className="gta-marker" style={{ color: 'var(--neon-pink)', fontSize: '24px', marginBottom: '12px' }}>
              Motivador 01 • O GOAT em Campo
            </p>
            <h2
              className="gta-title"
              style={{
                fontSize: 'clamp(54px, 8.5vw, 98px)',
                lineHeight: 0.9,
                marginBottom: '28px',
                textShadow: '0 4px 25px rgba(0,0,0,0.9)',
              }}
            >
              O EFEITO <span className="neon-text-pink">MESSI</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div
                className="glass-card neon-border-pink"
                style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '22px' }}
              >
                <i className="fa-solid fa-crown" style={{ color: 'var(--neon-pink)', fontSize: '30px', marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Últimos Anos do GOAT em Atividade</p>
                  <p style={{ fontSize: '15px', color: '#e4e4e7', marginTop: '6px', lineHeight: 1.5 }}>
                    Ver Lionel Messi com a camisa 10 rosa do Inter Miami ao vivo é um evento geracional para contar
                    pro resto da vida.
                  </p>
                </div>
              </div>

              <div
                className="glass-card neon-border-cyan"
                style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '22px' }}
              >
                <i
                  className="fa-solid fa-calendar-check"
                  style={{ color: 'var(--neon-cyan)', fontSize: '30px', marginTop: '4px' }}
                />
                <div>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Auge da Temporada da MLS</p>
                  <p style={{ fontSize: '15px', color: '#e4e4e7', marginTop: '6px', lineHeight: 1.5 }}>
                    Maio tem calendário cheio da MLS sem conflito com datas FIFA, garantindo altíssima probabilidade de
                    jogo em casa na Flórida.
                  </p>
                </div>
              </div>

              <div
                className="glass-card neon-border-pink"
                style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '22px' }}
              >
                <i
                  className="fa-solid fa-location-dot"
                  style={{ color: 'var(--neon-pink)', fontSize: '30px', marginTop: '4px' }}
                />
                <div>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                    Chase Stadium (Fort Lauderdale) & Miami Freedom Park
                  </p>
                  <p style={{ fontSize: '15px', color: '#e4e4e7', marginTop: '6px', lineHeight: 1.5 }}>
                    Fácil acesso de Brightline (trem rápido de Miami) ou carro alugado combinado com parada no outlet
                    Sawgrass Mills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE 4 — FÓRMULA 1 MIAMI GRAND PRIX (ARTE F1 GTA VI COMO FUNDO DO SLIDE) */}
      <section id="slide4" className="bg-slide-f1">
        <div className="slide-container">
          <div className="reveal" style={{ maxWidth: '640px' }}>
            <p className="gta-marker" style={{ color: 'var(--neon-cyan)', fontSize: '24px', marginBottom: '12px' }}>
              Motivador 02 • Velocidade Máxima
            </p>
            <h2
              className="gta-title"
              style={{
                fontSize: 'clamp(54px, 8.5vw, 98px)',
                lineHeight: 0.9,
                marginBottom: '12px',
                textShadow: '0 4px 25px rgba(0,0,0,0.9)',
              }}
            >
              F1 MIAMI <span className="neon-text-cyan">GRAND PRIX</span>
            </h2>
            <p
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--neon-pink)',
                marginBottom: '32px',
                letterSpacing: '1.5px',
                textShadow: '0 2px 10px rgba(0,0,0,0.9)',
              }}
            >
              30 ABRIL — 02 MAIO • HARD ROCK STADIUM
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-card neon-border-cyan">
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  Miami International Autodrome (Miami Gardens)
                </p>
                <p style={{ fontSize: '16px', color: '#e4e4e7', lineHeight: 1.55 }}>
                  19 curvas, 3 zonas de DRS e retas batendo <strong>340 km/h</strong> ao redor do Hard Rock Stadium com
                  marina cenográfica, DJs no pódio e Campus Pass vibrante.
                </p>
              </div>

              <div className="glass-card neon-border-pink">
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  A Cidade Inteira Respira Fórmula 1
                </p>
                <p style={{ fontSize: '16px', color: '#e4e4e7', lineHeight: 1.55 }}>
                  Mesmo fora do autódromo, o bairro de <strong>Wynwood</strong> recebe o <em>F1 Racing Fan Fest</em>{' '}
                  gratuito com carros reais expostos, simuladores, shows e festas temáticas das equipes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE 5 — LIFESTYLE & PASSEIOS (4 COLUNAS VERTICAIS: BALADAS | MIAMI BEACH | WYNWOOD | FORT LAUDERDALE) */}
      <section id="slide5" className="lifestyle-section">
        <div className="lifestyle-header-overlay">
          <p className="gta-marker" style={{ color: 'var(--neon-cyan)', fontSize: '18px', marginBottom: '2px' }}>
            Baladas • Miami Beach • Wynwood • Fort Lauderdale
          </p>
          <h2 className="gta-title" style={{ fontSize: 'clamp(30px, 4.2vw, 52px)', color: '#fff', lineHeight: 1 }}>
            <span className="neon-text-orange">MIAMI</span> LIFESTYLE & PASSEIOS
          </h2>
        </div>

        <div className="lifestyle-vertical-grid">
          {tripData.places.map((group) => (
            <div
              key={group.category}
              className="lifestyle-column"
              style={{ backgroundImage: `url('${group.image}')` }}
            >
              <div className="lifestyle-column-content reveal">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(14, 5, 26, 0.9)',
                    border: `1.5px solid var(--neon-${group.accent})`,
                    padding: '8px 16px',
                    borderRadius: '999px',
                    marginBottom: '14px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.8)',
                  }}
                >
                  <i
                    className={`fa-solid ${group.icon}`}
                    style={{ color: `var(--neon-${group.accent})`, fontSize: '18px' }}
                  />
                  <h3 className="gta-title" style={{ fontSize: '26px', color: '#fff', letterSpacing: '1.5px' }}>
                    {group.category}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {group.spots.map((spot) => (
                    <div
                      key={spot.name}
                      style={{
                        background: 'rgba(14, 5, 26, 0.85)',
                        backdropFilter: 'blur(10px)',
                        borderLeft: `3px solid var(--neon-${group.accent})`,
                        borderRadius: '10px',
                        padding: '11px 14px',
                      }}
                    >
                      <p style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--neon-cyan)' }}>{spot.name}</p>
                      <p style={{ fontSize: '12.5px', color: '#e4e4e7', marginTop: '3px', lineHeight: 1.42 }}>
                        {spot.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SLIDE 6 — VOOS & HOSPEDAGENS REAIS (FUNDO DIVIDIDO: AVIÃO DECOLANDO + MANSÃO VICE CITY) */}
      <section id="slide6" style={{ flexDirection: 'column' }}>
        <div className="split-bg-container">
          <div className="split-bg-half left" />
          <div className="split-bg-half right" />
          <div className="split-bg-overlay" />
        </div>

        <div className="slide-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '880px', marginBottom: '28px' }}>
            <p className="gta-marker" style={{ color: 'var(--neon-pink)', fontSize: '24px', marginBottom: '8px' }}>
              Pesquisa Real de Mercado (Maio)
            </p>
            <h2 className="gta-title neon-text-cyan" style={{ fontSize: 'clamp(48px, 7vw, 86px)', marginBottom: '12px' }}>
              VOOS & HOSPEDAGENS REAIS
            </h2>
            <p style={{ fontSize: '18px', color: '#f4f4f5', lineHeight: 1.55, textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
              De um lado as melhores companhias aéreas saindo do Brasil; do outro, comparativo entre{' '}
              <strong>Airbnb</strong> e <strong>Hotéis</strong> nos 3 melhores bairros de Miami.
            </p>
          </div>

          <div className="tab-buttons">
            <button
              type="button"
              className={`tab-btn ${logisticsTab === 'flights' ? 'active' : ''}`}
              onClick={() => setLogisticsTab('flights')}
            >
              <i className="fa-solid fa-plane-departure" style={{ marginRight: '8px' }} />
              OPÇÕES DE VOOS (GRU ➔ MIA/FLL)
            </button>
            <button
              type="button"
              className={`tab-btn ${logisticsTab === 'stays' ? 'active' : ''}`}
              onClick={() => setLogisticsTab('stays')}
            >
              <i className="fa-solid fa-house-chimney-window" style={{ marginRight: '8px' }} />
              ONDE FICAR: AIRBNB VS. HOTÉIS
            </button>
          </div>

          {logisticsTab === 'flights' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '22px',
                width: '100%',
              }}
            >
              {tripData.flights.map((flight) => (
                <div
                  key={flight.airline}
                  className="glass-card neon-border-cyan"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(255, 42, 133, 0.25)',
                          border: '1px solid var(--neon-pink)',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        {flight.badge}
                      </span>
                      <i className="fa-solid fa-plane" style={{ color: 'var(--neon-cyan)', fontSize: '20px' }} />
                    </div>

                    <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                      {flight.airline}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--neon-cyan)', fontWeight: 600, marginBottom: '12px' }}>
                      {flight.route} • {flight.type}
                    </p>
                    <p style={{ fontSize: '14.5px', color: '#e4e4e7', lineHeight: 1.5, marginBottom: '18px' }}>
                      {flight.highlight}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.16)', paddingTop: '14px' }}>
                    <p style={{ fontSize: '12px', color: '#d4d4d8', textTransform: 'uppercase' }}>
                      Média Ida e Volta (Maio)
                    </p>
                    <p className="gta-title" style={{ fontSize: '36px', color: 'var(--neon-pink)', lineHeight: 1.1 }}>
                      {flight.price_range_brl}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px',
                width: '100%',
              }}
            >
              {tripData.accommodations.map((stay) => (
                <div key={stay.neighborhood} className="glass-card neon-border-pink">
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(13, 240, 227, 0.18)',
                      border: '1px solid var(--neon-cyan)',
                      color: 'var(--neon-cyan)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 800,
                      marginBottom: '12px',
                    }}
                  >
                    {stay.tag}
                  </span>

                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                    {stay.neighborhood}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#d4d4d8', marginBottom: '18px', lineHeight: 1.5 }}>{stay.vibe}</p>

                  <div
                    style={{
                      background: 'rgba(255, 42, 133, 0.14)',
                      border: '1px solid rgba(255, 42, 133, 0.35)',
                      borderRadius: '12px',
                      padding: '14px',
                      marginBottom: '12px',
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--neon-pink)', marginBottom: '4px' }}>
                      <i className="fa-brands fa-airbnb" style={{ marginRight: '6px' }} />
                      AIRBNB / TEMPORADA
                    </p>
                    <p style={{ fontSize: '13.5px', color: '#f4f4f5', lineHeight: 1.45 }}>{stay.airbnb_options}</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                      {stay.airbnb_daily_usd}
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'rgba(13, 240, 227, 0.12)',
                      border: '1px solid rgba(13, 240, 227, 0.35)',
                      borderRadius: '12px',
                      padding: '14px',
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--neon-cyan)', marginBottom: '4px' }}>
                      <i className="fa-solid fa-hotel" style={{ marginRight: '6px' }} />
                      HOTÉIS RECOMENDADOS
                    </p>
                    <p style={{ fontSize: '13.5px', color: '#f4f4f5', lineHeight: 1.45 }}>{stay.hotel_options}</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                      {stay.hotel_daily_usd}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SLIDE 7 — ROTEIRO INTELIGENTE DE 10 DIAS (FUNDO: JASON & LUCIA PLANEJANDO A MISSÃO) */}
      <section id="slide7" className="bg-slide-itinerary" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
        <div
          className="slide-container"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '78vh' }}
        >
          <div className="reveal" style={{ maxWidth: '750px' }}>
            <p className="gta-marker" style={{ color: 'var(--neon-pink)', fontSize: '24px', marginBottom: '8px' }}>
              Masterplan Vice City • Jason & Lucia Style
            </p>
            <h2
              className="gta-title"
              style={{
                fontSize: 'clamp(48px, 7.5vw, 88px)',
                color: '#fff',
                lineHeight: 0.95,
                textShadow: '0 4px 25px rgba(0,0,0,0.95)',
              }}
            >
              ROTEIRO <span className="neon-text-cyan">INTELIGENTE DE 10 DIAS</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              width: '100%',
              marginTop: 'auto',
              paddingTop: '140px',
            }}
          >
            {tripData.itinerary.map((step) => (
              <div key={step.phase} className={`glass-card neon-border-${step.accent} reveal`}>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: `var(--neon-${step.accent})`,
                    letterSpacing: '2px',
                    marginBottom: '10px',
                  }}
                >
                  {step.phase}
                </p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--neon-cyan)', fontWeight: 600, marginBottom: '12px' }}>
                  <i className="fa-solid fa-location-crosshairs" style={{ marginRight: '6px' }} />
                  {step.location}
                </p>
                <p style={{ fontSize: '15px', color: '#e4e4e7', lineHeight: 1.55 }}>{step.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SLIDE 8 — ORÇAMENTO DA VIAGEM & SIMULADOR DE PLANOS (FUNDO: JASON & LUCIA COM MALETAS DE DINHEIRO) */}
      <section id="slide8" className="bg-slide-budget" style={{ flexDirection: 'column' }}>
        <div className="slide-container">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '920px', margin: '0 auto 32px auto' }}>
            <p className="gta-marker" style={{ color: 'var(--neon-yellow)', fontSize: '24px', marginBottom: '6px' }}>
              Cada Um Escolhe Seu Nível na Missão
            </p>
            <h2
              className="gta-title"
              style={{
                fontSize: 'clamp(46px, 7.5vw, 86px)',
                color: '#fff',
                lineHeight: 0.95,
                textShadow: '0 4px 25px rgba(0,0,0,0.95)',
              }}
            >
              ORÇAMENTO & <span className="neon-text-cyan">PLANOS FLEXÍVEIS</span>
            </h2>
            <p style={{ fontSize: '17px', color: '#f4f4f5', marginTop: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
              O custo base une <strong>Passagem Aérea (~R$ 2.800)</strong> +{' '}
              <strong>Estadia 10 dias dividida em grupo (~R$ 3.200) = R$ 6.000</strong>. A partir daí, você escolhe se
              vai na F1, no jogo do Messi ou nos dois!
            </p>
          </div>

          {/* 4 CARDS DE PLANOS DE ORÇAMENTO */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '28px',
            }}
          >
            {budgetData.plans.map((plan) => (
              <div
                key={plan.id}
                className={`glass-card neon-border-${plan.accent} reveal`}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px' }}
              >
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: `1px solid var(--neon-${plan.accent})`,
                      color: `var(--neon-${plan.accent})`,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      marginBottom: '10px',
                    }}
                  >
                    {plan.badge}
                  </span>

                  <h3 style={{ fontSize: '21px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>{plan.name}</h3>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plan.includes.map((item) => (
                      <li key={item} style={{ fontSize: '13.5px', color: '#e4e4e7', display: 'flex', gap: '8px' }}>
                        <i className="fa-solid fa-check" style={{ color: 'var(--neon-cyan)', marginTop: '3px' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#a1a1aa' }}>Custo da Viagem + Eventos:</p>
                  <p className="gta-title" style={{ fontSize: '38px', color: 'var(--neon-yellow)', lineHeight: 1.05 }}>
                    {plan.base_price_brl}
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--neon-cyan)', fontWeight: 700, marginTop: '4px' }}>
                    <i className="fa-solid fa-bag-shopping" style={{ marginRight: '6px' }} />
                    {plan.with_shopping_brl}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* SIMULADOR INTERATIVO DE ORÇAMENTO */}
          <div
            className="glass-card reveal"
            style={{
              background: 'rgba(12, 4, 24, 0.9)',
              border: '1.5px solid var(--neon-yellow)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              padding: '24px 28px',
            }}
          >
            <div style={{ flex: '1 1 520px' }}>
              <h3 className="gta-title" style={{ fontSize: '28px', color: 'var(--neon-yellow)', marginBottom: '6px' }}>
                <i className="fa-solid fa-calculator" style={{ marginRight: '10px' }} />
                SIMULADOR RÁPIDO: MONTE SEU COMBO PERSONALIZADO
              </h3>
              <p style={{ fontSize: '14px', color: '#d4d4d8', marginBottom: '16px' }}>
                Marque ou desmarque os itens abaixo para ver quanto fica o seu plano individual:
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  🔒 Base (Voo + Estadia 10d): <strong>R$ 6.000</strong>
                </div>

                <label
                  style={{
                    background: simIncludeMessi ? 'rgba(255, 42, 133, 0.22)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${simIncludeMessi ? 'var(--neon-pink)' : 'rgba(255,255,255,0.2)'}`,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={simIncludeMessi}
                    onChange={(e) => setSimIncludeMessi(e.target.checked)}
                    style={{ accentColor: 'var(--neon-pink)' }}
                  />
                  ⚽ Jogo do Messi (+R$ 950)
                </label>

                <label
                  style={{
                    background: simIncludeF1 ? 'rgba(13, 240, 227, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${simIncludeF1 ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.2)'}`,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={simIncludeF1}
                    onChange={(e) => setSimIncludeF1(e.target.checked)}
                    style={{ accentColor: 'var(--neon-cyan)' }}
                  />
                  🏎️ Fórmula 1 GP (+R$ 2.400)
                </label>

                <label
                  style={{
                    background: simIncludeShopping ? 'rgba(255, 209, 102, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${simIncludeShopping ? 'var(--neon-yellow)' : 'rgba(255,255,255,0.2)'}`,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={simIncludeShopping}
                    onChange={(e) => setSimIncludeShopping(e.target.checked)}
                    style={{ accentColor: 'var(--neon-yellow)' }}
                  />
                  🛍️ Média Compras Outlets (+R$ 3.000)
                </label>
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
                background: 'rgba(255, 209, 102, 0.12)',
                border: '1px solid var(--neon-yellow)',
                padding: '16px 24px',
                borderRadius: '14px',
                minWidth: '240px',
              }}
            >
              <p style={{ fontSize: '12px', color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Sua Estimativa Total
              </p>
              <p className="gta-title" style={{ fontSize: '48px', color: 'var(--neon-yellow)', lineHeight: 1 }}>
                R$ {simulatedTotal.toLocaleString('pt-BR')}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginTop: '4px', fontWeight: 700 }}>
                ≈ R$ {Math.round(simulatedTotal / 12).toLocaleString('pt-BR')} / mês em 12 meses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE 9 — QUEM VAMOS? + CONFIRMAÇÃO POR E-MAIL */}
      <section
        id="slide9"
        className="bg-slide-hero"
        style={{ flexDirection: 'column', textAlign: 'center', borderTop: '2px solid rgba(255,42,133,0.4)' }}
      >
        <div className="reveal" style={{ maxWidth: '900px', marginBottom: '40px' }}>
          <h2 className="gta-title neon-text-pink" style={{ fontSize: 'clamp(56px, 9vw, 110px)', lineHeight: 0.95 }}>
            QUEM TÁ DENTRO?
          </h2>
          <p style={{ fontSize: '20px', color: '#fafafa', marginTop: '14px', fontWeight: 600 }}>
            Clique no seu nome na lista de convocados ou preencha seu e-mail abaixo para entrar na lista e receber o <strong>Dossiê Completo Miami 2027</strong>
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            width: '100%',
            maxWidth: '1320px',
            textAlign: 'left',
            zIndex: 2,
          }}
        >
          {/* CARD 1: FORMULÁRIO DE CONFIRMAÇÃO COM E-MAIL */}
          <div
            className="glass-card"
            style={{
              borderTop: '6px solid var(--neon-cyan)',
              background: 'rgba(14, 6, 26, 0.88)',
            }}
          >
            <h3 className="gta-title" style={{ fontSize: '34px', color: 'var(--neon-cyan)', marginBottom: '8px' }}>
              <i className="fa-solid fa-envelope-circle-check" style={{ marginRight: '10px' }} />
              CONFIRMAR E RECEBER DOSSIÊ
            </h3>
            <p style={{ fontSize: '14px', color: '#d4d4d8', marginBottom: '20px', lineHeight: 1.5 }}>
              Ao confirmar, seu nome sai de "Os Convocados", entra em "Tá Dentro" e enviamos o dossiê com voos,
              Airbnb, hotéis, orçamento e roteiro para o seu e-mail.
            </p>

            <form onSubmit={handleConfirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label
                  style={{ fontSize: '13px', fontWeight: 800, color: '#e4e4e7', display: 'block', marginBottom: '6px' }}
                >
                  SEU NOME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Guilherme Nannini"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="gta-input"
                />
              </div>

              <div>
                <label
                  style={{ fontSize: '13px', fontWeight: 800, color: '#e4e4e7', display: 'block', marginBottom: '6px' }}
                >
                  SEU MELHOR E-MAIL *
                </label>
                <input
                  type="email"
                  required
                  placeholder="voce@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="gta-input"
                />
              </div>

              <div>
                <label
                  style={{ fontSize: '13px', fontWeight: 800, color: '#e4e4e7', display: 'block', marginBottom: '6px' }}
                >
                  QUAL PLANO DE ORÇAMENTO MAIS TE ATRAI?
                </label>
                <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)} className="gta-input">
                  <option value="Combo Completo: F1 + Messi + Vice City">
                    Plano 4 — Combo Completo (F1 + Messi + Vice City)
                  </option>
                  <option value="Camisa 10: Base + Jogo do Messi">
                    Plano 2 — Camisa 10 (Base + Jogo do Messi)
                  </option>
                  <option value="Velocidade Máxima: Base + GP de F1">
                    Plano 3 — Velocidade Máxima (Base + GP de F1)
                  </option>
                  <option value="Turista Vice City: Base + Praia & Passeios">
                    Plano 1 — Turista Vice City (Base + Praia & Passeios)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="gta-btn-primary"
                style={{ width: '100%', marginTop: '8px', fontSize: '24px', padding: '14px' }}
              >
                {isSubmitting ? 'ENVIANDO DOSSIÊ...' : '🔥 TÔ DENTRO! ME MANDA O MATERIAL'}
              </button>
            </form>

            {feedback && feedback.type === 'success' && (
              <div className="mission-passed-banner">
                <p
                  className="gta-title"
                  style={{ fontSize: '34px', color: 'var(--neon-yellow)', letterSpacing: '2px', lineHeight: 1 }}
                >
                  MISSION PASSED!
                </p>
                <p className="gta-title" style={{ fontSize: '22px', color: '#fff', marginBottom: '8px' }}>
                  RESPECT + • {feedback.participantName} TÁ DENTRO!
                </p>
                <p style={{ fontSize: '13.5px', color: '#e4e4e7', lineHeight: 1.45 }}>{feedback.emailMsg}</p>
              </div>
            )}

            {feedback && feedback.type === 'error' && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  fontSize: '14px',
                }}
              >
                {feedback.message}
              </div>
            )}

            <div style={{ marginTop: '18px', textAlign: 'center' }}>
              <a
                href={`${API_BASE}/api/dossier/download?name=${encodeURIComponent(nameInput || 'Agente Vice City')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--neon-cyan)',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                <i className="fa-solid fa-file-pdf" style={{ marginRight: '6px' }} />
                Ou clique aqui para abrir/baixar o Dossiê Completo agora mesmo
              </a>
            </div>
          </div>

          {/* CARD 2: LISTA TÁ DENTRO (CONFIRMADOS) */}
          <div
            className="glass-card"
            style={{
              borderTop: '6px solid var(--neon-cyan)',
              background: 'rgba(10, 4, 20, 0.85)',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}
            >
              <h3 className="gta-title" style={{ fontSize: '34px', color: '#fff', letterSpacing: '1.5px' }}>
                TÁ DENTRO (CONFIRMADOS)
              </h3>
              <span
                style={{
                  background: 'var(--neon-cyan)',
                  color: '#140824',
                  fontWeight: 900,
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '16px',
                }}
              >
                {participants.confirmed.length}
              </span>
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {participants.confirmed.map((person) => (
                <li
                  key={person.id || person.name}
                  style={{
                    background: 'rgba(13, 240, 227, 0.1)',
                    border: '1px solid rgba(13, 240, 227, 0.35)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neon-cyan)' }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }} />
                      {person.name}
                    </p>
                    <p style={{ fontSize: '13px', color: '#d4d4d8', marginTop: '2px' }}>
                      {person.role_style || 'Vice City VIP'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="gta-title"
                      style={{
                        fontSize: '16px',
                        color: 'var(--neon-yellow)',
                        letterSpacing: '1px',
                      }}
                    >
                      CONFIRMADO
                    </span>
                    {person.id && person.id !== 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(person.id)}
                        title="Remover da lista"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255,255,255,0.4)',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CARD 3: LISTA OS CONVOCADOS */}
          <div
            className="glass-card"
            style={{
              borderTop: '6px solid var(--neon-pink)',
              background: 'rgba(10, 4, 20, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}
              >
                <h3 className="gta-title" style={{ fontSize: '34px', color: '#fff', letterSpacing: '1.5px' }}>
                  OS CONVOCADOS (FALTAM CONFIRMAR)
                </h3>
                <span
                  style={{
                    background: 'var(--neon-pink)',
                    color: '#fff',
                    fontWeight: 900,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '16px',
                  }}
                >
                  {participants.invited.length}
                </span>
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {participants.invited.map((person) => (
                  <li
                    key={person.id || person.name}
                    onClick={() => setNameInput(person.name)}
                    title="Clique para preencher seu nome no formulário ao lado!"
                    style={{
                      background: 'rgba(255, 42, 133, 0.08)',
                      border: '1px solid rgba(255, 42, 133, 0.28)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--neon-pink)' }}>{person.name}</p>
                      <p style={{ fontSize: '12px', color: '#a1a1aa' }}>{person.role_style}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#e4e4e7', textDecoration: 'underline' }}>
                      Confirmar ➔
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleAddInvite} style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Convocar mais um amigo..."
                value={newInviteName}
                onChange={(e) => setNewInviteName(e.target.value)}
                className="gta-input"
                style={{ padding: '10px 14px', fontSize: '14px' }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--neon-pink)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
