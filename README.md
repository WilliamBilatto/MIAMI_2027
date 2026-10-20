# MIAMI_2027 — Vice City Edition

> Aplicação web full-stack interativa (React + FastAPI + SQLite) com estética GTA VI / Vice City para planejar a viagem de amigos a Miami em Maio de 2027 (Fórmula 1 GP + Lionel Messi no Inter Miami), com áudio contínuo, levantamento real de voos/hospedagens e envio automático de dossiê por e-mail.

*Nota de origem: Projeto graduado e tornado independente a partir de `personal_lab/experiments/EXP-004`.*

## Overview

Este projeto organiza a viagem do grupo de amigos com dados reais de passagens aéreas, opções reais de Airbnb e hotéis por bairro, roteiro autêntico em Miami e confirmação de presença ("Tá Dentro") integrada ao envio automático do Dossiê da Viagem por e-mail. A aplicação é dividida em **Frontend (`frontend/`)** e **Backend (`backend/`)**.

## Objectives

- Manter uma arquitetura desacoplada em Frontend (React + Vite) e Backend (FastAPI + SQLite).
- Garantir música tocando continuamente durante toda a navegação através de uma tela de abertura interativa estilo *GTA VI* combinada ao player *Vice City FM* (Web Audio Synthwave) e ao widget oficial do Spotify.
- Incorporar artes temáticas inspiradas em **GTA VI / Vice City** e fotos reais de Lionel Messi, Fórmula 1 e Miami.
- Disponibilizar opções reais de voos (`GRU -> MIA/FLL`), hospedagens (Airbnb e hotéis em Brickell, South Beach e Wynwood) e atrações específicas.
- Permitir que cada amigo confirme presença informando nome e e-mail no último slide, entrando na lista **"Tá Dentro"** e recebendo o dossiê completo por e-mail.

## Features

- **Tela Inicial GTA VI ("Entrar em Vice City"):** Desbloqueia o áudio contínuo no navegador logo no primeiro clique.
- **Rádio Vice City FM + Spotify:** Sintetizador Synthwave anos 80 contínuo com controle de volume, troca de estação (`FLASH FM 106.7` / `EMOTION 98.3`) e botão para abrir o embed do Spotify.
- **HUD GTA VI:** Contador de estrelas de *Hype Level* (sobe conforme mais amigos entram na lista) e botão rápido para baixar o Dossiê em HTML/PDF.
- **Abas Interativas de Logística Real:** Comparativo de voos (LATAM, American Airlines, Copa/Avianca, Azul) e hospedagens reais (Airbnb vs. Hotéis).
- **Sistema de Confirmação ("Quem Vamos?"):** Formulário conectado ao FastAPI que atualiza o banco SQLite em tempo real e dispara o e-mail HTML estilizado via SMTP (Gmail), Resend API ou fallback local em `backend/data/sent_emails/`.

## Architecture

A aplicação segue as convenções do `Will_agents`, isolando regras de negócio puras (`domain.py`) dos adaptadores com efeitos colaterais (`database.py` e `mailer.py`).

### Main Components

| Component | Responsibility |
|---|---|
| `frontend/src/App.jsx` | Interface React com slides interativos, abas de voos/hotéis e formulário de confirmação. |
| `frontend/src/components/RadioPlayer.jsx` | Motor de áudio Synthwave contínuo (Web Audio API) + integração com player Spotify. |
| `backend/app/main.py` | Rotas HTTP FastAPI, validação de entrada Pydantic, ciclo de vida (`lifespan`) e configuração de CORS. |
| `backend/app/domain.py` | Funções puras de validação, categorização da lista, dados reais de Miami e geração do Dossiê HTML. |
| `backend/app/database.py` | Persistência SQLite (`data/miami2027.sqlite`) para confirmados e convocados. |
| `backend/app/mailer.py` | Disparo de e-mail via SMTP (Gmail), Resend API e gravação de preview local em disco. |

### Data Flow

```text
[Formulário React (Slide Confirmação)]
            ↓ POST /api/participants/confirm
[Validação Pura (domain.py)]
            ↓
[Persistência SQLite (database.py)]
            ↓
[Geração Dossiê HTML (domain.py)]
            ↓
[Envio SMTP / Resend / Preview Local (mailer.py)]
            ↓
[Atualização da Lista "Tá Dentro" na UI]
```

## Technologies

| Category | Technology |
|---|---|
| Language | Python 3.10+ (Backend) / JavaScript ES2022+ (Frontend) |
| Framework | FastAPI + Uvicorn (Backend) / React 18 + Vite 5 (Frontend) |
| Database | SQLite (`sqlite3`) |
| Audio & Styling | Web Audio API, CSS3 Glassmorphism & Neon Variables, FontAwesome 6 |
| Infrastructure | Local / Vercel (Frontend) + Render (Backend) |
| Testing | `pytest` + `fastapi.testclient` |

## Project Structure

```text
MIAMI_2027/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── domain.py
│   │   ├── mailer.py
│   │   └── main.py
│   ├── data/
│   │   ├── miami2027.sqlite      # SQLite local (ignorado pelo Git)
│   │   └── sent_emails/          # Cópias locais de e-mails enviados
│   ├── tests/
│   │   └── test_backend.py
│   ├── render.yaml
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── assets/               # 15 artes e imagens temáticas
│   ├── src/
│   │   ├── components/
│   │   │   ├── GtaHud.jsx
│   │   │   ├── GtaIntroOverlay.jsx
│   │   │   └── RadioPlayer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
├── .env.example
├── .gitignore
├── README.md
└── start_local.ps1
```

## Requirements

- Python >= 3.10
- Node.js >= 18 e npm

## Como Rodar Localmente

### Opção Rápida (Script Automatizado)

Execute na raiz do projeto:

```powershell
.\start_local.ps1
```

O script inicializa o Backend na porta `8000` e o Frontend na porta `5173`.

### Opção Manual

#### 1. Iniciar o Backend (FastAPI)

```powershell
cd backend
pip install -r requirements.txt
Copy-Item ..\.env.example .env -Force
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Iniciar o Frontend (React + Vite)

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

---

## Tutorial: Configuração de Envio de E-mails Reais

Por padrão, mesmo sem configurar senhas de SMTP, o projeto salva uma cópia completa de todo e-mail gerado em `backend/data/sent_emails/`. Para que o e-mail chegue diretamente à caixa de entrada dos convidados, escolha **uma** das opções abaixo no arquivo `backend/.env`:

### Opção A — Usando conta do Gmail (SMTP Gratuito)

1. Acesse sua Conta Google em [https://myaccount.google.com/security](https://myaccount.google.com/security).
2. Verifique se a **Verificação em duas etapas (2FA)** está ativada.
3. Acesse a página de Senhas de App: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. No campo "Nome do app", digite `Miami 2027` e clique em **Criar**.
5. O Google gerará uma senha de aplicativo de 16 caracteres.
6. Configure em `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email_real@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME=Missão Miami 2027 - Vice City
```

### Opção B — Usando Resend API (Gratuito até 3.000 e-mails/mês)

1. Crie uma conta gratuita em [https://resend.com](https://resend.com).
2. Em **API Keys**, crie uma chave e copie o token `re_...`.
3. Configure em `backend/.env`:

```env
RESEND_API_KEY=re_sua_chave_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

## Guia de Hospedagem (Para Compartilhar com o Grupo)

### Opção 1 — Compartilhar direto da máquina local (Cloudflare Tunnel)

Para apresentar instantaneamente aos amigos sem provisionar serviços em nuvem:
1. Com a aplicação rodando localmente:
   ```powershell
   npx cloudflared tunnel --url http://localhost:5173
   ```
2. Um link público seguro `https://xxxx.trycloudflare.com` será exibido e redirecionará para o seu ambiente local.

### Opção 2 — Hospedagem 24/7 na Nuvem (Vercel + Render — Gratuito)

1. **Backend no Render (Free Tier):**
   - Crie um novo **Web Service** em [https://render.com](https://render.com) vinculado ao repositório GitHub.
   - Defina `Root Directory` como `backend`.
   - `Build Command`: `pip install -r requirements.txt`
   - `Start Command`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Configure as variáveis (`SMTP_USER`, `SMTP_PASSWORD`, etc.) na aba *Environment*.
2. **Frontend na Vercel (Free Tier):**
   - Importe o repositório em [https://vercel.com](https://vercel.com).
   - Defina `Root Directory` como `frontend`.
   - Configure a variável de ambiente `VITE_API_URL` com a URL pública fornecida pelo Render (ex: `https://miami-2027-backend.onrender.com`).

---

## API

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Retorna o status da API e qual modo de e-mail está ativo (`smtp`, `resend` ou `local_preview`). |
| `GET` | `/api/trip-data` | Retorna o levantamento real de voos, hotéis/Airbnb, lugares e roteiro. |
| `GET` | `/api/participants` | Lista os participantes em `confirmed` ("Tá Dentro") e `invited` ("Os Convocados"). |
| `POST` | `/api/participants/confirm` | Confirma o participante na lista "Tá Dentro" e despacha o Dossiê Miami 2027 por e-mail. |
| `POST` | `/api/participants/invite` | Adiciona um novo amigo à lista "Os Convocados". |
| `DELETE` | `/api/participants/{id}` | Remove um participante pelo ID numérico. |
| `GET` | `/api/dossier/download` | Retorna o Dossiê Oficial completo em HTML pronto para visualização ou exportação para PDF. |

### Exemplo de Requisição

```bash
curl -X POST http://localhost:8000/api/participants/confirm \
  -H "Content-Type: application/json" \
  -d '{"name": "Lucas", "email": "lucas@gmail.com", "role_style": "Piloto F1", "trip_plan": "Combo Completo: F1 + Messi + Vice City"}'
```

## Testing

Os testes automatizados em `backend/tests/test_backend.py` validam:
- Normalização e validação de nomes e e-mails (`validate_confirmation_payload`).
- Categorização da lista de confirmados/convocados e contagem de estrelas de Wanted (`categorize_participants`).
- Geração do Dossiê HTML com dados reais (`generate_dossier_html`).
- Fluxo de ponta a ponta dos endpoints FastAPI com banco SQLite isolado em diretório temporário (`test_api_endpoints_flow`).

Para executar os testes a partir da raiz do projeto:

```powershell
python -m pytest -v backend/tests
```
