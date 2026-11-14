/* UI and autonomous monster regression. Node 20+. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../src/main/assets'),elements={},storage={};
function el(id){return elements[id]||(elements[id]={innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}}});}
const window={addEventListener(){}},document={hidden:false,getElementById:el,querySelector(){return null;},querySelectorAll(){return[];},addEventListener(){}};
const ctx={window,document,Math,Date,console,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,
 localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v}};
vm.createContext(ctx);
for(const name of ['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','gumballs_titles_reference.js',
'titles_runtime.js','expansion.js','clicker_data.js','dungeons.js','clicker_rules.js','systems.js','boss_scripts.js',
'story_events.js','balance.js','combat_feedback.js','hunter_bestiary.js','forest_encounters.js','game.js']){
 if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:16000});
}
const A=window.Crypt.debug.action,state=window.Crypt.state(),HB=window.CryptHunterBook;
A('begin','necromancer');
const r=state.run;
r.hp=window.Crypt.debug.stats().hp;r.mp=window.Crypt.debug.stats().mp;r.ep=41;r.gold=79;
window.Crypt.debug.draw();
let html=el('content').innerHTML;
assert.match(html,/class="expedition-ep"/);
assert.match(html,/data-id="talents"[^>]*title="Очки исследования[^"]*"[^>]*aria-label="Очки исследования: 41"/);
assert.match(html,/class="gold-coin-icon" src="ui\/gold_coin\.png"/);
assert.match(html,/class="quick-mana-cost">◈8 МН/);
assert.match(html,/class="quick-cooldown"/);
r.journalNotes=['Запись путешественника — это текст, не предмет'];
HB.acquire(state.meta);
A('ui-panel','bag');
html=el('overlay').innerHTML;
assert.doesNotMatch(html,/data-action="note-info"/,'Traveler notes stay in journal, not backpack');
assert.match(html,/data-action="hunter-book"/,'Bestiary stays in backpack');
r.scrolls.bolt=3;
A('spell-detail','bolt');
html=el('overlay').innerHTML;
assert.match(html,/class="spell-detail-preview"/);
const extract=()=>Number((el('overlay').innerHTML.match(/<strong>Урон: (\d+)<\/strong>/)||[])[1]);
const dmgBefore=extract();assert.ok(dmgBefore>0);
r.forestWellStats={pow:30};
A('spell-detail','bolt');
const dmgAfter=extract();assert.ok(dmgAfter>dmgBefore,'Displayed current damage grows with magic');
r.talents.mag_elements=1;
A('spell-detail','bolt');
assert.ok(extract()>dmgAfter,'Displayed current damage includes title buffs');
A('ui-panel','spells');
assert.match(el('overlay').innerHTML,/class="book-spell-power">Урон: \d+/);
r.forestWellStats={};r.talents={};
const foe=r.tiles.find(t=>t.foe)?.foe;assert.ok(foe);
r.tiles.forEach(t=>{t.kind='empty';t.revealed=false;t.cleared=false;t.foe=null;t.drops=null;t.hasKey=false;});
r.heroTile=20;r.tiles[20].kind='start';r.tiles[20].revealed=true;r.tiles[20].cleared=true;
const t=r.tiles[21];t.kind='enemy';t.revealed=true;t.foe=foe;
Object.assign(foe,{name:'Автономный страж',hp:200,maxHp:200,atk:7,def:0,guard:0,
 ranged:false,cooldown:2,skill:{every:2,name:'Укрепление'},ability:'fortify',stun:0,burn:0,poison:0,bleed:0,
 guardTurns:0,evadeCharges:0,provoked:false,attackCooldown:99});
r.hp=window.Crypt.debug.stats().hp;r.mp=window.Crypt.debug.stats().mp;
r.summon=null;r.ghost=null;r.titlePanther=null;r.shield=0;r.guardCharges=0;
const random=Math.random;
try{
 Math.random=()=>.99;
 const hpBefore=r.hp;
 A('wait');assert.equal(foe.cooldown,1);
 assert.equal(r.hp,hpBefore,'No attack at one remaining tick without provocation');
 A('wait');
 assert.equal(foe.cooldown,2,'Monster resets countdown after independent action');
 assert.ok(foe.guard>0,'Monster executed fortify ability without hero hitting it');
 assert.ok(r.hp<hpBefore,'Enemy autonomous action can hit hero');
 const turnBefore=r.turn,hpNow=r.hp;
 A('strike',t.id);
 assert.equal(r.turn,turnBefore+1,'Hero attack has one counter, no duplicate timer action');
 assert.ok(r.hp<=hpNow);
 // A side-room foe also acts on its cooldown while left untouched.
 r.tiles[21].foe=null;
 const roomTile=r.tiles[18];
 const guard={id:'guard',name:'Страж комнаты',slot:1,hp:200,maxHp:200,atk:4,def:0,guard:0,
  ranged:false,cooldown:1,skill:{every:2,name:'Защита'},ability:'fortify',stun:0};
 roomTile.kind='chamber';roomTile.revealed=true;roomTile.cleared=false;
 roomTile.room={guards:[guard],guardHp:200,secret:false,rewardTaken:false,secretTaken:false,turns:0};
 r.chamberActive=18;
 A('wait');
 assert.ok(guard.guard>0,'Room monster uses timed buff independently');
 assert.equal(guard.cooldown,2,'Room monster cooldown resets');
}finally{Math.random=random;}
console.log('PASS HUD EP, money art, skill MP, spell damage modifiers, no traveler paper, autonomous main/room enemy timers');
