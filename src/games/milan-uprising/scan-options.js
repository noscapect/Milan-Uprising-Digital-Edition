// Saved groups guide a resumed setup; an unread/old profile must not limit a new game.
export const isScanScene=screen=>['character-scan','setup-placement','setup-placement-reading','companion-scan','component-placement'].includes(screen);
export function unplacedMiniatures(roster,screen){
  return ['character-scan','setup-placement','setup-placement-reading'].includes(screen)?(roster?.characters||[]).filter(c=>c.stage!=='registered'&&!roster?.placedIds?.includes(c.componentId)).map(c=>c.componentId):[];
}
export function waitingMiniatures(components,{screen,roster,currentId=null,placements={}}={}) {
  const companions=['companion-scan','component-placement'].includes(screen);
  const placed=new Set([...(roster?.placedIds||[]),...(!isScanScene(screen)?Object.entries(placements).filter(([,zone])=>zone!==null).map(([id])=>id):[])]);
  const available=components.filter(c=>!placed.has(c.id)&&(companions?['allies','ghouls'].includes(c.groupId):c.groupId==='characters'));
  if(companions||!roster?.ready)return available.filter(c=>c.id!==currentId).map(c=>c.id);
  const pending=new Set((roster.characters||[]).filter(c=>c.stage==='pending').map(c=>c.componentId));
  return available.filter(c=>c.id!==currentId&&pending.has(c.id)).map(c=>c.id);
}
