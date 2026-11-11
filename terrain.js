export const ISLANDS=['Rum','Eigg','Muck','Canna','Sanday'];
const g=(x,z,cx,cz,rx,rz)=>Math.exp(-(((x-cx)/rx)**2)-(((z-cz)/rz)**2));
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function heightAt(id,x,z){
 const w=id===4?1.45:id===3?1.4:1,d=Math.hypot(x/(110*w),z/95),edge=1-smooth(.72,1.02,d);
 if(d>1.15)return -7;
 let h=2;
 if(id===0){for(const [cx,cz,r,hill]of[[-25,-25,37,64],[5,-12,25,76],[28,-30,27,57],[-48,4,32,38]])h=Math.max(h,hill*Math.pow(g(x,z,cx,cz,r,r*1.3),.55));h-=10*g(x,z,0,22,14,50);}
 if(id===1){h+=10*g(x,z,-20,-10,80,70);const nose=1-smooth(20,27,x),ridge=1-smooth(7,14,Math.abs(z+9));h+=30*nose*ridge*smooth(-85,-58,x);}
 if(id===2)h+=9*g(x,z,28,-14,58,67)+4*g(x,z,-45,10,48,50);
 if(id===3){const plateau=13+8*smooth(-30,-20,z)+9*smooth(0,6,z);h+=plateau*(1-smooth(.5,.85,d));}
 if(id===4)h+=5*g(x,z,-30,-12,85,64)+2*g(x,z,60,10,40,50);
 const detail=(Math.sin(x*.095+Math.sin(z*.06))*Math.cos(z*.12)*.7+Math.sin(x*.43+z*.37)*.25)*(id===0?2:1);
 return (h+detail)*edge-7*(1-edge);
}
