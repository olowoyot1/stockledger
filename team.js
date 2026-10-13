(function(){
'use strict';
const $=id=>document.getElementById(id),AK='delite_cravings_auth_v2',naira=n=>'₦'+Number(n||0).toLocaleString('en-NG'),
esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function call(action,extra){
  const a=JSON.parse(localStorage.getItem(AK)||'{}');
  const r=await fetch('/api/cloud',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,username:a.username,pin:a.pin,...extra}),cache:'no-store'});
  const o=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(o.error||'Request failed');
  return o;
}
function render(o){
  const c=o.account||{};
  try{localStorage.setItem('dc_account',JSON.stringify(c))}catch{}
  $('billSummary').textContent=c.users+(c.users===1?' user':' users')+' × '+naira(c.pricePerUser)+' = '+naira(c.monthlyAmount)+' per month'+(c.plan==='trial'&&c.canWrite?' (free during your trial)':'');
  $('teamList').innerHTML=(o.users||[]).map(u=>'<div class="team-row"><span>'+esc(u.username)+'</span><button class="btn btn-light" data-rm="'+esc(u.id)+'" type="button">Remove</button></div>').join('')||'<p class="muted">No staff users yet — you are the only user.</p>';
}
async function load(){
  if(!$('teamPanel')||sessionStorage.getItem('dc_logged_in')!=='1')return;
  let c={};try{c=JSON.parse(localStorage.getItem('dc_account')||'{}')}catch{}
  if(c.role!=='owner')return;
  $('teamPanel').classList.remove('hidden');
  try{render(await call('listUsers'))}catch(e){$('teamMsg').textContent=e.message}
}
$('addUserBtn').addEventListener('click',async()=>{
  const b=$('addUserBtn');b.disabled=true;$('teamMsg').textContent='';
  try{render(await call('addUser',{newUsername:$('tuName').value,newPin:$('tuPin').value}));$('tuName').value='';$('tuPin').value='';$('teamMsg').textContent='User added.'}
  catch(e){$('teamMsg').textContent=e.message}finally{b.disabled=false}
});
$('teamList').addEventListener('click',async e=>{
  const id=e.target.dataset?.rm;if(!id||!confirm('Remove this user? They will no longer be able to sign in.'))return;
  try{render(await call('removeUser',{userId:id}))}catch(err){$('teamMsg').textContent=err.message}
});
load();
})();
