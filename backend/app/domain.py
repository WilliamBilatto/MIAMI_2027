"""Módulo de regras de negócio puras e dados estruturados do projeto Miami 2027.
Contém validações, planos de orçamento, dados reais pesquisados de voos,
hospedagens e passeios, além do gerador do dossiê HTML para envio por e-mail."""

from __future__ import annotations

import re
from typing import Any


EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_confirmation_payload(name: str, email: str, role_style: str = "Vice City VIP") -> dict[str, str]:
    """[Data]
    Valida e normaliza os dados de confirmação de presença enviados pelo usuário.

    args:
        name: Nome ou apelido do participante.
        email: Endereço de e-mail para recebimento do dossiê.
        role_style: Estilo ou perfil escolhido pelo participante na viagem.

    why:
        Garantir que apenas nomes e e-mails válidos sejam salvos e recebam o material.

    example:
        clean = validate_confirmation_payload("Will", "will@email.com", "Piloto F1")
    """
    clean_name = (name or "").strip()
    clean_email = (email or "").strip().lower()
    clean_style = (role_style or "Vice City VIP").strip()

    if len(clean_name) < 2:
        raise ValueError("Informe um nome ou apelido com pelo menos 2 caracteres.")

    if not EMAIL_REGEX.match(clean_email):
        raise ValueError("Informe um endereço de e-mail válido.")

    return {
        "name": clean_name,
        "email": clean_email,
        "role_style": clean_style,
    }


def categorize_participants(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """[Business]
    Separa a lista de participantes entre confirmados ('Tá Dentro') e convocados.

    args:
        rows: Lista de dicionários vindos do banco de dados de participantes.

    why:
        Alimentar o slide final da apresentação com contadores e listas atualizadas.

    example:
        grouped = categorize_participants([{"name": "Will", "status": "confirmed"}])
    """
    confirmed = [row for row in rows if row.get("status") == "confirmed"]
    invited = [row for row in rows if row.get("status") != "confirmed"]

    wanted_stars = min(5, max(1, len(confirmed)))

    return {
        "confirmed": confirmed,
        "invited": invited,
        "confirmed_count": len(confirmed),
        "invited_count": len(invited),
        "wanted_stars": wanted_stars,
    }


def get_real_trip_data() -> dict[str, Any]:
    """[Data]
    Retorna o levantamento real de voos, hotéis, Airbnbs, atrações, roteiro e orçamentos.

    args:
        Nenhum argumento requerido.

    why:
        Centralizar os dados reais pesquisados para consumo do frontend e do dossiê por e-mail.

    example:
        trip_data = get_real_trip_data()
    """
    return {
        "mission_title": "MIAMI 2027 — VICE CITY EDITION",
        "window": "Abril / Maio de 2027 (9 a 12 dias)",
        "flights": [
            {
                "airline": "LATAM Airlines",
                "route": "São Paulo (GRU) ➔ Miami (MIA)",
                "type": "Voo Direto (~8h20)",
                "price_range_brl": "R$ 2.800 – R$ 4.100",
                "average_brl": 3200,
                "highlight": "Voos diários diretos noturnos e diurnos; sem fila de conexão e imigração direto em MIA.",
                "badge": "Mais Prático",
            },
            {
                "airline": "American Airlines",
                "route": "São Paulo (GRU) ➔ Miami (MIA)",
                "type": "Voo Direto (~8h25)",
                "price_range_brl": "R$ 3.000 – R$ 4.300",
                "average_brl": 3350,
                "highlight": "Hub principal da companhia em Miami, com ampla oferta de horários e aeronaves Boeing 777/787.",
                "badge": "Alta Frequência",
            },
            {
                "airline": "Copa Airlines / Avianca",
                "route": "São Paulo (GRU) ➔ MIA (1 conexão)",
                "type": "1 Conexão no Panamá (PTY) ou Bogotá (~11h30)",
                "price_range_brl": "R$ 2.450 – R$ 3.100",
                "average_brl": 2650,
                "highlight": "Campeã de preço na janela de maio comprando de 3 a 5 meses antes.",
                "badge": "Melhor Preço",
            },
            {
                "airline": "Azul Linhas Aéreas",
                "route": "Campinas (VCP) / Conexões ➔ Fort Lauderdale (FLL)",
                "type": "Direto de VCP (~8h30) ou 1 conexão",
                "price_range_brl": "R$ 2.600 – R$ 3.700",
                "average_brl": 2950,
                "highlight": "Desembarque no aeroporto FLL, literalmente ao lado do Chase Stadium (casa do Inter Miami/Messi).",
                "badge": "Colado no Messi",
            },
        ],
        "accommodations": [
            {
                "neighborhood": "Brickell (Manhattan do Sul)",
                "vibe": "Arranha-céus iluminados, Metromover gratuito, rooftops de luxo e vida noturna sofisticada.",
                "airbnb_options": "Condos inteiros no Icon Brickell ou W Residences (2 a 3 quartos com piscina gigante de borda infinita para a baía).",
                "airbnb_daily_usd": "US$ 180 – US$ 280 / noite (dividido pelo grupo)",
                "hotel_options": "Novotel Miami Brickell (4★ com rooftop), citizenM Miami Worldcenter e SLS Lux Brickell.",
                "hotel_daily_usd": "US$ 170 – US$ 310 / noite (quarto duplo)",
                "best_for": "Mobilidade sem carro, rooftops e estética Vice City moderna.",
                "tag": "TOP ESCOLHA GRUPO",
            },
            {
                "neighborhood": "South Beach (Ocean Drive & Art Déco)",
                "vibe": "Pé na areia, prédios Art Déco em neon, calçadão da Ocean Drive, praia cristalina e festas.",
                "airbnb_options": "Apart-hotéis e lofts licenciados próximos à Collins Ave, Española Way e Lincoln Road.",
                "airbnb_daily_usd": "US$ 190 – US$ 320 / noite",
                "hotel_options": "The Goodtime Hotel (do Pharrell Williams), Arlo South Beach, Moxy South Beach e 1 Hotel.",
                "hotel_daily_usd": "US$ 210 – US$ 360 / noite",
                "best_for": "Fazer praia e balada a pé como no clássico GTA Vice City.",
                "tag": "CLÁSSICO VICE CITY",
            },
            {
                "neighborhood": "Wynwood & Midtown",
                "vibe": "O bairro mais jovem e criativo de Miami: murais de grafite, cervejarias artesanais, speakeasies e lofts.",
                "airbnb_options": "Casas reformadas com piscina privativa ou lofts industriais amplos para 4 a 8 amigos.",
                "airbnb_daily_usd": "US$ 150 – US$ 250 / noite (excelente divisão por pessoa)",
                "hotel_options": "Arlo Wynwood (rooftop com piscina e DJ), Moxy Miami Wynwood e Hampton Inn Midtown.",
                "hotel_daily_usd": "US$ 180 – US$ 290 / noite",
                "best_for": "Melhor custo-benefício em casa inteira no Airbnb e bares descolados.",
                "tag": "MELHOR CUSTO/GRUPO",
            },
        ],
        "places": [
            {
                "category": "Baladas de Miami",
                "icon": "fa-martini-glass-citrus",
                "accent": "pink",
                "image": "/assets/gta_club_miami.png",
                "spots": [
                    {
                        "name": "E11EVEN Miami & LIV (Fontainebleau)",
                        "desc": "As duas superbaladas mais lendárias dos EUA: shows internacionais, lasers e festa sem hora pra acabar.",
                    },
                    {
                        "name": "Sugar (40º andar do EAST Miami - Brickell)",
                        "desc": "O rooftop mais disputado de Miami, jardim asiático com vista 360º dos arranha-céus iluminados.",
                    },
                    {
                        "name": "Rosa Sky & Space Miami",
                        "desc": "De drinks panorâmicos sob luz neon ao nascer do sol no lendário terraço do Club Space.",
                    },
                ],
            },
            {
                "category": "Miami Beach",
                "icon": "fa-umbrella-beach",
                "accent": "cyan",
                "image": "/assets/gta_miami_beach.png",
                "spots": [
                    {
                        "name": "Ocean Drive & Lummus Park",
                        "desc": "O cenário real de Vice City: postos salva-vidas Art Déco coloridos, coqueiros e mar azul-turquesa.",
                    },
                    {
                        "name": "South Pointe Park & Pier",
                        "desc": "Pôr do sol cinematográfico no extremo sul da ilha vendo os megacruzeiros partirem.",
                    },
                    {
                        "name": "Joe’s Stone Crab & Lincoln Road",
                        "desc": "Gastronomia histórica desde 1913 e caminhada de fim de tarde pelo calçadão de South Beach.",
                    },
                ],
            },
            {
                "category": "Wynwood",
                "icon": "fa-spray-can-sparkles",
                "accent": "orange",
                "image": "/assets/gta_wynwood.png",
                "spots": [
                    {
                        "name": "Wynwood Walls & Street Art District",
                        "desc": "Galeria mundial de grafites gigantes a céu aberto, galerias conceito e carros clássicos nas ruas.",
                    },
                    {
                        "name": "Coyo Taco & Astra Rooftop",
                        "desc": "Tacos mexicanos com bar speakeasy secreto nos fundos e pôr do sol no terraço grego Astra.",
                    },
                    {
                        "name": "Gramps & Cervejarias Artesanais",
                        "desc": "Bares alternativos com música ao vivo, DJs, fliperamas e a melhor atmosfera jovem da cidade.",
                    },
                ],
            },
            {
                "category": "Fort Lauderdale",
                "icon": "fa-water",
                "accent": "cyan",
                "image": "/assets/gta_fort_lauderdale.png",
                "spots": [
                    {
                        "name": "Canais de Las Olas ('Veneza da América')",
                        "desc": "Passeio de Water Taxi passando pelas mansões bilionárias e superiates ancorados nos canais.",
                    },
                    {
                        "name": "Chase Stadium (Casa do Inter Miami / Messi)",
                        "desc": "O palco onde o camisa 10 joga em casa — clima de tailgate americano e festa rosa e preta.",
                    },
                    {
                        "name": "Sawgrass Mills (Maior Outlet da Flórida)",
                        "desc": "A 15 minutos de Fort Lauderdale: mais de 350 lojas (Nike, Adidas, Apple, Prada, North Face) com descontos brutais.",
                    },
                ],
            },
        ],
        "itinerary": [
            {
                "phase": "DIAS 1 A 4 — FIM DE SEMANA 1",
                "title": "Fórmula 1 Miami Grand Prix",
                "location": "Hard Rock Stadium (Miami Gardens) + Fan Zone Wynwood",
                "details": "Chegada na quinta/sexta, treinos livres, Sprint Race no sábado, Grande Prêmio no domingo (30 Abr – 02 Mai) e after-parties oficiais da F1 em Wynwood e Brickell.",
                "accent": "cyan",
            },
            {
                "phase": "DIAS 5 A 8 — MEIO DA SEMANA",
                "title": "Vice City Lifestyle & Compras",
                "location": "Miami Beach, Brickell, Wynwood & Fort Lauderdale",
                "details": "Praia em South Beach, pôr do sol no South Pointe Pier, tarde em Wynwood Walls + Coyo Taco, noite nas baladas/rooftops e dia de compras pesadas no Sawgrass Mills.",
                "accent": "pink",
            },
            {
                "phase": "DIAS 9 A 11 — FIM DE SEMANA 2",
                "title": "Matchday: O Efeito Messi",
                "location": "Chase Stadium (Fort Lauderdale) / Miami Freedom Park",
                "details": "Pré-jogo estilo tailgate americano, camisa rosa do Inter Miami e assistir Lionel Messi ao vivo na Sprint Season da MLS.",
                "accent": "orange",
            },
        ],
        "budget": {
            "base_breakdown": {
                "flight_avg_brl": 2800,
                "stay_share_brl": 3200,
                "base_total_brl": 6000,
                "shopping_avg_brl": 3000,
                "messi_ticket_brl": 950,
                "f1_ticket_brl": 2400,
            },
            "plans": [
                {
                    "id": "plan_base",
                    "name": "Plano 1 — Turista Vice City (Base)",
                    "badge": "Mais Econômico",
                    "accent": "cyan",
                    "includes": [
                        "Passagem Aérea Ida e Volta (~R$ 2.800)",
                        "Estadia 10 dias dividida em Casa/Condo Airbnb (~R$ 3.200)",
                        "Praias de Miami Beach, Wynwood, Fan Fest gratuita e Passeios",
                    ],
                    "excludes": "Sem ingressos pagos de F1 ou Jogo do Messi",
                    "base_price_brl": "R$ 6.000",
                    "with_shopping_brl": "R$ 9.000 (c/ R$ 3k de compras)",
                },
                {
                    "id": "plan_messi",
                    "name": "Plano 2 — Camisa 10 (Base + Jogo do Messi)",
                    "badge": "Foco Futebol",
                    "accent": "pink",
                    "includes": [
                        "Passagem + Estadia 10 dias (R$ 6.000)",
                        "Ingresso Inter Miami no Chase Stadium (~R$ 950)",
                        "Praias, Wynwood, Fort Lauderdale e Vida Noturna",
                    ],
                    "excludes": "Sem ingresso do autódromo da F1",
                    "base_price_brl": "R$ 6.950",
                    "with_shopping_brl": "R$ 9.950 (c/ R$ 3k de compras)",
                },
                {
                    "id": "plan_f1",
                    "name": "Plano 3 — Velocidade Máxima (Base + Fórmula 1)",
                    "badge": "Foco Motor",
                    "accent": "orange",
                    "includes": [
                        "Passagem + Estadia 10 dias (R$ 6.000)",
                        "Ingresso F1 Miami GP - Campus Pass / Arquibancada (~R$ 2.400)",
                        "Praias, Wynwood, Fort Lauderdale e Vida Noturna",
                    ],
                    "excludes": "Sem ingresso do jogo do Messi",
                    "base_price_brl": "R$ 8.400",
                    "with_shopping_brl": "R$ 11.400 (c/ R$ 3k de compras)",
                },
                {
                    "id": "plan_boss",
                    "name": "Plano 4 — Chefão de Vice City (Combo Completo)",
                    "badge": "Experiência 100%",
                    "accent": "cyan",
                    "includes": [
                        "Passagem + Estadia 10 dias (R$ 6.000)",
                        "Ingresso F1 Miami GP (~R$ 2.400)",
                        "Ingresso Jogo do Messi (~R$ 950)",
                    ],
                    "excludes": "Experiência completa nos 2 megaeventos!",
                    "base_price_brl": "R$ 9.350",
                    "with_shopping_brl": "R$ 12.350 (c/ R$ 3k de compras)",
                },
            ],
        },
    }


def generate_dossier_html(participant_name: str, confirmed_names: list[str]) -> str:
    """[Business]
    Gera o documento HTML completo do Dossiê Miami 2027 para envio por e-mail ou download.

    args:
        participant_name: Nome do participante que está recebendo o dossiê.
        confirmed_names: Lista de nomes já confirmados na missão.

    why:
        Fornecer um material visual rico com todos os custos, voos, hotéis e roteiro para os amigos.

    example:
        html = generate_dossier_html("Will", ["Will", "Guilherme Nannini"])
    """
    trip = get_real_trip_data()
    confirmed_badges = "".join(
        f'<span style="display:inline-block;background:#0df0e3;color:#1a0b2e;padding:6px 14px;'
        f'border-radius:20px;font-weight:800;margin:4px;">✓ {name}</span>'
        for name in confirmed_names
    )

    flights_rows = "".join(
        f"""
        <tr>
          <td style="padding:12px;border-bottom:1px solid #3a1c54;font-weight:700;color:#fff;">{f['airline']}</td>
          <td style="padding:12px;border-bottom:1px solid #3a1c54;color:#d4d4d8;">{f['type']}</td>
          <td style="padding:12px;border-bottom:1px solid #3a1c54;color:#0df0e3;font-weight:800;">{f['price_range_brl']}</td>
          <td style="padding:12px;border-bottom:1px solid #3a1c54;color:#a1a1aa;font-size:13px;">{f['highlight']}</td>
        </tr>
        """
        for f in trip["flights"]
    )

    stays_cards = "".join(
        f"""
        <div style="background:#261040;border-left:4px solid #ff2a85;border-radius:10px;padding:16px;margin-bottom:14px;">
          <h4 style="margin:0 0 6px 0;color:#0df0e3;font-size:18px;">{s['neighborhood']} — <span style="color:#ff2a85;font-size:13px;">{s['tag']}</span></h4>
          <p style="margin:4px 0;color:#e4e4e7;font-size:14px;"><strong>Airbnb:</strong> {s['airbnb_options']} ({s['airbnb_daily_usd']})</p>
          <p style="margin:4px 0;color:#e4e4e7;font-size:14px;"><strong>Hotéis:</strong> {s['hotel_options']} ({s['hotel_daily_usd']})</p>
          <p style="margin:6px 0 0 0;color:#a1a1aa;font-size:13px;"><em>Ideal para: {s['best_for']}</em></p>
        </div>
        """
        for s in trip["accommodations"]
    )

    budget_cards = "".join(
        f"""
        <div style="background:#220e38;border-left:4px solid #0df0e3;border-radius:10px;padding:16px;margin-bottom:12px;">
          <h4 style="margin:0 0 6px 0;color:#fff;font-size:17px;">{p['name']} <span style="color:#ff2a85;font-size:13px;">({p['badge']})</span></h4>
          <p style="margin:4px 0;color:#0df0e3;font-weight:800;font-size:18px;">Sem compras: {p['base_price_brl']} | Com média de compras: {p['with_shopping_brl']}</p>
          <p style="margin:4px 0;color:#d4d4d8;font-size:13px;">{" • ".join(p['includes'])}</p>
        </div>
        """
        for p in trip["budget"]["plans"]
    )

    places_html = ""
    for group in trip["places"]:
        items_li = "".join(
            f'<li style="margin-bottom:6px;"><strong style="color:#fff;">{spot["name"]}:</strong> '
            f'<span style="color:#d4d4d8;">{spot["desc"]}</span></li>'
            for spot in group["spots"]
        )
        places_html += f"""
        <div style="background:#220e38;border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.1);">
          <h4 style="margin:0 0 10px 0;color:#ff2a85;font-size:17px;">{group['category']}</h4>
          <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.5;">{items_li}</ul>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dossiê Oficial — Miami 2027 (Vice City Edition)</title>
</head>
<body style="margin:0;padding:24px;background-color:#130722;color:#fafafa;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:800px;margin:0 auto;background:linear-gradient(145deg,#1a0b2e 0%,#2d0f3a 100%);border:2px solid #ff2a85;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.8);">
    <div style="padding:36px 28px;text-align:center;background:linear-gradient(90deg,#ff2a85 0%,#7928ca 50%,#0df0e3 100%);">
      <p style="margin:0;font-size:14px;letter-spacing:3px;text-transform:uppercase;font-weight:800;color:#130722;">MISSÃO CONFIRMADA • RESPECT +100</p>
      <h1 style="margin:8px 0;font-size:44px;color:#fff;text-shadow:3px 3px 0 #130722;letter-spacing:2px;">MIAMI 2027 — VICE CITY</h1>
      <p style="margin:0;font-size:16px;color:#fff;font-weight:600;">MESSI • FÓRMULA 1 • VICE CITY LIFESTYLE</p>
    </div>

    <div style="padding:32px 28px;">
      <h2 style="margin-top:0;color:#0df0e3;font-size:24px;">Bem-vindo ao Esquadrão, {participant_name}!</h2>
      <p style="color:#d4d4d8;font-size:16px;line-height:1.6;">
        Sua presença foi registrada oficialmente na lista <strong>TÁ DENTRO</strong> da nossa viagem para Miami em <strong>Maio de 2027</strong>.
        Abaixo está o dossiê completo com o levantamento real de passagens, hospedagens (Airbnb e Hotéis), planos de orçamento e o roteiro da viagem.
      </p>

      <div style="margin:24px 0;padding:18px;background:rgba(13,240,227,0.08);border:1px solid #0df0e3;border-radius:12px;">
        <h3 style="margin:0 0 10px 0;color:#fff;font-size:16px;text-transform:uppercase;letter-spacing:1px;">Confirmados no Esquadrão até agora:</h3>
        <div>{confirmed_badges}</div>
      </div>

      <h3 style="color:#ff2a85;font-size:22px;border-bottom:1px solid #3a1c54;padding-bottom:8px;">1. Levantamento Real de Voos (GRU ➔ MIA em Maio)</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
        <thead>
          <tr style="background:#261040;color:#0df0e3;text-align:left;">
            <th style="padding:10px;">Companhia</th>
            <th style="padding:10px;">Voo</th>
            <th style="padding:10px;">Média (Ida e Volta)</th>
            <th style="padding:10px;">Destaque</th>
          </tr>
        </thead>
        <tbody>
          {flights_rows}
        </tbody>
      </table>

      <h3 style="color:#0df0e3;font-size:22px;border-bottom:1px solid #3a1c54;padding-bottom:8px;">2. Onde Ficar: Melhores Regiões (Airbnb vs. Hotéis)</h3>
      {stays_cards}

      <h3 style="color:#ffd166;font-size:22px;border-bottom:1px solid #3a1c54;padding-bottom:8px;margin-top:28px;">3. Opções de Orçamento por Perfil</h3>
      {budget_cards}

      <h3 style="color:#ff7e5f;font-size:22px;border-bottom:1px solid #3a1c54;padding-bottom:8px;margin-top:28px;">4. Lugares Reais do Roteiro (Miami, Wynwood & Fort Lauderdale)</h3>
      {places_html}

      <div style="margin-top:32px;padding:20px;background:#130722;border-radius:12px;text-align:center;border:1px solid rgba(255,42,133,0.4);">
        <p style="margin:0;color:#0df0e3;font-weight:800;font-size:18px;">PRÓXIMO PASSO DO GRUPO</p>
        <p style="margin:8px 0 0 0;color:#a1a1aa;font-size:14px;">
          Monitoramento de passagens abre entre Novembro/2026 e Janeiro/2027 (janela ideal de 4 a 5 meses antes do GP de Miami).
        </p>
      </div>
    </div>
  </div>
</body>
</html>"""
