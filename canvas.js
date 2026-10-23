(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const viewport=$('viewport'),world=$('world'),preview=$('preview'),modalContent=$('preview-static');
 const boards=new Map();
 let screens=[],units=[],visible=[],version='all',query='',selected='',scale=1,x=24,y=160,bounds={width:1704,height:1000},drag;
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
 const snapshotUrl=s=>'assets/static-screens/'+encodeURIComponent(s.id)+'.json';
 const commonCss=fetch('assets/static-screens/common.css').then(r=>{if(!r.ok)throw Error('styles');return r.text();});
 const snapshots=new Map();
 function snapshot(s){if(!snapshots.has(s.id))snapshots.set(s.id,fetch(snapshotUrl(s)).then(r=>{if(!r.ok)throw Error('screen');return r.json();}));return snapshots.get(s.id);}
 async function mountStatic(host,s){const [data,css]=await Promise.all([snapshot(s),commonCss]);const shadow=host.shadowRoot||host.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=css+'\n'+data.styles;const content=document.createElement('div');content.className='static-root '+data.bodyClass;content.inert=true;content.innerHTML=data.html;shadow.replaceChildren(style,content);host.style.width=data.width+'px';host.style.height=data.height+'px';await document.fonts.ready;}
 function transform(){world.style.transform=`translate(${x}px,${y}px) scale(${scale})`;$('zoom-level').value=Math.round(scale*100)+'%';}
 function zoom(value,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){const next=Math.max(.025,Math.min(4,value));x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;if(scale===1){x=Math.round(x);y=Math.round(y);}transform();}
 function fit(rect=bounds){const w=viewport.clientWidth,h=Math.max(160,viewport.clientHeight-190);scale=Math.max(.025,Math.min(1,(w-48)/rect.width,(h-24)/rect.height));x=(w-rect.width*scale)/2-(rect.x||0)*scale;y=150+(h-rect.height*scale)/2-(rect.y||0)*scale;transform();}
 function reset(){scale=1;x=24;y=160;transform();}
 function closeMenu(){$('sidebar').classList.remove('is-open');$('menu').setAttribute('aria-expanded','false');}
 function select(s){selected=s.id;document.querySelectorAll('[data-screen]').forEach(el=>el.classList.toggle('selected',el.dataset.screen===selected));}
 function markModal(s){select(s);$('preview-title').textContent=s.t.replace(/^v1 · /,'');$('preview-group').textContent=s.group+' · '+s.id;$('previous').disabled=visible.indexOf(s)<=0;$('next').disabled=visible.indexOf(s)>=visible.length-1;$('share').textContent='Chép link';}
 function open(s,updateHash=true){markModal(s);modalContent.replaceChildren();const host=document.createElement('div');host.className='static-content';modalContent.append(host);mountStatic(host,s).catch(()=>{host.textContent='Chưa tải được màn. Hãy đóng và mở lại.';});if(!preview.open)preview.showModal();closeMenu();if(updateHash)history.replaceState(null,'','#screen='+encodeURIComponent(s.id));}
 function frameSize(s){if(s.version!=='reference')return{width:390,height:s.staticHeight,scale:1};return{width:s.w,height:s.h,scale:Math.min(390/s.w,700/s.h)};}
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const record=boards.get(entry.target.dataset.screen);if(record&&!record.loading){record.loading=true;mountStatic(record.content,record.screen).then(()=>record.slot.classList.add('ready')).catch(()=>{record.loading=false;record.status.textContent='Chưa tải được màn. Tải lại trang để thử lại.';});}}}, {root:viewport,rootMargin:'500px'});
 function createBoard(s){
  const board=document.createElement('section');board.className='artboard'+(s.version==='legacy'?' archived':'')+(s.version==='reference'?' reference':'');board.dataset.screen=s.id;board.setAttribute('aria-label',s.t);
  const header=document.createElement('header');header.className='artboard-header';
  const name=document.createElement('button');name.className='artboard-label';name.type='button';name.textContent=s.t.replace(/^v1 · /,'');name.title='Xem màn '+s.t;name.onclick=()=>open(s);
  const tag=document.createElement('span');tag.className='version-tag';tag.textContent=s.version==='legacy'?'V1':s.version==='reference'?'TÀI LIỆU':'HIỆN TẠI';
  const expand=document.createElement('button');expand.type='button';expand.className='board-control';expand.textContent='↗';expand.setAttribute('aria-label','Mở lớn '+s.id);expand.onclick=()=>open(s);header.append(tag,name,expand);
  const slot=document.createElement('div');slot.className='static-slot';const size=frameSize(s);s.displayHeight=size.height*size.scale;slot.style.height=s.displayHeight+'px';
  const status=document.createElement('div');status.className='frame-status';status.textContent='Đang tải thiết kế…';
  const content=document.createElement('div');content.className='static-content';content.setAttribute('aria-label',s.t+' · thiết kế tĩnh');content.style.width=size.width+'px';content.style.height=size.height+'px';content.style.transform='scale('+size.scale+')';content.style.left=Math.max(0,(390-size.width*size.scale)/2)+'px';
  const route=document.createElement('span');route.className='board-route';route.textContent=s.id;
  slot.append(status,content);board.append(header,slot,route);slot.addEventListener('dblclick',()=>open(s));
  const record={screen:s,board,content,slot,status,loading:false};boards.set(s.id,record);world.append(board);observer.observe(board);return record;
 }
 function buildUnits(){
  const legacy=new Map(screens.filter(s=>s.version==='legacy').map(s=>[s.id.slice(3),s]));
  const paired=new Set();const result=[];
  for(const s of screens.filter(s=>s.version==='current')){const old=legacy.get(s.id);if(old)paired.add(old.id);result.push({id:s.id,group:s.group,title:s.t.replace(/^\w+\s+/,''),screens:old?[old,s]:[s],paired:!!old});}
  for(const s of screens.filter(s=>s.version==='legacy'&&!paired.has(s.id)))result.push({id:s.id,group:'V1 chưa có bản hiện tại tương ứng',title:s.t.replace(/^v1 · /,''),screens:[s],paired:false,missingCurrent:true});
  for(const s of screens.filter(s=>s.version==='reference'))result.push({id:s.id,group:s.group,title:s.t,screens:[s],paired:false});
  return result;
 }
 function rectFor(items){return{x:Math.min(...items.map(s=>s.x))-12,y:Math.min(...items.map(s=>s.y))-70,width:Math.max(...items.map(s=>s.x+390))-Math.min(...items.map(s=>s.x))+24,height:Math.max(...items.map(s=>s.y+s.displayHeight+36))-Math.min(...items.map(s=>s.y))+100};}
 function render(){
  const candidates=units.map(unit=>({...unit,shown:unit.screens.filter(s=>version==='all'||s.version===version)})).filter(unit=>unit.shown.length&&(!query||normalize(unit.screens.map(s=>s.t+' '+s.id).join(' ')+' '+unit.group).includes(normalize(query))));
  visible=candidates.flatMap(u=>u.shown);const active=new Set(visible.map(s=>s.id));
  boards.forEach((r,id)=>{r.board.hidden=!active.has(id);});
  world.querySelectorAll('.lane-title,.comparison-label,.missing-current').forEach(el=>el.remove());$('screen-list').replaceChildren();
  $('side-count').textContent=visible.length;$('no-results').hidden=visible.length>0;
  const pairCount=candidates.filter(u=>u.shown.length===2).length;
  $('canvas-description').textContent=visible.length+' màn tĩnh'+(pairCount?' · '+pairCount+' cặp so sánh':'')+' · Viền đỏ: v1';
  const groups=[...new Set(candidates.map(u=>u.group))];let top=0,maxWidth=0;
  for(const group of groups){
   const groupUnits=candidates.filter(u=>u.group===group),heading=document.createElement('h2');heading.className='lane-title';heading.style.cssText=`left:0;top:${top}px`;heading.textContent=group;world.append(heading);
   const listHeading=document.createElement('button');listHeading.className='group-heading';listHeading.textContent=group;listHeading.onclick=()=>{fit(rectFor(groupUnits.flatMap(u=>u.shown)));closeMenu();};$('screen-list').append(listHeading);
   let col=0,rowTop=top+100,rowHeight=0;
   for(const unit of groupUnits){
    const width=unit.shown.length===2||unit.missingCurrent&&version==='all'?812:390;
    if(col&&col+width>1704){rowTop+=rowHeight+124;col=0;rowHeight=0;}
    const caption=document.createElement('div');caption.className='comparison-label';caption.textContent=unit.title;caption.dataset.pair=unit.id;caption.style.cssText=`left:${col}px;top:${rowTop-48}px;width:${width}px`;world.append(caption);
    unit.shown.forEach((s,i)=>{s.x=col+i*422;s.y=rowTop;const record=boards.get(s.id)||createBoard(s);record.board.hidden=false;record.board.style.left=s.x+'px';record.board.style.top=s.y+'px';rowHeight=Math.max(rowHeight,s.displayHeight+72);maxWidth=Math.max(maxWidth,s.x+390);});
    if(unit.missingCurrent&&version==='all'){const missing=document.createElement('div');missing.className='missing-current';missing.textContent='Chưa có màn hiện tại tương ứng trong repository.';missing.style.cssText=`left:${col+422}px;top:${rowTop+42}px;width:390px;height:844px`;world.append(missing);maxWidth=Math.max(maxWidth,col+812);}
    const item=document.createElement('button');item.className='screen-item';item.dataset.screen=unit.shown.at(-1).id;item.dataset.pair=unit.id;const icon=document.createElement('span');icon.className='screen-icon'+(unit.paired?' paired-icon':'');icon.setAttribute('aria-hidden','true');const name=document.createElement('span');name.className='screen-label';name.textContent=unit.title;const tag=document.createElement('small');tag.textContent=unit.shown.length===2?'V1 / mới':unit.shown[0].version==='legacy'?'V1':'';item.append(icon,name,tag);item.title=unit.shown.map(s=>s.id).join(' / ');item.onclick=()=>{const current=unit.shown.at(-1);select(current);const rect=rectFor(innerWidth<760?[current]:unit.shown);scale=Math.min(1,(viewport.clientWidth-32)/rect.width);x=Math.round((viewport.clientWidth-rect.width*scale)/2-rect.x*scale);y=Math.round(160-rect.y*scale);transform();closeMenu();};$('screen-list').append(item);
    col+=width+80;
   }
   top=rowTop+rowHeight+124;
  }
  bounds={width:maxWidth||1000,height:top||1000};select(screens.find(s=>s.id===selected)||{id:''});
 }
 viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,select,textarea,a'))return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
 viewport.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;x=drag.x+e.clientX-drag.startX;y=drag.y+e.clientY-drag.startY;transform();});
 const stop=()=>{drag=null;viewport.classList.remove('dragging');};viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);
 viewport.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){const box=viewport.getBoundingClientRect();zoom(scale*Math.exp(-e.deltaY*.005),e.clientX-box.left,e.clientY-box.top);}else{x-=e.deltaX;y-=e.deltaY;transform();}},{passive:false});
 $('actual-size').onclick=$('zoom-actual').onclick=()=>zoom(1);
 const stops=[.1,.25,.5,.75,1,1.25,1.5,2,3,4];$('zoom-in').onclick=()=>zoom(stops.find(n=>n>scale+.001)||4);$('zoom-out').onclick=()=>zoom([...stops].reverse().find(n=>n<scale-.001)||.1);$('fit').onclick=()=>fit();$('reset').onclick=reset;
 $('search').addEventListener('input',e=>{query=e.target.value;render();fit();});$('clear-search').onclick=()=>{query='';$('search').value='';render();reset();};
 document.querySelectorAll('[data-version]').forEach(b=>b.onclick=()=>{version=b.dataset.version;document.querySelectorAll('[data-version]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));render();reset();});
 $('menu').onclick=()=>{const state=$('sidebar').classList.toggle('is-open');$('menu').setAttribute('aria-expanded',String(state));};
 $('close-preview').onclick=()=>preview.close();preview.addEventListener('close',()=>{if(preview.open)return;modalContent.replaceChildren();const id=new URLSearchParams(location.hash.slice(1)).get('screen');if(!id||id===selected)history.replaceState(null,'',location.pathname+location.search);});
 $('previous').onclick=()=>{const i=visible.findIndex(s=>s.id===selected);if(i>0)open(visible[i-1]);};$('next').onclick=()=>{const i=visible.findIndex(s=>s.id===selected);if(i<visible.length-1)open(visible[i+1]);};
 $('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('share').textContent='Đã chép';}catch{$('announcement').textContent='Link màn hình: '+location.href;}};
 $('help').onclick=()=>$('help-dialog').showModal();$('close-help').onclick=()=>$('help-dialog').close();
 document.addEventListener('keydown',e=>{if(preview.open||$('help-dialog').open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='/'){e.preventDefault();if(innerWidth<760){$('sidebar').classList.add('is-open');$('menu').setAttribute('aria-expanded','true');}$('search').focus();}else if(e.key==='0')fit();else if(e.key==='+'||e.key==='=')zoom(scale*1.25);else if(e.key==='-')zoom(scale/1.25);else if(e.key==='Escape')closeMenu();else if(e.key.startsWith('Arrow')){e.preventDefault();if(e.key==='ArrowLeft')x+=80;if(e.key==='ArrowRight')x-=80;if(e.key==='ArrowUp')y+=80;if(e.key==='ArrowDown')y-=80;transform();}});
 let priorWidth=viewport.clientWidth;new ResizeObserver(()=>{if(priorWidth!==viewport.clientWidth){priorWidth=viewport.clientWidth;reset();}}).observe(viewport);
 function openFromHash(){const id=new URLSearchParams(location.hash.slice(1)).get('screen'),s=screens.find(s=>s.id===id);if(s)open(s,false);else if(!id&&preview.open)preview.close();}
 window.addEventListener('hashchange',openFromHash);
 Promise.all(['assets/screens.json','assets/static-screens/manifest.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error('inventory');return r.json();}))).then(([data,manifest])=>{screens=data.map(s=>({...s,staticHeight:manifest.documents.find(d=>d.id===s.id).height}));units=buildUnits();$('total').textContent=screens.length+' màn tĩnh';render();reset();openFromHash();}).catch(()=>{$('load-error').hidden=false;$('total').textContent='Chưa tải được';});
})();
