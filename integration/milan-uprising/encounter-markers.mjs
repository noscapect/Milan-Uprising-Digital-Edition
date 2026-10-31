import {readFeedCards} from './feed-cards.mjs';
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function readEncounterMarkers(raw,zones){
 const groups=readFeedCards(raw);if(!groups)return null;
 const paths=new Map(),invalid=new Set();
 for(const group of groups){
  const text=normalize(group.map(l=>l.text).join(' ')),match=text.match(/^(.+?)(next|final)encounterin(.+)$/);if(!match)continue;
  const origin=zones.find(z=>z.area==='city'&&normalize(z.label)===match[1]),target=zones.find(z=>z.area==='city'&&normalize(z.label)===match[3]);
  if(!origin)continue;if(!target){invalid.add(origin.id);continue;}
  if(!paths.has(origin.id))paths.set(origin.id,[]);paths.get(origin.id).push(target.id);
 }
 const valid=[...paths].filter(([id])=>!invalid.has(id)).map(([,path])=>path);if(!valid.length)return null;
 const investigationLocations=[...new Set(valid.map(path=>path.at(-1)))];
 const removeInvestigation=[...new Set(valid.flatMap(path=>path.slice(0,-1)))].filter(id=>!investigationLocations.includes(id));
 return {investigationLocations,removeInvestigation,scope:'visible-ordered-encounter-cards'};
}
