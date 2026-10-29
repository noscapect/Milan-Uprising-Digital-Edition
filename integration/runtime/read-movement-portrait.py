import sys,json,struct
from pathlib import Path
import cv2,numpy as np
cv2.setNumThreads(2)
root=Path(__file__).resolve().parent
data=Path(sys.argv[1]).read_bytes()
if data[:8]==b'\x89PNG\r\n\x1a\n':image=cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_COLOR)
else:
 w,h,fmt=struct.unpack_from('<III',data);offset=len(data)-w*h*4
 if (w,h,fmt)!=(2560,1600,1) or offset not in (12,16):raise ValueError('Unsupported capture')
 image=cv2.cvtColor(np.frombuffer(data[offset:],np.uint8).reshape(h,w,4),cv2.COLOR_RGBA2BGR)
if image.shape[:2]!=(1600,2560):raise ValueError('Unsupported size')
mask=np.zeros(image.shape[:2],np.uint8);mask[550:740,620:810]=255
sift=cv2.SIFT_create(nfeatures=16000);target,td=sift.detectAndCompute(image,mask);results=[]
for clan in ['brujah','nosferatu','toreador','tremere','ventrue','malkavian','gangrel','hecata','lasombra','ministry','tzimisce']:
 icon=cv2.imread(str(root.parent/'bundled-artwork/images'/('character-'+clan+'-icon.png')))
 if icon is None or td is None:continue
 keys,ds=sift.detectAndCompute(icon,None)
 if ds is None:continue
 good=[a for a,b in cv2.BFMatcher().knnMatch(ds,td,k=2) if a.distance<b.distance*.65]
 if len(good)<8:continue
 matrix,ok=cv2.estimateAffinePartial2D(np.float32([keys[a.queryIdx].pt for a in good]),np.float32([target[a.trainIdx].pt for a in good]),method=cv2.RANSAC,ransacReprojThreshold=2)
 if matrix is None or int(ok.sum())<8:continue
 scale=float(np.hypot(matrix[0,0],matrix[1,0]));center=matrix@np.array([icon.shape[1]/2,icon.shape[0]/2,1])
 if .45<scale<.85 and abs(matrix[1,0])<.025 and 650<center[0]<770 and 590<center[1]<710:results.append({'componentId':'character-'+clan,'inliers':int(ok.sum())})
print(json.dumps({'ready':len(results)==1,'componentId':results[0]['componentId'] if len(results)==1 else None,'matches':results}))
