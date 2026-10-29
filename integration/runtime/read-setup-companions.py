import sys,json,struct
from pathlib import Path
import cv2,numpy as np
cv2.setNumThreads(2)
root=Path(__file__).resolve().parent;assets=root.parent/'bundled-artwork/images'
data=Path(sys.argv[1]).read_bytes()
if data[:8]==b'\x89PNG\r\n\x1a\n':image=cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_COLOR)
else:
 w,h,fmt=struct.unpack_from('<III',data);offset=len(data)-w*h*4
 if fmt!=1 or offset not in (12,16):raise ValueError('Unsupported image')
 image=cv2.cvtColor(np.frombuffer(data[offset:],np.uint8).reshape(h,w,4),cv2.COLOR_RGBA2BGR)
def stop(reason):
 print(json.dumps({'ready':False,'reason':reason}));sys.exit()
if image.shape[:2]!=(1600,2560):stop('Unsupported size')
sift=cv2.SIFT_create(nfeatures=12000)
mask=np.zeros(image.shape[:2],np.uint8);mask[280:1380,:1320]=255
target,td=sift.detectAndCompute(image,mask)
def align(source,minimum):
 keys,ds=sift.detectAndCompute(source,None)
 if ds is None or td is None:return None
 pairs=cv2.BFMatcher().knnMatch(ds,td,k=2);good=[a for a,b in pairs if a.distance<b.distance*.65]
 if len(good)<minimum:return None
 matrix,ok=cv2.estimateAffinePartial2D(np.float32([keys[a.queryIdx].pt for a in good]),np.float32([target[a.trainIdx].pt for a in good]),method=cv2.RANSAC,ransacReprojThreshold=2)
 return matrix if matrix is not None and int(ok.sum())>=minimum else None
base=cv2.resize(cv2.imread(str(assets/'map-milan.png')),(1000,632))
matrix=align(base,35)
if matrix is None:stop('Map not aligned')
scale=float(np.hypot(matrix[0,0],matrix[1,0]))
if not 1.65<scale<1.85 or abs(matrix[1,0])>.02:stop('Unsupported setup map geometry '+str(matrix.tolist()))
inverse=cv2.invertAffineTransform(matrix);regions=json.loads((root/'map-hit-regions.json').read_text())['zones']
moves=[]
for path in sorted(assets.glob('*-icon.png')):
 if not path.name.startswith(('ghoul-','ally-','npc-')):continue
 icon=cv2.imread(str(path));local=align(icon,8)
 if local is None:continue
 ratio=float(np.hypot(local[0,0],local[1,0]))
 if not .2<ratio<.8 or abs(local[1,0])>.03:continue
 center=local@np.array([icon.shape[1]/2,icon.shape[0]/2,1]);point=inverse@np.array([*center,1])
 found=[name for name,r in regions.items() if not name.startswith('haven-') and cv2.pointPolygonTest(np.float32(r['polygon']),tuple(point),True)>3]
 if len(found)==1:moves.append({'componentId':path.name.removesuffix('-icon.png'),'zoneId':found[0]})
print(json.dumps({'ready':True,'moves':moves,'scope':'positive-visible-setup-companion-portraits'}))
