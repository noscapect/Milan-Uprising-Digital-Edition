// Group only the visual projection. Underlying cube identities remain intact.
export function groupInfluenceCubes(components){
  const groups=new Map();
  for(const c of components)if(c.kind==='cube'&&c.id.startsWith('influence-')){
    if(!groups.has(c.groupId))groups.set(c.groupId,[]);groups.get(c.groupId).push(c);
  }
  return components.flatMap(c=>{
    const members=groups.get(c.groupId);
    // Invalid sandbox counts are never silently clamped to the legal maximum.
    if(c.kind!=='cube'||!c.id.startsWith('influence-')||!members||members.length>3)return [c];
    if(c.id!==members[0].id)return [];
    return [{...c,influenceCount:members.length,stackMembers:members.map(m=>m.id)}];
  });
}
