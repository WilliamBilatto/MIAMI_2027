"""Testes automatizados para regras de negócio e endpoints FastAPI do projeto Miami 2027."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.domain import categorize_participants, generate_dossier_html, validate_confirmation_payload
from app.main import app


def test_validate_confirmation_payload_success() -> None:
    """[Business]
    Verifica se a validação normaliza nome e e-mail corretamente.

    args:
        Nenhum argumento requerido.

    why:
        Garantir que entradas válidas com espaços extras sejam limpas e aceitas.

    example:
        test_validate_confirmation_payload_success()
    """
    result = validate_confirmation_payload("  Will  ", "  WILL@Gmail.com ", "Piloto F1")
    assert result["name"] == "Will"
    assert result["email"] == "will@gmail.com"
    assert result["role_style"] == "Piloto F1"


def test_validate_confirmation_payload_invalid_email() -> None:
    """[Business]
    Verifica se e-mail inválido dispara ValueError.

    args:
        Nenhum argumento requerido.

    why:
        Impedir gravação de e-mails malformados na lista de confirmados.

    example:
        test_validate_confirmation_payload_invalid_email()
    """
    with pytest.raises(ValueError, match="e-mail válido"):
        validate_confirmation_payload("Will", "email-invalido")


def test_categorize_participants_and_dossier() -> None:
    """[Business]
    Testa a separação de participantes e a geração do HTML do dossiê.

    args:
        Nenhum argumento requerido.

    why:
        Confirmar o cálculo de estrelas Wanted e a presença de dados reais no dossiê.

    example:
        test_categorize_participants_and_dossier()
    """
    sample = [
        {"name": "Will", "status": "confirmed"},
        {"name": "Lucas", "status": "confirmed"},
        {"name": "Pedro", "status": "invited"},
    ]
    cat = categorize_participants(sample)
    assert cat["confirmed_count"] == 2
    assert cat["invited_count"] == 1
    assert cat["wanted_stars"] == 2

    html = generate_dossier_html("Lucas", ["Will", "Lucas"])
    assert "LATAM Airlines" in html
    assert "Brickell" in html
    assert "Wynwood Walls" in html


def test_api_endpoints_flow(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """[System]
    Testa o fluxo completo dos endpoints da API usando um banco SQLite temporário.

    args:
        tmp_path: Diretório temporário provido pelo pytest.
        monkeypatch: Utilitário do pytest para isolar variáveis de ambiente.

    why:
        Garantir que a confirmação de presença persista no SQLite e gere o dossiê de e-mail.

    example:
        test_api_endpoints_flow(tmp_path, monkeypatch)
    """
    temp_db = tmp_path / "test_miami.sqlite"
    monkeypatch.setenv("DATABASE_PATH", str(temp_db))
    monkeypatch.setenv("SMTP_USER", "")
    monkeypatch.setenv("RESEND_API_KEY", "")

    client = TestClient(app)

    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "ok"

    trip_res = client.get("/api/trip-data")
    assert trip_res.status_code == 200
    assert len(trip_res.json()["flights"]) >= 4

    initial_list = client.get("/api/participants").json()
    assert initial_list["confirmed_count"] >= 1

    confirm_res = client.post(
        "/api/participants/confirm",
        json={
            "name": "Convidado 1",
            "email": "convidado1@vicecity.com",
            "role_style": "Camisa 10 no Chase Stadium",
        },
    )
    assert confirm_res.status_code == 200
    body = confirm_res.json()
    assert body["participant"]["status"] == "confirmed"
    assert body["email_dispatch"]["delivered"] is True

    dossier_res = client.get("/api/dossier/download?name=Convidado%201")
    assert dossier_res.status_code == 200
    assert "MIAMI 2027" in dossier_res.text

