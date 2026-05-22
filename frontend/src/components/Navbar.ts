import { Logo } from './Logo';

export function Navbar(): string {
  return /* html */ `
    <nav class="navbar">
      <div class="nav-container">
        <a href="/" class="nav-brand">
          ${Logo({ width: 48, height: 24 })}
          <span class="brand-text">IA SIYAYO</span>
        </a>
        <div class="nav-menu">
          <button class="nav-link active" data-nav="inicio">Inicio</button>
          <button class="nav-link" data-nav="diccionario">Diccionario Infinito</button>
          <button class="nav-link" data-nav="about">Sobre IA SIYAYO</button>
        </div>
      </div>
    </nav>
  `;
}

const NAV_TARGETS: Record<string, string> = {
  inicio:      '#inicio',
  diccionario: '#diccionario',
  about:       '#sobre-siyayo',
};

export function initNavbar(root: HTMLElement): void {
  const links = root.querySelectorAll<HTMLButtonElement>('.nav-link');

  const setActive = (nav: string) => {
    links.forEach((l) => l.classList.toggle('active', l.dataset.nav === nav));
  };

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const nav = link.dataset.nav ?? '';
      const target = NAV_TARGETS[nav];
      if (target) {
        const el = document.querySelector<HTMLElement>(target);
        if (el) {
          const offset = 72; // altura del navbar fijo
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
      setActive(nav);
    });
  });

  // Actualiza el botón activo al hacer scroll
  const sections = Object.entries(NAV_TARGETS).map(([nav, sel]) => ({
    nav,
    el: document.querySelector<HTMLElement>(sel),
  }));

  const onScroll = () => {
    const scrollMid = window.scrollY + window.innerHeight / 3;
    let current = 'inicio';
    for (const { nav, el } of sections) {
      if (el && el.offsetTop <= scrollMid) current = nav;
    }
    setActive(current);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
