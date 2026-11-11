import test from'node:test';import assert from'node:assert/strict';import*as T from'../vendor/three.module.js';import{heightAt}from'../terrain.js';import{meshHeightAt}from'../ground.js';
test('props use the actual rendered terrain triangle surface',()=>{
 for(let id=0;id<5;id++){
  const g=new T.PlaneGeometry(400,400,180,180);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,heightAt(id,p.getX(i),p.getZ(i)));g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));m.updateMatrixWorld();
  const ray=new T.Raycaster();for(let n=0;n<24;n++){const x=Math.sin(n*1.31+id)*112,z=Math.cos(n*2.17+id)*60;ray.set(new T.Vector3(x,150,z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(m)[0];assert(hit);assert(Math.abs(hit.point.y-meshHeightAt(id,x,z,heightAt))<.0001,`island${id} sample${n}`)}g.dispose();m.material.dispose();
 }
});
