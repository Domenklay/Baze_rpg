/* Пепельный лабиринт: offline, original roguelite. No external calls. */
(function(){
'use strict';
var KEY='cryptbound_local_v1',s=null,toastTimer=0;
var EX=window.CryptExpansion,CR=window.ClickerRules,DB=window.ClickerData,DN=window.CryptDungeons,holdTimeout=null,suppressClickUntil=0;
var $=function(id){return document.getElementById(id);};
var C={
 necromancer:{name:'Некромант',type:'Магия',title:'Хозяин костей',description:'Призывает скелета, который сражается и прикрывает владельца.',hp:78,mp:58,atk:10,def:1,pow:11,crit:5,icon:'☠'},
 executioner:{name:'Воин',type:'Битва',title:'Клинок возмездия',description:'Двуручный удар и защитная стойка.',hp:112,mp:33,atk:16,def:5,pow:5,crit:8,icon:'⚔'},
 scout:{name:'Лучник',type:'Приключение',title:'Зоркий следопыт',description:'Разведывает доступные клетки, избегает ловушек.',hp:90,mp:44,atk:13,def:3,pow:7,crit:12,icon:'➶'},
 sorceress:{name:'Волшебница',type:'Магия',title:'Проводница стихий',description:'Наносит магический урон всем обнаруженным врагам.',hp:77,mp:68,atk:9,def:1,pow:14,crit:6,icon:'✣'},
 guardian:{name:'Воительница',type:'Битва',title:'Стальная клятва',description:'Проводит мощный удар и укрепляет защиту.',hp:120,mp:36,atk:15,def:6,pow:5,crit:7,icon:'♜'},
 assassin:{name:'Кинжальщица',type:'Приключение',title:'Отравленный клинок',description:'Отравляет врагов и наносит повышенный урон.',hp:86,mp:46,atk:14,def:3,pow:7,crit:15,icon:'☽'}
};
var THEMES=[['Костяная крипта','Плач забытых','Влажный склеп, где безымянные стражи не желают покоя.'],['Затонувшая библиотека','Шёпот пергамента','Книги и заклятия гниют в ледяном камне.'],['Кровавый монастырь','Алые катакомбы','Под алтарями слышны удары чужого сердца.'],['Чертоги бездны','Нижние ворота','Осколки древних богов дышат под землёй.']];
var MOBS=[
 {id:'rat',name:'Гробовая крыса',hp:19,atk:5,def:0,ep:1,gold:4},
 {id:'skeleton',name:'Костяной дозорный',hp:24,atk:6,def:1,ep:1,gold:6},
 {id:'cultist',name:'Культист пепла',hp:30,atk:7,def:2,ep:2,gold:8},
 {id:'wolf',name:'Слепой падальщик',hp:28,atk:8,def:1,ep:2,gold:7},
 {id:'spider',name:'Паучья мать',hp:31,atk:7,def:2,ep:2,gold:9},
 {id:'golem',name:'Проклятый истукан',hp:42,atk:10,def:4,ep:3,gold:12}
];
var BOSSES=['Князь надгробий','Преподобный без лица','Король чернильного праха','Колокол Пустоты'];
var SLOT={weapon:'Оружие',helm:'Голова',shoulders:'Плечи',armor:'Нагрудник',gloves:'Перчатки',belt:'Пояс',legs:'Поножи',boots:'Сапоги',relic:'Талисман'};
var ITEM_NAMES={
 weapon:['Сколотая сабля','Жертвенный клинок','Коса сборщика','Меч без присяги','Мрачный меч','Костяной посох'],
 helm:['Шлем дозорного','Личина печали','Шишак отступника','Капюшон ночи'],
 shoulders:['Оплечье стража','Костяные наплечники','Плечи паладина','Плащ безымянного'],
 armor:['Могильная кольчуга','Хитон отступника','Нагрудник дозорного','Доспех раскаяния','Панцирь смолы'],
 gloves:['Перчатки могильщика','Рукавицы клятвы','Пальцы колдуна','Рукавицы экзекутора'],
 belt:['Пояс паломника','Кушак оккультиста','Железный ремень','Пояс реликвария'],
 legs:['Поножи забвения','Защита колен стража','Чёрные набедренники'],
 boots:['Сапоги скитальца','Погребальные ботфорты','Сапоги следопыта'],
 relic:['Глаз ночного ворона','Кровавая печать','Ключ без двери','Обсидиановое сердце','Пепельный медальон']
};
var RARITY=['Обычный','Необычный','Редкий','Эпический','Легендарный'];
var SPELLS=[
 {id:'bolt',name:'Костяная стрела',icon:'✧',cost:5,kind:'attack',base:17,description:'Магический урон одной цели. Сила растёт от мощи магии.'},
 {id:'flame',name:'Зов пламени',icon:'♨',cost:8,kind:'burn',base:22,description:'Сильный урон и горение на 3 хода.'},
 {id:'frost',name:'Ледяные оковы',icon:'❄',cost:8,kind:'stun',base:12,description:'Наносит урон и оглушает на один ход.'},
 {id:'heal',name:'Слово жизни',icon:'✚',cost:9,kind:'heal',base:31,description:'Восстанавливает здоровье.'},
 {id:'ward',name:'Каменная кожа',icon:'⬡',cost:9,kind:'shield',base:28,description:'Даёт временный щит, поглощающий урон.'},
 {id:'chain',name:'Раскаты грома',icon:'ϟ',cost:12,kind:'chain',base:19,description:'Поражает до трёх найденных врагов.'},
 {id:'sight',name:'Око забвения',icon:'◉',cost:8,kind:'reveal',base:3,description:'Раскрывает три случайные скрытые клетки.'},
 {id:'leech',name:'Жажда крови',icon:'☽',cost:11,kind:'drain',base:23,description:'Вытягивает здоровье из врага и лечит героя.'}
];
var TALENTS=window.CryptTitles||[];

var CORPSE_STORIES=[
 {id:'storm-smith',name:'Павший механик',note:'«Катушка искрила. Если найдёте мою кирасу — берегите левую перчатку».',slot:'armor',gear:'Кираса павшего механика',soul:'Душа механика',prize:'Грозовая перчатка'},
 {id:'lost-surveyor',name:'Пропавший землемер',note:'На мокрой карте отмечен проход. Рядом приписка: «Не слушай огонёк».',slot:'boots',gear:'Сапоги землемера',soul:'Душа землемера',prize:'Перчатка путеводной искры'},
 {id:'ash-scholar',name:'Сгоревший летописец',note:'«Вспомнил название деревни, но светлячок сказал, что это неважно...»',slot:'relic',gear:'Печать летописца',soul:'Душа летописца',prize:'Перчатка шепчущих рун'}
];
var SECRET_EVENTS=[
 {title:'Кот в чёрном капюшоне',text:'На ступенях сидит костлявый кот и смотрит прямо в душу. На шее — ключ, который он явно не собирается отдавать.',reward:'На полу остаётся редкая реликвия.',type:'relic'},
 {title:'Шахматы мертвеца',text:'Костяные фигуры продолжают партию без игроков. Вы делаете единственный ход, после которого король падает.',reward:'Ваша проницательность вознаграждена очками пути.',type:'ep'},
 {title:'Восемь свечей',text:'Семь свечей горят обычным огнём. Восьмая — холодным, будто внутри застыл кусочек зимы.',reward:'Вы находите свитки забытых чар.',type:'scroll'},
 {title:'Зеркало с опозданием',text:'Отражение совершает движения на мгновение позже вас. Когда вы отворачиваетесь, оно остаётся стоять.',reward:'Вы получаете защитное благословение.',type:'shield'},
 {title:'Голос за стеной',text:'«Не разбивай камень, он держит потолок», — шепчет голос из-за кладки. Вы осторожно вытаскиваете маленькую кость.',reward:'Кость ведёт вас к тайнику.',type:'gold'},
 {title:'Похоронный колокол',text:'Колокол звенит сам собой. Под ним лежит записка: «Дверь откроется для тех, кто не боится вернуться».',reward:'Древний звон восстанавливает ману.',type:'mana'},
 {title:'Подпись архитектора',text:'В глубине кладки вы обнаруживаете выбитую дату, которая ещё не наступила.',reward:'Вам открывается новая тайна лабиринта.',type:'ep'},
 {title:'Сломанная маска',text:'Незнакомец без лица оставил маску и мешок монет. Его следы ведут сквозь стену.',reward:'Вы находите золото и лечебный эликсир.',type:'heal'}
];
var r=null;
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(a){return a[rand(0,a.length-1)];}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function pct(a,b){return Math.floor(100*(b?clamp(a,0,b)/b:0));}
function esc(v){return String(v).replace(/[&<>"']/g,function(a){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a];});}
function log(t){r.log.unshift(t);r.log=r.log.slice(0,12);}
function currentRegion(){return DN.location(r.actIndex||0,r.locationIndex||0)||DN.location(0,0);}
function levelTheme(){return ((r.actIndex||0)*3+(r.locationIndex||0))%6;}
function maxFloorLabel(){return currentRegion().name;}
function isBossFloor(){return DN.bossFloor(r.floor);}
function depthMultiplier(){return DN.rewardMultiplier(r.floor);}
function lvl(n){return (r.talents[n]||0);}
function bonus(effect){return TALENTS.reduce(function(sum,t){return sum+(t.effect===effect?lvl(t.id)*t.amount:0);},0);}
function levelCost(t){var main=C[r.class].type==='Магия'?1:C[r.class].type==='Битва'?0:2;
 var base=2+t.rank*3+lvl(t.id)*3;
 return t.tree===main?base:Math.ceil(base*1.25);
}
/* Reject sibling specializations at every ancestor branch, not only at the current rank. */
function talentPathConflict(t){
 var node=t;
 while(node&&node.parent){
  if(TALENTS.some(function(other){return other.tree===node.tree&&other.parent===node.parent&&other.id!==node.id&&lvl(other.id)>0;}))return true;
  node=TALENTS.find(function(p){return p.id===node.parent;});
 }
 return false;
}
function talentUnlocked(t){return (!t.parent||lvl(t.parent)>0)&&!talentPathConflict(t);}
function talentsByTree(tree){return TALENTS.filter(function(x){return x.tree===tree;});}
function equipped(id){return Object.values(r.equip).some(function(v){return v===Number(id);});}
function item(id){return r.items.find(function(x){return x.id===Number(id);})||null;}
function equippedItem(slot){return item(r.equip[slot]);}
function setBonus(k){var obj=CR.bonuses(r.equip,r.items);return obj[k]||0;}
function stats(){
 var c=C[r.class],e=r.equip;
 var a=c.atk+(r.floor-1)*1.1+bonus('atk')+(s.meta.upgrades.atk*2)+EX.masteryStat(s.meta,r.class,'atk')+EX.relicStat(s.meta,'atk')+setBonus('atk');
 var def=c.def+bonus('def')+EX.masteryStat(s.meta,r.class,'def')+EX.relicStat(s.meta,'def')+setBonus('def');
 var hp=c.hp+bonus('hp')+s.meta.upgrades.hp*12+EX.masteryStat(s.meta,r.class,'hp')+EX.relicStat(s.meta,'hp')+setBonus('hp');
 var mp=c.mp+bonus('mp')+s.meta.upgrades.mp*8+EX.masteryStat(s.meta,r.class,'mp')+EX.relicStat(s.meta,'mp')+setBonus('mp');
 var pow=c.pow+bonus('pow')+EX.masteryStat(s.meta,r.class,'pow')+EX.relicStat(s.meta,'pow')+setBonus('pow');
 var crit=c.crit+bonus('crit')+EX.masteryStat(s.meta,r.class,'crit')+EX.relicStat(s.meta,'crit')+setBonus('crit');
 Object.keys(e).forEach(function(slot){
  var i=equippedItem(slot);if(!i)return;
  a+=i.atk||0;def+=i.def||0;hp+=i.hp||0;mp+=i.mp||0;pow+=i.pow||0;crit+=i.crit||0;
 });
 var city=s.meta.city||{};
 a+=(city.forge||0)*2;hp+=(city.barracks||0)*12;mp+=(city.library||0)*8;
 return {atk:Math.floor(a),def:def,hp:hp,mp:mp,pow:pow,crit:clamp(crit,0,75),dodge:clamp(bonus('dodge')+setBonus('dodge'),0,50)};
}
function newItem(slot,floor,variant){
 var src=CR.gear(slot,floor,variant==null?rand(0,1):variant);
 return Object.assign({id:++s.seq,plus:0,floor:floor,fixed:true},src);
}
function rarityRoll(){var x=rand(1,100),chance=bonus('rarityBoost');return x<=20+chance?1:0;}
function addItem(slot,rarity){
 var i=newItem(slot,r.floor,rarity);
 if(r.items.length>=48){r.gold+=10+r.floor*2;log('Сумка переполнена. Добыча обменяна на монеты.');return null;}
 r.items.push(i);log('Найдено: '+i.name+' ('+RARITY[i.rarity]+').');return i;
}
function bonusGold(n){return Math.round(n*(1+bonus('gold')*.01));}
function addGold(n){n=bonusGold(n);r.gold+=n;return n;}
function mkEnemy(boss,ranged){
 var reg=currentRegion();
 var elites=reg.elites||[],mobs=reg.mobs||[];
 var elite=!boss&&!ranged&&r.floor>=8&&Math.random()<.13;
 var src=boss?reg.boss:ranged?pick(mobs.filter(function(m){return m.kind==='shot';}).length?mobs.filter(function(m){return m.kind==='shot';}):mobs):
  pick(elite?elites:mobs);
 var stage=(r.actIndex||0),location=(r.locationIndex||0);
 var difficulty=(1+Math.floor((r.floor-1)/10)*.20)*(1+stage*.12+location*.12);
 var isBoss=!!boss,isRanged=!!ranged,isElite=!!(src.elite&&!isBoss);
 var hp=Math.max(12,Math.round((src.hp||26+stage*8+location*5)*difficulty*(isBoss?5:isElite?1.8:1)));
 var atk=Math.max(3,Math.round((src.atk||6+stage*1.4+location*1.5)*difficulty*(isBoss?1.4:isElite?1.2:1)));
 var def=Math.max(0,src.def||0);
 var visual=CR.visualId(src.name),kind=src.kind||EX.monster(visual).kind||'slam';
 var skill=isRanged?{name:'Дальний выстрел',every:3,description:'Стреляет каждый третий ход.',kind:'shot'}:
 {name:src.skillName||EX.monster(visual).name,every:isBoss?3:isElite?4:3,description:src.role||'Особый приём.',kind:kind};
 var rewards=Math.max(1,Math.round(depthMultiplier()*(isBoss?60:isElite?20:7)));
 return {id:src.id,name:src.name,visual:visual,hp:hp,maxHp:hp,atk:atk,def:def,
 ep:isBoss?10:isElite?5:2,gold:rewards,boss:isBoss,elite:isElite,
 burn:0,stun:0,poison:0,skill:skill,cooldown:skill.every,guard:0,
 ranged:isRanged,attackInterval:isRanged?3:1,attackCooldown:isRanged?3:1,loot:src.loot||[]};
}
function distributeTiles(){
 var types=Array.from({length:25},function(){return 'empty';});
 var startId=rand(0,24),indices=[];
 for(var i=0;i<25;i++)if(i!==startId)indices.push(i);
 for(var j=indices.length-1;j>0;j--){var k=rand(0,j),v=indices[j];indices[j]=indices[k];indices[k]=v;}
 types[startId]='start';
 var pos=0;
 function insert(kind,count){for(var x=0;x<count&&pos<indices.length;x++)types[indices[pos++]]=kind;}
 var boss=isBossFloor()&&!r.bossClears[r.floor];
 insert('exit',1);
 insert('enemy',boss?5:Math.min(6,3+Math.floor(r.floor/6)));
 if(boss)insert('boss',1);
 insert('chest',2);insert('trap',1);insert('altar',1);insert('shop',1);
 insert('event',1);insert('puzzle',1);insert('secret',1);insert('coin',2);insert('potion',1);
 insert('corpse',r.floor%2===0?1:0);insert('chamber',r.floor%3===0?1:0);
 var ranged=r.floor<6?0:r.floor<16?1:2;
 for(var x=0;x<ranged;x++){var index=types.indexOf('enemy');if(index<0)break;types[index]='ranged';}
 var tiles=types.map(function(kind,id){var enemy=kind==='enemy'||kind==='boss'||kind==='ranged';
  return {id:id,kind:kind==='ranged'?'enemy':kind,
   revealed:kind==='start'||kind==='ranged',cleared:kind==='start',
   foe:enemy?mkEnemy(kind==='boss',kind==='ranged'):null,
   drops:null,hasKey:false,corpseId:kind==='corpse'?pick(CORPSE_STORIES).id:null,room:null};
 });
 var carrier=tiles.find(function(t){return t.kind==='boss';})||pick(tiles.filter(function(t){return t.foe&&!t.foe.ranged;}));
 if(carrier)carrier.hasKey=true;
 r.heroTile=startId;
 return tiles;
}
function placeSummon(){
 if(!r.summon||r.summon.hp<=0)return false;
 if(r.summonTile!=null&&r.tiles[r.summonTile])return true;
 var spot=CR.summonSpot(r.tiles);
 if(!spot.tile){log('Нет места для призыва.');return false;}
 if(spot.opened){spot.tile.revealed=true;spot.tile.cleared=true;log('Для призыва открыта свободная клетка.');}
 r.summonTile=spot.tile.id;return true;
}
function startFloor(){
 r.chamberActive=null;
 r.portalReady=!!(isBossFloor()&&r.bossClears[r.floor]);
 r.tiles=distributeTiles();r.key=false;r.floorCleared=false;r.shield=bonus('shieldFloor')+setBonus('shieldFloor');r.blessed=0;
 r.summonTile=null;
 if(r.summon&&r.summon.hp>0)placeSummon();
 if(lvl('seeker')>0&&Math.random()<Math.min(.6,.15*lvl('seeker'))){
  var hintTile=r.tiles.find(function(t){return t.kind==='secret';});
  if(hintTile)hintTile.hinted=true;
 }
 var st=stats();
 r.mp=Math.min(st.mp,r.mp+7+bonus('manaFloor'));r.ep+=bonus('epFloor');
 r.poisonTurns=0;
 var revealCount=Math.floor(bonus('revealFloor'));
 for(var i=0;i<revealCount;i++){
  var available=r.tiles.filter(function(t){return CR.exploreStatus(t,r.tiles).ok;});
  if(!available.length)break;
  var chosen=pick(available);chosen.revealed=true;if(chosen.kind==='empty')chosen.cleared=true;
 }
 log('Этаж '+r.floor+' · '+maxFloorLabel()+'. Герой начинает исследование со случайной клетки.');
}
function begin(hero){
 var meta=s.meta;
 if(meta.activeExpedition){toast('Сначала продолжите или завершите предыдущую экспедицию.');return;}
 if((meta.selectedAct||0)>(meta.unlockedAct||0)){toast('Это подземелье пока не открыто.');return;}
 r=s.run={class:hero,actIndex:meta.selectedAct||0,locationIndex:0,bossClears:{},portalReady:false,materials:{},diamonds:0,questItems:[],floor:1,turn:0,gold:20,ep:1,kills:0,secrets:0,
    hp:1,mp:1,items:[],equip:{weapon:null,helm:null,shoulders:null,armor:null,gloves:null,belt:null,legs:null,boots:null,relic:null},bagSelected:null,bagFilter:'all',treeView:hero==='necromancer'||hero==='sorceress'?1:hero==='scout'||hero==='assassin'?2:0,key:false,
    talents:{},scrolls:{bolt:4,flame:1,heal:2,frost:1,ward:1,chain:0,sight:1,leech:0},
    potions:3,summon:null,shield:0,blessed:0,poisonTurns:0,tiles:[],log:[],tab:'maze',soulBag:[],journalNotes:[],uniqueFinds:{},
    skillUsed:-100,skillTurns:0,eventIndex:0,floorFlags:[],mastered:0,summonTile:null,fx:null,fxUntil:0};
 ['weapon','armor','relic'].forEach(function(slot){
  var i=newItem(slot,1,0);r.items.push(i);r.equip[slot]=i.id;
 });
 r.hp=stats().hp;r.mp=stats().mp;
 startFloor();save();draw();close();
}
function fresh(){s={version:1,seq:0,meta:{souls:0,best:0,runs:0,unlockedAct:0,selectedAct:0,activeExpedition:null,completedActs:{},achievements:{},diamonds:0,rainbowDiamonds:0,upgrades:{hp:0,atk:0,mp:0},secrets:[],heroRanks:{necromancer:0,executioner:0,scout:0},heroEssence:{necromancer:0,executioner:0,scout:0},relics:{},bestiary:{},milestones:{},materials:{},city:{forge:0,barracks:0,library:0},totalSecrets:0,bossKills:0},run:null};r=null;}
function load(){
 try{var v=JSON.parse(localStorage.getItem(KEY)||'null');if(!v||v.version!==1||!v.meta||!v.meta.upgrades)return null;
 if(v.run&&(!C[v.run.class]||!Array.isArray(v.run.tiles)||!Array.isArray(v.run.items)||!v.run.equip))return null;
 var meta=v.meta;
 for(var x of ['heroRanks','heroEssence','relics','bestiary','milestones'])if(!meta[x])meta[x]={};
 for(var hero of Object.keys(C)){if(!meta.heroRanks[hero])meta.heroRanks[hero]=0;if(!meta.heroEssence[hero])meta.heroEssence[hero]=0;}
 if(!meta.totalSecrets)meta.totalSecrets=0;
 if(!meta.bossKills)meta.bossKills=0;
 if(!meta.materials)meta.materials={};if(!meta.city)meta.city={forge:0,barracks:0,library:0};
 if(meta.unlockedAct==null)meta.unlockedAct=0;
 if(meta.selectedAct==null)meta.selectedAct=0;
 if(meta.activeExpedition===undefined)meta.activeExpedition=null;
 if(!meta.completedActs)meta.completedActs={};
 if(!meta.achievements)meta.achievements={};
 if(meta.activeExpedition&&!Array.isArray(meta.activeExpedition.questItems))meta.activeExpedition.questItems=[];
 if(meta.diamonds==null)meta.diamonds=0;
 if(meta.rainbowDiamonds==null)meta.rainbowDiamonds=0;
 if(v.run){for(var k of Object.keys(SLOT))if(!(k in v.run.equip))v.run.equip[k]=null;
  if(v.run.treeView==null)v.run.treeView=0;if(!v.run.bagFilter)v.run.bagFilter='all';
  if(v.run.actIndex==null)v.run.actIndex=0;
  if(v.run.locationIndex==null)v.run.locationIndex=0;
  if(!v.run.bossClears)v.run.bossClears={};
  if(!Array.isArray(v.run.questItems))v.run.questItems=[];
  if(!v.run.materials)v.run.materials={};
  if(v.run.diamonds==null)v.run.diamonds=0;
  if(v.run.heroTile==null){var origin=v.run.tiles.find(function(t){return t.kind==='start';});v.run.heroTile=origin?origin.id:12;}
  if(v.run.portalReady==null)v.run.portalReady=false;
  if(!Array.isArray(v.run.soulBag))v.run.soulBag=[];
  if(!Array.isArray(v.run.journalNotes))v.run.journalNotes=[];
  if(!v.run.uniqueFinds)v.run.uniqueFinds={};
  if(!v.run.poisonTurns)v.run.poisonTurns=0;
  v.run.chamberActive=null; // A modal room is reopened explicitly after loading.
  for(var enemyTile of v.run.tiles){if(enemyTile.foe&&enemyTile.foe.hp>0){var enemy=enemyTile.foe;enemy.skill=enemy.ranged?{name:'Дальний выстрел',every:3,description:'Стреляет каждые три хода.',kind:'shot'}:EX.monster(enemy.visual||CR.visualId(enemy.name));
  if(enemy.ranged&&enemy.attackCooldown==null)enemy.attackCooldown=3;
  if(enemy.cooldown==null)enemy.cooldown=enemy.skill.every;if(enemy.guard==null)enemy.guard=0;}}
  if(v.run.summon){if(v.run.summon.specialCooldown==null)v.run.summon.specialCooldown=4;if(!v.run.summon.def)v.run.summon.def=2;}
  if(typeof v.run.key!=='boolean')v.run.key=!v.run.tiles.some(function(t){return t.foe&&t.foe.hp>0;});
  if(!v.run.key&&!v.run.tiles.some(function(t){return t.hasKey||(t.drops&&t.drops.key);})){
    // Migrate a v0.1 floor where enemies had no key-carrier marker.
    var surviving=v.run.tiles.find(function(t){return t.foe&&t.foe.hp>0;});
    if(surviving)surviving.hasKey=true;
    else v.run.key=true;
  }
 }
 return v;}catch(e){return null;}
}
function save(){try{if(!s)return;localStorage.setItem(KEY,JSON.stringify(s));}catch(e){console.warn('Save unavailable',e);}}
function enemies(){return r.tiles.filter(function(t){return t.foe&&t.foe.hp>0&&t.revealed;});}
function hiddenEnemies(){return r.tiles.filter(function(t){return t.foe&&t.foe.hp>0;});}
function target(){return enemies()[0]||null;}
function tile(n){return r.tiles[Number(n)]||null;}
function icon(kind,foe){return window.CryptArt.tile(kind,foe);}
function hud(){
 if(!r){$('status-name').textContent='БЕЗЫМЯННЫЙ';$('status-depth').textContent='ЛАГЕРЬ';$('hp-label').textContent='—';$('mp-label').textContent='—';
 $('hp-fill').style.width='0%';$('mp-fill').style.width='0%';$('gold-label').textContent='—';$('ep-label').textContent=s.meta.souls;
 $('portrait').innerHTML=window.CryptArt.miniHero('necromancer');return;}
 var st=stats();
 $('status-name').textContent=C[r.class].name.toUpperCase();$('status-depth').textContent='ЭТАЖ '+r.floor;
 $('hp-fill').style.width=pct(r.hp,st.hp)+'%';$('mp-fill').style.width=pct(r.mp,st.mp)+'%';
 $('hp-label').textContent=r.hp+' / '+st.hp+' ЗД';$('mp-label').textContent=r.mp+' / '+st.mp+' МН';
 $('gold-label').textContent=r.gold;$('ep-label').textContent=r.ep;
 $('portrait').innerHTML=window.CryptArt.miniHero(r.class,r.fxUntil>Date.now()?r.fx:null);
 document.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===r.tab);});
}
function section(title,extra){return '<div class="section-head"><h2>'+title+'</h2><span class="fine muted">'+(extra||'')+'</span></div>';}
function frame(title,content,side){return '<section class="frame"><div class="frame-title">'+title+'<small>'+(side||'')+'</small></div>'+content+'</section>';}
function monsterVisual(e){return icon('enemy',e.visual||CR.visualId(e.name));}
function activeTileView(t){
 var alive=t.foe&&t.foe.hp>0,drop=!!t.drops;
 var hero=r.heroTile===t.id?'<span class="hero-on-board">'+window.CryptArt.miniHero(r.class,r.fxUntil>Date.now()?r.fx:null)+'</span>':'';
 if(t.revealed&&t.kind==='start')return '<button class="tile tile-origin" data-action="move-hero" data-id="'+t.id+'" aria-label="Стартовая клетка">'+hero+'<span class="origin-dot">◆</span></button>';
 if(r.summon&&r.summon.hp>0&&r.summonTile===t.id)
  return '<button class="tile tile-summon" data-action="inspect-summon" data-hold="summon" aria-label="Скелет: удерживайте для изучения">'+
   icon('enemy','skeleton')+'<span class="unit-corner unit-hp">♥'+r.summon.hp+'</span>'+
   '<span class="unit-corner unit-cd">◷'+(r.summon.specialCooldown||4)+'</span>'+
   '<span class="unit-corner unit-atk">⚔'+r.summon.atk+'</span></button>';
 if(t.revealed&&!alive&&!drop&&(t.cleared||t.kind==='empty'))
  return '<button class="tile tile-bare" data-action="move-hero" data-id="'+t.id+'" aria-label="Открытая пустая клетка"><span class="stone-joint"></span>'+hero+'</button>';
 if(!t.revealed){
  var access=CR.exploreStatus(t,r.tiles);
  return access.ok?
   '<button class="tile hidden tile-frontier" data-action="reveal" data-id="'+t.id+'" title="Открыть плиту · 1 ход" aria-label="Доступная каменная плита"><span class="slab-face">'+(t.hinted?'✦':'✥')+'</span></button>':
   '<div class="tile hidden tile-locked" title="'+esc(access.reason)+'" aria-label="Путь заблокирован"><span class="slab-face">◆</span></div>';
 }
 var marker=alive?'enemy':drop?(t.drops.key?'key':'loot'):t.kind==='exit'?'exit':t.kind==='puzzle'||t.kind==='corpse'?'event':t.kind==='chamber'?'secret':t.kind;
 var graphic=marker==='key'||marker==='loot'?window.CryptArt.tileBase(marker):alive?monsterVisual(t.foe):icon(marker);
 var name=alive?t.foe.name:marker==='key'?'Ключ от лестницы':marker==='loot'?'Трофеи':({exit:'Лестница',chest:'Сундук',trap:'Шипы',altar:'Алтарь',shop:'Торговец',secret:'Тайник',coin:'Монеты',potion:'Эликсир',event:'Событие',puzzle:'Загадка',corpse:'Останки исследователя',chamber:'Побочная комната'})[t.kind]||'Находка';
 var action=alive?'strike':t.kind==='exit'?'descend':'pickup';
 var delay=alive?(t.foe.ranged?t.foe.attackCooldown:(t.foe.cooldown||EX.monster(t.foe.visual||t.foe.id).every)):0;
 var unit=alive?'<span class="unit-corner unit-hp">♥'+t.foe.hp+'</span>'+
  '<span class="unit-corner unit-cd">◷'+delay+'</span>'+
  '<span class="unit-corner unit-atk">⚔'+t.foe.atk+'</span>':'';
 return '<button class="tile tile-discovered tile-'+marker+(alive?' tile-danger':'')+(alive&&t.foe.ranged?' tile-ranged':'')+
  '" data-action="'+action+'" data-id="'+t.id+'"'+(alive?' data-hold="enemy"':'')+
  ' aria-label="'+esc(name)+'" title="'+esc(name)+'">'+graphic+unit+
  (drop&&t.drops.key?'<span class="tile-number">⚿</span>':'')+'</button>';
}
function inspectUnit(kind,id){
 if(!r)return;
 if(kind==='summon'){
  var u=r.summon;if(!u||u.hp<=0)return;
  dialog('<div class="emblem">☠</div><div class="subhead">СОЮЗНИК · ПРИЗЫВ</div><h2>'+esc(u.name)+'</h2>'+
   '<div class="unit-profile">'+icon('enemy','skeleton')+'<div><b>♥ '+u.hp+' / '+u.maxHp+' HP</b><b>⚔ '+u.atk+' УРОН</b><b>⬡ '+(u.def||0)+' БРОНЯ</b></div></div>'+
   '<div class="unit-skill"><strong>Костяной удар</strong><p>Самостоятельно атакует ближайшего обнаруженного врага каждый ход.</p></div>'+
   '<div class="unit-skill"><strong>Прикрытие хозяина</strong><p>С вероятностью 72% принимает удар врага вместо героя.</p></div>'+
   '<div class="unit-skill"><strong>Гробовой раскол · ◷ '+(u.specialCooldown||4)+'</strong><p>Каждый 4-й ход наносит усиленный урон цели.</p></div>'+
   '<button class="btn wide space-top" data-action="close">Вернуться</button>');
  return;
 }
 var t=tile(id),e=t&&t.foe;if(!e||e.hp<=0)return;
 var special=e.skill||EX.monster(e.id);
 dialog('<div class="emblem">⚔</div><div class="subhead">'+(e.boss?'ПОВЕЛИТЕЛЬ ЭТАЖА':'ОБИТАТЕЛЬ ПОДЗЕМЕЛЬЯ')+'</div>'+
  '<h2>'+esc(e.name)+'</h2>'+
  '<div class="unit-profile">'+monsterVisual(e)+'<div><b>♥ '+e.hp+' / '+e.maxHp+' HP</b><b>⚔ '+e.atk+' УРОН</b><b>⬡ '+e.def+' БРОНЯ</b></div></div>'+
  '<div class="unit-skill"><strong>Обычная атака</strong><p>Атакует каждый свой ход. Урон уменьшается вашей бронёй.</p></div>'+
  '<div class="unit-skill"><strong>'+esc(special.name)+' · ◷ '+(e.cooldown||special.every)+'</strong>'+
  '<p>'+esc(special.description)+' Следующее применение через '+(e.cooldown||special.every)+' ход(а) этого врага.</p></div>'+
  '<button class="btn wide space-top" data-action="close">Продолжить бой</button>');
}

function combatView(){
 var t=target();
 if(!t)return frame('ЗАЛЫ ОЖИДАЮТ','<p class="fine muted">Касайтесь закрытых плит, чтобы исследовать этаж. Открытые чудовища отвечают ударами на каждый ход.</p>');
 var f=t.foe;
 return '<div class="combat-box"><div class="combat-portrait">'+icon('enemy',f.id)+'</div><div class="combat-data">'+
 '<h3>'+f.name+(f.boss?' <span class="red">БОСС</span>':'')+'</h3><div class="mini-meter"><i style="width:'+pct(f.hp,f.maxHp)+'%"></i></div>'+
 '<p>'+f.hp+' / '+f.maxHp+' HP</p><div class="combat-stat">АТК '+f.atk+' · БРОНЯ '+f.def+'</div></div>'+
 '<button class="btn" data-action="strike" data-id="'+t.id+'">⚔ УДАР</button></div>';
}
function summonView(){
 if(!r.summon||r.summon.hp<=0)return '';
 return '<div class="summon-card">'+icon('enemy','skeleton')+'<div><strong>Призыв: '+r.summon.name+'</strong><small>Жизнь '+r.summon.hp+'/'+r.summon.maxHp+' · Урон '+r.summon.atk+' · перехватывает удары</small></div></div>';
}
function skillText(){return r.class==='necromancer'?'☠ Призвать скелета':r.class==='executioner'?'⚔ Казнящий удар':'◉ Вскрыть тайники';}
function skillHint(){return r.class==='necromancer'?'8 маны, 5 ходов восстановления':r.class==='executioner'?'4 маны, 4 хода восстановления':'6 маны, 5 ходов восстановления';}
function renderMaze(){
 var exposed=r.tiles.filter(function(t){return t.revealed;}).length;
 var focus=target(),foe=focus&&focus.foe,turns=r.turn-r.skillUsed,skill=SKILLS[r.class];
 var sceneTitle=maxFloorLabel();
 var footer=foe?
   '<div class="dungeon-foe-icon">'+monsterVisual(foe)+'</div><div class="dungeon-foe-info">'+
   '<strong>'+esc(foe.name)+(foe.boss?' · БОСС':'')+'</strong>'+
   '<small>♥ '+foe.hp+'/'+foe.maxHp+' HP · ⚔ '+foe.atk+' ATK · ◷ '+(foe.ranged?foe.attackCooldown:(foe.cooldown||EX.monster(foe.visual||foe.id).every))+'</small>'+
   '<small>'+esc((foe.skill||EX.monster(foe.visual||foe.id)).name)+'</small></div>'+
   '<button class="btn small" data-action="strike" data-id="'+focus.id+'">⚔ Удар</button>'
   :'<div class="dungeon-quiet"><b>✥ '+(r.log[0]?esc(r.log[0]):'Здесь царит тишина')+'</b><small>Открывайте плитки и забирайте найденное повторным нажатием</small></div>';
 var summon=(r.summon&&r.summon.hp>0)?'<div class="dungeon-summon">☠ '+r.summon.name+' '+r.summon.hp+'/'+r.summon.maxHp+'</div>':'';
 return '<div class="dungeon-root">'+
 '<div class="dungeon-header"><div><span class="subhead">'+esc(DN.acts[r.actIndex||0].name)+' · '+(r.locationIndex+1)+'/3 · ЭТАЖ '+r.floor+' · '+sceneTitle+'</span>'+
 '<div class="dungeon-progress">Плит '+exposed+'/25 · Врагов '+hiddenEnemies().length+' · Ход '+r.turn+'</div><div class="fine muted">'+esc(currentRegion().story||'')+'</div></div>'+
 '<div class="dungeon-key '+(r.key?'found':'')+'">'+(r.key?'⚿ Ключ найден':'⚿ Найдите ключ')+'</div></div>'+
 '<div class="dungeon-board"><div class="dungeon-border"><div class="maze">'+r.tiles.map(activeTileView).join('')+'</div></div></div>'+
 '<div class="dungeon-footer">'+
 '<div class="dungeon-encounter">'+footer+'</div>'+summon+
 (r.portalReady?'<button class="btn gold wide" data-action="safe-portal">◈ Безопасный портал · вернуться на базу</button>':'')+
 '<div class="dungeon-buttons">'+
 '<button class="dungeon-action special" data-action="skill" '+(turns<skill.turns?'disabled':'')+'><span>'+skill.icon+'</span><small>'+skill.name+'</small></button>'+
 '<button class="dungeon-action" data-action="spell-modal"><span>✣</span><small>Магия</small></button>'+
 '<button class="dungeon-action" data-action="potion" '+(r.potions?'':'disabled')+'><span>✚</span><small>Зелье '+r.potions+'</small></button>'+
 '<button class="dungeon-action" data-action="wait"><span>⧖</span><small>Пропустить</small></button>'+
 '<button class="dungeon-action" data-action="battle-log"><span>▤</span><small>Журнал</small></button></div></div></div>';
}
function gearSlotButton(slot){
 var it=equippedItem(slot);
 return '<button class="gear-slot '+(it?'r'+it.rarity:'empty-slot')+'" data-action="inspect-slot" data-id="'+slot+'" aria-label="'+esc(SLOT[slot])+'">'+
  window.CryptArt.item(slot,it?it.rarity:0)+
  '<span>'+SLOT[slot]+'</span>'+(it&&it.plus?'<i>+'+it.plus+'</i>':'')+'</button>';
}
function renderHero(){
 var c=C[r.class],st=stats();
 var left=['helm','shoulders','armor','gloves'];
 var right=['weapon','belt','legs','boots','relic'];
 var statsHtml='<div class="statlist">'+
  '<span>Здоровье</span><b>'+r.hp+' / '+st.hp+'</b><span>Мана</span><b>'+r.mp+' / '+st.mp+'</b>'+
  '<span>Атака</span><b>'+st.atk+'</b><span>Броня</span><b>'+st.def+'</b>'+
  '<span>Мощь магии</span><b>'+st.pow+'</b><span>Крит. шанс</span><b>'+st.crit+'%</b>'+
  '<span>Уклонение</span><b>'+st.dodge+'%</b><span>Щит</span><b>'+r.shield+'</b></div>';
 return section('Экипировка',c.type)+
 frame('ГЕРОЙ И ПРЕДМЕТЫ','<div class="gear-layout">'+
  '<div class="gear-slots gear-left">'+left.map(gearSlotButton).join('')+'</div>'+
  '<div class="gear-center"><div class="gear-portrait">'+window.CryptArt.hero(r.class,r.fxUntil>Date.now()?r.fx:null)+'</div>'+
   '<div class="gear-hero-name">'+c.name+'</div><small>'+c.title+'</small></div>'+
  '<div class="gear-slots gear-right">'+right.map(gearSlotButton).join('')+'</div></div>'+
  '<p class="fine muted space-top">Нажмите ячейку экипировки, чтобы открыть сумку с подходящими предметами.</p>')+
 frame('ХАРАКТЕРИСТИКИ',statsHtml)+
 frame('АКТИВНЫЕ КОМПЛЕКТЫ',Object.entries(CR.counts(r.equip,r.items)).filter(function(e){return e[1]>0;}).map(function(e){
  var set=CR.setDefinition(e[0]),desc=CR.descriptions(e[0]);
  return '<div class="set-status"><strong>'+esc(set?set.name:e[0])+' · '+e[1]+'/8</strong>'+
   desc.map(function(t,i){return '<small class="'+(e[1]>=[2,4,6][i]?'set-on':'')+'">'+t+'</small>';}).join('')+'</div>';
 }).join('')||'<p class="fine muted">Соберите хотя бы две части одного комплекта.</p>')+
 '<button class="btn gold wide space-top space-bottom" data-action="hero-stats" data-id="'+r.class+'">✥ Постоянное развитие '+C[r.class].name+'</button>'+frame('ОТРЯД И ПУТЬ','<div class="kpis"><div><b>'+r.floor+'</b><small>Этаж</small></div><div><b>'+r.kills+'</b><small>Убийств</small></div><div><b>'+r.secrets+'</b><small>Тайн</small></div></div>'+
 (r.summon?'<p class="fine golden space-top">☠ Ваш скелет: '+r.summon.hp+' HP, '+r.summon.atk+' ATK</p>':'')+
 '<button class="btn alt wide space-top" data-action="camp">Память предков</button>')+
 '<div class="btnrow"><button class="btn dark wide" data-action="abandon">Завершить забег</button></div>';
}
function manaCost(sp){return Math.max(1,sp.cost-bonus('manaDiscount'));}
function spellValid(sp){
 if(r.mp<manaCost(sp))return 'Недостаточно маны';
 if((r.scrolls[sp.id]||0)<1)return 'Нет свитков';
 if(['attack','burn','stun','chain','drain'].indexOf(sp.kind)>=0&&!enemies().length)return 'Нет цели';
 if(sp.kind==='reveal'&&!r.tiles.some(function(t){return CR.exploreStatus(t,r.tiles).ok;}))return 'Нет доступных плит';
 return null;
}
function renderSpells(){
 var cards=SPELLS.map(function(sp){
  var error=spellValid(sp);
  return '<button class="spell-card" data-action="cast" data-id="'+sp.id+'" '+(error?'disabled':'')+'>'+
  '<span class="spell-icon">'+sp.icon+'</span><h4>'+sp.name+'</h4><p>'+sp.description+'</p><small>◈ '+manaCost(sp)+' маны · свитков '+(r.scrolls[sp.id]||0)+'</small></button>';
 }).join('');
 return section('Книга магии','Мощь '+stats().pow)+
 frame('ПЕЧАТИ И СВИТКИ','<div class="spell-list">'+cards+'</div>')+
 frame('ПРАВИЛА МАГИИ','<p class="fine muted">Заклинания тратят ману, свиток и один ход. Враждебные заклинания направляются в первое найденное живое чудовище. Свитки можно найти в сундуках, купить у странствующего торговца и получить за загадки.</p>');
}
function renderTalents(){
 var names=['БИТВА','МАГИЯ','ПРИКЛЮЧЕНИЕ'],icons=['⚔','✣','✥'],tree=clamp(r.treeView||0,0,2);
 var treeButtons=names.map(function(n,i){return '<button class="tree-tab '+(tree===i?'current':'')+'" data-action="tree" data-id="'+i+'">'+icons[i]+' '+n+'</button>';}).join('');
 var tiers=['ПОСВЯЩЕНИЕ','ВЫБОР ПУТИ','СПЕЦИАЛИЗАЦИЯ','ВЕЛИКИЙ ТИТУЛ','ВЕНЕЦ ПУТИ'];
 var progress=0;
 var ranks=tiers.map(function(tier,i){
  var nodes=talentsByTree(tree).filter(function(t){return t.rank===i;});
  return '<div class="tree-tier">'+
   '<div class="tree-tier-label"><span>СТУПЕНЬ '+(i+1)+' · '+tier+'</span></div>'+
   '<div class="tree-nodes tier-'+i+'">'+nodes.map(function(t){
    var current=lvl(t.id),cost=levelCost(t),ok=talentUnlocked(t),can=current<3&&r.ep>=cost&&ok;
    if(current>0)progress++;
    return '<button class="title-node '+(current?'learned ':'')+(!ok?'locked ':'')+
      (current===3?'maxed':'')+'" data-action="talent" data-id="'+t.id+'" '+(can?'':'disabled')+'>'+
      '<span class="title-glyph">'+t.icon+'</span><strong>'+t.name+'</strong>'+
      '<small>'+t.desc+'</small><em>'+(current===3?'МАКС · 3/3':current+'/3 · '+cost+' ✧')+'</em>'+
      (!ok?'<span class="need-title">'+(talentPathConflict(t)?'Путь закрыт':'Нужен: '+esc((TALENTS.find(function(p){return p.id===t.parent;})||{}).name||'?'))+'</span>':'')+'</button>';
   }).join('')+'</div></div>';
 }).join('');
 return section('Пути титулов','✧ '+r.ep)+
 '<div class="tree-choice">'+treeButtons+'</div>'+
 '<div class="title-tree-info"><div><strong>'+names[tree]+'</strong><small>5 ступеней · 15 титулов · 3 улучшения каждого</small></div>'+
  '<span>'+progress+'/15</span></div>'+
 '<p class="fine muted space-bottom">Титулы универсальные. Для '+C[r.class].name+' основная ветка '+names[r.class==='necromancer'?1:r.class==='executioner'?0:2]+': её развитие дешевле остальных.</p>'+ '<div class="title-tree">'+ranks+'</div>'+
 '<p class="fine muted center">Развивайте один из доступных путей, затем выбирайте ответвления. На каждой развилке можно выбрать только один путь.</p>';
}

function statName(k){return {atk:'Атака',def:'Броня',hp:'Здоровье',mp:'Мана',pow:'Магия',crit:'Крит %'}[k];}
function gearComparison(slot,selectedId){
 var current=equippedItem(slot),candidate=item(selectedId);
 if(candidate&&candidate.slot!==slot)candidate=null;
 var available=r.items.filter(function(it){return it.slot===slot;}).sort(function(a,b){return b.rarity-a.rarity||b.floor-a.floor;});
 if(!candidate)candidate=available.find(function(it){return !equipped(it.id);})||current||available[0]||null;
 r.inspectSlot=slot;r.inspectItem=candidate?candidate.id:null;
 var compareKeys=['atk','def','hp','mp','pow','crit'].filter(function(k){return current&&current[k]||candidate&&candidate[k];});
 function card(title,i,other,side){
  var img=i?window.CryptArt.item(i.slot,i.rarity):window.CryptArt.item(slot,0);
  var html='<div class="gear-compare-card '+side+'"><div class="gear-compare-title">'+title+'</div><div class="gear-compare-icon">'+img+'</div>'+
   '<strong class="'+(i?'c'+i.rarity:'muted')+'">'+(i?esc(i.name)+(i.plus?' +'+i.plus:''):'Нет предмета')+'</strong>'+
   '<small>'+(i?(i.setName||RARITY[i.rarity])+' · +'+i.plus:'Ячейка свободна')+'</small>';
  for(var k of compareKeys){
   var val=i?(i[k]||0):0,oldVal=other?(other[k]||0):0,delta=side==='current'?oldVal-val:val-oldVal;
   var lost=side==='current'&&val>0&&oldVal===0,positive=side==='new'&&delta>0;
   var negative=side==='new'&&delta<0;
   var deltaTxt=(side==='current'&&delta!==0)?'<em class="'+(delta>0?'positive':'negative')+'">'+(delta>0?'+':'')+delta+'</em>':
    side==='new'&&delta!==0?'<em class="'+(delta>0?'positive':'negative')+'">'+(delta>0?'+':'')+delta+'</em>':'';
   html+='<div class="gear-compare-stat'+(lost?' stat-lost':'')+(negative?' stat-negative':'')+(positive?' stat-better':'')+'">'+
     '<span>'+statName(k)+'</span><b>'+(val?'+'+val:'—')+'</b>'+deltaTxt+'</div>';
  }
  return html+'</div>';
 }
 var oldGear=current,selected=candidate;
 var list=available.map(function(it){
   return '<button class="item r'+it.rarity+(selected&&it.id===selected.id?' selected':'')+'" data-action="modal-select" data-id="'+it.id+'">'+
   (equipped(it.id)?'<span class="equipped-tag">НАДЕТО</span>':'')+
   window.CryptArt.item(it.slot,it.rarity)+'<span>'+esc(it.name)+(it.plus?' +'+it.plus:'')+'</span></button>';
 }).join('');
 var canSelect=selected&&!equipped(selected.id);
 var nextEquip=Object.assign({},r.equip);
 if(selected)nextEquip[slot]=selected.id;
 var setCounts=CR.counts(nextEquip,r.items);
 var setHelp=selected&&selected.setId?
  '<div class="compact-set-help"><b>Комплект: '+esc(selected.setName)+' · '+(setCounts[selected.setId]||0)+'/8</b>'+
  CR.descriptions(selected.setId).map(function(txt,i){
   var need=[2,4,6][i],active=(setCounts[selected.setId]||0)>=need;
   return '<small class="'+(active?'set-on':'')+'">'+(active?'✓ ':'○ ')+txt+'</small>';
  }).join('')+'</div>':'<div class="fine muted compact-set-help">Оружие имеет собственный фиксированный эффект.</div>';
 var cost=selected?upgradeCost(selected):0;
 dialog('<div class="subhead">ОСМОТР СНАРЯЖЕНИЯ · '+esc(SLOT[slot])+'</div><h2>СРАВНЕНИЕ</h2>'+
  '<div class="gear-two-columns">'+card('СЛЕВА · НАДЕТО',oldGear,selected,'current')+card('СПРАВА · ВЫБРАНО',selected,oldGear,'new')+'</div>'+
  setHelp+'<div class="gear-dialog-actions"><button class="btn small" data-action="modal-equip" '+(canSelect?'':'disabled')+'>Надеть</button>'+
  '<button class="btn alt small" data-action="modal-upgrade" '+(selected&&r.gold>=cost&&selected.plus<9?'':'disabled')+'>Заточить '+cost+' ◈</button>'+
  '<button class="btn dark small" data-action="modal-scrap" '+(canSelect?'':'disabled')+'>Разобрать</button></div>'+
  '<div class="frame-title gear-available-title">СУМКА · '+available.length+' ПРЕДМ.</div>'+
  '<div class="gear-picker">'+(list||'<p class="fine muted">В этом слоте пока нет предметов.</p>')+'</div>'+
  '<button class="btn alt wide space-top" data-action="close">Вернуться без смены экипировки</button>');
}
function magicDialog(){
 var spellGrid=SPELLS.map(function(sp){
  var disabled=spellValid(sp);
  return '<button class="spell-card" data-action="cast-modal" data-id="'+sp.id+'" '+(disabled?'disabled':'')+'>'+
    '<span class="spell-icon">'+sp.icon+'</span><h4>'+sp.name+'</h4>'+
    '<p>'+sp.description+'</p><small>'+manaCost(sp)+' МН · свитков '+(r.scrolls[sp.id]||0)+'</small></button>';
 }).join('');
 dialog('<div class="subhead">КНИГА МАГИИ · НЕ ПОКИДАЯ ЭТАЖ</div><h2>ЗАКЛИНАНИЯ</h2>'+
  '<p class="fine muted">Использование заклинания расходует один ход.</p><div class="spell-list scroll-spells">'+spellGrid+'</div>'+
  '<button class="btn alt wide space-top" data-action="close">Назад к лабиринту</button>');
}

function itemGrid(items){
 return items.map(function(i){
  return '<button class="item r'+i.rarity+(r.bagSelected===i.id?' selected':'')+'" data-action="item-select" data-id="'+i.id+'">'+
   (equipped(i.id)?'<span class="equipped-tag">НАДЕТО</span>':'')+
    window.CryptArt.item(i.slot,i.rarity)+
  '<span>'+esc(i.name)+(i.plus?' +'+i.plus:'')+'</span></button>';
 }).join('');
}
function compareStat(it,other,key){
 var v=it[key]||0,a=other?(other[key]||0):0,d=v-a;
 return '<div class="compare-row"><span>'+({atk:'Атака',def:'Броня',hp:'HP',mp:'MP',pow:'Магия',crit:'Крит %'})[key]+'</span>'+
 '<span>'+(other?a:'—')+'</span><b>'+v+'</b><em class="'+(d>0?'up':d<0?'down':'even')+'">'+(d>0?'+':'')+d+'</em></div>';
}
function renderBag(){
 var categories=['all'].concat(Object.keys(SLOT)),filter=r.bagFilter||'all';
 var filtered=r.items.filter(function(i){return filter==='all'||i.slot===filter;})
  .slice().sort(function(a,b){return Number(equipped(b.id))-Number(equipped(a.id))||b.rarity-a.rarity||b.floor-a.floor;});
 var selected=item(r.bagSelected);
 if(selected&&filter!=='all'&&selected.slot!==filter)selected=null;
 if(!selected&&filtered.length){selected=filtered[0];r.bagSelected=selected.id;}
 var quick=categories.map(function(key){return '<button data-action="bag-filter" data-id="'+key+'" class="bag-filter '+(filter===key?'active':'')+'">'+(key==='all'?'ВСЕ':SLOT[key])+'</button>';}).join('');
 var comparison='';
 if(selected){
  var current=equippedItem(selected.slot);
  comparison='<div class="compare-layout"><div class="compare-visual">'+window.CryptArt.item(selected.slot,selected.rarity)+'</div>'+
   '<div class="compare-text"><h3 class="c'+selected.rarity+'">'+esc(selected.name)+(selected.plus?' +'+selected.plus:'')+'</h3>'+
   '<div class="fine muted">'+RARITY[selected.rarity]+' · '+SLOT[selected.slot]+
   (equipped(selected.id)?' · НАДЕТО':'')+'</div></div></div>'+
   '<div class="compare-head"><span>ПАРАМЕТР</span><span>НАДЕТО</span><span>НОВОЕ</span><span>РАЗНИЦА</span></div>'+
   ['atk','def','hp','mp','pow','crit'].map(function(k){return compareStat(selected,current,k);}).join('')+
   '<div class="btnrow space-top"><button class="btn" data-action="equip" data-id="'+selected.id+'" '+(equipped(selected.id)?'disabled':'')+'>Надеть</button>'+
   '<button class="btn alt" data-action="upgrade" data-id="'+selected.id+'" '+(r.gold<upgradeCost(selected)||selected.plus>=9?'disabled':'')+'>Заточить '+upgradeCost(selected)+' ◈</button>'+
   '<button class="btn dark" data-action="scrap" data-id="'+selected.id+'" '+(equipped(selected.id)?'disabled':'')+'>Разобрать</button></div>';
 }
  var quests=(r.questItems||[]).map(function(q){return '<div class="reward-entry">✥ '+esc(q)+'</div>';}).join('');
 var souls=(r.soulBag||[]).map(function(sp){return '<div class="row space-bottom"><b>'+esc(sp.name)+'</b>'+
 '<button class="btn small" data-action="consume-soul" data-id="'+sp.id+'">Использовать · 1 ход</button></div>';}).join('');
 var notes=(r.journalNotes||[]).slice(-8).map(function(x){return '<div class="reward-entry">'+esc(x)+'</div>';}).join('');
 return section('Инвентарь',r.items.length+'/30')+
 '<div class="bag-filter-scroll">'+quick+'</div>'+
 frame('СНАРЯЖЕНИЕ ДЛЯ ВЫБОРА',filtered.length?'<div class="grid4">'+itemGrid(filtered)+'</div>':'<div class="empty">Предметов в этом слоте пока нет.</div>')+
 frame('СРАВНЕНИЕ СНАРЯЖЕНИЯ',comparison||'<div class="empty">Выберите предмет в сумке.</div>')+
 frame('ПРИПАСЫ','<div class="kpis"><div><b>'+r.potions+'</b><small>Эликсиров</small></div>'+
 '<div><b>'+Object.values(r.scrolls).reduce(function(a,b){return a+b;},0)+'</b><small>Свитков</small></div>'+
 '<div><b>'+r.gold+'</b><small>Монет</small></div></div>'+
 '<button class="btn alt wide space-top" data-action="potion" '+(r.potions?'':'disabled')+'>Выпить эликсир (+45% HP)</button>')+
 frame('КВЕСТОВЫЕ ПРЕДМЕТЫ',quests||'<p class="fine muted">Печати локаций ещё не найдены.</p>')+
 frame('СОБРАННЫЕ ДУШИ',souls||'<p class="fine muted">Пока нет душ.</p>')+
 frame('НАЙДЕННЫЕ ЗАПИСКИ',notes||'<p class="fine muted">Пока нет записей.</p>');
}
function renderMenu(){
 return '<div class="emblem">✥</div><div class="subhead">ПРИВАЛ МЕЖДУ ТЕНЯМИ</div><h2>ЭКСПЕДИЦИЯ</h2>'+
 '<p>Игра работает без интернета. Автосохранение остаётся на этом устройстве.</p>'+
 '<button class="btn wide space-top" data-action="close">Продолжить спуск</button>'+
 '<button class="btn gold wide space-top" data-action="chronicles">✥ Хроники, реликвии, испытания</button>'+
 '<button class="btn alt wide space-top" data-action="camp">Постоянное развитие героев</button>'+ '<button class="btn alt wide space-top" data-action="town">⚒ Поселение</button>'+
 '<button class="btn dark wide space-top" data-action="abandon">Завершить забег</button>';
}


/* Persistent town / three-location expedition boundary. */
function bankExpeditionLoot(fraction){
 var keep=fraction==null?1:Math.max(0,Math.min(1,fraction));
 var summary={resources:0,diamonds:0};
 if(!r)return summary;
 for(var name of Object.keys(r.materials||{})){
  var amount=Math.floor(Math.max(0,r.materials[name]||0)*keep);
  if(amount>0){s.meta.materials[name]=(s.meta.materials[name]||0)+amount;summary.resources+=amount;}
 }
 r.materials={};
 if(keep===1&&r.diamonds>0){s.meta.diamonds=(s.meta.diamonds||0)+r.diamonds;summary.diamonds=r.diamonds;}
 r.diamonds=0;
 return summary;
}
function salvageExpedition(expedition){
 if(!expedition)return 0;
 var gain=(expedition.items||[]).reduce(function(total,it){return total+1+(it.rarity||0)+(it.plus||0);},0);
 s.meta.materials['Металлолом']=(s.meta.materials['Металлолом']||0)+gain;
 return gain;
}

function awardAchievement(key,diamonds){
 if(s.meta.achievements[key])return 0;
 s.meta.achievements[key]=true;s.meta.rainbowDiamonds=(s.meta.rainbowDiamonds||0)+diamonds;
 return diamonds;
}
function safePortal(){
 if(!r||!r.portalReady||!isBossFloor()||!r.bossClears[r.floor]){toast('Безопасный портал открывается только после победы над боссом.');return;}
 var oldName=currentRegion().name,oldAct=r.actIndex,oldLocation=r.locationIndex;
 var locKey='act'+(oldAct+1)+'-location'+(oldLocation+1);
 var rainbow=awardAchievement(locKey+'-first-boss',1);
 if(r.bossClears[50])rainbow+=awardAchievement(locKey+'-deep-50',2);
 var loot=bankExpeditionLoot(1),scrap=0;
 s.meta.best=Math.max(s.meta.best,r.floor);
 if(oldLocation<2){
  var carry=JSON.parse(JSON.stringify(r));
  carry.locationIndex=oldLocation+1;carry.floor=1;carry.tiles=[];carry.heroTile=null;carry.portalReady=false;
  carry.bossClears={};carry.key=false;carry.summon=null;carry.summonTile=null;carry.chamberActive=null;carry.shield=0;
  carry.poisonTurns=0;carry.blessed=0;carry.log=[];
  s.meta.activeExpedition=carry;
 }else{
  scrap=salvageExpedition(r);
  rainbow+=awardAchievement('act'+(oldAct+1)+'-complete',3);
  s.meta.completedActs[oldAct]=(s.meta.completedActs[oldAct]||0)+1;
  s.meta.unlockedAct=Math.max(s.meta.unlockedAct,Math.min(DN.acts.length-1,oldAct+1));
  s.meta.activeExpedition=null;
  s.meta.runs++;
 }
 s.run=null;r=null;save();draw();
 dialog('<div class="emblem">◈</div><h2>'+(oldLocation===2?'Подземелье завершено':'Безопасное возвращение')+'</h2>'+
 '<p>Покинута локация «'+esc(oldName)+'». На склад сдано '+loot.resources+' ресурсов и '+loot.diamonds+' алмазов.</p>'+ (rainbow?'<p class="golden">Достижения: +'+rainbow+' радужных алмазов (одноразово).</p>':'')+
 (oldLocation<2?'<p>Таланты, предметы, золото, свитки и записи сохранены. Следующая локация начнётся после отдыха на базе.</p>'+
 '<button class="btn wide" data-action="resume-expedition">Продолжить экспедицию</button>':
 '<p>Все три локации пройдены. Временное снаряжение разобрано: +'+scrap+' металлолома.</p>'+
 '<button class="btn wide" data-action="close">Вернуться на базу</button>'));
}
function resumeExpedition(){
 var carry=s.meta.activeExpedition;
 if(r||!carry)return;
 if(!DN.location(carry.actIndex,carry.locationIndex)){toast('Ошибка следующей локации.');return;}
 r=s.run=carry;s.meta.activeExpedition=null;
 r.floor=1;r.portalReady=false;r.bossClears={};r.key=false;r.summon=null;r.summonTile=null;
 r.materials={};r.diamonds=0;r.tiles=[];r.chamberActive=null;r.fx=null;
 r.hp=Math.min(stats().hp,Math.max(1,r.hp+Math.floor(stats().hp*.35)));
 r.mp=Math.min(stats().mp,r.mp+Math.floor(stats().mp*.35));
 startFloor();save();draw();close();
 toast('Экспедиция продолжается: '+maxFloorLabel());
}
function scrapStoredItem(id){
 var exp=s.meta.activeExpedition;if(!exp)return;
 var it=exp.items.find(function(x){return x.id===Number(id);});
 if(!it||Object.values(exp.equip).includes(it.id)){toast('Сначала снимите надетую вещь в экспедиции.');return;}
 var n=1+(it.rarity||0)+(it.plus||0);
 s.meta.materials['Металлолом']=(s.meta.materials['Металлолом']||0)+n;
 exp.items=exp.items.filter(function(x){return x.id!==it.id;});
 save();draw();toast('Разобран '+it.name+': +'+n+' металлолома.');
}
function endStoredExpedition(){
 if(!s.meta.activeExpedition)return;
 var scrap=salvageExpedition(s.meta.activeExpedition);
 s.meta.activeExpedition=null;
 s.meta.runs++;save();draw();close();toast('Экспедиция завершена. Получено '+scrap+' металлолома.');
}
function selectAct(id){
 var n=Number(id);
 if(!Number.isInteger(n)||n<0||n>=DN.acts.length)return;
 if(n>s.meta.unlockedAct){toast('Сначала завершите предыдущий акт.');return;}
 if(s.meta.activeExpedition){
  if(s.meta.activeExpedition.actIndex===n){resumeExpedition();return;}
  s.meta.pendingActChoice=n;
  dialog('<h2>Сменить подземелье?</h2><p>Текущая экспедиция будет завершена, а оставшиеся временные предметы автоматически разобраны.</p>'+
   '<button class="btn wide" data-action="confirm-switch-act">Разобрать и перейти</button>'+
   '<button class="btn alt wide" data-action="close">Отмена</button>');return;
 }
 s.meta.selectedAct=n;save();choose();
}
function renderBase(){
 var exp=s.meta.activeExpedition;
 var acts=DN.acts.map(function(a,i){
  var unlocked=i<=s.meta.unlockedAct,done=(s.meta.completedActs[i]||0)>0;
  var current=exp&&exp.actIndex===i;
  return '<div class="meta-upgrade"><div><strong>'+(done?'✓ ':'')+(i+1)+'. '+esc(a.name)+'</strong>'+
   '<small>'+a.locations.map(function(l){return esc(l.name);}).join(' · ')+'</small><small>'+esc(a.story||'')+'</small></div>'+
   '<button class="btn small" data-action="select-act" data-id="'+i+'" '+(!unlocked?'disabled':'')+'>'+
   (current?'Продолжить':unlocked?'Войти':'Закрыто')+'</button></div>';
 }).join('');
 var salvage=exp?exp.items.filter(function(i){return !Object.values(exp.equip).includes(i.id);}).slice(0,24).map(function(i){
  return '<div class="row space-bottom"><span>'+esc(i.name)+'</span><button class="btn small" data-action="scrap-stored-item" data-id="'+i.id+'">Разобрать</button></div>';
 }).join(''):'';
 var pending=exp?frame('ОТДЫХ МЕЖДУ ЛОКАЦИЯМИ','<p><b>'+esc(DN.acts[exp.actIndex].name)+'</b> · следующая локация '+(exp.locationIndex+1)+'/3 — '+esc(DN.location(exp.actIndex,exp.locationIndex).name)+'</p>'+
 '<p>Сохранены временные вещи, таланты, золото и свитки. Найденные ресурсы уже на складе.</p>'+
 '<button class="btn gold wide" data-action="resume-expedition">Продолжить после отдыха</button>'+
 (salvage?'<div class="frame-title space-top">Разобрать ненужные вещи</div>'+salvage:'')+
 '<button class="btn dark wide space-top" data-action="discard-expedition">Завершить текущую экспедицию</button>'):'';
 return section('Деревня и экспедиции','10 подземелий · 30 локаций')+
 '<div class="scene">'+window.CryptArt.room(0,1)+'<div class="banner-label">Место отдыха между походами.</div></div>'+
 pending+frame('ПОДЗЕМЕЛЬЯ',acts)+
 frame('ПОСТОЯННЫЕ НАКОПЛЕНИЯ','<div class="kpis"><div><b>'+(s.meta.diamonds||0)+'</b><small>Алмазы</small></div>'+
 '<div><b>'+(s.meta.rainbowDiamonds||0)+'</b><small>Радужные</small></div>'+
 '<div><b>'+materialCount()+'</b><small>Материалы</small></div></div>'+
 '<button class="btn alt wide space-top" data-action="town">Деревня и склад</button>')+
 frame('ХРОНИКИ', '<div class="kpis"><div><b>'+s.meta.runs+'</b><small>Экспедиций</small></div><div><b>'+s.meta.best+'</b><small>Рекордный этаж</small></div>'+
 '<div><b>'+s.meta.souls+'</b><small>Память</small></div></div><button class="btn alt wide space-top" data-action="camp">Улучшения героев</button>');
}
function draw(){
 if(!s)return;
 hud();if(!r){$('content').classList.remove('dungeon-mode');$('content').innerHTML=renderBase();return;}
 $('content').classList.toggle('dungeon-mode',r.tab==='maze');
 $('content').innerHTML=r.tab==='maze'?renderMaze():r.tab==='hero'?renderHero():r.tab==='spells'?renderSpells():r.tab==='talents'?renderTalents():renderBag();
}
function toast(msg){
 var el=$('toast');el.textContent=msg;el.classList.add('shown');
 clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('shown');},2400);
}
function dialog(content){$('overlay').innerHTML='<div class="veil"><div class="dialog">'+content+'</div></div>';}
function close(){$('overlay').innerHTML='';if(r)r.chamberActive=null;}
function choose(){
 var opts=Object.keys(C).map(function(k){
  var c=C[k];return '<button class="class-option" data-action="begin" data-id="'+k+'">'+window.CryptArt.hero(k)+
 '<span><strong>'+c.icon+' '+c.name+'</strong><small>'+c.description+'</small></span></button>';
 }).join('');
 dialog('<div class="emblem">✥</div><div class="subhead">ПЕПЕЛЬНЫЙ ЛАБИРИНТ · 0.4</div><h2>ВЫБОР ПУТИ</h2>'+
 '<p>Выбранное подземелье: <b>'+esc(DN.acts[s.meta.selectedAct||0].name)+'</b>. Начните первую локацию экспедиции.</p>'+opts+
 '<p class="fine muted">Скрытые клетки · Пошаговый бой · Магия · Призыв · Древа титулов</p>'+
 '<button class="btn dark wide" data-action="close">Закрыть</button>');
}
function upgradeCost(i){return 9+(i.plus+1)*7+i.rarity*4;}
function consumeTurn(){
 if(!r)return false;
 r.turn++;
 if(r.blessed>0)r.blessed--;
 var alive=r.chamberActive!=null?[]:enemies();
 if(r.summon&&r.summon.hp>0&&alive.length){
  var victim=alive[0],hit=Math.max(1,r.summon.atk-victim.foe.def-Math.max(0,victim.foe.guard||0));
  r.summon.specialCooldown=Math.max(0,(r.summon.specialCooldown||4)-1);
  if(r.summon.specialCooldown===0){hit+=Math.max(3,Math.floor(r.summon.atk*.45));r.summon.specialCooldown=4;log('Скелет применяет «Гробовой раскол».');}
  victim.foe.hp-=hit;log('Скелет наносит '+hit+' урона: '+victim.foe.name+'.');
  if(victim.foe.hp<=0)kill(victim);
 }
 if(r.poisonTurns>0){r.poisonTurns--;var poison=Math.max(2,Math.floor(2+r.floor*.5));
  r.hp=Math.max(0,r.hp-poison);log('Яд: −'+poison+' HP.');}
 alive=r.chamberActive!=null?[]:enemies();
 alive.slice(0,4).forEach(function(t){
  var e=t.foe,special=e.skill||EX.monster(e.visual||e.id);
  if(e.stun>0){e.stun--;log(e.name+' оглушён.');return;}
  if(e.burn>0){e.burn--;e.hp-=Math.max(2,Math.floor(stats().pow*.48)+bonus('burnDamage')+setBonus('spellDamage')*.1);if(e.hp<=0){kill(t);return;}}
  if(e.poison>0){e.poison--;e.hp-=Math.max(2,Math.floor(stats().atk*.24));if(e.hp<=0){kill(t);return;}}
  var ready=false;
  if(e.ranged){
   e.attackCooldown=Math.max(0,(e.attackCooldown||3)-1);
   e.cooldown=e.attackCooldown||3;
   if(e.attackCooldown>0)return; // Ranged creature fires only every 3 turns.
   e.attackCooldown=3;e.cooldown=3;ready=true;
  }else{
   ready=(e.cooldown||special.every)<=1;
   e.cooldown=ready?special.every:(e.cooldown||special.every)-1;
  }
  var amount=Math.max(1,e.atk+rand(-2,2)-stats().def-bonus('damageFlat')-Math.floor(r.blessed));
  if(ready){
   log(e.name+' применяет «'+special.name+'».');
   if(special.kind==='bite')amount=Math.ceil(amount*1.65);
   if(special.kind==='guard')e.guard=3+Math.ceil(r.floor/5);
   if(special.kind==='curse')amount=Math.max(3,Math.ceil(e.atk*.95));
   if(special.kind==='double')amount=Math.max(2,amount*2);
   if(special.kind==='poison')r.poisonTurns=2;
   if(special.kind==='slam')amount=Math.ceil(amount*1.85);
   if(special.kind==='shot')amount=Math.max(2,Math.ceil(e.atk*.85));
  }
  if(Math.random()*100<stats().dodge){log('Уклонение от '+e.name+'.');return;}
  if(r.summon&&r.summon.hp>0&&Math.random()<.72){
   var summonDamage=Math.max(1,amount-(r.summon.def||0));
   r.summon.hp=Math.max(0,r.summon.hp-summonDamage);
   log('Скелет перехватывает '+summonDamage+' урона.');
   if(!r.summon.hp){log('Призванный скелет разрушен.');r.summon=null;r.summonTile=null;}
  }else{
   var taken=amount;if(r.shield>0){var absorb=Math.min(r.shield,taken);r.shield-=absorb;taken-=absorb;}
   r.hp=Math.max(0,r.hp-taken);
   if(taken)log(e.name+' наносит '+taken+' урона.');
  }
  var counter=bonus('thorns')+(Math.random()*100<bonus('reflect')?Math.max(1,Math.floor(stats().atk*.45)):0);
  if(counter>0&&e.hp>0){e.hp-=counter;log('Ответный урон: '+counter+'.');if(e.hp<=0)kill(t);}
 });
 if(r.hp<=0){die();return false;}
 return true;
}
function kill(t){
 var e=t.foe;if(!e||e.hp>0)return;
 e.hp=0;t.cleared=false;r.kills++;r.ep+=e.ep;
 s.meta.bestiary[e.id]=(s.meta.bestiary[e.id]||0)+1;
 r.hp=Math.min(stats().hp,r.hp+bonus('killHeal')+setBonus('killHeal'));
 var drop={key:!!t.hasKey,gold:e.gold,gear:null,scroll:null,potion:0,materials:[],soul:null};
 if((e.boss||e.id&&e.elite)&&lvl('magnate')>0)drop.soul={kind:'elite',name:'Душа '+e.name};
 else if(!e.boss&&lvl('merchant')>0&&Math.random()<Math.min(.72,.12*lvl('merchant')))drop.soul={kind:'common',name:'Душа '+e.name};
 for(var source of (e.loot||[])){
  if(Math.random()*100<source.chance)drop.materials.push({name:source.name,qty:rand(source.min,source.max)});
 }
 if(e.boss){
  r.bossClears[r.floor]=true;r.portalReady=true;
  var q=currentRegion().questItem;
  if(q&&r.questItems.indexOf(q)<0){r.questItems.push(q);log('Получен квестовый предмет: '+q+'.');}
  drop.diamonds=Math.max(1,Math.floor(depthMultiplier()*(1+Math.floor((r.actIndex||0)/3))));
  log('Босс повержен! Безопасный портал открыт на этом этаже.');
  drop.gear={slot:pick(Object.keys(SLOT)),rarity:Math.max(2,rarityRoll())};
  drop.potion=1;drop.relic=EX.relicForFloor(r.floor).id;
  r.ep+=4;s.meta.bossKills=(s.meta.bossKills||0)+1;
 }
 else {
  if(Math.random()<.23+bonus('lootChance')*.01){drop.gear={slot:pick(Object.keys(SLOT)),rarity:rarityRoll()};}
  else if(Math.random()<.33){drop.scroll=pick(SPELLS).id;}
 }
 t.drops=drop;
 if(drop.key)log('Ключник повержен! На полу лежит ключ от лестницы.');
 log('Победа: '+e.name+' · +'+e.ep+(e.boss?' (+4)':'')+' ✧. Награды остались на клетке.');
 if(!r.floorCleared&&hiddenEnemies().length===0){
  r.floorCleared=true;
  var opened=0;
  r.tiles.forEach(function(t){
   if(!t.revealed&&t.kind!=='secret'&&t.kind!=='chamber'){
    t.revealed=true;if(t.kind==='empty')t.cleared=true;opened++;
   }
  });
  var bonusGold=Math.max(1,Math.round(6*depthMultiplier()));addGold(bonusGold);
  log('Полная зачистка: '+opened+' обычных клеток раскрыто, +'+bonusGold+' монет.');
 }
}
function strike(tid){
 if(r){r.fx='attack';r.fxUntil=Date.now()+420;}
 var t=tile(tid),st=stats();if(!t||!t.revealed||!t.foe||t.foe.hp<=0)return;
 var critical=Math.random()*100<st.crit;
 var amount=Math.max(1,st.atk+rand(0,3)-t.foe.def-(t.foe.guard||0));
 t.foe.guard=0;
 if(t.foe.boss)amount=Math.floor(amount*(1+(bonus('bossDamage')+setBonus('bossDamage'))*.01));
 if(critical)amount=Math.floor(amount*(1.6+(bonus('critDamage')+setBonus('critDamage'))*.01));
 t.foe.hp-=amount;
 var glove=equippedItem('gloves');
 if(glove&&glove.stormCharge&&t.foe.hp>0&&Math.random()<.25){
  var spark=Math.max(4,Math.ceil(st.pow*.7)+2);
  t.foe.hp-=spark;log('Грозовая перчатка выпускает разряд: '+spark+' магического урона.');
 }
 log('Удар по '+t.foe.name+': '+amount+(critical?' КРИТ!':'')+'.');
 if(t.foe.hp<=0)kill(t);
 finishAction();
}
function finishAction(){if(!r)return;consumeTurn();if(r){draw();save();
  if(r.fx&&r.fxUntil>Date.now()){setTimeout(function(){if(r&&Date.now()>=r.fxUntil){r.fx=null;draw();}},460);}
 }}
var SKILLS={
 necromancer:{name:'Призвать скелета',icon:'☠',cost:8,turns:5},
 executioner:{name:'Казнящий удар',icon:'⚔',cost:4,turns:4},
 scout:{name:'Разведка',icon:'◉',cost:6,turns:5},
 sorceress:{name:'Грозовое эхо',icon:'ϟ',cost:9,turns:5},
 guardian:{name:'Нерушимый удар',icon:'♜',cost:6,turns:4},
 assassin:{name:'Ядовитый клинок',icon:'☽',cost:5,turns:4}
};
function useSkill(){
 var skill=SKILLS[r.class];
 if(r.turn-r.skillUsed<skill.turns){toast('Умение восстанавливается.');return;}
 if(r.mp<skill.cost){toast('Нужно '+skill.cost+' маны.');return;}
 var t=target(),st=stats(),damage=0;
 if(r.class==='necromancer'){
  var creature={name:'Костяной страж',def:2,specialCooldown:4,
   maxHp:32+Math.floor(st.pow*.9)+14*lvl('ritual')+bonus('summonHp')+EX.mastery(s.meta,r.class)*9,
   hp:32+Math.floor(st.pow*.9)+14*lvl('ritual')+bonus('summonHp')+EX.mastery(s.meta,r.class)*9,
   atk:5+Math.floor(st.pow*.35)+4*lvl('ritual')+bonus('summonAtk')+EX.mastery(s.meta,r.class)*3};
  var previous=r.summon,oldTile=r.summonTile;
  r.summon=creature;r.summonTile=null;
  if(!placeSummon()){r.summon=previous;r.summonTile=oldTile;toast('Свободных клеток для призыва нет.');return;}
  log('Призван костяной страж на клетку '+r.summonTile+'.');
 }else if(r.class==='executioner'){
  if(!t){toast('Нужен открытый враг.');return;}
  damage=Math.max(3,Math.floor(st.atk*2.1)-t.foe.def);
  t.foe.hp-=damage;r.shield+=Math.floor(st.def*1.8)+7;
  log('Казнь: '+damage+' урона и защитная стойка.');
  if(t.foe.hp<=0)kill(t);
 }else if(r.class==='guardian'){
  r.shield+=12+Math.floor(st.def*2.2);
  if(t){damage=Math.max(3,Math.floor(st.atk*1.65)-t.foe.def);t.foe.hp-=damage;
   if(t.foe.hp<=0)kill(t);}
  log('Воительница получает крепкую защиту'+(damage?' и наносит '+damage+' урона.':'.'));
 }else if(r.class==='sorceress'){
  var targets=enemies().slice(0,4);if(!targets.length){toast('Нужен открытый враг.');return;}
  targets.forEach(function(enemy){var val=Math.max(3,Math.floor(st.pow*1.6)-enemy.foe.def);
   enemy.foe.hp-=val;if(enemy.foe.hp<=0)kill(enemy);});
  log('Грозовое эхо поражает '+targets.length+' врагов.');
 }else if(r.class==='assassin'){
  if(!t){toast('Нужен открытый враг.');return;}
  damage=Math.max(3,Math.floor(st.atk*1.35)-t.foe.def);
  t.foe.hp-=damage;t.foe.poison=3;
  log('Ядовитый клинок: '+damage+' урона, яд на три хода.');
  if(t.foe.hp<=0)kill(t);
 }else{
  var count=0;
  for(var i=0;i<3;i++){var candidates=r.tiles.filter(function(tile){return CR.exploreStatus(tile,r.tiles).ok;});
   if(!candidates.length)break;var cell=pick(candidates);
   cell.revealed=true;if(cell.kind==='empty')cell.cleared=true;count++;}
  addGold(4+r.floor*2);
  log('Лучник разведывает '+count+' доступных клеток.');
 }
 r.mp-=skill.cost;r.skillUsed=r.turn;r.fx='skill';r.fxUntil=Date.now()+440;
 finishAction();
}
function potion(){
 if(r.potions<1){toast('Эликсиры закончились.');return;}
 if(r.hp>=stats().hp){toast('Здоровье уже полное.');return;}
 r.potions--;var amount=Math.floor(stats().hp*.45);r.hp=Math.min(stats().hp,r.hp+amount);
 log('Выпит целебный эликсир: +'+amount+' HP.');finishAction();
}
function wait(){log('Вы затаились, собираясь с силами.');r.mp=Math.min(stats().mp,r.mp+1);finishAction();}
function cast(id){
 if(r){r.fx='skill';r.fxUntil=Date.now()+420;}
 var sp=SPELLS.find(function(x){return x.id===id;});if(!sp)return;
 var error=spellValid(sp);if(error){toast(error);return;}
 r.scrolls[id]--;r.mp-=manaCost(sp);
 var tar=target(),st=stats();
 var magic=Math.floor((sp.base+st.pow*1.45)*(1+(bonus('spellDamage')+setBonus('spellDamage'))*.01));
 if(sp.kind==='heal'){r.hp=Math.min(st.hp,r.hp+magic);log(sp.name+': восстановлено '+magic+' HP.');}
 else if(sp.kind==='shield'){r.shield+=magic;log('Магическая защита: '+magic+' щита.');}
 else if(sp.kind==='reveal'){
  var count=0;
  for(var j=0;j<sp.base;j++){
   var covered=r.tiles.filter(function(t){return CR.exploreStatus(t,r.tiles).ok;});
   if(!covered.length)break;
   var t=pick(covered);t.revealed=true;if(t.kind==='empty')t.cleared=true;count++;
  }
  log('Око забвения открыло '+count+' скрытых клеток.');
 }else if(sp.kind==='chain'){
  var victims=enemies().slice(0,3+bonus('chainTargets'));
  victims.forEach(function(t){var dmg=Math.max(1,magic+bonus('chainDamage')-t.foe.def);
   t.foe.hp-=dmg;if(t.foe.hp<=0)kill(t);});
  log('Раскаты грома поражают '+victims.length+' врагов.');
 }else if(tar){
  var dmg2=Math.max(1,magic-tar.foe.def);
  tar.foe.hp-=dmg2;
  if(sp.kind==='burn')tar.foe.burn=3;
  if(sp.kind==='stun')tar.foe.stun=1;
  if(sp.kind==='drain')r.hp=Math.min(st.hp,r.hp+Math.floor(dmg2*.65));
  log(sp.name+': '+dmg2+' магического урона.');
  if(tar.foe.hp<=0)kill(tar);
 }
 finishAction();
}
function rewardDialog(title,lines){
 dialog('<div class="emblem">✥</div><div class="subhead">ДОБЫЧА ПОДЗЕМЕЛЬЯ</div><h2>'+esc(title)+'</h2>'+
  '<div class="reward-rows">'+lines.map(function(line){return '<div class="reward-entry">'+line+'</div>';}).join('')+'</div>'+
  '<button class="btn wide space-top" data-action="close">ЗАБРАТЬ</button>');
}
function floatLoot(tileId,labels){
 if(!labels||!labels.length)return;
 var maze=document.querySelector?document.querySelector('.dungeon-board .maze'):null;
 if(!maze||!document.createElement)return;
 var pop=document.createElement('div');pop.className='pickup-float';
 pop.style.left=((Number(tileId)%5+.5)*20)+'%';
 pop.style.top=((Math.floor(Number(tileId)/5)+.48)*20)+'%';
 pop.textContent=labels.join('  ·  ');maze.appendChild(pop);
 setTimeout(function(){if(pop.parentNode)pop.parentNode.removeChild(pop);},1650);
}
function claimTile(t){
 if(!t||!t.revealed||t.cleared)return;
 var kind=t.kind,lines=[],labels=[],pending=t.drops||null;
 if(pending){
  if(pending.key){r.key=true;lines.push('<strong>⚿ Ключ от лестницы</strong>');labels.push('⚿ Ключ');}
  if(pending.gold){var found=addGold(pending.gold);lines.push('<strong>◈ '+found+' монет</strong>');labels.push('◈ +'+found);}
  if(pending.potion){r.potions+=pending.potion;lines.push('<strong>✚ '+pending.potion+' эликсир</strong>');labels.push('✚ Эликсир ×'+pending.potion);}
  if(pending.diamonds){r.diamonds=(r.diamonds||0)+pending.diamonds;labels.push('◇ Алмазы ×'+pending.diamonds);}
  if(pending.materials)for(var mat of pending.materials){
   var qty=Math.max(1,Math.round(mat.qty*depthMultiplier()));
   r.materials[mat.name]=(r.materials[mat.name]||0)+qty;
   labels.push(mat.name+' ×'+qty);
  }
  if(pending.soul){var spirit=addSpiritSoul(pending.soul);if(spirit){lines.push('<strong>☽ '+esc(spirit.name)+'</strong>');labels.push('☽ '+spirit.name);}}
  if(pending.scroll){r.scrolls[pending.scroll]=(r.scrolls[pending.scroll]||0)+1;
   var sp=SPELLS.find(function(x){return x.id===pending.scroll;});
   lines.push('<strong>✣ Свиток «'+esc(sp.name)+'»</strong>');labels.push('✣ '+sp.name+' ×1');}
  if(pending.gear){var loot=addItem(pending.gear.slot,pending.gear.rarity);
   if(loot){lines.push('<div class="loot-gear">'+window.CryptArt.item(loot.slot,loot.rarity)+
     '<span><strong>'+esc(loot.name)+'</strong><small>'+RARITY[loot.rarity]+' · '+SLOT[loot.slot]+'</small></span></div>');
    labels.push('▣ '+loot.name+' ×1');}}
  if(pending.relic){
   var relic=EX.relics.find(function(x){return x.id===pending.relic;});
   if(relic){s.meta.relics[relic.id]=(s.meta.relics[relic.id]||0)+1;
    lines.push('<strong>'+esc(relic.icon+' '+relic.name)+'</strong>');
    labels.push(relic.icon+' '+relic.name);
    log('В реликварий добавлено: '+relic.name+'.');
    if(lvl('reliclord')>0){r.shield+=8*lvl('reliclord');log('Хранитель реликвий получает защиту при исследовании артефакта.');}}}
  t.drops=null;t.cleared=true;log('Награды подобраны с клетки.');
  finishAction();if(r)floatLoot(t.id,labels);return;
 }
 if(kind==='chest'){
  var money=addGold(Math.round((rand(6,14)+r.floor*2)*(1+bonus('chestGold')*.01)));
  lines.push('<strong>◈ '+money+' монет</strong>');labels.push('◈ +'+money);
  if(Math.random()<.8){
   var i=addItem(pick(Object.keys(SLOT)),null);
   if(i){lines.push('<div class="loot-gear">'+window.CryptArt.item(i.slot,i.rarity)+
    '<span><strong>'+esc(i.name)+'</strong><small>'+RARITY[i.rarity]+' · '+SLOT[i.slot]+'</small></span></div>');
    labels.push(i.name+' ×1');}
  }else{r.potions++;lines.push('<strong>✚ Эликсир ×1</strong>');labels.push('✚ Эликсир ×1');}
  if(lvl('vault')>0&&Math.random()<Math.min(.5,.1*lvl('vault'))){
   var extra=pick(SPELLS);r.scrolls[extra.id]=(r.scrolls[extra.id]||0)+1;
   lines.push('<strong>✣ Дополнительный свиток «'+esc(extra.name)+'»</strong>');
  }
  t.cleared=true;log('Сундук вскрыт.');
  finishAction();
  if(r){if(lines.length>1)rewardDialog('Старинный сундук',lines);else floatLoot(t.id,labels);}
  return;
 }
 if(kind==='coin'){
  var gold=addGold(rand(9,18)+r.floor*2);t.cleared=true;log('Подобрано '+gold+' монет.');
  finishAction();if(r)floatLoot(t.id,['◈ Монеты +'+gold]);return;
 }
 if(kind==='potion'){
  r.potions++;t.cleared=true;log('Получен целебный эликсир.');
  finishAction();if(r)floatLoot(t.id,['✚ Эликсир ×1']);return;
 }
 if(kind==='trap'){
  t.cleared=true;var reduction=clamp(1-bonus('trapReduce')*.01,0,.95);
  var dmg=Math.max(0,Math.floor((7+r.floor*2)*reduction*(r.class==='scout'?.55:1)));
  r.hp=Math.max(0,r.hp-dmg);log('Ловушка наносит '+dmg+' урона.');
  finishAction();if(r)floatLoot(t.id,['−'+dmg+' HP']);return;
 }
 if(kind==='corpse'){discoverCorpse(t);return;}
 if(kind==='chamber'){openChamber(t);return;}
 if(kind==='secret'){t.cleared=true;discoverSecret();finishAction();return;}
 if(kind==='altar'){t.cleared=true;showAltar();finishAction();return;}
 if(kind==='shop'){t.cleared=true;showShop();finishAction();return;}
 if(kind==='puzzle'){t.cleared=true;showPuzzle();finishAction();return;}
 if(kind==='event'){t.cleared=true;eventRandom();finishAction();return;}
}
function reveal(id){
 var t=tile(id);if(!t||t.revealed)return;
 var access=CR.exploreStatus(t,r.tiles);
 if(!access.ok){toast(access.reason);return;}
 t.revealed=true;
 var k=t.kind;
 if(k==='enemy'||k==='boss')log('Открыта плита: '+t.foe.name+'.');
 else if(k==='empty'){t.cleared=true;log('Под плитой — пустой каменный пол.');}
 else if(k==='exit')log('Лестница найдена. Для спуска необходим ключ.');
 else if(k==='start'){t.cleared=true;}
 else log('Под камнем обнаружено: '+({chest:'сундук',coin:'монеты',potion:'флакон',trap:'ловушка',altar:'алтарь',secret:'тайник',shop:'лавка',puzzle:'загадка',event:'странное событие',corpse:'останки исследователя',chamber:'побочная комната'}[k]||'находка')+'. Коснитесь предмета, чтобы взаимодействовать.');
 finishAction();
}
function inspectTile(id){
 var t=tile(id);if(!t)return;
 if(t.kind==='exit'){descend();return;}
 if(t.foe&&t.foe.hp>0){strike(id);return;}
 if(t.drops||!t.cleared){claimTile(t);return;}
}
function descend(){
 var exit=r.tiles.find(function(t){return t.kind==='exit';});
 if(!exit||!exit.revealed){toast('Сначала найдите лестницу.');return;}
 if(!r.key){toast('Нужен ключ. Найдите ключника среди врагов.');return;}
 var heal=Math.floor(stats().hp*.16);
 r.floor++;r.ep+=2;r.hp=Math.min(stats().hp,r.hp+heal);
 r.shield=0;r.turn++;startFloor();
 log('Новый этаж: +'+heal+' здоровья и +2 ✧.');
 save();draw();toast('Спуск на этаж '+r.floor+'.');
}
/* Souls belong to the current run. Corpse stories are one-off per run. */
function addSpiritSoul(entry){
 if(!r||!entry||!Array.isArray(r.soulBag))return null;
 if(r.soulBag.length>=24){log('Мешочек душ заполнен.');return null;}
 var v={id:++s.seq,kind:entry.kind||'common',name:entry.name||'Безымянная душа',storyId:entry.storyId||null};
 r.soulBag.push(v);log('Получена душа: '+v.name+'.');return v;
}
function consumeSpiritSoul(id){
 var soul=(r.soulBag||[]).find(function(x){return x.id===Number(id);});
 if(!soul)return;
 r.soulBag=r.soulBag.filter(function(x){return x.id!==soul.id;});
 if(soul.kind==='unique'){
  var story=CORPSE_STORIES.find(function(x){return x.id===soul.storyId;});
  if(story){
   var gear=addItem('gloves',1);
   if(gear){gear.name=story.prize;gear.rarity=3;gear.setId=null;gear.setName=null;gear.stormCharge=true;gear.pow=(gear.pow||0)+3;
    log('Душа превратилась в '+gear.name+'.');}
  }
 }else if(soul.kind==='elite'){
  var heal=Math.floor(stats().hp*.35)+5*lvl('trader');
  r.hp=Math.min(stats().hp,r.hp+heal);r.shield+=10+5*lvl('trader');log('Душа восстанавливает '+heal+' HP и создаёт щит.');
 }else{r.shield+=8+4*lvl('trader');log('Душа окружает героя магическим щитом.');}
 finishAction();
}
function discoverCorpse(t){
 if(!t||t.cleared||!t.revealed)return;
 var story=CORPSE_STORIES.find(function(x){return x.id===t.corpseId;})||CORPSE_STORIES[0],first=!r.uniqueFinds[story.id],lines=[];
 t.cleared=true;t.kind='empty';
 if(first){
  r.uniqueFinds[story.id]=true;
  var gear=addItem(story.slot,1);
  if(gear){gear.name=story.gear;gear.rarity=2;gear.setId=null;gear.setName=null;lines.push('Найден предмет: '+gear.name+'.');}
  r.journalNotes.push(story.name+': '+story.note);lines.push('Найдена записка исследователя.');
  if(lvl('explorer')>0){var coins=addGold(4*lvl('explorer'));lines.push('Мародёр нашёл дополнительные '+coins+' монет.');}
  if(lvl('cartographer')>0){var soul=addSpiritSoul({kind:'unique',name:story.soul,storyId:story.id});
   if(soul)lines.push('Извлечена особая душа: '+soul.name+'.');}
  if(lvl('navigator')>0){r.ep+=3;lines.push('Анатом: +3 очка исследования.');}
  if(lvl('pathfinder')>0){r.journalNotes.push('Воспоминание: '+story.name+' знал часть пути к забытой деревне.');lines.push('Открыт фрагмент воспоминаний.');}
 }else{var money=addGold(8+Math.floor(r.floor/2));lines.push('Здесь уже искали улики. Найдено '+money+' монет.');}
 log('Осмотрены останки: '+story.name+'.');finishAction();
 if(r)dialog('<div class="emblem">☽</div><div class="subhead">ОСТАНКИ ИССЛЕДОВАТЕЛЯ</div><h2>'+esc(story.name)+'</h2>'+
 '<p>'+esc(story.note)+'</p><div class="reward-rows">'+lines.map(function(x){return '<div class="reward-entry">'+esc(x)+'</div>';}).join('')+'</div>'+
 '<button class="btn wide" data-action="close">Продолжить</button>');
}

/* A small instanced side chamber, saved on its original dungeon tile.
   The main map never grants its secret during automatic normal-tile clearing. */
function openChamber(t){
 if(!t||t.kind!=='chamber'||!t.revealed||t.cleared)return;
 var enter=!t.entered;
 if(!t.room)t.room={guardHp:Math.max(14,Math.floor(16+r.floor*1.7)),rewardTaken:false,secretTaken:false,secret:Math.random()<.45};
 t.entered=true;
 r.chamberActive=t.id;
 if(enter){log('Найдена пещера с одиноким стражем и наградой в центре.');finishAction();}
 if(r)showChamber(t);
}
function showChamber(t){
 if(!r||!t||!t.room||t.kind!=='chamber')return;
 var room=t.room,secret=!!(lvl('scavenger')||lvl('phantom'))&&(room.secret||lvl('phantom')>0);
 var html='<div class="emblem">⌂</div><div class="subhead">ПОБОЧНОЕ ПОМЕЩЕНИЕ</div><h2>ПОТЕРЯННЫЙ ПРИДЕЛ</h2>'+
 '<p>Страж охраняет сундук в центре. Вдоль стены тянется потрескавшаяся кладка.</p>'+ 
 (lvl('stealth')>0?(room.secret?'<p class="golden">Следопыт ощущает подозрительный холод у края помещения.</p>':'<p class="fine muted">Следопыт не заметил тайного прохода.</p>'):'')+
 '<div class="unit-skill"><strong>'+(room.guardHp>0?'Страж комнаты: '+room.guardHp+' HP':'Страж побеждён')+'</strong></div>';
 if(room.guardHp>0)html+='<button class="btn wide" data-action="chamber-fight" data-id="'+t.id+'">⚔ Атаковать стража · 1 ход</button>';
 else if(!room.rewardTaken)html+='<button class="btn wide" data-action="chamber-reward" data-id="'+t.id+'">Забрать центральную награду · 1 ход</button>';
 else html+='<p class="golden">Награда получена.</p>';
 if(room.guardHp<=0&&room.rewardTaken&&secret&&!room.secretTaken){
  html+='<button class="btn gold wide space-top" data-action="chamber-secret" data-id="'+t.id+'">✦ Подсвеченный тайник у края · 1 ход</button>';
 }else if(!secret){html+='<p class="fine muted">Особых секретов не обнаружено.</p>';}
 html+='<button class="btn alt wide space-top" data-action="close">Выйти из помещения</button>';
 dialog(html);
}
function fightChamber(id){
 var t=tile(id);if(!t||t.kind!=='chamber'||!t.room||t.room.guardHp<=0)return;
 t.room.guardHp=Math.max(0,t.room.guardHp-Math.max(1,stats().atk-2));
 if(t.room.guardHp>0)r.hp=Math.max(0,r.hp-Math.max(1,3+Math.floor(r.floor*.25)-stats().def));
 else log('Страж побочного помещения побеждён.');
 finishAction();if(r)showChamber(t);
}
function chamberReward(id){
 var t=tile(id);if(!t||t.kind!=='chamber'||!t.room||t.room.guardHp>0||t.room.rewardTaken)return;
 t.room.rewardTaken=true;
 var coins=addGold(20+r.floor*2);
 if(Math.random()<.6)addItem(pick(Object.keys(SLOT)),1);
 log('Найдена награда в побочной комнате: '+coins+' монет.');
 var secret=!!(lvl('scavenger')||lvl('phantom'))&&(t.room.secret||lvl('phantom')>0);
 if(!secret){t.cleared=true;t.kind='empty';}
 finishAction();if(r&&secret)showChamber(t);else {if(r)r.chamberActive=null;close();}
}
function chamberSecret(id){
 var t=tile(id);if(!t||t.kind!=='chamber'||!t.room||t.room.guardHp>0||!t.room.rewardTaken||t.room.secretTaken||
  !(lvl('scavenger')||lvl('phantom'))||!(t.room.secret||lvl('phantom')>0))return;
 t.room.secretTaken=true;t.cleared=true;t.kind='empty';r.secrets++;r.ep+=4;
 if(lvl('phantom'))addItem('relic',2);
 else r.scrolls.heal=(r.scrolls.heal||0)+1;
 log('Тайновед обнаружил дополнительный тайник в дальней стене.');
 finishAction();if(r)r.chamberActive=null;close();
}
function gainSecret(e){
 r.secrets++;r.ep+=bonus('secretEp');
 if(s.meta.secrets.indexOf(e.title)===-1)s.meta.secrets.push(e.title);
 if(lvl('secretkeeper')>0&&e.type==='relic'&&!r.uniqueFinds['relic-lore:'+e.title]){
  r.uniqueFinds['relic-lore:'+e.title]=true;r.ep+=2*lvl('secretkeeper');
  r.journalNotes.push('Археолог: найдено древнее свидетельство о реликвии «'+e.title+'».');
 }
 switch(e.type){
  case'relic':addItem('relic',Math.max(2,rarityRoll()));break;
  case'ep':r.ep+=4;break;
  case'scroll':var sp=pick(SPELLS);r.scrolls[sp.id]=(r.scrolls[sp.id]||0)+2;break;
  case'shield':r.shield+=30+r.floor*3;break;
  case'gold':addGold(35+r.floor*3);break;
  case'mana':r.mp=Math.min(stats().mp,r.mp+25);break;
  case'heal':r.potions++;addGold(20);break;
 }
}
function discoverSecret(){
 var e=pick(SECRET_EVENTS);gainSecret(e);log('ТАЙНА: '+e.title+'. '+e.reward);
 dialog('<div class="emblem">✧</div><div class="subhead">СЕКРЕТ ЛАБИРИНТА</div><h2>'+e.title+'</h2><p>'+e.text+'</p>'+
 '<p class="golden">'+e.reward+'</p><button class="btn wide" data-action="close">ЗАПОМНИТЬ</button>');
}
function eventRandom(){
 var choices=[
 {name:'Могильщик без лопаты',text:'Седой могильщик просит помочь закончить работу. Он обещает не спрашивать, кого вы ищете.',event:'grave'},
 {name:'Колонна шепотов',text:'На каменной колонне проступает ваше имя, хотя вы его ещё никому не называли.',event:'whisper'},
 {name:'Безымянный воин',text:'Старый дух протягивает вам тренировочный меч. Он хочет проверить, достойны ли вы носить собственное оружие.',event:'warrior'}
 ];
 var e=pick(choices);
 dialog('<div class="emblem">✥</div><div class="subhead">СЛУЧАЙНАЯ ВСТРЕЧА</div><h2>'+e.name+'</h2><p>'+e.text+'</p>'+
 '<div class="btnrow"><button class="btn" data-action="event-yes" data-id="'+e.event+'">Согласиться</button><button class="btn alt" data-action="close">Пройти мимо</button></div>');
}
function eventChoice(id){
 if(id==='grave'){r.ep+=2;addGold(8);log('Могильщик делится картой тайников: +2 ✧.');}
 if(id==='whisper'){r.mp=Math.min(stats().mp,r.mp+17);r.shield+=13;log('Шепот даёт защиту и ману.');}
 if(id==='warrior'){r.hp=Math.max(1,r.hp-8);addItem('weapon',Math.max(1,rarityRoll()));log('Дух отдаёт вам оружие.');}
 close();finishAction();
}
function showAltar(){
 dialog('<div class="emblem">☽</div><div class="subhead">ЗАБЫТЫЙ АЛТАРЬ</div><h2>КРОВАВАЯ КЛЯТВА</h2>'+
 '<p>У стены мерцают два ритуальных огня. Древние силы предложат милость или испытание.</p>'+
 '<div class="btnrow"><button class="btn" data-action="altar-heal">Молиться · +35% HP</button><button class="btn alt" data-action="altar-risk">Жертва · −15 HP, +4 ✧</button></div>');
}
function altarChoice(risk){
 if(risk){r.hp=Math.max(1,r.hp-15);r.ep+=4;log('Алтарь забирает кровь и дарит 4 очка пути.');}
 else{var heal=Math.floor(stats().hp*.35);r.hp=Math.min(stats().hp,r.hp+heal);log('Алтарь возвращает '+heal+' здоровья.');}
 close();finishAction();
}
function shopPrice(id){var base=id==='potion'?16:id==='scroll'?15:38;
 return Math.max(1,Math.ceil(base*(1-bonus('discount')*.01)));}
function showShop(){
 var items=[['potion','✚','Целебный эликсир'],['scroll','✣','Случайный свиток'],['gear','⚔','Случайная экипировка']];
 dialog('<div class="emblem">◈</div><div class="subhead">СТРАНСТВУЮЩИЙ ТОРГОВЕЦ</div><h2>ЛАВКА ЗАБОРОМНОГО</h2>'+
 '<p>Под рваным плащом торговец держит реликвии и свитки. Его глаза не отражают свет.</p>'+
 items.map(function(info){var price=shopPrice(info[0]);return '<div class="row space-bottom"><span>'+info[1]+' '+info[2]+'</span>'+
 '<button class="btn small" data-action="buy" data-id="'+info[0]+'" '+(r.gold<price?'disabled':'')+'>'+price+' ◈</button></div>';}).join('')+
 '<button class="btn alt wide" data-action="close">Уйти</button>');
}
function buy(id){
 var cost=shopPrice(id);if(r.gold<cost){toast('Недостаточно монет.');return;}
 r.gold-=cost;
 if(id==='potion')r.potions++;
 else if(id==='scroll'){var spell=pick(SPELLS);r.scrolls[spell.id]=(r.scrolls[spell.id]||0)+1;}
 else addItem(pick(Object.keys(SLOT)),Math.max(1,rarityRoll()));
 log('Покупка у странствующего торговца. −'+cost+' монет.');
 close();finishAction();
}
function showPuzzle(){
 var correct=rand(0,2);
 var options=[
 ['Три черепа','Один факел','Семь печатей'],
 ['Ключ','Перо','Чёрная свеча'],
 ['Тьма','Пепел','Зеркало']
 ][correct];
 var question=['Что хранит забытый страж под сердцем?','Что откроет дверь, в которой нет замка?','Что остаётся от клятвы после смерти?'][correct];
 var answers=[1,0,1],correctIndex=answers[correct];
 r.pendingPuzzle=correctIndex;
 dialog('<div class="emblem">✣</div><div class="subhead">КАМЕННАЯ ЗАГАДКА</div><h2>ПРОВЕРКА ПАМЯТИ</h2>'+
 '<p>'+question+'</p><div class="btnrow wrap">'+options.map(function(o,i){return '<button class="btn alt" data-action="puzzle-answer" data-id="'+i+'">'+o+'</button>';}).join('')+'</div>'+
 '<p class="fine muted space-top">Ошибка может пробудить защитные руны.</p>');
}
function puzzleAnswer(id){
 var correct=Number(id)===r.pendingPuzzle;
 if(correct){r.ep+=3;var s1=pick(SPELLS);r.scrolls[s1.id]=(r.scrolls[s1.id]||0)+1;log('Загадка решена! +3 ✧ и свиток.');}
 else{r.hp=Math.max(0,r.hp-10-r.floor);log('Руна ошибочного ответа обжигает вас.');}
 r.pendingPuzzle=null;close();finishAction();
}
function gainTalent(id){
 var t=TALENTS.find(function(x){return x.id===id;});if(!t)return;
 var n=lvl(id),cost=levelCost(t);
 if(n>=3||r.ep<cost||!talentUnlocked(t))return;
 r.ep-=cost;r.talents[id]=n+1;
 if(t.effect==='hp')r.hp+=t.amount;
 if(t.effect==='mp')r.mp+=t.amount;
 if(t.effect==='summonBase'&&r.summon){r.summon.hp+=14;r.summon.maxHp+=14;r.summon.atk+=4;}
 if(t.effect==='summonHp'&&r.summon){r.summon.hp+=t.amount;r.summon.maxHp+=t.amount;}
 if(t.effect==='summonAtk'&&r.summon)r.summon.atk+=t.amount;
 log('Принят титул «'+t.name+'»: '+(n+1)+'/3.');
 toast('Развитие: '+t.name);draw();save();
}
function equip(id){
 var i=item(id);if(!i)return;
 r.equip[i.slot]=i.id;r.hp=Math.min(stats().hp,r.hp);r.mp=Math.min(stats().mp,r.mp);
 r.bagSelected=i.id;log('Надето: '+i.name+'.');toast('Снаряжение обновлено.');draw();save();
}
function upgrade(id){
 var i=item(id);if(!i||i.plus>=9)return;
 var cost=upgradeCost(i);if(r.gold<cost){toast('Недостаточно монет.');return;}
 r.gold-=cost;i.plus++;
 // Item improvement should be tied to its actual stats.
 ['atk','def','hp','mp','pow'].forEach(function(k){if(i[k]>0)i[k]+=Math.max(1,Math.ceil(i[k]*.18));});
 if(i.crit>0&&i.plus%3===0)i.crit++;
 log('Улучшение '+i.name+' до +'+i.plus+' завершено.');draw();save();
}
function scrap(id){
 var i=item(id);if(!i||equipped(id))return;
 var coins=8+3*i.rarity+2*i.plus;r.gold+=coins;r.items=r.items.filter(function(x){return x.id!==i.id;});
 r.bagSelected=r.items.length?r.items[0].id:null;
 log('Разобрано: '+i.name+'. +'+coins+' монет.');draw();save();
}
function die(reason){
 if(!r)return;
 s.meta.activeExpedition=null;
 var depth=r.floor,kills=r.kills,secret=r.secrets,hero=r.class;
 var gain=3+depth*2+Math.floor(kills/3)+secret*2;
 var essence=3+depth*2+Math.floor(kills/2);
 s.meta.souls+=gain;s.meta.best=Math.max(s.meta.best,depth);
 s.meta.runs++;s.meta.totalSecrets=(s.meta.totalSecrets||0)+secret;
 s.meta.heroEssence[hero]=(s.meta.heroEssence[hero]||0)+essence;
 s.run=null;r=null;save();draw();
 dialog('<div class="emblem">☠</div><div class="subhead red">ЭКСПЕДИЦИЯ ЗАВЕРШЕНА</div><h2>ПЕПЕЛ ПОМНИТ</h2>'+
 '<p>Титулы и вещи экспедиции потеряны. Сохранённый ранее склад не затронут.</p>'+(reason?'<p>'+esc(reason)+'</p>':'')+
 '<div class="kpis space-bottom"><div><b>'+depth+'</b><small>Этаж</small></div><div><b>'+kills+'</b><small>Побед</small></div>'+
 '<div><b>+'+gain+'</b><small>Памяти</small></div></div>'+
 '<p class="golden">+'+essence+' эссенции: '+C[hero].name+'.</p>'+
 '<button class="btn wide" data-action="choose">НОВАЯ ЭКСПЕДИЦИЯ</button>'+
 '<button class="btn alt wide space-top" data-action="camp">Усилить героев</button>'+
 '<button class="btn dark wide space-top" data-action="chronicles">Хроники и реликвии</button>');
}
function escapeDungeon(fraction,message){
 if(!r)return;
 var summary=bankExpeditionLoot(fraction);
 die(message+' Сохранено '+summary.resources+' несданных ресурсов.');
}
function abandon(){
 if(!r){close();return;}
 dialog('<div class="emblem">☠</div><h2>Покинуть подземелье?</h2>'+
 '<p>Это побег, а не портал. Временные предметы, свитки и прокачка будут потеряны.</p>'+
 '<p>Без рекламы сохраняется 25% не сданных на склад ресурсов.</p>'+
 '<button class="btn wide" data-action="escape-25">Сбежать · сохранить 25%</button>'+
 '<button class="btn alt wide space-top" data-action="escape-ad">Попробовать бонус рекламы</button>'+
 '<p class="fine muted">Игра сейчас офлайн: если реклама технически недоступна, выдаётся 50%. После подтверждённого просмотра в будущей онлайн-сборке — 75%.</p>'+
 '<button class="btn dark wide space-top" data-action="close">Отмена</button>');
}
function camp(){
 var m=s.meta,up=m.upgrades;
 function line(key,name,desc){
  var price=5+up[key]*4;
  return '<div class="meta-upgrade"><div><strong>'+name+'</strong><small>Ранг '+up[key]+'/5 · '+desc+'</small></div>'+
  '<button class="btn small" data-action="permanent" data-id="'+key+'" '+(m.souls<price||up[key]>=5?'disabled':'')+'>'+price+' ✧</button></div>';
 }
 var heroes=Object.keys(C).map(function(id){
  var c=C[id],rank=m.heroRanks[id]||0,essence=m.heroEssence[id]||0,cost=EX.upgradeCost(rank);
  return '<div class="meta-hero-row"><span class="meta-hero-portrait">'+window.CryptArt.hero(id)+'</span>'+
   '<div><strong>'+c.name+' · '+rank+'/5</strong><small>'+EX.heroMastery[id].effect+'</small>'+
   '<small>☽ Эссенция: '+essence+'</small></div>'+
   '<button class="btn small" data-action="hero-rank" data-id="'+id+'" '+(rank>=5||essence<cost?'disabled':'')+'>'+
   (rank>=5?'МАКС':cost+' ☽')+'</button></div>';
 }).join('');
 dialog('<div class="emblem">✥</div><div class="subhead">МЕТАПРОГРЕССИЯ</div><h2>ПАМЯТЬ ПРЕДКОВ</h2>'+
  '<p>Память общая: <b class="golden">'+m.souls+' ✧</b>. Эссенция у каждого героя своя. Титулы внутри забега — общие и временные.</p>'+
  '<div class="frame-title">ОБЩИЕ УЛУЧШЕНИЯ</div>'+
  line('hp','Крепкое тело','HP +12')+line('atk','Стальное наследие','Атака +2')+line('mp','Тайная мудрость','Мана +8')+
  '<div class="frame-title space-top">РАЗВИТИЕ ГЕРОЕВ</div>'+heroes+
  '<button class="btn gold wide space-top" data-action="town">⚒ Поселение и материалы</button>'+ '<button class="btn alt wide space-top" data-action="chronicles">✥ Реликварий, бестиарий и испытания</button>'+
  '<button class="btn alt wide space-top" data-action="close">Вернуться</button>');
}
var BUILDINGS={
 forge:{title:'Кузница',desc:'+2 атаки за уровень для всех героев',icon:'⚒'},
 barracks:{title:'Казармы',desc:'+12 максимального HP за уровень',icon:'♜'},
 library:{title:'Библиотека',desc:'+8 максимальной маны за уровень',icon:'✣'}
};
function materialCount(){return Object.values(s.meta.materials||{}).reduce(function(n,v){return n+Math.max(0,Number(v)||0);},0);}
function town(){
 var city=s.meta.city||{forge:0,barracks:0,library:0},mat=s.meta.materials||{},available=materialCount();
 var builds=Object.keys(BUILDINGS).map(function(id){
  var b=BUILDINGS[id],level=city[id]||0,cost=6+level*8;
  return '<div class="meta-upgrade"><div><strong>'+b.icon+' '+b.title+' · '+level+'/5</strong><small>'+b.desc+'</small></div>'+
  '<button class="btn small" data-action="town-upgrade" data-id="'+id+'" '+
   (level>=5||available<cost?'disabled':'')+'>'+cost+' мат.</button></div>';
 }).join('');
 var resources=Object.entries(mat).filter(function(v){return v[1]>0;}).sort(function(a,b){return b[1]-a[1];}).slice(0,32);
 dialog('<div class="emblem">♜</div><div class="subhead">ПОСЕЛЕНИЕ ПЕРЕЖИВАЕТ КАЖДЫЙ ЗАБЕГ</div><h2>ПОГРАНИЧНЫЙ ПРИВАЛ</h2>'+
 '<p>Запас материалов: <b class="golden">'+available+'</b>. Они добываются у врагов шести регионов и остаются после смерти героя. В мастерской используем ресурсы вместо золота.</p>'+
 '<div class="frame-title">РАЗВИТИЕ ПОСЕЛЕНИЯ</div>'+builds+
 '<div class="frame-title space-top">СКЛАД · '+resources.length+' ВИДОВ</div>'+
 '<div class="town-resources">'+(resources.length?resources.map(function(e){return '<span>'+esc(e[0])+' <b>×'+e[1]+'</b></span>';}).join(''):'<p class="fine muted">Материалов пока нет. Исследуйте подземелье и собирайте добычу с врагов.</p>')+'</div>'+
 '<button class="btn alt wide space-top" data-action="camp">Память предков</button>'+
 '<button class="btn dark wide space-top" data-action="close">Выйти</button>');
}
function townUpgrade(id){
 if(!Object.prototype.hasOwnProperty.call(BUILDINGS,id))return;
 var city=s.meta.city,level=city[id]||0,cost=6+level*8;
 if(level>=5||materialCount()<cost)return;
 var remaining=cost;
 var names=Object.keys(s.meta.materials).sort(function(a,b){return (s.meta.materials[b]||0)-(s.meta.materials[a]||0);});
 for(var key of names){
  var used=Math.min(remaining,s.meta.materials[key]||0);
  s.meta.materials[key]-=used;remaining-=used;
  if(!remaining)break;
 }
 if(remaining!==0)throw Error('Material budget invariant violation');
 city[id]=level+1;
 if(r){if(id==='barracks')r.hp+=12;if(id==='library')r.mp+=8;}
 save();draw();town();
}

function rankHero(id){
 if(!Object.prototype.hasOwnProperty.call(C,id))return;
 var m=s.meta,rank=m.heroRanks[id]||0,cost=EX.upgradeCost(rank);
 if(rank>=5||(m.heroEssence[id]||0)<cost)return;
 m.heroEssence[id]-=cost;m.heroRanks[id]=rank+1;
 if(r&&r.class===id){
  if(id==='scout')r.hp+=5;
  if(id==='necromancer'&&r.summon){r.summon.hp+=9;r.summon.maxHp+=9;r.summon.atk+=3;}
 }
 save();draw();camp();
}
function heroProgressDialog(id){
 if(!C[id])return;
 var rank=s.meta.heroRanks[id]||0,ess=s.meta.heroEssence[id]||0;
 dialog('<div class="emblem">'+C[id].icon+'</div><div class="subhead">ЛИЧНОЕ РАЗВИТИЕ ГЕРОЯ</div>'+
  '<h2>'+C[id].name+'</h2><p>'+C[id].description+'</p>'+
  '<p><b class="golden">Ранг '+rank+'/5</b> · Эссенция '+ess+' ☽</p>'+
  '<div class="unit-skill"><strong>'+EX.heroMastery[id].title+'</strong><p>'+EX.heroMastery[id].effect+'</p></div>'+
  '<button class="btn wide" data-action="hero-rank" data-id="'+id+'" '+
    (rank>=5||ess<EX.upgradeCost(rank)?'disabled':'')+'>Усилить · '+EX.upgradeCost(rank)+' ☽</button>'+
  '<button class="btn alt wide space-top" data-action="camp">Память предков</button>');
}
function chronicles(){
 var m=s.meta;
 var goalRows=EX.challenges.map(function(x){
  var done=!!m.milestones[x.id],ready=x.check(m);
  return '<div class="meta-goal"><div><strong>'+(done?'✓ ':'')+x.name+'</strong><small>'+x.desc+'</small></div>'+
   '<button class="btn small" data-action="milestone" data-id="'+x.id+'" '+
    ((!ready||done)?'disabled':'')+'>'+(done?'ГОТОВО':'+'+x.reward+' ✧')+'</button></div>';
 }).join('');
 var collection=EX.relics.map(function(x){
  var n=m.relics[x.id]||0;
  return '<div class="meta-relic '+(n?'found':'')+'"><span>'+x.icon+'</span>'+
    '<strong>'+x.name+'</strong><small>'+(n?'Собрано ×'+n+' · '+x.bonus:'Не обнаружено · '+x.desc)+'</small></div>';
 }).join('');
 var beasts=Object.keys(m.bestiary).filter(function(k){return m.bestiary[k]>0;}).sort().map(function(id){
  var found=MOBS.find(function(mob){return mob.id===id;});
  return '<span class="pill">'+esc(found?found.name:id)+' ×'+m.bestiary[id]+'</span>';
 }).join(' ');
 dialog('<div class="emblem">✥</div><div class="subhead">ДОЛГОСРОЧНЫЕ ЦЕЛИ</div><h2>ХРОНИКИ И РЕЛИКВАРИЙ</h2>'+
  '<p>Лучший этаж: '+m.best+' · Боссов побеждено: '+(m.bossKills||0)+
  ' · Обнаружено секретов: '+(m.totalSecrets||0)+'.</p>'+
  '<div class="frame-title">ИСПЫТАНИЯ</div>'+goalRows+
  '<div class="frame-title space-top">ШЕСТЬ РЕЛИКВИЙ БЕЗДНЫ</div>'+
  '<p class="fine muted">С каждого босса можно получить реликвию. Первая находка постоянно усиливает всех героев.</p>'+
  '<div class="meta-relics">'+collection+'</div>'+
  '<div class="frame-title space-top">БЕСТИАРИЙ</div><div class="beast-list">'+
    (beasts||'<span class="fine muted">Никто ещё не повержен.</span>')+'</div>'+
  '<button class="btn alt wide space-top" data-action="camp">Память предков</button>'+
  '<button class="btn dark wide space-top" data-action="close">Закрыть</button>');
}
function claimMilestone(id){
 var m=s.meta,t=EX.challenges.find(function(c){return c.id===id;});
 if(!t||m.milestones[id]||!t.check(m))return;
 m.milestones[id]=true;m.souls+=t.reward;save();chronicles();toast('Испытание выполнено: +'+t.reward+' памяти.');
}

function permanent(id){
 var ups=s.meta.upgrades;if(!Object.prototype.hasOwnProperty.call(ups,id))return;
 var n=ups[id],cost=5+n*4;if(n>=5||s.meta.souls<cost)return;
 s.meta.souls-=cost;ups[id]++;
 if(r){if(id==='hp')r.hp+=12;if(id==='mp')r.mp+=8;}
 save();camp();draw();
}
function action(name,id){
 if(name==='close'){if(r)r.chamberActive=null;close();return;}
 if(name==='menu'){dialog(renderMenu());return;}
 if(name==='choose'){choose();return;}
 if(name==='begin'){if(C[id])begin(id);return;}
 if(name==='select-act'){selectAct(id);return;}
 if(name==='resume-expedition'){resumeExpedition();return;}
 if(name==='safe-portal'){safePortal();return;}
 if(name==='scrap-stored-item'){scrapStoredItem(id);return;}
 if(name==='discard-expedition'){dialog('<h2>Завершить экспедицию?</h2><p>Всё временное снаряжение будет разобрано на металлолом, остальное временное содержимое сброшено.</p><button class="btn wide" data-action="confirm-discard-expedition">Подтвердить разбор</button><button class="btn alt wide" data-action="close">Отмена</button>');return;}
 if(name==='confirm-discard-expedition'){endStoredExpedition();return;}
 if(name==='confirm-switch-act'){var act=s.meta.pendingActChoice;endStoredExpedition();s.meta.selectedAct=act;choose();return;}
 if(name==='escape-25'){escapeDungeon(.25,'Вы сбежали из подземелья.');return;}
 if(name==='escape-ad'){escapeDungeon(.50,'Спасибо за попытку! Реклама недоступна.');return;}
 if(name==='camp'){camp();return;}
 if(name==='town'){town();return;}
 if(name==='town-upgrade'){townUpgrade(id);return;}
 if(name==='permanent'){permanent(id);return;}
 if(name==='abandon'){abandon();return;}
 if(name==='confirm-end'){die();return;}
 if(name==='chronicles'){chronicles();return;}
 if(name==='milestone'){claimMilestone(id);return;}
 if(name==='hero-rank'){rankHero(id);return;}
 if(name==='hero-stats'){heroProgressDialog(id);return;}
 if(!r)return;
 if(name==='reveal'){reveal(id);return;}
 if(name==='move-hero'){var t=tile(id);if(t&&t.revealed&&t.cleared&&!t.foe&&!t.drops&&(t.kind==='start'||t.kind==='empty')){r.heroTile=t.id;draw();save();}return;}
 if(name==='pickup'){claimTile(tile(id));return;}
 if(name==='consume-soul'){consumeSpiritSoul(id);return;}
 if(name==='chamber-fight'){fightChamber(id);return;}
 if(name==='chamber-reward'){chamberReward(id);return;}
 if(name==='chamber-secret'){chamberSecret(id);return;}
 if(name==='strike'){strike(id);return;}
 if(name==='descend'){descend();return;}
 if(name==='inspect-tile'){inspectTile(id);return;}
 if(name==='inspect-enemy'){inspectUnit('enemy',id);return;}
 if(name==='inspect-summon'){inspectUnit('summon');return;}
 if(name==='skill'){useSkill();return;}
 if(name==='potion'){potion();return;}
 if(name==='wait'){wait();return;}
 if(name==='spell-modal'){magicDialog();return;}
 if(name==='cast-modal'){var spell=SPELLS.find(function(sp){return sp.id===id;});if(spellValid(spell)){toast(spellValid(spell));return;}close();cast(id);return;}
 if(name==='cast'){cast(id);return;}
 if(name==='talent'){gainTalent(id);return;}
 if(name==='tree'){r.treeView=clamp(Number(id)||0,0,2);draw();save();return;}
 if(name==='bag-filter'){r.bagFilter=id||'all';r.bagSelected=null;draw();save();return;}
 if(name==='item-select'){var itm=item(id);if(itm)gearComparison(itm.slot,itm.id);return;}
 if(name==='inspect-slot'){if(SLOT[id])gearComparison(id,r.equip[id]);return;}
 if(name==='inspect-item'){var itm2=item(id);if(itm2)gearComparison(itm2.slot,itm2.id);return;}
 if(name==='modal-select'){gearComparison(r.inspectSlot,Number(id));return;}
 if(name==='modal-equip'){var e=item(r.inspectItem);if(e){equip(e.id);gearComparison(e.slot,e.id);}return;}
 if(name==='modal-upgrade'){var g=item(r.inspectItem);if(g){upgrade(g.id);gearComparison(g.slot,g.id);}return;}
 if(name==='modal-scrap'){var it=item(r.inspectItem);if(it&&!equipped(it.id)){var type=it.slot;scrap(it.id);gearComparison(type,null);}return;}
 if(name==='equip'){equip(id);return;}
 if(name==='upgrade'){upgrade(id);return;}
 if(name==='scrap'){scrap(id);return;}
 if(name==='battle-log'){
  dialog('<div class="emblem">▤</div><h2>ЖУРНАЛ ПОХОДА</h2><div class="log" style="max-height:60dvh;text-align:left;">'+
   r.log.map(function(x){return '<div>'+esc(x)+'</div>';}).join('')+
   '</div><button class="btn wide space-top" data-action="close">Вернуться</button>');return;
 }
 if(name==='event-yes'){eventChoice(id);return;}
 if(name==='altar-heal'){altarChoice(false);return;}
 if(name==='altar-risk'){altarChoice(true);return;}
 if(name==='buy'){buy(id);return;}
 if(name==='puzzle-answer'){puzzleAnswer(id);return;}
}
document.addEventListener('click',function(e){
 if(Date.now()<suppressClickUntil && e.target.closest('[data-hold]')){e.preventDefault();return;}
 var b=e.target.closest('[data-action],[data-tab]');if(!b)return;e.preventDefault();
 if(b.dataset.tab){if(r){r.tab=b.dataset.tab;$('content').scrollTop=0;draw();save();}return;}
 action(b.dataset.action,b.dataset.id);
});
var holdStart=null;
document.addEventListener('pointerdown',function(e){
 if(!r)return;
 var t=e.target.closest('[data-hold]');if(!t)return;
 clearTimeout(holdTimeout);
 holdStart={x:e.clientX||0,y:e.clientY||0};
 var kind=t.dataset.hold,id=t.dataset.id;
 holdTimeout=setTimeout(function(){
  holdTimeout=null;holdStart=null;
  suppressClickUntil=Date.now()+1000;
  inspectUnit(kind,id);
 },570);
});
document.addEventListener('pointermove',function(e){
 if(!holdStart)return;
 var x=(e.clientX||0)-holdStart.x,y=(e.clientY||0)-holdStart.y;
 if(x*x+y*y>144){clearTimeout(holdTimeout);holdTimeout=null;holdStart=null;}
});
['pointerup','pointercancel','pointerleave'].forEach(function(n){
 document.addEventListener(n,function(){clearTimeout(holdTimeout);holdTimeout=null;holdStart=null;});
});
document.addEventListener('contextmenu',function(e){
 var t=e.target.closest('[data-hold]');if(!t)return;e.preventDefault();
 clearTimeout(holdTimeout);holdTimeout=null;holdStart=null;
 suppressClickUntil=Date.now()+1000;inspectUnit(t.dataset.hold,t.dataset.id);
});
window.Crypt={save:save,back:function(){
 if($('overlay').innerHTML){close();return;}
 if(r&&r.tab!=='maze'){r.tab='maze';draw();return;}
 toast('Лабиринт хранит ваши следы.');
 },state:function(){return s;},debug:{action:action,draw:draw,stats:stats,finish:finishAction}};
s=load();
if(!s)fresh();r=s.run;
if(r&&r.summon&&r.summon.hp>0&&r.summonTile==null)placeSummon();
draw();
if(!r)choose();
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',function(){if(document.hidden)save();});
setInterval(save,7000);
})();