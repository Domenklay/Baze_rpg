/* Village economy. Pure save-backed rules; no clocks, network or random rewards. */
(function(){'use strict';
var GOODS={boards:'Строевые доски',parts:'Кованые детали',ink:'Рунные чернила',rations:'Походная провизия'};
var BUILDINGS={
 workshop:{name:'Артель',icon:'forge',effect:'+10% продукции мастерских за уровень; округление вниз для партии. Эффективнее создавать ×5.'},
 forge:{name:'Кузница',icon:'forge',effect:'+2 атаки всем героям за уровень; новые кузнечные заказы.'},
 barracks:{name:'Казармы',icon:'hero',effect:'+12 здоровья всем героям за уровень.'},
 library:{name:'Архив',icon:'chronicles',effect:'+8 маны всем героям за уровень; исследование наследия.'},
 alchemist:{name:'Алхимическая лаборатория',icon:'alchemy',effect:'Открывает новые зелья и полевые припасы.'},
 mine:{name:'Шахтный двор',icon:'mining',effect:'+5% дополнительной руды за уровень. Использует руду нагорья.'},
 warehouse:{name:'Склад',icon:'backpack',effect:'При неудачном бегстве сохраняет дополнительно 5% сырья за уровень; вместимость склада не ограничена.'},
 inn:{name:'Постоялый двор',icon:'village',effect:'В начале каждой новой экспедиции: +3 щита за уровень.'},
 market:{name:'Торговые ряды',icon:'expedition',effect:'Открывает обмен регионального сырья на продукцию. Заказы приносят +1 память за уровень.'}
};
var RECIPES=[
 {id:'trophy_parts',name:'Обмен клыков на крепёж',output:[GOODS.parts,2],cost:[['волчий клык',4]],level:0,work:'workshop'},
 {id:'boards',name:'Распил древесины',output:[GOODS.boards,2],cost:[['древесина',4]],level:0,work:'workshop'},
 {id:'parts',name:'Перековка металлолома',output:[GOODS.parts,2],cost:[['Металлолом',4]],level:0,work:'workshop'},
 {id:'ore_parts',name:'Выплавка железа',output:[GOODS.parts,3],cost:[['Железная руда',3]],level:1,work:'forge'},
 {id:'ink',name:'Переписать старые записи',output:[GOODS.ink,2],cost:[['Старые записи',3]],level:0,work:'workshop'},
 {id:'crystal_ink',name:'Растереть кристаллы',output:[GOODS.ink,2],cost:[['Горный кристалл',2]],level:1,work:'library'},
 {id:'rations',name:'Обмен шкур на провизию',output:[GOODS.rations,2],cost:[['Шкура животного',3]],level:0,work:'workshop'},
 {id:'forest_rations',name:'Заказ охотничьей артели',output:[GOODS.rations,3],cost:[['волчий клык',3]],level:1,work:'inn'},
 {id:'salvage_parts',name:'Разбор трофейных доспехов',output:[GOODS.parts,2],cost:[['Змеиная чешуя',3]],level:2,work:'workshop'}
];
// Costs are exact, never an arbitrary drain of the largest stacks.
function buildingCost(meta,id){var lv=level(meta,id),n=lv+1;if(!Object.prototype.hasOwnProperty.call(BUILDINGS,id)||lv>=5)return null;
 if(id==='mine'){var costs=[{'Железная руда':5},{'Железная руда':12,'Стальная руда':3},{'Стальная руда':8,'Кварцевая руда':2},{'Стальная руда':14,'Кварцевая руда':5},{'Кварцевая руда':8,'Рунная руда':1}];return Object.entries(costs[lv]);}
 var scale=Math.max(1,n),main=id==='library'||id==='alchemist'?GOODS.ink:id==='forge'||id==='warehouse'?GOODS.parts:GOODS.boards;
 var secondary=id==='barracks'||id==='inn'?GOODS.rations:id==='library'?GOODS.boards:GOODS.parts;
 if(main===secondary)secondary=GOODS.boards;
 return [[main,scale*2],[secondary,Math.max(1,n-1)]];
}
var RESEARCH=[
 {id:'provision',name:'Походная выучка',building:'inn',desc:'+4 HP, +2 MP и дополнительно +2% максимального HP и MP за ранг.',cost:[[GOODS.rations,2]],souls:8},
 {id:'wards',name:'Охранные руны',building:'library',desc:'На каждом новом этаже: щит 5% максимального HP за ранг. Дополнительно +3 щита на старте похода за ранг.',cost:[[GOODS.ink,2]],souls:8},
 {id:'salvage',name:'Бережливый разбор',building:'workshop',desc:'+10% металлолома при завершении сохранённой экспедиции за ранг.',cost:[[GOODS.parts,2]],souls:8}
];
var STORY=[
 {id:'first_fire',name:'Первый огонь',text:'Выполните первую партию обработки или обмена в мастерских.',metric:'crafted',target:1,reward:{souls:5,goods:[[GOODS.boards,2],[GOODS.parts,1]]}},
 {id:'hammer',name:'Снова слышен молот',text:'Восстановите кузницу до первого уровня.',building:'forge',target:1,reward:{souls:8,goods:[[GOODS.ink,3]]}},
 {id:'neighbors',name:'Надёжные соседи',text:'Выполните три заказа жителей.',metric:'orders',target:3,reward:{souls:12,goods:[[GOODS.rations,4],[GOODS.boards,4]]}},
 {id:'village',name:'Деревня оживает',text:'Получите суммарно десять уровней построек.',metric:'levels',target:10,reward:{souls:15,goods:[[GOODS.parts,6],[GOODS.ink,4]]}},
 {id:'roads',name:'Безопасные дороги',text:'Трижды вернитесь с добычей через безопасный выход.',metric:'returns',target:3,reward:{souls:20,goods:[[GOODS.boards,8],[GOODS.rations,6]]}},
 {id:'city',name:'Право на город',text:'Полностью улучшите все девять построек деревни: 45 уровней.',metric:'levels',target:45,reward:{souls:40,diamonds:10,charter:true}}
];
var ORDERS=[
 {id:'timber',name:'Плотнику нужны доски',text:'Передать две строевые доски.',deliver:[[GOODS.boards,2]],reward:{souls:7,goods:[[GOODS.parts,1]]},unlock:0},
 {id:'provisions',name:'Ужин для дозорных',text:'Передать две порции провизии.',deliver:[[GOODS.rations,2]],reward:{souls:7,goods:[[GOODS.ink,1]]},unlock:0},
 {id:'hunt',name:'Расчистить дорогу',text:'Победить 12 врагов после принятия заказа и безопасно вернуться.',metric:'kills',target:12,reward:{souls:12,goods:[[GOODS.boards,2]]},unlock:0},
 {id:'secrets',name:'Записки разведчика',text:'Найти две тайны после принятия заказа и безопасно вернуться.',metric:'secrets',target:2,reward:{souls:15,goods:[[GOODS.ink,3]]},unlock:4},
 {id:'metal',name:'Заказ кузнеца',text:'Передать четыре кованые детали.',deliver:[[GOODS.parts,4]],reward:{souls:14,goods:[[GOODS.boards,2],[GOODS.rations,2]]},unlock:7},
 {id:'caravan',name:'Проводник каравана',text:'Дважды безопасно вернуться после принятия заказа.',metric:'returns',target:2,reward:{souls:22,diamonds:1,goods:[[GOODS.parts,3]]},unlock:12}
];
function int(v){return Math.max(0,Math.floor(Number(v)||0));}
function ensure(m){if(!m.materials)m.materials={};if(!m.city)m.city={};if(!m.village)m.village={};var v=m.village;
 if(!v.counters)v.counters={};if(!v.story)v.story={};if(!v.active)v.active={};if(!v.cooldowns)v.cooldowns={};if(!v.research)v.research={};
 for(var k of ['crafted','orders','returns','losses','kills','secrets'])v.counters[k]=int(v.counters[k]);
 for(var id in BUILDINGS)m.city[id]=Math.min(5,int(m.city[id]));v.version=1;return v;}
function level(m,id){return Math.min(5,int((m.city||{})[id]));}
function levels(m){return Object.keys(BUILDINGS).reduce(function(n,k){return n+level(m,k);},0);}
function norm(x){return String(x).toLowerCase().replace(/ё/g,'е').trim();}
function amount(m,name){var key=norm(name);return Object.keys(m.materials||{}).reduce(function(n,k){return n+(norm(k)===key?int(m.materials[k]):0);},0);}
function canPay(m,cost){return !!cost&&cost.every(function(p){return amount(m,p[0])>=p[1];});}
function pay(m,cost){if(!canPay(m,cost))return false;cost.forEach(function(p){var left=p[1];Object.keys(m.materials).forEach(function(k){if(norm(k)!==norm(p[0])||!left)return;var n=Math.min(left,int(m.materials[k]));m.materials[k]-=n;left-=n;});});return true;}
function grant(m,reward){m.souls=int(m.souls)+(reward.souls||0);m.diamonds=int(m.diamonds)+(reward.diamonds||0);(reward.goods||[]).forEach(function(p){m.materials[p[0]]=int(m.materials[p[0]])+p[1];});if(reward.charter)ensure(m).charter=true;}
function build(m,id){ensure(m);var cost=buildingCost(m,id);if(!cost||!pay(m,cost))return false;m.city[id]=level(m,id)+1;return true;}
function output(m,recipe,qty){return Math.floor(recipe.output[1]*qty*(1+level(m,'workshop')*.1));}
function craft(m,id,qty){var v=ensure(m),recipe=RECIPES.find(function(x){return x.id===id;});qty=Number(qty==null?1:qty);if(!recipe||!Number.isInteger(qty)||qty<1||qty>10||level(m,recipe.work)<recipe.level)return false;var cost=recipe.cost.map(function(p){return [p[0],p[1]*qty];});if(!pay(m,cost))return false;m.materials[recipe.output[0]]=int(m.materials[recipe.output[0]])+output(m,recipe,qty);v.counters.crafted+=qty;return true;}
function research(m,id){var v=ensure(m),def=RESEARCH.find(function(x){return x.id===id;}),lv=int(v.research[id]);if(!def||lv>=3||level(m,def.building)<lv+1)return false;var souls=def.souls*(lv+1),cost=def.cost.map(function(p){return [p[0],p[1]*(lv+1)];});if(int(m.souls)<souls||!pay(m,cost))return false;m.souls-=souls;v.research[id]=lv+1;return true;}
function metric(m,def){var v=ensure(m);return def.building?level(m,def.building):def.metric==='levels'?levels(m):v.counters[def.metric]||0;}
function storyReady(m,id){var v=ensure(m),i=STORY.findIndex(function(x){return x.id===id;});return i>=0&&!v.story[id]&&(i===0||v.story[STORY[i-1].id])&&metric(m,STORY[i])>=STORY[i].target;}
function claimStory(m,id){if(!storyReady(m,id))return false;var v=ensure(m),q=STORY.find(function(x){return x.id===id;});v.story[id]=true;grant(m,q.reward);return true;}
function journey(m){var c=ensure(m).counters;return c.returns+c.losses;}
function accept(m,id){var v=ensure(m),q=ORDERS.find(function(x){return x.id===id;});if(!q||levels(m)<q.unlock||v.active[id]||Object.keys(v.active).length>=3||(v.cooldowns[id]!=null&&journey(m)<=v.cooldowns[id]))return false;v.active[id]={start:metric(m,q)};return true;}
function orderReady(m,id){var v=ensure(m),q=ORDERS.find(function(x){return x.id===id;}),a=v.active[id];return !!q&&!!a&&(q.deliver?canPay(m,q.deliver):metric(m,q)-a.start>=q.target);}
function claimOrder(m,id){if(!orderReady(m,id))return false;var v=ensure(m),q=ORDERS.find(function(x){return x.id===id;});if(q.deliver&&!pay(m,q.deliver))return false;delete v.active[id];v.cooldowns[id]=journey(m);v.counters.orders++;grant(m,Object.assign({},q.reward,{souls:q.reward.souls+level(m,'market')}));return true;}
function cancel(m,id){var v=ensure(m);if(!v.active[id])return false;delete v.active[id];return true;}
function record(m,r,safe){if(!r)return;var v=ensure(m);if(safe){var key=[r.actIndex||0,r.locationIndex||0,r.floor||1].join(':');if(!r.villageReturnKeys)r.villageReturnKeys={};if(r.villageReturnKeys[key])return;r.villageReturnKeys[key]=true;var prev=r.villageDeposited||{kills:0,secrets:0};v.counters.kills+=Math.max(0,int(r.kills)-int(prev.kills));v.counters.secrets+=Math.max(0,int(r.secrets)-int(prev.secrets));var result={kills:Math.max(0,int(r.kills)-int(prev.kills)),secrets:Math.max(0,int(r.secrets)-int(prev.secrets))};r.villageDeposited={kills:int(r.kills),secrets:int(r.secrets)};v.counters.returns++;return result;}else v.counters.losses++;}
function bonuses(m){var v=ensure(m);return {hpPct:int(v.research.provision)*2,mpPct:int(v.research.provision)*2,floorShieldPct:int(v.research.wards)*5,hp:int(v.research.provision)*4,mp:int(v.research.provision)*2,shield:level(m,'inn')*3+int(v.research.wards)*3,salvage:int(v.research.salvage)*10,retention:level(m,'warehouse')*5};}
function stage(m){var n=levels(m);return n>=45?'Деревня готова к городу':n>=25?'Укреплённое поселение':n>=10?'Растущая деревня':n>=3?'Пограничная деревня':'Лагерь у руин';}
function tradeOffer(name){if(Object.values(GOODS).some(function(k){return norm(k)===norm(name);})||/руда|воспомин|печать|чертеж|реликви|грамот|знак|трофей|сердц|ядро/i.test(name))return null;var id=/древес|дерев|ветв|лоза|корень|смола/i.test(name)?'boards':/запис|пыл|эссенц|сущност|пыльц|кристалл|янтарь/i.test(name)?'ink':/шкур|кож|клык|перо|перь|рог|желез|слиз|спор|яд|чешу/i.test(name)?'rations':'parts';return {cost:[[name,3]],output:[GOODS[id],1]};}
function exchange(m,name){ensure(m);var offer=tradeOffer(name);if(level(m,'market')<1||!offer||!pay(m,offer.cost))return false;m.materials[offer.output[0]]=int(m.materials[offer.output[0]])+1;return true;}
function category(name){if(Object.values(GOODS).includes(name))return 'Продукция мастерских';if(/руда|кварц|кристалл|обсидиан|песчаник/i.test(name))return 'Руда и минералы';if(/запис|воспомин|печать|осколок|эссенц|сущност/i.test(name))return 'Редкости и знания';return 'Сырьё подземелий';}
window.CryptVillage={goods:GOODS,buildings:BUILDINGS,recipes:RECIPES,output:output,researches:RESEARCH,story:STORY,orders:ORDERS,ensure:ensure,level:level,levels:levels,amount:amount,cost:buildingCost,canPay:canPay,pay:pay,build:build,craft:craft,research:research,storyReady:storyReady,claimStory:claimStory,accept:accept,orderReady:orderReady,claimOrder:claimOrder,cancel:cancel,record:record,bonuses:bonuses,metric:metric,journey:journey,stage:stage,category:category,tradeOffer:tradeOffer,exchange:exchange};
})();
