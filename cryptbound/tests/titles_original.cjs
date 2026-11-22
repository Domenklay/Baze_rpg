'use strict';
const {TR,game,A,window,ctx,store,assert}=require('./title_fixture');
const catalogue=TR.data;
assert.equal(catalogue.length,76);
assert.deepEqual([0,1,2].map(t=>catalogue.filter(x=>x.tree===t).length),[25,26,25]);
for(const t of catalogue){assert.ok(t.rank>=1&&t.rank<=5);assert.equal(t.max_level,t.rank===5?1:3);for(const p of t.parents){const parent=catalogue.find(x=>x.id===p);assert.ok(parent&&parent.tree===t.tree&&parent.rank<t.rank,t.id);}}
function begin(hero='necromancer'){A('begin',hero);let r=game.state().run;r.ep=100000;r.hp=game.debug.stats().hp;r.mp=game.debug.stats().mp;return r;}
function h(r){return {stats:()=>({hp:200,mp:100,atk:40,pow:30,def:2}),log(){},targets:()=>[],roomTargets:()=>[],addMaterial:(k,n)=>r.materials[k]=(r.materials[k]||0)+n};}
let r=begin();const oldEp=r.ep;r.titleVersion=2;r.talents={mag_apprentice:3,mag_white:2};r.titleMastery={};r.titleSupplies={wick:2};
const oldTitles=window.CryptGumballsTitleReference;let expected=0;for(const [id,n]of Object.entries(r.talents)){const t=oldTitles.find(t=>t.id===id);for(let i=0;i<n;i++)expected+=t.ep_cost[i];}
TR.init(r);assert.equal(r.ep,oldEp+expected);assert.equal(r.originalTitleRefund,expected);assert.equal(r.titleVersion,3);assert.deepEqual(Object.keys(r.talents),[]);TR.init(r);assert.equal(r.ep,oldEp+expected);
// Full rank-V mastery refunds; unknown keys never grant guessed expensive ranks.
r=begin('guardian');r.titleVersion=2;r.talents={war_novice:3,war_fighter:3,war_magic:3,war_shadow:3,war_duke:1};r.titleMastery={war_duke:{atk:3,pow:2,hp:1}};const ep=r.ep;TR.init(r);assert.equal(r.ep-ep,450+750+1050+1350+500+3000);
// New nodes have only their defined stats; class progression remains independent.
r=begin();r.talents={wt_fighter:3,wt_companion:3,lt_aim:3,lt_supply:3,mt_initiate:3,mt_elements:3,mt_reserve:3};assert.deepEqual(JSON.parse(JSON.stringify(TR.statBonuses(r))),{atk:6,pow:9,hp:100,mp:60,def:0});
for(let rank=1;rank<=6;rank++){assert.equal(TR.canCast(r,{rank}),null);}r.talents={};assert.ok(TR.canCast(r,{rank:5}));
r.talents={mt_economy:3};assert.equal(TR.manaMultiplier(r),.84);
// School locked after first committed specialisation, not merely by opening the picker.
r=begin();A('title-school','water');for(const id of ['mt_initiate','mt_elements','mt_school'])A('talent',id);assert.equal(r.titleState.school,'water');A('title-school','fire');assert.equal(r.titleState.school,'water');const cash=r.ep;A('talent','mt_effect');assert.equal(r.ep,cash);
r.talents={mt_school:3,mt_elemental:3,mt_lord:1,mt_power:3};const fire={school:'fire',kind:'attack'},water={school:'water',kind:'attack'};assert.ok(TR.previewMultiplier(r,water)>TR.previewMultiplier(r,fire));
r.talents={mt_familiar:3,mt_archsummon:1};const pet={hp:100,maxHp:100,atk:20};TR.summoned(r,pet);assert.equal(pet.maxHp,165);assert.equal(pet.atk,33);TR.syncPet(r,pet);assert.equal(pet.maxHp,165);assert.equal(TR.previewMultiplier(r,water),.8);
r.talents={mt_effect:3,mt_expand:3,mt_architect:1};assert.equal(TR.effectTurns(r,{school:'water',kind:'stun'},2),5);assert.equal(TR.schoolDuration(r,'fire'),0);
r.talents={mt_return:3};r.floor=7;r.mp=0;TR.onFloor(r,h(r));assert.equal(r.mp,12);r.mp=0;TR.onFloor(r,h(r));assert.equal(r.mp,0);
r.talents={mt_infinite:1};r.floor=8;r.mp=100;r.shield=0;TR.onFloor(r,h(r));assert.equal(r.shield,20);
// Formula penetration, execution and one-shot chained spell flags.
r=begin();r.talents={mt_arcane:1,mt_execute:3,mt_unbound:1,mt_consequence:1};const target={hp:20,maxHp:100,def:10,titleSpellChain:true,titleControlled:true};const damage=TR.spellHit(r,water,target,100,h(r));assert.equal(damage,232);assert.equal(target.titleSpellChain,false);assert.equal(target.titleControlled,false);
r.talents={mt_resonance:3};r.mp=0;TR.spellCast(r,water);TR.afterSpellHit(r,water,{hp:0},10,20,h(r));TR.afterSpellHit(r,water,{hp:0},10,20,h(r));assert.equal(r.mp,4);
r.talents={mt_channel:3,mt_archsummon:1};r.titleState.school='water';for(let i=1;i<=3;i++){TR.spellCast(r,water);r.titleState.castDamage=100;TR.finishSpell(r,water);assert.equal(r.titleState.petCharge.damage,60);assert.equal(r.titleState.petCharge.double,i===3);}assert.equal(r.titleState.petCharge.school,'water');
console.log('PASS original titles: 76 definitions, migration/refund once, class stats, school lock, familiar tradeoff, spell execution/chaining/penetration, mana lifecycle and summon charges');
