const fs=require('node:fs');
const path=require('node:path');
const {createServer,root}=require('./server.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const screens=JSON.parse(fs.readFileSync(path.join(root,'assets/screens.json')));
const results=[];
async function main(){
 const server=createServer();await new Promise(r=>server.listen(4173,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 fs.mkdirSync(path.join(root,'assets/previews'),{recursive:true});fs.mkdirSync(path.join(root,'docs/evidence'),{recursive:true});
 try{
 let next=0;
 await Promise.all(Array.from({length:3},async()=>{
  const page=await browser.newPage({deviceScaleFactor:1});
  while(next<screens.length){
   const s=screens[next++],errors=[];
   const error=e=>errors.push(e.message),consoleError=m=>{if(m.type()==='error')errors.push(m.text());};
   page.on('pageerror',error);page.on('console',consoleError);
   await page.setViewportSize({width:s.w,height:s.h});
   await page.goto('http://127.0.0.1:4173/app/'+s.f,{waitUntil:'load'});
   await page.waitForFunction(()=>document.querySelector('[data-dc-tpl]'));
   await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:path.join(root,s.preview),fullPage:true});
   const state=await page.evaluate(()=>({text:document.body.innerText.length,bodyWidth:document.body.scrollWidth,width:innerWidth,screen:!!document.querySelector('.screen'),pageWidth:document.querySelector('.page')?.clientWidth,pageScroll:document.querySelector('.page')?.scrollWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}));
   results.push({id:s.id,...state,errors});
   page.off('pageerror',error);page.off('console',consoleError);
   console.log('Captured',s.id);
  }
  await page.close();
 }));
 const failed=results.filter(r=>r.errors.length||r.brokenImages||(r.text<2&&!r.id.startsWith('Line-')));
 fs.writeFileSync(path.join(root,'docs/evidence/captures.json'),JSON.stringify({generatedAt:new Date().toISOString(),total:results.length,failed:failed.length,results},null,2));
 console.log(JSON.stringify({total:results.length,failed},null,2));
 if(failed.length)process.exitCode=1;
 }finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
