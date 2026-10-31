import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rename,rm,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {EventEmitter} from 'node:events';
import {createLinkedGameLauncher} from '../tools/linked-game-launcher.mjs';
import {createGameAddons} from '../server/game-addons.mjs';
import {packArtwork} from '../server/artwork-bundle.mjs';
import {createArtworkAcquirer} from '../server/artwork-acquisition.mjs';
import {validateModule,loadGameModules} from '../server/game-modules.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'tce-modules-'));t.after(()=>rm(root,{recursive:true,force:true}));const resourceRoot=join(root,'resources'),privateRoot=join(root,'private');await mkdir(resourceRoot);return {root,resourceRoot,privateRoot};}
async function bundle(root,resourceRoot,id){const source=join(root,id);await mkdir(join(source,'images'),{recursive:true});await writeFile(join(source,'images/map.png'),png);await writeFile(join(source,'manifest.json'),JSON.stringify({format:'tabletop-local-artwork',schemaVersion:1,gameId:id,assets:{map:{file:'map.png'}},branding:{map:'map'}}));await packArtwork(source,join(resourceRoot,id+'.json.gz'));return {id,title:id,archive:id+'.json.gz',cacheDirectory:id};}
test('two games stay independently enabled with isolated artwork, installation state and disable actions',async t=>{
 const f=await fixture(t),a=await bundle(f.root,f.resourceRoot,'first-game'),b=await bundle(f.root,f.resourceRoot,'second-game'),options={...f,definitions:[a,b]},manager=createGameAddons(options);
 await manager.action({operation:'add',id:a.id});await manager.action({operation:'add',id:b.id});assert.deepEqual((await manager.status()).enabled,[a.id,b.id]);
 for(const game of [a,b]){await manager.requireActive(game.id);assert.equal((await manager.artwork(game.id)).catalog.assets.map,`/games/${game.id}/artwork/map.png`);}
 assert.deepEqual((await createGameAddons(options).status()).enabled,[a.id,b.id]);
 await rename(join(f.resourceRoot,a.archive),join(f.resourceRoot,a.archive+'.held'));assert.deepEqual((await manager.status()).enabled,[b.id]);await manager.requireActive(b.id);
 await rename(join(f.resourceRoot,a.archive+'.held'),join(f.resourceRoot,a.archive));await manager.action({operation:'disable',id:a.id});assert.deepEqual((await manager.status()).enabled,[b.id]);assert.equal((await manager.status()).games[0].installed,true);
});
test('a game cannot install another module artwork archive',async t=>{
 const f=await fixture(t),a=await bundle(f.root,f.resourceRoot,'first-game'),b={id:'second-game',title:'Second',archive:a.archive,cacheDirectory:'second'};const manager=createGameAddons({...f,definitions:[b]});await assert.rejects(manager.action({operation:'add',id:b.id}),/Invalid artwork archive/);assert.deepEqual((await manager.status()).enabled,[]);
});
test('legacy single-active state migrates without losing its installed game',async t=>{
 const f=await fixture(t),a=await bundle(f.root,f.resourceRoot,'first-game'),b=await bundle(f.root,f.resourceRoot,'second-game'),manager=createGameAddons({...f,definitions:[a,b]});await manager.action({operation:'add',id:a.id});const path=join(f.privateRoot,'game-addons.json'),saved=JSON.parse(await readFile(path));await writeFile(path,JSON.stringify({schemaVersion:1,installed:saved.installed,active:a.id}));assert.deepEqual((await manager.status()).enabled,[a.id]);await manager.action({operation:'disable',id:a.id});await manager.action({operation:'add',id:b.id});await manager.action({operation:'add',id:a.id});assert.equal((await manager.status()).selected,b.id);assert.equal(JSON.parse(await readFile(path)).schemaVersion,2);
});
test('adding a downloadable game is asynchronous, deduplicated, and only enables it after extraction and installation',async t=>{
 const f=await fixture(t),id='download-game';let finish,calls=0;const wait=new Promise(resolve=>finish=resolve),definition={id,title:id,archive:id+'.json.gz',cacheDirectory:id,acquisition:{kind:'test'}};
 const manager=createGameAddons({...f,definitions:[definition],acquire:async(game,progress)=>{calls++;progress({message:'Downloading…',receivedBytes:1,totalBytes:2});await wait;await bundle(f.root,f.resourceRoot,id);}});
 await manager.action({operation:'add',id});await manager.action({operation:'add',id});assert.equal(calls,1);assert.deepEqual((await manager.status()).enabled,[]);assert.equal((await manager.status()).games[0].job.phase,'running');finish();
 for(let i=0;i<100&&(await manager.status()).games[0].job.phase==='running';i++)await new Promise(resolve=>setTimeout(resolve,10));assert.deepEqual((await manager.status()).enabled,[id]);assert.equal((await manager.status()).games[0].job.phase,'completed');
});
test('download failures leave other games enabled and permit retry',async t=>{
 const f=await fixture(t),a=await bundle(f.root,f.resourceRoot,'first-game'),b={id:'bad-download',title:'Bad',archive:'bad.json.gz',cacheDirectory:'bad',acquisition:{}};let calls=0;const manager=createGameAddons({...f,definitions:[a,b],acquire:async()=>{calls++;throw Error('Network unavailable');}});await manager.action({operation:'add',id:a.id});
 for(let attempt=0;attempt<2;attempt++){await manager.action({operation:'add',id:b.id});for(let i=0;i<50&&(await manager.status()).games[1].job.phase==='running';i++)await new Promise(resolve=>setTimeout(resolve,5));assert.equal((await manager.status()).games[1].job.phase,'failed');assert.deepEqual((await manager.status()).enabled,[a.id]);}assert.equal(calls,2);
});
test('artwork acquisition verifies the downloaded bytes before running the extractor and never launches the game',async t=>{
 const f=await fixture(t),client=Buffer.from('reviewed client zip'),game={id:'test-game',archive:'test.json.gz',acquisition:{kind:'unity-windows-zip',url:'https://teburu.com/downloads/test.zip',bytes:client.length,sha256:createHash('sha256').update(client).digest('hex'),recipe:'recipe.json'}};let extractions=0;
 const execute=async(executable,args)=>{assert.equal(executable,'test-python');if(args.includes('--zip')){extractions++;await writeFile(args.at(-1),'test bundle');}return {};};
 const acquire=createArtworkAcquirer({...f,projectRoot:f.root,python:'test-python',execute,download:async()=>new Response(client)});await acquire(game,()=>{});assert.equal(extractions,1);assert.equal(await readFile(join(f.resourceRoot,game.archive),'utf8'),'test bundle');
 game.acquisition.sha256='0'.repeat(64);await assert.rejects(acquire(game,()=>{}),/integrity/);assert.equal(extractions,1);
});
test('module manifests constrain game code, private workspaces and reviewed acquisition sources',async()=>{
 const module=JSON.parse(await readFile(new URL('../games/milan-uprising/module.json',import.meta.url)));assert.equal(validateModule(module).id,module.id);
 for(const client of [{...module.client,app:'src/games/another/app.js'},{...module.client,table:'../private/session.json'}])assert.throws(()=>validateModule({...module,client}));
 assert.throws(()=>validateModule({...module,acquisition:{...module.acquisition,url:'https://untrusted.example/client.zip'}}));
 const modules=await loadGameModules(fileURLToPath(new URL('../',import.meta.url)),JSON.parse(await readFile(new URL('../resources/addons.json',import.meta.url))));assert.equal(modules.length,1);
});
test('switching linked games finishes the previous cleanup before starting the next adapter',async()=>{
 const calls=[];let fail=false;
 const launcher=createLinkedGameLauncher({games:['first','second'].map(id=>({id,linked:{entry:'control.mjs'}})),prepare:async id=>{calls.push('prepare '+id);return new URL('file:///C:/test/');},probe:async()=>{throw new TypeError('not running');},log:()=>{},sharing:{start:async()=>calls.push('share start'),stop:async()=>calls.push('share stop')},start:()=>{const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.exitCode=null;child.send=()=>{calls.push('cleanup');setImmediate(()=>child.emit('message',fail?{type:'tce-stop-failed',message:'radio busy'}:{type:'tce-stopped'}));};child.kill=()=>{calls.push('close');child.exitCode=0;};setImmediate(()=>child.stdout.emit('data',Buffer.from('http://127.0.0.1:5180')));return child;}});
 await launcher.open('first');fail=true;await assert.rejects(launcher.open('second'),/radio busy/);assert(!calls.includes('prepare second'));fail=false;await launcher.open('second');assert.deepEqual(calls,['share stop','prepare first','share start','cleanup','cleanup','close','share stop','prepare second','share start']);await launcher.stop();
});
test('shared engine, server and transport do not import a concrete game module',async()=>{
 async function check(path){for(const entry of await readdir(new URL(path,import.meta.url),{withFileTypes:true})){if(['bin','obj'].includes(entry.name))continue;const name=path+'/'+entry.name;if(entry.isDirectory())await check(name);else if(/\.(js|mjs|cs)$/.test(name)){const source=await readFile(new URL(name,import.meta.url),'utf8');assert(!/src\/games\/milan-uprising|data\/games\/milan-uprising|com\.xplored\.teburu\.vtm/.test(source),name);}}}
 for(const path of ['../src/engine','../src/application','../server','../integration/runtime'])await check(path);
});
