import {mkdir} from 'node:fs/promises';
import {packArtwork} from '../server/artwork-bundle.mjs';
import {fileURLToPath} from 'node:url';
await mkdir(new URL('../resources/',import.meta.url),{recursive:true});
console.log(await packArtwork(fileURLToPath(new URL('../private/artwork/',import.meta.url)), new URL('../resources/milan-artwork.json.gz',import.meta.url)));
