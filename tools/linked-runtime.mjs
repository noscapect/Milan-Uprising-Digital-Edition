import {mkdir,readdir,copyFile,lstat,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {installArtwork} from '../server/artwork-bundle.mjs';
export const projectRoot=new URL('../',import.meta.url);
export const runtime=new URL('../private/linked/',import.meta.url);
// Copy only reviewed, version-controlled source. State always stays in private/.
export async function prepareLinkedRuntime() {
  const pendingNative=[];
  async function copy(source,destination){
    await mkdir(destination,{recursive:true});
    if((await lstat(destination)).isSymbolicLink())throw Error('Runtime directory must not be a symlink.');
    for(const entry of await readdir(source,{withFileTypes:true})){
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
  await writeFile(new URL('native-update.json',runtime),JSON.stringify({pending:pendingNative.length>0,files:pendingNative}));
  await installArtwork(new URL('../resources/milan-artwork.json.gz',import.meta.url),fileURLToPath(new URL('../private/bundled-artwork/',import.meta.url)));
  return runtime;
}
