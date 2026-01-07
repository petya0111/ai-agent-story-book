#!/usr/bin/env bash
set -euo pipefail

APP_BACKEND=${1:-ai-story-book-backend}

echo "Deploying backend to Heroku app: $APP_BACKEND"

# ensure heroku login
if ! heroku auth:whoami >/dev/null 2>&1; then
  echo "You are not logged into Heroku. Run: heroku login" >&2
  exit 1
fi

# create app if missing
if ! heroku apps:info --app "$APP_BACKEND" >/dev/null 2>&1; then
  echo "Creating Heroku app $APP_BACKEND"
  heroku create "$APP_BACKEND"
else
  echo "Heroku app $APP_BACKEND already exists"
fi

# add postgres (idempotent)
heroku addons:create heroku-postgresql:hobby-dev --app "$APP_BACKEND" || true

# build jar
echo "Building backend jar..."
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
echo "Copied app.jar into container-build/"
ls -la ../container-build/app.jar
cd ..

# push container
echo "Logging into Heroku container registry..."
heroku container:login

if heroku help container:push | grep -q -- '--context'; then
  echo "Pushing image using heroku container:push with --context"
  heroku container:push web --app "$APP_BACKEND" --context backend/container-build
else
  echo "Building docker image locally and pushing to Heroku registry"
  docker build -t registry.heroku.com/$APP_BACKEND/web backend/container-build
  heroku container:login
  docker push registry.heroku.com/$APP_BACKEND/web
fi

echo "Releasing image on Heroku..."
heroku container:release web --app "$APP_BACKEND"
heroku ps:scale web=1 --app "$APP_BACKEND"

# wire DB and config
DBURL=$(heroku config:get DATABASE_URL --app "$APP_BACKEND")
echo "Heroku DATABASE_URL: $DBURL"
heroku config:set SPRING_DATASOURCE_URL="$DBURL" --app "$APP_BACKEND"
heroku config:set BOOK_PDF_PATH='backend/books/hale.pdf' INGEST_ON_STARTUP=false --app "$APP_BACKEND"

echo "Showing last 200 lines of logs for $APP_BACKEND"
heroku logs --num 200 --app "$APP_BACKEND" || true

echo "Tailing logs now. Press Ctrl+C to stop."
heroku logs --tail --app "$APP_BACKEND"
