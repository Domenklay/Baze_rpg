/* Каменистое нагорье T1: кирка-оружие, добыча и шесть трёхузловых лучей. */
(function(){'use strict';
var ORES=[
 {id:'iron',name:'Железная руда',label:'Обычная',xp:1,unlock:1,hp:2},
 {id:'steel',name:'Стальная руда',label:'Необычная',xp:2,unlock:3,hp:5},
 {id:'quartz',name:'Кварцевая руда',label:'Редкая',xp:4,unlock:5,hp:9},
 {id:'rune',name:'Рунная руда',label:'Очень редкая',xp:8,unlock:7,hp:14}
];
/* Каждая ветвь развивается от центра: 3 последовательных узла, 5 уровней у каждого. */
var BRANCHES=[
 {name:'Точность',nodes:[
  ['accuracy','Меткость','Снижает шанс уклонения врага',3,'%'],
  ['critChance','Шанс крита','Шанс критического удара',2,'%'],
  ['critDamage','Критический урон','Усиление критических попаданий',7,'%']]},
 {name:'Сила',nodes:[
  ['flatDamage','Урон','Дополнительная физическая атака киркой',2,''],
  ['damagePct','Урон %','Усиление физического урона киркой',3,'%'],
  ['armorPen','Пробитие','Игнорирование брони цели',2,'']]},
 {name:'Натиск',nodes:[
  ['doubleHit','Двойной удар','Шанс второго удара без дополнительного хода',2,'%'],
  ['secondDamage','Второй удар','Усиление второго удара',6,'%'],
  ['stunChance','Оглушение','Шанс оглушить цель ударом кирки',2,'%']]},
 {name:'Стойкость',nodes:[
  ['maxHp','Живучесть','Максимум здоровья',6,''],
  ['damageReduction','Защита','Уменьшение получаемого урона',1,'%'],
  ['healOnKill','Кровь камня','Лечение за убитого врага',2,'']]},
 {name:'Добыча',nodes:[
  ['extraOre','Рудная удача','Шанс добыть дополнительный кусок',4,'%'],
  ['instantBreak','Точный скол','Шанс разбить жилу одним ударом',3,'%'],
  ['doubleOre','Двойная добыча','Шанс удвоить собранную руду',3,'%']]},
 {name:'Геология',nodes:[
  ['oreReveal','Зоркий геолог','Шанс заметить скрытую жилу',8,'%'],
  ['rareOre','Обогащение','Шанс добыть руду рангом выше',2,'%'],
  ['oreCache','Рудный тайник','Шанс получить ещё одну руду из жилы',3,'%']]}
];
var INDEX={};BRANCHES.forEach(function(b,bi){b.nodes.forEach(function(n,i){INDEX[n[0]]={branch:bi,depth:i,node:n};});});
/* Суммарные пороги опыта до уровней 2…10, без обнуления опыта. */
var XP=[0,0,5,13,25,41,61,86,116,151,191];
var HOUSE=[
 {'Железная руда':5},
 {'Железная руда':12,'Стальная руда':3},
 {'Стальная руда':8,'Кварцевая руда':2},
 {'Стальная руда':14,'Кварцевая руда':5},
 {'Кварцевая руда':8,'Рунная руда':1}
];
function active(r){return !!r&&r.actIndex===0&&r.locationIndex===1;}
function ensure(r){
 if(!r.mining||typeof r.mining!=='object')r.mining={level:1,xp:0,nodes:{},hits:0,total:0,pickGranted:false};
 var m=r.mining;if(!m.nodes)m.nodes={};
 m.level=Math.max(1,Math.min(10,Math.floor(Number(m.level)||1)));
 m.xp=Math.max(0,Math.floor(Number(m.xp)||0));
 m.hits=Math.max(0,Number(m.hits)||0);m.total=Math.max(0,Number(m.total)||0);
 return m;
}
function pickItem(r){return (r&&r.items||[]).find(function(i){return !!i.miningPick;})||null;}
function equipped(r){var it=pickItem(r);return !!it&&r.equip&&r.equip.weapon===it.id;}
function grantPick(r,newId){
 var mine=ensure(r),old=pickItem(r);
 if(old){mine.pickGranted=true;return old;}
 var p={id:newId,slot:'weapon',name:'Кирка рудокопа',miningPick:true,rarity:2,plus:0,atk:4,def:0,hp:0,mp:0,pow:0,crit:0,floor:1,fixed:true,trait:'Добыча руды и паутинка улучшений'};
 r.items.push(p);r.equip.weapon=p.id;mine.pickGranted=true;return p;
}
function nodeLevel(r,id){return Math.max(0,Math.min(5,Math.floor(Number(ensure(r).nodes[id])||0)));}
function bonus(r,id){var def=INDEX[id];return def&&equipped(r)?nodeLevel(r,id)*def.node[3]:0;}
function miningPower(r){return ensure(r).level;}
function damagePct(r){return equipped(r)?ensure(r).level+bonus(r,'damagePct'):0;}
function oreName(id){var o=ORES.find(function(x){return x.id===id||x.name===id;});return o&&o.name;}
function isOreName(name){return ORES.some(function(x){return x.name===name;});}
function available(r,id){return Math.max(0,Math.floor(Number((r.materials||{})[oreName(id)])||0));}
function cost(r,id){
 var d=INDEX[id];if(!d)return null;
 var current=nodeLevel(r,id),next=current+1;if(next>5)return null;
 var need={};need[ORES[d.depth].name]=next;
 if(d.depth===2&&next===5)need[ORES[3].name]=1;
 return need;
}
function canUpgrade(r,id){
 var d=INDEX[id],m=ensure(r);if(!d||nodeLevel(r,id)>=5)return {ok:false,message:'Узел уже изучен'};
 if(d.depth>0&&nodeLevel(r,BRANCHES[d.branch].nodes[d.depth-1][0])===0)return {ok:false,message:'Сначала откройте предыдущий узел'};
 var need=cost(r,id);
 for(var name in need)if(available(r,name)<need[name])return {ok:false,message:'Не хватает: '+name+' ×'+need[name]};
 return {ok:true,need:need};
}
function upgradeNode(r,id){
 var result=canUpgrade(r,id);if(!result.ok)return result;
 var m=ensure(r);Object.keys(result.need).forEach(function(name){r.materials[name]-=result.need[name];});
 m.nodes[id]=nodeLevel(r,id)+1;
 return {ok:true,message:INDEX[id].node[1]+': '+m.nodes[id]+'/5'};
}
function gainXP(r,amount){
 var m=ensure(r),old=m.level;m.xp+=Math.max(0,Math.floor(amount)||0);
 while(m.level<9&&m.xp>=XP[m.level+1])m.level++;
 return m.level-old;
}
function levelReady(r){var m=ensure(r);return m.level===9&&m.xp>=XP[10];}
function upgradeTenth(r){
 var m=ensure(r),name=ORES[3].name;
 if(m.level>=10)return {ok:false,message:'Уровень кирки максимальный'};
 if(!levelReady(r))return {ok:false,message:'Сначала добудьте опыт до уровня 10'};
 if(available(r,name)<1)return {ok:false,message:'Для 10-го уровня нужна 1 рунная руда'};
 r.materials[name]--;m.level=10;return {ok:true,message:'Кирка достигла 10-го уровня'};
}
function rollVein(floor,rng){
 var x=(rng||Math.random)()*100;
 if(floor<6)return x<87?0:1;
 if(floor<12)return x<68?0:x<95?1:2;
 if(floor<22)return x<55?0:x<83?1:x<98?2:3;
 return x<43?0:x<73?1:x<94?2:3;
}
function newVein(floor,rng){var type=rollVein(floor,rng);return {type:type,hp:ORES[type].hp};}
function harvest(r,tile,rng,houseLevel){
 if(!active(r)||!tile||tile.kind!=='ore-vein'||!tile.revealed||tile.cleared)return {ok:false,message:'Здесь нет доступной руды'};
 if(!equipped(r))return {ok:false,message:'Наденьте кирку в слот оружия'};
 var m=ensure(r),vein=tile.mine||newVein(r.floor||1,rng),ore=ORES[vein.type],ridge=window.CryptRidgeEvents,
 mods=ridge&&ridge.mineBonuses(r)||{extra:0,rare:0,instant:0,extraQty:0};
 if(m.level<ore.unlock)return {ok:false,message:ore.name+': требуется кирка уровня '+ore.unlock};
 var chance=(rng||Math.random),instant=chance()*100<(bonus(r,'instantBreak')+(mods.instant||0));
 if(r.ridge&&r.ridge.instantOre>0){instant=true;r.ridge.instantOre--;}
 vein.hp=Math.max(0,vein.hp-(instant?vein.hp:miningPower(r)));
 tile.mine=vein;m.hits++;
 if(vein.hp>0)return {ok:true,finished:false,remaining:vein.hp,message:'Жила повреждена: осталось прочности '+vein.hp};
 var type=vein.type;
 if(type<3&&chance()*100<(bonus(r,'rareOre')+(mods.rare||0)))type++;
 var picked=ORES[type],qty=1;
 if(chance()*100<(bonus(r,'extraOre')+(mods.extra||0)))qty++;
 qty+=(mods.extraQty||0);
 if(chance()*100<bonus(r,'doubleOre'))qty*=2;
 if(chance()*100<bonus(r,'oreCache'))qty++;
 if(houseLevel&&chance()*100<Math.min(25,Math.max(0,houseLevel)*5))qty++;
 r.materials=r.materials||{};r.materials[picked.name]=(r.materials[picked.name]||0)+qty;
 m.total+=qty;var xp=qty*picked.xp;var levels=gainXP(r,xp);
 if(ridge)ridge.mined(r);
 tile.cleared=true;return {ok:true,finished:true,ore:picked.name,qty:qty,xp:xp,levels:levels,message:'Добыто: '+picked.name+' ×'+qty+' · +'+xp+' опыта кирки'+(levels?' · уровень +'+levels:'')};
}
function revealHints(r,rng){
 if(!active(r)||!r.tiles)return 0;
 var chance=bonus(r,'oreReveal');if(chance<=0)return 0;
 var revealed=0;
 (r.tiles||[]).forEach(function(t){if(t.kind==='ore-vein'&&!t.revealed&&(rng||Math.random)()*100<chance){t.hintOre=true;revealed++;}});
 return revealed;
}
function houseCost(level){return HOUSE[Math.max(0,Math.min(4,Math.floor(level)||0))]||null;}
function canBuild(materials,level){var need=houseCost(level);return !!need&&Object.keys(need).every(function(name){return (materials[name]||0)>=need[name];});}
function build(materials,level){
 var need=houseCost(level);if(!need||!canBuild(materials,level))return false;
 Object.keys(need).forEach(function(name){materials[name]-=need[name];});return true;
}
function e(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function render(r,tab,selected){
 var m=ensure(r),p=pickItem(r),ready=levelReady(r),isWorn=equipped(r);
 var header='<div class="mine-summary"><span class="mine-emblem">⚒</span><div><b>Кирка рудокопа · ур. '+m.level+'/10</b><small>'+(isWorn?'Надета · все бонусы действуют':'Не надета · боевые бонусы выключены')+'</small></div></div>';
 var tabs='<div class="mine-tabs"><button data-action="mine-tab" data-id="level" class="'+(tab!=='web'?'selected':'')+'">Кирка</button><button data-action="mine-tab" data-id="web" class="'+(tab==='web'?'selected':'')+'">Паутинка · 18 узлов</button></div>';
 if(tab!=='web'){
  var next=XP[m.level+1]||XP[10],prev=XP[m.level]||0,p=Math.max(0,Math.min(100,Math.floor(100*(m.xp-prev)/Math.max(1,next-prev))));
  var body='<div class="mine-stat-grid"><span><strong>'+m.level+'</strong><small>Сила добычи</small></span><span><strong>+'+m.level+'%</strong><small>Урон кирки</small></span><span><strong>'+m.total+'</strong><small>Всего добыто</small></span></div>'+
  '<div class="mine-xp"><b>Опыт кирки: '+m.xp+(m.level<10?' / '+next:' (максимум)')+'</b><div><i style="width:'+(m.level>=10?100:p)+'%"></i></div></div>'+
  (ready?'<button class="btn gold wide" data-action="mine-level-up"'+(available(r,'rune')<1?' disabled':'')+'>Улучшить до 10 ур. · Рунная руда ×1</button>':'')+
  '<p class="fine muted">Уровни 2–9 растут автоматически от добычи. Для 10-го уровня нужна 1 рунная руда и достаточно опыта.</p>'+
  '<div class="mine-ore-list">'+ORES.map(function(x){return '<div><span class="mine-ore-dot ore-'+x.id+'"></span><span>'+e(x.name)+'<small>'+x.label+' · +'+x.xp+' опыта</small></span><b>×'+available(r,x.name)+'</b></div>';}).join('')+'</div>'+
  '<p class="fine muted">Эта руда также используется в паутинке и на базе для улучшения Шахтного двора. Добыча требует надетой кирки и расходует ходы.</p>';
  return header+tabs+body;
 }
 var nodes=BRANCHES.map(function(b,bi){return b.nodes.map(function(n,depth){
  var angle=(-90+bi*60)*Math.PI/180,radius=[21,32,43][depth],x=(50+radius*Math.cos(angle)).toFixed(2),y=(50+radius*Math.sin(angle)).toFixed(2),lv=nodeLevel(r,n[0]),closed=depth>0&&nodeLevel(r,b.nodes[depth-1][0])===0;
  return '<button class="mine-web-node '+(selected===n[0]?'selected ':'')+(closed?'locked ':'')+(lv===5?'maxed':'')+'" style="left:'+x+'%;top:'+y+'%" data-action="mine-node" data-id="'+n[0]+'" title="'+e(n[1])+' · '+lv+'/5"><span>'+e(n[1].slice(0,1))+'</span><small>'+lv+'/5</small></button>';
 }).join('');}).join('');
 var lines=BRANCHES.map(function(b,bi){var angle=(-90+bi*60)*Math.PI/180,x=(50+43*Math.cos(angle)).toFixed(2),y=(50+43*Math.sin(angle)).toFixed(2);return '<i class="mine-ray" style="--ray-angle:'+(bi*60-90)+'deg"></i>';}).join('');
 var chosen=INDEX[selected]||INDEX.accuracy,chosenId=INDEX[selected]?selected:'accuracy',level=nodeLevel(r,chosenId),result=canUpgrade(r,chosenId),need=cost(r,chosenId);
 var detail='<div class="mine-node-detail"><b>'+e(chosen.node[1])+' · '+level+'/5</b><small>'+e(chosen.node[2])+'</small><p>Бонус: +'+(level*chosen.node[3])+chosen.node[4]+' · максимум +'+(5*chosen.node[3])+chosen.node[4]+'</p>'+
 (need?'<p>Следующий уровень: '+Object.keys(need).map(function(k){return e(k)+' ×'+need[k];}).join(' + ')+'</p>':'<p>Максимальный уровень</p>')+
 '<button class="btn gold wide" data-action="mine-upgrade" data-id="'+chosenId+'"'+(result.ok?'':' disabled')+'>'+(result.ok?'Улучшить узел':e(result.message))+'</button></div>';
 return header+tabs+'<p class="fine muted">Выберите узел. Каждый луч открывается от центра; каждый навык имеет пять уровней.</p>'+
 '<div class="mine-web">'+lines+'<div class="mine-web-core">⚒<small>'+m.level+'/10</small></div>'+nodes+'</div><div class="mine-branch-legend">'+BRANCHES.map(function(b){return '<span>'+e(b.name)+'</span>';}).join('')+'</div>'+detail;
}
window.CryptMining={ORES:ORES,BRANCHES:BRANCHES,XP:XP,active:active,ensure:ensure,pickItem:pickItem,equipped:equipped,grantPick:grantPick,nodeLevel:nodeLevel,bonus:bonus,damagePct:damagePct,miningPower:miningPower,isOreName:isOreName,available:available,cost:cost,canUpgrade:canUpgrade,upgradeNode:upgradeNode,gainXP:gainXP,levelReady:levelReady,upgradeTenth:upgradeTenth,rollVein:rollVein,newVein:newVein,harvest:harvest,revealHints:revealHints,houseCost:houseCost,canBuild:canBuild,build:build,render:render};
})();