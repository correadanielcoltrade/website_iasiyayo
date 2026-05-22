import { Logo } from './Logo';

export function Footer(): string {
  return /* html */ `
    <footer class="footer">
      <div class="footer-mark">
        ${Logo({ width: 140, height: 70 })}
      </div>
      <p class="footer-lead">Un lenguaje nuevo. Una realidad nueva.</p>
      <div class="footer-meta">
        <span>SÍ</span>
        <span class="dot">·</span>
        <span>YA</span>
        <span class="dot">·</span>
        <span>YO</span>
      </div>
    </footer>
  `;
}
