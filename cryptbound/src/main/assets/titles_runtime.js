/* Active five-rank title rules (65 nodes): source catalogue is separate from mechanics. */
(function(){
'use strict';
var data=(window.CryptGumballsTitleReference||[]).map(function(t){
 return Object.assign({},t,{desc:t.mechanic+' '+t.stats,icon:t.tree===2?'◈':t.tree===1?'✣':'⚔',max_level:t.rank===5?1:3});
});
var byId={};data.forEach(function(t){byId[t.id]=t;});
window.CryptTitles=data;
var spellRewards={
 mag_apprentice:['bless',3],mag_black:['fireball',3],mag_white:['heal',3],
 mag_wizard:['firestorm',2],mag_conjuror:['deathripple',3],mag_priest:['holybolt',3],
 mag_bishop:['iceshield',3],mag_fire:['fireball',5],mag_dark:['deathripple',4],
 mag_earth:['gravity',2],mag_air:['lightningbolt',5],mag_light:['holybolt',4],mag_water:['icicle',3]
};
function level(r,id){return r&&r.talents?Math.max(0,Number(r.talents[id])||0):0;}
function has(r,id){return level(r,id)>0;}
var TITLE_SUITS={
 adv_magic_bandit:{id:'noble',pieces:[['bracer','Лента дворянина'],['ring','Кольцо этикета'],['cloak','Бархатный плащ']]},
 adv_treasure_hunter:{id:'hunter',pieces:[['armor','Броня охотника'],['amulet','Охотничий медальон'],['boots','Сапоги охотника']]},
 adv_royal_rune:{id:'rune',pieces:[['ring','Рунное кольцо'],['gloves','Перчатки гоблина'],['amulet','Кулон магической энергии']]},
 adv_royal_blacksmith:{id:'smith',pieces:[['helm','Спектральный шлем'],['bracer','Наручи литейщика'],['boots','Сапоги кузнеца']]}
};
function titleSetEquipped(r,id){
 var items=r&&r.items||[],equip=r&&r.equip||{};
 return Object.keys(equip).filter(function(slot){return items.some(function(it){return it.id===equip[slot]&&it.titleSet===id;});}).length;
}
function grantTitlePiece(r,t,levelNum,h){
 var suit=TITLE_SUITS[t.id];if(!suit)return;
 var piece=suit.pieces[Math.min(suit.pieces.length-1,levelNum-1)];
 var item=h.addItem(piece[0],2);if(!item)return;
 item.name=piece[1];item.titleSet=suit.id;item.titlePiece=levelNum;
 item.setId=null;item.setName=null;item.catalogId=null;
 h.log('Получена часть комплекта «'+piece[1]+'». Предмет помещён в рюкзак и не надет.');
}
function rank5(r,id,key){return Math.max(0,Math.min(3,Number(r.titleMastery&&r.titleMastery[id]&&r.titleMastery[id][key])||0));}
function masterKeys(t){
 if(t.tree===1)return t.id==='mag_light_bishop'?['pow','atk','hp']:['pow','mp','hp'];
 if(t.tree===2){
  if(t.id==='adv_holy_rune'||t.id==='adv_great_swordsmith'||t.id==='adv_holy_blacksmith')return ['atk','hp','mp'];
  if(t.id==='adv_great_enchanter')return ['pow','hp','mp'];
  return ['atk','pow','hp'];
 }
 return t.id==='war_warrior'||t.id==='war_commander'?['atk','mp','hp']:['atk','pow','hp'];
}
function masteryStatValues(t,k){
 if(t.tree===0)return k==='hp'?[60,120,180]:k==='mp'?[40,80,120]:[3,6,9];
 if(t.tree===1){
  if(k==='pow'||k==='atk')return [3,6,9];
  if(t.id==='mag_destruction'||t.id==='mag_elements')return k==='hp'?[40,80,120]:[60,120,180];
  return k==='hp'?[60,120,180]:[40,80,120];
 }
 if(k==='atk'||k==='pow')return (t.id==='adv_farplane'||t.id==='adv_elf_king')?[2,3,4]:[2,4,6];
 return [40,60,80];
}
function statBonuses(r){
 var st={atk:0,hp:0,mp:0,pow:0,def:0};
 data.forEach(function(t){
  var n=level(r,t.id);if(!n)return;
  if(t.rank===5){masterKeys(t).forEach(function(k){var lv=rank5(r,t.id,k);if(lv)st[k]+=masteryStatValues(t,k)[lv-1];});return;}
  var re=/(Атака|магия|Магия|HP|MP|Броня)\s*\+(\d+(?:\/\d+)*)/gi;
  var m;while((m=re.exec(t.stats))!==null){
   var k=/^атака$/i.test(m[1])?'atk':/^магия$/i.test(m[1])?'pow':m[1].toLowerCase();
   var vals=m[2].split('/').map(Number);
   st[k]+=vals[Math.min(Math.max(1,n),vals.length)-1];
  }
 });
 if(r.titleSupplies&&r.titleSupplies.license){st.atk+=2*r.titleSupplies.license;st.pow+=2*r.titleSupplies.license;}
 if(titleSetEquipped(r,'rune')===3){st.pow+=5;st.mp+=50;}
 if(titleSetEquipped(r,'hunter')===3){st.def+=3;st.dodge=12;}
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
 // Existing active Shadow Warrior souls become equivalent Echo charges on load.
 if(r.titleEchoCharges==null)r.titleEchoCharges=has(r,'war_shadow')?Math.min(3,Math.max(0,Number(r.titleDarkSoulTurns)||0)):0;
 delete r.titleDarkSoulTurns;
 if(has(r,'war_paladin')&&r.titlePaladinFlat==null)r.titlePaladinFlat=Math.max(1,Math.round((r.hp||1)*.10));
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
 var main=(r.class==='necromancer'||r.class==='sorceress')?1:(r.class==='guardian'||r.class==='executioner')?0:2;
 if(t.tree!==main)raw*=2;
 var noble=titleSetEquipped(r,'noble');
 return Math.max(1,Math.ceil(raw*(1-Math.min(.28,noble*.06+(noble===3?.10:0)))));
}
function supply(r,key,amount){r.titleSupplies=r.titleSupplies||{};r.titleSupplies[key]=(r.titleSupplies[key]||0)+amount;}
function curSup(r,key){return (r.titleSupplies&&r.titleSupplies[key])||0;}
function reward(r,t,levelNum,h){
 var got=spellRewards[t.id];if(got)h.grant(got[0],got[1],'title');
 if(t.id==='mag_planar')h.grant('earthgate',1,'title');
 if(t.id==='adv_explorer'||t.id==='adv_explorationist')supply(r,'compass',3);
 grantTitlePiece(r,t,levelNum,h);
 if(t.id==='adv_weapon_master'){supply(r,'license',1);}
 if(t.id==='adv_elven_ranger')supply(r,'leopard',1);
 if(t.id==='adv_demon_hunter')supply(r,'arrow',3+2*levelNum);
 if(t.id==='war_faith'){supply(r,'holy_badge',1);r.guardCharges=(r.guardCharges||0)+1;}
 if(t.id==='war_dancer'||t.id==='war_great_sword')supply(r,'sword_scroll',1);
 if(t.id==='war_commander'&&levelNum===1)h.addItem('amulet',6);
 if(t.id==='war_paladin'&&levelNum===1){r.titlePaladinFlat=Math.max(1,Math.round(h.stats().hp*.10));r.hp=h.stats().hp;}
 if(t.id==='war_sword_sage'&&levelNum===1)r.titleSageFlat=Math.max(1,Math.round(h.stats().atk*.30));
 if(t.rank===5&&t.tree===2){var tool=toolOf(r);supply(r,tool.kind==='bow'?'arrow':tool.kind==='lantern'?'wick':tool.kind==='rune'?'rune':'quench',2);}
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
 if(t.tree===2){var tool=toolOf(r);supply(r,tool.kind==='bow'?'arrow':tool.kind==='lantern'?'wick':tool.kind==='rune'?'rune':'quench',2);}
 if(t.id==='mag_planar')h.grant('earthgate',1,'title');
 if(t.id==='mag_destruction'&&key==='hp')h.grant('fireball',5,'title');
 if(t.id==='mag_dark_priest'&&key==='hp')h.grant('implosion',rank5(r,t.id,key),'title');
 if(t.id==='mag_pope'&&key==='hp')h.grant('holybolt',4*rank5(r,t.id,key),'title');
 if(t.id==='mag_archbishop'&&key==='hp')h.grant('iceshield',4*rank5(r,t.id,key),'title');
 if(t.id==='mag_legendary'&&key==='hp')h.grant('electrostatic',[4,8,16][rank5(r,t.id,key)-1],'title');
 if(t.id==='mag_light_bishop'&&key==='atk')h.grant('recovering',3*rank5(r,t.id,key),'title');
 if(t.id==='mag_light_bishop'&&key==='hp')h.grant('divinefavor',3*rank5(r,t.id,key),'title');
 if(t.id==='mag_time'){
  var l=rank5(r,t.id,key),type=key==='pow'?'chain':key==='mp'?'lightningbolt':'disrupting';
  h.grant(type,key==='pow'?2*l:key==='mp'?5*l:3*l,'title');
 }
 if(t.id==='war_commander'&&key==='atk')h.addItem('amulet',6);
 h.log('Усилено звание «'+t.name+'»: '+key+' '+rank5(r,t.id,key)+'/3.');
 return true;
}
function toolOf(r){
 if(has(r,'adv_blacksmith'))return {name:has(r,'adv_holy_blacksmith')?'Священная наковальня':has(r,'adv_great_swordsmith')?'Кузнечная наковальня':'Кузнечная наковальня',icon:'anvil',kind:'forge'};
 if(has(r,'adv_rune_master'))return {name:has(r,'adv_holy_rune')?'Арканный тигель':has(r,'adv_great_enchanter')?'Тигель зачарователя':'Магический тигель',icon:'crucible',kind:'rune'};
 if(has(r,'adv_demon_hunter'))return {name:has(r,'adv_farplane')?'Загробный арбалет':has(r,'adv_elf_king')?'Королевский арбалет':has(r,'adv_legendary_hunter')?'Легендарный арбалет':'Арбалет охотника',icon:'crossbow',kind:'bow'};
 if(has(r,'adv_night_walker'))return {name:has(r,'adv_farplane')?'Загробный фонарь':has(r,'adv_god_thieves')?'Воровской фонарь':has(r,'adv_elf_king')?'Эльфийский фонарь':'Фонарь странника',icon:'lantern',kind:'lantern'};
 if(has(r,'adv_explorer')||has(r,'adv_explorationist'))return {name:has(r,'adv_explorer')?'Компас исследователя':'Компас первопроходца',icon:'compass',kind:'compass'};

 return null;
}
function undead(e){return /нежит|скел|мертв|лич|зомб|труп|костян|призрак/i.test((e&&e.name)||'');}
function floor(r,h){
 init(r);r.titleFloorAtk=0;r.titleHealAtk=0;r.titleTotemTurns=0;
 // Panther stays on this floor; statues remain in the backpack.
 r.titlePanther=null;
 if(has(r,'adv_explorer'))r.ep+=10+5*(level(r,'adv_explorer')-1);
 if(has(r,'adv_explorationist'))r.hp=Math.min(h.stats().hp,r.hp+6+3*(level(r,'adv_explorationist')-1));
 if(has(r,'mag_priest')){var b=3*level(r,'mag_priest');r.hp=Math.min(h.stats().hp,r.hp+b);r.mp=Math.min(h.stats().mp,r.mp+b);}
 if(r.floor>1&&titleSetEquipped(r,'hunter')>0)r.ep+=3*titleSetEquipped(r,'hunter');
 if(r.floor>1&&r.floor%5===0&&titleSetEquipped(r,'rune')===3)supply(r,'rune',1);
 if(r.floor>1&&r.floor%5===0&&titleSetEquipped(r,'smith')===3)supply(r,'quench',1);
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
 if(r.titleTotemTurns>0){
  // Totem lasts exactly 3/6/9 turns, including empty turns; never stays alive forever.
  r.titleTotemTurns--;
  if(alive.length&&alive[0].foe.hp>0){
   var v=alive[0],amount=Math.max(1,Math.floor(h.stats().pow*(.5+.10*level(r,'mag_conjuror')))-(v.foe.def||0));
   v.foe.hp=Math.max(0,v.foe.hp-amount);
   h.log('Тотем призывателя наносит '+amount+' магического урона.');
   if(v.foe.hp<=0)h.kill(v);
  }
 }
 var panther=r.titlePanther;
 if(panther&&panther.hp>0){
  var bonus=has(r,'adv_elf_king')&&has(r,'adv_night_walker')?Math.max(1,Math.floor(h.stats().atk*.2)):0;
  var target=alive[0],roomTargets=h.roomTargets?h.roomTargets():[];
  if(target&&target.foe.hp>0){
   var damage=Math.max(1,panther.atk+bonus-(target.foe.def||0)-Math.max(0,target.foe.guard||0));
   if(h.provoke)h.provoke(target.foe,'panther');
   target.foe.hp=Math.max(0,target.foe.hp-damage);
   h.log('Чёрная пантера атакует '+target.foe.name+': '+damage+' физического урона.');
   if(target.foe.hp<=0)h.kill(target);
  }else if(roomTargets.length){
   var guard=roomTargets[0],damageRoom=Math.max(1,panther.atk+bonus-(guard.def||0));
   if(h.provoke)h.provoke(guard,'panther');
   if(h.hitRoom)h.hitRoom(guard,damageRoom);
   h.log('Чёрная пантера атакует '+guard.name+' в побочной комнате: '+damageRoom+'.');
  }
 }
}
function summonPanther(r,h){
 if(!r||!has(r,'adv_elven_ranger'))return {ok:false,message:'Не изучено звание Эльфийского следопыта.'};
 if(r.titlePanther&&r.titlePanther.hp>0)return {ok:false,message:'Чёрная пантера уже призвана.'};
 if(curSup(r,'leopard')<1)return {ok:false,message:'Нет статуэток чёрной пантеры.'};
 var st=h.stats(),boost=has(r,'adv_elf_king')&&has(r,'adv_night_walker');
 var maxHp=Math.max(12,Math.ceil(st.hp*(boost?.52:.36)));
 var atk=Math.max(4,Math.ceil(st.atk*(boost?.66:.46)));
 r.titleSupplies.leopard--;
 r.titlePanther={name:'Чёрная пантера',hp:maxHp,maxHp:maxHp,atk:atk,def:Math.max(1,Math.floor(st.def*.5))};
 return {ok:true,message:'Статуэтка призвала чёрную пантеру (HP '+maxHp+', атака '+atk+').'};
}
function onKill(r,e,drop,h){
 if(has(r,'war_silver'))r.hp=Math.min(h.stats().hp,r.hp+level(r,'war_silver'));
 if(has(r,'war_royal'))r.titleFloorAtk=(r.titleFloorAtk||0)+level(r,'war_royal');
 if(has(r,'war_shadow')){r.titleEchoCharges=Math.min(3,(r.titleEchoCharges||0)+level(r,'war_shadow'));h.log('Теневой воин: Эхо ×'+r.titleEchoCharges+' (следующие обычные удары станут двойными).');}
 if(has(r,'mag_conjuror'))r.titleTotemTurns=Math.max(r.titleTotemTurns||0,3*level(r,'mag_conjuror'));
 if(has(r,'adv_farplane')&&has(r,'adv_demon_hunter')&&!/голем|элементал|механи|автомат|скелет|мертвец|нежить|призрак|костяк|лич/i.test(e.name)&&Math.random()<.05)drop.soul={kind:e.boss||e.elite?'elite':'common',name:'Душа '+e.name};
 if(titleSetEquipped(r,'hunter')===3)r.ep+=2;
 if(has(r,'war_dragon')&&Math.random()<(0.1+.1*level(r,'war_dragon')))h.cross(e,Math.ceil(h.stats().atk*.65));
 if(has(r,'war_duke')&&Math.random()<.1){var m=rank5(r,'war_duke','atk')+rank5(r,'war_duke','pow')+rank5(r,'war_duke','hp');h.cross(e,Math.ceil(h.stats().atk*(.7+.1*m)));h.log('Герцог разрушения: Клинок разрушения.');}
 if(has(r,'war_light_arbiter')&&Math.random()<.1){var m=rank5(r,'war_light_arbiter','atk')+rank5(r,'war_light_arbiter','pow')+rank5(r,'war_light_arbiter','hp');h.flash(Math.max(8,Math.ceil(h.stats().pow*(2+.1*m))));h.log('Судья света: Святой луч.');}
}
/* One Echo charge empowers one normal hero attack. It never creates an actor or a
   separate turn. Game combat performs the follow-up after its single counterattack. */
function consumeEcho(r){
 if(!r||!has(r,'war_shadow')||(r.titleEchoCharges||0)<=0)return false;
 r.titleEchoCharges--;
 return true;
}
function beforeAttack(r){return has(r,'war_novice')&&Math.random()<.05+.05*level(r,'war_novice');}
function attack(r,e,dmg,h){
 if(has(r,'adv_demon_hunter')&&undead(e))dmg=Math.ceil(dmg*(1+.05+.05*level(r,'adv_demon_hunter')));
 if(has(r,'war_templar')&&undead(e))dmg=Math.ceil(dmg*(1+.25+.25*level(r,'war_templar')));
 if(has(r,'war_warrior')&&e.boss)dmg=Math.ceil(dmg*(1.5+.15*(rank5(r,'war_warrior','atk')+rank5(r,'war_warrior','mp')+rank5(r,'war_warrior','hp'))));
 if(has(r,'war_magic')&&Math.random()<.05+.05*level(r,'war_magic'))dmg+=h.stats().pow;
 if(has(r,'war_dancer')&&curSup(r,'sword_scroll')>0&&Math.random()<.08){supply(r,'sword_scroll',-1);dmg=Math.ceil(dmg*1.45);h.log('Техника мастера меча усилила удар.');}
 if(has(r,'war_dark_arbiter')&&Math.random()<.05){var m=rank5(r,'war_dark_arbiter','pow')+rank5(r,'war_dark_arbiter','atk')+rank5(r,'war_dark_arbiter','hp');h.flash(Math.max(6,Math.ceil(h.stats().pow*(1.2+.15*m))));h.log('Тёмный судья: Волна смерти.');}
 if(has(r,'war_hell')&&Math.random()<.05){var m=rank5(r,'war_hell','pow')+rank5(r,'war_hell','atk')+rank5(r,'war_hell','hp');h.flash(Math.max(12,Math.ceil(h.stats().pow*(2+.2*m))));h.log('Бог войны преисподней: Метеоритный дождь.');}
 if(has(r,'war_titan')&&Math.random()<.05){var m=rank5(r,'war_titan','atk')+rank5(r,'war_titan','pow')+rank5(r,'war_titan','hp');e.stun=Math.max(e.stun||0,1);dmg+=Math.max(4,Math.ceil(h.stats().pow*(.5+.1*m)));h.log('Рыцарь титанов: Земляной шип — урон и оглушение.');}
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
 if(has(r,'mag_legendary')&&['blessing','heal','shield','healshield','lastlight','timestop','reveal'].indexOf(sp.kind)>=0)result+=.30+.10*rank5(r,'mag_legendary','pow');
 if(has(r,'mag_light_bishop')&&['heal','healshield','lastlight'].indexOf(sp.kind)>=0)result+=.30+.10*rank5(r,'mag_light_bishop','pow');
 if(has(r,'mag_dark_priest')&&sp.school==='dark'&&Math.random()<.5)result*=2;
 if(has(r,'mag_dark_priest')&&sp.id==='deathripple')result*=1+.25*rank5(r,'mag_dark_priest','pow');
 if(has(r,'mag_dark_priest')&&sp.id==='implosion')result*=1+.25*rank5(r,'mag_dark_priest','mp');
 if(has(r,'mag_pope')&&sp.school==='light'&&['holy','attack','aoe'].indexOf(sp.kind)>=0&&Math.random()<.5){
   result*=2;
   r.titlePopeTriggered=true;
 }
 if(has(r,'mag_pope')&&sp.id==='holybolt')result*=1+.25*rank5(r,'mag_pope','mp');
 if(has(r,'mag_archbishop')&&sp.id==='iceshield'&&Math.random()<(.15+[0,.09,.12,.15][rank5(r,'mag_archbishop','pow')])){
   result*=1.8*(1+.25*rank5(r,'mag_archbishop','mp'));
   r.titleAuroraTriggered=true;
 }
 return result;
}
function spellCast(r,sp,h){
 if(has(r,'mag_bishop')&&['heal','healshield','lastlight'].indexOf(sp.kind)>=0)r.titleHealAtk=Math.max(r.titleHealAtk||0,5*level(r,'mag_bishop'));
 if(has(r,'mag_time')&&sp.school==='air'&&!h.targets().some(function(t){return t.foe&&t.foe.boss&&t.foe.hp>0;})&&Math.random()<.5)r.timeStopTurns=(r.timeStopTurns||0)+1;
 /* Ice Shield conversion to Aurora Barrier is calculated in spellMultiplier so
  the same cast cannot trigger the upgrade twice. */
 if(has(r,'mag_destruction')&&sp.id==='fireball'&&Math.random()<(.12+[0,.06,.09,.12][rank5(r,'mag_destruction','pow')])){
   h.flash(Math.ceil(h.stats().pow*(2+.25*rank5(r,'mag_destruction','mp'))));
   h.log('Армагеддон: магия огня по всем доступным врагам.');
 }
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
 if(has(r,'war_faith')&&sp.rank<=2+level(r,'war_faith')&&['water','air','light'].includes(sp.school))return null;
 if(caster.indexOf(sp.school)>=0&&sp.rank<=2+Math.max(level(r,'war_magic'),level(r,'war_dancer'),level(r,'war_silver')))return null;
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
 if(titleSetEquipped(r,'smith')>0)r.ep+=2*titleSetEquipped(r,'smith');
 if(titleSetEquipped(r,'rune')>0)r.mp=Math.min(h.stats().mp,r.mp+3*titleSetEquipped(r,'rune'));
}
function useTool(r,h,selected){
 var tool=toolOf(r);
 function ok(message){return {ok:true,message:message};}
 function no(message){return {ok:false,message:message};}
 if(!tool)return no('Сначала изучите звание авантюриста, выдающее инструмент.');
 if(tool.kind==='compass'){
  if(curSup(r,'compass')<=0)return no('Компас уже использован.');
  var last=r.titleFlags&&r.titleFlags.compassLastFloor;
  if(Number.isInteger(last)&&r.floor<last+2)return no('Компас можно использовать снова через '+(last+2-r.floor)+' этаж(а).');
  supply(r,'compass',-1);
  r.titleFlags=r.titleFlags||{};r.titleFlags.compassLastFloor=r.floor;
  var qty=Math.max(1,1+Math.floor(level(r,'adv_explorer')/2));
  if(Math.random()<.5){
   var money=15+5*Math.max(1,level(r,'adv_explorer')||level(r,'adv_explorationist'));
   r.gold=(r.gold||0)+money;
   return ok('Компас обнаружил тайник с '+money+' золотыми монетами.');
  }
  if(h.addFood){h.addFood(Math.random()<.5?'mushroom':'honey',qty);}
  else if(h.addMaterial)h.addMaterial('Лесные грибы',qty);
  return ok('Компас обнаружил скрытые припасы ×'+qty+'.');
 }
 if(tool.kind==='lantern'){
  if(curSup(r,'wick')<=0)return no('Нужен фитиль фонаря.');
  var t=r.tiles.find(function(t){return !t.revealed&&!t.hinted&&(t.kind==='secret'||t.kind==='chamber'||t.hasKey);});
  if(!t)return no('Скрытых особых плит не осталось.');
  supply(r,'wick',-1);t.hinted=true;return ok('Фонарь отметил необычную плиту.');
 }
 if(tool.kind==='bow'){
  if(curSup(r,'arrow')<=0)return no('Не хватает стрел.');
  var target=h.targets().find(function(t){return String(t.id)===String(selected)&&t.foe&&t.foe.hp>0&&h.reachable(t);});
  if(!target)return no('Выберите доступную цель для арбалета.');
  supply(r,'arrow',-1);
  var base=Math.round(h.stats().atk*(has(r,'adv_legendary_hunter')?1.4:1));
  h.hit(target,base);
  if(has(r,'adv_farplane')&&has(r,'adv_demon_hunter')&&target.foe.hp<=0&&!undead(target.foe)&&Math.random()<.3)
   h.addSoul({kind:'common',name:'Душа '+target.foe.name});
  return ok('Арбалет поражает '+target.foe.name+'.');
 }
 if(tool.kind==='rune'){
  var special=has(r,'adv_holy_rune'),need=special?2:1;
  var candidates=Object.keys(r.scrolls).map(function(id){return h.spells.find(function(x){return x.id===id&&x.rank<5&&(r.scrolls[id]||0)>=need;});}).filter(Boolean);
  if(!candidates.length)return no(special?'Нужно два одинаковых свитка ниже 5-го ранга.':'Нужен свиток ниже 5-го ранга.');
  var sp=candidates.find(function(x){return x.id===selected;});
  if(!sp)return no('Выберите свиток для тигля.');
  if(!special){
   r.scrolls[sp.id]--;
   var recovered=3+3*titleSetEquipped(r,'rune');
   r.mp=Math.min(h.stats().mp,r.mp+recovered);
   return ok('Тигель разобрал свиток и восстановил до '+recovered+' маны.');
  }
  var next=h.spells.filter(function(x){return x.rank===sp.rank+1&&x.rank<=5&&x.school===sp.school;});
  if(!next.length)next=h.spells.filter(function(x){return x.rank===sp.rank+1&&x.rank<=5;});
  if(!next.length)return no('Подходящий свиток для объединения не найден.');
  if(curSup(r,'rune')<1)return no('Нужна магическая руна для объединения свитков.');
  supply(r,'rune',-1);r.scrolls[sp.id]-=2;
  h.grant(next[0].id,1,'forge');return ok('Два свитка и магическая руна преобразованы в '+next[0].name+'.');
 }
 if(tool.kind==='forge'){
  if(has(r,'adv_great_enchanter')||has(r,'adv_great_swordsmith')){
   var kind=has(r,'adv_great_enchanter')?'pow':'atk';
   var target=(r.items||[]).find(function(it){return String(it.id)===String(selected)&&
    Object.keys(r.equip||{}).some(function(slot){return r.equip[slot]===it.id;})&&(it.plus||0)<9;});
   if(!target)return no('Выберите надетое улучшаемое снаряжение.');
   if(curSup(r,'quench')<2)return no('Нужно 2 закалочные эссенции.');
   supply(r,'quench',-2);target.plus=(target.plus||0)+1;target[kind]=(target[kind]||0)+2;
   return ok('Наковальня усилила «'+target.name+'» до +'+target.plus+'.');
  }
  if(!has(r,'adv_holy_blacksmith'))return no('Создание реликвий открывается Святым кузнецом.');
  if(curSup(r,'quench')<3)return no('Нужно 3 закалочные эссенции.');
  supply(r,'quench',-3);h.addItem('amulet',6);
  return ok('Наковальня создала реликвию 6-го ранга.');
 }
 return no('Этот инструмент действует автоматически.');
}

window.CryptTitlesRuntime={data:data,summonPanther:summonPanther,masteryStatValues:masteryStatValues,titleSetEquipped:titleSetEquipped,level:level,has:has,init:init,rank5:rank5,masterKeys:masterKeys,statBonuses:statBonuses,pathConflict:pathConflict,unlocked:unlocked,cost:cost,upgraded:upgraded,masteryUpgrade:masteryUpgrade,toolOf:toolOf,curSup:curSup,spellMultiplier:spellMultiplier,spellCast:spellCast,canCast:canCast,scrollCount:scrollCount,onFloor:floor,onTurn:turn,onKill:onKill,beforeAttack:beforeAttack,attack:attack,incoming:incoming,counterImmune:counterImmune,consumeEcho:consumeEcho,onCorpse:corpse,onScrap:onScrap,useTool:useTool};
})();