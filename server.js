require('dotenv').config();
const path = require('path');
const express = require('express');

const { buildMessages, TONES } = require('./src/prompt');
const { preflight } = require('./src/preflight');
const { TTLCache } = require('./src/cache');
const { callLLM } = require('./src/aiClient');

const PORT = parseInt(process.env.PORT || '3000', 10);
const MAX_INPUT_CHARS = parseInt(process.env.MAX_INPUT_CHARS || '2000', 10);
const RATE_LIMIT_PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MIN || '30', 10);

const cache = new TTLCache({
  maxEntries: parseInt(process.env.CACHE_MAX_ENTRIES || '500', 10),
  ttlMs: parseInt(process.env.CACHE_TTL_MS || '3600000', 10)
});

// Rate limit en memoria por IP (suficiente para MVP)
const rlBuckets = new Map();
function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const bucket = rlBuckets.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  rlBuckets.set(ip, bucket);
  return bucket.count <= RATE_LIMIT_PER_MIN;
}

const app = express();
app.use(express.json({ limit: '64kb' }));
// En producción servimos el build de Vite (frontend/dist).
// En desarrollo Vite se ejecuta aparte en :5173 con proxy a /api,
// así que estos archivos no se usan hasta que hagas `npm run build` en frontend.
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    tones: Object.keys(TONES)
  });
});

app.get('/api/tones', (_req, res) => {
  res.json(
    Object.entries(TONES).map(([key, t]) => ({ key, label: t.label }))
  );
});

app.post('/api/transform', async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'anon';
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' });
  }

  const started = Date.now();
  const { text = '', tone = 'practico' } = req.body || {};

  if (typeof text !== 'string' || typeof tone !== 'string') {
    return res.status(400).json({ error: 'Formato inválido.' });
  }

  const cleaned = text.trim();
  if (cleaned.length > MAX_INPUT_CHARS) {
    return res.status(400).json({
      error: `El texto excede ${MAX_INPUT_CHARS} caracteres.`
    });
  }

  if (!TONES[tone]) {
    return res.status(400).json({ error: 'Tono no soportado.' });
  }

  // 1) Pre-flight: resolver casos triviales sin LLM
  const pre = preflight(cleaned);
  if (pre.skip) {
    logEvent({ kind: 'preflight', reason: pre.reason, tone, ms: Date.now() - started });
    return res.json({
      transformed: pre.output,
      source: 'preflight',
      tone
    });
  }

  // 2) Cache
  const key = TTLCache.key(cleaned, tone);
  const cached = cache.get(key);
  if (cached) {
    logEvent({ kind: 'cache_hit', tone, ms: Date.now() - started });
    return res.json({ transformed: cached, source: 'cache', tone });
  }

  // 3) LLM
  try {
    const messages = buildMessages(cleaned, tone);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    const { text: out, usage, model } = await callLLM({
      messages,
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!out) throw new Error('Respuesta vacía del modelo.');

    cache.set(key, out);

    logEvent({
      kind: 'llm_call',
      tone,
      model,
      ms: Date.now() - started,
      prompt_tokens: usage?.prompt_tokens,
      completion_tokens: usage?.completion_tokens,
      total_tokens: usage?.total_tokens
    });

    return res.json({ transformed: out, source: 'llm', tone, model });
  } catch (err) {
    logEvent({
      kind: 'llm_error',
      tone,
      ms: Date.now() - started,
      code: err.code,
      status: err.status
    });
    const status = err.code === 'NO_API_KEY' ? 500 : 502;
    return res.status(status).json({
      error:
        err.code === 'NO_API_KEY'
          ? 'El servidor no tiene configurada la API Key del modelo de IA.'
          : 'No fue posible transformar el mensaje en este momento. Intenta nuevamente.'
    });
  }
});

// Log técnico — NO incluye el contenido del usuario, solo métricas.
function logEvent(evt) {
  try {
    console.log(JSON.stringify({ ts: new Date().toISOString(), ...evt }));
  } catch (_) {
    /* noop */
  }
}

app.listen(PORT, () => {
  console.log(`IA SIYAYO escuchando en http://localhost:${PORT}`);
});
