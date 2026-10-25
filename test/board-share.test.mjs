import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createBoardShare} from '../server/board-share.mjs';

test('LAN-bordlink vereist code, deelt alleen bordroutes en bewaakt de oorsprong',async()=>{
  const received=[];
  const upstream=http.createServer(async(req,res)=>{
    let body='';for await(const part of req)body+=part;
    received.push({url:req.url,method:req.method,host:req.headers.host,body});
    res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({board:true}));
  });
  await new Promise(r=>upstream.listen(0,'127.0.0.1',r));
  const share=createBoardShare({address:'127.0.0.1',port:0,upstream:'http://127.0.0.1:'+upstream.address().port,pin:'123456'});
  await new Promise(r=>share.server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+share.server.address().port;
  try{
    const login=await fetch(base+'/board');assert.match(await login.text(),/Access code/);assert.equal(received.length,0);
    assert.equal((await fetch(base+'/api/table-session')).status,401);
    assert.equal((await fetch(base+'/api/board-scan',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
    assert.equal((await fetch(base+'/join',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'pin=000000'})).status,401);
    const joined=await fetch(base+'/join',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:base},body:'pin=123456',redirect:'manual'});
    assert.equal(joined.status,303);assert.equal(joined.headers.get('location'),'/board');
    const cookie=joined.headers.get('set-cookie').split(';')[0];assert.match(joined.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
    for(const path of ['/board','/api/table-session','/api/board-status','/api/board-tiles','/board-client.mjs','/src/style.css','/data/games/test.json','/local-artwork/test.png']){
      assert.equal((await fetch(base+path,{headers:{Cookie:cookie}})).status,200);
    }
    const count=received.length;
    assert.equal((await fetch(base+'/api/board-clear',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"confirm":true}'})).status,401);
    assert.equal((await fetch(base+'/api/board-clear',{method:'POST',headers:{Cookie:cookie,Origin:'http://example.com','Content-Type':'application/json'},body:'{"confirm":true}'})).status,403);
    for(const path of ['/api/status','/api/windows-core/start','/api/control-center','/control-center.js','/diagnostics','/api/confirmed-app-setup','/private/secret.json','/api/pair']){
      assert.equal((await fetch(base+path,{headers:{Cookie:cookie}})).status,404);
    }
    assert.equal(received.length,count);
    assert.equal((await fetch(base+'/api/board-move',{method:'POST',headers:{Cookie:cookie,Origin:'http://example.com','Content-Type':'application/json'},body:'{}'})).status,403);
    const wrongHost=await new Promise((resolve,reject)=>{
      const request=http.get(base+'/board',{headers:{Cookie:cookie,Host:'other.example'}},response=>{response.resume();response.on('end',()=>resolve(response.statusCode));});request.on('error',reject);
    });
    assert.equal(wrongHost,403);
    assert.equal(received.length,count);
    const move=await fetch(base+'/api/board-move',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{"componentId":"own-piece","zoneId":"own-zone"}'});
    assert.equal(move.status,200);assert.equal(received.at(-1).method,'POST');assert.equal(received.at(-1).host,'127.0.0.1:'+upstream.address().port);
    const clear=await fetch(base+'/api/board-clear',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{"confirm":true}'});
    assert.equal(clear.status,200);assert.equal(received.at(-1).url,'/api/board-clear');assert.equal(received.at(-1).body,'{"confirm":true}');
    assert.equal((await fetch(base+'/api/board-tiles',{method:'POST',headers:{Cookie:cookie,Origin:'http://example.com','Content-Type':'application/json'},body:'{}'})).status,403);
    const tile=await fetch(base+'/api/board-tiles',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{"zoneId":"qt8","kind":"special"}'});
    assert.equal(tile.status,200);assert.equal(received.at(-1).url,'/api/board-tiles');
    assert.equal((await fetch(base+'/api/board-scan',{method:'POST',headers:{Cookie:cookie,Origin:'http://example.com','Content-Type':'application/json'},body:'{}'})).status,403);
    const scan=await fetch(base+'/api/board-scan',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{"componentId":"own-character"}'});
    assert.equal(scan.status,200);assert.equal(received.at(-1).url,'/api/board-scan');assert.equal(received.at(-1).body,'{"componentId":"own-character"}');
    assert.equal((await fetch(base+'/api/board-dice-wake',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
    assert.equal((await fetch(base+'/api/board-dice-wake',{method:'POST',headers:{Cookie:cookie,Origin:'http://example.com','Content-Type':'application/json'},body:'{}'})).status,403);
    const wake=await fetch(base+'/api/board-dice-wake',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{}'});
    assert.equal(wake.status,200);assert.equal(received.at(-1).url,'/api/board-dice-wake');
    assert.equal((await fetch(base+'/api/board-recover',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
    assert.equal((await fetch(base+'/api/board-recover',{method:'POST',headers:{Cookie:cookie,Origin:'http://example.com','Content-Type':'application/json'},body:'{}'})).status,403);
    const recovery=await fetch(base+'/api/board-recover',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{}'});
    assert.equal(recovery.status,200);assert.equal(received.at(-1).url,'/api/board-recover');
    assert.equal((await fetch(base+'/api/board-dice-roll',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
    assert.equal((await fetch(base+'/api/board-dice-roll',{method:'POST',headers:{Cookie:cookie,Origin:'http://example.com','Content-Type':'application/json'},body:'{}'})).status,403);
    const roll=await fetch(base+'/api/board-dice-roll',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{"dice":[1,3,5]}'});
    assert.equal(roll.status,200);assert.equal(received.at(-1).url,'/api/board-dice-roll');assert.equal(received.at(-1).body,'{"dice":[1,3,5]}');
    assert.equal((await fetch(base+'/api/board-expansion-piece',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
    assert.equal((await fetch(base+'/api/board-expansion-piece',{method:'POST',headers:{Cookie:cookie,Origin:'http://example.com','Content-Type':'application/json'},body:'{}'})).status,403);
    const marker=await fetch(base+'/api/board-expansion-piece',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{"operation":"place","componentId":"influence-sabbat-1","zoneId":"qt8","expectedRevision":0}'});
    assert.equal(marker.status,200);assert.equal(received.at(-1).url,'/api/board-expansion-piece');
    for(let i=0;i<6;i++)assert.equal((await fetch(base+'/join',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'pin=000000'})).status,401);
    assert.equal((await fetch(base+'/join',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'pin=000000'})).status,429);
  }finally{await Promise.all([new Promise(r=>share.server.close(r)),new Promise(r=>upstream.close(r))]);}
});

test('Bord delen accepteert alleen lokale bind- en upstreamadressen',()=>{
  assert.throws(()=>createBoardShare({address:'8.8.8.8'}));
  assert.throws(()=>createBoardShare({address:'127.0.0.1',upstream:'http://example.com'}));
  assert.throws(()=>createBoardShare({address:'127.0.0.1',pin:'12'}));
});
