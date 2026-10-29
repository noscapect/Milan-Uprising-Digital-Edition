const factions=['anarchs','camarilla','ambrose'];
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
export function readSetupMap(raw,mapping){
  const text=norm((raw.lines||[]).map(l=>l.text).join(' '));
  if(!text.includes('componentssetup'))return null;
  const fail=reason=>({ready:false,reason,locations:null});
  if(raw.width!==2560||raw.height!==1600)return fail('Unsupported setup screen size');
  const expected={};
  for(const [i,heading]of ['anarchplayers','camarillafaction','stambrosefaction'].entries()){
    const title=raw.lines.find(l=>l.x>raw.width*.5&&norm(l.text)===heading);
    if(!title)return fail('The faction legend is incomplete');
    expected[factions[i]]={};
    for(const kind of ['control','influence']){
      const countText=l=>norm(l.text).replace(/^o(?=x(?:control|influence)$)/,'0');
      const line=raw.lines.find(l=>l.x>raw.width*.5&&l.y>title.y&&l.y<title.y+raw.height*.1&&new RegExp('^[0-9il]+x'+kind+'$').test(countText(l)));
      if(!line)return fail('The faction totals could not be read');
      expected[factions[i]][kind]=Number(countText(line).split('x')[0].replace(/[il]/g,'1'));
    }
  }
  const visuals=raw.visuals;
  if(!Array.isArray(visuals)||visuals.length!==30||new Set(visuals.map(v=>v.appSensor)).size!==30)return fail('The complete district map is not visible');
  const actual=Object.fromEntries(factions.map(f=>[f,{control:0,influence:0}]));
  const locations=[];
  for(const v of visuals){
    const zone=mapping.find(z=>z.appSensor===v.appSensor&&z.appSensor>=10);
    if(!zone||!Number.isInteger(v.cubeCount)||v.cubeCount<0||v.cubeCount>3||v.cubeCount>0&&!factions.includes(v.cubeFaction)||v.controlFaction&&!factions.includes(v.controlFaction))return fail('A district could not be read reliably');
    if(v.cubeCount)actual[v.cubeFaction].influence+=v.cubeCount;
    if(v.controlFaction)actual[v.controlFaction].control++;
    locations.push({zoneId:zone.zoneId,control:v.controlFaction||'none',influence:Object.fromEntries(factions.map(f=>[f,v.cubeFaction===f?v.cubeCount:0])),restricted:false});
  }
  if(factions.some(f=>['control','influence'].some(k=>actual[f][k]!==expected[f][k])))return fail('The map does not match the faction legend; waiting for a clear screen');
  return {ready:true,locations,totals:actual};
}
