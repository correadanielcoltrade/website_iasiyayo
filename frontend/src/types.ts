export type ToneKey = 'practico' | 'gratitud' | 'empoderado' | 'elevado';

export interface Tone {
  key: ToneKey | string;
  label: string;
}

export type TransformSource = 'cache' | 'preflight' | 'llm';

export interface TransformRequest {
  text: string;
  tone: string;
}

export interface TransformResponse {
  transformed: string;
  source: TransformSource;
  tone: string;
  model?: string;
}

export interface ApiError {
  error: string;
}

export interface HistoryEntry {
  ts: number;
  tone: string;
  input: string;
  output: string;
}
