/* Summoned Panther title integration, independent of the regular necromancer skeleton. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../src/main/assets'),elems={},store={};
function el(id){return elems[id]||(elems[id]={innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}}});}
const window={addEventListener(){}},document={hidden:false,getElementById:el,querySelector(){return null;},querySelectorAll(){return []},addEventListener(){}};
const ctx={window,document,Math,Date,console,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,
 localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v}};
vm.createContext(ctx);
for(const name of ['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','gumballs_titles_reference.js',
'titles_runtime.js','expansion.js','clicker_data.js','dungeons.js','clicker_rules.js','systems.js','boss_scripts.js',
'story_events.js','balance.js','combat_feedback.js','hunter_bestiary.js','forest_encounters.js','t1_encounters.js','mining.js','game.js']){
 if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:15000});
}
const A=window.Crypt.debug.action,rt=window.CryptTitlesRuntime,state=window.Crypt.state();
A('begin','scout');const run=state.run;
run.ep=60000;
for(const id of ['adv_seeker','adv_explorer','adv_night_walker','adv_elven_ranger'])A('talent',id);
assert.equal(rt.curSup(run,'leopard'),1);
const enemy=run.tiles.find(t=>t.foe)?.foe;assert.ok(enemy);
run.tiles.forEach(t=>{t.kind='empty';t.revealed=false;t.cleared=false;t.foe=null;t.drops=null;t.hasKey=false;});
run.tiles[20].kind='start';run.tiles[20].revealed=true;run.tiles[20].cleared=true;run.heroTile=20;
const target=run.tiles[21];target.kind='enemy';target.revealed=true;target.foe=enemy;
Object.assign(enemy,{name:'Цель пантеры',hp:500,maxHp:500,atk:7,baseAtk:7,def:0,guard:0,ranged:false,
 stun:0,evadeCharges:0,cooldown:4,attackCooldown:2,skill:{every:99,name:'Без навыка'},provoked:false});
run.hp=window.Crypt.debug.stats().hp;
const initialHeroHp=run.hp,firstTurn=run.turn;
A('ui-panel','bag');assert.match(el('overlay').innerHTML,/data-id="panther"/);
A('active-item-info','panther');
assert.match(el('overlay').innerHTML,/Статуэтка чёрной пантеры/);
const idleTurn=run.turn;assert.equal(idleTurn,firstTurn,'Looking at a statue is free');
A('active-item-use','panther');
assert.equal(run.turn,firstTurn+1,'A summon uses one action');
assert.equal(rt.curSup(run,'leopard'),0,'Summon consumes one statue');
assert.ok(run.titlePanther&&run.titlePanther.hp>0,'Black Panther has HP and remains active');
assert.ok(enemy.hp<500,'Panther attacked on its first active turn');
assert.ok(run.titlePanther.hp<run.titlePanther.maxHp,'Enemy counterattacked panther');
assert.equal(run.hp,initialHeroHp,'Enemy did not redirect panther retaliation to hero');
assert.match(el('content').innerHTML,/data-action="title-panther-info"/);
const unchanged=run.turn;
A('active-item-use','panther');assert.equal(run.turn,unchanged,'Cannot summon another without statue');
assert.equal(rt.summonPanther(run,{stats:window.Crypt.debug.stats}).ok,false,'A living panther cannot be respawned');
run.titlePanther.hp=1;enemy.hp=500;enemy.deathProcessed=false;
A('wait');assert.equal(run.titlePanther,null,'The panther can die from the enemy response');
assert.equal(rt.curSup(run,'leopard'),0,'No statue refunded on death');
run.titleSupplies.leopard=1;
run.tiles[21].foe.hp=500;
const cave=run.tiles[18],guard={id:'test-cave',name:'Страж',slot:1,hp:500,maxHp:500,atk:7,def:0,stun:0,cooldown:4,evadeCharges:0,skill:{every:99,name:'Без навыка'}};
cave.kind='chamber';cave.revealed=true;cave.cleared=false;cave.room={guards:[guard],guardHp:500,secret:false,rewardTaken:false,secretTaken:false,turns:0};
run.chamberActive=18;run.hp=window.Crypt.debug.stats().hp;
const hpRoom=run.hp;
A('title-panther-use');
assert.ok(run.titlePanther,'Panther summoned in room');
assert.ok(guard.hp<500,'Panther attacks active side-room guard');
assert.ok(run.titlePanther.hp<run.titlePanther.maxHp,'Room guard retaliates against panther');
assert.equal(run.hp,hpRoom,'Room guard does not strike hero in the panther response');
run.titlePanther.hp=10;run.titleSupplies.leopard=1;
rt.onFloor(run,{stats:window.Crypt.debug.stats,targets:()=>[],hiddenTargets:()=>[],log:()=>{}});
assert.equal(run.titlePanther,null,'Panther only lasts one floor');
console.log('PASS Black Panther: statue backpack, summon action, own HP, maze and side-room retaliation, floor reset');
