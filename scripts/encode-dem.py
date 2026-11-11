import numpy as np,json,base64,os
from pathlib import Path
root=Path(os.environ.get('SCOTTISH_DEM_CACHE','/tmp/scottish-dem'));meta=json.loads((root/'metadata.json').read_text());out=[]
for n,lat,lon,size in meta:
 a=np.load(root/f'{n}.npy');packed=np.rint(np.clip(a,-1000,5000)*4+32768).astype('<u2');raw=base64.b64encode(packed.tobytes()).decode();j,i=np.unravel_index(a.argmax(),a.shape);print(n,'peakworld',i/240*400-200,j/240*400-200)
 out.append(dict(name=n,latitude=lat,longitude=lon,spanMetres=size,grid=241,base64=raw))
p=Path(__file__).resolve().parents[1]/'dem-data.js';p.write_text('// Derived from Mapzen Terrain Tiles, accessed 2026-11-11. See TERRAIN_ATTRIBUTION.md.\nexport const FIELDS='+json.dumps(out,separators=(',',':'))+';\n')
