import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateAddonDefinitions} from './game-addons.mjs';
export function validateModule(module){
 validateAddonDefinitions({schemaVersion:1,games:[module]});
 if(module.schemaVersion!==1||typeof module.version!=='string')throw Error('Unsupported game module contract.');
 const inside=(path,prefix)=>typeof path==='string'&&path.startsWith(prefix)&&!path.includes('..')&&!path.includes('\\')&&!path.includes(':');
 for(const [key,path]of Object.entries(module.client||{}))if(!['table','app','control'].includes(key)||!inside(path,`src/games/${module.id}/`))throw Error('Game client must stay inside its own module.');
 if(!module.client?.table||!module.client?.app)throw Error('Game module needs a tabletop entry point.');
 if(module.linked&&(module.linked.source!==`integration/${module.id}`||!/^[-a-z0-9]+\.mjs$/.test(module.linked.entry)||!/^[-a-z0-9]+$/.test(module.linked.workspace)||!/^com\.[a-z0-9_.]+$/.test(module.androidPackage)||!Number.isSafeInteger(module.display?.width)||!Number.isSafeInteger(module.display?.height)||module.display.width<1||module.display.height<1))throw Error('Invalid linked game adapter.');
 if(module.acquisition){const a=module.acquisition,url=new URL(a.url);if(a.kind!=='unity-windows-zip'||url.protocol!=='https:'||url.hostname!=='teburu.com'||url.username||url.password||url.port||!url.pathname.startsWith('/downloads/')||!Number.isSafeInteger(a.bytes)||a.bytes<1||a.bytes>4*1024**3||!/^[a-f0-9]{64}$/.test(a.sha256)||!inside(a.recipe,`data/games/${module.id}/`))throw Error('Invalid reviewed artwork source.');}
 return structuredClone(module);
}
export async function loadGameModules(root,catalog){
 if(catalog.schemaVersion!==1||!Array.isArray(catalog.games))throw Error('Invalid module registry.');
 const games=[];
 for(const entry of catalog.games){
  if(!entry.module){if(entry.acquisition||entry.linked)throw Error('Linked and downloadable games need a versioned module manifest.');games.push(entry);continue;} // Read older archive-only catalogs during migration.
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)||entry.module!==`games/${entry.id}/module.json`)throw Error('Invalid registered module path.');
  const module=validateModule(JSON.parse(await readFile(resolve(root,entry.module),'utf8')));if(module.id!==entry.id)throw Error('Module identity does not match its registry entry.');games.push(module);
 }
 validateAddonDefinitions({schemaVersion:1,games});
 const privatePaths=['artwork-downloads','tce-machine.json','game-addons.json'],archives=new Set();for(const game of games){const archive=game.archive.toLowerCase();if(archives.has(archive))throw Error('Games must have independent artwork storage.');archives.add(archive);for(const location of [game.cacheDirectory,...(game.linked?[game.linked.workspace]:[])]){const path=location.toLowerCase();if(privatePaths.some(other=>path===other||path.startsWith(other+'/')||other.startsWith(path+'/')))throw Error('Games must have independent private storage.');privatePaths.push(path);}}
 return games;
}
