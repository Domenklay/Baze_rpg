/* Headless game fixture for original title integration tests. */
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
'combat_feedback.js','hunter_bestiary.js','forest_encounters.js','forest_rework.js','forest_v2_art.js','t1_encounters.js','mining.js','ridge_catalog.js','ridge_events.js','village.js','village_ui.js','hero_progression.js','hero_progression_ui.js','game.js'];
for(const name of sources){
 if(name==='gumballs_titles_reference.js')window.CryptLegacyTitles=window.CryptTitles;
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name,timeout:15000});
}
const TR=window.CryptTitlesRuntime,game=window.Crypt,A=game.debug.action;

module.exports={TR,game,A,window,ctx,store,elements,el,assert};
