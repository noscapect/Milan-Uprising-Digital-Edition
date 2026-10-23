// Serial background work, independent of browser requests or UI lifecycles.
export function createPollingWorker({run, interval=1000, onState=()=>{}}) {
  if(typeof run!=='function'||!Number.isFinite(interval)||interval<0)throw Error('Ongeldige achtergrondtaak.');
  let timer=null,inFlight=null,stopped=true;
  const state={running:false,attempts:0,lastSuccessAt:null,error:null};
  const publish=()=>{try{onState({...state});}catch{/* Monitoring must not stop the worker. */}};
  function schedule(){if(!stopped)timer=setTimeout(tick,interval);}
  function tick(){
    timer=null;if(stopped)return;
    state.attempts++;publish();
    inFlight=Promise.resolve().then(run).then(()=>{state.lastSuccessAt=new Date().toISOString();state.error=null;},error=>{state.error=error?.message||String(error);}).finally(()=>{inFlight=null;publish();schedule();});
  }
  return {
    start(){if(!stopped)return;stopped=false;state.running=true;publish();tick();},
    async stop(){stopped=true;state.running=false;clearTimeout(timer);timer=null;await inFlight;publish();},
    status:()=>({...state})
  };
}
