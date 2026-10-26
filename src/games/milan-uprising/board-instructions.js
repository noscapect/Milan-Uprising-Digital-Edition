import {buildInfluenceArrangement} from './influence-update.js';

// Apply explicit app outcomes only; no enemy or campaign rules are inferred.
export function buildBoardInstructions(profile,state,{influence=[],removeControl=[],characterMoves=[],investigationLocations=[],removeInvestigation=[]}={}){
  if(profile.gameId!=='milan-uprising'||!Array.isArray(influence)||!Array.isArray(removeControl)||!Array.isArray(characterMoves)||(!influence.length&&!removeControl.length&&!characterMoves.length&&!investigationLocations.length&&!removeInvestigation.length))throw Error('Missing board instructions.');
  if(new Set(removeControl).size!==removeControl.length||removeControl.some(id=>!profile.zones.some(z=>z.id===id&&z.area==='city')))throw Error('Unknown or duplicate location for Control removal.');
  if(!Array.isArray(investigationLocations)||new Set(investigationLocations).size!==investigationLocations.length||investigationLocations.some(id=>!profile.zones.some(z=>z.id===id&&z.area==='city')))throw Error('Unknown or duplicate Investigation location.');
  if(!Array.isArray(removeInvestigation)||new Set(removeInvestigation).size!==removeInvestigation.length||removeInvestigation.some(id=>!profile.zones.some(z=>z.id===id&&z.area==='city')))throw Error('Unknown or duplicate Investigation removal.');
  const moved=new Set();
  for(const move of characterMoves){
    if(!move||!profile.components.some(c=>c.id===move.componentId&&c.groupId==='characters')||!profile.zones.some(z=>z.id===move.zoneId)||moved.has(move.componentId))throw Error('Invalid or duplicate character placement.');
    moved.add(move.componentId);
  }
  const arrangement=influence.length?buildInfluenceArrangement(profile,state,influence):{placements:Object.entries(state.placements).filter(([,zoneId])=>zoneId).map(([componentId,zoneId])=>({componentId,zoneId})),faces:Object.entries(state.faces||{}).map(([componentId,faceId])=>({componentId,faceId}))};
  const controls=new Set(profile.components.filter(c=>c.groupId==='control').map(c=>c.id));
  const faces=Object.fromEntries(arrangement.faces.map(f=>[f.componentId,f.faceId]));
  const removed=profile.components.filter(c=>c.groupId==='investigation'&&faces[c.id]==='investigation'&&removeInvestigation.includes(state.placements[c.id]));
  const removedIds=new Set(removed.map(c=>c.id));
  const placements=[...arrangement.placements.filter(p=>!removedIds.has(p.componentId)&&!moved.has(p.componentId)&&(!controls.has(p.componentId)||!removeControl.includes(p.zoneId))),...characterMoves.map(({componentId,zoneId})=>({componentId,zoneId}))];
  for(const zoneId of investigationLocations){
    const tokens=[...removed,...profile.components.filter(c=>c.groupId==='investigation'&&!removedIds.has(c.id))];
    if(placements.some(p=>p.zoneId===zoneId&&tokens.some(c=>c.id===p.componentId)&&faces[p.componentId]==='investigation'))continue;
    const token=tokens.find(c=>!placements.some(p=>p.componentId===c.id));
    if(!token)throw Error('No Investigation token available.');
    placements.push({componentId:token.id,zoneId});faces[token.id]='investigation';
  }
  const next=Object.fromEntries(placements.map(p=>[p.componentId,p.zoneId]));
  return {changed:Object.entries(state.placements).some(([id,zone])=>(next[id]||null)!==zone),placements,faces:Object.entries(faces).map(([componentId,faceId])=>({componentId,faceId}))};
}
