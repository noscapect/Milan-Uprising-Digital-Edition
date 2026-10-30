import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTabletop } from '../src/application/tabletop.js';
import { milanModule } from '../src/games/milan-uprising/module.js';
import { milanMap } from '../src/games/milan-uprising/presentation/milan-map.js';
const profile = JSON.parse(await readFile(new URL('../data/games/milan-uprising/city.json', import.meta.url),'utf8'));

test('opdrachten buiten de UI melden wijzigingen, herstel en import via dezelfde headless sessie', () => {
  const table=createTabletop({profile,module:milanModule,random:()=>7});
  const seen=[];const stop=table.subscribe(()=>seen.push(table.snapshot().revision));
  table.place('character-brujah','duomo');
  assert.deepEqual(seen,[1]);
  assert.throws(()=>table.place('unknown','duomo'));assert.deepEqual(seen,[1]);
  table.undo();table.redo();const saved=table.exportSession();table.reset();table.restoreSession(saved);
  assert.deepEqual(seen,[1,0,1,0,1]);
  assert.equal(table.snapshot().placements['character-brujah'],'duomo');
  stop();table.place('character-brujah','navigli');assert.equal(seen.length,5);
  assert.throws(()=>table.subscribe(null));
});

test('de fysieke kaart heeft veertig complete visuele gebieden met ankers binnen hun klikgebied', () => {
  assert.deepEqual(Object.keys(milanMap.zones).sort(),profile.zones.map(z=>z.id).sort());
  const contains=(point,polygon)=>{
    let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const [xi,yi]=polygon[i], [xj,yj]=polygon[j];
      if((yi>point[1])!==(yj>point[1]) && point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi) inside=!inside;
    }
    return inside;
  };
  for(const [id,g] of Object.entries(milanMap.zones)){
    assert(g.polygon.length>=3,id);
    assert(g.polygon.every(([x,y])=>x>=0&&x<=milanMap.width&&y>=0&&y<=milanMap.height),id);
    assert(contains(g.anchor,g.polygon),`${id}: anker buiten klikgebied`);
  }
  const session=createTabletop({profile,module:milanModule,random:()=>7}).exportSession();
  assert(!JSON.stringify(session).includes('polygon'));
  assert(!JSON.stringify(session).includes('anchor'));
});
