/* Panda MVP v2 prototype - boot */
'use strict';
(function boot(){
  phone=$('#phone'); layerEl=$('#layer'); tabbarEl=$('#tabbar');
  const desk=matchMedia('(hover:hover) and (pointer:fine)').matches&&innerWidth>=700;
  if(desk){ document.body.classList.add('desk'); const fit=()=>{ const k=Math.min(1,(innerHeight-40)/852,(innerWidth-40)/393); phone.style.transform=`scale(${k})`; }; addEventListener('resize',fit); fit(); }
  tabbarEl.innerHTML=[['wallet','pie','Wallet'],['history','clock','History'],['account','user','Account']].map(([k,i,l])=>`<button class="tab" data-tab="${k}">${ic(i)}<span>${l}</span></button>`).join('');
  $$('.tab',tabbarEl).forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
  fitViewport(); edgeSwipe();
  if(ST.loggedIn){ NAV.stacks.wallet=[{name:'wallet'}]; NAV.stacks.history=[{name:'history'}]; NAV.stacks.account=[{name:'account'}];
    if(ST.set.faceId){ NAV.locked=true; NAV.stacks.auth=[{name:'appLock'}]; } }
  else NAV.stacks.auth=[{name:'login'}];
  ST.tx.filter(t=>t.st==='proc').forEach(t=>{ t.st='done'; }); save();
  showStack();
  if(ST.tx.some(t=>t.st==='pending')) setTimeout(tick,1200);
  // lock again after 30 s in the background
  let hid=0; document.addEventListener('visibilitychange',()=>{ if(document.hidden){ hid=Date.now(); return; }
    if(ST.loggedIn&&ST.set.faceId&&!NAV.locked&&Date.now()-hid>30000){ closeAllSheets(true); NAV.locked=true; NAV.stacks.auth=[{name:'appLock'}]; showStack(); } });
  // no pinch / double-tap zoom
  document.addEventListener('gesturestart',e=>e.preventDefault());
  let lt=0; document.addEventListener('touchend',e=>{ const n=Date.now(); if(n-lt<300&&!e.target.closest('input')) e.preventDefault(); lt=n; },{passive:false});
  // reset the demo: hold the tab bar for 1.5 s
  let rt; tabbarEl.addEventListener('touchstart',()=>{ rt=setTimeout(async()=>{ if(await confirmSheet({title:'Reset the demo?',text:'Balances, history and settings go back to the start.',ok:'Reset'})){ ST=defaults(); save(); location.reload(); } },1500); },{passive:true});
  tabbarEl.addEventListener('touchend',()=>clearTimeout(rt));
})();
