import test from 'node:test';
import assert from 'node:assert/strict';
import {mapPieceContext} from '../integration/milan-uprising/map-piece-context.mjs';

test('the calibrated movement dialog enables dimmed map recovery without ordinary map OCR',()=>{
 const raw={available:true,width:2560,height:1600,mapGeometry:null,lines:[{text:'MOVEMENT',x:1106,y:605},{text:'Move your character to any other',x:803,y:788},{text:'Location.',x:1146,y:872}]};
 assert.deepEqual(mapPieceContext(raw),{overlay:true});
 assert.equal(mapPieceContext({...raw,width:1920}),null);
 assert.equal(mapPieceContext({...raw,lines:raw.lines.slice(1)}),null);
 assert.equal(mapPieceContext({...raw,lines:raw.lines.map(l=>({...l,y:1400}))}),null);
 assert.equal(mapPieceContext({...raw,lines:[{text:'Lost network connection',x:900,y:405}]}),null);
 assert.deepEqual(mapPieceContext({...raw,lines:[],mapGeometry:'android-city-v1'}),{overlay:false});
});

test('a recognized city scene starts independent image registration when portraits obscure border calibration',()=>{
 const raw={available:true,width:2560,height:1600,mapGeometry:null,lines:[{text:'NIGHT 5 HOUR 2',x:396,y:77},{text:'SUSPICION',x:882,y:77},{text:'MASQUERADE',x:1257,y:77}]};
 assert.deepEqual(mapPieceContext(raw),{overlay:false});
 for(const change of [{available:false},{height:1200},{lines:raw.lines.slice(1)},{lines:raw.lines.filter(l=>l.text!=='SUSPICION')},{lines:[...raw.lines,{text:'Lost network connection',x:900,y:400}]}])assert.equal(mapPieceContext({...raw,...change}),null);
});
