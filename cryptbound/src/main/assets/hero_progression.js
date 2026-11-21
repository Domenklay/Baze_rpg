/* Permanent hero progression. Essence belongs to one class; expedition titles stay separate. */
(function(){'use strict';
var HEROES={
 necromancer:{name:'Некромант',lanes:['Власть над костями','Вечный страж','Тёмное знание'],nodes:[
 ['pow','Тёмный дар','pow',1],['summon_attack','Костяные клинки','summonAtk',1],['ritual','Бережный ритуал','skillMana',1,1],
 ['hp','Живая кровь','hp',4],['summon_health','Крепкие кости','summonHp',4],['summon_armor','Костяной доспех','summonDef',1,1],
 ['mp','Тайный резерв','mp',2],['spells','Чёрные письмена','spellPct',3],['shield','Погребальный оберег','startShield',3]]},
 executioner:{name:'Воин',lanes:['Клинок','Стойкость','Дисциплина'],nodes:[
 ['atk','Твёрдая рука','atk',1],['skill','Мастер казни','skillPct',4],['crit','Точный удар','crit',1],
 ['hp','Выносливость','hp',4],['armor','Держать строй','def',1,2],['shield','Боевой оберег','startShield',3],
 ['mp','Запас сил','mp',2],['boss','Победитель чудовищ','bossPct',3],['focus','Выверенный замах','skillMana',1,1]]},
 scout:{name:'Лучник',lanes:['Меткая стрела','Лесная тропа','Снаряжение'],nodes:[
 ['atk','Натяжение тетивы','atk',1],['skill','Парный выстрел','skillPct',3],['boss','Крупная дичь','bossPct',3],
 ['hp','Долгий переход','hp',4],['dodge','Лёгкий шаг','dodge',2],['shield','Дозорный плащ','startShield',3],
 ['mp','Дыхание охотника','mp',2],['gold','Ценные трофеи','goldPct',3],['focus','Спокойная рука','skillMana',1,1]]},
 sorceress:{name:'Волшебница',lanes:['Гроза','Обережный круг','Средоточие'],nodes:[
 ['pow','Искра стихий','pow',1],['skill','Звучание грома','skillPct',3],['spells','Печать заклинаний','spellPct',3],
 ['hp','Закалка тела','hp',4],['shield','Малый барьер','startShield',3],['dodge','Шаг в тумане','dodge',1],
 ['mp','Магический сосуд','mp',3],['scrolls','Чистая формула','spellMana',1,1],['focus','Тихое заклинание','skillMana',1,1]]},
 guardian:{name:'Воительница',lanes:['Возмездие','Стальной обет','Защита'],nodes:[
 ['atk','Верный клинок','atk',1],['skill','Нерушимый удар','skillPct',3],['boss','Вызов исполинам','bossPct',2],
 ['hp','Закалённая кровь','hp',5],['armor','Стальной строй','def',1,2],['barrier','Прочный заслон','shieldPct',4],
 ['mp','Вторая воля','mp',2],['shield','Первый рубеж','startShield',4],['focus','Сдержанный натиск','skillMana',1,1]]},
 assassin:{name:'Кинжальщица',lanes:['Острый клинок','Тень','Хладнокровие'],nodes:[
 ['atk','Верный хват','atk',1],['crit','Найти слабость','crit',2],['skill','Точная инъекция','skillPct',3],
 ['hp','Цепкость','hp',4],['dodge','Раствориться во тьме','dodge',2],['shield','Теневой покров','startShield',3],
 ['mp','Ровное дыхание','mp',2],['critical','Смертельный угол','critDamage',4],['focus','Экономный выпад','skillMana',1,1]]}
};
var LABELS={atk:'атаки',pow:'магии',hp:'макс. здоровья',mp:'макс. маны',def:'брони',crit:'п.п. шанса крита',dodge:'п.п. уклонения',summonAtk:'атаки скелета',summonHp:'HP скелета',summonDef:'брони скелета',skillPct:'% урона классовой способности',spellPct:'% силы заклинаний',bossPct:'% физического урона боссам',shieldPct:'% щита от классовой способности',goldPct:'% найденного золота',critDamage:'п.п. множителя крита',startShield:'щита в начале новой экспедиции',skillMana:'маны экономии классовой способности',spellMana:'маны экономии каждого заклинания'};
Object.keys(HEROES).forEach(function(hero){HEROES[hero].nodes=HEROES[hero].nodes.map(function(n,i){return {id:n[0],name:n[1],effect:n[2],value:n[3],max:n[4]||3,lane:Math.floor(i/3),tier:i%3,parent:i%3?HEROES[hero].nodes[i-1][0]:null};});});
function integer(v){return Math.max(0,Math.floor(Number(v)||0));}
function refund(rank){var total=0;for(var i=0;i<Math.min(5,integer(rank));i++)total+=6+i*7;return total;}
function ensure(m,active){if(!m.heroRanks)m.heroRanks={};if(!m.heroEssence)m.heroEssence={};if(!m.heroProgression)m.heroProgression={version:1,heroes:{}};var p=m.heroProgression;if(!p.heroes)p.heroes={};
 Object.keys(HEROES).forEach(function(hero){if(!p.heroes[hero]){var old=Math.min(5,integer(m.heroRanks[hero])),credit=refund(old);if(active&&active.class===hero&&old>0)active.legacyHeroRank=old;p.heroes[hero]={nodes:{},spent:0,legacyRank:old,refund:credit};m.heroEssence[hero]=integer(m.heroEssence[hero])+credit;m.heroRanks[hero]=0;}if(!p.heroes[hero].nodes)p.heroes[hero].nodes={};});return p;}
function node(hero,id){return Object.prototype.hasOwnProperty.call(HEROES,hero)&&HEROES[hero].nodes.find(function(n){return n.id===id;});}
function rank(m,hero,id){var p=ensure(m),n=node(hero,id);return n?Math.min(n.max,integer(p.heroes[hero].nodes[id])):0;}
function cost(m,hero,id){var n=node(hero,id);return n&&rank(m,hero,id)<n.max?[8,14,24][n.tier]+rank(m,hero,id)*[4,6,8][n.tier]:0;}
function unlocked(m,hero,id){var n=node(hero,id);return !!n&&(!n.parent||rank(m,hero,n.parent)>=Math.min(2,node(hero,n.parent).max));}
function buy(m,hero,id,active){if(active||!node(hero,id))return false;var p=ensure(m),n=node(hero,id),lv=rank(m,hero,id),price=cost(m,hero,id);if(lv>=n.max||!unlocked(m,hero,id)||integer(m.heroEssence[hero])<price)return false;m.heroEssence[hero]-=price;p.heroes[hero].nodes[id]=lv+1;p.heroes[hero].spent=integer(p.heroes[hero].spent)+price;return true;}
function respec(m,hero,active){if(active||!Object.prototype.hasOwnProperty.call(HEROES,hero))return false;var p=ensure(m),entry=p.heroes[hero],spent=integer(entry.spent);if(!spent)return false;m.heroEssence[hero]=integer(m.heroEssence[hero])+spent;entry.nodes={};entry.spent=0;return true;}
function legacy(hero,n){var b={};if(hero==='necromancer')b={pow:n,summonHp:n*9,summonAtk:n*3};if(hero==='executioner')b={atk:n*2,def:n};if(hero==='scout')b={hp:n*5};if(hero==='sorceress')b={pow:n*2,mp:n*6};if(hero==='guardian')b={hp:n*9,def:n};if(hero==='assassin')b={atk:n*2,crit:n};return b;}
function effects(m,hero,run){if(!Object.prototype.hasOwnProperty.call(HEROES,hero))return {};ensure(m,run);if(run&&run.legacyHeroRank!=null)return legacy(hero,Math.min(5,integer(run.legacyHeroRank)));var out={};if(!HEROES[hero])return out;HEROES[hero].nodes.forEach(function(n){out[n.effect]=(out[n.effect]||0)+rank(m,hero,n.id)*n.value;});return out;}
function description(n){return '+'+n.value+' '+LABELS[n.effect]+' за ранг. Максимум: +'+n.max*n.value+'.'+(n.effect==='spellMana'||n.effect==='skillMana'?' Цена не опускается ниже 1 маны.':'')+(n.effect==='bossPct'?' Действует на обычные удары и физические классовые способности.':'')+(n.effect==='startShield'?' Не восстанавливается при загрузке или переходе этажа.':'');}
function total(m,hero){if(!Object.prototype.hasOwnProperty.call(HEROES,hero))return 0;return HEROES[hero].nodes.reduce(function(n,x){return n+rank(m,hero,x.id);},0);}
window.CryptHeroProgression={heroes:HEROES,labels:LABELS,ensure:ensure,node:node,rank:rank,cost:cost,unlocked:unlocked,buy:buy,respec:respec,effects:effects,description:description,total:total,refund:refund};
})();
