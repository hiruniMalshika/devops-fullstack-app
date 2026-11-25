# CI/CD Practice App

A small full-stack item list built with React, Express, and PostgreSQL. Docker
Compose starts the frontend, API, and database together.

## Run locally with Docker Compose

Create a local `.env` file from the example, then start the services:

```sh
cp .env.example .env
# Edit .env and set POSTGRES_PASSWORD to a strong local password.
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Add an item using the form;
it is stored in PostgreSQL and remains available across container restarts in a
named Docker volume.

To stop the services, press `Ctrl+C`, then run:

```sh
docker compose down
```

To also delete the saved database volume and its items, run
`docker compose down -v`.

The API is available through the frontend's Nginx reverse proxy at
`http://localhost:3000/api`. Its endpoints are `GET /api/items`,
`POST /api/items` (JSON body `{"name":"Example item"}`), and `GET /api/health`.
The backend is not published directly to the host, so its port does not conflict
with other local services.

## Store credentials in GitHub Actions secrets

1. In your GitHub repository, open **Settings → Secrets and variables → Actions**.
2. Select **New repository secret** and add these three secrets:
   - `POSTGRES_DB` — database name (for example, `cicdpractice`)
   - `POSTGRES_USER` — database username
   - `POSTGRES_PASSWORD` — a strong, unique password
3. Keep the real `.env` file local. It is ignored by Git; do not commit it or
   paste its values into workflow files.

GitHub Actions secrets are not automatically available to Docker Compose. This
project's Compose integration job passes them as environment variables and runs
only on pushes to `main`:

```yaml
- name: Start Compose stack
  run: docker compose up -d --build
  env:
    POSTGRES_DB: ${{ secrets.POSTGRES_DB }}
    POSTGRES_USER: ${{ secrets.POSTGRES_USER }}
    POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
```

The workflow builds the backend and frontend on pushes and pull requests. The
Compose integration test runs only on pushes to `main`, where repository secrets
are available. GitHub does not expose repository secrets to workflows triggered
by pull requests from forks.
