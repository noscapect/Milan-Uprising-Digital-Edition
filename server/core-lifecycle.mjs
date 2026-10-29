export function createCoreLifecycle({stop,detach}){
 let pending=null;
 function release(){
  if(pending)return pending;
  pending=(async()=>{await stop();await detach();return {released:true};})().finally(()=>pending=null);return pending;
 }
 return {release};
}
