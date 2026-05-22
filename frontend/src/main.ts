import './styles.css';

import { initTheme } from './services/theme';
import { BgOrbs } from './components/BgOrbs';
import { Navbar, initNavbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TransformCard, initTransformCard } from './components/TransformCard';
import { Quote } from './components/Quote';
import { HowItWorks } from './components/HowItWorks';
import { Dictionary, initDictionary } from './components/Dictionary';
import { About } from './components/About';
import { Footer } from './components/Footer';

function App(): string {
  return /* html */ `
    ${BgOrbs()}
    ${Navbar()}

    <section class="hero-section" id="inicio">
      <div class="hero-wrap">
        ${Hero()}
        ${TransformCard()}
      </div>
    </section>

    ${Quote()}

    <section class="how-section">
      ${HowItWorks()}
    </section>

    ${Dictionary()}

    ${About()}

    ${Footer()}
  `;
}

async function bootstrap(): Promise<void> {
  initTheme();

  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) {
    console.error('No se encontró #app en el DOM');
    return;
  }

  root.innerHTML = App();

  initNavbar(root);
  await initTransformCard(root);
  initDictionary(root);
}

void bootstrap();
