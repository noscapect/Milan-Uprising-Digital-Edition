// Read-only transcription of visible English day-summary cards, calibrated to this tablet.
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function readPhaseSummary(raw, zones, characters=[], {allowCity=false}={}) {
  if (!raw.available || !Array.isArray(raw.lines)) return null;
  const all = normalize(raw.lines.map(l => l.text).join(' '));
  const header = raw.lines.filter(l => l.y < raw.height * .15).map(l => normalize(l.text)).join('');
  const phase=/night[0-9oi]+sunset/.test(header)?'sunset':/night[0-9oi]+day/.test(header)?'day':/night[0-9oi]+hour[0-9oi]+/.test(header)&&/night[0-9oi]+hasbegun/.test(all)?'night':allowCity&&raw.mapGeometry==='android-city-v1'&&/night[0-9oi]+hour[0-9oi]+/.test(header)?'city':null;
  if (!phase || /anerrorocc|indexwasoutofrange/.test(all)) return null;
  const lines = raw.lines.filter(l => l.x > raw.width * .50 && l.x < raw.width * .70 && l.y > raw.height * .25 && l.y < raw.height * .87).sort((a,b) => a.y-b.y || a.x-b.x);
  const groups = [];
  for (const line of lines) {
    if (!groups.length || line.y - groups.at(-1).at(-1).y > raw.height * .05) groups.push([]);
    groups.at(-1).push(line);
  }
  const updates = [], unsupported = [], removeControl = [], announcements = [], characterMoves=[],investigationLocations=[];
  const factions = { stambrose: 'ambrose', camarilla: 'camarilla', anarch: 'anarchs', anarchs: 'anarchs' };
  const seen = new Set();
  for (const group of groups) {
    const text = group.map(l => l.text).join(' '), compact = normalize(text);
    if (compact === 'dayhasbegun' || compact === 'idayhasbegun' || compact === 'stambrosestartstoperformitsactions') continue;
    if(/^[a-z]?sunsetphasehas(begun)?$/.test(compact)||/^night[0-9oi]+hasbegun$/.test(compact))continue;
    if(compact.includes('nextencounter')){
      const encounter=compact.match(/^([a-z0-9]+)nextencounterin([a-z0-9]+)$/);
      const origin=encounter&&zones.find(z=>z.area==='city'&&normalize(z.label)===encounter[1]);
      const destination=encounter&&zones.find(z=>z.area==='city'&&normalize(z.label)===encounter[2]);
      if(!origin||!destination)unsupported.push(text);
      else if(!investigationLocations.includes(destination.id))investigationLocations.push(destination.id);
      continue;
    }
    if(phase==='night'&&!compact.startsWith('controlremoved')&&/moved|moveto/.test(compact)){
      const match=compact.match(/^(.+?)movedto(.+)$/);
      const character=match&&characters.find(c=>normalize(c.label.split('·')[0])===match[1]);
      const zone=match&&zones.find(z=>z.area==='city'&&normalize(z.label)===match[2]);
      if(!character||!zone||characterMoves.some(m=>m.componentId===character.id))unsupported.push(text);
      else characterMoves.push({componentId:character.id,zoneId:zone.id});
      continue;
    }
    if(compact==='newghoulfixer'){announcements.push({kind:'ghoul',componentId:'ghoul-fixer'});continue;}
    const removal=compact.match(/^controlremovedin([a-z0-9]+)$/);
    if(removal){const zone=zones.find(z=>z.area==='city'&&normalize(z.label)===removal[1]);if(!zone||removeControl.includes(zone.id))unsupported.push(text);else removeControl.push(zone.id);continue;}
    const gained=compact.match(/^(stambrose|camarilla|anarchs?)isnowcontrolling([a-z0-9]+)$/);
    if(gained){const location=zones.find(z=>z.area==='city'&&normalize(z.label)===gained[2]);if(!location)unsupported.push(text);else announcements.push({kind:'control',zoneId:location.id,faction:factions[gained[1]]});continue;}
    const match = compact.match(/^([a-z0-9]+?)has(?:now|flow)([0-3oi])(stambrose|camarilla|anarchs?)influence$/);
    const zone = match && zones.find(z => z.area === 'city' && normalize(z.label) === match[1]);
    if (!zone) { if (/influence|hasnow|control/.test(compact)) unsupported.push(text); continue; }
    const faction = factions[match[3]], key = zone.id + ':' + faction;
    if (seen.has(key)) { unsupported.push(text); continue; }
    seen.add(key); updates.push({ zoneId: zone.id, faction, count: match[2]==='o'?0:match[2]==='i'?1:Number(match[2]) });
  }
  return { phase, updates, removeControl, announcements, characterMoves, investigationLocations, unsupported, complete: false, scope: 'visible-summary-cards' };
}
export function readDaySummary(raw,zones){const summary=readPhaseSummary(raw,zones);return summary?.phase==='day'?summary:null;}
