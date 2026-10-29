// Read-only, bounded reader for the observed Android 1.0.9 save-profile format.
// No hardware identities, account strings or campaign/story contents are exported.
export function readSaveProfile(buffer,definitionMapping){
  if(!Buffer.isBuffer(buffer)||buffer.length<100||buffer.length>2_000_000)throw Error('Unsupported save profile size.');
  let cursor=0;
  function need(n){if(!Number.isInteger(n)||n<0||cursor+n>buffer.length)throw Error('Incomplete save profile.');}
  function byte(){need(1);return buffer[cursor++];}
  function present(){if(byte()!==1)throw Error('Unsupported save profile structure.');}
  function bool(){const n=byte();if(n>1)throw Error('Invalid save boolean.');return !!n;}
  function uint(){let n=0,shift=0;for(let i=0;i<5;i++){const b=byte();n+=(b&127)*2**shift;if(b<128){if(n>0xffffffff)break;return n;}shift+=7;}throw Error('Invalid save integer.');}
  function int(){need(4);const n=buffer.readInt32LE(cursor);cursor+=4;return n;}
  function float(){need(4);const n=buffer.readFloatLE(cursor);cursor+=4;if(!Number.isFinite(n))throw Error('Invalid audio setting.');return n;}
  function skip(n){need(n);cursor+=n;}
  function string(){present();const n=uint();if(n>4096)throw Error('Oversized save string.');skip(n);}
  function count(max=64){present();const n=uint();if(n%2||n/2>max)throw Error('Unsupported save collection.');return n/2;}
  present();string(); // Profile name (discarded).
  present();for(let i=0;i<4;i++)string();skip(8); // Account metadata (discarded).
  present();const headers=[];
  for(let slot=0,n=count(32);slot<n;slot++){
    present();const campaignId=int();const insideScenario=bool();bool();bool();const scenarioId=int();
    skip(8);need(8);const savedAt=buffer.readBigInt64LE(cursor).toString();skip(8);
    const definitions=[];for(let i=0,n=count(11);i<n;i++)definitions.push(int());
    const night=int();
    for(let i=0,n=count(32);i<n;i++){present();int();int();}
    for(let i=0,n=count(32);i<n;i++)int();
    headers.push({slot:slot+1,campaignId,scenarioId,insideScenario,definitions,night,savedAt});
  }
  // Non-empty profile tracks have not been observed; reject instead of skipping guesses.
  if(count()!==0)throw Error('This profile contains unsupported tracking records.');
  bool();present();
  const channels=new Set();
  for(let i=0,n=count(16);i<n;i++){present();const channel=int();if(channel<0||channel>15||channels.has(channel))throw Error('Invalid audio channels.');channels.add(channel);for(let j=0;j<2;j++){const volume=float();if(volume<0||volume>1)throw Error('Invalid audio volume.');}}
  bool();bool();string();bool();present();
  const hasLastGame=bool(),mode=int(),slot=uint();
  if(!hasLastGame||mode!==1||slot>=headers.length)throw Error('No supported local save is selected in Milan.');
  const header=headers[slot];
  if(header.campaignId<1||header.scenarioId<1||header.definitions.length!==4||new Set(header.definitions).size!==4)throw Error('The selected save has no complete four-character roster.');
  const characterIds=header.definitions.map(id=>definitionMapping.find(m=>m.definitionId===id)?.componentId);
  if(characterIds.some(id=>!id)||new Set(characterIds).size!==4)throw Error('The save contains unsupported characters.');
  return {...header,characterIds,mode,source:'official-save-profile',format:'android-1.0.9-profile-v0'};
}
