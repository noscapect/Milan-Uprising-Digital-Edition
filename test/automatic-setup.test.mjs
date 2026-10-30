import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowsSetup} from '../server/windows-setup.mjs';
import {createAutomaticSetup} from '../server/automatic-setup.mjs';
const consent={confirm:true,acceptAndroidTerms:true,acceptPackageTerms:true};
const radio={busId:'1-4',vidPid:'1234:abcd',label:'USB Bluetooth',state:'Not shared'};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function finish(setup){for(let i=0;i<200&&setup.snapshot().job?.phase==='running';i++)await tick();assert.notEqual(setup.snapshot().job?.phase,'running');return setup.snapshot().job;}
function fixture({report,selectedBusId,helpers=false,ocr=false,perform,prepare,initialJob,available}={}){
 const calls=[],saved=[];let helperReady=helpers,ocrIsReady=ocr;
 const environment={wslReady:false,debianVersion:null,usbipdInstalled:false,wingetAvailable:true,adapters:[{...radio}],...report};
 const windows=createWindowsSetup({platform:'win32',initialBusId:selectedBusId,probe:async()=>structuredClone(environment),configure:adapter=>{calls.push('configure '+adapter.busId);},execute:async(action,adapter,options)=>{
  calls.push(action);assert.equal(options?.unattended,true);if(perform){const result=await perform(action,environment,adapter);if(result)return result;}
  if(action==='install-wsl')environment.wslReady=true;if(action==='install-linux')environment.debianVersion=2;if(action==='install-usbipd')environment.usbipdInstalled=true;if(action==='install-ocr')ocrIsReady=true;if(action==='prepare-adapter')environment.adapters.find(item=>item.busId===adapter.busId).state='Shared';return {ok:true};
 }});
 const setup=createAutomaticSetup({windows,initialJob,assertAvailable:available,wait:tick,helpersReady:async()=>helperReady,ocrReady:async()=>ocrIsReady,save:job=>saved.push(job),prepareHelpers:async progress=>{calls.push('helpers');progress('Preparing Linux helper…');if(prepare)await prepare();helperReady=true;}});
 return {setup,windows,environment,calls,saved};
}
test('one start installs missing PC components in order, prepares one adapter and helpers, without starting Core',async()=>{
 const f=fixture();await f.setup.status();assert.deepEqual(f.calls,[]);
 for(const request of [{},{confirm:true},{...consent,acceptPackageTerms:false}])assert.throws(()=>f.setup.start(request),/Accept/);
 f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'completed');assert.deepEqual(f.calls,['install-wsl','install-linux','install-usbipd','prepare-adapter','configure 1-4','helpers']);assert.equal((await f.setup.status()).ready,true);assert.equal(f.setup.snapshot().job.consentVersion,1);
});
test('installed and configured prerequisites are reused without another download or installer',async()=>{
 const f=fixture({report:{wslReady:true,debianVersion:2,usbipdInstalled:true,adapters:[{...radio,state:'Shared'}]},selectedBusId:radio.busId,helpers:true,ocr:true});assert.equal((await f.setup.status()).ready,true);f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'completed');assert.deepEqual(f.calls,[]);
});

test('missing text recognition never installs a Windows language or blocks the connection tools',async()=>{
 const f=fixture({report:{wslReady:true,debianVersion:2,usbipdInstalled:true,adapters:[{...radio,state:'Shared'}]},selectedBusId:radio.busId,helpers:true,ocr:false});
 assert.equal((await f.setup.status()).ready,true);assert.equal((await f.setup.status()).textRecognitionReady,false);assert.deepEqual(f.calls,[]);
 f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'completed');
 assert.deepEqual(f.calls,[]);assert.equal((await f.setup.status()).ready,true);assert.match(f.setup.snapshot().job.message,/synchronization is unavailable/);
});
test('restart pauses the sequence and continuing skips the already installed step',async()=>{
 const f=fixture({perform:async(action,environment)=>{if(action==='install-wsl'){environment.wslReady=true;return {ok:true,restartRequired:true};}}});f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'restart');assert.deepEqual(f.calls,['install-wsl']);f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'completed');assert.equal(f.calls.filter(action=>action==='install-wsl').length,1);
});

test('a pending Windows servicing restart pauses before launching another installer',async()=>{
 const f=fixture({report:{restartRequired:true}});f.setup.start(consent);
 assert.equal((await finish(f.setup)).phase,'restart');assert.deepEqual(f.calls,[]);
 f.environment.restartRequired=false;f.setup.start(consent);
 assert.equal((await finish(f.setup)).phase,'completed');
});
test('multiple radios require a choice; unlisted or attached radios are never selected automatically',async()=>{
 const second={...radio,busId:'2-5',label:'Second radio'},f=fixture({report:{wslReady:true,debianVersion:2,usbipdInstalled:true,adapters:[{...radio},second]},ocr:true});f.setup.start(consent);const choice=await finish(f.setup);assert.equal(choice.phase,'choice');assert.equal(choice.adapters.length,2);assert.deepEqual(f.calls,[]);assert.throws(()=>f.setup.start({...consent,busId:'1-4;command'}));f.setup.start({...consent,busId:'9-9'});assert.equal((await finish(f.setup)).phase,'failed');assert.deepEqual(f.calls,[]);f.setup.start({...consent,busId:'2-5'});assert.equal((await finish(f.setup)).phase,'completed');assert(f.calls.includes('configure 2-5'));assert(!f.calls.includes('configure 1-4'));
 const attached=fixture({report:{wslReady:true,debianVersion:2,usbipdInstalled:true,adapters:[{...radio,state:'Attached'}]},ocr:true});attached.setup.start(consent);assert.match((await finish(attached.setup)).message,/Stop Core/);assert.deepEqual(attached.calls,[]);
});
test('a missing saved radio is not silently replaced by the only other available device',async()=>{
 const f=fixture({selectedBusId:'9-9',report:{wslReady:true,debianVersion:2,usbipdInstalled:true},ocr:true});f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'choice');assert.deepEqual(f.calls,[]);
});
test('cancelled Windows permission stops subsequent installation and retry is possible',async()=>{
 let cancelled=true;const f=fixture({perform:async()=>cancelled?{ok:false,cancelled:true,message:'Permission cancelled'}:undefined});f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'cancelled');assert.deepEqual(f.calls,['install-wsl']);cancelled=false;f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'completed');
});
test('helper failure retries only helper preparation, and concurrent starts are deduplicated',async()=>{
 let fail=true,release;const gate=new Promise(resolve=>release=resolve),f=fixture({prepare:async()=>{await gate;if(fail)throw Error('Connection lost');}});f.setup.start(consent);f.setup.start(consent);release();assert.equal((await finish(f.setup)).phase,'failed');fail=false;f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'completed');assert.equal(f.calls.filter(action=>action==='install-wsl').length,1);assert.equal(f.calls.filter(action=>action==='helpers').length,2);
});
test('reopened setup never restarts an installer on a status request; unavailable packages cause no changes',async()=>{
 const f=fixture({initialJob:{phase:'running',consentVersion:1}});assert.equal(f.setup.snapshot().job.phase,'interrupted');await f.setup.status();assert.deepEqual(f.calls,[]);
 const source=fixture({available:async()=>{throw Error('Complete release required');}});source.setup.start(consent);assert.match((await finish(source.setup)).message,/release required/);assert.deepEqual(source.calls,[]);
});
test('existing WSL1 data and missing Windows Package Manager stop with a focused instruction',async()=>{
 const f=fixture({report:{wslReady:true,debianVersion:1}});f.setup.start(consent);assert.equal((await finish(f.setup)).phase,'blocked');assert.deepEqual(f.calls,[]);
 const missing=fixture({report:{wslReady:true,debianVersion:2,wingetAvailable:false}});missing.setup.start(consent);assert.equal((await finish(missing.setup)).help,'app-installer');assert.deepEqual(missing.calls,[]);
});
