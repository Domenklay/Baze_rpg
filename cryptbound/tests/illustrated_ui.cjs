/* Real WebView-size UI tour. npm ci --prefix cryptbound/tests; node this file.
   Serves only local assets. Fixtures use real runtime actions, never mock markup. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../src/main/assets');
const chrome=process.env.CHROMIUM_PATH||['chromium','google-chrome','chromium-browser'].find(x=>{try{cp.execFileSync('which',[x],{stdio:'ignore'});return true}catch{return false}});
const mime={'.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.html':'text/html'};
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data)});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;const errors=[];let screens=0;const out=process.env.UI_SCREENSHOTS;if(out)fs.mkdirSync(out,{recursive:true});
 try{
 browser=await chromium.launch({executablePath:cp.execFileSync('which',[chrome],{encoding:'utf8'}).trim(),args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url())});
 const action=(a,id)=>page.evaluate(([a,id])=>Crypt.debug.action(a,id),[a,id]);
 async function check(name){
  await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const z=await page.evaluate(()=>{const d=document.querySelector('.dialog'),r=d&&d.getBoundingClientRect();return {width:innerWidth,height:innerHeight,body:document.documentElement.scrollWidth,dialog:r&&{left:r.left,right:r.right,top:r.top,bottom:r.bottom,scroll:d.scrollWidth,client:d.clientWidth},layout:d&&d.dataset.layout,skin:d&&getComputedStyle(d).borderImageSource};});
  assert.ok(z.body<=z.width+1,name+' horizontal page overflow');
  if(z.dialog){const d=z.dialog;assert.ok(d.left>=-1&&d.right<=z.width+1,name+' dialog width');assert.ok(d.top>=-1&&d.bottom<=z.height+1,name+' dialog height');assert.ok(d.scroll<=d.client+2,name+' inner horizontal overflow');if(z.layout==='book')assert.equal(z.skin,'none','Book has no redundant outer frame');else if(z.layout==='event')assert.ok(z.skin.includes('/ui/illustrated/paper.png'),'Events use parchment');else if(!name.startsWith('hunter'))assert.ok(z.skin.includes('/ui/illustrated/panel.png'),name+' missing new frame');}
  await page.locator('img:visible').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.complete?null:new Promise(r=>{img.addEventListener('load',r,{once:true});img.addEventListener('error',r,{once:true})}))));
  assert.deepEqual(await page.locator('img:visible').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[],name+' broken illustration');
  if(out)await page.screenshot({path:path.join(out,name+'.png'),style:'#toast{display:none!important}'});screens++;
 }
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.Crypt);
 assert.equal(await page.locator('.village-services .menu-art').count(),6);assert.equal(await page.locator('#navbar .menu-art').count(),5);
 await check('village');
 for(const a of ['quest-board','town','diamond-shop','alchemy','dungeon-achievements','camp','chronicles','bestiary','choose','menu']){await action(a);await check(a);if(await page.locator('.dialog').count())assert.ok(await page.locator('.panel-close,.dialog-dismiss').count(),a+' immediate dismiss control');await action('close')}
 await action('begin','necromancer');const initialTurn=await page.evaluate(()=>Crypt.state().run.turn);
 for(const [w,h] of [[320,568],[360,640],[390,720],[390,844],[430,932],[480,736]]){
  await page.setViewportSize({width:w,height:h});await check('battle-'+w+'x'+h);
  const z=await page.evaluate(()=>{const b=document.querySelector('.maze').getBoundingClientRect(),dock=document.querySelector('.battle-dock').getBoundingClientRect(),content=document.querySelector('#content');return {square:b.width-b.height,bottom:dock.bottom,scroll:content.scrollHeight,client:content.clientHeight,top:document.querySelector('.expedition-top').getBoundingClientRect().top};});
  assert.ok(Math.abs(z.square)<1,'Square board');assert.ok(z.bottom<=h+1,'Dock fits');assert.ok(z.scroll<=z.client+1,'Battle must not scroll');assert.ok(z.top>=0,'HUD fits');
  for(const panel of ['bag','spells','talents']){await action('ui-panel',panel);await check(panel+'-'+w+'x'+h);if(panel==='bag'){const footer=await page.locator('.inventory-links').boundingBox();assert.ok(footer.y+footer.height<=h,'Backpack shortcuts fit without scrolling the outer window')}if(panel==='talents'){const visible=await page.locator('.talent-dot.selected').evaluate(el=>{const n=el.getBoundingClientRect(),v=el.closest('.talent-scroll').getBoundingClientRect();return n.top>=v.top&&n.bottom<=v.bottom&&n.left>=v.left&&n.right<=v.right});assert.ok(visible,'Selected title starts inside scroll viewport')}await action('close')}
 }
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>Crypt.state().run.turn),initialTurn,'All inventory, books and title inspection is free');
 // Backpack becomes internally scrollable when populated; a nearly empty bag need not scroll.
 await page.evaluate(()=>{const r=Crypt.state().run;for(let i=0;i<40;i++)r.lootBag.push({id:'ui-'+i,name:'Походный эликсир',kind:'vial-hp',qty:1,value:5});});
 await action('ui-panel','bag');assert.ok(await page.locator('.inventory-grid').evaluate(el=>el.scrollHeight>el.clientHeight));await page.locator('.inventory-grid').evaluate(el=>el.scrollTop=el.scrollHeight);await check('bag-full');await action('inventory-filter','gear');assert.equal(await page.locator('.bag-extra-item').count(),0);await action('inventory-filter','usable');assert.ok(await page.locator('.bag-extra-item').count()>=40);await action('inventory-filter','finds');assert.equal(await page.locator('.bag-extra-item[data-action=\"active-item-info\"]').count(),0);await action('inventory-filter','all');await page.locator('.gear-slot[data-id="weapon"]').click();await check('comparison');
 const text=await page.locator('.comparison-sheet b').first().evaluate(el=>({color:getComputedStyle(el).color,opacity:getComputedStyle(el).opacity}));assert.equal(text.opacity,'1');assert.equal(text.color,'rgb(241, 217, 173)');await action('close');
 for(const a of ['gear-sets','bag-details']){await action(a);await check(a);await action('close')}
 await action('ui-panel','spells');await action('spell-school','light');await page.locator('[data-action="spell-detail"]').first().click();await check('spell-detail');await action('close');
 await page.evaluate(()=>CryptHunterBook.acquire(Crypt.state().meta));
 for(const [w,h] of [[320,568],[390,844],[480,736]]){await page.setViewportSize({width:w,height:h});for(const tab of ['beasts','trophies','bonuses']){await action('hunter-tab',tab);await check('hunter-'+tab+'-'+w);const q=await page.locator('.hb-inner').evaluate(el=>({width:el.scrollWidth,client:el.clientWidth}));assert.ok(q.width<=q.client+2);await action('close')}}
 await page.setViewportSize({width:390,height:844});
 // Real forest event, well, treasure and cave UI.
 for(const [kind,id,name] of [['forest-event',1,'forest-squirrel'],['forest-event',2,'forest-event'],['forest-well',null,'forest-well'],['chest',null,'loot'],['puzzle',null,'puzzle'],['chamber',null,'cave']]){
  await action('begin','necromancer');const tile=await page.evaluate(([kind,id])=>{let r=Crypt.state().run,t=r.tiles.find(t=>t.kind==='empty'&&t.id!==r.heroTile);t.kind=kind;t.forestId=id;t.revealed=true;t.cleared=false;t.foe=null;return t.id},[kind,id]);
  if(name==='loot')await page.evaluate(id=>{const old=Math.random;Math.random=()=>.1;try{Crypt.debug.action('pickup',id)}finally{Math.random=old}},tile);else await action('pickup',tile);await check(name);if(name==='loot'){assert.ok(await page.locator('.loot-gear').count());assert.ok(await page.locator('.reward-entry').evaluateAll(xs=>xs.every(x=>getComputedStyle(x).borderImageSource==='none')),'Loot rows have no nested frames');for(const box of await page.locator('.loot-gear img').evaluateAll(imgs=>imgs.map(i=>({w:i.width,h:i.height}))))assert.ok(box.w<=54&&box.h<=54)}if(name==='cave'){assert.equal(await page.locator('.chamber-maze .tile').count(),9);assert.equal(await page.locator('#navbar').isVisible(),false)}await action('close');
 }
 await action('begin','necromancer');await page.evaluate(()=>{let r=Crypt.state().run;r.locationIndex=1;CryptMining.ensure(r);Crypt.debug.draw()});
 for(const [w,h] of [[320,568],[390,844]]){await page.setViewportSize({width:w,height:h});for(const tab of ['level','web']){await action('mine-tab',tab);await check('mining-'+tab+'-'+w);if(tab==='web'){assert.equal(await page.locator('.mine-web-node').count(),18);await page.locator('.mine-web-node').first().click();assert.equal(await page.locator('.mine-web-node.selected').count(),1)}await action('close')}}
 // Dossiers, consumable descriptions, journal and profession controls.
 await page.setViewportSize({width:390,height:844});await action('begin','necromancer');
 const foe=await page.evaluate(()=>{const t=Crypt.state().run.tiles.find(t=>t.foe);t.revealed=true;return t.id});
 await action('inspect-enemy',foe);await check('enemy-dossier');await action('close');await action('skill');await action('inspect-summon');await check('summon-dossier');await action('close');
 for(const [a,id] of [['battle-log'],['forest-pack'],['active-item-info','potion'],['hero-stats','necromancer'],['quest-item-info','Старинная печать']]){await action(a,id);await check(a);await action('close')}
 for(const title of ['adv_rune_master','adv_demon_hunter','adv_blacksmith']){await page.evaluate(title=>{const r=Crypt.state().run;r.talents={};r.talents[title]=1},title);await action('title-tool');await check('tool-'+title);assert.ok(await page.locator('.title-rune-list>button').evaluateAll(xs=>xs.every(x=>getComputedStyle(x).backgroundColor==='rgba(0, 0, 0, 0)')));await action('close')}
 await page.evaluate(()=>{const r=Crypt.state().run;r.locationIndex=1;CryptRidgeEvents.ensure(r).bur.status='active';Crypt.debug.draw()});await action('ridge-bur');await check('ridge-bur');await action('close');
 // New T1 dialogs rendered through the same pickup/action code as the game.
 for(const loc of [1,2]){const id=await page.evaluate(loc=>{const r=Crypt.state().run;r.locationIndex=loc;const t=r.tiles.find(t=>t.kind==='empty');Object.assign(t,{kind:'t1-event',t1Id:1,revealed:true,cleared:false,foe:null});return t.id},loc);await action('pickup',id);await check('t1-event-'+loc);assert.ok(await page.locator('.t1-scene-emblem').evaluate(el=>getComputedStyle(el).backgroundImage.includes('/ui/illustrated/')));await action('close')}
 assert.deepEqual(errors,[]);console.log('PASS illustrated UI: '+screens+' screens, all phone sizes, no overflow/missing art, all navigation, scrollable gear, readable comparison, books, title focus, caves, forest/T1 events and 18 mining nodes');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
