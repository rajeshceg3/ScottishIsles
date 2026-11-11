import{FIELDS}from'./dem-data.js';import{eiggRidge}from'./landmarks.js';
export const ISLANDS=FIELDS.map(f=>f.name);
const samples=FIELDS.map(f=>{const raw=atob(f.base64),values=new Float32Array(f.grid*f.grid);for(let i=0;i<values.length;i++)values[i]=(raw.charCodeAt(i*2)+raw.charCodeAt(i*2+1)*256-32768)/4;return values;});
export const VERTICAL_SCALE=1.8;
export const worldSize=id=>FIELDS[id].spanMetres;
export function measuredHeightAt(id,x,z){
 const f=FIELDS[id],n=f.grid,px=(x/f.spanMetres+.5)*(n-1),pz=(z/f.spanMetres+.5)*(n-1);
 if(px<0||pz<0||px>n-1||pz>n-1)return -300;
 const ix=Math.min(n-2,Math.floor(px)),iz=Math.min(n-2,Math.floor(pz)),tx=px-ix,tz=pz-iz,a=samples[id],h=(a[iz*n+ix]*(1-tx)+a[iz*n+ix+1]*tx)*(1-tz)+(a[(iz+1)*n+ix]*(1-tx)+a[(iz+1)*n+ix+1]*tx)*tz;
 return Math.max(-300,h*VERTICAL_SCALE);
}

export function heightAt(id,x,z){return Math.max(measuredHeightAt(id,x,z),id===1?eiggRidge(x,z):-Infinity);}
