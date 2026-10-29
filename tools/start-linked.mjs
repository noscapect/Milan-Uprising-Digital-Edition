import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {prepareLinkedRuntime,projectRoot} from './linked-runtime.mjs';
const runtime=await prepareLinkedRuntime();
try{const settings=JSON.parse(await readFile(new URL('machine.json',runtime),'utf8'));if(settings.adb)process.env.MILAN_ADB=settings.adb;}catch(error){if(error.code!=='ENOENT')throw error;}
const server=spawn(process.execPath,[fileURLToPath(new URL('server.mjs',projectRoot))],{stdio:['ignore','pipe','inherit'],windowsHide:true});
await new Promise((resolve,reject)=>{
  server.on('error',reject);server.once('exit',code=>reject(Error(`Board server exited (${code}).`)));
  server.stdout.on('data',chunk=>{process.stdout.write(chunk);if(chunk.toString().includes('Bord:'))resolve();});
});
const children=[server,spawn(process.execPath,[fileURLToPath(new URL('android-control.mjs',runtime))],{stdio:'inherit',windowsHide:true})];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();process.exitCode=code;}
for(const child of children){child.on('error',error=>{console.error(error.message);stop(1);});child.on('exit',code=>stop(code||0));}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>stop());
