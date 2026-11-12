/* Пепельный лабиринт: offline, original roguelite. No external calls. */
(function(){
'use strict';
var KEY='cryptbound_local_v1',s=null,toastTimer=0;
var EX=window.CryptExpansion,holdTimeout=null,suppressClickUntil=0;
var $=function(id){return document.getElementById(id);};
var C={
 necromancer:{name:'Некромант',type:'Магия',title:'Хозяин костей',description:'Призывает верного скелета, который сражается и принимает удары вместо хозяина.',hp:76,mp:59,atk:10,def:1,pow:11,crit:5,icon:'☠'},
 executioner:{name:'Палач',type:'Битва',title:'Клинок возмездия',description:'Мощный боец с тяжёлыми ударами и защитной стойкой.',hp:110,mp:34,atk:16,def:5,pow:5,crit:8,icon:'⚔'},
 scout:{name:'Следопыт',type:'Приключение',title:'Зоркий странник',description:'Вскрывает тайники, избегает ловушек и находит больше добычи.',hp:89,mp:42,atk:13,def:3,pow:8,crit:13,icon:'✦'}
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
function levelTheme(){return Math.floor((r.floor-1)/4)%4;}
function maxFloorLabel(){return THEMES[levelTheme()][0];}
function lvl(n){return (r.talents[n]||0);}
function bonus(effect){return TALENTS.reduce(function(sum,t){return sum+(t.effect===effect?lvl(t.id)*t.amount:0);},0);}
function levelCost(t){var main=r.class==='necromancer'?1:r.class==='executioner'?0:2;
 var base=2+t.rank*3+lvl(t.id)*3;
 return t.tree===main?base:Math.ceil(base*1.25);
}
function talentUnlocked(t){return !t.parent || lvl(t.parent)>0;}
function talentsByTree(tree){return TALENTS.filter(function(x){return x.tree===tree;});}
function equipped(id){return Object.values(r.equip).some(function(v){return v===Number(id);});}
function item(id){return r.items.find(function(x){return x.id===Number(id);})||null;}
function equippedItem(slot){return item(r.equip[slot]);}
function stats(){
 var c=C[r.class],e=r.equip;
 var a=c.atk+(r.floor-1)*1.1+bonus('atk')+(s.meta.upgrades.atk*2)+EX.masteryStat(s.meta,r.class,'atk')+EX.relicStat(s.meta,'atk');
 var def=c.def+bonus('def')+EX.masteryStat(s.meta,r.class,'def')+EX.relicStat(s.meta,'def');
 var hp=c.hp+bonus('hp')+s.meta.upgrades.hp*12+EX.masteryStat(s.meta,r.class,'hp')+EX.relicStat(s.meta,'hp');
 var mp=c.mp+bonus('mp')+s.meta.upgrades.mp*8+EX.relicStat(s.meta,'mp');
 var pow=c.pow+bonus('pow')+EX.masteryStat(s.meta,r.class,'pow')+EX.relicStat(s.meta,'pow');
 var crit=c.crit+bonus('crit')+EX.relicStat(s.meta,'crit');
 Object.keys(e).forEach(function(slot){
  var i=equippedItem(slot);if(!i)return;
  a+=i.atk||0;def+=i.def||0;hp+=i.hp||0;mp+=i.mp||0;pow+=i.pow||0;crit+=i.crit||0;
 });
 return {atk:Math.floor(a),def:def,hp:hp,mp:mp,pow:pow,crit:clamp(crit,0,75),dodge:clamp(bonus('dodge'),0,50)};
}
function newItem(slot,floor,rarity){
 var z=rarity==null?rarityRoll():rarity;
 var mul=1+z*.38,scale=1+floor*.34;
 var i={id:++s.seq,slot:slot,rarity:z,name:pick(ITEM_NAMES[slot]),plus:0,floor:floor,atk:0,def:0,hp:0,mp:0,pow:0,crit:0};
 function n(base){return Math.max(1,Math.round(base*mul*scale));}
 switch(slot){
  case'weapon':i.atk=n(4+rand(0,2));if(z>=2)i.pow=n(z);break;
  case'helm':i.hp=n(8);i.def=n(1.2);break;
  case'shoulders':i.def=n(2);i.hp=n(5);break;
  case'armor':i.def=n(3);i.hp=n(10);break;
  case'gloves':i.atk=n(2);if(z>=1)i.crit=z;break;
  case'belt':i.hp=n(12);i.mp=n(4);break;
  case'legs':i.def=n(2.2);i.hp=n(8);break;
  case'boots':i.def=n(1);i.mp=n(6);break;
  case'relic':i.pow=n(3);i.mp=n(9);if(z>=2)i.crit=z;break;
 }
 return i;
}
function rarityRoll(){
 var n=rand(1,100),boost=bonus('rarityBoost');
 return n<=2+boost*.1?4:n<=9+boost*.35?3:n<=25+boost?2:n<=58+boost?1:0;
}
function addItem(slot,rarity){
 var i=newItem(slot,r.floor,rarity);
 if(r.items.length>=30){r.gold+=10+r.floor*2;log('Сумка переполнена. Добыча обменяна на монеты.');return null;}
 r.items.push(i);log('Найдено: '+i.name+' ('+RARITY[i.rarity]+').');return i;
}
function bonusGold(n){return Math.round(n*(1+bonus('gold')*.01));}
function addGold(n){n=bonusGold(n);r.gold+=n;return n;}
function mkEnemy(boss){
 var src=boss?{id:'boss',name:BOSSES[Math.floor((r.floor-1)/5)%BOSSES.length],hp:95,atk:12,def:3,ep:9,gold:30}:pick(MOBS.slice(0,Math.min(6,2+Math.ceil(r.floor/2))));
 var scale=1+(r.floor-1)*.18;
 var ehp=Math.floor(src.hp*scale*(boss?1.55:1)),eatk=Math.floor(src.atk*(1+(r.floor-1)*.13)),edef=src.def+Math.floor((r.floor-1)*.32);
 return {id:src.id,name:src.name,hp:ehp,maxHp:ehp,atk:eatk,def:edef,ep:src.ep+(boss?Math.floor(r.floor/2):0),gold:src.gold+Math.floor(r.floor*1.3),boss:!!boss,burn:0,stun:0,skill:EX.monster(src.id),cooldown:EX.monster(src.id).every,guard:0};
}
function distributeTiles(){
 var types=Array.from({length:25},function(){return 'empty';});
 var positions=Array.from({length:25},function(_,i){return i;});
 for(var j=24;j>0;j--){var k=rand(0,j),v=positions[j];positions[j]=positions[k];positions[k]=v;}
 var pos=0;function insert(kind,count){for(var n=0;n<count;n++)types[positions[pos++]]=kind;}
 insert('start',1);insert('exit',1);
 insert('enemy',r.floor%5===0?5:6+(r.floor>6?1:0));
 if(r.floor%5===0)insert('boss',1);
 insert('chest',2);insert('trap',2);insert('altar',1);insert('shop',1);
 insert('event',2);insert('puzzle',1);insert('secret',1);
 insert('coin',2);insert('potion',1);
 var tiles=types.map(function(kind,id){
  return {id:id,kind:kind,revealed:kind==='start',cleared:kind==='start'||kind==='empty'&&false,
    foe:kind==='enemy'||kind==='boss'?mkEnemy(kind==='boss'):null,
    drops:null,hasKey:false};
 });
 var boss=tiles.find(function(t){return t.kind==='boss';});
 var holders=tiles.filter(function(t){return t.foe;});
 var carrier=boss||pick(holders);
 if(carrier)carrier.hasKey=true;
 return tiles;
}
function startFloor(){
 r.tiles=distributeTiles();r.key=false;r.shield=bonus('shieldFloor');r.blessed=0;
 if(r.summon)r.summon.hp=Math.max(0,r.summon.hp);
 var st=stats();
 r.mp=Math.min(st.mp,r.mp+7+bonus('manaFloor'));
 r.ep+=bonus('epFloor');
 r.poisonTurns=0;
 var revealCount=Math.floor(bonus('revealFloor'));
 var unseen=r.tiles.filter(function(t){return !t.revealed;});
 for(var i=0;i<revealCount&&unseen.length;i++){
   var chosen=unseen.splice(rand(0,unseen.length-1),1)[0];
   chosen.revealed=true;
 }
 log('Этаж '+r.floor+'. «'+maxFloorLabel()+'». Под плитами скрыты опасности и находки.');
}
function begin(hero){
 var meta=s.meta;
 r=s.run={class:hero,floor:1,turn:0,gold:20,ep:1,kills:0,secrets:0,
    hp:1,mp:1,items:[],equip:{weapon:null,helm:null,shoulders:null,armor:null,gloves:null,belt:null,legs:null,boots:null,relic:null},bagSelected:null,bagFilter:'all',treeView:hero==='necromancer'?1:hero==='scout'?2:0,key:false,
    talents:{},scrolls:{bolt:4,flame:1,heal:2,frost:1,ward:1,chain:0,sight:1,leech:0},
    potions:3,summon:null,shield:0,blessed:0,poisonTurns:0,tiles:[],log:[],tab:'maze',
    skillUsed:-100,skillTurns:0,eventIndex:0,floorFlags:[],mastered:0};
 ['weapon','armor','relic'].forEach(function(slot){
  var i=newItem(slot,1,0);r.items.push(i);r.equip[slot]=i.id;
 });
 r.hp=stats().hp;r.mp=stats().mp;
 startFloor();save();draw();close();
}
function fresh(){s={version:1,seq:0,meta:{souls:0,best:0,runs:0,upgrades:{hp:0,atk:0,mp:0},secrets:[],heroRanks:{necromancer:0,executioner:0,scout:0},heroEssence:{necromancer:0,executioner:0,scout:0},relics:{},bestiary:{},milestones:{},totalSecrets:0,bossKills:0},run:null};r=null;}
function load(){
 try{var v=JSON.parse(localStorage.getItem(KEY)||'null');if(!v||v.version!==1||!v.meta||!v.meta.upgrades)return null;
 if(v.run&&(!C[v.run.class]||!Array.isArray(v.run.tiles)||!Array.isArray(v.run.items)||!v.run.equip))return null;
 var meta=v.meta;
 for(var x of ['heroRanks','heroEssence','relics','bestiary','milestones'])if(!meta[x])meta[x]={};
 for(var hero of Object.keys(C)){if(!meta.heroRanks[hero])meta.heroRanks[hero]=0;if(!meta.heroEssence[hero])meta.heroEssence[hero]=0;}
 if(!meta.totalSecrets)meta.totalSecrets=0;
 if(!meta.bossKills)meta.bossKills=0;
 if(v.run){for(var k of Object.keys(SLOT))if(!(k in v.run.equip))v.run.equip[k]=null;
  if(v.run.treeView==null)v.run.treeView=0;if(!v.run.bagFilter)v.run.bagFilter='all';
  if(!v.run.poisonTurns)v.run.poisonTurns=0;
  for(var enemyTile of v.run.tiles){if(enemyTile.foe&&enemyTile.foe.hp>0){var enemy=enemyTile.foe;enemy.skill=EX.monster(enemy.id);if(enemy.cooldown==null)enemy.cooldown=enemy.skill.every;if(enemy.guard==null)enemy.guard=0;}}
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
 $('portrait').innerHTML=window.CryptArt.miniHero(r.class);
 document.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===r.tab);});
}
function section(title,extra){return '<div class="section-head"><h2>'+title+'</h2><span class="fine muted">'+(extra||'')+'</span></div>';}
function frame(title,content,side){return '<section class="frame"><div class="frame-title">'+title+'<small>'+(side||'')+'</small></div>'+content+'</section>';}
function activeTileView(t){
 var kind=t.kind,alive=t.foe&&t.foe.hp>0,drop=!!t.drops;
 if(t.revealed&&kind==='start')return '<div class="tile tile-player" aria-label="Позиция героя">'+window.CryptArt.miniHero(r.class)+'</div>';
 var empty=t.revealed&&!alive&&!drop&&(t.cleared||kind==='empty');
 if(t.revealed&&empty){
  return '<div class="tile tile-bare" aria-label="Пустой каменный пол"><span class="stone-joint"></span></div>';
 }
 if(!t.revealed){
  return '<button class="tile hidden" data-action="reveal" data-id="'+t.id+'" aria-label="Раскрыть каменную плиту"><span class="slab-face">✥</span></button>';
 }
 var marker=alive?'enemy':drop?(t.drops.key?'key':'loot'):kind==='exit'?'exit':kind==='puzzle'?'event':kind;
 var iconCode=marker==='key'||marker==='loot'?window.CryptArt.tileBase(marker):icon(marker,alive?t.foe.id:null);
 var name=alive?t.foe.name:marker==='key'?'Ключ от лестницы':marker==='loot'?'Награда за бой':
  ({exit:'Лестница',chest:'Сундук',trap:'Шипы',altar:'Алтарь',shop:'Торговец',secret:'Тайник',coin:'Монеты',potion:'Эликсир',event:'Событие',puzzle:'Загадка'})[kind]||'Находка';
 var act=alive?'strike':kind==='exit'?'descend':'pickup';
 return '<button class="tile tile-discovered tile-'+marker+(alive?' tile-danger':'')+'" data-action="'+act+'" data-id="'+t.id+'" aria-label="'+esc(name)+'" title="'+esc(name)+'">'+iconCode+
 (alive?'<span class="tile-hp"><i style="width:'+pct(t.foe.hp,t.foe.maxHp)+'%"></i></span>':'')+
 (drop&&t.drops.key?'<span class="tile-number">⚿</span>':'')+
 '</button>';
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
 var focus=target(),foe=focus&&focus.foe,turns=r.turn-r.skillUsed;
 var sceneTitle=maxFloorLabel();
 var footer=foe?
   '<div class="dungeon-foe-icon">'+icon('enemy',foe.id)+'</div><div class="dungeon-foe-info"><strong>'+esc(foe.name)+(foe.boss?' · БОСС':'')+'</strong>'+
    '<div class="mini-meter"><i style="width:'+pct(foe.hp,foe.maxHp)+'%"></i></div>'+
    '<small>'+foe.hp+'/'+foe.maxHp+' HP · '+foe.atk+' ATK · '+foe.def+' DEF</small></div>'+
    '<button class="btn small" data-action="strike" data-id="'+focus.id+'">⚔ Удар</button>'
   :'<div class="dungeon-quiet"><b>✥ '+(r.log[0]?esc(r.log[0]):'Здесь царит тишина')+'</b><small>Открывайте плитки и забирайте найденное повторным нажатием</small></div>';
 var summon=(r.summon&&r.summon.hp>0)?'<div class="dungeon-summon">☠ '+r.summon.name+' '+r.summon.hp+'/'+r.summon.maxHp+'</div>':'';
 return '<div class="dungeon-root">'+
 '<div class="dungeon-header"><div><span class="subhead">ЭТАЖ '+r.floor+' · '+sceneTitle+'</span>'+
 '<div class="dungeon-progress">Плит '+exposed+'/25 · Врагов '+hiddenEnemies().length+' · Ход '+r.turn+'</div></div>'+
 '<div class="dungeon-key '+(r.key?'found':'')+'">'+(r.key?'⚿ Ключ найден':'⚿ Найдите ключ')+'</div></div>'+
 '<div class="dungeon-board"><div class="dungeon-border"><div class="maze">'+r.tiles.map(activeTileView).join('')+'</div></div></div>'+
 '<div class="dungeon-footer">'+
 '<div class="dungeon-encounter">'+footer+'</div>'+summon+
 '<div class="dungeon-buttons">'+
 '<button class="dungeon-action special" data-action="skill" '+(turns<(r.class==='executioner'?4:5)?'disabled':'')+'><span>'+(r.class==='necromancer'?'☠':r.class==='executioner'?'⚔':'◉')+'</span><small>'+(r.class==='necromancer'?'Призыв':r.class==='executioner'?'Казнь':'Разведка')+'</small></button>'+
 '<button class="dungeon-action" data-tab="spells"><span>✣</span><small>Магия</small></button>'+
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
  '<div class="gear-center"><div class="gear-portrait">'+window.CryptArt.hero(r.class)+'</div>'+
   '<div class="gear-hero-name">'+c.name+'</div><small>'+c.title+'</small></div>'+
  '<div class="gear-slots gear-right">'+right.map(gearSlotButton).join('')+'</div></div>'+
  '<p class="fine muted space-top">Нажмите ячейку экипировки, чтобы открыть сумку с подходящими предметами.</p>')+
 frame('ХАРАКТЕРИСТИКИ',statsHtml)+
 frame('ОТРЯД И ПУТЬ','<div class="kpis"><div><b>'+r.floor+'</b><small>Этаж</small></div><div><b>'+r.kills+'</b><small>Убийств</small></div><div><b>'+r.secrets+'</b><small>Тайн</small></div></div>'+
 (r.summon?'<p class="fine golden space-top">☠ Ваш скелет: '+r.summon.hp+' HP, '+r.summon.atk+' ATK</p>':'')+
 '<button class="btn alt wide space-top" data-action="camp">Память предков</button>')+
 '<div class="btnrow"><button class="btn dark wide" data-action="abandon">Завершить забег</button></div>';
}
function manaCost(sp){return Math.max(1,sp.cost-bonus('manaDiscount'));}
function spellValid(sp){
 if(r.mp<manaCost(sp))return 'Недостаточно маны';
 if((r.scrolls[sp.id]||0)<1)return 'Нет свитков';
 if(['attack','burn','stun','chain','drain'].indexOf(sp.kind)>=0&&!enemies().length)return 'Нет цели';
 if(sp.kind==='reveal'&&!r.tiles.some(function(t){return !t.revealed;}))return 'Всё открыто';
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
      (!ok?'<span class="need-title">Нужен: '+esc((TALENTS.find(function(p){return p.id===t.parent;})||{}).name||'?')+'</span>':'')+'</button>';
   }).join('')+'</div></div>';
 }).join('');
 return section('Пути титулов','✧ '+r.ep)+
 '<div class="tree-choice">'+treeButtons+'</div>'+
 '<div class="title-tree-info"><div><strong>'+names[tree]+'</strong><small>5 ступеней · 15 титулов · 3 улучшения каждого</small></div>'+
  '<span>'+progress+'/15</span></div>'+
 '<div class="title-tree">'+ranks+'</div>'+
 '<p class="fine muted center">Развивайте один из доступных путей, затем выбирайте ответвления. Ветви можно изучать параллельно.</p>';
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
 return section('Инвентарь',r.items.length+'/30')+
 '<div class="bag-filter-scroll">'+quick+'</div>'+
 frame('СНАРЯЖЕНИЕ ДЛЯ ВЫБОРА',filtered.length?'<div class="grid4">'+itemGrid(filtered)+'</div>':'<div class="empty">Предметов в этом слоте пока нет.</div>')+
 frame('СРАВНЕНИЕ СНАРЯЖЕНИЯ',comparison||'<div class="empty">Выберите предмет в сумке.</div>')+
 frame('ПРИПАСЫ','<div class="kpis"><div><b>'+r.potions+'</b><small>Эликсиров</small></div>'+
 '<div><b>'+Object.values(r.scrolls).reduce(function(a,b){return a+b;},0)+'</b><small>Свитков</small></div>'+
 '<div><b>'+r.gold+'</b><small>Монет</small></div></div>'+
 '<button class="btn alt wide space-top" data-action="potion" '+(r.potions?'':'disabled')+'>Выпить эликсир (+45% HP)</button>');
}
function renderMenu(){
 return '<div class="emblem">✥</div><div class="subhead">НАСТРОЙКИ ЭКСПЕДИЦИИ</div><h2>ДОРОГА ВО МГЛУ</h2>'+
 '<p>Игра полностью автономна. Сохранение находится только на этом устройстве.</p>'+
 '<div class="btnrow"><button class="btn" data-action="close">Вернуться</button><button class="btn alt" data-action="camp">Память предков</button></div>'+
 '<button class="btn dark wide space-top" data-action="abandon">Завершить забег</button>';
}
function draw(){
 if(!s)return;
 hud();if(!r){$('content').classList.remove('dungeon-mode');$('content').innerHTML=section('Записки выживших','Лагерь')+
 '<div class="scene">'+window.CryptArt.room(0,1)+'<div class="banner-label">Место, где всё начинается снова.</div></div>'+
 frame('НОВАЯ ЭКСПЕДИЦИЯ','<p class="fine muted">Выберите одного из трёх героев. Каждый забег создаёт новый лабиринт, но полученные осколки памяти позволяют усиливать будущие походы.</p>'+
 '<button class="btn wide space-top" data-action="choose">Выбрать героя</button>')+
 frame('ЛЕТОПИСЬ','<div class="kpis"><div><b>'+s.meta.runs+'</b><small>Забегов</small></div><div><b>'+s.meta.best+'</b><small>Лучший этаж</small></div><div><b>'+s.meta.souls+'</b><small>Осколков</small></div></div><button class="btn alt wide space-top" data-action="camp">Память предков</button>');return;}
 $('content').classList.toggle('dungeon-mode',r.tab==='maze');
 $('content').innerHTML=r.tab==='maze'?renderMaze():r.tab==='hero'?renderHero():r.tab==='spells'?renderSpells():r.tab==='talents'?renderTalents():renderBag();
}
function toast(msg){
 var el=$('toast');el.textContent=msg;el.classList.add('shown');
 clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('shown');},2400);
}
function dialog(content){$('overlay').innerHTML='<div class="veil"><div class="dialog">'+content+'</div></div>';}
function close(){$('overlay').innerHTML='';}
function choose(){
 var opts=Object.keys(C).map(function(k){
  var c=C[k];return '<button class="class-option" data-action="begin" data-id="'+k+'">'+window.CryptArt.hero(k)+
 '<span><strong>'+c.icon+' '+c.name+'</strong><small>'+c.description+'</small></span></button>';
 }).join('');
 dialog('<div class="emblem">✥</div><div class="subhead">ПЕПЕЛЬНЫЙ ЛАБИРИНТ · 0.1</div><h2>ВЫБОР ПУТИ</h2>'+
 '<p>Три архетипа. Один бесконечный спуск. Всё, что вы потеряете, останется под землёй — кроме памяти.</p>'+opts+
 '<p class="fine muted">Скрытые клетки · Пошаговый бой · Магия · Призыв · Древа титулов</p>'+
 '<button class="btn dark wide" data-action="close">Закрыть</button>');
}
function upgradeCost(i){return 9+(i.plus+1)*7+i.rarity*4;}
function consumeTurn(){
 if(!r)return false;
 r.turn++;
 if(r.blessed>0)r.blessed--;
 var alive=enemies();
 if(r.summon&&r.summon.hp>0&&alive.length){
  var victim=alive[0],hit=Math.max(1,r.summon.atk-victim.foe.def-Math.max(0,victim.foe.guard||0));
  r.summon.specialCooldown=Math.max(0,(r.summon.specialCooldown||4)-1);
  if(r.summon.specialCooldown===0){hit+=Math.max(3,Math.floor(r.summon.atk*.45));r.summon.specialCooldown=4;
   log('Скелет применяет «Гробовой раскол».');}
  victim.foe.hp-=hit;log('Скелет поражает '+victim.foe.name+': '+hit+'.');
  if(victim.foe.hp<=0)kill(victim);
 }
 if(r.poisonTurns>0){r.poisonTurns--;var poison=Math.max(2,Math.floor(2+r.floor*.5));
  r.hp=Math.max(0,r.hp-poison);log('Яд обжигает кровь: −'+poison+' HP.');}
 alive=enemies();
 alive.slice(0,4).forEach(function(t){
  var e=t.foe;
  if(e.stun>0){e.stun--;log(e.name+' оглушён.');return;}
  if(e.burn>0){e.burn--;e.hp-=Math.max(2,Math.floor(stats().pow*.48)+bonus('burnDamage'));if(e.hp<=0){kill(t);return;}}
  var spec=e.skill||EX.monster(e.id),ready=(e.cooldown||spec.every)<=1;
  e.cooldown=ready?spec.every:(e.cooldown||spec.every)-1;
  var amount=Math.max(1,e.atk+rand(-2,2)-stats().def-bonus('damageFlat')-Math.floor(r.blessed));
  if(ready){
    log(e.name+' применяет «'+spec.name+'».');
    if(spec.kind==='bite')amount=Math.ceil(amount*1.65);
    if(spec.kind==='guard')e.guard=3+Math.ceil(r.floor/5);
    if(spec.kind==='curse')amount=Math.max(3,Math.ceil(e.atk*.95));
    if(spec.kind==='double')amount=Math.max(2,amount*2);
    if(spec.kind==='poison')r.poisonTurns=2;
    if(spec.kind==='slam')amount=Math.ceil(amount*1.85);
  }
  if(Math.random()*100<stats().dodge){log('Вы уклонились от '+e.name+'.');return;}
  if(r.summon&&r.summon.hp>0&&Math.random()<.72){
   var summonDamage=Math.max(1,amount-(r.summon.def||0));
   r.summon.hp=Math.max(0,r.summon.hp-summonDamage);
   log('Скелет перехватывает '+summonDamage+' урона.');
   if(!r.summon.hp){log('Призванный скелет рассыпался.');r.summon=null;}
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
 r.hp=Math.min(stats().hp,r.hp+bonus('killHeal'));
 var drop={key:!!t.hasKey,gold:e.gold,gear:null,scroll:null,potion:0};
 if(e.boss){drop.gear={slot:pick(Object.keys(SLOT)),rarity:Math.max(2,rarityRoll())};drop.potion=1;r.ep+=4;}
 else {
  if(Math.random()<.23+bonus('lootChance')*.01){drop.gear={slot:pick(Object.keys(SLOT)),rarity:rarityRoll()};}
  else if(Math.random()<.33){drop.scroll=pick(SPELLS).id;}
 }
 t.drops=drop;
 if(drop.key)log('Ключник повержен! На полу лежит ключ от лестницы.');
 log('Победа: '+e.name+' · +'+e.ep+(e.boss?' (+4)':'')+' ✧. Награды остались на клетке.');
}
function strike(tid){
 var t=tile(tid),st=stats();if(!t||!t.revealed||!t.foe||t.foe.hp<=0)return;
 var critical=Math.random()*100<st.crit;
 var amount=Math.max(1,st.atk+rand(0,3)-t.foe.def-(t.foe.guard||0));
 t.foe.guard=0;
 if(t.foe.boss)amount=Math.floor(amount*(1+bonus('bossDamage')*.01));
 if(critical)amount=Math.floor(amount*(1.6+bonus('critDamage')*.01));
 t.foe.hp-=amount;
 log('Удар по '+t.foe.name+': '+amount+(critical?' КРИТ!':'')+'.');
 if(t.foe.hp<=0)kill(t);
 finishAction();
}
function finishAction(){if(!r)return;if(consumeTurn()){}if(r){draw();save();}}
function useSkill(){
 if(r.turn-r.skillUsed<(r.class==='executioner'?4:5)){toast('Умение ещё восстанавливается.');return;}
 var targetTile=target();var st=stats();
 if(r.class==='necromancer'){
  if(r.mp<8){toast('Нужно 8 маны.');return;}
  r.mp-=8;r.summon={name:'Костяной страж',def:2,specialCooldown:4,maxHp:32+Math.floor(st.pow*.9)+14*lvl('ritual')+bonus('summonHp')+EX.mastery(s.meta,r.class)*9,
   hp:32+Math.floor(st.pow*.9)+14*lvl('ritual')+bonus('summonHp')+EX.mastery(s.meta,r.class)*9,
 atk:5+Math.floor(st.pow*.35)+4*lvl('ritual')+bonus('summonAtk')+EX.mastery(s.meta,r.class)*3};
  r.skillUsed=r.turn;log('Некромант призывает скелета из могильной пыли.');
 }else if(r.class==='executioner'){
  if(!targetTile){toast('Нужен враг для удара.');return;}
  if(r.mp<4){toast('Нужно 4 маны.');return;}
  r.mp-=4;
  var dmg=Math.max(3,Math.floor(st.atk*2.15)-targetTile.foe.def);
  targetTile.foe.hp-=dmg;
  r.shield+=Math.floor(st.def*1.8)+7;
  log('Казнящий удар наносит '+dmg+' урона. Защитная стойка.');
  if(targetTile.foe.hp<=0)kill(targetTile);
  r.skillUsed=r.turn;
 }else{
  if(r.mp<6){toast('Нужно 6 маны.');return;}
  r.mp-=6;r.skillUsed=r.turn;
  var list=r.tiles.filter(function(t){return !t.revealed;});
  var n=0;for(var i=0;i<3&&list.length;i++){
   var p=rand(0,list.length-1),t=list.splice(p,1)[0];
   // Scout reveals danger from a distance without triggering it.
   t.revealed=true;n++;
  }
  var coin=addGold(4+r.floor*2);
  log('Следопыт видит сквозь стены: открыто '+n+' клеток и найдено '+coin+' монет.');
 }
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
 var sp=SPELLS.find(function(x){return x.id===id;});if(!sp)return;
 var error=spellValid(sp);if(error){toast(error);return;}
 r.scrolls[id]--;r.mp-=manaCost(sp);
 var tar=target(),st=stats();
 var magic=Math.floor((sp.base+st.pow*1.45)*(1+bonus('spellDamage')*.01));
 if(sp.kind==='heal'){r.hp=Math.min(st.hp,r.hp+magic);log(sp.name+': восстановлено '+magic+' HP.');}
 else if(sp.kind==='shield'){r.shield+=magic;log('Магическая защита: '+magic+' щита.');}
 else if(sp.kind==='reveal'){
  var covered=r.tiles.filter(function(t){return !t.revealed;});var count=0;
  for(var j=0;j<sp.base&&covered.length;j++){var index=rand(0,covered.length-1);covered.splice(index,1)[0].revealed=true;count++;}
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
function claimTile(t){
 if(!t||!t.revealed||t.cleared)return;
 var kind=t.kind,lines=[],pending=t.drops||null;
 if(pending){
   if(pending.key){r.key=true;lines.push('<strong>⚿ Ключ от лестницы</strong>');}
   if(pending.gold){var found=addGold(pending.gold);lines.push('<strong>◈ '+found+' монет</strong>');}
   if(pending.potion){r.potions+=pending.potion;lines.push('<strong>✚ '+pending.potion+' целебный эликсир</strong>');}
   if(pending.scroll){r.scrolls[pending.scroll]=(r.scrolls[pending.scroll]||0)+1;
    var spell=SPELLS.find(function(sp){return sp.id===pending.scroll;});
    lines.push('<strong>✣ Свиток «'+esc(spell.name)+'»</strong>');}
   if(pending.gear){var drop=addItem(pending.gear.slot,pending.gear.rarity);
    if(drop)lines.push('<div class="loot-gear">'+window.CryptArt.item(drop.slot,drop.rarity)+
     '<span><strong>'+esc(drop.name)+'</strong><small>'+RARITY[drop.rarity]+' · '+SLOT[drop.slot]+'</small></span></div>');}
   t.drops=null;t.cleared=true;log('Награды подобраны с клетки.');finishAction();
   if(r)rewardDialog('Трофеи битвы',lines);return;
 }
 if(kind==='chest'){
  var money=addGold(Math.round((rand(6,14)+r.floor*2)*(1+bonus('chestGold')*.01)));
  lines.push('<strong>◈ '+money+' монет</strong>');
  if(Math.random()<.8){var item=addItem(pick(Object.keys(SLOT)),null);
   if(item)lines.push('<div class="loot-gear">'+window.CryptArt.item(item.slot,item.rarity)+
     '<span><strong>'+esc(item.name)+'</strong><small>'+RARITY[item.rarity]+' · '+SLOT[item.slot]+'</small></span></div>');
  }else{r.potions++;lines.push('<strong>✚ Лечебный эликсир</strong>');}
  t.cleared=true;log('Сундук открыт. Содержимое отправлено в сумку.');finishAction();
  if(r)rewardDialog('Старинный сундук',lines);return;
 }
 if(kind==='coin'){var gold=addGold(rand(9,18)+r.floor*2);lines.push('<strong>◈ '+gold+' монет</strong>');
   t.cleared=true;finishAction();if(r)rewardDialog('Монеты под плитой',lines);return;}
 if(kind==='potion'){r.potions++;lines.push('<strong>✚ Целебный эликсир</strong>');
   t.cleared=true;finishAction();if(r)rewardDialog('Запечатанный флакон',lines);return;}
 if(kind==='trap'){
   t.cleared=true;
   var reduction=clamp(1-bonus('trapReduce')*.01,0,.95);
   var dmg=Math.max(0,Math.floor((7+r.floor*2)*reduction*(r.class==='scout'?.55:1)));
   r.hp=Math.max(0,r.hp-dmg);log('Вы обезвредили ловушку, но получили '+dmg+' урона.');
   finishAction();return;
 }
 if(kind==='secret'){t.cleared=true;discoverSecret();finishAction();return;}
 if(kind==='altar'){t.cleared=true;showAltar();finishAction();return;}
 if(kind==='shop'){t.cleared=true;showShop();finishAction();return;}
 if(kind==='puzzle'){t.cleared=true;showPuzzle();finishAction();return;}
 if(kind==='event'){t.cleared=true;eventRandom();finishAction();return;}
}
function reveal(id){
 var t=tile(id);if(!t||t.revealed)return;
 t.revealed=true;
 var k=t.kind;
 if(k==='enemy'||k==='boss')log('Открыта плита: '+t.foe.name+'.');
 else if(k==='empty'){t.cleared=true;log('Под плитой — пустой каменный пол.');}
 else if(k==='exit')log('Лестница найдена. Для спуска необходим ключ.');
 else if(k==='start'){t.cleared=true;}
 else log('Под камнем обнаружено: '+({chest:'сундук',coin:'монеты',potion:'флакон',trap:'ловушка',altar:'алтарь',secret:'тайник',shop:'лавка',puzzle:'загадка',event:'странное событие'}[k]||'находка')+'. Коснитесь предмета, чтобы взаимодействовать.');
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
function gainSecret(e){
 r.secrets++;r.ep+=bonus('secretEp');
 if(s.meta.secrets.indexOf(e.title)===-1)s.meta.secrets.push(e.title);
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
function die(){
 if(!r)return;
 var depth=r.floor,kills=r.kills,secret=r.secrets;
 var gain=3+depth*2+Math.floor(kills/3)+secret*2;
 s.meta.souls+=gain;s.meta.best=Math.max(s.meta.best,depth);s.meta.runs++;
 s.run=null;r=null;save();draw();
 dialog('<div class="emblem">☠</div><div class="subhead red">ЭКСПЕДИЦИЯ ЗАВЕРШЕНА</div><h2>ПЕПЕЛ ПОМНИТ</h2>'+
 '<p>Ваш след оборвался в подземелье. Но смерть принесла знание, которое останется после любого забега.</p>'+
 '<div class="kpis space-bottom"><div><b>'+depth+'</b><small>Этаж</small></div><div><b>'+kills+'</b><small>Побед</small></div><div><b>+'+gain+'</b><small>Памяти</small></div></div>'+
 '<button class="btn wide" data-action="choose">НОВАЯ ЭКСПЕДИЦИЯ</button>'+
 '<button class="btn alt wide space-top" data-action="camp">Память предков</button>');
}
function abandon(){
 if(!r){close();return;}
 dialog('<div class="emblem">☠</div><h2>ЗАКОНЧИТЬ ЭКСПЕДИЦИЮ?</h2><p>Забег закончится. Полученные осколки памяти останутся, остальные вещи и таланты пропадут.</p>'+
 '<div class="btnrow"><button class="btn alt" data-action="close">Продолжить</button><button class="btn" data-action="confirm-end">Закончить</button></div>');
}
function camp(){
 var m=s.meta,up=m.upgrades;
 function line(key,name,bonus){var price=5+up[key]*4;return '<div class="row space-bottom"><span class="fine">'+name+'<br><span class="muted">Ранг '+up[key]+'/5 · '+bonus+'</span></span>'+
 '<button class="btn small" data-action="permanent" data-id="'+key+'" '+(m.souls<price||up[key]>=5?'disabled':'')+'>'+price+' ✧</button></div>';}
 dialog('<div class="emblem">✥</div><div class="subhead">ПОСТОЯННЫЕ УЛУЧШЕНИЯ</div><h2>ПАМЯТЬ ПРЕДКОВ</h2>'+
 '<p>Осколков памяти: <b class="golden">'+m.souls+'</b>. Они переживают смерть и дают преимущества всем героям в новых забегах.</p>'+
 line('hp','Крепкое тело','+12 HP за ранг')+line('atk','Стальное наследие','+2 ATK за ранг')+line('mp','Тайная мудрость','+8 MP за ранг')+
 '<button class="btn alt wide" data-action="close">Вернуться</button>');
}
function permanent(id){
 var ups=s.meta.upgrades;if(!Object.prototype.hasOwnProperty.call(ups,id))return;
 var n=ups[id],cost=5+n*4;if(n>=5||s.meta.souls<cost)return;
 s.meta.souls-=cost;ups[id]++;
 if(r){if(id==='hp')r.hp+=12;if(id==='mp')r.mp+=8;}
 save();camp();draw();
}
function action(name,id){
 if(name==='close'){close();return;}
 if(name==='menu'){dialog(renderMenu());return;}
 if(name==='choose'){choose();return;}
 if(name==='begin'){if(C[id])begin(id);return;}
 if(name==='camp'){camp();return;}
 if(name==='permanent'){permanent(id);return;}
 if(name==='abandon'){abandon();return;}
 if(name==='confirm-end'){die();return;}
 if(!r)return;
 if(name==='reveal'){reveal(id);return;}
 if(name==='pickup'){claimTile(tile(id));return;}
 if(name==='strike'){strike(id);return;}
 if(name==='descend'){descend();return;}
 if(name==='inspect-tile'){inspectTile(id);return;}
 if(name==='skill'){useSkill();return;}
 if(name==='potion'){potion();return;}
 if(name==='wait'){wait();return;}
 if(name==='cast'){cast(id);return;}
 if(name==='talent'){gainTalent(id);return;}
 if(name==='tree'){r.treeView=clamp(Number(id)||0,0,2);draw();save();return;}
 if(name==='bag-filter'){r.bagFilter=id||'all';r.bagSelected=null;draw();save();return;}
 if(name==='item-select'){r.bagSelected=Number(id);draw();return;}
 if(name==='inspect-slot'){r.bagFilter=SLOT[id]?id:'all';r.bagSelected=r.equip[id]||null;r.tab='bag';draw();save();return;}
 if(name==='inspect-item'){r.bagSelected=Number(id);r.bagFilter=(item(id)||{}).slot||'all';r.tab='bag';draw();save();return;}
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
 var b=e.target.closest('[data-action],[data-tab]');if(!b)return;e.preventDefault();
 if(b.dataset.tab){if(r){r.tab=b.dataset.tab;$('content').scrollTop=0;draw();save();}return;}
 action(b.dataset.action,b.dataset.id);
});
window.Crypt={save:save,back:function(){
 if($('overlay').innerHTML){close();return;}
 if(r&&r.tab!=='maze'){r.tab='maze';draw();return;}
 toast('Лабиринт хранит ваши следы.');
 },state:function(){return s;},debug:{action:action,draw:draw,stats:stats,finish:finishAction}};
s=load();
if(!s)fresh();r=s.run;
draw();
if(!r)choose();
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',function(){if(document.hidden)save();});
setInterval(save,7000);
})();