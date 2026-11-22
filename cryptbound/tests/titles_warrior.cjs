'use strict';
const {TR,game,A,assert}=require('./title_fixture');
function setup(nodes){A('begin','necromancer');const r=game.state().run;r.talents=nodes;r.hp=game.debug.stats().hp;r.mp=1000;r.shield=10000;for(const t of r.tiles)Object.assign(t,{kind:'empty',foe:null,drops:null,revealed:true,cleared:true});r.heroTile=0;return r;}
function foe(r,id=1,hp=10000){let t=r.tiles[id];Object.assign(t,{kind:'enemy',cleared:false,foe:{name:'Учебный страж',visual:'skeleton',hp,maxHp:hp,atk:0,def:0,ep:0,gold:0,loot:[],cooldown:999,guard:0}});return t;}
function fixed(fn){const old=Math.random;Math.random=()=>.99;try{return fn()}finally{Math.random=old}}
let r=setup({wt_rhythm:3});let t=foe(r);const hits=[];for(let i=0;i<3;i++){let hp=t.foe.hp;fixed(()=>A('strike',1));hits.push(hp-t.foe.hp);}assert.equal(hits[0],hits[1]);assert.ok(hits[2]>hits[1]);assert.equal(r.turn,3);
const h={stats:()=>({atk:40,hp:200,mp:100}),log(){}};
r=setup({wt_rhythm:3,wt_heavy:3,wt_titans:1});r.titleState.rhythm=2;let e={hp:100,maxHp:100,def:0,boss:true};assert.equal(TR.attack(r,e,40,h),84);
r=setup({wt_rhythm:3,wt_split:3,wt_perfect:1});r.titleState.rhythm=2;e={hp:100,maxHp:100,def:30};assert.equal(TR.attack(r,e,10,h),56);
r=setup({wt_execution:3,wt_verdict:3,wt_punisher:1});e={hp:44,maxHp:100,def:0};assert.equal(TR.attack(r,e,40,h),52);
r=setup({wt_tempo:3,wt_onslaught:1,wt_fervor:1});for(let i=0;i<9;i++)TR.onKill(r,{hp:0},{},h);assert.equal(r.titleState.fervor,5);assert.equal(TR.attack(r,{hp:100,maxHp:100},40,h),65);assert.equal(TR.attack(r,{hp:100,maxHp:100},40,h),46);
r=setup({wt_blood:3,wt_feast:3,wt_insatiable:1,wt_victory:3,wt_redfeast:1});const p={hp:1,maxHp:100,atk:10};r.hp=10;TR.petAfterHit(r,p,{hp:100},1000,h);assert.equal(p.hp,21);TR.petAfterHit(r,p,{hp:0},10,h);assert.equal(p.hp,39);assert.equal(r.hp,20);
r=setup({wt_guard:3,wt_bodyguard:3,wt_lastguard:1});assert.equal(TR.interceptChance(r),.96);p.hp=100;p.titleBarrier=10;assert.equal(TR.petDamage(r,p,100,true),55);assert.equal(p.titleBarrier,0);assert.equal(TR.petDamage(r,p,100,false),100);
r.summon=p;r.hp=10;r.shield=0;r.setShieldRemaining=0;assert.equal(TR.protectFatal(r,10,h),true);assert.equal(p.hp,1);assert.equal(TR.protectFatal(r,10,h),false);
r=setup({wt_formation:3,wt_unbroken:1});r.summon={hp:100,maxHp:100,atk:20};r.floor=12;TR.onFloor(r,h);assert.equal(r.summon.titleBarrier,25);r.summon.titleBarrier=0;TR.onFloor(r,h);assert.equal(r.summon.titleBarrier,0);
r=setup({wt_pair:1});let enemy={hp:100,maxHp:100,titleHeroTurn:r.turn+1};r.turn++;TR.petAfterHit(r,p,enemy,10,h);assert.equal(enemy.titlePairReady,true);assert.equal(TR.petHit(r,p,enemy,20,h),27);assert.equal(TR.petHit(r,p,enemy,20,h),20);
console.log('PASS warrior: real third-strike cadence, bosses/armor/execute, nonstacking victory strike, capped fervor, summon vampirism, stronger interception, once-per-floor fatal save and pet barrier/pair');
