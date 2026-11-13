'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assetDir=path.resolve(__dirname,'../src/main/assets');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(assetDir,'sprite_catalog.js'),'utf8'),sandbox);
const spr=sandbox.window.CryptSprites;
for(let i=10;i<20;i++){
 const id='r1_'+i;assert.ok(spr.monster({id},'idle'),id);
 for(const pose of ['idle','attack','skill']){
  const src=spr.monster({id},pose).match(/src="([^"]+)"/)[1];
  assert.ok(fs.existsSync(path.join(assetDir,src)),src);
 }
}
for(let i=0;i<10;i++){
 const id='r5_'+i;assert.ok(spr.monster({id},'skill'),id);
 for(const pose of ['idle','attack','skill']){
  const src=spr.monster({id},pose).match(/src="([^"]+)"/)[1];
  assert.ok(fs.existsSync(path.join(assetDir,src)),src);
 }
}
for(let i=0;i<20;i++)for(const pose of ['idle','attack','skill']){
 const src=spr.monster({id:'r1_'+i},pose)?.match(/src="([^"]+)"/)[1];
 assert.ok(src&&fs.existsSync(path.join(assetDir,src)),'Forest species '+i+' '+pose);
}
for(const [id,name] of Object.entries(spr.portraitRoutes))assert.ok(fs.existsSync(path.join(assetDir,'imported/enemies/portraits/'+name+'.png')),id);
vm.runInNewContext(fs.readFileSync(path.join(assetDir,'imported/equipment/catalog.js'),'utf8'),sandbox);
for(const [id,src] of Object.entries(sandbox.window.CryptEquipmentIcons))assert.ok(fs.existsSync(path.join(assetDir,src)),id);
assert.equal(Object.keys(sandbox.window.CryptEquipmentIcons).length,132);
assert.equal(spr.monster({id:'r99_0'},'idle'),null);
assert.equal(spr.materialStem('Шкура животного'),'animal_hide');
assert.equal(spr.canonicalMaterial('animal_hide, game_meat (при уместности)'),'Шкура животного');
for(const id of spr.materialIds){
 const file=path.join(assetDir,'imported/materials',id+'.svg');
 assert.ok(fs.existsSync(file),'missing material icon '+id);
 const svg=fs.readFileSync(file,'utf8');
 assert.match(svg,/data:image\/png;base64,iVBOR/,'embedded PNG '+id);
}
console.log('Cryptbound sprite and resource catalog OK:',Object.keys(spr.monsterRoutes).length+Object.keys(spr.portraitRoutes).length,'monster routes, 132 equipment icons,',spr.materialIds.length,'material icons');
