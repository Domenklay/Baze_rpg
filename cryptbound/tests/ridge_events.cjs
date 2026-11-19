/* The second T1 location: 50 story scenes, three pinned entrances, reusable floors,
   one drill, spectrals with separate ore payout, persistent uniques and consumables. */
'use strict';const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ctx={window:{}};vm.createContext(ctx);
for(const name of ['mining.js','ridge_catalog.js','ridge_art.js','ridge_events.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/main/assets',name),'utf8'),ctx,{filename:name});
const RG=ctx.window.CryptRidgeEvents,CM=ctx.window.CryptMining,cat=RG.catalog,RA=ctx.window.CryptRidgeArt;
const assetDir=path.resolve(__dirname,'../src/main/assets');
for(const [group,n,fn] of [['scenes',50,RA.scene],['questItems',31,RA.item],['equipment',17,RA.gear],['npcs',12,RA.npc]]){
 const ids=Object.keys(RA[group]);assert.equal(ids.length,n,group+' number of sprites');
 for(const id of ids){const src=fn(id);assert(src&&fs.existsSync(path.join(assetDir,src)),group+': missing '+id);
  const data=fs.readFileSync(path.join(assetDir,src));assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(data.readUInt32BE(16),128);assert.equal(data.readUInt32BE(20),128);assert.equal(data[25],6);
 }
}
assert.equal(RA.scene(1),'ridge_v2/scenes/01_first_shaft_entrance.png');
assert.equal(RA.scene(50),'ridge_v2/scenes/50_mountain_heart.png');
const htmlIndex=fs.readFileSync(path.join(assetDir,'index.html'),'utf8');
assert(htmlIndex.includes('ridge_art.js')&&htmlIndex.includes('ridge_art.css'),'0.9.1 must load mountain art');
assert.equal(cat.length,50);assert.equal(new Set(cat.map(e=>e.id)).size,50);
assert(cat.every(e=>e.choices.length>=2),'every scene has a choice');assert(cat.every(e=>e.title&&e.text&&e.min));
assert(cat.every(e=>e.choices.every(o=>!o.reward.includes('ep:')&&!o.reward.includes('reveal:'))),'no useless reveal/experience prizes');
function hero(){return {actIndex:0,locationIndex:1,floor:1,materials:{},items:[],equip:{weapon:null},hp:100,mp:50,gold:1000,forestWellStats:{}};}
function api(){return {stats:()=>({hp:200,mp:80}),addItem:(slot,rarity)=>({id:200,slot,rarity}),homeStorage:()=>({}),spawn:(_,count)=>count};}
let r=hero(),state=RG.ensure(r);
assert(state.shaft.base>=11&&state.shaft.base<=18);
assert.equal(RG.floorSpecials({...r,ridge:state})[0],undefined); // ordinary floor
r.floor=state.shaft.base;assert(RG.floorSpecials(r).includes(1));
const event=function(id){return {t1Id:id,kind:'t1-event',revealed:true,cleared:false,id:8};};
let t=event(1);
for(let i=0;i<3;i++){let result=RG.choose(r,t,0,api());assert(result.ok&&result.turn&&result.keep);}
assert.equal(state.shaft.first,3);
assert(RG.render(r,t).includes('следующий тоннель'));
assert(RG.render(r,t).includes(RA.scene(1)),'event dialog artwork missing');
r.floor=state.shaft.base+10;assert(RG.floorSpecials(r).includes(11));
t=event(11);let back=RG.choose(r,t,0,api());assert.equal(back.navigate,-10);assert(RG.floorSpecials(r).includes(11),'fixed until travel');
for(let i=0;i<3;i++)assert.equal(RG.choose(r,t,1,api()).ok,true);
assert.equal(state.shaft.middle,3);
r.floor=state.shaft.base+20;t=event(21);
for(let i=0;i<3;i++)assert.equal(RG.choose(r,t,0,api()).ok,true);
const jump=RG.choose(r,t,0,api());assert.equal(jump.navigate,20);assert.equal(state.shaft.jumped,true);
assert.equal(RG.choose(r,t,1,api()).navigate,undefined,'jump cannot be reissued');
r.floor=state.bur.floor;t=event(12);assert(RG.floorSpecials(r).includes(12));
let start=RG.choose(r,t,0,api());assert(start.ok&&start.turn&&t.cleared);
assert.equal(state.bur.status,'active');assert(!RG.floorSpecials(r).includes(12));
r.floor++;assert.equal(RG.eliteCount(r),1);
RG.beginEliteFloor(r,1);
assert.equal(state.bur.pending,1);
const notice=RG.onEtherealKill(r);assert(notice.includes('руда'));
assert.equal(state.bur.completed,1);assert.equal(RG.onEtherealKill(r),'');
assert.equal(r.materials['Железная руда'],3);
assert.equal(r.materials['Стальная руда'],1);
RG.onFloorTransition(r,r.floor-1);assert.equal(state.bur.status,'lost');
assert.equal(RG.eliteCount(r),0);
const second=hero();second.materials['Железная руда']=10;
let bag=event(4);const add={...api(),addItem:function(slot,rarity){const item={id:501,slot,rarity,atk:0,def:0,hp:0,mp:0,crit:0};second.items.push(item);return item;}};
let choice=RG.choose(second,bag,1,add);assert.equal(choice.ok,true);
assert.equal(second.items[0].name,'Сумка шахтёра');
assert.equal(RG.gearBonus(second,'mineExtra'),0,'not equipped');
second.equip.armor=501;assert.equal(RG.gearBonus(second,'mineExtra'),20);
assert.equal(RG.choose(second,event(4),1,add).ok,false,'one-off scene cannot be repeated');
assert.equal(second.items.length,1,'no duplicates');
second.ridge.items.healing_salt=1;let medicine=RG.useItem(second,'healing_salt');assert(medicine.ok);assert.equal(second.ridge.items.healing_salt,undefined);
second.ridge.items.recovery_crystal=1;second.hp=70;second.mp=5;
assert.equal(RG.useItem(second,'recovery_crystal',{hp:110,mp:80}).ok,true);
assert.equal(second.hp,110);assert.equal(second.mp,80);
second.ridge.items.healing_salt=1;second.hp=103;
RG.useItem(second,'healing_salt',{hp:110,mp:80});assert.equal(second.hp,110);
second.ridge.items.rune_accumulator=1;second.mp=70;
RG.useItem(second,'rune_accumulator',{hp:110,mp:80});assert.equal(second.mp,80);
second.ridge.items.rail_key=1;let listed=RG.inventory(second);assert(listed.some(x=>x.id==='rail_key'&&!x.usable));
assert(listed.every(x=>x.qty>0));
second.ridge.pendingHome.artel=true;let meta={};
assert(RG.homeRewards(second,meta).includes('artel'));assert(meta.ridgePerks.artel);
assert.equal(RG.homeRewards(second,meta).length,0,'no repeat base achievements');
// A transferred ore stack must land under the same localized resource key as mining/warehouse.
const bankRun=hero(),bankStorage={};bankRun.floor=40;
bankRun.materials['Железная руда']=25;
const bankApi={...api(),homeStorage:()=>bankStorage};
assert.equal(RG.choose(bankRun,event(45),0,bankApi).ok,true);
assert.equal(bankStorage['Железная руда'],20);
assert.equal(bankRun.materials['Железная руда'],5);
assert.equal(bankStorage.iron,undefined);
const saved=JSON.parse(JSON.stringify(second));assert.equal(RG.ensure(saved).unique.miner_bag,true);
const src=fs.readFileSync(path.join(__dirname,'../src/main/assets/game.js'),'utf8');
assert(src.includes("room[11].kind='boss-base-door'")&&src.includes("room[13].kind='boss-next-door'"));
assert(src.includes('if(e.ethereal)'),'spectral kill must bypass normal loot');
assert(src.includes('RG.onFloorTransition(r,to)'),'backtrack loses drill');
assert(src.includes('CryptRidgeArt.itemHtml'),'custom backpack icons');
assert(src.includes('CryptRidgeArt.gearHtml'),'custom mountain gear icons');
assert(src.includes('CryptRidgeArt.sceneHtml'),'custom tile scene icons');
console.log('OK: 50 ridge events, fixed shaft & 20-floor jump, one spectral drill, unique items, base perks, boss doors');