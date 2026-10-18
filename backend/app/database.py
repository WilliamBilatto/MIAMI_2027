"""Adaptador de banco de dados para persistência dos participantes da viagem.
Suporta Neon Postgres (quando DATABASE_URL estiver configurado) com fallback
automático para SQLite para testes locais e desenvolvimento offline.
Isola os efeitos colaterais de escrita e leitura em disco das regras de negócio."""

from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

# Carrega .env.local da raiz do projeto (gerado pelo neon deploy) e backend/.env
_root_env_local = Path(__file__).resolve().parent.parent.parent / ".env.local"
if _root_env_local.exists():
    load_dotenv(_root_env_local)

_backend_env = Path(__file__).resolve().parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(_backend_env)
else:
    load_dotenv()


DEFAULT_SEED_PARTICIPANTS = [
    {
        "name": "Will (Organizador)",
        "email": os.getenv("ORGANIZER_EMAIL", "organizador@vicecity.com"),
        "status": "confirmed",
        "role_style": "Chefe da Missão Vice City",
    },
    {
        "name": "Guilherme Nannini",
        "email": None,
        "status": "invited",
        "role_style": "Convocado Vice City",
    },
    {
        "name": "Lucas Belizario",
        "email": None,
        "status": "invited",
        "role_style": "Convocado Vice City",
    },
    {
        "name": "Franscico Carvalho",
        "email": None,
        "status": "invited",
        "role_style": "Convocado Vice City",
    },
    {
        "name": "Alexia Lima",
        "email": None,
        "status": "invited",
        "role_style": "Convocada Vice City",
    },
    {
        "name": "Bruna Siqueira",
        "email": None,
        "status": "invited",
        "role_style": "Convocada Vice City",
    },
]


def is_postgres(custom_path: str | Path | None = None) -> bool:
    """[System]
    Determina se a persistência deve utilizar o Neon Postgres ou SQLite local.
    Se custom_path for fornecido explicitamente e não for uma URL postgres,
    força o uso do SQLite (essencial para testes isolados com tmp_path).

    args:
        custom_path: Caminho opcional sobrescrevendo a configuração padrão.

    why:
        Garantir que a aplicação use o Neon Postgres em produção/desenvolvimento
        e SQLite isolado em testes automatizados.
    """
    if custom_path:
        str_path = str(custom_path)
        if not (str_path.startswith("postgres://") or str_path.startswith("postgresql://")):
            return False

    db_url = os.getenv("DATABASE_URL", "").strip()
    return bool(db_url.startswith("postgres://") or db_url.startswith("postgresql://"))


def get_pg_connection(db_url: str | None = None):
    """[System]
    Abre uma conexão com o Neon Postgres utilizando o driver psycopg v3 com dict_row.
    """
    import psycopg
    from psycopg.rows import dict_row

    url = db_url or os.getenv("DATABASE_URL")
    return psycopg.connect(url, row_factory=dict_row)


def get_db_path(custom_path: str | Path | None = None) -> Path:
    """[System]
    Resolve o caminho do banco SQLite e garante a existência do diretório pai.

    args:
        custom_path: Caminho opcional sobrescrevendo a variável de ambiente DATABASE_PATH.

    why:
        Permitir o isolamento do banco de produção local e de bancos temporários em testes.

    example:
        db_file = get_db_path("data/miami2027.sqlite")
    """
    raw_path = custom_path or os.getenv("DATABASE_PATH", "data/miami2027.sqlite")
    path_obj = Path(raw_path)
    if not path_obj.is_absolute():
        base_dir = Path(__file__).resolve().parent.parent
        path_obj = base_dir / path_obj
    path_obj.parent.mkdir(parents=True, exist_ok=True)
    return path_obj


def init_db(custom_path: str | Path | None = None) -> str | Path:
    """[System]
    Cria a tabela de participantes caso não exista e popula a carga inicial.
    Suporta Neon Postgres e SQLite.

    args:
        custom_path: Caminho opcional do arquivo SQLite ou URL de conexão.

    why:
        Garantir que a aplicação funcione na primeira execução sem necessidade de migração manual.

    example:
        init_db()
    """
    if is_postgres(custom_path):
        with get_pg_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS participants (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT,
                        status TEXT NOT NULL DEFAULT 'invited',
                        role_style TEXT NOT NULL DEFAULT 'Vice City VIP',
                        confirmed_at TEXT
                    );
                    """
                )
                cur.execute("SELECT COUNT(*) AS count FROM participants;")
                row = cur.fetchone()
                count = row["count"] if row else 0
                if count == 0:
                    now_iso = datetime.now(timezone.utc).isoformat()
                    for item in DEFAULT_SEED_PARTICIPANTS:
                        cur.execute(
                            """
                            INSERT INTO participants (name, email, status, role_style, confirmed_at)
                            VALUES (%s, %s, %s, %s, %s);
                            """,
                            (
                                item["name"],
                                item["email"],
                                item["status"],
                                item["role_style"],
                                now_iso if item["status"] == "confirmed" else None,
                            ),
                        )
                conn.commit()
        return os.getenv("DATABASE_URL", "neon-postgres")

    db_path = get_db_path(custom_path)
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                status TEXT NOT NULL DEFAULT 'invited',
                role_style TEXT NOT NULL DEFAULT 'Vice City VIP',
                confirmed_at TEXT
            )
            """
        )
        cursor = conn.execute("SELECT COUNT(*) FROM participants")
        count = cursor.fetchone()[0]
        if count == 0:
            now_iso = datetime.now(timezone.utc).isoformat()
            for item in DEFAULT_SEED_PARTICIPANTS:
                conn.execute(
                    """
                    INSERT INTO participants (name, email, status, role_style, confirmed_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        item["name"],
                        item["email"],
                        item["status"],
                        item["role_style"],
                        now_iso if item["status"] == "confirmed" else None,
                    ),
                )
        conn.commit()
    return db_path


def list_all_participants(custom_path: str | Path | None = None) -> list[dict[str, Any]]:
    """[System]
    Consulta todos os participantes cadastrados ordenados por status e identificador.

    args:
        custom_path: Caminho opcional do banco SQLite ou URL.

    why:
        Fornecer os dados brutos para categorização entre confirmados e convocados.

    example:
        rows = list_all_participants()
    """
    if is_postgres(custom_path):
        init_db(custom_path)
        with get_pg_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, email, status, role_style, confirmed_at FROM participants ORDER BY id ASC;"
                )
                rows = cur.fetchall()
                return [dict(r) for r in rows]

    db_path = init_db(custom_path)
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT id, name, email, status, role_style, confirmed_at FROM participants ORDER BY id ASC"
        ).fetchall()
    return [dict(row) for row in rows]


def upsert_confirmed_participant(
    name: str,
    email: str,
    role_style: str = "Vice City VIP",
    custom_path: str | Path | None = None,
) -> dict[str, Any]:
    """[System]
    Registra ou atualiza um participante como confirmado ('confirmed') no banco.

    args:
        name: Nome validado do participante.
        email: E-mail validado do participante.
        role_style: Perfil escolhido pelo participante na viagem.
        custom_path: Caminho opcional do banco SQLite.

    why:
        Mover um convidado para a lista 'Tá Dentro' ou adicionar um novo amigo de forma idempotente.

    example:
        saved = upsert_confirmed_participant("Lucas Belizario", "lucas@email.com", "Piloto F1")
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    if is_postgres(custom_path):
        init_db(custom_path)
        with get_pg_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id FROM participants WHERE LOWER(email) = LOWER(%s) OR LOWER(name) = LOWER(%s);",
                    (email, name),
                )
                existing = cur.fetchone()
                if existing:
                    participant_id = existing["id"]
                    cur.execute(
                        """
                        UPDATE participants
                        SET name = %s, email = %s, status = 'confirmed', role_style = %s, confirmed_at = %s
                        WHERE id = %s
                        RETURNING id, name, email, status, role_style, confirmed_at;
                        """,
                        (name, email, role_style, now_iso, participant_id),
                    )
                    updated = cur.fetchone()
                else:
                    cur.execute(
                        """
                        INSERT INTO participants (name, email, status, role_style, confirmed_at)
                        VALUES (%s, %s, 'confirmed', %s, %s)
                        RETURNING id, name, email, status, role_style, confirmed_at;
                        """,
                        (name, email, role_style, now_iso),
                    )
                    updated = cur.fetchone()
                conn.commit()
                return dict(updated)

    db_path = init_db(custom_path)
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        existing = conn.execute(
            "SELECT id FROM participants WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)",
            (email, name),
        ).fetchone()

        if existing:
            participant_id = existing["id"]
            conn.execute(
                """
                UPDATE participants
                SET name = ?, email = ?, status = 'confirmed', role_style = ?, confirmed_at = ?
                WHERE id = ?
                """,
                (name, email, role_style, now_iso, participant_id),
            )
        else:
            cursor = conn.execute(
                """
                INSERT INTO participants (name, email, status, role_style, confirmed_at)
                VALUES (?, ?, 'confirmed', ?, ?)
                """,
                (name, email, role_style, now_iso),
            )
            participant_id = cursor.lastrowid

        conn.commit()
        updated = conn.execute(
            "SELECT id, name, email, status, role_style, confirmed_at FROM participants WHERE id = ?",
            (participant_id,),
        ).fetchone()

    return dict(updated)


def add_invited_friend(
    name: str,
    role_style: str = "Convocado Vice City",
    custom_path: str | Path | None = None,
) -> dict[str, Any]:
    """[System]
    Adiciona um novo nome na lista de convocados ('Os Convocados').

    args:
        name: Nome do amigo convocado.
        role_style: Estilo ou apelido na viagem.
        custom_path: Caminho opcional do banco SQLite.

    why:
        Permitir personalizar a lista de amigos convocados diretamente pela interface.

    example:
        invited = add_invited_friend("Pedro")
    """
    clean_name = (name or "").strip()
    if len(clean_name) < 2:
        raise ValueError("O nome do convidado deve ter pelo menos 2 caracteres.")

    if is_postgres(custom_path):
        init_db(custom_path)
        with get_pg_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO participants (name, email, status, role_style, confirmed_at)
                    VALUES (%s, NULL, 'invited', %s, NULL)
                    RETURNING id, name, email, status, role_style, confirmed_at;
                    """,
                    (clean_name, role_style),
                )
                row = cur.fetchone()
                conn.commit()
                return dict(row)

    db_path = init_db(custom_path)
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(
            """
            INSERT INTO participants (name, email, status, role_style, confirmed_at)
            VALUES (?, NULL, 'invited', ?, NULL)
            """,
            (clean_name, role_style),
        )
        conn.commit()
        row = conn.execute(
            "SELECT id, name, email, status, role_style, confirmed_at FROM participants WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
    return dict(row)


def remove_participant_by_id(participant_id: int, custom_path: str | Path | None = None) -> None:
    """[System]
    Remove um participante pelo seu identificador único.

    args:
        participant_id: ID numérico do participante na tabela.
        custom_path: Caminho opcional do banco.

    why:
        Permitir excluir registros de teste da lista de confirmados ou convocados.

    example:
        remove_participant_by_id(6)
    """
    if is_postgres(custom_path):
        init_db(custom_path)
        with get_pg_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM participants WHERE id = %s;", (participant_id,))
                conn.commit()
        return

    db_path = init_db(custom_path)
    with sqlite3.connect(db_path) as conn:
        conn.execute("DELETE FROM participants WHERE id = ?", (participant_id,))
        conn.commit()
