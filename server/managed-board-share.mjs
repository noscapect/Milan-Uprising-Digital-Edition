import {networkInterfaces} from 'node:os';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {createBoardShare} from './board-share.mjs';

export function selectShareAddress(interfaces,previous){
 const addresses=Object.entries(interfaces).filter(([name])=>! /vEthernet|WSL|docker|loopback/i.test(name)).flatMap(([,items])=>items).filter(i=>i.family==='IPv4'&&!i.internal&&/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(i.address)).map(i=>i.address);
 const unique=[...new Set(addresses)];
 if(unique.includes(previous))return previous;
 if(unique.length===1)return unique[0];
 throw Error(unique.length?'Multiple LAN connections found. Select a LAN address using the sharing tool.':'No local network connection is available.');
}
export function createManagedBoardShare({interfaces=networkInterfaces,create=createBoardShare,log=console.error}={}){
 let active=null;
 async function stop(){
  if(!active)return;
  const old=active;active=null;
  await new Promise(resolve=>{old.server.close(resolve);old.server.closeAllConnections();});
  await unlink(old.file).catch(error=>{if(error.code!=='ENOENT')throw error;});
 }
 async function start(directory){
  const file=new URL('board-share-state.json',directory);
  if(active?.file.href===file.href&&active.server.listening)return;
  await stop();
  let share;
  try{
   let previous;try{previous=new URL(JSON.parse(await readFile(file,'utf8')).url).hostname;}catch{}
   const address=selectShareAddress(interfaces(),previous);
   share=create({address});
   await new Promise((resolve,reject)=>{share.server.once('error',reject);share.server.listen(share.port,share.address,resolve);});
   share.server.on('error',error=>log('Remote tabletop: '+error.message));
   await writeFile(file,JSON.stringify({url:`http://${share.address}:${share.server.address().port}`,pin:share.pin}));
   active={server:share.server,file};
  }catch(error){
   share?.server.close();
   await writeFile(file,JSON.stringify({error:'Remote tabletop could not start: '+error.message}));
   log('Remote tabletop could not start: '+error.message);
  }
 }
 let queue=Promise.resolve();
 const enqueue=work=>{const result=queue.then(work);queue=result.catch(()=>{});return result;};
 return {start:directory=>enqueue(()=>start(directory)),stop:()=>enqueue(stop)};
}
