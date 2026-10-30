import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createGameAddons} from './server/game-addons.mjs';
import {loadGameModules} from './server/game-modules.mjs';
import {createArtworkAcquirer} from './server/artwork-acquisition.mjs';
const projectRoot=fileURLToPath(new URL('./',import.meta.url)),files=new Map();
async function register(directory){for(const entry of await readdir(resolve(projectRoot,directory),{withFileTypes:true})){const path=directory+'/'+entry.name;if(entry.isDirectory())await register(path);else if(entry.isFile()){const type={js:'text/javascript',css:'text/css',json:'application/json',html:'text/html'}[entry.name.split('.').at(-1)];if(type)files.set('/'+path,[path,type]);}}}
for(const directory of ['src','data/games','legacy']){try{await register(directory);}catch(error){if(directory!=='legacy'||error.code!=='ENOENT')throw error;}}
export async function createTableServer({resourceRoot=resolve(projectRoot,'resources'),privateRoot=resolve(projectRoot,'private'),launchLinked=null,closeLinked=null,acquire}={}){
 const games=await loadGameModules(projectRoot,JSON.parse(await readFile(resolve(resourceRoot,'addons.json'),'utf8')));
 const addons=createGameAddons({definitions:games,resourceRoot,privateRoot,acquire:acquire??createArtworkAcquirer({projectRoot,resourceRoot,privateRoot})});
 const server=http.createServer(async(req,res)=>{
  const route=req.url?.split('?')[0],json=(status,value)=>res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(value.games?{...value,applicationOrigin:`http://127.0.0.1:${server.address().port}`}:value));
  try{
   if(route==='/api/application-instance'&&req.method==='GET'){json(200,{application:'teburu-core-emulator'});return;}
   if(route==='/api/game-addons'){
    if(req.method==='GET'){json(200,{...await addons.status(),linkedAvailable:!!launchLinked});return;}
    const host=`127.0.0.1:${server.address().port}`;
    if(req.method!=='POST'||req.headers.host!==host||req.headers.origin!==`http://${host}`||!req.headers['content-type']?.startsWith('application/json')){json(403,{error:'Use the local TCE game manager.'});return;}
    let body='';for await(const part of req){body+=part;if(body.length>4096)throw Error('Request too large.');}const request=JSON.parse(body);
    if(request.operation==='open-linked'){if(!launchLinked)throw Error('Use Start-TCE to open linked games.');await addons.requireActive(request.id);const url=await launchLinked(request.id);await addons.action({operation:'select',id:request.id});json(200,{url});return;}
    if(request.operation==='disable'&&closeLinked)await closeLinked(request.id);
    json(200,{...await addons.action(request),linkedAvailable:!!launchLinked});return;
   }
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(404).end();return;}
   const selected=async()=>{const status=await addons.status();return games.find(game=>game.id===status.selected);};
   let entry;
   if(['/','/index.html','/addons.html'].includes(route))entry=['index.html','text/html'];
   else if(route==='/table'){const game=await selected();if(!game)throw Error('Add a game first.');await addons.requireActive(game.id);entry=[game.client?.table,'text/html'];}
   else{
    const gameRoute=route?.match(/^\/games\/([a-z0-9-]+)\/(table|artwork\/[^/]+)$/),legacyArtwork=route?.startsWith('/local-artwork/');
    if(gameRoute||legacyArtwork){
     const game=gameRoute?games.find(item=>item.id===gameRoute[1]):await selected();if(!game)throw Error('Unknown or unavailable game.');await addons.requireActive(game.id);
     if(gameRoute?.[2]==='table')entry=[game.client?.table,'text/html'];
     else{
      const artwork=await addons.artwork(game.id),name=route.split('/').at(-1);
      if(name==='catalog.json'){json(200,artwork.catalog);return;}
      const path=artwork.files.get(`/games/${game.id}/artwork/${name}`);if(!path){res.writeHead(404).end();return;}
      res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-store'}).end(req.method==='HEAD'?undefined:await readFile(path));return;
     }
    }else{
     const scoped=route?.match(/^\/(?:data|src)\/games\/([a-z0-9-]+)\//);if(scoped)await addons.requireActive(scoped[1]);entry=files.get(route);
    }
   }
   if(!entry?.[0]){res.writeHead(404).end('Not found');return;}
   const data=req.method==='HEAD'?undefined:await readFile(resolve(projectRoot,entry[0]));res.writeHead(200,{'Content-Type':entry[1]+'; charset=utf-8','Cache-Control':'no-store'}).end(data);
  }catch(error){if(!res.headersSent)json(409,{error:error.message,available:false});else res.end();}
 });return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const pending=new Map();let sequence=0;
 process.on('message',message=>{if(message?.type==='tce-game-result'){const request=pending.get(message.requestId);if(request){pending.delete(message.requestId);message.error?request.reject(Error(message.error)):request.resolve(message.url);}}});
 const command=(type,id)=>new Promise((resolve,reject)=>{const requestId=++sequence;pending.set(requestId,{resolve,reject});process.send({type,id,requestId});});
 const server=await createTableServer({launchLinked:process.send?id=>command('tce-open-game',id):null,closeLinked:process.send?id=>command('tce-close-game',id):null});server.on('error',error=>{console.error(error.message);process.exitCode=1;});server.listen(5178,'127.0.0.1',()=>console.log('Bord: http://127.0.0.1:5178 — TCE game library'));
}
