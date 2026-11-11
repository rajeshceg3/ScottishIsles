export const ISLANDS=['Rum','Eigg','Muck','Canna','Sanday'];
const g=(x,z,cx,cz,rx,rz)=>Math.exp(-(((x-cx)/rx)**2)-(((z-cz)/rz)**2));
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function heightAt(id,x,z){
 const extents=[[116,95],[124,64],[88,67],[142,58],[109,54]][id],a=Math.atan2(z/extents[1],x/extents[0]),coast=1+.055*Math.sin(a*5+id)+.035*Math.sin(a*9-id),d=Math.hypot(x/extents[0],z/extents[1])/coast,edge=1-smooth(.82,1.02,d);
 if(d>1.15)return -7;
 let h=2;
 if(id===0){
  const crest=[[-55,-6,32],[-30,-25,62],[5,-12,76],[28,-30,57],[50,-18,30]];let ridge=0;
  for(let i=1;i<crest.length;i++){const [ax,az,ah]=crest[i-1],[bx,bz,bh]=crest[i],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz))),distance=Math.hypot(x-ax-dx*t,z-az-dz*t);ridge=Math.max(ridge,(ah+(bh-ah)*t)*Math.exp(-Math.pow(distance/24,1.15)));}
  h=5*g(x,z,0,-12,90,75)+ridge;
 }

 if(id===1){h+=10*g(x,z,-20,-10,80,70);const nose=1-smooth(23+2*Math.sin(z*.5),32,x),ridge=1-smooth(4,10+2*Math.sin(x*.12),Math.abs(z+9+3*Math.sin(x*.035)));h+=(27+4*Math.sin(x*.07))*nose*ridge*smooth(-85,-55,x);}
 if(id===2)h+=9*g(x,z,28,-14,58,67)+4*g(x,z,-45,10,48,50);
 if(id===3){const plateau=13+8*smooth(-30,-20,z)+9*smooth(0,6,z);h+=plateau*(1-smooth(.5,.85,d));}
 if(id===4)h+=5*g(x,z,-30,-12,85,64)+2*g(x,z,60,10,40,50);
 const detail=(Math.sin(x*.095+Math.sin(z*.06))*Math.cos(z*.12)*.7+Math.sin(x*.43+z*.37)*.25)*(id===0?2:1);
 const erosion=(Math.sin(x*.2+Math.sin(z*.15)*2)*Math.sin(z*.23)+.45*Math.sin(x*.47-z*.31))*(id===0?2.7:1.1);
 const crag=id===0?Math.min(1,h/35):id===1?smooth(15,30,h):0;
 return (h+detail+erosion*crag)*edge-7*(1-edge);
}
