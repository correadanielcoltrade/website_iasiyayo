// Light mode only — el toggle de tema fue removido del diseño.
// Se conservan las firmas exportadas para compatibilidad con imports existentes.

type Theme = 'light';

export function getTheme(): Theme {
  return 'light';
}

export function setTheme(_theme: Theme): void {
  document.documentElement.setAttribute('data-theme', 'light');
}

export function initTheme(): void {
  setTheme('light');
}

export function toggleTheme(): Theme {
  return 'light';
}
