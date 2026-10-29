import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {prepareLinkedRuntime,projectRoot} from './linked-runtime.mjs';
const openBrowser=process.argv.includes('--open');
function open(){if(!openBrowser||process.platform!=='win32')return;const browser=spawn('explorer.exe',['http://127.0.0.1:5180'],{stdio:'ignore',windowsHide:true});browser.on('error',error=>console.error(error.message));browser.unref();}
let existing=false;
try{const response=await fetch('http://127.0.0.1:5180/api/application-instance',{signal:AbortSignal.timeout(750)});existing=response.ok&&(await response.json()).application==='milan-uprising';}catch{}
if(existing){open();process.exit(0);}
const runtime=await prepareLinkedRuntime();
process.env.MILAN_SESSION_ID=randomUUID();
try{const settings=JSON.parse(await readFile(new URL('machine.json',runtime),'utf8'));if(settings.adb)process.env.MILAN_ADB=settings.adb;}catch(error){if(error.code!=='ENOENT')throw error;}
const server=spawn(process.execPath,[fileURLToPath(new URL('server.mjs',projectRoot))],{stdio:['ignore','pipe','inherit'],windowsHide:true});
await new Promise((resolve,reject)=>{
  server.on('error',reject);server.once('exit',code=>reject(Error(`Board server exited (${code}).`)));
  server.stdout.on('data',chunk=>{process.stdout.write(chunk);if(chunk.toString().includes('Bord:'))resolve();});
});
const control=spawn(process.execPath,[fileURLToPath(new URL('android-control.mjs',runtime))],{stdio:['ignore','pipe','inherit','ipc'],windowsHide:true});
let opened=false;
control.stdout.on('data',chunk=>{
  process.stdout.write(chunk);
  if(openBrowser&&!opened&&process.platform==='win32'&&chunk.toString().includes('http://127.0.0.1:5180')){
    opened=true;open();
  }
});
const children=[server,control];
let stopping=false;
function finish(code=0){for(const child of children)if(child.exitCode===null)child.kill();process.exitCode=code;}
function stop(code=0){if(stopping)return;stopping=true;if(control.connected){control.send({type:'milan-shutdown'});}else finish(code);}
control.on('message',message=>{
 if(message?.type==='milan-quit')stop();
 if(message?.type==='milan-stopped')finish();
 if(message?.type==='milan-stop-failed'){stopping=false;console.error('App remains open: Bluetooth could not be returned. Retry Stop Core.',message.message);}
});
for(const child of children){child.on('error',error=>{console.error(error.message);stop(1);});child.on('exit',code=>{if(stopping)finish(code||0);else stop(code||0);});}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>stop());
