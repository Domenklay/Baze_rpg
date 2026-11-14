/* Пепельный лабиринт: offline, original roguelite. No external calls. */
(function(){
'use strict';
var KEY='cryptbound_local_v1',s=null,toastTimer=0,heroMoveToken=0;
var FD=window.CryptFeedback,HB=window.CryptHunterBook,FE=window.CryptForestEvents,RE=window.CryptT1Encounters;
var EX=window.CryptExpansion,CR=window.ClickerRules,DB=window.ClickerData,DN=window.CryptDungeons,SYS=window.CryptSystems,BS=window.CryptBossScripts,STORY=window.CryptStoryEvents,BAL=window.CryptBalance,SP=window.CryptSprites,holdTimeout=null,suppressClickUntil=0;
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
var SLOT={weapon:'Оружие',helm:'Шлем',armor:'Доспех',bracer:'Наручи',boots:'Обувь',ring:'Кольцо',amulet:'Амулет',cloak:'Плащ',gloves:'Перчатки'};
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
var RARITY=['Неизвестный','Обычный','Необычный','Редкий','Эпический','Легендарный','Уникальный'];
var SPELLS=SYS.spells;
var TALENTS=window.CryptTitles||[],TR=window.CryptTitlesRuntime;

var CORPSE_STORIES=[
 {id:'storm-smith',name:'Павший механик',note:'«Катушка искрила. Если найдёте мою кирасу — берегите левую перчатку».',slot:'armor',gear:'Кираса павшего механика',soul:'Душа механика',prize:'Грозовая перчатка'},
 {id:'lost-surveyor',name:'Пропавший землемер',note:'На мокрой карте отмечен проход. Рядом приписка: «Не слушай огонёк».',slot:'boots',gear:'Сапоги землемера',soul:'Душа землемера',prize:'Перчатка путеводной искры'},
 {id:'ash-scholar',name:'Сгоревший летописец',note:'«Вспомнил название деревни, но светлячок сказал, что это неважно...»',slot:'amulet',gear:'Печать летописца',soul:'Душа летописца',prize:'Перчатка шепчущих рун'}
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
function log(t){r.log.unshift(t);r.log=r.log.slice(0,12);if(FD)FD.capture();}
function currentRegion(){return DN.location(r.actIndex||0,r.locationIndex||0)||DN.location(0,0);}
function levelTheme(){return ((r.actIndex||0)*3+(r.locationIndex||0))%6;}
function maxFloorLabel(){return currentRegion().name;}
function isBossFloor(){return DN.bossFloor(r.floor);}
function depthMultiplier(){return DN.rewardMultiplier(r.floor);}
function lvl(n){return TR.level(r,n);}
function bonus(effect){return TALENTS.reduce(function(sum,t){return sum+(t.effect===effect?lvl(t.id)*t.amount:0);},0);}
function hunterStat(k){return r&&r.actIndex===0?HB.bonus(s.meta,k):0;}
function hunterPoison(turns){if(Math.random()*100<hunterStat('poisonResist')){log('Бестиарий: отравление предотвращено.');return;}r.poisonTurns=Math.max(r.poisonTurns||0,turns);}
function levelCost(t){return TR.cost(r,t);}
function talentPathConflict(t){return TR.pathConflict(r,t);}
function talentUnlocked(t){return TR.unlocked(r,t);}
function talentsByTree(tree){return TALENTS.filter(function(x){return x.tree===tree;});}
function equipped(id){return Object.values(r.equip).some(function(v){return v===Number(id);});}
function item(id){return r.items.find(function(x){return x.id===Number(id);})||null;}
function equippedItem(slot){return item(r.equip[slot]);}
function setBonus(k){var obj=CR.bonuses(r.equip,r.items);return obj[k]||0;}
function stats(){
 var c=C[r.class],e=r.equip,training=BAL.training(r.actIndex||0);
 var a=c.atk+training.atk+(r.floor-1)*1.1+bonus('atk')+(s.meta.upgrades.atk*2)+EX.masteryStat(s.meta,r.class,'atk')+EX.relicStat(s.meta,'atk')+setBonus('atk');
 var def=c.def+training.def+bonus('def')+EX.masteryStat(s.meta,r.class,'def')+EX.relicStat(s.meta,'def')+setBonus('def');
 var hp=c.hp+training.hp+bonus('hp')+s.meta.upgrades.hp*12+EX.masteryStat(s.meta,r.class,'hp')+EX.relicStat(s.meta,'hp')+setBonus('hp');
 var mp=c.mp+training.mp+bonus('mp')+s.meta.upgrades.mp*8+EX.masteryStat(s.meta,r.class,'mp')+EX.relicStat(s.meta,'mp')+setBonus('mp');
 var pow=c.pow+training.pow+bonus('pow')+EX.masteryStat(s.meta,r.class,'pow')+EX.relicStat(s.meta,'pow')+setBonus('pow');
 var crit=c.crit+bonus('crit')+EX.masteryStat(s.meta,r.class,'crit')+EX.relicStat(s.meta,'crit')+setBonus('crit');
 var ts=TR.statBonuses(r);a+=ts.atk+(r.titleFloorAtk||0)+(r.titleHealAtk||0)+(r.titleSageFlat||0)+(r.titleBlessAtk||0);hp+=ts.hp;mp+=ts.mp;pow+=ts.pow;def+=ts.def;
 Object.keys(e).forEach(function(slot){
  var i=equippedItem(slot);if(!i)return;
  a+=i.atk||0;def+=i.def||0;hp+=i.hp||0;mp+=i.mp||0;pow+=i.pow||0;crit+=i.crit||0;
 });
 var city=s.meta.city||{};
 a+=(city.forge||0)*2;hp+=(city.barracks||0)*12;mp+=(city.library||0)*8;
 var w=r.forestWellStats||{};
 a+=hunterStat('atk')+(w.atk||0);def+=hunterStat('def')+(w.def||0);
 hp+=hunterStat('hp')+(w.hp||0);mp+=hunterStat('mp')+(w.mp||0);pow+=hunterStat('pow')+(w.pow||0);
 hp=Math.round(hp*(1+hunterStat('hunterHpPct')*.01));
 a=Math.round(a*(1+hunterStat('hunterAttackPct')*.01+(lvl('war_fighter')>0?.05+.05*lvl('war_fighter'):0)));
 hp=Math.round((hp+(r.titlePaladinFlat||0))*(1+lvl('war_knight')*.10));
 mp=Math.round(mp*(1+lvl('mag_white')*.10));
 pow=Math.round(pow*(1+(lvl('mag_black')>0?.05+.05*lvl('mag_black'):0)));
 return {atk:Math.floor(a),def:def,hp:hp,mp:mp,pow:pow,crit:clamp(crit,0,75),dodge:clamp((ts.dodge||0)+bonus('dodge')+setBonus('dodge')+hunterStat('dodge')+(r.scoutDodgeTurns>0?50:0),0,100)};
}
function flatDefense(){
  return Math.max(0,stats().def-(r.armorBreakPower||0))+bonus('damageFlat')+Math.max(0,Math.floor(r.blessed||0));
 }
 function incomingDamage(rawAttack,enemy){return TR.incoming(r,enemy,Math.max(1,Math.ceil(rawAttack)-flatDefense()));}
 function provoke(enemy,attacker){if(enemy&&enemy.hp>0){enemy.provoked=true;enemy.provokedBy=attacker||'hero';}}
 function enemyDebuffs(enemy){
  var effects=[['poison','☠','Яд'],['bleed','✣','Кровотечение'],['burn','♨','Горение'],['stun','✸','Оглушение']];
  var active=effects.filter(function(x){return enemy&&enemy[x[0]]>0;});
  return active.length?'<span class="enemy-debuff-strip">'+active.map(function(x){return '<span title="'+x[2]+' · '+enemy[x[0]]+' ход.">'+x[1]+' '+enemy[x[0]]+'</span>';}).join('')+'</span>':'';
 }
 function damageBadge(enemy){
  var value=incomingDamage(enemy.atk,enemy),base=enemy.baseAtk==null?enemy.atk:enemy.baseAtk;
  var tone=value>base?'boosted':value<base?'reduced':'normal';
  return '<span class="unit-corner unit-atk damage-'+tone+'" title="Урон после защиты: '+value+' · исходный: '+base+'">⚔'+value+'</span>';
 }
 function newItem(slot,floor,variant){
 var sourceFloor=(((r.actIndex||0)*3+(r.locationIndex||0))%6)*4+1;
 var src=CR.gear(slot,sourceFloor,rand(0,1));
 var star=variant==null?rarityRoll():Math.max(1,Math.min(6,Math.floor(Number(variant)||1)));
 src.rarity=star;
 // Fixed catalog values: act, floor and item rarity do not multiply stats.
 // Manual sharpening and completed set effects remain separate upgrades.
 if(star===6){
  var unique=['storm','freespell','rebirth','bulwark','devour'];
  src.uniqueEffect=pick(unique);src.setId=null;src.setName=null;
  src.name=({storm:'Око громового судьи',freespell:'Перстень несказанных слов',
   rebirth:'Печать возвращения',bulwark:'Зеркало королей',devour:'Сердце собирателя душ'})[src.uniqueEffect];
  src.trait='Уникальный эффект 6★ без комплекта';
 }else if(star>=3&&slot!=='weapon'&&Math.random()<.20){
  var sid='dungeon:'+(r.actIndex||0)+':'+(r.locationIndex||0),spec=CR.setRules(sid);
  if(spec&&spec.slots.indexOf(slot)>=0){
   src.setId=sid;src.setName=CR.setDefinition(sid).name;
   src.name=({helm:'Шлем',ring:'Кольцо',gloves:'Перчатки'})[slot]+' «'+currentRegion().name+'»';
  }
 }
 return Object.assign({id:++s.seq,plus:0,floor:floor,fixed:true},src);
}
function rarityRoll(){
 var value=Math.random()*100,boost=Math.min(.45,Math.max(0,(r.floor-30)*.003));
 if(r.floor>=40&&value<.08+boost)return 6;
 if(value<1+boost*2)return 5;
 if(value<6+boost*3)return 4;
 if(value<20+boost*4)return 3;
 if(value<52)return 2;
 return 1;
}
function addItem(slot,rarity){
 var i=newItem(slot,r.floor,rarity);
 r.items.push(i);log('Найдено: '+i.name+' ('+RARITY[i.rarity]+').');return i;
}
function bonusGold(n){return Math.round(n*(1+bonus('gold')*.01));}
function addGold(n){n=bonusGold(n);r.gold+=n;return n;}
function mkEnemy(boss,ranged,forcedElite){
 var reg=currentRegion(),elites=reg.elites||[],mobs=(reg.mobs||[]).slice();
  /* Fill only the five missing drawn T1/T2 species without duplicating existing IDs. */
  var extra=r.actIndex===0&&r.locationIndex===0?DB.regions[0].enemies.slice(10,20):
    r.actIndex===1&&r.locationIndex===1?DB.regions[4].enemies.slice(0,10):[];
  extra.forEach(function(m){if(!mobs.some(function(x){return x.id===m.id;}))mobs.push(m);});
 var elite=!!forcedElite;
 var rangedPool=mobs.filter(function(m){return m.kind==='shot'||/лучник|арбалет|стрелок|пращник|дальник/i.test(m.name+' '+(m.role||''));});
 var availableRanged=rangedPool.length?rangedPool:mobs;
 var rangedChoice=availableRanged.find(function(x){return x.id===r.rangerType;})||pick(availableRanged);
 if(ranged&&!r.rangerType)r.rangerType=rangedChoice.id;
 var available=mobs.filter(function(x){return (r.floorMonsterTypes||[]).indexOf(x.id)<0;});
 var src=boss?reg.boss:elite?pick(elites):ranged?rangedChoice:pick(available.length?available:mobs);
 if(!boss&&!elite&&!ranged)(r.floorMonsterTypes||[]).push(src.id);
 var role=BAL.role(src,!!ranged);
 var scaled=BAL.combat(r.actIndex||0,r.locationIndex||0,r.floor,role,elite,!!boss,src.id);
 var signature=BAL.ability(src,role);
 var visual=CR.visualId(src.name);
 var skill={
  name:src.skillName||signature.name,every:scaled.cooldown,
  description:src.role?src.role+' · '+signature.description:signature.description,
  kind:signature.id
 };
 return {id:src.id,name:src.name,visual:visual,
  hp:scaled.hp,maxHp:scaled.hp,atk:scaled.atk,baseAtk:scaled.atk,def:scaled.def,provoked:false,
  ep:boss?10+2*(r.actIndex||0):elite?5+Math.floor((r.actIndex||0)/3):2,
  gold:BAL.loot(r.actIndex||0,r.locationIndex||0,r.floor,elite,!!boss),
  boss:!!boss,elite:elite,phase:1,phaseTurn:0,telegraph:null,bossAdds:0,
  bossStyle:((r.actIndex||0)*3+(r.locationIndex||0))%6,
  role:boss?'boss':role,roleName:boss?'Босс':BAL.roles[role].name,ability:signature.id,
  abilityName:signature.name,abilityDescription:signature.description,
  specialUses:0,summons:0,guardTurns:0,evadeCharges:0,enraged:false,stunImmunityTurns:0,
  burn:0,stun:0,poison:0,skill:skill,cooldown:scaled.cooldown,guard:0,
  ranged:!!ranged,attackInterval:ranged?2:0,attackCooldown:ranged?2:0,loot:src.loot||[]};
}
/* One optional elite, scheduled once in each five-floor window:
   5–9, 15–19, 25–29, 35–39, etc. The boss floors 30, 40, ... stay boss-only.
   The selected floor persists in the saved expedition. */
function isEliteFloor(){
 if(!r||r.floor<5||r.floor%10>9||r.floor%10<5)return false;
 var window=Math.floor((r.floor-5)/10),start=window*10+5,end=start+4;
 r.eliteSchedule=r.eliteSchedule||{};r.eliteClears=r.eliteClears||{};
 if(r.eliteSchedule[window]==null)
  r.eliteSchedule[window]=rand(Math.max(start,r.floor),end);
 return r.eliteSchedule[window]===r.floor&&!r.eliteClears[r.floor];
}
function eliteStillAlive(){
 return !!r&&r.tiles&&r.tiles.some(function(t){return t.foe&&t.foe.elite&&t.foe.hp>0;});
}
/* Restore the original optional-elite rules in saves made on v0.8.4:
   demote accidental floor-10/20/30 elites and move any old elite key to
   an ordinary enemy so that hunting the elite never gates the stairs. */
function repairCurrentFloorElite(){
 if(!r||!Array.isArray(r.tiles)||!r.tiles.length)return false;
 var changed=false;
 if(r.floor>=10&&r.floor%10===0){
  r.tiles.forEach(function(t){
   if(!t.foe||!t.foe.elite||t.foe.hp<=0)return;
   var old=t.foe,normal=mkEnemy(false,false,false);
   normal.hp=Math.max(1,Math.min(normal.maxHp,Math.ceil(normal.maxHp*old.hp/Math.max(1,old.maxHp))));
   t.foe=normal;t.kind='enemy';changed=true;
  });
 }
 // A pre-fix expedition on its selected elite floor must not miss the encounter.
 if(isEliteFloor()&&!r.floorCleared&&!r.tiles.some(function(t){return t.foe&&t.foe.elite;})){
  var spot=r.tiles.find(function(t){return !t.revealed&&t.kind==='empty'&&!t.foe&&!t.drops;})||
   r.tiles.find(function(t){return !t.revealed&&t.foe&&t.foe.hp>0&&!t.foe.boss&&!t.foe.ranged&&!t.hasKey&&!t.foe.t1Task;});
  if(spot){spot.kind='elite';spot.foe=mkEnemy(false,false,true);spot.cleared=false;changed=true;}
 }
 if(!r.key){
  var oldCarrier=r.tiles.find(function(t){return t.foe&&t.foe.elite&&(t.hasKey||(t.drops&&t.drops.key));});
  var ordinary=r.tiles.find(function(t){return t.foe&&t.foe.hp>0&&!t.foe.elite&&!t.foe.boss&&!t.foe.ranged&&!t.hasKey;});
  if(oldCarrier&&ordinary){
   oldCarrier.hasKey=false;if(oldCarrier.drops)oldCarrier.drops.key=false;
   ordinary.hasKey=true;changed=true;
  }
 }
 return changed;
}
function distributeTiles(){
 r.floorMonsterTypes=[];
 var types=Array.from({length:25},function(){return 'empty';});
 var startId=rand(0,24),indices=[];
 for(var i=0;i<25;i++)if(i!==startId)indices.push(i);
 for(var j=indices.length-1;j>0;j--){var k=rand(0,j),v=indices[j];indices[j]=indices[k];indices[k]=v;}
 types[startId]='start';
 var pos=0;
 function insert(kind,count){for(var x=0;x<count&&pos<indices.length;x++)types[indices[pos++]]=kind;}
 var boss=isBossFloor()&&!r.bossClears[r.floor],elite=isEliteFloor();
 var total=boss?6:Math.min(6,3+Math.floor(r.floor/6));
 insert('exit',1);
 if(r.actIndex===0&&r.locationIndex===0&&r.floor===1&&!HB.owned(s.meta))insert('hunter-corpse',1);
 if(r.actIndex===0&&r.locationIndex===0&&!boss&&Math.random()<.25)insert('forest-well',1);
 insert('enemy',boss?3:total-(elite?1:0));
 if(elite)insert('elite',1);
 if(boss)insert('boss',1);
 if(r.actIndex===0&&r.locationIndex===0&&!boss){
  insert('chest',Math.random()<.14?1:0);
  if(Math.random()<.35)insert('trap',1);
  if(Math.random()<.13)insert('altar',1);
  if(Math.random()<.14)insert('shop',1);
  if(Math.random()<.86)insert('forest-event',1);
  if(r.floor>=4&&Math.random()<.22)insert('forest-event',1);
  if(Math.random()<.22)insert('secret',1);
  if(Math.random()<.38)insert('coin',1);
 if(Math.random()<.28)insert('potion',1);
  if(Math.random()<.23)insert('corpse',1);
  if(Math.random()<.16)insert('chamber',1);
 }else{
  insert('chest',Math.random()<(boss ? .35 : .12)?1:0);
 if(!boss&&Math.random()<.40)insert('trap',1);
 if(!boss&&Math.random()<.18)insert('altar',1);
 if(!boss&&Math.random()<.16)insert('shop',1);
 if(!boss&&Math.random()<.65&&!RE.active(r))insert('event',1);
 if(!boss&&RE.active(r)){
  if(Math.random()<.86)insert('t1-event',1);
  if(r.floor>=4&&Math.random()<.22)insert('t1-event',1);
 }
 if(!boss&&Math.random()<.55)insert('puzzle',1);
 if(!boss&&Math.random()<.40)insert('secret',1);
 if(Math.random()<.45)insert('coin',1);
 if(Math.random()<.30)insert('potion',1);
 if(!boss&&r.floor%2===0&&Math.random()<.4)insert('corpse',1);
 if(!boss&&r.floor%3===0&&Math.random()<.5)insert('chamber',1);
 }
 // More than half the board should contain something to discover, but never
 // flood it with treasure: most added cells contain tiny finds or curios.
 var desired=rand(14,18),occupied=types.filter(function(kind){return kind!=='empty';}).length;
 while(occupied<desired){
  insert(pick(['vial-hp','vial-mp','coin-small','coin-small','coin-small']),1);occupied++;
 }
 var ranged=boss?0:r.floor<6?0:r.floor<16?1:2;
 for(var x=0;x<ranged;x++){var index=types.indexOf('enemy');if(index<0)break;types[index]='ranged';}
 var forestChosen=[],t1Chosen=[];
 var tiles=types.map(function(kind,id){
  var forestId=null,t1Id=null;
  if(kind==='forest-event'){forestId=FE.pick(r,forestChosen);if(forestId)forestChosen.push(forestId);else kind='empty';}
  if(kind==='t1-event'){t1Id=RE.pick(r,t1Chosen);if(t1Id)t1Chosen.push(t1Id);else kind='empty';}
  var enemy=kind==='enemy'||kind==='boss'||kind==='ranged'||kind==='elite';
  return {id:id,forestId:forestId,t1Id:t1Id,kind:kind==='ranged'?'enemy':kind,
   spawnIntro:kind==='ranged'?types.slice(0,id+1).filter(function(v){return v==='ranged';}).length:0,
   revealed:kind==='start'||kind==='ranged',cleared:kind==='start',
   foe:enemy?mkEnemy(kind==='boss',kind==='ranged',kind==='elite'):null,
   drops:null,hasKey:false,corpseId:kind==='corpse'?pick(CORPSE_STORIES).id:null,room:null};
 });
 var carrier=tiles.find(function(t){return t.kind==='boss';})||pick(tiles.filter(function(t){return t.foe&&!t.foe.elite&&!t.foe.ranged;}))||tiles.find(function(t){return t.foe&&!t.foe.elite;});
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

function hasUniqueGear(effect){return Object.keys(r.equip).some(function(slot){var g=equippedItem(slot);return !!g&&g.uniqueEffect===effect;});}
function activateEntranceEquipment(room){
 var shield=setBonus('entryShield');
 if(shield){r.setShieldRemaining=(r.setShieldRemaining||0)+shield;r.setShieldTurns=10;log('Комплект: щит на 10 ходов +'+shield+'.');}
 if(!room){
  var heals=setBonus('healFloor');if(heals)r.hp=Math.min(stats().hp,r.hp+heals);
  var scrolls=setBonus('scrollFloor')+(hasUniqueGear('freespell')?1:0);
  for(var i=0;i<scrolls;i++){var sp=rollSpell(hasUniqueGear('freespell')?4:3);grantScroll(sp.id,1,'set');}
  if(setBonus('guardFloor')||hasUniqueGear('bulwark'))r.guardCharges=(r.guardCharges||0)+setBonus('guardFloor')+(hasUniqueGear('bulwark')?2:0);
  if(hasUniqueGear('rebirth'))r.resurrection=Math.max(1,r.resurrection||0);
  if(setBonus('ghostFloor')&&(!r.ghost||r.ghost.hp<=0)){var hp=22+Math.ceil(r.floor*1.3);
   r.ghost={hp:hp,maxHp:hp,atk:5+Math.ceil(r.floor*.6),cooldown:3,dodge:60};log('Комплект перепризвал призрачного спутника.');}
 }
}


/* Original chatty companion, always optional and never interrupts turn actions. */
var FAIRY_LINES={
 floor:['О, новый этаж. Кажется, я уже здесь была. Или это совершенно другой камень?',
 'Совет дня: если монстр страшный, просто не смотри на него. Хотя нет, смотри.',
 'Я бы помогла, но у меня крайне важная работа — светиться.',
 'Мы уже близко к выходу. Я это говорю каждый раз, и когда-нибудь угадаю.',
 'Если найдём сундук, ты открывай, а я буду руководить издалека.'],
 elite:['Ой! Этот монстр выглядит как начальник остальных. Ты попробуй с ним договориться.',
 'У него явно есть что-то ценное. Наверное, неприятный характер.',
 'Я помогла! Я отвлекала его своим присутствием.'],
 boss:['Вот и босс. Я пойду… внимательно осматривать потолок.',
 'Я знала, что ты справишься. Да-да, ещё до того, как он появился.',
 'Главное — не умереть. Не благодари, лучший совет за сегодня.'],
 corpse:['Неловко. Я хотела спросить его дорогу, но он как-то неразговорчив.',
 'Вот почему надо записывать, куда идёшь. Хотя я свою карту тоже потеряла.'],
 secret:['О, тайник! Мне казалось, что там обычная стена, но я почти угадала.',
 'Это точно было секретом. Я совершенно не собиралась тебе подсказывать.'],
 rest:['Дом! Может, теперь мы наконец поедим? Я, правда, не ем.'],
 die:['Это был очень смелый план. Жаль, что я не успела придумать другой.']
};
function fairyRemark(kind){
 if(!r||s.meta.fairyMuted)return;
 if(kind==='floor'&&r.floor!==1&&r.floor%5!==1)return;
 var options=FAIRY_LINES[kind]||FAIRY_LINES.floor;
 var offset=(r.floor+r.turn+(r.actIndex||0)*3+(r.locationIndex||0))%options.length;
 log('✦ '+(FAIRY_COSMETICS[s.meta.fairyCosmetic||'default']||FAIRY_COSMETICS.default).label+': «'+options[offset]+'»');
}

function startFloor(){
 heroMoveToken++;
 r.pendingSpell=null;
 r.pendingSkill=null;
 r.pendingForestUse=null;
 r.trappedTile=null;
 r.chamberActive=null;
 r.portalReady=!!(isBossFloor()&&r.bossClears[r.floor]);
 r.tiles=distributeTiles();if(FD)FD.reset(true);r.floorStartTurn=r.turn;r.key=false;r.floorCleared=false;r.shield=bonus('shieldFloor')+setBonus('shieldFloor')+hunterStat('shieldFloor');r.blessed=0;
 r.summonTile=null;
 if(r.summon&&r.summon.hp>0)placeSummon();
 var st=stats();
 r.mp=Math.min(st.mp,r.mp+7+bonus('manaFloor')+hunterStat('manaFloor'));r.ep+=bonus('epFloor')+(s.meta.diamondUpgrades?.wisdom||0);
 r.poisonTurns=0;
 activateEntranceEquipment(false);
 var revealCount=Math.floor(bonus('revealFloor'))+(s.meta.diamondUpgrades?.scouting||0);
 for(var i=0;i<revealCount;i++){
  var available=r.tiles.filter(function(t){return CR.exploreStatus(t,r.tiles,r.heroTile).ok;});
  if(!available.length)break;
  var chosen=pick(available);chosen.revealed=true;if(chosen.kind==='trap')triggerTrap(chosen);if(chosen.kind==='empty')chosen.cleared=true;
 }
 TR.onFloor(r,titleHelpers());
 log('Этаж '+r.floor+' · '+maxFloorLabel()+'. Герой начинает исследование со случайной клетки.');
 fairyRemark('floor');
}
function begin(hero){
 var meta=s.meta;
 if(meta.activeExpedition){toast('Сначала продолжите или завершите предыдущую экспедицию.');return;}
 if((meta.selectedAct||0)>(meta.unlockedAct||0)){toast('Это подземелье пока не открыто.');return;}
 r=s.run={class:hero,actIndex:meta.selectedAct||0,locationIndex:0,bossClears:{},eliteSchedule:{},eliteClears:{},rangerType:null,portalReady:false,materials:{},diamonds:0,questItems:[],preparedPotions:[null,null],locationUsedPotion:0,guardCharges:0,ghost:null,earthGateFound:false,earthGateTitleGranted:false,sixStarFound:false,spellHistory:[],resurrection:0,timeStopTurns:0,rageTurns:0,reflectionTurns:0,barrierTurns:0,burnTurns:0,bleedTurns:0,silenceTurns:0,floor:1,turn:0,gold:20,ep:1,kills:0,secrets:0,
    hp:1,mp:1,items:[],equip:{weapon:null,helm:null,armor:null,bracer:null,boots:null,ring:null,amulet:null,cloak:null,gloves:null},bagSelected:null,bagFilter:'all',spellSchool:'all',treeView:hero==='necromancer'||hero==='sorceress'?1:hero==='scout'||hero==='assassin'?2:0,key:false,
    talents:{},scrolls:{bolt:4,flame:1,heal:2,frost:1,ward:1,chain:0,sight:1,leech:0},
    potions:3,lootBag:[],pendingSkill:null,trappedTile:null,summon:null,shield:0,blessed:0,poisonTurns:0,tiles:[],log:[],tab:'maze',soulBag:[],journalNotes:[],uniqueFinds:{},hunterCounted:{},forestWellStats:{},forestWellUses:0,forest:{seen:{},flags:{},items:{},battles:{},hunts:{},pendingTrophies:{},uses:{}},
    skillUsed:-100,skillTurns:0,eventIndex:0,floorFlags:[],mastered:0,summonTile:null,fx:null,fxUntil:0};
 TR.init(r);
 // No default equipment: the first weapon or armor must be found.
 r.hp=stats().hp;r.mp=stats().mp;
 fillPreparedPotions(r);
 startFloor();save();draw();close();
}
function fresh(){s={version:1,seq:0,meta:{souls:0,best:0,runs:0,unlockedAct:0,selectedAct:0,activeExpedition:null,completedActs:{},achievements:{},questReports:{},memoryChapters:{},fairyMuted:false,diamondUpgrades:{},cosmetics:{default:true},fairyCosmetic:'default',potionStock:{},preparedLoadout:[null,null],diamonds:0,rainbowDiamonds:0,upgrades:{hp:0,atk:0,mp:0},secrets:[],heroRanks:{necromancer:0,executioner:0,scout:0},heroEssence:{necromancer:0,executioner:0,scout:0},relics:{},bestiary:{},milestones:{},materials:{},city:{forge:0,barracks:0,library:0,alchemist:0},totalSecrets:0,bossKills:0},run:null};r=null;}

/* Move v0.5 save equipment to the 4 physical + 4 magical + weapon slots. */
function migrateEquipSlots(saved){
 if(!saved||!saved.equip||!Array.isArray(saved.items))return;
 var replacement={shoulders:'bracer',belt:'ring',legs:'cloak',relic:'amulet'};
 for(var old in replacement){
  var newer=replacement[old];
  if(saved.equip[newer]===undefined)saved.equip[newer]=saved.equip[old]||null;
  delete saved.equip[old];
 }
 for(var it of saved.items){if(replacement[it.slot])it.slot=replacement[it.slot];
  if(it.rarity==null||it.rarity===0)it.rarity=1;}
 for(var slot of Object.keys(SLOT))if(saved.equip[slot]===undefined)saved.equip[slot]=null;
}

function load(){
 try{var v=JSON.parse(localStorage.getItem(KEY)||'null');if(!v||v.version!==1||!v.meta||!v.meta.upgrades)return null;
 if(v.run&&(!C[v.run.class]||!Array.isArray(v.run.tiles)||!Array.isArray(v.run.items)||!v.run.equip))return null;
 var meta=v.meta;
 for(var x of ['heroRanks','heroEssence','relics','bestiary','milestones'])if(!meta[x])meta[x]={};
  HB.ensure(meta);
 for(var hero of Object.keys(C)){if(!meta.heroRanks[hero])meta.heroRanks[hero]=0;if(!meta.heroEssence[hero])meta.heroEssence[hero]=0;}
 if(!meta.totalSecrets)meta.totalSecrets=0;
 if(!meta.bossKills)meta.bossKills=0;
 if(!meta.materials)meta.materials={};if(!meta.city)meta.city={forge:0,barracks:0,library:0};
 if(meta.unlockedAct==null)meta.unlockedAct=0;
 if(meta.selectedAct==null)meta.selectedAct=0;
 if(meta.activeExpedition===undefined)meta.activeExpedition=null;
 if(!meta.completedActs)meta.completedActs={};
 if(!meta.achievements)meta.achievements={};
 if(!meta.questReports)meta.questReports={};
 if(!meta.memoryChapters)meta.memoryChapters={};
 if(!meta.diamondUpgrades)meta.diamondUpgrades={};
 if(!meta.cosmetics)meta.cosmetics={default:true};
 if(!meta.fairyCosmetic)meta.fairyCosmetic='default';
 if(meta.fairyMuted==null)meta.fairyMuted=false;
 if(!meta.potionStock)meta.potionStock={};
 if(!Array.isArray(meta.preparedLoadout))meta.preparedLoadout=[null,null];
 if(meta.city&&meta.city.alchemist==null)meta.city.alchemist=0;
 if(meta.activeExpedition&&!Array.isArray(meta.activeExpedition.questItems))meta.activeExpedition.questItems=[];
 if(meta.diamonds==null)meta.diamonds=0;
 if(meta.rainbowDiamonds==null)meta.rainbowDiamonds=0;
 if(meta.activeExpedition)migrateEquipSlots(meta.activeExpedition);
 if(v.run){v.run.fx=null;v.run.fxUntil=0;delete v.run.clearAnimationStarted;migrateEquipSlots(v.run);for(var k of Object.keys(SLOT))if(!(k in v.run.equip))v.run.equip[k]=null;
  if(v.run.treeView==null)v.run.treeView=0;if(!v.run.bagFilter)v.run.bagFilter='all';if(!v.run.spellSchool)v.run.spellSchool='all';
  if(v.run.actIndex==null)v.run.actIndex=0;
   if(!v.run.hunterCounted)v.run.hunterCounted={};
   if(!v.run.forestWellStats)v.run.forestWellStats={};
   FE.ensure(v.run);
   if(v.run.forestWellUses==null)v.run.forestWellUses=0;
   if(v.run.actIndex===0&&v.run.locationIndex===0&&!HB.owned(meta)){
    if(v.run.floor>1){HB.acquire(meta);v.run.journalNotes=v.run.journalNotes||[];v.run.journalNotes.push('Охотничий бестиарий восстановлен при обновлении сохранения.');}
    else if(!v.run.tiles.some(function(t){return t.kind==='hunter-corpse';})){
     var safe=v.run.tiles.find(function(t){return t.kind==='empty'&&!t.foe&&t.id!==v.run.heroTile;});
     if(safe){safe.kind='hunter-corpse';safe.cleared=false;}
    }
   }
  if(v.run.locationIndex==null)v.run.locationIndex=0;
  if(!v.run.bossClears)v.run.bossClears={};
  if(!v.run.eliteSchedule)v.run.eliteSchedule={};
  if(!v.run.eliteClears)v.run.eliteClears={};
  if(!Array.isArray(v.run.questItems))v.run.questItems=[];
  if(!Array.isArray(v.run.preparedPotions))v.run.preparedPotions=[null,null];
  if(v.run.locationUsedPotion==null)v.run.locationUsedPotion=0;
  if(v.run.guardCharges==null)v.run.guardCharges=0;
  if(v.run.earthGateFound==null)v.run.earthGateFound=false;
  if(v.run.earthGateTitleGranted==null)v.run.earthGateTitleGranted=false;
  if(v.run.sixStarFound==null)v.run.sixStarFound=false;
  if(!Array.isArray(v.run.spellHistory))v.run.spellHistory=[];
  if(v.run.ghost===undefined)v.run.ghost=null;
  if(v.run.resurrection==null)v.run.resurrection=0;
  if(v.run.burnTurns==null)v.run.burnTurns=0;
   if(v.run.trappedTile===undefined)v.run.trappedTile=null;
   if(!Array.isArray(v.run.lootBag))v.run.lootBag=[];
   v.run.lootBag=v.run.lootBag.filter(function(x){return x.kind!=='trinket'&&x.qty>0;});
   if(v.run.scoutDodgeTurns==null)v.run.scoutDodgeTurns=0;
   (v.run.tiles||[]).forEach(function(t){if(t.kind==='trinket')t.kind='vial-hp';});
   v.run.pendingSkill=null;
  if(v.run.bleedTurns==null)v.run.bleedTurns=0;
  if(v.run.silenceTurns==null)v.run.silenceTurns=0;
  if(v.run.timeStopTurns==null)v.run.timeStopTurns=0;
  if(!v.run.materials)v.run.materials={};
  if(v.run.diamonds==null)v.run.diamonds=0;
  if(v.run.heroTile==null){var origin=v.run.tiles.find(function(t){return t.kind==='start';});v.run.heroTile=origin?origin.id:12;}
  if(v.run.portalReady==null)v.run.portalReady=false;
  if(!Array.isArray(v.run.soulBag))v.run.soulBag=[];
  if(!Array.isArray(v.run.journalNotes))v.run.journalNotes=[];
  if(!v.run.uniqueFinds)v.run.uniqueFinds={};
  if(!v.run.poisonTurns)v.run.poisonTurns=0;
  v.run.chamberActive=null; // A modal room is reopened explicitly after loading.
  for(var enemyTile of v.run.tiles){if(enemyTile.foe)enemyTile.foe.spriteFxUntil=0;if(enemyTile.room&&enemyTile.room.guards)enemyTile.room.guards.forEach(function(g){g.spriteFxUntil=0;});if(enemyTile.foe&&enemyTile.foe.hp>0){var enemy=enemyTile.foe;enemy.skill=enemy.ranged?{name:'Дальний выстрел',every:3,description:'Стреляет каждые три хода.',kind:'shot'}:EX.monster(enemy.visual||CR.visualId(enemy.name));
  if(enemy.baseAtk==null)enemy.baseAtk=enemy.enraged?Math.max(1,Math.round(enemy.atk/1.2)):enemy.atk;
   enemy.provoked=false;
   if(enemy.ranged){enemy.attackInterval=2;enemy.attackCooldown=Math.min(2,Math.max(1,Number(enemy.attackCooldown)||2));}
   if(enemy.cooldown==null)enemy.cooldown=enemy.skill.every;if(enemy.guard==null)enemy.guard=0;}}
  for(var roomTile of v.run.tiles)if(roomTile.room&&Array.isArray(roomTile.room.guards))for(var guard of roomTile.room.guards){
   if(guard.baseAtk==null)guard.baseAtk=guard.atk;
   guard.provoked=false;guard.ranged=guard.ranged||guard.role==='marksman';
   if(guard.ranged)guard.attackCooldown=Math.min(2,Math.max(1,Number(guard.attackCooldown)||2));
  }
  if(v.run.summon){v.run.summon.spriteFxUntil=0;if(v.run.summon.specialCooldown==null)v.run.summon.specialCooldown=4;if(!v.run.summon.def)v.run.summon.def=2;}
  if(typeof v.run.key!=='boolean')v.run.key=!v.run.tiles.some(function(t){return t.foe&&t.foe.hp>0;});
  if(!v.run.key&&!v.run.tiles.some(function(t){return t.hasKey||(t.drops&&t.drops.key);})){
    // Migrate a v0.1 floor where enemies had no key-carrier marker.
    var surviving=v.run.tiles.find(function(t){return t.foe&&t.foe.hp>0;});
    if(surviving)surviving.hasKey=true;
    else v.run.key=true;
  }
 }
 if(v.run)TR.init(v.run);
  if(meta.activeExpedition)TR.init(meta.activeExpedition);
  return v;}catch(e){return null;}
}
function save(){try{if(!s)return;localStorage.setItem(KEY,JSON.stringify(s));}catch(e){console.warn('Save unavailable',e);}}
function enemies(){return r.tiles.filter(function(t){return t.foe&&t.foe.hp>0&&t.revealed;});}
function hiddenEnemies(){return r.tiles.filter(function(t){return t.foe&&t.foe.hp>0;});}
/* Combat needs a connected, excavated route, not a collected/loot-free route.
   Visible empty cells (including legacy unsynchronized cleared flags) are passages;
   uncollected drops cannot make a corridor impassable. */
/* Only unopened tiles block an attack path. Revealed loot, monsters, traps,
 * corpses and decorations are not barriers to the connectivity check. */
function reachableEnemy(t){
 if(!r||!t||!t.foe||t.foe.hp<=0||!t.revealed)return false;
 // Melee normally requires a route through opened slabs. Event/summoned foes
 // are the exception: a trapped spawn must remain attackable.
 return CR.attackReachable(r.tiles,Number(r.heroTile),t.forestAlphaSquare||[t.id])||
   CR.specialSpawned(t.foe);
}
function rangedTarget(){return enemies()[0]||null;}
function target(){return r&&r.class==='scout'?rangedTarget():enemies().find(reachableEnemy)||null;}
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
function monsterVisual(e,still){return SP.monster(e,!still&&e.spriteFxUntil>Date.now()?e.spriteFx:'idle')||icon('enemy',e.visual||CR.visualId(e.name));}
function forestAlphaVisual(t){
 var anchor=t.forestAlphaAnchor!=null?r.tiles[t.forestAlphaAnchor]:t;
 if(!anchor||!anchor.foe||anchor.foe.hp<=0)return '';
 var quarter=Math.max(0,(anchor.forestAlphaSquare||[anchor.id]).indexOf(t.id));
 return '<span class="forest-alpha-quarter alpha-q'+quarter+'">'+monsterVisual(anchor.foe)+'</span>';
}

/* Approved 8x8 / 64-icon remains atlas. A stable match selects an appropriate
   aftermath for each monster; no new craft material is created by these visuals. */
function remainsId(e){
 var n=((e&&e.id)||'')+' '+((e&&e.name)||'')+' '+((e&&e.roleName)||'')+' '+((e&&e.visual)||'');
 n=n.toLowerCase();
 var groups=[
  [/волк|wolf|гонч|hound|лисиц|fox|шакал|jackal|псин|dog/, [9]],
  [/кабан|boar|свин|pig/, [10]],
  [/олень|deer|лось|elk|марал/, [11]],
  [/ворон|crow|raven|птиц|bird|сова|owl|гриф|vulture|пернат/, [12,56,61]],
  [/зме|snake|serpent|гадюк|уж\b/, [14]],
  [/ящер|дракон|dragon|reptil|крокодил|lizard/, [13,59,60]],
  [/краб|crab|рак\b|crustacean/, [15,16]],
  [/паук|spider|арахн|arachn/, [17,62]],
  [/пчел|bee|шмел|wasp|ос(а|ы|у)|honey/, [19,63]],
  [/мух|fly|комар|mosquito|мотыл|moth/, [18]],
  [/скорпион|scorpion/, [20]],
  [/жук|beetle|хитин|insect|мурав|ant|богомол|mantis/, [21,22,23]],
  [/личин|larva|черв|worm|гусениц/, [23,62]],
  [/слиз|slime|слизень|ooze|жиж|gelatin/, [24,25,26]],
  [/лед|мороз|ice|frost|снеж|snow|холод|cold/, [27,32]],
  [/воздух|буря|ветер|air|wind|storm|гроз|lightning/, [28,49]],
  [/лав|lava|огн|fire|плам|flame|жар|burn|магма|magma/, [29,48]],
  [/песчан|sand|прах|dust|пепел|ash/, [30,64]],
  [/кристалл|crystal|рунич|rune|магическ|arcane/, [41,45,47,64]],
  [/голем|golem|истукан|каменн|stone|rock|стату|construct|механ|machine|робот|metal|железн|iron|бронз|bronze/, [31,41,42,43,44,45,46]],
  [/гриб|mushroom|spore|спор|плесень|mold/, [35,38]],
  [/корн|root|древень|treant|дерев|tree|лоза|vine|ветв|branch/, [33,34,36,39,40]],
  [/растен|plant|цвет|flower|бутон|thorn|шип|куст|bush/, [33,34,36,37,38,57,58]],
  [/призрак|ghost|specter|spirit|дух|фантом|phantom|тень|shadow|эфир|ether/, [49,50,64]],
  [/скелет|skeleton|кость|bone|костян|нежит|undead|мертв|зомб|zomb|лич\b|lich|упыр|ghoul|мумия|mummy/, [1,2,3,4,5,6,7,8,51,53,54,55]],
  [/культист|cultist|ведьм|witch|чародей|sorcer|некромант|necroman|колдун|mage|warlock/, [4,7,51,52,53,54,55]],
  [/рыцарь|knight|страж|guard|воин|warrior|мечник|swords|разбой|bandit|человек|human|солдат|soldier|пират|pirate/, [1,2,5,6,7,8,52,53,54]],
  [/летуч|bat|медвед|bear|барсук|badger|бобр|beaver|крыса|rat|мыш|mouse|заяц|rabbit|рысь|lynx|кот|cat/, [9,10,11,12,59,61]],
  [/яйц|egg|гнезд|nest/, [59,60,61,62]]
 ];
 var available=[1,2,3,8,9,10,13,16,31,52,53,54,55,56,64];
 for(var g of groups){if(g[0].test(n)){available=g[1];break;}}
 var seed=2166136261;
 for(var i=0;i<n.length;i++)seed=Math.imul(seed^n.charCodeAt(i),16777619);
 return available[(seed>>>0)%available.length];
}
function remainsArt(id){
 var idx=Math.max(0,Math.min(63,(Number(id)||1)-1)),col=idx%8,row=Math.floor(idx/8);
 return '<span class="tile-remains-art" role="img" aria-label="Останки" style="background-position:'+((col/7)*100).toFixed(3)+'% '+((row/7)*100).toFixed(3)+'%"></span>';
}
function goldArt(className){
 return '<img class="'+(className||'gold-coin-inline')+'" src="ui/gold_coin.png" alt="" draggable="false"/>';
}
function activeTileView(t){
 if(t.forestAlphaAnchor!=null){
  var anchor=r.tiles[t.forestAlphaAnchor];
  if(anchor&&anchor.foe&&anchor.foe.hp>0)return '<button class="tile tile-discovered tile-danger tile-forest-alpha'+(r.pendingSpell||r.pendingSkill?' spell-target-valid':'')+
   '" data-action="'+(r.pendingSpell?'cast-target':r.pendingSkill?'skill-target':r.pendingForestUse?'forest-target':'strike')+'" data-id="'+anchor.id+'" title="'+esc(anchor.foe.name)+'">'+forestAlphaVisual(t)+'</button>';
 }
 var alive=t.foe&&t.foe.hp>0,drop=!!t.drops;
 var valuables=drop&&(t.drops.key||t.drops.gear||t.drops.scroll||t.drops.potion||t.drops.relic||t.drops.soul||t.drops.diamonds||(t.drops.materials||[]).length);
 var remains=drop&&!alive&&!valuables&&t.foe&&t.foe.hp<=0;
 var clearAge=Date.now()-(r.clearAnimationStarted||0),opening=t.autoOpened!=null&&clearAge>=0&&clearAge<t.autoOpened*35+260;
 var hero=r.heroTile===t.id?'<span class="hero-on-board" data-unit="hero">'+window.CryptArt.miniHero(r.class,r.fxUntil>Date.now()?r.fx:null)+'</span>':'';
 if(t.revealed&&t.kind==='start')return '<button class="tile tile-origin" data-action="move-hero" data-id="'+t.id+'" aria-label="Стартовая клетка">'+hero+'<span class="origin-dot">◆</span></button>';
 if(r.summon&&r.summon.hp>0&&r.summonTile===t.id)
  return '<button class="tile tile-summon" data-unit="summon" data-action="inspect-summon" data-hold="summon" aria-label="Скелет: удерживайте для изучения">'+
   summonVisual()+'<span class="unit-corner unit-hp">♥'+r.summon.hp+'</span>'+
   '<span class="unit-corner unit-cd">◷'+(r.summon.specialCooldown||4)+'</span>'+
   '<span class="unit-corner unit-atk">⚔'+r.summon.atk+'</span></button>';
 if(t.kind==='trap'&&t.trapSpent)return '<button class="tile tile-discovered tile-trap trap-spent" data-action="move-hero" data-id="'+t.id+'" title="Обезвреженный капкан">'+icon('trap')+hero+'</button>';
 if(t.revealed&&!alive&&!drop&&(t.cleared||t.kind==='empty'))
  return '<button class="tile tile-bare'+(opening?' tile-auto-open':'')+'"'+(opening?' style="animation-delay:'+(t.autoOpened*35-clearAge)+'ms"':'')+' data-action="move-hero" data-id="'+t.id+'" aria-label="Открытая пустая клетка"><span class="stone-joint"></span>'+hero+'</button>';
 if(!t.revealed){
  var access=CR.exploreStatus(t,r.tiles,r.heroTile);
  var hint=(t.hintKey?'<span class="slab-hint slab-hint-key" title="Разведан ключ">⚿</span>':'')+
   (t.hintEnemy?'<span class="slab-hint slab-hint-enemy" title="Разведан враг">⚔</span>':'')+
   (t.hintSpecial?'<span class="slab-hint slab-hint-secret" title="Тайник">✦</span>':'');
  var description=(t.hintKey?' · ключ':t.hintEnemy?' · враг':t.hintSpecial?' · секрет':'');
  return access.ok?
   '<button class="tile hidden tile-frontier'+(hint?' tile-scouted':'')+'" data-action="reveal" data-id="'+t.id+'" title="Открыть плиту · 1 ход'+description+'" aria-label="Доступная каменная плита'+description+'"><span class="slab-face">'+(t.hinted&&!hint?'✦':'✥')+'</span>'+hint+'</button>':
   '<div class="tile hidden tile-locked'+(hint?' tile-scouted':'')+'" title="'+esc(access.reason)+description+'" aria-label="Путь заблокирован'+description+'"><span class="slab-face">◆</span>'+hint+'</div>';
 }
 var marker=alive?'enemy':remains?'remains':drop?(t.drops.key?'key':'loot'):t.kind==='exit'?'exit':t.kind==='hunter-corpse'?'hunter-corpse':t.kind==='forest-well'?'forest-well':t.kind==='puzzle'||t.kind==='corpse'?'event':t.kind==='chamber'?'secret':t.kind;
 var graphic=marker==='remains'?remainsArt(t.remainsId||remainsId(t.foe)):marker==='key'?window.CryptArt.tileBase(marker):marker==='loot'?'<img class="tile-item-sprite" src="ui/loot-pouch.png" alt=""/>':['vial-hp','vial-mp'].includes(marker)?'<img class="tile-item-sprite" src="ui/'+marker+'.png" alt=""/>':['coin','coin-small'].includes(marker)?'<img class="tile-item-sprite" src="ui/coin-pouch.png" alt=""/>':marker==='trinket'?uiIcon('bag'):alive?(t.forestAlpha?forestAlphaVisual(t):monsterVisual(t.foe)):marker==='forest-event'&&t.forestId?FE.image(FE.scene(t.forestId).art):marker==='t1-event'?'<span class="t1-tile-icon '+(r.locationIndex===1?'ridge':'bog')+'">'+(r.locationIndex===1?'⛰':'❧')+'</span>':marker==='hunter-corpse'?FE.image('F01_001'):marker==='forest-well'?FE.image('F01_018'):icon(t.kind==='corpse'||t.kind==='chamber'?t.kind:marker);
 var name=alive?(t.foe.elite?'ЭЛИТА · ':'')+t.foe.name:marker==='remains'?'Останки '+t.foe.name+(t.drops.gold?' · монеты '+t.drops.gold:''):marker==='key'?'Ключ от лестницы':marker==='loot'?'Мешочек добычи':({exit:'Лестница',chest:'Сундук',trap:'Шипы',altar:'Алтарь',shop:'Торговец',secret:'Тайник',coin:'Монеты',potion:'Эликсир','vial-hp':'Склянки здоровья','vial-mp':'Склянки маны','coin-small':'Мелочь',trinket:'Безделушка',event:'Событие',puzzle:'Загадка',corpse:'Останки исследователя','hunter-corpse':'Погибший охотник с книгой','forest-well':'Лесной колодец',chamber:'Побочная комната','forest-event':(FE.scene(t.forestId)||{}).title||'Лесная находка','t1-event':(RE.scene(r,t.t1Id)||{}).title||'Региональная находка'})[t.kind]||'Находка';
 var action=alive?(r.pendingSpell?'cast-target':r.pendingSkill?'skill-target':r.pendingForestUse?'forest-target':'strike'):t.kind==='exit'?'descend':'pickup';
 var delay=alive?(t.foe.cooldown==null?((t.foe.skill&&t.foe.skill.every)||EX.monster(t.foe.visual||t.foe.id).every):t.foe.cooldown):0;
 var unit=alive?'<span class="unit-corner unit-hp">♥'+t.foe.hp+'</span>'+
  '<span class="unit-corner unit-cd">◷'+delay+'</span>'+
  damageBadge(t.foe)+enemyDebuffs(t.foe):'';
 return '<button class="tile tile-discovered tile-'+marker+(alive?' tile-danger':'')+(t.forestAlpha?' tile-forest-alpha':'')+(alive&&(r.pendingSpell||r.pendingSkill||r.pendingForestUse)?' spell-target-valid':'')+(alive&&t.foe.ranged?' tile-ranged':'')+(alive&&t.foe.elite?' tile-elite':'')+(alive&&t.foe.boss?' tile-boss':'')+(alive&&t.foe.ranged&&t.spawnIntro&&r.turn===r.floorStartTurn?' tile-ranged-emerge':'')+(opening?' tile-auto-open':'')+
  '"'+(opening?' style="animation-delay:'+(t.autoOpened*35-clearAge)+'ms"':alive&&t.foe.ranged&&t.spawnIntro&&r.turn===r.floorStartTurn?' style="animation-delay:'+t.spawnIntro*220+'ms"':'')+' data-action="'+action+'" data-id="'+t.id+'"'+(alive?' data-unit="enemy:'+t.id+'"':'')+(alive?' data-hold="enemy"':'')+
  ' aria-label="'+esc(name)+'" title="'+esc(name)+'">'+graphic+(alive&&t.hasKey?'<span class="key-carrier-hint" title="Носит ключ от лестницы">⚿</span>':'')+(!alive&&drop&&t.drops.gold?'<span class="loot-coin-badge">'+goldArt('gold-coin-tile')+'<small>'+t.drops.gold+'</small></span>':'')+(alive&&t.foe.elite?'<span class="elite-tag" aria-hidden="true">ЭЛИТА</span>':'')+unit+(t.kind==='trap'?hero:'')+
  (drop&&t.drops.key?'<span class="tile-number">⚿</span>':'')+(t.kind==='exit'&&!r.key?'<span class="stairs-locked" title="Нужен ключ">'+uiIcon('key')+' ✕</span>':'')+'</button>';
}
function inspectUnit(kind,id){
 if(!r)return;
 var summon=kind==='summon',parts=String(id).split(':'),t=summon?null:tile(parts[0]),e=summon?r.summon:kind==='chamber-enemy'&&t&&t.room?t.room.guards.find(function(g){return g.slot===Number(parts[1]);}):t&&t.foe;if(!e||e.hp<=0)return;
 var special=e.skill||EX.monster(e.id||'skeleton');
 var graphic=summon?summonVisual(true):monsterVisual(e,true);
 var skills=summon?[
  ['Костяной удар','Самостоятельно атакует ближайшего обнаруженного врага каждый ход.'],
  ['Прикрытие хозяина','С вероятностью 72% принимает удар врага вместо героя.'],
  ['Гробовой раскол · '+(e.specialCooldown||4)+' хода','Каждый 4-й ход наносит усиленный урон цели.']
 ]:[['Обычная атака','Урон уменьшается вашей бронёй.'],[e.abilityName||special.name,(e.abilityDescription||special.description)+' Следующее применение через '+(e.cooldown||special.every)+' ход(а) врага.']];
 dialog('<div class="panel-heading"><div><small class="sheet-kicker">'+(summon?'СОЮЗНИК · ПРИЗЫВ':e.boss?'ПОВЕЛИТЕЛЬ ЭТАЖА':e.elite?'ЭЛИТНЫЙ ПРОТИВНИК':'ОБИТАТЕЛЬ ПОДЗЕМЕЛЬЯ')+'</small><h2>'+esc(e.name)+'</h2></div><button class="panel-close" data-action="close" aria-label="Закрыть">×</button></div><article class="unit-dossier"><div class="dossier-top"><div class="dossier-portrait">'+graphic+'</div><div class="dossier-vitals"><div class="meter health"><i style="width:'+pct(e.hp,e.maxHp)+'%"></i><strong>'+e.hp+' / '+e.maxHp+'</strong></div><dl><dt>'+(summon?'Атака':'Урон по герою')+'</dt><dd>'+(summon?e.atk:incomingDamage(e.atk))+'</dd><dt>Броня</dt><dd>'+(e.def||0)+'</dd><dt>'+(summon?'Особый удар':'Действие через')+'</dt><dd>'+(summon?e.specialCooldown||4:e.attackCooldown||e.cooldown||1)+'</dd></dl><small>'+esc(summon?'Перехватывает удары':e.roleName||'')+'</small></div></div>'+(e.boss?'<div class="dossier-warning">Фаза '+(e.phase||1)+'/3'+(e.telegraph?' · Готовится опасный удар':'')+'</div>':'')+'<div class="dossier-skills">'+skills.map(function(x){return '<section><h3>'+esc(x[0])+'</h3><p>'+esc(x[1])+'</p></section>';}).join('')+'</div></article><button class="btn wide space-top" data-action="close">'+(summon?'Вернуться':'Продолжить бой')+'</button>');
}
function summonVisual(still){var pose=!still&&r.summon&&r.summon.spriteFxUntil>Date.now()?r.summon.spriteFx:'idle';return '<img class="crypt-monster-sprite summon-art pose-'+pose+'" src="ui/summon-guard'+(pose==='attack'?'-attack':pose==='skill'?'-skill':'')+'.png"'+(pose!=='idle'?' style="animation-delay:'+Math.min(0,r.summon.spriteFxUntil-Date.now()-1000)+'ms"':'')+' alt="" draggable="false"/>';}

function combatView(){
 var t=target();
 if(!t)return frame('ЗАЛЫ ОЖИДАЮТ','<p class="fine muted">Касайтесь закрытых плит, чтобы исследовать этаж. Открытые чудовища отвечают ударами на каждый ход.</p>');
 var f=t.foe;
 return '<div class="combat-box"><div class="combat-portrait">'+monsterVisual(f)+'</div><div class="combat-data">'+
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
/* Three battle-dock consumables: healing plus two separate alchemy slots. */
function dungeonPotionBar(){
 var slots=[0,1].map(function(index){
  var id=r.preparedPotions&&r.preparedPotions[index],p=SYS.byPotion[id];
  return '<button type="button" class="dungeon-potion-slot" data-action="use-prepared" data-id="'+index+'"'+(!p?' disabled':'')+
   ' title="'+esc(p?p.name+' — '+p.description:'Алхимический слот '+(index+1)+' пуст')+'" aria-label="'+esc(p?p.name:'Пустой слот '+(index+1))+'">'+
   '<b class="potion-symbol">'+uiIcon(p?'potion':'drop')+'</b><span class="potion-caption">'+esc(p?p.name:'Зелье '+(index+1))+'</span>'+
   '<small>'+(p?'×1':'×0')+'</small></button>';
 }).join('');
 var disabled=!r.potions||r.hp>=stats().hp;
 return '<div class="dungeon-potion-bar" role="group" aria-label="Три зелья быстрого доступа">'+
  '<button type="button" class="dungeon-potion-slot potion-heal" data-action="potion"'+(disabled?' disabled':'')+
  ' title="Целебный эликсир — восстановить 45% HP" aria-label="Целебный эликсир, '+r.potions+' штук">'+
  '<b class="potion-symbol">'+uiIcon('potion')+'</b><span class="potion-caption">Лечение HP</span><small>×'+r.potions+'</small></button>'+
  slots+'</div>';
}

/* Expedition HUD: the board stays visible while management opens in dialogs. */
var uiPanel=null, selectedTitle=null;
function uiIcon(name){return '<svg class="ui-icon" aria-hidden="true"><use href="#'+name+'"></use></svg>';}
function effectList(){
 var defs=[['shield','Щит','Поглощает входящий урон.','shield'],['resurrection','Возрождение','Предотвращает смертельный исход; каждый раз расходуется один заряд.','sun'],['guardCharges','Защитные заряды','Каждый заряд блокирует одно прямое попадание.','shield'],['setShieldRemaining','Щит комплекта','Временная защита от комплекта снаряжения.','shield'],['blessed','Благословение','Действует благословение алтаря.','sun'],['poisonTurns','Яд','Отравление наносит урон каждый ход.','drop'],['bleedTurns','Кровотечение','Потеря здоровья каждый ход.','drop'],['burnTurns','Горение','Огонь наносит урон каждый ход.','flame'],['silenceTurns','Молчание','Использование магии временно недоступно.','moon'],['rageTurns','Ярость','Временно усиливает боевые возможности.','sword'],['reflectionTurns','Отражение','Отражает часть входящего урона.','shield'],['barrierTurns','Барьер','Временная магическая защита.','shield'],['timeStopTurns','Остановка времени','Ходы противников остановлены.','hourglass'],['armorBreakTurns','Раскол брони','Броня временно ослаблена.','shield'],['regenTurns','Регенерация','Восстанавливает здоровье каждый ход.','sun'],['burnWardTurns','Защита от огня','Поглощает горение.','flame'],['titleTotemTurns','Тотем','Магический тотем призывателя наносит урон в течение 3/6/9 ходов в зависимости от уровня звания.','staff'],['titleEchoCharges','Эхо','После убийства врага Теневой воин получает 1/2/3 заряда Эха по уровню звания (максимум 3). Следующая обычная атака наносит два независимых удара по одной цели; ответ врага происходит только перед первым ударом. Заряд тратится на одну атаку.','sword']];
 return defs.filter(function(x){return r[x[0]]>0;});
}
function renderMaze(){
 var artPair=[0,2,4,6,0,4,6,2,6,10][r.actIndex||0];
 var room=activeRoom();
 var st=stats(),skill=SKILLS[r.class],ready=Math.min(skill.turns,Math.max(0,r.turn-r.skillUsed)),region=currentRegion();
 var quick='<button class="quick-spell class-ability" data-action="skill" aria-label="'+esc(skill.name)+' · '+skill.cost+' маны" title="'+esc(skill.name)+' · '+skill.cost+'" '+(ready<skill.turns||r.mp<skill.cost?'disabled':'')+'><img src="ui/abilities/'+r.class+'.png" alt=""/><small class="quick-mana-cost">'+skill.cost+'</small><small class="quick-cooldown">'+ready+'/'+skill.turns+'</small></button>'+[1,2].map(function(i){return '<button class="quick-spell ability-empty" disabled aria-label="Свободная ячейка способности '+i+'"><span>+</span></button>';}).join('');
 var adventurerTool=TR.toolOf(r);
 quick+='<button class="quick-spell adventurer-tool '+(adventurerTool?'':'ability-empty')+'" data-action="title-tool" aria-label="'+esc(adventurerTool?adventurerTool.name:'Предмет авантюриста — не открыт')+'" title="'+esc(adventurerTool?adventurerTool.name:'Предмет авантюриста')+'">'+(adventurerTool?uiIcon(adventurerTool.icon):'<span>+</span>')+'<small>'+(adventurerTool?(TR.curSup(r,adventurerTool.kind==='lantern'?'wick':adventurerTool.kind==='bow'?'arrow':adventurerTool.kind==='compass'?'compass':adventurerTool.kind==='rune'?'rune':'quench')||''):'')+'</small></button>';
 var focus=room?null:target(),foe=focus&&focus.foe;
 var encounter=foe?'<button class="encounter-target" data-action="inspect-enemy" data-id="'+focus.id+'"><b>'+esc(foe.name)+'</b><span>♥ '+foe.hp+'/'+foe.maxHp+' · ⚔ '+incomingDamage(foe.atk)+' · ◷ '+(foe.attackCooldown||foe.cooldown||1)+'</span></button>':'<button class="encounter-target quiet" data-action="battle-log"><span>'+esc(r.log[0]||'Откройте соседнюю плиту')+'</span></button>';
 if(room)encounter='<button class="encounter-target cave-caption" data-action="chamber-exit"><b>Стражей: '+livingRoomGuards().length+' · '+(room.room.rewardTaken?'Сокровище собрано':room.room.guardHp>0?'Сокровище под защитой':'Сокровище доступно')+'</b><span>← Выйти в лабиринт</span></button>';
 if(r.pendingForestUse){
  encounter='<div class="spell-target-banner"><span><b>Выбор цели</b> · Охотничий капкан</span><button data-action="cancel-forest-target">Отмена</button></div>';
 }
 if(r.pendingSkill)encounter='<div class="spell-target-banner"><span><b>Выбор цели</b> · '+esc(SKILLS[r.class].name)+'</span><button data-action="cancel-skill-target">Отмена</button></div>';
 if(r.pendingSpell){
  var spellTarget=SPELLS.find(function(x){return x.id===r.pendingSpell;});
  encounter='<div class="spell-target-banner"><span><b>Выбор цели</b> · '+esc(spellTarget?spellTarget.name:'Заклинание')+'</span><button data-action="cancel-target">Отмена</button></div>';
 }
 return '<div class="dungeon-root theme-'+(r.actIndex||0)+'" data-location="'+((r.actIndex||0)*3+(r.locationIndex||0))+'" style="--floor-texture:url(ui/locations/'+((r.actIndex||0)*3+(r.locationIndex||0))+'-floor.svg);--cover-texture:url(ui/locations/'+((r.actIndex||0)*3+(r.locationIndex||0))+'-cover.svg);--floor-art:url(ui/atlas-'+String(artPair).padStart(2,'0')+'.png);--cover-art:url(ui/atlas-'+String(artPair+1).padStart(2,'0')+'.png)">'+
 '<div class="expedition-top"><div class="dungeon-name"><small>АКТ '+((r.actIndex||0)+1)+' · '+(r.locationIndex+1)+'/3</small><h1>'+esc(room?'Заброшенное убежище':region.name)+'</h1></div><button class="expedition-ep" data-action="ui-panel" data-id="talents" title="Очки исследования для званий" aria-label="Очки исследования: '+r.ep+'">'+uiIcon('talent')+'<span>'+r.ep+'</span><small>ОИ</small></button><button class="floor-seal" data-action="battle-log" aria-label="Журнал этажа">'+r.floor+'<small>ЭТАЖ</small></button><div class="expedition-money"><span title="Золото"><img class="gold-coin-icon" src="ui/gold_coin.png" alt="" draggable="false"/>'+r.gold+'</span><span title="Алмазы">'+uiIcon('gem')+(r.diamonds||0)+'</span></div><button class="hud-menu" data-action="menu" aria-label="Меню">'+uiIcon('menu')+'</button></div>'+
 '<div class="expedition-effects"><div class="buff-strip">'+effectList().filter(function(x){return !['guardCharges','resurrection'].includes(x[0]);}).map(function(x){return '<button data-action="effect-info" data-id="'+x[0]+'" aria-label="'+x[1]+'">'+uiIcon(x[3])+'<small>'+r[x[0]]+'</small></button>';}).join('')+(r.summon&&r.summon.hp>0?'<button data-action="inspect-summon" aria-label="Призванный скелет">'+uiIcon('shield')+'<small>'+r.summon.hp+'</small></button>':'')+(r.titlePanther&&r.titlePanther.hp>0?'<button data-action="title-panther-info" aria-label="Чёрная пантера">'+uiIcon('paw')+'<small>'+r.titlePanther.hp+'</small></button>':'')+
  (r.ghost&&r.ghost.hp>0?'<button data-action="ghost-info" data-unit="ghost" aria-label="Призрачный страж">'+uiIcon('moon')+'<small>'+r.ghost.hp+'</small></button>':'')+'</div><div class="charge-strip">'+['guardCharges','resurrection'].filter(function(k){return r[k]>0;}).map(function(k){return '<button data-action="effect-info" data-id="'+k+'" aria-label="'+(k==='guardCharges'?'Защитные заряды':'Возрождение')+'">'+uiIcon(k==='guardCharges'?'shield':'sun')+'<span>'+r[k]+'</span></button>';}).join('')+(r.key?'<button data-action="key-info" aria-label="Ключ найден">'+uiIcon('key')+'</button>':'')+(r.actIndex===0&&HB.owned(s.meta)?'<button class="hb-v072-access" data-action="hunter-book" aria-label="Охотничий бестиарий" title="Охотничий бестиарий">'+HB.bookIcon()+(HB.ensure(s.meta).unread?'<i class="hb-bang">!</i>':'')+'</button>':'')+'</div></div>'+
 '<div class="dungeon-board'+(room?' cave-active':'')+'"><div class="dungeon-border'+(room?' cave-scene':'')+'"><div class="maze'+(room?' chamber-maze':'')+'">'+(room?renderChamberTiles(room):r.tiles.map(activeTileView).join(''))+'</div></div></div>'+
 '<div class="encounter-slot">'+(!room&&r.tiles.some(function(t){return t.revealed&&t.foe&&t.foe.elite&&t.foe.hp>0;})?'<div class="elite-floor-warning">⚔ ОБНАРУЖЕН ЭЛИТНЫЙ ПРОТИВНИК</div>':'')+encounter+(!room&&r.portalReady?'<button class="portal-compact" data-action="safe-portal">Безопасный портал · на базу</button>':'')+'</div>'+
 '<div class="battle-dock"><div class="dock-wing"><div class="quick-spells" aria-label="Классовые способности">'+quick+'</div><button class="dock-button" data-action="ui-panel" data-id="spells">'+uiIcon('book')+'<span>Свитки</span></button></div>'+
 '<div class="dock-hero"><div class="hero-skill" role="img" aria-label="'+esc(C[r.class].name)+'" data-unit="hero">'+window.CryptArt.hero(r.class,r.fxUntil>Date.now()?r.fx:null)+'</div><div class="hero-numbers"><span>'+uiIcon('sword')+st.atk+'</span><button data-action="ui-panel" data-id="talents">'+uiIcon('talent')+'</button><span>'+uiIcon('flame')+st.pow+'</span></div><div class="meter health"><i style="width:'+pct(r.hp,st.hp)+'%"></i><strong>'+r.hp+' / '+st.hp+'</strong></div><div class="meter mana"><i style="width:'+pct(r.mp,st.mp)+'%"></i><strong>'+r.mp+' / '+st.mp+'</strong></div></div>'+
 '<div class="dock-wing dock-supplies"><div class="dock-tools"><span aria-label="Текущий ход">Ход '+r.turn+'</span><button data-action="wait" aria-label="Пропустить ход">'+uiIcon('hourglass')+'<small>Ждать</small></button><button data-action="battle-log" aria-label="Журнал похода">'+uiIcon('journal')+'<small>Журнал</small></button></div>'+dungeonPotionBar()+'<button class="dock-button" data-action="ui-panel" data-id="bag">'+uiIcon('bag')+'<span>Рюкзак</span></button></div></div></div>';
}
function titleIcon(t){return {atk:'sword',def:'shield',crit:'crossbow',hp:'heart',mp:'drop',pow:'staff',shieldFloor:'shield',bossDamage:'crown',damageFlat:'sword',thorns:'leaf',killHeal:'heart',reflect:'sun',critDamage:'bolt',spellDamage:'staff',summonBase:'skull',manaDiscount:'moon',burnDamage:'flame',chainDamage:'bolt',summonAtk:'skull',manaFloor:'drop',darkCrit:'moon',earthDistance:'mountain',fireProc:'flame',epFloor:'compass',trapReduce:'boot',gold:'coin',chamberHint:'eye',chestGold:'key',soulDrop:'skull',corpseSoul:'skull',chamberSecret:'eye',relicMemory:'journal',soulPower:'skull',corpseBonus:'bag',deepSecret:'compass',relicBlessing:'sun',eliteSoul:'crown',corpseMemory:'journal',utilityPower:'staff',timeBonus:'hourglass',lightEcho:'sun',healPower:'heart',iceArmor:'shield'}[t.effect]||'talent';}
function schoolIcon(school){return {fire:'flame',water:'drop',earth:'mountain',air:'wind',light:'sun',dark:'moon'}[school]||'scroll';}
function panelDialog(panel){
 if(!r)return;var titles={bag:'Снаряжение и рюкзак',hero:'Снаряжение и рюкзак',spells:'Книга заклинаний',talents:'Пути титулов'};
 var body=panel==='bag'||panel==='hero'?inventoryPanel():panel==='spells'?renderSpells():renderTalents();
 dialog('<div class="panel-heading"><h2>'+titles[panel]+'</h2><button class="panel-close" data-action="close" aria-label="Закрыть окно">×</button></div><div class="panel-body panel-'+panel+'">'+body+'</div>');uiPanel=panel;
}
function backpackExtraSlots(){
 var result=[],add=function(action,id,name,art,qty){
  result.push('<button class="item bag-extra-item" data-action="'+action+'"'+(id==null?'':' data-id="'+esc(String(id))+'"')+
   ' title="'+esc(name)+'" aria-label="'+esc(name)+'">'+art+
   (qty!=null?'<b class="bag-item-count">×'+qty+'</b>':'')+
   '<span>'+esc(name)+'</span></button>');
 };
 if(r.potions>0)add('active-item-info','potion','Целебный эликсир',icon('potion'),r.potions);
 (r.preparedPotions||[]).forEach(function(id,index){
  var p=SYS.byPotion[id];if(p)add('active-item-info','prepared:'+index,p.name,icon('potion'),1);
 });
 (r.lootBag||[]).filter(function(x){return x.qty>0&&x.kind!=='trinket';}).forEach(function(x){
  add('active-item-info','pocket:'+x.id,x.name,'<img class="bag-vial-art" src="ui/'+(x.kind==='vial-mp'?'vial-mp':'vial-hp')+'.png" alt=""/>',x.qty);
 });
 var forest=FE.ensure(r).items;
 Object.keys(forest).filter(function(id){return forest[id]>0;}).forEach(function(id){
  var def=FE.itemDefs[id]||[id,'F02_001'];
  var usable=['bleed_trap','stun_trap','honey','mushroom','water'].includes(id);
  add(usable?'active-item-info':'forest-item-info',(usable?'forest:':'')+id,def[0],FE.image(def[1],'bag-item-image'),forest[id]);
 });
 RE.inventory(r).forEach(function(entry){add('t1-item-info',entry.id,entry.name,uiIcon('key'),entry.qty);});
 if(TR.curSup(r,'leopard')>0)add('active-item-info','panther','Статуэтка чёрной пантеры',uiIcon('paw'),TR.curSup(r,'leopard'));
 (r.soulBag||[]).forEach(function(x){add('active-item-info','soul:'+x.id,'Собранные души: '+x.name,uiIcon('skull'),null);});
 (r.questItems||[]).forEach(function(x){add('quest-item-info',x,x,uiIcon('key'),null);});
 if(HB.owned(s.meta))add('hunter-book',null,'Охотничий бестиарий',HB.bookIcon(),null);
 return {html:result.join(''),count:result.length};
}
/* Consumables in the backpack open a description before spending a turn.
   Quick battle-dock buttons intentionally keep their existing one-tap behavior. */
function activeItemDetails(token){
 if(!r)return null;
 var parts=String(token||'').split(':'),kind=parts[0],id=parts.slice(1).join(':'),st=stats();
 if(kind==='potion'&&r.potions>0)return {
  name:'Целебный эликсир',description:'Восстанавливает 45% максимального здоровья. Расходует один эликсир и один ход.',
  qty:r.potions,action:'potion',id:null,disabled:r.hp>=st.hp,reason:'Здоровье уже полное.'};
 if(kind==='prepared'){
  var slot=Number(id),p=Number.isInteger(slot)&&slot>=0&&slot<2?SYS.byPotion[(r.preparedPotions||[])[slot]]:null;
  if(!p)return null;
  return {name:p.name,description:p.description,qty:1,action:'use-prepared',id:String(slot)};
 }
 if(kind==='pocket'){
  var obj=(r.lootBag||[]).find(function(x){return String(x.id)===id&&x.qty>0&&['vial-hp','vial-mp'].includes(x.kind);});
  if(!obj)return null;
  var hp=obj.kind==='vial-hp';
  return {name:obj.name,description:hp?'Восстанавливает от 5 до 20 HP (не выше максимума).':'Восстанавливает от 3 до 10 MP (не выше максимума).',
   qty:obj.qty,action:'use-pocket',id:id,disabled:hp?r.hp>=st.hp:r.mp>=st.mp,
   reason:hp?'Здоровье уже полное.':'Мана уже полная.'};
 }
 if(kind==='forest'){
  var usable={bleed_trap:'Накладывает на выбранного доступного врага кровотечение на 3 хода и оглушение на 1 ход.',
   stun_trap:'Оглушает выбранного доступного врага на 3 хода.',
   honey:'Восстанавливает до 24 HP.',mushroom:'Восстанавливает до 14 HP.',
   water:'Снимает отравление и кровотечение, а также восстанавливает до 8 HP.'};
  var stock=FE.ensure(r).items,def=FE.itemDefs[id];if(!Object.prototype.hasOwnProperty.call(usable,id)||!def||!stock[id])return null;
  var attack=id==='bleed_trap'||id==='stun_trap',healing=id==='honey'||id==='mushroom';
  return {name:def[0],description:usable[id],qty:stock[id],action:'forest-use',id:id,
   disabled:attack?!enemies().length:healing&&r.hp>=st.hp,
   reason:attack?'Нет доступного врага.':healing?'Здоровье уже полное.':''};
 }
 if(kind==='panther'){
  var statues=TR.curSup(r,'leopard');
  if(statues<=0)return null;
  return {name:'Статуэтка чёрной пантеры',description:'Призывает чёрную пантеру с собственными HP и физической атакой. Она действует в бою, получает ответ врага на свои удары и сопровождает героя до конца этажа или гибели.',qty:statues,
   action:'title-panther-use',id:null,disabled:!!(r.titlePanther&&r.titlePanther.hp>0),reason:'Чёрная пантера уже призвана.'};
 }
 if(kind==='soul'){
  var soul=(r.soulBag||[]).find(function(x){return String(x.id)===id;});if(!soul)return null;
  var description=soul.kind==='unique'?'Превращает особую душу исследователя в уникальную находку (если её история известна).':
   soul.kind==='elite'?'Исцеляет на 35% максимального здоровья и создаёт защитный щит.':
   'Превращает обычную душу в магический щит.';
  return {name:soul.name,description:description,qty:1,action:'consume-soul',id:id};
 }
 return null;
}
function activeItemInfo(token){
 var info=activeItemDetails(token);if(!info){toast('Предмет больше не доступен.');panelDialog('bag');return;}
 var disabled=!!info.disabled;
 dialog('<div class="panel-heading"><div><small class="sheet-kicker">РЮКЗАК · АКТИВНЫЙ ПРЕДМЕТ</small><h2>'+esc(info.name)+'</h2></div>'+
 '<button class="panel-close" data-action="ui-panel" data-id="bag" aria-label="В рюкзак">←</button></div>'+
 '<article class="active-item-sheet"><p>'+esc(info.description)+'</p><p class="fine">В наличии: ×'+info.qty+' · Применение: 1 ход</p>'+
 (disabled?'<p class="fine muted">'+esc(info.reason||'Сейчас использовать невозможно.')+'</p>':'')+'</article>'+
 '<button class="btn gold wide" data-action="active-item-use" data-id="'+esc(String(token))+'"'+(disabled?' disabled':'')+'>Использовать · 1 ход</button>'+
 '<button class="btn alt wide space-top" data-action="ui-panel" data-id="bag">Вернуться в рюкзак</button>');
}
function activeItemUse(token){
 var info=activeItemDetails(token);
 if(!info){toast('Предмет больше не доступен.');panelDialog('bag');return;}
 if(info.disabled){toast(info.reason||'Использование сейчас невозможно.');return;}
 close();action(info.action,info.id);
}
function usePocket(id){
 var obj=(r.lootBag||[]).find(function(x){return x.id===Number(id)&&x.qty>0;});if(!obj||obj.kind==='trinket')return;
 var hp=obj.kind==='vial-hp',maximum=hp?stats().hp:stats().mp,old=hp?r.hp:r.mp;
 if(old>=maximum){toast(hp?'Здоровье уже полное.':'Мана уже полная.');return;}
 var restored=Math.min(maximum-old,hp?rand(5,20):rand(3,10));
 if(hp)r.hp+=restored;else r.mp+=restored;
 obj.qty--;if(obj.qty===0)r.lootBag=r.lootBag.filter(function(x){return x!==obj;});
 log(obj.name+': +'+restored+(hp?' HP.':' MP.'));finishAction();
}
function inventoryPanel(){
 var st=stats(),items=r.items.filter(function(it){return !equipped(it.id);}).sort(function(a,b){return b.rarity-a.rarity;});
 var extra=backpackExtraSlots(),count=items.length+extra.count,empty='';
 for(var i=count;i<Math.max(20,Math.ceil(count/5)*5);i++)empty+='<div class="inventory-empty" aria-hidden="true"></div>';
 return '<div class="inventory-upper"><div class="paper-doll"><div class="doll-left">'+['helm','armor','bracer','boots'].map(gearSlotButton).join('')+'</div><div class="doll-center">'+window.CryptArt.hero(r.class)+'<b>'+C[r.class].name+'</b>'+gearSlotButton('weapon')+'</div><div class="doll-right">'+['ring','amulet','cloak','gloves'].map(gearSlotButton).join('')+'</div></div><dl class="inventory-stats">'+[['Здоровье',r.hp+'/'+st.hp],['Мана',r.mp+'/'+st.mp],['Атака',st.atk],['Магия',st.pow],['Броня',st.def],['Крит',st.crit+'%'],['Уклон',st.dodge+'%'],['Щит',r.shield+(r.setShieldRemaining||0)]].map(function(x){return '<dt>'+x[0]+'</dt><dd>'+x[1]+'</dd>';}).join('')+'</dl></div><div class="inventory-divider"><b>Рюкзак</b><span>'+count+' предметов · без ограничения</span></div><div class="inventory-grid">'+itemGrid(items)+extra.html+empty+'</div>'+
 '<button class="btn alt wide space-top" data-action="gear-sets">Комплекты и развитие героя</button><button class="btn alt wide space-top" data-action="bag-details">Материалы для крафта</button>';
}
function gearArt(it,slot){
 var art=SP.gearIcon&&SP.gearIcon(it);if(art)return art;
 var type=slot||(it&&it.slot)||'weapon';
 if(type==='boots'||type==='ring')return '<img class="painted-gear illustrated-gear illustrated-'+type+'" src="'+(type==='boots'?'gear_boots_hunter.svg':'gear_ring_hunter.svg')+'" alt="" draggable="false"/>';
 return window.CryptArt.item(type,it?it.rarity:0);
}
function gearSlotButton(slot){
 var it=equippedItem(slot);
 return '<button class="gear-slot '+(it?'r'+it.rarity:'empty-slot')+'" data-action="inspect-slot" data-id="'+slot+'" aria-label="'+esc(SLOT[slot])+'">'+
  gearArt(it,slot)+
  '<span>'+SLOT[slot]+'</span>'+(it&&it.plus?'<i>+'+it.plus+'</i>':'')+'</button>';
}
function renderHero(){
 var sets=Object.entries(CR.counts(r.equip,r.items)).filter(function(e){return e[1]>0;}).map(function(e){var set=CR.setDefinition(e[0]),desc=CR.descriptions(e[0]);return '<div class="set-ledger"><h3>'+esc(set?set.name:e[0])+' <small>'+e[1]+'/'+(CR.setRules(e[0])?.slots.length||4)+'</small></h3>'+desc.map(function(t,i){return '<p class="'+(e[1]>=CR.thresholds(e[0])[i]?'set-on':'')+'">'+esc(t)+'</p>';}).join('')+'</div>';}).join('');
 var earnedSets=TR.titleSets(r).map(function(t){return '<div class="set-ledger title-earned-set"><h3>'+esc(t.name)+' <small>'+t.count+'/'+t.max+'</small></h3><p class="'+(t.count===t.max?'set-on':'')+'">'+esc(t.description)+'</p></div>';}).join('');
 return '<div class="progression-sheet"><div class="sheet-kicker">ПУТЬ ГЕРОЯ</div><h2>'+esc(C[r.class].name)+'</h2><div class="frame-title">АКТИВНЫЕ КОМПЛЕКТЫ</div>'+(sets+earnedSets||'<p class="fine muted">Найдите две части одного комплекта.</p>')+'<div class="progress-kpis"><span><b>'+r.floor+'</b>Этаж</span><span><b>'+r.kills+'</b>Победы</span><span><b>'+r.secrets+'</b>Тайны</span></div><button class="btn gold wide" data-action="hero-stats" data-id="'+r.class+'">Постоянное развитие героя</button><button class="btn alt wide space-top" data-action="camp">Память предков</button><button class="btn dark wide space-top" data-action="abandon">Завершить забег</button></div>';
}

/* Weighted scroll discovery: rank VI is never sold and never a normal chest reward.
   An Earth Gate may be found at most once per location; the second comes from the title. */
function rollSpell(limit){
 limit=Math.max(1,Math.min(6,limit||4));
 var r100=Math.random()*100;
 var rank=r100<44?1:r100<70?2:r100<86?3:r100<96?4:r100<99.85?5:6;
 if(rank>limit)rank=limit;
 var options=SPELLS.filter(function(sp){return !sp.titleOnly&&sp.rank===rank&&
  !(sp.id==='earthgate'&&r.earthGateFound)&&
  !(sp.rank===6&&(r.sixStarFound||r.floor<40));});
 if(!options.length)options=SPELLS.filter(function(sp){return !sp.titleOnly&&sp.rank<=Math.min(limit,4);});
 return pick(options);
}
function grantScroll(id,count,source){
 var sp=SYS.bySpell[id];if(!sp)return 0;
 if(sp.id==='earthgate'&&source!=='title'){
  if(r.earthGateFound)return 0;
  r.earthGateFound=true;count=1;
 }
 if(sp.rank===6){
  if(r.sixStarFound)return 0;
  r.sixStarFound=true;count=1;
 }
 count=TR.scrollCount(r,sp,count,source);r.scrolls[id]=(r.scrolls[id]||0)+count;return count;
}

function manaCost(sp){return Math.max(1,sp.cost-bonus('manaDiscount'));}

/* Pocket-room spell combat uses the same consumable scroll and turn rules.
   World-altering / terrain magic is cast only from the main maze. */
function activeRoom(){
 if(!r||r.chamberActive==null)return null;
 var t=tile(r.chamberActive);return t&&t.kind==='chamber'&&t.room?t:null;
}
function livingRoomGuards(){
 var t=activeRoom();return t?t.room.guards.filter(function(g){return g.hp>0;}):[];
}
function castInSideRoom(sp,chosenTarget){
 var t=activeRoom();if(!t)return false;
 var guards=livingRoomGuards(),st=stats(),power=spellPower(sp,st);
 var affected=0,total=0;
 var preferred=chosenTarget!=null?guards.find(function(g){return g.slot===Number(String(chosenTarget).split(':')[1]);}):guards[0];
 var targets=['aoe','burnall','freezeall','drainall'].includes(sp.kind)?guards:
  ['chain'].includes(sp.kind)?[preferred].concat(guards.filter(function(g){return g!==preferred;})).filter(Boolean).slice(0,Math.max(1,3+bonus('chainTargets'))):
  preferred?[preferred]:[];
 function hit(g){
   // Spell hits do not provoke a melee counterattack.
   var damage=Math.max(1,Math.ceil(power-(g.def||0)));
  g.hp=Math.max(0,g.hp-damage);total+=damage;affected++;
  if(g.hp>0&&['burn','burnall'].includes(sp.kind))g.burn=Math.max(g.burn||0,3);
  if(g.hp>0&&['stun','freezeall'].includes(sp.kind))g.stun=Math.max(g.stun||0,2);
  if(g.hp>0&&sp.kind==='weakness')g.atk=Math.max(1,g.atk-Math.ceil(st.pow*.3));
 }
 if(sp.kind==='blessing'){
  var bonusAtk=Math.max(1,Math.floor(st.atk*(sp.id==='electrostatic'?.3:.2)*TR.spellMultiplier(r,sp)));
  r.titleBlessAtk=Math.max(r.titleBlessAtk||0,bonusAtk);
  r.titleBlessTurns=Math.max(r.titleBlessTurns||0,5+TR.rank5(r,'mag_legendary','mp'));
 }
 if(['heal','healshield','lastlight'].includes(sp.kind))r.hp=Math.min(st.hp,r.hp+power);
 if(['shield','healshield','lastlight'].includes(sp.kind))r.shield+=sp.kind==='shield'?power:Math.ceil(power*.7);
 if(sp.kind==='lastlight')r.resurrection=(r.resurrection||0)+1;
 if(sp.kind==='timestop')r.timeStopTurns=Math.max(r.timeStopTurns||0,5+TR.rank5(r,'mag_legendary','mp'));
 if(['attack','burn','stun','drain','chain','aoe','burnall','freezeall','holy','weakness','drainall'].includes(sp.kind)){
  targets.forEach(hit);
  if(['drain','drainall'].includes(sp.kind))r.hp=Math.min(st.hp,r.hp+Math.ceil(total*.45));
 }
 t.room.guardHp=t.room.guards.reduce(function(n,g){return n+Math.max(0,g.hp);},0);
 log('В побочной комнате применено «'+sp.name+'»: целей '+affected+'.');
 finishAction();if(r)showChamber(t);
 return true;
}

function spellValid(sp){
 if(r.silenceTurns>0)return 'Магия заглушена боссом';var allowed=TR.canCast(r,sp);if(allowed)return allowed;
 if(activeRoom()&&(sp.rank===6||['earthgate','reveal','earthquake'].includes(sp.kind)))return 'Для изменения этажей выйдите из побочной комнаты';
 if(r.mp<manaCost(sp))return 'Недостаточно маны';
 if((r.scrolls[sp.id]||0)<1)return 'Нет свитков';
 if(sp.id==='earthgate'&&r.floor<=1)return 'Нет нижних этажей для возвращения';
 if(['attack','burn','stun','chain','drain','aoe','burnall','freezeall','holy','weakness','drainall','sunfall','soulcovenant'].indexOf(sp.kind)>=0&&!enemies().length&&!livingRoomGuards().length)return 'Нет обнаруженных врагов';
 if(['reveal','earthquake'].indexOf(sp.kind)>=0&&!r.tiles.some(function(t){return CR.exploreStatus(t,r.tiles,r.heroTile).ok;}))return 'Нет доступных плит';
 return null;
}

function spellTabs(){
 var options=[{id:'all',name:'Все',icon:'✣'}].concat(SYS.schools);
 return '<div class="spell-school-tabs">'+options.map(function(x){
  var selected=(r.spellSchool||'all')===x.id;
  return '<button class="bag-filter'+(selected?' active':'')+'" data-action="spell-school" data-id="'+x.id+'">'+
   x.icon+' '+x.name+'</button>';
 }).join('')+'</div>';
}
function shownSpells(){return SPELLS.filter(function(sp){return (!sp.titleOnly||(r.scrolls[sp.id]||0)>0)&&((r.spellSchool||'all')==='all'||sp.school===r.spellSchool);})
 .sort(function(a,b){return a.rank-b.rank;});}

function renderSpells(){
 var list=shownSpells();
 return '<div class="spellbook"><aside class="element-tabs">'+[{id:'all',name:'Все',icon:'scroll'}].concat(SYS.schools.map(function(x){return {id:x.id,name:x.name,icon:schoolIcon(x.id)};})).map(function(x){return '<button class="'+((r.spellSchool||'all')===x.id?'active':'')+'" data-action="spell-school" data-id="'+x.id+'" aria-label="'+esc(x.name)+'">'+uiIcon(x.icon)+'<span>'+esc(x.name)+'</span></button>';}).join('')+'</aside><div class="book-page"><div class="book-title">'+esc((SYS.schools.find(function(x){return x.id===r.spellSchool;})||{name:'Все школы'}).name)+'<small>Мана '+r.mp+'/'+stats().mp+'</small></div><div class="book-spells">'+list.map(function(sp){var error=spellValid(sp);return '<button class="book-spell '+(r.scrolls[sp.id]?'owned':'')+'" data-action="spell-detail" data-id="'+sp.id+'">'+uiIcon(schoolIcon(sp.school))+'<strong>'+esc(sp.name)+'</strong><small>'+sp.rank+'★ · '+manaCost(sp)+' МН · ×'+(r.scrolls[sp.id]||0)+'</small>'+(spellPreview(sp)?'<em class="book-spell-power">'+spellPreview(sp).label+': '+spellPreview(sp).value+'</em>':'')+'<span class="spell-availability">'+esc(error||'Можно применить')+'</span></button>';}).join('')+'</div></div></div>';
}
function renderTalents(){
 var tree=clamp(r.treeView||0,0,2),nodes=talentsByTree(tree),positions={};
 var rows={};nodes.forEach(function(t){(rows[t.rank]||(rows[t.rank]=[])).push(t);});
 var canvasHeight=830,canvasWidth=780;
 Object.keys(rows).forEach(function(rank){rows[rank].forEach(function(t,i){
  positions[t.id]={x:72+(Number(rank)-1)*158,y:40+(i+.5)*750/rows[rank].length};
 });});
 var selected=nodes.find(function(t){return t.id===selectedTitle;})||nodes.find(function(t){return lvl(t.id)>0;})||nodes[0];
 if(!selected)return '';
 var lines=nodes.map(function(t){var b=positions[t.id];return (t.parents||[]).filter(function(p){return positions[p];}).map(function(p){var a=positions[p];return '<path class="'+(lvl(t.id)&&lvl(p)?'learned':'')+'" d="M '+a.x+' '+a.y+' H '+(a.x+64)+' V '+b.y+' H '+b.x+'"/>';}).join('');}).join('');
 var graph=nodes.map(function(t){var pos=positions[t.id];return '<button class="talent-dot '+(lvl(t.id)?'learned ':'')+(!talentUnlocked(t)?'locked ':'')+(selected.id===t.id?'selected':'')+'" style="left:'+pos.x+'px;top:'+pos.y+'px" data-action="title-detail" data-id="'+t.id+'"><span>'+uiIcon(t.tree===2?'compass':t.tree===1?'staff':'sword')+'</span><b>'+esc(t.name)+'</b><small>'+(t.rank===5?(lvl(t.id)?'★':'0/1'):lvl(t.id)+'/3')+'</small></button>';}).join('');
 var full=lvl(selected.id)>=selected.max_level;
 var reason=talentPathConflict(selected)?'Другая ветка уже выбрана':!talentUnlocked(selected)?'Сначала изучите одно из предыдущих званий':full?'Звание изучено':r.ep<levelCost(selected)?'Недостаточно очков исследования':'Выбранная ветка сохранится до конца экспедиции';
 var advanced=selected.rank===5&&full?'<div class="title-mastery"><strong>Улучшения V ранга · каждое по '+levelCost(selected)+' ОИ</strong><div class="title-mastery-grid">'+TR.masterKeys(selected).map(function(key){
  var l=TR.rank5(r,selected.id,key),vec=TR.masteryStatValues(selected,key),current=l?vec[l-1]:0,next=l>=3?vec[2]:vec[l],stat=({atk:'Атака',pow:'Магия',hp:'Здоровье',mp:'Мана'}[key]||key);
  return '<button data-action="title-mastery" data-id="'+selected.id+':'+key+'" '+(l>=3||r.ep<levelCost(selected)?'disabled':'')+'><b>'+stat+' '+l+'/3</b><small>+'+current+(l>=3?' · МАКС':' → +'+next)+'</small></button>';
 }).join('')+'</div></div>':'';
 return '<div class="talent-tabs">'+['Воин','Маг','Авантюрист'].map(function(n,i){return '<button data-action="tree" data-id="'+i+'" class="'+(tree===i?'active':'')+'">'+uiIcon(['sword','staff','compass'][i])+n+'</button>';}).join('')+'</div><div class="talent-scroll"><div class="talent-canvas" style="width:'+canvasWidth+'px;height:'+canvasHeight+'px"><svg class="talent-lines" style="width:'+canvasWidth+'px;height:'+canvasHeight+'px" viewBox="0 0 '+canvasWidth+' '+canvasHeight+'">'+lines+'</svg>'+graph+'</div></div><div class="talent-inspector"><div><h3>'+esc(selected.name)+'</h3><p>'+esc(selected.mechanic)+'</p><small>'+esc(selected.stats)+'</small><p class="fine">'+reason+'</p></div><button class="btn gold" data-action="talent" data-id="'+selected.id+'" '+(full||r.ep<levelCost(selected)||!talentUnlocked(selected)?'disabled':'')+'>'+(full?'Изучено':levelCost(selected)+' ✧')+'</button></div>'+advanced+'<div class="talent-balance">Очки исследования <b>'+r.ep+'</b><span>Перетащите дерево для обзора всех путей</span></div>';
}

function statName(k){return {atk:'Атака',def:'Броня',hp:'Здоровье',mp:'Мана',pow:'Магия',crit:'Крит %'}[k];}

function gearComparison(slot,selectedId){
 var worn=equippedItem(slot),candidate=item(selectedId);
 if(candidate&&candidate.slot!==slot)candidate=null;
 var available=r.items.filter(function(it){return it.slot===slot;}).sort(function(a,b){return b.rarity-a.rarity||b.floor-a.floor;});
 if(!candidate)candidate=available.find(function(it){return !equipped(it.id);})||worn||available[0]||null;
 r.inspectSlot=slot;r.inspectItem=candidate?candidate.id:null;
 var cols=['atk','def','hp','mp','pow','crit'];
 var changed=cols.filter(function(k){return (candidate&&candidate[k]||0)!==(worn&&worn[k]||0);});
 var rows=changed.map(function(k){
  var current=worn&&worn[k]||0,going=candidate&&candidate[k]||0,delta=going-current;
  return '<div class="gear-compact-change"><span>'+statName(k)+'</span><span>'+current+' → '+going+'</span>'+
   '<strong class="'+(delta>0?'positive':delta<0?'negative':'')+'">'+(delta>0?'+':'')+delta+'</strong></div>';
 }).join('')||'<p class="fine muted">Числовые параметры не изменятся. Сравните особые эффекты и комплект.</p>';
 var next=Object.assign({},r.equip);if(candidate)next[slot]=candidate.id;
 var setCount=CR.counts(next,r.items),rules=candidate&&candidate.setId?CR.setRules(candidate.setId):null;
 var setInfo=rules?'<div class="compact-set-help"><strong>Комплект: '+esc(candidate.setName)+' · '+(setCount[candidate.setId]||0)+'/'+rules.slots.length+'</strong>'+
  CR.descriptions(candidate.setId).map(function(line,i){return '<small class="'+((setCount[candidate.setId]||0)>=CR.thresholds(candidate.setId)[i]?'set-on':'')+'">'+esc(line)+'</small>';}).join('')+'</div>':
  '<div class="compact-set-help fine muted">'+(candidate&&candidate.uniqueEffect?'Уникальный предмет 6★: '+esc(candidate.trait):'Самостоятельная экипировка')+'</div>';
 var list=available.map(function(it){return '<button class="item r'+it.rarity+(candidate&&candidate.id===it.id?' selected':'')+
  '" data-action="modal-select" data-id="'+it.id+'">'+gearArt(it)+
  '<span>'+esc(it.name)+'</span></button>';}).join('');
 var cost=candidate?upgradeCost(candidate):0;
 dialog('<div class="panel-heading"><div><small class="sheet-kicker">ЭКИПИРОВКА · '+esc(SLOT[slot])+'</small><h2>Сравнение вещей</h2></div><button class="panel-close" data-action="ui-panel" data-id="bag" aria-label="В рюкзак">←</button></div><div class="comparison-sheet">'+
 '<div class="gear-two-columns gear-compact-head"><div>'+gearArt(worn,slot)+
 '<small class="comparison-caption">Надето</small><b>'+esc(worn?worn.name:'Пусто')+'</b></div><div>'+gearArt(candidate,slot)+
 '<small class="comparison-caption">Выбрано</small><b>'+esc(candidate?candidate.name:'Нет предмета')+'</b></div></div>'+
 '<div class="gear-compact-stats">'+rows+'</div>'+setInfo+
 '<div class="gear-dialog-actions"><button class="btn small" data-action="modal-equip" '+(candidate&&!equipped(candidate.id)?'':'disabled')+'>Надеть</button>'+
 '<button class="btn alt small" data-action="modal-upgrade" '+(candidate&&r.gold>=cost&&candidate.plus<9?'':'disabled')+'>Заточить '+cost+' ◈</button>'+
 '<button class="btn dark small" data-action="modal-scrap" '+(candidate&&!equipped(candidate.id)?'':'disabled')+'>Разобрать</button></div>'+
 '<div class="frame-title">Подходящие предметы · '+available.length+'</div><div class="gear-picker">'+(list||'<p>В этом слоте пусто.</p>')+'</div>'+
 '</div><button class="btn alt wide space-top" data-action="ui-panel" data-id="bag">В рюкзак</button>');
}

function magicDialog(){panelDialog('spells');}

function itemGrid(items){
 return items.map(function(i){
  return '<button class="item r'+i.rarity+(r.bagSelected===i.id?' selected':'')+'" data-action="item-select" data-id="'+i.id+'" aria-label="'+esc(i.name)+'" title="'+esc(i.name)+'">'+
   
    gearArt(i)+
  '<span>'+esc(i.name)+(i.plus?' +'+i.plus:'')+'</span></button>';
 }).join('');
}
function compareStat(it,other,key){
 var v=it[key]||0,a=other?(other[key]||0):0,d=v-a;
 return '<div class="compare-row"><span>'+({atk:'Атака',def:'Броня',hp:'HP',mp:'MP',pow:'Магия',crit:'Крит %'})[key]+'</span>'+
 '<span>'+(other?a:'—')+'</span><b>'+v+'</b><em class="'+(d>0?'up':d<0?'down':'even')+'">'+(d>0?'+':'')+d+'</em></div>';
}
function renderBag(){
 var materials=Object.entries(r.materials||{}).filter(function(x){return x[1]>0;});
 var sections=[['Материалы',materials.map(function(x){return '<div class="supply-material">'+SP.materialIcon(x[0])+'<span>'+esc(x[0])+'</span><b>×'+x[1]+'</b></div>';}).join('')||'<p>Материалов пока нет.</p>']];
 return '<div class="supply-ledger"><div class="supply-totals"><span>'+goldArt('gold-coin-inline')+r.gold+'</span><span>'+uiIcon('scroll')+Object.values(r.scrolls).reduce(function(a,b){return a+b;},0)+'</span><span>'+uiIcon('potion')+r.potions+'</span></div>'+sections.map(function(x){return '<section><h3>'+x[0]+'</h3>'+x[1]+'</section>';}).join('')+'</div>';
}
function renderMenu(){
 if(!r)return '<h2>Пограничный привал</h2><button class="btn gold wide space-top" data-action="choose">В поход</button><button class="btn alt wide space-top" data-action="camp">Герои и развитие</button><button class="btn alt wide space-top" data-action="chronicles">Хроники и реликвии</button><button class="btn dark wide space-top" data-action="close">Вернуться в деревню</button>';
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

function localAchievement(kind,reward,title){
 if(!r)return 0;
 var code='act'+((r.actIndex||0)+1)+'-location'+((r.locationIndex||0)+1)+'-'+kind;
 var awarded=awardAchievement(code,reward);
 if(awarded)log('✧ Достижение «'+title+'»: +'+awarded+' радужных алмазов.');
 return awarded;
}


/* Town quest contracts are tied to boss portals, not arbitrary exits.
   An account can report each region only once and can claim it much later. */
function submitRegionReport(act,location,floor,questItems){
 var loc=DN.location(act,location);if(!loc)return false;
 var key='act'+(act+1)+'-location'+(location+1);
 if(s.meta.questReports[key])return false;
 var itemName=loc.questItem||'Неизвестная печать';
 if(!Array.isArray(questItems)||questItems.indexOf(itemName)<0)return false;
 s.meta.questReports[key]={act:act,location:location,floor:floor,
  key:key,item:itemName,claimed:false};
 return true;
}
function claimQuestReport(id){
 if(r)return;
 var entry=s.meta.questReports[id];if(!entry||entry.claimed)return;
 var loc=DN.location(entry.act,entry.location);if(!loc)return;
 entry.claimed=true;
 var diamonds=2+entry.act*2+entry.location;
 var essence=4+entry.act*2;
 s.meta.diamonds+=diamonds;s.meta.souls+=essence;
 s.meta.materials['Осколок воспоминания']=(s.meta.materials['Осколок воспоминания']||0)+1;
 var actKey='act'+(entry.act+1),completed=DN.acts[entry.act].locations.every(function(z,i){
  var k=actKey+'-location'+(i+1);return s.meta.questReports[k]&&s.meta.questReports[k].claimed;
 });
 var chapter=false;
 if(completed&&!s.meta.memoryChapters[actKey]){
  s.meta.memoryChapters[actKey]=true;
  s.meta.diamonds+=5+entry.act;
  chapter=true;
 }
 save();draw();
 var textResult='<h2>Отчёт принят</h2><p>Задание «'+esc(loc.quest||loc.name)+'» закрыто.</p>'+
  '<p>Постоянно получено: '+diamonds+' алмазов, '+essence+' памяти, 1 осколок воспоминания.</p>'+
  (chapter?'<p class="golden">Три печати акта собраны. Открыта глава памяти: '+esc(DN.acts[entry.act].story)+
   '. Дополнительная награда: '+(5+entry.act)+' алмазов.</p>':'')+
  '<button class="btn wide" data-action="quest-board">Продолжить изучение хроник</button>';
 dialog(textResult);
}
function questBoard(){
 if(r){toast('Совет деревни доступен между походами.');return;}
 var reports=s.meta.questReports||{},chapterCount=Object.keys(s.meta.memoryChapters||{}).length;
 var pending=Object.keys(reports).filter(function(k){return !reports[k].claimed;}).length;
 var rows=DN.acts.map(function(a,act){
  var quests=a.locations.map(function(loc,i){
   var key='act'+(act+1)+'-location'+(i+1),report=reports[key];
   var label=report?(report.claimed?'Отчёт сдан':'Отчёт готов'):'Не пройдено';
   var action=report&&!report.claimed?'<button class="btn small" data-action="claim-quest" data-id="'+key+'">Сдать</button>':'';
   return '<div class="meta-upgrade"><div><strong>'+(i+1)+'. '+esc(loc.name)+'</strong>'+
    '<small>'+esc(loc.quest||'Победить местного босса и вынести печать')+'</small>'+
    '<small>Статус: '+label+(report?' · глубина '+report.floor:'')+'</small></div>'+action+'</div>';
  }).join('');
  return '<div class="frame-title space-top">'+(act+1)+'. '+esc(a.name)+
   (s.meta.memoryChapters['act'+(act+1)]?' · Глава памяти открыта':'')+'</div>'+
   '<p class="fine muted">'+esc(a.story||'')+'</p>'+quests;
 }).join('');
 dialog('<div class="emblem">✥</div><h2>СОВЕТ ДЕРЕВНИ</h2>'+
 '<p>Задания объединяют три локации каждого подземелья. После победы над боссом безопасно вернитесь с печатью и передайте отчёт. Отчёт не пропадает при повторном походе или смене акта.</p>'+
 '<p>Восстановлено глав памяти: '+chapterCount+'/10 · несданных отчётов: '+pending+'.</p>'+
 '<div class="scroll-spells" style="max-height:59dvh;overflow:auto">'+rows+'</div>'+
 '<button class="btn alt wide space-top" data-action="close">Вернуться на базу</button>');
}

function safePortal(){
 if(!r||!r.portalReady||!isBossFloor()||!r.bossClears[r.floor]){toast('Безопасный портал открывается только после победы над боссом.');return;}
 var oldName=currentRegion().name,oldAct=r.actIndex,oldLocation=r.locationIndex;
 if(oldAct===0&&oldLocation===0){
  var finishedTrophies=FE.safeReturn(r,s.meta,HB);
  if(finishedTrophies)log('Охотничий бестиарий: сохранено трофеев '+finishedTrophies+'.');
 }
 submitRegionReport(oldAct,oldLocation,r.floor,r.questItems);
 var locKey='act'+(oldAct+1)+'-location'+(oldLocation+1);
 var rainbow=awardAchievement(locKey+'-first-boss',1);
 if(r.bossClears[50])rainbow+=awardAchievement(locKey+'-deep-50',2);
 var loot=bankExpeditionLoot(1),scrap=0;
 s.meta.best=Math.max(s.meta.best,r.floor);
 fairyRemark('rest');
 if(oldLocation<2){
  var carry=JSON.parse(JSON.stringify(r));
  carry.locationIndex=oldLocation+1;carry.floor=1;carry.tiles=[];carry.heroTile=null;carry.portalReady=false;
  carry.bossClears={};carry.eliteSchedule={};carry.eliteClears={};carry.rangerType=null;carry.key=false;carry.summon=null;carry.summonTile=null;carry.ghost=null;carry.locationUsedPotion=0;carry.chamberActive=null;carry.shield=0;carry.earthGateFound=false;carry.earthGateTitleGranted=false;carry.sixStarFound=false;carry.spellHistory=[];
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
 r=s.run=carry;s.meta.activeExpedition=null;TR.init(r);
 r.floor=1;r.portalReady=false;r.bossClears={};r.eliteSchedule={};r.eliteClears={};r.rangerType=null;r.key=false;r.summon=null;r.summonTile=null;
 r.materials={};r.diamonds=0;r.tiles=[];
 r.earthGateFound=false;r.earthGateTitleGranted=false;r.sixStarFound=false;r.spellHistory=[];
 fillPreparedPotions(r);r.chamberActive=null;r.fx=null;
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

function dungeonAchievements(){
 var claimed=s.meta.achievements||{};
 var rows=DN.acts.map(function(a,i){
  var list=a.locations.map(function(loc,j){
   var prefix='act'+(i+1)+'-location'+(j+1);
   return '<div class="row space-bottom"><div><strong>'+(claimed[prefix+'-first-boss']?'✓ ':'')+esc(loc.name)+'</strong>'+
    '<small>Босс 30-го: '+(claimed[prefix+'-first-boss']?'✓':'○')+' · 50-й этаж: '+(claimed[prefix+'-deep-50']?'✓':'○')+' · Элитник: '+(claimed[prefix+'-elite']?'✓':'○')+' · Тайник: '+(claimed[prefix+'-secret-room']?'✓':'○')+' · Без зелий: '+(claimed[prefix+'-boss-no-potions']?'✓':'○')+' · Загадка: '+(claimed[prefix+'-lore-puzzle']?'✓':'○')+'</small></div></div>';
  }).join('');
  return '<div class="frame-title space-top">'+(i+1)+'. '+esc(a.name)+(claimed['act'+(i+1)+'-complete']?' ✓':'')+'</div>'+list;
 }).join('');
 dialog('<div class="emblem">✧</div><h2>ДОСТИЖЕНИЯ ПОДЗЕМЕЛИЙ</h2>'+
 '<p>У каждой из 30 локаций есть награды за первого босса, глубину 50, элитника, тайник и победу без зелий. Полное прохождение трёх локаций награждается отдельно.</p>'+
 '<p class="fine muted">Пробный баланс: +1 за первый портал, +2 за глубину 50, +3 за весь акт. Итоговые значения ещё будут согласованы.</p>'+
 '<div class="log" style="max-height:57dvh;text-align:left;">'+rows+'</div>'+
 '<button class="btn wide space-top" data-action="close">Закрыть</button>');
}

/* Ordinary diamonds buy modest permanent account improvements. Rainbow diamonds
   are optional cosmetic currency earned through achievements, not mandatory power. */
var DIAMOND_UPGRADES={
 luck:{name:'Наблюдательность',description:'+5% к шансу дополнительной добычи за уровень',cost:7,max:5},
 scouting:{name:'Карты разведчика',description:'+1 бесплатная клетка при начале этажа за уровень',cost:9,max:4},
 wisdom:{name:'Путевые записи',description:'+1 очко исследования при начале этажа за уровень',cost:9,max:5}
};
var FAIRY_COSMETICS={
 default:{name:'Обычный светлячок',price:0,label:'Светлячок'},
 moon:{name:'Лунный огонёк',price:6,label:'Лунная искра'},
 ash:{name:'Пепельная фея',price:8,label:'Пепельная искра'},
 astral:{name:'Астральный светлячок',price:12,label:'Звёздная искра'}
};
function diamondShop(){
 if(r){toast('Рынок открыт только в деревне.');return;}
 var m=s.meta;
 var upgrades=Object.keys(DIAMOND_UPGRADES).map(function(id){
  var data=DIAMOND_UPGRADES[id],rank=m.diamondUpgrades[id]||0,cost=data.cost*(rank+1);
  return '<div class="meta-upgrade"><div><strong>'+data.name+' · '+rank+'/'+data.max+'</strong><small>'+data.description+'</small></div>'+
   '<button class="btn small" data-action="buy-diamond" data-id="'+id+'"'+(rank>=data.max||m.diamonds<cost?' disabled':'')+'>'+
   (rank>=data.max?'Максимум':cost+' ◇')+'</button></div>';
 }).join('');
 var looks=Object.keys(FAIRY_COSMETICS).map(function(id){
  var data=FAIRY_COSMETICS[id],owned=!!m.cosmetics[id],selected=m.fairyCosmetic===id;
  return '<div class="meta-upgrade"><div><strong>'+data.name+'</strong><small>Меняется только название и манера представления феечки — никакого боевого преимущества.</small></div>'+
   '<button class="btn small" data-action="'+(owned?'equip-cosmetic':'buy-cosmetic')+'" data-id="'+id+'"'+(selected||!owned&&m.rainbowDiamonds<data.price?' disabled':'')+'>'+
   (selected?'Выбрано':owned?'Выбрать':data.price+' ◈')+'</button></div>';
 }).join('');
 dialog('<div class="emblem">◇</div><h2>АЛМАЗНАЯ ЛАВКА</h2>'+
 '<p>Обычные алмазы: '+m.diamonds+' ◇ · Радужные: '+m.rainbowDiamonds+' ◈. Радужные выдаются за достижения.</p>'+
 '<div class="frame-title">УМЕРЕННЫЕ ПОСТОЯННЫЕ УЛУЧШЕНИЯ</div>'+upgrades+
 '<div class="frame-title space-top">КОСМЕТИКА СВЕТЛЯЧКА</div>'+looks+
 '<button class="btn alt wide space-top" data-action="close">В деревню</button>');
}
function buyDiamond(id){
 if(r||!DIAMOND_UPGRADES[id])return;
 var info=DIAMOND_UPGRADES[id],level=s.meta.diamondUpgrades[id]||0,cost=info.cost*(level+1);
 if(level>=info.max||s.meta.diamonds<cost)return;
 s.meta.diamonds-=cost;s.meta.diamondUpgrades[id]=level+1;save();draw();diamondShop();
}
function buyCosmetic(id){
 if(r||!FAIRY_COSMETICS[id])return;
 var p=FAIRY_COSMETICS[id];
 if(s.meta.cosmetics[id]||s.meta.rainbowDiamonds<p.price)return;
 s.meta.rainbowDiamonds-=p.price;s.meta.cosmetics[id]=true;save();draw();diamondShop();
}
function equipCosmetic(id){
 if(r||!s.meta.cosmetics[id])return;
 s.meta.fairyCosmetic=id;save();draw();diamondShop();
}

function storedGearDialog(){
 var exp=s.meta.activeExpedition;if(!exp)return;
 var items=exp.items.filter(function(it){return !Object.values(exp.equip).includes(it.id);});
 dialog('<div class="panel-heading"><h2>Запас экспедиции</h2><button class="panel-close" data-action="close" aria-label="Закрыть">×</button></div><p>Ненадетые вещи можно разобрать перед продолжением. Надетое снаряжение сохраняется.</p>'+items.map(function(it){return '<div class="row space-bottom"><span>'+esc(it.name)+'</span><button class="btn small" data-action="scrap-stored-item" data-id="'+it.id+'">Разобрать</button></div>';}).join('')+(items.length?'':'<p class="muted">Ненадетых вещей нет.</p>'));
}
function renderBase(){
 var exp=s.meta.activeExpedition;
 var pending=exp?'<div class="base-resume"><div><small>ЭКСПЕДИЦИЯ СОХРАНЕНА</small><b>'+esc(DN.acts[exp.actIndex].name)+'</b><span>Следующая локация '+(exp.locationIndex+1)+'/3</span></div><button class="btn gold" data-action="resume-expedition">Продолжить</button><button class="stored-gear-button" data-action="stored-gear" aria-label="Снаряжение сохранённой экспедиции">'+uiIcon('bag')+'</button></div>':'';
 var services=[['quest-board','journal','Совет деревни','Задания и история'],['bestiary','shield','Бестиарий','Открытые существа'],['town','home','Поселение','Здания и склад'],['diamond-shop','gem','Лавка','Улучшения и облики'],['alchemy','potion','Алхимик','Подготовить зелья'],['dungeon-achievements','talent','Достижения','Награды путешествия']];
 var acts=DN.acts.map(function(a,i){var unlocked=i<=s.meta.unlockedAct,done=(s.meta.completedActs[i]||0)>0,profile=BAL.actProfile(i);return '<details class="act-entry '+(unlocked?'unlocked':'')+'"><summary><span class="act-number">'+(i+1)+'</span><div><b>'+esc(a.name)+'</b><small>'+(done?'Пройдено · ':!unlocked?'Пока закрыто · ':'')+'Опасность '+(i+1)+'/10</small></div><span class="act-expand">+</span></summary><div class="act-details"><p>'+esc(a.story||'')+'</p><ol>'+a.locations.map(function(l){return '<li>'+esc(l.name)+'</li>';}).join('')+'</ol><small>'+esc(profile.threat)+' · ♥ '+profile.normalHp+' · ⚔ '+profile.normalAtk+'</small><button class="btn gold wide space-top" data-action="select-act" data-id="'+i+'" '+(!unlocked?'disabled':'')+'>'+(exp&&exp.actIndex===i?'Продолжить экспедицию':'Выбрать подземелье')+'</button></div></details>';}).join('');
 return '<div class="village-hub"><div class="village-scene"><div class="village-label"><small>МЕЖДУ ПОХОДАМИ</small><h2>Пограничный привал</h2><p>Последний огонь перед глубиной</p></div></div><div class="village-wealth"><span>'+uiIcon('gem')+(s.meta.diamonds||0)+'<small>Алмазы</small></span><span>'+uiIcon('sun')+(s.meta.rainbowDiamonds||0)+'<small>Радужные</small></span><span>'+uiIcon('bag')+materialCount()+'<small>Материалы</small></span><span>'+uiIcon('talent')+s.meta.souls+'<small>Память</small></span></div>'+pending+'<div class="village-services">'+services.map(function(x){return '<button data-action="'+x[0]+'">'+uiIcon(x[1])+'<span><b>'+x[2]+'</b><small>'+x[3]+'</small></span></button>';}).join('')+'</div><div class="hub-section"><h3>Пути в глубину</h3><span>10 актов · 30 локаций</span></div><div class="act-list">'+acts+'</div><div class="village-record"><span>Походов <b>'+s.meta.runs+'</b></span><span>Лучший этаж <b>'+s.meta.best+'</b></span><button data-action="fairy-toggle">'+(s.meta.fairyMuted?'Светлячок: выкл.':'Светлячок: вкл.')+'</button></div>'+(exp?'<button class="btn dark wide space-top" data-action="discard-expedition">Завершить сохранённую экспедицию</button>':'')+'</div>';
}
function draw(visualOnly){
 if(!s)return;
 $('app').classList.toggle('in-expedition',!!r);
 hud();if(!r){$('content').classList.remove('dungeon-mode');$('content').innerHTML=renderBase();if(FD)FD.paint();return;}
 r.tab='maze';$('content').classList.toggle('dungeon-mode',true);
 $('content').innerHTML=renderMaze();
 scheduleMazeFit();if(FD){FD.paint();FD.schedule();}
 if(uiPanel&&!visualOnly)panelDialog(uiPanel);
}
var mazeResizeObserver=null;
function fitMaze(){
 if(document.documentElement)document.documentElement.style.setProperty('--viewport-height',window.innerHeight+'px');
 var board=document.querySelector('.dungeon-board'),border=document.querySelector('.dungeon-border');
 if(!board||!border||!board.getBoundingClientRect)return;
 var box=board.getBoundingClientRect(),size=Math.max(0,Math.floor(Math.min(box.width,box.height)-4));
 border.style.width=size+'px';border.style.height=size+'px';border.style.setProperty('--cave-rim',Math.max(10,Math.floor(size*.08))+'px');
}
function scheduleMazeFit(){
 if(!window.requestAnimationFrame)return;
 window.requestAnimationFrame(fitMaze);
 if(mazeResizeObserver)mazeResizeObserver.disconnect();
 if(window.ResizeObserver){mazeResizeObserver=new window.ResizeObserver(fitMaze);var board=document.querySelector('.dungeon-board');if(board)mazeResizeObserver.observe(board);}
}
window.addEventListener('resize',fitMaze);
if(window.visualViewport)window.visualViewport.addEventListener('resize',fitMaze);
function toast(msg){
 var el=$('toast');el.textContent=msg;el.classList.add('shown');
 clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('shown');},2400);
}
function dialog(content){if(FD)FD.hide();uiPanel=null;var kind=/data-action="(?:puzzle-answer|story-choice|event-yes)"/.test(content)?' dialog-event':/reward-rows/.test(content)?' dialog-loot':'';$('overlay').innerHTML='<div class="veil"><div class="dialog'+kind+'" role="dialog" aria-modal="true">'+content+'</div></div>';}
function close(){uiPanel=null;$('overlay').innerHTML='';}
function choose(){
 var opts=Object.keys(C).map(function(k){
  var c=C[k];return '<button class="class-option" data-action="begin" data-id="'+k+'">'+window.CryptArt.hero(k)+
 '<span><strong>'+c.icon+' '+c.name+'</strong><small>'+c.description+'</small></span></button>';
 }).join('');
 dialog('<div class="emblem">✥</div><div class="subhead">ПЕПЕЛЬНЫЙ ЛАБИРИНТ</div><h2>ВЫБОР ПУТИ</h2>'+
 '<p>Выбранное подземелье: <b>'+esc(DN.acts[s.meta.selectedAct||0].name)+'</b>. Опасность '+((s.meta.selectedAct||0)+1)+'/10 — '+esc(BAL.actProfile(s.meta.selectedAct||0).threat)+'. Начните первую локацию экспедиции.</p>'+opts+
 '<p class="fine muted">Скрытые клетки · Пошаговый бой · Магия · Призыв · Древа титулов</p>'+
 '<button class="btn dark wide" data-action="close">Закрыть</button>');
}
function upgradeCost(i){return 9+(i.plus+1)*7+i.rarity*4;}

/* Bosses use three HP phases. Special attacks are warned a turn in advance.
   Spawning respects occupied tiles and cannot replace keys or mandatory exits. */
function bossCallsBackup(e){
 if(e.bossAdds>=4)return;
 var cells=r.tiles.filter(function(t){return t.kind==='empty'&&!t.foe&&!t.drops&&!t.summon&&t.id!==r.heroTile;});
 if(!cells.length){log('Нет места для подкрепления босса.');return;}
 var cell=pick(cells);cell.kind='enemy';cell.revealed=true;cell.cleared=false;
 cell.foe=mkEnemy(false,false,false);cell.foe.summoned=true;
 cell.foe.hp=Math.max(5,Math.round(cell.foe.hp*.6));cell.foe.maxHp=cell.foe.hp;
 cell.foe.atk=Math.max(2,Math.round(cell.foe.atk*.6));cell.foe.baseAtk=cell.foe.atk;
 e.bossAdds++;log('Босс призывает подкрепление: '+cell.foe.name+'.');
}

function applyRegionalBossAbility(e,spec,damage,attackTarget){
 if(!spec)return damage;
 var hitHero=attackTarget==null||attackTarget==='hero';
 log('Босс применяет '+spec.name+'.');
 var v=spec.value;
 if(spec.kind==='guard'){e.guard=Math.max(e.guard||0,v);return damage;}
 if(spec.kind==='summon'){for(var i=0;i<v;i++)bossCallsBackup(e);return damage;}
 if(spec.kind==='poison'){if(hitHero)hunterPoison(v);return damage;}
 if(spec.kind==='bleed'){if(hitHero)r.bleedTurns=Math.max(r.bleedTurns||0,v);return damage;}
 if(spec.kind==='burn'){if(hitHero)r.burnTurns=Math.max(r.burnTurns||0,v);return damage;}
 if(spec.kind==='silence'){if(hitHero)r.silenceTurns=Math.max(r.silenceTurns||0,v);return damage;}
 if(spec.kind==='mana'){if(hitHero)r.mp=Math.max(0,r.mp-v);return damage;}
 if(spec.kind==='heal'){e.hp=Math.min(e.maxHp,e.hp+Math.ceil(e.maxHp*v/100));return damage;}
 if(spec.kind==='drain'){if(hitHero)r.hp=Math.max(0,r.hp-v);e.hp=Math.min(e.maxHp,e.hp+v);return damage;}
 if(spec.kind==='shatter'){if(hitHero)r.shield=Math.max(0,r.shield-v);if(hitHero)r.setShieldRemaining=Math.max(0,(r.setShieldRemaining||0)-v);return Math.ceil(damage*1.5);}
 if(spec.kind==='frenzy'){return Math.ceil(damage*v);}
 return damage;
}

function bossAttack(t,e,damage,ready,attackTarget){
 var hitHero=attackTarget==null||attackTarget==='hero';
 var phase=e.hp<=e.maxHp*.35?3:e.hp<=e.maxHp*.70?2:1;
 var style=e.bossStyle==null?((r.actIndex||0)*3+(r.locationIndex||0))%6:e.bossStyle;
 e.phaseTurn=(e.phaseTurn||0)+1;
 if(phase>(e.phase||1)){
  e.phase=phase;e.phaseTurn=0;e.telegraph={phase:phase};
  log('⚠ '+e.name+' переходит в фазу '+phase+'/3 и готовит мощный удар.');
  return null;
 }
 if(e.telegraph){
  var move=e.telegraph.phase;e.telegraph=null;
  var scenario=BS.get(r.actIndex||0,r.locationIndex||0);
  if(scenario&&scenario.phases[move-2])return applyRegionalBossAbility(e,scenario.phases[move-2],Math.ceil(damage*(move===3?2.1:1.3)),attackTarget);
  log('Особый приём босса: '+e.name+'!');
  if(style===0||style===3)bossCallsBackup(e);
  if(style===1)e.guard=4+Math.floor(r.floor/7);
  if(style===2&&hitHero)hunterPoison(move+1);
  if(style===4){e.hp=Math.min(e.maxHp,e.hp+Math.ceil(e.maxHp*.045));log('Босс поглощает жизненную силу.');}
  if(style===5&&hitHero)r.shield=Math.max(0,r.shield-(10+move*5));
  return Math.max(2,Math.round(damage*(move===3?2.4:1.75)));
 }
 if(ready&&phase>=2&&(e.phaseTurn%6===0)){
  e.telegraph={phase:phase};
  log('⚠ Босс предупреждает об опасной атаке на следующем ходу.');
  return null;
 }
 if(ready){
  if(style===0&&phase>=2&&e.bossAdds<4&&e.phaseTurn%5===0)bossCallsBackup(e);
  if(style===1)e.guard=Math.max(e.guard||0,2+phase);
  if(style===2&&phase>=2&&hitHero)hunterPoison(2);
  if(style===3&&phase>=2&&e.phaseTurn%4===0)bossCallsBackup(e);
  if(style===4&&phase>=2)e.hp=Math.min(e.maxHp,e.hp+Math.max(1,Math.round(e.maxHp*.012)));
  if(style===5&&phase>=2)damage*=2;
 }
 return damage;
}


/* Each monster has a stable signature move derived from its role and actual
   bestiary entry. One ability is performed at its cooldown, never every turn. */
function callMonsterMinion(e){
 if(!e||e.summons>=1)return false;
 var cells=r.tiles.filter(function(t){return t.kind==='empty'&&!t.foe&&!t.drops&&!t.summon&&t.id!==r.heroTile;});
 if(!cells.length)return false;
 var cell=pick(cells);
 cell.kind='enemy';cell.revealed=true;cell.cleared=false;
 cell.foe=mkEnemy(false,false,false);
 cell.foe.hp=Math.max(5,Math.ceil(cell.foe.hp*.42));
 cell.foe.maxHp=cell.foe.hp;cell.foe.atk=Math.max(2,Math.ceil(cell.foe.atk*.48));
 cell.foe.gold=Math.max(1,Math.floor(cell.foe.gold*.25));
 cell.foe.ep=1;cell.foe.summoned=true;cell.foe.summons=1;
 e.summons++;log(e.name+' призывает прислужника: '+cell.foe.name+'.');
 return true;
}
function monsterSpecial(e,damage,room,attackTarget){
 var k=e.ability;if(!k)return damage;
 var hitHero=attackTarget==null||attackTarget==='hero';
 var level=r.actIndex||0,shieldDamage=Math.max(2,Math.ceil(e.atk*.65));
 var allies=room?room.guards.filter(function(g){return g.hp>0;})
  :enemies().map(function(t){return t.foe;}).filter(function(g){return g.hp>0;});
 var target=allies.filter(function(g){return g!==e&&g.hp<g.maxHp;})
  .sort(function(a,b){return a.hp/a.maxHp-b.hp/b.maxHp;})[0]||e;
 log(e.name+' применяет «'+(e.abilityName||e.skill.name)+'».');
 if(k==='crush')return Math.ceil(damage*1.65);
 if(k==='bleed'){if(hitHero)r.bleedTurns=Math.max(r.bleedTurns||0,2+(level>=6?1:0));return damage;}
 if(k==='shatter'){if(hitHero)r.shield=Math.max(0,r.shield-shieldDamage);
  if(hitHero)r.setShieldRemaining=Math.max(0,(r.setShieldRemaining||0)-shieldDamage);return Math.ceil(damage*1.18);}
 if(k==='fortify'){e.guard=Math.max(e.guard||0,2+Math.ceil(e.atk*.23));e.guardTurns=3;return Math.ceil(damage*.6);}
 if(k==='shieldbash'){if(hitHero)r.shield=Math.max(0,r.shield-shieldDamage);return Math.ceil(damage*1.28);}
 if(k==='guardally'){
  target.guard=Math.max(target.guard||0,2+Math.ceil(e.atk*.28));target.guardTurns=3;
  return Math.ceil(damage*.65);
 }
 if(k==='flurry')return Math.ceil(damage*1.50);
 if(k==='evade'){e.evadeCharges=1;return Math.ceil(damage*.85);}
 if(k==='poison'){if(hitHero)hunterPoison(2+(level>=4?1:0));return damage;}
 if(k==='corrode'){
  if(hitHero)r.armorBreakPower=Math.max(r.armorBreakPower||0,1+Math.floor((level+2)/3));
  if(hitHero)r.armorBreakTurns=Math.max(r.armorBreakTurns||0,3);return damage;
 }
 if(k==='toxicmana'){if(hitHero)hunterPoison(2);
  if(hitHero)r.mp=Math.max(0,r.mp-Math.max(2,Math.ceil(e.atk*.55)));return Math.ceil(damage*.8);}
 if(k==='manaburn'){if(hitHero)r.mp=Math.max(0,r.mp-Math.max(2,Math.ceil(e.atk*.75)));return Math.ceil(damage*.7);}
 if(k==='silence'){if(hitHero)r.silenceTurns=Math.max(r.silenceTurns||0,level>=6?2:1);return Math.ceil(damage*.75);}
 if(k==='burn'){if(hitHero)r.burnTurns=Math.max(r.burnTurns||0,level>=4?3:2);return damage;}
 if(k==='healally'){target.hp=Math.min(target.maxHp,target.hp+Math.max(3,Math.ceil(target.maxHp*.15)));
  log('Восстановлено здоровье: '+target.name+'.');return Math.ceil(damage*.45);}
 if(k==='regenerate'){e.hp=Math.min(e.maxHp,e.hp+Math.ceil(e.maxHp*.12));return Math.ceil(damage*.6);}
 if(k==='pierce')return Math.max(Math.ceil(e.atk*1.12),Math.ceil(damage*1.3));
 if(k==='venomshot'){if(hitHero)hunterPoison(2);return Math.ceil(damage*1.05);}
 if(k==='silenceshot'){if(hitHero)r.silenceTurns=Math.max(r.silenceTurns||0,1);return damage;}
 if(k==='call'){if(!room)callMonsterMinion(e);return Math.ceil(damage*.65);}
 return damage;
}

function consumeTurn(){
 if(!r)return false;
 r.turn++;
 TR.onTurn(r,titleHelpers());
 if(r.blessed>0)r.blessed--;
 if(r.titleBlessTurns>0){r.titleBlessTurns--;if(!r.titleBlessTurns)r.titleBlessAtk=0;}
 if(r.setShieldTurns>0){r.setShieldTurns--;if(!r.setShieldTurns)r.setShieldRemaining=0;}
 if(r.sunBurnTurns>0)r.sunBurnTurns--;
 if(r.rageTurns>0)r.rageTurns--;
 if(r.reflectionTurns>0)r.reflectionTurns--;
 if(r.barrierTurns>0)r.barrierTurns--;
 if(r.armorBreakTurns>0){r.armorBreakTurns--;if(!r.armorBreakTurns)r.armorBreakPower=0;}
 if(r.regenTurns>0){r.regenTurns--;r.hp=Math.min(stats().hp,r.hp+Math.max(1,Math.ceil(stats().hp*.05)));}
 if(FD)FD.capture();
 if(r.burnWardTurns>0)r.burnWardTurns--;
 var frozen=!!(r.timeStopTurns>0);
 if(r.timeStopTurns>0)r.timeStopTurns--;
 var alive=r.chamberActive!=null?[]:enemies();
 if(r.summon&&r.summon.hp>0&&alive.some(reachableEnemy)){
  var victim=alive.find(reachableEnemy),hit=Math.max(1,r.summon.atk-victim.foe.def-Math.max(0,victim.foe.guard||0));
   provoke(victim.foe,'summon');
  r.summon.specialCooldown=Math.max(0,(r.summon.specialCooldown||4)-1);
  if(r.summon.specialCooldown===0){hit+=Math.max(3,Math.floor(r.summon.atk*.45));r.summon.specialCooldown=4;log('Скелет применяет «Гробовой раскол».');}
  if(FD)FD.actor(r.summon,r.summon.specialCooldown===4?'skill':'attack',r.summon.specialCooldown===4?'Гробовой раскол':'Костяной удар');
  victim.foe.hp-=hit;log('Скелет наносит '+hit+' урона: '+victim.foe.name+'.');
  if(victim.foe.hp<=0)kill(victim);
 }
 if(r.summon&&r.summon.hp>0&&activeRoom()){
  var roomTarget=livingRoomGuards()[0];
  if(roomTarget){
    provoke(roomTarget,'summon');
    var strikePower=Math.max(1,r.summon.atk-(roomTarget.def||0));
   r.summon.specialCooldown=Math.max(0,(r.summon.specialCooldown||4)-1);var summonSpecial=r.summon.specialCooldown===0;
   if(summonSpecial){strikePower+=Math.max(3,Math.floor(r.summon.atk*.45));r.summon.specialCooldown=4;}
   if(FD)FD.actor(r.summon,summonSpecial?'skill':'attack',summonSpecial?'Гробовой раскол':'Костяной удар');
   roomTarget.hp=Math.max(0,roomTarget.hp-strikePower);
   var roomState=activeRoom().room;
   roomState.guardHp=roomState.guards.reduce(function(n,g){return n+Math.max(0,g.hp);},0);
   log('Спутник наносит '+strikePower+' урона стражу побочной комнаты.');
  }
 }
 if(r.ghost&&r.ghost.hp>0){
  r.ghost.cooldown=Math.max(0,(r.ghost.cooldown||3)-1);
  if(r.ghost.cooldown===0){r.ghost.cooldown=3;var targetGhost=enemies().find(reachableEnemy);
   if(activeRoom()){
     var roomGuard=livingRoomGuards()[0];if(roomGuard){provoke(roomGuard,'ghost');if(FD)FD.actor(r.ghost,'attack','Призрачный удар');roomGuard.hp=Math.max(0,roomGuard.hp-r.ghost.atk);
     var room=activeRoom().room;room.guardHp=room.guards.reduce(function(n,g){return n+g.hp;},0);
     log('Призрачный страж бьёт стража комнаты: '+r.ghost.atk+'.');}
   }else if(targetGhost){provoke(targetGhost.foe,'ghost');if(FD)FD.actor(r.ghost,'attack','Призрачный удар');targetGhost.foe.hp-=r.ghost.atk;log('Призрачный страж наносит '+r.ghost.atk+' урона.');
    if(targetGhost.foe.hp<=0)kill(targetGhost);}}
 }
 if(r.trappedTile!=null)r.bleedTurns=Math.max(1,r.bleedTurns||0);
 if(r.bleedTurns>0){r.bleedTurns--;var bleed=Math.max(2,Math.ceil(stats().hp*.025));
  r.hp=Math.max(0,r.hp-bleed);log('Кровотечение: −'+bleed+' чистого урона.');}
 if(r.burnTurns>0&&r.burnWardTurns>0){r.burnTurns--;log('Печать пепельного легиона поглощает горение.');}
 else if(r.burnTurns>0){r.burnTurns--;var flames=Math.max(2,Math.ceil(r.floor*.45));
  var absorbed=Math.min(r.shield,flames);r.shield-=absorbed;r.hp=Math.max(0,r.hp-flames+absorbed);
  log('Горение: −'+Math.max(0,flames-absorbed)+' магического урона.');}
 if(r.silenceTurns>0)r.silenceTurns--;
 if(r.poisonTurns>0){r.poisonTurns--;var poison=Math.max(2,Math.floor(2+r.floor*.5));
  r.hp=Math.max(0,r.hp-poison);log('Яд: −'+poison+' HP.');}
 alive=r.chamberActive!=null?[]:enemies();
 alive.sort(function(a,b){return Number(!!b.foe.boss)-Number(!!a.foe.boss);}).forEach(function(t){
  var e=t.foe,special=e.skill||EX.monster(e.visual||e.id);
   var provoked=!!e.provoked,retaliationTarget=e.provokedBy||'hero';e.provoked=false;e.provokedBy=null;
   var interval=Math.max(1,(special&&special.every)||3);
   e.cooldown=Math.max(0,(e.cooldown==null?interval:e.cooldown)-1);
   var alreadyCountered=e.counteredAt===r.turn;
   if(e.elite&&!e.enraged&&e.hp<=e.maxHp*.50){
   e.enraged=true;e.atk=Math.ceil(e.atk*1.20);
   e.cooldown=Math.min(e.cooldown||3,2);e.guard=Math.max(e.guard||0,1+Math.floor((r.actIndex||0)/3));
   log('Элитный противник '+e.name+' впадает в ярость при 50% HP!');
  }
  if(e.stunImmunityTurns>0)e.stunImmunityTurns--;
  if(e.stun>0){
   if(e.boss){
    e.stun=0;
    if(e.stunImmunityTurns>0){log(e.name+' сопротивляется повторному оглушению.');}
    else{e.stunImmunityTurns=3;log(e.name+' оглушён.');return;}
   }else{e.stun--;log(e.name+' оглушён.');return;}
  }
  if(e.guardTurns>0){e.guardTurns--;if(!e.guardTurns)e.guard=0;}
  if(r.sunBurnTurns>0&&e.hp>0){e.hp-=Math.max(3,Math.ceil(e.maxHp*.06));if(e.hp<=0){kill(t);return;}}
  if(e.burn>0){e.burn--;e.hp-=Math.max(2,Math.floor(stats().pow*.48)+bonus('burnDamage')+setBonus('spellDamage')*.1);if(e.hp<=0){kill(t);return;}}
  if(e.poison>0){e.poison--;e.hp-=Math.max(2,Math.floor(stats().atk*.24));if(e.hp<=0){kill(t);return;}}
   if(e.bleed>0){e.bleed--;e.hp-=Math.max(3,Math.ceil(stats().atk*.32));if(e.hp<=0){kill(t);return;}}
  if(frozen){log('Время замерло: '+e.name+' пропускает действие.');return;}
   // All revealed enemies act autonomously when their ability timer hits zero.
   var ready=e.cooldown===0,attacks=provoked||ready;
   var attackTarget=provoked?retaliationTarget:'hero';
   if(e.ranged){
    var shotClock=e.attackCooldown==null?2:e.attackCooldown;
    shotClock=Math.max(0,shotClock-1);
    if(shotClock===0){attacks=true;e.attackCooldown=2;}
    else e.attackCooldown=shotClock;
   }
   if(!attacks||alreadyCountered)return;
   if(ready)e.cooldown=interval;
   var amount=Math.max(1,e.atk);
   if(e.boss){
    amount=bossAttack(t,e,amount,ready,attackTarget);if(amount==null)return;
   }else if(ready){amount=monsterSpecial(e,amount,false,attackTarget);}
   if(provoked&&retaliationTarget==='summon'){
    if(r.summon&&r.summon.hp>0){
     var summonHit=Math.max(1,Math.ceil(amount)-(r.summon.def||0));
     if(FD)FD.actor(e,ready?'skill':'attack',ready?(e.abilityName||special.name):'Удар');
     r.summon.hp=Math.max(0,r.summon.hp-summonHit);
     log(e.name+' отвечает призванному существу: −'+summonHit+' HP.');
     if(!r.summon.hp){log('Призванный скелет разрушен.');r.summon=null;r.summonTile=null;}
    }
    return;
   }
   if(provoked&&retaliationTarget==='ghost'){
    if(r.ghost&&r.ghost.hp>0){r.ghost.hp=Math.max(0,r.ghost.hp-Math.max(1,Math.ceil(amount)));if(!r.ghost.hp){r.ghost=null;log('Призрачный страж развеялся.');}}
    return;
   }
   if(provoked&&retaliationTarget==='panther'){
    if(r.titlePanther&&r.titlePanther.hp>0){
     var p=r.titlePanther,pantherDmg=Math.max(1,Math.ceil(amount)-(p.def||0));
     if(FD)FD.actor(e,ready?'skill':'attack','Удар по чёрной пантере');
     p.hp=Math.max(0,p.hp-pantherDmg);
     log(e.name+' отвечает чёрной пантере: −'+pantherDmg+' HP.');
     if(!p.hp){log('Чёрная пантера погибла.');r.titlePanther=null;}
    }
    return;
   }
   amount=incomingDamage(amount,e); // Player defense only applies to attacks targeting the hero.
   if(FD)FD.actor(e,ready?'skill':'attack',ready?(e.abilityName||special.name):'Удар');
  if(Math.random()*100<stats().dodge){log('Уклонение от '+e.name+'.');return;}
  if(r.ghost&&r.ghost.hp>0&&Math.random()<.35){
   if(Math.random()*100<r.ghost.dodge){log('Призрак увернулся от удара '+e.name+'.');return;}
   r.ghost.hp=Math.max(0,r.ghost.hp-amount);
   if(r.ghost.hp<=0){log('Призрачный страж развеялся.');r.ghost=null;}return;
  }
  if(r.guardCharges>0){r.guardCharges--;log('Алхимический щит полностью блокирует попадание; зарядов '+r.guardCharges+'.');return;}
  if(r.summon&&r.summon.hp>0&&Math.random()<.72){
   var summonDamage=Math.max(1,amount-(r.summon.def||0));
   r.summon.hp=Math.max(0,r.summon.hp-summonDamage);
   log('Скелет перехватывает '+summonDamage+' урона.');
   if(!r.summon.hp){log('Призванный скелет разрушен.');r.summon=null;r.summonTile=null;}
  }else{
   var taken=amount;
   if(r.setShieldRemaining>0){var shieldAbsorb=Math.min(taken,r.setShieldRemaining);r.setShieldRemaining-=shieldAbsorb;taken-=shieldAbsorb;}
   if(r.shield>0){var absorb=Math.min(r.shield,taken);r.shield-=absorb;taken-=absorb;}
   r.hp=Math.max(0,r.hp-taken);
   if(taken)log(e.name+' наносит '+taken+' урона.');
   if(taken&&r.reflectionTurns>0&&e.hp>0){var reflect=Math.max(1,Math.ceil(taken*.5));
    e.hp-=reflect;if(e.hp<=0)kill(t);}

  }
  var counter=bonus('thorns')+(Math.random()*100<bonus('reflect')?Math.max(1,Math.floor(stats().atk*.45)):0);
  if(counter>0&&e.hp>0){e.hp-=counter;log('Ответный урон: '+counter+'.');if(e.hp<=0)kill(t);}
 });
 if(r.chamberActive!=null)chamberEnemyPhase(frozen);
 if(r.scoutDodgeTurns>0)r.scoutDodgeTurns--;
 if(r.hp<=0){
  if(r.resurrection>0){r.resurrection--;r.hp=Math.max(1,Math.ceil(stats().hp*.45));r.poisonTurns=0;log('Печать возрождения спасает героя.');}
  else{die();return false;}
 }
 return true;
}
function kill(t){
 if(FD)FD.capture();
 var e=t.foe;if(!e||e.hp>0||e.deathProcessed)return;
 e.deathProcessed=true;e.hp=0;t.cleared=false;t.remainsId=remainsId(e);r.kills++;r.ep+=e.ep*12;
 if(e.forestAlpha&&Array.isArray(t.forestAlphaSquare)){
  t.forestAlphaSquare.forEach(function(index){var shadow=r.tiles[index];if(shadow&&shadow.forestAlphaAnchor===t.id){
   shadow.kind='empty';shadow.cleared=true;shadow.foe=null;shadow.forestAlphaAnchor=null;shadow.revealed=true;
  }});
 }
 var forestMessage=FE.onKill(r,e,forestApi(null));
 if(forestMessage)log(forestMessage);
 var t1Message=RE.onKill(r,e,t1Api());
 if(t1Message)log(t1Message);
 if(e.elite){r.eliteClears[r.floor]=true;log('Элитный противник повержен: '+e.name+'.');localAchievement('elite',1,'Опасная добыча');fairyRemark('elite');}
 if(hasUniqueGear('devour')){r.hp=Math.min(stats().hp,r.hp+Math.ceil(stats().hp*.09));r.shield+=5;}
 s.meta.bestiary[e.id]=(s.meta.bestiary[e.id]||0)+1;
 var hunterNotice=HB.gain(s.meta,r,e,t.id);if(hunterNotice)log('КНИГА: '+hunterNotice);
 r.hp=Math.min(stats().hp,r.hp+bonus('killHeal')+setBonus('killHeal'));
 var drop={key:!!t.hasKey,gold:e.gold,gear:null,scroll:null,potion:0,materials:[],soul:null};
 if((e.boss||e.id&&e.elite)&&lvl('magnate')>0)drop.soul={kind:'elite',name:'Душа '+e.name};
 else if(!e.boss&&lvl('merchant')>0&&Math.random()<Math.min(.72,.12*lvl('merchant')))drop.soul={kind:'common',name:'Душа '+e.name};
 for(var source of (e.loot||[])){
  if(Math.random()*100<source.chance)drop.materials.push({name:SP.canonicalMaterial(source.name),qty:rand(source.min,source.max)});
 }
 // Every elite drops materials, regardless of optional equipment/diamond rolls.
 if(e.elite&&!drop.materials.length){
  var baseDrop=(e.loot||[])[0];
  if(baseDrop)drop.materials.push({name:SP.canonicalMaterial(baseDrop.name),qty:Math.max(1,rand(baseDrop.min||1,baseDrop.max||1))});
 }
 if(e.boss){
  r.bossClears[r.floor]=true;r.portalReady=true;
  var q=currentRegion().questItem;
  if(q&&r.questItems.indexOf(q)<0){r.questItems.push(q);log('Получен квестовый предмет: '+q+'.');}
  drop.diamonds=Math.max(1,Math.ceil(depthMultiplier()*(1+(r.actIndex||0))));
  log('Босс повержен! Безопасный портал открыт на этом этаже.');fairyRemark('boss');
  if(Math.random()<.45)drop.gear={slot:pick(Object.keys(SLOT)),rarity:Math.max(2,rarityRoll())};
  if(r.floor>=40&&Math.random()<.025)drop.scroll=rollSpell(6).id;
  drop.potion=1;drop.relic=EX.relicForFloor(r.floor).id;
  if((r.locationUsedPotion||0)===0)localAchievement('boss-no-potions',2,'Без зелий');
  r.ep+=4;s.meta.bossKills=(s.meta.bossKills||0)+1;
 }
 else {
  if(e.elite&&Math.random()<.55)drop.diamonds=1;
  var gearChance=Math.min(e.elite ? .28 : .12,(e.elite ? .14 : .055)+
    (bonus('lootChance')+setBonus('lootChance')+5*(s.meta.diamondUpgrades?.luck||0))*.003);
   if(Math.random()<gearChance){drop.gear={slot:pick(Object.keys(SLOT)),rarity:rarityRoll()};}
   else if(Math.random()<(e.elite ? .30 : .20)){drop.scroll=rollSpell(e.elite?5:4).id;}
 }
 if(!r.titleProcGuard){r.titleProcGuard=true;try{TR.onKill(r,e,drop,titleHelpers());}finally{r.titleProcGuard=false;}}
 t.drops=drop;
 if(drop.key)log('Ключник повержен! На полу лежит ключ от лестницы.');
 log('Победа: '+e.name+' · +'+e.ep+(e.boss?' (+4)':'')+' ✧. Награды остались на клетке.');
 if(!r.floorCleared&&hiddenEnemies().length===0){
  r.floorCleared=true;r.clearAnimationStarted=Date.now();
  var opened=0,disarmedTraps=0;
  r.tiles.forEach(function(t){
   // Full clearance is a free safe sweep: reveal AND disarm every floor trap.
   // No trap damage, statuses, animation turns or manual interaction.
   if(t.kind==='trap'){
    if(!t.revealed){t.revealed=true;t.autoOpened=opened++;}
    if(!t.trapSpent)disarmedTraps++;
    t.trapSpent=true;t.trapActive=false;t.cleared=true;
    if(r.trappedTile===t.id)r.trappedTile=null;
    return;
   }
   if(!t.revealed&&t.kind!=='secret'&&t.kind!=='chamber'){
    t.revealed=true;t.autoOpened=opened++;if(t.kind==='empty')t.cleared=true;
   }
  });
  if(disarmedTraps)log('Зачистка автоматически обезвредила '+disarmedTraps+' капкан(ов) без урона и дополнительных ходов.');
  var bonusGold=Math.max(1,Math.round(6*depthMultiplier()));addGold(bonusGold);
  log('Полная зачистка: '+opened+' обычных клеток раскрыто, +'+bonusGold+' монет.');
 }
}
/* An engaged monster gets the initiative before a direct hit. One response
   per round: the regular phase still advances timers and statuses, but never
   strikes the same target a second time. */
function counterBeforeHero(enemy,mainTile,room){
 if(!enemy||enemy.hp<=0||!r)return false;
 enemy.counteredAt=r.turn+1;enemy.provoked=false;
 if(enemy.stun>0||r.timeStopTurns>0)return true;
 var interval=Math.max(1,(enemy.skill&&enemy.skill.every)||3);
 var ready=(enemy.cooldown==null?interval:enemy.cooldown)<=1,raw=Math.max(1,enemy.atk);
 if(ready)enemy.cooldown=interval+1;
 if(enemy.boss&&mainTile){raw=bossAttack(mainTile,enemy,raw,ready);if(raw==null)return true;}
 else if(ready)raw=monsterSpecial(enemy,raw,room||false);
 var damage=incomingDamage(raw,enemy);
 if(FD)FD.actor(enemy,ready?'skill':'attack',ready?(enemy.abilityName||'Особый приём'):'Ответный удар');
 if(Math.random()*100<stats().dodge){log('Уклонение от '+enemy.name+'.');return true;}
 if(r.ghost&&r.ghost.hp>0&&Math.random()<.35){
  if(Math.random()*100>=r.ghost.dodge){r.ghost.hp=Math.max(0,r.ghost.hp-damage);if(!r.ghost.hp)r.ghost=null;}
  return true;
 }
 if(r.guardCharges>0){r.guardCharges--;log('Защитный заряд блокирует атаку '+enemy.name+'.');return true;}
 if(r.summon&&r.summon.hp>0&&Math.random()<(room?.45:.72)){
  var reflected=Math.max(1,damage-(room?0:(r.summon.def||0)));
  r.summon.hp=Math.max(0,r.summon.hp-reflected);
  if(!r.summon.hp){r.summon=null;r.summonTile=null;}
  log('Спутник перехватывает удар '+enemy.name+'.');return true;
 }
 if(r.setShieldRemaining>0){var setAbs=Math.min(damage,r.setShieldRemaining);r.setShieldRemaining-=setAbs;damage-=setAbs;}
 if(r.shield>0){var absorb=Math.min(damage,r.shield);r.shield-=absorb;damage-=absorb;}
 r.hp=Math.max(0,r.hp-damage);
 if(damage)log(enemy.name+' отвечает первым: −'+damage+' HP.');
 if(damage&&r.reflectionTurns>0&&enemy.hp>0){
  enemy.hp-=Math.max(1,Math.ceil(damage*.5));
  if(enemy.hp<=0&&mainTile)kill(mainTile);
 }
 if(r.hp<=0){
  if(r.resurrection>0){r.resurrection--;r.hp=Math.max(1,Math.ceil(stats().hp*.45));r.poisonTurns=0;log('Печать возрождения спасает героя.');}
  else{die();return false;}
 }
 return true;
}
/* Echo is a second physical strike against the same living enemy. The normal
   enemy counterattack and hero's turn are processed only once by the caller. */
function echoFollowUp(enemy,st){
 if(!r||!enemy||enemy.hp<=0)return 0;
 if(enemy.evadeCharges>0){
  enemy.evadeCharges--;
  if(Math.random()<.45){log('Эхо: '+enemy.name+' уклоняется от второго удара.');return 0;}
 }
 var critical=Math.random()*100<st.crit;
 var damage=Math.max(1,st.atk+(r.rageTurns>0?Math.ceil(st.atk*.4):0)+rand(0,3)-(enemy.def||0)-(enemy.guard||0));
 enemy.guard=0;
 if(enemy.boss)damage=Math.floor(damage*(1+(bonus('bossDamage')+setBonus('bossDamage'))*.01));
 if(critical)damage=Math.floor(damage*(1.6+(bonus('critDamage')+setBonus('critDamage'))*.01));
 damage=TR.attack(r,enemy,damage,titleHelpers());
 if(enemy.hp>0)enemy.hp=Math.max(0,enemy.hp-damage);
 log('Эхо — второй удар по '+enemy.name+': '+damage+(critical?' КРИТ!':'')+'. Без контратаки.');
 return damage;
}
function strike(tid){
 var t=tile(tid),st=stats();if(!t||!t.revealed||!t.foe||t.foe.hp<=0)return;
 if(r.class!=='scout'&&!reachableEnemy(t)){toast('Нет прохода к врагу. Сначала исследуйте путь к нему.');return;}
 setHeroPose('attack');
 if(TR.beforeAttack(r)||TR.counterImmune(r)){t.foe.counteredAt=r.turn+1;t.foe.provoked=false;}else if(!counterBeforeHero(t.foe,t,null)||!r)return;
 if(t.foe.hp<=0){finishAction();return;}
  provoke(t.foe);
  if(t.foe.evadeCharges>0){
  t.foe.evadeCharges--;if(Math.random()<.45){
   log(t.foe.name+' уходит от удара ложным манёвром.');finishAction();return;
  }
 }
 var echo=TR.consumeEcho(r);
 var critical=Math.random()*100<st.crit;
 var amount=Math.max(1,st.atk+(r.rageTurns>0?Math.ceil(st.atk*.4):0)+rand(0,3)-t.foe.def-(t.foe.guard||0));
 t.foe.guard=0;
 if(t.foe.boss)amount=Math.floor(amount*(1+(bonus('bossDamage')+setBonus('bossDamage'))*.01));
 if(critical)amount=Math.floor(amount*(1.6+(bonus('critDamage')+setBonus('critDamage'))*.01));
 amount=TR.attack(r,t.foe,amount,titleHelpers());
 t.foe.hp-=amount;
 if(t.foe.hp>0&&Math.random()*100<hunterStat('poisonChance')){t.foe.poison=Math.max(t.foe.poison||0,2);log('Книга: отравление цели.');}
 var glove=equippedItem('gloves');
 if(((glove&&glove.stormCharge)||hasUniqueGear('storm'))&&t.foe.hp>0&&Math.random()<.25){
  var spark=Math.max(4,Math.ceil(st.pow*.7)+2);
  t.foe.hp-=spark;log('Грозовая перчатка выпускает разряд: '+spark+' магического урона.');
 }
 if(setBonus('burnChance')>0&&Math.random()*100<setBonus('burnChance'))t.foe.burn=Math.max(t.foe.burn||0,2);
 log('Удар по '+t.foe.name+': '+amount+(critical?' КРИТ!':'')+'.');
 if(t.foe.hp<=0)kill(t);
 else if(echo){echoFollowUp(t.foe,st);if(t.foe.hp<=0)kill(t);}
 finishAction();
}
function finishAction(){if(!r)return;if(FD)FD.commit();consumeTurn();if(FD)FD.capture();if(r){draw();save();}}
function setHeroPose(pose){if(!r)return;r.fx=pose;r.fxUntil=Date.now()+1000;r.poseToken=(r.poseToken||0)+1;}
var SKILLS={
 necromancer:{name:'Призвать скелета',icon:'☠',cost:8,turns:5},
 executioner:{name:'Казнящий удар',icon:'⚔',cost:4,turns:4},
 scout:{name:'Двойной выстрел',icon:'➶',cost:6,turns:5},
 sorceress:{name:'Грозовое эхо',icon:'ϟ',cost:9,turns:5},
 guardian:{name:'Нерушимый удар',icon:'♜',cost:6,turns:4},
 assassin:{name:'Ядовитый клинок',icon:'☽',cost:5,turns:4}
};
function useSkill(chosenTarget){
 if(r.silenceTurns>0){toast('Босс наложил молчание.');return;}
 var skill=SKILLS[r.class];
 if(r.turn-r.skillUsed<skill.turns){toast('Умение восстанавливается.');return;}
 if(r.mp<skill.cost){toast('Нужно '+skill.cost+' маны.');return;}
 var cave=activeRoom();
 var caveGuards=cave?livingRoomGuards():null;
 var rangedSkill=r.class==='scout'||r.class==='sorceress';
 var available=cave?caveGuards:rangedSkill?enemies():enemies().filter(reachableEnemy);
 var single=['executioner','guardian','assassin','scout'].includes(r.class);
 if(single&&available.length>1&&chosenTarget==null){
  r.pendingSkill=r.class;close();draw();save();toast('Выберите врага для «'+skill.name+'».');return;
 }
 var selected=null;
 if(chosenTarget!=null){
  if(cave){var fragments=String(chosenTarget).split(':');
   if(Number(fragments[0])===cave.id)selected=caveGuards.find(function(g){return g.slot===Number(fragments[1]);});}
  else{var chosen=tile(chosenTarget);if(chosen&&(rangedSkill?!!chosen.revealed&&!!chosen.foe&&chosen.foe.hp>0:reachableEnemy(chosen)))selected=chosen;}
  if(!selected){toast('Эта цель недоступна.');return;}
 }
 r.pendingSkill=null;
 var t=cave?(selected?{foe:selected,roomGuard:true}:caveGuards.length?{foe:caveGuards[0],roomGuard:true}:null):selected||(rangedSkill?rangedTarget():target()),st=stats(),damage=0;
 if(r.class==='scout'&&!t){toast('Нужен обнаруженный враг.');return;}
 if(t&&['executioner','guardian','assassin','scout'].includes(r.class)){
  if(r.class==='scout')r.scoutDodgeTurns=1;
  if(!counterBeforeHero(t.foe,t.roomGuard?null:t,cave&&cave.room)||!r)return;
  if(t.foe.hp<=0){finishAction();return;}
 }
 function skillKill(target){if(target.roomGuard){target.foe.hp=Math.max(0,target.foe.hp);cave.room.guardHp=cave.room.guards.reduce(function(n,g){return n+Math.max(0,g.hp);},0);}else kill(target);}
 if(r.class==='necromancer'){
  var creature={name:'Костяной страж',def:2,specialCooldown:4,
   maxHp:32+Math.floor(st.pow*.9)+14*lvl('ritual')+bonus('summonHp')+EX.mastery(s.meta,r.class)*9,
   hp:32+Math.floor(st.pow*.9)+14*lvl('ritual')+bonus('summonHp')+EX.mastery(s.meta,r.class)*9,
   atk:Math.round((5+Math.floor(st.pow*.35)+4*lvl('ritual')+bonus('summonAtk')+EX.mastery(s.meta,r.class)*3)*(1+hunterStat('hunterAttackPct')*.01))};
  var previous=r.summon,oldTile=r.summonTile;
  r.summon=creature;r.summonTile=null;
  if(!placeSummon()){r.summon=previous;r.summonTile=oldTile;toast('Свободных клеток для призыва нет.');return;}
  log('Призван костяной страж на клетку '+r.summonTile+'.');
 }else if(r.class==='executioner'){
  if(!t){toast('Нужен открытый враг.');return;}
  damage=Math.max(3,Math.floor(st.atk*2.1)-t.foe.def);
   provoke(t.foe);t.foe.hp-=damage;r.shield+=Math.floor(st.def*1.8)+7;
  log('Казнь: '+damage+' урона и защитная стойка.');
  if(t.foe.hp<=0)skillKill(t);
 }else if(r.class==='guardian'){
  r.shield+=12+Math.floor(st.def*2.2);
  if(t){damage=Math.max(3,Math.floor(st.atk*1.65)-t.foe.def);provoke(t.foe);t.foe.hp-=damage;
   if(t.foe.hp<=0)skillKill(t);}
  log('Воительница получает крепкую защиту'+(damage?' и наносит '+damage+' урона.':'.'));
 }else if(r.class==='sorceress'){
  var targets=cave?caveGuards.slice(0,4).map(function(g){return {foe:g,roomGuard:true};}):enemies().slice(0,4);if(!targets.length){toast('Нужен открытый враг.');return;}
  targets.forEach(function(enemy){var val=Math.max(3,Math.floor(st.pow*1.6)-enemy.foe.def);
    enemy.foe.hp-=val;if(enemy.foe.hp<=0)skillKill(enemy);});
  log('Грозовое эхо поражает '+targets.length+' врагов.');
 }else if(r.class==='assassin'){
  if(!t){toast('Нужен открытый враг.');return;}
  damage=Math.max(3,Math.floor(st.atk*1.35)-t.foe.def);
   provoke(t.foe);t.foe.hp-=damage;t.foe.poison=3;
  log('Ядовитый клинок: '+damage+' урона, яд на три хода.');
  if(t.foe.hp<=0)skillKill(t);
 }else if(r.class==='scout'){
  if(!t){toast('Нужен обнаруженный противник для двойного выстрела.');return;}
  var arrows=0;
  for(var shot=0;shot<2&&t.foe.hp>0;shot++){
   var arrowDamage=Math.max(1,Math.floor(st.atk*.95)+rand(0,3)-(t.foe.def||0)-(t.foe.guard||0));
   provoke(t.foe,'hero');
   t.foe.hp-=arrowDamage;damage+=arrowDamage;arrows++;
   if(t.foe.hp<=0)skillKill(t);
  }
  log('Двойной выстрел: '+arrows+' стрелы, '+damage+' урона. Уклонение +50 на ход.');
 }
 r.mp-=skill.cost;r.skillUsed=r.turn;setHeroPose('skill');
 finishAction();
}
function potion(){
 if(r.potions<1){toast('Эликсиры закончились.');return;}
 if(r.hp>=stats().hp){toast('Здоровье уже полное.');return;}
 r.potions--;r.locationUsedPotion=(r.locationUsedPotion||0)+1;var amount=Math.floor(stats().hp*.45);r.hp=Math.min(stats().hp,r.hp+amount);
 log('Выпит целебный эликсир: +'+amount+' HP.');finishAction();
}
function wait(){log('Вы затаились, собираясь с силами.');r.mp=Math.min(stats().mp,r.mp+1);finishAction();}

/* Six-school combat and exploration magic. The sixth tier alters the entire
   floor; boss HP is protected from instant kills and one-shot quest loss. */

/* Deterministic live spell preview. No state mutations or random proc rolls. */
function spellPreview(sp){
 var k=sp.kind,harm=['attack','burn','stun','drain','holy','weakness','chain','aoe','burnall','freezeall','drainall','earthquake','sunfall','soulcovenant','firstlight'];
 var heals=['heal','healshield','lastlight'],shield=['shield'];
 if(!harm.includes(k)&&!heals.includes(k)&&!shield.includes(k))return null;
 var st=stats(),raw=Math.floor((sp.base+st.pow*1.45)*(1+(bonus('spellDamage')+setBonus('spellDamage'))*.01));
 var strength=Math.max(1,Math.ceil(raw*TR.previewMultiplier(r,sp)));
 if(heals.includes(k))strength=Math.ceil(strength*(1+bonus('healPower')*.01));
 if(shield.includes(k))strength=Math.ceil(strength*(1+(bonus('iceArmor')+bonus('utilityPower'))*.01));
 return {label:harm.includes(k)?'Урон':heals.includes(k)?'Лечение':'Щит',value:strength,
  note:harm.includes(k)?'До брони врага; случайные критические эффекты не включены.':'С учётом магии, экипировки и текущих усилений.'};
}
function spellPower(sp,st){
 r.titleAuroraTriggered=false;r.titlePopeTriggered=false;
 var amount=Math.floor((sp.base+st.pow*1.45)*(1+(bonus('spellDamage')+setBonus('spellDamage'))*.01));
 if(sp.school==='dark'&&Math.random()*100<bonus('darkCrit'))amount*=2;
 if(sp.school==='fire'&&Math.random()*100<bonus('fireProc'))amount=Math.ceil(amount*1.65);
 if(sp.school==='light'&&Math.random()*100<bonus('lightEcho'))amount=Math.ceil(amount*1.55);
 return Math.max(1,Math.ceil(amount*TR.spellMultiplier(r,sp)));
}

function advancedCast(sp,chosenTarget){
 var key=sp.kind;
 if(!['blessing','earthgate','aoe','burnall','freezeall','drainall','earthquake','healshield','holy','weakness','lastlight','timestop','sunfall','oceanrewind','worldrewrite','timeloop','firstlight','soulcovenant'].includes(key))return false;
 var st=stats(),magic=spellPower(sp,st);
 var foes=enemies();
 var heal=function(v){r.hp=Math.min(st.hp,r.hp+Math.ceil(v*(1+bonus('healPower')*.01)));};
 var hit=function(t,dmg,capBoss){
   if(!t||!t.foe||t.foe.hp<=0)return;
   /* Spell effects do not provoke retaliation. */
   var n=Math.max(1,dmg-(t.foe.def||0));
  t.foe.hp=Math.max(capBoss&&t.foe.boss?1:0,t.foe.hp-n);
  if(t.foe.hp<=0)kill(t);
 };
 function revealConnected(n){
  var count=0;for(var i=0;i<n;i++){var cells=r.tiles.filter(function(t){return CR.exploreStatus(t,r.tiles,r.heroTile).ok;});
   if(!cells.length)break;var t=pick(cells);t.revealed=true;if(t.kind==='trap')triggerTrap(t);if(t.kind==='empty')t.cleared=true;count++;}
  return count;
 }
 if(key==='blessing'){
  var base=Math.max(1,Math.floor(st.atk*(sp.id==='electrostatic'?.3:.2)*TR.spellMultiplier(r,sp)));
  r.titleBlessAtk=Math.max(r.titleBlessAtk||0,base);
  r.titleBlessTurns=Math.max(r.titleBlessTurns||0,5+TR.rank5(r,'mag_legendary','mp'));
  if(sp.id==='electrostatic')r.shield+=Math.ceil(st.pow*.8);
  log(sp.name+': атака +'+base+' на '+r.titleBlessTurns+' ходов.');
 }else if(key==='earthgate'){
  var enhanced=lvl('mag_planar')>0;
  var mastery=TR.rank5(r,'mag_planar','pow')+TR.rank5(r,'mag_planar','hp')+TR.rank5(r,'mag_planar','mp');
   var distance=Math.min(50,Math.max(10,10+Math.floor(st.pow/8)+(enhanced?8+2*mastery:0)));
  var old=r.floor;r.floor=Math.max(1,r.floor-distance);
  r.key=false;r.portalReady=false;r.shield=0;r.turn++;
  startFloor();log('Врата Земли возвращают на '+(old-r.floor)+' этажей назад. Побеждённые боссы не возрождаются.');
  save();draw();return true;
 }
 if(key==='aoe'||key==='burnall'||key==='freezeall'||key==='drainall'||key==='earthquake'){
  foes.slice().forEach(function(t){
   hit(t,magic+(key==='earthquake'?12:0),false);
   if(t.foe.hp>0&&key==='burnall')t.foe.burn=Math.max(t.foe.burn||0,4);
   if(t.foe.hp>0&&key==='freezeall')t.foe.stun=Math.max(t.foe.stun||0,t.foe.boss?1:2);
  });
  if(key==='drainall')heal(Math.ceil(magic*Math.min(foes.length,5)*.3));
  if(key==='earthquake')log('Землетрясение открыло '+revealConnected(3)+' соседних клеток.');
 }else if(key==='healshield'){heal(magic);r.shield+=Math.ceil(magic*.7*(1+(bonus('iceArmor')+bonus('utilityPower'))*.01));r.poisonTurns=0;
 }else if(key==='holy'||key==='weakness'){
  var t=chosenTarget!=null?tile(chosenTarget):rangedTarget();if(t){hit(t,magic*(key==='holy'&&/нежит|скел|мертв|лич|зомб/i.test(t.foe.name)?1.8:1),false);
   if(key==='weakness'&&t.foe.hp>0)t.foe.guard=-Math.min(12,Math.floor(st.pow*.5));}
 }else if(key==='lastlight'){heal(magic);r.shield+=Math.floor(magic*.65);r.resurrection=(r.resurrection||0)+1;
 }else if(key==='timestop'){r.timeStopTurns=Math.max(r.timeStopTurns||0,5+bonus('timeBonus')+TR.rank5(r,'mag_legendary','mp'));
 }else if(key==='sunfall'){
  foes.slice().forEach(function(t){
   if(t.foe.boss){/* Spell effects do not provoke retaliation. */t.foe.hp=Math.max(1,t.foe.hp-Math.ceil(t.foe.maxHp*.60));t.foe.burn=8;}
   else{t.foe.hp=0;kill(t);}
  });
  r.sunBurnTurns=10;
  log('Второе солнце обрушилось на этаж. Босс обожжён, остальные враги обращены в пепел.');
 }else if(key==='oceanrewind'){
  heal(st.hp);r.shield+=Math.round(st.hp*.85);r.poisonTurns=0;
  if(r.ghost&&r.ghost.hp>0)r.ghost.hp=r.ghost.maxHp;
  if(r.summon&&r.summon.maxHp)r.summon.hp=r.summon.maxHp;
  var returned=0;for(var consumed of (r.spellHistory||[]).slice().reverse()){
   var spell=SYS.bySpell[consumed];if(!spell||spell.rank===6||spell.id==='earthgate')continue;
   if(returned>=10)break;r.scrolls[consumed]=(r.scrolls[consumed]||0)+1;returned++;
  }
  log('Первозданная вода вернула '+returned+' ранее использованных свитков.');
 }else if(key==='worldrewrite'){
  foes.slice().forEach(function(t){
   if(t.foe.boss){/* Spell effects do not provoke retaliation. */t.foe.hp=Math.max(1,t.foe.hp-Math.ceil(t.foe.maxHp*.65));}
   else{t.foe.hp=0;kill(t);}
  });
  r.tiles.forEach(function(t){
   if(t.kind!=='start'&&!t.revealed){t.revealed=true;if(t.kind==='trap')triggerTrap(t);if(t.kind==='empty')t.cleared=true;}
  });
  r.materials['Кристалл переписанной материи']=(r.materials['Кристалл переписанной материи']||0)+5;
  log('Материя перестроена. Обязательные ключи и выходы остались на месте.');
 }else if(key==='timeloop'){
  r.timeStopTurns=Math.max(r.timeStopTurns||0,13+bonus('timeBonus'));
  foes.slice().forEach(function(t){if(!t.foe.boss)t.foe.stun=Math.max(t.foe.stun||0,3);});
  log('Причинность разорвана. Враги лишены права действовать на следующие ходы.');
 }else if(key==='firstlight'){
  heal(st.hp);r.shield+=st.hp*2;r.poisonTurns=0;r.guardCharges=(r.guardCharges||0)+5;r.resurrection=(r.resurrection||0)+2;
  log('Первый рассвет полностью очищает героя, даёт пять отражений удара и два спасения от смерти.');
 }else if(key==='soulcovenant'){
  foes.slice().forEach(function(t){
   if(t.foe.boss){/* Spell effects do not provoke retaliation. */t.foe.hp=Math.max(1,t.foe.hp-Math.ceil(t.foe.maxHp*.55));t.foe.stun=Math.max(t.foe.stun||0,1);}
   else{var n=t.foe.name;t.foe.hp=0;kill(t);addSpiritSoul({kind:'common',name:'Отголосок '+n});}
  });
  r.shield+=Math.floor(st.hp*.8);log('Заключён пакт Бездны: души противников переходят к герою.');
 }else return false;
 if(r.sunBurnTurns>0&&key!=='sunfall')r.sunBurnTurns=Math.max(0,r.sunBurnTurns);
 log('Школа '+sp.school+': '+sp.name+'.');
 finishAction();return true;
}

function spellNeedsTarget(sp){return !!sp&&['attack','burn','stun','drain','holy','weakness','chain'].indexOf(sp.kind)>=0;}
function cast(id,chosenTarget){
 var sp=SPELLS.find(function(x){return x.id===id;});if(!sp)return;
 var error=spellValid(sp);if(error){toast(error);return;}
 if(spellNeedsTarget(sp)){
  if(chosenTarget==null){
   r.pendingSpell=id;close();draw();save();toast('Выберите цель для «'+sp.name+'» на поле.');return;
  }
  var room=activeRoom(),parts=String(chosenTarget).split(':'),valid=room?
   Number(parts[0])===room.id&&livingRoomGuards().some(function(g){return g.slot===Number(parts[1]);}):
   parts.length===1&&!!tile(parts[0])&&tile(parts[0]).revealed&&!!tile(parts[0]).foe&&tile(parts[0]).foe.hp>0;
  if(!valid){toast('Выберите живого обнаруженного противника.');return;}
 }
 r.pendingSpell=null;
 setHeroPose('skill');
 r.scrolls[id]--;r.mp-=manaCost(sp);
  TR.spellCast(r,sp,titleHelpers());
 if(sp.rank!==6&&sp.id!=='earthgate'){
  if(!Array.isArray(r.spellHistory))r.spellHistory=[];
  r.spellHistory.push(id);r.spellHistory=r.spellHistory.slice(-40);
 }
 if(activeRoom()){castInSideRoom(sp,chosenTarget);return;}
 if(advancedCast(sp,chosenTarget))return;
 var tar=chosenTarget!=null?tile(chosenTarget):rangedTarget(),st=stats();
 var magic=spellPower(sp,st);
 if(sp.kind==='heal'){magic=Math.ceil(magic*(1+bonus('healPower')*.01));r.hp=Math.min(st.hp,r.hp+magic);log(sp.name+': восстановлено '+magic+' HP.');}
 else if(sp.kind==='shield'){magic=Math.ceil(magic*(1+(bonus('iceArmor')+bonus('utilityPower'))*.01));r.shield+=magic;log((r.titleAuroraTriggered?'Барьер Авроры: ':'Магическая защита: ')+magic+' щита.');}
 else if(sp.kind==='reveal'){
  var count=0;
  for(var j=0;j<sp.base;j++){
   var covered=r.tiles.filter(function(t){return CR.exploreStatus(t,r.tiles,r.heroTile).ok;});
   if(!covered.length)break;
   var t=pick(covered);t.revealed=true;if(t.kind==='trap')triggerTrap(t);if(t.kind==='empty')t.cleared=true;count++;
  }
  log('Око забвения открыло '+count+' скрытых клеток.');
 }else if(sp.kind==='chain'){
  var first=chosenTarget!=null?tile(chosenTarget):rangedTarget();
   var victims=[first].concat(enemies().filter(function(t){return t!==first;})).filter(function(t){return t&&t.foe&&t.foe.hp>0;}).slice(0,3+bonus('chainTargets'));
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
 pop.innerHTML=labels.map(function(value){var v=String(value),gold=v.slice(0,1)==='◈';return '<span class="float-pickup-entry">'+(gold?goldArt('gold-coin-float'):'')+esc(gold?v.slice(1).trim():v)+'</span>';}).join('  ·  ');maze.appendChild(pop);
 setTimeout(function(){if(pop.parentNode)pop.parentNode.removeChild(pop);},1650);
}
function hunterBookDialog(){
 if(!r||!HB.owned(s.meta)){toast('Сначала найдите книгу охотника.');return;}
 HB.ensure(s.meta).unread=false;
 $('overlay').innerHTML='<div class="veil"><div class="dialog hb-dialog">'+HB.render(s.meta,r.hunterBookTab||'beasts',r.hunterBookSelected||'r1_0')+'</div></div>';
 save();
}
/* T1 stages 2/3: local encounters reuse the same combat and turn engine. */
function t1Spawn(mobId,count,task){
 var src=(currentRegion().mobs||[]).find(function(m){return m.id===mobId&&!m.elite&&!m.boss;});
 if(!src)return 0;
 var spots=r.tiles.filter(function(t){return t.kind==='empty'&&!t.foe&&!t.drops&&t.id!==r.heroTile&&t.id!==r.summonTile;});
 if(spots.length<count)return 0;
 for(var j=spots.length-1;j>0;j--){var k=rand(0,j),sw=spots[j];spots[j]=spots[k];spots[k]=sw;}
 for(var i=0;i<count;i++){
  var t=spots[i],foe=mkEnemy(false,false,false),role=BAL.role(src,false);
  var scaled=BAL.combat(r.actIndex||0,r.locationIndex||0,r.floor,role,false,false,src.id);
  var ability=BAL.ability(src,role);
  foe.id=src.id;foe.name=src.name;foe.visual=CR.visualId(src.name);
  foe.hp=foe.maxHp=scaled.hp;foe.atk=foe.baseAtk=scaled.atk;foe.def=scaled.def;
  foe.role=role;foe.roleName=BAL.roles[role].name;foe.ability=ability.id;
  foe.abilityName=ability.name;foe.abilityDescription=ability.description;
  foe.skill={name:src.skillName||ability.name,every:scaled.cooldown,description:src.role||ability.description,kind:ability.id};
  foe.cooldown=scaled.cooldown;foe.loot=src.loot||[];foe.t1Task=task;foe.spawnedByEvent=true;
  t.kind='enemy';t.revealed=true;t.cleared=false;t.foe=foe;t.drops=null;
 }
 return count;
}
function t1Api(){return {stats:stats,rollSpell:rollSpell,grantScroll:grantScroll,addItem:addItem,
 revealSafe:forestReveals,spawn:t1Spawn};}
function t1EventDialog(t){if(t&&t.kind==='t1-event'&&!t.cleared&&t.revealed)dialog(RE.render(r,t));}
function t1Choose(id){
 var a=String(id||'').split(':'),t=tile(a[0]),i=Number(a[1]);
 if(!t||t.kind!=='t1-event'||!Number.isInteger(i))return;
 var result=RE.choose(r,t,i,t1Api());
 if(!result.ok){toast(result.message||'Действие недоступно');return;}
 close();if(result.leave){toast('Находку можно исследовать позже.');return;}
 if(result.message)log(result.message);
 if(result.turn)finishAction();
 if(r&&!result.combat&&result.message)dialog('<div class="forest-reward-summary"><h2>'+esc((RE.scene(r,t.t1Id)||{}).title||'Находка')+'</h2><p>'+esc(result.message)+'</p><button class="btn wide" data-action="close">Продолжить</button></div>');
 if(result.combat)toast(result.message||'Начался бой');
}

/* Forest Outskirts: connected story scenes, not generic yes/no trivia. */
function forestEventDialog(t){
 if(!t||t.kind!=='forest-event'||t.cleared||!t.revealed)return;
 dialog(FE.render(r,t));
}
function forestReveals(count){
 var opened=0;
 for(var i=0;i<count;i++){
  var valid=r.tiles.filter(function(t){return !t.revealed&&t.kind!=='secret'&&t.kind!=='chamber'&&t.kind!=='trap'&&CR.exploreStatus(t,r.tiles,r.heroTile).ok;});
  if(!valid.length)break;
  var t=pick(valid);t.revealed=true;if(t.kind==='trap')triggerTrap(t);if(t.kind==='empty')t.cleared=true;opened++;
 }
 return opened;
}
function forestSpawn(type,count,task,alpha,origin){
 var candidates=[],square=null;
 if(alpha){
  for(var row=0;row<4;row++)for(var col=0;col<4;col++){
   var indexes=[row*5+col,row*5+col+1,(row+1)*5+col,(row+1)*5+col+1];
   var slots=indexes.map(function(i){return r.tiles[i];});
   if(slots.every(function(t){return t&&t.id!==r.heroTile&&t.id!==r.summonTile&&
     (t.kind==='empty'||(origin&&t.id===origin.id&&t.kind==='forest-event'))})){square=slots;break;}
  }
  if(!square){
   // A 2x2 beast may displace unattended minor pickups, never the stairs,
   // another creature, a secret, the hunter's book or a quest cell.
   for(var row2=0;row2<4;row2++)for(var col2=0;col2<4;col2++){
    var idx=[row2*5+col2,row2*5+col2+1,(row2+1)*5+col2,(row2+1)*5+col2+1];
    var cells=idx.map(function(i){return r.tiles[i];});
    if(cells.every(function(t){return t&&t.id!==r.heroTile&&t.id!==r.summonTile&&
      (['empty','coin','potion'].indexOf(t.kind)>=0||(origin&&t.id===origin.id&&t.kind==='forest-event'))})){square=cells;break;}
   }
  }
  if(!square)return 0;
  candidates=[square[0]];
 }else{
  candidates=r.tiles.filter(function(t){return t&&t.kind==='empty'&&t.id!==r.heroTile&&t.id!==r.summonTile;});
  if(candidates.length<count)return 0;
  for(var i=candidates.length-1;i>0;i--){var j=rand(0,i),v=candidates[i];candidates[i]=candidates[j];candidates[j]=v;}
  candidates=candidates.slice(0,count);
 }
 var mobNames={wolf:'Лесной волк',boar:'Дикий кабан',badger:'Барсук-корнеед',beetle:'Жук-короед',spore:'Споровый пухляк',root:'Оживший корешок'};
 var creature=mobNames[type]||mobNames.wolf;
 var pool=(DB.regions[0]&&DB.regions[0].enemies||[]).concat(currentRegion().mobs||[]);
 var source=pool.find(function(x){return x.name===creature;})||pool.find(function(x){return x.name.indexOf(creature.split(' ')[0])>=0;});
 for(var spot of candidates){
  var foe=mkEnemy(false,false,false);
  foe.name=alpha?'Альфа: '+creature:creature;
  foe.id=alpha?'forest-alpha-'+type:source?source.id:'forest-'+type;
  foe.visual=CR.visualId(creature);foe.loot=source&&source.loot||foe.loot;
  foe.roleName=alpha?'Особая охота':source&&source.role||'Лесной зверь';
  foe.forestTask=task;foe.forestAlpha=!!alpha;foe.spawnedByEvent=true;
  if(alpha){foe.maxHp=Math.round(foe.maxHp*4);foe.hp=foe.maxHp;foe.atk=Math.ceil(foe.atk*1.7);foe.def+=3;}
  spot.kind='enemy';spot.cleared=false;spot.revealed=true;spot.foe=foe;
  spot.drops=null;spot.hasKey=false;spot.forestId=null;
  if(alpha){
   spot.forestAlpha=true;
   spot.forestAlphaSquare=square.map(function(t){return t.id;});
   square.slice(1).forEach(function(t){
    t.kind='forest-alpha-block';t.cleared=false;t.revealed=true;t.foe=null;t.drops=null;
    t.forestAlphaAnchor=spot.id;t.forestId=null;
   });
  }
 }
 log(alpha?'Огромный зверь занимает четыре клетки. Бейте по нему, чтобы победить.':'На поле появились звери: '+count+'.');
 return count;
}
function forestApi(origin){
 return {stats:stats,rollSpell:rollSpell,grantScroll:grantScroll,addItem:addItem,revealSafe:forestReveals,
  target:target,spawn:function(type,n,task,alpha){return forestSpawn(type,n,task,alpha,origin);}};
}
function forestChoose(id){
 var values=String(id||'').split(':'),t=tile(values[0]),index=Number(values[1]);
 if(!t||!Number.isInteger(index)||t.kind!=='forest-event')return;
 var result=FE.choose(r,s.meta,t,index,forestApi(t));
 if(!result.ok){toast(result.message||'Выбор недоступен');return;}
 close();
 if(result.leave){toast('Вы оставили находку. К ней можно вернуться.');return;}
 if(result.message)log(result.message);
 if(result.turn)finishAction();
 if(r&&!result.combat&&result.message){
  dialog('<div class="forest-reward-summary"><h2>'+esc((FE.scene(t.forestId)||{}).title||'Лесная находка')+'</h2>'+
   '<p>'+esc(result.message)+'</p><button class="btn wide" data-action="close">Продолжить</button></div>');
 }else if(result.combat)toast(result.message||'Началась охота.');
}
function forestPackDialog(){if(!r)return;dialog('<h2>Походный карман</h2><p>Лесные находки, ловушки и предметы для связанных событий.</p>'+
 FE.inventory(r)+'<button class="btn wide" data-action="close">Закрыть</button>');}
function forestUse(id,chosenTarget){
 if(id==='bleed_trap'||id==='stun_trap'){
  if(chosenTarget==null){
   if(!enemies().length){toast('Сначала откройте хотя бы одного противника.');return;}
   r.pendingForestUse=id;close();draw();save();toast('Выберите цель для охотничьего капкана.');return;
  }
  var selected=tile(chosenTarget);
  if(!selected||!selected.revealed||!selected.foe||selected.foe.hp<=0){toast('Капкан можно применить только на живого обнаруженного врага.');return;}
 }
 var provider=forestApi(null);
 if(chosenTarget!=null)provider.target=function(){return tile(chosenTarget);};
 var used=FE.use(r,id,provider);
 if(!used.ok){toast(used.message||'Применение невозможно');return;}
 r.pendingForestUse=null;log(used.message);close();finishAction();
 if(r)toast(used.message);
}
function forestWellDialog(id){
 var t=tile(id);if(!t||!t.revealed||t.cleared||t.kind!=='forest-well')return;
 var cost=15+5*(r.forestWellUses||0),hasCoin=(FE.ensure(r).items.forest_coin||0)>0;
 dialog('<div class="forest-event-dialog"><div class="sheet-kicker">НАХОДКА 02/50 · КОЛОДЕЦ</div><h2>Лесной колодец желаний</h2>'+
  '<div class="forest-event-picture">'+FE.image('F01_018')+'</div>'+
  '<p>Из глубины тянет холодом. На каменном бортике выбиты два знака: обычные монеты и редкий дар леса.</p>'+
  (r.gold>=cost?'<button class="btn wide space-top" data-action="forest-well-offer" data-id="'+id+'">Бросить '+cost+' золота · случайный параметр +1</button>':'')+
  (hasCoin?'<button class="btn gold wide space-top" data-action="forest-well-coin" data-id="'+id+'">Лесная монетка · параметр +2 и свиток</button>':'')+
  (!hasCoin?'<p class="fine muted">Лесную монетку можно получить за помощь белке Рыжухе.</p>':'')+
  '<button class="btn dark wide space-top" data-action="close">Оставить колодец</button></div>');
}
function forestWellOffer(id,coin){
 var t=tile(id);if(!t||!t.revealed||t.cleared||t.kind!=='forest-well')return;
 var cost=15+5*(r.forestWellUses||0),bag=FE.ensure(r).items;
 if(coin){if(!bag.forest_coin){toast('Нет лесной монетки.');return;}bag.forest_coin--;}
 else {if(r.gold<cost){toast('Не хватает золота.');return;}r.gold-=cost;}
 r.forestWellUses=(r.forestWellUses||0)+1;
 if(!r.forestWellStats)r.forestWellStats={};
 var pool=[['atk','атаки'],['def','защиты'],['hp','максимального HP'],['mp','максимального MP'],['pow','магической мощи']];
 var result=pick(pool),amount=coin?2:1;
 r.forestWellStats[result[0]]=(r.forestWellStats[result[0]]||0)+amount;
 if(result[0]==='hp')r.hp+=amount;
 if(result[0]==='mp')r.mp+=amount;
 var bonusScroll='';
 if(coin){var sp=rollSpell(3);grantScroll(sp.id,1,'forest-well');bonusScroll=' и свиток «'+sp.name+'»';}
 t.cleared=true;log('Колодец: +'+amount+' '+result[1]+bonusScroll+'.');
 close();finishAction();
 if(r){dialog('<h2>Ответ леса</h2><p>Подношение скрывается под водой. На ладонях выступает голубоватое сияние.</p>'+
  '<p class="golden">+'+amount+' '+result[1]+bonusScroll+' до конца экспедиции.</p>'+
  '<button class="btn wide" data-action="close">Продолжить</button>');}
}
function drinkSmallVial(kind){
 var hp=kind==='vial-hp',old=hp?r.hp:r.mp,maximum=hp?stats().hp:stats().mp;
 var restored=Math.min(Math.max(0,maximum-old),hp?rand(5,20):rand(3,10));
 if(hp)r.hp+=restored;else r.mp+=restored;
 log((hp?'Малое зелье здоровья':'Малое зелье маны')+': сразу выпито, +'+restored+(hp?' HP.':' MP.'));
 return restored;
}
function claimTile(t){
 if(!t||!t.revealed||t.cleared)return;
 var kind=t.kind,lines=[],labels=[],pending=t.drops||null;
 if(kind==='hunter-corpse'){
  t.cleared=true;
  if(HB.acquire(s.meta)){r.journalNotes.push('У погибшего охотника найдена книга с записями о зверях.');log('Получен Охотничий бестиарий.');}
  finishAction();if(r)hunterBookDialog();return;
 }
 if(kind==='forest-well'){forestWellDialog(t.id);return;}
 if(kind==='forest-event'){forestEventDialog(t);return;}
 if(kind==='t1-event'){t1EventDialog(t);return;}
 if(kind==='forest-alpha-block')return;
 if(pending){
  if(pending.key){r.key=true;lines.push('<strong>⚿ Ключ от лестницы</strong>');labels.push('⚿ Ключ');}
  if(pending.gold){var found=addGold(pending.gold);lines.push('<strong>'+goldArt('gold-coin-inline')+' '+found+' монет</strong>');labels.push('◈ +'+found);}
  if(pending.potion){r.potions+=pending.potion;lines.push('<strong>✚ '+pending.potion+' эликсир</strong>');labels.push('✚ Эликсир ×'+pending.potion);}
  if(pending.diamonds){r.diamonds=(r.diamonds||0)+pending.diamonds;labels.push('◇ Алмазы ×'+pending.diamonds);}
  if(pending.materials)for(var mat of pending.materials){
   var qty=Math.max(1,Math.round(mat.qty*depthMultiplier()));
   r.materials[mat.name]=(r.materials[mat.name]||0)+qty;
   labels.push(mat.name+' ×'+qty);
  }
  if(pending.soul){var spirit=addSpiritSoul(pending.soul);if(spirit){lines.push('<strong>☽ '+esc(spirit.name)+'</strong>');labels.push('☽ '+spirit.name);}}
  if(pending.scroll){grantScroll(pending.scroll,1,'loot');
   var sp=SPELLS.find(function(x){return x.id===pending.scroll;});
   lines.push('<strong>✣ Свиток «'+esc(sp.name)+'»</strong>');labels.push('✣ '+sp.name+' ×1');}
  if(pending.gear){var loot=addItem(pending.gear.slot,pending.gear.rarity);
   if(loot){lines.push('<div class="loot-gear">'+gearArt(loot)+
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
  var money=addGold(Math.round((rand(6,14)+r.floor*2)*(1+(r.actIndex||0)*.16)*(1+(bonus('chestGold')+hunterStat('chestGold'))*.01)));
  lines.push('<strong>'+goldArt('gold-coin-inline')+' '+money+' монет</strong>');labels.push('◈ +'+money);
  var treasureRoll=Math.random();
   if(treasureRoll<.28){
    var i=addItem(pick(Object.keys(SLOT)),null);
    if(i){lines.push('<div class="loot-gear">'+gearArt(i)+
     '<span><strong>'+esc(i.name)+'</strong><small>'+RARITY[i.rarity]+' · '+SLOT[i.slot]+'</small></span></div>');
     labels.push(i.name+' ×1');}
   }else if(treasureRoll<.58){r.potions++;lines.push('<strong>✚ Эликсир ×1</strong>');labels.push('✚ Эликсир ×1');
   }else if(treasureRoll<.76){
    var chestSpell=rollSpell(4);grantScroll(chestSpell.id,1,'chest');
    lines.push('<strong>✣ Свиток «'+esc(chestSpell.name)+'»</strong>');labels.push('✣ '+chestSpell.name+' ×1');
   }
  if(lvl('vault')>0&&Math.random()<Math.min(.5,.1*lvl('vault'))){
   var extra=rollSpell(4);grantScroll(extra.id,1,'chest');
   lines.push('<strong>✣ Дополнительный свиток «'+esc(extra.name)+'»</strong>');
  }
  t.cleared=true;log('Сундук вскрыт.');
  finishAction();
  if(r){if(lines.length>1)rewardDialog('Старинный сундук',lines);else floatLoot(t.id,labels);}
  return;
 }
 if(kind==='vial-hp'||kind==='vial-mp'||kind==='trinket'){
  var isHp=kind!=='vial-mp',restored=drinkSmallVial(isHp?'vial-hp':'vial-mp');
  t.cleared=true;finishAction();
  if(r)floatLoot(t.id,[(isHp?'Малое зелье HP +':'Малое зелье MP +')+restored]);return;
 }
 if(kind==='coin-small'){
  var coins=addGold(rand(0,2));t.cleared=true;
  log(coins?'Подобрана мелочь: +'+coins+' монет.':'Пустой кошелёк.');
  finishAction();if(r)floatLoot(t.id,[coins?'◈ +'+coins:'Пустой кошелёк']);return;
 }
 if(kind==='coin'){
  var gold=addGold(Math.round((rand(9,18)+r.floor*2)*(1+(r.actIndex||0)*.16)));t.cleared=true;log('Подобрано '+gold+' монет.');
  finishAction();if(r)floatLoot(t.id,['◈ Монеты +'+gold]);return;
 }
 if(kind==='potion'){
  r.potions++;t.cleared=true;log('Получен целебный эликсир.');
  finishAction();if(r)floatLoot(t.id,['✚ Эликсир ×1']);return;
 }
 if(kind==='trap'){
  // Exposed by magic/automation? It is still live until actually sprung.
  if(!t.trapActive&&!t.trapSpent){triggerTrap(t);finishAction();return;}
  t.cleared=true;t.trapSpent=true;t.trapActive=false;
  if(r.trappedTile===t.id){r.trappedTile=null;log('Капкан обезврежен, кровотечение от него прекращено.');}
  else log('Разряженный капкан разобран.');
  finishAction();if(r)floatLoot(t.id,['Капкан обезврежен']);return;
 }
 if(kind==='corpse'){discoverCorpse(t);return;}
 if(kind==='chamber'){openChamber(t);return;}
 if(kind==='secret'){t.cleared=true;discoverSecret();finishAction();return;}
 if(kind==='altar'){t.cleared=true;showAltar();finishAction();return;}
 if(kind==='shop'){t.cleared=true;showShop();finishAction();return;}
 if(kind==='puzzle'){t.cleared=true;showPuzzle();finishAction();return;}
 if(kind==='event'){t.cleared=true;eventRandom();finishAction();return;}
}
/* Trap ambushes add two independent real ranged enemies with their own timers.
   Never replace a keyholder, story event, loot or the player's trapped tile. */
function trapArchers(trap){
 var free=r.tiles.filter(function(t){
  return t.kind==='empty'&&!t.foe&&!t.drops&&!t.summon&&t.id!==r.heroTile&&t.id!==trap.id;
 });
 // Prioritize covered empty cells: the sudden ambush reveals both shooters.
 free.sort(function(a,b){return Number(a.revealed)-Number(b.revealed)||a.id-b.id;});
 var spawned=0;
 for(var i=0;i<2&&i<free.length;i++){
  var cell=free[i],foe=mkEnemy(false,true,false);
  foe.summoned=true;foe.trapAmbush=true;
  foe.attackCooldown=2;foe.attackInterval=2;
  cell.kind='enemy';cell.revealed=true;cell.cleared=false;
  cell.foe=foe;cell.spawnIntro=i+1;cell.drops=null;spawned++;
 }
 if(spawned){
  r.floorCleared=false;
  log('Из засады выходят '+spawned+' дальних противника. Они будут атаковать каждые 2 хода.');
 }
 return spawned;
}
function triggerTrap(t){
 if(!t||t.kind!=='trap'||t.trapSpent||t.trapActive)return;
 t.trapActive=true;r.trappedTile=t.id;r.heroTile=t.id;
 trapArchers(t);
 var reduction=clamp(1-(bonus('trapReduce')+hunterStat('trapReduce'))*.01,0,.95);
 var dmg=Math.max(1,Math.floor((6+r.floor*.65+(r.actIndex||0)*5)*reduction*(r.class==='scout'?.55:1)));
 r.hp=Math.max(0,r.hp-dmg);
 r.bleedTurns=Math.max(1,r.bleedTurns||0);
 log('Капкан захлопнулся! −'+dmg+' HP, кровотечение до обезвреживания.');
 }
 function reveal(id){
 if(r.trappedTile!=null){toast('Сперва обезвредьте капкан.');return;}
 var t=tile(id);if(!t||t.revealed)return;
 var access=CR.exploreStatus(t,r.tiles,r.heroTile);
 if(!access.ok){toast(access.reason);return;}
 t.revealed=true;r.ep+=8;
 var k=t.kind;
 if(k==='trap'){triggerTrap(t);log('Герой угодил в капкан. Нажмите на него, чтобы обезвредить.');}
 else if(k==='enemy'||k==='boss'||k==='elite')log('Открыта плита: '+t.foe.name+'.');
 else if(k==='empty'){t.cleared=true;log('Под плитой — пустой каменный пол.');}
  else if(k==='forest-event'){log('Найдено в лесу: '+(FE.scene(t.forestId)||{}).title+'.');}
 else if(k==='t1-event'){log('Найдено: '+(RE.scene(r,t.t1Id)||{}).title+'.');}
 else if(k==='exit')log('Лестница найдена. Для спуска необходим ключ.');
 else if(k==='start'){t.cleared=true;}
 else log('Под камнем обнаружено: '+({'hunter-corpse':'погибший охотник с книгой','forest-well':'старый колодец',chest:'сундук',coin:'монеты',potion:'флакон','vial-hp':'малые склянки HP','vial-mp':'малые склянки MP','coin-small':'кошелёк',trinket:'безделушка',trap:'капкан',altar:'алтарь',secret:'тайник',shop:'лавка',puzzle:'загадка',event:'странное событие',corpse:'останки исследователя',chamber:'побочная комната'}[k]||'находка')+'. Коснитесь предмета, чтобы взаимодействовать.');
 finishAction();
}

/* Cosmetic walking: only adjacent revealed empty/safe cells. No turns, no enemy attacks. */
function moveHeroTo(id){
 if(r.trappedTile!=null){toast('Вы в капкане! Сначала обезвредьте его.');return;}
 var dest=tile(id);if(!dest||!dest.revealed||!dest.cleared||dest.drops||(dest.foe&&dest.foe.hp>0)||dest.summon)return;
 var path=CR.walkPath(r.tiles,r.heroTile,dest.id);
 if(!path){toast('Нет безопасного пути по исследованным клеткам.');return;}
 if(path.length<2)return;
 var ticket=++heroMoveToken,run=r,queue=path.slice(1);
 function advance(){
  if(ticket!==heroMoveToken||r!==run)return;
  run.heroTile=queue.shift();draw();save();
  if(queue.length)setTimeout(advance,115);
 }
 advance();
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
 if(r.actIndex===0&&r.locationIndex===0&&r.floor===1&&!HB.owned(s.meta)){toast('Сначала найдите книгу у погибшего охотника.');return;}
 var heal=Math.floor(stats().hp*.16);
 r.floor++;r.ep+=40;r.hp=Math.min(stats().hp,r.hp+heal);
 r.shield=0;r.turn++;startFloor();
 log('Новый этаж: +'+heal+' здоровья и +40 ✧.');
 save();draw();toast('Спуск на этаж '+r.floor+'.');
}
/* Souls belong to the current run. Corpse stories are one-off per run. */
function addSpiritSoul(entry){
 if(!r||!entry||!Array.isArray(r.soulBag))return null;
 // Souls share the unlimited expedition backpack.
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
  if(TR.onCorpse(r,story,titleHelpers()))lines.push('Фонарь заточил душу погибшего исследователя.');
 }else{var money=addGold(8+Math.floor(r.floor/2));lines.push('Здесь уже искали улики. Найдено '+money+' монет.');}
 log('Осмотрены останки: '+story.name+'.');fairyRemark('corpse');finishAction();
 if(r)dialog('<div class="emblem">☽</div><div class="subhead">ОСТАНКИ ИССЛЕДОВАТЕЛЯ</div><h2>'+esc(story.name)+'</h2>'+
 '<p>'+esc(story.note)+'</p><div class="reward-rows">'+lines.map(function(x){return '<div class="reward-entry">'+esc(x)+'</div>';}).join('')+'</div>'+
 '<button class="btn wide" data-action="close">Продолжить</button>');
}

/* A small instanced side chamber, saved on its original dungeon tile.
   The main map never grants its secret during automatic normal-tile clearing. */

/* Optional 3×3 encounter map, stored in the source tile to survive saves. */
function roomSecretAvailable(room){
 return !!room.secret||TR.has(r,'adv_god_thieves');
}
function newSideRoom(){
 var reg=currentRegion(),count=r.floor>=35?4:3,slots=[1,3,5,2],guards=[];
 var available=reg.mobs.slice();
 for(var i=0;i<count;i++){
  var at=rand(0,available.length-1),m=available.splice(at,1)[0];
  var role=BAL.role(m,false),spec=BAL.ability(m,role);
  var scaled=BAL.combat(r.actIndex||0,r.locationIndex||0,r.floor,role,false,false,m.id);
  var hp=Math.max(8,Math.ceil(scaled.hp*.56));
  guards.push({id:m.id,name:m.name,visual:CR.visualId(m.name),role:role,
   roleName:BAL.roles[role].name,ability:spec.id,abilityName:spec.name,abilityDescription:spec.description,
   slot:slots[i],hp:hp,maxHp:hp,def:Math.max(0,scaled.def-1),
   atk:Math.max(2,Math.ceil(scaled.atk*.68)),baseAtk:Math.max(2,Math.ceil(scaled.atk*.68)),cooldown:3,
    ranged:role==='marksman',attackCooldown:role==='marksman'?2:0,provoked:false,
    guard:0,guardTurns:0,evadeCharges:0,summons:0,stun:0,burn:0,poison:0,
   skill:{name:m.skillName||spec.name,every:3,description:spec.description,kind:spec.id}});
 }
 return {guards:guards,guardHp:guards.reduce(function(n,g){return n+g.hp;},0),
  rewardTaken:false,secretTaken:false,secret:Math.random()<.45,turns:0};
}
function openChamber(t){
 if(!t||t.kind!=='chamber'||!t.revealed||t.cleared)return;
 close();
 var first=!t.entered;
 if(!t.room||!Array.isArray(t.room.guards)){
  var replaceRoom=newSideRoom();
  if(t.room){replaceRoom.rewardTaken=!!t.room.rewardTaken;replaceRoom.secretTaken=!!t.room.secretTaken;replaceRoom.secret=!!t.room.secret;}
  t.room=replaceRoom;
 }
 t.entered=true;r.chamberActive=t.id;
 if(first){activateEntranceEquipment(true);log('Открыт вход в побочное помещение: '+currentRegion().name+'.');finishAction();}
 if(r)showChamber(t);
}
function showChamber(t){
 if(!r||!t||!t.room||t.kind!=='chamber')return;
 r.chamberActive=t.id;draw();
}
function renderChamberTiles(t){
 var room=t.room,known=roomSecretAvailable(room),html='';
 for(var k=0;k<9;k++){
  var g=room.guards.find(function(x){return x.slot===k&&x.hp>0;});
  if(k===0){html+='<button class="tile cave-exit" data-action="chamber-exit" aria-label="Выйти в основной лабиринт">'+icon('chamber')+'<span class="cave-label">Выход</span></button>';continue;}
  if(k===4){html+='<button class="tile cave-loot '+(room.rewardTaken?'taken':'')+'" data-action="chamber-reward" data-id="'+t.id+'" '+(room.guardHp>0||room.rewardTaken?'disabled':'')+' aria-label="'+(room.rewardTaken?'Сокровище собрано':room.guardHp>0?'Сокровище охраняется':'Забрать сокровище')+'">'+(room.rewardTaken?'':icon('chest'))+'<span class="cave-label">'+(room.rewardTaken?'Собрано':room.guardHp>0?'Под охраной':'Забрать')+'</span></button>';continue;}
  if(k===7){html+='<div class="tile cave-player"><span class="hero-on-board" data-unit="hero">'+window.CryptArt.miniHero(r.class,r.fxUntil>Date.now()?r.fx:null)+'</span></div>';continue;}
  if(g){html+='<button class="tile tile-danger cave-enemy'+(r.pendingSpell||r.pendingSkill?' spell-target-valid':'')+'" data-action="'+(r.pendingSpell?'cast-target':r.pendingSkill?'skill-target':'chamber-fight')+'" data-id="'+t.id+':'+k+'" data-unit="guard:'+t.id+':'+k+'" data-hold="chamber-enemy" aria-label="'+esc(g.name)+'">'+monsterVisual(g)+'<span class="unit-corner unit-hp">♥'+g.hp+'</span><span class="unit-corner unit-cd">◷'+(g.cooldown==null?3:g.cooldown)+'</span>'+damageBadge(g)+enemyDebuffs(g)+'</button>';continue;}
  if(k===6&&r.summon&&r.summon.hp>0){html+='<button class="tile tile-summon" data-unit="summon" data-action="inspect-summon" aria-label="Костяной страж">'+summonVisual()+'<span class="unit-corner unit-hp">♥'+r.summon.hp+'</span></button>';continue;}
  if(k===8&&(room.secret||known)&&!room.secretTaken){
   var ready=known&&room.guardHp<=0&&room.rewardTaken;
   html+='<button class="tile cave-secret '+(known?'secret-known':'secret-unknown')+'" data-action="chamber-secret" data-id="'+t.id+'" '+(ready?'':'disabled')+' aria-label="'+(known?'Секретная находка':'Для тайника нужен поиск секретов')+'">'+icon('secret')+'<span class="cave-label">'+(known?'Тайник':'Не изучено')+'</span></button>';continue;
  }
  html+='<div class="tile tile-bare cave-stone" aria-hidden="true"></div>';
 }
 return html;
}
function chamberEnemyPhase(frozen){
 if(!r||r.chamberActive==null)return;
 var t=activeRoom(),room=t&&t.room;if(!room)return;
 room.turns++;
 room.guards.forEach(function(g){
  if(g.hp<=0||r.hp<=0)return;
  if(g.guardTurns>0){g.guardTurns--;if(!g.guardTurns)g.guard=0;}
  if(g.burn>0){g.burn--;g.hp=Math.max(0,g.hp-Math.max(2,Math.ceil(stats().pow*.45)));}
  if(g.poison>0){g.poison--;g.hp=Math.max(0,g.hp-Math.max(2,Math.ceil(stats().atk*.25)));}
  if(g.hp<=0){g.provoked=false;return;}
   var provoked=!!g.provoked,retaliationTarget=g.provokedBy||'hero';g.provoked=false;g.provokedBy=null;
   var interval=Math.max(1,(g.skill&&g.skill.every)||3);
   g.cooldown=Math.max(0,(g.cooldown==null?interval:g.cooldown)-1);
   var alreadyCountered=g.counteredAt===r.turn;
   if(g.stun>0){g.stun--;return;}
   if(frozen)return;
   var ready=g.cooldown===0,attacks=provoked||ready;
   var attackTarget=provoked?retaliationTarget:'hero';
   if(g.ranged){
    var clock=g.attackCooldown==null?2:g.attackCooldown;
    clock=Math.max(0,clock-1);
    if(clock===0){attacks=true;g.attackCooldown=2;}
    else g.attackCooldown=clock;
   }
   if(!attacks||alreadyCountered)return;
   if(ready)g.cooldown=interval;
   if(FD)FD.actor(g,ready?'skill':'attack',ready?(g.abilityName||g.skill.name):'Удар');
   var damage=Math.max(1,g.atk);
   if(ready)damage=monsterSpecial(g,damage,room,attackTarget);
   if(provoked&&retaliationTarget==='summon'){
    if(r.summon&&r.summon.hp>0){
     var summonHit=Math.max(1,Math.ceil(damage)-(r.summon.def||0));
     r.summon.hp=Math.max(0,r.summon.hp-summonHit);
     log(g.name+' отвечает призванному существу в комнате: −'+summonHit+' HP.');
     if(!r.summon.hp){r.summon=null;r.summonTile=null;}
    }
    return;
   }
   if(provoked&&retaliationTarget==='ghost'){
    if(r.ghost&&r.ghost.hp>0){r.ghost.hp=Math.max(0,r.ghost.hp-Math.max(1,damage));if(!r.ghost.hp)r.ghost=null;}
    return;
   }
   if(provoked&&retaliationTarget==='panther'){
    if(r.titlePanther&&r.titlePanther.hp>0){
     var panther=r.titlePanther,hit=Math.max(1,Math.ceil(damage)-(panther.def||0));
     panther.hp=Math.max(0,panther.hp-hit);
     log(g.name+' отвечает чёрной пантере: −'+hit+' HP.');
     if(!panther.hp){log('Чёрная пантера погибла.');r.titlePanther=null;}
    }
    return;
   }
   damage=incomingDamage(damage,g);
  if(Math.random()*100<stats().dodge){log('Вы уклонились от '+g.name+'.');return;}
  if(r.guardCharges>0){r.guardCharges--;log('Алхимический щит блокирует атаку стража.');return;}
  if(r.ghost&&r.ghost.hp>0&&Math.random()<.35){
   if(Math.random()*100<r.ghost.dodge){log('Призрак уклонился от '+g.name+'.');return;}
   r.ghost.hp=Math.max(0,r.ghost.hp-damage);if(!r.ghost.hp)r.ghost=null;return;
  }
  if(r.summon&&r.summon.hp>0&&Math.random()<.45){
   r.summon.hp=Math.max(0,r.summon.hp-damage);
   if(r.summon.hp===0){r.summon=null;r.summonTile=null;}
   log('Спутник принимает удар '+g.name+'.');return;
  }
  if(r.setShieldRemaining>0){var fromSet=Math.min(r.setShieldRemaining,damage);r.setShieldRemaining-=fromSet;damage-=fromSet;}
  if(r.shield>0){var absorbed=Math.min(r.shield,damage);r.shield-=absorbed;damage-=absorbed;}
  r.hp=Math.max(0,r.hp-damage);
  if(damage>0)log(g.name+' наносит '+damage+' урона в побочной комнате.');
 });
 room.guardHp=room.guards.reduce(function(n,g){return n+Math.max(0,g.hp);},0);
}
function fightChamber(id){
 if(!r)return;
 var parts=String(id).split(':'),t=tile(parts[0]);if(!t||t.kind!=='chamber'||!t.room||t.cleared)return;
 var room=t.room;
 if(room.guardHp<=0)return;
 var slot=parts.length>1?Number(parts[1]):null;
 var g=(slot!=null?room.guards.find(function(x){return x.slot===slot&&x.hp>0;}):null)||room.guards.find(function(x){return x.hp>0;});
 if(!g)return;
 r.chamberActive=t.id;setHeroPose('attack');
 if(TR.beforeAttack(r)||TR.counterImmune(r)){g.counteredAt=r.turn+1;g.provoked=false;}else if(!counterBeforeHero(g,null,room)||!r)return;
 if(g.hp<=0){room.guardHp=room.guards.reduce(function(n,x){return n+Math.max(0,x.hp);},0);finishAction();return;}
 provoke(g);
  if(g.evadeCharges>0){g.evadeCharges--;
  if(Math.random()<.45){log(g.name+' уклонился в побочной комнате.');finishAction();if(r)showChamber(t);return;}}
 var st=stats(),echo=TR.consumeEcho(r);
 var dmg=Math.max(1,st.atk+(r.rageTurns>0?Math.ceil(st.atk*.4):0)+rand(0,3)-g.def-(g.guard||0));
 dmg=TR.attack(r,g,dmg,titleHelpers());g.guard=0;g.hp=Math.max(0,g.hp-dmg);
 if(echo&&g.hp>0)echoFollowUp(g,st);
 room.guardHp=room.guards.reduce(function(sum,x){return sum+x.hp;},0);
 if(room.guardHp===0)log('Все стражи побочной комнаты побеждены.');
 else log('Удар по '+g.name+': '+dmg+' урона.');
 finishAction();if(r)showChamber(t);
}
function chamberReward(id){
 var t=tile(id);if(!r||!t||t.kind!=='chamber'||!t.room||t.room.guardHp>0||t.room.rewardTaken)return;
 var room=t.room;
 var coins=addGold(Math.round((20+r.floor*2)*depthMultiplier()*(1+(r.actIndex||0)*.16)));
 room.rewardTaken=true;
 if(Math.random()<.18)addItem(pick(Object.keys(SLOT)),1);
 log('Центральная награда: '+coins+' монет.');
 var secret=roomSecretAvailable(room);
 if(!secret&&!room.secret)t.cleared=true;
 finishAction();if(r)showChamber(t);
}
function chamberSecret(id){
 var t=tile(id);
 if(!r||!t||t.kind!=='chamber'||!t.room||t.room.guardHp>0||!t.room.rewardTaken||t.room.secretTaken||!roomSecretAvailable(t.room))return;
 t.room.secretTaken=true;t.cleared=true;r.secrets++;r.ep+=4;
 localAchievement('secret-room',2,'Тайна за стеной');
 if(TR.has(r,'adv_god_thieves'))addItem('amulet',2);
 else r.scrolls.heal=(r.scrolls.heal||0)+1;
 log('В боковой стене найдена тайная ниша.');fairyRemark('secret');
 finishAction();if(r)showChamber(t);
}
function gainSecret(e){
 r.secrets++;r.ep+=bonus('secretEp');
 if(s.meta.secrets.indexOf(e.title)===-1)s.meta.secrets.push(e.title);
 if(lvl('secretkeeper')>0&&e.type==='relic'&&!r.uniqueFinds['relic-lore:'+e.title]){
  r.uniqueFinds['relic-lore:'+e.title]=true;r.ep+=2*lvl('secretkeeper');
  r.journalNotes.push('Археолог: найдено древнее свидетельство о реликвии «'+e.title+'».');
 }
 switch(e.type){
  case'relic':addItem('amulet',Math.max(2,rarityRoll()));break;
  case'ep':r.ep+=4;break;
  case'scroll':var sp=rollSpell(4);grantScroll(sp.id,2,'secret');break;
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
function storyChoice(answer){
 if(!r||!r.pendingStory)return;
 var data=r.pendingStory,scene=STORY.at(data.act,data.loc);
 r.pendingStory=null;
 if(!scene||answer!=='investigate'){close();return;}
 var reg=DN.location(data.act,data.loc);
 var key='scene:'+data.act+':'+data.loc;
 if(r.uniqueFinds[key+':claimed']){close();return;}
 r.uniqueFinds[key+':claimed']=true;
 r.journalNotes.push(reg.name+': '+scene[0]+'. '+scene[1]);
 var gained='Фрагмент свидетельства';
 if(scene[2]==='memory'){r.ep+=6;gained='+6 очков исследования';}
 else if(scene[2]==='resource'){
  var name=reg.boss.loot&&reg.boss.loot[0]?reg.boss.loot[0].name:'Обломок из '+reg.name;
  var amount=1+Math.floor(data.act/3);
  r.materials[name]=(r.materials[name]||0)+amount;gained=name+' ×'+amount;
 }else if(scene[2]==='scroll'){
  var spell=rollSpell(Math.min(5,3+Math.floor(data.act/3)));
  grantScroll(spell.id,1,'story');gained='Свиток «'+spell.name+'»';
 }else if(scene[2]==='shield'){
  r.shield+=15+data.act*4;gained='Защитный щит +'+(15+data.act*4);
 }
 log('Исследовано место «'+scene[0]+'». '+gained+'.');
 finishAction();
 if(r)dialog('<h2>'+esc(scene[0])+'</h2><p>В журнал добавлено свидетельство из локации «'+esc(reg.name)+'».</p>'+
 '<p class="golden">Награда: '+esc(gained)+'</p>'+
 '<button class="btn wide" data-action="close">Вернуться к исследованию</button>');
}

function eventRandom(){
 var sceneKey='scene:'+(r.actIndex||0)+':'+(r.locationIndex||0);
 var scene=STORY.at(r.actIndex||0,r.locationIndex||0);
 if(scene&&!r.uniqueFinds[sceneKey]){
  r.uniqueFinds[sceneKey]=true;
  r.pendingStory={act:r.actIndex||0,loc:r.locationIndex||0};
  dialog('<div class="emblem">✥</div><div class="subhead">СЮЖЕТНОЕ СОБЫТИЕ · '+esc(currentRegion().name)+'</div>'+
   '<h2>'+esc(scene[0])+'</h2><p>'+esc(scene[1])+'</p>'+
   '<p class="fine muted">Светлячок: «Только не говори, что мы снова будем читать. Хотя... вдруг там про меня?»</p>'+
   '<div class="btnrow"><button class="btn" data-action="story-choice" data-id="investigate">Исследовать · 1 ход</button>'+
   '<button class="btn alt" data-action="story-choice" data-id="leave">Не трогать</button></div>');
  return;
 }
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
 return Math.max(1,Math.ceil(base*(1+(r.actIndex||0)*.16)*depthMultiplier()*(1-bonus('discount')*.01)));}
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
 else if(id==='scroll'){var spell=rollSpell(3);grantScroll(spell.id,1,'merchant');}
 else addItem(pick(Object.keys(SLOT)),Math.max(1,rarityRoll()));
 log('Покупка у странствующего торговца. −'+cost+' монет.');
 close();finishAction();
}
function showPuzzle(){
 var key='puzzle:'+(r.actIndex||0)+':'+(r.locationIndex||0);
 var regional=!r.uniqueFinds[key]&&STORY.puzzle(r.actIndex||0,r.locationIndex||0);
 var question,options,correctIndex,hint='';
 if(regional){
  r.uniqueFinds[key]=true;
  question=regional[0];options=regional[1];correctIndex=regional[2];hint=regional[3];
 }else{
  var variants=[
   {q:'Что хранит забытый страж под сердцем?',o:['Три черепа','Один факел','Семь печатей'],a:1},
   {q:'Что откроет дверь, в которой нет замка?',o:['Ключ','Перо','Чёрная свеча'],a:0},
   {q:'Что остаётся от клятвы после смерти?',o:['Тьма','Пепел','Зеркало'],a:1},
   {q:'Что не имеет веса, но может погубить город?',o:['Тишина','Броня','Камень'],a:0},
   {q:'Какой след не оставляет сапог?',o:['Водный','След сна','Глиняный'],a:1},
   {q:'Что тяжелее памяти, но не кладётся в сундук?',o:['Долг','Железо','Золото'],a:0}
  ];
  var x=pick(variants);question=x.q;options=x.o;correctIndex=x.a;
 }
 r.pendingPuzzle={answer:correctIndex,regional:!!regional};
 dialog('<div class="emblem">✣</div><div class="subhead">'+(regional?'ТАЙНА РЕГИОНА':'КАМЕННАЯ ЗАГАДКА')+'</div>'+
 '<h2>ПРОВЕРКА ПАМЯТИ</h2><p>'+esc(question)+'</p>'+
 ((lvl('adv_seeker')||lvl('adv_god_thieves'))&&hint?'<p class="fine golden">Подсказка авантюриста: '+esc(hint)+'.</p>':'')+
 '<div class="btnrow wrap">'+options.map(function(o,i){return '<button class="btn alt" data-action="puzzle-answer" data-id="'+i+'">'+esc(o)+'</button>';}).join('')+'</div>'+
 '<p class="fine muted space-top">Ошибка пробудит защитные руны. Ответ стоит одного хода.</p>');
}
function puzzleAnswer(id){
 if(!r||r.pendingPuzzle==null)return;
 var pending=r.pendingPuzzle,answer=typeof pending==='object'?pending.answer:pending;
 var special=!!(pending&&typeof pending==='object'&&pending.regional);
 var correct=Number(id)===answer;
 r.pendingPuzzle=null;
 if(correct){
  r.ep+=special?6:3;
  var s1=rollSpell(special?5:4);
  grantScroll(s1.id,1,'puzzle');
  if(special){
   localAchievement('lore-puzzle',1,'Разгаданная тайна');
   r.journalNotes.push('Разгадана каменная загадка локации «'+currentRegion().name+'».');
  }
  log('Загадка решена! +'+(special?6:3)+' очков пути и свиток.');
 }else{
  var taken=Math.max(6,Math.round(10+r.floor*.65+(r.actIndex||0)*6));
  r.hp=Math.max(0,r.hp-taken);log('Руна неверного ответа наносит '+taken+' урона.');
 }
 close();finishAction();
}
function titleHelpers(){
 return {stats:stats,log:log,grant:grantScroll,addItem:addItem,spells:SPELLS,addSoul:addSpiritSoul,addMaterial:function(name,qty){r.materials[name]=(r.materials[name]||0)+qty;},addFood:function(kind,qty){var stock=FE.ensure(r).items;stock[kind]=(stock[kind]||0)+Math.max(1,Number(qty)||1);},
 targets:function(){return activeRoom()?[]:enemies();},
 roomTargets:function(){return livingRoomGuards();},
 hitRoom:function(guard,amount){guard.hp=Math.max(0,guard.hp-amount);var room=activeRoom();if(room)room.room.guardHp=room.room.guards.reduce(function(n,x){return n+Math.max(0,x.hp);},0);},
 provoke:provoke,
 hiddenTargets:function(){return activeRoom()?[]:hiddenEnemies();},reachable:reachableEnemy,kill:kill,
 hit:function(t,amount){if(!t||!t.foe||t.foe.hp<=0)return;var value=Math.max(1,Math.floor(amount)-(t.foe.def||0));t.foe.hp-=value;if(t.foe.hp<=0)kill(t);},
 flash:function(amount){enemies().slice().forEach(function(t){
  if(t.foe.hp<=0)return;var hit=Math.max(1,Math.floor(amount)-t.foe.def);t.foe.hp-=hit;if(t.foe.hp<=0)kill(t);});},
 cross:function(source,amount){
  var origin=r.tiles.find(function(t){return t.foe===source;});if(!origin)return;
  var row=Math.floor(origin.id/5),col=origin.id%5;
  enemies().filter(function(t){return t.foe!==source&&(Math.floor(t.id/5)===row||t.id%5===col);}).slice().forEach(function(t){var damage=Math.max(1,Math.floor(amount)-t.foe.def);t.foe.hp-=damage;if(t.foe.hp<=0)kill(t);});
 }};
}
function gainTalent(id){
 var t=TALENTS.find(function(x){return x.id===id;});if(!t)return;
 var price=levelCost(t);
 if(lvl(id)>=t.max_level||r.ep<price||!talentUnlocked(t))return;
 r.ep-=price;var n=TR.upgraded(r,t,titleHelpers());
 TR.refreshHints(r,titleHelpers());
 log('Принято звание «'+t.name+'»: '+n+'/'+t.max_level+'.');
 toast('Развитие: '+t.name);draw();save();
}
function gainTitleMastery(id){
 var x=String(id).split(':'),t=TALENTS.find(function(z){return z.id===x[0];});if(!t||!TR.masteryUpgrade(r,t,x[1],titleHelpers()))return;
 toast('Улучшение звания: '+t.name);draw();save();
}
function usePantherStatue(){
 var result=TR.summonPanther(r,titleHelpers());
 if(!result||!result.ok){toast(result&&result.message||'Призыв не удался.');return;}
 log(result.message);close();finishAction();
}
function titlePantherInfo(){
 var p=r&&r.titlePanther;if(!p||p.hp<=0)return;
 dialog('<h2>Чёрная пантера</h2><p>HP '+p.hp+'/'+p.maxHp+' · атака '+p.atk+' · броня '+p.def+'.</p><p>Наносит физические удары, получает ответ врага. Призыв действует до конца этажа или гибели.</p><button class="btn wide" data-action="close">Закрыть</button>');
}
function titleToolDialog(){
 var t=TR.toolOf(r),title=t?t.name:'Предмет авантюриста';
 var counts=t?(t.kind==='lantern'?'Фитили: '+TR.curSup(r,'wick'):t.kind==='bow'?'Стрелы: '+TR.curSup(r,'arrow'):t.kind==='rune'?'Магические руны: '+TR.curSup(r,'rune'):t.kind==='compass'?'Применений: '+TR.curSup(r,'compass'):'Закалочные эссенции: '+TR.curSup(r,'quench')):'Пока пусто';
 var description=t?t.kind==='lantern'?'Обнаруживает ключи и скрытые комнаты.':t.kind==='bow'?'Дальний выстрел по выбранному доступному противнику.':t.kind==='rune'?'Разобрать выбранный свиток либо объединить два одинаковых в более сильный.':t.kind==='compass'?'Находит скрытые припасы или золото. Работает не чаще одного раза за два этажа.':'Разбор предметов, изготовление реликвий или усиление выбранной экипировки.':'Получите звание авантюриста, выдающее инструмент.';
 var controls='';
 if(t&&t.kind==='rune'){
  var holy=TR.has(r,'adv_holy_rune'),eligible=SPELLS.filter(function(sp){return sp.rank<5&&(r.scrolls[sp.id]||0)>=(holy?2:1);});
  controls='<div class="title-rune-list"><strong>'+(holy?'Объединить два одинаковых свитка':'Разобрать один свиток')+'</strong>'+
   (eligible.length?eligible.map(function(sp){return '<button data-action="title-tool-use" data-id="'+sp.id+'">'+uiIcon(schoolIcon(sp.school))+'<span>'+esc(sp.name)+' · '+sp.rank+'★</span><small>×'+r.scrolls[sp.id]+'</small></button>';}).join(''):'<p class="fine">Нет подходящих свитков</p>')+'</div>';
 }else if(t&&t.kind==='bow'){
  var victims=enemies();
  controls='<div class="title-rune-list"><strong>Выберите цель выстрела</strong>'+
   (victims.length?victims.map(function(tile){return '<button data-action="title-tool-use" data-id="'+tile.id+'">'+uiIcon('crossbow')+'<span>'+esc(tile.foe.name)+'</span><small>♥ '+tile.foe.hp+'</small></button>';}).join(''):'<p class="fine">Доступных противников нет.</p>')+'</div>';
 }else if(t&&t.kind==='forge'&&(TR.has(r,'adv_great_enchanter')||TR.has(r,'adv_great_swordsmith'))){
  var equipped=(r.items||[]).filter(function(it){return !Object.values(r.equip).every(function(id){return id!==it.id;})&&(it.plus||0)<9;});
  controls='<div class="title-rune-list"><strong>Выберите предмет для улучшения</strong>'+
   (equipped.length?equipped.map(function(it){return '<button data-action="title-tool-use" data-id="'+it.id+'">'+gearArt(it)+'<span>'+esc(it.name)+'</span><small>+'+(it.plus||0)+'</small></button>';}).join(''):'<p class="fine">Нет подходящего надетого предмета.</p>')+'</div>';
 }else if(t)controls='<button class="btn wide" data-action="title-tool-use">Применить · 1 ход</button>';
 if(t&&t.kind==='lantern'&&(TR.has(r,'adv_explorer')||TR.has(r,'adv_explorationist'))){
  var stock=TR.curSup(r,'compass');
  controls+='<div class="nested-compass"><small>Внутри фонаря хранится старый компас исследователя.</small>'+
   '<button class="btn alt wide" data-action="title-tool-use" data-id="compass"'+(stock>0?'':' disabled')+
   '>⚙ Компас в фонаре · '+stock+' применений</button></div>';
 }
 dialog('<h2>'+esc(title)+'</h2><p>'+esc(description)+'</p><p>'+esc(counts)+'</p>'+controls+
 '<button class="btn alt wide space-top" data-action="close">Вернуться</button>');
}
function titleToolUse(selected){
 var result=TR.useTool(r,titleHelpers(),selected);
 if(!result||!result.ok){toast(result&&result.message||'Нельзя использовать предмет.');return;}
 log(result.message);close();finishAction();
}

function equip(id){
 var i=item(id);if(!i)return;
 r.equip[i.slot]=i.id;TR.refreshHints(r,titleHelpers());r.hp=Math.min(stats().hp,r.hp);r.mp=Math.min(stats().mp,r.mp);
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
 TR.onScrap(r,i,titleHelpers());
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
 '<button class="btn wide" data-action="close">Вернуться на базу и выбрать подземелье</button>'+
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
 alchemist:{title:'Алхимическая лаборатория',desc:'Расширяет доступные рецепты зелий.',icon:'⚗'},
 barracks:{title:'Казармы',desc:'+12 максимального HP за уровень',icon:'♜'},
 library:{title:'Библиотека',desc:'+8 максимальной маны за уровень',icon:'✣'}
};
function materialCount(){return Object.values(s.meta.materials||{}).reduce(function(n,v){return n+Math.max(0,Number(v)||0);},0);}

/* Prepared potions live in exactly two slots; no dungeon replenishment. */
function commonMaterialCount(){
 return Object.entries(s.meta.materials||{}).reduce(function(n,e){
  return n+(e[0]==='Металлолом'?0:Math.max(0,Number(e[1])||0));},0);
}
function alchemyHasIngredients(recipe){
 if(!recipe||!Array.isArray(recipe.ingredients)||!recipe.ingredients.length)return false;
 return recipe.ingredients.every(function(pair){return (s.meta.materials[pair[0]]||0)>=pair[1];});
}
function consumeAlchemyIngredients(recipe){
 if(!alchemyHasIngredients(recipe))return false;
 recipe.ingredients.forEach(function(pair){s.meta.materials[pair[0]]-=pair[1];});
 return true;
}
function alchemyRecipeText(recipe){
 return recipe.ingredients.map(function(pair){
  return pair[0]+' '+(s.meta.materials[pair[0]]||0)+'/'+pair[1];
 }).join(' · ');
}
function fillPreparedPotions(exp){
 if(!exp)return;
 if(!Array.isArray(exp.preparedPotions))exp.preparedPotions=[null,null];
 for(var i=0;i<2;i++){
  if(exp.preparedPotions[i])continue;
  var id=s.meta.preparedLoadout[i];
  if(id&&SYS.byPotion[id]&&(s.meta.potionStock[id]||0)>0){
   exp.preparedPotions[i]=id;s.meta.potionStock[id]--;
  }
 }
}
function alchemyMenu(){
 if(r){toast('Алхимик находится на базе.');return;}
 var level=s.meta.city.alchemist||0;
 var recipes=SYS.potions.map(function(p){
  var available=p.level<=level&&alchemyHasIngredients(p);
  return '<div class="meta-upgrade"><div><strong>'+esc(p.icon+' '+p.name)+'</strong>'+
   '<small>'+esc(p.description)+'</small><small>Лаборатория: '+p.level+' · ингредиенты: '+esc(alchemyRecipeText(p))+' · запас: '+(s.meta.potionStock[p.id]||0)+'</small></div>'+
   '<button class="btn small" data-action="brew-potion" data-id="'+p.id+'"'+(available?'':' disabled')+'>'+
   (p.level>level?'Закрыто':'Сварить')+'</button></div>';
 }).join('');
 var slots=[0,1].map(function(i){
  var selected=s.meta.preparedLoadout[i];
  var options='<option value="">Пустая ячейка</option>'+SYS.potions.filter(function(p){return p.level<=level;}).map(function(p){
   return '<option value="'+p.id+'"'+(p.id===selected?' selected':'')+'>'+esc(p.name)+' ('+(s.meta.potionStock[p.id]||0)+')</option>';
  }).join('');
  return '<div class="meta-upgrade"><div><strong>Слот '+(i+1)+'/2</strong><small>'+esc(selected&&SYS.byPotion[selected]?SYS.byPotion[selected].name:'Не выбран')+'</small></div>'+
   '<select class="alchemy-choice" data-alchemy-slot="'+i+'">'+options+'</select></div>';
 }).join('');
 dialog('<div class="emblem">⚗</div><h2>АЛХИМИК</h2>'+
 '<p>Зелья создаются из постоянных ресурсов, а затем подготавливаются в две ячейки. Между этажами они не восстанавливаются. На базе между локациями можно заново взять запас.</p>'+
 '<p>Уровень лаборатории: '+level+' · доступных ресурсов '+commonMaterialCount()+'</p>'+
 '<div class="frame-title">ДВЕ ЯЧЕЙКИ</div>'+slots+
 '<div class="frame-title space-top">РЕЦЕПТЫ</div><div class="scroll-spells" style="max-height:45dvh;overflow:auto">'+recipes+'</div>'+
 '<button class="btn alt wide space-top" data-action="close">Вернуться на базу</button>');
}
function brewPotion(id){
 if(r)return;
 var recipe=SYS.byPotion[id];
 if(!recipe||recipe.level>(s.meta.city.alchemist||0)||!consumeAlchemyIngredients(recipe)){
  toast('Недостаточно ресурсов или уровня алхимика.');return;
 }
 s.meta.potionStock[id]=(s.meta.potionStock[id]||0)+1;
 save();draw();alchemyMenu();toast('Приготовлено: '+recipe.name+'.');
}
function choosePreparedPotion(index,id){
 if(r)return;
 index=Number(index);if(index!==0&&index!==1)return;
 var p=id?SYS.byPotion[id]:null;
 if(id&&(!p||p.level>(s.meta.city.alchemist||0)))return;
 s.meta.preparedLoadout[index]=id||null;
 save();alchemyMenu();
}
function usePreparedPotion(index){
 if(!r)return;
 index=Number(index);
 var id=r.preparedPotions&&r.preparedPotions[index],p=SYS.byPotion[id];
 if((index!==0&&index!==1)||!p)return;
 r.preparedPotions[index]=null;r.locationUsedPotion=(r.locationUsedPotion||0)+1;
 if(id==='ghost'){
  if(!r.ghost||r.ghost.hp<=0){var hp=Math.round(32+r.floor*1.6);
   r.ghost={hp:hp,maxHp:hp,atk:Math.round(8+r.floor*.8),cooldown:3,dodge:70};}
  else r.ghost.hp=Math.min(r.ghost.maxHp,r.ghost.hp+Math.round(r.ghost.maxHp*.3));
 }else if(id==='aegis'){r.guardCharges=(r.guardCharges||0)+3;
 }else if(id==='cleanse'){r.poisonTurns=0;r.hp=Math.min(stats().hp,r.hp+Math.ceil(stats().hp*.2));
 }else if(id==='fury'){r.rageTurns=Math.max(r.rageTurns||0,11);
 }else if(id==='insight'){
  for(var i=0;i<5;i++){var available=r.tiles.filter(function(t){return CR.exploreStatus(t,r.tiles,r.heroTile).ok;});
   if(!available.length)break;var t=pick(available);t.revealed=true;if(t.kind==='trap')triggerTrap(t);if(t.kind==='empty')t.cleared=true;}
 }else if(id==='phoenix'){r.resurrection=(r.resurrection||0)+1;
 }else if(id==='reflection'){r.reflectionTurns=Math.max(r.reflectionTurns||0,6);
 }else if(id==='barrier'){r.shield+=Math.ceil(stats().hp*.65);r.barrierTurns=Math.max(r.barrierTurns||0,11);
 }else if(id==='forgeguard'){r.guardCharges=(r.guardCharges||0)+2;r.shield+=Math.ceil(stats().hp*.25)+Math.ceil(r.floor*.6);
 }else if(id==='wildheart'){r.poisonTurns=0;r.hp=Math.min(stats().hp,r.hp+Math.ceil(stats().hp*.40));r.regenTurns=Math.max(r.regenTurns||0,6);
 }else if(id==='ashvow'){r.rageTurns=Math.max(r.rageTurns||0,11);r.guardCharges=(r.guardCharges||0)+1;r.burnWardTurns=Math.max(r.burnWardTurns||0,5);
 }else if(id==='deepveil'){r.shield+=Math.ceil(stats().hp*.75);r.mp=Math.min(stats().mp,r.mp+Math.ceil(stats().mp*.35));
 }else if(id==='soulmemory'){
  r.mp=Math.min(stats().mp,r.mp+Math.ceil(stats().mp*.50));
  for(var j=0;j<2;j++){var found=rollSpell(5);grantScroll(found.id,1,'alchemy');}
 }else if(id==='dreamtruce'){r.timeStopTurns=Math.max(r.timeStopTurns||0,6);r.hp=Math.min(stats().hp,r.hp+Math.ceil(stats().hp*.25));
 }else if(id==='stormroot'){r.rageTurns=Math.max(r.rageTurns||0,16);r.shield+=Math.ceil(stats().hp*.45);
 }else if(id==='astraloath'){r.resurrection=(r.resurrection||0)+1;r.guardCharges=(r.guardCharges||0)+3;}
 log('Алхимик: использовано «'+p.name+'».');finishAction();
}

function bestiary(){
  var lookup=Object.create(null);
  DN.acts.forEach(function(act){act.locations.forEach(function(loc){
   (loc.mobs||[]).concat(loc.elites||[],[loc.boss]).forEach(function(m){if(m&&m.id)lookup[m.id]=m.name;});
  });});
  DB.regions.forEach(function(reg){(reg.enemies||[]).forEach(function(m){if(!lookup[m.id])lookup[m.id]=m.name;});});
  var found=Object.entries(s.meta.bestiary||{}).filter(function(x){return x[1]>0;}).sort(function(a,b){return b[1]-a[1];});
  var rows=found.map(function(entry){
   var e={id:entry[0],name:lookup[entry[0]]||entry[0]};
   return '<div class="crypt-bestiary-entry">'+monsterVisual(e)+'<div><b>'+esc(e.name)+'</b><small>Побеждено: '+entry[1]+'</small></div></div>';
  }).join('');
  dialog('<div class="emblem">☗</div><h2>БЕСТИАРИЙ</h2><p>Записи сохраняются между экспедициями. Доступны изображения обнаруженных существ T1–T2, остальные получат их по мере создания.</p>'+
   '<div class="crypt-bestiary-list">'+(rows||'<p class="fine muted">Пока не побеждено ни одного существа.</p>')+'</div><button class="btn wide space-top" data-action="close">Назад</button>');
}
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
 '<button class="btn gold wide space-top" data-action="quest-board">✥ Совет деревни и журнал заданий</button>'+
 '<button class="btn gold wide space-top" data-action="alchemy">⚗ Зелья и алхимик</button>'+
 '<div class="frame-title space-top">СКЛАД · '+resources.length+' ВИДОВ</div>'+
 '<div class="town-resources">'+(resources.length?resources.map(function(e){return '<span class="crypt-material-chip">'+SP.materialIcon(e[0])+'<i>'+esc(e[0])+'</i><b>×'+e[1]+'</b></span>';}).join(''):'<p class="fine muted">Материалов пока нет. Исследуйте подземелье и собирайте добычу с врагов.</p>')+'</div>'+
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
  return '<div class="meta-relic '+(n?'found':'')+'"><span><img class="painted-relic" src="ui/relics/'+x.id+'.png" alt=""/></span>'+
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
 if(FD){var label=name==='skill'&&r?SKILLS[r.class].name:['strike','chamber-fight'].includes(name)?'Удар':['cast','cast-modal'].includes(name)?(SPELLS.find(function(sp){return sp.id===id;})||{}).name:name==='potion'?'Лечение':name==='use-prepared'?'Зелье':null;FD.begin(label,name);}
 if(name!=='move-hero'&&name!=='close')heroMoveToken++;
 if(name==='close'){if(r)r.pendingStory=null;close();return;}
 if(name==='menu'){dialog(renderMenu());return;}
 if(name==='stored-gear'){storedGearDialog();return;}
 if(name==='choose'){if(s.meta.activeExpedition&&!r)resumeExpedition();else choose();return;}
 if(name==='dungeon-achievements'){dungeonAchievements();return;}
  if(name==='bestiary'){bestiary();return;}
 if(name==='quest-board'){questBoard();return;}
 if(name==='story-choice'){storyChoice(id);return;}
 if(name==='claim-quest'){claimQuestReport(id);return;}
 if(name==='fairy-toggle'){s.meta.fairyMuted=!s.meta.fairyMuted;save();draw();return;}
 if(name==='begin'){if(C[id])begin(id);return;}
 if(name==='select-act'){selectAct(id);return;}
 if(name==='resume-expedition'){resumeExpedition();return;}
 if(name==='safe-portal'){safePortal();return;}
 if(name==='scrap-stored-item'){scrapStoredItem(id);storedGearDialog();return;}
 if(name==='discard-expedition'){dialog('<h2>Завершить экспедицию?</h2><p>Всё временное снаряжение будет разобрано на металлолом, остальное временное содержимое сброшено.</p><button class="btn wide" data-action="confirm-discard-expedition">Подтвердить разбор</button><button class="btn alt wide" data-action="close">Отмена</button>');return;}
 if(name==='confirm-discard-expedition'){endStoredExpedition();return;}
 if(name==='confirm-switch-act'){var act=s.meta.pendingActChoice;endStoredExpedition();s.meta.selectedAct=act;choose();return;}
 if(name==='escape-25'){escapeDungeon(.25,'Вы сбежали из подземелья.');return;}
 if(name==='escape-ad'){escapeDungeon(.50,'Спасибо за попытку! Реклама недоступна.');return;}
 if(name==='diamond-shop'){diamondShop();return;}
 if(name==='buy-diamond'){buyDiamond(id);return;}
 if(name==='buy-cosmetic'){buyCosmetic(id);return;}
 if(name==='equip-cosmetic'){equipCosmetic(id);return;}
 if(name==='alchemy'){alchemyMenu();return;}
 if(name==='brew-potion'){brewPotion(id);return;}
 if(name==='use-prepared'){usePreparedPotion(id);return;}
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
 if(name==='cancel-target'){r.pendingSpell=null;draw();save();return;}
 if(name==='cancel-skill-target'){r.pendingSkill=null;draw();save();return;}
 if(name==='skill-target'){if(r.pendingSkill)useSkill(id);return;}
 if(r.pendingSkill&&name!=='battle-log'){toast('Выберите подсвеченного врага или отмените выбор цели.');return;}
 if(name==='cancel-forest-target'){r.pendingForestUse=null;draw();save();return;}
 if(name==='forest-target'){if(r.pendingForestUse)forestUse(r.pendingForestUse,id);return;}
 if(r.pendingForestUse&&name!=='battle-log'){toast('Выберите подсвеченного врага либо отмените ловушку.');return;}
 if(name==='cast-target'){if(r.pendingSpell)cast(r.pendingSpell,id);return;}
 if(r.pendingSpell&&name!=='battle-log'){toast('Нажмите на подсвеченного врага либо отмените выбор цели.');return;}
 if(name==='ui-panel'){panelDialog(['bag','hero','spells','talents'].includes(id)?id:'bag');return;}
 if(name==='gear-sets'){dialog('<div class="panel-heading"><h2>Комплекты и развитие</h2><button class="panel-close" data-action="ui-panel" data-id="bag" aria-label="В рюкзак">←</button></div>'+renderHero());return;}
 if(name==='bag-details'){dialog('<div class="panel-heading"><h2>Материалы</h2><button class="panel-close" data-action="ui-panel" data-id="bag" aria-label="Назад в рюкзак">←</button></div>'+renderBag());return;}
 if(name==='effect-info'){var effect=effectList().find(function(x){return x[0]===id;});if(effect)dialog('<h2>'+effect[1]+'</h2><p>'+effect[2]+'</p><p>Осталось: '+r[id]+'</p><button class="btn wide" data-action="close">Понятно</button>');return;}
 if(name==='ghost-info'){dialog('<h2>Призрачный страж</h2><p>Здоровье '+(r.ghost?r.ghost.hp:0)+'. Атакует раз в три хода и сопровождает героя до гибели.</p><button class="btn wide" data-action="close">Понятно</button>');return;}
 if(name==='key-info'){toast('Ключ найден. Спуститесь по лестнице на следующий этаж.');return;}
 if(name==='skill-info'){dialog('<h2>'+esc(SKILLS[r.class].name)+'</h2><p>'+esc(SKILLS[r.class].cost+' маны · '+SKILLS[r.class].turns+' ходов восстановления')+'</p><p>Восстановление: '+Math.min(SKILLS[r.class].turns,Math.max(0,r.turn-r.skillUsed))+'/'+SKILLS[r.class].turns+' ходов.</p><button class="btn wide" data-action="close">Вернуться</button>');return;}
 if(name==='spell-page'){r.spellPage=id==='special'?'special':'rank';panelDialog('spells');save();return;}
 if(name==='spell-rank'){r.spellRank=clamp(Number(id)||0,0,5);panelDialog('spells');save();return;}
 if(name==='title-detail'){selectedTitle=id;panelDialog('talents');return;}
  if(name==='title-mastery'){gainTitleMastery(id);return;}
  if(name==='title-tool'){titleToolDialog();return;}
  if(name==='title-tool-use'){titleToolUse(id);return;}
 if(name==='spell-detail'){var detail=SPELLS.find(function(x){return x.id===id;});if(!detail)return;var err=spellValid(detail);dialog('<div class="panel-heading"><h2>Книга заклинаний</h2><button class="panel-close" data-action="ui-panel" data-id="spells" aria-label="Назад в книгу">←</button></div><article class="spell-detail-page"><div class="spell-detail-seal">'+uiIcon(schoolIcon(detail.school))+'</div><div class="sheet-kicker">'+esc((SYS.schools.find(function(x){return x.id===detail.school;})||{}).name||'')+' · '+detail.rank+'★</div><h2>'+esc(detail.name)+'</h2><p>'+esc(detail.description)+'</p><div class="spell-detail-cost"><span>'+manaCost(detail)+'<small>маны</small></span><span>'+(r.scrolls[id]||0)+'<small>свитков</small></span><span>1<small>ход</small></span></div>'+(spellPreview(detail)?'<div class="spell-detail-preview"><strong>'+spellPreview(detail).label+': '+spellPreview(detail).value+'</strong><small>'+spellPreview(detail).note+'</small></div>':'')+'<div class="spell-detail-note">'+esc(err||'Готово к применению')+'</div></article><button class="btn wide space-top" data-action="cast-modal" data-id="'+id+'" '+(err?'disabled':'')+'>Применить · 1 ход</button>');return;}
 if(name==='pin-spell'){r.quickSpells=[id].concat((r.quickSpells||[]).filter(function(x){return x!==id;})).slice(0,3);save();draw();panelDialog('spells');toast('Заклинание добавлено в быстрый доступ');return;}
 if(name==='hunter-book'){hunterBookDialog();return;}
 if(name==='forest-choice'){forestChoose(id);return;}
 if(name==='t1-choice'){t1Choose(id);return;}
 if(name==='t1-item-info'){var ps=String(id).split(':'),itemName=RE.info(ps.slice(1).join(':'));if(itemName)dialog('<h2>'+esc(itemName)+'</h2><p>Походный предмет для связанных событий локаций T1.</p><button class="btn wide" data-action="ui-panel" data-id="bag">В рюкзак</button>');return;}
 if(name==='forest-pack'){forestPackDialog();return;}
 if(name==='forest-use'){forestUse(id);return;}
 if(name==='hunter-tab'){if(['beasts','trophies','bonuses'].indexOf(id)>=0){r.hunterBookTab=id;hunterBookDialog();}return;}
 if(name==='hunter-select'){if(HB.beasts.some(function(x){return x.id===id;})){r.hunterBookSelected=id;hunterBookDialog();}return;}
 if(name==='forest-well-offer'){forestWellOffer(id);return;}
 if(name==='forest-well-coin'){forestWellOffer(id,true);return;}
 if(name==='reveal'){reveal(id);return;}
 if(name==='move-hero'){moveHeroTo(id);return;}
 if(name==='pickup'){claimTile(tile(id));return;}
 if(name==='title-panther-use'){usePantherStatue();return;}
  if(name==='title-panther-info'){titlePantherInfo();return;}
  if(name==='active-item-info'){activeItemInfo(id);return;}
  if(name==='active-item-use'){activeItemUse(id);return;}
  if(name==='consume-soul'){consumeSpiritSoul(id);return;}
 if(name==='use-pocket'){usePocket(id);return;}
 if(name==='forest-item-info'){var forestDef=FE.itemDefs[id];if(forestDef)dialog('<h2>'+esc(forestDef[0])+'</h2><p>Находка хранится в рюкзаке и может пригодиться в лесных событиях.</p><button class="btn wide" data-action="ui-panel" data-id="bag">В рюкзак</button>');return;}
 if(name==='quest-item-info'){dialog('<h2>'+esc(id)+'</h2><p>Квестовый предмет. Используется в подходящем событии.</p><button class="btn wide" data-action="ui-panel" data-id="bag">В рюкзак</button>');return;}
 if(name==='note-info'){var note=(r.journalNotes||[])[Number(id)];if(note)dialog('<h2>Запись путешественника</h2><p>'+esc(note)+'</p><button class="btn wide" data-action="ui-panel" data-id="bag">В рюкзак</button>');return;}
 if(name==='chamber-exit'){if(r)r.chamberActive=null;close();draw();save();return;}
 if(name==='inspect-chamber-enemy'){inspectUnit('chamber-enemy',id);return;}
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
 if(name==='spell-school'){r.spellSchool=SYS.schools.some(function(x){return x.id===id;})?id:'all';save();draw();if($('overlay').innerHTML)panelDialog('spells');return;}
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
/* Hold a normal maze tile, then trace neighboring tiles with the same finger.
   Each valid reveal or pickup costs its ordinary turn; no free loot or attacks.
   The gesture stops on traps, event dialogs and any unsafe/blocked square. */
function quickSweepTile(id){
 if(!r||activeRoom()||r.trappedTile!=null||r.pendingSpell||r.pendingSkill||r.pendingForestUse||
  $('overlay').innerHTML)return false;
 var t=tile(id);if(!t||t.foe&&t.foe.hp>0||t.summon)return false;
 var allowed=false,verb=null;
 if(!t.revealed){
  allowed=CR.exploreStatus(t,r.tiles,r.heroTile).ok;verb='reveal';
 }else if(!t.cleared&&(t.drops||
  ['coin','coin-small','potion','vial-hp','vial-mp','chest'].indexOf(t.kind)>=0)){
  allowed=true;verb='pickup';
 }
 if(!allowed)return false;
 var started=r.turn,run=r;
 action(verb,t.id);
 return !!r&&r===run&&r.turn>started;
}
var quickSweep=null,quickSweepTimer=null,quickSweepSuppressUntil=0;
function cancelQuickSweep(){
 clearTimeout(quickSweepTimer);quickSweepTimer=null;
 if(quickSweep&&quickSweep.started)quickSweepSuppressUntil=Date.now()+550;
 quickSweep=null;
}
document.addEventListener('pointerdown',function(e){
 if(!r||$('overlay').innerHTML||activeRoom()||e.button>0)return;
 var target=e.target.closest('.maze .tile');
 if(!target||target.dataset.hold||!['reveal','pickup','move-hero'].includes(target.dataset.action))return;
 cancelQuickSweep();
 var entry={pointerId:e.pointerId,x:e.clientX||0,y:e.clientY||0,startId:target.dataset.id,started:false,last:null};
 quickSweep=entry;
 quickSweepTimer=setTimeout(function(){
  if(quickSweep!==entry||!r)return;
  entry.started=true;entry.last=entry.startId;
  quickSweepSuppressUntil=Date.now()+550;
  quickSweepTile(entry.startId);
 },280);
});
document.addEventListener('pointermove',function(e){
 var entry=quickSweep;if(!entry||entry.pointerId!==e.pointerId)return;
 if(!entry.started){
  var dx=(e.clientX||0)-entry.x,dy=(e.clientY||0)-entry.y;
  if(dx*dx+dy*dy>144)cancelQuickSweep();
  return;
 }
 if(e.cancelable)e.preventDefault();
 if(!r||r.trappedTile!=null||$('overlay').innerHTML){cancelQuickSweep();return;}
 var under=document.elementFromPoint&&document.elementFromPoint(e.clientX,e.clientY);
 var cell=under&&under.closest&&under.closest('.maze .tile');
 if(!cell||cell.dataset.id==null||cell.dataset.id===entry.last)return;
 entry.last=cell.dataset.id;
 quickSweepTile(entry.last);
 quickSweepSuppressUntil=Date.now()+550;
});
['pointerup','pointercancel'].forEach(function(type){
 document.addEventListener(type,function(e){
  if(quickSweep&&quickSweep.pointerId===e.pointerId)cancelQuickSweep();
 });
});
document.addEventListener('change',function(e){
 var selector=e.target.closest('[data-alchemy-slot]');
 if(selector)choosePreparedPotion(selector.dataset.alchemySlot,selector.value);
});
document.addEventListener('click',function(e){
 if((Date.now()<suppressClickUntil&&e.target.closest('[data-hold]'))||
   (Date.now()<quickSweepSuppressUntil&&e.target.closest('.maze .tile'))){e.preventDefault();return;}
 var b=e.target.closest('[data-action],[data-tab]');if(!b)return;e.preventDefault();
 if(b.dataset.tab){if(r)panelDialog(b.dataset.tab);return;}
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
 if(activeRoom()){r.chamberActive=null;draw();save();return;}
 if(r&&r.tab!=='maze'){r.tab='maze';draw();return;}
 toast('Лабиринт хранит ваши следы.');
 },state:function(){return s;},debug:{action:action,draw:draw,stats:stats,finish:finishAction,quickSweep:quickSweepTile}};
s=load();
if(!s)fresh();r=s.run;
if(r){if(repairCurrentFloorElite())save();TR.refreshHints(r,titleHelpers());}
if(r&&r.summon&&r.summon.hp>0&&r.summonTile==null)placeSummon();
draw();
// The village is the entry screen. Hero selection opens from «В поход».
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',function(){if(document.hidden)save();});
setInterval(save,7000);
})();