/* Offline integration adapter for approved RPG Clicker Infinity data. */
(function(){
'use strict';
var DB=window.ClickerData;

/* Dungeon gear has only 3/4 slots and situational triggers.
   Original Clicker item artwork/names are retained; big 2/4/6 bonuses are not. */
var ROLES=[
{id:'stone_oath',slots:['helm','armor','bracer','boots'],two:{entryShield:12},complete:{def:2,entryShield:10}},
{id:'hunters_trail',slots:['helm','ring','boots'],two:{lootChance:8},complete:{bossDamage:10}},
{id:'mana_whisper',slots:['ring','amulet','cloak','gloves'],two:{pow:3},complete:{scrollFloor:1}},
{id:'roots_of_life',slots:['helm','armor','bracer','boots'],two:{healFloor:9},complete:{healFloor:9}},
{id:'ancestors_fury',slots:['armor','gloves','boots'],two:{crit:4},complete:{bossDamage:10}},
{id:'swamp_seals',slots:['ring','amulet','cloak','gloves'],two:{mp:8},complete:{entryShield:18}},
{id:'mirage_trail',slots:['helm','cloak','boots'],two:{dodge:4},complete:{ghostFloor:1}},
{id:'obelisk_oath',slots:['helm','armor','bracer','boots'],two:{def:2},complete:{entryShield:22}},
{id:'prismatic_guardian',slots:['ring','amulet','cloak','gloves'],two:{pow:4},complete:{guardFloor:1}},
{id:'resonance_song',slots:['ring','cloak','boots'],two:{mp:8},complete:{scrollFloor:1}},
{id:'obsidian_harvest',slots:['armor','bracer','boots','gloves'],two:{killHeal:2},complete:{burnChance:15}},
{id:'ash_fortress',slots:['helm','armor','bracer','boots'],two:{def:2},complete:{entryShield:28}}
];
var BY_SET={};for(var i=0;i<ROLES.length;i++)BY_SET[ROLES[i].id]=ROLES[i];
var ATTR={atk:'Атака',def:'Броня',hp:'Здоровье',mp:'Мана',pow:'Магия',crit:'Крит',dodge:'Уклонение',
 entryShield:'Щит на 10 ходов при входе в этаж или комнату',healFloor:'Лечение за этаж',scrollFloor:'Свиток за этаж',
 ghostFloor:'Спутник с перепризывом на каждом этаже',guardFloor:'Защитных зарядов за этаж',
 burnChance:'Шанс горения при ударе',lootChance:'Шанс дополнительной добычи',killHeal:'Лечение за убийство',bossDamage:'Урон по боссу %'};
var sourceSlot={bracer:'shoulders',ring:'belt',cloak:'legs',amulet:'relic'};
function region(floor){return DB.regions[(Math.floor((floor-1)/4))%DB.regions.length];}
function regionIndex(floor){return (Math.floor((floor-1)/4))%DB.regions.length;}
function group(floor){var index=regionIndex(floor);return DB.sets.slice(index*2,index*2+2);}
function dungeonSet(id){
 var found=/^dungeon:(\d+):(\d+)$/.exec(id||'');if(!found)return null;
 var act=Number(found[1]),loc=Number(found[2]),details=window.CryptDungeons&&window.CryptDungeons.location(act,loc);
 if(!details)return null;
 return {id:id,name:'Реликвии «'+details.name+'»',slots:['helm','ring','gloves'],two:{lootChance:5},complete:{scrollFloor:1}};
}
function setDefinition(id){return DB.sets.find(function(x){return x.id===id;})||dungeonSet(id)||null;}
function setRules(id){return BY_SET[id]||dungeonSet(id)||null;}
function thresholds(id){var spec=setRules(id);return spec?[2,spec.slots.length]:[];}
function gearFromCatalog(slot,floor,variant){
 var reg=region(floor),options=group(floor),one=options[Math.abs(variant||0)%options.length]||DB.sets[0];
 var classic=sourceSlot[slot]||slot;
 var spec=setRules(one.id);
 var existing=DB.gear.find(function(x){return x.set===one.id&&x.slot===classic;});
 if(slot==='weapon'){
  var weapons=DB.weapons.filter(function(x){return x.tier===reg.tier;});
  var src=weapons[Math.abs(variant||0)%weapons.length]||weapons[0];
  return {catalogId:src.id,name:src.name,setId:null,setName:null,tier:src.tier,
   trait:src.trait||'Базовая атака',slot:'weapon',rarity:1,
   atk:4+Math.round((Math.abs(src.damage)||12)/14)+(src.tier-1)*3,def:0,hp:0,mp:0,
   pow:/Жезл|Посох/.test(src.name)?3+(src.tier-1)*2:0,crit:0};
 }
 var inSet=!!spec&&spec.slots.indexOf(slot)>=0;
 var display=existing&&inSet?existing.name:({'bracer':'Наручи','ring':'Кольцо','amulet':'Амулет','cloak':'Плащ','gloves':'Перчатки','armor':'Доспех','helm':'Шлем','boots':'Обувь'}[slot]||'Предмет')+' «'+one.name+'»';
 var scale=reg.tier===2?1.35:1;
 var defense=existing?existing.base_armor:10;
 var hp=Math.max(2,Math.round((slot==='armor'?8:slot==='helm'?5:slot==='bracer'?4:3)*scale));
 return {catalogId:existing?existing.id:'adapted_'+one.id+'_'+slot,
  name:display,setId:inSet?one.id:null,setName:inSet?one.name:null,tier:reg.tier,
  trait:inSet?'Часть комплекта «'+one.name+'»':'Самостоятельная находка',
  slot:slot,rarity:1,atk:slot==='gloves'?2:0,def:Math.max(1,Math.round(defense/13*scale)),
  hp:hp,mp:slot==='cloak'||slot==='amulet'?4*reg.tier:0,
  pow:slot==='ring'||slot==='amulet'?2*reg.tier:0,crit:0};
}
function counts(equip,items){
 var count={};Object.keys(equip).forEach(function(slot){
  var id=equip[slot],it=items.find(function(x){return x.id===id;});
  if(it&&it.setId)count[it.setId]=(count[it.setId]||0)+1;
 });return count;
}
function bonuses(equip,items){
 var count=counts(equip,items),total={};
 for(var id in count){var b=setRules(id);if(!b)continue;
  for(var stage of [{min:2,bonus:b.two},{min:b.slots.length,bonus:b.complete}]){
   if(count[id]<stage.min)continue;
   for(var stat in stage.bonus)total[stat]=(total[stat]||0)+stage.bonus[stat];
  }
 }return total;
}
function descriptions(id){
 var spec=setRules(id);if(!spec)return [];
 return [{min:2,data:spec.two},{min:spec.slots.length,data:spec.complete}].map(function(stage){
  return stage.min+' предмета: '+Object.entries(stage.data).map(function(x){return (ATTR[x[0]]||x[0])+(x[1]===1?'':' +'+x[1]);}).join(', ');
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
 counts:counts,bonuses:bonuses,descriptions:descriptions,thresholds:thresholds,setRules:setRules,near:near,openPath:openPath,exploreStatus:exploreStatus,
 summonSpot:summonSpot,walkPath:walkPath,visualId:visualId,rangedSource:rangedSource};
})();