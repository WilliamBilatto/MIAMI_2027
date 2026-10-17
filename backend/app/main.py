"""Ponto de entrada da API FastAPI para o projeto Miami 2027 - Vice City Edition.
Expõe rotas para consulta do levantamento real da viagem, lista de participantes,
confirmação de presença com envio de e-mail e download do dossiê completo."""

from __future__ import annotations

from contextlib import asynccontextmanager
import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from app.database import (
    add_invited_friend,
    init_db,
    list_all_participants,
    remove_participant_by_id,
    upsert_confirmed_participant,
)
from app.domain import (
    categorize_participants,
    generate_dossier_html,
    get_real_trip_data,
    validate_confirmation_payload,
)
from app.mailer import dispatch_dossier_email


load_dotenv()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """[System]
    Gerencia o ciclo de vida da API, inicializando o banco de dados na subida.

    args:
        _app: Instância do aplicativo FastAPI associada ao ciclo de vida.

    why:
        Garantir a criação da tabela e dados iniciais no SQLite sem recorrer ao on_event depreciado.

    example:
        app = FastAPI(lifespan=lifespan)
    """
    init_db()
    yield


app = FastAPI(
    title="Miami 2027 - Vice City Edition API",
    description="Backend para gestão de confirmados, dados reais de viagem e envio do Dossiê Miami 2027.",
    version="1.0.0",
    lifespan=lifespan,
)

raw_origins = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConfirmRequest(BaseModel):
    """[Data]
    Modelo de entrada para confirmação de presença na viagem Miami 2027.

    args:
        name: Nome ou apelido do amigo.
        email: E-mail para recebimento do dossiê.
        role_style: Perfil escolhido para a missão em Vice City.

    why:
        Validar estruturalmente o payload JSON enviado pelo formulário do Frontend.

    example:
        payload = ConfirmRequest(name="Will", email="will@email.com", role_style="Piloto F1")
    """

    name: str
    email: str
    role_style: str = "Vice City VIP"


class InviteRequest(BaseModel):
    """[Data]
    Modelo de entrada para adicionar um amigo na lista de convocados.

    args:
        name: Nome do amigo convocado.
        role_style: Apelido ou estilo na viagem.

    why:
        Permitir adicionar novos amigos na coluna 'Os Convocados' pela interface.

    example:
        invite = InviteRequest(name="Gabriel", role_style="Rei de South Beach")
    """

    name: str
    role_style: str = "Convocado Vice City"


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    """[System]
    Retorna o estado de saúde da API e o modo de envio de e-mail configurado.

    args:
        Nenhum argumento requerido.

    why:
        Facilitar o diagnóstico local e o monitoramento em serviços de deploy gratuito.

    example:
        status = health_check()
    """
    has_smtp = bool(os.getenv("SMTP_USER")) and "seu_email" not in os.getenv("SMTP_USER", "")
    has_resend = bool(os.getenv("RESEND_API_KEY"))
    email_mode = "resend" if has_resend else ("smtp" if has_smtp else "local_preview")
    return {
        "status": "ok",
        "project": "MIAMI_2027 - Vice City Edition",
        "email_mode": email_mode,
    }


@app.get("/api/trip-data")
def read_trip_data() -> dict[str, Any]:
    """[Data]
    Retorna os dados reais de voos, hospedagens, lugares e roteiro de Miami 2027.

    args:
        Nenhum argumento requerido.

    why:
        Abastecer o Frontend React com dados reais estruturados a partir do Backend.

    example:
        data = read_trip_data()
    """
    return get_real_trip_data()


@app.get("/api/participants")
def read_participants() -> dict[str, Any]:
    """[Business]
    Lista todos os participantes divididos entre confirmados ('Tá Dentro') e convocados.

    args:
        Nenhum argumento requerido.

    why:
        Sincronizar em tempo real o painel de presença no slide final do site.

    example:
        data = read_participants()
    """
    rows = list_all_participants()
    return categorize_participants(rows)


@app.post("/api/participants/confirm")
def confirm_participant(payload: ConfirmRequest) -> dict[str, Any]:
    """[Business]
    Confirma um participante na lista 'Tá Dentro' e dispara o Dossiê Miami 2027 por e-mail.

    args:
        payload: Objeto ConfirmRequest contendo nome, e-mail e perfil na viagem.

    why:
        Executar a ação principal de conversão do site quando o amigo confirma presença.

    example:
        res = confirm_participant(ConfirmRequest(name="Leo", email="leo@email.com"))
    """
    try:
        clean = validate_confirmation_payload(payload.name, payload.email, payload.role_style)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    saved_participant = upsert_confirmed_participant(
        name=clean["name"],
        email=clean["email"],
        role_style=clean["role_style"],
    )

    all_rows = list_all_participants()
    categorized = categorize_participants(all_rows)
    confirmed_names = [item["name"] for item in categorized["confirmed"]]

    dossier_html = generate_dossier_html(clean["name"], confirmed_names)
    email_status = dispatch_dossier_email(clean["name"], clean["email"], dossier_html)

    return {
        "participant": saved_participant,
        "participants": categorized,
        "email_dispatch": email_status,
    }


@app.post("/api/participants/invite")
def invite_participant(payload: InviteRequest) -> dict[str, Any]:
    """[Business]
    Adiciona um novo amigo à lista 'Os Convocados' e retorna a lista atualizada.

    args:
        payload: Objeto InviteRequest com nome e estilo do convidado.

    why:
        Permitir que o grupo adicione novos amigos convocados diretamente pelo site.

    example:
        res = invite_participant(InviteRequest(name="Rafa"))
    """
    try:
        invited = add_invited_friend(payload.name, payload.role_style)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    all_rows = list_all_participants()
    return {
        "invited": invited,
        "participants": categorize_participants(all_rows),
    }


@app.delete("/api/participants/{participant_id}")
def delete_participant(participant_id: int) -> dict[str, Any]:
    """[Business]
    Remove um participante pelo ID e retorna a lista atualizada.

    args:
        participant_id: Identificador numérico do participante.

    why:
        Permitir excluir entradas de teste ou nomes incorretos diretamente pela interface.

    example:
        res = delete_participant(6)
    """
    remove_participant_by_id(participant_id)
    all_rows = list_all_participants()
    return {
        "participants": categorize_participants(all_rows),
    }


@app.get("/api/dossier/download", response_class=HTMLResponse)
def download_dossier(name: str = "Agente Vice City") -> HTMLResponse:
    """[Business]
    Retorna o Dossiê Oficial Miami 2027 em HTML pronto para visualização ou impressão em PDF.

    args:
        name: Nome opcional do participante para personalizar o cabeçalho do dossiê.

    why:
        Permitir que qualquer convidado visualize ou baixe o material imediatamente pelo site.

    example:
        response = download_dossier("Will")
    """
    rows = list_all_participants()
    categorized = categorize_participants(rows)
    confirmed_names = [item["name"] for item in categorized["confirmed"]]
    html = generate_dossier_html(name, confirmed_names)
    return HTMLResponse(content=html, status_code=200)

