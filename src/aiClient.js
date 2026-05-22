// Cliente delgado para llamar al modelo (OpenAI-compatible).
// Cambiar de modelo/proveedor solo requiere actualizar las variables del .env.

async function callLLM({ messages, signal }) {
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const apiKey  = process.env.OPENAI_API_KEY;
  const model   = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.6');
  const maxTokens   = parseInt(process.env.OPENAI_MAX_OUTPUT_TOKENS || '400', 10);
  const thinking    = process.env.LLM_THINKING === 'true';

  if (!apiKey) {
    const err = new Error('Falta OPENAI_API_KEY en el entorno.');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };

  // Parámetro requerido por moonshotai/kimi y otros modelos con razonamiento
  if (thinking) {
    payload.chat_template_kwargs = { thinking: true };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`Error del proveedor IA (${res.status})`);
    err.code = 'UPSTREAM_ERROR';
    err.status = res.status;
    err.detail = detail.slice(0, 500);
    throw err;
  }

  const raw = await res.text();
  console.log('[aiClient] raw response:', raw.slice(0, 600));

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    const err = new Error('Respuesta no es JSON válido.');
    err.code = 'PARSE_ERROR';
    err.detail = raw.slice(0, 300);
    throw err;
  }

  // Algunos modelos con thinking devuelven el contenido en un array de bloques
  let text = '';
  const msg = data?.choices?.[0]?.message;
  if (Array.isArray(msg?.content)) {
    text = msg.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();
  } else {
    text = (msg?.content || '').trim();
  }

  // Si el modelo devuelve <think>…</think> antes de la respuesta, lo eliminamos
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const usage = data?.usage || null;
  return { text, usage, model };
}

module.exports = { callLLM };
