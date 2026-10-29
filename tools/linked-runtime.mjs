import {mkdir,readdir,copyFile,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {installArtwork} from '../server/artwork-bundle.mjs';
export const projectRoot=new URL('../',import.meta.url);
export const runtime=new URL('../private/linked/',import.meta.url);
// Copy only reviewed, version-controlled source. State always stays in private/.
export async function prepareLinkedRuntime() {
  async function copy(source,destination){
    await mkdir(destination,{recursive:true});
    if((await lstat(destination)).isSymbolicLink())throw Error('Runtime directory must not be a symlink.');
    for(const entry of await readdir(source,{withFileTypes:true})){
      const from=new URL(entry.name+(entry.isDirectory()?'/':''),source),to=new URL(entry.name+(entry.isDirectory()?'/':''),destination);
      if(entry.isDirectory())await copy(from,to);
      else if(entry.isFile()){
        try{if((await lstat(to)).isSymbolicLink())throw Error('Runtime file must not be a symlink.');}catch(error){if(error.code!=='ENOENT')throw error;}
        await copyFile(from,to);
      }
    }
  }
  await copy(new URL('../integration/runtime/',import.meta.url),runtime);
  await installArtwork(new URL('../resources/milan-artwork.json.gz',import.meta.url),fileURLToPath(new URL('../private/bundled-artwork/',import.meta.url)));
  return runtime;
}
