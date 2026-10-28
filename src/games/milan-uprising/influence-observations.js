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
