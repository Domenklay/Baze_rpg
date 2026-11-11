/* Automated gameplay smoke tests. Run: node cryptbound/tests/smoke.cjs */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../src/main/assets');
const elements = {};
function elem(id) {
  if (!elements[id]) {
    elements[id] = {
      id, innerHTML: '', textContent: '', style: {}, scrollTop: 0,
      classList: {add() {}, remove() {}, toggle() {}}
    };
  }
  return elements[id];
}
const events = {}, storage = {};
const mockWindow = {addEventListener(type,fn) {events['window.'+type]=fn;}};
const mockDocument = {
  hidden: false,
  getElementById: elem,
  querySelectorAll: () => [],
  addEventListener(type,fn) {events['document.'+type]=fn;}
};
const context = {
  window:mockWindow, document:mockDocument,
  localStorage:{
    getItem(k){return storage[k]||null;},
    setItem(k,v){storage[k]=v;},
    removeItem(k){delete storage[k];}
  },
  setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,
  console
};
vm.createContext(context);
for(const file of ['art.js','game.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file,timeout:5000});
}
const api = mockWindow.Crypt;
assert.ok(api);
assert.match(elem('overlay').innerHTML,/Некромант/);
const A=api.debug.action;
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS',name);}
test('Three distinct hero classes',()=>{
  for(const hero of ['necromancer','executioner','scout']){
    A('begin',hero);
    assert.equal(api.state().run.class,hero);
    assert.equal(api.state().run.tiles.length,25);
  }
});
A('begin','necromancer');
const game=api.state();
const run=game.run;
test('Start with equipped inventory, hidden tiles and a spellbook',()=>{
  assert.equal(run.items.length,3);
  assert.equal(Object.keys(run.equip).length,3);
  assert.ok(run.tiles.filter(t=>!t.revealed).length>=20);
  assert.ok(run.scrolls.bolt>=1);
});
test('Necromancer raises a persistent attacking skeleton',()=>{
  run.mp=100;
  A('skill');
  assert.equal(run.summon.name,'Костяной страж');
  assert.ok(run.summon.atk>0 && run.summon.maxHp>0);
});
test('Reveal a monster and strike in turn-based combat',()=>{
  const t=run.tiles.find(t=>t.kind==='enemy');
  A('reveal',t.id);
  assert.equal(t.revealed,true);
  const before=t.foe.hp,turn=run.turn;
  A('strike',t.id);
  assert.ok(t.foe.hp<before);
  assert.equal(run.turn,turn+1);
});
test('Use a scroll and consume mana',()=>{
  run.mp=100;run.scrolls.bolt=2;
  // Guarantee a live target; the skeleton may have already killed the first one.
  const spellTarget=run.tiles.find(t=>t.foe&&t.foe.hp>0&&t.revealed) || run.tiles.find(t=>t.foe);
  spellTarget.revealed=true;spellTarget.foe.hp=200;spellTarget.foe.maxHp=200;
  A('cast','bolt');
  assert.equal(run.scrolls.bolt,1);
  assert.ok(run.mp<=95);
});
test('Learn talents only by prerequisites',()=>{
  run.ep=100;
  A('talent','ritual');
  assert.equal(run.talents.ritual||0,0);
  A('talent','mind');A('talent','reserve');A('talent','ritual');
  assert.equal(run.talents.ritual,1);
});
test('Find easter egg and update secret history',()=>{
  const secret=run.tiles.find(t=>t.kind==='secret');
  const old=run.secrets;
  A('reveal',secret.id);
  assert.equal(run.secrets,old+1);
  assert.ok(game.meta.secrets.length>=1);
});
test('Purchase item and enhance equipment',()=>{
  run.gold=500;run.mp=100;run.hp=api.debug.stats().hp;
  A('buy','potion');
  assert.ok(run.potions>=4);
  const eq=run.items.find(t=>t.id===run.equip.weapon);
  A('upgrade',eq.id);
  assert.equal(eq.plus,1);
});
test('Clear all enemies and descend',()=>{
  const floor=run.floor;
  run.tiles.forEach(t=>{if(t.foe){t.foe.hp=0;t.cleared=true;t.revealed=true;}if(t.kind==='exit')t.revealed=true;});
  A('descend');
  assert.equal(run.floor,floor+1);
  assert.equal(run.tiles.length,25);
});
test('Bosses occur every fifth floor',()=>{
  while(run.floor<5){
    run.tiles.forEach(t=>{if(t.foe){t.foe.hp=0;t.cleared=true;t.revealed=true;}if(t.kind==='exit')t.revealed=true;});
    A('descend');
  }
  assert.ok(run.tiles.some(t=>t.kind==='boss'));
});
test('Permanent upgrades and local save',()=>{
  game.meta.souls=100;
  A('permanent','hp');
  assert.equal(game.meta.upgrades.hp,1);
  api.save();
  assert.ok(storage.cryptbound_local_v1.includes('necromancer'));
});
test('No Android Internet permission',()=>{
  const manifest=fs.readFileSync(path.resolve(__dirname,'../src/main/AndroidManifest.xml'),'utf8');
  assert.ok(!manifest.includes('android.permission.INTERNET'));
});
console.log('SMOKE TESTS PASSED:',checks);
