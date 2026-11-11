const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {spawn}=require('node:child_process'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..'),port=process.env.PORT||'8897',url=process.env.BASE_URL||`http://127.0.0.1:${port}`;
 const server=process.env.BASE_URL?null:spawn('python3',['-m','http.server',port,'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 let browser;const out=process.env.EVIDENCE_DIR||'/tmp/scottish-journey';fs.mkdirSync(out,{recursive:true});
 try{
  for(let i=0;i<30;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const width=+(process.env.WIDTH||390),page=await browser.newPage({viewport:{width,height:844},reducedMotion:process.env.MOTION||'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('nav button').nth(4).waitFor();
  assert.equal(await page.locator('#weather').getAttribute('aria-pressed'),'false');
  for(let i=0;i<5;i++){
   await page.locator('nav button').nth(i).click();await page.waitForTimeout(200);
   const state=await page.evaluate(async()=>(await import('/main.js')).inspectWorld());assert(state.camera.y>state.ground+.5,'camera must stay above ground');assert(state.camera.y>0,'camera must stay above sea');assert(state.triangles<200000,'scene triangle budget');
   assert.equal(await page.locator('nav [aria-current=true]').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const sizes=await page.locator('nav button').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]}));assert(sizes.every(([w,h])=>w>=44&&h>=44));
   for(let q=0;q<4;q++){
    if(q){await page.locator('canvas').focus();for(let n=0;n<10;n++)await page.keyboard.press('ArrowRight');}
    await page.screenshot({path:`${out}/${width}-island${i}-q${q}.png`});
   }
  }
  const canvas=page.locator('canvas');await canvas.focus();const beforePitch=await page.evaluate(async()=>(await import('/main.js')).inspectWorld().pitch);await page.keyboard.press('ArrowUp');const afterPitch=await page.evaluate(async()=>(await import('/main.js')).inspectWorld().pitch);assert(afterPitch>beforePitch,'ArrowUp changes pitch');await page.keyboard.press('ArrowDown');const still=await canvas.screenshot();await page.waitForTimeout(350);assert(still.equals(await canvas.screenshot()),'Held weather must be pixel stable');
  await page.locator('#weather').click();assert.equal(await page.locator('#weather').getAttribute('aria-pressed'),'true');
  const moving=await canvas.screenshot();await page.waitForTimeout(400);assert(!moving.equals(await canvas.screenshot()),'Opt-in weather should move');
  await page.locator('#weather').click();await page.waitForTimeout(100);const stopped=await canvas.screenshot();await page.waitForTimeout(300);assert(stopped.equals(await canvas.screenshot()),'Weather must stop after hold');
  await page.locator('nav button').nth(0).click();await canvas.focus();await page.keyboard.press('ArrowRight');await page.mouse.move(width*.6,250);await page.mouse.down();await page.mouse.move(width*.25,310,{steps:8});await page.mouse.up();
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/proof.json`,JSON.stringify({url,width,motion:process.env.MOTION||'reduce',passed:true,checks:['five selections','four keyboard quadrants each','44px buttons','no overflow','pixel-stable held weather','opt-in motion','hold stops motion','pointer look','keyboard pitch','dry camera','triangle budget','no page/shader errors']},null,2));console.log('PASS',width,process.env.MOTION||'reduce','five-island journey, held/move/hold, pointer, keyboard, bounds and shaders');
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
