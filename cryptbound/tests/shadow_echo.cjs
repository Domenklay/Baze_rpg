/* Shadow Warrior Echo regression. Run with Node 20+. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../src/main/assets');
const elements={},store={};
function el(id){return elements[id]||(elements[id]={id,innerHTML:'',textContent:'',style:{},scrollTop:0,classList:{add(){},remove(){},toggle(){}}});}
const window={addEventListener(){}},document={hidden:false,getElementById:el,querySelector(){return null;},querySelectorAll(){return []},addEventListener(){}};
const ctx={window,document,console,Math,Date,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,
 localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]}};
vm.createContext(ctx);
const sources=['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','gumballs_titles_reference.js','titles_runtime.js',
'expansion.js','clicker_data.js','dungeons.js','clicker_rules.js','systems.js','boss_scripts.js','story_events.js','balance.js',
'combat_feedback.js','hunter_bestiary.js','forest_encounters.js','t1_encounters.js','mining.js','ridge_catalog.js','ridge_events.js','game.js'];
for(const name of sources){
 if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:15000});
}
const TR=window.CryptTitlesRuntime,game=window.Crypt,A=game.debug.action;
A('begin','guardian');
const run=game.state().run;
run.ep=25000;
for(const title of ['war_novice','war_fighter','war_magic','war_shadow'])A('talent',title);
assert.equal(run.talents.war_shadow,1);
const originalRandom=Math.random;
try{
 // A deterministic roll prevents crit, dodge, proc and passive reflection from distorting the test.
 Math.random=()=>.99;
 const h={stats:game.debug.stats,log:()=>{},targets:()=>[],reachable:()=>true,kill:()=>{}};
 TR.onKill(run,{name:'Моховой слизень',elite:false,boss:false},{},h);
 assert.equal(run.titleEchoCharges,1,'Rank IV Shadow Warrior gains one echo on kill');
 assert.equal(run.titleDarkSoulTurns,undefined,'No autonomous soul turns remain');
 assert.equal(TR.consumeEcho(run),true);
 assert.equal(TR.consumeEcho(run),false,'A consumed charge cannot be reused');
 run.talents.war_shadow=3;
 TR.onKill(run,{name:'Слизень'},{},h);
 assert.equal(run.titleEchoCharges,3,'Rank III title effect fills up to three Echo charges');
 TR.onKill(run,{name:'Слизень'},{},h);
 assert.equal(run.titleEchoCharges,3,'Echo cannot exceed three charges');
 // Existing old-save soul duration is converted without losing the current run.
 const legacy={class:'guardian',titleVersion:2,talents:{war_shadow:1},titleDarkSoulTurns:2};
 TR.init(legacy);
 assert.equal(legacy.titleEchoCharges,2);
 assert.equal(legacy.titleDarkSoulTurns,undefined);
 // A waiting turn must not perform an autonomous Echo strike.
 const target=run.tiles.find(t=>t.foe)?.foe;
 assert.ok(target);
 run.tiles.forEach(t=>{t.kind='empty';t.cleared=true;t.revealed=false;t.foe=null;t.drops=null;t.hasKey=false;});
 run.heroTile=20;run.tiles[20].kind='start';run.tiles[20].revealed=true;
 const cell=run.tiles[21];cell.kind='enemy';cell.revealed=true;cell.cleared=false;cell.foe=target;
 Object.assign(target,{name:'Контрольный монстр',hp:500,maxHp:500,def:0,guard:0,atk:4,baseAtk:4,
  stun:0,evadeCharges:0,burn:0,poison:0,cooldown:4,attackCooldown:4,skill:{every:99}});
 run.hp=game.debug.stats().hp;
 run.titleEchoCharges=1;
 const beforeWait=target.hp,chargesBeforeWait=run.titleEchoCharges,turnBeforeWait=run.turn;
 A('wait');
 assert.equal(target.hp,beforeWait,'Echo does not attack independently while passing a turn');
 assert.equal(run.titleEchoCharges,chargesBeforeWait,'Waiting does not consume an Echo charge');
 assert.equal(run.turn,turnBeforeWait+1);
 // One normal action: one counterattack, two physical hits, no extra turn.
 const hp=target.hp,turn=run.turn;
 const logStart=run.log.length;
 A('strike',21);
 const events=run.log.slice(0,run.log.length-logStart);
 assert.ok(target.hp<hp,'Ordinary attack damages target');
 assert.equal(run.titleEchoCharges,0,'Echo spends exactly one charge');
 assert.equal(run.turn,turn+1,'Echo second hit never costs a second turn');
 assert.equal(events.filter(x=>x.includes('Эхо — второй удар')).length,1,'Exactly one bonus hit');
 assert.equal(events.filter(x=>x.includes('отвечает первым')).length,1,'Only one enemy counter before both strikes');
 assert.match(el('content').innerHTML,/quick-spell/);
 // Echo state is visible to the player in their buff strip.
 run.titleEchoCharges=2;game.debug.draw();
 assert.match(el('content').innerHTML,/data-id="titleEchoCharges"/);
 // First hit killing an enemy does not hit a corpse a second time.
 target.hp=1;target.deathProcessed=false;cell.cleared=false;
 run.titleEchoCharges=1;
 const logBefore=run.log.length;
 A('strike',21);
 assert.equal(run.log.slice(0,run.log.length-logBefore).filter(x=>x.includes('Эхо — второй удар')).length,0);
 // Side-room melee has the same double strike and one retaliatory action.
 const cave=run.tiles[18],guard={id:'test-guard',name:'Страж комнаты',slot:1,hp:350,maxHp:350,atk:4,def:0,
  stun:0,cooldown:4,evadeCharges:0,skill:{every:99}};
 cave.kind='chamber';cave.revealed=true;cave.cleared=false;cave.entered=true;
 cave.room={guards:[guard],guardHp:350,rewardTaken:false,secretTaken:false,secret:false,turns:0};
 run.chamberActive=18;run.titleEchoCharges=1;run.log=[];
 const startTurn=run.turn,logAt=run.log.length;
 A('chamber-fight','18:1');
 const sideEvents=run.log.slice(0,run.log.length-logAt);
 assert.ok(guard.hp<350,'Side room target takes damage');
 assert.equal(sideEvents.filter(x=>x.includes('Эхо — второй удар')).length,1,'Side room Echo creates second hit');
 assert.equal(sideEvents.filter(x=>x.includes('отвечает первым')).length,1,'Side room guard counters once');
 assert.equal(run.turn,startTurn+1);
 assert.equal(run.titleEchoCharges,0);
}finally{Math.random=originalRandom;}
console.log('PASS Shadow Warrior Echo: charge caps, migration, two maze hits, one counter/turn, side rooms, no autonomous soul');
