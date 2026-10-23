/* Shared browser-prototype interactions. No server, payment or message delivery is implied. */
(() => {
  'use strict';
  const screenId = document.body.dataset.screen;
  const current = document.body.classList.contains('mh-current');
  const storageKey = 'mh:draft:' + screenId;
  let knownFiles;
  const inventoryUrl=new URL('../assets/screens.json',document.currentScript?.src||location.href);
  fetch(inventoryUrl).then(r=>r.json()).then(items=>{knownFiles=new Set(items.map(item=>item.f));}).catch(()=>{});
  const read = key => { try { return JSON.parse(sessionStorage.getItem(key) || '{}'); } catch { return {}; } };
  const save = (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Private browsing can disable storage; editing remains available. */ } };
  let screen;
  let feedback;
  function hydrateAssets() {
    document.querySelectorAll('[data-mh-src],[data-mh-d]').forEach(el=>{
      if(el.closest('x-dc'))return;
      for(const [key,attribute] of [['data-mh-src','src'],['data-mh-d','d']]){
        const value=el.getAttribute(key);
        if(value && !value.includes('{{') && el.getAttribute(attribute)!==value)el.setAttribute(attribute,value);
      }
    });
  }
  function announce(message) {
    if (!feedback) { feedback = document.createElement('div'); feedback.className = 'mh-feedback'; feedback.setAttribute('role', 'status'); screen.append(feedback); }
    feedback.replaceChildren(document.createTextNode(message));
    const close = document.createElement('button'); close.textContent = 'Đóng thông báo'; close.type = 'button'; close.onclick = () => feedback.remove();
    feedback.append(close); const old = feedback; close.onclick = () => { old.remove(); feedback = null; };
  }
  function dialog(title, description, control) {
    const d = document.createElement('dialog'); d.className = 'mh-dialog';
    const heading = document.createElement('h2'); heading.id = 'mh-dialog-title'; heading.textContent = title;
    d.setAttribute('aria-labelledby', heading.id);
    const text = document.createElement('p'); text.textContent = description;
    const close = document.createElement('button'); close.textContent = control ? 'Áp dụng' : 'Đã hiểu';
    d.append(heading, text);
    if (control) d.append(control.element);
    d.append(close); document.body.append(d);
    close.onclick = () => { if (control && !control.element.reportValidity()) return; if(control)control.apply(control.element.value); d.close(); };
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', e => { if(e.target === d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();} });
    d.showModal();
  }
  function nativeHandler(button) { return button.hasAttribute('data-native-handler'); }
  function siblings(button, attribute) {
    const parent = button.closest('[role=radiogroup],[role=tablist]') || button.parentElement;
    return [...parent.querySelectorAll('button[' + attribute + ']')].filter(el => !nativeHandler(el));
  }
  function selected(button, attribute, value) {
    button.setAttribute(attribute, String(value));
    button.classList.toggle('mh-selected', value); button.classList.toggle('mh-unselected', !value);
  }
  function validateStep() {
    let first;
    for (const input of screen.querySelectorAll('input:not([type=file]),textarea')) {
      const required = input.getAttribute('aria-required') === 'true' || input.required;
      const raw = input.value.trim();
      let message = required && !raw ? 'Vui lòng điền thông tin này để tiếp tục.' : '';
      if(raw && input.type === 'tel' && !/^(?:0\d{9}|\+84\d{9})$/.test(raw.replace(/[\s.-]/g,'')))message='Nhập SĐT gồm 10 số hoặc bắt đầu bằng +84.';
      if(raw && input.type === 'email' && !input.validity.valid)message='Kiểm tra lại địa chỉ email.';
      if(input.dataset.errorId)document.getElementById(input.dataset.errorId)?.remove();
      input.removeAttribute('aria-invalid');
      if(input.dataset.originalDescription)input.setAttribute('aria-describedby',input.dataset.originalDescription);else input.removeAttribute('aria-describedby');
      if(message){
        const error=document.createElement('span');error.className='mh-error';error.id='mh-error-'+(input.id||input.name||'field');error.textContent=message;
        input.after(error);input.dataset.errorId=error.id;input.setAttribute('aria-invalid','true');
        input.setAttribute('aria-describedby',error.id);first ||= input;
      }
    }
    if(first){first.focus();first.scrollIntoView({block:'center'});announce('Chưa thể tiếp tục. Kiểm tra các trường được đánh dấu.');return false;}
    return true;
  }
  function setup() {
    screen = [...document.querySelectorAll('.screen')].find(el => !el.closest('x-dc') && el.getClientRects().length);
    if(!screen && /^(Main|DS|Line)/.test(screenId) && document.querySelector('[data-dc-tpl]'))screen=document.body;
    if(!screen)return;
    observer.disconnect();
    if(!screen)screen=document.body;
    screen.querySelectorAll('input[data-mh-value]').forEach(input=>{input.defaultValue=input.dataset.mhValue;});
    screen.querySelectorAll('input[data-mh-checked]').forEach(input=>{input.defaultChecked=true;});
    if(current){
      if(/^GV04[bcd]/.test(screenId)){
        const student=read('mh:draft:GV04-NhapHoSo');
        screen.querySelectorAll('span,h1,h2,p').forEach(el=>{if(el.children.length)return;const value=el.textContent.trim();if(value==='Nguyễn Văn A'&&student.n)el.textContent=student.n;if(value==='17A0105'&&student.ms)el.textContent=student.ms;});
      }
      const picked=read('mh:placement');
      if(/^XL0[34]/.test(screenId) && picked.teacher){
        screen.querySelectorAll('span').forEach(span=>{
          if(span.children.length)return;
          const value=span.textContent.trim();
          if(value==='Toán · Cô Thu Anh')span.textContent='Toán · '+picked.teacher;
          if(value==='Cô Thu Anh')span.textContent=picked.teacher;
          if(value==='Phòng 105')span.textContent='Phòng '+picked.room.replace('P.','');
          if(value==='105')span.textContent=picked.room.replace('P.','');
          if(value==='Chiều T3, T5 · 14:00')span.textContent=picked.slots;
          if(value==='5/6')span.textContent=picked.size;
        });
        if(screenId==='XL04-DaXepLop'){
          const calendar=screen.querySelector('.grid-cols-7');
          if(calendar){calendar.className='relative flex flex-wrap gap-2';calendar.setAttribute('aria-label','Lịch lớp đã chọn');calendar.replaceChildren();picked.slots.split(', ').forEach(slot=>{const item=document.createElement('span');item.className='pill bg-white text-brand-blue';item.textContent=slot;calendar.append(item);});}
        }
      }
      // All five destinations stay visible; icon-only tabs were hard to discover.
      screen.querySelectorAll('.nav .tab').forEach(tab => {
        const href=tab.getAttribute('href')||'';
        const label=/GV01/.test(href)?'Tổng quan':/GV02/.test(href)?'Học sinh':/GV07/.test(href)?'Duyệt':/GV08/.test(href)?'Học phí':'Liên lạc';
        [...tab.childNodes].filter(node=>node.nodeName.toLowerCase()!=='svg').forEach(node=>node.remove());
        const span=document.createElement('span');span.textContent=label;tab.append(span);tab.setAttribute('aria-label',label);
      });
      const draft=read(storageKey);
      screen.querySelectorAll('input:not([type=file]),textarea').forEach((input,i)=>{
        const key=input.id||input.name+'-'+i;input.dataset.draftKey=key;
        input.dataset.originalDescription=input.getAttribute('aria-describedby')||'';
        if(!input.getAttribute('aria-label')&&!input.labels?.length&&!input.getAttribute('aria-labelledby'))input.setAttribute('aria-label',input.placeholder||input.closest('label')?.innerText||'Thông tin');
        if(Object.hasOwn(draft,key)){if(['checkbox','radio'].includes(input.type))input.checked=draft[key];else input.value=draft[key];}
      });
      screen.addEventListener('input', e=>{
        if(e.target.dataset.draftKey){const draft=read(storageKey);draft[e.target.dataset.draftKey]=['checkbox','radio'].includes(e.target.type)?e.target.checked:e.target.value;save(storageKey,draft);}
        const search=e.target;
        if(!search.matches('input[placeholder^="Tìm"]'))return;
        const query=search.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
        const page=screen.querySelector('.page');
        const items=[...page.querySelectorAll('a[href]')].filter(a=>/GV03|TC07b|GV11b/.test(a.getAttribute('href'))&&a.closest('.nav')===null);
        if(!items.length)return;
        let count=0;items.forEach(item=>{const visible=item.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query);item.hidden=!visible;item.style.display=visible?'':'none';if(visible)count++;});
        let empty=page.querySelector('.mh-no-results');
        if(!count){if(!empty){empty=document.createElement('div');empty.className='mh-no-results';empty.setAttribute('role','status');page.append(empty);}empty.replaceChildren(document.createTextNode('Không tìm thấy kết quả cho “'+search.value+'”. '));const clear=document.createElement('button');clear.className='btn-ghost';clear.textContent='Xóa tìm kiếm';clear.onclick=()=>{search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));search.focus();};empty.append(clear);}else empty?.remove();
      });
    }
    document.addEventListener('click', e=>{
      const link=e.target.closest('a[data-unavailable]');
      if(link){e.preventDefault();dialog('Màn hình chưa có trong bản mẫu','Liên kết '+link.dataset.unavailable.replace('.dc.html','')+' được khai báo trong thiết kế gốc nhưng chưa có tệp trong repository. Bạn có thể đóng để quay lại và tiếp tục luồng hiện tại.');return;}
      if(!current)return;
      const a=e.target.closest('a[href]');
      if(a && knownFiles && /\.dc\.html(?:[?#]|$)/.test(a.getAttribute('href'))){
        const filename=new URL(a.href).pathname.split('/').pop();
        if(!knownFiles.has(filename)){e.preventDefault();dialog('Màn hình chưa có trong bản mẫu','Repository chưa cung cấp màn '+filename.replace('.dc.html','')+'. Đóng thông báo để quay lại, các thông tin đang nhập vẫn được giữ.');return;}
      }
      if(a && a.closest('.screen') && !a.closest('.nav') && /Tiếp tục|Lưu hồ sơ|Gửi yêu cầu|Giao việc|Tạo nhóm|Ghi nhận|Xác nhận/.test(a.textContent)){
        if(!validateStep()){e.preventDefault();return;}
      }
      const b=e.target.closest('button');if(!b||!screen.contains(b)||nativeHandler(b))return;
      if(b.disabled || b.getAttribute('aria-disabled')==='true'){e.preventDefault();return;}
      const role=b.getAttribute('role');
      if(role==='switch'){
        const checked=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',String(checked));
        if(screenId==='GV03-HoSo' && b.getAttribute('aria-label')==='Trạng thái học')location.href=checked?'GV03c-HoSoON.dc.html':'GV03b-HoSoOFF.dc.html';
        return;
      }
      if(role==='radio'||role==='tab'){
        const attr=role==='tab'?'aria-selected':'aria-checked';siblings(b,attr).forEach(el=>selected(el,attr,el===b));
        if(role==='tab'){screen.querySelectorAll('[role=tabpanel]').forEach(p=>{p.hidden=p.id!==b.getAttribute('aria-controls');});}
        return;
      }
      if(role==='checkbox'){selected(b,'aria-checked',b.getAttribute('aria-checked')!=='true');return;}
      if(b.hasAttribute('aria-pressed')||b.classList.contains('chip')){
        const multi=/Thứ|Chủ nhật/.test(b.getAttribute('aria-label')||'');
        if(!multi)siblings(b,'aria-pressed').forEach(el=>selected(el,'aria-pressed',false));
        selected(b,'aria-pressed',multi?b.getAttribute('aria-pressed')!=='true':true);return;
      }
      if(b.getAttribute('aria-haspopup')==='listbox'){
        const options=[b.textContent.trim(),'Khác'];
        const label=b.getAttribute('aria-labelledby')||'';
        if(label==='kl-label')options.splice(0,2,...Array.from({length:9},(_,i)=>'Khối '+(i+4)));
        if(label==='qh-label')options.splice(0,2,'Bố','Mẹ','Người giám hộ');
        if(label==='mh-label')options.splice(0,2,'Toán','Văn','Anh','Lý','Hóa','Sinh');
        if(b.id==='ut')options.splice(0,2,'Bình thường','Ưu tiên cao');
        if(options[1]==='Khác'){dialog('Lựa chọn trong bản mẫu','Repository chưa cung cấp danh mục cho trường này. Giá trị hiện tại được giữ nguyên.');return;}
        const select=document.createElement('select');select.setAttribute('aria-label','Chọn giá trị');options.forEach(v=>select.add(new Option(v,v)));select.value=b.textContent.trim();
        dialog('Chọn thông tin','Chọn giá trị phù hợp.',{element:select,apply:v=>{const text=b.querySelector('span')||b;text.firstChild.textContent=v;}});return;
      }
      if(b.getAttribute('aria-haspopup')==='dialog'){
        const input=document.createElement('input');input.type=/tháng/i.test(b.getAttribute('aria-label')||'')?'month':'datetime-local';input.required=true;input.setAttribute('aria-label','Thời gian');
        dialog('Chọn thời gian','Thay đổi thời gian hiển thị trong bản mẫu.',{element:input,apply:v=>{const span=b.querySelector('span');if(span)span.textContent=v.replace('T',' ');else b.textContent=v;}});return;
      }
      if(/Sao chép/.test(b.getAttribute('aria-label')||'')){
        const text=(b.getAttribute('aria-label')||'').includes('17A0105')?'17A0105':'HP 17A0105 T10';
        if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>announce('Đã sao chép '+text),()=>dialog('Sao chép nội dung',text));else dialog('Sao chép nội dung',text);return;
      }
      if(b.textContent.trim().startsWith('+')){const area=b.closest('section,div.flex-col')?.querySelector('textarea');if(area){area.value+=(area.value?'\n':'')+b.textContent.trim().replace(/^\+\s*/,'');area.dispatchEvent(new Event('input',{bubbles:true}));}return;}
      if(/Tải lên|Chụp bài|Thêm tệp|Chọn ảnh|Đổi ảnh/.test(b.textContent+' '+b.getAttribute('aria-label'))){const file=document.createElement('input');file.type='file';file.onchange=()=>announce('Đã chọn '+file.files[0]?.name+'. Tệp chỉ được xem tại trình duyệt.');file.click();return;}
      if(/Khóa tài khoản|Đặt lại mật khẩu|Xem thêm|Tháng trước|Tháng sau|Liên kết/.test(b.textContent+' '+b.getAttribute('aria-label')))dialog('Thao tác trong bản mẫu','Chức năng này chưa có xử lý dữ liệu trong repository gốc. Các dữ liệu và quyền thực tế chưa thay đổi.');
    });
    if(current)screen.addEventListener('keydown',e=>{
      const radio=e.target.closest('button[role=radio]');
      if(!radio||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
      const group=radio.closest('[role=radiogroup]')||radio.parentElement;
      const choices=[...group.querySelectorAll('button[role=radio]:not(:disabled)')];
      if(choices.length<2)return;e.preventDefault();
      const next=(choices.indexOf(radio)+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+choices.length)%choices.length;
      choices[next].focus();choices[next].click();
    });
  }
  const observer=new MutationObserver(setup);observer.observe(document.body,{childList:true,subtree:true});setup();
  const assets=new MutationObserver(hydrateAssets);assets.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-mh-src','data-mh-d']});hydrateAssets();
})();
