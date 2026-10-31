const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
// Parse completed feed outcomes, never instructions to choose a destination.
export function readCompletedMovement(text,zones){
 if(/removedfrom(?:the)?map$/.test(normalize(text)))return null;
 const compact=normalize(text),direct=compact.match(/^(.+?)movedto(.+)$/),from=compact.match(/^(.+?)movedfrom(.+)$/);
 if(!direct&&!from)return null;
 const city=zones.filter(zone=>zone.area==='city');
 if(direct)return {name:direct[1],zoneId:city.find(zone=>normalize(zone.label)===direct[2])?.id||null,originZoneId:null};
 // Match complete known origin names: Washington itself contains "to".
 const matches=[];
 for(const origin of city)for(const target of city)if(from[2]===normalize(origin.label)+'to'+normalize(target.label))matches.push({name:from[1],zoneId:target.id,originZoneId:origin.id});
 return matches.length===1?matches[0]:{name:from[1],zoneId:null,originZoneId:null};
}
