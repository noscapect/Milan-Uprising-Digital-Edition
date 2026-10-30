import{bonusTypes}from'../../src/games/milan-uprising/location-tiles.js';
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function readLocationBonusOutcomes(raw,zones){
 if(!raw.available||raw.mapGeometry!=='android-city-v1'||!Array.isArray(raw.lines))return null;
 if(/anerrorocc|indexwasoutofrange|lostnetworkconnection/.test(normalize(raw.lines.map(l=>l.text).join(' '))))return null;
 const lines=raw.lines.filter(l=>l.x>raw.width*.50&&l.x<raw.width*.70&&l.y>raw.height*.20&&l.y<raw.height*.87).sort((a,b)=>a.y-b.y||a.x-b.x),groups=[];
 for(const line of lines){if(!groups.length||line.y-groups.at(-1).at(-1).y>raw.height*.05)groups.push([]);groups.at(-1).push(line);}
 const latest=new Map(),unsupported=[];
 for(const group of groups){const text=group.map(l=>l.text).join(' '),compact=normalize(text),match=compact.match(/^(.+?)locationbonusrevealedin(.+)$/);if(!match)continue;
  const zone=zones.find(z=>z.area==='city'&&normalize(z.label)===match[2]),value=Object.entries(bonusTypes).find(([id,label])=>id!=='unknown'&&normalize(label)===match[1])?.[0];
  if(!zone||!value){if(zone)latest.set(zone.id,null);unsupported.push(text);continue;}
  latest.set(zone.id,{zoneId:zone.id,kind:'bonus',face:'visible',value});
 }
 const tiles=[...latest.values()].filter(Boolean).sort((a,b)=>a.zoneId.localeCompare(b.zoneId));return tiles.length||unsupported.length?{tiles,unsupported,scope:'explicit-location-bonus-reveals'}:null;
}
