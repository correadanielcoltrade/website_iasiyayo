interface DictEntry {
  n: string;  // negativa
  p: string;  // positiva
  c?: string; // categoría
}

const PAGE_SIZE = 9;

const CATEGORY_LABELS: Record<string, string> = {
  autoestima: 'Autoestima',
  dinero: 'Dinero',
  trabajo: 'Trabajo',
  relaciones: 'Relaciones',
  miedo: 'Miedo',
  salud: 'Salud',
  fracaso: 'Fracaso',
  tiempo: 'Tiempo',
  edad: 'Edad',
  cambio: 'Cambio',
  comparacion: 'Comparación',
  pasado: 'Pasado',
  decisiones: 'Decisiones',
  imposible: 'Posibilidad',
  habitos: 'Hábitos',
  vida: 'Vida'
};

export function Dictionary(): string {
  return /* html */ `
    <section class="dictionary-teaser" id="diccionario">
      <div class="dict-content">
        <span class="section-eyebrow">Diccionario Infinito</span>
        <h3>Diccionario <span class="highlight-brand">Infinito</span></h3>
        <p>Equivalencias curadas para transformar tu lenguaje en cualquier momento, sin pasar por la IA.</p>
        <button class="btn-dict" type="button" id="btn-dictionary" aria-expanded="false" aria-controls="dict-book">
          <span class="btn-dict-text">Explorar el diccionario</span>
          <svg class="btn-dict-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <div class="dict-book" id="dict-book" aria-hidden="true">
        <div class="dict-book-inner">
          <div class="dict-search">
            <svg class="dict-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.3-4.3"/>
            </svg>
            <input
              type="search"
              id="dict-search-input"
              class="dict-search-input"
              placeholder="Busca una frase: 'no puedo', 'dinero', 'miedo'…"
              autocomplete="off"
              spellcheck="false"
            />
            <span class="dict-count" id="dict-count" aria-live="polite"></span>
          </div>

          <div class="dict-loading" id="dict-loading">Cargando diccionario…</div>

          <div class="dict-list" id="dict-list" role="list" hidden></div>

          <div class="dict-empty" id="dict-empty" hidden>
            <p>Sin resultados para tu búsqueda.</p>
            <a href="#input" class="dict-empty-cta">Tradúcela con IA SIYAYO →</a>
          </div>

          <div class="dict-pagination" id="dict-pagination" hidden>
            <button class="dict-page-btn" id="dict-prev" type="button" aria-label="Página anterior">‹ Anterior</button>
            <span class="dict-page-info" id="dict-page-info">Página 1 de 1</span>
            <button class="dict-page-btn" id="dict-next" type="button" aria-label="Página siguiente">Siguiente ›</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ────────────────────────────────────────────────────────────
// Estado interno del módulo
// ────────────────────────────────────────────────────────────
let entries: DictEntry[] = [];
let filtered: DictEntry[] = [];
let currentPage = 1;
let loaded = false;

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}

async function loadEntries(): Promise<void> {
  if (loaded) return;
  const res = await fetch('/dictionary.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  entries = await res.json();
  filtered = entries;
  loaded = true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlight(text: string, query: string): string {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const normText = normalize(text);
  const normQuery = normalize(query);
  const idx = normText.indexOf(normQuery);
  if (idx < 0) return safe;
  // Mapeo aproximado de índices normalizados a originales:
  // como normalize quita diacríticos pero conserva longitud para la mayoría de
  // los caracteres latinos, lo usamos como aproximación segura.
  const end = idx + normQuery.length;
  return `${escapeHtml(text.slice(0, idx))}<mark>${escapeHtml(text.slice(idx, end))}</mark>${escapeHtml(text.slice(end))}`;
}

function renderEntry(e: DictEntry, absoluteIndex: number, query: string, featured: boolean): string {
  const num = String(absoluteIndex + 1).padStart(3, '0');
  const cat = e.c ? CATEGORY_LABELS[e.c] || e.c : '';
  const klass = featured ? 'dict-card dict-card--featured' : 'dict-card';
  return /* html */ `
    <article class="${klass}" role="listitem">
      <header class="dict-card-meta">
        <span class="dict-card-num">N.º ${num}</span>
        ${cat ? `<span class="dict-card-cat">${escapeHtml(cat)}</span>` : ''}
      </header>
      <p class="dict-card-neg">
        <span class="dict-card-tag" aria-hidden="true">Antes</span>
        <span class="dict-card-neg-text">${highlight(e.n, query)}</span>
      </p>
      <div class="dict-card-rule" aria-hidden="true"></div>
      <p class="dict-card-pos">
        <span class="dict-card-tag dict-card-tag--pos" aria-hidden="true">SIYAYO</span>
        <span class="dict-card-pos-text">${highlight(e.p, query)}</span>
      </p>
    </article>
  `;
}

function renderList(query: string): void {
  const list = document.getElementById('dict-list') as HTMLDivElement | null;
  const empty = document.getElementById('dict-empty') as HTMLDivElement | null;
  const pagination = document.getElementById('dict-pagination') as HTMLDivElement | null;
  const count = document.getElementById('dict-count') as HTMLSpanElement | null;
  const pageInfo = document.getElementById('dict-page-info') as HTMLSpanElement | null;
  if (!list || !empty || !pagination || !count || !pageInfo) return;

  const total = filtered.length;
  count.textContent = total === 1 ? '1 frase' : `${total.toLocaleString('es')} frases`;

  if (total === 0) {
    list.hidden = true;
    list.innerHTML = '';
    pagination.hidden = true;
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  list.hidden = false;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  list.innerHTML = slice
    .map((e, i) => renderEntry(e, start + i, query, i === 0))
    .join('');

  pagination.hidden = totalPages <= 1;
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

  const prev = document.getElementById('dict-prev') as HTMLButtonElement | null;
  const next = document.getElementById('dict-next') as HTMLButtonElement | null;
  if (prev) prev.disabled = currentPage <= 1;
  if (next) next.disabled = currentPage >= totalPages;
}

function applyFilter(rawQuery: string): void {
  const q = normalize(rawQuery);
  if (!q) {
    filtered = entries;
  } else {
    filtered = entries.filter(
      (e) => normalize(e.n).includes(q) || normalize(e.p).includes(q) || (e.c && normalize(e.c).includes(q))
    );
  }
  currentPage = 1;
  renderList(rawQuery.trim());
}

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

export function initDictionary(root: HTMLElement): void {
  const btn = root.querySelector<HTMLButtonElement>('#btn-dictionary');
  const book = root.querySelector<HTMLDivElement>('#dict-book');
  const input = root.querySelector<HTMLInputElement>('#dict-search-input');
  const loading = root.querySelector<HTMLDivElement>('#dict-loading');
  const list = root.querySelector<HTMLUListElement>('#dict-list');
  const btnText = root.querySelector<HTMLSpanElement>('.btn-dict-text');

  if (!btn || !book) return;

  btn.addEventListener('click', async () => {
    const isOpen = book.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    book.setAttribute('aria-hidden', String(!isOpen));
    if (btnText) btnText.textContent = isOpen ? 'Cerrar diccionario' : 'Explorar el diccionario';

    if (!isOpen) return;

    if (!loaded) {
      try {
        await loadEntries();
        if (loading) loading.hidden = true;
        if (list) list.hidden = false;
        renderList('');
        // Focus al buscador para que el usuario empiece a escribir
        setTimeout(() => input?.focus(), 250);
      } catch (err) {
        if (loading) loading.textContent = 'No se pudo cargar el diccionario.';
        console.error(err);
        return;
      }
    } else {
      setTimeout(() => input?.focus(), 250);
    }

    // Scroll suave hacia el libro la primera vez
    setTimeout(() => {
      book.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  });

  if (input) {
    const onInput = debounce(() => applyFilter(input.value), 120);
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        applyFilter('');
      }
    });
  }

  const prev = root.querySelector<HTMLButtonElement>('#dict-prev');
  const next = root.querySelector<HTMLButtonElement>('#dict-next');
  prev?.addEventListener('click', () => {
    currentPage = Math.max(1, currentPage - 1);
    renderList(input?.value.trim() || '');
    book.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  next?.addEventListener('click', () => {
    currentPage += 1;
    renderList(input?.value.trim() || '');
    book.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
