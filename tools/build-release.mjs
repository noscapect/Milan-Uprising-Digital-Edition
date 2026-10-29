import {mkdir,readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import {resolve,join,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
export const releaseRoots=['src','server','data','legacy','integration/runtime','resources','docs'];
export const releaseFiles=['index.html','control-center.html','server.mjs','package.json','Start-TCE.cmd','Start-Milan.cmd','README.md','tools/start-linked.mjs','tools/linked-runtime.mjs','tools/windows-prerequisites.ps1','tools/prepare-release-helpers.mjs','tools/linux-helper-setup.ps1','tools/install-release.ps1','tools/launch-release.ps1'];
export async function copyReleaseSources(source,destination){
 async function copy(path){
  await mkdir(join(destination,path),{recursive:true});
  for(const entry of await readdir(join(source,path),{withFileTypes:true})){
   if(['bin','obj','__pycache__','private','work','.git','sdk','state'].includes(entry.name.toLowerCase()))continue;
   const name=join(path,entry.name);
   if(path==='resources'&&!['README.md','milan-artwork.json.gz'].includes(entry.name))continue;
   if(name.replaceAll('\\','/').startsWith('integration/runtime/')&&extname(name)==='.json'&&!['character-save-mapping.json','location-mapping.json','map-hit-regions.json','miniature-scan-mapping.json'].includes(entry.name))continue;
   if(entry.isDirectory())await copy(name);
   else if(entry.isFile()&&['.js','.mjs','.json','.html','.css','.md','.cs','.csproj','.py','.ps1','.gz'].includes(extname(entry.name))){await copyFile(join(source,name),join(destination,name));}
   else if(entry.isFile())continue;
   else throw Error('Release sources must not contain symbolic links.');
  }
 }
 for(const root of releaseRoots)await copy(root);
 for(const name of releaseFiles){await mkdir(dirname(join(destination,name)),{recursive:true});await copyFile(join(source,name),join(destination,name));}
}
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function buildRelease({source=fileURLToPath(new URL('../',import.meta.url)),output}={}){
 if(process.platform!=='win32'||process.arch!=='x64')throw Error('Build the Windows x64 release on Windows x64.');
 const version=JSON.parse(await readFile(join(source,'package.json'),'utf8')).version;
 const directory=output||join(source,'work',`release-${Date.now()}`),app=join(directory,'TCE');
 await mkdir(app,{recursive:true});await copyReleaseSources(source,app);
 const downloads=join(directory,'downloads');await mkdir(downloads,{recursive:true});
 async function download(url,name,expected){
  console.log('Downloading',name);const response=await fetch(url);if(!response.ok)throw Error(`Download failed (${response.status}): ${url}`);
  const bytes=Buffer.from(await response.arrayBuffer());if(expected&&sha(bytes)!==expected)throw Error(`Checksum failed: ${name}`);
  const path=join(downloads,name);await writeFile(path,bytes);return path;
 }
 async function unzip(archive,target){await mkdir(target,{recursive:true});await run('tar.exe',['-xf',archive,'-C',target],{windowsHide:true,maxBuffer:1024*1024});}
 const checks=await fetch('https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt').then(r=>{if(!r.ok)throw Error('Node checksum download failed');return r.text();});
 const nodeEntry=checks.split(/\r?\n/).map(l=>l.trim().split(/\s+/)).find(([,name])=>/^node-v22\.\d+\.\d+-win-x64\.zip$/.test(name||''));
 if(!nodeEntry)throw Error('No supported Node runtime found.');
 const nodeZip=await download(`https://nodejs.org/dist/latest-v22.x/${nodeEntry[1]}`,nodeEntry[1],nodeEntry[0]);
 const nodeTree=join(directory,'node');await unzip(nodeZip,nodeTree);const nodeFolder=join(nodeTree,nodeEntry[1].slice(0,-4));
 await mkdir(join(app,'runtime'),{recursive:true});for(const name of ['node.exe','LICENSE'])await copyFile(join(nodeFolder,name),join(app,'runtime',name));
 const pythonVersion='3.13.17',python=join(app,'runtime','python');
 await unzip(await download(`https://www.python.org/ftp/python/${pythonVersion}/python-${pythonVersion}-embed-amd64.zip`,'python.zip','9e35319bffedab8b36ad44d8f377cb4f1733bcec257a0b6d04d94f01486ddb38'),python);
 await writeFile(join(python,'python313._pth'),'python313.zip\n.\nLib/site-packages\nimport site\n');
 const dependencies={numpy:'2.5.4','opencv-python-headless':'5.0.0.93'};
 const materials=[];
 for(const [name,version] of Object.entries(dependencies)){
  const metadata=await fetch(`https://pypi.org/pypi/${name}/${version}/json`).then(r=>{if(!r.ok)throw Error('Wheel metadata missing');return r.json();});
  const wheel=metadata.urls.find(item=>item.filename.endsWith('-win_amd64.whl')&&(name==='numpy'?item.filename.includes('-cp313-cp313-'):item.filename.includes('-abi3-')));
  if(!wheel)throw Error(`No Windows Python 3.13 wheel for ${name}`);
  await unzip(await download(wheel.url,wheel.filename,wheel.digests.sha256),join(python,'Lib','site-packages'));
  materials.push({name,version,sha256:wheel.digests.sha256});
 }
 await run(join(python,'python.exe'),['-B','-c','import cv2,numpy; print(cv2.__version__,numpy.__version__)'],{windowsHide:true});
 for(const [project,destination] of [['core/CoreContract.csproj','windows-core/ring-telemetry-build'],['app-observer/AppObserver.csproj','app-observer/build']]){
  console.log('Publishing',project);await run('dotnet',['publish',join(source,'integration/runtime',project),'-c','Release','-r','win-x64','--self-contained','true','-p:PublishSingleFile=true','-p:IncludeNativeLibrariesForSelfExtract=true','-p:DebugType=None','-o',join(app,'integration/runtime',destination)],{windowsHide:true,timeout:300000,maxBuffer:4*1024*1024});
 }
 await writeFile(join(app,'release.json'),JSON.stringify({format:'milan-windows-release',schemaVersion:1,version,architecture:'x64',node:nodeEntry[1],python:pythonVersion,dependencies:materials},null,2));
 await writeFile(join(app,'Install-TCE.cmd'),'@echo off\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\\install-release.ps1"\r\nif errorlevel 1 pause\r\n');
 await writeFile(join(app,'THIRD-PARTY.txt'),'Node license: runtime/LICENSE\nPython license: runtime/python/LICENSE.txt\nNumPy/OpenCV licenses: runtime/python/Lib/site-packages/*.dist-info/\n.NET notices: https://github.com/dotnet/runtime/blob/main/THIRD-PARTY-NOTICES.TXT\nAndroid Platform Tools is downloaded separately after consent to Google terms.\nTeburu SDK is not included.\n');
 await mkdir(join(app,'notices'),{recursive:true});
 for(const [name,url] of [['dotnet-license.txt','https://raw.githubusercontent.com/dotnet/runtime/release/8.0/LICENSE.TXT'],['dotnet-third-party.txt','https://raw.githubusercontent.com/dotnet/runtime/release/8.0/THIRD-PARTY-NOTICES.TXT']]){
  const response=await fetch(url);if(!response.ok)throw Error('Runtime license download failed');await writeFile(join(app,'notices',name),await response.text());
 }
 const integrity={schemaVersion:1,files:{}};
 async function hashTree(path=''){for(const entry of await readdir(join(app,path),{withFileTypes:true})){const name=path?path+'/'+entry.name:entry.name;if(entry.isDirectory())await hashTree(name);else integrity.files[name]=sha(await readFile(join(app,name)));}}
 await hashTree();await writeFile(join(app,'release-files.json'),JSON.stringify(integrity));
 const zip=join(directory,`TCE-${version}-windows-x64.zip`);
 await run('powershell.exe',['-NoProfile','-NonInteractive','-Command','Compress-Archive -LiteralPath $env:MILAN_RELEASE_APP -DestinationPath $env:MILAN_RELEASE_ZIP'],{windowsHide:true,timeout:300000,env:{...process.env,MILAN_RELEASE_APP:app,MILAN_RELEASE_ZIP:zip}});
 await writeFile(zip+'.sha256',sha(await readFile(zip))+'  '+zip.split(/[\\/]/).at(-1)+'\n');
 console.log('Review package:',zip);return {app,zip};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildRelease();
