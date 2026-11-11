"""Generate the deterministic, hand-shaped moor-grass cutout atlas.
Requires Pillow. Run from repository root. This is procedural artwork, not an island photograph.
"""
from PIL import Image, ImageDraw
import random,math
random.seed(131);scale=4;size=256
im=Image.new('RGBA',(size*scale,size*scale));d=ImageDraw.Draw(im)
for i in range(64):
 base=random.uniform(100,156);top=random.uniform(7,249);yTop=random.uniform(6,115);bend=random.uniform(-40,40);width=random.uniform(.7,2.1);value=random.randrange(200,256)
 # Narrow curved leaves, displaced together at base, with tapered tips.
 def pos(t):
  return ((1-t)**2*base+2*(1-t)*t*(top+bend)+t*t*top,252*(1-t)**2+2*(1-t)*t*(yTop+70)+t*t*yTop)
 left=[];right=[]
 for k in range(14):
  t=k/13;x,y=pos(t);w=width*(1-t)**.65
  left.append(((x-w)*scale,y*scale));right.append(((x+w)*scale,y*scale))
 d.polygon(left+right[::-1],fill=(value,value,max(0,value-7),255))
im.resize((size,size),Image.Resampling.LANCZOS).save('textures/moor-tuft.png')
