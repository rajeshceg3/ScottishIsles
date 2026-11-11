import math,json,urllib.request,time,os
from pathlib import Path
from PIL import Image
import numpy as np
# Broad crops around sourced island coordinates. Crops include surrounding sea;
# these are not legal boundaries or navigation data.
islands=[('Rum',56.99,-6.34,16000),('Eigg',56.90,-6.15,11000),('Muck',56.83417,-6.24889,5500),('Canna',57.063,-6.55,9500),('Sanday',57.04931,-6.49039,4300)]
z=12;n=2**z;root=Path(os.environ.get('SCOTTISH_DEM_CACHE','/tmp/scottish-dem'));root.mkdir(parents=True,exist_ok=True);ledger=[]
def xy(lat,lon):return (lon+180)/360*n,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n
for name,lat,lon,size in islands:
 spanlat=size/111320;spanlon=size/(111320*math.cos(math.radians(lat)));xmin,ymax=xy(lat-spanlat/2,lon-spanlon/2);xmax,ymin=xy(lat+spanlat/2,lon+spanlon/2)
 tiles={}
 for x in range(math.floor(xmin),math.floor(xmax)+1):
  for y in range(math.floor(ymin),math.floor(ymax)+1):
   p=root/f'{z}-{x}-{y}.png';url=f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
   if not p.exists():
    with urllib.request.urlopen(url,timeout=30) as r:p.write_bytes(r.read())
   a=np.array(Image.open(p).convert('RGB')).astype(float);tiles[x,y]=a[:,:,0]*256+a[:,:,1]+a[:,:,2]/256-32768;ledger.append(url)
 dim=241;grid=np.zeros((dim,dim))
 for j in range(dim):
  for i in range(dim):
   tx=xmin+(xmax-xmin)*i/(dim-1);ty=ymin+(ymax-ymin)*j/(dim-1);x=int(tx);y=int(ty);px=min(255,int((tx-x)*256));py=min(255,int((ty-y)*256));grid[j,i]=tiles[x,y][py,px]
 np.save(root/f'{name}.npy',grid);Image.fromarray(np.uint8(np.clip(grid/ max(grid.max(),1)*255,0,255))).save(root/f'{name}-height.png');print(name,'min/max',grid.min(),grid.max(),'land',np.mean(grid>1),flush=True)
(root/'metadata.json').write_text(json.dumps(islands));(root/'urls.json').write_text(json.dumps(sorted(set(ledger)),indent=2))
