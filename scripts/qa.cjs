const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {createServer,root}=require('./server.cjs');const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'assets/screens.json'))),results=[],issues=[],scenarios=[];
const dir=path.join(root,'docs/evidence');fs.mkdirSync(dir,{recursive:true});
async function main(){
 const server=createServer();await new Promise(r=>server.listen(4173,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>issues.push({type:'runtime',message:e.message}));
  const goto=async(file)=>{await page.goto('http://127.0.0.1:4173/'+(file?'app/'+file:''));await page.waitForSelector(file?'.screen':'.artboard');};
  await goto();assert.equal(await page.locator('.artboard').count(),inventory.length);await page.screenshot({path:path.join(dir,'canvas-desktop.png')});
  const before=await page.locator('#world').getAttribute('style');await page.locator('#zoom-in').click();assert.notEqual(await page.locator('#world').getAttribute('style'),before);
  await page.mouse.move(1200,150);await page.mouse.down();await page.mouse.move(1000,190);await page.mouse.up();
  await page.locator('#search').fill('zz-no-screen');assert.equal(await page.locator('.artboard').count(),0);await page.locator('#clear-search').click();assert.equal(await page.locator('.artboard').count(),69);
  await page.locator('[data-version=current]').click();assert.equal(await page.locator('.artboard').count(),46);await page.locator('[data-version=all]').click();
  await page.locator('#play').click();await page.frameLocator('#prototype').locator('.mh-greeting').waitFor();await page.locator('#close-preview').click();assert.equal(await page.locator('#preview').evaluate(d=>d.open),false);
  scenarios.push({id:'S1',task:'Canvas, search, empty recovery, version filters, zoom, pan and prototype dialog',result:'PASS'});
  await page.setViewportSize({width:390,height:844});await goto('GV04-NhapHoSo.dc.html');
  await page.locator('#n').fill('');await page.getByRole('link',{name:'Tiếp tục',exact:true}).click();assert.equal(await page.locator('#n').getAttribute('aria-invalid'),'true');
  await page.locator('#n').fill('Nguyễn Minh Khánh An');await page.getByRole('link',{name:'Tiếp tục',exact:true}).click();await page.waitForURL('**/GV04b-PhuHuynh.dc.html');await page.goBack();assert.equal(await page.locator('#n').inputValue(),'Nguyễn Minh Khánh An');
  await page.locator('#n').fill('Nguyễn Văn A');scenarios.push({id:'S2',task:'Admissions validation, correction, next step and back preserving input',result:'PASS'});
  await goto('XL02-ChonLop.dc.html');await page.getByRole('radio').nth(1).click();assert.equal(await page.getByRole('radio').nth(1).getAttribute('aria-checked'),'true');await page.getByRole('link',{name:'Tiếp tục xác nhận',exact:true}).click();await page.waitForURL('**/XL03-XacNhanXepLop.dc.html');
  assert((await page.locator('.page').innerText()).includes('Thầy Minh Đức'),'Selected class must carry into confirmation');
  const sw=page.getByRole('switch').first();await sw.click();assert.equal(await sw.getAttribute('aria-checked'),'false');
  await page.goBack();await page.waitForSelector('[role=radio]');assert.equal(await page.getByRole('radio').nth(1).getAttribute('aria-checked'),'true');
  await page.getByRole('link',{name:'Tiếp tục xác nhận',exact:true}).click();await page.getByRole('link',{name:'Xếp vào lớp',exact:true}).click();await page.waitForURL('**/XL04-DaXepLop.dc.html');assert((await page.locator('.page').innerText()).includes('Thầy Minh Đức'));assert((await page.locator('.page').innerText()).includes('Tối T5'));
  scenarios.push({id:'S3',task:'Choose an alternative class; confirmation keeps teacher and room; notification switch toggles once',result:'PASS'});
  await goto('GV02-HocSinh.dc.html');await page.locator('input').first().fill('zzz-khong-ton-tai');await page.locator('.mh-no-results').waitFor();await page.getByRole('button',{name:'Xóa tìm kiếm',exact:true}).click();assert.equal(await page.locator('input').first().inputValue(),'');
  await goto('GV03-HoSo.dc.html');await page.locator('[data-unavailable]').first().click();await page.locator('dialog[open]').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
  scenarios.push({id:'S4',task:'No student search results can recover; missing source screen gives closable explanation',result:'PASS'});
  await page.setViewportSize({width:390,height:844});await goto();await page.locator('#menu').click();await page.locator('#search').fill('Xác nhận xếp lớp');assert.equal(await page.locator('.artboard').count(),1);await page.locator('#clear-search').isVisible();await page.locator('#menu').click();await page.locator('.artboard').click();await page.frameLocator('#prototype').locator('.screen').waitFor();await page.locator('#close-preview').click();await page.screenshot({path:path.join(dir,'canvas-mobile.png')});
  scenarios.push({id:'S5',task:'Mobile menu, search by Vietnamese title, open artboard and return to canvas',result:'PASS'});
  // All affected current screens receive elementary responsive sanity coverage.
  for(const width of [320,390,768]){
   await page.setViewportSize({width,height:844});
   for(const s of inventory.filter(s=>s.version==='current')){
    await goto(s.f);
    const metrics=await page.evaluate(()=>{const screen=document.querySelector('.screen'),main=screen.querySelector('.page');return{documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,screenWidth:screen.getBoundingClientRect().width,pageWidth:main?.clientWidth,pageScroll:main?.scrollWidth,navLabels:[...screen.querySelectorAll('.nav .tab')].map(a=>a.textContent.trim()),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length};});
    const pass=metrics.documentWidth<=width+1&&(!metrics.pageWidth||metrics.pageScroll<=metrics.pageWidth+2)&&!metrics.broken;
    results.push({route:s.f,width,result:pass?'PASS':'FAIL',metrics});
    if(!pass)issues.push({type:'layout',route:s.f,width,metrics});
    if(['GV01-TongQuan','GV02-HocSinh','GV04-NhapHoSo','GV07-DuyetBaoCao','GV08b-ChiTietHocPhi','XL02-ChonLop'].includes(s.id)&&[320,390].includes(width))await page.screenshot({path:path.join(dir,s.id+'-'+width+'.png')});
   }
  }
  await page.setViewportSize({width:390,height:844});await goto('GV04-NhapHoSo.dc.html');await page.locator('#n').focus();assert.equal(await page.locator('#n').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.screenshot({path:path.join(dir,'keyboard-focus.png')});
  fs.writeFileSync(path.join(dir,'qa.json'),JSON.stringify({generatedAt:new Date().toISOString(),browser:'Chromium',matrix:results.length,scenarios,issues,results},null,2));
  console.log(JSON.stringify({matrix:results.length,scenarios,issues},null,2));if(issues.length)process.exitCode=1;
  if(!issues.length && fs.existsSync(path.join(dir,'qa-failure.txt')))fs.unlinkSync(path.join(dir,'qa-failure.txt'));
 }catch(e){fs.writeFileSync(path.join(dir,'qa-failure.txt'),e.stack);throw e;}finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
