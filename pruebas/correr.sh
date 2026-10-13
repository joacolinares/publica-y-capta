#!/usr/bin/env bash
# Prueba la app completa sin cuentas reales: emuladores de Firebase + Impul simulado. Necesita Java 11+.
# Uso: bash pruebas/correr.sh
set -euo pipefail
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
openssl genrsa -out "$TMP/key.pem" 2048 2>/dev/null
node -e 'const fs=require("fs");fs.writeFileSync(process.argv[2],JSON.stringify({type:"service_account",project_id:"demo-pyc",private_key_id:"x",private_key:fs.readFileSync(process.argv[1],"utf8"),client_email:"test@demo-pyc.iam.gserviceaccount.com",client_id:"1",token_uri:"https://oauth2.googleapis.com/token"}))' "$TMP/key.pem" "$TMP/sa.json"

(cd pruebas && npx -y firebase-tools@14 emulators:start --only auth,firestore,storage --project demo-pyc > "$TMP/emu.log" 2>&1) &
EMU_PID=$!
for _ in $(seq 1 60); do grep -q "All emulators ready" "$TMP/emu.log" 2>/dev/null && break; sleep 2; done

npm run build > "$TMP/build.log"
env FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199 STORAGE_EMULATOR_HOST=http://127.0.0.1:9199 \
  GCLOUD_PROJECT=demo-pyc FIREBASE_SERVICE_ACCOUNT="$(cat "$TMP/sa.json")" FIREBASE_STORAGE_BUCKET=demo-pyc.appspot.com \
  IMPULTIENDA_WEBHOOK_SECRET=whsec IMPUL_PRODUCTO_PACK=P IMPUL_PRODUCTO_BUMP=B IMPUL_PRODUCTO_UPSELL=U \
  ANTHROPIC_API_KEY= RESEND_API_KEY= PORT=3124 npx next start -p 3124 > "$TMP/app.log" 2>&1 &
APP_PID=$!
trap 'kill $APP_PID 2>/dev/null; pkill -f "emulators:start --only auth,firestore,storage --project demo-pyc" || true' EXIT
for _ in $(seq 1 30); do curl -fs localhost:3124 >/dev/null && break; sleep 1; done

node pruebas/robo-de-cuenta.mjs
node pruebas/compra-completa.mjs
