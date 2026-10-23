import { createTabletop } from './application/tabletop.js';
import { milanModule } from './games/milan-uprising/module.js';
import { cryptoDie } from './adapters/random.js';
import { downloadSession } from './adapters/download.js';
import { createVirtualCore } from './adapters/virtual-core.js';
import { mountTabletop } from './ui/controller.js';
import { mountCampaignSetup } from './ui/campaign-setup.js';
import {withLocationTiles} from './games/milan-uprising/tile-tabletop.js';
try {
  const names = ['city', 'campaign', 'retail', 'table', 'interaction', 'demo'];
  const profiles = await Promise.all(names.map(async name => {
    const response = await fetch(`./data/games/milan-uprising/${name}.json`);
    if (!response.ok) throw Error('Failed to load game data');
    return response.json();
  }));
  const artwork = await fetch('./local-artwork/catalog.json').then(r => r.ok ? r.json() : null).catch(() => null);
  let dispose = () => {};
  for (const button of document.querySelectorAll('[data-dialog]')) button.onclick = () => document.getElementById(button.dataset.dialog).showModal();
  for (const button of document.querySelectorAll('[data-close-dialog]')) button.onclick = () => button.closest('dialog').close();
  function start() {
    dispose();
    const simulation = document.getElementById('profile').value === 'interaction';
    const profile = profiles[names.indexOf(document.getElementById('profile').value)];
    const baseTable = createTabletop({ profile, module:milanModule, random:cryptoDie });
    const tabletop = document.getElementById('profile').value === 'city' ? withLocationTiles(baseTable,profile) : baseTable;
    const core = simulation ? createVirtualCore(tabletop, Object.fromEntries(profile.zones.map(zone => [zone.id, zone.id]))) : null;
    const refresh = mountTabletop(tabletop, downloadSession, core, artwork, document.getElementById('profile').value === 'city');
    dispose = refresh.dispose;
    mountCampaignSetup(profile, tabletop, refresh);
    document.getElementById('open-setup').disabled = !profile.campaignSetup;
    document.getElementById('settings-dialog').close();
    document.getElementById('status').textContent = simulation ? 'Local interaction study started. Register a demo miniature first.' : 'Inspect a district, or select a component from stock to place it.';
  }
  document.getElementById('start-profile').onclick = start;
  start();
} catch (error) {
  document.getElementById('status').textContent = `Startup failed: ${error.message}`;
}
