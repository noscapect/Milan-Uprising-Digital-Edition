import {validateCompanionPlacement} from './companion-placement.js';

// Copy explicit app outcomes; this does not execute campaign rules or sensor input.
export function buildComponentInstructions(profile,state,instructions){
  if(profile.gameId!=='milan-uprising'||!Array.isArray(instructions)||!instructions.length||instructions.length>profile.components.length)throw Error('Provide component instructions.');
  const placements={...state.placements},faces={...state.faces},seen=new Set();
  for(const instruction of instructions){
    const {componentId,operation,zoneId,faceId}=instruction||{};
    const component=profile.components.find(c=>c.id===componentId);
    if(!component||seen.has(componentId))throw Error('Unknown or duplicate component.');
    seen.add(componentId);
    if(operation==='place'){
      if(!profile.zones.some(z=>z.id===zoneId))throw Error('Unknown component destination.');
      placements[componentId]=zoneId;
    }else if(operation==='remove')placements[componentId]=null;
    else if(operation!=='face')throw Error('Unknown component operation.');
    if(faceId!==undefined){
      if(!component.faces?.some(f=>f.id===faceId))throw Error('Unknown component side.');
      faces[componentId]=faceId;
    }else if(operation==='face')throw Error('Choose a component side.');
  }
  // Validate the final arrangement, so swaps and paired removals remain atomic.
  for(const id of seen){const component=profile.components.find(c=>c.id===id);
    if(placements[id]&&['allies','ghouls'].includes(component.groupId))validateCompanionPlacement(profile,placements,{componentId:id,zoneId:placements[id]});
  }
  return {changed:[...seen].some(id=>placements[id]!==state.placements[id]||faces[id]!==state.faces?.[id]),placements:Object.entries(placements).filter(([,zoneId])=>zoneId).map(([componentId,zoneId])=>({componentId,zoneId})),faces:Object.entries(faces).map(([componentId,faceId])=>({componentId,faceId}))};
}
