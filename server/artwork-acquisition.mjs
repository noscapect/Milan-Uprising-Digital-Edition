import {mkdir,access,rename,unlink,statfs,readdir,realpath,rm} from 'node:fs/promises';
import {createWriteStream,createReadStream} from 'node:fs';
import {join,resolve,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {Transform,Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
async function checksum(path){const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex');}
async function cleanStaging(directory){const root=await realpath(directory);for(const entry of await readdir(root,{withFileTypes:true})){if(!entry.isDirectory()||!/^tce-unity-[a-zA-Z0-9_-]+$/.test(entry.name))continue;const target=await realpath(join(root,entry.name)),rel=relative(root,target);if(!rel||rel.startsWith('..')||isAbsolute(rel))throw Error('Unsafe artwork staging path.');await rm(target,{recursive:true,force:true,maxRetries:3,retryDelay:100});}}
export function createArtworkAcquirer({projectRoot,resourceRoot,privateRoot,execute=run,download=fetch,python}={}){
 return async function acquire(game,onProgress){
  const source=game.acquisition;if(source?.kind!=='unity-windows-zip')throw Error('Unsupported artwork acquisition method.');
  let executable=python,args=['-B'];
  if(!executable){const bundled=join(projectRoot,'runtime/python/python.exe');try{await access(bundled);executable=bundled;}catch{executable=process.platform==='win32'?'py':'python3';if(executable==='py')args=['-3','-B'];}}
  try{await execute(executable,[...args,'-c','import UnityPy; assert UnityPy.__version__ == "1.23.0"'],{windowsHide:true,timeout:30000,maxBuffer:100000});}catch{throw Error('Artwork extraction tools are missing. Use the complete TCE Windows release. For a source checkout, install UnityPy==1.23.0 in Python first.');}
  const directory=resolve(privateRoot,'artwork-downloads',game.id);await mkdir(directory,{recursive:true});await mkdir(resourceRoot,{recursive:true});
  await cleanStaging(directory);
  const archive=join(directory,'windows-client.zip'),partial=archive+'.part',output=resolve(resourceRoot,game.archive),staged=output+'.pending';
  let cached=false;try{cached=await checksum(archive)===source.sha256;}catch{}
  if(!cached){
   await unlink(partial).catch(()=>{});
   const space=await statfs(directory);if(Number(space.bavail)*Number(space.bsize)<source.bytes*3)throw Error('Not enough free disk space to download and extract this game. Free about 3 GB and retry.');
   onProgress({message:'Downloading the official Windows client (artwork only)…',receivedBytes:0,totalBytes:source.bytes});
   const response=await download(source.url,{redirect:'error',signal:AbortSignal.timeout(20*60*1000)});
   if(!response.ok||!response.body)throw Error('Official game download failed. Check the connection and retry.');
   const declared=response.headers.get('content-length');if(declared&&Number(declared)!==source.bytes)throw Error('The official download has changed. This TCE module needs an updated, reviewed artwork source.');
   let received=0,last=0;const hash=createHash('sha256');
   const meter=new Transform({transform(chunk,encoding,done){received+=chunk.length;if(received>source.bytes){done(Error('Unexpected game download size.'));return;}hash.update(chunk);if(Date.now()-last>300){last=Date.now();onProgress({message:'Downloading the official Windows client (artwork only)…',receivedBytes:received,totalBytes:source.bytes});}done(null,chunk);}});
   try{await pipeline(Readable.fromWeb(response.body),meter,createWriteStream(partial));if(received!==source.bytes||hash.digest('hex')!==source.sha256)throw Error('Game download integrity check failed. Retry the download.');await rename(partial,archive);}catch(error){await unlink(partial).catch(()=>{});throw error;}
  }
  onProgress({message:'Extracting the selected artwork. The Windows game is never started…'});
  try{
   await execute(executable,[...args,join(projectRoot,'tools/extract-unity-artwork.py'),'--zip',archive,'--recipe',join(projectRoot,source.recipe),'--output',staged],{windowsHide:true,timeout:10*60*1000,maxBuffer:2*1024*1024});
   await cleanStaging(directory);
   // The regular installer validates this bundle again before enabling the game.
   await rename(staged,output);await unlink(archive);
  }catch(error){await unlink(staged).catch(()=>{});throw Error('Artwork extraction failed. Retry or supply the game archive manually. '+String(error.stderr||error.message).slice(-1200));}
  finally{await cleanStaging(directory);}
  onProgress({message:'Artwork prepared. Installing this game…'});
 };
}
