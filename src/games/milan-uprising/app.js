import { createTabletop } from '../../application/tabletop.js';
import { milanModule } from './module.js';
import { cryptoDie } from '../../adapters/random.js';
import { downloadSession } from '../../adapters/download.js';
import { createVirtualCore } from '../../adapters/virtual-core.js';
import { mountTabletop } from './ui/controller.js';
import { mountCampaignSetup } from './ui/campaign-setup.js';
import {withLocationTiles} from './tile-tabletop.js';
try {
  const addons=await fetch('/api/game-addons').then(r=>r.json());
  if(!addons.enabled.includes('milan-uprising')){window.location.replace('/');throw Error('Activate the Milan Uprising add-on first.');}
  const addonWatch=setInterval(async()=>{try{const current=await fetch('/api/game-addons').then(r=>r.json());if(!current.enabled.includes('milan-uprising'))window.location.replace('/');}catch{window.location.replace('/');}},2000);
  window.addEventListener('pagehide',()=>clearInterval(addonWatch),{once:true});
  const names = ['city', 'city-expansions', 'campaign', 'retail', 'table', 'interaction', 'demo'];
  const profiles = await Promise.all(names.map(async name => {
    const response = await fetch(`/data/games/milan-uprising/${name}.json`);
    if (!response.ok) throw Error('Failed to load game data');
    return response.json();
  }));
  const artwork = await fetch('/games/milan-uprising/artwork/catalog.json').then(r => r.ok ? r.json() : null).catch(() => null);
  let dispose = () => {};
  for (const button of document.querySelectorAll('[data-dialog]')) button.onclick = () => document.getElementById(button.dataset.dialog).showModal();
  for (const button of document.querySelectorAll('[data-close-dialog]')) button.onclick = () => button.closest('dialog').close();
  function start() {
    dispose();
    const simulation = document.getElementById('profile').value === 'interaction';
    const profile = profiles[names.indexOf(document.getElementById('profile').value)];
    const baseTable = createTabletop({ profile, module:milanModule, random:cryptoDie });
    const city = ['city','city-expansions'].includes(document.getElementById('profile').value);
    const tabletop = city ? withLocationTiles(baseTable,profile) : baseTable;
    const core = simulation ? createVirtualCore(tabletop, Object.fromEntries(profile.zones.map(zone => [zone.id, zone.id]))) : null;
    const refresh = mountTabletop(tabletop, downloadSession, core, artwork, city);
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
