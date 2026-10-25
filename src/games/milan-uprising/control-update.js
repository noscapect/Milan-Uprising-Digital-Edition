import{reconcileDistrictMap}from'./campaign-setup.js';
// Positive observations only: an unread/occluded icon never means no Control.
export function buildVisibleControlArrangement(profile,state,updates){
 if(!Array.isArray(updates))throw Error('Control observations required.');
 const seen=new Set(),factions=['anarchs','camarilla','ambrose'];
 for(const u of updates){if(!u||seen.has(u.zoneId)||!profile.zones.some(z=>z.id===u.zoneId&&z.area==='city')||!factions.includes(u.faction))throw Error('Invalid Control observation.');seen.add(u.zoneId);}
 const groups={anarchs:'anarch-cubes',camarilla:'camarilla-cubes',ambrose:'ambrose-cubes'};
 const locations=profile.zones.filter(z=>z.area==='city').map(z=>{
  const occupants=profile.components.filter(c=>state.placements[c.id]===z.id),control=occupants.find(c=>c.groupId==='control');
  return {zoneId:z.id,control:updates.find(u=>u.zoneId===z.id)?.faction||(control?state.faces[control.id]:'none'),restricted:false,influence:Object.fromEntries(factions.map(f=>[f,occupants.filter(c=>c.groupId===groups[f]).length]))};
 });
 const generated=reconcileDistrictMap(profile,state,locations),controls=new Set(profile.components.filter(c=>c.groupId==='control').map(c=>c.id));
 const placements=[...Object.entries(state.placements).filter(([id,zone])=>zone&&!controls.has(id)).map(([componentId,zoneId])=>({componentId,zoneId})),...generated.placements.filter(p=>controls.has(p.componentId))];
 const faces={...state.faces,...Object.fromEntries(generated.faces.filter(f=>controls.has(f.componentId)).map(f=>[f.componentId,f.faceId]))};
 const next=Object.fromEntries(placements.map(p=>[p.componentId,p.zoneId]));
 return {changed:profile.components.some(c=>(state.placements[c.id]||null)!==(next[c.id]||null))||Object.entries(faces).some(([id,face])=>state.faces[id]!==face),placements,faces:Object.entries(faces).map(([componentId,faceId])=>({componentId,faceId}))};
}
