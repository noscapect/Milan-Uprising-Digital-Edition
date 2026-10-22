import { createTabletop } from './application/tabletop.js';
import { milanModule } from './games/milan-uprising/module.js';
import { cryptoDie } from './adapters/random.js';
import { downloadSession } from './adapters/download.js';
import { createVirtualCore } from './adapters/virtual-core.js';
import { mountTabletop } from './ui/controller.js';
import { mountCampaignSetup } from './ui/campaign-setup.js';
try {
  const names = ['campaign', 'retail', 'table', 'interaction', 'demo'];
  const profiles = await Promise.all(names.map(async name => {
    const response = await fetch(`./data/games/milan-uprising/${name}.json`);
    if (!response.ok) throw Error('Spelgegevens laden mislukt');
    return response.json();
  }));
  function start() {
    const simulation = document.getElementById('profile').value === 'interaction';
    const profile = profiles[names.indexOf(document.getElementById('profile').value)];
    const tabletop = createTabletop({ profile, module:milanModule, random:cryptoDie });
    const core = simulation ? createVirtualCore(tabletop, Object.fromEntries(profile.zones.map(zone => [zone.id, zone.id]))) : null;
    const refresh = mountTabletop(tabletop, downloadSession, core);
    mountCampaignSetup(profile, tabletop, refresh);
    document.getElementById('status').textContent = simulation ? 'Lokale interactiestudie gestart. Registreer eerst een demopion.' : 'Tafel gestart. Kies een onderdeel uit de voorraad en klik een zone.';
  }
  document.getElementById('start-profile').onclick = start;
  start();
} catch (error) {
  document.getElementById('status').textContent = `Starten mislukt: ${error.message}`;
}
