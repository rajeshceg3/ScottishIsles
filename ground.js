// Height on the rendered PlaneGeometry triangles, not the analytic surface between vertices.
export function meshHeightAt(id,x,z,heightAt,segments=180,size=400){
 const step=size/segments,u=(x+size/2)/step,v=(z+size/2)/step;
 const ix=Math.max(0,Math.min(segments-1,Math.floor(u))),iz=Math.max(0,Math.min(segments-1,Math.floor(v))),tx=u-ix,tz=v-iz;
 const x0=-size/2+ix*step,z0=-size/2+iz*step;
 const a=heightAt(id,x0,z0),b=heightAt(id,x0,z0+step),c=heightAt(id,x0+step,z0+step),d=heightAt(id,x0+step,z0);
 return tx+tz<=1?a+(d-a)*tx+(b-a)*tz:c+(b-c)*(1-tx)+(d-c)*(1-tz);
}
