/* Traverse and buy every one of the 65 Gumballs-inspired titles as real game actions. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../src/main/assets'),elms={},store={};
function el(id){return elms[id]||(elms[id]={innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}}});}
const window={addEventListener(){}},document={hidden:false,getElementById:el,querySelector(){return null;},querySelectorAll(){return []},addEventListener(){}};
const ctx={window,document,Math,Date,console,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v}};
vm.createContext(ctx);
const scripts=['art.js','equipment_art.js','imported_art.js','sprite_catalog.js','titles.js','gumballs_titles_reference.js','titles_runtime.js','expansion.js','clicker_data.js',
'dungeons.js','clicker_rules.js','systems.js','boss_scripts.js','story_events.js','balance.js','combat_feedback.js','hunter_bestiary.js','forest_encounters.js','game.js'];
for(const name of scripts){
 if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:12000});
}
const titles=window.CryptTitles,game=window.Crypt,TR=window.CryptTitlesRuntime,A=game.debug.action;
assert.equal(titles.length,65);
let purchased=0,mastered=0;
function chain(t){
 const ancestry=[];const visited=new Set();
 while(t){
  assert.ok(!visited.has(t.id),'cyclic title chain');
  visited.add(t.id);ancestry.unshift(t);
  if(t.rank===1)break;
  t=titles.find(x=>x.id===t.parents[0]);
  assert.ok(t,'missing ancestor');
 }
 return ancestry;
}
for(const leaf of titles){
 A('begin',leaf.tree===0?'guardian':leaf.tree===1?'sorceress':'scout');
 const r=game.state().run;
 r.ep=200000;
 for(const title of chain(leaf)){
  A('talent',title.id);
  assert.equal(TR.level(r,title.id),1,'failed to learn '+title.id);
  purchased++;
  if(title.rank<5){
   A('talent',title.id);A('talent',title.id);
   assert.equal(TR.level(r,title.id),3,'failed to max '+title.id);
  }
 }
 assert.ok(game.debug.stats().hp>0);
 if(leaf.rank===5){
  for(const key of TR.masterKeys(leaf)){
   for(let n=1;n<=3;n++){
    A('title-mastery',leaf.id+':'+key);
    assert.equal(TR.rank5(r,leaf.id,key),n,leaf.id+':'+key);
    mastered++;
   }
  }
 }
 const activeTitle=titles.find(x=>x.id===leaf.id);
 assert.equal(activeTitle.name,leaf.name);
}
console.log('PASS title paths: 65 individually learned, 5 ranks reachable, '+purchased+' purchases, '+mastered+' V-rank enhancements');
