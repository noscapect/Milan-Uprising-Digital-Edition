// Images decorate a projection only; session data and engine remain artwork-free.
export function withArtwork(view, catalog, { locationArtwork = true } = {}) {
  const url = id => {
    const value = catalog?.assets?.[id];
    return typeof value === 'string' && /^(?:\/local-artwork|\/games\/[a-z0-9-]+\/artwork)\/[a-z0-9-]+\.png$/.test(value) ? value : null;
  };
  const decorate = component => ({ ...component,
    icon: url(catalog?.faces?.[component.faceId]) || url(catalog?.components?.[component.id]?.icon) || url(catalog?.groups?.[component.groupId]),
    portrait: url(catalog?.components?.[component.id]?.detail)
  });
  const roomImage=zone=>{
    const room=zone.havenRoom;if(zone.area!=='haven'||!room)return null;
    const variant={'haven-1l':1,'haven-1r':2,'haven-2l':3,'haven-2r':4}[zone.id];
    return url('haven-'+room.type+(room.type==='personal'&&variant?'-'+variant:'')+(room.level==='upgraded'?'-upgraded':''));
  };
  return { ...view, components:view.components.map(decorate),
    zones:view.zones.map(zone => ({ ...zone,roomArtwork:locationArtwork?roomImage(zone):null,background:locationArtwork ? roomImage(zone)||url(catalog?.zones?.[zone.id]?.background) : null, occupants:zone.occupants.map(decorate) })) };
}
export function artworkImage(url, className = '') {
  const image = document.createElement('img'); image.src = url; image.alt = ''; image.className = className;
  image.loading = 'lazy'; image.onerror = () => image.remove(); return image;
}

// Presentation only: confirmed session state and exports are never changed here.
export function withPendingPlacement(view,action){
  if(!action||!view.zones.some(z=>z.id===action.zoneId))return view;
  const component=view.components.find(c=>c.id===action.componentId);
  if(!component)return view;
  const pending={...component,pendingPlacement:true};
  return {...view,components:view.components.map(c=>c.id===pending.id?pending:c),zones:view.zones.map(z=>({...z,occupants:[...z.occupants.filter(c=>c.id!==pending.id),...(z.id===action.zoneId?[pending]:[])]}))};
}
