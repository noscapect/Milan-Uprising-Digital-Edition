// Saved groups guide a resumed setup; an unread/old profile must not limit a new game.
export function waitingMiniatures(components,{screen,roster,currentId=null}={}) {
  const companions=['companion-scan','component-placement'].includes(screen);
  const placed=new Set(roster?.placedIds||[]);
  const available=components.filter(c=>!placed.has(c.id)&&(companions?['allies','ghouls'].includes(c.groupId):c.groupId==='characters'));
  if(companions||!roster?.ready)return available.filter(c=>c.id!==currentId).map(c=>c.id);
  const pending=new Set((roster.characters||[]).filter(c=>c.stage==='pending').map(c=>c.componentId));
  return available.filter(c=>c.id!==currentId&&pending.has(c.id)).map(c=>c.id);
}
