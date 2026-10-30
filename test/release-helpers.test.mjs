import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,unlink} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {prepareReleaseHelpers} from '../tools/prepare-release-helpers.mjs';
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'tce-helpers-'));t.after(()=>rm(root,{recursive:true,force:true}));const runtime=join(root,'private/linked');for(const name of ['runtime/python/python.exe','private/linked/windows-core/ring-telemetry-build/CoreContract.exe','private/linked/app-observer/build/AppObserver.exe']){await mkdir(dirname(join(root,name)),{recursive:true});await writeFile(join(root,name),'test placeholder');}await writeFile(join(root,'release.json'),JSON.stringify({format:'milan-windows-release',version:'test'}));await writeFile(join(runtime,'machine.json'),JSON.stringify({usbAdapter:'1234:abcd',wslDistribution:'Debian'}));return {root,runtime,options:{projectRoot:pathToFileURL(root+'/'),runtime:pathToFileURL(runtime+'/')}};}
test('helper retry reuses validated Android tools and commits the unprivileged Linux account only after success',async t=>{
 const f=await fixture(t);let downloads=0,failLinux=true;
 const execute=async(executable,args)=>{if(args.includes('--readiness'))return {stdout:JSON.stringify({englishOcrAvailable:true})};if(executable==='tar.exe'){await mkdir(join(f.runtime,'android-tools/platform-tools'),{recursive:true});await writeFile(join(f.runtime,'android-tools/platform-tools/adb.exe'),'test adb');}if(executable==='powershell.exe'){assert(args.includes('Debian'));if(failLinux)throw Error('Network disconnected');return {stdout:'MILAN_CORE_PYTHON=/home/tce-core/.local/share/tce-core/venv/bin/python\nTCE_LINUX_USER=tce-core\n'};}return {stdout:''};};
 const options={...f.options,execute,download:async url=>{assert.equal(url,'https://dl.google.com/android/repository/platform-tools-latest-windows.zip');downloads++;return new Response('mock Android tools ZIP');}};
 await assert.rejects(prepareReleaseHelpers(options),/Network disconnected/);const partial=JSON.parse(await readFile(join(f.runtime,'machine.json')));assert(partial.adb);assert.equal(partial.setupVersion,undefined);
 failLinux=false;await prepareReleaseHelpers(options);const installed=JSON.parse(await readFile(join(f.runtime,'machine.json')));assert.equal(downloads,1);assert.equal(installed.linuxUser,'tce-core');assert.equal(installed.setupVersion,2);assert.equal(JSON.parse(await readFile(join(f.root,'private/tce-machine.json'))).linuxUser,'tce-core');
});
test('connection helpers do not require Windows OCR; source-only installs still stop before changes',async t=>{
 const f=await fixture(t);let downloads=0,linuxCalls=0;
 const options={...f.options,execute:async(executable,args)=>{assert(!args.includes('--readiness'));if(executable==='powershell.exe'){linuxCalls++;return {stdout:'MILAN_CORE_PYTHON=/home/tce-core/venv/bin/python\nTCE_LINUX_USER=tce-core\n'};}return {stdout:''};},download:async()=>{downloads++;throw Error('Must not download');}};
 const settings=JSON.parse(await readFile(join(f.runtime,'machine.json')));settings.adb='existing-adb';await writeFile(join(f.runtime,'machine.json'),JSON.stringify(settings));
 await prepareReleaseHelpers(options);assert.equal(downloads,0);assert.equal(linuxCalls,1);await unlink(join(f.root,'release.json'));await assert.rejects(prepareReleaseHelpers(options),/packaged Windows/);assert.equal(downloads,0);
});
