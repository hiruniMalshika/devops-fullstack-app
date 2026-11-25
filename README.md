# CI/CD Practice App

A small full-stack item list built with React, Express, and PostgreSQL. Docker
Compose starts the frontend, API, and database together.

## Run locally with Docker Compose

From this directory, run:

```sh
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

The credentials in `docker-compose.yml` are for local practice only; change
them before using this setup outside a local development environment.
