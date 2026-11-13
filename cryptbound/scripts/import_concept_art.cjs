/* One-off offline art importer: exact original resource sprites from the user's
 * RPG Clicker Infinity project. Writes only images with an exact name match. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src/main/assets');
const source='https://raw.githubusercontent.com/Domenklay/Rpg_clicker_infinity/main/';
const listing='https://api.github.com/repos/Domenklay/Rpg_clicker_infinity/git/trees/main?recursive=1';
const outputDir=path.join(root,'imported/concepts');
const map={
 а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'io',ж:'zh',з:'z',и:'i',й:'i',
 к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',
 х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'iu',я:'ia'
};
function slug(value){
 return String(value).toLowerCase().replace(/./g,ch=>map[ch]??ch)
  .replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}
async function get(url){
 for(let trial=0;trial<3;trial++){
  try{
   const response=await fetch(url,{headers:{'User-Agent':'Baze-rpg-offline-art-import','Accept':url.includes('api.github.com')?'application/vnd.github+json':'*/*'},signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error(response.status+' '+url);
   return Buffer.from(await response.arrayBuffer());
  }catch(e){if(trial===2)throw e;await new Promise(resolve=>setTimeout(resolve,750*(trial+1)));}
 }
}
async function main(){
 const host={};vm.runInNewContext(fs.readFileSync(path.join(root,'dungeons.js'),'utf8'),{window:host},{timeout:30000});
 const remote=JSON.parse((await get(listing)).toString('utf8'));
 if(!Array.isArray(remote.tree)||remote.truncated)throw Error('Clicker file listing truncated');
 const available=new Set(remote.tree.filter(x=>x.type==='blob').map(x=>x.path));
 const desired=new Map();
 host.CryptDungeons.acts.forEach((act,index)=>act.locations.forEach(loc=>{
  const enemies=[...loc.mobs,...loc.elites,loc.boss];
  enemies.forEach(monster=>(monster.loot||[]).forEach(drop=>{
   const stem='t'+(index+1)+'_concept_'+slug(drop.name);
   const file='Assets/Sprites/Resources/Concepts/T'+(index+1)+'/'+stem+'.png';
   if(available.has(file))desired.set(drop.name,{stem,source:file});
  }));
 }));
 fs.mkdirSync(outputDir,{recursive:true});
 const entries=[...desired.entries()],errors=[];
 let copied=0;
 for(let i=0;i<entries.length;i+=8){
  await Promise.all(entries.slice(i,i+8).map(async ([name,asset])=>{
   const dest=path.join(outputDir,asset.stem+'.svg');
   if(fs.existsSync(dest))return;
   try{
    const bytes=await get(source+asset.source);
    if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Not a PNG '+asset.source);
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><image width="128" height="128" href="data:image/png;base64,'+bytes.toString('base64')+'"/></svg>';
    fs.writeFileSync(dest,svg,'utf8');copied++;
   }catch(e){errors.push(name+' ('+e.message+')');}
  }));
 }
 const manifest={};
 entries.forEach(([name,asset])=>{
  if(fs.existsSync(path.join(outputDir,asset.stem+'.svg')))manifest[name]=asset.stem;
 });
 const manifestText='/* Exact Clicker T3–T10 original pixel-art resource icons; no network at runtime. */\nwindow.CryptConceptMaterials='+JSON.stringify(manifest,null,1)+';\n';
 fs.writeFileSync(path.join(root,'concept_materials.js'),manifestText,'utf8');
 console.log('Matched original icons: '+entries.length+', imported: '+copied+', available: '+Object.keys(manifest).length+', failures: '+errors.length);
 if(errors.length){console.log(errors.slice(0,25).join('\n'));process.exitCode=1;}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
