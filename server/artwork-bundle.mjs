import {readFile, writeFile, mkdir, stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {gzipSync, gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {loadLocalArtwork} from './local-artwork.mjs';

const hash = data => createHash('sha256').update(data).digest('hex');
const limit = 100 * 1024 * 1024;

export async function packArtwork(directory, destination) {
  const {catalog, files} = await loadLocalArtwork(directory);
  if (!catalog.branding.map) throw Error('Artwork pack requires the Milan map.');
  const manifest = {format:'tabletop-local-artwork', schemaVersion:1, gameId:'milan-uprising', assets:{}};
  const images = {};
  for (const [id, url] of Object.entries(catalog.assets)) {
    const data = await readFile(files.get(url));
    manifest.assets[id] = {file:`${id}.png`, sha256:hash(data)};
    images[id] = data.toString('base64');
  }
  for (const key of ['components','zones','groups','faces','branding']) manifest[key] = catalog[key];
  const bytes = gzipSync(JSON.stringify({format:'milan-artwork-bundle', version:1, manifest, images}), {level:9});
  if (bytes.length > limit) throw Error('Artwork archive exceeds 100 MiB.');
  await writeFile(destination, bytes, {flag:'wx'});
  return {images:files.size, bytes:bytes.length};
}

export async function installArtwork(archive, directory) {
  if ((await stat(archive)).size > limit) throw Error('Artwork archive too large.');
  const compressed = await readFile(archive);
  const digest = hash(compressed);
  const marker = resolve(directory, 'bundle.sha256');
  try {
    if ((await readFile(marker,'utf8')).trim() === digest) {
      const loaded = await loadLocalArtwork(directory);
      const manifest = JSON.parse(await readFile(resolve(directory,'manifest.json'),'utf8'));
      if (loaded.catalog.branding.map && loaded.files.size === Object.keys(manifest.assets).length) return loaded;
    }
  } catch { /* First installation. */ }
  const bundle = JSON.parse(gunzipSync(compressed, {maxOutputLength:180*1024*1024}).toString('utf8'));
  const manifest = bundle.manifest;
  if (bundle.format !== 'milan-artwork-bundle' || bundle.version !== 1 || manifest?.format !== 'tabletop-local-artwork' || manifest.schemaVersion !== 1 || manifest.gameId !== 'milan-uprising') throw Error('Invalid artwork archive.');
  const entries = Object.entries(manifest.assets || {});
  if (!entries.length || entries.length > 256 || !manifest.assets[manifest.branding?.map]) throw Error('Incomplete artwork archive.');
  const validated = entries.map(([id, asset]) => {
    if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(id) || asset.file !== `${id}.png` || typeof bundle.images?.[id] !== 'string') throw Error('Invalid artwork filename.');
    const data = Buffer.from(bundle.images[id], 'base64');
    if (data.length > 25*1024*1024 || !data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || hash(data) !== asset.sha256) throw Error(`Invalid artwork image: ${id}`);
    return [asset.file, data];
  });
  await mkdir(resolve(directory,'images'), {recursive:true});
  for (const [name,data] of validated) await writeFile(resolve(directory,'images',name), data);
  await writeFile(resolve(directory,'manifest.json'), JSON.stringify(manifest));
  await writeFile(marker, digest);
  return loadLocalArtwork(directory);
}
