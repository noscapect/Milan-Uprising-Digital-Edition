import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rename,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createGameAddons,validateAddonDefinitions} from '../server/game-addons.mjs';
import {packArtwork} from '../server/artwork-bundle.mjs';
import {copyReleaseSources} from '../tools/build-release.mjs';
import {fileURLToPath} from 'node:url';
import {createTableServer} from '../server.mjs';
const definition={id:'milan-uprising',title:'Milan Uprising',archive:'milan-artwork.json.gz',cacheDirectory:'bundled-artwork',client:{table:'src/games/milan-uprising/table.html'}};
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'tce-addons-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const resourceRoot=join(root,'resources'),privateRoot=join(root,'private'),source=join(root,'source');
 await mkdir(resourceRoot);await mkdir(join(source,'images'),{recursive:true});await writeFile(join(source,'images/map.png'),png);
 await writeFile(join(source,'manifest.json'),JSON.stringify({format:'tabletop-local-artwork',schemaVersion:1,gameId:definition.id,assets:{map:{file:'map.png'}},branding:{map:'map'}}));
 const options={definitions:[definition],resourceRoot,privateRoot},manager=createGameAddons(options);
 return {root,resourceRoot,privateRoot,source,options,manager,archive:join(resourceRoot,definition.archive)};
}
test('missing archive permits base status but blocks installing and activating a game',async t=>{
 const f=await fixture(t),status=await f.manager.status();assert.equal(status.active,null);assert.equal(status.games[0].canInstall,false);assert.equal(status.games[0].canActivate,false);
 for(const operation of ['install','activate'])await assert.rejects(f.manager.action({operation,id:definition.id}),/missing/);
 await assert.rejects(f.manager.requireActive(definition.id),/Install and activate/);
});
test('installation and activation are separate, persistent steps; removing the archive blocks cached artwork too',async t=>{
 const f=await fixture(t);await packArtwork(f.source,f.archive);
 assert.equal((await f.manager.status()).games[0].canInstall,true);
 await f.manager.action({operation:'install',id:definition.id});assert.equal((await f.manager.status()).active,null);
 await f.manager.action({operation:'activate',id:definition.id});assert.equal((await createGameAddons(f.options).status()).active,definition.id);
 assert.equal((await f.manager.artwork(definition.id)).catalog.branding.map,'map');
 await rename(f.archive,f.archive+'.held');
 assert.equal((await f.manager.status()).active,null);assert.equal((await f.manager.status()).games[0].canActivate,false);
 assert.deepEqual(await readFile(join(f.privateRoot,'bundled-artwork/images/map.png')),png);
 await assert.rejects(f.manager.artwork(definition.id),/Install and activate/);
 for(const operation of ['install','activate'])await assert.rejects(f.manager.action({operation,id:definition.id}),/missing/);
});
test('changed or corrupt archives cannot inherit an earlier installation or activation',async t=>{
 const f=await fixture(t);await packArtwork(f.source,f.archive);
 await f.manager.action({operation:'install',id:definition.id});await f.manager.action({operation:'activate',id:definition.id});
 await writeFile(f.archive,'invalid gzip archive');assert.equal((await f.manager.status()).active,null);
 await assert.rejects(f.manager.action({operation:'activate',id:definition.id}),/Install the game/);
 await assert.rejects(f.manager.action({operation:'install',id:definition.id}));
 await assert.rejects(f.manager.action({operation:'activate',id:'unknown'}),/Unknown game/);
});
test('addon catalog rejects resource traversal and duplicate identities',()=>{
 for(const archive of ['../outside.json.gz','C:/outside.json.gz','nested\\outside.json.gz'])assert.throws(()=>validateAddonDefinitions({schemaVersion:1,games:[{...definition,archive}]}));
 assert.throws(()=>validateAddonDefinitions({schemaVersion:1,games:[definition,definition]}));
});
test('HTTP server starts without artwork and enforces archive checks and local-origin mutations',async t=>{
 const f=await fixture(t);await writeFile(join(f.resourceRoot,'addons.json'),JSON.stringify({schemaVersion:1,games:[definition]}));
 const server=await createTableServer(f.options);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}`;
 assert.equal((await fetch(base+'/')).status,200);assert.equal((await fetch(base+'/table')).status,409);
 const action=(operation,origin=base)=>fetch(base+'/api/game-addons',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({operation,id:definition.id})});
 assert.equal((await action('install','https://untrusted.example')).status,403);assert.equal((await action('activate')).status,409);
 await packArtwork(f.source,f.archive);assert.equal((await action('install')).status,200);assert.equal((await action('activate')).status,200);
 assert.equal((await fetch(base+'/table')).status,200);assert.equal((await fetch(base+'/local-artwork/catalog.json')).status,200);
 await rename(f.archive,f.archive+'.held');
 assert.equal((await fetch(base+'/table')).status,409);assert.equal((await fetch(base+'/local-artwork/map.png')).status,409);assert.equal((await action('activate')).status,409);
});
test('release staging can omit artwork while retaining the addon catalog and complete application sources',async t=>{
 const root=await mkdtemp(join(tmpdir(),'tce-no-artwork-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await copyReleaseSources(fileURLToPath(new URL('../',import.meta.url)),root,{includeArtwork:false});
 await assert.rejects(readFile(join(root,'resources',definition.archive)),{code:'ENOENT'});
 assert.equal(JSON.parse(await readFile(join(root,'resources/addons.json'))).games[0].id,definition.id);
 for(const file of ['index.html','server/game-addons.mjs','src/ui/game-addons.js','src/games/milan-uprising/app.js','integration/milan-uprising/android-control.mjs'])assert((await readFile(join(root,file))).length>0);
});
