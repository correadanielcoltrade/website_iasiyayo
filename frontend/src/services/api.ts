import type { Tone, TransformResponse } from '@/types';

const FALLBACK_TONES: Tone[] = [
  { key: 'practico', label: 'Positivo y práctico' },
  { key: 'gratitud', label: 'Gratitud y abundancia' },
  { key: 'empoderado', label: 'Empoderado y sereno' },
  { key: 'elevado', label: 'Elevado y consciente' }
];

export async function fetchTones(): Promise<Tone[]> {
  try {
    const r = await fetch('/api/tones');
    if (!r.ok) throw new Error(`status ${r.status}`);
    return (await r.json()) as Tone[];
  } catch {
    return FALLBACK_TONES;
  }
}

export async function transformText(
  text: string,
  tone: string
): Promise<TransformResponse> {
  const r = await fetch('/api/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, tone })
  });

  const data = (await r.json().catch(() => ({}))) as Partial<TransformResponse> & {
    error?: string;
  };

  if (!r.ok) {
    throw new Error(data.error ?? 'No fue posible transformar el mensaje.');
  }

  return data as TransformResponse;
}
