/**
 * index.js — Servidor principal del addon.
 * Compatible con Vercel (module.exports = app) y ejecución local (app.listen).
 */

const express = require('express');
const path = require('path');

const { decodeConfig, encodeConfig, DEFAULT_CONFIG } = require('../src/config');
const { buildManifest } = require('../src/manifest');
const { fetchCatalog }  = require('../src/catalog');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── Helpers ──────────────────────────────────────────────────────────────────

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
}

function getBaseUrl(req) {
  // Priorizar el host header — refleja el dominio real al que accedió el usuario
  // (en Vercel, VERCEL_URL da la URL de preview/deployment, no la de producción)
  const host = req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  if (host) return `${proto}://${host}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// ── Página de configuración ───────────────────────────────────────────────────

app.get(['/', '/configure'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/configure.html'));
});

// Genera la URL de ejemplo con la config por defecto (útil para el README)
app.get('/api/default-url', (req, res) => {
  corsHeaders(res);
  const encoded = encodeConfig(DEFAULT_CONFIG);
  const base = getBaseUrl(req);
  res.json({ url: `${base}/${encoded}/manifest.json` });
});

// ── Manifest ──────────────────────────────────────────────────────────────────

app.get('/:config/manifest.json', (req, res) => {
  corsHeaders(res);
  const config = decodeConfig(req.params.config);
  if (!config) return res.status(400).json({ error: 'Configuración inválida' });

  const base = getBaseUrl(req);
  res.json(buildManifest(config, base));
});

// ── Catálogos ─────────────────────────────────────────────────────────────────

app.get('/:config/catalog/:type/:id.json', async (req, res) => {
  corsHeaders(res);

  const config = decodeConfig(req.params.config);
  if (!config) return res.status(400).json({ error: 'Configuración inválida' });

  const { type, id } = req.params;

  try {
    const metas = await fetchCatalog(config, type, id);
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate=3600');
    res.json({ metas });
  } catch (err) {
    console.error(`[catalog] ${id}:`, err.message);
    res.status(500).json({ error: err.message, metas: [] });
  }
});

// ── CORS preflight ────────────────────────────────────────────────────────────

app.options('*', (req, res) => {
  corsHeaders(res);
  res.sendStatus(200);
});

// ── 404 ───────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Inicio local ──────────────────────────────────────────────────────────────

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    const encoded = encodeConfig(DEFAULT_CONFIG);
    console.log(`\n🎬 Mi Catálogo — Addon de Stremio`);
    console.log(`   Configurar: http://localhost:${PORT}/configure`);
    console.log(`   Manifest:   http://localhost:${PORT}/${encoded}/manifest.json\n`);
  });
}

// Exportar para Vercel
module.exports = app;
