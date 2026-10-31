import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createManagedBoardShare,selectShareAddress} from '../server/managed-board-share.mjs';
import {createBoardShare} from '../server/board-share.mjs';
const lan=address=>({family:'IPv4',internal:false,address});
test('sharing selects the saved physical LAN, excludes WSL, and refuses ambiguity',()=>{
 assert.equal(selectShareAddress({WiFi:[lan('192.168.1.5')],vEthernet:[lan('172.25.0.1')]}),'192.168.1.5');
 const multiple={WiFi:[lan('192.168.1.5')],Ethernet:[lan('10.0.0.2')]};
 assert.equal(selectShareAddress(multiple,'10.0.0.2'),'10.0.0.2');assert.throws(()=>selectShareAddress(multiple),/Multiple/);
 assert.throws(()=>selectShareAddress({}),/No local network/);
});
test('managed sharing starts once, removes stale state on stop, and restarts',async()=>{
 const root=await mkdtemp(join(tmpdir(),'tce-share-')),directory=pathToFileURL(root+'/');let creates=0;
 const manager=createManagedBoardShare({interfaces:()=>({WiFi:[lan('192.168.1.5')]}),create:()=>{creates++;return createBoardShare({address:'127.0.0.1',port:0});}});
 try{
  await Promise.all([manager.start(directory),manager.start(directory)]);assert.equal(creates,1);
  const state=JSON.parse(await readFile(new URL('board-share-state.json',directory),'utf8'));
  assert.match(state.pin,/^\d{6}$/);assert.equal((await fetch(state.url)).status,200);
  await manager.stop();await assert.rejects(readFile(new URL('board-share-state.json',directory)),{code:'ENOENT'});
  await manager.start(directory);assert.equal(creates,2);
 }finally{await manager.stop();await rm(root,{recursive:true,force:true});}
});
test('unavailable sharing records a visible error without blocking the local game',async()=>{
 const root=await mkdtemp(join(tmpdir(),'tce-share-')),directory=pathToFileURL(root+'/');
 try{
  const manager=createManagedBoardShare({interfaces:()=>({}),log:()=>{}});await manager.start(directory);
  const state=JSON.parse(await readFile(new URL('board-share-state.json',directory),'utf8'));
  assert.match(state.error,/No local network/);assert.equal(state.url,undefined);await manager.stop();
 }finally{await rm(root,{recursive:true,force:true});}
});
