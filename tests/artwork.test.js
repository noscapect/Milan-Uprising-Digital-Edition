import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadLocalArtwork } from '../server/local-artwork.mjs';
import { withArtwork } from '../src/games/milan-uprising/presentation/artwork.js';
import { readFile } from 'node:fs/promises';

test('lokale artworkcatalogus deelt alleen geselecteerde PNG-bestanden, geen private paden', async () => {
  const root = await mkdtemp(join(tmpdir(),'milan-art-'));
  try {
    assert.equal((await loadLocalArtwork(root)).catalog.available,false);
    await mkdir(join(root,'images'));
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
    await writeFile(join(root,'images','portrait.png'),png);
    await writeFile(join(root,'secret.png'),png);
    await writeFile(join(root,'images','fake.png'),'private text');
    const manifest = { format:'tabletop-local-artwork',schemaVersion:1,gameId:'milan-uprising',assets:{portrait:{file:'portrait.png'},escape:{file:'../secret.png'},fake:{file:'fake.png'}},components:{hero:{icon:'portrait',detail:'escape'}},branding:{map:'escape'} };
    await writeFile(join(root,'manifest.json'),JSON.stringify(manifest));
    const {catalog,files} = await loadLocalArtwork(root);
    assert.equal(catalog.available,true);assert.equal(files.size,1);
    assert.deepEqual(catalog.components.hero,{icon:'portrait'});
    assert.deepEqual(catalog.assets,{portrait:'/local-artwork/portrait.png'});
    assert(!JSON.stringify(catalog).includes(root));
    manifest.schemaVersion=99;
    await writeFile(join(root,'manifest.json'),JSON.stringify(manifest));
    assert.equal((await loadLocalArtwork(root)).catalog.available,false);
  } finally { await rm(root,{recursive:true,force:true}); }
});

test('artwork volgt fichezijde en blijft buiten domeinprojectie; oude kaart krijgt geen verkeerde locatiebeelden', () => {
  const piece={id:'control',faceId:'camarilla'};
  const view={components:[piece],zones:[{id:'sempione',occupants:[piece]}]};
  const original=structuredClone(view);
  const catalog={assets:{red:'/local-artwork/red.png',purple:'/local-artwork/purple.png',scene:'/local-artwork/scene.png'},components:{control:{icon:'red'}},faces:{camarilla:'purple'},zones:{sempione:{background:'scene'}}};
  const result=withArtwork(view,catalog,{locationArtwork:false});
  assert.equal(result.zones[0].background,null);
  assert.equal(result.zones[0].occupants[0].icon,'/local-artwork/purple.png');
  assert.deepEqual(view,original);
  catalog.assets.purple='https://external.invalid/image.png';
  assert.equal(withArtwork(view,catalog).components[0].icon,'/local-artwork/red.png');
});

test('scherpe appkaart corrigeert drie districten zonder oude sessies stilzwijgend om te zetten', async () => {
  const read=async name=>JSON.parse(await readFile(new URL(`../data/games/milan-uprising/${name}.json`,import.meta.url),'utf8'));
  const old=await read('campaign'), city=await read('city');
  assert.notEqual(old.releaseId,city.releaseId);
  assert.equal(city.presentation.zoneOrder[3],'portello');
  assert(city.zones.some(z=>z.id==='argonne'));
  assert(!city.zones.some(z=>z.id==='chinatown'||z.id==='corsica'));
  assert.equal(city.zones.filter(z=>z.area==='city').length,30);
  assert.equal(city.components.length,132);
});
