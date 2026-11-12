/* Offline integration adapter for approved RPG Clicker Infinity data. */
(function(){
'use strict';
var DB=window.ClickerData;
var ROLES=[
 {key:'stone_oath',two:{def:3},four:{hp:16},six:{shieldFloor:14}},
 {key:'hunters_trail',two:{crit:6},four:{atk:4},six:{dodge:6}},
 {key:'mana_whisper',two:{pow:4},four:{mp:14},six:{spellDamage:13}},
 {key:'roots_of_life',two:{hp:20},four:{killHeal:5},six:{def:3}},
 {key:'ancestors_fury',two:{atk:5},four:{critDamage:13},six:{bossDamage:16}},
 {key:'swamp_seals',two:{pow:4},four:{spellDamage:10},six:{dodge:5}},
 {key:'mirage_trail',two:{dodge:7},four:{crit:7},six:{atk:7}},
 {key:'obelisk_oath',two:{def:6},four:{hp:34},six:{shieldFloor:24}},
 {key:'prismatic_guardian',two:{hp:28},four:{def:5},six:{dodge:5}},
 {key:'resonance_song',two:{mp:23},four:{pow:8},six:{spellDamage:18}},
 {key:'obsidian_harvest',two:{atk:9},four:{bossDamage:20},six:{critDamage:18}},
 {key:'ash_fortress',two:{def:7},four:{hp:38},six:{shieldFloor:30}}
];
var BY_SET={};for(var i=0;i<ROLES.length;i++)BY_SET[ROLES[i].key]=ROLES[i];
var ATTR={atk:'Атака',def:'Броня',hp:'Здоровье',mp:'Мана',pow:'Магия',crit:'Крит',dodge:'Уклонение',shieldFloor:'Щит при спуске',spellDamage:'Урон магии %',critDamage:'Крит. урон %',killHeal:'Лечение с убийств',bossDamage:'Урон боссам %'};
function region(floor){return DB.regions[(Math.floor((floor-1)/4))%DB.regions.length];}
function regionIndex(floor){return (Math.floor((floor-1)/4))%DB.regions.length;}
function group(floor){var index=regionIndex(floor);return DB.sets.slice(index*2,index*2+2);}
function setDefinition(id){return DB.sets.find(function(x){return x.id===id;})||null;}
function gearFromCatalog(slot,floor,variant){
 var reg=region(floor),options=group(floor),one=options[(variant||0)%options.length]||DB.sets[0];
 var existing=DB.gear.find(function(x){return x.set===one.id&&x.slot===slot;});
 if(slot==='weapon'){
   var weapons=DB.weapons.filter(function(x){return x.tier===reg.tier;});
   var src=weapons[(variant||0)%weapons.length]||weapons[0];
   return {catalogId:src.id,name:src.name,setId:null,setName:null,tier:src.tier,
    trait:src.trait||'Стандартная атака',slot:'weapon',rarity:reg.tier===2?2:1,
    atk:4+Math.round((Math.abs(src.damage)||12)/14)+(src.tier-1)*5,
    def:0,hp:0,mp:0,pow:src.name.indexOf('Жезл')>=0||src.name.indexOf('Посох')>=0?4+(src.tier-1)*3:0,crit:0};
 }
 var custom={belt:'Пояс «'+one.name+'»',boots:'Сапоги «'+one.name+'»'};
 var display=existing?existing.name:custom[slot]||('Предмет «'+one.name+'»');
 var defense=existing?existing.base_armor:slot==='belt'?10:8;
 var protection=existing?existing.base_shield:slot==='boots'?4:2;
 var n=reg.tier===2?1.8:1;
 var hp=Math.round((slot==='armor'?12:slot==='helm'?9:slot==='legs'?8:slot==='belt'?11:4)*n);
 var def=Math.max(1,Math.round((defense/11)*n));
 return {catalogId:existing?existing.id:'adapted_'+one.id+'_'+slot,
  name:display,setId:one.id,setName:one.name,tier:reg.tier,
  trait:existing?existing.trait:'Часть полного комплекта «'+one.name+'»',
  slot:slot,rarity:reg.tier===2?2:1,atk:slot==='gloves'?2*reg.tier:0,
  def:def,hp:hp,mp:Math.round((protection/2)*n),pow:slot==='relic'?2*reg.tier:0,crit:0};
}
function counts(equip,items){
 var count={};Object.keys(equip).forEach(function(slot){
  var id=equip[slot],item=items.find(function(x){return x.id===id;});
  if(item&&item.setId)count[item.setId]=(count[item.setId]||0)+1;
 });return count;
}
function bonuses(equip,items){
 var count=counts(equip,items),all={};
 for(var id in count){var b=BY_SET[id];if(!b)continue;
  for(var stage of ['two','four','six']){if(count[id]<Number({two:2,four:4,six:6}[stage]))continue;
   var level=b[stage];for(var stat in level)all[stat]=(all[stat]||0)+level[stat];}}
 return all;
}
function descriptions(id){
 var b=BY_SET[id];if(!b)return [];
 return [['2',b.two],['4',b.four],['6',b.six]].map(function(row){
  return row[0]+' предмета: '+Object.entries(row[1]).map(function(x){return (ATTR[x[0]]||x[0])+' +'+x[1];}).join(', ');
 });
}
function near(id){var x=id%5,y=Math.floor(id/5),r=[];
 if(x>0)r.push(id-1);if(x<4)r.push(id+1);if(y>0)r.push(id-5);if(y<4)r.push(id+5);return r;
}
function openPath(tiles){
 var start=tiles.find(function(t){return t.kind==='start';});
 if(!start)return new Set();
 var seen=new Set([start.id]),queue=[start.id];
 while(queue.length){var id=queue.shift();for(const n of near(id)){var t=tiles[n];
  if(seen.has(n)||!t||!t.revealed||(t.foe&&t.foe.hp>0&&!t.foe.ranged))continue;
  seen.add(n);queue.push(n);
 }}
 return seen;
}

/* Decorative route over already opened safe floor, never through living monsters or loot. */
function walkPath(tiles,from,to){
 if(from==null||to==null)return null;
 function safe(id){var t=tiles[id];return !!t&&t.revealed&&t.cleared&&!t.drops&&!t.summon&&(!t.foe||t.foe.hp<=0);}
 if(!safe(from)||!safe(to))return null;
 var seen=new Set([from]),parents={},queue=[from],found=from===to;
 while(queue.length&&!found){var here=queue.shift();for(var next of near(here)){
  if(seen.has(next)||!safe(next))continue;
  seen.add(next);parents[next]=here;
  if(next===to){found=true;break;}queue.push(next);
 }}
 if(!found)return null;
 var path=[to];while(path[0]!==from)path.unshift(parents[path[0]]);
 return path;
}
function exploreStatus(t,tiles){
 if(!t||t.revealed)return {ok:false,reason:'Плита уже открыта.'};
 var connected=openPath(tiles),adj=near(t.id);
 if(!adj.some(function(x){return connected.has(x);}))return {ok:false,reason:'Нужна соседняя исследованная клетка.'};
 if(adj.some(function(x){var n=tiles[x];return n&&n.revealed&&n.foe&&n.foe.hp>0&&!n.foe.ranged;}))
 return {ok:false,reason:'Ближний враг блокирует исследование соседних плит.'};
 return {ok:true,reason:''};
}
function summonSpot(tiles){
 var start=tiles.find(function(x){return x.kind==='start';});
 var valid=tiles.filter(function(t){return t.revealed&&t.kind==='empty'&&!t.summon&&!t.drops&&!t.foe;});
 if(valid.length){valid.sort(function(a,b){return near(start.id).includes(a.id)?-1:near(start.id).includes(b.id)?1:a.id-b.id;});
  return {tile:valid[0],opened:false};}
 var closed=tiles.filter(function(t){return t.kind==='empty'&&!t.revealed&&!t.foe;});
 if(closed.length)return {tile:closed[Math.floor(Math.random()*closed.length)],opened:true};
 return {tile:null,opened:false};
}
function visualId(name){
 name=String(name||'').toLowerCase();
 if(/волк|шакал|гончая|лисиц|рысь|кабан|медвед|крокодил|заяц/.test(name))return 'wolf';
 if(/паук|скорпион|мурав|жук|пчел|богомол|личинк|мух|мотыл|блоха/.test(name))return 'spider';
 if(/разбой|культист|ведьм|палач|маг|страж|шаман/.test(name))return 'cultist';
 if(/голем|истукан|древень|элементал|камен|корн|скал|стату|кристалл/.test(name))return 'golem';
 if(/скелет|мертвец|кость/.test(name))return 'skeleton';
 return 'rat';
}
function rangedSource(){
 for(var reg of DB.regions)for(var e of reg.enemies)if(e.name==='Разбойник-лучник')return e;
 return {id:'ranger',name:'Разбойник-лучник',hp:39,atk:8,def:1,loot:[]};
}
window.ClickerRules={region:region,regionIndex:regionIndex,group:group,setDefinition:setDefinition,gear:gearFromCatalog,
 counts:counts,bonuses:bonuses,descriptions:descriptions,near:near,openPath:openPath,exploreStatus:exploreStatus,
 summonSpot:summonSpot,walkPath:walkPath,visualId:visualId,rangedSource:rangedSource};
})();