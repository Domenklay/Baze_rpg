'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assetDir=path.resolve(__dirname,'../src/main/assets');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(assetDir,'concept_materials.js'),'utf8'),sandbox);
vm.runInNewContext(fs.readFileSync(path.join(assetDir,'sprite_catalog.js'),'utf8'),sandbox);
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
const conceptIndex=JSON.parse(fs.readFileSync(path.resolve(assetDir,'../../docs/CLICKER_CONCEPT_INDEX.json'),'utf8'));
const concepts=sandbox.window.CryptConceptMaterials;
assert.equal(conceptIndex.items.length,257,'257 original Clicker illustrations in the audit index');
assert.equal(Object.keys(concepts).length,conceptIndex.items.length,'Every original Clicker image is mapped');
for(const entry of conceptIndex.items){
 assert.equal(concepts[entry.name],entry.stem,'Russian loot name must resolve to the matching original artwork');
 const html=spr.materialIcon(entry.name);
 assert.match(html,/class="crypt-resource-icon"/,'Missing image for '+entry.name);
 const art=path.join(assetDir,'imported/concepts',entry.stem+'.svg');
 assert.ok(fs.existsSync(art),'Missing offline resource '+art);
 const svg=fs.readFileSync(art,'utf8');
 assert.match(svg,/data:image\\/png;base64,iVBOR/,'Original PNG must be embedded '+entry.name);
}
console.log('PASS All 257 exact-name Clicker material icons are present and mapped for offline use');
console.log('Cryptbound sprite and resource catalog OK:',Object.keys(spr.monsterRoutes).length+Object.keys(spr.portraitRoutes).length,'monster routes, 132 equipment icons,',spr.materialIds.length,'material icons');
