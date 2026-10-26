export const havenRoomTypes={unknown:'Room not identified',empty:'Empty room',personal:'Personal room',meditation:'Meditation room',living:'Living room',office:'Office',gym:'Gym',library:'Library',gallery:'Gallery'};
export function validateHavenRoom(room){
  if(!room||!Object.hasOwn(havenRoomTypes,room.type)||!['unknown','standard','upgraded'].includes(room.level)||typeof room.bonus!=='string'||room.bonus.length>160||/[\x00-\x1f]/.test(room.bonus))throw Error('Invalid Haven room.');
  return {type:room.type,level:room.level,bonus:room.bonus.trim()};
}
export function havenRoomLabel(room){
  if(!room)return {title:'Haven room',bonus:'Room not yet observed in Milan'};
  const value=validateHavenRoom(room);
  return {title:havenRoomTypes[value.type]+(value.level==='upgraded'?' · upgraded':value.level==='unknown'?' · level unconfirmed':''),bonus:value.bonus||'Room not yet observed in Milan'};
}
