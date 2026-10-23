(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const viewport=$('viewport'),world=$('world'),preview=$('preview'),frame=$('prototype');
 let screens=[],visible=[],version='all',query='',selected='',scale=.48,x=36,y=160,bounds={width:1000,height:1000},drag;
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
 function announce(text){$('announcement').textContent=text;}
 function transform(){world.style.transform=`translate(${x}px,${y}px) scale(${scale})`;$('zoom-level').value=Math.round(scale*100)+'%';}
 function zoom(value,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){const next=Math.max(.025,Math.min(1.6,value));x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;transform();}
 function fit(rect=bounds){const w=viewport.clientWidth,h=viewport.clientHeight-170;scale=Math.max(.025,Math.min(1,(w-72)/rect.width,(h-40)/rect.height));x=(w-rect.width*scale)/2-(rect.x||0)*scale;y=150+(h-rect.height*scale)/2-(rect.y||0)*scale;transform();}
 function reset(){scale=viewport.clientWidth<600?.72:Math.min(.48,(viewport.clientWidth-72)/2580);x=24;y=160;transform();}
 function closeMenu(){$('sidebar').classList.remove('is-open');$('menu').setAttribute('aria-expanded','false');}
 function groupRect(group){const items=visible.filter(s=>s.group===group),minX=Math.min(...items.map(s=>s.x)),minY=Math.min(...items.map(s=>s.y))-65,maxX=Math.max(...items.map(s=>s.x+390)),maxY=Math.max(...items.map(s=>s.y+s.displayHeight+40));return{x:minX,y:minY,width:maxX-minX,height:maxY-minY};}
 function select(s){selected=s.id;document.querySelectorAll('[data-screen]').forEach(el=>el.classList.toggle('selected',el.dataset.screen===selected));}
 function mark(s){select(s);$('preview-title').textContent=s.t.replace(/^v1 · /,'');$('preview-group').textContent=s.group+' · '+s.id;$('open-screen').href='app/'+encodeURIComponent(s.f);$('previous').disabled=visible.indexOf(s)<=0;$('next').disabled=visible.indexOf(s)>=visible.length-1;$('share').textContent='Chép link';}
 function open(s,updateHash=true){mark(s);frame.src='app/'+encodeURIComponent(s.f);if(!preview.open)preview.showModal();closeMenu();if(updateHash)history.replaceState(null,'','#screen='+encodeURIComponent(s.id));}
 function render(){
  visible=screens.filter(s=>(version==='all'||s.version===version)&&(!query||normalize(s.t+' '+s.id+' '+s.group).includes(normalize(query))));
  $('side-count').textContent=visible.length;$('canvas-description').textContent=visible.length+' màn trên canvas · Chọn một màn để mở bản tương tác.';
  $('no-results').hidden=visible.length>0;world.replaceChildren();$('screen-list').replaceChildren();
  const groups=[...new Set(visible.map(s=>s.group))];let maxWidth=0,cursor=0,rowY=70,rowHeight=0;
  for(const group of groups){
   if(cursor && cursor%6===0){rowY+=rowHeight+150;rowHeight=0;}
   const items=visible.filter(s=>s.group===group),title=document.createElement('h2');title.className='lane-title';title.style.cssText=`left:${cursor%6*438}px;top:${rowY-70}px`;title.textContent=group;
   const small=document.createElement('small');small.textContent=items.length+' màn';title.append(small);world.append(title);
   const heading=document.createElement('button');heading.className='group-heading';heading.textContent=group;const count=document.createElement('span');count.textContent=items.length;heading.append(count);heading.onclick=()=>{fit(groupRect(group));closeMenu();};$('screen-list').append(heading);
   items.forEach((s,i)=>{
    const col=cursor%6;if(i&&!col){rowY+=rowHeight+150;rowHeight=0;}
    s.x=col*438;s.y=rowY;s.displayHeight=s.version==='reference'?Math.min(700,s.h/s.w*390):s.h;
    rowHeight=Math.max(rowHeight,s.displayHeight);maxWidth=Math.max(maxWidth,s.x+390);
    const board=document.createElement('button');board.type='button';board.className='artboard'+(s.version==='reference'?' reference':'')+(s.version==='legacy'?' archived':'');board.dataset.screen=s.id;board.style.cssText=`left:${s.x}px;top:${s.y}px`;board.setAttribute('aria-label','Mở '+s.t);
    const label=document.createElement('span');label.className='artboard-label';label.textContent=s.t.replace(/^v1 · /,'');const dims=document.createElement('small');dims.textContent=s.w+' × '+s.h;label.append(dims);
    const img=document.createElement('img');img.src=s.preview;img.alt='Giao diện '+s.t;img.width=390;img.height=s.displayHeight;img.loading='lazy';img.decoding='async';img.style.height=s.displayHeight+'px';
    board.append(label,img);board.onclick=()=>open(s);world.append(board);
    const item=document.createElement('button');item.className='screen-item';item.dataset.screen=s.id;const icon=document.createElement('span');icon.className='screen-icon';icon.setAttribute('aria-hidden','true');const name=document.createElement('span');name.className='screen-label';name.textContent=s.t.replace(/^v1 · /,'');item.append(icon,name);item.title=s.t;
    item.onclick=()=>{select(s);fit({x:s.x,y:s.y-45,width:390,height:s.displayHeight+80});closeMenu();};item.ondblclick=()=>open(s);$('screen-list').append(item);
    cursor++;
   });
  }
  bounds={width:maxWidth||1000,height:rowY+rowHeight+80};select(screens.find(s=>s.id===selected)||{id:''});
 }
 viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
 viewport.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;x=drag.x+e.clientX-drag.startX;y=drag.y+e.clientY-drag.startY;transform();});
 const stop=()=>{drag=null;viewport.classList.remove('dragging');};viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);
 viewport.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){const rect=viewport.getBoundingClientRect();zoom(scale*Math.exp(-e.deltaY*.005),e.clientX-rect.left,e.clientY-rect.top);}else{x-=e.deltaX;y-=e.deltaY;transform();}},{passive:false});
 $('zoom-in').onclick=()=>zoom(scale*1.25);$('zoom-out').onclick=()=>zoom(scale/1.25);$('fit').onclick=()=>fit();$('reset').onclick=reset;
 $('search').addEventListener('input',e=>{query=e.target.value;render();fit();});$('clear-search').onclick=()=>{query='';$('search').value='';render();reset();};
 document.querySelectorAll('[data-version]').forEach(b=>b.onclick=()=>{version=b.dataset.version;document.querySelectorAll('[data-version]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));render();reset();});
 $('menu').onclick=()=>{const state=$('sidebar').classList.toggle('is-open');$('menu').setAttribute('aria-expanded',String(state));};
 $('close-preview').onclick=()=>preview.close();preview.addEventListener('close',()=>{frame.src='about:blank';history.replaceState(null,'',location.pathname+location.search);});
 $('previous').onclick=()=>{const i=visible.findIndex(s=>s.id===selected);if(i>0)open(visible[i-1]);};$('next').onclick=()=>{const i=visible.findIndex(s=>s.id===selected);if(i<visible.length-1)open(visible[i+1]);};
 $('play').onclick=()=>open(screens.find(s=>s.id==='GV01-TongQuan'));
 $('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('share').textContent='Đã chép';}catch{announce('Link màn hình: '+location.href);}};
 $('help').onclick=()=>$('help-dialog').showModal();$('close-help').onclick=()=>$('help-dialog').close();
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.__dcproto!==1)return;const s=screens.find(s=>s.f===e.data.file);if(s){mark(s);history.replaceState(null,'','#screen='+encodeURIComponent(s.id));}});
 document.addEventListener('keydown',e=>{if(preview.open||$('help-dialog').open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='/'){e.preventDefault();if(innerWidth<760){$('sidebar').classList.add('is-open');$('menu').setAttribute('aria-expanded','true');}$('search').focus();}else if(e.key==='0')fit();else if(e.key==='+'||e.key==='=')zoom(scale*1.25);else if(e.key==='-')zoom(scale/1.25);else if(e.key==='Escape')closeMenu();else if(e.key.startsWith('Arrow')){e.preventDefault();if(e.key==='ArrowLeft')x+=80;if(e.key==='ArrowRight')x-=80;if(e.key==='ArrowUp')y+=80;if(e.key==='ArrowDown')y-=80;transform();}});
 let priorWidth=viewport.clientWidth;new ResizeObserver(()=>{if(priorWidth!==viewport.clientWidth){priorWidth=viewport.clientWidth;reset();}}).observe(viewport);
 fetch('assets/screens.json').then(r=>{if(!r.ok)throw Error('inventory');return r.json();}).then(data=>{screens=[...data.filter(s=>s.version==='current'),...data.filter(s=>s.version==='legacy'),...data.filter(s=>s.version==='reference')];$('total').textContent=screens.length+' màn hình';render();reset();const id=new URLSearchParams(location.hash.slice(1)).get('screen');const s=screens.find(s=>s.id===id);if(s)open(s,false);}).catch(()=>{$('load-error').hidden=false;$('total').textContent='Chưa tải được';});
})();
