'use strict';
/* Verify every illustrated T1/T2 equipment slot and compatibility with older saves. */
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const dir=path.resolve(__dirname,'../src/main/assets'),sandbox={window:{}};
for(const name of ['imported/equipment/catalog.js','sprite_catalog.js','clicker_data.js','clicker_rules.js']){
 vm.runInNewContext(fs.readFileSync(path.join(dir,name),'utf8'),sandbox,{filename:name});
}
const w=sandbox.window,{CryptEquipmentIcons:icons,ClickerRules:CR,CryptSprites:SP,ClickerData:DB}=w;
assert.equal(DB.sets.length,12);
assert.equal(Object.keys(icons).length,132);
let added=0,remapped=0;
for(let i=0;i<DB.sets.length;i++){
 const set=DB.sets[i],tier=i<6?1:2,floor=1+Math.floor(i/2)*4,variant=i%2;
 assert.equal(CR.group(floor)[variant].id,set.id);
 for(const slot of ['bracer','boots','ring']){
  const item=CR.gear(slot,floor,variant),expected='adapted_'+set.id+'_'+slot,filename='t'+tier+'_'+set.id+'_'+slot+'.png';
  assert.equal(item.catalogId,expected,'Wrong catalog ID '+set.id+' '+slot);
  assert.equal(icons[expected],'imported/equipment/'+filename);
  const html=SP.gearIcon(item);
  assert.ok(html&&html.includes('src="imported/equipment/'+filename+'"'),'Missing sprite '+filename);
  const bytes=fs.readFileSync(path.join(dir,icons[expected]));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Not a PNG: '+filename);
  assert.equal(bytes.readUInt32BE(16),128,'Wrong width: '+filename);
  assert.equal(bytes.readUInt32BE(20),128,'Wrong height: '+filename);
  assert.equal(bytes[24],8,'Expected 8-bit RGBA');
  assert.equal(bytes[25],6,'Expected RGBA with alpha');
  assert.ok(bytes.length>3000,'Looks like a placeholder instead of an icon: '+filename);
  added++;
 }
 const cloak=CR.gear('cloak',floor,variant),cape=DB.gear.find(x=>x.set===set.id&&x.slot==='shoulders');
 assert.ok(cape,'Missing original cloak in '+set.id);
 assert.equal(cloak.catalogId,cape.id,'Cloak must map to actual cloak artwork, not leggings');
 assert.ok(SP.gearIcon(cloak).includes(icons[cape.id]));
 remapped++;
 // Existing saves have the old wrong slot/image mappings; don't mutate saved stats.
 const legacyBracer={slot:'bracer',catalogId:cape.id,rarity:3},bracerIcon=SP.gearIcon(legacyBracer);
 assert.ok(bracerIcon&&bracerIcon.includes(icons['adapted_'+set.id+'_bracer']),'Old bracer did not migrate: '+set.id);
 const legs=DB.gear.find(x=>x.set===set.id&&x.slot==='legs');
 const legacyCloak={slot:'cloak',catalogId:legs.id},cloakIcon=SP.gearIcon(legacyCloak);
 assert.ok(cloakIcon&&cloakIcon.includes(icons[cape.id]),'Old cloak did not migrate: '+set.id);
}
assert.equal(added,36);
assert.equal(remapped,12);
console.log('PASS T1/T2 equipment: 36 new RGBA icons + 12 fixed cloaks + old save migration / 132 sprites.');
