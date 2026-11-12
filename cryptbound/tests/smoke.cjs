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
const sources=['art.js','equipment_art.js','imported_art.js','titles.js','expansion.js','clicker_data.js','dungeons.js','clicker_rules.js','game.js'];
for(const file of sources)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file,timeout:12000});
const api=win.Crypt,A=api.debug.action,DB=win.ClickerData,CR=win.ClickerRules,DN=win.CryptDungeons;
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
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
r.hp=5000;r.mp=5000;
test('Only one specialization per title fork; chosen path remains upgradeable',()=>{
 const oldEp=r.ep,oldTitles=Object.assign({},r.talents);r.ep=3000;
 A('talent','fortune');A('talent','seeker');assert.ok(r.talents.seeker>0);
 let before=r.ep;A('talent','explorer');assert.equal(r.ep,before);
 assert.equal(r.talents.explorer||0,0);
 A('talent','vault');assert.ok(r.talents.vault>0);
 before=r.ep;A('talent','stealth');assert.equal(r.ep,before);
 assert.equal(r.talents.stealth||0,0);
 A('talent','secretkeeper');assert.ok(r.talents.secretkeeper>0);
 before=r.ep;A('talent','scavenger');assert.equal(r.ep,before);
 assert.equal(r.talents.scavenger||0,0);
 const rank=r.talents.vault;A('talent','vault');
 assert.equal(r.talents.vault,rank+1);
 r.talents=oldTitles;r.ep=oldEp;api.debug.draw();
});

test('Adventure remains, soul use and one-time treasure',()=>{
 const old=Object.assign({},r.talents);
 const originalTiles=JSON.parse(JSON.stringify(r.tiles));
 r.talents.fortune=1;r.talents.explorer=1;r.talents.cartographer=1;
 const corpse=r.tiles.find(x=>x.kind==='empty'&&!x.revealed);assert.ok(corpse);
 corpse.kind='corpse';corpse.corpseId='storm-smith';corpse.revealed=true;corpse.cleared=false;
 const n=r.items.length,before=state.seq;
 A('pickup',corpse.id);assert.equal(corpse.cleared,true);
 assert.equal(r.items.length,n+1);
 assert.ok(r.journalNotes.some(x=>x.includes('Павший механик')));
 const soul=r.soulBag.find(x=>x.storyId==='storm-smith');assert.ok(soul);
 A('close');r.tab='bag';api.debug.draw();
 assert.match(el('content').innerHTML,/СОБРАННЫЕ ДУШИ/);
 A('consume-soul',soul.id);assert.equal(r.soulBag.some(x=>x.id===soul.id),false);
 assert.ok(r.items.some(x=>x.name==='Грозовая перчатка'&&x.stormCharge));
 A('pickup',corpse.id);assert.equal(state.seq,before+3);
 r.tiles=originalTiles;r.talents=old;r.tab='maze';api.debug.draw();
});


test('Side chamber guard, central loot and talent-gated secret',()=>{
 const old=Object.assign({},r.talents);
 const originalTiles=JSON.parse(JSON.stringify(r.tiles));
 r.talents.fortune=1;r.talents.seeker=1;r.talents.stealth=1;r.talents.scavenger=1;
 const room=r.tiles.find(x=>x.kind==='empty'&&!x.revealed);assert.ok(room);
 room.kind='chamber';room.revealed=true;room.cleared=false;
 A('pickup',room.id);assert.ok(room.room);
 room.room.secret=true;
 assert.match(el('overlay').innerHTML,/ПОБОЧНАЯ КОМНАТА/);
 let attempts=0;r.hp=5000;
 while(room.room.guardHp>0&&attempts++<60)A('chamber-fight',room.id);
 assert.equal(room.room.guardHp,0);
 A('chamber-reward',room.id);assert.equal(room.room.rewardTaken,true);
 assert.equal(room.cleared,false);
 const prev=r.secrets;
 A('chamber-secret',room.id);assert.equal(room.cleared,true);
 assert.equal(room.kind,'empty');assert.equal(r.secrets,prev+1);
 A('chamber-secret',room.id);assert.equal(r.secrets,prev+1);
 r.tiles=originalTiles;r.talents=old;api.debug.draw();
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
  if(!['necromancer','scout'].includes(klass)){
   const target=r.tiles.find(t=>t.foe&&!t.foe.ranged);target.revealed=true;
   target.foe.hp=200;target.foe.maxHp=200;
  }
  A('skill');
  assert.ok(r.turn>=1);
  assert.ok(r.mp<1000);
  assert.ok(r.fx==='skill');
 }
});
A('begin','necromancer');r=state.run;r.hp=5000;r.mp=5000;
test('A hidden archer has a three-round attack interval and does not block exploration',()=>{
 r.tiles.forEach(t=>{if(t.foe){t.foe.hp=0;}});
 r.summon=null;r.summonTile=null;r.shield=0;r.poisonTurns=0;
 const t=r.tiles[0];t.kind='enemy';t.revealed=true;
 t.foe={id:'ranger_test',name:'Разбойник-лучник',visual:'cultist',hp:70,maxHp:70,
  atk:12,def:0,ranged:true,attackCooldown:3,cooldown:3,skill:{name:'Дальний выстрел',every:3,kind:'shot'},burn:0,stun:0,poison:0,loot:[]};
 const oldHp=r.hp;
 A('wait');A('wait');assert.equal(r.hp,oldHp);
 A('wait');assert.ok(r.hp<oldHp);
 assert.equal(t.foe.attackCooldown,3);
});
test('Opening and collecting a find each consume exactly one turn',()=>{
 const t=r.tiles.find(x=>x.kind==='coin');assert.ok(t);
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
 A('strike',t.id);assert.ok(t.drops);
 assert.ok(t.drops.materials.length>=1);
 const got=t.drops.materials[0];const before=r.materials[got.name]||0;
 A('pickup',t.id);
 assert.ok(r.materials[got.name]>=before+got.qty);
});
test('Fixed catalog set gear and 2/4/6 bonuses function',()=>{
 const chest=r.items.find(x=>x.slot==='armor'),relic=r.items.find(x=>x.slot==='relic');
 assert.ok(chest.fixed&&relic.fixed);
 assert.equal(chest.setId,relic.setId);
 assert.equal(CR.counts(r.equip,r.items)[chest.setId],2);
 const a=CR.gear('helm',1,0),b=CR.gear('shoulders',1,0);
 r.items.push(Object.assign({id:++state.seq,plus:0,floor:1},a));
 r.items.push(Object.assign({id:++state.seq,plus:0,floor:1},b));
 const hp=api.debug.stats().hp;
 r.equip.helm=r.items[r.items.length-2].id;r.equip.shoulders=r.items[r.items.length-1].id;
 assert.equal(CR.counts(r.equip,r.items)[chest.setId],4);
 assert.ok(api.debug.stats().hp>hp);
 r.tab='hero';api.debug.draw();
 assert.match(el('content').innerHTML,/АКТИВНЫЕ КОМПЛЕКТЫ/);
});
test('Compact modal compares fixed equipment with set bonuses',()=>{
 A('inspect-slot','helm');
 assert.equal(r.tab,'hero');
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
test('Original animation frame appears when attacking and spellcasting',()=>{
 r.tab='hero';r.mp=1000;
 const target=r.tiles.find(t=>t.foe&&t.foe.hp>0);
 if(target){target.revealed=true;target.foe.hp=100;A('strike',target.id);}
 assert.match(el('portrait').innerHTML,/mage_m_attack.png/);
 assert.match(el('portrait').innerHTML,/mage_m_attack_2.png/);
 assert.match(el('portrait').innerHTML,/mage_m_attack_3.png/);
 A('skill');assert.match(el('portrait').innerHTML,/mage_m_skill.png/);
 assert.match(el('portrait').innerHTML,/mage_m_skill_2.png/);
 assert.match(el('portrait').innerHTML,/mage_m_skill_3.png/);
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
 run.talents.fortune=1;run.scrolls.bolt=7;
 const equippedIds=Object.values(run.equip).filter(Boolean);
 A('safe-portal');assert.equal(state.run,run);
 for(let stage=0;stage<3;stage++){
  run=state.run;assert.ok(run);
  assert.equal(run.locationIndex,stage);
  assert.equal(run.floor,1);
  run.floor=29;run.hp=5000;run.mp=5000;run.key=true;
  run.tiles.find(t=>t.kind==='exit').revealed=true;
  A('descend');assert.equal(run.floor,30);
  const boss=run.tiles.find(t=>t.kind==='boss');assert.ok(boss);
  assert.equal(boss.foe.name,DN.location(0,stage).boss.name);
  run.tiles.forEach(t=>{if(t.foe&&t!==boss)t.foe.hp=0;});
  boss.foe.hp=1;boss.revealed=true;A('strike',boss.id);
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
   assert.equal(carry.talents.fortune,1);
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


test('Elite spawn calendar: exactly once on floors 5–9 of every decade',()=>{
 A('begin','necromancer');let run=state.run;run.hp=50000;
 const locations=[];
 for(let depth=2;depth<=39;depth++){
  const stair=run.tiles.find(t=>t.kind==='exit');assert.ok(stair);
  stair.revealed=true;run.key=true;
  A('descend');assert.equal(run.floor,depth);
  const elite=run.tiles.filter(t=>t.foe&&t.foe.elite);
  assert.ok(elite.length<=1);
  if(elite.length)locations.push(depth);
  assert.equal(elite.length,depth%10>=5&&depth%10<=9&&run.eliteSchedule[Math.floor((depth-5)/10)]===depth?1:0);
 }
 for(let n=0;n<4;n++){
  const hits=locations.filter(depth=>Math.floor((depth-5)/10)===n);
  assert.equal(hits.length,1);
  assert.ok(hits[0]>=5+n*10&&hits[0]<=9+n*10);
 }
 assert.equal(run.tiles.find(t=>t.kind==='boss'),undefined);
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
 A('wait');assert.equal(boss.foe.phase,2);
 assert.ok(boss.foe.telegraph);
 A('wait');assert.equal(boss.foe.telegraph,null);
 boss.foe.hp=Math.floor(boss.foe.maxHp*.3);
 A('wait');assert.equal(boss.foe.phase,3);
 boss.foe.hp=1;A('strike',boss.id);
 assert.equal(run.portalReady,true);
});

console.log('V0.4 GAMEPLAY SMOKE TESTS PASSED: '+checks);
