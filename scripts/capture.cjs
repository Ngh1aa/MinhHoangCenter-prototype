const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {createServer,root}=require('./server.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const screens=JSON.parse(fs.readFileSync(path.join(root,'assets/screens.json')));
const results=[];
const staticDir=path.join(root,'assets/static-screens');
const adaptCss=css=>css.replace(/:root\b/g,':host').replace(/\bhtml\b/g,':host').replace(/\bbody\b/g,'.static-root').replace(/100dvh/g,'844px');
async function main(){
 const server=createServer();await new Promise(r=>server.listen(4173,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 fs.mkdirSync(path.join(root,'docs/evidence/artboards'),{recursive:true});
 fs.mkdirSync(staticDir,{recursive:true});
 fs.writeFileSync(path.join(staticDir,'common.css'),adaptCss(fs.readFileSync(path.join(root,'app/tailwind.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'app/refinement.css'),'utf8'))+'\n:host{display:block;isolation:isolate}.static-root{width:100%;height:100%;overflow:hidden;pointer-events:none;user-select:none}*{animation:none!important;transition:none!important;caret-color:transparent!important}');
 try{
 let next=0;
 await Promise.all(Array.from({length:3},async()=>{
  const page=await browser.newPage({deviceScaleFactor:1});
  while(next<screens.length){
   const s=screens[next++],errors=[];
   const error=e=>errors.push(e.message),consoleError=m=>{if(m.type()==='error')errors.push(m.text());};
   page.on('pageerror',error);page.on('console',consoleError);
   await page.setViewportSize({width:s.w,height:s.version==='reference'?s.h:844});
   await page.goto('http://127.0.0.1:4173/app/'+s.f,{waitUntil:'load'});
   await page.waitForFunction(()=>document.querySelector('[data-dc-tpl]'));
   await page.evaluate(()=>document.fonts.ready);
   if(s.version==='current')await page.addStyleTag({content:'.mh-current .screen{height:auto;min-height:844px}.mh-current .page{flex:none;overflow:visible}'});
   const staticHeight=await page.evaluate(()=>Math.ceil(document.querySelector('.screen')?.getBoundingClientRect().height||document.body.scrollHeight));
   const snapshot=await page.evaluate(()=>{
    const copy=document.body.cloneNode(true);
    for(const el of copy.querySelectorAll('script,template,style,link,helmet'))el.remove();
    for(const el of copy.querySelectorAll('*')){
     for(const attribute of [...el.attributes])if(/^on/i.test(attribute.name)||['href','target','formaction','action','contenteditable'].includes(attribute.name))el.removeAttribute(attribute.name);
     if(el instanceof HTMLInputElement){el.setAttribute('value',el.value);if(el.checked)el.setAttribute('checked','');}
     if(el instanceof HTMLTextAreaElement)el.textContent=el.value;
     if(el instanceof HTMLSelectElement)for(const option of el.options)option.toggleAttribute('selected',option.selected);
     for(const name of ['src','poster'])if(el.hasAttribute(name)&&!el.getAttribute(name).startsWith('data:'))el.setAttribute(name,new URL(el.getAttribute(name),location.href).href.replace(location.origin+'/',''));
    }
    const styles=[...document.querySelectorAll('style')].map(el=>el.textContent).join('\n');
    return{html:copy.innerHTML,bodyClass:document.body.className,styles,text:document.body.innerText.length};
   });
   fs.writeFileSync(path.join(staticDir,s.id+'.json'),JSON.stringify({id:s.id,width:s.w,height:s.version==='current'?staticHeight:s.h,...snapshot,styles:adaptCss(snapshot.styles)}));
   await page.screenshot({path:path.join(root,'docs/evidence/artboards',s.id+'.png'),fullPage:true});
   const state=await page.evaluate(()=>({text:document.body.innerText.length,bodyWidth:document.body.scrollWidth,width:innerWidth,screen:!!document.querySelector('.screen'),pageWidth:document.querySelector('.page')?.clientWidth,pageScroll:document.querySelector('.page')?.scrollWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}));
   results.push({id:s.id,staticHeight:s.version==='current'?staticHeight:s.h,...state,errors});
   page.off('pageerror',error);page.off('console',consoleError);
   console.log('Captured',s.id);
  }
  await page.close();
 }));
 const failed=results.filter(r=>r.errors.length||r.brokenImages||(r.text<2&&!r.id.startsWith('Line-')));
 fs.writeFileSync(path.join(root,'docs/evidence/captures.json'),JSON.stringify({generatedAt:new Date().toISOString(),total:results.length,failed:failed.length,results},null,2));
 const sources=['assets/screens.json',...screens.map(s=>'app/'+s.f),'app/tailwind.css','app/refinement.css','app/interactions.js','app/support.js','scripts/capture.cjs'];
 const digest=crypto.createHash('sha256');for(const file of sources)digest.update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r/g,''));
 fs.writeFileSync(path.join(staticDir,'manifest.json'),JSON.stringify({generatedAt:new Date().toISOString(),mode:'static-dom',sourceSha256:digest.digest('hex'),documents:screens.map(s=>({id:s.id,width:s.w,height:results.find(r=>r.id===s.id).staticHeight}))},null,2));
 console.log(JSON.stringify({total:results.length,failed},null,2));
 if(failed.length)process.exitCode=1;
 }finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
