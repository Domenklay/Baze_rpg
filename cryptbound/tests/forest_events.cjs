/* Forest events: all 50 authored encounters, approved sprites and playable choices. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src/main/assets');
const elements={},storage={};
function el(id){return elements[id]||(elements[id]={id,innerHTML:'',textContent:'',style:{},scrollTop:0,classList:{add(){},remove(){},toggle(){}}});}
const window={addEventListener(){}},document={hidden:false,getElementById:el,querySelector(){return null;},querySelectorAll(){return[];},addEventListener(){}};
const ctx={window,document,Date,Math,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,console,
 localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]}};
vm.createContext(ctx);
for(const name of ['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','gumballs_titles_reference.js','titles_runtime.js','expansion.js','clicker_data.js','dungeons.js','clicker_rules.js','systems.js','boss_scripts.js','story_events.js','balance.js','combat_feedback.js','hunter_bestiary.js','forest_encounters.js','game.js'])
 {if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:16000});
}
const api=window.Crypt,A=api.debug.action,FE=window.CryptForestEvents,HB=window.CryptHunterBook;
const meta=api.state().meta;
assert.equal(FE.scenes.length,50);
assert.deepEqual(Array.from(FE.scenes,x=>x.id),Array.from({length:50},(_,i)=>i+1));
assert.ok(FE.scene(2).title.includes('колодец'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'forest_events/manifest.json'),'utf8'));
assert.equal(manifest.length,192);
const manifestById=new Map(manifest.map(x=>[x.id,x]));
for(const scene of FE.scenes){
 assert.ok(manifestById.has(scene.art), 'Missing approved event sprite '+scene.art);
 assert.ok(scene.text.length>35&&scene.choices.length>=2,'Event lacks meaningful choice '+scene.id);
 assert.ok(scene.min>=1&&scene.min<=50);
 for(const option of scene.choices){
  const parts=option.split('|');
  assert.ok(parts[0]&&parts[1], 'Empty forest option '+scene.id);
  for(const effect of parts[1].split(';'))
   assert.ok(/^(leave|gold:|ep:|heal:|hp:|mana:|shield:|potion:|scroll:|earthgate|item:|take:|flag:|material:|gear:|reveal:|stat:|status:|trophy:|fight:|hunt:)/.test(effect),'Unknown effect '+effect);
 }
}
for(const entry of manifest){
 const p=path.join(root,'forest_events',entry.sprite_path);
 const bytes=fs.readFileSync(p);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Not PNG '+p);
 assert.equal(bytes.readUInt32BE(16),128,'Sprite width mismatch '+p);
 assert.equal(bytes.readUInt32BE(20),128,'Sprite height mismatch '+p);
 assert.equal(bytes[25],6,'Not RGBA transparent-capable '+p);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256,'Wrong edition of sprite '+p);
}
assert.ok(fs.existsSync(path.join(root,'forest_encounters.css')));
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/forest_encounters\.js/);
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/forest_encounters\.css/);
const synthetic={floor:1,gold:100,ep:0,hp:70,mp:10,shield:0,materials:{},forestWellStats:{},tiles:[]};
FE.ensure(synthetic);
assert.ok(FE.has(synthetic,'gold:15'));
assert.ok(!FE.has(synthetic,'item:ranger_badge'));
assert.ok(FE.scenes.filter(x=>x.repeat).length>=8);
for(let i=0;i<200;i++){const id=FE.pick(synthetic,[1,3]);assert.ok(id!==2&&id!==1&&id!==3);}

A('begin','scout');
let r=api.state().run;
HB.acquire(meta);
r.hp=100000;r.mp=2000;
function eventTile(sceneId){
 const t=r.tiles.find(t=>t.kind==='empty'&&t.id!==r.heroTile);
 assert.ok(t,'Need free tile for event');
 t.kind='forest-event';t.forestId=sceneId;t.cleared=false;t.revealed=true;t.foe=null;
 return t;
}
const squirrel=eventTile(1);
A('pickup',squirrel.id);
assert.match(el('overlay').innerHTML,/Рыжуха/);
assert.match(el('overlay').innerHTML,/forest_events\/sprites\/F03_001\.png/);
const turn=r.turn;
A('forest-choice',squirrel.id+':0');
assert.equal(r.turn,turn+1,'Starting wolf battle must cost one turn');
assert.equal(squirrel.forestPhase,'fight');
let wolves=r.tiles.filter(t=>t.foe&&t.foe.forestTask==='encounter:'+squirrel.id+':'+r.floor);
assert.equal(wolves.length,3,'Exactly 3 wolves must spawn');
for(const wolf of wolves){
 wolf.foe.hp=1;wolf.foe.evadeCharges=0;wolf.revealed=true;
 // The hero must be adjacent, not attack through undiscovered cells.
 const near=window.ClickerRules.near(wolf.id).find(id=>r.tiles[id]&&!r.tiles[id].foe);
 assert.notEqual(near,undefined,'A navigable spot beside the quest wolf is required');
 const land=r.tiles[near];land.kind='empty';land.revealed=true;land.cleared=true;land.drops=null;
 r.heroTile=near;
 A('strike',wolf.id);
 assert.equal(wolf.foe.hp,0,'Quest wolf must die during the scripted kill test');
}
assert.equal(squirrel.forestPhase,'reward','Squirrel must be freed after three kills');
A('pickup',squirrel.id);assert.match(el('overlay').innerHTML,/Поговорить с Рыжухой/);
A('forest-choice',squirrel.id+':0');
assert.equal(FE.ensure(r).items.forest_coin,1);
assert.equal(FE.ensure(r).flags.squirrel_saved,true);
const coinCount=FE.ensure(r).items.forest_coin;
A('forest-choice',squirrel.id+':0');
assert.equal(FE.ensure(r).items.forest_coin,coinCount,'Quest coin must not duplicate');
A('close');

let well=r.tiles.find(t=>t.kind==='forest-well')||r.tiles.find(t=>t.kind==='empty'&&t.id!==r.heroTile);
assert.ok(well);well.kind='forest-well';well.revealed=true;well.cleared=false;well.foe=null;
const statsBefore=Object.values(r.forestWellStats).reduce((a,b)=>a+b,0);
A('pickup',well.id);assert.match(el('overlay').innerHTML,/Лесная монетка/);
A('forest-well-coin',well.id);
assert.equal(well.cleared,true);
assert.equal(FE.ensure(r).items.forest_coin,0);
assert.equal(Object.values(r.forestWellStats).reduce((a,b)=>a+b,0),statsBefore+2);
A('close');

let trap=eventTile(3);
A('pickup',trap.id);
A('forest-choice',trap.id+':0');
assert.equal(FE.ensure(r).items.bleed_trap,1);
A('close');
const victim=r.tiles.find(t=>t.foe&&t.foe.hp>0);
assert.ok(victim);
victim.revealed=true;victim.foe.hp=10000;
// A visible target is unusable by traps until a navigable corridor reaches it.
const entryId=window.ClickerRules.near(victim.id).find(id=>r.tiles[id]&&!r.tiles[id].foe);
assert.notEqual(entryId,undefined);
const entry=r.tiles[entryId];entry.kind='empty';entry.revealed=true;entry.cleared=true;entry.drops=null;
r.heroTile=entryId;
const turn2=r.turn;
A('forest-use','bleed_trap');
assert.equal(r.pendingForestUse,'bleed_trap');
assert.equal(r.turn,turn2);
assert.match(el('content').innerHTML,/spell-target-banner/);
A('cancel-forest-target');
assert.equal(FE.ensure(r).items.bleed_trap,1);
A('forest-use','bleed_trap');
A('forest-target',victim.id);
assert.equal(FE.ensure(r).items.bleed_trap,0);
assert.equal(r.pendingForestUse,null);
assert.equal(victim.foe.bleed,3);
assert.ok(victim.foe.stun>=0);
assert.equal(r.turn,turn2+1);
A('close');

const f=FE.ensure(r),trophyEvent={id:99,forestId:25,revealed:true,cleared:false};
f.flags.wolf_tracks=true;
const fake={spawn:(type,count,task,alpha)=>{assert.equal(type,'wolf');assert.equal(count,1);assert.equal(alpha,true);return 1;},stats:api.debug.stats,rollSpell:()=>({id:'bolt',name:'Искра'}),grantScroll:()=>1,addItem:()=>({name:'Предмет'}),revealSafe:()=>1,target:()=>null};
const res=FE.choose(r,meta,trophyEvent,0,fake);
assert.equal(res.ok,true);
assert.equal(f.hunts.wolf.attempts,1);
FE.onKill(r,{forestTask:'hunt:wolf'},fake);
assert.equal(f.pendingTrophies.wolf,true);
assert.equal(HB.ensure(meta).trophies.wolf,undefined,'Hunt trophy must NOT become permanent before safe return');
const earned=FE.safeReturn(r,meta,HB);
assert.equal(earned,1);
assert.equal(HB.ensure(meta).trophies.wolf,true);
assert.equal(FE.safeReturn(r,meta,HB),0,'Safe return cannot duplicate trophy');
api.save();
const saved=JSON.parse(storage.cryptbound_local_v1);
assert.equal(saved.meta.hunterBook.trophies.wolf,true);
assert.equal(saved.run.forest.flags.squirrel_saved,true);
console.log('PASS Forest: 50 stories / 192 RGBA hashes / wolf quest / squirrel coin / well / trap targeting / alpha trophy / saves.');
