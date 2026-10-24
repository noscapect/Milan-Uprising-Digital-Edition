import {buildInfluenceArrangement} from './influence-update.js';

// Apply explicit app outcomes only; no enemy or campaign rules are inferred.
export function buildBoardInstructions(profile,state,{influence=[],removeControl=[],characterMoves=[]}={}){
  if(profile.gameId!=='milan-uprising'||!Array.isArray(influence)||!Array.isArray(removeControl)||!Array.isArray(characterMoves)||(!influence.length&&!removeControl.length&&!characterMoves.length))throw Error('Missing board instructions.');
  if(new Set(removeControl).size!==removeControl.length||removeControl.some(id=>!profile.zones.some(z=>z.id===id&&z.area==='city')))throw Error('Unknown or duplicate location for Control removal.');
  const moved=new Set();
  for(const move of characterMoves){
    if(!move||!profile.components.some(c=>c.id===move.componentId&&c.groupId==='characters')||!profile.zones.some(z=>z.id===move.zoneId)||moved.has(move.componentId))throw Error('Invalid or duplicate character placement.');
    moved.add(move.componentId);
  }
  const arrangement=influence.length?buildInfluenceArrangement(profile,state,influence):{placements:Object.entries(state.placements).filter(([,zoneId])=>zoneId).map(([componentId,zoneId])=>({componentId,zoneId})),faces:Object.entries(state.faces||{}).map(([componentId,faceId])=>({componentId,faceId}))};
  const controls=new Set(profile.components.filter(c=>c.groupId==='control').map(c=>c.id));
  const placements=[...arrangement.placements.filter(p=>!moved.has(p.componentId)&&(!controls.has(p.componentId)||!removeControl.includes(p.zoneId))),...characterMoves.map(({componentId,zoneId})=>({componentId,zoneId}))];
  const next=Object.fromEntries(placements.map(p=>[p.componentId,p.zoneId]));
  return {changed:Object.entries(state.placements).some(([id,zone])=>(next[id]||null)!==zone),placements,faces:arrangement.faces};
}
