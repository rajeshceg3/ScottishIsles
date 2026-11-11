import test from'node:test';import assert from'node:assert/strict';
import{heightAt,measuredHeightAt}from'../terrain.js';import{eiggRidge}from'../landmarks.js';
test('artistic ridge is localized; source heights stay separately available',()=>{
 assert.equal(eiggRidge(0,0),-Infinity);assert.equal(eiggRidge(4000,4000),-Infinity);
 assert.equal(heightAt(1,0,0),measuredHeightAt(1,0,0));
 assert(Math.abs(heightAt(1,-995,1774)-707.4)<.01);
 assert(heightAt(1,-995,1774)>measuredHeightAt(1,-995,1774));
 for(const id of [0,2,3,4])for(const [x,z]of [[0,0],[-995,1774],[500,-500]])assert.equal(heightAt(id,x,z),measuredHeightAt(id,x,z));
});
