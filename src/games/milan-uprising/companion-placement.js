export const isCompanion=component=>['allies','ghouls'].includes(component?.groupId);

// A physical placement constraint only. Availability, Hunger and cooldown stay in Milan.
export function validateCompanionPlacement(profile,placements,{componentId,zoneId}){
  if(!isCompanion(profile.components.find(c=>c.id===componentId)))throw Error('Choose an ally or ghoul.');
  if(!profile.zones.some(z=>z.id===zoneId&&z.area==='city'))throw Error('Place allies and ghouls in a city district, not a Haven room.');
  if(profile.components.some(c=>c.id!==componentId&&isCompanion(c)&&placements[c.id]===zoneId))throw Error('This location already contains an ally or ghoul. Choose another district.');
  return {componentId,zoneId};
}
