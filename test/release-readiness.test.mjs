import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {copyReleaseSources,releaseRoots,releaseFiles} from '../tools/build-release.mjs';
import {inspectTablet,createPreparationJob} from '../server/connection-wizard.mjs';
import {createCoreLifecycle} from '../server/core-lifecycle.mjs';
import {createCoreStarter} from '../integration/runtime/pc-core-start.mjs';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {copyFile,readFile} from 'node:fs/promises';
test('release source staging excludes private workspaces, SDK binaries and build caches',async()=>{
 const root=await mkdtemp(join(tmpdir(),'milan-release-'));try{
  const source=join(root,'source'),target=join(root,'target');
  for(const folder of [...releaseRoots,'private','work','sdk','integration/runtime/obj','integration/runtime/private']){await mkdir(join(source,folder),{recursive:true});await writeFile(join(source,folder,'secret.dll'),'excluded');}
  for(const file of releaseFiles){await mkdir(dirname(join(source,file)),{recursive:true});await writeFile(join(source,file),'public');}
  await writeFile(join(source,'integration/runtime','runtime.mjs'),'export {};');
  await writeFile(join(source,'integration/runtime','control.json'),'private token');
  await writeFile(join(source,'resources/addons.json'),JSON.stringify({schemaVersion:1,games:[]}));
  await copyReleaseSources(source,target);
  assert(!(await readdir(target)).some(n=>['private','work','sdk','.git'].includes(n)));
  assert.deepEqual(await readdir(join(target,'integration/runtime')),['runtime.mjs']);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('tablet wizard distinguishes permission and multiple devices without reading screens or leaking serials',async()=>{
 for(const [text,stage] of [['device-secret\tunauthorized\n','permission'],['a\tdevice\nb\tdevice','usb'],['','usb']]){
  let calls=0;const report=await inspectTablet({adb:'adb',application:{androidPackage:'com.xplored.teburu.vtm',display:{width:2560,height:1600}},execute:async()=>{calls++;return {stdout:text};}});
  assert.equal(report.stage,stage);assert.equal(report.ready,false);assert.equal(calls,1);assert(!JSON.stringify(report).includes('device-secret'));
 }
});
test('tablet wizard refuses other apps and unsupported displays, and does not claim verified language',async()=>{
 const check=async(window,size)=>{const replies=['a\tdevice',window,size];return inspectTablet({adb:'adb',application:{androidPackage:'com.xplored.teburu.vtm',display:{width:2560,height:1600}},execute:async()=>({stdout:replies.shift()})});};
 assert.equal((await check('mCurrentFocus= other.app/Activity','Physical size: 2560x1600')).stage,'game');
 assert.equal((await check('mCurrentFocus= com.xplored.teburu.vtm/Activity','Physical size: 1920x1080')).stage,'display');
 const ready=await check('mCurrentFocus= com.xplored.teburu.vtm/Activity','Physical size: 1600x2560');assert(ready.ready);assert.equal(ready.languageVerified,false);
});
test('helper preparation requires terms, exposes progress, blocks overlap and supports retry',async()=>{
 let finish,calls=0;const job=createPreparationJob({prepare:async({onProgress})=>{calls++;onProgress('Downloading');await new Promise(r=>finish=r);}});
 assert.throws(()=>job.start({confirm:true}));assert.equal(calls,0);
 job.start({confirm:true,acceptAndroidTerms:true});assert.equal(job.status().message,'Downloading');assert.throws(()=>job.start({confirm:true,acceptAndroidTerms:true}));finish();await new Promise(r=>setImmediate(r));assert.equal(job.status().phase,'completed');
 const resumed=createPreparationJob({initialJob:{phase:'running'},prepare:()=>{throw Error('must not run');}});assert.equal(resumed.status().phase,'interrupted');
});
test('Bluetooth release is serialized and never detaches before the service is stopped',async()=>{
 const calls=[];let finish;const lifecycle=createCoreLifecycle({stop:async()=>{calls.push('stop');await new Promise(r=>finish=r);},detach:async()=>calls.push('detach')});
 const first=lifecycle.release(),second=lifecycle.release();assert.deepEqual(calls,['stop']);finish();await Promise.all([first,second]);assert.deepEqual(calls,['stop','detach']);
 const failed=createCoreLifecycle({stop:async()=>{throw Error('unknown service');},detach:async()=>calls.push('unsafe')});await assert.rejects(failed.release(),/unknown/);assert(!calls.includes('unsafe'));
});
test('failed Core startup attempts rollback before surfacing the error',async()=>{
 const calls=[];const starter=createCoreStarter({core:async path=>{if(path==='/status')return {running:false};throw Error('Radio refused');},prepare:async()=>calls.push('prepare'),rollback:async()=>calls.push('return owned radio')});
 await assert.rejects(starter.start(),/Radio refused/);assert.deepEqual(calls,['prepare','return owned radio']);assert.equal(starter.starting(),false);
});
test('Windows installer preserves private files, checks integrity and refuses escaping paths',{skip:process.platform!=='win32'},async()=>{
 const root=await mkdtemp(join(tmpdir(),'milan-install-')),source=join(root,'source'),target=join(root,'installed');
 const execute=promisify(execFile);
 try{
  await mkdir(join(source,'tools'),{recursive:true});await mkdir(join(target,'private'),{recursive:true});
  await copyFile(fileURLToPath(new URL('../tools/install-release.ps1',import.meta.url)),join(source,'tools','install-release.ps1'));
  await writeFile(join(source,'release.json'),'{}');await writeFile(join(source,'app.txt'),'public');await writeFile(join(target,'private','save.json'),'keep');
  const manifest={schemaVersion:1,files:{'app.txt':createHash('sha256').update('public').digest('hex')}};
  await mkdir(join(source,'resources'),{recursive:true});
  const catalog=JSON.stringify({schemaVersion:1,games:[{id:'milan-uprising',module:'games/milan-uprising/module.json'}]});
  const module=JSON.stringify({schemaVersion:1,id:'milan-uprising',archive:'milan-artwork.json.gz'});
  await mkdir(join(source,'games/milan-uprising'),{recursive:true});await writeFile(join(source,'games/milan-uprising/module.json'),module);
  manifest.files['games/milan-uprising/module.json']=createHash('sha256').update(module).digest('hex');
  await writeFile(join(source,'resources/addons.json'),catalog);
  manifest.files['resources/addons.json']=createHash('sha256').update(catalog).digest('hex');
  manifest.files['resources/milan-artwork.json.gz']=createHash('sha256').update('optional archive').digest('hex');
  await writeFile(join(source,'release-files.json'),JSON.stringify(manifest));
  const args=['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',join(source,'tools','install-release.ps1'),'-Destination',target,'-NoShortcuts'];
  await execute('powershell.exe',args,{windowsHide:true});assert.equal(await readFile(join(target,'private','save.json'),'utf8'),'keep');assert.equal(await readFile(join(target,'app.txt'),'utf8'),'public');
  await writeFile(join(source,'app.txt'),'corrupted');await assert.rejects(execute('powershell.exe',args,{windowsHide:true}),/damaged/);
  manifest.files={'../escape.txt':'invalid'};await writeFile(join(source,'release-files.json'),JSON.stringify(manifest));await assert.rejects(execute('powershell.exe',args,{windowsHide:true}),/Unsafe release path/);
 }finally{await rm(root,{recursive:true,force:true});}
});
