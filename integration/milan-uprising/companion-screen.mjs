const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function readCompanionScreen(raw,component){
 if(!raw.available||!['allies','ghouls'].includes(component?.groupId))return null;
 const text=normalize(raw.lines.map(l=>l.text).join(' '));
 if(/confirmation|areyousure|youwanttocontinue|anerrorocc|indexwasoutofrange/.test(text))return null;
 const right=raw.lines.filter(l=>l.x>raw.width*.65).map(l=>normalize(l.text));
 const selected=raw.lines.filter(l=>l.x<raw.width*.4&&l.y>raw.height*.3&&l.y<raw.height*.6).map(l=>normalize(l.text)).join('');
 if(!right.includes('allies')||!right.includes('ghouls')||!right.includes('done')||!text.includes('cost'))return null;
 const identity=normalize(component.label.split('·')[0]);
 // Jurgen's red role heading is missed by the tablet OCR; his name is readable.
 if(!selected.includes(identity)&&!(component.id==='ghoul-fixer'&&selected.includes('jurgen'))&&!(component.id==='ally-carabinieri-officer'&&selected.includes('policeofficer')))return null;
 return {componentId:component.id,screen:'companion-placement'};
}
