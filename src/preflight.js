// Capa pre-LLM: detecta casos triviales para evitar consumo innecesario de tokens
// Y aplica los "flips" deterministas de SIYAYO en frases muy cortas/canónicas.

const TRIVIAL_MIN_CHARS = 1;

// Heurística: texto ya muy positivo (telemetría)
const ALREADY_POSITIVE_HINTS = [
  'gracias', 'agradecid', 'agradezco', 'bendici', 'maravillos', 'increíble',
  'feliz', 'felices', 'pleno', 'plenitud', 'abundanc', 'amor', 'sereno',
  'serena', 'paz', 'gratitud', 'expansi'
];

// Flips canónicos: input normalizado -> respuesta SIYAYO determinista.
// Solo se aplica cuando el input es EXACTAMENTE una de estas frases (sin más texto),
// para no robarle al LLM los casos con matiz.
const CANONICAL_FLIPS = new Map([
  ['no',            'Sí'],
  ['no.',           'Sí'],
  ['nunca',         'Siempre'],
  ['jamas',         'Siempre'],
  ['imposible',     'Posible'],
  ['no puedo',      'Sí puedo'],
  ['no quiero',     'Sí quiero'],
  ['no se',         'Sí sé'],
  ['no soy capaz',  'Sí soy capaz'],
  ['no sirvo',      'Sí sirvo'],
  ['no merezco',    'Sí merezco'],
  ['no tengo',      'Sí tengo'],
  ['no puedo mas',  'Sí puedo más'],
  ['no aguanto mas','Sí aguanto más'],
  ['odio mi vida',  'Amo mi vida'],
  ['estoy mal',     'Estoy bien'],
  ['todo me sale mal', 'Todo me sale bien'],
  ['no funciono',   'Sí funciono']
]);

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    // Eliminar diacríticos (acentos y tildes Unicode)
    .replace(/\p{Diacritic}/gu, '')
    // Colapsar espacios y quitar signos finales redundantes
    .replace(/\s+/g, ' ')
    .replace(/[!¡?¿]+$/g, '')
    .trim();
}

function preflight(text) {
  const trimmed = (text || '').trim();

  if (trimmed.length === 0) {
    return {
      skip: true,
      reason: 'empty',
      output: 'Escribe un mensaje para transformarlo.'
    };
  }

  if (trimmed.length < TRIVIAL_MIN_CHARS) {
    return {
      skip: true,
      reason: 'too_short',
      output: trimmed
    };
  }

  // Flip determinista — solo cuando el input es exactamente una frase canónica.
  const norm = normalize(trimmed);
  if (CANONICAL_FLIPS.has(norm)) {
    return {
      skip: true,
      reason: 'canonical_flip',
      output: CANONICAL_FLIPS.get(norm)
    };
  }

  const positiveHits = ALREADY_POSITIVE_HINTS.reduce(
    (acc, w) => acc + (norm.includes(w) ? 1 : 0),
    0
  );

  return { skip: false, positiveHits };
}

module.exports = { preflight };
