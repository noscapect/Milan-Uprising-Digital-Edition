// Restore our own tabletop JSON through its existing UI; never changes the official app.
const input=document.getElementById('session-file');
let attempts=0;
while(!input.onchange){
  if(++attempts>100)throw Error('Tafelbediening werd niet gestart');
  await new Promise(resolve=>setTimeout(resolve,100));
}
try {
  const response=await fetch('/api/table-session');
  if(!response.ok)throw Error('Overgenomen speelstand ontbreekt');
  const transfer=new DataTransfer();
  transfer.items.add(new File([await response.text()],'speelstand.json',{type:'application/json'}));
  input.files=transfer.files;
  await input.onchange({target:input});
  document.querySelector('.connection').textContent='Speelstand overgenomen · geen live synchronisatie';
  const controls=document.createElement('a');controls.href='/';controls.textContent='App-testbediening';
  controls.style.cssText='color:#e9bd77;padding:8px';
  document.querySelector('.header-actions').prepend(controls);
} catch(error){document.getElementById('status').textContent=error.message;}
