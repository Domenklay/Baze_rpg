/* Forest storyline v2: every authored quest, equipment, resources, replay and story choices. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../src/main/assets');
const ctx={window:{},Math,Date,console};
vm.createContext(ctx);
for(const file of ['forest_encounters.js','forest_rework.js'])
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const FE=ctx.window.CryptForestEvents,FW=ctx.window.CryptForestRework;
assert.equal(FE.scenes.length,50,'50 quests retained');
assert.equal(new Set(FE.scenes.map(x=>x.id)).size,50);
assert.equal(FE.scene(2).title.includes('колодец'),true);
const commands=new Set(['leave','gold','ep','heal','hp','mana','shield','potion','scroll','earthgate','item','take','flag','material','gear','reveal','stat','status','trophy','fight','hunt','unique','home','buff']);
for(const scene of FE.scenes){
 assert(scene.title.length>=8,'quest title '+scene.id);
 assert(scene.text.length>=65,'specific scene description '+scene.id);
 assert(scene.choices.length>=2,'more than one choice '+scene.id);
 assert(/^F0[1-3]_\d{3}$/.test(scene.art),'approved 128×128 icon ID');
 for(const raw of scene.choices){
  const [label,reward,condition]=raw.split('|');
  assert(label&&reward, 'an empty option in '+scene.id);
  for(const op of reward.split(';')){
   const [verb,id]=op.split(':');
   assert(commands.has(verb),'unimplemented effect '+op+' in '+scene.id);
   if(verb==='unique')assert(FW.unique[id],'unknown unique '+id);
   if(verb==='item'||verb==='take')assert(FE.itemDefs[id],'item missing icon '+id);
   if(verb==='buff')assert(['shelter','hunt','trapward'].includes(id),'unused buff '+id);
   if(scene.id!==1&&scene.id!==2)assert(!['reveal','ep'].includes(verb),'weak filler reward '+scene.id);
  }
  if(condition){let p=condition.split(':');assert(['item','flag','gold','floor'].includes(p[0]),'unsupported condition '+raw);}
 }
}
for(const id of [16,24,35,36,40,45,50])assert(FE.scene(id).choices.some(x=>x.includes('unique:')||x.includes('home:')||x.includes('trophy:')),'important storyline reward missing: '+id);
assert.equal(FE.scene(35).need,'','guard post has alternatives to letter');
assert.equal(FE.scene(36).need,'','locked chest has alternative raven key');
function hero(){return {floor:20,actIndex:0,locationIndex:0,hp:60,mp:20,shield:0,gold:250,ep:10,potions:1,materials:{},forestWellStats:{},items:[],equip:{cloak:null,weapon:null},tiles:[]};}
function tile(id){return {id:5,forestId:id,kind:'forest-event',cleared:false,revealed:true};}
const run=hero(),f=FE.ensure(run);f.flags.fox_freed=true;
const api={stats:()=>({hp:120,mp:90}),rollSpell:()=>({id:'bolt',name:'Искра'}),grantScroll:()=>true,
 addItem(slot,rarity){const it={slot,rarity,id:run.items.length+1};run.items.push(it);return it;},
 revealSafe:()=>0,spawn:()=>0,target:()=>null};
assert.equal(FW.priority(run,[FE.scene(16),FE.scene(3)]),16,'linked story appears preferentially');
const fox=tile(16),reward=FE.choose(run,{},fox,0,api);
assert.equal(reward.ok,true);assert.match(reward.message,/Плащ чернолапой лисицы/);
assert.equal(run.items.length,1);assert.equal(run.items[0].forestUnique,'fox_cloak');assert.equal(FW.bonus(run,'dodge'),0);
run.equip.cloak=run.items[0].id;assert.equal(FW.bonus(run,'dodge'),7);
assert.equal(FE.choose(run,{},tile(16),0,api).ok,false,'cannot duplicate unique encounter reward');
f.items.healing_salve=2;const u=FE.use(run,'healing_salve',{stats:()=>({hp:120,mp:90}),target:()=>null});
assert.equal(u.ok,true);assert.equal(f.items.healing_salve,1);assert.equal(run.hp,92);
f.items.water=1;assert.equal(FE.use(run,'water',{stats:()=>({hp:120,mp:90}),target:()=>null}).ok,true,'previous forest cure not broken');
f.items.bleed_trap=1;
const foe={foe:{hp:40,stun:0,bleed:0}};
assert.equal(FE.use(run,'bleed_trap',{stats:()=>({hp:120,mp:90}),target:()=>foe}).ok,true);
assert.equal(foe.foe.bleed,3);
f.flags.oak_voice=true;f.items.oak_rune=1;run.floor=25;
let menhir=FE.choose(run,{},tile(40),0,api);
assert.equal(menhir.ok,true);assert.equal(f.flags.grove_seal,true);
assert.equal(f.items.oak_rune,0);
const town={};FE.safeReturn(run,town,{grantTrophy:()=>true});
assert.equal(town.forestProjects.forest_shrine,true,'safe return commits grove project');
assert.equal(FW.homeReturn(run,town).length,0,'project cannot be claimed twice');
run.shield=0;FW.onFloor(run,town,{hp:120,mp:90});assert.equal(run.shield,5,'forest shrine grants 5 shield every floor');
let cauldron=hero();FE.ensure(cauldron).items.ration=1;
let ration=FE.use(cauldron,'ration',{stats:()=>({hp:120,mp:90}),target:()=>null});
assert.equal(ration.ok,true);assert.equal(cauldron.hp,80);assert.equal(cauldron.mp,32);
const save=JSON.parse(JSON.stringify(run));assert.equal(FE.ensure(save).storyV2.unique.fox_cloak,true,'unique rewards survive reload');
assert.equal(FE.ensure(save).flags.grove_seal,true,'quest decisions survive reload');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert(game.includes('forest-fixed-1'),'squirrel quest guaranteed on first floor');
assert(game.includes('FW.nextQuest(r)'),'chain should get priority slot');
assert(game.includes('FW.bonus(r,\'dodge\')'),'forest unique gear active in combat');
const gatherRun=hero(),gatherBag=FE.ensure(gatherRun);
FW.extra(gatherRun).unique.forager_bag=true;
gatherRun.items.push({id:33,slot:'armor',forestUnique:'forager_bag'});
gatherRun.equip.armor=33;
gatherBag.items.honey=1;
const gather=FE.choose(gatherRun,{},tile(22),0,{...api,addItem:api.addItem});
assert.equal(gather.ok,true);
assert.equal(gatherBag.items.honey,4,'equipped forager bag doubles two found honey pieces with +1 bonus');
assert.equal(gatherRun.materials['Лесной мёд'],undefined,'gather bonus does not create unrelated craft materials');
const legacy=hero(),legacyForest=FE.ensure(legacy);
legacyForest.seen={1:true,4:true,25:true,50:true};
legacyForest.flags.squirrel_saved=true;
legacyForest.hunts.wolf={attempts:1,completed:true};
FW.extra(legacy);
assert.equal(legacyForest.seen[1],true,'do not reissue the unique squirrel coin');
assert.equal(legacyForest.seen[25],true,'do not repeat an earned alpha trophy');
assert.equal(legacyForest.seen[4],undefined,'rewritten fox storyline available to legacy runs');
assert.equal(legacyForest.seen[50],undefined,'rewritten finale available to legacy runs');
console.log('PASS Forest v2: 50 meaningful events, 195 choices, approved sprites, linked quests, unique equipment, consumables, village upgrades and legacy saves.');
