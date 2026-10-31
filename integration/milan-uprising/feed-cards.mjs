const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
// Known Android feed layouts. Isolated map counters to the left of the indented
// miniature-card text are not part of a character name or destination.
export function readFeedCards(raw){
 if(!raw.available||!Array.isArray(raw.lines))return null;
 const masquerade=raw.width===2560&&raw.height===1600&&raw.lines.some(l=>l.y<raw.height*.15&&normalize(l.text)==='masquerade');
 if(raw.mapGeometry!=='android-city-v1'&&!masquerade)return null;
 if(/anerrorocc|indexwasoutofrange|lostnetworkconnection/.test(normalize(raw.lines.map(l=>l.text).join(' '))))return null;
 const lines=raw.lines.filter(l=>l.x>raw.width*.50&&l.x<raw.width*.70&&l.y>raw.height*.20&&l.y<raw.height*.87&&!(/^\d+$/.test(l.text.trim())&&l.x<raw.width*.57)).sort((a,b)=>a.y-b.y||a.x-b.x),groups=[];
 for(const line of lines){if(!groups.length||line.y-groups.at(-1).at(-1).y>raw.height*.05)groups.push([]);groups.at(-1).push(line);}
 return groups;
}
