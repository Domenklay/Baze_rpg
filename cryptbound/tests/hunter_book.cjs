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
for(const name of ['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','expansion.js',
 'clicker_data.js','dungeons.js','clicker_rules.js','systems.js','boss_scripts.js','story_events.js',
 'balance.js','hunter_bestiary.js','game.js']){
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
assert.match(el('content').innerHTML,/hb-open/,'Book is available from top HUD');
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
api.save();
const saved=JSON.parse(storage.cryptbound_local_v1);
assert.equal(saved.meta.hunterBook.owned,true);
assert.equal(saved.meta.hunterBook.counts.r1_0,40);
assert.equal(saved.run.forestWellUses,1);
console.log('PASS Hunter book: mandatory corpse, permanent mastery, HUD, UI tabs, summing buffs, anti-duplication and wells.');
