"""Read the calibrated setup diagram, never the enlarged example on its right."""
import sys,json,struct
from pathlib import Path
import cv2,numpy as np
cv2.setNumThreads(2)
root=Path(__file__).resolve().parent
def stop(reason):
 print(json.dumps({'ready':False,'reason':reason}));sys.exit()
data=Path(sys.argv[1]).read_bytes()
if data[:8]==b'\x89PNG\r\n\x1a\n':image=cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_COLOR)
else:
 w,h,fmt=struct.unpack_from('<III',data);offset=len(data)-w*h*4
 if fmt!=1 or offset not in (12,16):stop('Unsupported image')
 image=cv2.cvtColor(np.frombuffer(data[offset:],np.uint8).reshape(h,w,4),cv2.COLOR_RGBA2BGR)
if image is None or image.shape[:2]!=(1600,2560):stop('Unsupported size')
base=cv2.imread(str(root.parent/'bundled-artwork/images/map-milan.png'))
if base is None:stop('Map reference unavailable')
base=cv2.resize(base,(1000,632))
sift=cv2.SIFT_create(nfeatures=10000);mask=np.zeros(image.shape[:2],np.uint8);mask[280:1380,:1320]=255
keys,desc=sift.detectAndCompute(base,None);target,td=sift.detectAndCompute(image,mask)
if td is None or desc is None:stop('Map not aligned')
pairs=cv2.BFMatcher().knnMatch(desc,td,k=2);matches=[p[0] for p in pairs if len(p)==2 and p[0].distance<p[1].distance*.65]
if len(matches)<100:stop('Insufficient map evidence')
matrix,ok=cv2.estimateAffine2D(np.float32([keys[a.queryIdx].pt for a in matches]),np.float32([target[a.trainIdx].pt for a in matches]),method=cv2.RANSAC,ransacReprojThreshold=2)
if matrix is None or int(ok.sum())<100:stop('Map not aligned')
if not (1.65<matrix[0,0]<1.85 and 1.65<matrix[1,1]<1.85 and abs(matrix[0,1])<.02 and abs(matrix[1,0])<.02):stop('Unsupported map geometry')
inverse=cv2.invertAffineTransform(matrix)
regions=json.loads((root/'map-hit-regions.json').read_text())['zones']
catalog=json.loads((root/'../../data/games/milan-uprising/location-bonuses.json').resolve().read_text())['bonuses']
rows=[['qt8','portello','monumentale','isola','centrale','nolo'],['san-siro','city-life','sempione','garibaldi','buenos-aires','citta-studi'],['bande-nere','washington','cadorna','duomo','cinque-giornate','argonne'],['giambellino','solari','navigli','bocconi','porta-romana','calvairate'],['ronchetto','barona','sant-ambrogio','ripamonti','vigentino','corvetto']]
b,g,r=cv2.split(image);gold=((r.astype(float)>g*1.1)&(g.astype(float)>b*1.35)&(r>90)&(g>60)).astype(np.uint8)
gold[:,1320:]=0;gold[:300]=0;gold[1370:]=0
gold=cv2.morphologyEx(gold,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
n,labels,stats,centres=cv2.connectedComponentsWithStats(gold)
visible={};ambiguous=set()
for index in range(1,n):
 x,y,w,h,area=map(int,stats[index])
 if not (38<=w<=58 and 38<=h<=58 and .85<w/h<1.15 and area>500):continue
 roi=image[y:y+h,x:x+w];white=((roi.min(2)>190)&(np.ptp(roi.astype(int),axis=2)<50)).astype(np.uint8)
 count,_,glyphs,_=cv2.connectedComponentsWithStats(white)
 glyphs=[tuple(map(int,z)) for z in glyphs[1:] if z[4]>=100]
 if len(glyphs)!=1:continue
 gx,gy,gw,gh,ga=glyphs[0]
 if not (10<=gw<=30 and 15<=gh<=35 and abs(gx+gw/2-w/2)<7 and abs(gy+gh/2-h/2)<7):continue
 point=inverse@np.array([x+w/2,y+h/2,1])
 found=[name for name,region in regions.items() if name in catalog and cv2.pointPolygonTest(np.float32(region['polygon']),tuple(point),True)>4]
 if len(found)!=1:continue
 zone=found[0]
 if zone in visible:ambiguous.add(zone);continue
 glyph=white[gy:gy+gh,gx:gx+gw]
 filled_house=ga/(gw*gh)>.65 and .6<gw/gh<1.1 and float(glyph[gh//3:2*gh//3,gw//3:2*gw//3].mean())>.8
 visible[zone]={'zoneId':zone,'kind':'special','face':'visible','value':'haven'} if catalog[zone]=='possibleHaven' and filled_house else {'zoneId':zone,'kind':'bonus','face':'visible','value':catalog[zone]}
registered=cv2.warpAffine(base,matrix,(2560,1600));tiles=[];unconfirmed=[]
for row,names in enumerate(rows):
 for col,zone in enumerate(names):
  if zone in ambiguous:unconfirmed.append(zone);continue
  if zone in visible:tiles.append(visible[zone]);continue
  # A back-side record requires matching printed map texture, not a missing icon.
  x,y=np.round(matrix@np.array([312.5+125*col,98.5+125*row,1])).astype(int)
  if not (25<x<1290 and 310<y<1340):unconfirmed.append(zone);continue
  patch=image[y-20:y+21,x-20:x+21];reference=registered[y-20:y+21,x-20:x+21]
  correlation=float(cv2.matchTemplate(cv2.cvtColor(patch,cv2.COLOR_BGR2GRAY),cv2.cvtColor(reference,cv2.COLOR_BGR2GRAY),cv2.TM_CCOEFF_NORMED)[0,0])
  difference=float(np.abs(patch.astype(float)-reference).mean())
  if correlation>.78 and difference<25:tiles.append({'zoneId':zone,'kind':'bonus','face':'hidden','value':catalog[zone],'evidence':'matching-map-texture'})
  else:unconfirmed.append(zone)
print(json.dumps({'ready':True,'geometry':'android-board-tiles-v1','tiles':sorted(tiles,key=lambda t:(t['zoneId'],t['kind'])),'unconfirmed':sorted(unconfirmed),'scope':'registered-setup-tiles-only'}))
