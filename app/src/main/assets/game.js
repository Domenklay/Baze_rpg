/* Baze RPG - independent, entirely offline gameplay. All user-visible strings are Russian. */
(function(){
'use strict';
var STORAGE='baze_rpg_v1';
var RARITY=['Обычный','Необычный','Редкий','Эпический','Легендарный'];
var RARITY_CSS=['common','uncommon','rare','epic','legend'];
var SLOT_NAMES={weapon:'Оружие',armor:'Доспех',helm:'Шлем',amulet:'Талисман'};
var SLOT_STAT={weapon:'Урон',armor:'Броня',helm:'Здоровье',amulet:'Крит. шанс'};
var CLASSES={
 knight:{name:'Крестоносец',subtitle:'Стальной оплот',description:'Много здоровья и брони. Надёжен в долгих схватках.',hp:85,atk:9,def:4,crit:5,speed:1},
 marauder:{name:'Мародёр',subtitle:'Клинок в тени',description:'Быстро атакует и чаще наносит критические удары.',hp:69,atk:11,def:2,crit:13,speed:1.25},
 occultist:{name:'Оккультист',subtitle:'Проводник бездны',description:'Сильные атаки и ритуальное восстановление здоровья.',hp:73,atk:12,def:2,crit:9,speed:1.08}
};
var ZONES=[
 {name:'Разорённый тракт',level:1,desc:'Заброшенные заставы, крысиные стаи и неупокоенные солдаты.',mobs:[['rat','Чумная крыса',32,5,0,16],['skeleton','Ржавый страж',38,7,1,19],['cultist','Безумный паломник',40,6,1,20]],boss:['boss','Палач забытой дороги',115,11,3,58]},
 {name:'Мёртвый лес',level:3,desc:'Тропы затянуты туманом. Хищники чуют кровь за много вёрст.',mobs:[['wolf','Падальщик',72,11,2,29],['spider','Теневая ткачиха',64,13,2,32],['cultist','Лесной отступник',79,12,3,34]],boss:['boss','Рогатый еретик',198,18,5,96]},
 {name:'Забытый склеп',level:6,desc:'Под старым храмом пробудились кости и каменные чудовища.',mobs:[['skeleton','Погребальный страж',141,20,5,49],['cultist','Хранитель костей',127,23,4,54],['golem','Гробовой голем',169,18,7,52]],boss:['boss','Безымянный архонт',395,32,8,160]},
 {name:'Багровый провал',level:9,desc:'Земля расколота, а под камнями тлеет древнее проклятие.',mobs:[['golem','Угольный истукан',231,32,10,72],['spider','Багровая мать',205,36,8,77],['wolf','Пепельный зверь',221,33,9,80]],boss:['boss','Сердце бездны',670,49,13,240]}
];
var NAMES={
 weapon:['Изъеденный клинок','Клинок клятвы','Палаческий тесак','Меч ночного дозора','Жертвенный меч','Клинок реликвария'],
 armor:['Потускневшая кираса','Доспех дозорного','Броня мученика','Железный панцирь','Кираса изгнанника'],
 helm:['Шлем скитальца','Капюшон пепла','Погребальный шишак','Забрало стража','Венец обречённых'],
 amulet:['Печать вороньего глаза','Костяной оберег','Кулон алой луны','Реликвия старого ордена','Перстень бездны']
};
var s=null, heroClock=0, enemyClock=0, reviveUntil=0, nextEnemyAt=0, busy=false, toastTimer=0;
var $=function(id){return document.getElementById(id);};
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(xs){return xs[rand(0,xs.length-1)];}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function fmt(n){return Math.floor(n).toLocaleString('ru-RU');}
function log(t){if(!s)return;s.log.unshift(t);s.log=s.log.slice(0,9);}
function xpNeed(lvl){return 30+Math.floor(Math.pow(lvl,1.35)*16);}
function itemValue(item){return Math.max(1,Math.floor(item.base*(1+item.plus*.23)));}
function itemName(i){return i.name+(i.plus?' +'+i.plus:'');}
function newItem(slot,lev,rarity){
 var base=slot==='weapon'?rand(4,7)+lev*2:slot==='armor'?rand(2,5)+lev:slot==='helm'?rand(7,13)+lev*4:rand(1,2)+rarity;
 base=Math.round(base*(1+rarity*.29));
 return {id:++s.seq,slot:slot,name:pick(NAMES[slot]),level:lev,rarity:rarity,base:base,plus:0};
}
function equipped(id){return Object.keys(s.eq).some(function(k){return s.eq[k]===id;});}
function getItem(id){return s.items.find(function(x){return x.id===Number(id);})||null;}
function itemFor(slot){return getItem(s.eq[slot]);}
function stats(){
 var c=CLASSES[s.class]||CLASSES.knight;
 var w=itemFor('weapon'),a=itemFor('armor'),h=itemFor('helm'),m=itemFor('amulet');
 return {hp:c.hp+(s.level-1)*10+(h?itemValue(h):0),atk:c.atk+(s.level-1)*3+(w?itemValue(w):0),
 def:c.def+Math.floor((s.level-1)*.7)+(a?itemValue(a):0),crit:clamp(c.crit+(m?itemValue(m):0),0,62),speed:c.speed};
}
function startGame(klass){
 s={version:1,class:klass,level:1,xp:0,seq:0,items:[],eq:{weapon:null,armor:null,helm:null,amulet:null},
  zone:0,zoneWins:[0,0,0,0],kills:0,deaths:0,scrap:17,ember:5,hp:0,enemy:null,
  log:[],tab:'battle',selected:null,forge:null,paused:false,lastSeen:Date.now(),lastSkill:0,lastHeal:0};
 Object.keys(SLOT_NAMES).forEach(function(slot){
  var it=newItem(slot,1,0);s.items.push(it);s.eq[slot]=it.id;
 });
 s.hp=stats().hp;
 spawnEnemy();
 log('Вы вступаете на разорённый тракт. Сражение началось.');
 heroClock=Date.now();enemyClock=Date.now();
 save();render();renderStartModal(false);
}
function spawnEnemy(){
 var z=ZONES[s.zone],isBoss=s.zoneWins[s.zone]%7===6;
 var spec=isBoss?z.boss:pick(z.mobs);
 var scale=1+Math.max(0,s.level-z.level)*.07;
 var hp=Math.ceil(spec[2]*scale);
 s.enemy={type:spec[0],name:spec[1],maxHp:hp,hp:hp,atk:Math.ceil(spec[3]*scale),def:spec[4],xp:Math.ceil(spec[5]*scale),boss:isBoss};
 enemyClock=Date.now();heroClock=Date.now();nextEnemyAt=0;
}
function gainXp(n){
 s.xp+=n;var levels=0;
 while(s.xp>=xpNeed(s.level) && s.level<99){
  s.xp-=xpNeed(s.level);s.level++;levels++;
 }
 if(levels){s.hp=stats().hp;log('Уровень '+s.level+'! Вы стали сильнее.');}
}
function rarityDrop(){
 var r=rand(1,100);
 var luck=s.zone*3;
 if(r<=2+luck)return 4;
 if(r<=9+luck)return 3;
 if(r<=24+luck)return 2;
 if(r<=54+luck)return 1;
 return 0;
}
function reward(enemy,offline){
 var z=s.zone;
 s.zoneWins[z]++;s.kills++;
 var scrap=rand(2,4)+z+(enemy.boss?7:0);
 var ember=(Math.random()<(.22+z*.08)?1:0)+(enemy.boss?3:0);
 s.scrap+=scrap;s.ember+=ember;
 gainXp(enemy.xp);
 var loot=null;
 if(Math.random()<(enemy.boss?1:.46) && s.items.length<48){
  loot=newItem(pick(Object.keys(SLOT_NAMES)),Math.max(1,s.level+rand(-1,0)),enemy.boss?Math.max(2,rarityDrop()):rarityDrop());
  s.items.push(loot);
 }
 if(!offline){
  log('Победа: '+enemy.name+' · +'+enemy.xp+' опыта · +'+scrap+' железа'+(ember?' · +'+ember+' пепла':'')+'.');
  if(loot)log('Найдено: '+itemName(loot)+' ('+RARITY[loot.rarity]+').');
  if(enemy.boss)log('БОСС ПОВЕРЖЕН. Дорога очищена.');
  if(!loot&&s.items.length>=48)log('Сумка переполнена: новые вещи не помещаются.');
 }
 return {scrap:scrap,ember:ember,loot:loot?1:0,xp:enemy.xp};
}
function win(){
 var e=s.enemy;if(!e)return;
 reward(e,false);s.enemy=null;nextEnemyAt=Date.now()+850;
 updateHeader();render();save();
}
function lose(){
 s.deaths++;log('Вы пали в бою. Ваш герой оправится и продолжит путь.');
 s.enemy=null;reviveUntil=Date.now()+2300;nextEnemyAt=reviveUntil;
 render();save();
}
function damageToEnemy(n,crit){
 if(!s.enemy)return;
 s.enemy.hp=Math.max(0,s.enemy.hp-n);
 floatNumber(n,'right',crit);
 var f=document.querySelector('.foe-figure');
 if(f){f.classList.remove('hit');void f.offsetWidth;f.classList.add('hit');}
 if(s.enemy.hp<=0){win();}
}
function autoFight(){
 if(!s||s.paused||document.hidden)return;
 var now=Date.now();
 if(!s.enemy){
  if(now>=nextEnemyAt){
   if(reviveUntil){s.hp=stats().hp;reviveUntil=0;}
   spawnEnemy();render();
  }
  return;
 }
 var st=stats();
 if(now-heroClock>1200/st.speed){
  heroClock=now;
  var crit=Math.random()*100<st.crit;
  var hit=Math.max(1,Math.floor((st.atk+rand(0,4)-s.enemy.def)*(crit?1.75:1)));
  damageToEnemy(hit,crit);
 }
 if(!s.enemy)return;
 if(now-enemyClock>1750){
  enemyClock=now;
  var hit2=Math.max(1,s.enemy.atk+rand(-2,2)-Math.floor(st.def*.62));
  s.hp=Math.max(0,s.hp-hit2);
  floatNumber(hit2,'left',false);
  var f=document.querySelector('.hero-figure');
  if(f){f.classList.remove('hit');void f.offsetWidth;f.classList.add('hit');}
  if(s.hp<=0){lose();return;}
 }
 updateLive();
}
function floatNumber(n,side,critical){
 var scene=document.querySelector('.scene');if(!scene)return;
 var span=document.createElement('span');span.className='floating '+side+(critical?' crit':'');span.textContent=(critical?'КРИТ ':'−')+n;
 scene.appendChild(span);setTimeout(function(){if(span.parentNode)span.parentNode.removeChild(span);},680);
}
function offlineProgress(ms){
 if(!s||s.paused||ms<45000)return null;
 var elapsed=Math.min(ms,4*3600*1000);
 var st=stats(),z=ZONES[s.zone];
 var averageHp=z.mobs[0][2]+Math.max(0,s.level-z.level)*4;
 var perKill=clamp((averageHp/Math.max(3,st.atk-3))*1.35+1.2,3.8,30);
 var kills=clamp(Math.floor(elapsed/(perKill*1000)),0,160);
 var summary={kills:0,xp:0,scrap:0,ember:0,loot:0};
 for(var i=0;i<kills;i++){
  var isBoss=s.zoneWins[s.zone]%7===6,spec=isBoss?z.boss:pick(z.mobs);
  var enemy={boss:isBoss,name:spec[1],xp:Math.floor(spec[5]*(isBoss?1:1))};
  var r=reward(enemy,true);
  summary.kills++;summary.xp+=r.xp;summary.scrap+=r.scrap;summary.ember+=r.ember;summary.loot+=r.loot;
 }
 if(summary.kills){log('Пока вас не было: '+summary.kills+' побед, '+summary.loot+' предметов.');s.hp=stats().hp;spawnEnemy();}
 return summary.kills?summary:null;
}
function save(){
 if(!s)return;
 try{s.lastSeen=Date.now();localStorage.setItem(STORAGE,JSON.stringify(s));}catch(e){console.warn('Local save failed',e);}
}
function load(){
 try{
  var v=JSON.parse(localStorage.getItem(STORAGE)||'null');
  if(!v||v.version!==1||!CLASSES[v.class]||!Array.isArray(v.items)||!v.eq||!Array.isArray(v.zoneWins))return null;
  if(v.zone<0||v.zone>=ZONES.length)v.zone=0;
  v.tab='battle';v.selected=null;v.forge=v.forge||v.eq.weapon;v.paused=!!v.paused;
  v.items=v.items.slice(0,48);v.log=Array.isArray(v.log)?v.log:[];v.seq=v.seq||v.items.length;v.kills=v.kills||0;v.deaths=v.deaths||0;
  v.scrap=v.scrap||0;v.ember=v.ember||0;v.hp=Math.max(1,v.hp||1);
  return v;
 }catch(e){return null;}
}
function hpRatio(){return s?clamp(s.hp/stats().hp*100,0,100):0;}
function updateHeader(){
 if(!s)return;
 $('hero-name').textContent=CLASSES[s.class].name+' · '+ZONES[s.zone].name;
 $('level-chip').textContent=s.level;
 $('xp-bar').style.width=(s.xp/xpNeed(s.level)*100)+'%';
 $('xp-label').textContent=fmt(s.xp)+' / '+fmt(xpNeed(s.level))+' опыта';
 $('res-scrap').textContent=fmt(s.scrap);$('res-ember').textContent=fmt(s.ember);
 $('play-symbol').textContent=s.paused?'▶':'Ⅱ';
 document.querySelectorAll('[data-tab]').forEach(function(e){e.classList.toggle('active',e.dataset.tab===s.tab);});
}
function updateLive(){
 if(!s)return;updateHeader();
 var hp=$('live-hero-hp'),e=$('live-enemy-hp'),hn=$('live-hero-num'),en=$('live-enemy-num');
 if(hp){hp.style.width=hpRatio()+'%';if(hn)hn.textContent=fmt(s.hp)+' / '+fmt(stats().hp);}
 if(e&&s.enemy){e.style.width=(s.enemy.hp/s.enemy.maxHp*100)+'%';if(en)en.textContent=fmt(s.enemy.hp)+' / '+fmt(s.enemy.maxHp);}
 var a=$('skill-attack'),h=$('skill-heal'),now=Date.now();
 if(a){var left=Math.max(0,Math.ceil((s.lastSkill+5800-now)/1000));a.disabled=left>0||!s.enemy||s.paused;var t=$('skill-atk-status');if(t)t.textContent=left?left+' сек.':'Готов';}
 if(h){var left2=Math.max(0,Math.ceil((s.lastHeal+15000-now)/1000));h.disabled=left2>0||!s.enemy||s.paused;var ht=$('skill-heal-status');if(ht)ht.textContent=left2?left2+' сек.':'Готов';}
}
function panel(title,body){return '<section class="panel"><div class="panel-head">'+title+'</div>'+body+'</section>';}
function head(title,extra){return '<div class="section-head"><h2>'+title+'</h2><span class="subtitle">'+(extra||'')+'</span></div>';}
function statLine(label,value){return '<span>'+label+'</span><b>'+value+'</b>';}
function renderBattle(){
 var z=ZONES[s.zone],e=s.enemy,st=stats(),mob=e?e.type:'skeleton';
 var etitle=e?e.name:'Новая схватка скоро начнётся';
 var ehp=e?e.hp:0,emax=e?e.maxHp:1;
 var history=s.log.map(function(l){return '<li>'+l+'</li>';}).join('');
 return '<div class="battle-banner"><div><div class="eyebrow">ГЛАВА '+(s.zone+1)+' / 4</div><h2>'+z.name+'</h2></div><span class="stage">ПОБЕД '+s.zoneWins[s.zone]+(e&&e.boss?' · БОСС':'')+'</span></div>'+
 '<div class="scene"><div class="moon"></div>'+Art.landscape(s.zone)+
 '<div class="terrain-title">АВТОМАТИЧЕСКАЯ СХВАТКА</div><div class="foe-name">'+etitle+'</div>'+
 '<div class="hero-figure">'+Art.figure(s.class)+'</div><div class="foe-figure">'+Art.figure(mob)+'</div>'+
 '<div class="fighter-bars"><div>ГЕРОЙ<div class="hp-bar"><i id="live-hero-hp" style="width:'+hpRatio()+'%"></i></div><small id="live-hero-num">'+s.hp+' / '+st.hp+'</small></div>'+
 '<div>ПРОТИВНИК<div class="hp-bar enemy"><i id="live-enemy-hp" style="width:'+(ehp/emax*100)+'%"></i></div><small id="live-enemy-num">'+ehp+' / '+emax+'</small></div></div></div>'+
 '<div class="battle-state">⚔  Урон <b>'+st.atk+'</b> · Броня <b>'+st.def+'</b> · Крит. шанс <b>'+st.crit+'%</b> · Скорость <b>'+Math.round(st.speed*100)+'%</b></div>'+
 '<div class="skill-row"><button class="skill" id="skill-attack" data-action="skill-attack"><i>⚔</i><span><strong>Кровавый выпад</strong><small id="skill-atk-status">Готов</small></span></button>'+
 '<button class="skill" id="skill-heal" data-action="skill-heal"><i>✝</i><span><strong>Стойкость</strong><small id="skill-heal-status">Готов</small></span></button></div>'+
 '<div class="buttons mt10"><button class="btn secondary small" data-action="pause">'+(s.paused?'▶ Продолжить':'Ⅱ Пауза')+'</button>'+
 '<button class="btn secondary small" data-tab="map">✥ Сменить локацию</button></div>'+
 panel('ХРОНИКА СРАЖЕНИЙ','<ul class="log" id="log-list">'+history+'</ul>')+
 '<div class="chips"><span class="chip">Сражения идут автоматически</span><span class="chip">Каждый 7-й враг — босс</span><span class="chip">Лут выпадает случайно</span></div>';
}
function renderHero(){
 var c=CLASSES[s.class],st=stats();
 var equipment=Object.keys(SLOT_NAMES).map(function(slot){
  var it=itemFor(slot);
  return '<button class="slot rarity-'+(it?RARITY_CSS[it.rarity]:'common')+'" data-action="inspect" data-id="'+(it?it.id:'')+'">'+(it?'<span class="equip-plus">'+(it.plus?'+'+it.plus:'')+'</span>':'')+
  Art.icon(slot,it?it.rarity:0)+'<small>'+SLOT_NAMES[slot]+'</small><strong>'+(it?it.name:'Пусто')+'</strong></button>';
 }).join('');
 return head('Герой',c.subtitle)+
 panel(c.name+' · УРОВЕНЬ '+s.level,'<div class="hero-card"><div class="portrait">'+Art.figure(s.class)+'</div><div class="stats">'+
 statLine('Здоровье',st.hp)+statLine('Атака',st.atk)+statLine('Защита',st.def)+statLine('Шанс крит. удара',st.crit+'%')+
 statLine('Скорость',Math.round(st.speed*100)+'%')+statLine('Опыт',fmt(s.xp)+'/'+fmt(xpNeed(s.level)))+'</div></div>'+
 '<p class="subtitle mt10">'+c.description+'</p>')+
 panel('СНАРЯЖЕНИЕ','<div class="equipment">'+equipment+'</div><p class="subtitle mt10">Нажмите на экипировку, чтобы посмотреть её в сумке.</p>')+
 panel('ЛЕТОПИСЬ ПУТИ','<div class="kpi"><div class="boxstat"><strong>'+fmt(s.kills)+'</strong><small>Убито врагов</small></div><div class="boxstat"><strong>'+fmt(s.deaths)+'</strong><small>Поражений</small></div><div class="boxstat"><strong>'+s.level+'</strong><small>Уровень</small></div></div>')+
 '<button class="btn ghost wide" data-action="reset">Новая игра (сброс сохранения)</button>';
}
function renderBag(){
 var count=s.items.length;
 var grid=s.items.slice().sort(function(a,b){return Number(equipped(b.id))-Number(equipped(a.id)) || b.rarity-a.rarity || b.level-a.level;}).map(function(it){
  return '<button class="item-tile rarity-'+RARITY_CSS[it.rarity]+(s.selected===it.id?' selected':'')+'" data-action="select" data-id="'+it.id+'">'+
  (equipped(it.id)?'<span class="equip-dot">НАДЕТО</span>':'')+Art.icon(it.slot,it.rarity)+
  '<small>'+(it.plus?'+'+it.plus+' · ':'')+SLOT_NAMES[it.slot]+'</small></button>';
 }).join('');
 var selected=getItem(s.selected);
 if(!selected&&s.items.length){selected=s.items[0];s.selected=selected.id;}
 var detail=selected?renderDetail(selected):'<div class="empty">Сумка пуста. Побеждайте врагов для добычи предметов.</div>';
 return head('Инвентарь',count+' / 48 предметов')+
 panel('ПОЛЕВАЯ СУМКА','<div class="bag-grid">'+grid+'</div>')+
 panel('ОСМОТР ПРЕДМЕТА',detail);
}
function renderDetail(it){
 var worn=equipped(it.id),value=itemValue(it);
 return '<div class="item-detail"><div class="detail-img">'+Art.icon(it.slot,it.rarity)+'</div><div class="detail-copy"><h3 class="rarity-text-'+RARITY_CSS[it.rarity]+'">'+itemName(it)+'</h3>'+
 '<p>'+RARITY[it.rarity]+' · '+SLOT_NAMES[it.slot]+' · ур. '+it.level+'</p>'+
 '<p><b>'+SLOT_STAT[it.slot]+': '+value+(it.slot==='amulet'?'%':'')+'</b></p>'+
 '<p>'+(worn?'Используется героем':'Можно экипировать или разобрать на материалы')+'</p></div></div>'+
 '<hr class="separator"><div class="buttons"><button class="btn" data-action="equip" data-id="'+it.id+'" '+(worn?'disabled':'')+'>'+(worn?'Надето':'Надеть')+'</button>'+
 '<button class="btn secondary" data-action="forge-item" data-id="'+it.id+'">Заточить</button>'+
 '<button class="btn ghost" data-action="dismantle" data-id="'+it.id+'" '+(worn?'disabled':'')+'>Разобрать</button></div>';
}
function enhanceCost(it){return {scrap:6+it.level*2+it.plus*4,ember:1+Math.floor(it.plus/3)};}
function enhanceChance(it){return it.plus<4?100:Math.max(22,100-(it.plus-3)*8);}
function renderForge(){
 var it=getItem(s.forge);if(!it)it=itemFor('weapon');if(it)s.forge=it.id;
 var itemGrid=s.items.map(function(i){
  return '<button class="item-tile rarity-'+RARITY_CSS[i.rarity]+(it&&it.id===i.id?' selected':'')+'" data-action="forge-select" data-id="'+i.id+'">'+Art.icon(i.slot,i.rarity)+'<small>'+((i.plus)?'+'+i.plus+' ':'')+SLOT_NAMES[i.slot]+'</small></button>';
 }).join('');
 var detail=it?(function(){
  var cost=enhanceCost(it),chance=enhanceChance(it),val=itemValue(it),plusval=Math.floor(it.base*(1+(it.plus+1)*.23));
  var max=it.plus>=15,can=s.scrap>=cost.scrap&&s.ember>=cost.ember&&!max;
  return '<div class="item-detail"><div class="detail-img">'+Art.icon(it.slot,it.rarity)+'</div><div class="detail-copy">'+
  '<div class="eyebrow">УКРЕПЛЕНИЕ СНАРЯЖЕНИЯ</div><h3 class="rarity-text-'+RARITY_CSS[it.rarity]+'">'+itemName(it)+'</h3>'+
  '<p>'+SLOT_NAMES[it.slot]+' · '+RARITY[it.rarity]+'</p>'+
  '<p><b>'+SLOT_STAT[it.slot]+': '+val+(it.slot==='amulet'?'%':'')+' → '+(max?val:plusval)+(it.slot==='amulet'?'%':'')+'</b></p></div></div>'+
  '<hr class="separator"><div class="material"><span>◈ Железные осколки</span><b class="'+(s.scrap<cost.scrap?'bad':'')+'">'+s.scrap+' / '+cost.scrap+'</b></div>'+
  '<div class="material"><span>✦ Пепел</span><b class="'+(s.ember<cost.ember?'bad':'')+'">'+s.ember+' / '+cost.ember+'</b></div>'+
  '<div class="material"><span>Шанс заточки</span><b>'+(max?'МАКСИМУМ':chance+'%')+'</b></div>'+
  '<button class="btn wide mt10" data-action="enhance" '+(can?'':'disabled')+'>'+(max?'Достигнуто +15':'⚒ ЗАТОЧИТЬ ДО +'+(it.plus+1))+'</button>'+
  '<p class="subtitle mt10">При неудаче ресурсы расходуются, но предмет и его заточка сохраняются. Усиление до +4 гарантировано.</p>';
 })():'<div class="empty">Нет подходящих предметов.</div>';
 return head('Кузница','Железо и пепел')+panel('НАКОВАЛЬНЯ',detail)+panel('ВЫБРАТЬ ПРЕДМЕТ','<div class="bag-grid">'+itemGrid+'</div>')+
 '<div class="chips"><span class="chip">Заточка: +0 … +15</span><span class="chip">Характеристики растут на 23% за уровень</span><span class="chip">Предметы не ломаются</span></div>';
}
function renderMap(){
 var cards=ZONES.map(function(z,i){
  var locked=s.level<z.level;
  return '<button class="map-card '+(s.zone===i?'active ':'')+(locked?'locked':'')+'" data-action="go-zone" data-id="'+i+'">'+
  '<div class="map-thumb">'+Art.landscape(i)+'</div><div><div class="eyebrow">'+(locked?'ЗАКРЫТА':s.zone===i?'ТЕКУЩАЯ ЛОКАЦИЯ':'ДОСТУПНА')+'</div>'+
  '<h3>'+z.name+'</h3><p>'+z.desc+'</p><span class="zone-level">Уровень от '+z.level+' · побед '+s.zoneWins[i]+(locked?' · 🔒':'')+'</span></div></button>';
 }).join('');
 return head('Карта проклятых земель','4 области')+cards+panel('ПРАВИЛА ПУТЕШЕСТВИЯ','<p class="subtitle">Откройте новые области, повышая уровень. Каждая седьмая победа в области вызывает босса. Награды повышаются в опасных местах. Перемещение бесплатное, сохранение происходит автоматически.</p>');
}
function render(){
 if(!s)return;updateHeader();
 var html=s.tab==='battle'?renderBattle():s.tab==='hero'?renderHero():s.tab==='bag'?renderBag():s.tab==='forge'?renderForge():renderMap();
 $('screen').innerHTML=html;
 updateLive();
}
function setTab(name){if(!s||['battle','hero','bag','forge','map'].indexOf(name)<0)return;s.tab=name;$('screen').scrollTop=0;render();save();}
function toast(t){
 var el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);
 toastTimer=setTimeout(function(){el.classList.remove('show');},2500);
}
function modal(body){
 $('modal-root').innerHTML='<div class="modal-overlay"><div class="modal-box">'+body+'</div></div>';
}
function closeModal(){$('modal-root').innerHTML='';}
function renderStartModal(show){
 if(!show){closeModal();return;}
 var choices=Object.keys(CLASSES).map(function(k){
  var c=CLASSES[k];return '<button class="choose-class" data-action="choose-class" data-id="'+k+'"><div class="mini-portrait">'+Art.figure(k)+'</div><div><strong>'+c.name+'</strong><small>'+c.description+'</small></div></button>';
 }).join('');
 modal('<div class="crest">✥</div><div class="eyebrow">ГЛАВА ПЕРВАЯ</div><h2>ОСКВЕРНЁННЫЕ ЗЕМЛИ</h2>'+
 '<p>Мир угасает. Выберите героя, который проложит дорогу среди руин. Всё работает без интернета.</p>'+choices+'<p class="subtitle">Автоматические сражения · Лут · Инвентарь · Заточка</p>');
}
function showOffline(summary){
 modal('<div class="crest">✦</div><h2>ПУТЬ НЕ ПРЕРВАЛСЯ</h2><p>Пока вас не было, герой продолжал сражаться. Расчёт ограничен четырьмя часами.</p>'+
 '<div class="kpi mb10"><div class="boxstat"><strong>'+summary.kills+'</strong><small>Побед</small></div>'+
 '<div class="boxstat"><strong>+'+summary.xp+'</strong><small>Опыта</small></div><div class="boxstat"><strong>'+summary.loot+'</strong><small>Предметов</small></div></div>'+
 '<p>◈ Железо: +'+summary.scrap+' · ✦ Пепел: +'+summary.ember+'</p>'+
 '<button class="btn wide" data-action="close-modal">ЗАБРАТЬ НАГРАДЫ</button>');
}
function heroSkill(which){
 var now=Date.now();
 if(s.paused||!s.enemy){toast('Сражение сейчас недоступно.');return;}
 if(which==='attack'){
  if(now-s.lastSkill<5800)return;
  s.lastSkill=now;var st=stats(),hit=Math.max(2,Math.ceil((st.atk*2.4)-s.enemy.def));
  damageToEnemy(hit,true);log('Кровавый выпад: '+hit+' урона.');
 }else{
  if(now-s.lastHeal<15000)return;
  s.lastHeal=now;var heal=stats().hp;
  heal=Math.max(1,Math.floor(heal*(s.class==='occultist'?.42:.27)));
  s.hp=Math.min(stats().hp,s.hp+heal);log('Стойкость: восстановлено '+heal+' здоровья.');toast('Восстановлено '+heal+' здоровья.');
 }
 updateLive();save();
}
function resetPrompt(){
 modal('<div class="crest">✥</div><h2>НАЧАТЬ НОВУЮ ИГРУ?</h2><p>Сохранение будет полностью удалено. Вернуть персонажа, предметы и прогресс будет невозможно.</p>'+
 '<div class="buttons"><button class="btn secondary" data-action="close-modal">Отмена</button><button class="btn" data-action="confirm-reset">Удалить прогресс</button></div>');
}
function doAction(action,id){
 if(action==='choose-class'){if(CLASSES[id])startGame(id);return;}
 if(action==='close-modal'){closeModal();return;}
 if(action==='confirm-reset'){try{localStorage.removeItem(STORAGE);}catch(e){}s=null;renderStartModal(true);return;}
 if(!s)return;
 if(action==='pause'){s.paused=!s.paused;toast(s.paused?'Автобой на паузе':'Автобой продолжается');render();save();return;}
 if(action==='skill-attack'){heroSkill('attack');return;}
 if(action==='skill-heal'){heroSkill('heal');return;}
 if(action==='reset'){resetPrompt();return;}
 if(action==='go-zone'){
  var z=Number(id);if(!ZONES[z])return;
  if(s.level<ZONES[z].level){toast('Нужен уровень '+ZONES[z].level+'.');return;}
  s.zone=z;s.enemy=null;spawnEnemy();s.hp=stats().hp;s.tab='battle';$('screen').scrollTop=0;
  log('Новая экспедиция: '+ZONES[z].name+'.');render();save();return;
 }
 if(action==='select'){
  var it=getItem(id);if(it){s.selected=it.id;render();}return;
 }
 if(action==='inspect'){
  var w=getItem(id);s.selected=w?w.id:null;setTab('bag');return;
 }
 if(action==='forge-item'||action==='forge-select'){
  var f=getItem(id);if(!f)return;s.forge=f.id;if(action==='forge-item')s.tab='forge';render();save();return;
 }
 if(action==='equip'){
  var it=getItem(id);if(!it)return;
  if(it.level>s.level){toast('Нужен '+it.level+' уровень.');return;}
  s.eq[it.slot]=it.id;s.hp=Math.min(s.hp,stats().hp);
  toast('Экипировано: '+itemName(it));render();save();return;
 }
 if(action==='dismantle'){
  var it2=getItem(id);if(!it2||equipped(it2.id))return;
  var gain=3+it2.level*2+it2.rarity*3+it2.plus*2;
  s.scrap+=gain;s.ember+=(it2.rarity>=3?1:0);
  s.items=s.items.filter(function(x){return x.id!==it2.id;});
  if(s.selected===it2.id)s.selected=null;
  if(s.forge===it2.id)s.forge=null;
  toast('Разобрано: +'+gain+' железа.');render();save();return;
 }
 if(action==='enhance'){
  if(busy)return;
  var i=getItem(s.forge);if(!i||i.plus>=15)return;
  var cost=enhanceCost(i);if(s.scrap<cost.scrap||s.ember<cost.ember){toast('Недостаточно материалов.');return;}
  busy=true;s.scrap-=cost.scrap;s.ember-=cost.ember;
  if(rand(1,100)<=enhanceChance(i)){i.plus++;toast('Успех! Заточка +'+i.plus+'.');log(itemName(i)+' усилен в кузнице.');}
  else{toast('Неудача. Предмет не пострадал.');log('Заточка не удалась, материалы израсходованы.');}
  s.hp=Math.min(s.hp,stats().hp);render();save();busy=false;return;
 }
}
document.addEventListener('click',function(ev){
 var b=ev.target.closest('[data-action],[data-tab]');if(!b)return;ev.preventDefault();
 if(b.dataset.tab){setTab(b.dataset.tab);return;}
 doAction(b.dataset.action,b.dataset.id);
});
function resumeFromBackground(){
 if(!s)return;
 var now=Date.now(),last=s.lastSeen||now;
 var report=offlineProgress(now-last);s.lastSeen=now;heroClock=now;enemyClock=now;
 render();save();if(report)showOffline(report);
}
document.addEventListener('visibilitychange',function(){
 if(!s)return;
 if(document.hidden){save();}else{resumeFromBackground();}
});
window.addEventListener('pagehide',save);
window.Baze={save:save,back:function(){
 if($('modal-root').innerHTML){closeModal();return;}
 if(s&&s.tab!=='battle'){setTab('battle');return;}
 toast('Герой продолжает путь даже без ваших приказов.');
}};
s=load();
if(s){
 var idle=Date.now()-(s.lastSeen||Date.now());
 var report=offlineProgress(idle);
 if(!s.enemy)spawnEnemy();
 heroClock=Date.now();enemyClock=Date.now();render();save();
 if(report)showOffline(report);
}else{renderStartModal(true);}
setInterval(autoFight,180);
setInterval(save,5000);
})();