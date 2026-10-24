// Presentation only: selection is local; faces always come from the supplied Core state.
export function mountDiceTray({onRoll,onWake,container=document.querySelector('.header-actions')}) {
  const doc=container.ownerDocument, selected=new Set([1,2,3,4,5]);
  let state={},busy=false,rollingSelection=null,disposed=false,feedback=null;
  const make=(tag,className,text)=>{const el=doc.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;};
  const open=make('button','','Dice');open.type='button';open.id='open-dice-tray';open.setAttribute('aria-haspopup','dialog');
  const dialog=make('dialog','dice-tray-dialog');dialog.id='dice-tray-dialog';dialog.setAttribute('aria-labelledby','dice-tray-title');
  const header=make('div','dialog-header'),title=make('h2','','Dice tray');title.id='dice-tray-title';
  const close=make('button','','Close');close.type='button';header.append(title,close);
  const body=make('div','dice-tray-body'),hint=make('p','dice-tray-hint','Select the dice Milan asks you to roll.');
  const felt=make('div','dice-tray-felt');felt.setAttribute('aria-label','Five virtual d10 dice');
  const buttons=[];
  for(let index=1;index<=5;index++){
    const button=make('button','tray-die');button.type='button';button.dataset.die=index;
    button.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true"><path class="die-shell" d="M50 3 93 30 86 72 50 98 14 72 7 30Z"/><path class="die-facet" d="M50 3 50 23 93 30 72 67 50 98 28 67 7 30 50 23 72 67 28 67 50 23"/><text class="die-value" x="50" y="57" text-anchor="middle">—</text></svg>';
    const label=make('span','tray-die-label');button.append(label);
    button.onclick=()=>{if(busy||state.rolling)return;selected.has(index)?selected.delete(index):selected.add(index);feedback=null;render();};
    buttons.push(button);felt.append(button);
  }
  const controls=make('div','dice-tray-controls'),chooseAll=make('button','','Select all'),wake=make('button','','Wake 5 dice'),roll=make('button','dice-tray-roll','Roll 5 dice');
  for(const b of [chooseAll,wake,roll])b.type='button';roll.id='tray-roll-dice';wake.id='tray-wake-dice';
  const status=make('p','dice-tray-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  controls.append(chooseAll,wake,roll);body.append(hint,felt,controls,status);dialog.append(header,body);doc.body.append(dialog);container.append(open);
  function render(){
    if(disposed)return;
    const active=busy||!!state.rolling,ready=!!state.connected&&!!state.ready;
    for(const button of buttons){
      const index=Number(button.dataset.die),die=state.dice?.find(d=>d.index===index);
      const spinning=rollingSelection?.has(index)||!!die?.rolling;
      const face=Number.isInteger(die?.face)&&die.face>=1&&die.face<=10?die.face:null;
      button.classList.toggle('rolling',!!spinning);button.classList.toggle('sleeping',!die?.announced);
      button.setAttribute('aria-pressed',String(selected.has(index)));button.disabled=active;
      button.querySelector('.die-value').textContent=spinning?'…':face===null?'—':String(face);
      button.querySelector('.tray-die-label').textContent=`Die ${index} · ${spinning?'Rolling':!die?.announced?'Sleeping':face===null?'Ready':face}`;
      button.setAttribute('aria-label',`Die ${index}${face===null?'':`, result ${face}`}${spinning?', rolling':''}`);
    }
    chooseAll.disabled=active;chooseAll.textContent=selected.size===5?'Clear selection':'Select all';
    roll.disabled=!ready||state.canRoll===false||active||!selected.size;roll.textContent=rollingSelection?'Rolling…':`Roll ${selected.size} ${selected.size===1?'die':'dice'}`;
    wake.disabled=!ready||active;
    open.dataset.rolling=String(!!state.rolling||!!rollingSelection);
    if(!active)status.textContent=state.connected&&state.ready&&feedback?feedback:!state.connected?'Connect Milan to the Core.':!state.ready?'Milan has not opened its dice channel.':state.canRoll===false?'Wake the dice, then continue setup in Milan.':selected.size?`${selected.size} selected · d10`:'Select at least one die.';
  }
  async function act(kind){
    if(busy||state.rolling||!state.connected||!state.ready||(kind==='roll'&&(!selected.size||state.canRoll===false)))return;
    busy=true;feedback=null;const dice=[...selected].sort((a,b)=>a-b);rollingSelection=kind==='roll'?new Set(dice):null;status.textContent=kind==='roll'?'Rolling selected dice…':'Waking five dice…';render();
    let message;
    try{
      const next=await (kind==='roll'?onRoll(dice):onWake());if(next)state=next;
      message=kind==='roll'?dice.map(i=>{const value=state.dice?.find(d=>d.index===i)?.face;return `Die ${i}: ${Number.isInteger(value)&&value>=1&&value<=10?value:'awaiting result'}`;}).join(' · '):'Five dice awakened. No roll was sent.';
    }catch(error){message=error.message;}
    finally{busy=false;rollingSelection=null;feedback=message;render();}
  }
  chooseAll.onclick=()=>{selected.size===5?selected.clear():[1,2,3,4,5].forEach(i=>selected.add(i));feedback=null;render();};
  wake.onclick=()=>act('wake');roll.onclick=()=>act('roll');
  open.onclick=()=>{dialog.showModal();render();};close.onclick=()=>dialog.close();
  render();
  return {update(next){state=next||{};render();},dispose(){disposed=true;dialog.remove();open.remove();}};
}
