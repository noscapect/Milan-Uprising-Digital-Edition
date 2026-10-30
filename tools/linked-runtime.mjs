import {mkdir,readdir,copyFile,lstat,readFile,writeFile} from 'node:fs/promises';
import {loadGameModules} from '../server/game-modules.mjs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
export const projectRoot=new URL('../',import.meta.url);
// Copy only reviewed, version-controlled source. State always stays in private/.
export async function prepareLinkedRuntime(gameId) {
  const games=await loadGameModules(fileURLToPath(projectRoot),JSON.parse(await readFile(new URL('../resources/addons.json',import.meta.url),'utf8')));
  const game=games.find(item=>item.id===(gameId||games[0]?.id));if(!game?.linked)throw Error('This game has no linked adapter.');
  const runtime=pathToFileURL(resolve(fileURLToPath(projectRoot),'private',game.linked.workspace)+'/');
  const pendingNative=[];
  async function copy(source,destination){
    await mkdir(destination,{recursive:true});
    if((await lstat(destination)).isSymbolicLink())throw Error('Runtime directory must not be a symlink.');
    for(const entry of await readdir(source,{withFileTypes:true})){
      if(['bin','obj','__pycache__'].includes(entry.name))continue;
      const from=new URL(entry.name+(entry.isDirectory()?'/':''),source),to=new URL(entry.name+(entry.isDirectory()?'/':''),destination);
      if(entry.isDirectory())await copy(from,to);
      else if(entry.isFile()){
        try{if((await lstat(to)).isSymbolicLink())throw Error('Runtime file must not be a symlink.');}catch(error){if(error.code!=='ENOENT')throw error;}
        const native=/\.(exe|dll|pyd)$/i.test(entry.name);
        if(native){try{const [original,current]=await Promise.all([readFile(from),readFile(to)]);if(original.equals(current))continue;}catch(error){if(error.code!=='ENOENT')throw error;}}
        try{await copyFile(from,to);}catch(error){if(native&&['EPERM','EBUSY','EACCES'].includes(error.code)){pendingNative.push(entry.name);}else throw error;}
      }
    }
  }
  await copy(new URL('../integration/runtime/',import.meta.url),runtime);
  await copy(pathToFileURL(resolve(fileURLToPath(projectRoot),game.linked.source)+'/'),runtime);
  await writeFile(new URL('game-module.json',runtime),JSON.stringify(game,null,2));
  const shared=new URL('../tce-machine.json',runtime),local=new URL('machine.json',runtime);
  let settings={};try{settings=JSON.parse(await readFile(local,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  try{settings={...settings,...JSON.parse(await readFile(shared,'utf8'))};}catch(error){if(error.code!=='ENOENT')throw error;}
  if(Object.keys(settings).length)await writeFile(local,JSON.stringify(settings,null,2));
  const keys=['usbAdapter','usbBusId','wslDistribution','adb','corePython','visionPython','linuxUser','setupVersion','helperVersion','androidToolsSha256'];if(Object.keys(settings).length)await writeFile(shared,JSON.stringify(Object.fromEntries(keys.filter(key=>key in settings).map(key=>[key,settings[key]])),null,2));
  await writeFile(new URL('native-update.json',runtime),JSON.stringify({pending:pendingNative.length>0,files:pendingNative}));
  return runtime;
}
