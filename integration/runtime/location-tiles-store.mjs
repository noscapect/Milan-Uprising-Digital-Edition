import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {emptyLocationTiles,clearLocationTiles,validateLocationTiles,setLocationTile,applyObservedHavenRooms} from '../../src/games/milan-uprising/location-tiles.js';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
const profile=JSON.parse(readFileSync(new URL('../../data/games/milan-uprising/city.json',import.meta.url)));
const file=process.env.MILAN_FEEDBACK_STATE_DIR?pathToFileURL(join(resolve(process.env.MILAN_FEEDBACK_STATE_DIR),'tablet-chronicle-tiles.json')):new URL('./tablet-chronicle-tiles.json',import.meta.url);
let state=emptyLocationTiles();try{state=validateLocationTiles(JSON.parse(readFileSync(file)),profile.zones);}catch(error){if(error.code!=='ENOENT')throw error;}
export const boardTiles=()=>structuredClone(state);
export function resetBoardTiles(){state=clearLocationTiles(state);writeFileSync(file,JSON.stringify(state,null,2));return boardTiles();}
export function updateBoardTile(action){
  const next=setLocationTile(state,profile.zones,action);
  if(next.revision!==state.revision){const temp=new URL(file.href+'.tmp');writeFileSync(temp,JSON.stringify(next,null,2));renameSync(temp,file);state=next;}
  return {locationTiles:boardTiles()};
}
export function syncObservedHavenRooms(rooms){
  const next=applyObservedHavenRooms(state,profile.zones,rooms);
  if(next.revision!==state.revision){const temp=new URL(file.href+'.tmp');writeFileSync(temp,JSON.stringify(next,null,2));renameSync(temp,file);state=next;}
  return boardTiles();
}
