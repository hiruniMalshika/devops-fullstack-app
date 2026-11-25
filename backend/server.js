const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT) || 5000;
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "cicdpractice",
  user: process.env.DB_USER || "app",
  password: process.env.DB_PASSWORD || "app_dev_password",
});

app.use(express.json());

app.get("/api/health", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/items", async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, created_at FROM items ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/items", async (req, res, next) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

  if (!name || name.length > 200) {
    return res.status(400).json({
      error: "Item name must be between 1 and 200 characters.",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at",
      [name],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use((error, _req, res, _next) => {
  console.error("Request failed:", error);
  res.status(500).json({ error: "An internal server error occurred." });
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL CHECK (char_length(name) <= 200),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const server = app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    });
  }
}

start().catch(async (error) => {
  console.error("Unable to start API:", error);
  await pool.end();
  process.exit(1);
});
