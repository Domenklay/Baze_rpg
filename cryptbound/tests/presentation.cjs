/* Focused browser checks for painted surfaces, class slots, pose lifetime and combat feedback. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:780}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
  await page.goto(process.env.UI_URL||'http://127.0.0.1:8123');
  await page.evaluate(()=>Crypt.debug.action('chronicles'));
  assert.equal(await page.locator('.painted-relic').count(),6);
  await page.waitForFunction(()=>[...document.querySelectorAll('.painted-relic')].every(img=>img.complete&&img.naturalWidth>0));
  assert.ok(await page.locator('.meta-relic').evaluateAll(cards=>cards.every(el=>getComputedStyle(el).opacity==='1')));
  if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.locator('.dialog').evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.screenshot({path:process.env.UI_SCREENSHOTS+'/relics.png'});}
  await page.evaluate(()=>Crypt.debug.action('close'));
  await page.locator('#navbar [data-action="choose"]').click();await page.locator('[data-action="begin"][data-id="necromancer"]').click();
  assert.equal(await page.locator('.ability-empty:disabled').count(),2);assert.equal(await page.locator('.quick-spells [data-action="cast-modal"]').count(),0);
  const turn=await page.evaluate(()=>Crypt.state().run.turn);await page.locator('.hero-skill').click();assert.equal(await page.evaluate(()=>Crypt.state().run.turn),turn,'The portrait no longer casts the ability');
  await page.locator('.class-ability').click();assert.ok(await page.evaluate(()=>Crypt.state().run.summon));
  await page.waitForTimeout(1120);assert.equal(await page.locator('.hero-skill .single-pose').count(),0);
  const enemyId=await page.evaluate(()=>{
   const r=Crypt.state().run,t=r.tiles.find(t=>t.foe);r.hp=Crypt.debug.stats().hp;r.mp=Crypt.debug.stats().mp;
   for(const other of r.tiles)if(other.foe)other.revealed=false;
   Object.assign(t.foe,{id:'r1_10',name:'Рой лесных пчёл',hp:500,maxHp:500,atk:1,def:0,cooldown:99,guard:0,evadeCharges:0});t.revealed=true;
   r.summon.specialCooldown=4;Crypt.debug.draw();return t.id;
  });
  const mark=await page.evaluate(()=>CryptFeedback.events().at(-1)?.id||0);
  await page.locator('.maze [data-id="'+enemyId+'"][data-action="strike"]').click();
  const heroSrc=await page.locator('.hero-skill img').getAttribute('src');assert.match(heroSrc,/mage_m_attack(?:_[23])?\.png$/);
  assert.equal(await page.locator('.hero-skill img').count(),1);
  await page.evaluate(()=>Crypt.debug.draw());assert.equal(await page.locator('.hero-skill img').getAttribute('src'),heroSrc);
  assert.ok((await page.locator('[data-unit="summon"] img').getAttribute('src')).endsWith('summon-guard-attack.png'));
  assert.ok((await page.locator('[data-unit="enemy:'+enemyId+'"] img').getAttribute('src')).endsWith('/attack.png'));
  assert.ok(await page.locator('.combat-float.fx-damage').count());assert.ok(await page.locator('.combat-float.fx-action').count());
  const effects=await page.evaluate(id=>CryptFeedback.events().filter(e=>e.id>id),mark);
  assert.ok(effects.some(e=>e.actor==='summon'&&e.text==='Костяной удар'));
  assert.ok(effects.some(e=>e.actor==='enemy:'+enemyId&&e.kind==='damage'));
  if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/combat-feedback.png'});}
  await page.locator('.maze [data-id="'+enemyId+'"][data-action="strike"]').click();
  assert.notEqual(await page.locator('.hero-skill img').getAttribute('src'),heroSrc,'The next attack picks another frame');
  await page.waitForTimeout(180);
  const noOverlap=await page.locator('.combat-float').evaluateAll(els=>{const actors={};for(const el of els)(actors[el.dataset.actor]||(actors[el.dataset.actor]=[])).push(el.getBoundingClientRect());return Object.values(actors).every(boxes=>{boxes.sort((a,b)=>a.top-b.top);return boxes.every((b,i)=>!i||boxes[i-1].bottom<=b.top+1);});});
  assert.ok(noOverlap,'Rapid attacks stack labels instead of overlapping');
  await page.waitForTimeout(1120);assert.ok((await page.locator('.hero-skill img').getAttribute('src')).endsWith('_idle.png'));
  assert.ok((await page.locator('[data-unit="summon"] img').getAttribute('src')).endsWith('summon-guard.png'));
  assert.ok((await page.locator('[data-unit="enemy:'+enemyId+'"] img').getAttribute('src')).endsWith('/idle.png'));
  await page.waitForFunction(()=>document.querySelectorAll('.combat-float').length===0,null,{timeout:2500});
  await page.evaluate(()=>{const r=Crypt.state().run;r.summon.specialCooldown=1;});await page.locator('[data-action="wait"]').click();
  assert.ok((await page.locator('[data-unit="summon"] img').getAttribute('src')).endsWith('summon-guard-skill.png'));
  await page.evaluate(()=>{const r=Crypt.state().run;r.hp=Math.max(1,Crypt.debug.stats().hp-25);r.scrolls.heal=1;r.mp=Crypt.debug.stats().mp;});
  await page.locator('[data-action="ui-panel"][data-id="spells"]').click();assert.equal(await page.locator('.combat-float').count(),0,'Opening a modal removes old floating labels');
  await page.locator('[data-action="spell-school"][data-id="light"]').click();await page.locator('[data-action="spell-detail"][data-id="heal"]').click();
  await page.locator('.dialog [data-action="cast-modal"][data-id="heal"]').click();assert.ok(await page.locator('.combat-float.fx-heal').count());
  assert.equal(await page.locator('.hero-skill img').count(),1);assert.match(await page.locator('.hero-skill img').getAttribute('src'),/mage_m_skill(?:_[23])?\.png$/);
  // Exercise real loot/event code rather than constructing lookalike DOM.
  await page.evaluate(()=>{const r=Crypt.state().run,t=r.tiles.find(t=>t.kind==='empty');t.kind='chest';t.revealed=true;t.cleared=false;const old=Math.random;Math.random=()=>.1;try{Crypt.debug.action('pickup',t.id);}finally{Math.random=old;}});
  assert.ok(await page.locator('.loot-gear').count());
  const lootBox=await page.locator('.loot-gear img').first().boundingBox();assert.ok(lootBox.width<=54&&lootBox.height<=54,'Loot icon is bounded');
  if(process.env.UI_SCREENSHOTS)await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/loot.png'});
  await page.locator('.dialog [data-action="close"]').last().click();
  await page.locator('[data-action="ui-panel"][data-id="bag"]').click();await page.locator('.gear-slot[data-id="weapon"]').click();
  const style=await page.evaluate(()=>{const name=document.querySelector('.gear-two-columns b'),caption=document.querySelector('.comparison-caption'),note=document.querySelector('.comparison-sheet .fine');return {font:getComputedStyle(name).fontFamily,captionFont:getComputedStyle(caption).fontFamily,opacity:getComputedStyle(note).opacity,nameColor:getComputedStyle(name).color,frame:getComputedStyle(document.querySelector('.dialog')).borderImageSource};});
  assert.equal(style.font,style.captionFont);assert.equal(style.opacity,'1');assert.ok(style.frame.includes('/ui/skin/panel.png'));assert.equal(style.nameColor,'rgb(241, 217, 173)');
  if(process.env.UI_SCREENSHOTS)await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/comparison.png'});
  await page.locator('.panel-close').click();await page.locator('.panel-close').click();
  await page.evaluate(()=>{const r=Crypt.state().run,t=r.tiles.find(t=>t.kind==='empty');t.kind='puzzle';t.revealed=true;t.cleared=false;Crypt.debug.action('pickup',t.id);});
  assert.ok(await page.locator('.dialog-event').count());assert.ok(await page.locator('[data-action="puzzle-answer"]').count());
  if(process.env.UI_SCREENSHOTS)await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/event.png'});
  const last=await page.evaluate(()=>CryptFeedback.events().at(-1)?.id||0);await page.evaluate(()=>Crypt.debug.action('begin','necromancer'));
  assert.equal(await page.evaluate(()=>CryptFeedback.events().at(-1)?.id||0),last,'Starting a new run does not manufacture damage/healing');
  assert.deepEqual(errors,[]);console.log('PASS painted UI: class slots, non-repeating single poses, 1-second reset, skeleton attack/special, floating damage/heal/actions, bounded loot, readable comparison and events');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
