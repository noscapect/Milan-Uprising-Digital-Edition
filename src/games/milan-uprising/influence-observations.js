const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');

// A malformed card blocks its own district, never a separate district's outcome.
// Do not guess missing numbers or reinterpret unknown locations.
export function independentInfluenceUpdates(profile,summary){
  const blocked=new Set();
  for(const text of summary?.unsupported||[]){
    const compact=normalize(text);
    for(const zone of profile.zones.filter(z=>z.area==='city')){
      if(compact.startsWith(normalize(zone.label)+'has'))blocked.add(zone.id);
    }
  }
  return (summary?.updates||[]).filter(update=>!blocked.has(update.zoneId));
}

// Only an unreadable Control card blocks its district's Control observation.
// A malformed Influence card supplies no evidence against a Control change.
export function independentControlUpdates(profile,summary){
 const blocked=new Set(),latest=new Map();
 for(const text of summary?.unsupported||[]){
  const compact=normalize(text);if(!compact.includes('control'))continue;
  for(const zone of profile.zones.filter(zone=>zone.area==='city'))if(compact.endsWith(normalize(zone.label)))blocked.add(zone.id);
 }
 for(const item of summary?.announcements||[])if(item.kind==='control'&&profile.zones.some(zone=>zone.id===item.zoneId&&zone.area==='city')&&['anarchs','camarilla','ambrose'].includes(item.faction))latest.set(item.zoneId,{zoneId:item.zoneId,faction:item.faction});
 return [...latest.values()].filter(item=>!blocked.has(item.zoneId));
}
