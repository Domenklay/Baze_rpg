/* Пепельный лабиринт: offline, original roguelite. No external calls. */
(function(){
'use strict';
var KEY='cryptbound_local_v1',s=null,toastTimer=0;
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
var SLOT={weapon:'Оружие',armor:'Броня',relic:'Реликвия'};
var ITEM_NAMES={
 weapon:['Сколотая сабля','Жертвенный клинок','Коса сборщика','Меч без присяги','Клинок холодной стали','Костяной посох'],
 armor:['Могильная кольчуга','Хитон отступника','Нагрудник дозорного','Доспех раскаяния','Панцирь чёрной смолы'],
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
var TALENTS=[
 {id:'blade',tree:0,rank:0,name:'Крепкая рука',icon:'⚔',desc:'Атака +3 за ранг.'},
 {id:'iron',tree:0,rank:1,name:'Стальная воля',icon:'♜',desc:'Броня +2 за ранг.'},
 {id:'vamp',tree:0,rank:2,name:'Кровопийца',icon:'☽',desc:'Каждое убийство лечит 4 HP за ранг.'},
 {id:'mind',tree:1,rank:0,name:'Мудрость',icon:'✣',desc:'Мощь магии +3 за ранг.'},
 {id:'reserve',tree:1,rank:1,name:'Источник маны',icon:'◈',desc:'Макс. мана +12 за ранг.'},
 {id:'ritual',tree:1,rank:2,name:'Ритуал смерти',icon:'☠',desc:'Скелет сильнее на 4 атаки и 14 HP за ранг.'},
 {id:'fortune',tree:2,rank:0,name:'Охотник за тайнами',icon:'✥',desc:'Больше монет (+15% за ранг).'},
 {id:'endure',tree:2,rank:1,name:'Тяжёлая поступь',icon:'❖',desc:'Макс. здоровье +18 за ранг.'},
 {id:'seeker',tree:2,rank:2,name:'Острое зрение',icon:'◉',desc:'Ловушки слабее на 25% за ранг.'}
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
function levelTheme(){return Math.floor((r.floor-1)/4)%4;}
function maxFloorLabel(){return THEMES[levelTheme()][0];}
function lvl(n){return (r.talents[n]||0);}
function levelCost(t){return 1+t.rank+(r.talents[t.id]||0);}
function talentsByTree(tree){return TALENTS.filter(function(x){return x.tree===tree;});}
function equipped(id){return Object.values(r.equip).some(function(v){return v===Number(id);});}
function item(id){return r.items.find(function(x){return x.id===Number(id);})||null;}
function equippedItem(slot){return item(r.equip[slot]);}
function stats(){
 var c=C[r.class],e=r.equip;
 var a=c.atk+(r.floor-1)*1.1+3*lvl('blade')+(s.meta.upgrades.atk*2),def=c.def+2*lvl('iron');
 var hp=c.hp+18*lvl('endure')+s.meta.upgrades.hp*12;
 var mp=c.mp+12*lvl('reserve')+s.meta.upgrades.mp*8,pow=c.pow+3*lvl('mind'),crit=c.crit;
 Object.keys(e).forEach(function(slot){
  var i=equippedItem(slot);if(!i)return;
  a+=i.atk||0;def+=i.def||0;hp+=i.hp||0;mp+=i.mp||0;pow+=i.pow||0;crit+=i.crit||0;
 });
 return {atk:Math.floor(a),def:def,hp:hp,mp:mp,pow:pow,crit:crit};
}
function newItem(slot,floor,rarity){
 var z=rarity==null?rarityRoll():rarity;
 var bonus=1+z*.38;
 var i={id:++s.seq,slot:slot,rarity:z,name:pick(ITEM_NAMES[slot]),plus:0,floor:floor,atk:0,def:0,hp:0,mp:0,pow:0,crit:0};
 if(slot==='weapon'){i.atk=Math.round((3+floor*1.55+rand(0,3))*bonus);if(z>1)i.pow=1+z*2;}
 if(slot==='armor'){i.def=Math.round((1+floor*.62+rand(0,2))*bonus);i.hp=Math.round((10+floor*3)*bonus);}
 if(slot==='relic'){i.pow=Math.round((2+floor*.75)*bonus);i.mp=Math.round((7+floor*2)*bonus);if(z>1)i.crit=z;}
 return i;
}
function rarityRoll(){var n=rand(1,100);return n<=2?4:n<=9?3:n<=25?2:n<=58?1:0;}
function addItem(slot,rarity){
 var i=newItem(slot,r.floor,rarity);
 if(r.items.length>=30){r.gold+=10+r.floor*2;log('Сумка переполнена. Добыча обменяна на монеты.');return null;}
 r.items.push(i);log('Найдено: '+i.name+' ('+RARITY[i.rarity]+').');return i;
}
function bonusGold(n){return Math.round(n*(1+lvl('fortune')*.15));}
function addGold(n){n=bonusGold(n);r.gold+=n;return n;}
function mkEnemy(boss){
 var src=boss?{id:'boss',name:BOSSES[Math.floor((r.floor-1)/5)%BOSSES.length],hp:95,atk:12,def:3,ep:9,gold:30}:pick(MOBS.slice(0,Math.min(6,2+Math.ceil(r.floor/2))));
 var scale=1+(r.floor-1)*.18;
 var ehp=Math.floor(src.hp*scale*(boss?1.55:1)),eatk=Math.floor(src.atk*(1+(r.floor-1)*.13)),edef=src.def+Math.floor((r.floor-1)*.32);
 return {id:src.id,name:src.name,hp:ehp,maxHp:ehp,atk:eatk,def:edef,ep:src.ep+(boss?Math.floor(r.floor/2):0),gold:src.gold+Math.floor(r.floor*1.3),boss:!!boss,burn:0,stun:0};
}
function distributeTiles(){
 var types=[];
 for(var i=0;i<25;i++)types.push('empty');
 var positions=Array.from({length:25},function(_,i){return i;});
 for(var j=positions.length-1;j>0;j--){var k=rand(0,j),temp=positions[j];positions[j]=positions[k];positions[k]=temp;}
 var pos=0;
 function insert(kind,count){
  for(var t=0;t<count;t++){var loc=positions[pos++];types[loc]=kind;}
 }
 insert('start',1);insert('exit',1);
 insert('enemy',r.floor%5===0?5:6+(r.floor>6?1:0));
 if(r.floor%5===0)insert('boss',1);
 insert('chest',2);insert('trap',2);
 insert('altar',1);insert('shop',1);
 insert('event',2);insert('puzzle',1);
 insert('secret',1);insert('coin',2);insert('potion',1);
 return types.map(function(kind,idx){return {id:idx,kind:kind,revealed:kind==='start',cleared:kind==='start',foe:kind==='enemy'||kind==='boss'?mkEnemy(kind==='boss'):null};});
}
function startFloor(){
 r.tiles=distributeTiles();r.shield=0;r.blessed=0;
 if(r.summon)r.summon.hp=Math.max(0,r.summon.hp);
 var st=stats();
 r.mp=Math.min(st.mp,r.mp+7);
 log('Этаж '+r.floor+'. «'+maxFloorLabel()+'». За стенами кто-то шевелится.');
}
function begin(hero){
 var meta=s.meta;
 r=s.run={class:hero,floor:1,turn:0,gold:20,ep:1,kills:0,secrets:0,
    hp:1,mp:1,items:[],equip:{weapon:null,armor:null,relic:null},bagSelected:null,
    talents:{},scrolls:{bolt:4,flame:1,heal:2,frost:1,ward:1,chain:0,sight:1,leech:0},
    potions:3,summon:null,shield:0,blessed:0,tiles:[],log:[],tab:'maze',
    skillUsed:-100,skillTurns:0,eventIndex:0,floorFlags:[],mastered:0};
 ['weapon','armor','relic'].forEach(function(slot){
  var i=newItem(slot,1,0);r.items.push(i);r.equip[slot]=i.id;
 });
 r.hp=stats().hp;r.mp=stats().mp;
 startFloor();save();draw();close();
}
function fresh(){s={version:1,seq:0,meta:{souls:0,best:0,runs:0,upgrades:{hp:0,atk:0,mp:0},secrets:[]},run:null};r=null;}
function load(){
 try{var v=JSON.parse(localStorage.getItem(KEY)||'null');if(!v||v.version!==1||!v.meta||!v.meta.upgrades)return null;
 if(v.run&&(!C[v.run.class]||!Array.isArray(v.run.tiles)||!Array.isArray(v.run.items)||!v.run.equip))return null;
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
 var kind=t.kind,display=t.cleared?'empty':kind;
 if(kind==='start')display='start';
 if(kind==='enemy'||kind==='boss')display=t.foe&&t.foe.hp>0?'enemy':'bones';
 if(kind==='puzzle')display=t.cleared?'coin':'event';
 if(kind==='secret')display=t.cleared?'empty':'secret';
 var css=t.revealed?'seen '+(t.foe&&t.foe.hp>0?'enemy active':kind==='exit'?'stairs':kind==='chest'?'chest':kind==='secret'?'secret':'clear'):'hidden';
 var label=t.revealed?(t.foe&&t.foe.hp>0?t.foe.name:kind==='exit'?'Лестница':kind==='start'?'Вход':kind==='chest'?'Сундук':kind==='trap'?'Ловушка':kind==='altar'?'Алтарь':kind==='shop'?'Торговец':kind==='secret'?'Тайник':'Клетка'):'Неизвестная клетка';
 var act=!t.revealed?'reveal':t.foe&&t.foe.hp>0?'strike':kind==='exit'?'descend':'inspect-tile';
 var body=t.revealed?icon(display,t.foe?t.foe.id:null):'';
 if(t.revealed&&t.foe&&t.foe.hp>0)body+='<span class="tile-hp"><i style="width:'+pct(t.foe.hp,t.foe.maxHp)+'%"></i></span>';
 if(t.revealed&&kind==='exit'&&!hiddenEnemies().length)body+='<span class="tile-number">↓</span>';
 return '<button class="tile '+css+'" data-action="'+act+'" data-id="'+t.id+'" title="'+esc(label)+'" aria-label="'+esc(label)+'">'+body+'</button>';
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
 var grid=r.tiles.map(activeTileView).join('');
 var summon=summonView();
 var canExit=hiddenEnemies().length===0;
 return section(maxFloorLabel(),'Этаж '+r.floor)+
 '<div class="scene">'+window.CryptArt.room(levelTheme(),r.floor)+'<div class="banner-floor">РУИНЫ · ГЛУБИНА '+r.floor+'</div>'+
 '<div class="banner-label">'+THEMES[levelTheme()][1]+' — '+(r.floor%5===0?'ЭТАЖ БОССА':'ИССЛЕДОВАНИЕ')+'</div></div>'+
 '<div class="floor-line"><span class="subhead">СКРЫТЫЕ ЗАЛЫ</span><span class="progress-label">Исследовано '+exposed+'/25 · Врагов '+hiddenEnemies().length+'</span></div>'+
 '<div class="maze" role="group" aria-label="Карта подземелья 5 на 5">'+grid+'</div>'+
 combatView()+summon+
 '<div class="actionbar"><button class="btn" data-action="skill" '+(r.turn-r.skillUsed<r.class==='none'?0:0)+' title="'+skillHint()+'">'+skillText()+'</button>'+
 '<button class="btn alt" data-action="potion" '+(r.potions?'':'disabled')+'>✚ Эликсир ('+r.potions+')</button>'+
 '<button class="btn alt" data-action="wait">⧗ Ход</button></div>'+
 '<div class="fine muted space-top">Каждое действие занимает один ход. После вашего хода враги атакуют, а призванные союзники помогают.</div>'+
 frame('ДНЕВНИК ЭКСПЕДИЦИИ','<div class="log">'+r.log.slice(0,6).map(function(x){return '<div>'+esc(x)+'</div>';}).join('')+'</div>')+
 (!canExit?'<div class="fine muted center">Чтобы спуститься, разыщите и уничтожьте всех врагов этажа.</div>':'<div class="fine golden center">Враги повержены. Найдите лестницу и отправляйтесь глубже.</div>');
}
function renderHero(){
 var c=C[r.class],st=stats();
 var eq=Object.keys(SLOT).map(function(k){
  var it=equippedItem(k);
  return '<button class="item r'+(it?it.rarity:0)+'" data-action="inspect-item" data-id="'+(it?it.id:'')+'">'+window.CryptArt.item(k==='relic'?'amulet':k==='armor'?'armor':'weapon',it?it.rarity:0)+
  '<span>'+SLOT[k]+'</span><span class="equipped-tag">'+(it?'✓':'—')+'</span></button>';
 }).join('');
 return section('Летопись героя',c.type)+frame(c.name+' · '+c.title,
 '<div class="hero-panel"><div class="hero-portrait">'+window.CryptArt.hero(r.class)+'</div>'+
 '<div class="statlist"><span>Здоровье</span><b>'+st.hp+'</b><span>Мана</span><b>'+st.mp+'</b><span>Атака</span><b>'+st.atk+'</b><span>Броня</span><b>'+st.def+'</b><span>Мощь магии</span><b>'+st.pow+'</b><span>Крит. удар</span><b>'+st.crit+'%</b></div></div>'+
 '<p class="fine muted space-top">'+c.description+'</p>')+
 frame('СНАРЯЖЕНИЕ','<div class="grid4">'+eq+'</div><p class="fine muted space-top">Нажмите предмет, чтобы сменить или изучить его.</p>')+
 frame('СТАТИСТИКА ЗАБЕГА','<div class="kpis"><div><b>'+r.floor+'</b><small>Этаж</small></div><div><b>'+r.kills+'</b><small>Убийств</small></div><div><b>'+r.secrets+'</b><small>Тайн</small></div></div>')+
 frame('ОПЫТ ПРЕДЫДУЩИХ ЭКСПЕДИЦИЙ','<p class="fine muted">Постоянные осколки памяти: <b class="golden">'+s.meta.souls+'</b>. Выдаются после завершения забега. Лучший этаж: '+s.meta.best+'.</p><button class="btn alt wide space-top" data-action="camp">✥ Память предков</button>')+
 '<button class="btn dark wide" data-action="abandon">Завершить текущий забег</button>';
}
function spellValid(sp){
 if(r.mp<sp.cost)return 'Недостаточно маны';
 if((r.scrolls[sp.id]||0)<1)return 'Нет свитков';
 if(['attack','burn','stun','chain','drain'].indexOf(sp.kind)>=0&&!enemies().length)return 'Нет цели';
 if(sp.kind==='reveal'&&!r.tiles.some(function(t){return !t.revealed;}))return 'Всё открыто';
 return null;
}
function renderSpells(){
 var cards=SPELLS.map(function(sp){
  var error=spellValid(sp);
  return '<button class="spell-card" data-action="cast" data-id="'+sp.id+'" '+(error?'disabled':'')+'>'+
  '<span class="spell-icon">'+sp.icon+'</span><h4>'+sp.name+'</h4><p>'+sp.description+'</p><small>◈ '+sp.cost+' маны · свитков '+(r.scrolls[sp.id]||0)+'</small></button>';
 }).join('');
 return section('Книга магии','Мощь '+stats().pow)+
 frame('ПЕЧАТИ И СВИТКИ','<div class="spell-list">'+cards+'</div>')+
 frame('ПРАВИЛА МАГИИ','<p class="fine muted">Заклинания тратят ману, свиток и один ход. Враждебные заклинания направляются в первое найденное живое чудовище. Свитки можно найти в сундуках, купить у странствующего торговца и получить за загадки.</p>');
}
function renderTalents(){
 var names=['СТАЛЬ','МИСТИКА','ПУТЬ'],icons=['⚔','✣','◈'];
 var lanes=names.map(function(name,index){
  var nodes=talentsByTree(index).map(function(t){
   var rank=lvl(t.id),cost=levelCost(t),prev=talentsByTree(index)[t.rank-1];
   var unlocked=t.rank===0||lvl(prev.id)>0,can=unlocked&&rank<3&&r.ep>=cost;
   return '<button class="talent-node '+(unlocked?'':'locked ')+(rank===3?'max':'')+'" data-action="talent" data-id="'+t.id+'" '+(can?'':'disabled')+'>'+
   '<span class="node-icon">'+t.icon+'</span><strong>'+t.name+'</strong><small>'+t.desc+'</small><em>'+rank+'/3'+(rank<3?' · ✧ '+cost:' · МАКС')+'</em></button>';
  }).join('');
  return '<div class="lane"><h4>'+icons[index]+' '+name+'</h4>'+nodes+'</div>';
 }).join('');
 return section('Древа талантов','✧ '+r.ep+' очков')+frame('ТРИ ПУТИ РАЗВИТИЯ',
 '<p class="fine muted space-bottom">Очки пути даются за победы, боссов, тайны и события. Чтобы открыть следующий узел ветки, вложите хотя бы одно очко в предыдущий. Все таланты сбрасываются после гибели.</p>'+
 '<div class="talent-lanes">'+lanes+'</div>');
}
function itemGrid(items){
 return items.map(function(i){
  return '<button class="item r'+i.rarity+(r.bagSelected===i.id?' selected':'')+'" data-action="item-select" data-id="'+i.id+'">'+
   (equipped(i.id)?'<span class="equipped-tag">НАДЕТО</span>':'')+
    window.CryptArt.item(i.slot==='relic'?'amulet':i.slot,i.rarity)+
  '<span>'+esc(i.name)+(i.plus?' +'+i.plus:'')+'</span></button>';
 }).join('');
}
function renderBag(){
 var selected=item(r.bagSelected)||r.items[0];
 if(selected)r.bagSelected=selected.id;
 var info=selected?'<div class="detail"><div class="detail-portrait">'+window.CryptArt.item(selected.slot==='relic'?'amulet':selected.slot,selected.rarity)+'</div>'+
 '<div class="detail-info"><h3 class="c'+selected.rarity+'">'+esc(selected.name)+(selected.plus?' +'+selected.plus:'')+'</h3>'+
 '<p>'+RARITY[selected.rarity]+' · '+SLOT[selected.slot]+'</p>'+
 '<p>Атака +'+selected.atk+' · Броня +'+selected.def+'<br>HP +'+selected.hp+' · MP +'+selected.mp+'<br>Магия +'+selected.pow+' · Крит +'+selected.crit+'%</p></div></div>'+
 '<div class="hr"></div><div class="btnrow"><button class="btn" data-action="equip" data-id="'+selected.id+'" '+(equipped(selected.id)?'disabled':'')+'>Надеть</button>'+
 '<button class="btn alt" data-action="upgrade" data-id="'+selected.id+'" '+(r.gold<upgradeCost(selected)||selected.plus>=9?'disabled':'')+'>Улучшить '+upgradeCost(selected)+' ◈</button>'+
 '<button class="btn dark" data-action="scrap" data-id="'+selected.id+'" '+(equipped(selected.id)?'disabled':'')+'>Разобрать</button></div>'+
 '<p class="fine muted space-top">Улучшение гарантировано и усиливает свойства предмета. Максимальная заточка +9.</p>':'<div class="empty">Сумка пуста.</div>';
 var supplies='<div class="kpis"><div><b>'+r.potions+'</b><small>Эликсиров</small></div><div><b>'+Object.values(r.scrolls).reduce(function(a,b){return a+b;},0)+'</b><small>Свитков</small></div><div><b>'+r.gold+'</b><small>Монет</small></div></div>';
 return section('Сумка странника',r.items.length+'/30')+
 frame('ДОБЫЧА И ЭКИПИРОВКА','<div class="grid4">'+itemGrid(r.items)+'</div>')+
 frame('ИЗУЧЕНИЕ ПРЕДМЕТА',info)+frame('РАСХОДНИКИ',supplies+
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
 hud();if(!r){$('content').innerHTML=section('Записки выживших','Лагерь')+
 '<div class="scene">'+window.CryptArt.room(0,1)+'<div class="banner-label">Место, где всё начинается снова.</div></div>'+
 frame('НОВАЯ ЭКСПЕДИЦИЯ','<p class="fine muted">Выберите одного из трёх героев. Каждый забег создаёт новый лабиринт, но полученные осколки памяти позволяют усиливать будущие походы.</p>'+
 '<button class="btn wide space-top" data-action="choose">Выбрать героя</button>')+
 frame('ЛЕТОПИСЬ','<div class="kpis"><div><b>'+s.meta.runs+'</b><small>Забегов</small></div><div><b>'+s.meta.best+'</b><small>Лучший этаж</small></div><div><b>'+s.meta.souls+'</b><small>Осколков</small></div></div><button class="btn alt wide space-top" data-action="camp">Память предков</button>');return;}
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
 if(!r)return;
 r.turn++;
 if(r.blessed>0)r.blessed--;
 var alive=enemies();
 // Summoned skeleton acts once per player turn; can attack even when hero explores.
 if(r.summon&&r.summon.hp>0&&alive.length){
  var t=alive[0],d=Math.max(1,r.summon.atk-t.foe.def);
  t.foe.hp-=d;log('Ваш скелет поражает '+t.foe.name+' ('+d+').');
  if(t.foe.hp<=0)kill(t);
 }
 alive=enemies();
 // No more than four simultaneous attackers per turn: risky exploration, survivable.
 alive.slice(0,4).forEach(function(t){
  var e=t.foe;
  if(e.stun>0){e.stun--;log(e.name+' пропускает ход.');return;}
  if(e.burn>0){e.burn--;e.hp-=Math.max(2,Math.floor(stats().pow*.48));if(e.hp<=0){kill(t);return;}}
  var amount=Math.max(1,e.atk+rand(-2,2)-stats().def-Math.floor(r.blessed));
  if(r.summon&&r.summon.hp>0&&Math.random()<.72){
    r.summon.hp=Math.max(0,r.summon.hp-amount);
    log('Скелет перехватывает '+amount+' урона.');
    if(!r.summon.hp){log('Скелет рассыпался костяной пылью.');r.summon=null;}
  }else{
    var taken=amount;
    if(r.shield>0){var absorbed=Math.min(r.shield,taken);r.shield-=absorbed;taken-=absorbed;}
    r.hp=Math.max(0,r.hp-taken);
    if(taken)log(e.name+' наносит '+taken+' урона.');
  }
 });
 if(r.hp<=0){die();return false;}
 return true;
}
function kill(t){
 var e=t.foe;
 if(!e||e.hp>0)return;
 t.cleared=true;e.hp=0;r.kills++;var reward=addGold(e.gold);
 r.ep+=e.ep;
 r.hp=Math.min(stats().hp,r.hp+4*lvl('vamp'));
 log('Победа над '+e.name+'. +'+e.ep+' ✧, +'+reward+' ◈.');
 if(e.boss){
  r.ep+=4;
  r.potions++;
  addItem(pick(Object.keys(SLOT)),Math.max(2,rarityRoll()));
  log('ПОВЕРЖЕН БОСС. +4 очка пути и ценный трофей.');
 }else if(Math.random()<.2){
  if(Math.random()<.52){addItem(pick(Object.keys(SLOT)),null);}
  else{var key=pick(SPELLS).id;r.scrolls[key]=(r.scrolls[key]||0)+1;log('Найден свиток: '+SPELLS.find(function(x){return x.id===key;}).name+'.');}
 }
}
function strike(tid){
 var t=tile(tid),st=stats();if(!t||!t.revealed||!t.foe||t.foe.hp<=0)return;
 var critical=Math.random()*100<st.crit;
 var amount=Math.max(1,st.atk+rand(0,3)-t.foe.def);
 if(critical)amount=Math.floor(amount*1.6);
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
  r.mp-=8;r.summon={name:'Костяной страж',maxHp:32+Math.floor(st.pow*.9)+14*lvl('ritual'),
   hp:32+Math.floor(st.pow*.9)+14*lvl('ritual'),atk:5+Math.floor(st.pow*.35)+4*lvl('ritual')};
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
 r.scrolls[id]--;r.mp-=sp.cost;
 var tar=target(),st=stats();
 var magic=Math.floor(sp.base+st.pow*1.45);
 if(sp.kind==='heal'){r.hp=Math.min(st.hp,r.hp+magic);log(sp.name+': восстановлено '+magic+' HP.');}
 else if(sp.kind==='shield'){r.shield+=magic;log('Магическая защита: '+magic+' щита.');}
 else if(sp.kind==='reveal'){
  var covered=r.tiles.filter(function(t){return !t.revealed;});var count=0;
  for(var j=0;j<sp.base&&covered.length;j++){
   var index=rand(0,covered.length-1);covered.splice(index,1)[0].revealed=true;count++;
  }
  log('Око забвения открыло '+count+' скрытые клетки.');
 }else if(sp.kind==='chain'){
  var victims=enemies().slice(0,3);
  victims.forEach(function(t){var dmg=Math.max(1,magic-t.foe.def);t.foe.hp-=dmg;if(t.foe.hp<=0)kill(t);});
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
function reveal(id){
 var t=tile(id);if(!t||t.revealed)return;
 t.revealed=true;var k=t.kind;
 if(k==='enemy'||k==='boss')log('Из темноты выходит '+t.foe.name+'!');
 else if(k==='chest'){addGold(rand(6,14)+r.floor*2);if(Math.random()<.78)addItem(pick(Object.keys(SLOT)),null);else r.potions++;t.cleared=true;log('Сундук вскрыт. Добыча получена.');}
 else if(k==='coin'){var coins=addGold(rand(9,18)+r.floor*2);t.cleared=true;log('Под плитой найдено '+coins+' монет.');}
 else if(k==='potion'){r.potions++;t.cleared=true;log('Вы находите запечатанный лечебный эликсир.');}
 else if(k==='trap'){
  t.cleared=true;var damage=Math.floor((7+r.floor*2)*(1-.25*lvl('seeker')));
  if(r.class==='scout')damage=Math.floor(damage*.55);
  r.hp=Math.max(0,r.hp-damage);
  log('Ловушка! Острые шипы: −'+damage+' HP.');
 }
 else if(k==='secret'){t.cleared=true;discoverSecret();}
 else if(k==='altar'){t.cleared=true;showAltar();}
 else if(k==='shop'){t.cleared=true;showShop();}
 else if(k==='puzzle'){t.cleared=true;showPuzzle();}
 else if(k==='event'){t.cleared=true;eventRandom();}
 else if(k==='exit')log('Обнаружена лестница в глубину. Дверь открывается после победы над чудовищами.');
 else{t.cleared=true;log('За плитой лишь камни, пыль и дурные предчувствия.');}
 finishAction();
}
function inspectTile(id){
 var t=tile(id);if(!t)return;
 if(t.kind==='exit'){descend();return;}
 if(t.foe&&t.foe.hp>0){strike(id);return;}
 toast('Здесь уже всё обследовано.');
}
function descend(){
 var exit=r.tiles.find(function(t){return t.kind==='exit';});
 if(!exit||!exit.revealed){toast('Сначала найдите лестницу.');return;}
 if(hiddenEnemies().length){toast('Сначала очистите этаж от чудовищ.');return;}
 var heal=Math.floor(stats().hp*.16);
 r.floor++;r.ep+=2;r.hp=Math.min(stats().hp,r.hp+heal);
 r.shield=0;r.turn++;startFloor();log('Новый этаж: восстановлено '+heal+' здоровья и +2 очка пути.');
 save();draw();toast('Спуск на этаж '+r.floor+'.');
}
function gainSecret(e){
 r.secrets++;
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
function showShop(){
 dialog('<div class="emblem">◈</div><div class="subhead">СТРАНСТВУЮЩИЙ ТОРГОВЕЦ</div><h2>ЛАВКА ЗАБОРОМНОГО</h2>'+
 '<p>Под рваным плащом торговец держит реликвии и свитки. Его глаза не отражают свет.</p>'+
 '<div class="row space-bottom"><span>✚ Целебный эликсир</span><button class="btn small" data-action="buy" data-id="potion" '+(r.gold<16?'disabled':'')+'>16 ◈</button></div>'+
 '<div class="row space-bottom"><span>✣ Случайный свиток</span><button class="btn small" data-action="buy" data-id="scroll" '+(r.gold<15?'disabled':'')+'>15 ◈</button></div>'+
 '<div class="row space-bottom"><span>⚔ Случайная экипировка</span><button class="btn small" data-action="buy" data-id="gear" '+(r.gold<38?'disabled':'')+'>38 ◈</button></div>'+
 '<button class="btn alt wide" data-action="close">Уйти</button>');
}
function buy(id){
 var cost=id==='potion'?16:id==='scroll'?15:38;
 if(r.gold<cost){toast('Недостаточно монет.');return;}
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
 if(n>=3||r.ep<cost)return;
 var before=talentsByTree(t.tree)[t.rank-1];
 if(t.rank>0&&!lvl(before.id))return;
 r.ep-=cost;r.talents[id]=n+1;
 if(id==='endure')r.hp+=18;
 if(id==='reserve')r.mp+=12;
 if(id==='ritual'&&r.summon){r.summon.hp+=14;r.summon.maxHp+=14;r.summon.atk+=4;}
 log('Развит талант: '+t.name+' ('+(n+1)+'/3).');toast('Открыт талант: '+t.name);draw();save();
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
 if(name==='strike'){strike(id);return;}
 if(name==='descend'){descend();return;}
 if(name==='inspect-tile'){inspectTile(id);return;}
 if(name==='skill'){useSkill();return;}
 if(name==='potion'){potion();return;}
 if(name==='wait'){wait();return;}
 if(name==='cast'){cast(id);return;}
 if(name==='talent'){gainTalent(id);return;}
 if(name==='item-select'){r.bagSelected=Number(id);draw();return;}
 if(name==='inspect-item'){r.bagSelected=Number(id);r.tab='bag';draw();return;}
 if(name==='equip'){equip(id);return;}
 if(name==='upgrade'){upgrade(id);return;}
 if(name==='scrap'){scrap(id);return;}
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