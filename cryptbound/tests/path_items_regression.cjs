/* Regression: explored attack corridors, full-clear traps and item confirmation. Node 20+. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../src/main/assets');
const elements={},storage={};
function el(id){return elements[id]||(elements[id]={id,innerHTML:'',textContent:'',style:{},scrollTop:0,
 classList:{add(){},remove(){},toggle(){}}});}
const window={addEventListener(){}};
const document={hidden:false,getElementById:el,querySelector(){return null;},
 querySelectorAll(){return [];},addEventListener(){}};
const ctx={window,document,Math,Date,console,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,
 localStorage:{getItem:key=>storage[key]||null,setItem:(key,val)=>storage[key]=val}};
vm.createContext(ctx);
const files=['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js',
 'gumballs_titles_reference.js','titles_runtime.js','expansion.js','clicker_data.js',
 'dungeons.js','clicker_rules.js','systems.js','boss_scripts.js','story_events.js','balance.js',
 'combat_feedback.js','hunter_bestiary.js','forest_encounters.js','game.js'];
for(const name of files){
 if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:12000});
}
const A=window.Crypt.debug.action,FE=window.CryptForestEvents;
A('begin','scout');
const run=window.Crypt.state().run,foe=run.tiles.find(t=>t.foe)?.foe;
assert.ok(foe,'Generated floor needs a monster');
run.hp=5000;run.mp=5000;
run.tiles.forEach(t=>{t.kind='empty';t.revealed=false;t.cleared=false;t.foe=null;
 t.drops=null;t.hasKey=false;t.trapSpent=false;t.trapActive=false;});
run.tiles[20].kind='start';run.tiles[20].revealed=true;run.tiles[20].cleared=true;run.heroTile=20;
const passage=run.tiles[21],enemy=run.tiles[22],trap=run.tiles[15];
passage.kind='empty';passage.revealed=true;passage.cleared=false;passage.drops={gold:7};
enemy.kind='enemy';enemy.revealed=true;enemy.foe=foe;foe.hp=120;foe.maxHp=120;
foe.atk=1;foe.cooldown=99;foe.skill={every:99,kind:'shot',name:'none'};
trap.kind='trap';trap.revealed=false;
const prevHp=foe.hp,prevTurn=run.turn;
A('strike',enemy.id);
assert.ok(foe.hp<prevHp,'Opened floor and uncollected loot must not block melee reachability');
assert.equal(run.turn,prevTurn+1,'Successful attack must cost exactly one turn');
// An actually closed slab still blocks the same enemy.
foe.hp=120;foe.deathProcessed=false;run.floorCleared=false;passage.revealed=false;passage.drops=null;passage.cleared=false;
const blocked=run.turn;A('strike',enemy.id);
assert.equal(foe.hp,120);assert.equal(run.turn,blocked,'Hidden intervening slab blocks attack');
// An intervening living creature also blocks, even if it does not block exploration.
passage.revealed=true;passage.kind='enemy';passage.foe={hp:10,ranged:true};passage.cleared=false;
A('strike',enemy.id);assert.equal(run.turn,blocked,'Another monster is not a walkable corridor');
passage.kind='empty';passage.foe=null;passage.cleared=true;
// Full-floor victory automatically and safely disarms every trap.
foe.hp=1;run.hp=5000;
const clearHp=run.hp,clearTurn=run.turn;
A('strike',enemy.id);
assert.equal(run.floorCleared,true);
assert.equal(trap.revealed,true,'Full clear uncovers hidden traps');
assert.equal(trap.trapSpent,true,'Full clear auto-disarms them');
assert.equal(trap.trapActive,false,'Auto-disarmed traps are inactive');
assert.equal(run.trappedTile,null,'Auto-clear does not hold the hero');
assert.equal(run.hp,clearHp,'Full clear does no trap damage');
assert.equal(run.turn,clearTurn+1,'Clear needs no extra turns');
const disarmedTurn=run.turn,disarmedHp=run.hp;
A('pickup',trap.id);
assert.equal(run.turn,disarmedTurn,'Disarmed trap costs no further interaction');
assert.equal(run.hp,disarmedHp,'Disarmed trap is harmless');
// Before completion of a floor, manually found traps are still dangerous.
run.floorCleared=false;trap.revealed=false;trap.cleared=false;trap.trapSpent=false;trap.trapActive=false;
run.hp=5000;const trapHp=run.hp;
A('reveal',trap.id);
assert.equal(trap.trapActive,true);assert.equal(run.trappedTile,trap.id);
assert.ok(run.hp<trapHp,'Manual opening before full clear must damage the hero');
A('pickup',trap.id);
assert.equal(trap.trapSpent,true);assert.equal(run.trappedTile,null);
// A trap exposed by magic without activation is still live until victory.
trap.revealed=true;trap.cleared=false;trap.trapSpent=false;trap.trapActive=false;
A('pickup',trap.id);assert.equal(trap.trapSpent,false);assert.equal(trap.trapActive,true);
A('pickup',trap.id);assert.equal(trap.trapSpent,true);assert.equal(run.trappedTile,null);
// Inventory inspection must never spend resources or advance rounds.
run.hp=30;run.potions=3;
A('ui-panel','bag');
assert.match(el('overlay').innerHTML,/data-action="active-item-info" data-id="potion"/);
let amount=run.potions,ticks=run.turn;
A('active-item-info','potion');
assert.match(el('overlay').innerHTML,/Восстанавливает 45%/);
assert.match(el('overlay').innerHTML,/data-action="active-item-use" data-id="potion"/);
assert.equal(run.potions,amount);assert.equal(run.turn,ticks);
A('active-item-use','potion');
assert.equal(run.potions,amount-1);assert.equal(run.turn,ticks+1);
run.lootBag=[{id:123,kind:'vial-hp',name:'Малая склянка',qty:2}];run.hp=20;
A('active-item-info','pocket:123');
assert.match(el('overlay').innerHTML,/от 5 до 20 HP/);
assert.equal(run.lootBag[0].qty,2);
A('active-item-use','pocket:123');assert.equal(run.lootBag[0].qty,1);
FE.ensure(run).items.honey=1;run.hp=20;
A('active-item-info','forest:honey');
assert.equal(FE.ensure(run).items.honey,1);
assert.match(el('overlay').innerHTML,/24 HP/);
A('active-item-use','forest:honey');assert.equal(FE.ensure(run).items.honey,0);
run.soulBag.push({id:456,kind:'common',name:'Проверочная душа'});
A('active-item-info','soul:456');assert.equal(run.soulBag.length,1);
A('active-item-use','soul:456');assert.equal(run.soulBag.length,0);
run.preparedPotions=[null,'ghost'];
A('active-item-info','prepared:1');assert.equal(run.preparedPotions[1],'ghost');
A('active-item-use','prepared:1');assert.equal(run.preparedPotions[1],null);
FE.ensure(run).items.water=1;
A('forest-pack');assert.match(el('overlay').innerHTML,/data-action="active-item-info" data-id="forest:water"/);
console.log('PASS reachable combat corridors, automatic safe trap disarm after full clear, and inspection of all backpack consumables');
