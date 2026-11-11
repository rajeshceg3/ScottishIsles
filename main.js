import*as T from'./vendor/three.module.js';import{heightAt,ISLANDS,worldSize}from'./terrain.js';import{meshHeightAt}from'./ground.js';import{CHART_SHAPES}from'./island-chart.js';
const groundAt=(id,x,z)=>meshHeightAt(id,x,z,heightAt,240,worldSize(id));
const canvas=document.querySelector('canvas'),renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new T.Scene();scene.background=new T.Color('#a5b3ae');scene.fog=new T.FogExp2('#a5b3ae',.00009);const camera=new T.PerspectiveCamera(60,innerWidth/innerHeight,.1,45000);camera.position.set(0,12,140);const hemi=new T.HemisphereLight('#d8e5df','#4a5141',2.1);scene.add(hemi);const sun=new T.DirectionalLight('#dae0cf',.9);sun.position.set(-80,110,70);scene.add(sun);
let dirty=true,terrain,props,island=0,angle=0,pitch=-.08,moving=false,down=null,time=0,last=performance.now();
const textureLoader=new T.TextureLoader();
const surfaceMaps=await Promise.all(['grass-Diffuse','rocky-Diffuse','grass-nor_gl','stone-detail'].map(n=>textureLoader.loadAsync('./textures/'+n+'.webp'))).catch(()=>null);
if(surfaceMaps)surfaceMaps.forEach((t,i)=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(i<2||i===3)t.colorSpace=T.SRGBColorSpace;});
const tuftMap=await textureLoader.loadAsync('./textures/moor-tuft.png');tuftMap.colorSpace=T.SRGBColorSpace;
const landMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.96});if(surfaceMaps){landMat.normalMap=surfaceMaps[2];landMat.normalScale.set(.32,.32);}
// World-space mineral grain and damp heather keep detail steady when the view turns.
landMat.onBeforeCompile=shader=>{
 if(surfaceMaps){shader.uniforms.moorTexture={value:surfaceMaps[0]};shader.uniforms.rockTexture={value:surfaceMaps[1]};}
 shader.vertexShader='varying vec3 moorN;varying vec3 moorP;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmoorP=position;moorN=normal;');
 shader.fragmentShader=(surfaceMaps?'uniform sampler2D moorTexture;uniform sampler2D rockTexture;\n':'')+`varying vec3 moorN;varying vec3 moorP;\nfloat grain(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
float field(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(grain(i),grain(i+vec3(1,0,0)),f.x),mix(grain(i+vec3(0,1,0)),grain(i+vec3(1,1,0)),f.x),f.y),mix(mix(grain(i+vec3(0,0,1)),grain(i+vec3(1,0,1)),f.x),mix(grain(i+vec3(0,1,1)),grain(i+vec3(1,1,1)),f.x),f.y),f.z); }\n`+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float grit=grain(floor(moorP*18.0));
 float moorPatch=sin(moorP.x*.38+sin(moorP.z*.2))*sin(moorP.z*.44);
 float seams=pow(.5+.5*sin(moorP.y*2.4+sin(moorP.x*.37)*2.0+sin(moorP.z*.23)*3.0),20.0);
 float patches=field(moorP*.005)*.65+field(moorP*.025)*.25+field(moorP*.14)*.10;
 float rockWeight=smoothstep(.07,.45,1.-abs(normalize(moorN).y));
 vec3 heath=mix(vec3(.36,.30,.25),vec3(.52,.55,.32),smoothstep(.25,.72,patches));
 diffuseColor.rgb=mix(diffuseColor.rgb,heath, .40*(1.-rockWeight));
 float strata=smoothstep(.25,.65,field(moorP*vec3(.8,.15,.8)));
 diffuseColor.rgb*=.66+patches*.65+grit*.07*(1.-smoothstep(20.,70.,length(cameraPosition-moorP)))-strata*.08*rockWeight;
 ${surfaceMaps?`vec3 blend=pow(abs(normalize(moorN)),vec3(4.));blend/=blend.x+blend.y+blend.z;
 vec3 rockSurface=texture2D(rockTexture,moorP.yz/90.).rgb*blend.x+texture2D(rockTexture,moorP.xz/90.).rgb*blend.y+texture2D(rockTexture,moorP.xy/90.).rgb*blend.z;
 rockSurface=mix(rockSurface,vec3(dot(rockSurface,vec3(.2126,.7152,.0722))),.65)*.8;
 vec3 moorSurface=texture2D(moorTexture,moorP.xz/15.).rgb;moorSurface=mix(moorSurface,moorSurface*vec3(.78,.94,.86),.6);
 float range=length(cameraPosition-moorP);
 vec3 broadMoor=texture2D(moorTexture,moorP.xz/240.).rgb;
 broadMoor=mix(broadMoor,vec3(dot(broadMoor,vec3(.2126,.7152,.0722))),.25);
 moorSurface=mix(moorSurface,broadMoor,smoothstep(40.,240.,range)*.6);
 float ledges=smoothstep(.64,.87,field(moorP*vec3(.008,.045,.008)));
 rockSurface*=.76+ledges*.32;
 diffuseColor.rgb=mix(diffuseColor.rgb,mix(moorSurface,rockSurface,rockWeight),.64);
 diffuseColor.rgb*=1.-rockWeight*ledges*.15;
 float wet=1.-smoothstep(.3,5.,moorP.y+field(moorP*.3)*1.4);
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.52,.58,.59),wet*.75);
 float shingle=(1.-smoothstep(3.,11.,moorP.y))*smoothstep(.5,3.,moorP.y);
 diffuseColor.rgb=mix(diffuseColor.rgb,rockSurface*.72,shingle*.7);`:''}
 `);
 if(surfaceMaps)shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>','vec3 unperturbedNormal=normal;\n#include <normal_fragment_maps>\nnormal=normalize(mix(unperturbedNormal,normal,1.-smoothstep(20.,80.,length(cameraPosition-moorP))));');
};
function select(id){dirty=true;island=id;if(surfaceMaps)surfaceMaps[2].repeat.set(worldSize(id)/15,worldSize(id)/15);seaU.coast.value=coastTextures[id];seaU.span.value=worldSize(id);if(terrain){terrain.geometry.dispose();scene.remove(terrain)}if(props){props.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});scene.remove(props)}const geo=new T.PlaneGeometry(worldSize(id),worldSize(id),240,240);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,colors=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,heightAt(id,x,z))}geo.computeVertexNormals();const n=geo.attributes.normal;
for(let i=0;i<p.count;i++){const y=p.getY(i),slope=1-n.getY(i),x=p.getX(i),z=p.getZ(i),peat=new T.Color('#5c6446'),rock=new T.Color('#62655c'),grass=new T.Color('#526544');let c=peat.lerp(grass,.35+.2*Math.sin(x*.05+z*.06));c.lerp(rock,T.MathUtils.smoothstep(slope,.08,.36));if(y<2)c.lerp(new T.Color('#74766c'),.7);if(id===0&&y>400)c.lerp(rock,.7);if(id===1&&y>220)c.lerp(rock,.5);colors.push(c.r,c.g,c.b)}geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain=new T.Mesh(geo,landMat);scene.add(terrain);
 const points=[[18,2],[10,96],[10,19],[85,-85],[120,60]][id].map(v=>v*worldSize(id)/400);camera.position.set(points[0],Math.max(.8,groundAt(id,...points))+1.8,points[1]);
 props=new T.Group();scene.add(props);let seed=937+id;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 // Three interpreted stone archetypes: boulder, slab and cobble, tinted granite to basalt.
 const rockPalette=['#c4c7b9','#91988e','#a6aa9b','#d0cfb6','#b7b19e'].map(hx=>new T.Color(hx));
 const archetypes=[0,1,2].map(a=>{const g=new T.SphereGeometry(1,12,6),rp=g.attributes.position;for(let j=0;j<rp.count;j++){const x=rp.getX(j),y=rp.getY(j),z=rp.getZ(j),k=.85+.17*Math.sin(x*(3.2+a*1.1)+z*(2.4+a*.8))+.09*Math.sin(y*(6.1+a*1.7)-x*1.5)+.05*Math.sin((x-z)*(8+a*3)+y*5);rp.setXYZ(j,x*k,y*(.9+.08*Math.cos(x*(3+a)+z*4))*(a===2?.6:a===1?.8:1),z*k)}g.computeVertexNormals();const cs=[];for(let j=0;j<rp.count;j++){const x=rp.getX(j),y=rp.getY(j),z=rp.getZ(j),lichen=Math.max(0,Math.sin(x*11+z*7)*Math.sin(y*13-x*8));const c=new T.Color('#ffffff').lerp(new T.Color('#b6bc91'),lichen*.32);cs.push(c.r,c.g,c.b)}g.setAttribute('color',new T.Float32BufferAttribute(cs,3));return g});
 const dummy=new T.Object3D(),tint=new T.Color();
 for(let a=0;a<3;a++){const rocks=new T.InstancedMesh(archetypes[a],new T.MeshStandardMaterial({color:'#ffffff',roughness:.96,map:surfaceMaps?.[3]||null,vertexColors:true}),90);
 for(let j=0;j<90;j++){let x,z,h,attempt=0;do{attempt++;x=points[0]+(rnd()-.5)*(j<65?130:worldSize(id)*.85);z=points[1]+(rnd()-.5)*(j<65?130:worldSize(id)*.85);h=groundAt(id,x,z)}while((h<.1||Math.hypot(x-points[0],z-points[1])<3.5)&&attempt<80);const scale=h<.1||Math.hypot(x-points[0],z-points[1])<3.5?0:.25+rnd()*1.05;dummy.position.set(x,h+scale*.15,z);dummy.rotation.set(rnd()*.5,rnd()*6.28,rnd()*.35);dummy.scale.set(scale*(.8+rnd()*.9),scale*(.5+rnd()*.35),scale);dummy.updateMatrix();rocks.setMatrixAt(j,dummy.matrix);tint.copy(rockPalette[(rnd()*rockPalette.length)|0]).offsetHSL(0,(rnd()-.5)*.04,(rnd()-.5)*.06);rocks.setColorAt(j,tint)}rocks.computeBoundingSphere();props.add(rocks)}
 // Crossed alpha-cutout cards give each moor tuft dozens of fine, curved leaves.
 const blade=new T.BufferGeometry(),blades=[],uvs=[];for(let b=0;b<3;b++){const a=b*2.094,c=Math.cos(a),s=Math.sin(a),w=.28,h=.46;const v=(x,y)=>[x*c,y,x*s];blades.push(...v(-w,0),...v(w,0),...v(-w,h),...v(w,0),...v(w,h),...v(-w,h));uvs.push(0,0,1,0,0,1,1,0,1,1,0,1)}blade.setAttribute('position',new T.Float32BufferAttribute(blades,3));blade.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));blade.computeVertexNormals();
 // Moor grass in clumps near the vantage, taller drifts across the far side.
 const grass=new T.InstancedMesh(blade,new T.MeshStandardMaterial({color:'#ffffff',roughness:1,side:T.DoubleSide,map:tuftMap,alphaTest:.45}),6000),moorTones=['#b9bd8e','#c1c396','#c9bf8e','#a8b383','#c5c79c'].map(hx=>new T.Color(hx));
 for(let j=0;j<6000;j++){const far=j>=4400;let x,z,h,tries=0;do{const a=rnd()*6.28,r=far?30+Math.sqrt(rnd())*85:Math.sqrt(rnd())*30;x=points[0]+Math.cos(a)*r;z=points[1]+Math.sin(a)*r;h=groundAt(id,x,z);tries++}while(!far&&tries<5&&Math.sin(x*.31+z*.13)*Math.sin(z*.27-x*.09)+Math.sin((x+z)*.07)<-.9);dummy.position.set(x,h-.03,z);dummy.rotation.set((rnd()-.5)*.24,rnd()*6.28,(rnd()-.5)*.24);const scale=(.55+rnd()*.95)*(far?1.7+rnd()*.9:1);dummy.scale.setScalar(h>.3?scale:0);dummy.updateMatrix();grass.setMatrixAt(j,dummy.matrix);tint.copy(moorTones[(rnd()*moorTones.length)|0]).offsetHSL((rnd()-.5)*.02,(rnd()-.5)*.06,(rnd()-.5)*.07);grass.setColorAt(j,tint)}grass.computeBoundingSphere();props.add(grass);
 // Interpreted low heather/sedge drifts, not a botanical survey.
 const scrub=new T.InstancedMesh(blade.clone(),new T.MeshStandardMaterial({color:'#ffffff',roughness:1,side:T.DoubleSide,map:tuftMap,alphaTest:.45}),500),scrubTones=['#c3b58c','#b0ba87','#b9a0a2','#abb693'].map(hx=>new T.Color(hx));
 for(let j=0;j<500;j++){const a=rnd()*6.28,r=8+Math.sqrt(rnd())*60,x=points[0]+Math.cos(a)*r,z=points[1]+Math.sin(a)*r,h=groundAt(id,x,z);dummy.position.set(x,h-.02,z);dummy.rotation.set(0,rnd()*6.28,0);dummy.scale.set(1.6+rnd(),h>.8?.75+rnd()*.6:0,1.6+rnd());dummy.updateMatrix();scrub.setMatrixAt(j,dummy.matrix);scrub.setColorAt(j,scrubTones[(rnd()*scrubTones.length)|0])}scrub.computeBoundingSphere();props.add(scrub);
 // An interpreted field boundary gives the farmed island a human scale.
 // It is not a reconstruction of a named wall or surveyed field.
 if(id===2){
  const stoneGeo=new T.IcosahedronGeometry(1,0),wall=new T.InstancedMesh(stoneGeo,new T.MeshStandardMaterial({color:'#787d6c',roughness:.98}),360);let count=0;
  for(let j=0;j<120;j++)for(let course=0;course<3;course++){
   const z=points[1]-38+j*.65+course*.18,x=points[0]-14+Math.sin(j*.035)*2,h=groundAt(id,x,z);
   if(h<1)continue;dummy.position.set(x,h+.12+course*.22,z);dummy.rotation.set(.06*Math.sin(j),j*1.3,0);dummy.scale.set(.31+Math.sin(j*4)*.035,.17,.4);dummy.updateMatrix();wall.setMatrixAt(count++,dummy.matrix);
  }wall.count=count;wall.computeBoundingSphere();props.add(wall);
 }
 const target=[[73,45],[-36,64.5],[-45,23],[86,-18],[-145,-180]][id].map(v=>v*worldSize(id)/400);const dx=target[0]-points[0],dz=target[1]-points[1];angle=Math.atan2(dx,-dz);pitch=Math.atan2(groundAt(id,...target)-camera.position.y,Math.hypot(dx,dz))*(id===1?.4:.7);document.getElementById('name').textContent=ISLANDS[id];document.querySelectorAll('nav button').forEach((b,i)=>b.setAttribute('aria-current',String(i===id)));}
ISLANDS.forEach((name,id)=>{const b=document.createElement('button');b.setAttribute('aria-label',name);b.innerHTML=`<svg viewBox="0 0 164 106" aria-hidden="true"><path class="coast" d="${CHART_SHAPES[id]}"/><path class="contour" d="${CHART_SHAPES[id]}" transform="translate(82 53) scale(.68) translate(-82 -53)"/></svg><span>${name}</span>`;b.onclick=()=>select(id);document.querySelector('nav').append(b)});
// A height field binds pale breaking water to each interpreted coastline.
const coastTextures=ISLANDS.map((_,id)=>{const size=256,data=new Uint8Array(size*size*4);for(let z=0;z<size;z++)for(let x=0;x<size;x++){const h=heightAt(id,(x/(size-1)-.5)*worldSize(id),(z/(size-1)-.5)*worldSize(id)),v=Math.round((h+1000)*4),i=(z*size+x)*4;data[i]=v>>8;data[i+1]=v&255;data[i+2]=0;data[i+3]=255;}const t=new T.DataTexture(data,size,size);t.minFilter=t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;});
const seaU={time:{value:0},coast:{value:coastTextures[0]},span:{value:worldSize(0)}};
const sea=new T.Mesh(new T.PlaneGeometry(60000,60000),new T.ShaderMaterial({uniforms:seaU,
vertexShader:'varying vec3 w;void main(){w=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:`varying vec3 w;uniform float time;uniform sampler2D coast;uniform float span;
void main(){vec2 p=vec2(w.x,-w.y);float a=sin(p.x*.43+p.y*.19+sin(p.y*.17)*1.8+time*.8);float b=sin(p.x*.16+p.y*.37+sin(p.x*.13)*.7+time*.58);float lines=(pow(.5+.5*a,12.)*.35+pow(.5+.5*b,9.)*.15)*(1.-smoothstep(300.,5000.,length(cameraPosition.xz-p)));vec3 c=mix(vec3(.16,.25,.26),vec3(.31,.42,.41),.5+lines);
vec2 uv=p/span+.5;vec2 encoded=texture2D(coast,uv).rg;float h=(encoded.r*65280.+encoded.g*255.)/4.-1000.;float edge=(1.-smoothstep(-1.2,.5,h))*smoothstep(-7.,-3.,h);float ripple=.5+.5*sin(h*3.4-time*1.4+sin(p.x*.15+p.y*.2)*1.3);float foam=edge*(.20+.45*pow(ripple,4.));c=mix(c,vec3(.23,.34,.32),smoothstep(-15.,-2.,h)*.4);if(uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.)c=mix(c,vec3(.68,.75,.69),foam);gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
}` }));sea.rotation.x=-Math.PI/2;sea.position.y=-.12;scene.add(sea);
// Short slanted rain streaks, held exactly still until weather is enabled.
const rainP=[];for(let i=0;i<720;i++){const x=Math.random()*300-150,y=Math.random()*80+4,z=Math.random()*280-50;rainP.push(x,y,z,x-.18,y+.8,z+.06)}
const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.Float32BufferAttribute(rainP,3));const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:'#dce0d8',transparent:true,opacity:.22,depthWrite:false}));scene.add(rain);
// A broad ceiling of broken grey cloud, rather than a flat background color.
const skyU={time:{value:0}};
const sky=new T.Mesh(new T.SphereGeometry(20000,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:skyU,
vertexShader:'varying vec3 skyD;void main(){skyD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:`varying vec3 skyD;uniform float time;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){vec3 d=normalize(skyD);float h=max(0.,d.y);vec2 p=d.xz/(h+.22)*2.0+vec2(time*.006,0);float n=noise(p)*.55+noise(p*2.1)*.28+noise(p*4.3)*.12;vec3 c=mix(vec3(.66,.71,.68),vec3(.39,.46,.46),pow(h,.55));c-=smoothstep(.3,.7,n)*(.10+min(h,.4)*.14);gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
}` }));scene.add(sky);
canvas.onpointerdown=e=>{down=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(!down)return;dirty=true;angle-=(e.clientX-down[0])*.004;pitch=T.MathUtils.clamp(pitch+(e.clientY-down[1])*.003,-.4,.3);down=[e.clientX,e.clientY]};canvas.onpointerup=canvas.onpointercancel=()=>down=null;canvas.onkeydown=e=>{if(e.key==='ArrowLeft')angle+=.15;else if(e.key==='ArrowRight')angle-=.15;else if(e.key==='ArrowUp')pitch=T.MathUtils.clamp(pitch+.07,-.4,.3);else if(e.key==='ArrowDown')pitch=T.MathUtils.clamp(pitch-.07,-.4,.3);else return;dirty=true;e.preventDefault()};document.getElementById('weather').onclick=()=>{moving=!moving;dirty=true;const b=document.getElementById('weather');b.setAttribute('aria-pressed',String(moving));b.textContent=moving?'Hold the weather':'Let the weather move'};
function resize(){dirty=true;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();select(0);
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.1);last=now;if(document.hidden)return;if(!moving&&!dirty)return;dirty=false;if(moving){time+=dt;const p=rainGeo.attributes.position;for(let i=0;i<p.count;i+=2){const y=p.getY(i)-dt*18,reset=y<0?80:y;p.setY(i,reset);p.setY(i+1,reset+.8);}p.needsUpdate=true;}rain.position.set(camera.position.x,Math.max(0,camera.position.y-30),camera.position.z);seaU.time.value=time;skyU.time.value=time;sky.position.copy(camera.position);camera.rotation.order='YXZ';camera.rotation.set(pitch,angle,0);camera.lookAt(camera.position.x+Math.sin(angle)*120,camera.position.y+Math.sin(pitch)*120,camera.position.z-Math.cos(angle)*120);renderer.render(scene,camera)}requestAnimationFrame(frame);
// Read-only diagnostics used by the browser qualification suite.
export function inspectWorld(){return{island,camera:{x:camera.position.x,y:camera.position.y,z:camera.position.z},ground:groundAt(island,camera.position.x,camera.position.z),moving,angle,pitch,frame:renderer.info.render.frame,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls};}
