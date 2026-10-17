"""Adaptador de envio de e-mail do Dossiê Miami 2027.
Suporta envio real via SMTP (Gmail), Resend API ou fallback local salvando o HTML em disco."""

from __future__ import annotations

import os
import re
import smtplib
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any

import httpx


def save_local_email_preview(recipient_email: str, html_content: str) -> Path:
    """[System]
    Salva uma cópia local do e-mail HTML gerado em data/sent_emails para inspeção e fallback.

    args:
        recipient_email: Endereço de e-mail do destinatário.
        html_content: Conteúdo HTML completo do dossiê.

    why:
        Garantir que o fluxo funcione mesmo sem credenciais externas e manter registro local.

    example:
        preview_path = save_local_email_preview("amigo@email.com", "<html>...</html>")
    """
    base_dir = Path(__file__).resolve().parent.parent
    out_dir = base_dir / "data" / "sent_emails"
    out_dir.mkdir(parents=True, exist_ok=True)

    safe_email = re.sub(r"[^a-zA-Z0-9_-]", "_", recipient_email)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    file_path = out_dir / f"dossie_{safe_email}_{timestamp}.html"
    file_path.write_text(html_content, encoding="utf-8")
    return file_path


def send_via_smtp(recipient_email: str, subject: str, html_content: str) -> None:
    """[System]
    Envia o e-mail HTML utilizando servidor SMTP autenticado com TLS (ex: Gmail App Password).

    args:
        recipient_email: E-mail do destinatário confirmado.
        subject: Assunto do e-mail.
        html_content: Corpo HTML do Dossiê Miami 2027.

    why:
        Permitir envio gratuito direto pela conta Gmail/Outlook pessoal do organizador.

    example:
        send_via_smtp("amigo@gmail.com", "Missão Miami 2027", "<html>...</html>")
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    from_name = os.getenv("SMTP_FROM_NAME", "Missão Miami 2027 - Vice City").strip()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{smtp_user}>"
    msg["To"] = recipient_email
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, [recipient_email], msg.as_string())


def send_via_resend(recipient_email: str, subject: str, html_content: str) -> None:
    """[System]
    Envia o e-mail HTML utilizando a API HTTP da Resend.

    args:
        recipient_email: E-mail do destinatário confirmado.
        subject: Assunto do e-mail.
        html_content: Corpo HTML do Dossiê Miami 2027.

    why:
        Oferecer uma alternativa moderna via API HTTP ideal para hospedagens gratuitas como Render.

    example:
        send_via_resend("amigo@gmail.com", "Missão Miami 2027", "<html>...</html>")
    """
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    from_email = os.getenv("RESEND_FROM_EMAIL", "Miami 2027 <onboarding@resend.dev>").strip()

    response = httpx.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "from": from_email,
            "to": [recipient_email],
            "subject": subject,
            "html": html_content,
        },
        timeout=15.0,
    )
    response.raise_for_status()


def dispatch_dossier_email(recipient_name: str, recipient_email: str, html_content: str) -> dict[str, Any]:
    """[System]
    Orquestra o disparo do Dossiê por e-mail usando Resend, SMTP ou fallback local em disco.

    args:
        recipient_name: Nome do participante confirmado.
        recipient_email: E-mail do participante confirmado.
        html_content: HTML renderizado do Dossiê Miami 2027.

    why:
        Garantir entrega resiliente e informar claramente qual método de envio foi utilizado.

    example:
        status = dispatch_dossier_email("Will", "will@email.com", "<html>...</html>")
    """
    subject = f"🌴 [MISSÃO CONFIRMADA] Dossiê Oficial Miami 2027 — Bem-vindo, {recipient_name}!"
    preview_file = save_local_email_preview(recipient_email, html_content)

    resend_key = os.getenv("RESEND_API_KEY", "").strip()
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()

    has_real_smtp = (
        bool(smtp_user)
        and bool(smtp_pass)
        and "seu_email" not in smtp_user
        and "xxxx" not in smtp_pass
    )

    if resend_key:
        try:
            send_via_resend(recipient_email, subject, html_content)
            return {
                "delivered": True,
                "mode": "resend_api",
                "message": f"Dossiê enviado para {recipient_email} via Resend API!",
                "local_preview": str(preview_file.name),
            }
        except Exception as exc:  # noqa: BLE001
            return {
                "delivered": False,
                "mode": "local_fallback_after_error",
                "message": f"Confirmado na lista! Falha na API Resend ({exc}); cópia salva localmente.",
                "local_preview": str(preview_file.name),
            }

    if has_real_smtp:
        try:
            send_via_smtp(recipient_email, subject, html_content)
            return {
                "delivered": True,
                "mode": "smtp",
                "message": f"Dossiê enviado com sucesso para o e-mail {recipient_email}!",
                "local_preview": str(preview_file.name),
            }
        except Exception as exc:  # noqa: BLE001
            return {
                "delivered": False,
                "mode": "local_fallback_after_error",
                "message": f"Confirmado na lista! Erro SMTP ({exc}); cópia salva localmente.",
                "local_preview": str(preview_file.name),
            }

    return {
        "delivered": True,
        "mode": "local_preview",
        "message": (
            f"Presença confirmada! O Dossiê de {recipient_email} foi gerado "
            "(configure SMTP_USER/SMTP_PASSWORD no .env para disparo real na caixa de entrada)."
        ),
        "local_preview": str(preview_file.name),
    }

