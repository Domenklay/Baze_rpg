/* UI regression: NODE_PATH pointing at Playwright, UI_URL=http://127.0.0.1:8123 node cryptbound/tests/ui.cjs
   Serve cryptbound/src/main/assets. Uses Chromium provided by the development environment. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try {
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
 const url=process.env.UI_URL||'http://127.0.0.1:8123';
 await page.goto(url);await page.locator('.village-scene').waitFor();
 assert.equal(await page.locator('#navbar').isVisible(),true);
 assert.equal(await page.locator('.act-entry').count(),10);
 await page.locator('.act-entry').first().locator('summary').click();assert.equal(await page.locator('.act-entry[open] li').count(),3);
 if(process.env.UI_SCREENSHOTS){fs.mkdirSync(process.env.UI_SCREENSHOTS,{recursive:true});await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/village.png'});}
 await page.locator('#navbar [data-action="choose"]').click();
 assert.equal(await page.locator('[data-action="begin"]').count(),6);
 await page.locator('[data-action="begin"][data-id="executioner"]').click();
 assert.equal(await page.locator('#navbar').isVisible(),false);
 assert.equal(await page.locator('.maze .tile').count(),25);
 assert.equal(await page.locator('.quick-spell').count(),3);
 assert.equal(await page.locator('.dungeon-potion-slot').count(),3);
 for(const [width,height] of [[320,568],[360,640],[390,844],[430,932]]){
  await page.setViewportSize({width,height});
  const geometry=await page.evaluate(()=>{const b=document.querySelector('.maze').getBoundingClientRect(),t=document.querySelector('.maze .tile').getBoundingClientRect(),dock=document.querySelector('.battle-dock').getBoundingClientRect();return {board:b.width-b.height,tile:t.width-t.height,bottom:dock.bottom,width:document.body.scrollWidth};});
  assert.ok(Math.abs(geometry.board)<1,'Square board at '+width);
  assert.ok(Math.abs(geometry.tile)<1,'Square tiles at '+width);
  assert.ok(geometry.bottom<=height+1,'Battle controls fit at '+width+'×'+height);
  assert.ok(geometry.width<=width,'No horizontal overflow');
 }
 await page.setViewportSize({width:390,height:844});
 const turns=await page.evaluate(()=>Crypt.state().run.turn);
 await page.locator('[data-action="ui-panel"][data-id="bag"]').click();
 assert.equal(await page.locator('.paper-doll .gear-slot').count(),9);
 assert.equal(await page.locator('.inventory-stats dt').count(),8);
 assert.ok(await page.locator('.inventory-grid').evaluate(el=>el.scrollHeight>el.clientHeight),'Backpack scrolls');
 await page.locator('.gear-slot[data-id="weapon"]').click();await page.locator('.gear-two-columns').waitFor();
 await page.locator('.dialog [data-action="ui-panel"][data-id="bag"]').click();
 assert.equal(await page.evaluate(()=>Crypt.state().run.turn),turns,'Inventory and comparison are free');
 if(process.env.UI_SCREENSHOTS)await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/inventory.png'});
 await page.locator('.panel-close').click();
 await page.locator('[data-action="ui-panel"][data-id="spells"]').click();
 await page.locator('[data-action="spell-school"][data-id="fire"]').click();
 await page.locator('[data-action="spell-rank"][data-id="2"]').click();
 assert.equal(await page.locator('.book-spell').count(),1);
 assert.ok((await page.locator('.book-spell small').innerText()).startsWith('2★'));
 await page.locator('.book-spell').click();await page.locator('[data-action="pin-spell"]').click();
 assert.equal(await page.evaluate(()=>Crypt.state().run.quickSpells.length),1);
 await page.locator('[data-action="spell-page"][data-id="special"]').click();
 assert.equal(await page.locator('.book-spell').count(),1);assert.ok((await page.locator('.book-spell small').innerText()).startsWith('6★'));
 await page.locator('[data-action="spell-school"][data-id="all"]').click();
 assert.equal(await page.locator('.book-spell').count(),6);
 if(process.env.UI_SCREENSHOTS)await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/spellbook.png'});
 await page.locator('.panel-close').click();
 await page.evaluate(()=>{const r=Crypt.state().run;r.hp-=20;r.scrolls.heal=1;Crypt.debug.draw();});
 const castBefore=await page.evaluate(()=>({turn:Crypt.state().run.turn,hp:Crypt.state().run.hp,mp:Crypt.state().run.mp}));
 await page.locator('[data-action="ui-panel"][data-id="spells"]').click();
 await page.locator('[data-action="spell-page"][data-id="rank"]').click();
 await page.locator('[data-action="spell-rank"][data-id="0"]').click();
 await page.locator('[data-action="spell-school"][data-id="light"]').click();
 await page.locator('[data-action="spell-detail"][data-id="heal"]').click();
 await page.locator('[data-action="cast-modal"][data-id="heal"]').click();
 assert.equal(await page.locator('.dialog').count(),0,'Casting returns to the board');
 const castAfter=await page.evaluate(()=>({turn:Crypt.state().run.turn,hp:Crypt.state().run.hp,mp:Crypt.state().run.mp,scrolls:Crypt.state().run.scrolls.heal}));
 assert.equal(castAfter.turn,castBefore.turn+1);assert.equal(castAfter.scrolls,0);assert.ok(castAfter.hp>castBefore.hp);assert.ok(castAfter.mp<castBefore.mp);
 await page.evaluate(()=>{Crypt.state().run.ep=100;Crypt.debug.draw();});
 await page.locator('[data-action="ui-panel"][data-id="talents"]').first().click();
 await page.locator('[data-action="tree"][data-id="0"]').click();
 assert.equal(await page.locator('.talent-dot').count(),15);
 assert.equal(await page.locator('.talent-lines path').count(),14);
 await page.locator('[data-action="title-detail"][data-id="blade"]').click();
 await page.locator('[data-action="talent"][data-id="blade"]').click();
 assert.equal(await page.evaluate(()=>Crypt.state().run.talents.blade),1);
 await page.locator('[data-action="title-detail"][data-id="iron"]').click();
 await page.locator('[data-action="talent"][data-id="iron"]').click();
 await page.locator('[data-action="title-detail"][data-id="duelist"]').click();
 assert.equal(await page.locator('.talent-inspector [data-action="talent"]').isDisabled(),true,'Sibling path remains locked');
 if(process.env.UI_SCREENSHOTS)await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/talents.png'});
 await page.locator('.panel-close').click();
 await page.evaluate(()=>{Crypt.state().run.poisonTurns=3;Crypt.debug.draw();});
 await page.locator('[data-action="effect-info"][data-id="poisonTurns"]').click();
 assert.ok((await page.locator('.dialog').innerText()).includes('Отравление'));await page.locator('[data-action="close"]').click();
 const before=await page.evaluate(()=>Crypt.state().run.turn);
 await page.locator('.tile-frontier').first().click();
 assert.equal(await page.evaluate(()=>Crypt.state().run.turn),before+1);
 // Inspect each location and load both original texture layers. No broken resources.
 for(let act=0;act<10;act++)for(let loc=0;loc<3;loc++){
  await page.evaluate(([a,l])=>{const r=Crypt.state().run;r.actIndex=a;r.locationIndex=l;Crypt.debug.draw();},[act,loc]);
  assert.equal(await page.locator('.dungeon-root').getAttribute('data-location'),String(act*3+loc));
  for(const suffix of ['floor','cover'])assert.equal((await page.request.get(url+'/ui/locations/'+(act*3+loc)+'-'+suffix+'.svg')).status(),200);
 }
 await page.evaluate(()=>{const r=Crypt.state().run;r.actIndex=0;r.locationIndex=0;r.poisonTurns=0;Crypt.debug.draw();Crypt.save();});
 if(process.env.UI_SCREENSHOTS)await page.screenshot({style:'#toast{display:none!important}',path:process.env.UI_SCREENSHOTS+'/maze.png'});
 const saved=await page.evaluate(()=>({turn:Crypt.state().run.turn,quick:Crypt.state().run.quickSpells[0]}));
 await page.reload();assert.deepEqual(await page.evaluate(()=>({turn:Crypt.state().run.turn,quick:Crypt.state().run.quickSpells[0]})),saved);
 assert.deepEqual(errors,[]);
 console.log('PASS mobile UI: 4 viewport sizes, 30 locations, inventory, spell filters/quick slot, talent forks, buffs, turn cost, save/reload; no browser or asset errors');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
