interface LogoProps {
  width?: number;
  height?: number;
  /** Mantenido por compatibilidad — ya no se aplica glow. */
  glow?: boolean;
}

/**
 * Logo SIYAYO — símbolo infinito ♾️ en dorado.
 * Trazo limpio, gradiente metálico sutil, sin glow/blur.
 * Escala proporcionalmente al width/height pasados.
 */
export function Logo({ width = 56, height = 28 }: LogoProps = {}): string {
  // ID único por instancia para evitar colisiones entre múltiples logos en la página.
  const uid = `siyayo-gold-${Math.random().toString(36).slice(2, 9)}`;
  // Stroke-width relativo: el viewBox es 100x50, así que 6 ≈ 12% de la altura.
  const strokeWidth = 6;

  return /* html */ `
    <svg class="logo-inline" viewBox="0 0 100 50" width="${width}" height="${height}" aria-label="SIYAYO" role="img">
      <defs>
        <linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stop-color="#F4D03F"/>
          <stop offset="55%" stop-color="#D4A017"/>
          <stop offset="100%" stop-color="#B68A1A"/>
        </linearGradient>
      </defs>
      <path
        d="M22,25 C22,11 38,11 50,25 C62,39 78,39 78,25 C78,11 62,11 50,25 C38,39 22,39 22,25 Z"
        fill="none"
        stroke="url(#${uid})"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}
