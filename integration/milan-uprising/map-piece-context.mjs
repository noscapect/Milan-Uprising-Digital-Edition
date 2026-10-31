const compact=text=>text.toLowerCase().replace(/[^a-z]/g,'');
// Only the calibrated movement dialog may use dimmed, partially covered map
// recognition. Other dialogs and arbitrary movement text do not qualify.
export function mapPieceContext(raw){
 if(raw.width!==2560||raw.height!==1600)return null;
 if(!raw.available||/lostnetworkconnection|unrecoverablenetworkerror|anerrorocc|indexwasoutofrange/.test(compact((raw.lines||[]).map(l=>l.text).join(' '))))return null;
 const prompt=compact((raw.lines||[]).filter(l=>l.x>600&&l.x<1800&&l.y>530&&l.y<1075).map(l=>l.text).join(' '));
 if(prompt.includes('movementmoveyourcharactertoanyotherlocation'))return {overlay:true};
 if(raw.mapGeometry==='android-city-v1')return {overlay:false};
 // Portraits can cover the observer's border strip. Let the image worker
 // independently register the map on this recognized city scene instead.
 const header=(raw.lines||[]).filter(l=>l.y<240);
 if(header.some(l=>compact(l.text)==='masquerade')&&header.some(l=>compact(l.text).includes('suspicion'))&&header.some(l=>/night[0-9oi]+hour[0-9oi]+/.test(l.text.toLowerCase().replace(/[^a-z0-9]/g,''))))return {overlay:false};
 return null;
}
