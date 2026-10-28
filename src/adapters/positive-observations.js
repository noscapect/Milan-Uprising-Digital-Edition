// Independent positive observations. An unrelated changed item does not reset others.
export function createPositiveObservations({key,maxGap=20000}){
  let previous=new Map(),generation=null;
  return {
    observe(items,nextGeneration,capturedAt){
      if(nextGeneration!==generation){previous.clear();generation=nextGeneration;}
      const next=new Map(),stable=[];
      for(const item of items){const id=key(item),prior=previous.get(id);
        if(next.has(id))continue;
        next.set(id,{item,capturedAt});
        if(prior&&capturedAt>prior.capturedAt&&capturedAt-prior.capturedAt<=maxGap)stable.push({...item,pairSince:prior.capturedAt});
      }
      previous=next;return stable;
    },
    reset(){previous.clear();generation=null;}
  };
}
