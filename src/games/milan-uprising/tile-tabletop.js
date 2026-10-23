import {emptyLocationTiles,validateLocationTiles,setLocationTile,decorateLocationTiles} from './location-tiles.js';
export function withLocationTiles(tabletop,profile){
  let tiles=emptyLocationTiles();const listeners=new Set();
  return {...tabletop,
    project:()=>decorateLocationTiles(tabletop.project(),tiles),
    subscribe:listener=>{listeners.add(listener);const off=tabletop.subscribe(listener);return()=>{listeners.delete(listener);off();};},
    setLocationTile:async(zoneId,kind,tile)=>{tiles=setLocationTile(tiles,profile.zones,{zoneId,kind,...tile,expectedRevision:tiles.revision});for(const listener of listeners)listener();},
    exportSession:()=>({...tabletop.exportSession(),locationTiles:structuredClone(tiles)}),
    restoreSession:saved=>{const next=saved.locationTiles?validateLocationTiles(saved.locationTiles,profile.zones):emptyLocationTiles();tabletop.restoreSession(saved);tiles=next;for(const listener of listeners)listener();}
  };
}
