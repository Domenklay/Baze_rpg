/* Newly approved quest art: 97 cropped 128x128 transparent PNGs; all mappings resolve. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../src/main/assets'),dir=path.join(root,'forest_v2');
const names=fs.readdirSync(dir).filter(x=>x.endsWith('.png'));
assert.equal(names.length,97,'all sprites from the six source sheets are installed');
for(const name of names){
 const data=fs.readFileSync(path.join(dir,name));
 assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG header: '+name);
 assert.equal(data.readUInt32BE(16),128,'width of '+name);
 assert.equal(data.readUInt32BE(20),128,'height of '+name);
 assert.equal(data[25],6,'RGBA support for '+name);
}
const ctx={window:{}};vm.createContext(ctx);
for(const name of ['forest_encounters.js','forest_rework.js','forest_v2_art.js']){
 const src=fs.readFileSync(path.join(root,name),'utf8');
 vm.runInContext(src,ctx,{filename:name});
}
const FE=ctx.window.CryptForestEvents,FA=ctx.window.CryptForestV2Art,FW=ctx.window.CryptForestRework;
assert.equal(FE.scenes.length,50);
assert.deepEqual(Object.keys(FA.sceneSprites).map(Number).sort((a,b)=>a-b),Array.from({length:48},(_,i)=>i+3));
function check(src,key){assert(src&&src.startsWith('forest_v2/'),'asset path for '+key);assert(fs.existsSync(path.join(root,src)),'missing asset '+src);}
for(const [id,name] of Object.entries(FA.sceneSprites)){
 assert.equal(FE.scene(Number(id)).sprite,FA.scene(Number(id)));
 check(FA.scene(Number(id)),'scene '+id);
 assert.match(FE.image(FE.scene(Number(id)).sprite),/forest_v2\//);
}
for(const [name,slug] of Object.entries(FA.itemSprites)){
 check(FA.item(name),'item '+name);
 if(FE.itemDefs[name])assert.equal(FE.itemDefs[name][1],FA.item(name));
}
for(const [name,slug] of Object.entries(FA.gearSprites)){
 assert(FW.unique[name],'a new image without matching unique item: '+name);
 check(FA.gear(name),'gear '+name);
}
assert.equal(Object.keys(FA.gearSprites).length,10);
assert.equal(FE.scene(1).art,'F03_001','original squirrel art remains approved');
assert.match(FE.image('F03_001'),/forest_events\/sprites\/F03_001\.png/);
assert.equal(FE.image('forest_v2/../../bad.png'),'','path traversal not allowed');
const code=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert(code.includes('it.forestUnique&&window.CryptForestV2Art'),'new gear icons visible in equipment and bag');
assert(code.includes('FE.scene(t.forestId).sprite||FE.scene(t.forestId).art'),'forest tile images use updated scenes');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const rework=html.indexOf('src="forest_rework.js"'),art=html.indexOf('src="forest_v2_art.js"'),game=html.indexOf('src="game.js"');
assert(rework>=0&&art>rework&&game>art,'image mappings must initialize after quest data and before game');
console.log('PASS: all 97 sprite assets have correct 128x128 transparent PNG headers; scene, item, unique-gear mappings and loader order valid.');
