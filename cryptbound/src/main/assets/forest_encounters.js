/* Forest Outskirts • story-driven events. No generic riddles.
 * Event #02 is the independent 25%-chance well handled by the floor generator.
 * Icons always resolve to the approved 192 RGBA assets, not regenerated monsters. */
(function(){'use strict';
function D(id,title,art,min,repeat,description,choices,need){return {id:id,title:title,art:art,min:min,repeat:!!repeat,text:description,choices:choices,need:need||''};}
var scenes=[
D(1,'Рыжуха и волчья стая','F03_001',1,0,'Раненая белка по имени Рыжуха забралась на пень. Три волка не отходят от корней. Она просит отогнать их.',['Помочь Рыжухе|fight:wolf:3:squirrel','Пройти мимо|leave']),
D(2,'Лесной колодец','F01_018',1,1,'Колодец принимает золото и редкие лесные монетки. Встречается независимо с вероятностью 25%.',['Бросить 15 золота|stat:random:1;gold:-15|gold:15','Бросить Лесную монетку|take:forest_coin:1;stat:random:2;scroll:3|item:forest_coin:1'],''),

D(3,'Капкан у звериной тропы','F01_048',1,1,'Над тропой натянута цепь. Исправный охотничий капкан можно забрать или наживить.',['Забрать капкан|item:bleed_trap:1','Поставить и приманить зверя|fight:boar:1:trap','Оставить|leave']),
D(4,'Пойманная лисица','F03_004',1,0,'В клетке мечется лисица с чёрными лапами. На засове следы инструмента браконьера.',['Освободить зверя|flag:fox_freed;ep:2','Забрать браконьерский силок|item:bleed_trap:1','Не вмешиваться|leave']),
D(5,'Обрывок карты лесника','F02_003',1,0,'Под корнями спрятан первый кусок карты со знаком старой охотничьей тропы.',['Взять карту|item:map_scrap:1;flag:map_first;reveal:1','Не трогать|leave']),
D(6,'Уставший путник','F01_002',1,1,'У тропы лежит мёртвый путник. В поясной сумке звенят монеты, а под плащом виднеется припарка.',['Забрать припасы|gold:11;potion:1','Захоронить останки|ep:2;shield:6','Пройти мимо|leave']),
D(7,'Павший рыцарь','F01_003',3,0,'Рыцарь погиб, удерживая волчью стаю у переправы. Его оружие всё ещё пригодно.',['Забрать оружие|gear:weapon:2','Почтить защитника|shield:20;ep:2','Не трогать|leave']),
D(8,'Брошенный лагерь','F01_009',1,1,'Котелок ещё тёплый. Люди ушли поспешно, оставив еду и поленья.',['Отдохнуть у костра|heal:18;mana:8','Обыскать мешки|gold:12;material:Припасы охотника:1','Уйти|leave']),
D(9,'Дерево с ульем','F01_031',2,1,'Пчёлы облепили медовые соты. Без дыма сбор будет опасным.',['Собрать соты руками|hp:-8;item:honey:1','Применить дымарь|take:smoker:1;item:honey:2|item:smoker:1','Не тревожить улей|leave']),
D(10,'Следы под корягой','F01_038',1,1,'На сырой почве видны три свежих отпечатка волчьих лап. Рядом клочок серой шерсти.',['Изучить следы|ep:2;flag:wolf_tracks','Пойти по следу|fight:wolf:1:tracks','Не рисковать|leave']),
D(11,'Жетон лесничего','F02_006',2,0,'На цепочке у сгнившего ранца — жетон дозорного лесничего. Его знак выбит на старых схронах.',['Сохранить жетон|item:ranger_badge:1;flag:ranger_badge','Оставить|leave']),
D(12,'Тропа охотников','F01_027',3,0,'Метки на деревьях совпадают с обрывком карты. Через эту тропу следопыты обходили засады.',['Сверить карту|take:map_scrap:1;flag:trail_mapped;reveal:3;ep:3|item:map_scrap:1','Идти наугад|reveal:1','Вернуться|leave']),
D(13,'Воронья жердь','F03_052',3,0,'Ворон держит в клюве узкий амулет. Он не улетает, словно ждёт обмена.',['Поделиться мёдом|take:honey:1;shield:10|item:honey:1','Отдать 12 золотых|gold:-12;scroll:2|gold:12','Прогнать ворона|leave']),
D(14,'Топор лесоруба','F01_011',3,0,'В разбитой телеге застрял небольшой, но прочный топор. Им можно расчистить завал.',['Взять топор|item:axe:1','Оставить на месте|leave']),
D(15,'Мшистый родник','F01_060',2,1,'Холодная вода течёт между камнями. Запах смолы перебивает гниль болотного леса.',['Напиться|heal:24','Обмыть раны|status:clean;shield:6','Не останавливаться|leave']),
D(16,'Лисий тайник','F01_043',4,0,'Среди корней виднеется укромная нора. Лисица выходит навстречу, если узнаёт спасителя.',['Принять подарок лисицы|gold:28;item:fox_charm:1;ep:3|flag:fox_freed','Осторожно осмотреть вход|gold:9','Уйти|leave']),
D(17,'Завал лесной дороги','F01_044',6,0,'Поваленное дерево скрывает дорожный сундук, но путь загорожен огромными корнями.',['Разрубить преграду топором|take:axe:1;gold:32;gear:boots:2|item:axe:1','Пролезть под стволом|hp:-15;gold:16','Не трогать|leave']),
D(18,'Моток верёвки','F02_055',4,0,'На заброшенной стоянке висит крепкая, сухая верёвка.',['Забрать верёвку|item:rope:1','Оставить|leave']),
D(19,'Смотровая вышка','F03_026',5,0,'С вершины старой башни видны следы стаи и заброшенный дозорный пост.',['Отметить по карте|flag:watchtower;reveal:3;ep:2|flag:map_first','Осмотреться|reveal:2','Не подниматься|leave']),
D(20,'Письмо дозорного','F02_062',7,0,'Под потухшим костром лежит письмо с печатью пограничной стражи. Адрес — пост на дальней тропе.',['Сохранить письмо|item:guard_letter:1;flag:guard_letter','Не брать чужое|leave']),
D(21,'Совиное святилище','F01_023',4,0,'Сова наблюдает с каменной фигуры. Под статуей сохранились знаки разведчиков.',['Попросить указать путь|reveal:3;mana:8','Оставить горсть золота|gold:-10;ep:4|gold:10','Пройти мимо|leave']),
D(22,'Пень с медовым горшком','F01_045',3,1,'На старом пне стоит забытый горшок с мёдом. Его ещё не успели разорить звери.',['Забрать мёд|item:honey:1','Поделиться с лесом|shield:9;ep:1','Оставить|leave']),
D(23,'Круг ядовитых грибов','F01_036',5,1,'Споровые кольца тянутся к свету. Среди них встречаются лечебные грибы, но ошибка обойдётся дорого.',['Собрать знакомые грибы|item:mushroom:1;ep:1','Срезать споры для ловушки|hp:-8;item:spore:1','Не трогать|leave']),
D(24,'Забытый схрон','F01_016',6,0,'Под мхом спрятан сундук с инструментами охотника. Замок покрыт ржавчиной.',['Вскрыть сундук|gold:26;gear:gloves:2','Найти записи владельца|item:map_scrap:1;ep:2','Оставить|leave']),
D(25,'След альфа-волка','F01_040',12,0,'Лапа вожака оставила след размером с ладонь. Стая не отходит от его территории.',['Вызвать альфа-волка|hunt:wolf|flag:wolf_tracks','Отметить логово|flag:alpha_wolf_trail;ep:3','Уйти|leave']),
D(26,'Нора барсука','F01_041',6,1,'Барсук притащил в нору чужие припасы. Изнутри слышится сердитое фырканье.',['Разорить нору|fight:badger:1:burrow','Оставить корень у входа|item:acorn:1;ep:1','Уйти|leave']),
D(27,'Раненый волчонок','F03_006',8,0,'Волчонок зажат между ветками. Его лапа порезана старым капканом.',['Освободить и перевязать|hp:-5;flag:wolf_cub;ep:3','Забрать капкан|item:bleed_trap:1','Не вмешиваться|leave']),
D(28,'Секачья тропа','F01_039',10,0,'Кровь на коре и разрытая земля говорят о схватке огромного секача.',['Расставить приманку|fight:boar:2:boar_path','Взять образец следов|flag:boar_tracks;ep:3','Оставить|leave']),
D(29,'Вызов великого секача','F03_032',18,0,'На старом камне выбит силуэт кабана-вожака. Охотники вызывали его ударом в рог.',['Призвать секача|hunt:boar|flag:boar_tracks','Отложить охоту|leave']),
D(30,'Стонущий дуб','F03_018',12,0,'Внутри могучего дуба слышится стон. Древние корни удерживают под землёй больное сердце рощи.',['Выслушать дерево|flag:oak_voice;ep:4;item:oak_rune:1','Содрать смолу|material:Лесная смола:2','Отойти|leave']),
D(31,'Клетка браконьеров','F03_009',10,0,'К клетке приставлен самодельный замок. Внутри раненый зверь; рядом лежат сети.',['Освободить зверя|flag:poacher_freed;ep:4','Взять ловчие сети|item:stun_trap:1','Забрать дымарь охотников|item:smoker:1','Не вмешиваться|leave']),
D(32,'Пугало с кольями','F01_062',11,1,'На пугале развешаны старые ключи. Под травой возле него протянуты ловчие нити.',['Обыскать карманы|hp:-9;gold:20','Перерезать растяжку|item:bleed_trap:1','Пройти мимо|leave']),
D(33,'Живая лоза','F03_023',12,1,'Шипастая лоза вросла в землю вокруг ямы. Похоже, она защищает молодые корни.',['Осторожно отвести ветви|shield:14;ep:2','Срезать шипы|hp:-7;item:spore:1','Не трогать|leave']),
D(34,'Привал следопыта','F03_027',9,1,'На углях ещё можно вскипятить воду. Укрытие хорошо защищено от ветра.',['Отдохнуть|heal:24;mana:12','Обыскать тайник|gold:14;material:Сухой паёк:1','Уйти|leave']),
D(35,'Пост дальнего дозора','F03_027',15,0,'На посту ждут вестей от пропавшего дозорного. Его письмо поможет открыть склад.',['Передать письмо|take:guard_letter:1;flag:guard_reported;gear:armor:3;gold:24|item:guard_letter:1','Вернуться|leave'],'item:guard_letter'),
D(36,'Сундук лесничего','F01_015',16,0,'На массивном сундуке выгравирован тот же знак, что и на старом жетоне.',['Открыть жетоном|take:ranger_badge:1;gear:amulet:3;gold:40;ep:3|item:ranger_badge:1','Не ломать замок|leave'],'item:ranger_badge'),
D(37,'Следы матки панцирников','F03_021',18,0,'Панцири вокруг кургана указывают на гнездо огромной жучиной матки.',['Вызвать матку|hunt:beetle','Обыскать сброшенные панцири|material:Хитиновая пластина:2','Отступить|leave']),
D(38,'Порченое гнездо','F03_055',17,1,'Липкие коконы пахнут гнилью. Разорванные нити будто продолжают двигаться.',['Разорвать коконы|fight:beetle:2:cocoon','Собрать безопасные нити|material:Паутинная нить:2','Уйти|leave']),
D(39,'Корневой страж','F03_049',22,0,'У скрытой двери в земле шевелятся корни. Страж ждёт тех, кто потревожил печать.',['Вызвать корневого стража|hunt:root|flag:oak_voice','Оставить дверь закрытой|leave']),
D(40,'Старая печать рощи','F03_060',22,0,'На менгире ещё действует печать, не дающая болезни добраться до сердцевины дуба.',['Восстановить печать|take:oak_rune:1;flag:grove_seal;shield:25;ep:5|item:oak_rune:1','Уйти|leave'],'item:oak_rune'),
D(41,'Лунная тропа','F03_013',16,1,'Свет луны проникает даже сквозь густую крону. Тропу охраняют старые знаки друидов.',['Прочесть знаки|mana:18;scroll:4','Подождать рассвета|heal:12;ep:1','Уйти|leave']),
D(42,'Разрушенный мост','F03_025',20,0,'Через овраг остались только обрывки верёвочного настила. С другой стороны виднеется походный сундук.',['Навести переправу верёвкой|take:rope:1;gold:36;gear:boots:3|item:rope:1','Попытаться перелезть|hp:-18;gold:18','Вернуться|leave']),
D(43,'Тропа забытых следопытов','F03_020',21,0,'На памятном камне выбиты имена людей, ушедших искать сердце леса.',['Почтить погибших|ep:5;shield:12','Прочесть последний маршрут|reveal:3;flag:forgotten_trail','Не останавливаться|leave']),
D(44,'Камень охотничьей клятвы','F03_028',24,1,'Старинная статуя напоминает: охотник отвечает за каждую убитую жизнь.',['Принести клятву|hp:-12;stat:atk:1','Попросить защиты|shield:16;mana:7','Уйти|leave']),
D(45,'Больной молодой древ','F03_017',28,0,'Маленький древ задыхается под чёрной корой. Только восстановленная печать поможет его исцелить.',['Исцелить с помощью печати|flag:young_treant_healed;trophy:grove;ep:5|flag:grove_seal','Уйти|leave'],'flag:grove_seal'),
D(46,'Хижина отшельника','F03_011',18,1,'Отшельник умеет готовить припарки и не задаёт вопросов о добыче.',['Купить припарку|gold:-15;potion:2|gold:15','Обменять мёд|take:honey:1;scroll:3|item:honey:1','Не мешать|leave']),
D(47,'Огонь духов','F03_045',27,1,'На пепле вспыхивают холодные искры. В обмен на дар духи обещают крепость духа.',['Отдать желудь|take:acorn:1;stat:pow:1;shield:8|item:acorn:1','Оставить 20 золота|gold:-20;ep:5|gold:20','Отойти|leave']),
D(48,'Сердце грибницы','F03_057',30,0,'Сине-зелёный свет исходит из корней. Споры тянутся за каждым движением.',['Уничтожить нарост|fight:spore:3:fungal','Собрать лечебную эссенцию|hp:-10;material:Грибная эссенция:3','Не трогать|leave']),
D(49,'Камень Врат Земли','F03_030',32,0,'Между плитами проглядывают древние знаки перемещения. Их можно прочитать только один раз за путешествие.',['Снять оттиск рун|earthgate;ep:3','Получить обычное знание|scroll:4','Не трогать|leave']),
D(50,'Сердце древнего дуба','F03_064',35,0,'Ветви расступаются перед теми, кто услышал стон дуба и снял боль с молодой рощи.',['Принять дар хранителя|flag:grove_heart;gear:amulet:4;stat:hp:10;ep:6|flag:young_treant_healed','Отойти|leave'],'flag:young_treant_healed')
];

var itemDefs={
 forest_coin:['Лесная монетка','F02_004'],map_scrap:['Обрывок карты','F02_003'],
 ranger_badge:['Жетон лесничего','F02_006'],axe:['Топор лесоруба','F01_011'],
 rope:['Прочная верёвка','F02_055'],guard_letter:['Письмо дозорного','F02_062'],
 oak_rune:['Руна дуба','F02_040'],fox_charm:['Лисий талисман','F02_025'],
 honey:['Лесной мёд','F02_031'],smoker:['Дымарь','F03_042'],
 bleed_trap:['Капкан кровотечения','F02_010'],stun_trap:['Капкан оглушения','F02_011'],
 mushroom:['Лекарственные грибы','F02_043'],spore:['Ядовитые споры','F02_034'],
 acorn:['Желудь','F02_049'],water:['Родниковая вода','F02_051']
};
var trophyMap={wolf:'wolf',boar:'boar',beetle:'beetle',root:'root',grove:'grove'};
function ensure(run){
 if(!run.forest||typeof run.forest!=='object')run.forest={};
 var f=run.forest;
 if(!f.seen)f.seen={};if(!f.flags)f.flags={};if(!f.items)f.items={};
 if(!f.battles)f.battles={};if(!f.hunts)f.hunts={};if(!f.pendingTrophies)f.pendingTrophies={};
 if(!f.uses)f.uses={};
 return f;
}
function has(run,key){
 var f=ensure(run);
 if(!key)return true;
 if(key.indexOf('!')===0)return !has(run,key.slice(1));
 var a=key.split(':');
 if(a[0]==='item')return (f.items[a[1]]||0)>=Math.max(1,Number(a[2])||1);
 if(a[0]==='flag')return !!f.flags[a[1]];
 if(a[0]==='gold')return run.gold>=Number(a[1]);
 if(a[0]==='floor')return run.floor>=Number(a[1]);
 return true;
}
function scene(id){return scenes.find(function(x){return x.id===Number(id);})||null;}
function pickScene(run,exclude){
 var f=ensure(run);
 var possible=scenes.filter(function(x){
  if(x.id===2||run.floor<x.min||(exclude||[]).indexOf(x.id)>=0)return false;
  if(!x.repeat&&f.seen[x.id]&&[25,29,37,39].indexOf(x.id)<0)return false;
  if(x.id===1&&(f.flags.squirrel_saved||run.floor===1))return false;
  if(x.id===25&&f.hunts.wolf&&(f.hunts.wolf.attempts>=2||f.hunts.wolf.completed))return false;
  if(x.id===29&&f.hunts.boar&&(f.hunts.boar.attempts>=2||f.hunts.boar.completed))return false;
  if(x.id===37&&f.hunts.beetle&&(f.hunts.beetle.attempts>=2||f.hunts.beetle.completed))return false;
  if(x.id===39&&f.hunts.root&&(f.hunts.root.attempts>=2||f.hunts.root.completed))return false;
  return !x.need||has(run,x.need);
 });
 if(!possible.length)return null;
 var upgrade=window.CryptForestRework;
 var story=upgrade&&(upgrade.milestone(run,possible)||upgrade.priority(run,possible));
 if(story)return story;
 // Explore unfinished one-off discoveries before recurring harvests.
 var first=possible.filter(function(x){return !x.repeat;});
 var pool=first.length&&Math.random()<.87?first:possible;
 return pool[Math.floor(Math.random()*pool.length)].id;
}
function image(id,cls){
 if(!/^F0[1-3]_\d{3}$/.test(id))return '';
 return '<img class="'+(cls||'forest-event-image')+'" src="forest_events/sprites/'+id+'.png" alt="" draggable="false"/>';
}
function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(a){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a];});}
function choicesFor(run,t){
 var def=scene(t.forestId);if(!def)return [];
 if(def.id===1){
  if(t.forestPhase==='fight')return [['Волки ещё рядом — вернуться после победы','leave','']];
  if(t.forestPhase==='reward')return [['Поговорить с Рыжухой','item:forest_coin:1;flag:squirrel_saved;gold:5','']];
 }
 return def.choices.map(function(s){return s.split('|');});
}
function render(run,t){
 var def=scene(t.forestId);if(!def)return '';
 var opts=choicesFor(run,t);
 return '<div class="forest-event-dialog"><div class="sheet-kicker">ЛЕСНАЯ ОКРАИНА · НАХОДКА '+String(def.id).padStart(2,'0')+'/50</div>'+
  '<h2>'+e(def.title)+'</h2><div class="forest-event-picture">'+image(def.art)+'</div><p>'+e(def.text)+'</p>'+
  (def.id===1&&t.forestPhase==='reward'?'<p class="golden">Три волка побеждены. Рыжуха уже может спуститься с пня.</p>':'')+
  opts.map(function(opt,i){
   // Hidden choices preserve their original index for validation in choose().
   var missing=opt[2]&&!has(run,opt[2])?requirementText(opt[2]):opt[1]!=='leave'?needsCheck(run,opt[1].split(';')):'';
   return '<button class="btn wide space-top'+(i?' alt':'')+'" data-action="forest-choice" data-id="'+t.id+':'+i+'"'+(missing?' disabled title="'+e(missing)+'"':'')+'>'+e(opt[0])+(missing?'<small> · '+e(missing)+'</small>':'')+'</button>';
  }).join('')+'<button class="btn dark wide space-top" data-action="close">Закрыть</button></div>';
}
function requirementText(s){
 if(!s)return '';
 var a=s.split(':');
 if(a[0]==='item')return itemDefs[a[1]]?itemDefs[a[1]][0]:'Нужен предмет';
 if(a[0]==='flag')return ({fox_freed:'сначала спасти лисицу',map_first:'нужна карта леса',wolf_tracks:'сначала изучить следы волков',boar_tracks:'сначала изучить следы секача',oak_voice:'сначала услышать старый дуб',grove_seal:'восстановить печать рощи',young_treant_healed:'сначала спасти молодого древа'})[a[1]]||'нужно связанное событие';
 if(a[0]==='gold')return a[1]+' золота';
 if(a[0]==='item')return 'Нужно: '+((itemDefs[a[1]]||[a[1]])[0]);
 return 'сначала выполните условие';
}
function needsCheck(run,effects){
 var f=ensure(run),gold=run.gold,stock=Object.assign({},f.items);
 for(var effect of effects){
  var parts=effect.split(':'),type=parts[0];
  if(type==='gold'){gold+=Number(parts[1])||0;if(gold<0)return 'Не хватает золота';}
  if(type==='take'){
   var k=parts[1],n=Math.max(1,Number(parts[2])||1);
   stock[k]=(stock[k]||0)-n;if(stock[k]<0)return 'Не хватает предмета: '+(itemDefs[k]?itemDefs[k][0]:k);
  }
 }
 return '';
}
function apply(run,effects,api){
 var f=ensure(run),messages=[];
 for(var op of effects){
  if(!op)continue;
  var p=op.split(':'),kind=p[0],key=p[1],num=Number(p[2])||1;
  if(kind==='gold'){var amount=Number(key)||0;run.gold+=amount;messages.push((amount>=0?'+':'')+amount+' золота');}
  else if(kind==='ep'){run.ep+=Number(key)||0;messages.push('+'+key+' очков исследования');}
  else if(kind==='heal'){var old=run.hp;run.hp=Math.min(api.stats().hp,run.hp+(Number(key)||0));messages.push('Восстановлено '+(run.hp-old)+' HP');}
  else if(kind==='hp'){run.hp=Math.max(1,run.hp+(Number(key)||0));messages.push(key+' HP');}
  else if(kind==='mana'){run.mp=Math.min(api.stats().mp,run.mp+(Number(key)||0));messages.push('Мана +'+key);}
  else if(kind==='shield'){run.shield+=Number(key)||0;messages.push('Щит +'+key);}
  else if(kind==='potion'){run.potions+=Number(key)||0;messages.push('Эликсиры ×'+key);}
  else if(kind==='scroll'){
   var sp=api.rollSpell(Math.max(1,Math.min(5,Number(key)||3)));
   api.grantScroll(sp.id,1,'forest-event');messages.push('Свиток «'+sp.name+'»');
  }else if(kind==='earthgate'){
   if(!run.earthGateFound&&api.grantScroll('earthgate',1,'forest-event'))messages.push('Свиток Врат Земли');
   else{var another=api.rollSpell(4);api.grantScroll(another.id,1,'forest-event');messages.push('Свиток «'+another.name+'»');}
  }else if(kind==='item'){
   f.items[key]=(f.items[key]||0)+num;messages.push((itemDefs[key]?itemDefs[key][0]:key)+' ×'+num);
   if(window.CryptForestRework&&['mushroom','honey','nectar','forest_moss','herbal_extract','oak_resin','living_seed'].includes(key)){
    var extra=window.CryptForestRework.forage(run,key);
    if(extra)messages.push('Сумка травницы: дополнительная добыча ×'+extra);
   }
  }else if(kind==='take'){
   f.items[key]=Math.max(0,(f.items[key]||0)-num);messages.push('Использовано: '+(itemDefs[key]?itemDefs[key][0]:key));
  }else if(kind==='flag'){f.flags[key]=true;}
  else if(kind==='material'){
   var n=Number(p[p.length-1])||1,material=p.slice(1,-1).join(':');
   run.materials[material]=(run.materials[material]||0)+n;messages.push(material+' ×'+n);
  }else if(kind==='gear'){
   var gear=api.addItem(key,Number(p[2])||2);
   if(gear)messages.push('Снаряжение: '+gear.name);
  }else if(kind==='unique'||kind==='home'||kind==='buff'){
   var message=window.CryptForestRework&&window.CryptForestRework.apply(run,op,api);
   if(message)messages.push(message);
  }else if(kind==='reveal'){
   var count=Math.max(1,Math.min(4,Number(key)||1)),opened=api.revealSafe(count);
   messages.push('Открыто клеток: '+opened);
  }else if(kind==='stat'){
   var stat=key==='random'?['atk','def','hp','mp','pow'][Math.floor(Math.random()*5)]:key;
   var amount=Number(p[2])||1;
   if(!run.forestWellStats)run.forestWellStats={};
   run.forestWellStats[stat]=(run.forestWellStats[stat]||0)+amount;
   if(stat==='hp')run.hp+=amount;if(stat==='mp')run.mp+=amount;
   messages.push('Постоянно до конца экспедиции: +'+amount+' '+({atk:'атаки',def:'защиты',hp:'HP',mp:'MP',pow:'магии'}[stat]||stat));
  }else if(kind==='status'&&key==='clean'){run.poisonTurns=0;run.bleedTurns=0;messages.push('Яд и кровотечение сняты');}
  else if(kind==='trophy'){
   f.pendingTrophies[key]=true;messages.push('Трофей «'+key+'» сохранится после безопасного возвращения');
  }
 }
 return messages;
}
function choose(run,meta,t,index,api){
 var def=scene(t&&t.forestId);if(!def||!t.revealed||t.cleared)return {ok:false,message:'Находка уже исследована'};
 var f=ensure(run);
 if(f.seen[def.id]&&!def.repeat)return {ok:false,message:'Уникальное событие уже завершено'};
 var list=choicesFor(run,t),choice=list[index];
 if(!choice)return {ok:false,message:'Неверный вариант'};
 if(choice[2]&&!has(run,choice[2]))return {ok:false,message:requirementText(choice[2])};
 if(choice[1]==='leave')return {ok:true,leave:true,turn:false,message:'Вы проходите мимо',finish:false};
 var effects=choice[1].split(';'),err=needsCheck(run,effects);
 if(err)return {ok:false,message:err};
 var battle=effects.find(function(x){return x.indexOf('fight:')===0||x.indexOf('hunt:')===0;});
 if(battle){
  var parts=battle.split(':'),kind=parts[0]==='hunt'?'alpha':parts[1];
  var creature=parts[0]==='hunt'?parts[1]:parts[1],n=parts[0]==='hunt'?1:Number(parts[2])||1,task=parts[0]==='hunt'?'hunt:'+creature:'encounter:'+t.id+':'+run.floor;
  if(f.battles[task]&&f.battles[task].remaining>0)return {ok:false,message:'Сначала закончите начатый бой'};
  if(parts[0]==='hunt'){
   var hunt=f.hunts[creature]||(f.hunts[creature]={attempts:0,completed:false});
   if(hunt.completed)return {ok:false,message:'Этот вожак уже побеждён'};
   if(hunt.attempts>=2)return {ok:false,message:'След вожака потерян после двух попыток'};
  }
  var spawned=api.spawn(creature,n,task,kind==='alpha');
  if(spawned!==n)return {ok:false,message:'Недостаточно места для засады; событие можно повторить'};
  f.battles[task]={remaining:n,origin:t.id,scene:def.id,creature:creature,alpha:kind==='alpha',reward:parts[3]||'',finished:false};
  if(kind==='alpha'){var h=f.hunts[creature]||(f.hunts[creature]={attempts:0,completed:false});h.attempts++;}
  if(def.id===1){t.forestPhase='fight';}else{t.cleared=true;f.seen[def.id]=true;}
  return {ok:true,turn:true,combat:true,message:'Охота началась: противников '+n+'. Победите их на поле'};
 }
 var messages=apply(run,effects,api);
 t.cleared=true;f.seen[def.id]=true;f.uses[def.id]=(f.uses[def.id]||0)+1;
 if(def.id===1)f.flags.squirrel_saved=true;
 return {ok:true,turn:true,message:messages.join(' · ')||'Событие завершено',messages:messages};
}
function onKill(run,enemy,api){
 if(!enemy||!enemy.forestTask)return null;
 var f=ensure(run),task=f.battles[enemy.forestTask];
 if(!task||task.finished)return null;
 task.remaining=Math.max(0,task.remaining-1);
 if(task.remaining)return 'Осталось противников: '+task.remaining;
 task.finished=true;
 var sceneId=task.scene,original=run.tiles.find(function(x){return x.id===task.origin;});
 if(sceneId===1&&original){original.forestPhase='reward';return 'Три волка повержены. Вернитесь к Рыжухе за обещанной лесной монеткой.';}
 if(task.alpha){
  f.hunts[task.creature].completed=true;
  f.pendingTrophies[task.creature]=true;
  return 'Вожак побеждён! Трофей записан в книгу и закрепится при безопасном возвращении на базу.';
 }
 var reward={
  trap:'gold:20;potion:1',tracks:'flag:wolf_tracks;material:Волчья шкура:1',herbalist:'flag:herbalist_saved;item:healing_salve:2',burrow:'gold:14;material:Дикий корень:1',
  boar_path:'gold:24;material:Кабаний клык:1',cocoon:'item:spore:1;shield:7',fungal:'material:Грибная эссенция:2;scroll:3'
 }[task.reward]||'gold:14';
 var msgs=apply(run,reward.split(';'),api);
 return 'Засада отбита: '+msgs.join(' · ');
}
function safeReturn(run,meta,book){
 var f=ensure(run),count=0;
 Object.keys(f.pendingTrophies).forEach(function(k){
  if(trophyMap[k]&&book.grantTrophy(meta,trophyMap[k]))count++;
 });
 f.pendingTrophies={};
 if(window.CryptForestRework)window.CryptForestRework.homeReturn(run,meta);
 return count;
}
function inventory(run){
 var f=ensure(run);
 return Object.keys(f.items).filter(function(k){return f.items[k]>0;}).map(function(k){
  var info=itemDefs[k]||[k,'F02_001'];
  return '<div class="forest-pocket-row">'+image(info[1],'forest-pocket-icon')+'<span><b>'+e(info[0])+'</b><small>×'+f.items[k]+'</small></span>'+
    (['bleed_trap','stun_trap','honey','mushroom','water'].indexOf(k)>=0||(window.CryptForestRework&&window.CryptForestRework.itemUsedDescription(k))?
    '<button class="btn small" data-action="active-item-info" data-id="forest:'+e(k)+'">Описание / использовать</button>':'')+'</div>';
 }).join('')||'<p class="fine muted">Лесные находки ещё не собраны.</p>';
}
function use(run,id,api){
 var f=ensure(run);if(!itemDefs[id]||!f.items[id])return {ok:false,message:'Предмет закончился'};
 if(window.CryptForestRework&&window.CryptForestRework.itemUsedDescription(id))return window.CryptForestRework.use(run,id,api);
 var foe=api.target();
 if(id==='bleed_trap'||id==='stun_trap'){
  if(!foe)return {ok:false,message:'Сначала обнаружьте врага'};
  if(id==='bleed_trap'){foe.foe.bleed=Math.max(foe.foe.bleed||0,3);foe.foe.stun=Math.max(foe.foe.stun||0,1);}
  else foe.foe.stun=Math.max(foe.foe.stun||0,3);
 }else if(id==='honey')run.hp=Math.min(api.stats().hp,run.hp+24);
 else if(id==='mushroom')run.hp=Math.min(api.stats().hp,run.hp+14);
 else if(id==='water'){run.poisonTurns=0;run.bleedTurns=0;run.hp=Math.min(api.stats().hp,run.hp+8);}
 else return {ok:false,message:'Этот предмет применяется в другом событии'};
 f.items[id]--;
 return {ok:true,message:itemDefs[id][0]+' использован',turn:true};
}
window.CryptForestEvents={scenes:scenes,scene:scene,ensure:ensure,has:has,pick:pickScene,image:image,render:render,choose:choose,onKill:onKill,safeReturn:safeReturn,inventory:inventory,use:use,itemDefs:itemDefs,requirementText:requirementText};

})();
