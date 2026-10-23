const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const crypto=require('node:crypto');
const {createServer,root}=require('./server.cjs');const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
async function main(){
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});const checks=[],errors=[];const dir=path.join(root,'docs/evidence');
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(origin);await page.waitForSelector('.artboard');
  assert.equal(await page.locator('.artboard').count(),69);assert.equal(await page.locator('.artboard iframe').count(),69);assert.equal(await page.locator('.artboard img').count(),0);
  const inventory=JSON.parse(fs.readFileSync(path.join(root,'assets/screens.json')));
  const pairs=inventory.filter(s=>s.version==='legacy'&&inventory.some(c=>c.id===s.id.slice(3)));
  assert.equal(pairs.length,17);
  for(const old of pairs){const pair=await page.evaluate(id=>{const a=document.querySelector('.artboard[data-screen="'+id+'"]'),b=document.querySelector('.artboard[data-screen="'+id.slice(3)+'"]');return{oldX:parseFloat(a.style.left),newX:parseFloat(b.style.left),oldY:a.style.top,newY:b.style.top,color:getComputedStyle(a.querySelector('.live-slot')).outlineColor};},old.id);assert.equal(pair.newX-pair.oldX,422);assert.equal(pair.oldY,pair.newY);assert.equal(pair.color,'rgb(215, 53, 53)');}
  assert.equal(await page.locator('.missing-current').count(),2);checks.push({check:'69 live frames, no screenshot tiles; 17 exact adjacent pairs; 19 red V1 frames; two explicit unmatched V1 states',result:'PASS'});
  const home=page.frameLocator('.artboard[data-screen="GV01-TongQuan"] iframe');await home.locator('.mh-greeting').waitFor();
  const tokens=await home.locator('.screen').evaluate(screen=>{const task=screen.querySelector('.mh-task'),nav=screen.querySelector('.nav');return{font:getComputedStyle(screen).fontFamily,surface:getComputedStyle(screen).backgroundColor,taskRadius:getComputedStyle(task).borderRadius,taskBorder:getComputedStyle(task).borderWidth,taskPadding:getComputedStyle(task).padding,navBottom:getComputedStyle(nav).bottom,navColor:getComputedStyle(nav).backgroundColor,navRadius:getComputedStyle(nav).borderRadius};});
  assert(tokens.font.includes('Google Sans Flex'));assert.equal(tokens.surface,'rgb(244, 245, 249)');assert.equal(tokens.taskRadius,'24px');assert.equal(tokens.taskBorder,'0px');assert.equal(tokens.taskPadding,'16px');assert.equal(tokens.navBottom,'24px');assert.equal(tokens.navColor,'rgb(37, 58, 126)');
  await home.getByRole('link',{name:'Học sinh',exact:true}).click();await home.locator('input').first().waitFor();assert((await page.locator('.artboard[data-screen="GV01-TongQuan"] .board-route').innerText()).includes('GV02'));
  await page.getByRole('button',{name:'Đặt lại GV01-TongQuan',exact:true}).click();await home.locator('.mh-greeting').waitFor();checks.push({check:'Real navigation works inside a canvas frame and resets independently',result:'PASS'});
  await page.locator('#pan-mode').click();assert.equal(await page.locator('.artboard iframe').first().evaluate(e=>getComputedStyle(e).pointerEvents),'none');
  const previous=await page.locator('#world').getAttribute('style');const box=await page.locator('.artboard[data-screen="GV01-TongQuan"] .live-slot').boundingBox();await page.mouse.move(box.x+60,box.y+60);await page.mouse.down();await page.mouse.move(box.x+120,box.y+90);await page.mouse.up();assert.notEqual(await page.locator('#world').getAttribute('style'),previous);await page.locator('#interact-mode').click();checks.push({check:'Hand mode pans across prototypes; interaction mode restores pointer input',result:'PASS'});
  await page.locator('#search').fill('GV04-NhapHoSo');await page.locator('#screen-list [data-pair="GV04-NhapHoSo"]').click();
  const form=page.frameLocator('.artboard[data-screen="GV04-NhapHoSo"] iframe');await form.locator('#n').waitFor();await form.locator('#n').fill('Nguyễn An Kiểm Tra');await form.locator('#n').evaluate(e=>{window.__canvasProbe=17;});
  const formTokens=await form.locator('#n').evaluate(e=>({radius:getComputedStyle(e).borderRadius,height:getComputedStyle(e).height,border:getComputedStyle(e).borderWidth}));assert.equal(formTokens.radius,'16px');assert.equal(formTokens.height,'56px');assert.equal(formTokens.border,'0px');
  await page.locator('[data-version="current"]').click();await page.locator('[data-version="all"]').click();await page.locator('#search').fill('zz-no-match');assert.equal(await page.locator('.artboard:not([hidden])').count(),0);await page.locator('#clear-search').click();await page.locator('#search').fill('GV04-NhapHoSo');await page.locator('#screen-list [data-pair="GV04-NhapHoSo"]').click();
  assert.equal(await form.locator('#n').inputValue(),'Nguyễn An Kiểm Tra');assert.equal(await form.locator('#n').evaluate(()=>window.__canvasProbe),17);await form.locator('#n').fill('Nguyễn Văn A');checks.push({check:'Editing works in canvas; filter/search preserve iframe document and field state',result:'PASS'});
  await page.screenshot({path:path.join(dir,'live-pair-admissions-desktop.png')});
  await page.locator('#search').fill('');await page.locator('#reset').click();await home.locator('.mh-greeting').waitFor();await page.screenshot({path:path.join(dir,'live-comparison-canvas-desktop.png')});
  // Activate every artboard in turn through the actual canvas viewport.
  const frames=[];
  for(const s of inventory){
   const peer=s.version==='legacy'&&pairs.some(p=>p.id===s.id)?s.id.slice(3):s.id;
   await page.locator('#screen-list [data-pair="'+peer+'"]').click();
   const frame=page.frameLocator('.artboard[data-screen="'+s.id+'"] iframe');await frame.locator('[data-dc-tpl]').first().waitFor({state:'attached'});
   frames.push({id:s.id,route:await frame.locator('body').evaluate(()=>decodeURIComponent(location.pathname.split('/').pop())),live:true});
  }
  assert.equal(frames.length,69);checks.push({check:'All 69 documents mounted as real canvas prototypes',result:'PASS'});
  await page.locator('#search').fill('DS-DesignSystem');await page.locator('#screen-list [data-pair="DS-DesignSystem"]').click();await page.getByRole('button',{name:'Mở lớn DS-DesignSystem',exact:true}).click();await page.frameLocator('#prototype').getByRole('heading',{name:'Design System',exact:true}).waitFor();await page.screenshot({path:path.join(dir,'supplied-design-system-preview.png')});await page.locator('#close-preview').click();
  await page.setViewportSize({width:390,height:844});await page.locator('#menu').click();await page.locator('#search').fill('GV04-NhapHoSo');await page.locator('#screen-list [data-pair="GV04-NhapHoSo"]').click();await form.locator('#n').waitFor();await page.waitForFunction(()=>document.getElementById('sidebar').getBoundingClientRect().right<=1);await page.screenshot({path:path.join(dir,'live-pair-mobile.png')});checks.push({check:'Mobile comparison and full-width design-system preview render',result:'PASS'});
  const supplied=JSON.parse(fs.readFileSync(path.join(root,'docs/uiux/supplied-design-system.json')));for(const file of supplied.files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file.target))).digest('hex'),file.sha256);
  checks.push({check:'Canonical token/config/component CSS match user archive byte for byte',result:'PASS'});
  assert.equal(errors.length,0,JSON.stringify(errors));fs.writeFileSync(path.join(dir,'live-canvas-qa.json'),JSON.stringify({generatedAt:new Date().toISOString(),checks,pairs:17,frames,computedDesignSystem:{home:tokens,form:formTokens},errors},null,2));console.log(JSON.stringify({checks,frames:frames.length,errors},null,2));
 }catch(e){console.error(e);throw e;}finally{await browser.close();server.close();}
}
main().catch(()=>{process.exitCode=1;});
