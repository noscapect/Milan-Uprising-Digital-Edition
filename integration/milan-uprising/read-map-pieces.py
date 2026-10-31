import sys,json,struct
from pathlib import Path
import cv2,numpy as np
cv2.setNumThreads(2)
root=Path(__file__).resolve().parent;assets=root.parent/'bundled-artwork/images'
def load(path):
 data=Path(path).read_bytes()
 if data[:8]==b'\x89PNG\r\n\x1a\n':return cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_COLOR)
 w,h,fmt=struct.unpack_from('<III',data);offset=len(data)-w*h*4
 if fmt!=1 or offset not in (12,16) or (w,h)!=(2560,1600):raise ValueError('Unsupported capture')
 return cv2.cvtColor(np.frombuffer(data[offset:],np.uint8).reshape(h,w,4),cv2.COLOR_RGBA2BGR)
target_character=next((a.split('=',1)[1] for a in sys.argv if a.startswith('--character-only=')),None)
movement_overlay='--movement-overlay' in sys.argv
image=load(sys.argv[1]);
if image.shape[:2]!=(1600,2560):print(json.dumps({'ready':False,'reason':'Unsupported size'}));sys.exit()
# Compensate only the known movement overlay's dimming; its rectangle is masked below.
if movement_overlay:image=cv2.convertScaleAbs(image,alpha=3.0)
gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
# A highlighted district/portrait can dominate a small feature budget and
# produce a slightly shifted registration that misses the entire marker grid.
# Keep the existing marker tolerances; register against more map detail.
base=cv2.resize(cv2.imread(str(assets/'map-milan.png')),(1000,632));sift=cv2.SIFT_create(nfeatures=12000)
kp,des=sift.detectAndCompute(cv2.cvtColor(base,cv2.COLOR_BGR2GRAY),None)
roi=gray.copy();roi[:240]=0;roi[1340:]=0;roi[:,1320:]=0
if movement_overlay:roi[530:1075,600:]=0
target,tdes=sift.detectAndCompute(roi,None)
if tdes is None:print(json.dumps({'ready':False,'reason':'No visible map'}));sys.exit()
matches=cv2.BFMatcher().knnMatch(des,tdes,k=2);good=[a for a,b in matches if a.distance<b.distance*.65]
if len(good)<35:print(json.dumps({'ready':False,'reason':'Map artwork not aligned'}));sys.exit()
matrix,inliers=cv2.estimateAffinePartial2D(np.float32([kp[m.queryIdx].pt for m in good]),np.float32([target[m.trainIdx].pt for m in good]),method=cv2.RANSAC,ransacReprojThreshold=3)
if matrix is None or int(inliers.sum())<30:print(json.dumps({'ready':False,'reason':'Insufficient map anchors'}));sys.exit()
if not 1.65<float(np.hypot(matrix[0,0],matrix[1,0]))<1.85 or abs(matrix[1,0])>.02 or not -500<matrix[0,2]<-350 or not 200<matrix[1,2]<300:
 print(json.dumps({'ready':False,'reason':'Unsupported map geometry'}));sys.exit()
inverse=cv2.invertAffineTransform(matrix);regions=json.loads((root/'map-hit-regions.json').read_text())['zones']
mapping=json.loads((root/'location-mapping.json').read_text())['locations']

def investigation_zone(x,y):
 # Investigation markers sit above-left of the control grid. Their centres may
 # cross the printed district boundary, so physical-map polygons are unsuitable.
 # Calibrated against Washington and Cinque Giornate on the Android city view.
 origin_x=matrix[0,2]+490.7;origin_y=matrix[1,2]+68.2
 column=int(round((x-origin_x)/220));row=int(round((y-origin_y)/219))
 if not (0<=column<6 and 0<=row<5):return None
 if abs(x-(origin_x+column*220))>7 or abs(y-(origin_y+row*219))>7:return None
 sensor=(column+2)*5+(4-row)
 matches=[m['zoneId'] for m in mapping if m['appSensor']==sensor]
 return matches[0] if len(matches)==1 else None
def zone_at(x,y):
 point=inverse@np.array([x,y,1]);found=[name for name,r in regions.items() if not name.startswith('haven-') and cv2.pointPolygonTest(np.float32(r['polygon']),tuple(point),True)>2]
 return found[0] if len(found)==1 else None
search=cv2.resize(image[250:1330,:1310],(655,540))
def detect(name,sizes,partial=False):
 source=cv2.imread(str(assets/name),cv2.IMREAD_UNCHANGED);out=[]
 for size in sizes:
  real_size=size;resolution=1 if name=='face-investigation.png' else .5;size=int(size*resolution);canvas=image[250:1330,:1310] if resolution==1 else search;icon=cv2.resize(source,(size,size),interpolation=cv2.INTER_AREA);mask=np.uint8(icon[:,:,3]>240)*255 if icon.shape[2]==4 else np.full((size,size),255,np.uint8)
  if partial:
   clip=np.zeros_like(mask);clip[int(size*.22):int(size*.78),int(size*.72):int(size*.90)]=255;mask=cv2.bitwise_and(mask,clip)
  if not partial and name!='face-investigation.png':
   clip=np.zeros_like(mask);clip[int(size*.2):int(size*.8),int(size*.2):int(size*.8)]=255;mask=cv2.bitwise_and(mask,clip)
  scores=cv2.matchTemplate(canvas,icon[:,:,:3],cv2.TM_CCOEFF_NORMED,mask=mask);scores=1-scores;scores[~np.isfinite(scores)]=10
  for _ in range(4):
   val,_,pos,_=cv2.minMaxLoc(scores)
   if val>.065:break
   x,y=pos;locate=investigation_zone if name=='face-investigation.png' else zone_at;z=locate((x+size/2)/resolution,(y+size/2)/resolution+250)
   if z:out.append({'zoneId':z,'error':round(val,5),'size':real_size,'x':int(x/resolution),'y':int(y/resolution)+250,'partial':partial})
   scores[max(0,y-size//2):y+size//2,max(0,x-size//2):x+size//2]=10
 return sorted(out,key=lambda x:x['error'])
def detect_investigation():
 # The map is already independently registered. Search only the same +/-7px
 # accepted grid positions, instead of matching each size over 1.4M pixels.
 source=cv2.imread(str(assets/'face-investigation.png'),cv2.IMREAD_UNCHANGED);out=[]
 templates=[]
 for size in [62,64,66]:
  icon=cv2.resize(source,(size,size),interpolation=cv2.INTER_AREA)
  mask=np.uint8(icon[:,:,3]>240)*255 if icon.shape[2]==4 else np.full((size,size),255,np.uint8)
  templates.append((size,icon[:,:,:3],mask))
 for row in range(5):
  for column in range(6):
   cx=matrix[0,2]+490.7+column*220;cy=matrix[1,2]+68.2+row*219
   expected=investigation_zone(cx,cy)
   if expected is None:continue
   for size,icon,mask in templates:
    left=int(round(cx-size/2))-8;top=int(round(cy-size/2))-8
    if left<0 or top<250 or left+size+16>1310 or top+size+16>1330:continue
    if movement_overlay and left+size+16>600 and top<1075 and top+size+16>530:continue
    canvas=image[top:top+size+16,left:left+size+16]
    scores=1-cv2.matchTemplate(canvas,icon,cv2.TM_CCOEFF_NORMED,mask=mask);scores[~np.isfinite(scores)]=10
    val,_,pos,_=cv2.minMaxLoc(scores)
    if val>=.045:continue
    x=left+pos[0];y=top+pos[1]
    if investigation_zone(x+size/2,y+size/2)==expected:out.append({'zoneId':expected,'error':float(val)})
 return out
def detect_investigation_removals():
 # Positive red-X evidence at the independently registered marker grid.
 # Removal animation can lift the icon; it cannot jump to a neighbouring cell.
 out=[]
 for row in range(5):
  for column in range(6):
   cx=matrix[0,2]+490.7+column*220;cy=matrix[1,2]+68.2+row*219
   zone=investigation_zone(cx,cy)
   left=int(round(cx))-38;top=int(round(cy))-56
   if zone is None or left<0 or top<250 or left+77>1310 or top+91>1330:continue
   if movement_overlay and left+77>600 and top<1075 and top+91>530:continue
   patch=image[top:top+91,left:left+77];rgb=patch.astype(np.int16)
   red=np.uint8((rgb[:,:,2]>130)&(rgb[:,:,2]>rgb[:,:,1]*2)&(rgb[:,:,2]>rgb[:,:,0]*2))
   n,labels,stats,centers=cv2.connectedComponentsWithStats(red)
   for label in range(1,n):
    x,y,w,h,area=stats[label];px,py=centers[label]
    if not (200<=area<=1200 and 30<=w<=56 and 30<=h<=56 and .75<w/h<1.25):continue
    if abs(left+px-cx)>8 or not -28<=top+py-cy<=8:continue
    yy,xx=np.mgrid[:91,:77];dx=xx-px;dy=yy-py;component=labels==label
    cross=(np.abs(np.abs(dx)-np.abs(dy))<=5)&(np.maximum(np.abs(dx),np.abs(dy))<=28)
    if float((component&cross).sum())/area<.80:continue
    if any((component&cross&(dx*sx>6)&(dy*sy>6)).sum()<30 for sx,sy in [(1,1),(1,-1),(-1,1),(-1,-1)]):continue
    border=(cv2.dilate(np.uint8(component),np.ones((5,5),np.uint8))>0)&~component
    dark=np.max(patch,axis=2)<65
    if not border.any() or float((border&dark).sum())/border.sum()<.6:continue
    out.append(zone)
 return sorted(set(out))
removed_markers=[] if target_character else detect_investigation_removals()
markers=[] if target_character else detect_investigation()
if '--investigation-only' in sys.argv:
 print(json.dumps({'ready':True,'inliers':int(inliers.sum()),'investigationLocations':sorted(set(m['zoneId'] for m in markers if m['error']<.045)),'removedInvestigationLocations':removed_markers,'scope':'positive-visible-investigation-markers'}));sys.exit()
characters=[]
portrait_mask=np.zeros(image.shape[:2],np.uint8);portrait_mask[250:1330,:1310]=255
if movement_overlay:portrait_mask[530:1075,600:]=0
portrait_sift=cv2.SIFT_create(nfeatures=15000);portrait_target,portrait_desc=portrait_sift.detectAndCompute(image,portrait_mask)
for clan in ['brujah','nosferatu','toreador','tremere','ventrue','malkavian','gangrel','hecata','lasombra','ministry','tzimisce']:
 if target_character and target_character!='character-'+clan:continue
 icon_path=assets/('character-'+clan+'-icon.png')
 if not icon_path.is_file():continue
 icon=cv2.imread(str(icon_path));keys,ds=portrait_sift.detectAndCompute(icon,None)
 if ds is None:continue
 pairs=cv2.BFMatcher().knnMatch(ds,portrait_desc,k=2);matched=[a for a,b in pairs if a.distance<b.distance*.65]
 if len(matched)<6:continue
 local,ok=cv2.estimateAffinePartial2D(np.float32([keys[a.queryIdx].pt for a in matched]),np.float32([portrait_target[a.trainIdx].pt for a in matched]),method=cv2.RANSAC,ransacReprojThreshold=2)
 if local is None or int(ok.sum())<6:continue
 scale=float(np.hypot(local[0,0],local[1,0]))
 if not .25<scale<.8 or abs(local[1,0])>.02:continue
 center=local@np.array([128,128,1]);zone=zone_at(*center)
 if zone:characters.append({'componentId':'character-'+clan,'zoneId':zone})
# The small Fixer portrait has too few SIFT features. Match its central face,
# requiring a single positively recognized district; absence never removes it.
companions=[]
fixer=[] if target_character else detect('ghoul-fixer-icon.png',[62,64,66,68,70])
fixer_zones={m['zoneId'] for m in fixer if m['error']<.06}
if len(fixer_zones)==1:companions.append({'componentId':'ghoul-fixer','zoneId':next(iter(fixer_zones))})
print(json.dumps({'ready':True,'inliers':int(inliers.sum()),'investigationLocations':sorted(set(m['zoneId'] for m in markers if m['error']<.045)),'removedInvestigationLocations':removed_markers,'characterMoves':characters,'companionMoves':companions,'scope':'positive-visible-markers-and-unoccluded-portraits'}))
