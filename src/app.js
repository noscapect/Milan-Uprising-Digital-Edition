import { createTabletop } from './application/tabletop.js';
import { milanModule } from './games/milan-uprising/module.js';
import { cryptoDie } from './adapters/random.js';
import { downloadSession } from './adapters/download.js';
import { mountTabletop } from './ui/controller.js';
try {
  const response = await fetch('./data/games/milan-uprising/demo.json');
  if (!response.ok) throw Error('Spelgegevens laden mislukt');
  const profile = await response.json();
  const tabletop = createTabletop({ profile, module: milanModule, random: cryptoDie });
  mountTabletop(tabletop, downloadSession);
} catch (error) {
  document.getElementById('status').textContent = `Starten mislukt: ${error.message}`;
}
