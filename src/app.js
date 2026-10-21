import { createTabletop } from './application/tabletop.js';
import { milanModule } from './games/milan-uprising/module.js';
import { cryptoDie } from './adapters/random.js';
import { downloadSession } from './adapters/download.js';
import { createVirtualCore } from './adapters/virtual-core.js';
import { mountTabletop } from './ui/controller.js';
try {
  const profiles = await Promise.all(['interaction', 'demo'].map(async name => {
    const response = await fetch(`./data/games/milan-uprising/${name}.json`);
    if (!response.ok) throw Error('Spelgegevens laden mislukt');
    return response.json();
  }));
  function start() {
    const simulation = document.getElementById('profile').value === 'interaction';
    const profile = profiles[simulation ? 0 : 1];
    const tabletop = createTabletop({ profile, module:milanModule, random:cryptoDie });
    const core = simulation ? createVirtualCore(tabletop, Object.fromEntries(profile.zones.map(zone => [zone.id, zone.id]))) : null;
    mountTabletop(tabletop, downloadSession, core);
    document.getElementById('status').textContent = simulation ? 'Lokale interactiestudie gestart. Registreer eerst een demopion.' : 'Referentieprofiel gestart. Kies een pion en een cel.';
  }
  document.getElementById('start-profile').onclick = start;
  start();
} catch (error) {
  document.getElementById('status').textContent = `Starten mislukt: ${error.message}`;
}
