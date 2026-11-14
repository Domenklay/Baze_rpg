/* Run with Node 20+: node cryptbound/tests/smoke.cjs */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../src/main/assets');
const elements={},storage={},events={};
function el(id){return elements[id]||(elements[id]={id,innerHTML:'',textContent:'',style:{},scrollTop:0,
 classList:{add(){},remove(){},toggle(){}}});}
const win={addEventListener(n,fn){events['window.'+n]=fn;}};
const doc={hidden:false,getElementById:el,querySelector(){return null},querySelectorAll(){return[]},
 addEventListener(n,fn){events['document.'+n]=fn;}};
const ctx={window:win,document:doc,Date,Math,
 localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]},
 setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,console};
vm.createContext(ctx);
const sources=['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','gumballs_titles_reference.js','titles_runtime.js','expansion.js','clicker_data.js','dungeons.js','clicker_rules.js','systems.js','boss_scripts.js','story_events.js','balance.js','combat_feedback.js','hunter_bestiary.js','forest_encounters.js','t1_encounters.js','game.js'];
for(const file of sources){if(file==='gumballs_titles_reference.js')win.CryptLegacyTitles=win.CryptTitles;vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file,timeout:12000});}
const api=win.Crypt,rawAction=api.debug.action,DB=win.ClickerData,CR=win.ClickerRules,DN=win.CryptDungeons;
/* Existing v0.7.2 tests skip directly to distant floors. Claim the newly required book
   before those test shortcuts; hunter_book.cjs tests the actual locked descent. */
function A(name,id){
 rawAction(name,id);
 if(name==='begin'){
  const run=api.state().run,meta=api.state().meta;
  if(run&&run.actIndex===0&&run.locationIndex===0&&!win.CryptHunterBook.owned(meta)){
   const corpse=run.tiles.find(t=>t.kind==='hunter-corpse');
   if(corpse){corpse.revealed=true;rawAction('pickup',corpse.id);rawAction('close');}
  }
 }
}
/* Combat fixtures keep enemies reachable; unexcavated paths are prohibited. */
function standNextTo(run,enemyTile){
 const neighbor=CR.near(enemyTile.id).find(id=>id>=0&&id<run.tiles.length);
 assert.notEqual(neighbor,undefined);
 const land=run.tiles[neighbor];
 land.kind='empty';land.foe=null;land.drops=null;land.revealed=true;land.cleared=true;
 run.heroTile=neighbor;
}
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
A('choose');
test('Six selectable classes and 18 authentic offline sprite frames',()=>{
 assert.equal((el('overlay').innerHTML.match(/class-option/g)||[]).length,6);
 for(const key of ['strength_m','strength_f','rogue_m','rogue_f','mage_m','mage_f']){
  for(const pose of ['idle','attack','skill'])
   assert.ok(fs.statSync(path.join(root,'imported',key+'_'+pose+'.png')).size>1000);
  for(const pose of ['attack','skill'])for(const step of [2,3])
   assert.ok(fs.statSync(path.join(root,'imported',key+'_'+pose+'_'+step+'.png')).size>1000);
 }
});
test('Ten acts and thirty dungeon locations with original region monsters',()=>{
 assert.equal(DN.acts.length,10);
 assert.equal(DN.acts.flatMap(a=>a.locations).length,30);
 for(const act of DN.acts)for(const loc of act.locations){
  assert.equal(loc.mobs.length,10);
  assert.equal(loc.elites.length,5);
  assert.ok(loc.boss.name&&loc.boss.loot.length);
 }
 assert.equal(DN.bossFloor(5),false);
 assert.equal(DN.bossFloor(30),true);
 assert.equal(DN.bossFloor(40),true);
 assert.equal(DN.bossFloor(35),false);
 assert.equal(DN.rewardMultiplier(50),2);
});
test('Six imported T1–T2 regions, 156 unique monsters, 12 sets and 24 weapons',()=>{
 assert.equal(DB.regions.length,6);
 assert.equal(DB.regions.reduce((sum,x)=>sum+x.enemies.length,0),156);
 assert.equal(DB.sets.length,12);
 assert.equal(DB.weapons.length,24);
 assert.ok(DB.regions[0].enemies[0].loot.some(x=>x.chance===100));
});
A('begin','necromancer');
const state=api.state();let r=state.run;
test('New expeditions start without equipment placeholders',()=>{
 assert.equal(r.items.length,0);
 assert.equal(Object.values(r.equip).filter(Boolean).length,0);
});
r.hp=5000;r.mp=5000;
test('65 original title nodes, exclusive branches and rank upgrades',()=>{
 const titles=win.CryptTitles,system=win.CryptTitlesRuntime;
 assert.equal(titles.length,65);
 assert.equal(titles.filter(t=>t.tree===0).length,22);
 assert.equal(titles.filter(t=>t.tree===1).length,22);
 assert.equal(titles.filter(t=>t.tree===2).length,21);
 const oldEp=r.ep,oldTitles=Object.assign({},r.talents),oldSupplies=Object.assign({},r.titleSupplies);
 r.ep=10000;
 A('talent','adv_seeker');A('talent','adv_explorer');assert.ok(r.talents.adv_explorer>0);
 let before=r.ep;A('talent','adv_explorationist');assert.equal(r.ep,before);
 assert.equal(r.talents.adv_explorationist||0,0);
 A('talent','adv_night_walker');assert.ok(r.talents.adv_night_walker>0);
 before=r.ep;A('talent','adv_demon_hunter');assert.equal(r.ep,before);
 assert.equal(r.talents.adv_demon_hunter||0,0);
 A('talent','adv_magic_bandit');assert.ok(r.talents.adv_magic_bandit>0);
 before=r.ep;A('talent','adv_elven_ranger');assert.equal(r.ep,before);
 const rank=r.talents.adv_night_walker;A('talent','adv_night_walker');
 assert.equal(r.talents.adv_night_walker,rank+1);
 A('talent','adv_god_thieves');assert.equal(r.talents.adv_god_thieves,1);
 r.ep=1000;A('title-mastery','adv_god_thieves:atk');
 assert.equal(r.titleMastery.adv_god_thieves.atk,1);
 assert.equal(system.toolOf(r).icon,'lantern');
 r.talents=oldTitles;r.titleSupplies=oldSupplies;r.titleMastery={};r.ep=oldEp;api.debug.draw();
});

test('Adventure remains, soul use and one-time treasure',()=>{
 const old=Object.assign({},r.talents);
 const originalTiles=JSON.parse(JSON.stringify(r.tiles));
 r.talents.adv_seeker=1;r.talents.adv_explorer=1;r.talents.adv_night_walker=1;r.talents.adv_magic_bandit=1;r.talents.adv_farplane=1;
 const corpse=r.tiles.find(x=>x.kind==='empty'&&!x.revealed);assert.ok(corpse);
 corpse.kind='corpse';corpse.corpseId='storm-smith';corpse.revealed=true;corpse.cleared=false;
 const n=r.items.length,before=state.seq;
 A('pickup',corpse.id);assert.equal(corpse.cleared,true);
 assert.equal(r.items.length,n+1);
 assert.ok(r.journalNotes.some(x=>x.includes('Павший механик')));
 const soul=r.soulBag.find(x=>x.storyId==='storm-smith');assert.ok(soul);
 A('close');A('ui-panel','bag');
 assert.match(el('overlay').innerHTML,/Собранные души/);
 A('consume-soul',soul.id);assert.equal(r.soulBag.some(x=>x.id===soul.id),false);
 assert.ok(r.items.some(x=>x.name==='Грозовая перчатка'&&x.stormCharge));
 A('pickup',corpse.id);assert.equal(state.seq,before+3);
 r.tiles=originalTiles;r.talents=old;r.tab='maze';api.debug.draw();
});


test('Side chamber guard, central loot and talent-gated secret',()=>{
 const old=Object.assign({},r.talents);
 const originalTiles=JSON.parse(JSON.stringify(r.tiles));
 r.talents.adv_seeker=1;r.talents.adv_explorer=1;r.talents.adv_night_walker=1;r.talents.adv_magic_bandit=1;r.talents.adv_god_thieves=1;
 const room=r.tiles.find(x=>x.kind==='empty'&&!x.revealed);assert.ok(room);
 room.kind='chamber';room.revealed=true;room.cleared=false;
 A('pickup',room.id);assert.ok(room.room);
 room.room.secret=true;
 assert.match(el('content').innerHTML,/chamber-maze/);
 assert.equal(el('overlay').innerHTML,'');
 let attempts=0;r.hp=5000;
 while(room.room.guardHp>0&&attempts++<60)A('chamber-fight',room.id);
 assert.equal(room.room.guardHp,0);
 A('chamber-reward',room.id);assert.equal(room.room.rewardTaken,true);
 assert.equal(room.cleared,false);
 const prev=r.secrets;
 A('chamber-secret',room.id);assert.equal(room.cleared,true);
 assert.equal(room.kind,'chamber');assert.equal(r.secrets,prev+1);
 A('chamber-secret',room.id);assert.equal(r.secrets,prev+1);
 A('chamber-exit');r.tiles=originalTiles;r.talents=old;api.debug.draw();
});

test('Random hero origin with connected orthogonal exploration',()=>{
 assert.equal(r.tiles.length,25);
 const origin=r.tiles.find(t=>t.kind==='start');
 assert.ok(origin);assert.equal(r.heroTile,origin.id);
 assert.match(el('content').innerHTML,/tile-origin/);
 assert.match(el('content').innerHTML,/hero-on-board/);
 assert.ok(r.tiles.filter(t=>t.revealed).length<=3);
 const far=r.tiles.find(t=>!t.revealed&&CR.near(origin.id).indexOf(t.id)===-1);
 const turn=r.turn;A('reveal',far.id);
 assert.equal(r.turn,turn);
 assert.equal(far.revealed,false);
 const close=r.tiles.find(t=>CR.exploreStatus(t,r.tiles).ok);
 assert.ok(close);const old=r.turn;A('reveal',close.id);
 assert.equal(close.revealed,true);assert.equal(r.turn,old+1);
});
test('Melee blocker stops neighboring research; single ranged exception does not',()=>{
 const grid=Array.from({length:25},(_,id)=>({id,kind:id===12?'start':'empty',revealed:id===12||id===13,foe:null}));
 grid[7].revealed=true;
 grid[7].foe={hp:9,ranged:false};
 assert.equal(CR.exploreStatus(grid[8],grid).ok,false);
 grid[7].foe.ranged=true;
 assert.equal(CR.exploreStatus(grid[8],grid).ok,true);
 assert.deepEqual(Array.from(CR.near(12)).sort((a,b)=>a-b),[7,11,13,17]);
});
test('Necromancer finds a legitimate summon tile and fills a hidden empty when needed',()=>{
 // Suppress existing visible empty tiles: the only safe spawn is hidden.
 r.tiles.forEach(t=>{if(t.kind==='empty'&&t.revealed){t.revealed=false;t.cleared=false;}});
 r.summon=null;r.summonTile=null;r.mp=1000;
 A('skill');assert.ok(r.summon&&r.summon.hp>0);
 assert.notEqual(r.summonTile,r.heroTile);
 const cell=r.tiles[r.summonTile];
 assert.equal(cell.kind,'empty');assert.equal(cell.revealed,true);
 assert.match(el('content').innerHTML,/tile-summon/);
 assert.match(el('content').innerHTML,/unit-hp/);
});
test('Six hero archetypes have distinct starting skills',()=>{
 for(const klass of ['necromancer','executioner','scout','sorceress','guardian','assassin']){
  A('begin',klass);r=state.run;r.mp=1000;r.hp=5000;
  if(klass!=='necromancer'){
   // Skill targets must actually be reachable from the hero's starting tile.
   const target=r.tiles.find(t=>t.foe&&!t.foe.ranged);
   const next=CR.near(r.heroTile)[0],adjacent=r.tiles[next];
   assert.ok(target&&adjacent);
   if(target!==adjacent){adjacent.foe=target.foe;target.foe=null;}
   adjacent.kind='enemy';adjacent.revealed=true;adjacent.cleared=false;
   adjacent.foe.hp=200;adjacent.foe.maxHp=200;
  }
  A('skill');
  assert.ok(r.turn>=1);
  assert.ok(r.mp<1000);
  assert.ok(r.fx==='skill');
 }
});
A('begin','necromancer');r=state.run;r.hp=5000;r.mp=5000;
test('A hidden archer shoots every two turns and does not block exploration',()=>{
 r.tiles.forEach(t=>{if(t.foe){t.foe.hp=0;}});
 r.summon=null;r.summonTile=null;r.shield=0;r.poisonTurns=0;
 const t=r.tiles.find(t=>t.kind!=='start');assert.ok(t);t.kind='enemy';t.revealed=true;
 t.foe={id:'ranger_test',name:'Разбойник-лучник',visual:'cultist',hp:70,maxHp:70,
  atk:12,baseAtk:12,def:0,ranged:true,attackCooldown:2,cooldown:3,skill:{name:'Дальний выстрел',every:3,kind:'shot'},burn:0,stun:0,poison:0,loot:[]};
 const oldHp=r.hp;
 A('wait');assert.equal(r.hp,oldHp);
  A('wait');assert.ok(r.hp<oldHp);
  assert.equal(t.foe.attackCooldown,2);
});
test('Opening and collecting a find each consume exactly one turn',()=>{
 const t=r.tiles.find(x=>x.kind==='coin')||r.tiles.find(x=>x.kind==='empty');assert.ok(t);if(t.kind==='empty')t.kind='coin';
 const safe=CR.near(r.tiles.find(t=>t.kind==='start').id).find(id=>!r.tiles[id].revealed);
 if(safe!==undefined){
  const tt=r.tiles[safe];tt.kind='coin';tt.foe=null;tt.cleared=false;
  const start=r.turn;A('reveal',tt.id);assert.equal(r.turn,start+1);
  const opened=r.turn;A('pickup',tt.id);assert.equal(r.turn,opened+1);
  assert.equal(tt.cleared,true);
 }else{
  t.revealed=true;t.cleared=false;
  const before=r.turn;A('pickup',t.id);assert.equal(r.turn,before+1);
 }
 assert.equal(el('overlay').innerHTML,'');
});
test('Permanent T1 material drops are sourced from the imported monster table',()=>{
 const source=DB.regions[0].enemies[0];
 const t=r.tiles[5];t.kind='enemy';t.revealed=true;t.cleared=false;
 t.foe={id:source.id,name:source.name,visual:'wolf',hp:1,maxHp:1,atk:3,def:0,
  ep:1,gold:2,ranged:false,burn:0,poison:0,stun:0,guard:0,loot:source.loot,
  skill:{name:'Укус',every:3,kind:'bite'},cooldown:3};
 standNextTo(r,t);A('strike',t.id);assert.ok(t.drops);
 assert.ok(t.drops.materials.length>=1);
 const got=t.drops.materials[0];const before=r.materials[got.name]||0;
 A('pickup',t.id);
 assert.ok(r.materials[got.name]>=before+got.qty);
});
test('3/4-piece sets use real slots and situational effects instead of Clicker bonuses',()=>{
 const previous=api.debug.stats().def;
 const four=['helm','armor','bracer','boots'].map(slot=>Object.assign({
  id:++state.seq,plus:0,floor:1,fixed:true},CR.gear(slot,1,0)));
 four.forEach(item=>{r.items.push(item);r.equip[item.slot]=item.id;});
 assert.equal(CR.counts(r.equip,r.items).stone_oath,4);
 assert.deepEqual(Array.from(CR.thresholds('stone_oath')),[2,4]);
 assert.ok(CR.bonuses(r.equip,r.items).entryShield>0);
 assert.ok(api.debug.stats().def>previous);
 A('gear-sets');
 assert.match(el('overlay').innerHTML,/АКТИВНЫЕ КОМПЛЕКТЫ/);
 assert.match(el('overlay').innerHTML,/4 предмета/);
});
test('Compact modal compares fixed equipment with set bonuses',()=>{
 A('inspect-slot','helm');
 assert.equal(r.tab,'maze');
 assert.match(el('overlay').innerHTML,/gear-two-columns/);
 assert.match(el('overlay').innerHTML,/compact-set-help/);
 assert.match(el('overlay').innerHTML,/2 предмета/);
 A('close');
});
test('Village permanently consumes material quantities for upgrades',()=>{
 state.meta.materials['Шкура животного']=18;
 const before=api.debug.stats().atk,old=state.meta.city.forge;
 A('town-upgrade','forge');
 assert.equal(state.meta.city.forge,old+1);
 assert.ok(api.debug.stats().atk>=before+2);
 A('town');assert.match(el('overlay').innerHTML,/ПОГРАНИЧНЫЙ ПРИВАЛ/);
 assert.match(el('overlay').innerHTML,/СКЛАД/);A('close');
});
test('Hero actions choose one original frame, retain it on redraw and never repeat the previous variant',()=>{
 r.tab='maze';r.mp=10000;r.hp=10000;
 const target=r.tiles.find(t=>t.foe&&t.foe.hp>0);assert.ok(target);
 target.revealed=true;target.foe.hp=100000;target.foe.maxHp=100000;
 standNextTo(r,target);
 let previous=null;
 for(let i=0;i<5;i++){
  A('strike',target.id);const html=el('portrait').innerHTML;
  assert.equal((html.match(/<img /g)||[]).length,1);
  const src=html.match(/src="([^"]+)"/)[1];assert.match(src,/mage_m_attack(?:_[23])?\.png$/);
  if(previous)assert.notEqual(src,previous);
  api.debug.draw();assert.ok(el('portrait').innerHTML.includes(src),'Redraw keeps this action frame');previous=src;
 }
 previous=null;
 for(let i=0;i<4;i++){
  r.skillUsed=r.turn-10;A('skill');const html=el('portrait').innerHTML;
  assert.equal((html.match(/<img /g)||[]).length,1);
  const src=html.match(/src="([^"]+)"/)[1];assert.match(src,/mage_m_skill(?:_[23])?\.png$/);
  if(previous)assert.notEqual(src,previous);previous=src;
 }
 assert.ok(r.fxUntil>Date.now()+800,'Pose lasts about one second');
 const effects=win.CryptFeedback.events();
 assert.ok(effects.some(x=>x.kind==='damage'&&x.actor.startsWith('enemy:')));
 assert.ok(effects.some(x=>x.kind==='action'&&x.actor==='summon'));
});
test('Saves remain local and APK has no Internet permission',()=>{
 api.save();
 assert.ok(storage.cryptbound_local_v1);
 assert.equal(JSON.parse(storage.cryptbound_local_v1).run.class,'necromancer');
 const manifest=fs.readFileSync(path.resolve(__dirname,'../src/main/AndroidManifest.xml'),'utf8');
 assert.ok(!manifest.includes('android.permission.INTERNET'));
});

test('Three-location expedition: only boss portals bank loot and preserve talent/equipment',()=>{
 A('begin','necromancer');let run=state.run;
 const firstStock=state.meta.materials['Экспедиционный образец']||0;
 const firstDiamond=state.meta.diamonds||0,firstRainbow=state.meta.rainbowDiamonds||0;
 run.materials['Экспедиционный образец']=20;run.diamonds=3;run.gold=88;
 run.talents.adv_seeker=1;run.scrolls.bolt=7;
 const equippedIds=Object.values(run.equip).filter(Boolean);
 A('safe-portal');assert.equal(state.run,run);
 for(let stage=0;stage<3;stage++){
  run=state.run;assert.ok(run);
  // Salvage uses actually found items; a new run starts with none.
  if(stage===2)run.items.push(Object.assign({id:++state.seq,plus:0,floor:1,fixed:true,rarity:1},CR.gear('weapon',1,0)));
  assert.equal(run.locationIndex,stage);
  assert.equal(run.floor,1);
  run.floor=29;run.hp=5000;run.mp=5000;run.key=true;
  run.tiles.find(t=>t.kind==='exit').revealed=true;
  A('descend');assert.equal(run.floor,30);
  const boss=run.tiles.find(t=>t.kind==='boss');assert.ok(boss);
  assert.equal(boss.foe.name,DN.location(0,stage).boss.name);
  run.tiles.forEach(t=>{if(t.foe&&t!==boss)t.foe.hp=0;});
  boss.foe.hp=1;boss.revealed=true;standNextTo(run,boss);A('strike',boss.id);
  assert.equal(run.portalReady,true);
  assert.match(el('content').innerHTML,/safe-portal/);
  assert.ok(run.questItems.includes(DN.location(0,stage).questItem));
  A('safe-portal');
  assert.equal(state.run,null);
  if(stage<2){
   const carry=state.meta.activeExpedition;assert.ok(carry);
   assert.equal(carry.locationIndex,stage+1);
   assert.ok(carry.gold>=88); // Full-cleared floors pay extra gold.
   assert.equal(carry.scrolls.bolt,7);
   assert.equal(carry.talents.adv_seeker,1);
   for(const id of equippedIds)assert.ok(carry.items.some(i=>i.id===id));
   assert.equal(state.meta.materials['Экспедиционный образец'],firstStock+20);
   assert.ok(state.meta.diamonds>=firstDiamond+3);
   A('resume-expedition');run=state.run;
   assert.equal(run.floor,1);assert.equal(run.locationIndex,stage+1);
   assert.equal(run.questItems.length,stage+1);
  }
 }
 assert.equal(state.meta.activeExpedition,null);
 assert.ok(state.meta.completedActs[0]>0);
 assert.ok(state.meta.unlockedAct>=1);
 assert.ok((state.meta.materials['Металлолом']||0)>0);
 assert.ok(state.meta.rainbowDiamonds>firstRainbow);
 A('select-act','1');
 assert.match(el('overlay').innerHTML,/Разломы второго тира/);
 A('begin','scout');
 assert.equal(state.run.actIndex,1);
 assert.equal(state.run.locationIndex,0);
});
test('Escape returns only the agreed unsaved fraction; old stock survives',()=>{
 const stock=state.meta.materials['Незакреплённая руда']||0;
 let run=state.run;run.materials['Незакреплённая руда']=20;
 A('escape-25');assert.equal(state.run,null);
 assert.equal(state.meta.materials['Незакреплённая руда'],stock+5);
 A('begin','scout');run=state.run;run.materials['Незакреплённая руда']=20;
 A('escape-ad');assert.equal(state.run,null);
 assert.equal(state.meta.materials['Незакреплённая руда'],stock+15);
 assert.match(el('overlay').innerHTML,/Спасибо за попытку/);
});
test('Ten acts can each generate their correct regional boss',()=>{
 const oldUnlocked=state.meta.unlockedAct;
 state.meta.unlockedAct=9;
 for(let act=0;act<10;act++){
  state.meta.selectedAct=act;A('begin','necromancer');
  let run=state.run;assert.ok(run);
  assert.equal(run.actIndex,act);
  assert.equal(run.locationIndex,0);
  run.floor=29;run.key=true;
  run.tiles.find(t=>t.kind==='exit').revealed=true;
  A('descend');
  const boss=run.tiles.find(t=>t.kind==='boss');
  assert.ok(boss);assert.equal(boss.foe.name,DN.location(act,0).boss.name);
  A('escape-25');assert.equal(state.run,null);
 }
 state.meta.selectedAct=0;state.meta.unlockedAct=oldUnlocked;
});


test('Elite spawns exactly on floors 10, 20, 30, 40; boss remains on floor 30',()=>{
 A('begin','necromancer');let run=state.run;run.hp=50000;
 const locations=[];
 for(let depth=2;depth<=41;depth++){
  const stair=run.tiles.find(t=>t.kind==='exit');assert.ok(stair);stair.revealed=true;
  run.key=true;
  const livingElite=run.tiles.find(t=>t.foe&&t.foe.elite&&t.foe.hp>0);
  if(livingElite){
   const floorBefore=run.floor;A('descend');
   assert.equal(run.floor,floorBefore,'Living elite must prevent skipping the encounter');
   livingElite.foe.hp=0;
  }
  A('descend');assert.equal(run.floor,depth);
  const elites=run.tiles.filter(t=>t.foe&&t.foe.elite&&t.foe.hp>0);
  assert.equal(elites.length,depth%10===0?1:0,'Elite count at floor '+depth);
  if(elites.length){
   locations.push(depth);
   assert.equal(elites[0].kind,'elite');
   elites[0].revealed=true;window.Crypt.debug.draw();
   assert.match(el('content').innerHTML,/class="elite-tag"/,'Elite must have an unmistakable label');
   assert.match(el('content').innerHTML,/elite-floor-warning/,'Elite floor warning must remain visible');
  }
  if(depth===30||depth===40)assert.equal(run.tiles.filter(t=>t.foe&&t.foe.boss).length,1,
   'The normal boss remains present alongside the elite on floor '+depth);
 }
 assert.deepEqual(locations,[10,20,30,40]);
});
test('Walking takes no turn and cannot cross hidden or occupied cells',()=>{
 A('begin','necromancer');let run=state.run;
 const start=run.tiles.find(t=>t.kind==='start');assert.equal(start.id,run.heroTile);
 const neighbor=CR.near(start.id)[0],step=run.tiles[neighbor];
 step.kind='empty';step.foe=null;step.revealed=true;step.cleared=true;step.drops=null;
 const turn=run.turn;A('move-hero',neighbor);
 assert.equal(run.heroTile,neighbor);assert.equal(run.turn,turn);
 const inaccessible=run.tiles.find(x=>!x.revealed&&x.id!==neighbor);
 const initial=run.heroTile;A('move-hero',inaccessible.id);
 assert.equal(run.heroTile,initial);assert.equal(run.turn,turn);
 step.foe={hp:5,ranged:false};assert.equal(CR.walkPath(run.tiles,start.id,step.id),null);
});
test('Regional boss has warned phases and cannot produce a safe portal before death',()=>{
 A('begin','necromancer');let run=state.run;
 run.hp=50000;run.floor=29;run.key=true;run.tiles.find(t=>t.kind==='exit').revealed=true;
 A('descend');assert.equal(run.floor,30);
 const boss=run.tiles.find(t=>t.foe&&t.foe.boss);assert.ok(boss);
 assert.equal(boss.foe.name,DN.location(0,0).boss.name);
 assert.equal(run.portalReady,false);
 run.tiles.forEach(x=>{if(x.foe&&!x.foe.boss)x.foe.hp=0;});
 boss.revealed=true;boss.foe.hp=Math.floor(boss.foe.maxHp*.66);
  boss.foe.provoked=true;A('wait');assert.equal(boss.foe.phase,2);
  assert.ok(boss.foe.telegraph);
  boss.foe.provoked=true;A('wait');assert.equal(boss.foe.telegraph,null);
  boss.foe.hp=Math.max(1,Math.floor(boss.foe.maxHp*.20));
  for(let attempt=0;attempt<4&&boss.foe.phase<3;attempt++){boss.foe.provoked=true;A('wait');}
 if(boss.foe.phase!==3)console.log('BOSS_PHASE_DIAGNOSTIC',JSON.stringify({phase:boss.foe.phase,hp:boss.foe.hp,maxHp:boss.foe.maxHp,stun:boss.foe.stun,turn:run.turn,heroHp:run.hp,lastLogs:run.log.slice(0,10)}));
 assert.equal(boss.foe.phase,3);
 boss.foe.hp=1;standNextTo(run,boss);A('strike',boss.id);
 assert.equal(run.portalReady,true);
});


test('Visible ranged enemies are a single archetype and emerge sequentially',()=>{
 A('begin','scout');const run=state.run;
 run.floor=17;run.key=true;run.tiles.find(t=>t.kind==='exit').revealed=true;
 A('descend');
 assert.equal(run.floor,18);
 const archers=run.tiles.filter(t=>t.foe&&t.foe.ranged);
 assert.equal(archers.length,2);
 assert.equal(new Set(archers.map(t=>t.foe.id)).size,1);
 assert.deepEqual(Array.from(archers,t=>t.spawnIntro).sort(),[1,2]);
 assert.match(el('content').innerHTML,/tile-ranged-emerge/);
});


test('Alchemy requires real T1/T2 ingredients and fills exactly two prepared slots',()=>{
 let m=state.meta;
 A('escape-25');assert.equal(state.run,null);
 const names=['Болотные споры','Кожа нетопыря','древесина','Горный кристалл'];
 const before=Object.fromEntries(names.map(name=>[name,m.materials[name]||0]));
 names.forEach(name=>m.materials[name]=before[name]+20);
 m.potionStock={};
 const sys=win.CryptSystems;
 assert.deepEqual(Array.from(sys.byPotion.ghost.ingredients,x=>x[0]),['Болотные споры','Кожа нетопыря']);
 A('brew-potion','ghost');A('brew-potion','aegis');
 assert.equal(m.potionStock.ghost,1);assert.equal(m.potionStock.aegis,1);
 assert.equal(m.materials['Болотные споры'],before['Болотные споры']+17);
 assert.equal(m.materials['Кожа нетопыря'],before['Кожа нетопыря']+18);
 assert.equal(m.materials['древесина'],before['древесина']+16);
 assert.equal(m.materials['Горный кристалл'],before['Горный кристалл']+18);
 const current=m.materials['Болотные споры'];
 m.materials['Болотные споры']=0;m.materials['Алхимический ингредиент']=10000;
 A('brew-potion','ghost');assert.equal(m.potionStock.ghost,1,'Unrelated materials must not substitute for spores');
 m.materials['Болотные споры']=current;
 m.preparedLoadout=['ghost','aegis'];
 A('begin','necromancer');let run=state.run;
 assert.deepEqual(Array.from(run.preparedPotions),['ghost','aegis']);
 assert.equal(m.potionStock.ghost,0);
 let previous=run.turn;A('use-prepared','0');assert.ok(run.ghost&&run.ghost.hp>0);
 assert.equal(run.turn,previous+1);assert.equal(run.preparedPotions[0],null);
 previous=run.turn;A('use-prepared','1');assert.equal(run.guardCharges,3);
 assert.equal(run.turn,previous+1);
 assert.equal(run.preparedPotions[1],null);
 A('wait');assert.equal(run.guardCharges,3);
 A('escape-25');assert.equal(state.run,null);
 for(const name of names)m.materials[name]=before[name];
 delete m.materials['Алхимический ингредиент'];
});
test('Spell catalog has 6 schools × 6 ranks, with 6-star rarity isolated',()=>{
 const sys=win.CryptSystems;
 assert.equal(sys.spells.filter(x=>!x.titleOnly).length,36);
 assert.equal(sys.spells.filter(x=>x.titleOnly).length,13);
 for(const school of sys.schools)assert.deepEqual(
  Array.from(sys.spells.filter(x=>!x.titleOnly&&x.school===school.id),x=>x.rank).sort(),[1,2,3,4,5,6]);
});


test('Every regional boss has distinct phase abilities and script mapping',()=>{
 const bosses=win.CryptBossScripts.list;
 assert.equal(bosses.length,30);
 const names=new Set(bosses.flatMap(b=>b.phases.map(p=>p.name)));
 assert.equal(names.size,60);
 for(let act=0;act<10;act++)for(let loc=0;loc<3;loc++){
  assert.equal(win.CryptBossScripts.get(act,loc).phases.length,2);
 }
});


test('Town quest reports are one-time, survive runs and restore one memory chapter per act',()=>{
 assert.ok(state.meta.questReports);
 const keys=['act1-location1','act1-location2','act1-location3'];
 for(const key of keys)assert.ok(state.meta.questReports[key],'Report missing: '+key);
 assert.equal(state.run,null);
 const diamonds=state.meta.diamonds,rainbow=state.meta.rainbowDiamonds;
 const memory=state.meta.materials['Осколок воспоминания']||0;
 A('quest-board');assert.match(el('overlay').innerHTML,/СОВЕТ ДЕРЕВНИ/);
 for(const key of keys)A('claim-quest',key);
 assert.ok(state.meta.memoryChapters.act1);
 assert.equal(state.meta.materials['Осколок воспоминания'],memory+3);
 assert.ok(state.meta.diamonds>diamonds);
 assert.equal(state.meta.rainbowDiamonds,rainbow);
 const after=state.meta.diamonds;
 for(const key of keys)A('claim-quest',key);
 assert.equal(state.meta.diamonds,after);
 assert.equal(Object.keys(state.meta.memoryChapters).length,1);
});
test('One original story event per region contributes journal lore without repeating the reward',()=>{
 const scenes=win.CryptStoryEvents.entries;assert.equal(scenes.length,30);
 assert.equal(new Set(scenes.map(x=>x[0])).size,30);
 A('begin','necromancer');
 const run=state.run;run.hp=9999;
 const point=run.tiles.find(x=>x.kind==='event')||run.tiles.find(x=>x.kind==='empty');assert.ok(point);point.kind='event';point.cleared=false;
 point.revealed=true;A('pickup',point.id);
 assert.equal(run.pendingStory.act,0);
 assert.match(el('overlay').innerHTML,/СЮЖЕТНОЕ СОБЫТИЕ/);
 const journal=run.journalNotes.length;
 const turn=run.turn;
 A('story-choice','investigate');
 assert.equal(run.journalNotes.length,journal+1);
 assert.equal(run.turn,turn+1);
 const keys=Object.keys(run.uniqueFinds).filter(k=>k.startsWith('scene:0:0'));
 assert.equal(keys.length,2);
 point.kind='event';point.cleared=false;point.revealed=true;
 const notes=run.journalNotes.length;
 A('pickup',point.id);
 assert.equal(run.pendingStory,null);
 assert.equal(run.journalNotes.length,notes);
});


test('Pocket rooms accept combat spells, enforce world-magic limit and use protection',()=>{
 let run=state.run;if(!run){A('begin','necromancer');run=state.run;}
 const tile=run.tiles.find(t=>t.kind==='empty');assert.ok(tile);
 tile.kind='chamber';tile.revealed=true;tile.cleared=false;
 run.hp=10000;run.mp=10000;run.poisonTurns=0;run.bleedTurns=0;run.burnTurns=0;
 A('pickup',tile.id);assert.ok(tile.room);assert.equal(run.chamberActive,tile.id);
 for(const g of tile.room.guards){g.hp=1000;g.maxHp=1000;g.cooldown=3;}
 tile.room.guardHp=tile.room.guards.reduce((v,g)=>v+g.hp,0);
 run.scrolls.bolt=3;
 const startHp=tile.room.guardHp,turns=run.turn;
 A('cast','bolt');
 assert.equal(run.pendingSpell,'bolt','Targeted scroll opens target selection');
 assert.equal(run.scrolls.bolt,3,'Selecting a target does not spend the scroll');
 assert.equal(run.turn,turns,'Selecting a target costs no turns');
 assert.match(el('content').innerHTML,/spell-target-banner/);
 const guard=tile.room.guards.find(g=>g.hp>0);
 A('cast-target',tile.id+':'+guard.slot);
 assert.ok(tile.room.guardHp<startHp);
 assert.equal(run.scrolls.bolt,2);
 assert.equal(run.turn,turns+1);
 run.scrolls.sunfall=1;
 const protectedScrolls=run.scrolls.sunfall;
 A('cast','sunfall');
 assert.equal(run.scrolls.sunfall,protectedScrolls,'6★ must be blocked in side rooms');
 assert.equal(run.chamberActive,tile.id);
 run.timeStopTurns=2;
 for(const g of tile.room.guards)g.cooldown=1;
 const hp=run.hp;
 A('wait');A('wait');
 assert.equal(run.hp,hp,'Time stop prevents guard damage in both turns');
 assert.equal(tile.room.guards[0].cooldown,0,'Special countdown advances while time is frozen');
 run.guardCharges=3;
  for(const g of tile.room.guards){g.provoked=true;g.cooldown=1;}
  A('wait');
  assert.equal(run.guardCharges,0,'All three provoked attacks are blocked');
 assert.equal(run.hp,hp);A('chamber-exit');
});


test('Exactly three compact consumables sit above the backpack, beside the hero',()=>{
 if(!state.run)A('begin','necromancer');
 const run=state.run;
 A('close');run.tab='maze';
 run.potions=3;run.preparedPotions=['ghost','aegis'];
 run.tiles.forEach(t=>{if(t.foe)t.foe.hp=0;});
 api.debug.draw();
 const html=el('content').innerHTML;
 assert.equal((html.match(/class="dungeon-potion-slot/g)||[]).length,3);
 assert.equal((html.match(/data-action="potion"/g)||[]).length,1,'Only one dedicated HP elixir button');
 assert.equal((html.match(/data-action="use-prepared"/g)||[]).length,2);
 assert.ok(html.indexOf('dungeon-potion-bar')>html.indexOf('dungeon-board'),'Potions belong to the bottom battle dock');
 assert.ok(html.indexOf('dungeon-potion-bar')<html.indexOf('data-id="bag"'),'Potions must precede the backpack button');
 const before=run.potions;
 run.hp=Math.max(1,api.debug.stats().hp-70);api.debug.draw();
 A('potion');
 assert.equal(run.potions,before-1,'Healing must consume old HP elixir stock');
 assert.ok(run.hp>0);
});
test('Late-game alchemy materials exist in their own tier and cannot be substituted',()=>{
 const sys=win.CryptSystems;
 assert.equal(sys.potions.length,16);
 const late=['forgeguard','wildheart','ashvow','deepveil','soulmemory','dreamtruce','stormroot','astraloath'];
 const allLoot=DN.acts.map(a=>new Set(a.locations.flatMap(l=>[...l.mobs,...l.elites,l.boss]
    .flatMap(m=>(m.loot||[]).map(x=>x.name)))));
 late.forEach((id,index)=>{
  const p=sys.byPotion[id];
  assert.ok(p&&p.ingredients.length>=2);
  p.ingredients.forEach(x=>assert.ok(allLoot[index+2].has(x[0]),id+': unavailable '+x[0]));
 });
 A('escape-25');const meta=state.meta;
 const oldLevel=meta.city.alchemist;meta.city.alchemist=5;
 const p=sys.byPotion.astraloath,previous=Object.fromEntries(p.ingredients.map(x=>[x[0],meta.materials[x[0]]||0]));
 for(const [name,count] of p.ingredients)meta.materials[name]=count+4;
 const stock=meta.potionStock.astraloath||0;
 A('brew-potion','astraloath');
 assert.equal(meta.potionStock.astraloath,stock+1);
 for(const [name,count] of p.ingredients)assert.equal(meta.materials[name],4);
 for(const [name,value] of Object.entries(previous))meta.materials[name]=value;
 meta.city.alchemist=oldLevel;
});
test('Every region has a unique one-time lore puzzle with adventurer clue',()=>{
 const puzzles=win.CryptStoryEvents.puzzles;
 assert.equal(puzzles.length,30);
 assert.equal(new Set(puzzles.map(p=>p[0])).size,30);
 for(const p of puzzles)assert.ok(p[2]>=0&&p[2]<p[1].length);
 A('begin','necromancer');
 const run=state.run,point=run.tiles.find(t=>t.kind==='empty'&&!t.revealed);
 assert.ok(point);
 run.hp=9999;run.mp=9999;
 run.talents.adv_seeker=1;
 point.kind='puzzle';point.revealed=true;point.cleared=false;
 const oldRainbow=state.meta.rainbowDiamonds,turn=run.turn;
 A('pickup',point.id);
 assert.equal(run.pendingPuzzle.regional,true);
 assert.match(el('overlay').innerHTML,/Подсказка авантюриста/);
 A('puzzle-answer',String(puzzles[0][2]));
 assert.equal(run.turn,turn+2);
 assert.equal(run.pendingPuzzle,null);
 assert.equal(state.meta.rainbowDiamonds,oldRainbow+1);
 assert.ok(state.meta.achievements['act1-location1-lore-puzzle']);
 point.kind='puzzle';point.cleared=false;point.revealed=true;
 A('pickup',point.id);
 assert.equal(run.pendingPuzzle.regional,false);
 A('puzzle-answer','0');
 assert.equal(state.meta.rainbowDiamonds,oldRainbow+1);
});
test('First and final bosses use tactical HP scaling rather than raid-clicker values',()=>{
 const old=state.run;
 old.floor=29;old.key=true;old.hp=9999;
 const exit=old.tiles.find(t=>t.kind==='exit');assert.ok(exit);exit.revealed=true;
 A('descend');
 const first=old.tiles.find(t=>t.foe&&t.foe.boss);assert.ok(first);
 assert.ok(first.foe.hp>140&&first.foe.hp<1100,'Act 1 tactical boss HP: '+first.foe.hp);
 assert.ok(first.foe.atk>=3&&first.foe.atk<60);
 A('escape-25');const meta=state.meta;
 meta.unlockedAct=9;meta.selectedAct=9;
 A('begin','necromancer');
 const last=state.run;last.hp=99999;last.floor=29;last.key=true;
 last.tiles.find(t=>t.kind==='exit').revealed=true;
 A('descend');
 const finalBoss=last.tiles.find(t=>t.foe&&t.foe.boss);assert.ok(finalBoss);
 assert.ok(finalBoss.foe.hp>first.foe.hp&&finalBoss.foe.hp<4500);
 assert.ok(finalBoss.foe.atk>first.foe.atk);
});



test('Every act is harder at identical depth including the next act vs prior location 3',()=>{
 const B=win.CryptBalance;
 assert.equal(B.profiles.length,10);
 assert.equal(Object.keys(B.roles).length,8);
 for(let act=0;act<10;act++){
  const hp=B.combat(act,0,30,'brute',false,false,'constant');
  const end=B.combat(act,2,30,'brute',false,false,'constant');
  const elite=B.combat(act,0,30,'brute',true,false,'constant');
  const boss=B.combat(act,0,30,'brute',false,true,'boss');
  assert.ok(elite.hp>=hp.hp*1.9);
  assert.ok(boss.hp>elite.hp);
  assert.ok(end.hp>hp.hp&&end.atk>=hp.atk);
  if(act){
   const earlier=B.combat(act-1,2,30,'brute',false,false,'constant');
   const oldBoss=B.combat(act-1,2,30,'brute',false,true,'boss');
   assert.ok(hp.hp>earlier.hp,'Act '+(act+1)+' must start tougher than prior act location 3');
   assert.ok(hp.atk>earlier.atk,'Act '+(act+1)+' attack must exceed prior act');
   assert.ok(boss.hp>oldBoss.hp,'Boss HP must strictly rise: '+(act+1));
   assert.ok(boss.atk>oldBoss.atk,'Boss attacks must strictly rise: '+(act+1));
  }
 }
 assert.equal(B.loot(0,0,50,false,true)>B.loot(0,0,30,false,true),true);
 assert.ok(B.loot(9,0,50,false,true)>B.loot(0,0,50,false,true));
});
test('All 300 normal and 150 elite creatures have stable combat roles and skills',()=>{
 const B=win.CryptBalance;
 const catalog=DN.acts.flatMap(x=>x.locations);
 let normal=0,elite=0,assigned=new Set(),abilities=new Set();
 for(const loc of catalog){
  const roles=new Set();
  for(const m of loc.mobs){
   const role=B.role(m,false),skill=B.ability(m,role);
   assert.ok(B.roles[role],m.name);
   assert.ok(skill&&skill.description);
   assert.equal(skill.id,B.ability(m,role).id,'Skill must not reroll on reload');
   roles.add(role);assigned.add(role);abilities.add(skill.id);normal++;
  }
  for(const m of loc.elites){
   const role=B.role(m,false);
   assert.ok(B.roles[role],m.name);abilities.add(B.ability(m,role).id);elite++;
  }
  assert.ok(roles.size>=2,'Each location must contain different combat roles: '+loc.name);
 }
 assert.equal(normal,300);assert.equal(elite,150);
 assert.ok(assigned.size>=6&&abilities.size>=12);
 assert.equal(B.hazard(0).kind,'bleed');
 assert.equal(B.hazard(9).kind,'all');
});
test('Relative combat work to defeat enemies increases through all ten acts',()=>{
 const B=win.CryptBalance;
 let previous=-1,previousBoss=-1;
 for(let act=0;act<10;act++){
  const p=B.combat(act,0,30,'brute',false,false,'constant');
  const boss=B.combat(act,0,30,'brute',false,true,'boss');
  const training=B.training(act),heroHit=10+Math.floor(29*1.1)+training.atk;
  const effort=p.hp/heroHit,bossEffort=boss.hp/heroHit;
  assert.ok(effort>previous,'Relative monster effort must rise in Act '+(act+1));
  assert.ok(bossEffort>previousBoss,'Boss effort must rise in Act '+(act+1));
  previous=effort;previousBoss=bossEffort;
 }
});
test('Monster active special is applied only on its cooldown and saved with identity',()=>{
 const run=state.run;
 assert.equal(run.actIndex,9);
 run.hp=99999;run.mp=99999;
 run.bleedTurns=0;run.poisonTurns=0;run.silenceTurns=0;
 const choices=run.tiles.filter(t=>t.foe&&!t.foe.boss);
 assert.ok(choices.length>=1);
 choices.forEach(t=>t.foe.hp=0);
 const t=choices[0];t.revealed=true;t.foe.hp=10000;t.foe.maxHp=10000;
 const enemy=t.foe;enemy.ability='poison';enemy.abilityName='Ядовитый укус';enemy.skill.every=3;
 enemy.ranged=false;enemy.cooldown=2;enemy.stun=0;
 enemy.provoked=true;A('wait');assert.equal(run.poisonTurns,0,'Special cannot fire before cooldown');
  enemy.provoked=true;A('wait');assert.ok(run.poisonTurns>=2,'Poison must be applied by special on cooldown');
 enemy.ability='call';enemy.abilityName='Призыв прислужника';enemy.summons=0;enemy.cooldown=1;
 const before=run.tiles.filter(t=>t.foe&&t.foe.summoned).length;
  enemy.provoked=true;A('wait');
 const after=run.tiles.filter(t=>t.foe&&t.foe.summoned).length;
 assert.equal(after,before+1);
 enemy.cooldown=1;enemy.provoked=true;A('wait');
 assert.equal(run.tiles.filter(t=>t.foe&&t.foe.summoned).length,after,
  'One summoner cannot spam unlimited helpers');
});


test('Scheduled elite becomes enraged only under half HP',()=>{
 const run=state.run;run.hp=999999;
 const tile=run.tiles.find(t=>t.foe&&!t.foe.boss);assert.ok(tile);
 run.tiles.forEach(t=>{if(t.foe&&!t.foe.boss&&t!==tile)t.foe.hp=0;});
 const e=tile.foe;e.hp=45;e.maxHp=100;e.atk=14;e.enraged=false;e.elite=true;
 e.stun=0;e.cooldown=3;tile.revealed=true;
 A('wait');
 assert.equal(e.enraged,true);assert.equal(e.atk,17);
 const boost=e.atk;A('wait');assert.equal(e.atk,boost,'Enrage is one-time, not stacking');
 e.elite=false;
});
test('Boss can be stunned once but resists successive stun-lock attempts',()=>{
 const run=state.run;run.hp=999999;
 const tile=run.tiles.find(t=>t.foe&&t.foe.boss);assert.ok(tile);
 tile.revealed=true;
 const boss=tile.foe;boss.stun=1;boss.stunImmunityTurns=0;
 A('wait');assert.ok(boss.stunImmunityTurns>=2);
 boss.stun=1;A('wait');
 assert.equal(boss.stun,0);
 assert.ok(boss.stunImmunityTurns>=1,'Boss is immune for a short period');
});

test('Disk-save roundtrip keeps expedition, quests, prepared loadout and new slot migration',()=>{
 const before=win.Crypt.state();
 before.meta.materials['Проверка сохранения']=13;
 before.meta.potionStock.ghost=(before.meta.potionStock.ghost||0)+2;
 before.meta.preparedLoadout=['ghost','aegis'];
 before.meta.memoryChapters.act1=true;
 before.run.eliteSchedule={0:7,1:18};
 const weapon=before.run.equip.weapon;
 win.Crypt.save();
 assert.ok(storage.cryptbound_local_v1);
 const legacy=JSON.parse(storage.cryptbound_local_v1);
 legacy.run.equip.shoulders=legacy.run.equip.bracer||null;
 delete legacy.run.equip.bracer;
 const maybe=legacy.run.items.find(x=>x.slot==='bracer');
 if(maybe)maybe.slot='shoulders';
 storage.cryptbound_local_v1=JSON.stringify(legacy);
 vm.runInContext(fs.readFileSync(path.join(root,'game.js'),'utf8'),ctx,{filename:'game.js-reload',timeout:12000});
 const restored=win.Crypt.state();
 assert.equal(restored.meta.materials['Проверка сохранения'],13);
 assert.equal(restored.meta.memoryChapters.act1,true);
 assert.deepEqual(Array.from(restored.meta.preparedLoadout),['ghost','aegis']);
 assert.equal(restored.run.actIndex,9);
 assert.equal(restored.run.floor,30);
 assert.equal(restored.run.equip.weapon,weapon);
 assert.equal(restored.run.equip.shoulders,undefined);
 assert.ok('bracer' in restored.run.equip);
 assert.equal(restored.run.eliteSchedule[0],7);
 assert.equal(restored.run.eliteSchedule[1],18);
});

test('Full-clear animation expires, keeps its original timeline on redraw and never replays after reload',()=>{
 const live=win.Crypt;live.state().meta.selectedAct=0;live.debug.action('begin','executioner');
 const run=live.state().run;run.hp=9999;run.mp=9999;
 const foeTile=run.tiles.find(t=>t.foe);assert.ok(foeTile);
 run.tiles.forEach(t=>{if(t.foe)t.foe.hp=0;});
 foeTile.foe.hp=1;foeTile.foe.def=0;foeTile.foe.guard=0;foeTile.foe.evadeCharges=0;foeTile.foe.boss=false;foeTile.revealed=true;
 run.tiles.filter(t=>t.id!==foeTile.id).slice(0,3).forEach(t=>{t.kind='empty';t.foe=null;t.revealed=false;t.cleared=false;});
 run.floorCleared=false;
 const RealDate=ctx.Date;let clock=Date.now();ctx.Date=class extends Date{static now(){return clock;}};
 try{
  standNextTo(run,foeTile);live.debug.action('strike',foeTile.id);
  assert.equal(run.floorCleared,true);assert.match(el('content').innerHTML,/tile-auto-open/);
  const afterClearGold=run.gold;
  clock+=100;live.debug.draw();assert.match(el('content').innerHTML,/animation-delay:-100ms/,'Redraw continues the same animation instead of restarting it');
  clock+=2000;live.debug.action('wait');live.debug.action('wait');
  assert.doesNotMatch(el('content').innerHTML,/tile-auto-open/);assert.equal(run.gold,afterClearGold);
  assert.equal(run.log.filter(x=>x.includes('Полная зачистка:')).length,1);
  run.clearAnimationStarted=clock;live.save();
  vm.runInContext(fs.readFileSync(path.join(root,'game.js'),'utf8'),ctx,{filename:'clear-animation-reload',timeout:12000});
  assert.doesNotMatch(el('content').innerHTML,/tile-auto-open/,'Saved animation markers are not replayed on load');
 }finally{ctx.Date=RealDate;}
});

test('Combat feedback separates healing from retaliation and does not damage units when changing maps',()=>{
 const live=win.Crypt;live.state().meta.selectedAct=0;live.debug.action('begin','necromancer');
 const run=live.state().run,st=live.debug.stats();run.hp=st.hp-20;run.mp=st.mp;run.scrolls.heal=1;run.shield=0;run.setShieldRemaining=0;run.guardCharges=0;run.summon=null;
 run.tiles.forEach(t=>{if(t.foe)t.revealed=false;});
 const foe=run.tiles.find(t=>t.foe);foe.revealed=true;Object.assign(foe.foe,{hp:500,maxHp:500,atk:st.def+5,cooldown:99,guard:0,stun:0,burn:0,poison:0});
 const mark=win.CryptFeedback.events().at(-1)?.id||0;
 live.debug.action('cast','heal');
 const emitted=win.CryptFeedback.events().filter(x=>x.id>mark&&x.actor==='hero');
 assert.ok(emitted.some(x=>x.kind==='heal'&&x.text==='+20'),'Heal is reported before the enemy turn');
 assert.ok(!emitted.some(x=>x.kind==='damage'),'Healing does not provoke an untouched melee enemy');
  const afterHeal=win.CryptFeedback.events().at(-1)?.id||0;
  standNextTo(run,foe);live.debug.action('strike',foe.id);
  assert.ok(win.CryptFeedback.events().some(x=>x.id>afterHeal&&x.actor==='hero'&&x.kind==='damage'),'A direct hit causes a retaliatory attack');
 const chamber=run.tiles.find(t=>t.kind==='empty'&&!t.foe);chamber.kind='chamber';chamber.revealed=true;chamber.cleared=false;
 const before=win.CryptFeedback.events().at(-1)?.id||0;live.debug.action('pickup',chamber.id);
 assert.equal(run.chamberActive,chamber.id);
 assert.ok(!win.CryptFeedback.events().some(x=>x.id>before&&x.kind==='damage'&&x.actor.startsWith('enemy:')),'Hidden main-map units do not take fictitious damage on cave entry');
 live.debug.action('chamber-exit');
});

test('Enemy retaliation, flat armor and red/green damage badges update live',()=>{
 const live=win.Crypt,run=live.state().run;
 assert.ok(run,'A test expedition is active');
 run.tiles.forEach(t=>{if(t.foe)t.foe.hp=0;});
 run.summon=null;run.ghost=null;run.guardCharges=0;run.shield=0;run.setShieldRemaining=0;
 run.burnTurns=0;run.bleedTurns=0;run.poisonTurns=0;run.regenTurns=0;run.armorBreakPower=0;
 run.blessed=0;run.talents={};run.chamberActive=null;run.tab='maze';
 const spot=run.tiles.find(t=>t.kind==='empty'&&!t.foe);assert.ok(spot);
 const defense=live.debug.stats().def;assert.ok(defense>0);
 spot.kind='enemy';spot.revealed=true;spot.cleared=false;
 const foe=spot.foe={id:'test_reactive',name:'Испытательный страж',visual:'skeleton',
  hp:999999,maxHp:999999,atk:defense+11,baseAtk:defense+11,def:0,
  cooldown:999,skill:{name:'Удар',every:999,kind:'none'},guard:0,
  ranged:false,stun:0,burn:0,poison:0,loot:[],ep:0,gold:0};
 standNextTo(run,spot);run.hp=10000;live.debug.draw();
 assert.match(el('content').innerHTML,/damage-reduced/,'Armor should color the displayed enemy attack red');
 const random=Math.random;
 try{
  Math.random=()=>.99;
  live.debug.action('wait');
  assert.equal(run.hp,10000,'An untouched melee enemy cannot attack on a wait');
  live.debug.action('strike',spot.id);
  assert.equal(run.hp,9989,'A provoked enemy deals attack minus flat defense');
  foe.atk=1;const before=run.hp;
  live.debug.action('strike',spot.id);
  assert.equal(run.hp,before-1,'Even excess armor cannot prevent the minimum one damage');
  foe.atk=foe.baseAtk+defense+15;live.debug.draw();
  assert.match(el('content').innerHTML,/damage-boosted/,'Buffed attack exceeding the base damage turns green');
 }finally{Math.random=random;}
});


test('Unlimited backpack displays found items in slots but not equipped gear or scrolls',()=>{
 const live=win.Crypt;live.debug.action('begin','necromancer');
 const run=live.state().run;
 for(let i=0;i<65;i++)run.items.push({id:90000+i,name:'Перчатки находка '+i,slot:'gloves',rarity:1,plus:0,atk:0,def:0,hp:0,mp:0,pow:0});
 run.equip.gloves=90000;
 run.scrolls.bolt=7;run.questItems=['Печать испытания'];run.journalNotes=['Запись о тайной тропе'];
 win.CryptForestEvents.ensure(run).items.honey=2;
 run.soulBag.push({id:99001,name:'Память спутника',kind:'common'});
 live.debug.action('ui-panel','bag');
 const html=el('overlay').innerHTML;
 assert.match(html,/\d+ предметов · без ограничения/);
 assert.doesNotMatch(html,/data-action="item-select" data-id="90000"/,'Worn equipment must not occupy a backpack cell');
 assert.match(html,/data-action="item-select" data-id="90001"/);
 assert.match(html,/data-action="active-item-info" data-id="forest:honey"/);
 assert.match(html,/data-action="active-item-info" data-id="soul:99001"/);
 assert.match(html,/data-action="quest-item-info"/);
 assert.doesNotMatch(html,/data-action="note-info"/,'Traveler letters stay in the journal');
 assert.doesNotMatch(html,/data-action="spell-detail"/,'Scrolls belong exclusively in the spellbook');
 assert.match(html,/без ограничения/);
 const free=run.tiles.find(t=>t.kind==='empty'&&!t.foe);assert.ok(free);
 free.kind='chest';free.revealed=true;free.cleared=false;
 const random=Math.random;
 try{
  Math.random=()=>.1;
  const before=run.items.length;live.debug.action('pickup',free.id);
  assert.equal(run.items.length,before+1,'Loot does not get sold when the old 48-slot cap is exceeded');
 }finally{Math.random=random;}
});

test('Numeric ability costs and generated loot sprites are wired to HUD',()=>{
 const live=win.Crypt;live.debug.action('begin','necromancer');
 const html=el('content').innerHTML;
 assert.match(html,/class="quick-mana-cost">8<\/small>/,'Class ability shows only the numeric cost');
 assert.doesNotMatch(html,/class="quick-mana-cost">[^<]*МН/,'No mana suffix on class ability');
 for(const name of ['vial-hp','vial-mp','loot-pouch']){
  const img=path.join(root,'ui',name+'.png');
  assert.ok(fs.statSync(img).size>400,name+' must have an actual PNG file');
 }
 const run=live.state().run,t=run.tiles.find(x=>x.kind==='empty'&&!x.foe);
 t.kind='vial-hp';t.revealed=true;t.cleared=false;live.debug.action('wait');
 assert.match(el('content').innerHTML,/ui\/vial-hp\.png/);
 t.kind='vial-mp';live.debug.action('wait');
 assert.match(el('content').innerHTML,/ui\/vial-mp\.png/);
 t.drops={materials:[{name:'Дерево',qty:1}],gold:1};live.debug.action('wait');
 assert.match(el('content').innerHTML,/ui\/loot-pouch\.png/);
});

test('Small floor vials are consumed instantly with HP 5–20 and MP 3–10',()=>{
 const live=win.Crypt;live.debug.action('begin','necromancer');
 const run=live.state().run,st=live.debug.stats();
 run.hp=st.hp-30;run.mp=st.mp-15;run.regenTurns=0;run.poisonTurns=0;run.bleedTurns=0;
 const cell=run.tiles.find(t=>t.kind==='empty'&&!t.foe);assert.ok(cell);
 const oldBag=run.lootBag.length;
 cell.kind='vial-hp';cell.revealed=true;cell.cleared=false;
 const oldHp=run.hp;live.debug.action('pickup',cell.id);
 assert.ok(run.hp-oldHp>=5&&run.hp-oldHp<=20,'HP vial heals 5–20 immediately');
 assert.equal(run.lootBag.length,oldBag,'Small HP vial must not be stored');
 cell.kind='vial-mp';cell.revealed=true;cell.cleared=false;
 const oldMp=run.mp;live.debug.action('pickup',cell.id);
 assert.ok(run.mp-oldMp>=3&&run.mp-oldMp<=10,'MP vial heals 3–10 immediately');
 assert.equal(run.lootBag.length,oldBag,'Small MP vial must not be stored');
});

test('Summon retaliation hits the summon, while targeted magic causes no melee counterattack',()=>{
 const live=win.Crypt;live.debug.action('begin','necromancer');
 const run=live.state().run,foeTile=run.tiles.find(t=>t.foe&&!t.foe.boss);assert.ok(foeTile);
 run.tiles.forEach(t=>{if(t.foe)t.foe.hp=0;});
 foeTile.revealed=true;foeTile.cleared=false;
 Object.assign(foeTile.foe,{hp:5000,maxHp:5000,atk:11,def:0,stun:0,burn:0,poison:0,bleed:0,
  cooldown:100,skill:{name:'Удар',every:100,kind:'none'},ranged:false,boss:false,guard:0});
 run.hp=1000;run.mp=1000;run.shield=0;run.ghost=null;run.guardCharges=0;run.bleedTurns=0;run.poisonTurns=0;
 standNextTo(run,foeTile);
 run.summon={name:'Костяной страж',hp:120,maxHp:120,atk:5,def:2,specialCooldown:4};
 const random=Math.random;
 try{
  Math.random=()=>.99;
  live.debug.action('wait');
  assert.equal(run.hp,1000,'Summon-initiated retaliation must not hit the hero');
  assert.equal(run.summon.hp,111,'The monster deals its retaliation to the summoned creature');
  // Special abilities on a summon-targeted counter must not affect the hero.
  for(const ability of ['manaburn','burn','poison','shatter','silence']){
   foeTile.foe.ability=ability;foeTile.foe.abilityName='Special '+ability;
   foeTile.foe.cooldown=1;foeTile.foe.skill={name:'Test ability',every:1,kind:'none'};
   run.summon.hp=120;run.summon.specialCooldown=4;
   run.mp=live.debug.stats().mp;const manaBefore=run.mp;run.hp=1000;run.shield=100;
   run.burnTurns=0;run.poisonTurns=0;run.silenceTurns=0;
   live.debug.action('wait');
   assert.equal(run.hp,1000,ability+': hero must not take summon retaliation HP damage');
   assert.equal(run.mp,manaBefore,ability+': hero must not lose mana');
   assert.equal(run.shield,100,ability+': hero shield must stay intact');
   assert.equal(run.burnTurns,0,ability+': hero must not burn');
   assert.equal(run.poisonTurns,0,ability+': hero must not be poisoned');
   assert.equal(run.silenceTurns,0,ability+': hero must not be silenced');
   assert.ok(run.summon.hp<120,ability+': summon must take the retaliation');
  }
  run.summon=null;run.summonTile=null;foeTile.foe.provoked=false;foeTile.foe.provokedBy=null;
  foeTile.foe.cooldown=100;foeTile.foe.ability=null;foeTile.foe.skill={name:'Удар',every:100,kind:'none'};
  run.scrolls.bolt=1;
  const hp=run.hp,foeHp=foeTile.foe.hp;
  standNextTo(run,foeTile);
  live.debug.action('cast','bolt');
  assert.equal(run.pendingSpell,'bolt');
  live.debug.action('cast-target',foeTile.id);
  assert.equal(run.hp,hp,'Casting an attack spell must not trigger an enemy counter');
  assert.ok(foeTile.foe.hp<foeHp,'Targeted spell damages its selected enemy');
 }finally{Math.random=random;}
});

test('Scout double shot damages target twice and grants temporary +50 evasion',()=>{
 const live=win.Crypt;live.debug.action('begin','scout');
 const run=live.state().run,t=run.tiles.find(t=>t.foe&&!t.foe.boss);assert.ok(t);
 run.tiles.forEach(x=>{if(x.foe)x.foe.hp=0;});
 t.revealed=true;t.cleared=false;
 Object.assign(t.foe,{hp:2000,maxHp:2000,atk:2,def:0,stun:0,burn:0,poison:0,
  cooldown:100,skill:{name:'Удар',every:100,kind:'none'},ranged:false,boss:false,guard:0});
 run.mp=1000;run.hp=1000;run.shield=0;run.ghost=null;run.summon=null;run.guardCharges=0;
 const base=live.debug.stats().dodge;
 run.scoutDodgeTurns=1;
 assert.equal(live.debug.stats().dodge,Math.min(100,base+50));
 run.scoutDodgeTurns=0;
 const before=t.foe.hp,turn=run.turn,random=Math.random;
 try{
  Math.random=()=>.99;
  standNextTo(run,t);
  live.debug.action('skill');
  assert.equal(run.turn,turn+1,'Scout skill consumes one action');
  assert.ok(t.foe.hp<before-1.5*live.debug.stats().atk,'Both arrows strike the enemy');
  assert.ok(run.log.some(x=>x.includes('Двойной выстрел: 2 стрелы')),'New skill is used');
  assert.equal(run.scoutDodgeTurns,0,'Evasion buff expires after the round');
 }finally{Math.random=random;}
});

test('An exposed ranged foe cannot be attacked until its corridor is dug',()=>{
 const live=win.Crypt;live.debug.action('begin','executioner');
 const run=live.state().run;
 run.tiles.forEach(cell=>{cell.kind='empty';cell.revealed=false;cell.cleared=false;cell.foe=null;cell.drops=null;});
 const origin=run.tiles[12];origin.kind='start';origin.revealed=true;origin.cleared=true;run.heroTile=12;
 const archer=run.tiles[14];archer.kind='enemy';archer.revealed=true;
 archer.foe={id:'test_archer',name:'Дальний стрелок',visual:'rat',hp:1000,maxHp:1000,
  atk:1,baseAtk:1,def:0,guard:0,ranged:true,stun:0,burn:0,poison:0,bleed:0,
  skill:{name:'Выстрел',every:99,kind:'shot'},cooldown:99,attackCooldown:2,loot:[],ep:0,gold:0};
 run.hp=10000;run.ghost=null;run.summon=null;run.shield=0;
 const hp=archer.foe.hp,turn=run.turn;
 live.debug.action('strike',archer.id);
 assert.equal(archer.foe.hp,hp,'No attack can cross a hidden tile');
 assert.equal(run.turn,turn,'Blocked attacks do not consume a turn');
 const passage=run.tiles[13];passage.revealed=true;passage.cleared=true;
 live.debug.action('strike',archer.id);
 assert.ok(archer.foe.hp<hp,'After excavation the target can be hit');
});
test('Every scroll rank appears on the same spellbook page',()=>{
 const live=win.Crypt;live.debug.action('ui-panel','spells');
 const book=el('overlay').innerHTML;
 assert.doesNotMatch(book,/data-action="spell-page"/);
 assert.doesNotMatch(book,/data-action="spell-rank"/);
 assert.match(book,/6★/);
 live.debug.action('close');
});

test('Loading a legacy save removes useless trinkets without deleting real gear',()=>{
 const live=win.Crypt,run=live.state().run;
 run.lootBag=[{id:99002,kind:'trinket',name:'Треснувшая пуговица',qty:1}];
 const itemCount=run.items.length;
 live.save();
 vm.runInContext(fs.readFileSync(path.join(root,'game.js'),'utf8'),ctx,{filename:'legacy-curios-migration',timeout:12000});
 const migrated=win.Crypt.state().run;
 assert.ok(migrated&&!migrated.lootBag.some(x=>x.kind==='trinket'));
 assert.equal(migrated.items.length,itemCount);
});

console.log('V0.4 GAMEPLAY SMOKE TESTS PASSED: '+checks);
