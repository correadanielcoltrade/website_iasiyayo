interface Step {
  num: number;
  icon: string;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    num: 1,
    icon: /* html */ `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>`,
    title: 'Escribes tu frase',
    desc: 'Expresa cualquier pensamiento negativo o limitante.'
  },
  {
    num: 2,
    icon: /* html */ `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/>
      </svg>`,
    title: 'SIYAYO interpreta',
    desc: 'Detecta la polaridad negativa y aplica reglas semánticas.'
  },
  {
    num: 3,
    icon: /* html */ `
      <svg viewBox="0 0 60 30" width="34" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M15,15 C15,6 30,6 30,15 C30,24 45,24 45,15 C45,6 30,6 30,15 C30,24 15,24 15,15 Z"/>
      </svg>`,
    title: 'Traduce',
    desc: 'Transforma la negación en afirmación exacta.'
  },
  {
    num: 4,
    icon: /* html */ `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>`,
    title: 'Recibes claridad',
    desc: 'Obtienes una frase positiva, directa y expansiva.'
  }
];

function renderStep(s: Step): string {
  return /* html */ `
    <div class="step">
      <div class="step-icon">${s.icon}</div>
      <div class="step-head">
        <span class="step-num">${s.num}</span>
        <h3>${s.title}</h3>
      </div>
      <p>${s.desc}</p>
    </div>
  `;
}

export function HowItWorks(): string {
  return /* html */ `
    <section class="how-works">
      <h2>Así funciona <span class="highlight-brand">IA SIYAYO</span></h2>
      <div class="steps-grid">
        ${STEPS.map(renderStep).join('')}
      </div>
    </section>
  `;
}
