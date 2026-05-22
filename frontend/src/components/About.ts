export function About(): string {
  return /* html */ `
    <section class="about-section" id="sobre-siyayo">
      <div class="about-wrap">

        <header class="about-header">
          <span class="section-eyebrow">Sobre IA SIYAYO</span>
          <h2 class="about-title">
            Una herramienta para<br>
            <span class="highlight-brand">reescribir tu lenguaje</span>
          </h2>
          <p class="about-lead">
            El lenguaje que usas contigo mismo define lo que crees posible.
            IA SIYAYO te ayuda a transformar frases limitantes en afirmaciones
            que abren posibilidades — en segundos.
          </p>
        </header>

        <div class="about-pillars">
          <article class="about-pillar">
            <div class="about-pillar-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 class="about-pillar-title">El problema</h3>
            <p class="about-pillar-body">
              Decimos cosas como "no puedo", "soy un fracaso" o "no lo merezco"
              sin darnos cuenta de que esas frases se convierten en creencias
              que guían nuestras decisiones cada día.
            </p>
          </article>

          <article class="about-pillar">
            <div class="about-pillar-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12l3 3 5-5"/>
              </svg>
            </div>
            <h3 class="about-pillar-title">La solución</h3>
            <p class="about-pillar-body">
              IA SIYAYO traduce esa frase al instante: misma situación,
              lenguaje diferente. No es positivismo vacío — es una reformulación
              concreta que el cerebro puede aceptar y actuar sobre ella.
            </p>
          </article>

          <article class="about-pillar">
            <div class="about-pillar-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3 class="about-pillar-title">El resultado</h3>
            <p class="about-pillar-body">
              Con práctica constante, el lenguaje interno cambia. Los pensamientos
              cambian. Las acciones cambian. SIYAYO — <em>Sí, yo puedo</em> — no
              es un eslogan: es el punto de partida.
            </p>
          </article>
        </div>

        <div class="about-rule" aria-hidden="true"></div>

        <div class="about-cta">
          <p class="about-cta-text">Empieza ahora. Tu primera traducción tarda menos de 10 segundos.</p>
          <a href="#inicio" class="about-cta-btn">
            Traducir mi primera frase
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

      </div>
    </section>
  `;
}
