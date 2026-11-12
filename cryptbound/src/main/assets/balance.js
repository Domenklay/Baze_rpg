/* Cryptbound balance v1: independent single-hero tuning for all ten acts.
   The Clicker roster supplies names, roles and loot; never copy Clicker raid stats. */
(function(){'use strict';
var rows=[
 [24,5,220,11,'Лесная окраина','Укусы и стаи'],
 [34,7,290,15,'Разломы','Яды и пробитие защиты'],
 [47,9,380,20,'Подгорное королевство','Стражи, механизмы и боевые кличи'],
 [63,12,500,26,'Вечная Крона','Стрелки, друиды и исцеление'],
 [83,15,650,33,'Адские легионы','Пламя и разрушение щитов'],
 [108,19,850,42,'Бездна','Контроль маны и призывы'],
 [139,24,1100,52,'Царство мёртвых','Проклятия и похищение жизни'],
 [178,30,1450,64,'Мир вечных снов','Страх, обман и ослабления'],
 [224,38,1870,77,'Первородный мир','Стихии и тяжёлые удары'],
 [279,48,2450,93,'Астральный предел','Смешанные эффекты и опасные связки']
];
var profiles=rows.map(function(v,index){return {
 act:index,normalHp:v[0],normalAtk:v[1],bossHp:v[2],bossAtk:v[3],
 title:v[4],threat:v[5],normalDef:Math.floor(index/3),
 bossDef:2+Math.floor(index*.75)
};});
var roleMods={
 brute:{name:'Сокрушитель',hp:1.12,atk:1.14,def:0},
 sentinel:{name:'Защитник',hp:1.32,atk:.83,def:2},
 skirmisher:{name:'Налётчик',hp:.79,atk:1.19,def:0},
 venom:{name:'Отравитель',hp:.92,atk:.96,def:0},
 hexer:{name:'Чародей',hp:.84,atk:1.08,def:0},
 healer:{name:'Целитель',hp:.98,atk:.86,def:0},
 marksman:{name:'Стрелок',hp:.85,atk:.97,def:0},
 summoner:{name:'Призыватель',hp:1.02,atk:.89,def:0}
};
var abilities={
 brute:[
 {id:'crush',name:'Сокрушающий удар',description:'Сильный удар по одной цели'},
 {id:'bleed',name:'Рваная рана',description:'Накладывает кровотечение'},
 {id:'shatter',name:'Дробление защиты',description:'Повреждает щит героя'}
 ],
 sentinel:[
 {id:'fortify',name:'Железная стойка',description:'Повышает собственную броню на два хода'},
 {id:'shieldbash',name:'Удар щитом',description:'Повреждает щит и наносит урон'},
 {id:'guardally',name:'Оберег союзников',description:'Временно укрепляет ближайшего защитника'}
 ],
 skirmisher:[
 {id:'flurry',name:'Серия быстрых атак',description:'Увеличенный прямой урон'},
 {id:'evade',name:'Ложный манёвр',description:'Получает шанс уклониться от следующей атаки'},
 {id:'bleed',name:'Скрытый порез',description:'Наносит кровотечение'}
 ],
 venom:[
 {id:'poison',name:'Ядовитый укус',description:'Яд действует несколько ходов'},
 {id:'corrode',name:'Едкая слюна',description:'Временно снижает защиту героя'},
 {id:'toxicmana',name:'Споровая пыль',description:'Яд и уменьшение маны'}
 ],
 hexer:[
 {id:'manaburn',name:'Магический ожог',description:'Похищает ману'},
 {id:'silence',name:'Печать молчания',description:'На время блокирует заклинания'},
 {id:'burn',name:'Колдовское пламя',description:'Накладывает горение'}
 ],
 healer:[
 {id:'healally',name:'Лечение союзника',description:'Восстанавливает здоровье пострадавшему врагу'},
 {id:'guardally',name:'Защитная молитва',description:'Усиливает броню союзника'},
 {id:'regenerate',name:'Живая плоть',description:'Регенерирует небольшую часть здоровья'}
 ],
 marksman:[
 {id:'pierce',name:'Пробивающий выстрел',description:'Сильный удар раз в три хода'},
 {id:'venomshot',name:'Отравленная стрела',description:'Выстрел накладывает яд'},
 {id:'silenceshot',name:'Зачарованная стрела',description:'Выстрел на время глушит магию'}
 ],
 summoner:[
 {id:'call',name:'Зов прислужника',description:'Вызывает одного дополнительного слабого врага'},
 {id:'guardally',name:'Печать группы',description:'Укрепляет одного союзника'},
 {id:'manaburn',name:'Поглощение эссенции',description:'Выжигает ману героя'}
 ]
};
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function hash(s){s=String(s||'unknown');var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function role(source,ranged){
 var t=((source.role||'')+' '+(source.kind||'')+' '+(source.name||'')+' '+(source.skillName||'')).toLowerCase();
 if(ranged||/дальник|стрел|арбалет|пращ|shot/.test(t))return 'marksman';
 if(/призыв|призыва|некромант|архижре|повелител.*дух/.test(t))return 'summoner';
 if(/поддерж|лечен|лекар|целител|исцелен|шаман|regener/.test(t))return 'healer';
 if(/яд|кислот|жало|спор|паразит|poison|токсин/.test(t))return 'venom';
 if(/быстр|скорость|манёвр|уклон|охотник|дуэлян|double|проворн/.test(t))return 'skirmisher';
 if(/танк|защит|брон|страж|хитин|панцир|щит|guard/.test(t))return 'sentinel';
 if(/контрол|маг|жрец|чарод|curse|дух|прокля|колдун|ведьм|заклин/.test(t))return 'hexer';
 if(/тяжёл|таран|ударник|хищник|палач|slam|голем|великан/.test(t))return 'brute';
 var pool=['brute','sentinel','skirmisher','venom','hexer','healer','summoner'];
 return pool[hash(source.id)%pool.length];
}
function ability(source,assignedRole){
 var pool=abilities[assignedRole]||abilities.brute,at=hash(source.id)%pool.length;
 return Object.assign({},pool[at]);
}
function actProfile(act){return profiles[clamp(Math.floor(Number(act)||0),0,9)];}
function combat(act,location,floor,roleId,elite,boss,id){
 var p=actProfile(act),level=Math.max(1,Math.floor(Number(floor)||1)),loc=clamp(Math.floor(Number(location)||0),0,2);
 var scaleHp=1+Math.min(29,level-1)*.013+Math.max(0,level-30)*.004;
 var scaleAtk=1+Math.min(29,level-1)*.006+Math.max(0,level-30)*.0025;
 var mods=roleMods[roleId]||roleMods.brute;
 var speciesVariance=boss?1:(.94+(hash(id)%13)*.01);
 var maxHp=Math.ceil((boss?p.bossHp:p.normalHp)*scaleHp*(1+loc*.12)*(boss?1:mods.hp)*(elite?2:1)*speciesVariance);
 var attack=Math.ceil((boss?p.bossAtk:p.normalAtk)*scaleAtk*(1+loc*.065)*(boss?1:mods.atk)*(elite?1.24:1)*speciesVariance);
 var armor=boss?p.bossDef+loc:p.normalDef+mods.def+(elite?1:0);
 var cooldown= boss?3:roleId==='marksman'?3:elite?3:3;
 return {hp:Math.max(12,maxHp),atk:Math.max(2,attack),def:Math.max(0,armor),
  cooldown:cooldown,role:boss?'boss':roleId,
  threat:p.threat,act:Number(act)+1,floor:level};
}
function training(act){var n=clamp(Math.floor(Number(act)||0),0,9);
 return {atk:n*7,def:n*3,hp:n*34,mp:n*8,pow:n*5};
}
function loot(act,location,floor,elite,boss){
 var actFactor=1+clamp(Number(act)||0,0,9)*.16;
 var locationFactor=1+(Number(location)||0)*.075;
 var depthFactor=floor<30?1:1+Math.floor((floor-30)/10)*.5;
 return Math.max(1,Math.round((boss?42:elite?16:6)*actFactor*locationFactor*depthFactor));
}
window.CryptBalance={
 profiles:profiles,roles:roleMods,abilities:abilities,
 hash:hash,role:role,ability:ability,actProfile:actProfile,combat:combat,training:training,loot:loot
};
})();