import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const run=promisify(execFile);
const root=new URL('../',import.meta.url),runtime=new URL('../private/linked/',import.meta.url);
export async function prepareReleaseHelpers({onProgress=()=>{},execute=run,download=fetch}={}){
 let release;
 try{release=JSON.parse(await readFile(new URL('release.json',root),'utf8'));}catch(error){if(error.code==='ENOENT')throw Error('Use the packaged Windows download to prepare helpers without development tools. Source checkout instructions are in docs/INSTALLATION.md.');throw error;}
 if(release.format!=='milan-windows-release')throw Error('A packaged Windows release is required.');
 const file=new URL('machine.json',runtime),settings=JSON.parse(await readFile(file,'utf8'));
 if(!settings.usbAdapter||!settings.wslDistribution)throw Error('Select and prepare your Bluetooth adapter first.');
 try{for(const path of ['runtime/python/python.exe','private/linked/windows-core/ring-telemetry-build/CoreContract.exe','private/linked/app-observer/build/AppObserver.exe'])await access(new URL(path,root));}catch{throw Error('This release is incomplete. Extract the entire ZIP again or reinstall it.');}
 onProgress('Checking Windows English text recognition…');
 const {stdout:ocr}=await execute(fileURLToPath(new URL('private/linked/app-observer/build/AppObserver.exe',root)),['--readiness'],{windowsHide:true,timeout:30000,maxBuffer:100000});
 if(!JSON.parse(ocr).englishOcrAvailable)throw Error('Windows English text recognition is missing. Install English language text recognition in Windows language settings, then prepare helpers again.');
 onProgress('Downloading Android USB tools from Google…');
 const response=await download('https://dl.google.com/android/repository/platform-tools_r37.0.1-windows.zip');
 if(!response.ok)throw Error('Android tools download failed. Check your internet connection and retry.');
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>100*1024*1024)throw Error('Unexpected Android tools size.');
 const archive=new URL('android-tools.zip',runtime),directory=new URL('android-tools/',runtime);
 await writeFile(archive,bytes);await mkdir(directory,{recursive:true});
 await execute('tar.exe',['-xf',fileURLToPath(archive),'-C',fileURLToPath(directory)],{windowsHide:true,timeout:60000,maxBuffer:1024*1024});
 const adb=fileURLToPath(new URL('platform-tools/adb.exe',directory));
 await execute(adb,['version'],{windowsHide:true,timeout:10000});
 onProgress('Preparing the isolated Linux helper. The first download can take several minutes…');
 const {stdout}=await execute('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('tools/linux-helper-setup.ps1',root)),'-Distribution',settings.wslDistribution],{windowsHide:true,timeout:15*60*1000,maxBuffer:8*1024*1024});
 const corePython=stdout.match(/^MILAN_CORE_PYTHON=(\/[^\r\n]+)$/m)?.[1];
 if(!corePython)throw Error('Linux helper did not report a valid environment. Finish Debian setup and retry.');
 const visionPython=fileURLToPath(new URL('runtime/python/python.exe',root));
 onProgress('Checking the included image reader…');
 await execute(visionPython,['-c','import cv2,numpy'],{windowsHide:true,timeout:30000});
 const latest=JSON.parse(await readFile(file,'utf8'));
 await writeFile(file,JSON.stringify({...latest,adb,visionPython,corePython,helperVersion:release.version,androidToolsSha256:createHash('sha256').update(bytes).digest('hex')},null,2));
 onProgress('App helpers are ready. Connect your tablet and check the connection.');
}
