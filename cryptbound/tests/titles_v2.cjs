/* Integration regression for the 65-node title system. Run with Node 20+. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../src/main/assets');
const elements={},store={};
function el(id){return elements[id]||(elements[id]={innerHTML:'',textContent:'',style:{},scrollTop:0,classList:{add(){},remove(){},toggle(){}}});}
const window={addEventListener(){}},document={hidden:false,getElementById:el,querySelector(){return null;},querySelectorAll(){return[]},addEventListener(){}};
const ctx={window,document,Date,Math,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,console,
 localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]}};
vm.createContext(ctx);
const js=['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','gumballs_titles_reference.js','titles_runtime.js','expansion.js',
 'clicker_data.js','dungeons.js','clicker_rules.js','systems.js','boss_scripts.js','story_events.js','balance.js','combat_feedback.js',
 'hunter_bestiary.js','forest_encounters.js','t1_encounters.js','mining.js','ridge_catalog.js','ridge_events.js','game.js'];
for(const name of js){
 if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:15000});
}
const rt=window.CryptTitlesRuntime,A=window.Crypt.debug.action,state=window.Crypt.state();
function begin(klass){A('begin',klass);assert.ok(state.run);state.run.ep=60000;return state.run;}
function purchase(path){for(const id of path)A('talent',id);}
assert.equal(rt.data.length,65);
assert.deepEqual([0,1,2].map(t=>rt.data.filter(x=>x.tree===t).length),[22,22,21]);
assert.equal(new Set(rt.data.map(t=>t.id)).size,65);
for(const t of rt.data){
 assert.ok(t.rank>=1&&t.rank<=5);
 assert.equal(t.rank===1,t.parents.length===0);
 for(const p of t.parents)assert.ok(rt.data.some(u=>u.id===p&&u.tree===t.tree&&u.rank===t.rank-1));
}
let r=begin('scout');
assert.match(el('content').innerHTML,/adventurer-tool/);
assert.equal(Object.values(r.equip).filter(Boolean).length,0);
assert.equal(rt.cost(r,rt.data.find(t=>t.id==='adv_seeker')),100);
assert.equal(rt.cost(r,rt.data.find(t=>t.id==='mag_apprentice')),200);
purchase(['adv_seeker','adv_explorer']);
assert.equal(rt.toolOf(r).kind,'compass');
assert.equal(rt.curSup(r,'compass'),3);
A('title-tool-use');
assert.ok((window.CryptForestEvents.ensure(r).items.honey||0)+(window.CryptForestEvents.ensure(r).items.mushroom||0)>0||r.gold>20);
purchase(['adv_demon_hunter']);
assert.equal(rt.toolOf(r).icon,'crossbow');
assert.ok(rt.curSup(r,'arrow')>0);
assert.equal(Object.values(r.equip).filter(Boolean).length,0);
purchase(['adv_treasure_hunter','adv_legendary_hunter']);
const hunterPiece=r.items.find(it=>it.titleSet==='hunter');
assert.ok(hunterPiece,'Hunter suit part awarded to backpack');
assert.equal(rt.titleSetEquipped(r,'hunter'),0,'Title suits should not auto-equip');
A('equip',hunterPiece.id);
assert.equal(rt.titleSetEquipped(r,'hunter'),1,'Manual equip activates part of suit');
assert.equal(r.talents.adv_legendary_hunter,1);
A('title-mastery','adv_legendary_hunter:atk');
assert.equal(rt.rank5(r,'adv_legendary_hunter','atk'),1);
const prev=r.ep;A('talent','adv_night_walker');
assert.equal(r.ep,prev,'Rank 3 alternate path must stay locked');
r=begin('scout');
purchase(['adv_seeker','adv_explorer','adv_night_walker','adv_magic_bandit']);
const nobles=r.items.filter(it=>it.titleSet==='noble');
assert.equal(nobles.length,1);
assert.equal(rt.titleSetEquipped(r,'noble'),0);
const god=rt.data.find(t=>t.id==='adv_god_thieves'),plain=rt.cost(r,god);
A('equip',nobles[0].id);
assert.ok(rt.cost(r,god)<plain,'Noble suit discount requires equipping');
r=begin('scout');
purchase(['adv_seeker','adv_explorationist','adv_rune_master','adv_royal_rune','adv_holy_rune']);
assert.equal(rt.toolOf(r).kind,'rune');
r.scrolls.ward=4;
A('title-tool');
assert.match(el('overlay').innerHTML,/data-id="ward"/);
const ticks=r.turn,priorRune=rt.curSup(r,'rune');
A('title-tool-use','ward');
assert.equal(r.scrolls.ward,2);
assert.equal(rt.curSup(r,'rune'),priorRune-1);
assert.equal(r.turn,ticks+1);
r=begin('scout');
purchase(['adv_seeker','adv_explorationist','adv_blacksmith','adv_royal_blacksmith','adv_holy_blacksmith']);
assert.equal(rt.toolOf(r).kind,'forge');
r.titleSupplies.quench=6;
const priorItems=r.items.length;A('title-tool-use');
assert.equal(r.items.length,priorItems+1);
r=begin('guardian');
purchase(['war_novice','war_knight','war_faith','war_templar','war_paladin']);
assert.equal(r.talents.war_paladin,1);
assert.ok(r.hp>0);
r=begin('sorceress');
purchase(['mag_apprentice','mag_white','mag_priest','mag_air','mag_time']);
assert.equal(r.talents.mag_time,1);
A('title-mastery','mag_time:pow');
assert.equal(rt.rank5(r,'mag_time','pow'),1);
/* Verify every published title can actually be acquired along an eligible
   parent chain, rather than merely existing as a display-only tree node. */
for(const title of rt.data){
 const klass=title.tree===0?'guardian':title.tree===1?'sorceress':'scout';
 const run=begin(klass);const order=[];
 let cursor=title;
 while(cursor){
  order.unshift(cursor);
  cursor=(cursor.parents||[]).length?rt.data.find(x=>x.id===cursor.parents[0]):null;
  assert.ok(order.length<=5,'Title parent chains must terminate');
 }
 for(const step of order)A('talent',step.id);
 assert.ok(rt.ownedLevel(run,title.id)>=1,'Title '+title.id+' must really unlock and purchase');
 assert.equal(rt.level(run,title.id)>=1,true,'Title '+title.id+' must have active gameplay rank');
}
console.log('PASS All 65 title paths can be purchased with real gameplay actions');

r=begin('scout');
purchase(['adv_seeker','adv_explorer','adv_night_walker']);
assert.ok(rt.curSup(r,'wick')>=2,'Night walker must receive usable lantern charges');
assert.equal(rt.curSup(r,'compass'),3,'Earlier compass remains after obtaining lantern');
assert.equal(rt.toolOf(r).kind,'lantern');
A('title-tool');
assert.match(el('overlay').innerHTML,/Компас в фонаре/,'Compass is nested under the lantern icon');
const stockBefore=rt.curSup(r,'compass'),wicksBefore=rt.curSup(r,'wick');
A('title-tool-use','compass');
assert.equal(rt.curSup(r,'compass'),stockBefore-1,'Embedded compass consumes compass charges');
assert.equal(rt.curSup(r,'wick'),wicksBefore,'Using compass does not consume a lantern wick');
r.talents.adv_night_walker=3;
r.titleFlags.keyHintFloor='old-floor';
rt.refreshHints(r,{log(){}});
const keyTile=r.tiles.find(t=>t.hasKey&&!t.revealed);
assert.ok(keyTile&&keyTile.hintKey,'Max-rank lantern marks the actual key holder behind a closed slab');
const coveredEnemies=r.tiles.filter(t=>t.foe&&!t.revealed&&t.foe.hp>0);
const spotted=coveredEnemies.filter(t=>t.hintEnemy);
assert.equal(spotted.length,Math.min(3,coveredEnemies.length),'Rank-I seeker flags three hidden enemies');
window.Crypt.debug.draw();
assert.match(el('content').innerHTML,/slab-hint-key/,'A scouted key has a visible glyph on the board');
assert.match(el('content').innerHTML,/slab-hint-enemy/,'A scouted enemy has a visibly distinct glyph');
console.log('PASS Scout enemy positions, lantern key clue and nested compass');

const lends=[
 {set:'hunters_trail',borrow:'adv_seeker',klass:'scout'},
 {set:'stone_oath',borrow:'war_novice',klass:'guardian'},
 {set:'mana_whisper',borrow:'mag_apprentice',klass:'sorceress'}
];
for(const config of lends){
 const run=begin(config.klass),spec=window.ClickerRules.setRules(config.set);
 assert.equal(spec.borrowTitle,config.borrow,'Thematic set must match its lent title');
 for(const slot of spec.slots){
  const item={id:++state.seq,name:'Деталь комплекта',setId:config.set,slot,atk:0,def:0,hp:0,mp:0,pow:0,plus:0,rarity:1};
  run.items.push(item);
  A('equip',item.id);
 }
 assert.equal(rt.borrowedTitle(run,config.borrow),true,'Complete gear lends a working rank-I title');
 assert.equal(rt.level(run,config.borrow),1);
 assert.equal(rt.ownedLevel(run,config.borrow),0,'Temporary title is not permanently bought');
 const child=rt.data.find(t=>(t.parents||[]).includes(config.borrow));
 assert.ok(child&&!rt.unlocked(run,child),'Loaned title cannot unlock permanent higher branches');
 assert.ok(window.ClickerRules.descriptions(config.set).some(x=>x.includes('Временное звание')),
  'Set tooltip must advertise the borrowed title');
 run.equip[spec.slots[0]]=null;
 rt.refreshHints(run,{log(){}});
 assert.equal(rt.level(run,config.borrow),0,'Unequipping breaks the temporary title');
}
console.log('PASS Three thematic original sets lend working temporary titles without corrupting progression');

const old={class:'scout',ep:20,titleVersion:1,talents:{fortune:3,seeker:2},titleSupplies:{}};
rt.init(old);
assert.ok(old.legacyTitles.fortune===3);
assert.equal(old.talents.fortune,undefined);
assert.ok(old.ep>20);
assert.equal(old.titleVersion,2);
console.log('PASS 65-node titles, costs, path locks, explorer tools, scroll selection, smith, mage, warrior, save migration');
