import http from 'node:http';
import {randomBytes,randomInt,timingSafeEqual} from 'node:crypto';
import {isIPv4} from 'node:net';

// Optional LAN front end for a local board adapter. Contains no hardware protocol.
export function createBoardShare({address,port=5182,upstream='http://127.0.0.1:5180',pin=String(randomInt(100000,1000000))}){
  if(!isIPv4(address)||!(/^(127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address)))throw Error('Een lokaal IPv4-adres is vereist.');
  const target=new URL(upstream);
  if(target.protocol!=='http:'||target.hostname!=='127.0.0.1'||target.username||target.password||target.pathname!=='/'||target.search||target.hash)throw Error('De bordadapter moet op loopback draaien.');
  if(!/^\d{6}$/.test(pin))throw Error('Toegangscode moet zes cijfers hebben.');
  const secret=randomBytes(32).toString('hex'),attempts=new Map();
  const login=`<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open de speeltafel</title><style>body{font:18px system-ui;background:#141716;color:#eee;max-width:420px;margin:12vh auto;padding:24px}input,button{box-sizing:border-box;width:100%;font:inherit;padding:14px;margin:10px 0;border-radius:6px}button{background:#dfbf85;color:#171717;border:0}p{line-height:1.5}</style><h1>Open de speeltafel</h1><p>Gebruik de zescijferige code van de pc waarop het bord draait.</p><form method="post" action="/join"><label for="pin">Toegangscode</label><input id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required autofocus><button>Open bord</button></form></html>`;
  const equal=(a,b)=>{const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb);};
  const allowed=(path,method)=>method==='GET'&&(['/board','/board-client.mjs','/board-loader.mjs','/api/table-session','/api/board-status','/api/board-tiles'].includes(path)||/^\/(src\/|data\/games\/|local-artwork\/)/.test(path))||method==='POST'&&['/api/board-move','/api/board-tiles'].includes(path);
  async function read(req,limit){let size=0,parts=[];for await(const part of req){size+=part.length;if(size>limit)throw Error('Verzoek te groot.');parts.push(part);}return Buffer.concat(parts);}
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const host=address+':'+server.address().port,origin='http://'+host;
    if(req.headers.host!==host||(req.headers.origin&&req.headers.origin!==origin)){res.writeHead(403).end('Geen toegang.');return;}
    const url=new URL(req.url,origin),path=url.pathname;
    try{
      if(path==='/join'&&req.method==='POST'){
        if(!req.headers['content-type']?.startsWith('application/x-www-form-urlencoded')){res.writeHead(415).end();return;}
        const now=Date.now(),key=req.socket.remoteAddress;
        for(const [ip,a]of attempts)if(a.until<=now)attempts.delete(ip);
        const entry=attempts.get(key)||{count:0,until:now+300000};
        if(entry.count>=6||(!attempts.has(key)&&attempts.size>=256)){res.setHeader('Retry-After','300');res.writeHead(429).end('Probeer over vijf minuten opnieuw.');return;}
        const supplied=new URLSearchParams((await read(req,1024)).toString()).get('pin')||'';
        entry.count++;attempts.set(key,entry);
        if(!equal(supplied,pin)){res.writeHead(401,{'Content-Type':'text/html; charset=utf-8'}).end(login.replace('<form','<p>De code klopt niet. Probeer opnieuw.</p><form'));return;}
        attempts.delete(key);
        res.setHeader('Set-Cookie',`milan_board=${secret}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`);
        res.writeHead(303,{Location:'/board'}).end();return;
      }
      const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('milan_board='))?.slice('milan_board='.length)||'';
      if(!equal(cookie,secret)){
        if(req.method==='GET'&&(path==='/'||path==='/board')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(login);return;}
        res.writeHead(401).end('Open eerst het bord met de toegangscode.');return;
      }
      if(path==='/'&&req.method==='GET'){res.writeHead(303,{Location:'/board'}).end();return;}
      if(!allowed(path,req.method)){res.writeHead(404).end('Niet beschikbaar via de bordlink.');return;}
      let body;
      if(req.method==='POST'){
        if(!req.headers['content-type']?.startsWith('application/json')){res.writeHead(415).end();return;}
        body=await read(req,4096);
      }
      const response=await fetch(new URL(path+url.search,target),{method:req.method,headers:body?{'Content-Type':'application/json'}:{},body,redirect:'error',signal:AbortSignal.timeout(35000)});
      res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'application/octet-stream'});
      res.end(Buffer.from(await response.arrayBuffer()));
    }catch{if(!res.headersSent)res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8'});res.end('Bord niet bereikbaar. Controleer de lokale bordadapter.');}
  });
  return {server,pin,address,port};
}
