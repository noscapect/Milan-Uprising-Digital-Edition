const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
// This calibrated post-Haven scene confirms phase progress, not a missing portrait.
export function readSunriseCleanup(raw,components){
 if(!raw.available||raw.mapGeometry!=='android-city-v1'||raw.width!==2560||raw.height!==1600)return null;
 const lines=raw.lines.filter(l=>l.x>raw.width*.50&&l.x<raw.width*.70&&l.y>raw.height*.20&&l.y<raw.height*.87).sort((a,b)=>a.y-b.y||a.x-b.x),groups=[];
 for(const line of lines){if(!groups.length||line.y-groups.at(-1).at(-1).y>raw.height*.05)groups.push([]);groups.at(-1).push(line);}
 const cards=groups.map(g=>normalize(g.map(l=>l.text).join(' ')));
 if(!cards.includes('sunrisephasehasbegun'))return null;
 const matches=cards.flatMap(card=>{const m=card.match(/^remove(.+)frommap$/);return m?components.filter(c=>['allies','ghouls'].includes(c.groupId)&&normalize(c.label.split('·')[0])===m[1]):[]});
 return matches.length===1?{componentId:matches[0].id,scope:'explicit-sunrise-companion-cleanup'}:null;
}
