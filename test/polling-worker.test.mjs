import test from 'node:test';
import assert from 'node:assert/strict';
import {createPollingWorker} from '../src/adapters/polling-worker.js';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(predicate){for(let n=0;n<100&&!predicate();n++)await wait(5);assert.ok(predicate());}
test('achtergrondwerk begint zonder browser, overlapt niet en herstelt na een fout',async()=>{
  let calls=0,active=0,max=0,release;
  const states=[];
  const worker=createPollingWorker({interval:1,onState:s=>states.push(s),run:async()=>{calls++;active++;max=Math.max(active,max);try{if(calls===1){await new Promise(r=>{release=r;});throw Error('Tablet tijdelijk niet beschikbaar');}}finally{active--;}}});
  worker.start();worker.start();await until(()=>release);
  await wait(15);assert.equal(calls,1);release();
  await until(()=>states.some(s=>s.error==='Tablet tijdelijk niet beschikbaar')&&worker.status().lastSuccessAt);
  await worker.stop();const finished=calls;await wait(15);
  assert.equal(calls,finished);assert.equal(max,1);assert.equal(worker.status().running,false);assert.equal(worker.status().error,null);
});
test('stop wacht op een lopende cyclus en start daarna geen nieuwe',async()=>{
  let release,calls=0;
  const worker=createPollingWorker({interval:1,onState:()=>{throw Error('monitor defect');},run:()=>{calls++;return new Promise(r=>{release=r;});}});
  worker.start();await until(()=>release);let stopped=false;
  const stopping=worker.stop().then(()=>{stopped=true;});await wait(5);assert.equal(stopped,false);
  release();await stopping;await wait(10);assert.equal(calls,1);assert.equal(stopped,true);
});
