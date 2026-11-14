/* Kamienistoe Nagorie: 50 executable encounters, reusable terrain and persistent special machines.
 * Unique state persists. Ordinary floors, foes, loot and random encounters regenerate on return.
 */
(function(){'use strict';
var C=window.CryptRidgeCatalog||[],CM=window.CryptMining,ORE={iron:'Железная руда',steel:'Стальная руда',quartz:'Кварцевая руда',rune:'Рунная руда'};
var UNIQUE={
 miner_bag:{name:'Сумка шахтёра',slot:'armor',hp:15,def:-2,mineExtra:20,icon:'🎒',trait:'+20% шанс дополнительной руды; жертвует бронёй'},
 collapse_gloves:{name:'Рукавицы обвальщика',slot:'gloves',atk:3,mineInstant:12,icon:'🧤',trait:'+12% шанс мгновенно расколоть жилу'},
 quartz_bracers:{name:'Кварцевые наручи',slot:'bracer',def:2,critDamage:10,icon:'💎',trait:'+10% критического урона при кирке'},
 climber_boots:{name:'Сапоги скалолаза',slot:'boots',dodge:4,trapReduce:25,icon:'🥾',trait:'Уменьшают урон капканов на 25%'},
 artel_helm:{name:'Шлем старшей артели',slot:'helm',def:2,hp:10,icon:'⛑',trait:'Защита старшей артели'},
 guard_cloak:{name:'Плащ заставы',slot:'cloak',def:2,hp:5,firstHit:25,icon:'🧥',trait:'Первый удар каждого врага ослаблен на 25%'},
 collector_ring:{name:'Кольцо сборщика',slot:'ring',crit:3,gold:10,icon:'💍',trait:'+10% золота с врагов'},
 master_seal:{name:'Печать рудничного мастера',slot:'amulet',hp:12,crit:3,icon:'✥',trait:'Древняя печать начальника шахты'},
 stone_amulet:{name:'Каменный оберег',slot:'amulet',def:2,hp:20,icon:'🔰',trait:'Сердце пробуждённого стража'},
 depth_armor:{name:'Панцирь глубин',slot:'armor',def:4,hp:25,icon:'🛡',trait:'Крепче обычного нагрудника'},
 stonebreaker_ring:{name:'Кольцо камнелома',slot:'ring',crit:5,atk:3,icon:'💍',trait:'Усиливает удары киркой'},
 giant_ring:{name:'Кольцо великана',slot:'ring',def:3,atk:2,icon:'💍',trait:'Бой с бронированными противниками'},
 elder_ring:{name:'Кольцо старшего рудокопа',slot:'ring',hp:12,crit:4,mineExtra:5,icon:'💍',trait:'+5% шанс дополнительной руды'},
 hollow_helm:{name:'Проклятый пустой шлем',slot:'helm',def:4,hp:6,cursed:5,icon:'⛑',trait:'Проклят: −5 HP при каждом спуске на этаж'},
 clean_helm:{name:'Шлем очищенного стража',slot:'helm',def:3,hp:12,icon:'⛑',trait:'Очищенный древний шлем'},
 pass_amulet:{name:'Оберег хранителя перевала',slot:'amulet',def:3,hp:15,icon:'🔰',trait:'Печать, сдерживающая болотный туман'},
 mountain_heart:{name:'Сердечник древней горы',slot:'ring',def:4,mineExtra:15,icon:'💠',trait:'+5% урона киркой, +15% дополнительной руды'}
};
var ITEMS={
 rail_key:['Ключ путевой стрелки','Однократно ускоряет раскопку последнего тоннеля.'],
 repair_parts:['Механическая деталь','Материал для восстановления оборудования.'],
 miner_token:['Жетон старшей артели','Открывает доступ к складам и особым разговорам.'],
 lens:['Геологическая линза','Позволяет выбрать особые решения в рудных событиях.'],
 slime_mark:['След кварцевого слизня','Позволяет найти оставленную слизнем руду.'],
 soot_tag:['Ошейник Копоти','Кот сопровождает героя и помогает с добычей.'],
 drill_charge:['Буровой заряд','Мгновенно разбивает следующую жилу, но расходует ход.'],
 collapse_charge:['Обвальный заряд','Усиливает следующий физический удар и пробивает броню.'],
 emergency_fuse:['Аварийный предохранитель','Мгновенно останавливает грохочущий бур без потерь.'],
 strong_rope:['Прочная шахтная верёвка','Используется в сюжетных препятствиях.'],
 miner_ration:['Шахтёрский паёк','Восстанавливает часть здоровья и даёт защиту.'],
 healing_salt:['Солевой компресс','Лечит и снимает кровотечение.'],
 recovery_crystal:['Кристалл восстановления','Полностью восстанавливает здоровье и ману.'],
 shock_wedge:['Пружинный удар','Следующий физический удар наносит +30% урона.'],
 mirror_chisel:['Зеркальный резец','Следующая добытая жила даёт дополнительную руду.'],
 mirror_shard:['Зеркальный осколок','Следующий физический удар повторяется без контратаки.'],
 guardian_seal:['Печать стража','Даёт +45 щита перед опасным противником.'],
 bell_fragment:['Колокольный осколок','Оглушает обнаруженных обычных противников на один ход.'],
 armor_wedge:['Бронебойный клин','Следующий физический удар игнорирует броню.'],
 troll_tip:['Троллебойный наконечник','Следующий удар по боссу усилен на 50%.'],
 rune_accumulator:['Рунный аккумулятор','Восстанавливает 45 маны.'],
 bog_ward:['Оберег от болотного тумана','Нейтрализует яд и создаёт защиту.'],
 sorting_plan:['Чертёж вибросита','Используется в развитии шахтного двора.'],
 lift_plan:['Чертёж подъёмника','Необходим для восстановления лифта.'],
 healer_letter:['Письмо лекаря','Нужно для поиска его ученика.'],
 debt_ledger:['Долговая книга','Доказательство преступлений Кальта.'],
 artel_order:['Указ артели','Защитный документ освобождённых шахтёров.'],
 treasury_password:['Пароль казначейства','Открывает один из замков разбойников.'],
 drill_coolant:['Охлаждающая смесь','Уменьшает опасность буровой установки.'],
 keeper_testament:['Свидетельство хранителя','Память о связи горы и болот.']
};
var USE={
 drill_charge:1,collapse_charge:1,emergency_fuse:1,miner_ration:1,healing_salt:1,recovery_crystal:1,
 shock_wedge:1,mirror_chisel:1,mirror_shard:1,guardian_seal:1,bell_fragment:1,armor_wedge:1,
 troll_tip:1,rune_accumulator:1,bog_ward:1,drill_coolant:1
};
function active(r){return !!r&&r.actIndex===0&&r.locationIndex===1;}
function ensure(r){
 if(!r.ridge||typeof r.ridge!=='object')r.ridge={};
 var x=r.ridge;
 if(!x.flags)x.flags={};if(!x.items)x.items={};if(!x.seen)x.seen={};if(!x.unique)x.unique={};
 if(!x.battles)x.battles={};if(!x.buffs)x.buffs=[];if(!x.pendingHome)x.pendingHome={};
 if(!x.shaft){
  var base=11+Math.floor(Math.random()*8);
  x.shaft={base:base,first:0,middle:0,last:0,jumped:false};
 }
 if(!x.bur){
  var floor=9+Math.floor(Math.random()*8);
  if(floor===x.shaft.base)floor=9;
  x.bur={floor:floor,status:'unseen',startFloor:0,completed:0,pending:0,pendingFloor:0,done:{}};
 }
 return x;
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function list(str){return (str||'').split(';').map(function(s){return s.trim();}).filter(Boolean);}
function costsOk(r,str){var x=ensure(r);
 for(var part of list(str)){var p=part.split(':'),n=Number(p[2]||1);
  if(p[0]==='ore'&&(r.materials[ORE[p[1]]]||0)<n)return false;
  if(p[0]==='gold'&&r.gold<Number(p[1]))return false;
  if(p[0]==='i'&&(x.items[p[1]]||0)<n)return false;
 }
 return true;
}
function meets(r,need){if(!need)return true;var x=ensure(r),p=need.split(':'),name=p[1];
 if(p[0]==='f')return !!x.flags[name];
 if(p[0]==='i')return (x.items[name]||0)>=Number(p[2]||1);
 if(p[0]==='g')return !!x.unique[name]||(r.items||[]).some(function(it){return it.ridgeUniqueId===name;});
 if(p[0]==='l')return CM.ensure(r).level>=Number(name);
 if(p[0]==='b')return x.bur.status===name;
 return false;
}
function pay(r,str){var x=ensure(r);
 for(var part of list(str)){var p=part.split(':'),n=Number(p[2]||1);
  if(p[0]==='ore')r.materials[ORE[p[1]]]-=n;
  else if(p[0]==='gold')r.gold-=Number(p[1]);
  else if(p[0]==='i'){x.items[p[1]]-=n;if(x.items[p[1]]<=0)delete x.items[p[1]];}
 }
}
function giveGear(r,id,api){
 var x=ensure(r),def=UNIQUE[id];if(!def)return 'Неизвестное снаряжение';
 if(x.unique[id]||(r.items||[]).some(function(it){return it.ridgeUniqueId===id;}))return 'Уникальное снаряжение уже получено';
 var it=api.addItem(def.slot,3);
 if(!it)return 'Нет места для снаряжения';
 it.name=def.name;it.rarity=4;it.setId=null;it.setName=null;it.ridgeUniqueId=id;it.trait=def.trait;it.atk=def.atk||0;it.def=def.def||0;
 it.hp=def.hp||0;it.mp=def.mp||0;it.pow=0;it.crit=def.crit||0;it.ridgeSpecial=true;
 x.unique[id]=true;return 'Уникальный предмет: '+it.name;
}
function gearBonus(r,key){
 if(!r||!r.equip)return 0;
 return Object.keys(r.equip).reduce(function(sum,slot){
  var it=(r.items||[]).find(function(y){return y.id===r.equip[slot];});
  if(!it||!it.ridgeUniqueId)return sum;
  var def=UNIQUE[it.ridgeUniqueId]||{};
  var value=def[key]||0;
  if(it.ridgeUniqueId==='miner_bag'&&key==='mineExtra'&&ensure(r).flags.bag_masterwork)value=25;
  if(it.ridgeUniqueId==='miner_bag'&&key==='def'&&ensure(r).flags.bag_masterwork)value=0;
  return sum+value;
 },0);
}
function effects(r,ops,api){
 var x=ensure(r),log=[];
 for(var part of list(ops)){
  var p=part.split(':'),v=p[1],n=Number(p[2]||1);
  if(p[0]==='ore'){var name=ORE[v];if(name){r.materials[name]=(r.materials[name]||0)+n;log.push(name+' ×'+n);}}
  else if(p[0]==='gold'){r.gold+=Number(v);log.push('Золото +'+v);}
  else if(p[0]==='item'){x.items[v]=(x.items[v]||0)+n;log.push((ITEMS[v]||[v])[0]+' ×'+n);}
  else if(p[0]==='flag'){
   x.flags[v]=true;
   if(v==='hollow_purified'){
    var helm=(r.items||[]).find(function(it){return it.ridgeUniqueId==='hollow_helm';});
    if(helm){helm.ridgeUniqueId='clean_helm';helm.name=UNIQUE.clean_helm.name;helm.def=UNIQUE.clean_helm.def;helm.hp=UNIQUE.clean_helm.hp;helm.trait=UNIQUE.clean_helm.trait;x.unique.clean_helm=true;}
   }
   log.push('Новое решение в истории: '+v);
  }
  else if(p[0]==='gear'){log.push(giveGear(r,v,api));}
  else if(p[0]==='stat'){
   if(v==='crit')x.crit=(x.crit||0)+n;
   else{var w=r.forestWellStats||(r.forestWellStats={});w[v]=(w[v]||0)+n;if(v==='hp')r.hp+=n;if(v==='mp')r.mp+=n;}
   log.push('До конца экспедиции: '+v+' +'+n);
  }else if(p[0]==='heal'){r.hp=Math.min(api.stats().hp,r.hp+Number(v));log.push('HP восстановлено');}
  else if(p[0]==='mana'){r.mp=Math.min(api.stats().mp,r.mp+Number(v));log.push('Мана восстановлена');}
  else if(p[0]==='shield'){r.shield+=Number(v);log.push('Щит +'+v);}
  else if(p[0]==='buff'){x.buffs.push({kind:v,left:Number(p[2]||1),value:Number(p[3]||1)});log.push('Усиление добычи на '+p[2]+' жил');}
  else if(p[0]==='mineXP'){CM.gainXP(r,Number(v));log.push('Опыт кирки +'+v);}
  else if(p[0]==='talent'){
   var m=CM.ensure(r),current=CM.nodeLevel(r,v);
   if(current>0&&current<5){m.nodes[v]=current+1;log.push('Паутинка: '+v+' +1 ранг');}
   else {r.materials[ORE.steel]=(r.materials[ORE.steel]||0)+2;log.push('Испытание заменено двумя стальными рудами');}
  }else if(p[0]==='home'){
   if(v==='transfer'){var left=20,amount=0,storage=api.homeStorage();for(var id of ['rune','quartz','steel','iron']){var k=ORE[id],take=Math.min(left,r.materials[k]||0);if(take>0){r.materials[k]-=take;storage[k]=(storage[k]||0)+take;amount+=take;left-=take;}}log.push('На базу отправлено руды: '+amount);}
   else{x.pendingHome[v]=true;log.push('Открыто улучшение для деревни: '+v);}
  }
 }
 return log.join(' · ');
}
function floorSpecials(r){
 if(!active(r))return [];var x=ensure(r),arr=[];
 if(r.floor===x.shaft.base)arr.push(1);
 if(r.floor===x.shaft.base+10)arr.push(11);
 if(r.floor===x.shaft.base+20)arr.push(21);
 if(r.floor===x.bur.floor&&x.bur.status==='unseen')arr.push(12);
 return arr;
}
function scene(r,id){return C.find(function(x){return x.id===Number(id);})||null;}
function chainPriority(r){
 if(!active(r))return null;
 var x=ensure(r),links=[
  ['dorn_saved',4],['healer_quest',24],['lift_fixed',22],['workers_saved',30],
  ['debt_ledger',30],['ilva_helped',40],['soul_freed',41],['workers_saved',48]
 ];
 for(var link of links){
  var ready=link[0]==='debt_ledger'?(x.items.debt_ledger||0)>0:!!x.flags[link[0]];
  var e=scene(r,link[1]);if(ready&&e&&r.floor>=e.min&&!x.seen[e.id])return e.id;
 }
 return null;
}
function pick(r,exclude){
 if(!active(r))return null;
 var x=ensure(r),pool=C.filter(function(e){
  return e.id!==1&&e.id!==11&&e.id!==12&&e.id!==21&&r.floor>=e.min&&!((exclude||[]).includes(e.id))&&(e.repeat||!x.seen[e.id]);
 });if(!pool.length)return null;
 var priority=chainPriority(r);if(priority&&pool.some(function(e){return e.id===priority;}))return priority;
 var pending=pool.filter(function(e){return !e.repeat&&e.choices.some(function(c){return meets(r,c.need);});});
 if(pending.length&&Math.random()<.88)pool=pending;
 else if(Math.random()<.75){var novel=pool.filter(function(e){return !x.seen[e.id];});if(novel.length)pool=novel;}
 return pool[Math.floor(Math.random()*pool.length)].id;
}
function shaftOptions(r,id){
 var x=ensure(r),s=x.shaft,out=[],hold=function(label,command){out.push({label:label,cost:'',reward:command});};
 if(id===1){
  if(s.first<3)hold('Раскопать первый вход · '+s.first+'/3','shaft:first');
  else hold('Осмотреть: следующий тоннель обрушен','shaft:inspect');
  if(!ensure(r).flags.railInspected)hold('Осмотреть старую путевую стрелку','shaft:rail');
 }else if(id===11){
  if(s.first===3)hold('По открытому тоннелю назад на 10 этажей','shaft:back');
  if(s.middle<3)hold('Раскопать дальний завал · '+s.middle+'/3','shaft:middle');
  else hold('Осмотреть готовый проход','shaft:inspect');
 }else if(id===21){
  if(s.middle>=3&&s.last<3)hold('Раскопать последний вход · '+s.last+'/3','shaft:last');
  if(s.middle>=3&&s.last>=3&&!s.jumped)hold('Сквозной ход: сразу на 20 этажей вперёд','shaft:jump');
  if(s.middle<3)hold('Изучить завал: нужен второй вход','shaft:inspect');
  if(s.jumped)hold('Осмотреть использованный тоннель','shaft:inspect');
 }
 out.push({label:'Оставить проход',cost:'',reward:'leave'});return out;
}
function burOptions(r){
 var x=ensure(r),b=x.bur;
 return [{label:'Запустить Грохочущий бур',cost:'',reward:'bur:start'},
 {label:'Разобрать на запасные детали',cost:'',reward:'item:repair_parts:4;ore:steel:2;bur:salvage'},
 {label:'Оставить бур нетронутым',cost:'',reward:'leave'}].filter(function(y){return b.status==='unseen'||y.reward==='leave';});
}
function options(r,id){return [1,11,21].includes(id)?shaftOptions(r,id):id===12?burOptions(r):scene(r,id).choices;}
function render(r,t){
 var def=scene(r,t.t1Id);if(!def)return '';
 var x=ensure(r),opts=options(r,def.id);
 var info=def.id===1?'Первый вход зафиксирован на этаже '+x.shaft.base+'.':
 def.id===11?'Второй вход зафиксирован на этаже '+(x.shaft.base+10)+'.':
 def.id===21?'Третий вход зафиксирован на этаже '+(x.shaft.base+20)+'.':
 def.id===12?'Бур встретится лишь один раз в этой экспедиции.':'';
 return '<div class="forest-event-dialog t1-scene"><div class="sheet-kicker">КАМЕНИСТОЕ НАГОРЬЕ · НАХОДКА '+String(def.id).padStart(2,'0')+'/50</div><h2>'+esc(def.title)+'</h2><div class="t1-scene-emblem ridge">⛰</div>'+
 '<p>'+esc(def.text)+'</p>'+(info?'<p class="fine golden">'+esc(info)+'</p>':'')+
 opts.map(function(c,i){var disabled=!meets(r,c.need)||!costsOk(r,c.cost);
  var reason=!meets(r,c.need)?' (не выполнено условие)':!costsOk(r,c.cost)?' (не хватает материалов)':'';
  return '<button class="btn wide space-top'+(i?' alt':'')+'" data-action="t1-choice" data-id="'+t.id+':'+i+'"'+(disabled?' disabled':'')+'>'+esc(c.label+reason)+'</button>';
 }).join('')+'<button class="btn dark wide space-top" data-action="close">Закрыть</button></div>';
}
function chooseShaft(r,id,c){
 var sh=ensure(r).shaft,cmd=c.reward.split(':')[1];
 if(cmd==='rail'){var x=ensure(r);if(x.flags.railInspected)return {ok:true,turn:false,keep:true,message:'Стрелка уже исследована'};
  x.flags.railInspected=true;x.items.rail_key=1;return {ok:true,turn:true,keep:true,message:'Получен ключ путевой стрелки. Дальняя часть тоннеля обвалилась.'};}
 if(cmd==='inspect')return {ok:true,turn:false,keep:true,message:'Этот участок тоннеля уже разобран. Дальнейший путь завален.'};
 if(cmd==='back'){
  if(sh.first<3)return {ok:false,message:'Сначала нужно раскопать первый вход'};
  return {ok:true,turn:true,navigate:-10,message:'Возврат через штольню на 10 этажей назад.'};
 }
 if(cmd==='jump'){
  if(sh.middle<3||sh.last<3||sh.jumped)return {ok:false,message:'Сквозной проход недоступен'};
  sh.jumped=true;return {ok:true,turn:true,navigate:20,message:'Сквозная штольня переносит на двадцать этажей вперёд.'};
 }
 if(!['first','middle','last'].includes(cmd))return {ok:false,message:'Неизвестный проход'};
 if(cmd==='middle'&&sh.first<3)return {ok:false,message:'Первый вход ещё не раскопан'};
 if(cmd==='last'&&sh.middle<3)return {ok:false,message:'Второй вход ещё не раскопан'};
 if(sh[cmd]>=3)return {ok:true,turn:false,keep:true,message:'Завал уже разобран'};
 if(cmd==='last'&&sh[cmd]===1&&ensure(r).items.rail_key){delete ensure(r).items.rail_key;sh[cmd]++;}
 sh[cmd]++;
 if(cmd==='last'&&sh[cmd]===3&&ensure(r).items.rail_key){sh[cmd]=3;}
 return {ok:true,turn:true,keep:true,message:'Кирка разбирает завал: '+sh[cmd]+'/3. '+(sh[cmd]===3?'Проход открыт.':'Нужно продолжить раскопки.')};
}
function chooseBur(r,c){
 var x=ensure(r),b=x.bur,op=c.reward;
 if(op==='leave')return {ok:true,leave:true};
 if(b.status!=='unseen')return {ok:false,message:'Механизм уже использован в этом походе'};
 if(op==='bur:start'){b.status='active';b.startFloor=r.floor;b.completed=0;b.done={};return {ok:true,turn:true,keep:false,message:'Бур включён. На следующих этажах он привлечёт эфирных элитников.'};}
 if(op.includes('bur:salvage')){b.status='salvaged';var message=effects(r,'item:repair_parts:4;ore:steel:2',{});return {ok:true,turn:true,message:message};}
 return {ok:false,message:'Нельзя использовать механизм'};
}
function choose(r,t,index,api){
 if(!active(r)||!t||!t.revealed||t.kind!=='t1-event')return {ok:false,message:'Нет события'};
 var id=Number(t.t1Id),def=scene(r,id),choice=options(r,id)[index];if(!choice)return {ok:false,message:'Неверный выбор'};
 if(choice.reward==='leave')return {ok:true,leave:true,turn:false};
 if(!meets(r,choice.need)||!costsOk(r,choice.cost))return {ok:false,message:'Не выполнено условие или недостаточно материалов'};
 if([1,11,21].includes(id))return chooseShaft(r,id,choice);
 if(id!==12&&![1,11,21].includes(id)&&!def.repeat&&ensure(r).seen[id])return {ok:false,message:'Уникальное событие уже завершено'};
 if(id===12){var choiceResult=chooseBur(r,choice);
  if(choiceResult.ok&&!choiceResult.leave){t.cleared=true;ensure(r).seen[12]=true;}
  return choiceResult;
 }
 var x=ensure(r),ops=list(choice.reward),fight=ops.find(function(e){return e.startsWith('fight:');});
 if(id===26&&ops.includes('ore:rune:1')&&x.flags.marketRune)return {ok:false,message:'Редкая руда уже куплена на этом рынке в этой экспедиции'};
 if(id===45&&ops.includes('home:transfer')&&!['iron','steel','quartz','rune'].some(function(k){return (r.materials[ORE[k]]||0)>0;}))return {ok:false,message:'Нужна хотя бы одна руда для отправки'};
 if(fight){
  var p=fight.split(':'),task='ridge:'+r.floor+':'+t.id+':'+id;
  if(x.battles[task]&&x.battles[task].remaining)return {ok:false,message:'Сначала завершите бой'};
  if(api.spawn(p[1],Number(p[2]||1),task)!==Number(p[2]||1))return {ok:false,message:'Нет мест для врагов'};
  pay(r,choice.cost);x.battles[task]={remaining:Number(p[2]||1),reward:ops.filter(function(q){return q!==fight;}).join(';')};
  t.cleared=true;if(!def.repeat)x.seen[id]=true;
  return {ok:true,turn:true,combat:true,message:'Противники события «'+def.title+'» появились на поле.'};
 }
 pay(r,choice.cost);
 var filtered=ops.filter(function(q){return !q.startsWith('bur:');}).join(';');
 var message=effects(r,filtered,api);
 if(id===13&&ops.some(function(q){return q==='bur:overload';})){
  x.bur.status='stopped';r.materials[ORE.quartz]=(r.materials[ORE.quartz]||0)+3;
  message+=' · Бур перегружен и остановлен: +3 кварцевой руды';
 }
 if(id===26&&ops.includes('ore:rune:1'))x.flags.marketRune=true;
 if(!def.repeat)x.seen[id]=true;
 t.cleared=true;return {ok:true,turn:true,message:message||'Событие завершено'};
}
function onKill(r,e,api){
 if(!active(r)||!e||!e.t1Task||e.t1Task.indexOf('ridge:')!==0)return '';
 var x=ensure(r),b=x.battles[e.t1Task];if(!b||b.remaining<=0)return '';
 b.remaining--;if(b.remaining)return 'Врагов в событии осталось: '+b.remaining;
 var result=effects(r,b.reward,api);delete x.battles[e.t1Task];
 return 'Событие завершено: '+(result||'все враги побеждены');
}
function onFloorTransition(r,to){
 if(!active(r))return;var x=ensure(r),b=x.bur;
 if(to<r.floor&&b.status==='active')b.status='lost';
}
function eliteCount(r){
 if(!active(r))return 0;var b=ensure(r).bur;
 if(b.status!=='active'||r.floor<=b.startFloor||b.done[r.floor])return 0;
 return b.completed<3?1:2;
}
function beginEliteFloor(r,count){if(!active(r)||count<1)return;var b=ensure(r).bur;b.pending=count;b.pendingFloor=r.floor;}
function onEtherealKill(r){
 var b=ensure(r).bur;if(b.pendingFloor!==r.floor||b.pending<=0)return '';
 b.pending--;if(b.pending)return 'Эфирный элитник рассеялся. Осталось: '+b.pending;
 if(b.done[r.floor])return '';
 b.done[r.floor]=true;b.completed++;var n=b.completed,award={iron:0,steel:0,quartz:0,rune:0};
 if(n<=3){award.iron=3;award.steel=1;}
 else if(n<=6){award.iron=3;award.steel=3;}
 else if(n<=10){award.steel=3;award.quartz=2;}
 else if(n<=15){award.steel=4;award.quartz=3;if(Math.random()<.15)award.rune=1;}
 else{award.quartz=3;award.rune=1;}
 var parts=[];for(var id in award)if(award[id]>0){var name=ORE[id];r.materials[name]=(r.materials[name]||0)+award[id];parts.push(name+' ×'+award[id]);}
 return 'Грохочущий бур: эфирные стражи побеждены. Добыча: '+parts.join(', ');
}
function stopBur(r){var b=ensure(r).bur;if(b.status!=='active')return false;b.status='stopped';return true;}
function homeRewards(r,meta){
 if(!active(r))return [];
 var x=ensure(r),arr=[],home=meta.ridgePerks||(meta.ridgePerks={});
 for(var id of Object.keys(x.pendingHome)){if(!x.pendingHome[id])continue;
  if(!home[id]){home[id]=true;arr.push(id);}
  x.pendingHome[id]=false;
 }
 return arr;
}
function mineBonuses(r){if(!active(r))return {extra:0,rare:0,instant:0,extraQty:0};
 var x=ensure(r),b={extra:gearBonus(r,'mineExtra'),rare:0,instant:gearBonus(r,'mineInstant'),extraQty:0};
 var perks=x.perks||{};
 if(perks.troll_horn)b.extra+=5;
 if(perks.vibrosieve)b.extra+=10;
 if(perks.heart_of_mountain)b.rare+=5;
 (x.buffs||[]).filter(function(y){return y.left>0;}).forEach(function(y){if(y.kind==='rare')b.rare+=y.value;if(y.kind==='extra')b.extraQty+=y.value;});
 if(x.flags.soot_companion)b.extra+=6;
 b.extraQty+=(x.nextVeinBonus||0);
 return b;
}
function mined(r){
 if(!active(r))return;var x=ensure(r);
 x.totalMines=(x.totalMines||0)+1;
 if(x.perks&&x.perks.artel&&x.totalMines%3===0){r.materials[ORE.iron]=(r.materials[ORE.iron]||0)+1;}
 x.buffs=x.buffs.filter(function(y){if(y.left>0)y.left--;return y.left>0;});
 if(x.nextVeinBonus>0)x.nextVeinBonus--;
}
function inventory(r){if(!active(r))return [];var x=ensure(r);
 return Object.keys(x.items).filter(function(k){return x.items[k]>0;}).map(function(id){return {id:id,name:(ITEMS[id]||[id])[0],description:(ITEMS[id]||['', ''])[1],qty:x.items[id],usable:!!USE[id]};});
}
function useItem(r,id){
 var x=ensure(r);if(!USE[id]||!x.items[id])return {ok:false,message:'Предмет закончился'};
 if(id==='emergency_fuse'&&x.bur.status!=='active')return {ok:false,message:'Бур уже остановлен'};
 x.items[id]--;if(!x.items[id])delete x.items[id];
 var st=null;
 if(id==='healing_salt'){r.hp+=25;r.bleedTurns=0;}
 else if(id==='recovery_crystal'){r.hp+=10000;r.mp+=10000;}
 else if(id==='miner_ration'){r.hp+=20;r.shield+=10;}
 else if(id==='guardian_seal'){r.shield+=45;}
 else if(id==='bell_fragment'){(r.tiles||[]).forEach(function(t){if(t.foe&&!t.foe.boss&&t.foe.hp>0)t.foe.stun=Math.max(t.foe.stun||0,1);});}
 else if(id==='mirror_chisel')x.nextVeinBonus=(x.nextVeinBonus||0)+1;
 else if(id==='shock_wedge')x.nextStrike=(x.nextStrike||0)+30;
 else if(id==='mirror_shard')x.echo=(x.echo||0)+1;
 else if(id==='collapse_charge')x.nextStrike=(x.nextStrike||0)+45;
 else if(id==='armor_wedge')x.ignoreArmor=(x.ignoreArmor||0)+1;
 else if(id==='troll_tip')x.bossStrike=(x.bossStrike||0)+50;
 else if(id==='drill_charge')x.instantOre=(x.instantOre||0)+1;
 else if(id==='rune_accumulator')r.mp+=45;
 else if(id==='bog_ward'){r.poisonTurns=0;r.shield+=25;}
 else if(id==='drill_coolant'){if(x.bur.status==='active')x.bur.coolant=(x.bur.coolant||0)+1;else r.shield+=20;}
 else if(id==='emergency_fuse')stopBur(r);
 return {ok:true,message:(ITEMS[id]||[id])[0]+' использован'};
}
function strikeBonuses(r,enemy){
 if(!active(r))return {extra:0,ignoreArmor:false,echo:false};
 var x=ensure(r),amp=x.nextStrike||0;if(amp)x.nextStrike=0;
 var ignore=x.ignoreArmor>0;if(ignore)x.ignoreArmor--;
 var echo=x.echo>0;if(echo)x.echo--;
 if(enemy&&enemy.boss&&x.bossStrike>0){amp+=x.bossStrike;x.bossStrike=0;}
 return {extra:amp,ignoreArmor:ignore,echo:echo};
}
function itemDetails(r,id){
 var x=ensure(r),item=ITEMS[id];
 if(!item||!x.items[id]||!USE[id])return null;
 return {name:item[0],description:item[1]+' Расходует 1 ход.',qty:x.items[id],action:'ridge-use',id:id};
}
function resetForLocation(r){if(!r||!r.ridge)return;ensure(r).bur.status=ensure(r).bur.status==='active'?'lost':ensure(r).bur.status;}
window.CryptRidgeEvents={catalog:C,active:active,ensure:ensure,scene:scene,pick:pick,chainPriority:chainPriority,floorSpecials:floorSpecials,
 render:render,choose:choose,onKill:onKill,onFloorTransition:onFloorTransition,eliteCount:eliteCount,
 beginEliteFloor:beginEliteFloor,onEtherealKill:onEtherealKill,stopBur:stopBur,homeRewards:homeRewards,
 gearBonus:gearBonus,UNIQUE:UNIQUE,mineBonuses:mineBonuses,mined:mined,inventory:inventory,
 useItem:useItem,itemDetails:itemDetails,strikeBonuses:strikeBonuses,resetForLocation:resetForLocation};
})();