import { transformText } from '@/services/api';
import { saveHistoryEntry } from '@/services/history';
import { toast } from '@/services/toast';
import type { TransformSource } from '@/types';

export function TransformCard(): string {
  return /* html */ `
    <div class="transform-card">
      <div class="io-grid">
        <div class="io-section">
          <label for="input" class="io-label">Escribe tu frase</label>
          <textarea
            id="input"
            class="io-textarea"
            placeholder="Ejemplo: No puedo lograrlo"
            maxlength="500"
            rows="5"
            spellcheck="true"
          ></textarea>
          <div class="io-meta"><span id="counter">0</span>/500</div>
        </div>

        <div class="io-arrow">
          <div class="arrow-circle" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="io-section">
          <label class="io-label">Traducción Infinita</label>
          <div id="result-box" class="io-result" hidden>
            <p id="result-text" class="result-content"></p>
            <span id="result-source" class="result-source"></span>
          </div>
          <div class="io-meta"><span id="result-counter">0</span>/500</div>
        </div>
      </div>

      <div class="card-actions">
        <button id="btn-transform" class="btn-primary" type="button">
          <svg class="btn-logo" viewBox="0 0 100 50" width="28" height="14" aria-hidden="true">
            <path d="M22,25 C22,11 38,11 50,25 C62,39 78,39 78,25 C78,11 62,11 50,25 C38,39 22,39 22,25 Z"
              fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="btn-text">Traducir</span>
          <span class="spinner" aria-hidden="true"></span>
        </button>
        <button id="btn-copy" class="btn-secondary" type="button" hidden>Copiar</button>
        <button id="btn-clear" class="btn-ghost" type="button" hidden>Limpiar</button>
      </div>

      <div id="error-box" class="error-box" role="alert" hidden></div>
    </div>

    <p class="card-footer">
      <span class="footer-icon">⚡</span>
      <span>Traducción exacta. Sin vueltas. Sin límites.</span>
    </p>
  `;
}

export async function initTransformCard(root: HTMLElement): Promise<void> {
  const $ = <T extends HTMLElement>(sel: string): T =>
    root.querySelector<T>(sel) as T;

  const input = $<HTMLTextAreaElement>('#input');
  const counter = $<HTMLSpanElement>('#counter');
  const resultCounter = $<HTMLSpanElement>('#result-counter');
  const btnTransform = $<HTMLButtonElement>('#btn-transform');
  const btnClear = $<HTMLButtonElement>('#btn-clear');
  const btnCopy = $<HTMLButtonElement>('#btn-copy');
  const resultBox = $<HTMLDivElement>('#result-box');
  const resultText = $<HTMLParagraphElement>('#result-text');
  const resultSource = $<HTMLSpanElement>('#result-source');
  const errorBox = $<HTMLDivElement>('#error-box');

  const DEFAULT_TONE = 'default';

  const updateCounter = (): void => {
    counter.textContent = String(input.value.length);
  };
  input.addEventListener('input', updateCounter);
  updateCounter();

  async function handleTransform(): Promise<void> {
    const text = input.value.trim();
    hideError();
    if (!text) {
      showError('Escribe un mensaje antes de transformarlo.');
      input.focus();
      return;
    }
    setLoading(true);
    try {
      const data = await transformText(text, DEFAULT_TONE);
      showResult(data.transformed, data.source);
      saveHistoryEntry({
        ts: Date.now(),
        tone: DEFAULT_TONE,
        input: text,
        output: data.transformed
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No fue posible conectar con el servidor.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  function setLoading(loading: boolean): void {
    btnTransform.classList.toggle('is-loading', loading);
    btnTransform.disabled = loading;
  }

  function showResult(text: string, source: TransformSource): void {
    resultText.textContent = text;
    resultCounter.textContent = String(text.length);
    resultSource.textContent = sourceLabel(source);
    resultBox.hidden = false;
    btnCopy.hidden = false;
    btnClear.hidden = false;
  }

  function sourceLabel(s: TransformSource): string {
    switch (s) {
      case 'cache':
        return 'desde memoria';
      case 'preflight':
        return 'sin IA';
      case 'llm':
        return 'generado por IA';
      default:
        return '';
    }
  }

  function showError(msg: string): void {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function hideError(): void {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  btnTransform.addEventListener('click', handleTransform);
  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') void handleTransform();
  });
  btnClear.addEventListener('click', () => {
    input.value = '';
    updateCounter();
    resultBox.hidden = true;
    btnCopy.hidden = true;
    btnClear.hidden = true;
    hideError();
    input.focus();
  });
  btnCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resultText.textContent ?? '');
      toast('Copiado');
    } catch {
      toast('No se pudo copiar');
    }
  });
}
