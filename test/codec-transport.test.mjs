import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

test('cancelled codec callers cannot hand a late reply to the next command',async t=>{
 const script=`import ast, asyncio, json, pathlib
source=ast.parse(pathlib.Path('integration/runtime/bumble-core.py').read_text())
cls=next(n for n in source.body if isinstance(n,ast.ClassDef) and n.name=='Codec')
exec(compile(ast.Module(body=[cls],type_ignores=[]),'<codec>','exec'))
class Input:
 def __init__(self): self.writes=[]
 def write(self,data): self.writes.append(json.loads(data)['action'])
 async def drain(self): pass
async def check():
 codec=Codec();codec.lock=asyncio.Lock();codec.pending=set()
 class Process: pass
 codec.process=Process();codec.process.stdin=Input();codec.process.stdout=asyncio.StreamReader()
 first=asyncio.create_task(codec.call('first'))
 await asyncio.sleep(0.01);first.cancel()
 try: await first
 except asyncio.CancelledError: pass
 second=asyncio.create_task(codec.call('second'))
 await asyncio.sleep(0.01)
 assert codec.process.stdin.writes==['first']
 codec.process.stdout.feed_data(b'{"reply":"first"}\\n')
 await asyncio.sleep(0.01)
 assert codec.process.stdin.writes==['first','second']
 codec.process.stdout.feed_data(b'{"reply":"second"}\\n')
 assert (await asyncio.wait_for(second,1))['reply']=='second'
 assert codec.state['reply']=='second'
asyncio.run(check())`;
 try{
  const {stderr}=await promisify(execFile)('python',['-c',script],{windowsHide:true,timeout:10000});
  assert.equal(stderr,'');
 }catch(error){if(error.code==='ENOENT')return t.skip('Optional Python runtime is unavailable.');throw error;}
});
