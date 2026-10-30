async function check(){let enabled=[];try{const response=await fetch('/api/game-addons');if(response.ok)enabled=(await response.json()).enabled;}catch{}
 document.dispatchEvent(new CustomEvent('tce:game-active',{detail:{enabled}}));
 if(!enabled.includes('milan-uprising'))document.getElementById('message').textContent='Milan is unavailable. Open the TCE game library to restore its artwork. Stop Core and Bluetooth recovery remain available.';
}
await check();const timer=setInterval(check,2000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
