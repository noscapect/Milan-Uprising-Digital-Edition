import {buildInfluenceArrangement} from './influence-update.js';

// Apply explicit app outcomes only; no enemy or campaign rules are inferred.
export function buildBoardInstructions(profile,state,{influence=[],removeControl=[]}={}){
  if(profile.gameId!=='milan-uprising'||!Array.isArray(influence)||!Array.isArray(removeControl)||(!influence.length&&!removeControl.length))throw Error('Missing board instructions.');
  if(new Set(removeControl).size!==removeControl.length||removeControl.some(id=>!profile.zones.some(z=>z.id===id&&z.area==='city')))throw Error('Unknown or duplicate location for Control removal.');
  const arrangement=influence.length?buildInfluenceArrangement(profile,state,influence):{placements:Object.entries(state.placements).filter(([,zoneId])=>zoneId).map(([componentId,zoneId])=>({componentId,zoneId})),faces:Object.entries(state.faces||{}).map(([componentId,faceId])=>({componentId,faceId}))};
  const controls=new Set(profile.components.filter(c=>c.groupId==='control').map(c=>c.id));
  const placements=arrangement.placements.filter(p=>!controls.has(p.componentId)||!removeControl.includes(p.zoneId));
  const next=Object.fromEntries(placements.map(p=>[p.componentId,p.zoneId]));
  return {changed:Object.entries(state.placements).some(([id,zone])=>(next[id]||null)!==zone),placements,faces:arrangement.faces};
}
