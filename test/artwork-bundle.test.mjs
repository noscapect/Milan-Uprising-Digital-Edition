import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import {packArtwork,installArtwork} from '../server/artwork-bundle.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
test('artwork archive installs without private source and repairs a missing image',async()=>{
 const root=await mkdtemp(join(tmpdir(),'milan-bundle-'));
 try{
  const source=join(root,'source'),target=join(root,'installed'),archive=join(root,'art.gz');
  await mkdir(join(source,'images'),{recursive:true});await writeFile(join(source,'images','map.png'),png);
  await writeFile(join(source,'manifest.json'),JSON.stringify({format:'tabletop-local-artwork',schemaVersion:1,gameId:'milan-uprising',source:{privatePath:'DO-NOT-PUBLISH'},assets:{map:{file:'map.png'}},branding:{map:'map'}}));
  await packArtwork(source,archive);await rm(source,{recursive:true});
  const unpacked=gunzipSync(await readFile(archive)).toString();assert(!unpacked.includes('DO-NOT-PUBLISH'));
  assert.equal((await installArtwork(archive,target)).catalog.branding.map,'map');
  assert.deepEqual(await readFile(join(target,'images','map.png')),png);
  await rm(join(target,'images','map.png'));
  assert.equal((await installArtwork(archive,target)).files.size,1);
  const altered=JSON.parse(unpacked);altered.manifest.assets.map.file='../escape.png';
  await writeFile(archive,gzipSync(JSON.stringify(altered)));
  await assert.rejects(installArtwork(archive,target),/filename/);
  altered.manifest.assets.map.file='map.png';altered.manifest.assets.map.sha256='0'.repeat(64);
  await writeFile(archive,gzipSync(JSON.stringify(altered)));
  await assert.rejects(installArtwork(archive,target),/Invalid artwork image/);
 }finally{await rm(root,{recursive:true,force:true});}
});
