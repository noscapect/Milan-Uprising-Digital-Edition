// Mirror the end of nightly deployment on a confirmed Milan Day screen.
// This only returns physical miniatures to stock; recruitment/cooldown stay in Milan.
export function buildCompanionCleanup(profile,state,{phase,stable}={}){
  if(profile.gameId!=='milan-uprising')throw Error('Companion cleanup requires a Milan profile.');
  const companions=new Set(profile.components.filter(c=>['allies','ghouls'].includes(c.groupId)).map(c=>c.id));
  const removed=phase==='day'&&stable===true?Object.entries(state.placements).filter(([id,zone])=>companions.has(id)&&zone!==null).map(([componentId,zoneId])=>({componentId,zoneId})):[];
  const ids=new Set(removed.map(c=>c.componentId));
  return {changed:removed.length>0,removed,placements:Object.entries(state.placements).filter(([id,zone])=>zone!==null&&!ids.has(id)).map(([componentId,zoneId])=>({componentId,zoneId})),faces:Object.entries(state.faces||{}).map(([componentId,faceId])=>({componentId,faceId}))};
}
