import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
const idPattern = /^[a-z0-9][a-z0-9-]{0,80}$/;
export async function loadLocalArtwork(directory,{gameId,urlPrefix='/local-artwork'}={}) {
  const empty = { available:false, assets:{}, components:{}, zones:{}, groups:{}, faces:{}, branding:{} };
  const files = new Map();
  try {
    const manifestPath = resolve(directory, 'manifest.json');
    if ((await stat(manifestPath)).size > 256 * 1024) return { catalog:empty, files };
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (manifest.format !== 'tabletop-local-artwork' || manifest.schemaVersion !== 1 || typeof manifest.gameId!=='string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.gameId) || gameId&&manifest.gameId!==gameId) return { catalog:empty, files };
    const root = await realpath(resolve(directory, 'images'));
    const catalog = structuredClone(empty);
    catalog.gameId=manifest.gameId;
    for (const [id, asset] of Object.entries(manifest.assets || {}).slice(0, 256)) {
      if (!idPattern.test(id) || !/^[a-z0-9-]+\.png$/.test(asset.file)) continue;
      try {
        const path = await realpath(resolve(root, asset.file));
        const rel = relative(root, path);
        if (rel.startsWith('..') || isAbsolute(rel)) continue;
        const info = await stat(path);
        if (!info.isFile() || info.size > 25 * 1024 * 1024) continue;
        const data = await readFile(path);
        if (!data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) continue;
        const url = `${urlPrefix}/${id}.png`;
        files.set(url, path);
        catalog.assets[id] = url;
      } catch { /* One missing image must not disable the table. */ }
    }
    const known = id => typeof id === 'string' && Object.hasOwn(catalog.assets, id);
    for (const kind of ['components','zones']) {
      for (const [id, values] of Object.entries(manifest[kind] || {})) {
        if (!idPattern.test(id) || !values || typeof values !== 'object') continue;
        catalog[kind][id] = Object.fromEntries(Object.entries(values).filter(([key,value]) => ['icon','detail','background'].includes(key) && known(value)));
      }
    }
    for (const kind of ['groups','faces','branding']) catalog[kind] = Object.fromEntries(Object.entries(manifest[kind] || {}).filter(([id,value]) => idPattern.test(id) && known(value)));
    catalog.available = files.size > 0;
    return { catalog, files };
  } catch { return { catalog:empty, files }; }
}
