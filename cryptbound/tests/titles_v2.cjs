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
 'hunter_bestiary.js','forest_encounters.js','game.js'];
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
assert.ok(rt.curSup(r,'compass')>0);
A('title-tool-use');
assert.ok(r.materials['древесина']>0);
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
const old={class:'scout',ep:20,titleVersion:1,talents:{fortune:3,seeker:2},titleSupplies:{}};
rt.init(old);
assert.ok(old.legacyTitles.fortune===3);
assert.equal(old.talents.fortune,undefined);
assert.ok(old.ep>20);
assert.equal(old.titleVersion,2);
console.log('PASS 65-node titles, costs, path locks, explorer tools, scroll selection, smith, mage, warrior, save migration');
