#!/bin/bash
# FRET ERP — Startup: backend Express + ngrok tunnel
# Service: systemd user, reinicia automaticamente
# Roda na VM junto com o OpenClaw

set -e
cd /home/ninja/.openclaw/workspace/fret-erp
export PORT=3000
export API_KEY="fret-api-key-2026"

echo "[FRET] Iniciando backend na porta $PORT..."
node backend/server.js &
BACKEND_PID=$!
sleep 2

echo "[FRET] Iniciando túnel ngrok..."
ngrok http $PORT \
  --log=stdout \
  --region=eu \
  > /tmp/ngrok-fret.log 2>&1 &
NGROK_PID=$!
sleep 3

# Obter a URL pública do ngrok
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)
echo "[FRET] Túnel: $NGROK_URL"
echo "$NGROK_URL" > /tmp/ngrok-fret-url.txt

# Manter rodando
wait $BACKEND_PID