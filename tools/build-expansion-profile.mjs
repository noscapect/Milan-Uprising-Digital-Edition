import{readFileSync,writeFileSync}from'node:fs';
import{withExpansions}from'../src/games/milan-uprising/expansions.js';
const root=new URL('../data/games/milan-uprising/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name+'.json',root),'utf8'));
const profile=withExpansions(read('city'),read('expansions'));
writeFileSync(new URL('city-expansions.json',root),JSON.stringify(profile,null,2)+'\n');
console.log(`${profile.expansions.length} expansion packs · ${profile.components.length} components`);
