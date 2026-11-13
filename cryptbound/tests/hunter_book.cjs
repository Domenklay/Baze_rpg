/* Offline hunter book integration tests. Run: node cryptbound/tests/hunter_book.cjs */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../src/main/assets');
const elements={},storage={},events={};
function el(id){return elements[id]||(elements[id]={id,innerHTML:'',textContent:'',style:{},scrollTop:0,classList:{add(){},remove(){},toggle(){}}});}
const window={addEventListener(n,fn){events['window.'+n]=fn;}};
const document={hidden:false,getElementById:el,querySelector(){return null;},querySelectorAll(){return[];},
 addEventListener(n,fn){events['document.'+n]=fn;}};
const ctx={window,document,Date,Math,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},
 setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,console};
vm.createContext(ctx);
for(const name of ['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','gumballs_titles_reference.js','titles_runtime.js','expansion.js',
 'clicker_data.js','dungeons.js','clicker_rules.js','systems.js','boss_scripts.js','story_events.js',
 'balance.js','hunter_bestiary.js','forest_encounters.js','game.js']){
 if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:12000});
}
const H=window.CryptHunterBook,A=window.Crypt.debug.action,api=window.Crypt;
assert.equal(H.beasts.length,10);
assert.equal(H.trophies.length,5);
assert.ok(fs.existsSync(path.join(root,'hunter_book.svg')));
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/hunter_bestiary\.css/);
A('begin','scout');
const state=api.state(),r=state.run;
assert.ok(r,'Hero started');
const corpse=r.tiles.find(t=>t.kind==='hunter-corpse'),exit=r.tiles.find(t=>t.kind==='exit');
assert.ok(corpse,'Mandatory hunter body on floor 1');
assert.equal(H.owned(state.meta),false);
assert.equal(r.items.some(x=>x.name==='Охотничий бестиарий'),false,'Book is a special item, not gear');
r.hp=100000;r.key=true;exit.revealed=true;
A('descend');
assert.equal(r.floor,1,'Cannot descend without book');
corpse.revealed=true;
const turn=r.turn;
A('pickup',corpse.id);
assert.ok(H.owned(state.meta));
assert.ok(corpse.cleared);
assert.ok(r.turn>turn,'Picking up the book costs one turn');
assert.match(el('overlay').innerHTML,/Охотничий бестиарий/);
assert.match(el('content').innerHTML,/hb-v072-access/,'Book sits next to key in painted v0.7.2 HUD');
assert.match(el('content').innerHTML,/expedition-top/,'New expedition HUD remains active');
assert.match(el('content').innerHTML,/battle-dock/,'New battle dock remains active');
A('close');
const turnBefore=r.turn;
A('hunter-book');
assert.equal(r.turn,turnBefore,'Opening the book is free');
A('hunter-tab','trophies');
assert.match(el('overlay').innerHTML,/Клык альфа-волка/);
A('hunter-tab','bonuses');
assert.match(el('overlay').innerHTML,/Активные бонусы книги/);
A('hunter-tab','beasts');
A('hunter-select','r1_0');
assert.match(el('overlay').innerHTML,/Лесной волк/);
A('close');
const decorated=H.render(state.meta,'beasts','r1_0');
assert.ok(decorated.indexOf('hb-beast-list')<decorated.indexOf('hb-detail'),'Left creature list before right details');
assert.ok((decorated.match(/pose-idle/g)||[]).length>=10,'All ten species use real idle sprites');
for(const art of ['hunter_spread.svg','hunter_stage.svg','hunter_row.svg','hunter_progress.svg','hunter_milestone.svg',
 'gear_ring_hunter.svg','gear_boots_hunter.svg']){
 const file=path.join(root,art);assert.ok(fs.existsSync(file),'Missing illustrated sprite '+art);
 assert.ok(fs.statSync(file).size>450,'Sprite cannot be empty: '+art);
}
const css=fs.readFileSync(path.join(root,'hunter_bestiary.css'),'utf8');
assert.match(css,/grid-template-columns:minmax\(0,50%\) minmax\(0,50%\)/,'Two facing book pages on narrow phones');
assert.match(css,/\.hb-beast-list\{[^}]*overflow-y:auto/,'Creature list must scroll inside its own page');
assert.match(css,/#overlay \.dialog\.hb-dialog \.hb-detail \.hb-description\{[^}]*color:#3e291b!important/,'Description must be dark, readable ink on parchment');
assert.match(decorated,/hb-label-row/,'Names and counts share a bounded row');
A('ui-panel','bag');
assert.match(el('overlay').innerHTML,/gear_boots_hunter\.svg/);
assert.match(el('overlay').innerHTML,/gear_ring_hunter\.svg/);
A('close');
const beforeAtk=api.debug.stats().atk;
for(let n=0;n<40;n++)H.gain(state.meta,r,{id:'r1_0',elite:false,boss:false},n+200);
assert.equal(H.score(state.meta,'r1_0'),40);
assert.equal(H.bonus(state.meta,'atk'),11,'Milestone bonuses sum');
assert.equal(api.debug.stats().atk,beforeAtk+11);
H.gain(state.meta,r,{id:'r1_0'},220);
H.gain(state.meta,r,{id:'r1_0'},999);
assert.equal(H.score(state.meta,'r1_0'),40,'No duplicate or overflow rewards');
H.gain(state.meta,r,{id:'r1_2',elite:true},999);
assert.equal(H.score(state.meta,'r1_2'),0,'Elites do not count as ordinary foxes');
A('descend');
assert.equal(r.floor,2,'Book permits descent');
assert.equal(r.tiles.some(t=>t.kind==='hunter-corpse'),false,'No duplicate mandatory body');
const well=r.tiles.find(t=>t.kind==='forest-well')||r.tiles.find(t=>t.kind==='empty');
assert.ok(well);
well.kind='forest-well';well.revealed=true;well.cleared=false;r.gold=1000;r.hp=100000;
A('pickup',well.id);
assert.match(el('overlay').innerHTML,/Лесной колодец/);
const prevGold=r.gold;
A('forest-well-offer',well.id);
assert.equal(well.cleared,true);
assert.ok(r.gold<prevGold);
assert.equal(r.forestWellUses,1);
const stableGold=r.gold;
A('forest-well-offer',well.id);
assert.equal(r.gold,stableGold,'Well cannot be exploited repeatedly');
/* Main-maze target selection must be explicit and free until a target is chosen. */
const living=r.tiles.filter(t=>t.foe&&t.foe.hp>0);
assert.ok(living.length>=2);
for(const tile of living){tile.revealed=true;Object.assign(tile.foe,{hp:700,maxHp:700,atk:1,def:0,cooldown:99,stun:0});}
r.scrolls.bolt=3;r.mp=1000;r.hp=100000;
const chosen=living[living.length-1],other=living[0],initial=chosen.foe.hp,otherInitial=other.foe.hp,turnBeforeAim=r.turn;
/* Casting at a revealed distant monster still requires an excavated route. */
const neighbor=window.ClickerRules.near(chosen.id).find(id=>r.tiles[id]!==other&&!r.tiles[id].foe);
assert.notEqual(neighbor,undefined);
const entry=r.tiles[neighbor];entry.kind='empty';entry.revealed=true;entry.cleared=true;entry.drops=null;
r.heroTile=neighbor;
A('cast','bolt');
assert.equal(r.pendingSpell,'bolt');
assert.match(el('content').innerHTML,/spell-target-banner/);
assert.match(el('content').innerHTML,/spell-target-valid/);
assert.equal(r.turn,turnBeforeAim);
assert.equal(r.scrolls.bolt,3);
A('cancel-target');
assert.equal(r.pendingSpell,null);
assert.equal(r.turn,turnBeforeAim);
A('cast','bolt');
A('cast-target',chosen.id);
assert.equal(r.pendingSpell,null);
assert.equal(r.turn,turnBeforeAim+1);
assert.equal(r.scrolls.bolt,2);
assert.ok(chosen.foe.hp<initial);
assert.equal(other.foe.hp,otherInitial,'A single-target scroll hits the selected enemy only');
api.save();
const saved=JSON.parse(storage.cryptbound_local_v1);
assert.equal(saved.meta.hunterBook.owned,true);
assert.equal(saved.meta.hunterBook.counts.r1_0,40);
assert.equal(saved.run.forestWellUses,1);
console.log('PASS Hunter book: mandatory corpse, permanent mastery, HUD, UI tabs, summing buffs, anti-duplication and wells.');
