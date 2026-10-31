import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {prepareLinkedRuntime} from './linked-runtime.mjs';
export function createLinkedGameLauncher({games,prepare=prepareLinkedRuntime,start=spawn,probe=fetch,onQuit=()=>{},log=console.log,sharing={start:async()=>{},stop:async()=>{}}}={}){
 let current=null,queue=Promise.resolve();
 async function stop(){
  if(!current||current.child.exitCode!==null){current=null;await sharing.stop();return;}
  const old=current;
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>done(Error('The current game did not return Bluetooth. Keep TCE open and retry Stop Core.')),30000);
   const listener=message=>{if(message?.type==='tce-stopped')done();if(message?.type==='tce-stop-failed')done(Error(message.message||'Bluetooth cleanup failed.'));};
   function done(error){clearTimeout(timer);old.child.off('message',listener);error?reject(error):resolve();}
   old.child.on('message',listener);old.child.send({type:'tce-shutdown'});
  });
  old.child.kill();current=null;await sharing.stop();
 }
 async function open(id){
  const game=games.find(item=>item.id===id);if(!game?.linked)throw Error('No linked adapter is available for this game.');
  if(current?.id===id&&current.child.exitCode===null){await sharing.start(current.directory);return 'http://127.0.0.1:5180';}
  await stop();
  try{const response=await probe('http://127.0.0.1:5180/api/application-instance',{signal:AbortSignal.timeout(500)});if(response.ok)throw Error('Another game service is running. Quit that app and return Bluetooth before opening this game.');}catch(error){if(!['TypeError','TimeoutError'].includes(error.name))throw error;}
  const directory=await prepare(id),child=start(process.execPath,[fileURLToPath(new URL(game.linked.entry,directory))],{env:{...process.env,MILAN_SESSION_ID:randomUUID()},stdio:['ignore','pipe','pipe','ipc'],windowsHide:true});
  current={id,child,directory};child.once('exit',()=>{if(current?.child===child)void sharing.stop().catch(log);});child.on('message',message=>{if(message?.type==='tce-quit')onQuit();});
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>finish(Error('The game service did not start.')),15000);
   function finish(error){clearTimeout(timer);child.off('exit',exit);child.off('error',failed);error?reject(error):resolve();}
   function exit(code){finish(Error(`Game service exited (${code}).`));}function failed(error){finish(error);}
   child.once('exit',exit);child.once('error',failed);child.stdout.on('data',chunk=>{log(chunk.toString().trim());if(chunk.toString().includes('http://127.0.0.1:5180'))finish();});child.stderr.on('data',chunk=>log(chunk.toString().trim()));
  });await sharing.start(directory);return 'http://127.0.0.1:5180';
 }
 return {open(id){const result=queue.then(()=>open(id));queue=result.catch(()=>{});return result;},stop(id){const result=queue.then(()=>!id||current?.id===id?stop():undefined);queue=result.catch(()=>{});return result;}};
}
