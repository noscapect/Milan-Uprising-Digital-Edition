import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export const runtimeDirectory=fileURLToPath(new URL('./',import.meta.url));
if(new URL('../',import.meta.url).pathname.endsWith('/integration/'))throw Error('Use npm run linked; integration/runtime contains source templates, not writable runtime state.');
let settings={};
try{settings=JSON.parse(readFileSync(new URL('./machine.json',import.meta.url),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
export const visionPython=settings.visionPython || fileURLToPath(new URL('./vision-env/Scripts/python.exe',import.meta.url));
export const visionArguments=(script,image)=>[fileURLToPath(new URL(script,import.meta.url)),image];
