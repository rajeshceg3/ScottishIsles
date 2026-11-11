// Artistic reading of the Sgurr's ridge, not surveyed supplemental elevation.
// Shape informed by NatureScot's NSA qualities and the Scottish Geology Trust.
// The source composite smooths this narrow feature away. Local coordinates are metres.
export function eiggRidge(x,z){
 const ax=-995,az=1774,bx=-1800,bz=1280,dx=bx-ax,dz=bz-az;
 const raw=((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),t=Math.max(0,Math.min(1,raw));
 const distance=Math.hypot(x-ax-t*dx,z-az-t*dz);
 const width=raw<0?85:110;
 if(distance>width||raw>1.05)return -Infinity;
 const crown=707.4-t*76-5*Math.sin(t*28)**2;
 const shoulder=1-Math.pow(distance/width,6);
 return crown-150*(1-shoulder);
}
