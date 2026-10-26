export const havenRoomTypes={unknown:'Room not identified',empty:'Empty room',personal:'Personal room',meditation:'Meditation room',living:'Living room',office:'Office',gym:'Gym',library:'Library',gallery:'Gallery'};
// Paraphrased reference values checked against local Milan 1.0.9 room/action
// definitions. These describe room actions; they never apply player statistics.
// Room positions and effects are fixed. Only the recorded purchased/upgraded side varies.
export const fixedHavenRooms=Object.freeze({
  'haven-1l':'personal','haven-1r':'personal','haven-2l':'personal','haven-2r':'personal',
  'haven-3l':'living','haven-3r':'meditation','haven-4l':'office','haven-4r':'gym','haven-5l':'library','haven-5r':'gallery'
});
const roomBonuses={
  empty:{standard:'No room action',upgraded:'No room action'},
  personal:{standard:'+1 Willpower',upgraded:'+2 Willpower'},
  meditation:{standard:'2 Willpower: +2 XP or -3 Hunger',upgraded:'1 Willpower: +2 XP or -3 Hunger'},
  living:{standard:'3 Resources: +1 AP next turn',upgraded:'3 Resources: all characters +1 AP next turn'},
  office:{standard:'Room not purchased',upgraded:'2 Resources: -2 Suspicion'},
  gym:{standard:'Room not purchased',upgraded:'1 Willpower: +1 Physical next night'},
  library:{standard:'Room not purchased',upgraded:'1 Willpower: +1 Mental next night'},
  gallery:{standard:'Room not purchased',upgraded:'1 Willpower: +1 Social next night'}
};
export function referenceHavenRoom(type,level){
  if(!Object.hasOwn(roomBonuses,type)||!['standard','upgraded'].includes(level))throw Error('Choose a known room type and side.');
  return {type,level,bonus:roomBonuses[type][level]};
}
export function fixedHavenRoom(zoneId,level='standard'){
  const type=fixedHavenRooms[zoneId];return type?referenceHavenRoom(type,level==='upgraded'?'upgraded':'standard'):null;
}
export function validateHavenRoom(room){
  if(!room||!Object.hasOwn(havenRoomTypes,room.type)||!['unknown','standard','upgraded'].includes(room.level)||typeof room.bonus!=='string'||room.bonus.length>160||/[\x00-\x1f]/.test(room.bonus))throw Error('Invalid Haven room.');
  return {type:room.type,level:room.level,bonus:room.bonus.trim()};
}
export function havenRoomLabel(room){
  if(!room)return {title:'Haven room',bonus:'Choose a room side'};
  const value=validateHavenRoom(room);
  return {title:havenRoomTypes[value.type]+(value.level==='upgraded'?' · upgraded':value.level==='unknown'?' · level unconfirmed':''),bonus:value.bonus||'Choose a room side'};
}
