const factions=['anarchs','camarilla','ambrose'];
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
// Read calibrated visible Influence only; Control and miniatures are separate authorities.
export function readGameplayInfluence(raw,mapping,summary){
  const fail=reason=>({ready:false,reason,locations:null});
  if(!raw.available||raw.width!==2560||raw.height!==1600||raw.mapGeometry!=='android-city-v1')return fail('Waiting for a calibrated Android city map.');
  const header=norm((raw.lines||[]).filter(l=>l.y<raw.height*.15).map(l=>l.text).join(' '));
  if(!header.includes('night')||!header.includes('suspicion')||!/(masquerade|masouerade)/.test(header))return fail('The city-map heading is incomplete.');
  if(/anerrorocc|indexwasoutofrange|lostnetworkconnection/.test(norm((raw.lines||[]).map(l=>l.text).join(' '))))return fail('Milan is showing an error.');
  const visuals=raw.visuals;
  if(!Array.isArray(visuals)||visuals.length!==30||new Set(visuals.map(v=>v.appSensor)).size!==30)return fail('The complete district map is not visible.');
  const locations=[];
  for(const v of visuals){
    const zone=mapping.find(z=>z.appSensor===v.appSensor&&z.appSensor>=10);
    if(!zone||!Number.isInteger(v.cubeCount)||v.cubeCount<0||v.cubeCount>3||(v.cubeCount>0?!factions.includes(v.cubeFaction):v.cubeFaction!=null))return fail('An Influence counter is unclear; keeping the previous map.');
    locations.push({zoneId:zone.zoneId,influence:Object.fromEntries(factions.map(f=>[f,v.cubeFaction===f?v.cubeCount:0]))});
  }
  if(summary?.unsupported?.length)return fail('A current summary instruction is not understood.');
  for(const update of summary?.updates||[])if(locations.find(l=>l.zoneId===update.zoneId)?.influence[update.faction]!==update.count)return fail('Map and current instructions differ; waiting for the animation.');
  const controls=visuals.filter(v=>factions.includes(v.controlFaction)).map(v=>({zoneId:mapping.find(z=>z.appSensor===v.appSensor).zoneId,faction:v.controlFaction}));
  return {ready:true,locations,controls,scope:'visible-influence-and-positive-control'};
}
