/* Cryptbound v0.3 — original world content. Inspired by the genre, no third-party assets. */
(function(){
'use strict';
var MOB_SKILLS={
 rat:{name:'Заразный укус',every:3,description:'Каждый третий собственный ход наносит усиленный укус с дополнительным уроном.',kind:'bite'},
 skeleton:{name:'Мёртвый заслон',every:4,description:'Раз в 4 хода усиливает броню на следующий удар.',kind:'guard'},
 cultist:{name:'Кровавое проклятие',every:3,description:'Раз в 3 хода наносит магический урон, игнорирующий часть брони.',kind:'curse'},
 wolf:{name:'Вой стаи',every:4,description:'Раз в 4 хода проводит стремительную двойную атаку.',kind:'double'},
 spider:{name:'Ядовитые жвала',every:3,description:'Раз в 3 хода накладывает яд на 2 последующих хода.',kind:'poison'},
 golem:{name:'Крушение',every:4,description:'Раз в 4 хода наносит мощный медленный удар.',kind:'slam'},
 boss:{name:'Погребальный обряд',every:3,description:'Раз в 3 хода обрушивает на героя тёмную магию и накладывает слабое проклятие.',kind:'curse'}
};
var HERO_MASTERY={
 necromancer:{title:'Заветы некроманта',effect:'Скелет: +3 атаки, +9 HP за ранг; магия +1.',feature:'Повелитель костей'},
 executioner:{title:'Дисциплина палача',effect:'Атака +2 и броня +1 за ранг.',feature:'Железная воля'},
 scout:{title:'Путь следопыта',effect:'Здоровье +5 и дополнительное золото +5% за ранг.',feature:'Тихий охотник'}
};
var RELICS=[
 {id:'ash-seal',name:'Печать пепельного судьи',icon:'✥',desc:'Реликвия подземного суда',bonus:'Атака +1'},
 {id:'bone-flute',name:'Костяная флейта',icon:'♫',desc:'Мелодия, которую слышат мёртвые',bonus:'Мана +3'},
 {id:'red-eye',name:'Багровое око',icon:'◉',desc:'Тайный знак безымянного монастыря',bonus:'Крит +1%'},
 {id:'drowned-crown',name:'Венец утопшего короля',icon:'♛',desc:'Корона забытых сводов',bonus:'Здоровье +5'},
 {id:'broken-star',name:'Сломанная звезда',icon:'✦',desc:'Обломок небесного металла',bonus:'Мощь магии +2'},
 {id:'void-clock',name:'Часы без стрелок',icon:'◷',desc:'Артефакт, считающий чужие смерти',bonus:'Броня +1'}
];
var CHALLENGES=[
 {id:'depth5',name:'Первое испытание',desc:'Спуститься на 5-й этаж',reward:8,check:function(m){return m.best>=5;}},
 {id:'depth10',name:'Глубже во тьму',desc:'Добраться до 10-го этажа',reward:18,check:function(m){return m.best>=10;}},
 {id:'secrets5',name:'Собиратель тайн',desc:'Найти 5 секретов за все походы',reward:10,check:function(m){return (m.totalSecrets||0)>=5;}},
 {id:'bestiary4',name:'Знаток чудовищ',desc:'Победить врагов четырёх разных видов',reward:10,check:function(m){return Object.keys(m.bestiary||{}).filter(function(k){return m.bestiary[k]>0;}).length>=4;}},
 {id:'relic3',name:'Реликварий',desc:'Собрать три разных реликвии с боссов',reward:22,check:function(m){return Object.keys(m.relics||{}).filter(function(k){return m.relics[k]>0;}).length>=3;}}
];
function monster(id){return MOB_SKILLS[id]||MOB_SKILLS.skeleton;}
function mastery(meta,hero){return ((meta.heroRanks||{})[hero]||0);}
function masteryStat(meta,hero,stat){
 var n=mastery(meta,hero);
 if(hero==='necromancer'){return stat==='pow'?n:0;}
 if(hero==='executioner')return stat==='atk'?2*n:stat==='def'?n:0;
 if(hero==='scout')return stat==='hp'?5*n:0;
 return 0;
}
function relicStat(meta,stat){
 var r=meta.relics||{},n=0;
 if(stat==='atk'&&r['ash-seal']>0)n++;
 if(stat==='mp'&&r['bone-flute']>0)n+=3;
 if(stat==='crit'&&r['red-eye']>0)n++;
 if(stat==='hp'&&r['drowned-crown']>0)n+=5;
 if(stat==='pow'&&r['broken-star']>0)n+=2;
 if(stat==='def'&&r['void-clock']>0)n++;
 return n;
}
function relicForFloor(floor){return RELICS[(Math.floor(floor/5)-1+RELICS.length)%RELICS.length];}
function upgradeCost(rank){return 6+rank*7;}
window.CryptExpansion={monster:monster,heroMastery:HERO_MASTERY,relics:RELICS,challenges:CHALLENGES,
 mastery:mastery,masteryStat:masteryStat,relicStat:relicStat,relicForFloor:relicForFloor,upgradeCost:upgradeCost};
})();