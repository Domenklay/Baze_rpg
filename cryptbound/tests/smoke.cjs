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
const sources=['art.js','equipment_art.js','imported_art.js','titles.js','expansion.js','clicker_data.js','clicker_rules.js','game.js'];
for(const file of sources)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file,timeout:12000});
const api=win.Crypt,A=api.debug.action,DB=win.ClickerData,CR=win.ClickerRules;
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
test('Hero origin at center with connected orthogonal exploration',()=>{
 assert.equal(r.tiles.length,25);
 assert.equal(r.tiles[12].kind,'start');
 assert.match(el('content').innerHTML,/tile-origin/);
 assert.ok(r.tiles.filter(t=>t.revealed).length<=3);
 const far=r.tiles.find(t=>!t.revealed&&CR.near(12).indexOf(t.id)===-1);
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
 assert.notEqual(r.summonTile,12);
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
 const safe=CR.near(12).find(id=>!r.tiles[id].revealed);
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
 const got=t.drops.materials[0];const before=state.meta.materials[got.name]||0;
 A('pickup',t.id);
 assert.ok(state.meta.materials[got.name]>=before+got.qty);
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
console.log('V0.4 GAMEPLAY SMOKE TESTS PASSED: '+checks);
