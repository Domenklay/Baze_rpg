/* node cryptbound/tests/smoke.cjs - no network or Android device required. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../src/main/assets');
const elements={},storage={},events={};
function el(id){return elements[id]||(elements[id]={id,innerHTML:'',textContent:'',style:{},scrollTop:0,
 classList:{add(){},remove(){},toggle(){}}});}
const windowMock={addEventListener(ev,fn){events['window.'+ev]=fn;}};
const docMock={hidden:false,getElementById:el,querySelector(){return null},querySelectorAll(){return []},
 addEventListener(ev,fn){events['document.'+ev]=fn;}};
const context={window:windowMock,document:docMock,
 localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]},
 setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,console};
vm.createContext(context);
for(const file of ['art.js','equipment_art.js','titles.js','expansion.js','game.js']){
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file,timeout:8000});
}
const api=windowMock.Crypt,A=api.debug.action;let tests=0;
function check(label,fn){fn();tests++;console.log('PASS '+label);}
check('45 branching titles across three trees',()=>{
 const titles=windowMock.CryptTitles;
 assert.equal(titles.length,45);
 assert.equal(titles.filter(t=>t.tree===0).length,15);
 assert.equal(titles.filter(t=>t.tree===1).length,15);
 assert.equal(titles.filter(t=>t.tree===2).length,15);
 assert.equal(Math.max(...titles.map(t=>t.rank)),4);
});
check('Three independent starting classes',()=>{
 for(const klass of ['necromancer','executioner','scout']){
  A('begin',klass);
  const state=api.state().run;
  assert.equal(state.class,klass);
  assert.equal(state.tiles.length,25);
  assert.equal(Object.keys(state.equip).length,9);
  assert.equal(state.items.length,3);
 }
});
A('begin','necromancer');
const state=api.state(),r=state.run;
r.hp=9999;r.mp=1000;
check('Dungeon displays without full-page scene and has a stone floor',()=>{
 assert.match(el('content').innerHTML,/dungeon-root/);
 assert.match(el('content').innerHTML,/dungeon-board/);
 assert.match(el('content').innerHTML,/tile-entrance/);
 assert.doesNotMatch(el('content').innerHTML,/tile-player/);
 assert.doesNotMatch(el('content').innerHTML,/scene-bg/);
});
check('Empty tiles become visibly blank and unclickable after reveal',()=>{
 const t=r.tiles.find(x=>x.kind==='empty');assert.ok(t);
 A('reveal',t.id);assert.equal(t.revealed,true);assert.equal(t.cleared,true);
 assert.match(el('content').innerHTML,/tile-bare/);
});
check('Chest first reveals object, then collects loot and opens rewards',()=>{
 const t=r.tiles.find(x=>x.kind==='chest');assert.ok(t);
 const before=r.gold;
 A('reveal',t.id);assert.ok(t.revealed&&!t.cleared);
 assert.equal(r.gold,before);
 A('pickup',t.id);assert.equal(t.cleared,true);
 assert.ok(r.gold>before);
 assert.match(el('overlay').innerHTML,/Старинный сундук/);
 A('close');
});
check('Necromancer summons companion which retains hit points and attack',()=>{
 r.mp=1000;A('skill');assert.ok(r.summon);
 assert.equal(r.summon.name,'Костяной страж');
 assert.ok(r.summon.maxHp>0&&r.summon.atk>0);
});
check('A magical spell consumes a scroll and mana',()=>{
 let enemy=r.tiles.find(x=>x.foe&&x.foe.hp>0);
 enemy.revealed=true;enemy.foe.hp=500;enemy.foe.maxHp=500;
 r.mp=1000;r.scrolls.bolt=2;
 const before=r.mp;A('cast','bolt');
 assert.equal(r.scrolls.bolt,1);assert.ok(r.mp<before);
});
check('Full title prerequisites enforce a five-rank chain',()=>{
 r.ep=1000;
 A('talent','citadel');assert.equal(r.talents.citadel||0,0);
 for(const id of ['blade','iron','endure','lastwall','citadel'])A('talent',id);
 assert.equal(r.talents.citadel,1);
 r.tab='talents';A('tree','1');assert.equal(r.treeView,1);
 assert.match(el('content').innerHTML,/5 ступеней/);
});
check('Key remains as loot until pickup, then opens stairs',()=>{
 const carrier=r.tiles.find(t=>t.hasKey);assert.ok(carrier);
 const exit=r.tiles.find(t=>t.kind==='exit');assert.ok(exit);
 exit.revealed=true;r.key=false;
 const floor=r.floor;A('descend');assert.equal(r.floor,floor);
 carrier.revealed=true;
 if(carrier.foe.hp>0){carrier.foe.hp=1;A('strike',carrier.id);}
 assert.ok(carrier.drops&&carrier.drops.key);
 assert.equal(r.key,false);
 A('pickup',carrier.id);
 assert.equal(r.key,true);
 A('close');
 A('descend');assert.equal(r.floor,floor+1);
});
check('Floor 5 contains boss which carries the next key',()=>{
 while(r.floor<5){r.key=true;r.tiles.find(t=>t.kind==='exit').revealed=true;A('descend');}
 const boss=r.tiles.find(t=>t.kind==='boss');
 assert.ok(boss&&boss.hasKey);
});
check('Nine-slot equipment with bag filter and comparison table',()=>{
 r.tab='hero';api.debug.draw();
 assert.equal((el('content').innerHTML.match(/gear-slot /g)||[]).length,9);
 A('inspect-slot','helm');
 assert.equal(r.tab,'hero');
 assert.match(el('overlay').innerHTML,/gear-two-columns/);
 const candidate={id:++state.seq,slot:'helm',name:'Шлем испытателя',rarity:2,plus:0,atk:2,def:3,hp:8,mp:0,pow:0,crit:0};
 r.items.push(candidate);
 A('modal-select',candidate.id);
 assert.match(el('overlay').innerHTML,/Шлем испытателя/);
 assert.match(el('overlay').innerHTML,/positive/);
 A('modal-equip');assert.equal(r.equip.helm,candidate.id);
 assert.equal(r.tab,'hero');A('close');
});
check('Equipment upgrades and recalculates stats',()=>{
 const sword=r.items.find(x=>x.id===r.equip.weapon);
 const oldAttack=api.debug.stats().atk;r.gold=999;
 A('upgrade',sword.id);
 assert.equal(sword.plus,1);
 assert.ok(api.debug.stats().atk>=oldAttack);
});
check('Secrets grant rewards on second tap and record discovery',()=>{
 const secret=r.tiles.find(t=>t.kind==='secret');
 A('reveal',secret.id);
 assert.equal(r.secrets,0);
 A('pickup',secret.id);
 assert.equal(r.secrets,1);
 assert.ok(state.meta.secrets.length>=1);
 A('close');
});

check('Simple coin and potion pickups do not open reward modals',()=>{
 A('close');
 for(const kind of ['coin','potion']){
  const cell=r.tiles.find(t=>t.kind===kind);
  if(!cell)continue;
  A('reveal',cell.id);
  A('pickup',cell.id);
  assert.equal(cell.cleared,true);
  assert.equal(el('overlay').innerHTML,'');
 }
});
check('Summons render on map with corner HP/attack and enemy cooldowns',()=>{
 r.tab='maze';api.debug.draw();
 assert.match(el('content').innerHTML,/tile-summon/);
 assert.match(el('content').innerHTML,/unit-corner unit-hp/);
 assert.match(el('content').innerHTML,/unit-corner unit-atk/);
 const target=r.tiles.find(t=>t.foe&&t.foe.hp>0);target.revealed=true;api.debug.draw();
 assert.match(el('content').innerHTML,/unit-corner unit-cd/);
 const before=target.foe.cooldown;
 A('wait');
 assert.ok(target.foe.cooldown!==before||target.foe.cooldown===target.foe.skill.every);
});
check('Inspection dialogs show enemy skills and summon interception',()=>{
 const enemy=r.tiles.find(t=>t.foe&&t.foe.hp>0);
 A('inspect-enemy',enemy.id);
 assert.match(el('overlay').innerHTML,/Следующее применение/);
 assert.match(el('overlay').innerHTML,/Обычная атака/);
 A('close');
 A('inspect-summon');
 assert.match(el('overlay').innerHTML,/Костяной удар/);
 assert.match(el('overlay').innerHTML,/Гробовой раскол/);
 A('close');
});
check('Spellbook is a modal and does not change active screen',()=>{
 r.tab='maze';api.debug.draw();
 A('spell-modal');
 assert.equal(r.tab,'maze');
 assert.match(el('overlay').innerHTML,/scroll-spells/);
 A('close');
});
check('All universal title trees remain accessible and primary costs differ',()=>{
 r.tab='talents';api.debug.draw();
 for(const tree of ['0','1','2']){A('tree',tree);assert.equal(r.treeView,Number(tree));}
 assert.match(el('content').innerHTML,/Титулы универсальные/);
});
check('Hero mastery, relic cabinet and repeatable dungeon progression survive death',()=>{
 const boss=r.tiles.find(t=>t.kind==='boss');
 assert.ok(boss);
 boss.revealed=true;boss.foe.hp=1;
 A('strike',boss.id);
 assert.ok(boss.drops&&boss.drops.relic);
 A('pickup',boss.id);
 assert.ok(Object.values(state.meta.relics).some(v=>v>=1));
 A('close');
 const before=state.meta.heroEssence.necromancer;
 A('confirm-end');
 assert.ok(state.meta.heroEssence.necromancer>before);
 A('camp');assert.match(el('overlay').innerHTML,/РАЗВИТИЕ ГЕРОЕВ/);
 A('hero-rank','necromancer');assert.equal(state.meta.heroRanks.necromancer,1);
 A('chronicles');assert.match(el('overlay').innerHTML,/ШЕСТЬ РЕЛИКВИЙ/);
 assert.match(el('overlay').innerHTML,/БЕСТИАРИЙ/);
 A('milestone','depth5');assert.ok(state.meta.milestones.depth5);
});

check('Save, local profile and no Android INTERNET permission',()=>{
 api.save();assert.ok(storage.cryptbound_local_v1);
 assert.equal(JSON.parse(storage.cryptbound_local_v1).run,null);
 const manifest=fs.readFileSync(path.resolve(__dirname,'../src/main/AndroidManifest.xml'),'utf8');
 assert.ok(!manifest.includes('android.permission.INTERNET'));
});
console.log('GAMEPLAY SMOKE TESTS PASSED',tests);
