import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {prepareLinkedRuntime} from './linked-runtime.mjs';
const run=promisify(execFile);
if(process.platform!=='win32')throw Error('The linked-table setup currently supports Windows 10/11 only.');
const options=Object.fromEntries(process.argv.slice(2).map(arg=>{const split=arg.indexOf('=');if(!arg.startsWith('--')||split<0)throw Error('Use --usb=VID:PID --distro=Debian [--adb=path]');return [arg.slice(2,split),arg.slice(split+1)];}));
if(Object.keys(options).some(key=>!['usb','distro','adb'].includes(key))||!/^[0-9a-f]{4}:[0-9a-f]{4}$/i.test(options.usb||'')||!options.distro)throw Error('Specify your own USB adapter and WSL distribution: --usb=VID:PID --distro=Debian');
const root=await prepareLinkedRuntime();
async function command(executable,args){console.log(executable,...args);const {stdout,stderr}=await run(executable,args,{windowsHide:true,timeout:300000,maxBuffer:4*1024*1024});if(stdout)console.log(stdout.trim());if(stderr)console.error(stderr.trim());return stdout.trim();}
await command(options.adb||'adb',['version']);
await command('dotnet',['publish',fileURLToPath(new URL('core/CoreContract.csproj',root)),'-c','Release','-o',fileURLToPath(new URL('windows-core/ring-telemetry-build/',root))]);
await command('dotnet',['publish',fileURLToPath(new URL('app-observer/AppObserver.csproj',root)),'-c','Release','-o',fileURLToPath(new URL('app-observer/build/',root))]);
await command('py',['-3','-m','venv',fileURLToPath(new URL('vision-env/',root))]);
const visionPython=fileURLToPath(new URL('vision-env/Scripts/python.exe',root));
await command(visionPython,['-m','pip','install','opencv-python-headless==5.0.0.93','numpy==2.5.4']);
const wsl=['-d',options.distro,'--exec'];
const coreEnvironment=await command('wsl.exe',[...wsl,'python3','-c',"from pathlib import Path; print(Path.home()/'.local/share/milan-core/venv')"]);
if(!coreEnvironment.startsWith('/')||coreEnvironment.includes('\n'))throw Error('Invalid WSL environment path.');
await command('wsl.exe',[...wsl,'python3','-m','venv',coreEnvironment]);
const corePython=coreEnvironment+'/bin/python';
await command('wsl.exe',[...wsl,corePython,'-m','pip','install','bumble==0.0.236','aiohttp']);
let settings={};try{settings=JSON.parse(await readFile(new URL('machine.json',root),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
await writeFile(new URL('machine.json',root),JSON.stringify({...settings,usbAdapter:options.usb,wslDistribution:options.distro,corePython,visionPython,adb:options.adb||'adb'},null,2));
console.log('Setup complete. Run npm run linked. Bluetooth starts only through Start Core on PC.');
