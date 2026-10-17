# Script para iniciar Backend (FastAPI) e Frontend (React + Vite) do MIAMI_2027 localmente

$ErrorActionPreference = "Stop"
$ExpRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ExpRoot "backend"
$FrontendDir = Join-Path $ExpRoot "frontend"

Write-Host "🌴 Iniciando MIAMI_2027 — Miami 2027 (Vice City Edition)..." -ForegroundColor Cyan

# Garante que existe um arquivo .env no backend
$BackendEnv = Join-Path $BackendDir ".env"
$EnvExample = Join-Path $ExpRoot ".env.example"
if (-not (Test-Path $BackendEnv) -and (Test-Path $EnvExample)) {
    Copy-Item $EnvExample $BackendEnv
    Write-Host "✓ Arquivo backend/.env criado a partir de .env.example" -ForegroundColor Green
}

Write-Host "🚀 Subindo Backend FastAPI na porta 8000..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendDir'; python -m uvicorn app.main:app --reload --port 8000"

Write-Host "🎸 Subindo Frontend React (Vite) na porta 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendDir'; npm run dev"

Write-Host "✅ Acesse no navegador: http://localhost:5173" -ForegroundColor Yellow

