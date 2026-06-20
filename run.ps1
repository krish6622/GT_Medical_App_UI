# Run the GT Medical frontend (Vite dev) on :5174
$ErrorActionPreference = "Stop"
if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install
}
npm run dev
