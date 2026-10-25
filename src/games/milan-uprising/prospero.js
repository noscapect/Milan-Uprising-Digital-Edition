// Optional miniature accessory; no campaign rules or player identity.
export const prosperoAccessory=Object.freeze({id:'prospero',label:'Prospero',subtitle:'Prince of Milan',imageAsset:'prospero-led-ring',imageCrop:{width:949,height:440,visibleWidth:249},ledCount:4,source:'https://teburu.zendesk.com/hc/en-us/articles/25458659932827-Troubleshooting-your-Teburu-LED-Ring'});
export function ringPresentation(state,count=4){
  const observed=state?.observed===true&&Array.isArray(state.colors)&&state.colors.length===count&&state.colors.every(c=>Array.isArray(c)&&c.length===3&&c.every(n=>Number.isInteger(n)&&n>=0&&n<=255));
  return {observed,colors:observed?state.colors.map(c=>'#'+c.map(n=>n.toString(16).padStart(2,'0')).join('')):Array(count).fill('#343b3c')};
}
