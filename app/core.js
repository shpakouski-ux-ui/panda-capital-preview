/* Panda MVP v2 prototype - core: state, icons, navigation, sheets, toasts, keypad */
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- icons (stroke, 24 grid) ---------- */
const P={
  back:'<path d="M15 18l-6-6 6-6"/>',chev:'<path d="M9 18l6-6-6-6"/>',down:'<path d="M6 9l6 6 6-6"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  dep:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v8.5M8.5 12.5L12 16l3.5-3.5"/>',wd:'<circle cx="12" cy="12" r="9"/><path d="M7.5 12h8.5M12.5 8.5L16 12l-3.5 3.5"/>',
  tr:'<path d="M4 9h15M15 5l4 4-4 4M20 15H5M9 11l-4 4 4 4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pie:'<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',user:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18.5a6.5 6.5 0 0 1 11 0"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  checkc:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/>',share:'<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  scan:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16"/>',
  paste:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h4"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  idcard:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0M14.5 10h4M14.5 13.5h3"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8M12 17.2v.3"/>',doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.2"/>',alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V13M12 16.3v.2"/>',
  face:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5v1M15 9.5v1M12 9.5V13h-1M9.5 15.5a3.5 3.5 0 0 0 5 0"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2.5 2.5M14 9l2 2"/>',phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  laptop:'<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',tablet:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/>',send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  ext:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',hist:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',moon:'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  wallet:'<path d="M4 7a2 2 0 0 1 2-2h11v4"/><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M16 13.5h2"/>',del:'<path d="M9 5h11v14H9l-6-7z"/><path d="M12 9.5l5 5M17 9.5l-5 5"/>',
  sliders:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',swap:'<path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4"/>',
  out:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>'
};
const ic=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||''}</svg>`;

/* ---------- data ---------- */
const COINS={
  USDT:{name:'Tether',color:'#26a17b',price:1,dec:2,nets:['TRC20','ERC20','SOL','TON']},
  BTC:{name:'Bitcoin',color:'#f7931a',price:67412.4,dec:4,nets:['BTC']},
  ETH:{name:'Ethereum',color:'#627eea',price:3284.15,dec:4,nets:['ERC20']},
  SOL:{name:'Solana',color:'#9945ff',price:148.62,dec:4,nets:['SOL']},
  TON:{name:'Toncoin',color:'#0098ea',price:5.91,dec:4,nets:['TON']},
};
const NETS={
  TRC20:{name:'TRON (TRC20)',short:'TRC20',time:'~2 min',conf:20,fee:{USDT:1},min:{USDT:10},re:/^T[1-9A-HJ-NP-Za-km-z]{33}$/,sample:'TXr9Lm4kP2vQ8sWn5yZbC7dE3fG6haZ8f2LmQ8'.slice(0,34)},
  ERC20:{name:'Ethereum (ERC20)',short:'ERC20',time:'~5 min',conf:12,fee:{USDT:4.5,ETH:0.0015},min:{USDT:20,ETH:0.01},re:/^0x[0-9a-fA-F]{40}$/,sample:'0x4b7Fe21c09A3d5E8b1C2f4a6D8e0B3c5A7f991aC'},
  SOL:{name:'Solana',short:'SOL',time:'~1 min',conf:1,fee:{USDT:0.5,SOL:0.01},min:{USDT:5,SOL:0.1},re:/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,sample:'7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'},
  TON:{name:'TON',short:'TON',time:'~1 min',conf:1,fee:{USDT:0.3,TON:0.01},min:{USDT:5,TON:1},re:/^(UQ|EQ)[A-Za-z0-9_-]{46}$/,sample:'UQBkZ3h8Qw9Lr2Tx5Vn7Pc1Yd4Mf6Gj0Hs8Ka3Ub5We97nP2'},
  BTC:{name:'Bitcoin',short:'BTC',time:'~30 min',conf:2,fee:{BTC:0.0002},min:{BTC:0.001},re:/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,sample:'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx8f3k'},
};
const DEPOSIT_ADDR={TRC20:'TQ7uP3wXn5Lr8Yk2Vb9Hs4Mf6Jd1Ca3kX9m2Rb4a',ERC20:'0x91Ad3fE7b2C4d6E8f0A1b3C5d7E9f1A3b5C7c4E2',SOL:'5yNq3RzVh8Kc2Ld9Mx4Pw7Bt1Fs6Gj3Hk8Ue2Wf5Ra',TON:'UQAx7Lm2Kp9Qw4Er8Ty1Ui5Op3As6Df0Gh7Jk2Lz8Xc4V',BTC:'bc1q9h7garjjlwq8k4u5x2v0c3n6m8d1f4s7a2wp9e'};
const USERS=[
  {name:'Maria K.',email:'maria.k@mail.com',phone:'+491512345678',uid:'51830266'},
  {name:'Jonas W.',email:'jonas.w@mail.com',phone:'+491701112233',uid:'62019455'},
];
const RATE={USD:1,EUR:0.92};
const DAY=86400000;

function defaults(){
  const now=Date.now();
  return {
    v:3, loggedIn:false, firstLogin:true,
    user:{name:'Alex Morgan',email:'alex@mail.com',phone:'+49 151 9876 2291',uid:'48201937',dob:'14.03.1994',country:'Germany',address:'Torstraße 12, Berlin'},
    bal:{USDT:1250,BTC:0.0258,ETH:0.312,SOL:1.3,TON:1.9},
    set:{faceId:true,hideSmall:false,hideBal:false,currency:'USD',lang:'English',theme:'Dark'},
    notif:{money:true,security:true,news:false},
    sec:{twoFA:false,password:'Panda2026'},
    passkeys:[{name:'iPhone 15',added:'12 Oct'},{name:'MacBook Air',added:'20 Oct'}],
    devices:[{id:'d1',name:'iPhone 15',where:'Berlin, Germany',when:'now',me:true,kind:'phone'},{id:'d2',name:'Chrome on macOS',where:'Berlin, Germany',when:'2 h ago',kind:'laptop'},{id:'d3',name:'iPad Air',where:'Hamburg, Germany',when:'6 days ago',kind:'tablet'}],
    wl:[
      {id:'a1',name:'My Ledger',addr:'TXr9Lm4kP2vQ8sWn5yZbC7dE3fG6hf2LmQ8',net:'TRC20',from:now-20*DAY},
      {id:'a2',name:'Kraken account',addr:'0x4b7Fe21c09A3d5E8b1C2f4a6D8e0B3c5A7f991aC',net:'ERC20',from:now-40*DAY},
      {id:'a3',name:'Trust Wallet',addr:'UQBkZ3h8Qw9Lr2Tx5Vn7Pc1Yd4Mf6Gj0Hs8Ka3Ub5We97nP2',net:'TON',from:now+20*3600000},
    ],
    tx:[
      {id:'t1',type:'dep',coin:'USDT',amt:500,net:'TRC20',from:'TJk2…8Pq1',hash:'7f3a…c91e',time:now-2*3600000,st:'done'},
      {id:'t2',type:'tout',coin:'USDT',amt:50,to:'Maria K.',uid:'51830266',time:now-2.4*3600000,st:'done'},
      {id:'t3',type:'dep',coin:'BTC',amt:0.002967,net:'BTC',from:'bc1q…7d2a',hash:'a12f…9b0c',time:now-4*3600000,st:'done'},
      {id:'t4',type:'wd',coin:'USDT',amt:300,net:'TRC20',to:'TXr9…f2LmQ8',toName:'My Ledger',fee:1,hash:'a81c…44d0',time:now-DAY-3*3600000,st:'done'},
      {id:'t5',type:'tin',coin:'SOL',amt:1.2,from:'Jonas W.',uid:'62019455',time:now-DAY-6*3600000,st:'done'},
    ],
  };
}
const KEY='panda.proto.v3';
let ST=(()=>{ try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.v===3) return s; }catch(e){} return defaults(); })();
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(ST)); }catch(e){} }

/* ---------- format ---------- */
const nf=(n,d=2,min)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:min===undefined?d:min,maximumFractionDigits:d});
const fiat=usd=>nf(usd*RATE[ST.set.currency],2)+' '+ST.set.currency;
const camt=(c,n)=>nf(n,COINS[c].dec>2?6:2,c==='USDT'?2:COINS[c].dec)+' '+c;
const usd=(c,n)=>n*COINS[c].price;
const short=a=>a.length>14?a.slice(0,4)+'…'+a.slice(-6):a;
const total=()=>Object.keys(COINS).reduce((s,c)=>s+usd(c,ST.bal[c]||0),0);
const mask=s=>ST.set.hideBal?'••••••':s;
function when(t){ const d=new Date(t), n=new Date(); const hm=d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  const day=Math.floor((new Date(n.toDateString())-new Date(d.toDateString()))/DAY);
  return {hm, day:day<=0?'Today':day===1?'Yesterday':d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}), full:d.toLocaleDateString('en-GB')+' '+hm}; }
const emailMask=e=>e[0]+'•••@'+e.split('@')[1];
const coinBadge=(c,cls='')=>`<div class="coin ${cls}" style="background:${COINS[c].color}">${c[0]}</div>`;

/* ---------- toast / faceid ---------- */
let toastT;
function toast(msg,{icon='checkc',sub='',ms=2200,onTap}={}){
  const box=$('#toast'); box.innerHTML=`<div class="toast">${icon?ic(icon,'s'):''}<div class="grow">${esc(msg)}${sub?`<small>${esc(sub)}</small>`:''}</div></div>`;
  const t=box.firstChild; if(onTap) t.onclick=()=>{ t.classList.remove('in'); onTap(); };
  t.getBoundingClientRect(); t.classList.add('in');
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('in'),ms);
}
async function faceId(label='Face ID'){
  const f=$('#faceid'); f.innerHTML=`<div class="fx scan">${ic('face')}<span>${label}</span></div>`; f.classList.add('on');
  await wait(900); f.firstChild.className='fx done'; f.firstChild.innerHTML=`${ic('checkc')}<span>Verified</span>`;
  await wait(550); f.classList.remove('on'); await wait(250); f.innerHTML='';
}

/* ---------- navigation ---------- */
const SCREENS={};               // name -> (params)=>def
const NAV={tab:'wallet',locked:false,stacks:{auth:[],wallet:[],history:[],account:[]}};
let phone, layerEl, tabbarEl, busy=false;
const stack=()=>NAV.stacks[(ST.loggedIn&&!NAV.locked)?NAV.tab:'auth'];
const topE=()=>stack()[stack().length-1];

function buildScreen(entry){
  const def=SCREENS[entry.name](entry.params||{},entry);
  entry.def=def;
  const el=entry.el||document.createElement('div'); entry.el=el;
  el.className='screen'+(def.cta?' has-cta':'')+(def.tab?' has-tab':'')+(def.keypad?' has-keypad':'')+(def.cls?' '+def.cls:'');
  const back=def.back!==false&&!def.tab;
  el.innerHTML=`${def.bg||''}<header class="nav${def.large?' large':''}${def.solid?' solid':''}"><div class="nav-in">
      <div class="nav-side">${back?`<button class="nav-btn" data-back>${ic('back')}</button>`:''}${def.left||''}</div>
      <div class="nav-title">${esc(def.title||'')}</div><div class="nav-side r">${def.right||''}</div></div></header>
    <main class="content">${def.large?`<div class="large-title">${esc(def.title)}</div>`:''}${def.body()}</main>
    ${def.cta?`<footer class="cta">${def.cta()}</footer>`:''}${def.keypad?`<footer class="cta static" style="padding:0">${keypadHTML()}</footer>`:''}<div class="shade"></div>`;
  const content=$('.content',el), nav=$('.nav',el);
  if(def.keypad){ content.style.paddingBottom='8px'; }
  content.addEventListener('scroll',()=>{ nav.classList.toggle('solid',def.solid||content.scrollTop>(def.large?34:2)); },{passive:true});
  $$('[data-back]',el).forEach(b=>b.onclick=()=>pop());
  if(def.mount) def.mount(el,entry);
  return el;
}
function refresh(entry=topE()){ if(!entry||!entry.el) return; const c=$('.content',entry.el); const y=c?c.scrollTop:0; buildScreen(entry); const c2=$('.content',entry.el); if(c2){ c2.scrollTop=y; $('.nav',entry.el).classList.toggle('solid',entry.def.solid||y>(entry.def.large?34:2)); } }
function refreshAll(){ Object.values(NAV.stacks).forEach(s=>s.forEach(e=>{ if(e.el&&e.el.isConnected) refresh(e); })); }
function updateTabbar(){
  const t=topE(); const show=ST.loggedIn&&!NAV.locked&&t&&t.def&&t.def.tab;
  tabbarEl.classList.toggle('off',!show);
  $$('.tab',tabbarEl).forEach(b=>b.classList.toggle('on',b.dataset.tab===NAV.tab));
}
function anim(el,kf,ms=420){ const a=el.animate(kf,{duration:ms,easing:'cubic-bezier(.32,.72,0,1)',fill:'forwards'}); return Promise.race([a.finished.catch(()=>{}),wait(ms+120).then(()=>{ try{a.finish();}catch(e){} })]); }
async function push(name,params={},opts={}){
  if(busy) return; busy=true;
  const s=stack(), prev=s[s.length-1]; const entry={name,params}; s.push(entry);
  const el=buildScreen(entry); layerEl.appendChild(el);
  updateTabbar(); closeAllSheets(true);
  if(prev&&!opts.instant){
    const sh=$('.shade',prev.el);
    await Promise.all([anim(el,[{transform:'translateX(100%)'},{transform:'none'}]),anim(prev.el,[{transform:'none'},{transform:'translateX(-30%)'}]),anim(sh,[{opacity:0},{opacity:.35}])]);
  }
  if(prev){ prev.el.getAnimations().forEach(a=>a.cancel()); $('.shade',prev.el).getAnimations().forEach(a=>a.cancel()); prev.el.classList.add('hidden'); }
  el.getAnimations().forEach(a=>a.cancel());
  busy=false;
  if(entry.def.enter) entry.def.enter(el,entry);
}
async function pop(n=1){
  const s=stack(); if(s.length<=1||busy) return; busy=true;
  const cur=s[s.length-1]; const target=s[Math.max(0,s.length-1-n)];
  target.el.classList.remove('hidden'); if(target.def.onShow) target.def.onShow(target); else refresh(target);
  tabbarEl.classList.toggle('off',!(ST.loggedIn&&!NAV.locked&&target.def&&target.def.tab&&s.indexOf(target)===0));
  const sh=$('.shade',target.el);
  await Promise.all([anim(cur.el,[{transform:getComputedStyle(cur.el).transform==='none'?'none':getComputedStyle(cur.el).transform},{transform:'translateX(100%)'}],360),
    anim(target.el,[{transform:getComputedStyle(target.el).transform==='none'?'translateX(-30%)':getComputedStyle(target.el).transform},{transform:'none'}],360),
    anim(sh,[{opacity:.35},{opacity:0}],360)]);
  s.splice(s.indexOf(target)+1).forEach(e=>{ if(e.def&&e.def.leave) e.def.leave(); e.el.remove(); });
  target.el.getAnimations().forEach(a=>a.cancel()); sh.getAnimations().forEach(a=>a.cancel());
  busy=false; updateTabbar();
}
function popTo(name){ const s=stack(); const i=s.map(e=>e.name).lastIndexOf(name); if(i>=0) return pop(s.length-1-i); }
async function replaceTop(name,params={}){ // forward-looking replace (success screens)
  const s=stack(); const old=s[s.length-1]; await push(name,params); const i=s.indexOf(old); if(i>=0){ s.splice(i,1); if(old.def.leave) old.def.leave(); old.el.remove(); }
}
function resetTo(name,params={},{flow}={}){ // clear current stack to root then optionally push
  const s=stack(); while(s.length>1){ const e=s.pop(); if(e.def.leave) e.def.leave(); e.el.remove(); }
  const r=s[0]; r.el.classList.remove('hidden'); r.el.getAnimations().forEach(a=>a.cancel()); refresh(r); updateTabbar();
  if(name&&name!==r.name) push(name,params);
}
function finishFlow(toast_){ // back to tab root
  const s=stack(); const cur=s[s.length-1]; const root=s[0];
  root.el.classList.remove('hidden'); refresh(root); layerEl.appendChild(cur.el); tabbarEl.classList.remove('off');
  anim(cur.el,[{transform:'none'},{transform:'translateX(100%)'}],360).then(()=>{ while(s.length>1){ const e=s.pop(); if(e.def.leave) e.def.leave(); e.el.remove(); } updateTabbar(); });
  anim(root.el,[{transform:'translateX(-30%)'},{transform:'none'}],360).then(()=>root.el.getAnimations().forEach(a=>a.cancel()));
  if(toast_) toast(toast_);
}
function showStack(){ // render current stack after tab switch / login
  $$('.screen',layerEl).forEach(e=>e.classList.add('hidden'));
  const s=stack(); s.forEach((e,i)=>{ if(!e.el||!e.el.isConnected){ buildScreen(e); layerEl.appendChild(e.el);} e.el.classList.toggle('hidden',i!==s.length-1); });
  if(topE()) refresh(topE());
  updateTabbar();
}
function switchTab(t){
  if(NAV.tab===t){ if(stack().length>1) resetTo(); else { const c=$('.content',topE().el); c&&c.scrollTo({top:0,behavior:'smooth'}); } return; }
  NAV.tab=t; if(!stack().length) stack().push({name:t}); showStack();
}
function startApp(){ // after login
  ST.loggedIn=true; NAV.locked=false; save();
  NAV.stacks.auth.forEach(e=>e.el&&e.el.remove()); NAV.stacks.auth=[];
  NAV.stacks={auth:[],wallet:[{name:'wallet'}],history:[{name:'history'}],account:[{name:'account'}]}; NAV.tab='wallet';
  showStack();
}
function logout(){
  ST.loggedIn=false; NAV.locked=false; closeAllSheets(true); save();
  Object.values(NAV.stacks).forEach(s=>s.forEach(e=>e.el&&e.el.remove()));
  NAV.stacks={auth:[{name:'login'}],wallet:[],history:[],account:[]};
  showStack();
}

/* edge swipe back */
function edgeSwipe(){
  let sx=0,sy=0,dx=0,on=false,cur,prev,t0;
  phone.addEventListener('touchstart',e=>{
    if(busy||$('.sheet.open')) return; const t=e.touches[0]; const r=phone.getBoundingClientRect();
    if(t.clientX-r.left>24) return; const s=stack(); if(s.length<2) return;
    cur=s[s.length-1]; prev=s[s.length-2]; if(cur.def.noSwipe) return;
    on=true; sx=t.clientX; sy=t.clientY; dx=0; t0=Date.now(); prev.el.classList.remove('hidden');
  },{passive:true});
  phone.addEventListener('touchmove',e=>{
    if(!on) return; const t=e.touches[0]; dx=Math.max(0,t.clientX-sx);
    if(dx<8&&Math.abs(t.clientY-sy)>12){ on=false; prev.el.classList.add('hidden'); return; }
    const w=phone.clientWidth, k=dx/w;
    cur.el.style.transform=`translateX(${dx}px)`; prev.el.style.transform=`translateX(${-30+30*k}%)`; $('.shade',prev.el).style.opacity=.35*(1-k);
  },{passive:true});
  phone.addEventListener('touchend',async()=>{
    if(!on) return; on=false; const w=phone.clientWidth; const v=dx/(Date.now()-t0);
    const go=dx>w*.35||v>.5;
    if(go){ cur.el.style.transform=''; prev.el.style.transform=''; $('.shade',prev.el).style.opacity='';
      busy=true; const s=stack();
      if(prev.def.onShow) prev.def.onShow(prev); else refresh(prev);
      await Promise.all([anim(cur.el,[{transform:`translateX(${dx}px)`},{transform:'translateX(100%)'}],260),anim(prev.el,[{transform:`translateX(${-30+30*dx/w}%)`},{transform:'none'}],260)]);
      s.splice(s.indexOf(prev)+1).forEach(e=>{ if(e.def.leave) e.def.leave(); e.el.remove(); });
      prev.el.getAnimations().forEach(a=>a.cancel()); busy=false; updateTabbar();
    } else {
      await Promise.all([anim(cur.el,[{transform:`translateX(${dx}px)`},{transform:'none'}],260),anim(prev.el,[{transform:`translateX(${-30+30*dx/w}%)`},{transform:'translateX(-30%)'}],260)]);
      cur.el.style.transform=''; prev.el.style.transform=''; $('.shade',prev.el).style.opacity=''; cur.el.getAnimations().forEach(a=>a.cancel()); prev.el.getAnimations().forEach(a=>a.cancel()); prev.el.classList.add('hidden');
    }
  });
}

/* ---------- sheets ---------- */
const SHEETS=[];
function sheet({title='',body='',mount,flush=false,onClose,noClose=false}){
  const w=document.createElement('div'); w.className='sheet-wrap';
  w.innerHTML=`<div class="dim"></div><div class="sheet"><div class="grab"></div>${title?`<div class="sheet-h"><b>${esc(title)}</b>${noClose?'':`<button class="x" data-x>${ic('x','s')}</button>`}</div>`:''}<div class="sheet-b${flush?' flush':''}">${body}</div></div>`;
  phone.appendChild(w); const sh=$('.sheet',w), dim=$('.dim',w);
  const api={el:sh,wrap:w,closed:false,close:(noCb)=>{ if(api.closed) return; api.closed=true; sh.style.transition=''; sh.style.transform=''; sh.classList.remove('open'); dim.style.opacity=0; dim.style.pointerEvents='none'; setTimeout(()=>w.remove(),450); SHEETS.splice(SHEETS.indexOf(api),1); if(onClose&&!noCb) onClose(); },
    set:(html)=>{ $('.sheet-b',w).innerHTML=html; }};
  SHEETS.push(api);
  sh.getBoundingClientRect(); sh.classList.add('open'); dim.style.opacity=1;
  dim.onclick=()=>{ if(!noClose) api.close(); }; $$('[data-x]',w).forEach(b=>b.onclick=()=>api.close());
  // drag down to dismiss
  let y0=null,dy=0,t0=0;
  const start=e=>{ const b=$('.sheet-b',w); if(e.target.closest('.sheet-b')&&b.scrollTop>0) return; y0=e.touches[0].clientY; dy=0; t0=Date.now(); sh.style.transition='none'; };
  sh.addEventListener('touchstart',start,{passive:true});
  sh.addEventListener('touchmove',e=>{ if(y0===null) return; dy=Math.max(0,e.touches[0].clientY-y0); if(dy>0){ sh.style.transform=`translateY(${dy}px)`; dim.style.opacity=Math.max(0,1-dy/400); } },{passive:true});
  sh.addEventListener('touchend',()=>{ if(y0===null) return; y0=null; sh.style.transition=''; const v=dy/(Date.now()-t0);
    if(!noClose&&(dy>120||v>.6)){ sh.style.transform=''; api.close(); } else { sh.style.transform=''; dim.style.opacity=1; } });
  if(mount) mount(sh,api);
  return api;
}
function closeAllSheets(silent){ [...SHEETS].forEach(s=>s.close(silent)); }
function confirmSheet({title,text,ok='Confirm',danger=false,cancel='Cancel'}){
  return new Promise(res=>{ const s=sheet({title:'',body:`<div class="center" style="padding:6px 8px 8px"><div style="font-size:18px;font-weight:600;line-height:24px">${esc(title)}</div><p class="cap mt8">${esc(text)}</p></div>
    <div style="display:flex;gap:10px;margin-top:16px"><button class="btn sec" data-c>${esc(cancel)}</button><button class="btn ${danger?'danger':''}" data-o>${esc(ok)}</button></div>`,
    onClose:()=>res(false), mount:(el,api)=>{ $('[data-c]',el).onclick=()=>api.close(); $('[data-o]',el).onclick=()=>{ api.close(true); res(true); }; } }); });
}

/* ---------- code entry (boxes + keypad) ---------- */
function keypadHTML(){
  const L=['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'];
  let h='<div class="keypad">'; for(let i=1;i<=9;i++) h+=`<button class="key" data-k="${i}"><b>${i}</b>${L[i-1]?`<small>${L[i-1]}</small>`:''}</button>`;
  return h+`<span class="key blank"></span><button class="key" data-k="0"><b>0</b></button><button class="key fn" data-k="del">${ic('del')}</button></div>`;
}
const codeBoxes=(n=6)=>`<div class="code">${'<i></i>'.repeat(n)}</div>`;
function codeInput(root,{n=6,onDone,check}={}){
  let v=''; const box=$('.code',root); const cells=$$('i',box);
  const draw=()=>{ cells.forEach((c,i)=>{ c.textContent=v[i]||''; c.classList.toggle('cur',i===v.length); }); };
  const press=async k=>{ if(box.classList.contains('ok')) return; box.classList.remove('err');
    if(k==='del') v=v.slice(0,-1); else if(v.length<n) v+=k; draw();
    if(v.length===n){ const ok=check?check(v):true; await wait(180);
      if(ok){ box.classList.add('ok'); cells.forEach(c=>c.classList.remove('cur')); await wait(250); onDone&&onDone(v); }
      else { box.classList.add('err'); await wait(400); v=''; draw(); } } };
  $$('[data-k]',root.closest('.screen')||root).forEach(b=>b.addEventListener('click',()=>press(b.dataset.k)));
  draw(); return {reset:()=>{ v=''; box.classList.remove('ok','err'); draw(); }};
}
/* security check sheet with keypad, resolves true when passed */
function securityCheck({rows=''}={}){
  return new Promise(res=>{
    const by=ST.sec.twoFA?'Enter the 6-digit code from your authenticator app':`Enter the 6-digit code we sent to ${emailMask(ST.user.email)}`;
    sheet({title:'Security check',flush:true,body:`<div class="pad"><p class="cap">${by}</p>${codeBoxes()}${rows?`<div class="mb16">${rows}</div>`:''}<p class="cap t3 mb16">Demo: any 6 digits</p></div>${keypadHTML()}`,
      onClose:()=>res(false),
      mount:(el,api)=>codeInput(el,{onDone:()=>{ api.close(true); res(true); }})});
  });
}

/* ---------- viewport / keyboard ---------- */
function fitViewport(){
  const vv=window.visualViewport; const app=$('#app');
  const f=()=>{ if(document.body.classList.contains('desk')) return; const h=vv?vv.height:innerHeight; app.style.height=h+'px'; app.style.transform=vv&&vv.offsetTop?`translateY(${vv.offsetTop}px)`:''; };
  if(vv){ vv.addEventListener('resize',f); vv.addEventListener('scroll',f); } addEventListener('resize',f); f();
  document.addEventListener('focusout',()=>setTimeout(()=>{ window.scrollTo(0,0); f(); },50));
}
