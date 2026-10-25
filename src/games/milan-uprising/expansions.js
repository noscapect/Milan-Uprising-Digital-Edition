import {validateProfile} from '../../engine/profile.js';
import {createTabletop} from '../../application/tabletop.js';
import {createSession,applyCommand} from '../../engine/session.js';
import {milanModule} from './module.js';

// Optional Milan inventory only. Official app expansion selection and rules stay in the app.
export function withExpansions(base,catalog,selected=catalog.packs.map(p=>p.id)){
  validateProfile(base);
  if(base.gameId!=='milan-uprising'||base.expansions||catalog.schemaVersion!==1||!Array.isArray(selected)||new Set(selected).size!==selected.length||selected.some(id=>!catalog.packs.some(p=>p.id===id)))throw Error('Invalid expansion selection');
  if(!selected.length)return structuredClone(base);
  const profile=structuredClone(base),packs=catalog.packs.filter(p=>selected.includes(p.id));
  profile.releaseId=base.releaseId+'-exp-'+packs.map(p=>p.id).join('-');
  profile.version=catalog.version;
  profile.expansions=packs.map(({id,label})=>({id,label}));
  profile.sources.push(...structuredClone(catalog.sources));
  profile.componentGroups.push(...structuredClone(catalog.componentGroups).filter(g=>packs.some(p=>p.components.some(c=>c.groupId===g.id))));
  profile.components.push(...packs.flatMap(p=>structuredClone(p.components).map(c=>({...c,expansionLabel:p.label}))));
  for(const zone of profile.zones)zone.capacity=Math.max(zone.capacity,profile.components.length);
  profile.title='Milan · base game + '+packs.length+' expansion packs';
  profile.contentNote='Expansion inventory. Copy placement from the official app. Story content and expansion activation remain in Milan.';
  for(const group of profile.componentGroups)if(group.id==='characters'||group.id==='npcs')group.description='Place as instructed by the official app.';
  return validateProfile(profile);
}

// Explicit additive conversion of our own table saves, never official campaign saves.
export function extendTableSession(saved,base,expanded){
  const old=createTabletop({profile:base,module:milanModule,random:()=>{throw Error('No new rolls during conversion');}});
  old.restoreSession(saved);
  if(base.gameId!==expanded.gameId||expanded.zones.length!==base.zones.length||base.zones.some(z=>!expanded.zones.some(n=>n.id===z.id&&n.capacity>=z.capacity))||base.components.some(c=>JSON.stringify(c)!==JSON.stringify(expanded.components.find(n=>n.id===c.id))))throw Error('Only additive inventory conversion is supported');
  let state=createSession(expanded,milanModule);
  for(const event of saved.state.events)state=applyCommand(state,{type:event.type,actorId:event.actorId,payload:event.payload,expectedRevision:state.revision},expanded,milanModule);
  const result={...structuredClone(saved),package:{gameId:expanded.gameId,releaseId:expanded.releaseId,version:expanded.version},state};
  createTabletop({profile:expanded,module:milanModule}).restoreSession(result);
  return result;
}
