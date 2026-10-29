import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowsSetup} from '../server/windows-setup.mjs';
const ready={wslReady:true,debianVersion:2,usbipdInstalled:true,wingetAvailable:true,adapters:[{busId:'1-4',vidPid:'1234:abcd',label:'Bluetooth radio',state:'Not shared'}]};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('Windows prerequisites checks are read-only, cached and shared between requests',async()=>{
 let inspections=0,mutations=0,release;
 const setup=createWindowsSetup({platform:'win32',probe:async()=>{inspections++;await new Promise(resolve=>release=resolve);return ready;},execute:async()=>{mutations++;}});
 const first=setup.check(),second=setup.check();await tick();assert.equal(inspections,1);release();
 assert.equal((await first).report.debianVersion,2);await second;await setup.check();
 assert.equal(inspections,1);assert.equal(mutations,0);
});
test('installer actions require a fresh check, a listed action and explicit consent',async()=>{
 let calls=0;const setup=createWindowsSetup({platform:'win32',probe:async()=>ready,execute:async()=>{calls++;return {ok:true};}});
 assert.throws(()=>setup.start({action:'prepare-adapter',confirm:true,busId:'1-4'}),/Check this PC/);
 await setup.check();
 for(const request of [{action:'powershell',confirm:true},{action:'prepare-adapter',busId:'1-4'},{action:'prepare-adapter',confirm:true,busId:'1-4;whoami'},{action:'prepare-adapter',confirm:true,busId:'2-9'}])assert.throws(()=>setup.start(request));
 assert.equal(calls,0);
 assert.throws(()=>setup.start({action:'install-wsl',confirm:true}),/already installed/);
 assert.throws(()=>setup.start({action:'install-linux',confirm:true}),/already installed/);
});
test('only the selected Bluetooth adapter is passed to setup and jobs cannot overlap',async()=>{
 let finish;const calls=[],saved=[];
 const setup=createWindowsSetup({platform:'win32',probe:async()=>ready,execute:async(...args)=>{calls.push(args);return new Promise(resolve=>finish=resolve);},save:job=>saved.push(job)});
 await setup.check();const started=setup.start({action:'prepare-adapter',busId:'1-4',confirm:true});
 assert.equal(started.job.phase,'running');assert.deepEqual(calls,[['prepare-adapter',ready.adapters[0]]]);
 assert.throws(()=>setup.start({action:'prepare-adapter',busId:'1-4',confirm:true}),/already running/);
 finish({ok:true,message:'Adapter prepared without attaching.'});await tick();
 assert.equal(setup.snapshot().job.phase,'completed');assert.equal(saved.length,2);
 const detached=setup.snapshot();detached.report.adapters[0].busId='invalid';assert.equal(setup.snapshot().report.adapters[0].busId,'1-4');
});
test('cancelled UAC, failed installs and restart requests remain distinct',async()=>{
 for(const [result,phase] of [[{ok:false,cancelled:true,message:'Cancelled'},'cancelled'],[{ok:false,message:'Download failed'},'failed'],[{ok:true,restartRequired:true,message:'Restart Windows'},'completed']]){
  const setup=createWindowsSetup({platform:'win32',probe:async()=>({...ready,wslReady:false,debianVersion:null}),execute:async()=>result});
  await setup.check();setup.start({action:'install-wsl',confirm:true});await tick();
  assert.equal(setup.snapshot().job.phase,phase);assert.equal(setup.snapshot().job.restartRequired,!!result.restartRequired);
 }
});
test('reopening after interruption never resumes an installer automatically',async()=>{
 let calls=0;const setup=createWindowsSetup({platform:'win32',initialJob:{phase:'running',action:'install-wsl'},probe:async()=>ready,execute:async()=>{calls++;}});
 assert.equal(setup.snapshot().job.phase,'interrupted');await setup.check();assert.equal(calls,0);
});
test('unsupported platforms and failed checks do not offer system changes',async()=>{
 const setup=createWindowsSetup({platform:'linux',probe:async()=>{throw Error('Must not run');}});
 assert.equal((await setup.check()).supported,false);assert.throws(()=>setup.start({action:'install-wsl',confirm:true}),/Windows only/);
 const broken=createWindowsSetup({platform:'win32',probe:async()=>{throw Error('Check timed out');}});await broken.check();
 assert.equal(broken.snapshot().report.error,'Check timed out');assert.throws(()=>broken.start({action:'install-wsl',confirm:true}),/Check this PC/);
});
test('an already shared adapter can be selected without invoking installers or attaching USB',async()=>{
 let installs=0;const configured=[];
 const setup=createWindowsSetup({platform:'win32',probe:async()=>({...ready,adapters:[{...ready.adapters[0],state:'Shared'}]}),execute:async()=>{installs++;},configure:adapter=>configured.push(adapter)});
 await setup.check();setup.start({action:'select-adapter',busId:'1-4',confirm:true});await tick();
 assert.equal(installs,0);assert.equal(configured[0].busId,'1-4');assert.equal(setup.snapshot().job.phase,'completed');assert.equal(setup.snapshot().selectedBusId,'1-4');
});
