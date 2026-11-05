/* Panda MVP v2 prototype - screens */
'use strict';
const S=SCREENS;
const row=(o)=>`<${o.tag||'button'} class="row${o.cls?' '+o.cls:''}"${o.attr||''}>${o.icon?`<span class="ico">${ic(o.icon)}</span>`:''}${o.left||''}<div class="grow"><div class="t">${o.t}</div>${o.s?`<div class="s">${o.s}</div>`:''}</div>${o.v!==undefined?`<div class="v">${o.v}</div>`:''}${o.right||''}${o.chev===false?'':`<span class="chev">${ic('chev','s')}</span>`}</${o.tag||'button'}>`;
const tog=(on,attr='')=>`<span class="tog${on?' on':''}"${attr}></span>`;
const field=({id,label,ph='',val='',type='text',mode,right='',err='',cls=''})=>`<div class="fgroup">${label?`<div class="lbl">${label}</div>`:''}<label class="field${err?' err':''} ${cls}"><input id="${id}" type="${type}" placeholder="${esc(ph)}" value="${esc(val)}"${mode?` inputmode="${mode}"`:''} autocomplete="off" autocapitalize="off" spellcheck="false">${right}</label><div class="ferr" data-err="${id}">${err?`<div class="field-err">${ic('alert','xs')}${err}</div>`:''}</div></div>`;
const setErr=(el,id,msg)=>{ const f=$('#'+id,el); f.closest('.field').classList.toggle('err',!!msg); $(`[data-err="${id}"]`,el).innerHTML=msg?`<div class="field-err">${ic('alert','xs')}${msg}</div>`:''; };
const glow='<div class="glow"></div>';
const stateHTML=(icon,title,text,red)=>`<div class="state fade-in"><div class="badge${red?' red':''}">${ic(icon,'xl')}</div><h2>${title}</h2><p>${text}</p></div>`;
const btnBusy=async(b,fn,ms=650)=>{ const h=b.innerHTML; b.innerHTML='<span class="spin"></span>'; b.style.pointerEvents='none'; await wait(ms); b.innerHTML=h; b.style.pointerEvents=''; await fn(); };
const onIn=(el,id,fn)=>{ const i=$('#'+id,el); i.addEventListener('input',()=>fn(i.value,i)); return i; };
const eye=id=>`<button class="t2" data-eye="${id}" type="button">${ic('eyeoff','s')}</button>`;
function wireEyes(el){ $$('[data-eye]',el).forEach(b=>b.onclick=e=>{ e.preventDefault(); const i=$('#'+b.dataset.eye,el); const show=i.type==='password'; i.type=show?'text':'password'; b.innerHTML=ic(show?'eye':'eyeoff','s'); }); }
let resendT; function resend(el){ let s=42; const r=$('[data-resend]',el); if(!r) return; clearInterval(resendT);
  const draw=()=>{ r.innerHTML=s>0?`Resend code in <b class="t1">0:${String(s).padStart(2,'0')}</b>`:`<button class="link" data-rs>Resend code</button>`; const b=$('[data-rs]',r); if(b) b.onclick=()=>{ toast('Code sent again'); s=42; draw(); }; };
  draw(); resendT=setInterval(()=>{ s--; if(s>=0) draw(); },1000); }

/* ============ AUTH ============ */
S.login=()=>({back:false,cta:()=>`<button class="btn ghost" id="pk">${ic('face','s')} Log in with passkey</button><button class="btn" id="go">Log in</button>`,
  body:()=>`<div class="pad" style="padding-top:20px"><div class="h1 mb16">Welcome back</div>
    ${field({id:'em',label:'Email or phone',ph:'Email or phone',val:ST.user.email,mode:'email'})}
    ${field({id:'pw',label:'Password',ph:'Password',val:'',type:'password',right:eye('pw')})}
    <button class="link" id="fg">Forgot password?</button>
    <div style="display:flex;align-items:center;gap:12px;margin:24px 0 16px" class="cap"><span class="hr" style="flex:1;margin:0"></span>or continue with<span class="hr" style="flex:1;margin:0"></span></div>
    <div style="display:flex;gap:10px"><button class="btn sec" id="ap"> Apple</button><button class="btn sec" id="gg">G&nbsp; Google</button></div>
    <p class="cap t3 center mt24">Demo: any email and a password of 6+ characters</p></div>`,
  mount(el){ wireEyes(el); const em=$('#em',el), pw=$('#pw',el);
    [em,pw].forEach(i=>i.addEventListener('input',()=>{ setErr(el,'pw',''); setErr(el,'em',''); }));
    pw.addEventListener('keydown',e=>{ if(e.key==='Enter') $('#go',el).click(); });
    $('#fg',el).onclick=()=>push('forgotEmail',{email:em.value});
    const passkey=async()=>{ await faceId('Passkey'); afterLogin(); };
    $('#pk',el).onclick=passkey; $('#ap',el).onclick=passkey; $('#gg',el).onclick=async()=>{ toast('Signed in with Google',{icon:'checkc'}); await wait(500); afterLogin(); };
    $('#go',el).onclick=e=>{ const b=e.currentTarget;
      if(!/@|^\+?\d{6,}/.test(em.value.trim())) return setErr(el,'em','Enter your email or phone');
      btnBusy(b,()=>{ if(pw.value.length<6) return setErr(el,'pw','Wrong email or password');
        if(ST.sec.twoFA) push('login2fa'); else if(ST.firstLogin) push('newDevice'); else afterLogin(); }); }; }});
function afterLogin(){ ST.firstLogin=false; NAV.locked=false; startApp(); }
S.login2fa=()=>({keypad:true,noSwipe:false,body:()=>`<div class="pad" style="padding-top:12px"><div class="h1">Two-factor<br>authentication</div><p class="sub mt8">Enter the code from your authenticator app</p>${codeBoxes()}<p class="cap" data-resend></p></div>`,
  mount(el){ resend(el); codeInput(el,{onDone:()=>{ if(ST.firstLogin) replaceTop('newDevice'); else afterLogin(); }}); }, leave(){ clearInterval(resendT); }});
S.newDevice=()=>({bg:glow,cta:()=>`<button class="btn ghost" id="rs">Resend link</button><button class="btn" id="om">Open mail app</button>`,
  body:()=>stateHTML('mail','Confirm it’s you',`This is a new device. We sent a confirmation link to ${emailMask(ST.user.email)}. Open it to continue.`),
  mount(el){ $('#rs',el).onclick=()=>toast('Link sent again',{icon:'mail'});
    $('#om',el).onclick=e=>btnBusy(e.currentTarget,async()=>{ toast('Device confirmed',{icon:'shield'}); await wait(400); afterLogin(); },1100); }});
S.forgotEmail=(p)=>({cta:()=>`<button class="btn" id="go">Send code</button>`,
  body:()=>`<div class="pad" style="padding-top:12px"><div class="h1">Reset password</div><p class="sub mt8 mb16">Enter the email or phone linked to your account</p>${field({id:'em',ph:'Email or phone',val:p.email||ST.user.email,mode:'email'})}</div>`,
  mount(el){ const em=$('#em',el), go=$('#go',el); const chk=()=>go.disabled=!/@.+\.|^\+?\d{6,}/.test(em.value.trim()); em.oninput=chk; chk();
    go.onclick=()=>btnBusy(go,()=>push('forgotCode',{email:em.value.trim()})); }});
S.forgotCode=(p)=>({keypad:true,body:()=>`<div class="pad" style="padding-top:12px"><div class="h1">Enter code</div><p class="sub mt8">We sent a 6-digit code to ${esc(p.email)}</p>${codeBoxes()}<p class="cap" data-resend></p></div>`,
  mount(el){ resend(el); codeInput(el,{onDone:()=>push('forgotNew')}); }, leave(){ clearInterval(resendT); }});
const pwChecks=v=>[[v.length>=8&&v.length<=32,'8-32 characters'],[/\d/.test(v),'At least one number'],[/[A-Z]/.test(v),'Upper and lower case letters']];
const checksHTML=v=>pwChecks(v).map(([ok,t])=>`<div class="cap" style="display:flex;gap:8px;align-items:center;margin:6px 0;color:${ok?'var(--lime)':'var(--t2)'}">${ic(ok?'checkc':'info','xs')}${t}</div>`).join('');
S.forgotNew=()=>({cta:()=>`<button class="btn" id="go" disabled>Save password</button>`,
  body:()=>`<div class="pad" style="padding-top:12px"><div class="h1 mb16">New password</div>${field({id:'p1',label:'New password',type:'password',right:eye('p1')})}${field({id:'p2',label:'Repeat password',type:'password',right:eye('p2')})}
    <div id="ck">${checksHTML('')}</div><div class="note mt16">${ic('info','s')}<span>For your safety, withdrawals are paused for 24 hours after a password change</span></div></div>`,
  mount(el){ wireEyes(el); const p1=$('#p1',el),p2=$('#p2',el),go=$('#go',el);
    const chk=()=>{ $('#ck',el).innerHTML=checksHTML(p1.value); const ok=pwChecks(p1.value).every(x=>x[0]); setErr(el,'p2',p2.value&&p2.value!==p1.value?'Passwords don’t match':''); go.disabled=!(ok&&p1.value===p2.value); };
    p1.oninput=chk; p2.oninput=chk; go.onclick=()=>btnBusy(go,()=>{ ST.sec.password=p1.value; save(); replaceTop('forgotDone'); }); }});
S.forgotDone=()=>({bg:glow,back:false,noSwipe:true,cta:()=>`<button class="btn" id="go">Log in</button>`,body:()=>stateHTML('checkc','Password updated','Log in with your new password.'),
  mount(el){ $('#go',el).onclick=()=>resetTo(); }});
S.appLock=()=>({bg:glow,back:false,noSwipe:true,cta:()=>`<button class="btn" id="fid">Unlock with Face ID</button><button class="btn sec" id="pw">Use password</button>`,
  body:()=>`<div class="state fade-in"><img src="img/panda.webp" alt="" width="110" height="110" style="margin-bottom:16px"><h2 style="margin-bottom:6px">Welcome back</h2><p>Unlock Panda to see your wallet</p></div>`,
  mount(el){ const un=async()=>{ await faceId(); NAV.locked=false; NAV.stacks.auth.forEach(e=>e.el&&e.el.remove()); NAV.stacks.auth=[]; showStack(); };
    $('#fid',el).onclick=un; $('#pw',el).onclick=()=>{ NAV.locked=false; logout(); };
    el._auto=setTimeout(()=>{ if(el.isConnected&&!$('#faceid').classList.contains('on')) un(); },700); },
  leave(){} });

/* ============ WALLET ============ */
const smallHidden=c=>ST.set.hideSmall&&usd(c,ST.bal[c])<15;
const coinRow=c=>row({left:coinBadge(c),t:`<b style="font-weight:600">${c}</b>`,s:COINS[c].name,chev:false,attr:` data-coin="${c}"`,
  right:`<div class="amt"><div class="a mono">${mask(nf(ST.bal[c],COINS[c].dec,c==='USDT'?2:COINS[c].dec))}</div><div class="b mono">${mask(fiat(usd(c,ST.bal[c])))}</div></div>`});
function pendingCard(){ const t=ST.tx.find(x=>x.st==='pending'); if(!t) return '';
  return `<div class="group"><button class="card row" data-tx="${t.id}" style="background:var(--lime-soft)"><span class="txi" style="background:rgba(199,255,0,.16);color:var(--lime)">${ic('dep')}</span><div class="grow"><div class="t">Deposit confirming</div><div class="s">${t.conf}/${t.need} confirmations · ${NETS[t.net].short}</div></div><div class="amt"><div class="a lime">+${camt(t.coin,t.amt)}</div></div></button></div>`; }
S.wallet=()=>({tab:true,large:true,title:'Wallet',right:`<button class="nav-btn" id="srch">${ic('search')}</button>`,
  body:()=>{ const tot=total(); const ch=tot*0.0149;
    if(tot<0.01) return `<div class="pad"><div class="bal-l">Total balance</div><div class="bal"><b>0.00</b><span>${ST.set.currency}</span></div></div>
      <div class="empty"><div class="badge">${ic('pie','l')}</div><b>Your wallet is empty</b><p>Deposit crypto from another wallet or exchange to get started</p><button class="btn sec sm mt16" data-go="depCoin">Deposit crypto</button></div>`;
    const list=Object.keys(COINS).filter(c=>ST.bal[c]>0&&!smallHidden(c));
    return `<div class="pad"><button class="bal-l" id="eye">Total balance ${ic(ST.set.hideBal?'eyeoff':'eye','xs')}</button>
      <div class="bal"><b class="mono">${mask(nf(tot*RATE[ST.set.currency]))}</b><span>${ST.set.currency}</span></div>
      <div class="cap mt8">Today <span class="lime">${mask('+'+fiat(ch)+' (+1.49%)')}</span></div></div>
      <div class="actions"><button class="act" data-go="depCoin"><i>${ic('dep')}</i>Deposit</button><button class="act" data-go="wdCoin"><i>${ic('wd')}</i>Withdraw</button><button class="act" data-go="trCoin"><i>${ic('tr')}</i>Transfer</button><button class="act" id="hist"><i>${ic('clock')}</i>History</button></div>
      ${pendingCard()}
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px 4px"><b style="font-size:17px">My coins</b><button class="cap" id="hs" style="display:flex;gap:8px;align-items:center"><span class="chk${ST.set.hideSmall?' on':''}">${ST.set.hideSmall?ic('check','xs'):''}</span>Hide small balances</button></div>
      <div>${list.map(coinRow).join('')}</div>`; },
  mount(el){ $$('[data-go]',el).forEach(b=>b.onclick=()=>push(b.dataset.go)); const e=$('#eye',el); if(e) e.onclick=()=>{ ST.set.hideBal=!ST.set.hideBal; save(); refresh(); };
    const h=$('#hist',el); if(h) h.onclick=()=>switchTab('history'); const hs=$('#hs',el); if(hs) hs.onclick=()=>{ ST.set.hideSmall=!ST.set.hideSmall; save(); refresh(); };
    $$('[data-coin]',el).forEach(b=>b.onclick=()=>push('coin',{c:b.dataset.coin})); $$('[data-tx]',el).forEach(b=>b.onclick=()=>push('tx',{id:b.dataset.tx}));
    $('#srch',el).onclick=()=>push('coinPick',{mode:'coin',title:'Search'}); }});
S.coin=(p)=>({title:COINS[p.c].name,body:()=>{ const c=p.c; const txs=ST.tx.filter(t=>t.coin===c);
  return `<div class="center" style="padding:12px 16px 4px">${coinBadge(c,'lg').replace('class="coin','style="margin:0 auto 14px;background:'+COINS[c].color+'" class="coin')}
    <div class="h1 mono">${mask(camt(c,ST.bal[c]))}</div><div class="sub mt8 mono">≈ ${mask(fiat(usd(c,ST.bal[c])))}</div></div>
    <div class="actions" style="grid-template-columns:repeat(3,1fr);padding:20px 40px 8px"><button class="act" data-a="dep"><i>${ic('dep')}</i>Deposit</button><button class="act" data-a="wd"><i>${ic('wd')}</i>Withdraw</button><button class="act" data-a="tr"><i>${ic('tr')}</i>Transfer</button></div>
    <div class="sec-h" style="font-size:17px;color:var(--t1);font-weight:600">History</div>
    ${txs.length?txs.map(txRow).join(''):`<div class="empty" style="padding-top:24px"><p>No ${c} transactions yet</p></div>`}`; },
  mount(el,en){ const c=p.c; $$('[data-a]',el).forEach(b=>b.onclick=()=>{ const a=b.dataset.a; if(a==='dep') depStart(c); if(a==='wd') push('wdForm',{c}); if(a==='tr') push('trForm',{c}); });
    $$('[data-tx]',el).forEach(b=>b.onclick=()=>push('tx',{id:b.dataset.tx})); }});
S.coinPick=(p)=>({title:p.title,body:()=>`<div class="pad" style="padding-top:4px"><label class="field">${ic('search','s')}<input id="q" placeholder="Search coin" autocomplete="off"></label></div><div class="sec-h">Your coins</div><div id="ls"></div>`,
  mount(el){ const q=$('#q',el); const draw=()=>{ const s=q.value.trim().toLowerCase();
      const cs=Object.keys(COINS).filter(c=>(!s||c.toLowerCase().includes(s)||COINS[c].name.toLowerCase().includes(s))&&(p.mode!=='send'||ST.bal[c]>0));
      $('#ls',el).innerHTML=cs.length?cs.map(c=>row({left:coinBadge(c),t:`<b style="font-weight:600">${c}</b>`,s:COINS[c].name,chev:false,attr:` data-c="${c}"`,right:`<div class="amt"><div class="a mono">${nf(ST.bal[c],COINS[c].dec,c==='USDT'?2:COINS[c].dec)}</div></div>`})).join(''):`<div class="empty"><p>No coins match “${esc(q.value)}”</p></div>`;
      $$('[data-c]',el).forEach(b=>b.onclick=()=>p.pick?p.pick(b.dataset.c):push('coin',{c:b.dataset.c})); };
    q.oninput=draw; draw(); }});

/* ============ HISTORY ============ */
const TXN={dep:t=>`Deposit ${t.coin}`,wd:t=>`Withdraw ${t.coin}`,tout:t=>`Transfer to ${t.to}`,tin:t=>`Transfer from ${t.from}`};
const TXI={dep:'dep',wd:'wd',tout:'tr',tin:'tr'};
const stTxt=t=>t.st==='pending'?`<span class="lime">Confirming ${t.conf}/${t.need}</span>`:t.st==='proc'?'<span class="lime">Processing</span>':t.st==='review'?'<span style="color:#ffc400">Under review</span>':'Completed';
const sign=t=>t.type==='dep'||t.type==='tin'?'+':'-';
function txRow(t){ const w=when(t.time); const sub=w.hm+' · '+(t.type==='tout'||t.type==='tin'?'Panda transfer':NETS[t.net].short);
  return row({left:`<span class="txi">${ic(TXI[t.type],'s')}</span>`,t:esc(TXN[t.type](t)),s:sub,chev:false,attr:` data-tx="${t.id}"`,
    right:`<div class="amt"><div class="a mono${sign(t)==='+'?' lime':''}">${sign(t)}${camt(t.coin,t.amt)}</div><div class="b">${stTxt(t)}</div></div>`}); }
const FILT={all:()=>true,dep:t=>t.type==='dep',wd:t=>t.type==='wd',tr:t=>t.type==='tout'||t.type==='tin'};
S.history=(p,en)=>({tab:true,large:true,title:'History',body:()=>{ const f=en.f||'all'; const txs=ST.tx.filter(FILT[f]).sort((a,b)=>b.time-a.time);
  let out=`<div class="chips">${[['all','All'],['dep','Deposits'],['wd','Withdrawals'],['tr','Transfers']].map(([k,l])=>`<button class="chip${k===f?' on':''}" data-f="${k}">${l}</button>`).join('')}</div>`;
  if(!txs.length) return out+`<div class="empty"><div class="badge">${ic('clock','l')}</div><b>No transactions yet</b><p>Deposits, withdrawals and transfers will appear here</p></div>`;
  let day=null; for(const t of txs){ const d=when(t.time).day; if(d!==day){ day=d; out+=`<div class="sticky-h">${d}</div>`; } out+=txRow(t); } return out; },
  mount(el){ $$('[data-f]',el).forEach(b=>b.onclick=()=>{ en.f=b.dataset.f; refresh(en); }); $$('[data-tx]',el).forEach(b=>b.onclick=()=>push('tx',{id:b.dataset.tx})); }});
S.tx=(p)=>{ const t=()=>ST.tx.find(x=>x.id===p.id);
  return {title:{dep:'Deposit details',wd:'Withdrawal',tout:'Transfer',tin:'Transfer'}[t().type],
  cta:()=>t().type==='tout'?`<button class="btn sec" id="rep">Repeat transfer</button>`:(t().type==='dep'||t().type==='wd')?`<button class="btn sec" id="exp">View in explorer ${ic('ext','s')}</button>`:'',
  body:()=>{ const x=t(); const w=when(x.time); const pill=x.st==='done'?'<span class="pill grey">Completed</span>':x.st==='review'?'<span class="pill warn">Under review</span>':x.st==='proc'?'<span class="pill">Processing</span>':`<span class="pill">Confirming ${x.conf}/${x.need}</span>`;
    const kv=[]; if(x.type==='dep'){ kv.push(['Network',NETS[x.net].name],['From',x.from],['Tx hash',x.hash+' '+ic('copy','xs')]); }
    if(x.type==='wd'){ kv.push(['Network',NETS[x.net].name],['To',(x.toName?x.toName+' · ':'')+x.to],['Fee',camt(x.coin,x.fee)],['Tx hash',x.hash+' '+ic('copy','xs')]); }
    if(x.type==='tout'){ kv.push(['To',x.to],['Panda UID',x.uid],['Fee','Free'],['Transfer ID','PT-'+x.id.slice(-6).toUpperCase()]); }
    if(x.type==='tin'){ kv.push(['From',x.from],['Panda UID',x.uid],['Fee','Free']); }
    kv.push(['Time',w.full]);
    return `<div class="center" style="padding:12px 16px 20px">${coinBadge(x.coin).replace('class="coin','style="margin:0 auto 14px;background:'+COINS[x.coin].color+'" class="coin')}<div class="h1 mono">${sign(x)}${camt(x.coin,x.amt)}</div><div class="mt8">${pill}</div>
      ${x.st==='pending'?`<div class="progress">${Array.from({length:5},(_,i)=>`<i class="${x.conf/x.need>i/5?'on':''}"></i>`).join('')}</div>`:''}</div>
      <div class="group card" style="padding:8px 16px">${kv.map(([k,v])=>`<div class="kv" style="padding:8px 0"${k==='Tx hash'?' data-copy':''}><span>${k}</span><span style="display:flex;gap:6px;align-items:center">${v}</span></div>`).join('')}</div>`; },
  mount(el){ const c=$('[data-copy]',el); if(c) c.onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(t().hash).catch(()=>{}); toast('Tx hash copied'); };
    const e=$('#exp',el); if(e) e.onclick=()=>toast('Opens the blockchain explorer',{icon:'ext'}); const r=$('#rep',el); if(r) r.onclick=()=>push('trForm',{c:t().coin,to:USERS.find(u=>u.name===t().to)?.email||''}); }}; };

/* ============ DEPOSIT ============ */
function netSheet(c,cur,pick,{warn=true}={}){
  const nets=COINS[c].nets;
  sheet({title:'Choose network',body:`${warn?'<p class="cap red mb16">Send only on the network you choose. Other networks will lose your funds.</p>':'<p class="cap red mb16">Must match the network of the receiving address</p>'}
    ${nets.map((n,i)=>`<button class="opt${n===cur?' on':''}" data-n="${n}"><div class="grow"><div class="t">${NETS[n].name}</div><div class="s">Fee ${NETS[n].fee[c]} ${c} · ${NETS[n].time}</div></div>${i===0?'<span class="pill">Recommended</span>':''}</button>`).join('')}`,
    mount:(el,api)=>$$('[data-n]',el).forEach(b=>b.onclick=()=>{ api.close(true); pick(b.dataset.n); })});
}
function depStart(c){ const nets=COINS[c].nets; if(nets.length>1) netSheet(c,null,n=>push('depAddr',{c,net:n})); else push('depAddr',{c,net:nets[0]}); }
S.depCoin=()=>{ const d=S.coinPick({title:'Deposit',pick:c=>depStart(c)}); return d; };
let simT=null;
function tick(){ const t=ST.tx.find(x=>x.st==='pending'); if(!t) return;
  t.conf=Math.min(t.need,t.conf+1); if(t.conf>=t.need){ t.st='done'; ST.bal[t.coin]=(ST.bal[t.coin]||0)+t.amt; save();
    const tp=topE(); if(tp&&tp.name==='tx'&&tp.params.id===t.id) replaceTop('depDone',{id:t.id});
    else toast(`${camt(t.coin,t.amt)} received`,{icon:'dep',sub:'Tap to see details',onTap:()=>push('tx',{id:t.id}),ms:3500});
  } else save();
  refreshLive(); if(t.st==='pending') setTimeout(tick,700); }
function refreshLive(){ const tp=topE(); if(tp&&['wallet','history','tx','coin'].includes(tp.name)) refresh(tp); }
S.depAddr=(p)=>{ const addr=DEPOSIT_ADDR[p.net]; const multi=COINS[p.c].nets.length>1;
  return {title:`Deposit ${p.c}`,right:`<button class="nav-btn" id="sh">${ic('share')}</button>`,cta:()=>`<button class="btn sec" id="sv">Save QR code</button>`,
  body:()=>`<div class="pad"><div class="qr" id="qr"></div>
    <div class="card" style="padding:4px 16px"><button class="kv" style="width:100%;padding:12px 0" id="net"><span>Network</span><span style="display:flex;gap:4px;align-items:center;color:var(--t1)">${NETS[p.net].name}${multi?ic('down','xs'):''}</span></button>
      <div class="hr" style="margin:0"></div><button style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 0" id="cp"><div class="grow" style="flex:1;min-width:0"><div class="cap">Address</div><div style="word-break:break-all;font-weight:500;margin-top:2px">${addr}</div></div><span class="lime" id="cpi">${ic('copy','s')}</span></button></div>
    <div class="mt16" style="padding:0 2px"><div class="kv"><span>Minimum deposit</span><span>${NETS[p.net].min[p.c]||0.0001} ${p.c}</span></div><div class="kv"><span>Arrives after</span><span>${NETS[p.net].conf} confirmations</span></div></div>
    <div class="note mt16">${ic('alert','s')}<span>Send only ${p.c} on ${NETS[p.net].name}. Coins sent on another network will be lost.</span></div></div>`,
  mount(el){ const q=$('#qr',el); try{ const qr=qrcode(0,'M'); qr.addData(addr); qr.make(); q.innerHTML=qr.createSvgTag({cellSize:4,margin:0,scalable:true}); }catch(e){ q.innerHTML=`<div class="center cap" style="color:#000;padding-top:80px">QR</div>`; }
    $('#cp',el).onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(addr).catch(()=>{}); $('#cpi',el).innerHTML=ic('check','s'); toast('Address copied'); setTimeout(()=>{ const i=$('#cpi',el); if(i) i.innerHTML=ic('copy','s'); },1800); };
    $('#sv',el).onclick=()=>toast('QR code saved to Photos');
    $('#sh',el).onclick=()=>{ if(navigator.share) navigator.share({title:`My ${p.c} address`,text:addr}).catch(()=>{}); else toast('Share sheet opens here',{icon:'share'}); };
    if(multi) $('#net',el).onclick=()=>netSheet(p.c,p.net,n=>{ if(n!==p.net) replaceTop('depAddr',{c:p.c,net:n}); });
  },
  enter(){ clearTimeout(simT); if(ST.tx.some(x=>x.st==='pending')) return;
    simT=setTimeout(()=>{ const amt={USDT:500,BTC:0.005,ETH:0.15,SOL:3,TON:40}[p.c]; const id='t'+Date.now();
      ST.tx.unshift({id,type:'dep',coin:p.c,amt,net:p.net,from:short(NETS[p.net].sample),hash:Math.random().toString(16).slice(2,6)+'…'+Math.random().toString(16).slice(2,6),time:Date.now(),st:'pending',conf:0,need:NETS[p.net].conf}); save();
      toast(`Incoming deposit · +${camt(p.c,amt)}`,{icon:'dep',sub:'Confirming on the network. Tap to track',onTap:()=>push('tx',{id}),ms:4000}); setTimeout(tick,900); },4500); },
  leave(){ clearTimeout(simT); }}; };
S.depDone=(p)=>{ const t=ST.tx.find(x=>x.id===p.id);
  return {bg:glow,back:false,noSwipe:true,cta:()=>`<button class="btn ghost" id="vd">View details</button><button class="btn" id="gw">Go to wallet</button>`,
  body:()=>`<div class="state fade-in"><img src="img/coins.webp" alt="" style="width:240px;margin-bottom:12px"><h2>${camt(t.coin,t.amt)} received</h2><p>The money is in your wallet. You can withdraw it or send it to another Panda user.</p></div>`,
  mount(el){ $('#gw',el).onclick=()=>{ NAV.tab==='wallet'?finishFlow():(switchTab('wallet')); }; $('#vd',el).onclick=()=>push('tx',{id:t.id}); }}; };

/* ============ WITHDRAW ============ */
const usable=a=>a.from<=Date.now();
const fmtLeft=ms=>{ const h=Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000); return h>0?`${h} h ${m} min`:`${m} min`; };
S.wdCoin=()=>S.coinPick({title:'Withdraw',mode:'send',pick:c=>push('wdForm',{c})});
function amountState(c,v,min,fee){ const a=parseFloat(v)||0, bal=ST.bal[c]||0;
  if(!v) return {a,ok:false}; if(a>bal) return {a,ok:false,err:'Exceeds available balance'}; if(min&&a<min) return {a,ok:false,err:`Minimum is ${min} ${c}`}; if(fee&&a<=fee) return {a,ok:false,err:'Amount must be higher than the fee'}; return {a,ok:a>0}; }
const cleanNum=i=>{ let v=i.value.replace(',','.').replace(/[^\d.]/g,''); const p=v.split('.'); if(p.length>2) v=p[0]+'.'+p.slice(1).join(''); if(v!==i.value) i.value=v; return v; };
S.wdForm=(p,en)=>{ const c=p.c; en.addr=en.addr||null;
  const A=()=>ST.wl.find(a=>a.id===en.addr);
  return {title:`Withdraw ${c}`,right:`<button class="nav-btn" id="hi">${ic('clock')}</button>`,cta:()=>`<button class="btn" id="go" disabled>Continue</button>`,
  body:()=>{ const a=A(); const net=a&&a.net;
    return `<div class="pad">
      <div class="fgroup"><div class="lbl">Address</div><button class="field tap${a?'':' focus'}" id="ad" style="width:100%;text-align:left">${a?`<div class="val"><b style="font-weight:500">${esc(a.name)}</b> <span class="t2">${short(a.addr)}</span></div>`:'<span class="ph">Choose a saved address</span>'}<span class="t2">${ic('down','s')}</span></button></div>
      <div class="fgroup"><div class="lbl">Network</div><button class="field tap" id="nt" style="width:100%;text-align:left">${net?`<span class="val">${NETS[net].name}</span>${ic('lock','xs')}`:'<span class="ph">Set by the address</span>'}</button></div>
      ${field({id:'am',label:'Amount',ph:'0',mode:'decimal',val:en.am||'',right:`<span class="unit">${c}</span><button class="max" id="mx" type="button">Max</button>`})}
      <div class="kv"><span>Available</span><span class="mono">${camt(c,ST.bal[c]||0)}</span></div>
      <div class="kv"><span>Network fee</span><span id="fee">${net?camt(c,NETS[net].fee[c]):'-'}</span></div>
      <div class="kv"><span>Recipient gets</span><span id="gets">-</span></div>
      <div class="note mt16">${ic('shield','s')}<span>Withdrawals only go to your whitelisted addresses. <button class="link" id="mng" style="font-size:13px">Manage</button></span></div></div>`; },
  mount(el){ const am=$('#am',el), go=$('#go',el);
    const upd=()=>{ const a=A(); const v=cleanNum(am); en.am=v; const fee=a?NETS[a.net].fee[c]:0, min=a?NETS[a.net].min[c]:0; const s=amountState(c,v,min,fee);
      setErr(el,'am',s.err||''); $('#gets',el).textContent=a&&s.ok?camt(c,s.a-fee):'-'; go.disabled=!(a&&s.ok); return s; };
    am.oninput=upd; upd();
    $('#mx',el).onclick=()=>{ am.value=String(ST.bal[c]||0); upd(); };
    $('#ad',el).onclick=()=>{ const list=ST.wl.filter(a=>COINS[c].nets.includes(a.net));
      sheet({title:'Whitelisted addresses',body:`${list.length?list.map(a=>{ const ok=usable(a); return `<button class="opt${ok?'':' dis'}${a.id===en.addr?' on':''}" data-a="${a.id}"><div class="grow"><div class="t">${esc(a.name)}</div><div class="s">${short(a.addr)} · ${NETS[a.net].short}${ok?'':' · usable in '+fmtLeft(a.from-Date.now())}</div></div>${ok?`<span class="chev t3">${ic('chev','s')}</span>`:ic('clock','s')}</button>`; }).join(''):`<div class="empty" style="padding:16px 8px"><p>No saved ${c} addresses yet</p></div>`}
        <button class="row" id="add" style="padding:12px 4px;color:var(--lime)">${ic('plus','s')}<div class="grow t" style="font-weight:600">Add address</div></button>`,
        mount:(sh,api)=>{ $$('[data-a]',sh).forEach(b=>b.onclick=()=>{ en.addr=b.dataset.a; api.close(true); refresh(en); });
          $('#add',sh).onclick=()=>{ api.close(true); push('wlAdd',{coin:c}); }; }}); };
    $('#nt',el).onclick=()=>toast(A()?'The network comes from the saved address':'Choose an address first',{icon:'info'});
    $('#mng',el).onclick=()=>push('wl'); $('#hi',el).onclick=()=>{ NAV.stacks.history[0].f='wd'; switchTab('history'); };
    go.onclick=async()=>{ const s=upd(); const a=A(); if(!s.ok||!a) return; am.blur(); const fee=NETS[a.net].fee[c];
      const okSec=await securityCheck({rows:`<div class="kv"><span>Amount</span><span>${camt(c,s.a)}</span></div><div class="kv"><span>To</span><span>${esc(a.name)} · ${NETS[a.net].short}</span></div><div class="kv"><span>Fee</span><span>${camt(c,fee)}</span></div>`});
      if(!okSec) return; const big=usd(c,s.a)>=1000;
      const finish=()=>{ ST.bal[c]=+(ST.bal[c]-s.a).toFixed(8); const id='t'+Date.now();
        ST.tx.unshift({id,type:'wd',coin:c,amt:s.a,net:a.net,to:short(a.addr),toName:a.name,fee,hash:Math.random().toString(16).slice(2,6)+'…'+Math.random().toString(16).slice(2,6),time:Date.now(),st:big?'review':'proc'}); save();
        if(!big) setTimeout(()=>{ const t=ST.tx.find(x=>x.id===id); if(t&&t.st==='proc'){ t.st='done'; save(); refreshLive(); toast(`${camt(c,s.a-fee)} delivered`,{icon:'checkc',sub:`Withdrawal to ${a.name}`}); } },9000);
        replaceTop(big?'wdReview':'wdSent',{id,gets:s.a-fee}); };
      if(big) travelRule(finish); else finish(); }; }}; };
function travelRule(done){ let pick='own';
  sheet({title:'Who owns this wallet?',body:`<p class="cap mb16">EU rules require us to know who receives transfers over 1,000 EUR.</p>
    ${[['own','My own wallet','Ledger, MetaMask, Trust Wallet…'],['ex','Another exchange','Binance, Kraken, Coinbase…'],['per','Another person','We’ll ask for their name']].map(([k,t,s])=>`<button class="opt${k===pick?' on':''}" data-k="${k}"><div class="grow"><div class="t">${t}</div><div class="s">${s}</div></div><span class="lime" data-c>${k===pick?ic('checkc','s'):''}</span></button>`).join('')}
    <div id="nm"></div><button class="btn mt8" id="ok">Continue</button>`,
    mount:(el,api)=>{ const draw=()=>{ $$('[data-k]',el).forEach(b=>{ const on=b.dataset.k===pick; b.classList.toggle('on',on); $('[data-c]',b).innerHTML=on?ic('checkc','s'):''; });
        $('#nm',el).innerHTML=pick==='per'?field({id:'rn',ph:'Recipient’s full name'}):''; };
      $$('[data-k]',el).forEach(b=>b.onclick=()=>{ pick=b.dataset.k; draw(); });
      $('#ok',el).onclick=()=>{ if(pick==='per'&&!($('#rn',el).value.trim())) return setErr(el,'rn','Enter the recipient’s name'); api.close(true); done(); }; }});
}
S.wdSent=(p)=>{ const t=ST.tx.find(x=>x.id===p.id); return {bg:glow,back:false,noSwipe:true,cta:()=>`<button class="btn ghost" id="vd">View details</button><button class="btn" id="dn">Done</button>`,
  body:()=>stateHTML('send','Withdrawal in progress',`${camt(t.coin,p.gets)} is on the way to ${esc(t.toName)}. We’ll notify you when it arrives.`),
  mount(el){ $('#dn',el).onclick=()=>finishFlow(); $('#vd',el).onclick=()=>push('tx',{id:t.id}); }}; };
S.wdReview=(p)=>({bg:glow,back:false,noSwipe:true,cta:()=>`<button class="btn" id="ok">OK</button>`,
  body:()=>stateHTML('clock','Withdrawal under review','Large withdrawals are checked by our team. Usually within 1 hour. We’ll notify you.'),
  mount(el){ $('#ok',el).onclick=()=>finishFlow(); }});

/* ============ TRANSFER ============ */
S.trCoin=()=>S.coinPick({title:'Transfer',mode:'send',pick:c=>push('trForm',{c})});
function findUser(q){ q=q.trim().toLowerCase().replace(/\s/g,''); if(!q) return null;
  if([ST.user.email.toLowerCase(),ST.user.uid,ST.user.phone.replace(/\s/g,'')].includes(q)) return 'self';
  return USERS.find(u=>u.email===q||u.uid===q||u.phone===q||u.phone.endsWith(q)&&q.length>=7)||false; }
S.trForm=(p,en)=>{ const c=p.c; if(en.to===undefined) en.to=p.to||''; let lt;
  return {title:`Transfer ${c}`,cta:()=>`<button class="btn" id="go" disabled>Continue</button>`,
  body:()=>`<div class="pad">${field({id:'to',label:'Recipient',ph:'Email, phone or Panda UID',mode:'email',val:en.to,right:`<button class="t2" id="ps" type="button">${ic('paste','s')}</button>`})}
    <div id="who" style="margin:-8px 0 16px;min-height:20px"></div>
    ${field({id:'am',label:'Amount',ph:'0',mode:'decimal',val:en.am||'',right:`<span class="unit">${c}</span><button class="max" id="mx" type="button">Max</button>`})}
    <div class="kv"><span>Available</span><span class="mono">${camt(c,ST.bal[c]||0)}</span></div><div class="kv"><span>Fee</span><span class="lime">Free</span></div><div class="kv"><span>Recipient gets</span><span id="gets">-</span></div>
    <div class="note mt16">${ic('info','s')}<span>Transfers between Panda users are instant and free. Try maria.k@mail.com or UID 62019455.</span></div></div>`,
  mount(el){ const to=$('#to',el), am=$('#am',el), go=$('#go',el), who=$('#who',el); let user=null;
    const upd=()=>{ const v=cleanNum(am); en.am=v; const s=amountState(c,v); setErr(el,'am',s.err||''); $('#gets',el).textContent=s.ok&&user?camt(c,s.a):'-'; go.disabled=!(s.ok&&user); return s; };
    const look=()=>{ en.to=to.value; user=null; upd(); clearTimeout(lt); to.closest('.field').classList.remove('err');
      if(!to.value.trim()){ who.innerHTML=''; return; }
      who.innerHTML=`<div class="found t2"><span class="mini-spin"></span>Looking up…</div>`;
      lt=setTimeout(()=>{ const u=findUser(to.value);
        if(u==='self'){ who.innerHTML=`<div class="field-err" style="margin:0">${ic('alert','xs')}That’s your own account</div>`; to.closest('.field').classList.add('err'); }
        else if(!u){ who.innerHTML=`<div class="field-err" style="margin:0">${ic('alert','xs')}No Panda account with this ${/@/.test(to.value)?'email':/^\d{8}$/.test(to.value.trim())?'UID':'phone'}</div>`; to.closest('.field').classList.add('err'); }
        else { user=u; who.innerHTML=`<div class="found fade-in"><div class="coin" style="background:#2b2f36">${u.name[0]}</div><b style="font-weight:500">${u.name}</b><span class="t2">UID ${u.uid}</span><span class="lime" style="margin-left:auto">${ic('checkc','s')}</span></div>`; }
        upd(); },500); };
    to.oninput=look; am.oninput=upd; if(to.value) look(); else upd();
    $('#ps',el).onclick=async()=>{ let v=''; try{ v=await navigator.clipboard.readText(); }catch(e){} to.value=(v&&v.length<60)?v.trim():'maria.k@mail.com'; look(); };
    $('#mx',el).onclick=()=>{ am.value=String(ST.bal[c]||0); upd(); };
    go.onclick=async()=>{ const s=upd(); if(!s.ok||!user) return; am.blur(); to.blur();
      const ok=await securityCheck({rows:`<div class="kv"><span>Amount</span><span>${camt(c,s.a)}</span></div><div class="kv"><span>To</span><span>${user.name} · ${esc(to.value.trim())}</span></div><div class="kv"><span>Fee</span><span class="lime">Free</span></div>`});
      if(!ok) return; ST.bal[c]=+(ST.bal[c]-s.a).toFixed(8); const id='t'+Date.now();
      ST.tx.unshift({id,type:'tout',coin:c,amt:s.a,to:user.name,uid:user.uid,time:Date.now(),st:'done'}); save(); replaceTop('trDone',{id}); }; }}; };
S.trDone=(p)=>{ const t=ST.tx.find(x=>x.id===p.id); return {bg:glow,back:false,noSwipe:true,cta:()=>`<button class="btn ghost" id="vd">View details</button><button class="btn" id="dn">Done</button>`,
  body:()=>stateHTML('checkc','Transfer complete',`${camt(t.coin,t.amt)} is already in ${esc(t.to.split(' ')[0])}’s account. Transfers inside Panda are instant and free.`),
  mount(el){ $('#dn',el).onclick=()=>finishFlow(); $('#vd',el).onclick=()=>push('tx',{id:t.id}); }}; };

/* ============ ACCOUNT ============ */
const prot=()=>ST.sec.twoFA?['Strong',3]:['Medium',2];
S.account=()=>({tab:true,large:true,title:'Account',body:()=>`
  <div style="display:flex;align-items:center;gap:14px;padding:8px 16px 20px"><div class="avatar"><img src="img/panda.webp" alt=""></div><div style="min-width:0">
    <div style="font-size:18px;font-weight:600;line-height:24px">${esc(ST.user.name)}</div><button class="cap" id="uid" style="display:flex;gap:6px;align-items:center">UID ${ST.user.uid} ${ic('copy','xs')}</button><span class="pill mt8" style="margin-top:6px">Verified</span></div></div>
  <div class="group card">${row({icon:'idcard',t:'Personal info',v:'<span class="lime">Verified</span>',attr:' data-go="personal"'})}${row({icon:'lock',t:'Security',v:prot()[0],attr:' data-go="security"'})}${row({icon:'wallet',t:'Withdrawal addresses',v:ST.wl.length+' saved',attr:' data-go="wl"'})}${row({icon:'bell',t:'Notifications',attr:' data-go="notifs"'})}${row({icon:'gear',t:'Settings',attr:' data-go="settings"'})}</div>
  <div class="group card">${row({icon:'help',t:'Help & support',attr:' data-t="help"'})}${row({icon:'doc',t:'Terms & privacy',attr:' data-t="terms"'})}${row({icon:'info',t:'About Panda',v:'v2.0',attr:' data-t="about"'})}</div>
  <div class="pad"><button class="btn ghost" id="lo">Log out</button></div>`,
  mount(el){ $$('[data-go]',el).forEach(b=>b.onclick=()=>push(b.dataset.go)); $('#uid',el).onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(ST.user.uid).catch(()=>{}); toast('UID copied'); };
    $$('[data-t]',el).forEach(b=>b.onclick=()=>toast({help:'Support chat opens here · 24/7',terms:'Terms open in the browser',about:'Panda for iPhone · v2.0 prototype'}[b.dataset.t],{icon:'info'}));
    $('#lo',el).onclick=async()=>{ if(await confirmSheet({title:'Log out of Panda?',text:'You’ll need your password or Face ID to log in again.',ok:'Log out',danger:true})) logout(); }; }});
S.personal=()=>({title:'Personal info',body:()=>`<div class="group card">${[['Name',ST.user.name],['Date of birth',ST.user.dob],['Country',ST.user.country],['Address',ST.user.address]].map(([k,v])=>row({t:k,v:esc(v),attr:' data-s'})).join('')}</div>
  <div class="group card" style="padding:12px 16px"><div class="kv"><b>Verification</b><span class="lime">Verified</span></div><div class="kv"><span>Daily withdrawal limit</span><span>100,000 EUR</span></div></div><p class="cap pad">To change your name or country, contact support</p>`,
  mount(el){ $$('[data-s]',el).forEach(b=>b.onclick=()=>toast('To change it, contact support',{icon:'info'})); }});
S.notifs=()=>({title:'Notifications',body:()=>`<div class="group card mt8">${row({t:'Deposits, withdrawals & transfers',chev:false,right:tog(ST.notif.money),attr:' data-n="money"'})}</div>
  <div class="group card">${row({t:'Security alerts',s:'Always on for your safety',chev:false,right:tog(true,' style="opacity:.5"'),attr:' data-n="lock"'})}${row({t:'News & offers',chev:false,right:tog(ST.notif.news),attr:' data-n="news"'})}</div>`,
  mount(el){ $$('[data-n]',el).forEach(b=>b.onclick=()=>{ const k=b.dataset.n; if(k==='lock') return toast('Security alerts can’t be turned off',{icon:'shield'}); ST.notif[k]=!ST.notif[k]; save(); $('.tog',b).classList.toggle('on',ST.notif[k]); }); }});
function pickSheet(title,opts,cur,pick){ sheet({title,body:opts.map(o=>{ const [v,l,dis]=Array.isArray(o)?o:[o,o]; return `<button class="opt${v===cur?' on':''}${dis?' dis':''}" data-v="${v}"><div class="grow"><div class="t">${l}</div></div><span class="lime">${v===cur?ic('check','s'):''}</span></button>`; }).join(''),
  mount:(el,api)=>$$('[data-v]',el).forEach(b=>b.onclick=()=>{ api.close(true); pick(b.dataset.v); })}); }
S.settings=()=>({title:'Settings',body:()=>`<div class="group card mt8">${row({icon:'globe',t:'Language',v:ST.set.lang,attr:' data-p="lang"'})}${row({icon:'swap',t:'Currency',v:ST.set.currency,attr:' data-p="cur"'})}${row({icon:'moon',t:'Theme',v:ST.set.theme,attr:' data-p="theme"'})}</div>
  <div class="group card">${row({t:'Face ID to open app',chev:false,right:tog(ST.set.faceId),attr:' data-t="faceId"'})}${row({t:'Hide small balances',chev:false,right:tog(ST.set.hideSmall),attr:' data-t="hideSmall"'})}</div>
  <div class="group card">${row({t:'Delete account',cls:'danger',attr:' data-go="deleteAcc"'})}</div>`,
  mount(el){ $$('[data-t]',el).forEach(b=>b.onclick=async()=>{ const k=b.dataset.t; if(k==='faceId'&&!ST.set.faceId) await faceId(); ST.set[k]=!ST.set[k]; save(); $('.tog',b).classList.toggle('on',ST.set[k]); });
    $('[data-go]',el).onclick=()=>push('deleteAcc');
    $$('[data-p]',el).forEach(b=>b.onclick=()=>{ const k=b.dataset.p;
      if(k==='lang') pickSheet('Language',['English','Deutsch','Español','Français','Русский','Türkçe'],ST.set.lang,v=>{ ST.set.lang=v; save(); refresh(); if(v!=='English') toast('In the prototype, texts stay in English',{icon:'info'}); });
      if(k==='cur') pickSheet('Currency',[['USD','US dollar · USD'],['EUR','Euro · EUR']],ST.set.currency,v=>{ ST.set.currency=v; save(); refreshAll(); });
      if(k==='theme') pickSheet('Theme',[['Dark','Dark'],['Light','Light · coming soon',1]],ST.set.theme,()=>{}); }); }});
S.deleteAcc=(p,en)=>({title:'Delete account',cta:()=>`<button class="btn danger" id="go"${en.ok?'':' disabled'}>Delete account</button>`,
  body:()=>`<div class="pad" style="padding-top:8px"><div class="h1">Delete your account</div><p class="sub mt8 mb16">This can’t be undone. Before you continue:</p>
    <div class="card" style="padding:4px 16px">${['Withdraw all your crypto','Download your history if you need it'].map(t=>`<div class="kv" style="padding:10px 0;justify-content:flex-start;gap:10px"><span class="lime">${ic('checkc','s')}</span><span style="color:var(--t1);text-align:left">${t}</span></div>`).join('')}</div>
    <button class="cap mt16" id="ck" style="display:flex;gap:10px;align-items:center;text-align:left"><span class="chk${en.ok?' on':''}">${en.ok?ic('check','xs'):''}</span>I understand my account will be closed</button></div>`,
  mount(el){ $('#ck',el).onclick=()=>{ en.ok=!en.ok; refresh(en); };
    $('#go',el).onclick=async()=>{ if(!await confirmSheet({title:'Delete account?',text:'Your account and history will be removed.',ok:'Delete',danger:true})) return; ST=defaults(); save(); logout(); toast('Account deleted',{icon:'trash'}); }; }});

/* ============ SECURITY ============ */
S.security=()=>({title:'Security',body:()=>{ const [l,n]=prot(); return `<div class="group card mt8" style="padding:14px 16px"><div class="kv" style="padding:0"><b style="font-weight:600">Protection level</b><span class="lime" style="font-weight:600">${l}</span></div>
    <div class="lvl">${[0,1,2].map(i=>`<i class="${i<n?'on':''}"></i>`).join('')}</div><div class="cap">${ST.sec.twoFA?'Your account and withdrawals are protected':'Turn on the authenticator app to protect withdrawals'}</div></div>
  <div class="group card">${row({t:'Face ID',chev:false,right:tog(ST.set.faceId),attr:' id="fid"'})}${row({t:'Passkeys',v:ST.passkeys.length+(ST.passkeys.length===1?' device':' devices'),attr:' data-go="passkeys"'})}
    ${row({t:'Authenticator app',v:ST.sec.twoFA?'<span class="lime">On</span>':'<span class="red">Off</span>',attr:' id="tfa"'})}${row({t:'Password',v:'Change',attr:' data-go="changePw"'})}
    ${row({t:'Email',v:emailMask(ST.user.email),attr:' data-go="changeEmail"'})}${row({t:'Phone',v:ST.user.phone.slice(0,3)+' •••• '+ST.user.phone.slice(-4),attr:' data-go="changePhone"'})}</div>
  <div class="group card">${row({t:'Devices',v:ST.devices.length+' active',attr:' data-go="devices"'})}${row({t:'Withdrawal addresses',v:ST.wl.filter(usable).length+' active'+(ST.wl.some(a=>!usable(a))?' · '+ST.wl.filter(a=>!usable(a)).length+' pending':''),attr:' data-go="wl"'})}</div>`; },
  mount(el){ $$('[data-go]',el).forEach(b=>b.onclick=()=>push(b.dataset.go));
    $('#fid',el).onclick=async()=>{ if(!ST.set.faceId) await faceId(); ST.set.faceId=!ST.set.faceId; save(); refresh(); };
    $('#tfa',el).onclick=async()=>{ if(!ST.sec.twoFA) return push('tfa1');
      if(await confirmSheet({title:'Turn off authenticator?',text:'Withdrawals will be protected by email codes only. Protection level drops to Medium.',ok:'Turn off',danger:true})){ ST.sec.twoFA=false; save(); refresh(); toast('Authenticator app is off',{icon:'alert'}); } }; }});
S.passkeys=()=>({title:'Passkeys',body:()=>`<p class="cap pad mb16" style="padding-top:4px">Log in with Face ID or Touch ID instead of a password. Passkeys can’t be phished.</p>
  <div class="group card">${ST.passkeys.map((k,i)=>row({icon:'key',t:esc(k.name),v:'Added '+k.added,attr:` data-i="${i}"`})).join('')||'<div class="row t2">No passkeys yet</div>'}</div><div class="pad"><button class="btn sec" id="add">${ic('plus','s')} Add passkey</button></div>`,
  mount(el){ $('#add',el).onclick=async()=>{ await faceId('Passkey'); ST.passkeys.push({name:'iPhone 16',added:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short'})}); save(); refresh(); toast('Passkey added'); };
    $$('[data-i]',el).forEach(b=>b.onclick=async()=>{ const k=ST.passkeys[b.dataset.i]; if(await confirmSheet({title:`Remove ${k.name}?`,text:'You won’t be able to log in with this passkey.',ok:'Remove',danger:true})){ ST.passkeys.splice(b.dataset.i,1); save(); refresh(); toast('Passkey removed',{icon:'trash'}); } }); }});
const steps=n=>`<div class="steps">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>`;
S.tfa1=()=>({title:'Authenticator app',cta:()=>`<button class="btn" id="go">I have the app</button>`,body:()=>`${steps(1)}<div class="pad"><div class="empty" style="padding:24px 0 8px;align-items:flex-start;text-align:left"><div class="badge">${ic('lock','l')}</div></div><div class="h1">Install an authenticator app</div><p class="sub mt8">Use Google Authenticator, Authy or any TOTP app. You’ll enter a code from it when you log in and withdraw.</p></div>`,
  mount(el){ $('#go',el).onclick=()=>push('tfa2'); }});
const TOTP='JBSW Y3DP EHPK 3PXP';
S.tfa2=()=>({title:'Authenticator app',cta:()=>`<button class="btn" id="go">Next</button>`,body:()=>`${steps(2)}<div class="pad"><div class="h1">Scan the QR code</div><div class="qr" id="qr" style="margin-top:20px"></div>
  <div class="lbl">Or enter this key manually</div><button class="field tap" id="cp" style="width:100%;text-align:left"><span class="val mono" style="font-weight:600;letter-spacing:.04em">${TOTP}</span><span class="lime">${ic('copy','s')}</span></button><p class="cap mt8">Save this key somewhere safe. You’ll need it if you lose your phone.</p></div>`,
  mount(el){ try{ const q=qrcode(0,'M'); q.addData(`otpauth://totp/Panda:${ST.user.email}?secret=${TOTP.replace(/ /g,'')}&issuer=Panda`); q.make(); $('#qr',el).innerHTML=q.createSvgTag({cellSize:4,margin:0,scalable:true}); }catch(e){}
    $('#cp',el).onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(TOTP.replace(/ /g,'')).catch(()=>{}); toast('Key copied'); }; $('#go',el).onclick=()=>push('tfa3'); }});
S.tfa3=()=>({title:'Authenticator app',keypad:true,body:()=>`${steps(3)}<div class="pad"><div class="h1">Enter the code</div><p class="sub mt8">Type the 6-digit code from your authenticator app</p>${codeBoxes()}<p class="cap t3">Demo: any 6 digits</p></div>`,
  mount(el){ codeInput(el,{onDone:()=>{ ST.sec.twoFA=true; save(); replaceTop('done',{icon:'checkc',title:'Authenticator app is on',text:'We’ll ask for a code when you log in on a new device and when you withdraw.',back:'security'}); }}); }});
S.done=(p)=>({bg:glow,back:false,noSwipe:true,cta:()=>`<button class="btn" id="dn">Done</button>`,body:()=>stateHTML(p.icon,p.title,p.text),
  mount(el){ $('#dn',el).onclick=()=>{ const s=stack(); const i=s.map(e=>e.name).lastIndexOf(p.back); if(i>=0) pop(s.length-1-i); else finishFlow(); }; }});
S.changePw=()=>({title:'Change password',cta:()=>`<button class="btn" id="go" disabled>Save</button>`,
  body:()=>`<div class="pad" style="padding-top:8px">${field({id:'p0',label:'Current password',type:'password',right:eye('p0')})}${field({id:'p1',label:'New password',type:'password',right:eye('p1')})}${field({id:'p2',label:'Repeat new password',type:'password',right:eye('p2')})}
    <div id="ck">${checksHTML('')}</div><p class="cap mt16">Withdrawals will be paused for 24 hours after the change.</p><p class="cap t3 mt8">Demo current password: ${esc(ST.sec.password)}</p></div>`,
  mount(el){ wireEyes(el); const [p0,p1,p2]=['p0','p1','p2'].map(i=>$('#'+i,el)), go=$('#go',el);
    const chk=()=>{ $('#ck',el).innerHTML=checksHTML(p1.value); setErr(el,'p0',''); setErr(el,'p2',p2.value&&p2.value!==p1.value?'Passwords don’t match':''); go.disabled=!(p0.value&&pwChecks(p1.value).every(x=>x[0])&&p1.value===p2.value); };
    [p0,p1,p2].forEach(i=>i.oninput=chk);
    go.onclick=()=>btnBusy(go,()=>{ if(p0.value!==ST.sec.password) return setErr(el,'p0','Wrong current password'); ST.sec.password=p1.value; save(); pop(); toast('Password changed',{sub:'Withdrawals resume in 24 hours'}); }); }});
S.changeEmail=()=>({title:'Change email',cta:()=>`<button class="btn" id="go" disabled>Send codes</button>`,
  body:()=>`<div class="pad" style="padding-top:8px"><div class="lbl">Current email</div><div class="field mb16"><span class="val t2">${emailMask(ST.user.email)}</span></div>${field({id:'em',label:'New email',ph:'name@mail.com',mode:'email'})}<p class="cap">We’ll send codes to both addresses. Withdrawals pause for 24 hours.</p></div>`,
  mount(el){ const em=$('#em',el), go=$('#go',el); em.oninput=()=>{ go.disabled=!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em.value.trim()); };
    go.onclick=()=>btnBusy(go,()=>push('verifyCode',{kind:'email',value:em.value.trim()})); }});
S.changePhone=()=>({title:'Change phone',cta:()=>`<button class="btn" id="go" disabled>Send codes</button>`,
  body:()=>`<div class="pad" style="padding-top:8px"><div class="lbl">Current phone</div><div class="field mb16"><span class="val t2">${ST.user.phone.slice(0,3)} •••• ${ST.user.phone.slice(-4)}</span></div>
    <div class="lbl">New phone</div><div style="display:flex;gap:8px" class="fgroup"><div class="field" style="flex:none;width:92px">🇩🇪 +49</div><label class="field" style="flex:1"><input id="ph" inputmode="tel" placeholder="160 9876 5432" autocomplete="off"></label></div>
    <p class="cap">We’ll send a code by SMS to the new number and to your email. Withdrawals pause for 24 hours.</p></div>`,
  mount(el){ const ph=$('#ph',el), go=$('#go',el); ph.oninput=()=>{ ph.value=ph.value.replace(/[^\d ]/g,''); go.disabled=ph.value.replace(/\D/g,'').length<9; };
    go.onclick=()=>btnBusy(go,()=>push('verifyCode',{kind:'phone',value:'+49 '+ph.value.trim()})); }});
S.verifyCode=(p)=>({title:p.kind==='email'?'Change email':'Change phone',keypad:true,body:()=>`<div class="pad" style="padding-top:8px"><div class="h1">${p.kind==='email'?'Enter email code':'Enter SMS code'}</div><p class="sub mt8">Sent to ${esc(p.value)}</p>${codeBoxes()}<p class="cap" data-resend></p></div>`,
  mount(el){ resend(el); codeInput(el,{onDone:()=>{ if(p.kind==='email') ST.user.email=p.value; else ST.user.phone=p.value; save();
    replaceTop('done',{icon:'checkc',title:p.kind==='email'?'Email updated':'Phone number updated',text:`We’ll use ${esc(p.value)} for codes and alerts. Withdrawals resume in 24 hours.`,back:'security'}); }}); }, leave(){ clearInterval(resendT); }});
S.devices=()=>({title:'Devices',body:()=>`<div class="group card mt8">${ST.devices.map(d=>`<div class="row"><span class="ico">${ic(d.me?'checkc':d.kind)}</span><div class="grow"><div class="t">${esc(d.name)}</div><div class="s">${esc(d.where)} · ${d.when}</div></div>${d.me?'<span class="cap">This device</span>':`<button class="btn sec sm" data-d="${d.id}" style="height:32px;font-size:13px">Log out</button>`}</div>`).join('')}</div>
  ${ST.devices.length>1?`<div class="pad"><button class="btn ghost" id="all">Log out of all other devices</button></div>`:''}`,
  mount(el){ $$('[data-d]',el).forEach(b=>b.onclick=()=>{ ST.devices=ST.devices.filter(d=>d.id!==b.dataset.d); save(); refresh(); toast('Device logged out'); });
    const a=$('#all',el); if(a) a.onclick=async()=>{ if(await confirmSheet({title:'Log out of all other devices?',text:'You’ll stay logged in on this iPhone.',ok:'Log out',danger:true})){ ST.devices=ST.devices.filter(d=>d.me); save(); refresh(); toast('Other devices logged out'); } }; }});

/* ============ WHITELIST ============ */
S.wl=()=>({title:'Withdrawal addresses',cta:()=>`<button class="btn" id="add">${ic('plus','s')} Add address</button>`,body:()=>{ const act=ST.wl.filter(usable), pen=ST.wl.filter(a=>!usable(a));
  if(!ST.wl.length) return `<div class="empty"><div class="badge">${ic('wd','l')}</div><b>No saved addresses</b><p>For your safety, you can only withdraw to addresses you saved here</p></div>`;
  const r=a=>row({t:esc(a.name),s:`${short(a.addr)} · ${NETS[a.net].short}`,v:usable(a)?'':`<span class="pill warn">${fmtLeft(a.from-Date.now())}</span>`,attr:` data-a="${a.id}"`});
  return `<p class="cap pad mb8" style="padding-top:4px">Withdrawals only go to these addresses. A new address can be used 24 hours after you confirm it.</p>
    ${act.length?`<div class="sec-h">Active</div><div class="group card">${act.map(r).join('')}</div>`:''}${pen.length?`<div class="sec-h">Pending · usable in 24 h</div><div class="group card">${pen.map(r).join('')}</div>`:''}`; },
  mount(el){ $('#add',el).onclick=()=>push('wlAdd',{});
    $$('[data-a]',el).forEach(b=>b.onclick=()=>{ const a=ST.wl.find(x=>x.id===b.dataset.a);
      sheet({title:a.name,body:`<div class="card" style="padding:6px 16px;background:var(--elev)"><div class="kv" style="padding:8px 0"><span>Network</span><span>${NETS[a.net].name}</span></div><div class="kv" style="padding:8px 0"><span>Status</span><span>${usable(a)?'<span class="lime">Active</span>':'Usable in '+fmtLeft(a.from-Date.now())}</span></div>
        <div class="hr"></div><div class="cap" style="padding-top:6px">Address</div><div style="word-break:break-all;padding:2px 0 10px;font-weight:500">${a.addr}</div></div>
        <button class="btn sec mt16" id="cp">${ic('copy','s')} Copy address</button><button class="btn ghost mt8" id="rm" style="color:var(--red)">${ic('trash','s')} Remove address</button>`,
        mount:(sh,api)=>{ $('#cp',sh).onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(a.addr).catch(()=>{}); toast('Address copied'); };
          $('#rm',sh).onclick=async()=>{ api.close(true); if(await confirmSheet({title:`Remove ${a.name}?`,text:'Add it again to withdraw there.',ok:'Remove',danger:true})){ ST.wl=ST.wl.filter(x=>x.id!==a.id); save(); refresh(); toast('Address removed',{icon:'trash'}); } }; }}); }); }});
S.wlAdd=(p,en)=>{ en.net=en.net||(p.coin?COINS[p.coin].nets[0]:'TRC20');
  return {title:'New address',cta:()=>`<button class="btn" id="go" disabled>Save address</button>`,
  body:()=>`<div class="pad" style="padding-top:8px">${field({id:'nm',label:'Name',ph:'e.g. My Ledger',val:en.nm||''})}
    ${field({id:'ad',label:'Address',ph:'Paste or scan address',val:en.ad||'',right:`<button class="t2" id="ps" type="button">${ic('paste','s')}</button><button class="t2" id="sc" type="button">${ic('scan','s')}</button>`})}
    <div class="fgroup"><div class="lbl">Network</div><button class="field tap" id="nt" style="width:100%;text-align:left"><span class="val">${NETS[en.net].name}</span><span class="t2">${ic('down','s')}</span></button></div>
    <div class="note">${ic('shield','s')}<span>We’ll ask for a security code and a confirmation by email. The address can be used 24 hours later.</span></div></div>`,
  mount(el){ const nm=$('#nm',el), ad=$('#ad',el), go=$('#go',el);
    const chk=()=>{ en.nm=nm.value; en.ad=ad.value.trim(); const valid=NETS[en.net].re.test(en.ad);
      setErr(el,'ad',en.ad&&!valid?`This doesn’t look like a ${NETS[en.net].short} address`:''); go.disabled=!(nm.value.trim()&&valid); };
    nm.oninput=chk; ad.oninput=chk; chk();
    const fill=()=>{ ad.value=NETS[en.net].sample; chk(); };
    $('#ps',el).onclick=async()=>{ let v=''; try{ v=(await navigator.clipboard.readText()).trim(); }catch(e){} if(v&&NETS[en.net].re.test(v)){ ad.value=v; chk(); } else fill(); };
    $('#sc',el).onclick=async()=>{ toast('Scanning QR…',{icon:'scan',ms:900}); await wait(900); fill(); };
    $('#nt',el).onclick=()=>pickSheet('Network',Object.keys(NETS).map(k=>[k,NETS[k].name]),en.net,v=>{ en.net=v; refresh(en); });
    go.onclick=async()=>{ ad.blur(); nm.blur(); if(!await securityCheck({rows:`<div class="kv"><span>Name</span><span>${esc(en.nm)}</span></div><div class="kv"><span>Address</span><span>${short(en.ad)} · ${NETS[en.net].short}</span></div>`})) return;
      push('wlEmail',{name:en.nm.trim(),addr:en.ad,net:en.net}); }; }}; };
S.wlEmail=(p)=>({bg:glow,cta:()=>`<button class="btn ghost" id="rs">Resend</button><button class="btn" id="om">Open mail app</button>`,
  body:()=>stateHTML('mail','Confirm new address',`Open the link we sent to ${emailMask(ST.user.email)}. For your safety, the address can be used in 24 hours.`),
  mount(el){ $('#rs',el).onclick=()=>toast('Email sent again',{icon:'mail'});
    $('#om',el).onclick=e=>btnBusy(e.currentTarget,()=>{ ST.wl.push({id:'a'+Date.now(),name:p.name,addr:p.addr,net:p.net,from:Date.now()+DAY}); save();
      const s=stack(); let i=s.map(x=>x.name).lastIndexOf('wl'); if(i<0) i=s.map(x=>x.name).lastIndexOf('wdForm'); if(i<0) i=0;
      pop(s.length-1-i); toast('Address confirmed',{sub:`${p.name} can be used in 24 hours`,icon:'shield',ms:3200}); },1000); }});
