import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{createTabletop}from'../src/application/tabletop.js';import{milanModule}from'../src/games/milan-uprising/module.js';import{buildCompanionCleanup}from'../src/games/milan-uprising/companion-cleanup.js';
const profile=JSON.parse(readFileSync(new URL('../data/games/milan-uprising/city-expansions.json',import.meta.url)));
test('bevestigde dagfase ruimt ingezette basis- en uitbreidingscompanions op zonder andere onderdelen te wijzigen',()=>{
 const t=createTabletop({profile,module:milanModule}),cities=profile.zones.filter(z=>z.area==='city');profile.components.filter(c=>['allies','ghouls'].includes(c.groupId)).forEach((c,i)=>t.place(c.id,cities[i].id));t.place('character-ministry','haven-2r');t.place('investigation-1','portello');t.place('influence-anarchs-1','qt8');t.place('control-anarchs-camarilla-1','qt8');
 const before=t.snapshot(),result=buildCompanionCleanup(profile,before,{phase:'day',stable:true});assert.equal(result.removed.length,15);t.arrange(result);const after=t.snapshot();
 for(const c of profile.components)assert.equal(after.placements[c.id],['allies','ghouls'].includes(c.groupId)?null:before.placements[c.id]);assert.deepEqual(after.faces,before.faces);assert.ok(before.placements['ghoul-fixer']);assert.equal(buildCompanionCleanup(profile,after,{phase:'day',stable:true}).changed,false);
});
test('onbevestigde beelden en andere fasen ruimen geen companions op',()=>{
 const t=createTabletop({profile,module:milanModule});t.place('ghoul-fixer','city-life');const state=t.snapshot();for(const context of [{phase:'day',stable:false},{phase:'day'}, {phase:'night',stable:true},{phase:'sunset',stable:true},{phase:'other',stable:true},{}]){const result=buildCompanionCleanup(profile,state,context);assert.equal(result.changed,false);assert.ok(result.placements.some(p=>p.componentId==='ghoul-fixer'));}
});
