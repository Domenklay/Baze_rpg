/* Permanent hero progression. Essence belongs to one class; expedition titles stay separate. */
(function(){'use strict';
var HEROES={
 necromancer:{name:'Некромант',lanes:['Власть над костями','Вечный страж','Тёмное знание'],nodes:[
 ['pow','Тёмный дар','powPct',6,3,'pow',1],['summon_attack','Костяные клинки','summonAtkPct',15],['ritual','Круг возрождения','skillManaPct',40,1,'summonKillHealPct',10],
 ['hp','Живая кровь','hpPct',6,3,'hp',4],['summon_health','Крепкие кости','summonHpPct',20],['summon_armor','Костяной доспех','summonResistPct',30,1,'summonDef',1],
 ['mp','Тайный резерв','mpPct',8,3,'mp',2],['spells','Чёрные письмена','spellPct',8],['shield','Погребальный оберег','floorShieldPct',10]]},
 executioner:{name:'Воин',lanes:['Клинок','Стойкость','Дисциплина'],nodes:[
 ['atk','Твёрдая рука','atkPct',5,3,'atk',1],['skill','Мастер казни','skillPct',12],['crit','Точный удар','crit',3,3,'critDamage',10],
 ['hp','Выносливость','hpPct',6,3,'hp',4],['armor','Держать строй','resistPct',8,2,'def',1],['shield','Второе дыхание','killHealPct',3],
 ['mp','Запас сил','mpPct',8,3,'mp',2],['boss','Победитель чудовищ','bossPct',10],['focus','Выверенный замах','skillCooldown',1,1,'skillManaPct',25]]},
 scout:{name:'Лучник',lanes:['Меткая стрела','Лесная тропа','Снаряжение'],nodes:[
 ['atk','Натяжение тетивы','atkPct',5,3,'atk',1],['skill','Парный выстрел','skillPct',12],['boss','Крупная дичь','bossPct',12],
 ['hp','Долгий переход','hpPct',6,3,'hp',4],['dodge','Лёгкий шаг','dodge',4],['shield','Привал следопыта','floorHealPct',5],
 ['mp','Дыхание охотника','mpPct',8,3,'mp',2],['gold','Ценные трофеи','goldPct',10],['focus','Спокойная рука','skillCooldown',1,1,'skillManaPct',25]]},
 sorceress:{name:'Волшебница',lanes:['Гроза','Обережный круг','Средоточие'],nodes:[
 ['pow','Искра стихий','powPct',6,3,'pow',1],['skill','Звучание грома','skillPct',12],['spells','Печать заклинаний','spellPct',10],
 ['hp','Закалка тела','hpPct',6,3,'hp',4],['shield','Восстанавливаемый барьер','spellShieldPct',4],['dodge','Шаг в тумане','dodge',3],
 ['mp','Магический сосуд','mpPct',10,3,'mp',3],['scrolls','Чистая формула','spellManaPct',25,1],['focus','Тихое заклинание','skillCooldown',1,1,'skillManaPct',25]]},
 guardian:{name:'Воительница',lanes:['Возмездие','Стальной обет','Защита'],nodes:[
 ['atk','Верный клинок','atkPct',5,3,'atk',1],['skill','Нерушимый удар','skillPct',10],['boss','Вызов исполинам','bossPct',8],
 ['hp','Закалённая кровь','hpPct',8,3,'hp',5],['armor','Стальной строй','resistPct',10,2,'def',1],['barrier','Прочный заслон','shieldPct',12],
 ['mp','Вторая воля','mpPct',8,3,'mp',2],['shield','Первый рубеж','floorShieldPct',10],['focus','Сдержанный натиск','skillCooldown',1,1,'skillManaPct',25]]},
 assassin:{name:'Кинжальщица',lanes:['Острый клинок','Тень','Хладнокровие'],nodes:[
 ['atk','Верный хват','atkPct',5,3,'atk',1],['crit','Найти слабость','crit',4],['skill','Точная инъекция','skillPct',12],
 ['hp','Цепкость','hpPct',6,3,'hp',4],['dodge','Раствориться во тьме','dodge',4],['shield','Засада','firstStrikePct',15],
 ['mp','Ровное дыхание','mpPct',8,3,'mp',2],['critical','Смертельный угол','critDamage',15],['focus','Хладнокровный расчёт','killManaPct',8,1,'skillManaPct',20]]}
};
var LABELS={atkPct:'% атаки',powPct:'% магии',hpPct:'% максимального HP',mpPct:'% максимальной маны',summonAtkPct:'% атаки скелета',summonHpPct:'% HP скелета',summonResistPct:'% снижения урона по скелету',resistPct:'% снижения урона атак',floorShieldPct:'% максимального HP в щит на каждом новом этаже',floorHealPct:'% максимального HP при переходе на новый этаж',killHealPct:'% максимального HP за победу',killManaPct:'% максимальной маны за победу',summonKillHealPct:'% максимального HP скелету за победу',spellShieldPct:'% максимального HP в щит при применении заклинания',skillManaPct:'% снижения цены способности',spellManaPct:'% снижения цены заклинаний',skillCooldown:'ход восстановления способности',firstStrikePct:'% урона первого обычного удара по каждому врагу',atk:'атаки',pow:'магии',hp:'макс. здоровья',mp:'макс. маны',def:'брони',crit:'п.п. шанса крита',dodge:'п.п. уклонения',summonAtk:'атаки скелета',summonHp:'HP скелета',summonDef:'брони скелета',skillPct:'% урона классовой способности',spellPct:'% силы заклинаний',bossPct:'% физического урона боссам',shieldPct:'% щита от классовой способности',goldPct:'% найденного золота',critDamage:'п.п. множителя крита',startShield:'щита в начале новой экспедиции',skillMana:'маны экономии классовой способности',spellMana:'маны экономии каждого заклинания'};
Object.keys(HEROES).forEach(function(hero){HEROES[hero].nodes=HEROES[hero].nodes.map(function(n,i){return {id:n[0],name:n[1],effect:n[2],value:n[3],max:n[4]||3,extraEffect:n[5]||null,extraValue:n[6]||0,lane:Math.floor(i/3),tier:i%3,parent:i%3?HEROES[hero].nodes[i-1][0]:null};});});
function integer(v){return Math.max(0,Math.floor(Number(v)||0));}
function refund(rank){var total=0;for(var i=0;i<Math.min(5,integer(rank));i++)total+=6+i*7;return total;}
function ensure(m,active){if(!m.heroRanks)m.heroRanks={};if(!m.heroEssence)m.heroEssence={};if(!m.heroProgression)m.heroProgression={version:1,heroes:{}};var p=m.heroProgression;if(!p.heroes)p.heroes={};
 Object.keys(HEROES).forEach(function(hero){if(!p.heroes[hero]){var old=Math.min(5,integer(m.heroRanks[hero])),credit=refund(old);if(active&&active.class===hero&&old>0)active.legacyHeroRank=old;p.heroes[hero]={nodes:{},spent:0,legacyRank:old,refund:credit};m.heroEssence[hero]=integer(m.heroEssence[hero])+credit;m.heroRanks[hero]=0;}if(!p.heroes[hero].nodes)p.heroes[hero].nodes={};});p.version=2;return p;}
function node(hero,id){return Object.prototype.hasOwnProperty.call(HEROES,hero)&&HEROES[hero].nodes.find(function(n){return n.id===id;});}
function rank(m,hero,id){var p=ensure(m),n=node(hero,id);return n?Math.min(n.max,integer(p.heroes[hero].nodes[id])):0;}
function cost(m,hero,id){var n=node(hero,id);return n&&rank(m,hero,id)<n.max?[8,14,24][n.tier]+rank(m,hero,id)*[4,6,8][n.tier]:0;}
function unlocked(m,hero,id){var n=node(hero,id);return !!n&&(!n.parent||rank(m,hero,n.parent)>=Math.min(2,node(hero,n.parent).max));}
function buy(m,hero,id,active){if(active||!node(hero,id))return false;var p=ensure(m),n=node(hero,id),lv=rank(m,hero,id),price=cost(m,hero,id);if(lv>=n.max||!unlocked(m,hero,id)||integer(m.heroEssence[hero])<price)return false;m.heroEssence[hero]-=price;p.heroes[hero].nodes[id]=lv+1;p.heroes[hero].spent=integer(p.heroes[hero].spent)+price;return true;}
function respec(m,hero,active){if(active||!Object.prototype.hasOwnProperty.call(HEROES,hero))return false;var p=ensure(m),entry=p.heroes[hero],spent=integer(entry.spent);if(!spent)return false;m.heroEssence[hero]=integer(m.heroEssence[hero])+spent;entry.nodes={};entry.spent=0;return true;}
function legacy(hero,n){var b={};if(hero==='necromancer')b={pow:n,summonHp:n*9,summonAtk:n*3};if(hero==='executioner')b={atk:n*2,def:n};if(hero==='scout')b={hp:n*5};if(hero==='sorceress')b={pow:n*2,mp:n*6};if(hero==='guardian')b={hp:n*9,def:n};if(hero==='assassin')b={atk:n*2,crit:n};return b;}
function effects(m,hero,run){if(!Object.prototype.hasOwnProperty.call(HEROES,hero))return {};ensure(m,run);if(run&&run.legacyHeroRank!=null)return legacy(hero,Math.min(5,integer(run.legacyHeroRank)));var out={};if(!HEROES[hero])return out;HEROES[hero].nodes.forEach(function(n){var lv=rank(m,hero,n.id);out[n.effect]=(out[n.effect]||0)+lv*n.value;if(n.extraEffect)out[n.extraEffect]=(out[n.extraEffect]||0)+lv*n.extraValue;});return out;}
function description(n){
 var text=n.effect==='skillCooldown'?'Восстановление способности быстрее на '+n.value+' ход.':n.effect==='skillManaPct'?'Цена способности −'+n.value+'%.':n.effect==='spellManaPct'?'Цена каждого заклинания −'+n.value+'%.':'+'+n.value+' '+LABELS[n.effect]+' за ранг. Максимум: '+n.max*n.value+'.';
 if(n.effect==='resistPct')text=n.value+'% снижения урона атак за ранг, максимум '+n.max*n.value+'%.';
 if(n.effect==='summonResistPct')text='Скелет получает на '+n.value+'% меньше урона от атак.';
 if(n.extraEffect)text+=' '+(n.extraEffect==='skillManaPct'?'Цена способности −'+n.extraValue+'%.':'+'+n.extraValue+' '+LABELS[n.extraEffect]+(n.max>1?' за ранг.':'.'));
 if(['atkPct','powPct','hpPct','mpPct','summonAtkPct','summonHpPct'].includes(n.effect))text+=' Проценты учитывают экипировку и другие постоянные прибавки.';
 if(n.effect==='floorShieldPct')text='На каждом новом этаже даёт щит '+n.value+'% максимального HP за ранг (до '+n.max*n.value+'%).';
 if(n.effect==='floorHealPct')text='Переход на новый этаж восстанавливает '+n.value+'% максимального HP за ранг (до '+n.max*n.value+'%).';
 if(n.effect==='floorShieldPct'||n.effect==='floorHealPct')text+=' Работает на этажах боссов. Загрузка и повторный вход не выдают бонус повторно.';
 if(n.effect==='spellShieldPct')text+=' Заполняет щит до 30% максимального HP. Больший щит не уменьшается.';
 if(n.effect==='shieldPct')text+=' Способность может заполнить щит до 100% максимального HP.';
 if(n.effect==='firstStrikePct')text+=' Один усиленный обычный удар на противника, в том числе на босса.';
 if(n.effect==='killHealPct'||n.effect==='killManaPct'||n.extraEffect==='summonKillHealPct')text+=' Срабатывает за реальную победу в лабиринте и пещере, один раз на врага. Не работает на эфирных стражах бура.';
 if(n.effect==='skillManaPct'||n.effect==='spellManaPct'||n.extraEffect==='skillManaPct')text+=' Цена округляется вверх и не опускается ниже 1 маны.';
 return text;
}
function total(m,hero){if(!Object.prototype.hasOwnProperty.call(HEROES,hero))return 0;return HEROES[hero].nodes.reduce(function(n,x){return n+rank(m,hero,x.id);},0);}
window.CryptHeroProgression={heroes:HEROES,labels:LABELS,ensure:ensure,node:node,rank:rank,cost:cost,unlocked:unlocked,buy:buy,respec:respec,effects:effects,description:description,total:total,refund:refund};
})();
