import test from 'node:test';
import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{validateCompanionPlacement}from'../src/games/milan-uprising/companion-placement.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url)));
test('bondgenoten en ghouls delen één plaats per stadsdistrict; personages blokkeren die plaats niet',()=>{
 const placements={'character-gangrel':'qt8','ally-reporter':'duomo'};
 for(const c of profile.components.filter(c=>['allies','ghouls'].includes(c.groupId))){
  const action={componentId:c.id,zoneId:'qt8'};assert.deepEqual(validateCompanionPlacement(profile,placements,action),action);
 }
 assert.throws(()=>validateCompanionPlacement(profile,placements,{componentId:'ghoul-fixer',zoneId:'duomo'}),/already contains/);
 assert.deepEqual(validateCompanionPlacement(profile,placements,{componentId:'ally-reporter',zoneId:'duomo'}),{componentId:'ally-reporter',zoneId:'duomo'});
 assert.deepEqual(placements,{'character-gangrel':'qt8','ally-reporter':'duomo'});
 for(const action of [{componentId:'character-gangrel',zoneId:'qt8'},{componentId:'ghoul-fixer',zoneId:'haven-1l'},{componentId:'ghoul-fixer',zoneId:'missing'}])assert.throws(()=>validateCompanionPlacement(profile,placements,action));
});
