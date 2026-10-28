import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createTabletop} from '../src/application/tabletop.js';import {milanModule} from '../src/games/milan-uprising/module.js';import {buildComponentInstructions} from '../src/games/milan-uprising/component-instructions.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url)));
test('alle 233 onderdelen kunnen expliciet worden geplaatst, verwijderd en van zijde voorzien',()=>{
 const table=createTabletop({profile,module:milanModule});
 for(const c of profile.components){const instruction={componentId:c.id,operation:'place',zoneId:'cadorna',...(c.faces?{faceId:c.faces[1].id}:{})};const result=buildComponentInstructions(profile,table.snapshot(),[instruction]);table.arrange(result);assert.equal(table.snapshot().placements[c.id],'cadorna');if(c.faces)assert.equal(table.snapshot().faces[c.id],c.faces[1].id);assert.equal(buildComponentInstructions(profile,table.snapshot(),[instruction]).changed,false);table.arrange(buildComponentInstructions(profile,table.snapshot(),[{componentId:c.id,operation:'remove'}]));assert.equal(table.snapshot().placements[c.id],null);}
 const restored=createTabletop({profile,module:milanModule});restored.restoreSession(table.exportSession());assert.deepEqual(restored.snapshot(),table.snapshot());
});
test('gemengde plaatsingen blijven atomair en bewaren andere onderdelen en fichezijden',()=>{
 const table=createTabletop({profile,module:milanModule});table.place('character-malkavian','haven-3r');table.place('investigation-1','portello');table.flip('investigation-1');const before=table.snapshot();
 for(const invalid of [{componentId:'unknown',operation:'place',zoneId:'cadorna'},{componentId:'investigation-2',operation:'place',zoneId:'unknown'},{componentId:'investigation-2',operation:'face',faceId:'unknown'}]){assert.throws(()=>buildComponentInstructions(profile,before,[{componentId:'npc-agnese-della-luna',operation:'place',zoneId:'cadorna'},invalid]));assert.deepEqual(table.snapshot(),before);}
 table.arrange(buildComponentInstructions(profile,before,[{componentId:'npc-agnese-della-luna',operation:'place',zoneId:'cadorna'},{componentId:'investigation-2',operation:'place',zoneId:'washington',faceId:'investigation'}]));assert.equal(table.snapshot().placements['character-malkavian'],'haven-3r');assert.equal(table.snapshot().faces['investigation-1'],'restricted');
 assert.throws(()=>buildComponentInstructions(profile,table.snapshot(),[{componentId:'ally-reporter',operation:'place',zoneId:'haven-1l'}]));
});
