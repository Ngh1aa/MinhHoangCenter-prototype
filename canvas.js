(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const viewport=$('viewport'),world=$('world'),preview=$('preview'),modalFrame=$('prototype');
 const boards=new Map();
 let screens=[],units=[],visible=[],version='all',query='',selected='',scale=.6,x=24,y=160,bounds={width:1704,height:1000},drag,panMode=false;
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
 const sourceUrl=s=>'app/'+encodeURIComponent(s.f);
 function transform(){world.style.transform=`translate(${x}px,${y}px) scale(${scale})`;$('zoom-level').value=Math.round(scale*100)+'%';}
 function zoom(value,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){const next=Math.max(.025,Math.min(1.6,value));x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;transform();}
 function fit(rect=bounds){const w=viewport.clientWidth,h=Math.max(160,viewport.clientHeight-190);scale=Math.max(.025,Math.min(1,(w-48)/rect.width,(h-24)/rect.height));x=(w-rect.width*scale)/2-(rect.x||0)*scale;y=150+(h-rect.height*scale)/2-(rect.y||0)*scale;transform();}
 function reset(){scale=viewport.clientWidth<600?.43:Math.min(.64,(viewport.clientWidth-56)/1704);x=24;y=160;transform();}
 function closeMenu(){$('sidebar').classList.remove('is-open');$('menu').setAttribute('aria-expanded','false');}
 function select(s){selected=s.id;document.querySelectorAll('[data-screen]').forEach(el=>el.classList.toggle('selected',el.dataset.screen===selected));}
 function setMode(pan){panMode=pan;viewport.classList.toggle('pan-mode',pan);$('pan-mode').setAttribute('aria-pressed',String(pan));$('interact-mode').setAttribute('aria-pressed',String(!pan));}
 function markModal(s){select(s);$('preview-title').textContent=s.t.replace(/^v1 · /,'');$('preview-group').textContent=s.group+' · '+s.id;$('open-screen').href=sourceUrl(s);$('previous').disabled=visible.indexOf(s)<=0;$('next').disabled=visible.indexOf(s)>=visible.length-1;$('share').textContent='Chép link';}
 function sizeModal(){if(!preview.open)return;const s=screens.find(s=>s.id===selected);if(!s)return;const body=preview.querySelector('.preview-body'),shell=$('preview-frame-shell'),availableWidth=body.clientWidth-(innerWidth>760?40:0),availableHeight=body.clientHeight-(innerWidth>760?40:10),nativeWidth=s.version==='reference'?s.w:Math.min(390,availableWidth),factor=Math.min(1,availableWidth/nativeWidth);shell.style.width=nativeWidth*factor+'px';shell.style.height=availableHeight+'px';modalFrame.style.width=nativeWidth+'px';modalFrame.style.height=availableHeight/factor+'px';modalFrame.style.transform=`scale(${factor})`;}
 function open(s,updateHash=true){markModal(s);modalFrame.src=sourceUrl(s);if(!preview.open)preview.showModal();sizeModal();closeMenu();if(updateHash)history.replaceState(null,'','#screen='+encodeURIComponent(s.id));}
 function frameSize(s){if(s.version!=='reference')return{width:390,height:844,scale:1};return{width:s.w,height:s.h,scale:Math.min(390/s.w,700/s.h)};}
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const record=boards.get(entry.target.dataset.screen);if(record&&!record.frame.hasAttribute('src'))load(record);}}, {root:viewport,rootMargin:'500px'});
 function load(record){record.status.textContent='Đang mở prototype…';record.slot.classList.remove('ready','failed');record.frame.src=sourceUrl(record.screen);}
 function createBoard(s){
  const board=document.createElement('section');board.className='artboard'+(s.version==='legacy'?' archived':'')+(s.version==='reference'?' reference':'');board.dataset.screen=s.id;board.setAttribute('aria-label',s.t);
  const header=document.createElement('header');header.className='artboard-header';
  const name=document.createElement('button');name.className='artboard-label';name.type='button';name.textContent=s.t.replace(/^v1 · /,'');name.title='Xem gần màn '+s.t;name.onclick=()=>{select(s);fit({x:s.x,y:s.y-44,width:390,height:s.displayHeight+88});closeMenu();};
  const tag=document.createElement('span');tag.className='version-tag';tag.textContent=s.version==='legacy'?'V1':s.version==='reference'?'TÀI LIỆU':'HIỆN TẠI';
  const resetButton=document.createElement('button');resetButton.type='button';resetButton.className='board-control';resetButton.textContent='↺';resetButton.setAttribute('aria-label','Đặt lại '+s.id);
  const expand=document.createElement('button');expand.type='button';expand.className='board-control';expand.textContent='↗';expand.setAttribute('aria-label','Mở lớn '+s.id);expand.onclick=()=>open(s);
  header.append(tag,name,resetButton,expand);
  const slot=document.createElement('div');slot.className='live-slot';
  const size=frameSize(s);s.displayHeight=size.height*size.scale;slot.style.height=s.displayHeight+'px';
  const status=document.createElement('div');status.className='frame-status';status.setAttribute('role','status');status.textContent='Prototype trực tiếp';
  const iframe=document.createElement('iframe');iframe.className='canvas-prototype';iframe.title=s.t+' · prototype trực tiếp';iframe.dataset.src=sourceUrl(s);iframe.style.width=size.width+'px';iframe.style.height=size.height+'px';iframe.style.transform=`scale(${size.scale})`;iframe.style.left=Math.max(0,(390-size.width*size.scale)/2)+'px';
  const routeLabel=document.createElement('span');routeLabel.className='board-route';routeLabel.textContent=s.id;
  slot.append(status,iframe);board.append(header,slot,routeLabel);
  const record={screen:s,board,frame:iframe,slot,status,routeLabel,currentFile:s.f};boards.set(s.id,record);
  iframe.addEventListener('load',()=>{
   if(!iframe.hasAttribute('src'))return;
   try{const doc=iframe.contentDocument;if(doc){doc.addEventListener('pointerdown',()=>select(s),{capture:true});doc.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();const box=iframe.getBoundingClientRect(),vp=viewport.getBoundingClientRect();zoom(scale*Math.exp(-e.deltaY*.005),box.left-vp.left+e.clientX*box.width/size.width,box.top-vp.top+e.clientY*box.height/size.height);},{passive:false});}}catch{status.textContent='Mở riêng để xem nội dung từ bên ngoài.';}
  });
  resetButton.onclick=()=>{record.currentFile=s.f;routeLabel.textContent=s.id;load(record);select(s);};
  world.append(board);observer.observe(board);return record;
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
  $('canvas-description').textContent=visible.length+' prototype trực tiếp'+(pairCount?' · '+pairCount+' cặp so sánh':'')+' · Viền đỏ: v1';
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
    const item=document.createElement('button');item.className='screen-item';item.dataset.screen=unit.shown.at(-1).id;item.dataset.pair=unit.id;const icon=document.createElement('span');icon.className='screen-icon'+(unit.paired?' paired-icon':'');icon.setAttribute('aria-hidden','true');const name=document.createElement('span');name.className='screen-label';name.textContent=unit.title;const tag=document.createElement('small');tag.textContent=unit.shown.length===2?'V1 / mới':unit.shown[0].version==='legacy'?'V1':'';item.append(icon,name,tag);item.title=unit.shown.map(s=>s.id).join(' / ');item.onclick=()=>{select(unit.shown.at(-1));fit(rectFor(unit.shown));closeMenu();};$('screen-list').append(item);
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
 $('interact-mode').onclick=()=>setMode(false);$('pan-mode').onclick=()=>setMode(true);
 $('zoom-in').onclick=()=>zoom(scale*1.25);$('zoom-out').onclick=()=>zoom(scale/1.25);$('fit').onclick=()=>fit();$('reset').onclick=reset;
 $('search').addEventListener('input',e=>{query=e.target.value;render();fit();});$('clear-search').onclick=()=>{query='';$('search').value='';render();reset();};
 document.querySelectorAll('[data-version]').forEach(b=>b.onclick=()=>{version=b.dataset.version;document.querySelectorAll('[data-version]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));render();reset();});
 $('menu').onclick=()=>{const state=$('sidebar').classList.toggle('is-open');$('menu').setAttribute('aria-expanded',String(state));};
 $('close-preview').onclick=()=>preview.close();preview.addEventListener('close',()=>{modalFrame.src='about:blank';history.replaceState(null,'',location.pathname+location.search);});
 $('previous').onclick=()=>{const i=visible.findIndex(s=>s.id===selected);if(i>0)open(visible[i-1]);};$('next').onclick=()=>{const i=visible.findIndex(s=>s.id===selected);if(i<visible.length-1)open(visible[i+1]);};
 $('play').onclick=()=>open(screens.find(s=>s.id==='GV01-TongQuan'));
 $('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('share').textContent='Đã chép';}catch{$('announcement').textContent='Link màn hình: '+location.href;}};
 $('help').onclick=()=>$('help-dialog').showModal();$('close-help').onclick=()=>$('help-dialog').close();
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin)return;
  const record=[...boards.values()].find(r=>r.frame.contentWindow===e.source);
  if(e.data?.type==='__dc_booted'&&e.data.mounted&&record){record.slot.classList.add('ready');return;}
  if(e.data?.__dcproto!==1)return;
  const s=screens.find(s=>s.f===e.data.file);if(!s)return;
  if(e.source===modalFrame.contentWindow&&preview.open){markModal(s);sizeModal();history.replaceState(null,'','#screen='+encodeURIComponent(s.id));return;}
  if(record){record.currentFile=s.f;record.routeLabel.textContent=s.f===record.screen.f?record.screen.id:'Đang mở: '+s.t;}
 });
 document.addEventListener('keydown',e=>{if(preview.open||$('help-dialog').open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='/'){e.preventDefault();if(innerWidth<760){$('sidebar').classList.add('is-open');$('menu').setAttribute('aria-expanded','true');}$('search').focus();}else if(e.key==='0')fit();else if(e.key==='+'||e.key==='=')zoom(scale*1.25);else if(e.key==='-')zoom(scale/1.25);else if(e.key==='Escape')closeMenu();else if(e.key.startsWith('Arrow')){e.preventDefault();if(e.key==='ArrowLeft')x+=80;if(e.key==='ArrowRight')x-=80;if(e.key==='ArrowUp')y+=80;if(e.key==='ArrowDown')y-=80;transform();}});
 let priorWidth=viewport.clientWidth;new ResizeObserver(()=>{if(priorWidth!==viewport.clientWidth){priorWidth=viewport.clientWidth;reset();}}).observe(viewport);
 new ResizeObserver(sizeModal).observe(preview.querySelector('.preview-body'));
 fetch('assets/screens.json').then(r=>{if(!r.ok)throw Error('inventory');return r.json();}).then(data=>{screens=data;units=buildUnits();$('total').textContent=screens.length+' prototype';render();reset();const id=new URLSearchParams(location.hash.slice(1)).get('screen');const s=screens.find(s=>s.id===id);if(s)open(s,false);}).catch(()=>{$('load-error').hidden=false;$('total').textContent='Chưa tải được';});
})();
