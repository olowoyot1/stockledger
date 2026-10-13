(()=>{'use strict';
const S={p:'dc_products_v3',d:'dc_days_v3',a:'delite_cravings_auth_v2',x:'dc_deleted_products_v1'},$=id=>document.getElementById(id);
const D=[["DC-001","Snacks","Meat Pie",0,0],["DC-002","Snacks","Chicken Pie",0,0],["DC-003","Snacks","Sausage",0,0],["DC-004","Snacks","Hotdog",0,0],["DC-005","Snacks","Coconut",0,0],["DC-006","Snacks","Pineapple",0,0],["DC-007","Snacks","Doughnut",0,0],["DC-008","Snacks","Fish Roll",0,0],["DC-009","Snacks","Egg Roll",0,0],["DC-010","Snacks","Buns",0,0],["DC-011","Snacks","Fish Pie",0,0],["DC-012","Snacks","Puff Puff",0,0],["DC-013","Snacks","Cupcakes",0,0],["DC-014","Akara","Akara's",0,0],["DC-015","Snacks","Plantain Chips",0,0],["DC-016","Bread","Bread 2,000",2000,0],["DC-017","Bread","Bread 1,500",1500,0],["DC-018","Bread","Bread 800",800,0],["DC-019","Bread","Bread 500",500,0],["DC-020","Drinks","Cola",0,0],["DC-021","Drinks","Pepsi",0,0],["DC-022","Drinks","Fayrouz",0,0],["DC-023","Drinks","Malt Can",0,0],["DC-024","Drinks","Viju Barbed",0,0],["DC-025","Drinks","Viju Wheat",0,0],["DC-026","Drinks","Viju Choco",0,0],["DC-027","Drinks","American Cola",0,0],["DC-028","Drinks","Nutri Choco",0,0],["DC-029","Drinks","Maca",0,0],["DC-030","Drinks","Fearless",0,0],["DC-031","Drinks","Commando",0,0],["DC-032","Drinks","Predator",0,0],["DC-033","Drinks","Big Soss",0,0],["DC-034","Drinks","Big Pally",0,0],["DC-035","Drinks","Lucozade Boost",0,0],["DC-036","Drinks","35cl Pet Malt",0,0],["DC-037","Drinks","50cl Pet Malt",0,0],["DC-038","Drinks","Eva Water",0,0],["DC-039","Drinks","Bottle Water",0,0],["DC-040","Drinks","Dudu Yog",0,0],["DC-041","Drinks","Dudu Red",0,0],["DC-042","Drinks","Nutri Milk",0,0],["DC-043","Drinks","U Milk",0,0],["DC-044","Drinks","Viju Yog",0,0],["DC-045","Drinks","Reach",0,0],["DC-046","Drinks","Dudu Mixed",0,0],["DC-047","Drinks","Nutri Fox Active",0,0],["DC-048","Drinks","Small Mineral",0,0],["DC-049","Drinks","Big Pocari",0,0],["DC-050","Drinks","Small Pocari",0,0],["DC-051","Drinks","50cl Cedar",0,0],["DC-052","Drinks","35cl Cedar",0,0],["DC-053","Drinks","Small Sosh",0,0],["DC-054","Drinks","Gball",0,0],["DC-055","Drinks","Vitamilk",0,0],["DC-056","Drinks","Hollandais",0,0],["DC-057","Drinks","Chivita",0,0],["DC-058","Drinks","Desperado",0,0],["DC-059","Drinks","Trophy",0,0],["DC-060","Drinks","Origin",0,0],["DC-061","Drinks","Red Bull",0,0],["DC-062","Drinks","Monster",0,0],["DC-063","Drinks","Smirnoff",0,0],["DC-064","Drinks","Budweiser",0,0],["DC-065","Drinks","Can Cola",0,0],["DC-066","Drinks","Can Schweppes",0,0],["DC-067","Drinks","Umas",0,0],["DC-068","Drinks","Tropical Big",0,0],["DC-069","Drinks","Berry Blast",0,0],["DC-070","Drinks","Mango Burst",0,0],["DC-071","Drinks","Pet Schweppes",0,0],["DC-072","Drinks","Mona Cola",0,0],["DC-073","Drinks","Mr Cream",0,0],["DC-074","Drinks","Slow Sip",0,0],["DC-075","Drinks","Maccaws",0,0],["DC-076","Drinks","Fresh Up",0,0]].map(x=>({id:x[0],category:x[1],name:x[2],price:x[3],opening:x[4]}));
const read=(k,f)=>{try{let x=localStorage.getItem(k);return x===null?f:JSON.parse(x)}catch{return f}},write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));if(window.DelCravingsCloudSync&&!window.__dcCloudPulling)setTimeout(window.DelCravingsCloudSync,0);return true}catch(e){console.error('Save failed',e);return false}},num=x=>Math.max(0,Number(x)||0),today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},fd=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')?d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4):String(d||''),money=x=>'₦'+Number(x||0).toLocaleString('en-NG',{maximumFractionDigits:2}),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let products=read(S.p,null); if(!Array.isArray(products)) products=read('dc_products_v2',null); if(!Array.isArray(products)) products=[]; let deletedProductIds=read(S.x,[]);if(!Array.isArray(deletedProductIds))deletedProductIds=[];let days=read(S.d,{});
if(!days||typeof days!=='object'||Array.isArray(days))days={};
const existingNames=new Set(products.map(x=>String(x.name||'').trim().toLowerCase()));

if(!localStorage.getItem('dc_mig_akara_v1')){const ak=x=>/akara/i.test(String(x?.name||''));products.forEach(p=>{if(ak(p))p.category='Akara'});Object.values(days).forEach(d=>(d?.rows||[]).forEach(r=>{if(ak(r))r.category='Akara'}));try{localStorage.setItem('dc_mig_akara_v1','1')}catch{}}
write(S.p,products);write(S.d,days);
const CATS=['Drinks','Snacks','Bread','Akara'];
function renumberSkus(){products.forEach((p,i)=>{p.sku='DC-'+String(i+1).padStart(3,'0')})}
renumberSkus();
const latestDay=()=>Object.keys(days).filter(k=>days[k]?.rows?.length).sort().pop()||'';
const isCurrent=d=>d>=today()||d>=latestDay();
function setPrice(p,price,src,d){price=num(price);if(!p||num(p.price)===price)return false;(p.priceLog||(p.priceLog=[])).push({at:new Date().toISOString(),date:d||'',from:num(p.price),to:price,src});p.price=price;dirty.p=true;return true}
const calc=r=>{let available=num(r.opening)+num(r.added),closing=Math.min(num(r.closing),available),sold=available-closing;return{available,closing,sold,sales:sold*num(r.price)}};
const auth=()=>{let a=read(S.a,null);return a?.username&&a?.pin?a:{username:'',pin:''}};
const prev=d=>{let x=new Date(d+'T12:00:00');x.setDate(x.getDate()-1);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const openStock=(p,d)=>{let old=days[d]?.rows?.find(x=>x.id===p.id);if(old)return num(old.opening);const prior=Object.keys(days).filter(k=>k<d&&Array.isArray(days[k]?.rows)&&days[k].rows.some(x=>x.id===p.id)).sort().pop();let pr=prior?days[prior].rows.find(x=>x.id===p.id):null;return pr?calc(pr).closing:num(p.opening)};
let rows=[];
const UI='dc_ui_state_v1',ui=(()=>{try{return JSON.parse(sessionStorage.getItem(UI))||{}}catch{return{}}})(),saveUI=()=>{try{sessionStorage.setItem(UI,JSON.stringify(ui))}catch{}};
let saveTimer=null,dirty={d:false,p:false};
function status(m,state){let s=$('saveStatus');if(s){s.textContent=m;s.dataset.state=state}}
function flush(){clearTimeout(saveTimer);saveTimer=null;if(!dirty.d&&!dirty.p){if(window.DelCravingsCloudSync)setTimeout(window.DelCravingsCloudSync,0);return true}let ok=true;if(dirty.d){if(write(S.d,days))dirty.d=false;else ok=false}if(dirty.p){if(write(S.p,products))dirty.p=false;else ok=false}status(ok?'All changes saved':'Save failed — storage full',ok?'saved':'error');if(!ok)toast('Could not save. Free up browser storage.');else if(window.DelCravingsCloudSync)setTimeout(window.DelCravingsCloudSync,0);return ok}
function schedule(){status('Saving…','saving');clearTimeout(saveTimer);saveTimer=setTimeout(flush,300)}
function persistDay(){let d=$('businessDate').value||today();days[d]={...(days[d]||{}),date:d,updatedAt:new Date().toISOString(),rows:rows.map(r=>({...r}))};dirty.d=true;schedule()}
function persistProducts(){dirty.p=true;schedule()}
const CLOUD_ENDPOINT='/api/cloud';
  function showAccount(){const a=auth(),c=read('dc_account',{})||{};$('userDisplay').textContent=(c.businessName||a.username)+(c.role==='superadmin'?' · Superadmin':c.plan==='trial'&&c.canWrite?' · Trial: '+c.daysLeft+' days left':c.canWrite===false?' · Subscription ended (read-only)':'');const b=document.querySelector('.brand');if(b&&c.businessName)b.textContent=c.businessName;const companiesNav=$('companiesNavBtn');if(companiesNav)companiesNav.classList.toggle('hidden',c.role!=='superadmin')}
async function restoreSalesData(){
  const KEY='dc_restore_applied_v1',VER='2026-10-07-sales-restore-v1';
  try{
    if(localStorage.getItem(KEY)===VER)return;
    const res=await fetch('/restore-sales.json',{cache:'no-store'});
    if(!res.ok)return;
    const pack=await res.json();
    if(pack.version!==VER||pack.encoding!=='gzip-base64'||!pack.data)return;
    const bin=Uint8Array.from(atob(pack.data),c=>c.charCodeAt(0));
    const stream=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
    const data=JSON.parse(await new Response(stream).text());
    const keyOf=(c,n)=>String(c||'').trim().toLowerCase()+'|'+String(n||'').trim().toLowerCase();
    const pmap=new Map(products.map(p=>[keyOf(p.category,p.name),p]));
    const firstOpening=new Map(),lastPrice=new Map();
    (data.records||[]).forEach(day=>(day.rows||[]).forEach(r=>{
      const k=keyOf(r.category,r.name);
      if(!firstOpening.has(k))firstOpening.set(k,num(r.opening));
      if(num(r.price)>0)lastPrice.set(k,num(r.price));
      if(!pmap.has(k)){
        const p={id:'REST-'+Math.random().toString(36).slice(2,10),category:normalize(r.category),name:String(r.name),price:num(r.price),opening:num(r.opening)};
        products.push(p);pmap.set(k,p);
      }
    }));
    pmap.forEach((p,k)=>{if(num(p.price)===0&&lastPrice.has(k))p.price=lastPrice.get(k);if(num(p.opening)===0&&firstOpening.has(k))p.opening=firstOpening.get(k)});
    const restored={...days};
    (data.records||[]).forEach(day=>{
      const now=new Date().toISOString();
      restored[day.date]={
        date:day.date,
        savedAt:restored[day.date]?.savedAt||now,
        updatedAt:now,
        rows:(day.rows||[]).map(r=>{
          const p=pmap.get(keyOf(r.category,r.name));
          return {id:p.id,category:p.category,name:p.name,price:num(r.price),opening:num(r.opening),added:num(r.added),closing:num(r.closing)};
        })
      };
    });
    products=products;
    days=restored;
    localStorage.setItem(S.p,JSON.stringify(products));
    localStorage.setItem(S.d,JSON.stringify(days));
    localStorage.setItem(KEY,VER);
    console.info('Delite Cravings sales recovery applied:',(data.records||[]).reduce((n,d)=>n+(d.rows||[]).length,0),'rows');
  }catch(e){console.warn('Sales recovery unavailable:',e)}
}
let cloudReady=false,cloudBusy=false,cloudPulling=false,cloudQueued=false,cloudPromise=null;
async function cloudPush(){
  // Serialize writes. A save requested while another is in flight is queued,
  // not silently discarded; the next pass sends the latest complete state.
  if(cloudPulling){cloudQueued=true;return false}
  if(cloudBusy){cloudQueued=true;return cloudPromise||false}
  cloudBusy=true;
  cloudPromise=(async()=>{
    let ok=true,passes=0;
    do{
      cloudQueued=false;passes++;
      try{
        const a=auth();
        const payload={action:'push',username:a.username,pin:a.pin,products,days,deletedProductIds,
          debtors:read('dc_debtors_v1',[]),
          creditSales:read('dc_credit_sales_v1',[]),
          payments:read('dc_debtor_payments_v1',[])};
        const res=await fetch(CLOUD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
        if(res.status===402){status('Trial ended — renew to keep saving','error');ok=false;break}
        if(!res.ok)throw new Error((await res.text())||('Cloud save failed '+res.status));
        cloudReady=true;status('Cloud saved','saved');
      }catch(e){ok=false;console.warn('Cloud sync unavailable:',e);status('Cloud save failed — retry required','error');break}
    }while(cloudQueued&&passes<5);
    return ok;
  })();
  try{return await cloudPromise}finally{cloudBusy=false;cloudPromise=null}
}
function mergeDays(local,remote){let merged={...remote};Object.entries(local||{}).forEach(([date,localDay])=>{let cloudDay=remote?.[date];if(!cloudDay){merged[date]=localDay;return}let localRows=localDay?.rows||[],cloudRows=cloudDay?.rows||[],localActivity=localRows.some(r=>num(r.opening)||num(r.added)||num(r.closing)||num(r.price)),cloudActivity=cloudRows.some(r=>num(r.opening)||num(r.added)||num(r.closing)||num(r.price));if(localActivity&&!cloudActivity)merged[date]=localDay;else if(localDay.updatedAt&&cloudDay.updatedAt&&localDay.updatedAt>cloudDay.updatedAt)merged[date]=localDay});return merged}
function mergeRecords(local,remote){
  const byId=new Map();
  // Cloud is authoritative for matching IDs; local-only records are retained
  // so first-device migrations and offline-created records are not discarded.
  (Array.isArray(remote)?remote:[]).forEach(x=>{if(x&&x.id!=null)byId.set(String(x.id),x)});
  (Array.isArray(local)?local:[]).forEach(x=>{if(x&&x.id!=null&&!byId.has(String(x.id)))byId.set(String(x.id),x)});
  return [...byId.values()];
}
async function cloudPull(){
  if(cloudPulling)return;
  cloudPulling=true;
  let needsPush=false;
  window.__dcCloudPulling=true;
  try{
    const localProducts=products,localDays=days;
    const localDebtors=read('dc_debtors_v1',[]),localSales=read('dc_credit_sales_v1',[]),localPayments=read('dc_debtor_payments_v1',[]);
    const a=auth();
    const res=await fetch(CLOUD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'pull',username:a.username,pin:a.pin}),cache:'no-store'});
    if(!res.ok)throw new Error((await res.text())||('Cloud load failed '+res.status));
    const out=await res.json();
    if(out.account){try{localStorage.setItem('dc_account',JSON.stringify(out.account))}catch{}showAccount()}
    if(out.exists&&out.data){
      const remote=out.data;
      const remoteProducts=Array.isArray(remote.products)?remote.products:[];
      deletedProductIds=[...new Set([...deletedProductIds,...(Array.isArray(remote.deletedProductIds)?remote.deletedProductIds:[])].map(String))];
      products=(dirty.p?mergeRecords(remoteProducts,localProducts):mergeRecords(localProducts,remoteProducts)).filter(p=>!deletedProductIds.includes(String(p.id)));
      renumberSkus();
      // Prefer the newest day snapshot while retaining dates that exist on only one device.
      days=mergeDays(localDays,remote.days&&typeof remote.days==='object'?remote.days:{});
      const debtors=mergeRecords(localDebtors,remote.debtors);
      const creditSales=mergeRecords(localSales,remote.creditSales);
      const payments=mergeRecords(localPayments,remote.payments);
      needsPush=JSON.stringify(products)!==JSON.stringify(remoteProducts)
        ||JSON.stringify(deletedProductIds)!==JSON.stringify(remote.deletedProductIds||[])
        ||JSON.stringify(days)!==JSON.stringify(remote.days||{})
        ||JSON.stringify(debtors)!==JSON.stringify(remote.debtors||[])
        ||JSON.stringify(creditSales)!==JSON.stringify(remote.creditSales||[])
        ||JSON.stringify(payments)!==JSON.stringify(remote.payments||[]);
      write('dc_debtors_v1',debtors);write('dc_credit_sales_v1',creditSales);write('dc_debtor_payments_v1',payments);
      write(S.p,products);write(S.x,deletedProductIds);write(S.d,days);cloudReady=true;
      sales();prod();reports();analytics();
      if(window.DelCravingsRefreshCredit)window.DelCravingsRefreshCredit();
      status('Cloud data loaded','saved');
    }else{
      // First device initializes the cloud from its local records.
      cloudReady=true;needsPush=true;
    }
  }catch(e){
    console.warn('Cloud load unavailable:',e);
    status('Cloud sync unavailable — local changes are kept','error');
  }finally{
    window.__dcCloudPulling=false;
    cloudPulling=false;
  }
  if(needsPush)await cloudPush();
}

function toast(m){let x=$('toast');x.textContent=m;x.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>x.classList.remove('show'),2000)}
function totals(rs){let t={sales:0,units:0,added:0,closing:0,p:{},c:{}};rs.forEach(r=>{let z=calc(r);t.sales+=z.sales;t.units+=z.sold;t.added+=num(r.added);t.closing+=z.closing;t.p[r.name]=(t.p[r.name]||0)+z.sales;t.c[r.category]=(t.c[r.category]||0)+z.sales});return t}
function tab(n){if(!$(n))n='sales';flush();ui.tab=n;saveUI();document.querySelectorAll('.nav-btn').forEach(x=>{let on=x.dataset.tab===n;x.classList.toggle('active',on);if(on)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});document.querySelectorAll('.tab-section').forEach(x=>x.classList.toggle('active',x.id===n));if(n==='sales')sales();if(n==='products')prod();if(n==='reports')reports();if(n==='analytics')analytics();if(n==='companies')loadCompanies()}
function sales(){let d=$('businessDate').value||today(),saved=days[d]?.rows||[];rows=products.map(p=>{let o=saved.find(x=>x.id===p.id),opening=o?num(o.opening):openStock(p,d);return{id:p.id,category:p.category,name:p.name,price:num(o?.price??p.price),opening,added:num(o?.added),closing:o?num(o.closing):opening}});let q=($('salesSearch').value||'').toLowerCase(),v=rows.filter(r=>(r.name+' '+r.category+' '+r.id).toLowerCase().includes(q));$('salesBody').innerHTML=v.map(r=>{let z=calc(r);return '<tr data-id="'+esc(r.id)+'"><td>'+esc(r.category)+'</td><td><b>'+esc(r.name)+'</b><small class="muted"> '+esc(r.id)+'</small></td><td><input data-f="opening" type="number" min="0" value="'+r.opening+'"></td><td><input data-f="added" type="number" min="0" value="'+r.added+'"></td><td class="av">'+z.available+'</td><td><input data-f="closing" type="number" min="0" max="'+z.available+'" value="'+z.closing+'"></td><td class="sold"><input data-f="sold" type="number" min="0" max="'+z.available+'" value="'+z.sold+'" aria-label="Units sold for '+esc(r.name)+'"></td><td><div class="add-sale"><input class="add-qty" type="number" min="1" placeholder="Qty" aria-label="Add units sold for '+esc(r.name)+'"><button class="btn add-sale-btn" type="button">Add</button></div></td><td><input data-f="price" type="number" min="0" value="'+r.price+'"></td><td class="rev"><b>'+money(z.sales)+'</b></td></tr>'}).join('')||'<tr><td colspan="10" class="muted">No products found.</td></tr>';summary();saveLabel()}
const curDate=()=>$('businessDate').value||today();
function locked(){let d=curDate();return !!days[d]?.savedAt&&ui.edit!==d}
function saveLabel(){let d=curDate(),saved=!!days[d]?.savedAt,lk=locked(),has=!!days[d];$('saveDayBtn').textContent=saved?'Update Day':'Save Day';$('saveDayBtn').classList.toggle('hidden',lk);$('editDayBtn').classList.toggle('hidden',!lk);$('lockNotice').classList.toggle('hidden',!lk);$('cloneDayBtn').disabled=!has;$('changeDateBtn').disabled=!has;$('clearDayBtn').disabled=!has;$('salesBody').querySelectorAll('input,button').forEach(x=>x.disabled=lk)}
function editDay(){ui.edit=curDate();saveUI();sales();$('salesBody').querySelector('input')?.focus();toast('Editing '+fd(ui.edit)+' — changes auto-save')}
function cloneDay(from,to){if(!from||!to)return false;if(from===to){toast('Pick a different date to clone to');return false}flush();let src=days[from];if(!src){toast('Nothing recorded on '+fd(from)+' yet');return false}if(days[to]&&!confirm('A report already exists for '+fd(to)+'. Replace it with a copy of '+fd(from)+'?'))return false;let now=new Date().toISOString();days[to]={date:to,savedAt:now,updatedAt:now,clonedFrom:from,rows:(src.rows||[]).map(r=>({...r}))};dirty.d=true;if(!flush())return false;$('businessDate').value=to;ui.date=to;ui.edit=null;saveUI();tab('sales');reports();analytics();toast('Report cloned to '+fd(to));return true}
function clearDay(){let d=curDate();if(!days[d]){toast('Nothing to clear for '+fd(d));return}if(!confirm('Clear all data for '+fd(d)+'? This deletes this day\'s entries and saved report so you can start fresh.'))return;flush();delete days[d];if(ui.edit===d)ui.edit=null;saveUI();dirty.d=true;if(!flush())return;sales();reports();analytics();toast('Data cleared for '+fd(d))}
function refreshRow(tr,r,active){let z=calc(r);r.closing=z.closing;tr.querySelector('.av').textContent=z.available;tr.querySelector('.rev b').textContent=money(z.sales);let c=tr.querySelector('[data-f="closing"]'),s=tr.querySelector('[data-f="sold"]');c.max=z.available;s.max=z.available;if(c!==active||num(c.value)>z.available)c.value=z.closing;if(s!==active||num(s.value)>z.available)s.value=z.sold}
function addSale(tr){if(locked()){toast('Click Edit Day to add sales');return}let q=tr.querySelector('.add-qty'),n=Math.floor(num(q.value)),r=rows.find(x=>x.id===tr.dataset.id);if(!r||!n){q.focus();return}let z=calc(r);if(n>z.closing){toast('Only '+z.closing+' '+r.name+' left in stock');return}r.closing=z.closing-n;q.value='';refreshRow(tr,r);summary();persistDay();toast('Added '+n+' sold: '+r.name)}
function moveDay(from,to){if(!from||!to||from===to)return false;flush();let src=days[from];if(!src){toast('Nothing recorded on '+fd(from)+' yet');return false}if(days[to]&&!confirm('A report already exists for '+fd(to)+'. Replace it?'))return false;days[to]={...src,date:to,updatedAt:new Date().toISOString()};delete days[from];dirty.d=true;if(!flush())return false;$('businessDate').value=to;if(ui.edit===from)ui.edit=to;ui.date=to;saveUI();sales();reports();analytics();toast('Report moved to '+fd(to));return true}
function openMove(from,mode='move'){if(!days[from]){toast('Nothing recorded on '+fd(from)+' yet');return}let clone=mode==='clone',dlg=$('moveDialog');dlg.dataset.from=from;dlg.dataset.mode=mode;$('moveTitle').textContent=clone?'Clone report':'Change business date';$('moveSubmit').textContent=clone?'Clone Report':'Move Report';$('moveFrom').textContent=clone?'Copy all entries from '+fd(from)+' to a new date. The original stays unchanged.':'Current date: '+fd(from);$('moveTo').value=clone?'':from;dlg.showModal();$('moveTo').focus()}
function summary(){let t=totals(rows);$('mSales').textContent=money(t.sales);$('mUnits').textContent=t.units;$('mAdded').textContent=t.added;$('mClosing').textContent=t.closing;$('categorySummary').innerHTML=Object.entries(t.c).map(([k,v])=>'<div class="category-card"><span class="muted">'+esc(k)+'</span><strong>'+money(v)+'</strong><small>'+rows.filter(r=>r.category===k).reduce((n,r)=>n+calc(r).sold,0)+' units sold</small></div>').join('')}
function productsUI(){let p=products;$('productsBody').innerHTML=p.map((x,i)=>'<tr data-pid="'+esc(x.id)+'"><td><select data-f="category" aria-label="Category for '+esc(x.name)+'">'+(CATS.includes(x.category)?CATS:[...CATS,x.category]).map(c=>'<option'+(x.category===c?' selected':'')+'>'+esc(c)+'</option>').join('')+'</select></td><td><input data-f="name" value="'+esc(x.name)+'"></td><td>'+esc(x.sku||('DC-'+String(i+1).padStart(3,'0')))+'</td><td><input data-f="price" type="number" min="0" value="'+num(x.price)+'"></td><td><input data-f="opening" type="number" min="0" value="'+num(x.opening)+'"></td><td><button class="btn btn-danger rm" type="button">Remove</button></td></tr>').join('')}
function prod(){productsUI()}
function dateList(a,b){let out=[];if(!a||!b||a>b)return out;let d=new Date(a+'T12:00:00'),e=new Date(b+'T12:00:00');while(d<=e){out.push(d.toLocaleDateString('en-CA'));d.setDate(d.getDate()+1)}return out}
function reports(){let ds=Object.values(days).filter(d=>d&&d.date).sort((a,b)=>String(b.date).localeCompare(String(a.date)));$('reportsBody').innerHTML=ds.map(d=>{let t=totals(d.rows||[]);return '<tr><td>'+fd(d.date)+'</td><td>'+money(t.sales)+'</td><td>'+t.units+'</td><td>'+t.added+'</td><td>'+t.closing+'</td><td><div class="reports-actions"><button class="btn open" data-date="'+d.date+'" type="button">Edit</button><button class="btn move" data-date="'+d.date+'" type="button">Change Date</button><button class="btn clone" data-date="'+d.date+'" type="button">Clone</button></div></td></tr>'}).join('')||'<tr><td colspan="6" class="muted">No saved reports yet.</td></tr>';custom();history()}
function historyRows(id){let out=[],last=null;Object.keys(days).sort().forEach(d=>{let r=days[d]?.rows?.find(x=>x.id===id);if(!r)return;let z=calc(r),changed=last!==null&&num(r.price)!==last;if(num(r.opening)||num(r.added)||z.sold||changed||last===null)out.push({d,r,z,was:changed?last:null});last=num(r.price)});return out}
function history(){let sel=$('historyProduct');if(!sel)return;let cur=ui.hp&&products.some(p=>p.id===ui.hp)?ui.hp:products[0]?.id;sel.innerHTML=CATS.concat([...new Set(products.map(p=>p.category))].filter(c=>!CATS.includes(c))).map(c=>{let ps=products.filter(p=>p.category===c);return ps.length?'<optgroup label="'+esc(c)+'">'+ps.map(p=>'<option value="'+esc(p.id)+'"'+(p.id===cur?' selected':'')+'>'+esc(p.name)+'</option>').join('')+'</optgroup>':''}).join('');let p=products.find(x=>x.id===cur);if(!p){$('productHistory').innerHTML='<p class="muted pad">No products.</p>';return}let h=historyRows(p.id),units=h.reduce((s,x)=>s+x.z.sold,0),sales=h.reduce((s,x)=>s+x.z.sales,0),added=h.reduce((s,x)=>s+num(x.r.added),0),log=(p.priceLog||[]).slice().reverse();$('productHistory').innerHTML='<div class="report-summary pad"><div class="summary-box"><span>Current Price</span><strong>'+money(p.price)+'</strong></div><div class="summary-box"><span>Total Units Sold</span><strong>'+units+'</strong></div><div class="summary-box"><span>Total Sales</span><strong>'+money(sales)+'</strong></div><div class="summary-box"><span>Stock Added</span><strong>'+added+'</strong></div></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Opening</th><th>Additions</th><th>Available</th><th>Closing</th><th>Sold</th><th>Unit Price</th><th>Sales</th></tr></thead><tbody>'+(h.slice().reverse().map(x=>'<tr><td>'+fd(x.d)+'</td><td>'+num(x.r.opening)+'</td><td>'+num(x.r.added)+'</td><td>'+x.z.available+'</td><td>'+x.z.closing+'</td><td><b>'+x.z.sold+'</b></td><td>'+money(x.r.price)+(x.was!==null?'<small class="price-change">was '+money(x.was)+'</small>':'')+'</td><td><b>'+money(x.z.sales)+'</b></td></tr>').join('')||'<tr><td colspan="8" class="muted">No recorded activity for this product yet.</td></tr>')+'</tbody></table></div><div class="pad"><h3>Price Changes</h3>'+(log.map(l=>'<div class="list-row"><span>'+fd(new Date(l.at).toLocaleDateString('en-CA'))+' '+new Date(l.at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})+' <small class="muted">via '+esc(l.src)+'</small></span><b>'+money(l.from)+' → '+money(l.to)+'</b></div>').join('')||'<p class="muted">No price changes recorded yet.</p>')+'</div>'}
function custom(){let a=$('reportFrom').value,b=$('reportTo').value;if(!a||!b){$('customReport').innerHTML='';return}let rs=[];dateList(a,b).forEach(d=>(days[d]?.rows||[]).forEach(r=>rs.push(r)));let t=totals(rs),n=dateList(a,b).length,s=dateList(a,b).filter(d=>days[d]).length,top=Object.entries(t.p).sort((x,y)=>y[1]-x[1]).slice(0,8);$('customReport').innerHTML='<div class="report-summary"><div class="summary-box"><span>Total Sales</span><strong>'+money(t.sales)+'</strong></div><div class="summary-box"><span>Units Sold</span><strong>'+t.units+'</strong></div><div class="summary-box"><span>Stock Added</span><strong>'+t.added+'</strong></div><div class="summary-box"><span>Saved Days</span><strong>'+s+'/'+n+'</strong></div></div><div class="two-col"><div class="panel"><h3>Top Products</h3>'+(top.map(x=>'<div class="list-row"><span>'+esc(x[0])+'</span><b>'+money(x[1])+'</b></div>').join('')||'<p class="muted">No data.</p>')+'</div><div class="panel"><h3>Category Sales</h3>'+Object.entries(t.c).sort((x,y)=>y[1]-x[1]).map(x=>'<div class="list-row"><span>'+esc(x[0])+'</span><b>'+money(x[1])+'</b></div>').join('')+'</div></div>'}
function analytics(){let n=Number($('analyticsRange').value||7),ds=[];for(let i=n-1;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);ds.push(d.toLocaleDateString('en-CA'))}let v=ds.map(d=>({d,t:totals(days[d]?.rows||[])})),total=v.reduce((s,x)=>s+x.t.sales,0),units=v.reduce((s,x)=>s+x.t.units,0),best=[...v].sort((a,b)=>b.t.sales-a.t.sales)[0],max=Math.max(1,...v.map(x=>x.t.sales)),savedCount=v.filter(x=>x.t.sales||x.t.units||x.t.added||x.t.closing).length;$('aSales').textContent=money(total);$('aAvg').textContent=money(savedCount?total/savedCount:0);$('aUnits').textContent=units;$('aBest').textContent=best?.t.sales?fd(best.d)+' '+money(best.t.sales):'—';$('chart').innerHTML=v.map(x=>'<div class="bar-wrap" title="'+fd(x.d)+' — '+money(x.t.sales)+'"><div class="bar" style="height:'+Math.max(2,x.t.sales/max*210)+'px"></div><div class="bar-label">'+fd(x.d).slice(0,5)+'</div></div>').join('');let p={},c={};v.forEach(x=>(days[x.d]?.rows||[]).forEach(r=>{let z=calc(r);if(!p[r.name])p[r.name]={sales:0,units:0};p[r.name].sales+=z.sales;p[r.name].units+=z.sold;c[r.category]=(c[r.category]||0)+z.sales}));$('topProducts').innerHTML=Object.entries(p).sort((a,b)=>b[1].sales-a[1].sales).slice(0,10).map(x=>'<div class="list-row"><span>'+esc(x[0])+'<small class="muted"> '+x[1].units+' qty sold</small></span><b>'+money(x[1].sales)+'</b></div>').join('')||'<p class="muted">No saved sales.</p>';$('catAnalytics').innerHTML=Object.entries(c).sort((a,b)=>b[1]-a[1]).map(x=>'<div class="list-row"><span>'+esc(x[0])+'</span><b>'+money(x[1])+'</b></div>').join('')||'<p class="muted">No saved sales.</p>'}
function csv(rs){return rs.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\n')}function dl(n,t){let a=document.createElement('a'),u=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),500)}
function save(){let d=$('businessDate').value||today();rows=rows.map(r=>({...r,closing:calc(r).closing}));let was=!!days[d]?.savedAt;days[d]={date:d,savedAt:days[d]?.savedAt||new Date().toISOString(),updatedAt:new Date().toISOString(),rows:rows.map(r=>({...r}))};if(isCurrent(d))rows.forEach(r=>setPrice(products.find(p=>p.id===r.id),r.price,'Daily Sales',d));dirty.d=true;if(!flush())return;ui.edit=null;saveUI();toast(was?'Daily report updated':'Daily report saved');sales();reports();analytics()}
function importX(){let f=$('excelFile').files[0];if(!f){toast('Select a file first');return}if(typeof XLSX==='undefined'&&!/\.csv$/i.test(f.name)){toast('Excel reader unavailable. Use CSV or refresh the page.');return}let rd=new FileReader();rd.onload=e=>{try{let data;if(typeof XLSX!=='undefined'){let w=XLSX.read(e.target.result,{type:'array'});data=XLSX.utils.sheet_to_json(w.Sheets[w.SheetNames[0]],{header:1,defval:''})}else{let text=new TextDecoder().decode(new Uint8Array(e.target.result));data=text.split(/\r?\n/).filter(Boolean).map(line=>line.split(',').map(x=>x.trim().replace(/^"|"$/g,'')))}if(data.length<2)throw Error('No product rows found');let h=data[0].map(x=>String(x).trim().toLowerCase().replace(/[_-]+/g,' ')),ix=(...ks)=>{for(const k of ks){const i=h.indexOf(k);if(i>=0)return i}return -1},ci=ix('category'),pi=ix('product','product name','item'),si=ix('sku','code','product code'),pr=ix('unit price','price','selling price'),oi=ix('opening stock','opening','stock');if([ci,pi,pr,oi].some(x=>x<0))throw Error('Required columns: Category, Product, Unit Price, Opening Stock');let count=0;data.slice(1).forEach(r=>{let name=String(r[pi]||'').trim();if(!name)return;let sku=String(si>=0?r[si]:'').trim(),p=(sku&&products.find(x=>x.id===sku))||products.find(x=>x.name.toLowerCase()===name.toLowerCase());if(p){p.category=normalize(r[ci]);p.name=name;p.price=num(r[pr]);p.opening=num(r[oi])}else products.push({id:sku||'P-'+Date.now()+'-'+count,category:normalize(r[ci]),name,price:num(r[pr]),opening:num(r[oi])});count++});renumberSkus();write(S.p,products);prod();sales();$('importMessage').textContent=count+' product(s) imported successfully.';toast('Import complete')}catch(err){$('importMessage').textContent='Import failed: '+err.message}};rd.readAsArrayBuffer(f)}
  function normalize(x){x=String(x||'').trim().toLowerCase();return x==='drink'||x==='drinks'?'Drinks':x==='snack'||x==='snacks'?'Snacks':x==='bread'?'Bread':x==='akara'||x==='akaras'||x==="akara's"?'Akara':x?x.replace(/\b\w/g,c=>c.toUpperCase()):'Other'}
  async function loadCompanies(){
    const a=auth(),message=$('companiesMessage'),body=$('companiesBody'),button=$('refreshCompaniesBtn');
    if(!body)return;
    button.disabled=true;message.textContent='Loading companies…';
    try{
      const res=await fetch(CLOUD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'listCompanies',username:a.username,pin:a.pin}),cache:'no-store'});
      const out=await res.json().catch(()=>({}));
      if(!res.ok||!out.ok)throw new Error(out.error||'Could not load companies.');
      body.innerHTML=(out.companies||[]).map(c=>'<tr><td><b>'+esc(c.business_name)+'</b><small class="muted"> '+esc(c.plan==='active'?'Active subscription':c.plan==='trial'?'Trial':'Suspended')+'</small></td><td>'+esc(c.username)+'</td><td>'+esc(c.plan)+'</td><td>'+c.staffCount+'</td><td>'+esc(fd(String(c.created_at||'').slice(0,10)))+'</td></tr>').join('')||'<tr><td colspan="5" class="muted">No companies found.</td></tr>';
      message.textContent=(out.companies||[]).length+' compan'+((out.companies||[]).length===1?'y':'ies')+' found.';
    }catch(e){body.innerHTML='';message.textContent=e.message||'Could not load companies.';console.error('Company directory failed:',e)}finally{button.disabled=false}
  }
  function bind(){
window.DelCravingsCloudSync=cloudPush;
const creditScript=document.createElement('script');creditScript.src='/debtors.js';creditScript.defer=true;document.head.appendChild(creditScript);
window.DelCravingsPull=cloudPull;

$('businessDate').value=ui.date||today();$('reportFrom').value=ui.from||today();$('reportTo').value=ui.to||today();$('salesSearch').value=ui.search||'';
navigator.storage?.persist?.().catch(()=>{});
const leave=()=>flush();window.addEventListener('pagehide',leave);window.addEventListener('beforeunload',leave);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
window.addEventListener('storage',e=>{if(e.key!==S.d&&e.key!==S.p)return;let editing=document.activeElement?.matches?.('input,select');if(e.key===S.d){let v=read(S.d,{});if(v&&typeof v==='object'&&!Array.isArray(v))days=v}else{let v=read(S.p,null);if(Array.isArray(v))products=v}if(editing)return;let active=document.querySelector('.tab-section.active')?.id;if(active==='sales')sales();if(active==='products')prod();reports();analytics()});
document.addEventListener('click',e=>{let b=e.target.closest?.('.nav-btn');if(b){e.preventDefault();tab(b.dataset.tab);return}let o=e.target.closest?.('.open');if(o){e.preventDefault();flush();$('businessDate').value=o.dataset.date;ui.date=o.dataset.date;ui.edit=o.dataset.date;saveUI();tab('sales');return}let m=e.target.closest?.('.move');if(m){e.preventDefault();openMove(m.dataset.date);return}let c=e.target.closest?.('.clone');if(c){e.preventDefault();openMove(c.dataset.date,'clone')}});
$('salesBody')?.addEventListener('input',e=>{if(locked())return;let i=e.target.closest('input[data-f]'),tr=i?.closest('tr');if(!i||!tr)return;let r=rows.find(x=>x.id===tr.dataset.id);if(!r)return;let f=i.dataset.f;let v=f==='price'?num(i.value):Math.floor(num(i.value));if(f==='sold'){let av=calc(r).available;r.closing=av-Math.min(v,av)}else r[f]=v;refreshRow(tr,r,i);summary();persistDay()});
$('salesBody')?.addEventListener('change',e=>{let i=e.target.closest('input[data-f="price"]'),tr=i?.closest('tr');if(!i||!tr||locked())return;let d=curDate();if(!isCurrent(d))return;let r=rows.find(x=>x.id===tr.dataset.id);if(setPrice(products.find(p=>p.id===tr.dataset.id),r?.price,'Daily Sales',d)){flush();prod();toast('Unit price updated on Products too')}});
$('salesBody')?.addEventListener('click',e=>{let b=e.target.closest('.add-sale-btn');if(b)addSale(b.closest('tr'))});
$('salesBody')?.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing||e.keyCode===229||!e.target.classList.contains('add-qty'))return;e.preventDefault();addSale(e.target.closest('tr'))});
$('changeDateBtn').addEventListener('click',()=>openMove(curDate()));
$('cloneDayBtn').addEventListener('click',()=>openMove(curDate(),'clone'));
$('clearDayBtn').addEventListener('click',clearDay);
$('editDayBtn').addEventListener('click',editDay);
$('moveCancel').addEventListener('click',()=>$('moveDialog').close());
$('moveForm').addEventListener('submit',e=>{e.preventDefault();let dlg=$('moveDialog'),fn=dlg.dataset.mode==='clone'?cloneDay:moveDay;if(fn(dlg.dataset.from,$('moveTo').value))dlg.close()});
$('salesSearch').addEventListener('input',()=>{ui.search=$('salesSearch').value;saveUI();sales()});$('businessDate').addEventListener('change',()=>{flush();ui.date=$('businessDate').value;ui.edit=null;saveUI();sales()});
$('reportFrom').addEventListener('change',()=>{ui.from=$('reportFrom').value;saveUI()});$('reportTo').addEventListener('change',()=>{ui.to=$('reportTo').value;saveUI()});
$('productsBody')?.addEventListener('input',e=>{let tr=e.target.closest('tr[data-pid]'),p=tr&&products.find(x=>x.id===tr.dataset.pid),f=e.target.dataset.f;if(!p||!f||f==='price')return;p[f]=(f==='name'||f==='category')?e.target.value:num(e.target.value);persistProducts()});$('saveDayBtn').addEventListener('click',save);
$('productsBody')?.addEventListener('change',async e=>{let tr=e.target.closest('tr[data-pid]'),p=tr&&products.find(x=>String(x.id)===String(tr.dataset.pid)),f=e.target.dataset.f;if(!p||!f)return;if(f==='price'){let d=curDate(),v=num(e.target.value);if(!setPrice(p,v,'Products page',today()))return;let r=days[d]?.rows?.find(x=>x.id===p.id);if(r&&!locked()&&isCurrent(d)){r.price=v;dirty.d=true}flush();sales();reports();toast('Price updated. Past reports keep their original prices.');return}p[f]=(f==='name'||f==='category')?e.target.value:num(e.target.value);dirty.p=true;const saved=flush();if(saved&&window.DelCravingsCloudSync){const synced=await window.DelCravingsCloudSync();toast(synced?(f==='name'?'Product name saved':'Product updated'):'Saved locally; cloud sync needs retry')}else if(saved)toast('Product updated');sales();reports();analytics()});
$('productsBody')?.addEventListener('click',e=>{if(!e.target.closest('.rm'))return;let id=e.target.closest('tr').dataset.pid;if(confirm('Remove this product?')){deletedProductIds=[...new Set([...deletedProductIds,String(id)])];products=products.filter(x=>String(x.id)!==String(id));renumberSkus();write(S.x,deletedProductIds);write(S.p,products);prod();sales();reports();analytics();if(window.DelCravingsCloudSync)window.DelCravingsCloudSync();toast('Product removed and SKU numbers updated');}});
$('addProductBtn').addEventListener('click',()=>{let n=prompt('Product name:');if(!n?.trim())return;products.push({id:'P-'+Date.now(),sku:'',category:normalize(prompt('Category:','Drinks')),name:n.trim(),price:num(prompt('Unit price:','0')),opening:num(prompt('Opening stock:','0'))});renumberSkus();write(S.p,products);prod();sales();toast('Product added')});

$('historyProduct').addEventListener('change',()=>{ui.hp=$('historyProduct').value;saveUI();history()});
$('exportHistoryBtn').addEventListener('click',()=>{let p=products.find(x=>x.id===$('historyProduct').value);if(!p)return;let out=[['Date','Product','Opening','Additions','Available','Closing','Sold','Unit Price','Sales']];historyRows(p.id).forEach(x=>out.push([fd(x.d),p.name,x.r.opening,x.r.added,x.z.available,x.z.closing,x.z.sold,x.r.price,x.z.sales]));dl('history-'+p.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.csv',csv(out))});
  $('generateReportBtn').addEventListener('click',custom);$('reportFrom').addEventListener('change',custom);$('reportTo').addEventListener('change',custom);$('analyticsRange').addEventListener('change',analytics);$('refreshCompaniesBtn')?.addEventListener('click',loadCompanies);$('companiesNavBtn')?.addEventListener('click',loadCompanies);
$('exportCustomBtn').addEventListener('click',()=>{let a=$('reportFrom').value,b=$('reportTo').value,out=[['Date','Category','Product','Opening','Additions','Available','Closing','Sold','Unit Price','Sales']];dateList(a,b).forEach(d=>(days[d]?.rows||[]).forEach(r=>{let z=calc(r);out.push([fd(d),r.category,r.name,r.opening,r.added,z.available,z.closing,z.sold,r.price,z.sales])}));dl('delite-cravings-report.csv',csv(out))});
$('exportAllBtn').addEventListener('click',()=>{let out=[['Date','Category','Product','Opening','Additions','Available','Closing','Sold','Unit Price','Sales']];Object.values(days).filter(d=>d&&d.date).sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(d=>(d.rows||[]).forEach(r=>{let z=calc(r);out.push([fd(d.date),r.category,r.name,r.opening,r.added,z.available,z.closing,z.sold,r.price,z.sales])}));dl('delite-cravings-all-reports.csv',csv(out))});
$('importBtn').addEventListener('click',importX);$('downloadTemplateBtn').addEventListener('click',()=>dl('delite-cravings-stock-template.csv',csv([['Category','Product','SKU','Unit Price','Opening Stock'],['Drinks','Coke 50cl','DR-001',500,20],['Snacks','Meat Pie','SN-001',700,20],['Bread','Medium Bread','BR-001',1000,15]])));
$('logoutBtn').addEventListener('click',async()=>{const btn=$('logoutBtn');btn.disabled=true;btn.textContent='Saving…';try{clearTimeout(saveTimer);flush();if(window.DelCravingsCloudSync){const ok=await window.DelCravingsCloudSync();if(!ok)throw new Error('Cloud save was not confirmed');}sessionStorage.removeItem('dc_logged_in');Object.keys(localStorage).filter(k=>/^(dc_|delite_)/.test(k)).forEach(k=>localStorage.removeItem(k));location.reload()}catch(e){btn.disabled=false;btn.textContent='Logout';status('Cloud save failed — still signed in','error');toast('Could not confirm cloud save. Please check your connection and try Logout again.');console.error(e)}});
$('saveSettingsBtn').addEventListener('click',async()=>{
  const u=$('newUser').value.trim(),p=$('newPin').value.trim(),confirmPin=$('confirmPin').value.trim();
  if(!u||!p)return $('settingsMessage').textContent='Username and PIN are required.';
  if(p.length<8||p.length>128)return $('settingsMessage').textContent='Password must be 8–128 characters.';
  if(p!==confirmPin)return $('settingsMessage').textContent='Password confirmation does not match.';
  const old=auth(),btn=$('saveSettingsBtn');
  btn.disabled=true;btn.textContent='Updating…';$('settingsMessage').textContent='Updating cloud login…';
  try{
    const res=await fetch(CLOUD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'changeAuth',username:old.username,pin:old.pin,newUsername:u,newPin:p}),cache:'no-store'});
    const out=await res.json().catch(()=>({}));
    if(!res.ok||!out.ok)throw new Error(out.error||'Cloud login update failed.');
    if(!write(S.a,{username:u.toLowerCase(),pin:p}))throw new Error('Could not save settings in this browser.');
    $('newPin').value='';$('confirmPin').value='';$('userDisplay').textContent='Signed in: '+u;
    $('settingsMessage').textContent='Login settings updated for this browser and cloud account.';
    toast('Login settings updated');
  }catch(e){
    $('settingsMessage').textContent=e.message||'Could not update login settings.';
    status('Login settings were not changed','error');console.error('Login settings update failed:',e);
  }finally{btn.disabled=false;btn.textContent='Save Login Settings'}
});
$('resetDataBtn').addEventListener('click',()=>{if(!confirm('Reset all products and saved reports? This cannot be undone. Export CSV first if you need a backup.'))return;clearTimeout(saveTimer);dirty={d:false,p:false};products=[];days={};ui.edit=null;saveUI();write(S.p,products);write(S.d,days);status('All changes saved','saved');prod();sales();reports();analytics();toast('Data reset')});
let a=auth();showAccount();
setTimeout(async()=>{await cloudPull()},250);
$('newUser').value=a.username;prod();sales();reports();analytics();if(ui.tab&&ui.tab!=='sales')tab(ui.tab);status('All changes saved','saved');
}
function dmy(){let p=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');document.querySelectorAll('input[type="date"]').forEach(i=>{if(i.dataset.dmy)return;i.dataset.dmy='1';let w=document.createElement('span'),t=document.createElement('span');w.className='dmy';t.className='dmy-text';t.setAttribute('aria-hidden','true');i.before(w);w.append(i,t);let up=()=>{let v=p.get.call(i);t.textContent=v?fd(v):'dd/mm/yyyy';t.classList.toggle('empty',!v)};Object.defineProperty(i,'value',{configurable:true,get(){return p.get.call(this)},set(v){p.set.call(this,v);up()}});i.addEventListener('input',up);i.addEventListener('change',up);up()})}
function boot(){dmy();if(sessionStorage.getItem('dc_logged_in')==='1'){$('loginScreen').classList.add('hidden');$('app').classList.remove('hidden');bind()}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
