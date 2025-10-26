# Backend (Express + TypeScript)

Quickstart:
1. Install dependencies:
   cd backend
   npm install

2. Create .env (copy .env.example) and set:
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   BOOK_PDF_PATH=./data/book.pdf

3. Generate Prisma client and run migrations:
   npx prisma generate
   npx prisma migrate dev --name init

4. Start in dev:
   npm run dev

Routes:
- GET /api/book/metadata
- GET /api/book/pages?start=1&end=2
- GET /api/book/chunk/:id
- POST /api/generate/hero-rewrite
- POST /api/stories
- GET /api/stories

Notes:
- This setup ingests the PDF (BOOK_PDF_PATH) once into the DB. For production, you'll want idempotent ingest and background jobs for embeddings.
- Keep OPENAI_API_KEY server-side only.


Quick start — Docker Compose (recommended)
1. From the `backend/` directory:
   - Copy the example env file:
     cp .env.docker.example .env.docker

   - Start Postgres:
     docker compose up -d

   - Confirm the container is healthy:
     docker compose ps
     docker logs -f pg-book

2. Ensure your backend `.env` (the one Prisma/your app reads) points to the DB:
   - Edit `backend/.env` (or create it) and set:
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/book_agent?schema=public"

   - If you use a different user/password/db, update `.env.docker` and `DATABASE_URL` accordingly.

Run Prisma and app setup
1. Wait for Postgres to be ready (healthcheck in compose helps). Then run from backend:
   npx prisma format
   npx prisma generate

2. If you want to apply migrations (this will create tables):
   npx prisma migrate dev --name init

3. If you run into connection errors, re-check `DATABASE_URL` and that Docker is exposing port 5432 on localhost.

One-off alternative — Docker run (single container)
- If you prefer not to use docker-compose:
  docker run --name pg-book -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=book_agent -p 5432:5432 -d postgres:15

Troubleshooting & common fixes

A) Can't reach DB on localhost:5432
- Make sure the container is running and port is mapped:
  docker ps
  lsof -i :5432
- If another Postgres instance is using 5432 on host, either stop it or change the mapping in `docker-compose.yml` (e.g., `"5433:5432"`) and update `DATABASE_URL` accordingly.

B) "User `postgres` was denied access on the database `book_agent.public`"
- This means the connecting role either lacks privileges or the DB/schema owner is different. To fix run (using docker exec):

  # Run an interactive psql as the postgres superuser:
  docker exec -it pg-book psql -U postgres

  # Then inside psql:
  \l                                    -- list databases and owners
  \c book_agent                         -- connect to book_agent
  SELECT current_user, session_user;    -- confirm the user
  -- If needed, change ownership and grant privileges:
  ALTER DATABASE book_agent OWNER TO postgres;
  ALTER SCHEMA public OWNER TO postgres;
  GRANT ALL PRIVILEGES ON DATABASE book_agent TO postgres;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;

  -- Exit:
  \q

C) Running Prisma when DB is inside Docker (common commands)
- Start DB:
  docker compose up -d

- Run Prisma generate (from `backend/`):
  npx prisma generate

- Create/migrate DB schema:
  npx prisma migrate dev --name init

- If `migrate dev` fails due to permissions, apply the grant/owner fixes above.

D) Removing data / Resetting DB
- To remove the container and the volume (destroy local DB data):
  docker compose down
  docker volume rm backend_pgdata
  # or list volumes: docker volume ls
- Recreate and re-migrate:
  docker compose up -d
  npx prisma migrate dev --name init

E) If you see `pg_hba.conf` authentication errors
- Check authentication method in `pg_hba.conf` inside the container:
  docker exec -it pg-book bash -c "cat /var/lib/postgresql/data/pg_hba.conf"
- For local dev, ensure host connections use `md5` or `trust` for 127.0.0.1 (not recommended for production).
- After changing config, restart container:
  docker restart pg-book

Security & production notes
- Use strong passwords and a dedicated DB user for your application in production.
- Use managed Postgres (AWS RDS, GCP Cloud SQL, DigitalOcean Managed DB) or a secrets manager for credentials.
- Do NOT expose Postgres port to the public internet.

If something fails
- Paste the exact error output here (redact passwords). Useful logs/commands:
  - docker compose ps
  - docker logs pg-book --tail 200
  - docker exec -it pg-book psql -U postgres -c "\l"
  - npx prisma generate (full CLI output)

Next steps I can help with
- Add a simple `backend/scripts/wait-and-setup.sh` that waits for Postgres and runs Prisma generate/migrate automatically.
- Create a stricter `pg_hba.conf` patch and instructions to mount it into the container.
- Provide a script to create a non-superuser app role and grant it minimal privileges.

Would you like me to add an automatic init script (wait-for-postgres + prisma migrate/generate) to the repo now? 