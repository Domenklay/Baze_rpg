/* Hunter's Bestiary: permanent first-act companion with cumulative creature study.
 * Existing elite kills are deliberately NOT treated as trophy-hunt victories. */
(function(){'use strict';
var thresholds=[5,10,20,40];
var beasts=[
 {id:'r1_0',name:'Лесной волк',kind:'Зверь',effect:'atk',increments:[1,2,3,5],label:'атаки',desc:'Стравленные в стаи волки всё чаще нападают на путников. Изучение повадок помогает находить слабые места врага.',sign:'🐺'},
 {id:'r1_2',name:'Чернолапая лисица',kind:'Зверь',effect:'dodge',increments:[1,1,1,1],label:'% уклонения',desc:'Проворная лесная охотница умеет исчезать в кустарнике за считанные мгновения.',sign:'🦊'},
 {id:'r1_4',name:'Бешеный заяц',kind:'Зверь',effect:'trapReduce',increments:[3,3,4,4],label:'% защиты от ловушек',desc:'Даже маленькие лесные звери стали агрессивными. Наблюдение учит замечать опасные движения.',sign:'🐇'},
 {id:'r1_6',name:'Белка-воришка',kind:'Зверь',effect:'chestGold',increments:[2,2,2,2],label:'% золота из находок',desc:'Белки прячут чужие сокровища в корнях деревьев и забытых дуплах.',sign:'🐿'},
 {id:'r1_8',name:'Жук-короед',kind:'Насекомое',effect:'def',increments:[1,1,1,2],label:'защиты',desc:'Твёрдый панцирь короеда напоминает, что даже слабую броню можно укрепить.',sign:'🪲'},
 {id:'r1_10',name:'Рой лесных пчёл',kind:'Насекомые',effect:'poisonResist',increments:[3,5,5,7],label:'% защиты от яда',desc:'Лесные пчёлы стали раздражительными и ядовитыми. Их повадки подсказывают способ противостоять отравлению.',sign:'✺'},
 {id:'r1_12',name:'Лесной слизень',kind:'Слизень',effect:'manaFloor',increments:[1,1,1,1],label:'MP при спуске',desc:'Медленное существо удерживает остатки природной магии в своём вязком теле.',sign:'◕'},
 {id:'r1_14',name:'Споровый пухляк',kind:'Грибница',effect:'poisonChance',increments:[1,1,2,2],label:'% шанса отравления',desc:'При повреждении выпускает облако едких спор.',sign:'✿'},
 {id:'r1_16',name:'Оживший корешок',kind:'Растение',effect:'shieldFloor',increments:[2,2,2,2],label:'щита при спуске',desc:'Подвижные корни защищают себя и соседние растения от незваных гостей.',sign:'♣'},
 {id:'r1_18',name:'Древесный бесёнок',kind:'Лесной дух',effect:'pow',increments:[1,1,1,2],label:'магической мощи',desc:'Бесёнки собирают энергию деревьев и могут усиливать друг друга.',sign:'♠'}
];
var trophies=[
 {id:'wolf',name:'Клык альфа-волка',ability:'Воодушевление',desc:'+10% атаки герою и призванным союзникам',symbol:'♜'},
 {id:'boar',name:'Клык секача',ability:'Живучесть зверя',desc:'+8% максимального здоровья герою и призванным',symbol:'♢'},
 {id:'beetle',name:'Маточная пластина',ability:'Хитиновый покров',desc:'+2 защиты герою и призванным',symbol:'◈'},
 {id:'root',name:'Духовная сердцевина корня',ability:'Живая кора',desc:'Защитный щит в начале боя',symbol:'❦'},
 {id:'grove',name:'Знак рощи',ability:'Благословение рощи',desc:'Усиление лечения и восстановления',symbol:'✥'}
];
var statNames={atk:'Атака',dodge:'Уклонение',trapReduce:'Защита от ловушек',chestGold:'Золото из находок',def:'Защита',poisonResist:'Сопротивление яду',manaFloor:'MP при спуске',poisonChance:'Отравление атаками',shieldFloor:'Щит при спуске',pow:'Магическая мощь'};
function ensure(meta){
 if(!meta.hunterBook||typeof meta.hunterBook!=='object')meta.hunterBook={owned:false,counts:{},trophies:{},unread:false};
 var book=meta.hunterBook;
 if(!book.counts)book.counts={};if(!book.trophies)book.trophies={};
 if(book.unread==null)book.unread=false;
 return book;
}
function owned(meta){return !!ensure(meta).owned;}
function acquire(meta){var b=ensure(meta);if(b.owned)return false;b.owned=true;b.unread=true;return true;}
function score(meta,id){return Math.max(0,Math.floor(Number(ensure(meta).counts[id])||0));}
function gain(meta,run,enemy,tid){
 if(!owned(meta)||!run||run.actIndex!==0||run.locationIndex!==0||!enemy||enemy.elite||enemy.boss)return null;
 var beast=beasts.find(function(x){return x.id===enemy.id;});if(!beast)return null;
 if(!run.hunterCounted)run.hunterCounted={};
 var key=run.locationIndex+':'+run.floor+':'+tid+':'+enemy.id;
 if(run.hunterCounted[key])return null;run.hunterCounted[key]=1;
 var b=ensure(meta),before=score(meta,enemy.id),after=Math.min(40,before+1);if(before>=40)return null;b.counts[enemy.id]=after;
 var reward=thresholds.reduce(function(a,n,i){return a+(before<n&&after>=n?beast.increments[i]:0);},0);
 if(reward){b.unread=true;return beast.name+': изучение '+after+'/40, новый бонус +'+reward+' '+beast.label+'.';}
 return null;
}
function bonuses(meta){
 var b=ensure(meta),out={};if(!b.owned)return out;
 beasts.forEach(function(x){var n=score(meta,x.id);
  thresholds.forEach(function(t,i){if(n>=t)out[x.effect]=(out[x.effect]||0)+x.increments[i];});
 });
 if(b.trophies.wolf)out.hunterAttackPct=10;
 if(b.trophies.boar)out.hunterHpPct=8;
 if(b.trophies.beetle)out.def=(out.def||0)+2;
 if(b.trophies.root)out.shieldFloor=(out.shieldFloor||0)+6;
 if(b.trophies.grove)out.hunterHealPct=10;
 return out;
}
function bonus(meta,key){return bonuses(meta)[key]||0;}
function grantTrophy(meta,id){if(!owned(meta)||!trophies.some(function(x){return x.id===id;}))return false;
 var b=ensure(meta);if(b.trophies[id])return false;b.trophies[id]=true;b.unread=true;return true;
}
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function iconFor(x){var a=window.CryptSprites&&window.CryptSprites.monster({id:x.id},'idle');
 return a||'<span class="hb-beast-placeholder" aria-hidden="true">'+x.sign+'</span>';}
function bookIcon(){return '<img src="hunter_book.svg" class="hb-book-icon" alt="" draggable="false"/>';}
function render(meta,tab,selected){
 var b=ensure(meta);tab=['beasts','trophies','bonuses'].indexOf(tab)>=0?tab:'beasts';
 selected=beasts.some(function(x){return x.id===selected;})?selected:'r1_0';
 var count=beasts.filter(function(x){return score(meta,x.id)>0;}).length;
 var header='<header class="hb-head"><div class="hb-head-art"><span class="hb-head-mark">♣</span><span class="hb-head-tree">♠</span></div>'+
  '<h2>Охотничий бестиарий</h2><p>ПОГРАНИЧНЫЕ ЗЕМЛИ · ГЛАВА I · ЛЕСНАЯ ОКРАИНА</p>'+
  '<button class="hb-close" data-action="close" aria-label="Закрыть">×</button></header>';
 var tabs='<div class="hb-tabs" role="tablist">'+[
  ['beasts','Звери','◈'],['trophies','Трофеи','♜'],['bonuses','Бонусы','✥']
 ].map(function(x){return '<button class="'+(tab===x[0]?'selected':'')+'" role="tab" aria-selected="'+(tab===x[0])+'" data-action="hunter-tab" data-id="'+x[0]+'"><span>'+x[2]+'</span>'+x[1]+'</button>';}).join('')+'</div>';
 var body='';
 if(tab==='beasts'){
  var x=beasts.find(function(c){return c.id===selected;}),n=score(meta,selected);
  var list=beasts.map(function(c){var q=score(meta,c.id);
   return '<button class="hb-beast'+(selected===c.id?' on':'')+'" data-action="hunter-select" data-id="'+c.id+'">'+
    '<span class="hb-small-portrait">'+iconFor(c)+'</span><span class="hb-beast-meta"><span class="hb-label-row"><b>'+e(c.name)+'</b>'+
    '<span class="hb-count">'+q+'/40</span></span>'+
    '<span class="hb-progress-track"><i style="width:'+Math.min(100,q/40*100)+'%"></i></span></span></button>';
  }).join('');
  var detail='<div class="hb-detail-header"><div><h3>'+e(x.name)+'</h3><small>'+e(x.kind)+' · '+(n?'Изучено':'Не изучено')+'</small></div>'+
   '<span class="hb-pawmark">♣</span></div>'+
   '<div class="hb-hero-portrait">'+iconFor(x)+'</div><p class="hb-description">'+e(x.desc)+'</p>'+
   '<div class="hb-study"><span>Изучено: '+n+' / 40</span><div class="hb-progress-track"><i style="width:'+Math.min(100,n/40*100)+'%"></i></div></div>'+
   '<h4>Награды изучения <small>(суммируются)</small></h4>'+
   '<div class="hb-milestones">'+thresholds.map(function(t,i){return '<div class="'+(n>=t?'unlocked':'locked')+'"><span class="hb-milestone-symbol">'+(n>=t?'✓':'◆')+'</span>'+
    '<span class="hb-stage-copy"><strong>'+t+' убийств</strong><span>+'+x.increments[i]+' '+e(x.label)+'</span></span></div>';}).join('')+'</div>';
  body='<div class="hb-beasts-layout"><div class="hb-beast-list">'+list+'</div><div class="hb-detail">'+detail+'</div></div>';
 }else if(tab==='trophies'){
  body='<div class="hb-trophy-intro">Трофеи особых охот открывают постоянные способности книги. Обычные элитники трофеев не выдают.</div>'+
   '<div class="hb-trophy-list">'+trophies.map(function(t){var yes=!!b.trophies[t.id];
    return '<div class="hb-trophy"><span class="hb-trophy-icon '+(yes?'yes':'')+'">'+t.symbol+'</span><span><b>'+e(t.name)+'</b>'+
    '<strong>'+e(t.ability)+'</strong><small>'+e(t.desc)+'</small></span><span class="hb-trophy-state">'+(yes?'✓':'♧')+'</span></div>';
   }).join('')+'</div>';
 }else{
  var bb=bonuses(meta),rows=beasts.map(function(x){return {name:statNames[x.effect],value:bb[x.effect]||0,suffix:x.effect==='trapReduce'||x.effect==='chestGold'||x.effect==='poisonResist'||x.effect==='poisonChance'||x.effect==='dodge'?'%':''};});
  body='<div class="hb-bonus-title">Активные бонусы книги</div><div class="hb-bonus-list">'+
   rows.map(function(x){return '<div><span>'+e(x.name)+'</span><strong>+'+x.value+x.suffix+'</strong></div>';}).join('')+
   (b.trophies.wolf?'<div><span>Воодушевление — атака героя и призванных</span><strong>+10%</strong></div>':'')+
   '</div><p class="hb-description">Бонусы всех достигнутых порогов складываются. Прогресс книги сохраняется между экспедициями. Активна на территории Пограничных земель.</p>';
 }
 return '<div class="hb-window">'+header+tabs+'<div class="hb-inner">'+body+'</div>'+
  '<footer class="hb-footer"><span>Открыто существ: '+count+'/10</span><span>Охота не прощает беспечности</span></footer></div>';
}
window.CryptHunterBook={beasts:beasts,trophies:trophies,ensure:ensure,owned:owned,acquire:acquire,score:score,gain:gain,bonuses:bonuses,bonus:bonus,grantTrophy:grantTrophy,render:render,bookIcon:bookIcon};
})();