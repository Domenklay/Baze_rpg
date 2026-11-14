/* Regional encounter regression: T1 stage 2/3, quest items, event combat, saves. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../src/main/assets');
const box={window:{},Math,console};
vm.createContext(box);
for(const file of ['dungeons.js','t1_encounters.js'])vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),box,{filename:file,timeout:10000});
const RE=box.window.CryptT1Encounters,DN=box.window.CryptDungeons;
assert.ok(RE&&DN);
const validOps=new Set(['leave','gold','ep','hp','heal','mana','shield','material','item','take','flag','scroll','gear','reveal','stat','clean','fight']);
for(const loc of [1,2]){
 const list=RE.catalog[loc],mobs=DN.acts[0].locations[loc].mobs;
 assert.equal(list.length,30,'Each unfinished T1 region needs 30 distinct encounters');
 assert.deepEqual(Array.from(list,e=>e.id),Array.from({length:30},(_,i)=>i+1));
 const items=new Set(),flags=new Set();
 for(const event of list){for(const option of event.choices){const parts=option.split('|');for(const op of parts[1].split(';')){const a=op.split(':'),k=a[0];if(k==='item')items.add(a[1]);if(k==='flag')flags.add(a[1]);}}}
 for(const event of list){
  assert.ok(event.title.length>5&&event.text.length>55&&event.choices.length>=2,'Incomplete scene '+loc+'/'+event.id);
  assert.ok(event.min>=1&&event.min<=50);
  for(const option of event.choices){
   const parts=option.split('|');assert.ok(parts[0]&&parts[1]);
   if(parts[2]){
    const need=parts[2].split(':');
    if(need[0]==='item')assert.ok(items.has(need[1]),'Never obtainable item '+need[1]);
    else if(need[0]==='flag')assert.ok(flags.has(need[1]),'Never obtainable flag '+need[1]);
    else if(need[0]==='gold')assert.ok(Number(need[1])>0,'Invalid coin cost');
    else assert.fail('Unknown event requirement '+parts[2]);
   }
   for(const op of parts[1].split(';')){
    const x=op.split(':');assert.ok(validOps.has(x[0]),'Unknown op '+op);
    if(x[0]==='take')assert.ok(items.has(x[1]),'Consumes unobtainable '+x[1]);
    if(x[0]==='fight')assert.ok(mobs.some(m=>m.id===x[1]&&!m.boss&&!m.elite),'Encounter foe outside the region '+x[1]);
   }
  }
 }
}
function run(loc){return {actIndex:0,locationIndex:loc,floor:10,ep:1,hp:65,mp:40,gold:50,shield:0,materials:{},forestWellStats:{},poisonTurns:2,bleedTurns:2};}
let spawned,scrolls=0,gear=0;
const api={stats:()=>({hp:100,mp:80}),rollSpell:()=>({id:'bolt',name:'Искра'}),
 grantScroll:()=>{scrolls++;return true;},addItem:()=>{gear++;return {name:'Дорожные сапоги'};},
 revealSafe:n=>n,spawn:(id,n,task)=>{spawned={id,n,task};return n;}};
let r=run(1),t={kind:'t1-event',t1Id:2,revealed:true,cleared:false};
assert.equal(RE.choose(r,t,0,api).ok,true);
assert.equal(RE.state(r).items.ridge_map,1);
assert.equal(RE.state(r).flags.surveyed,true);
assert.equal(t.cleared,true);
assert.equal(RE.choose(r,t,0,api).ok,false,'No double loot on repeated press');
const tBridge={kind:'t1-event',t1Id:7,revealed:true,cleared:false};
assert.equal(RE.choose(r,tBridge,0,api).ok,false,'Bridge needs a rope');
const tRope={kind:'t1-event',t1Id:4,revealed:true,cleared:false};
assert.equal(RE.choose(r,tRope,0,api).ok,true);
assert.equal(RE.choose(r,tBridge,0,api).ok,true);
assert.equal(RE.state(r).flags.bridge_fixed,true);
assert.equal(RE.state(r).items.ridge_rope||0,0);
let battle={kind:'t1-event',t1Id:3,revealed:true,cleared:false};
const before=r.materials['Кожа нетопыря']||0;
const res=RE.choose(r,battle,0,api);
assert.equal(res.combat,true);assert.equal(spawned.id,'r2_0');
assert.equal(r.materials['Кожа нетопыря']||0,before,'Combat rewards must await victory');
assert.match(RE.onKill(r,{t1Task:spawned.task},api),/Засада/);
assert.equal(r.materials['Кожа нетопыря'],1);
assert.equal(RE.onKill(r,{t1Task:spawned.task},api),'','No duplicate rewards after death');
const ridges=RE.inventory(r);
assert.ok(ridges.some(i=>i.name==='Схема землемера'));
const serialized=JSON.parse(JSON.stringify(r));
serialized.locationIndex=2;
assert.equal(RE.state(serialized,1).flags.bridge_fixed,true,'Prior stage state must survive base portal');
const marsh={kind:'t1-event',t1Id:2,revealed:true,cleared:false};
assert.equal(RE.choose(serialized,marsh,0,api).ok,true);
assert.equal(RE.state(serialized).items.bog_map,1);
assert.equal(RE.inventory(serialized).some(x=>x.id==='1:ridge_map'),true);
assert.notEqual(RE.pick(serialized,[1,2,3,4,5,6,7,8,9,10]),2,'Picked scene must not be excluded');
const missing={kind:'t1-event',t1Id:16,revealed:true,cleared:false};
assert.equal(RE.choose(serialized,missing,0,api).ok,false,'Antidote requires a gathered herb');
const tHerb={kind:'t1-event',t1Id:12,revealed:true,cleared:false};
assert.equal(RE.choose(serialized,tHerb,0,api).ok,true);
assert.equal(RE.choose(serialized,missing,0,api).ok,true);
assert.equal(RE.state(serialized).items.bog_antidote,2);
console.log('T1 encounter tests: 30 highland + 30 marsh scenes, fights, item chains, persistence OK');
