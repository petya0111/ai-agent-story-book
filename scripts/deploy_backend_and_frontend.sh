# ---- Edit these two names if you prefer different apps (must be lowercase) ----
APP_BACKEND=${1:-my-backend-name-4289bc256cb4}    # pass as first arg or edit here
APP_FRONTEND=${2:-ai-story-book-frontend}          # pass as second arg or edit here
# ------------------------------------------------------------------------------

set -euo pipefail

echo "Deploying backend -> $APP_BACKEND and frontend -> $APP_FRONTEND"

# ensure Heroku login
heroku auth:whoami || { echo 'Please run: heroku login' ; exit 1; }

# ---------- BACKEND ----------
echo "==> Ensure backend app exists"
heroku apps:info --app "$APP_BACKEND" 2>/dev/null || heroku create "$APP_BACKEND"

echo "==> Add Postgres addon (idempotent)"
heroku addons:create heroku-postgresql:hobby-dev --app "$APP_BACKEND" || true

echo "==> Build backend JAR"
cd backend
./gradlew clean bootJar --no-daemon
echo "Produced jars:"
ls -la build/libs
JAR_NAME=$(ls build/libs | grep -E '\.jar$' | head -n1)
if [ -z "$JAR_NAME" ]; then
  echo "ERROR: no jar produced in backend/build/libs" >&2
  exit 1
fi
echo "Using jar: $JAR_NAME"
cp "build/libs/$JAR_NAME" ../container-build/app.jar
echo "Copied app.jar -> container-build/app.jar"
ls -la ../container-build/app.jar
cd ..

echo "==> Push backend container to Heroku"
heroku container:login

# prefer --context if supported by Heroku CLI
if heroku help container:push | grep -q -- '--context'; then
  heroku container:push web --app "$APP_BACKEND" --context backend/container-build
else
  docker build -t registry.heroku.com/"$APP_BACKEND"/web backend/container-build
  heroku container:login
  docker push registry.heroku.com/"$APP_BACKEND"/web
fi

heroku container:release web --app "$APP_BACKEND"
heroku ps:scale web=1 --app "$APP_BACKEND"

echo "==> Wire database + safe envs for backend"
DBURL=$(heroku config:get DATABASE_URL --app "$APP_BACKEND" || echo "")
if [ -n "$DBURL" ]; then
  heroku config:set SPRING_DATASOURCE_URL="$DBURL" --app "$APP_BACKEND"
fi
# Keep ingestion off while debugging
heroku config:set BOOK_PDF_PATH='backend/books/hale.pdf' INGEST_ON_STARTUP=false --app "$APP_BACKEND"
# set OPENAI_API_KEY locally (do not paste here):
# heroku config:set OPENAI_API_KEY="sk-..." --app "$APP_BACKEND"

echo "=== Backend logs (recent):"
heroku logs --num 200 --app "$APP_BACKEND" || true

# Give the web dyno a moment to boot
sleep 5

# Quick backend health test (adjust path if your app exposes different)
echo "=== Backend health test ==="
curl -fsS "https://${APP_BACKEND}.herokuapp.com/api/health" || echo "Health endpoint failed (maybe path differs)"

# ---------- FRONTEND ----------
echo "==> Ensure frontend app exists"
heroku apps:info --app "$APP_FRONTEND" 2>/dev/null || heroku create "$APP_FRONTEND"

echo "==> Set frontend build env (Next.js reads NEXT_PUBLIC_* at build time)"
heroku config:set NEXT_PUBLIC_API_URL="https://${APP_BACKEND}.herokuapp.com/api" --app "$APP_FRONTEND"

echo "==> Deploy frontend via git subtree (push frontend directory as app root)"
git fetch origin
git subtree split --prefix=frontend -b heroku-frontend-branch main
git push https://git.heroku.com/"$APP_FRONTEND".git heroku-frontend-branch:main --force

echo "=== Frontend logs (recent):"
heroku logs --num 200 --app "$APP_FRONTEND" || true

echo "=== Tailing backend logs (background) ==="
heroku logs --tail --app "$APP_BACKEND" &

echo "=== Tailing frontend logs (background) ==="
heroku logs --tail --app "$APP_FRONTEND" &

# ---------- Smoke tests (from your machine) ----------
echo "Backend URL: https://${APP_BACKEND}.herokuapp.com"
echo "Frontend URL: https://${APP_FRONTEND}.herokuapp.com"

echo "OPTIONS preflight test (CORS) — should include Access-Control-Allow-Origin header:"
curl -i -X OPTIONS \
  -H "Origin: https://${APP_FRONTEND}.herokuapp.com" \
  -H "Access-Control-Request-Method: POST" \
  https://${APP_BACKEND}.herokuapp.com/api/generate/chat || echo "OPTIONS test failed"

echo "GET pages test:"
curl -i -H "Origin: https://${APP_FRONTEND}.herokuapp.com" \
  "https://${APP_BACKEND}.herokuapp.com/api/book/pages?bookId=2&start=1&end=3" || echo "GET test failed"

echo "Done. If anything failed, paste the failing command output here."