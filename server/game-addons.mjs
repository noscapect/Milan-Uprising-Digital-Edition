import {readFile,writeFile,mkdir,stat,realpath,rename} from 'node:fs/promises';
import {resolve,relative,isAbsolute,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {installArtwork} from './artwork-bundle.mjs';
import {loadLocalArtwork} from './local-artwork.mjs';

export function validateAddonDefinitions(value){
 if(value?.schemaVersion!==1||!Array.isArray(value.games))throw Error('Invalid game add-on catalog.');
 const ids=new Set();
 for(const game of value.games){
  if(!game||typeof game.id!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(game.id)||ids.has(game.id)||typeof game.title!=='string'||!game.title.trim())throw Error('Invalid game add-on identity.');
  for(const path of [game.archive,game.cacheDirectory])if(typeof path!=='string'||!path||isAbsolute(path)||path.includes('\\')||path.split('/').some(part=>!part||part==='.'||part==='..')||path.includes(':'))throw Error('Invalid game resource path.');
  if(!game.archive.endsWith('.json.gz'))throw Error('Invalid artwork archive name.');
  ids.add(game.id);
 }
 return structuredClone(value.games);
}
export function createGameAddons({definitions,resourceRoot,privateRoot,install=installArtwork,load=loadLocalArtwork,acquire=null}){
 const games=validateAddonDefinitions({schemaVersion:1,games:definitions});
 const statePath=resolve(privateRoot,'game-addons.json'),fingerprints=new Map(),artCache=new Map(),jobs=new Map();let queue=Promise.resolve();
 async function state(){try{const saved=JSON.parse(await readFile(statePath,'utf8'));if(![1,2].includes(saved.schemaVersion)||!saved.installed||typeof saved.installed!=='object'||Array.isArray(saved.installed))throw Error('Invalid add-on state.');return {schemaVersion:2,installed:saved.installed,enabled:saved.schemaVersion===1?(saved.active?[saved.active]:[]):Array.isArray(saved.enabled)?saved.enabled:[],selected:saved.schemaVersion===1?saved.active||null:saved.selected??null};}catch(error){if(error.code!=='ENOENT')throw error;return {schemaVersion:2,installed:{},enabled:[],selected:null};}}
 async function save(saved){await mkdir(dirname(statePath),{recursive:true});await writeFile(statePath+'.tmp',JSON.stringify(saved,null,2));await rename(statePath+'.tmp',statePath);}
 function game(id){const entry=games.find(item=>item.id===id);if(!entry)throw Error('Unknown game add-on.');return entry;}
 async function archive(entry){
  try{
   const root=await realpath(resourceRoot),path=await realpath(resolve(root,entry.archive)),rel=relative(root,path);
   if(rel.startsWith('..')||isAbsolute(rel))throw Error('Artwork archive must stay inside resources.');
   const info=await stat(path);if(!info.isFile()||info.size===0||info.size>100*1024*1024)throw Error('Artwork archive has an invalid size.');
   const key=[info.size,info.mtimeMs,info.ctimeMs,info.ino].join(':');let cached=fingerprints.get(path);
   if(cached?.key!==key){cached={key,digest:createHash('sha256').update(await readFile(path)).digest('hex')};fingerprints.set(path,cached);}
   return {path,digest:cached.digest};
  }catch(error){if(error.code==='ENOENT')return null;throw error;}
 }
 async function inspect(entry,saved){
  let source=null,problem=null;try{source=await archive(entry);}catch(error){problem=error.message;}
  let installed=false;
  if(source&&saved.installed[entry.id]===source.digest){try{installed=(await readFile(resolve(privateRoot,entry.cacheDirectory,'bundle.sha256'),'utf8')).trim()===source.digest;}catch{}}
  return {id:entry.id,title:entry.title,archive:`resources/${entry.archive}`,archivePresent:!!source,installed,active:installed&&saved.enabled.includes(entry.id),canInstall:!!source,canActivate:!!source&&installed,canAcquire:!!(acquire&&entry.acquisition),downloadBytes:entry.acquisition?.bytes,job:jobs.get(entry.id)||null,tableUrl:`/games/${entry.id}/table`,linked:!!entry.linked,reason:problem||(!source?'The artwork archive is missing. Add this game to download and prepare its artwork.':!installed?'Add this game to install its artwork.':null)};
 }
 async function status(){const saved=await state(),items=await Promise.all(games.map(entry=>inspect(entry,saved))),enabled=items.filter(item=>item.active).map(item=>item.id),selected=enabled.includes(saved.selected)?saved.selected:enabled[0]||null;return {resourceDirectory:resolve(resourceRoot),games:items,enabled,selected,active:selected};}
 async function requireActive(id){const result=await status();if(!result.enabled.includes(id))throw Error('Install and activate this game with its artwork archive present before using it.');return true;}
 async function artwork(id){
  await requireActive(id);const entry=game(id),source=await archive(entry);
  if(!source)throw Error('The game artwork archive is missing.');
  let cached=artCache.get(id);if(cached?.digest!==source.digest){cached={digest:source.digest,...await load(resolve(privateRoot,entry.cacheDirectory),{gameId:id,urlPrefix:`/games/${id}/artwork`})};artCache.set(id,cached);}
  if(!cached.catalog.available||!cached.catalog.branding.map)throw Error('Installed artwork is incomplete. Reinstall the game add-on.');return cached;
 }
 function mutate({operation,id}={}){
  const result=queue.then(async()=>{
   const entry=game(id);if(!['install','activate','add','disable','select'].includes(operation))throw Error('Unknown game add-on action.');
   const saved=await state();
   if(operation==='disable'){saved.enabled=saved.enabled.filter(item=>item!==id);if(saved.selected===id)saved.selected=null;await save(saved);return status();}
   if(operation==='select'){await requireActive(id);saved.selected=id;await save(saved);return status();}
   const source=await archive(entry);if(!source)throw Error('The game artwork archive is missing. Installation and activation are blocked.');
   if(operation==='install'||operation==='add'){
    await install(source.path,resolve(privateRoot,entry.cacheDirectory),{gameId:id});
    if((await archive(entry))?.digest!==source.digest)throw Error('Artwork archive changed during installation. Check and retry.');
    saved.installed[id]=source.digest;artCache.delete(id);
   }
   if(operation==='activate'||operation==='add'){
    const checked=await inspect(entry,saved);if(!checked.canActivate)throw Error('Install the game add-on first.');
    const loaded=await load(resolve(privateRoot,entry.cacheDirectory),{gameId:id,urlPrefix:`/games/${id}/artwork`});if(!loaded.catalog.available||!loaded.catalog.branding.map)throw Error('Installed artwork is incomplete. Reinstall the add-on.');
    if(!saved.enabled.includes(id))saved.enabled.push(id);saved.selected??=id;artCache.set(id,{digest:source.digest,...loaded});
   }
   await save(saved);return status();
  });queue=result.catch(()=>{});return result;
 }
 async function action(input={}){
  const {operation,id}=input,entry=game(id);
  if(operation==='acquire'||operation==='add'&&!await archive(entry)){
   if(!acquire||!entry.acquisition)throw Error('No automatic artwork source is configured for this game. Supply its archive in the resource folder.');
   if(jobs.get(id)?.phase==='running')return status();
   jobs.set(id,{phase:'running',message:'Preparing artwork download…'});
   void (async()=>{try{await acquire(entry,progress=>jobs.set(id,{phase:'running',...progress}));await mutate({operation:'add',id});jobs.set(id,{phase:'completed',message:'Game added. You can open its tabletop.'});}catch(error){jobs.set(id,{phase:'failed',message:error.message});}})();
   return status();
  }
  return mutate(input);
 }
 return {status,action,requireActive,artwork};
}
