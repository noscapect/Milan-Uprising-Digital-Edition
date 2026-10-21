import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
const files = new Map([['/', ['index.html','text/html']], ['/index.html',['index.html','text/html']], ['/src/style.css',['src/style.css','text/css']], ['/src/app.js',['src/app.js','text/javascript']], ['/src/model.js',['src/model.js','text/javascript']]]);
// Register only public assets at startup; never serve repository/private files.
async function registerAssets(directory) {
  for (const entry of await readdir(new URL(`${directory}/`, import.meta.url), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await registerAssets(path);
    else if (entry.isFile()) {
      const extension = entry.name.split('.').at(-1);
      const type = { js: 'text/javascript', css: 'text/css', json: 'application/json', html: 'text/html' }[extension];
      if (type) files.set(`/${path}`, [path, type]);
    }
  }
}
for (const directory of ['src', 'data/games', 'legacy']) await registerAssets(directory);
const server = http.createServer(async (req, res) => {
  const entry = files.get(req.url?.split('?')[0]);
  if (!entry || !['GET','HEAD'].includes(req.method)) { res.writeHead(404); res.end('Niet gevonden'); return; }
  try { const data = await readFile(new URL(entry[0], import.meta.url)); res.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8`, 'Cache-Control':'no-store' }); res.end(req.method === 'HEAD' ? undefined : data); }
  catch { res.writeHead(500); res.end('Bestand niet beschikbaar'); }
});
server.on('error', error => { console.error(`Starten mislukt: ${error.message}`); process.exitCode = 1; });
server.listen(5178, '127.0.0.1', () => console.log('Bord: http://127.0.0.1:5178 — stoppen met Ctrl+C'));
