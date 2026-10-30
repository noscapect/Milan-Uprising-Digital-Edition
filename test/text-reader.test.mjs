import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {prepareTextReader,englishModel} from '../tools/prepare-text-reader.mjs';
test('a mismatched OCR model is rejected before bundling or copying runtime libraries',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'tce-text-reader-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 let calls=0;
 await assert.rejects(prepareTextReader({directory,python:'not-used',download:async url=>{calls++;assert.equal(url,englishModel.url);return new Response('incorrect model');}}),/checksum/);
 assert.equal(calls,1);await assert.rejects(access(join(directory,'tessdata','eng.traineddata')));
});
test('an unavailable OCR model fails the package build without a partial model',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'tce-text-reader-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 await assert.rejects(prepareTextReader({directory,download:async()=>new Response('',{status:503})}),/download failed/);
 await assert.rejects(access(join(directory,'tessdata','eng.traineddata')));
});
