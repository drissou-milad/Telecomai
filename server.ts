import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// All ML inference lives behind the FastAPI backend (backend/app/main.py).
// This server never talks to Python or the model files directly anymore -
// it is a thin reverse proxy + static/dev asset server for the React app.
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

app.use(express.json());

// Reverse-proxy every /api/* call to the FastAPI backend, unchanged.
app.use('/api', async (req, res) => {
  const targetUrl = `${BACKEND_API_URL}/api${req.url}`;

  try {
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
    res.status(upstreamResponse.status);
    res.setHeader('content-type', contentType);
    const text = await upstreamResponse.text();
    res.send(text);
  } catch (err: any) {
    console.error(`Failed to reach FastAPI backend at ${BACKEND_API_URL}:`, err.message);
    res.status(502).json({
      error: 'Backend API unreachable',
      details: `Could not reach FastAPI backend at ${BACKEND_API_URL}. Is it running? (uvicorn backend.app.main:app --reload --port 8000)`,
    });
  }
});

// Vite middleware setup for serving the React frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telecom AI Platform frontend running on http://0.0.0.0:${PORT}`);
    console.log(`Proxying /api/* to FastAPI backend at ${BACKEND_API_URL}`);
  });
}

startServer();
