'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/main/assets/village.js'),'utf8'),ctx);const V=ctx.window.CryptVillage;
const fresh=()=>({souls:100,diamonds:0,materials:{},city:{},heroRanks:{necromancer:4},heroEssence:{necromancer:29},upgrades:{atk:3}});
const all=m=>{Object.values(V.goods).forEach(k=>m.materials[k]=500);for(const k of ['Железная руда','Стальная руда','Кварцевая руда','Рунная руда'])m.materials[k]=100;};
let m=fresh();V.ensure(m);assert.equal(Object.keys(m.city).length,9);assert.equal(m.upgrades.atk,3);assert.equal(m.heroRanks.necromancer,4);assert.equal(m.heroEssence.necromancer,29);
const snapshot=JSON.stringify(m);V.ensure(m);assert.equal(JSON.stringify(m),snapshot,'Migration is idempotent');
m.materials['ДРЕВЕСИНА']=3;m.materials['древесина']=1;m.materials['Осколок воспоминания']=99;
assert(V.craft(m,'boards',1));assert.equal(V.amount(m,V.goods.boards),2);assert.equal(V.amount(m,'древесина'),0);assert.equal(m.materials['Осколок воспоминания'],99);
let before=JSON.stringify(m);assert.equal(V.craft(m,'parts',1),false);assert.equal(JSON.stringify(m),before,'Missing ingredients never partially spend');
for(const q of [-1,1.5,100,NaN]){assert.equal(V.craft(m,'boards',q),false)}
assert.equal(V.build(m,'__proto__'),false);assert.equal(V.build(m,'unknown'),false);
m.materials['Металлолом']=20;assert(V.craft(m,'parts',5));assert.equal(m.materials['Металлолом'],0);assert.equal(V.amount(m,V.goods.parts),10);
assert.equal(V.craft(m,'ore_parts',1),false,'Forge recipe needs the forge');
assert(V.claimStory(m,'first_fire'));before=JSON.stringify(m);assert.equal(V.claimStory(m,'first_fire'),false);assert.equal(JSON.stringify(m),before,'Story reward is exactly once');
assert(V.build(m,'forge'));assert.equal(m.city.forge,1);assert.equal(m.materials['Осколок воспоминания'],99);assert(V.claimStory(m,'hammer'));assert.equal(V.claimStory(m,'city'),false,'Final charter is sequential');
assert(V.accept(m,'hunt'));const accepted=JSON.stringify(m);assert.equal(V.accept(m,'hunt'),false);assert.equal(JSON.stringify(m),accepted);
let r={actIndex:0,locationIndex:0,floor:10,kills:12,secrets:2};assert(V.record(m,r,true));assert(V.orderReady(m,'hunt'));assert(V.claimOrder(m,'hunt'));assert.equal(V.accept(m,'hunt'),false,'Cannot loop repeat rewards in the village');
before=JSON.stringify(m);assert.equal(V.claimOrder(m,'hunt'),false);assert.equal(JSON.stringify(m),before);V.record(m,r,true);assert.equal(JSON.stringify(m),before,'Same safe return cannot count twice');
r.locationIndex=1;r.kills=17;r.secrets=3;V.record(m,r,true);assert.equal(m.village.counters.kills,17,'Cumulative carried kills are counted only as deltas');assert.equal(m.village.counters.secrets,3);assert(V.accept(m,'hunt'));assert.equal(V.orderReady(m,'hunt'),false,'Past kills do not complete a newly accepted hunt');
assert(V.accept(m,'timber'));assert(V.accept(m,'provisions'));assert.equal(V.accept(m,'caravan'),false,'Locked quests cannot be accepted');
assert(V.cancel(m,'provisions'));assert.equal(V.cancel(m,'provisions'),false);
all(m);assert(V.claimOrder(m,'timber'));assert.equal(V.accept(m,'timber'),false);V.record(m,{kills:1000,secrets:40},false);assert.equal(m.village.counters.kills,17,'Failed expeditions do not bank hunt objectives');assert(V.accept(m,'timber'));
assert.equal(V.research(m,'provision'),false,'Research depends on the relevant building');m.city.inn=1;assert(V.research(m,'provision'));assert.equal(V.bonuses(m).hp,4);assert.equal(V.bonuses(m).mp,2);assert.equal(V.bonuses(m).shield,3);assert.equal(V.research(m,'provision'),false,'Next rank needs the next building level');
const old={souls:0,materials:{'Редкая печать':7},city:{forge:5,barracks:4,library:3,alchemist:2,mine:1},upgrades:{hp:4},heroEssence:{scout:47},activeExpedition:{class:'scout',items:[{id:9}]}};const active=JSON.stringify(old.activeExpedition);V.ensure(old);assert.equal(old.city.forge,5);assert.equal(old.city.inn,0);assert.equal(old.materials['Редкая печать'],7);assert.equal(JSON.stringify(old.activeExpedition),active);
// Complete the actual recovery chain, pay every tier, and prove all maxima are finite.
m=fresh();all(m);m.village=undefined;V.ensure(m);m.village.counters.crafted=1;assert(V.claimStory(m,'first_fire'));
assert(V.build(m,'forge'));assert(V.claimStory(m,'hammer'));for(let i=0;i<3;i++){assert(V.accept(m,'timber'));assert(V.claimOrder(m,'timber'));V.record(m,{actIndex:i,locationIndex:0,floor:10,kills:12,secrets:0},true)}assert(V.claimStory(m,'neighbors'));
for(const id of Object.keys(V.buildings)){while(V.level(m,id)<5)assert(V.build(m,id),id);const data=JSON.stringify(m);assert.equal(V.build(m,id),false);assert.equal(JSON.stringify(m),data)}
assert.equal(V.levels(m),45);assert(V.claimStory(m,'village'));assert(V.claimStory(m,'roads'));assert(V.claimStory(m,'city'));assert.equal(m.village.charter,true);
for(const d of V.researches){m.souls=1000;for(let i=0;i<3;i++)assert(V.research(m,d.id));assert.equal(V.research(m,d.id),false)}
assert.equal(V.bonuses(m).retention,25);assert.equal(V.bonuses(m).salvage,30);assert.equal(V.bonuses(m).shield,24);
const artisan=fresh();V.ensure(artisan);artisan.city.workshop=1;artisan.materials['Металлолом']=20;assert(V.craft(artisan,'parts',5));assert.equal(V.amount(artisan,V.goods.parts),11,'Artel level one improves a real batch of five');
const trade=fresh();V.ensure(trade);trade.materials={'Шкура животного':6,'Осколок воспоминания':9,'Железная руда':9};assert.equal(V.exchange(trade,'Шкура животного'),false);trade.city.market=1;assert(V.exchange(trade,'Шкура животного'));assert.equal(trade.materials['Шкура животного'],3);assert.equal(V.amount(trade,V.goods.rations),1);assert.equal(V.exchange(trade,'Осколок воспоминания'),false);assert.equal(V.exchange(trade,'Железная руда'),false);assert.equal(V.exchange(trade,V.goods.rations),false);
const reloaded=JSON.parse(JSON.stringify(m));V.ensure(reloaded);assert.equal(reloaded.village.charter,true);assert.equal(V.claimStory(reloaded,'city'),false);
console.log('PASS village: exact atomic costs, alias stacks, batch crafting, legacy migration, nine buildings ×5, research ×3, six-story chain, charter, contract limits/repeats, safe-return delta counters and real bonuses');
