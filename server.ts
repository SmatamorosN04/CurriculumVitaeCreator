import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cv_builder.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS cvs (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/cvs", (req, res) => {
    const { id, data } = req.body;
    if (!id || !data) {
      return res.status(400).json({ error: "Missing id or data" });
    }

    const stmt = db.prepare("INSERT OR REPLACE INTO cvs (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
    stmt.run(id, JSON.stringify(data));
    
    res.json({ success: true });
  });

  app.get("/api/cvs/:id", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("SELECT data FROM cvs WHERE id = ?");
    const row = stmt.get(id) as { data: string } | undefined;

    if (!row) {
      return res.status(404).json({ error: "CV not found" });
    }

    res.json(JSON.parse(row.data));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
