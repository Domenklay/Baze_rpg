/* Active five-rank title rules (65 nodes): source catalogue is separate from mechanics. */
(function(){
'use strict';
var data=(window.CryptGumballsTitleReference||[]).map(function(t){
 return Object.assign({},t,{desc:t.mechanic+' '+t.stats,icon:t.tree===2?'◈':t.tree===1?'✣':'⚔',max_level:t.rank===5?1:3});
});
var byId={};data.forEach(function(t){byId[t.id]=t;});
window.CryptTitles=data;
var spellRewards={
 mag_apprentice:['ward',3],mag_black:['flame',3],mag_white:['heal',3],
 mag_wizard:['meteor',2],mag_conjuror:['shadows',3],mag_priest:['holy',3],
 mag_bishop:['ward',3],mag_fire:['flame',5],mag_dark:['shadows',4],
 mag_earth:['earthquake',2],mag_air:['chain',5],mag_light:['holy',4],mag_water:['frost',3],
 war_dancer:['flame',1],war_great_sword:['stormchain',1],war_faith:['ward',1]
};
function level(r,id){return r&&r.talents?Math.max(0,Number(r.talents[id])||0):0;}
function has(r,id){return level(r,id)>0;}
function rank5(r,id,key){return Math.max(0,Math.min(3,Number(r.titleMastery&&r.titleMastery[id]&&r.titleMastery[id][key])||0));}
function masterKeys(t){if(t.tree===1)return t.id==='mag_light_bishop'?['pow','atk','hp']:['pow','mp','hp'];if(t.tree===2)return t.id.indexOf('rune')>=0||t.id==='adv_great_enchanter'?['pow','hp','mp']:t.id.indexOf('blacksmith')>=0||t.id==='adv_great_swordsmith'?['atk','hp','mp']:['atk','pow','hp'];return t.id==='war_warrior'||t.id==='war_commander'?['atk','mp','hp']:['atk','pow','hp'];}
function statBonuses(r){
 var st={atk:0,hp:0,mp:0,pow:0,def:0};
 data.forEach(function(t){
  var n=level(r,t.id);if(!n)return;
  if(t.rank===5){masterKeys(t).forEach(function(k){var lv=rank5(r,t.id,k);st[k]+=lv*(k==='atk'||k==='pow'?3:k==='hp'?60:40);});return;}
  var re=/(Атака|магия|Магия|HP|MP|Броня)\s*\+(\d+(?:\/\d+)*)/gi;
  var m;while((m=re.exec(t.stats))!==null){
   var k=/^атака$/i.test(m[1])?'atk':/^магия$/i.test(m[1])?'pow':m[1].toLowerCase();
   var vals=m[2].split('/').map(Number);
   st[k]+=vals[Math.min(Math.max(1,n),vals.length)-1];
  }
 });
 if(r.titleSupplies&&r.titleSupplies.license){st.atk+=2*r.titleSupplies.license;st.pow+=2*r.titleSupplies.license;}
 return st;
}
function init(r){
 if(!r)return;
 if(r.titleVersion!==2){
  var old=r.talents||{},legacy=Object.keys(old).filter(function(id){return !byId[id]&&old[id]>0;});
  if(legacy.length){
   r.legacyTitles=Object.assign({},old);
   var original=window.CryptLegacyTitles||[],main=r.class==='necromancer'||r.class==='sorceress'?1:r.class==='executioner'||r.class==='guardian'?0:2;
   var returned=0;
   legacy.forEach(function(id){var oldTitle=original.find(function(t){return t.id===id;});if(!oldTitle)return;
    for(var i=0;i<old[id];i++){var val=2+oldTitle.rank*3+i*3;returned+=oldTitle.tree===main?val:Math.ceil(val*1.25);}
   });
   r.ep=(r.ep||0)+returned;r.legacyTitleRefund=returned;
  }
  r.talents={};r.titleVersion=2;
 }
 if(!r.titleMastery)r.titleMastery={};
 if(!r.titleSupplies)r.titleSupplies={};
 if(!r.titleFlags)r.titleFlags={};
 if(!r.titleFloorAtk)r.titleFloorAtk=0;
 if(!r.titleHealAtk)r.titleHealAtk=0;
 if(!r.titleTurnTick)r.titleTurnTick=0;
}
function pathConflict(r,t){
 return data.some(function(x){return x.tree===t.tree&&x.rank===t.rank&&x.id!==t.id&&has(r,x.id);});
}
function unlocked(r,t){
 if(pathConflict(r,t))return false;
 return t.rank===1||(t.parents||[]).some(function(id){return has(r,id);});
}
function cost(r,t){
 var n=level(r,t.id);var raw=t.rank===5?500:(t.ep_cost||[])[Math.min(2,n)]||500;
 var noble=(r.titleSupplies&&r.titleSupplies.noble)||0;
 return Math.max(1,Math.ceil(raw*(1-Math.min(.45,noble*.05))));
}
function supply(r,key,amount){r.titleSupplies=r.titleSupplies||{};r.titleSupplies[key]=(r.titleSupplies[key]||0)+amount;}
function curSup(r,key){return (r.titleSupplies&&r.titleSupplies[key])||0;}
function reward(r,t,levelNum,h){
 var got=spellRewards[t.id];if(got)h.grant(got[0],got[1],'title');
 if(t.id==='mag_planar')h.grant('earthgate',1,'title');
 if(t.id==='adv_magic_bandit')supply(r,'noble',1);
 if(t.id==='adv_treasure_hunter')supply(r,'hunter_piece',1);
 if(t.id==='adv_royal_rune')supply(r,'rune_piece',1);
 if(t.id==='adv_royal_blacksmith')supply(r,'smith_piece',1);
 if(t.id==='adv_weapon_master'){supply(r,'license',1);}
 if(t.id==='adv_elven_ranger')supply(r,'leopard',1);
 if(t.id==='adv_demon_hunter')supply(r,'arrow',3+2*levelNum);
 if(t.id==='war_faith'){supply(r,'holy_badge',1);r.guardCharges=(r.guardCharges||0)+1;}
 if(t.id==='war_dancer'||t.id==='war_great_sword')supply(r,'sword_scroll',1);
 if(t.id==='war_commander'&&levelNum===1)h.addItem('amulet',6);
 if(t.id==='war_paladin'&&levelNum===1){r.hp=Math.ceil(h.stats().hp*1.1);r.titlePaladinBonus=.10;}
 if(t.id==='war_sword_sage'&&levelNum===1)r.titleSageBonus=.30;
 if(t.rank===5&&t.tree===2){var tool=toolOf(r);supply(r,tool.icon==='crossbow'?'arrow':tool.icon==='lantern'?'wick':'quench',2);}
 if(t.id==='adv_farplane'&&levelNum===1)h.log('Особая специализация: '+(has(r,'adv_night_walker')?'извлечение душ из останков':'души павших врагов')+'.');
 if(t.id==='adv_legendary_hunter'&&levelNum===1)supply(r,'arrow',3);
}
function upgraded(r,t,h){
 var old=h.stats(),n=level(r,t.id);
 r.talents[t.id]=n+1;
 reward(r,t,n+1,h);
 var now=h.stats();
 r.hp=Math.min(now.hp,r.hp+Math.max(0,now.hp-old.hp));
 r.mp=Math.min(now.mp,r.mp+Math.max(0,now.mp-old.mp));
 return n+1;
}
function masteryUpgrade(r,t,key,h){
 var choices=masterKeys(t);if(!has(r,t.id)||choices.indexOf(key)<0||rank5(r,t.id,key)>=3)return false;
 var costVal=cost(r,t);if(r.ep<costVal)return false;
 var old=h.stats();
 r.ep-=costVal;
 if(!r.titleMastery[t.id])r.titleMastery[t.id]={};
 r.titleMastery[t.id][key]=(r.titleMastery[t.id][key]||0)+1;
 var now=h.stats();
 r.hp=Math.min(now.hp,r.hp+Math.max(0,now.hp-old.hp));
 r.mp=Math.min(now.mp,r.mp+Math.max(0,now.mp-old.mp));
 if(t.tree===2){var tool=toolOf(r);supply(r,tool.icon==='crossbow'?'arrow':tool.icon==='lantern'?'wick':'quench',2);}
 if(t.id==='mag_planar')h.grant('earthgate',1,'title');
 if(t.id==='mag_destruction'&&key==='hp')h.grant('flame',5,'title');
 if(t.id==='mag_time'){h.grant(key==='pow'?'chain':key==='mp'?'lightning':'curse',key==='pow'?2:key==='mp'?5:3,'title');}
 if(t.id==='war_commander'&&key==='atk')h.addItem('amulet',6);
 h.log('Усилено звание «'+t.name+'»: '+key+' '+rank5(r,t.id,key)+'/3.');
 return true;
}
function toolOf(r){
 if(has(r,'adv_blacksmith'))return {name:has(r,'adv_holy_blacksmith')?'Священная наковальня':has(r,'adv_great_swordsmith')?'Кузнечная наковальня':'Кузнечная наковальня',icon:'anvil',kind:'forge'};
 if(has(r,'adv_rune_master'))return {name:has(r,'adv_holy_rune')?'Арканный тигель':has(r,'adv_great_enchanter')?'Тигель зачарователя':'Магический тигель',icon:'crucible',kind:'rune'};
 if(has(r,'adv_demon_hunter'))return {name:has(r,'adv_farplane')?'Загробный арбалет':has(r,'adv_elf_king')?'Королевский арбалет':has(r,'adv_legendary_hunter')?'Легендарный арбалет':'Арбалет охотника',icon:'crossbow',kind:'bow'};
 if(has(r,'adv_night_walker'))return {name:has(r,'adv_farplane')?'Загробный фонарь':has(r,'adv_god_thieves')?'Воровской фонарь':has(r,'adv_elf_king')?'Эльфийский фонарь':'Фонарь странника',icon:'lantern',kind:'lantern'};
 return null;
}
function undead(e){return /нежит|скел|мертв|лич|зомб|труп|костян|призрак/i.test((e&&e.name)||'');}
function floor(r,h){
 init(r);r.titleFloorAtk=0;r.titleHealAtk=0;
 if(has(r,'adv_explorer'))r.ep+=10+5*(level(r,'adv_explorer')-1);
 if(has(r,'adv_explorationist'))r.hp=Math.min(h.stats().hp,r.hp+6+3*(level(r,'adv_explorationist')-1));
 if(has(r,'mag_priest')){var b=3*level(r,'mag_priest');r.hp=Math.min(h.stats().hp,r.hp+b);r.mp=Math.min(h.stats().mp,r.mp+b);}
 if(has(r,'adv_treasure_hunter'))r.ep+=5*level(r,'adv_treasure_hunter');
 if(has(r,'adv_night_walker')&&Math.random()<.2+.17*level(r,'adv_night_walker')){var key=r.tiles.find(function(t){return t.hasKey||t.drops&&t.drops.key;});if(key){key.hinted=true;h.log('Фонарь указывает на камень, за которым спрятан ключ.');}}
 if(has(r,'adv_seeker')){var mobs=r.tiles.filter(function(t){return t.foe&&t.foe.hp>0;});for(var i=0;i<Math.min(mobs.length,2+level(r,'adv_seeker'));i++){mobs[i].hinted=true;}}
 if(has(r,'adv_god_thieves')){r.tiles.filter(function(t){return t.kind==='chamber'||t.kind==='secret';}).forEach(function(t){t.hinted=true;});}
 if(has(r,'adv_elf_king')&&has(r,'adv_demon_hunter'))autoShot(r,h,25+10*rank5(r,'adv_elf_king','atk'),true);
}
function autoShot(r,h,power,hidden){
 var target=(hidden&&h.hiddenTargets?h.hiddenTargets():h.targets()).find(function(t){return t.foe&&t.foe.hp>0&&(hidden||h.reachable(t));});if(!target)return false;
 var dmg=Math.max(1,Math.ceil(power)-target.foe.def);target.foe.hp-=dmg;
 h.log('Арбалет охотника поражает '+target.foe.name+': '+dmg+'.');
 if(target.foe.hp<=0)h.kill(target);
 return true;
}
function turn(r,h){
 r.titleTurnTick=(r.titleTurnTick||0)+1;
 if(has(r,'adv_legendary_hunter')&&r.titleTurnTick%5===0)autoShot(r,h,Math.max(10,Math.ceil(h.stats().atk*.6)));
 var alive=h.targets().filter(function(t){return t.foe&&t.foe.hp>0&&h.reachable(t);});
 if(alive.length&&r.titleDarkSoulTurns>0){
  r.titleDarkSoulTurns--;
  var t=alive[0],damage=Math.max(1,Math.round(h.stats().atk*(.10+.10*level(r,'war_shadow')))-t.foe.def);
  t.foe.hp-=damage;h.log('Тёмная душа атакует: '+damage+'.');if(t.foe.hp<=0)h.kill(t);
 }
 if(alive.length&&r.titleTotemTurns>0){
  r.titleTotemTurns--;
  var v=alive[0],amount=Math.max(1,Math.floor(h.stats().pow*.5)-v.foe.def);
  v.foe.hp-=amount;h.log('Тотем наносит '+amount+' урона.');if(v.foe.hp<=0)h.kill(v);
 }
 if(alive.length&&curSup(r,'leopard')>0&&r.titleTurnTick%(has(r,'adv_elf_king')?2:3)===0){
  var g=alive[0],hit=Math.max(1,Math.floor(h.stats().atk*.5)+curSup(r,'leopard')*2-g.foe.def);
  g.foe.hp-=hit;h.log('Чёрная пантера наносит '+hit+' урона.');if(g.foe.hp<=0)h.kill(g);
 }
}
function onKill(r,e,drop,h){
 if(has(r,'war_silver'))r.hp=Math.min(h.stats().hp,r.hp+level(r,'war_silver'));
 if(has(r,'war_royal'))r.titleFloorAtk=(r.titleFloorAtk||0)+level(r,'war_royal');
 if(has(r,'war_shadow'))r.titleDarkSoulTurns=Math.max(r.titleDarkSoulTurns||0,1+level(r,'war_shadow'));
 if(has(r,'mag_conjuror'))r.titleTotemTurns=Math.max(r.titleTotemTurns||0,3*level(r,'mag_conjuror'));
 if(has(r,'adv_farplane')&&has(r,'adv_demon_hunter')&&Math.random()<.15+.10*rank5(r,'adv_farplane','atk'))drop.soul={kind:e.boss||e.elite?'elite':'common',name:'Душа '+e.name};
 if(has(r,'adv_treasure_hunter'))r.ep+=curSup(r,'hunter_piece')*2;
 if(has(r,'war_dragon')&&Math.random()<(0.1+.1*level(r,'war_dragon')))h.cross(e,Math.ceil(h.stats().atk*.65));
 if(has(r,'war_duke')&&Math.random()<.1)h.cross(e,Math.ceil(h.stats().atk*.7));
 if(has(r,'war_light_arbiter')&&Math.random()<.1)h.flash(Math.max(8,h.stats().pow*2));
}
function beforeAttack(r){return has(r,'war_novice')&&Math.random()<.05+.05*level(r,'war_novice');}
function attack(r,e,dmg,h){
 if(has(r,'adv_demon_hunter')&&undead(e))dmg=Math.ceil(dmg*(1+.05+.05*level(r,'adv_demon_hunter')));
 if(has(r,'war_templar')&&undead(e))dmg=Math.ceil(dmg*(1+.25*level(r,'war_templar')));
 if(has(r,'war_warrior')&&e.boss)dmg=Math.ceil(dmg*1.5);
 if(has(r,'war_magic')&&Math.random()<.05+.05*level(r,'war_magic'))dmg+=h.stats().pow;
 if(has(r,'war_dancer')&&curSup(r,'sword_scroll')>0&&Math.random()<.08){supply(r,'sword_scroll',-1);dmg=Math.ceil(dmg*1.45);h.log('Техника мастера меча усилила удар.');}
 if(has(r,'war_dark_arbiter')&&Math.random()<.05)h.flash(Math.max(6,h.stats().pow*1.2));
 if(has(r,'war_hell')&&Math.random()<.05)h.flash(Math.max(12,h.stats().pow*2));
 if(has(r,'war_titan')&&Math.random()<.05)e.stun=Math.max(e.stun||0,1);
 if(has(r,'adv_great_enchanter')&&has(r,'adv_rune_master'))dmg+=Math.max(1,Math.round(h.stats().pow*.35));
 return dmg;
}
function incoming(r,e,damage){
 if(e&&e.ranged&&has(r,'war_heavy'))damage*=1-(.1+.1*level(r,'war_heavy'));
 return Math.max(1,Math.ceil(damage));
}
function counterImmune(r){return has(r,'adv_great_swordsmith')&&has(r,'adv_rune_master')&&Math.random()<.15;}
function spellMultiplier(r,sp){
 var n=has(r,'mag_fire')&&sp.school==='fire'?level(r,'mag_fire'):has(r,'mag_dark')&&sp.school==='dark'?level(r,'mag_dark'):has(r,'mag_earth')&&sp.school==='earth'?level(r,'mag_earth'):has(r,'mag_air')&&sp.school==='air'?level(r,'mag_air'):has(r,'mag_light')&&sp.school==='light'?level(r,'mag_light'):has(r,'mag_water')&&sp.school==='water'?level(r,'mag_water'):0;
 var result=1+n*.1+(n? .1:0);
 if(has(r,'mag_elements')&&['attack','burn','stun','drain','chain','aoe','burnall','freezeall','holy','weakness','drainall','earthquake'].indexOf(sp.kind)>=0)result+=.30+.10*(rank5(r,'mag_elements','pow')+rank5(r,'mag_elements','mp')+rank5(r,'mag_elements','hp'));
 if(has(r,'mag_legendary')&&['heal','shield','healshield','lastlight','timestop','reveal'].indexOf(sp.kind)>=0)result+=.30+.10*rank5(r,'mag_legendary','pow');
 if(has(r,'mag_light_bishop')&&['heal','healshield','lastlight'].indexOf(sp.kind)>=0)result+=.30;
 if(has(r,'mag_dark_priest')&&sp.school==='dark'&&Math.random()<.5)result*=2;
 if(has(r,'mag_pope')&&sp.school==='light'&&sp.kind==='holy')result*=2;
 return result;
}
function spellCast(r,sp,h){
 if(has(r,'mag_bishop')&&['heal','healshield','lastlight'].indexOf(sp.kind)>=0)r.titleHealAtk=Math.max(r.titleHealAtk||0,5*level(r,'mag_bishop'));
 if(has(r,'mag_time')&&sp.school==='air'&&!h.targets().some(function(t){return t.foe&&t.foe.boss&&t.foe.hp>0;})&&Math.random()<.5)r.timeStopTurns=(r.timeStopTurns||0)+1;
 if(has(r,'mag_archbishop')&&(sp.kind==='shield'||sp.kind==='healshield')&&Math.random()<.15)r.shield+=Math.ceil(h.stats().pow*3);
 if(has(r,'mag_destruction')&&sp.id==='flame'&&Math.random()<(.12+.06*rank5(r,'mag_destruction','pow')))h.flash(Math.ceil(h.stats().pow*2));
 if(has(r,'mag_wizard')&&['attack','burn','stun','drain','chain','aoe','burnall','freezeall','holy','weakness','drainall'].indexOf(sp.kind)>=0&&Math.random()<.1+.1*level(r,'mag_wizard'))h.flash(Math.ceil(h.stats().pow*.6));
 /* Light Bishop/Pope repeated hit is applied to the spell's original target in spellMultiplier. */
}
function scrollCount(r,sp,count,source){
 if(source==='title'||source==='forge')return count;
 if(has(r,'adv_rune_master')&&sp.rank<=3&&Math.random()<.1+.1*level(r,'adv_rune_master'))return count*2;
 return count;
}
function canCast(r,sp){
 if(sp.rank<=2||sp.rank===6)return null;
 if(level(r,'mag_apprentice')>0&&sp.rank<=2+level(r,'mag_apprentice'))return null;
 var caster=has(r,'war_magic')?['earth','fire','dark']:has(r,'war_dancer')?['fire','air','dark']:has(r,'war_silver')?['earth','water','light']:has(r,'war_faith')?['water','air','light']:[];
 if(caster.indexOf(sp.school)>=0&&sp.rank<=2+Math.max(level(r,'war_magic'),level(r,'war_dancer'),level(r,'war_silver'),level(r,'war_faith')))return null;
 return 'Для свитка '+sp.rank+'★ нужно магическое или воинское звание';
}
function corpse(r,entry,h){
 if(has(r,'adv_farplane')&&has(r,'adv_night_walker')){
  h.addSoul({kind:'unique',name:entry.soul,storyId:entry.id});return true;
 }
 return false;
}
function onScrap(r,it,h){
 if(has(r,'adv_blacksmith')){supply(r,'quench',Math.max(1,Math.ceil(it.rarity/2)));h.log('Наковальня получила закалочную эссенцию.');}
 if(has(r,'adv_royal_blacksmith'))r.ep+=curSup(r,'smith_piece')*5;
 if(has(r,'adv_royal_rune'))r.mp=Math.min(h.stats().mp,r.mp+curSup(r,'rune_piece')*3);
}
function useTool(r,h){
 var tool=toolOf(r);if(!tool)return 'Сначала изучите звание III ранга авантюриста.';
 if(tool.kind==='lantern'){
  if(curSup(r,'wick')<=0)return 'Нужен фитиль фонаря.';
  var t=r.tiles.find(function(t){return !t.revealed&&(t.kind==='secret'||t.kind==='chamber'||t.hasKey);});
  if(!t)return 'Скрытых особых плит не осталось.';
  supply(r,'wick',-1);t.hinted=true;return 'Фонарь отметил необычную плиту.';
 }
 if(tool.kind==='bow'){
  if(curSup(r,'arrow')<=0)return 'Не хватает стрел.';
  var target=h.targets().find(function(t){return t.foe&&t.foe.hp>0&&h.reachable(t);});
  if(!target)return 'Нет доступной цели.';
  supply(r,'arrow',-1);h.hit(target,Math.round(h.stats().atk*(has(r,'adv_legendary_hunter')?1.4:1)));return 'Арбалет выстрелил по '+target.foe.name+'.';
 }
 if(tool.kind==='rune'){
  var candidates=Object.keys(r.scrolls).map(function(id){return h.spells.find(function(x){return x.id===id&&x.rank<5&&(r.scrolls[id]||0)>=2;});}).filter(Boolean);
  if(!candidates.length)return 'Нужно два одинаковых свитка ниже 5-го ранга.';
  var sp=candidates[0],next=h.spells.filter(function(x){return x.rank===sp.rank+1&&x.rank<=5;});
  if(!next.length)return 'Подходящий свиток для объединения не найден.';
  if(!has(r,'adv_holy_rune'))return 'Объединение свитков открывается Святым мастером рун.';
  r.scrolls[sp.id]-=2;h.grant(next[0].id,1,'forge');return 'Два свитка преобразованы в '+next[0].name+'.';
 }
 if(tool.kind==='forge'){
  if(has(r,'adv_great_enchanter')||has(r,'adv_great_swordsmith')){
   var kind=has(r,'adv_great_enchanter')?'pow':'atk',target=(r.items||[]).find(function(it){return Object.keys(r.equip||{}).some(function(slot){return r.equip[slot]===it.id;})&&(it.plus||0)<9;});
   if(!target)return 'Нужно надетое улучшаемое снаряжение.';
   if(curSup(r,'quench')<2)return 'Нужно 2 закалочные эссенции.';
   supply(r,'quench',-2);target.plus=(target.plus||0)+1;target[kind]=(target[kind]||0)+2;
   return 'Наковальня усилила «'+target.name+'» до +'+target.plus+'.';
  }
  if(!has(r,'adv_holy_blacksmith'))return 'Создание реликвий открывается Святым кузнецом.';
  if(curSup(r,'quench')<3)return 'Нужно 3 закалочные эссенции.';
  supply(r,'quench',-3);h.addItem('amulet',6);return 'Наковальня создала редкую реликвию.';
 }
 return 'Этот предмет работает автоматически.';
}
window.CryptTitlesRuntime={data:data,level:level,has:has,init:init,rank5:rank5,masterKeys:masterKeys,statBonuses:statBonuses,pathConflict:pathConflict,unlocked:unlocked,cost:cost,upgraded:upgraded,masteryUpgrade:masteryUpgrade,toolOf:toolOf,curSup:curSup,spellMultiplier:spellMultiplier,spellCast:spellCast,canCast:canCast,scrollCount:scrollCount,onFloor:floor,onTurn:turn,onKill:onKill,beforeAttack:beforeAttack,attack:attack,incoming:incoming,counterImmune:counterImmune,onCorpse:corpse,onScrap:onScrap,useTool:useTool};
})();