import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {loadGameModules} from '../server/game-modules.mjs';
import {createLinkedGameLauncher} from './linked-game-launcher.mjs';
const root=new URL('../',import.meta.url),openBrowser=process.argv.includes('--open');
function browse(url){if(!openBrowser||process.platform!=='win32')return;const browser=spawn('explorer.exe',[url],{stdio:'ignore',windowsHide:true});browser.on('error',error=>console.error(error.message));browser.unref();}
try{const response=await fetch('http://127.0.0.1:5178/api/application-instance',{signal:AbortSignal.timeout(750)});if(response.ok&&(await response.json()).application==='teburu-core-emulator'){browse('http://127.0.0.1:5178');process.exit(0);}}catch{}
const games=await loadGameModules(fileURLToPath(root),JSON.parse(await readFile(new URL('resources/addons.json',root),'utf8')));
const server=spawn(process.execPath,[fileURLToPath(new URL('server.mjs',root))],{stdio:['ignore','pipe','inherit','ipc'],windowsHide:true});
let stopping=false;
const launcher=createLinkedGameLauncher({games,onQuit:()=>stop()});
async function stop(){if(stopping)return;stopping=true;try{await launcher.stop();server.kill();}catch(error){stopping=false;console.error('TCE remains open: '+error.message);}}
server.on('message',message=>{if(['tce-open-game','tce-close-game'].includes(message?.type))void (message.type==='tce-open-game'?launcher.open(message.id):launcher.stop(message.id)).then(url=>server.connected&&server.send({type:'tce-game-result',requestId:message.requestId,url}),error=>server.connected&&server.send({type:'tce-game-result',requestId:message.requestId,error:error.message}));});
server.on('error',error=>{console.error(error.message);void stop();});server.once('exit',()=>{void stop();});
await new Promise((resolve,reject)=>{server.once('exit',code=>reject(Error(`TCE server exited (${code}).`)));server.stdout.on('data',chunk=>{process.stdout.write(chunk);if(chunk.toString().includes('Bord:'))resolve();});});
browse('http://127.0.0.1:5178');
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>void stop());
