import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const run=promisify(execFile);
const adb=process.env.MILAN_ADB || 'adb';
export async function captureTablet({teburu=false,raw=false}={}){
  let stdout;
  try{({stdout}=await run(adb,['devices'],{timeout:5000,windowsHide:true,maxBuffer:100000}));}
  catch(error){
    if(!/protocol fault|daemon not|cannot connect|connection reset/i.test(error.message))throw error;
    // Recover our local ADB transport after sleep/restart; no app or device settings are changed.
    try{await run(adb,['start-server'],{timeout:15000,windowsHide:true,maxBuffer:100000});}catch{}
    ({stdout}=await run(adb,['devices'],{timeout:5000,windowsHide:true,maxBuffer:100000}));
  }
  const devices=stdout.split(/\r?\n/).filter(line=>/^\S+\s+device$/.test(line.trim())).map(line=>line.trim().split(/\s+/)[0]);
  if(devices.length!==1)return {available:false,error:devices.length?'Connect exactly one authorised tablet.':'Connect the tablet and authorise USB debugging on it.'};
  const device=devices[0];
  const packageName=teburu?'com.xplored.teburu.app':'com.xplored.teburu.vtm';
  let appInstance=null;
  try{const {stdout:pid}=await run(adb,['-s',device,'shell','pidof',packageName],{timeout:5000,windowsHide:true});if(/^\d+$/.test(pid.trim()))appInstance=createHash('sha256').update(device+':'+pid.trim()).digest('hex');}catch{}
  const {stdout:activity}=await run(adb,['-s',device,'shell','dumpsys','window'],{timeout:5000,windowsHide:true,maxBuffer:2000000});
  const resumed=activity.split(/\r?\n/).filter(line=>/mCurrentFocus=/.test(line));
  const packagePattern=teburu?/\bcom\.xplored\.teburu\.app\//:/\bcom\.xplored\.teburu\.vtm\//;
  if(resumed.length!==1||!resumed.every(line=>packagePattern.test(line)))return {available:false,error:'Open the requested official app on the tablet. Other screens are not captured.'};
  if(raw){
    try{
      const {stdout:compressed}=await run(adb,['-s',device,'exec-out','sh','-c','screencap | gzip -1'],{encoding:'buffer',timeout:5000,windowsHide:true,maxBuffer:20000000});
      const bytes=gunzipSync(compressed,{maxOutputLength:40000000});
      const width=bytes.readUInt32LE(0),height=bytes.readUInt32LE(4),format=bytes.readUInt32LE(8);
      if(width<400||height<300||width>5000||height>5000||format!==1||![12,16].some(header=>bytes.length===header+width*height*4))throw Error('Unsupported raw screenshot format.');
      const imagePath=fileURLToPath(new URL(`./tablet-capture-${randomUUID()}.rgba`,import.meta.url));
      writeFileSync(imagePath,bytes);return {available:true,imagePath,format:'rgba',appInstance};
    }catch{/* Older tablets keep the existing PNG capture path. */}
  }
  const imagePath=fileURLToPath(new URL(`./tablet-${teburu?'teburu-':''}capture-${randomUUID()}.png`,import.meta.url));
  const {stdout:png}=await run(adb,['-s',device,'exec-out','screencap','-p'],{encoding:'buffer',timeout:5000,windowsHide:true,maxBuffer:20000000});
  if(!Buffer.isBuffer(png)||!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('The tablet did not return a valid screenshot.');
  writeFileSync(imagePath,png);return {available:true,imagePath,appInstance};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=await captureTablet({teburu:process.argv.includes('--teburu')});console.log(JSON.stringify(result));
}
