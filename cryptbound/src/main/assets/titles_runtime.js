/* Original title trees: mechanics shared by maze, bosses and side chambers. */
(function(){
'use strict';
var data=window.CryptOriginalTitles,byId={};data.forEach(function(t){byId[t.id]=t;});window.CryptTitles=data;
function ownedLevel(r,id){return Math.min(byId[id]?byId[id].max_level:0,Math.max(0,Number(r&&r.talents&&r.talents[id])||0));}
function borrowedTitle(r,id){
 var aliases={war_novice:'wt_fighter',mag_apprentice:'mt_initiate',adv_seeker:'lt_eye'};
 if(!r||!window.ClickerRules)return false;
 var counts=window.ClickerRules.counts(r.equip||{},r.items||[]);
 return Object.keys(counts).some(function(k){var spec=window.ClickerRules.setRules(k);return spec&&aliases[spec.borrowTitle]===id&&counts[k]>=spec.slots.length;});
}
function level(r,id){return Math.max(ownedLevel(r,id),borrowedTitle(r,id)?1:0);}
function has(r,id){return level(r,id)>0;}
function val(r,id,values){var n=level(r,id);return n?values[Math.min(n,values.length)-1]:0;}
function mainTree(r){return /necromancer|sorceress/.test(r.class)?1:/executioner|guardian/.test(r.class)?0:2;}
function cost(r,t){return ((t.ep_cost||[])[Math.min(2,ownedLevel(r,t.id))]||500)*(t.tree===mainTree(r)?1:2);}
var legacyRanks={"blade":[0,0],"iron":[0,1],"duelist":[0,1],"endure":[0,2],"guard":[0,2],"execution":[0,2],"fury":[0,2],"lastwall":[0,3],"thornmail":[0,3],"vamp":[0,3],"berserk":[0,3],"citadel":[0,4],"reflection":[0,4],"deathmark":[0,4],"conqueror":[0,4],"mind":[1,0],"reserve":[1,1],"sorcery":[1,1],"ritual":[1,2],"flow":[1,2],"pyromancer":[1,2],"stormcaller":[1,2],"summonmaster":[1,3],"meditation":[1,3],"flameheart":[1,3],"lightning":[1,3],"legion":[1,4],"sage":[1,4],"inferno":[1,4],"thunderlord":[1,4],"fortune":[2,0],"seeker":[2,1],"explorer":[2,1],"stealth":[2,2],"vault":[2,2],"merchant":[2,2],"cartographer":[2,2],"scavenger":[2,3],"secretkeeper":[2,3],"trader":[2,3],"navigator":[2,3],"phantom":[2,4],"reliclord":[2,4],"magnate":[2,4],"pathfinder":[2,4],"legendmage":[1,4],"timelord":[1,4],"highpriest":[1,4],"bishop":[1,4],"icearch":[1,4]};
function init(r){
 if(!r)return;
 if(r.titleVersion!==3){
  var old=r.talents||{},mastery=r.titleMastery||{},refund=0,ref=window.CryptGumballsTitleReference||[];
  Object.keys(old).forEach(function(id){var t=ref.find(function(x){return x.id===id;});if(!t)return;
   var factor=t.tree===mainTree(r)?1:2;
   for(var i=0;i<Math.min(old[id],t.rank===5?1:3);i++)refund+=(t.rank===5?500:t.ep_cost[i])*factor;
   Object.keys(mastery[id]||{}).forEach(function(k){refund+=Math.min(3,mastery[id][k])*500*factor;});
  });
  // Pre-reference trees used inexpensive rank-based prices.
  if(r.titleVersion!==2)Object.keys(old).forEach(function(id){var spec=legacyRanks[id];if(!spec)return;for(var i=0;i<Math.min(3,old[id]);i++){var price=2+spec[1]*3+i*3;refund+=spec[0]===mainTree(r)?price:Math.ceil(price*1.25);}});
  r.legacyTitleArchive={talents:old,mastery:mastery,supplies:r.titleSupplies||{},refund:refund};
  (r.tiles||[]).forEach(function(t){if(t.foe&&t.foe.hp<=0)t.foe.titleKillRewarded=true;if(t.room)(t.room.guards||[]).forEach(function(g){if(g.hp<=0)g.titleKillRewarded=true;});});
  r.ep=(Number(r.ep)||0)+refund;r.originalTitleRefund=refund;r.talents={};r.titleVersion=3;
  ['titleMastery','titleSupplies','titleFlags','titlePanther','titleTotemTurns','titleFloorAtk','titleHealAtk','titleSageFlat','titlePaladinFlat','titleBlessAtk','titleBlessTurns','titleEchoCharges','titleDarkSoulTurns'].forEach(function(k){delete r[k];});
 }
 r.titleFlags=r.titleFlags||{};r.titleSupplies=r.titleSupplies||{};r.titleState=r.titleState||{floorMarks:{},cooldowns:{}};
 r.titleState.floorMarks=r.titleState.floorMarks||{};r.titleState.cooldowns=r.titleState.cooldowns||{};
 if(!skills(r).some(function(t){return t.id===r.titleState.active;}))r.titleState.active=(skills(r)[0]||{}).id||null;
}
function state(r){if(!r.titleState)init(r);return r.titleState;}
function pathConflict(r,t){return data.some(function(x){return x.tree===t.tree&&x.rank===t.rank&&x.id!==t.id&&ownedLevel(r,x.id)>0;});}
function unlocked(r,t){return !pathConflict(r,t)&&(t.rank===1||t.parents.some(function(id){return ownedLevel(r,id)>0;}));}
function statBonuses(r){return {atk:level(r,'wt_fighter')+level(r,'lt_aim')+(r.titleTonicAtk||0),pow:level(r,'mt_initiate')+2*level(r,'mt_elements')+(r.titleTonicPow||0),hp:20*level(r,'wt_companion')+val(r,'lt_supply',[20,30,40]),mp:20*level(r,'mt_reserve'),def:0};}
function upgraded(r,t,h){
 var old=h.stats(),n=ownedLevel(r,t.id);r.talents[t.id]=n+1;
 if(t.id==='lt_eye')refreshHints(r,h);
 if(['lt_crossbow','lt_hound','lt_silence','lt_exchange'].includes(t.id))state(r).active=t.id;
 if(t.tree===1&&['mt_school','mt_effect','mt_familiar'].includes(t.id)&&!state(r).school)state(r).school=r.pendingTitleSchool||'fire';
 if(state(r).school)delete r.pendingTitleSchool;
 var now=h.stats();r.hp=Math.min(now.hp,r.hp+Math.max(0,now.hp-old.hp));r.mp=Math.min(now.mp,r.mp+Math.max(0,now.mp-old.mp));
 syncPet(r,r.summon);return n+1;
}
function floorKey(r){return [r.actIndex||0,r.locationIndex||0,r.floor||1].join(':');}
function refreshHints(r){
 (r.tiles||[]).forEach(function(t){t.hintEnemy=false;});
 var qty=val(r,'lt_eye',[3,4,5]);
 (r.tiles||[]).filter(function(t){return !t.revealed&&t.foe&&t.foe.hp>0;}).slice(0,qty).forEach(function(t){t.hintEnemy=true;t.titleLanternMarked=true;t.foe.titleLanternMarked=true;});
 if(r.titleHound&&r.titleHound.hp>0&&has(r,'lt_sniff'))hintSupply(r);
}
function resourceTile(t){return ['ore-vein','mine-wall','secret','chest','coin','potion','vial-hp','vial-mp','coin-small','trinket'].includes(t.kind);}
function hintSupply(r){
 var hidden=(r.tiles||[]).filter(function(t){return !t.revealed&&resourceTile(t);});
 var t=has(r,'lt_tracker')?hidden.find(function(t){return t.kind==='secret'||t.kind==='chest';})||hidden[0]:hidden[0];
 if(t){t.hintSpecial=true;t.titleSupplyHint=true;}
}
function floor(r,h){
 init(r);var q=state(r),key=floorKey(r);refreshHints(r,h);
 if(q.floorMarks[key])return;
 q.floorMarks[key]=true;q.rhythm=0;q.fervor=0;q.victoryStrike=false;q.lastGuard=false;q.houndDied=false;q.deadtime=false;q.resources=0;q.quiet=0;q.rangedDelay=0;
 if(r.titleHound&&!has(r,'lt_guide'))r.titleHound=null;
 if(r.titleHound)hintSupply(r);
 var st=h.stats(),mana=has(r,'mt_infinite')?20:val(r,'mt_return',[6,9,12]);
 if(mana){var extra=Math.max(0,r.mp+mana-st.mp);r.mp=Math.min(st.mp,r.mp+mana);if(has(r,'mt_infinite')&&extra>0)r.shield=(r.shield||0)+Math.ceil(st.hp*.1);}
 [r.summon,r.titleHound,r.ghost].forEach(function(p){if(p&&p.hp>0){syncPet(r,p);p.titleBarrier=petFloorBarrier(r,p);}});
}
function petFloorBarrier(r,p){return Math.ceil(p.maxHp*(has(r,'wt_unbroken')?.25:val(r,'wt_formation',[.08,.12,.16])));}
function petFactor(r){return 1+val(r,'mt_familiar',[.2,.3,.4])+(has(r,'mt_archsummon')?.25:0);}
function syncPet(r,p){if(!p)return;var factor=petFactor(r),old=p.titleFactor||1;if(factor===old)return;p.maxHp=Math.max(1,Math.round(p.maxHp/old*factor));p.hp=Math.max(1,Math.min(p.maxHp,Math.round(p.hp/old*factor)));p.atk=Math.max(1,Math.round(p.atk/old*factor));p.titleFactor=factor;}
function summoned(r,p){syncPet(r,p);p.titleBarrier=0;}
function interceptChance(r){return val(r,'wt_guard',[.80,.88,.96])||.72;}
function petDamage(r,p,amount,intercept){
 if(intercept)amount=Math.ceil(amount*(1-val(r,'wt_bodyguard',[.15,.25,.35])));
 var shield=Math.min(p.titleBarrier||0,amount);p.titleBarrier=(p.titleBarrier||0)-shield;return Math.max(0,amount-shield);
}
function protectFatal(r,damage,h){
 var q=state(r),p=[r.summon,r.titleHound,r.ghost].find(function(p){return p&&p.hp>0;});if(!p||p.hp<=0||!has(r,'wt_lastguard')||q.lastGuard)return false;
 var shields=(r.shield||0)+(r.setShieldRemaining||0);if(damage<r.hp+shields)return false;
 q.lastGuard=true;p.hp=1;p.titleBarrier=0;h.log('Последний телохранитель принимает смертельный удар и остаётся с 1 HP.');return true;
}
function attack(r,e,damage,h){
 var q=state(r);q.rhythm=(q.rhythm||0)+1;
 var third=has(r,'wt_rhythm')&&q.rhythm%3===0;
 damage*=1+val(r,'wt_breaker',[.05,.10,.15])+(q.fervor||0)*.03;
 var threshold=has(r,'wt_punisher')?.45:val(r,'wt_verdict',[.35,.40,.45])||.30;
 if(has(r,'wt_execution')&&e.hp<e.maxHp*threshold)damage*=1+(has(r,'wt_punisher')?.30:val(r,'wt_execution',[.15,.20,.25]));
 if(q.victoryStrike){damage*=1+(has(r,'wt_onslaught')?.40:val(r,'wt_tempo',[.15,.20,.25]));q.victoryStrike=false;}
 if(third){
  damage+=h.stats().atk*val(r,'wt_rhythm',[.20,.30,.40]);
  var pen=has(r,'wt_perfect')?(e.boss?8:(e.def||0)):val(r,'wt_split',[2,3,4]);damage+=Math.min(e.def||0,pen);
  if(e.elite||e.boss)damage*=1+val(r,'wt_heavy',[.10,.15,.20]);
  if(e.boss&&has(r,'wt_titans'))damage*=1.25;
 }
 if(has(r,'lt_mark')&&e.titleLanternMarked&&!e.titleLanternHit){damage*=1.2;e.titleLanternHit=true;}
 e.titleHeroTurn=r.turn+1;return Math.max(1,Math.ceil(damage));
}
function onKill(r,e,drop,h){
 if(e.ethereal||e.titleKillRewarded)return;e.titleKillRewarded=true;
 var q=state(r);if(q.casting&&!q.castManaReward&&has(r,'mt_resonance')){r.mp=Math.min(h.stats().mp,r.mp+val(r,'mt_resonance',[2,3,4]));q.castManaReward=true;}if(has(r,'wt_tempo'))q.victoryStrike=true;if(has(r,'wt_fervor'))q.fervor=Math.min(5,(q.fervor||0)+1);
}
function petHit(r,p,e,damage,h){
 syncPet(r,p);var q=state(r),charge=q.petCharge;
 if(has(r,'wt_pair')&&e.titlePairReady){damage*=1.35;e.titlePairReady=false;}
 if(charge){damage+=charge.damage;if(has(r,'mt_fused')){damage*=1.4;applySchool(r,e,charge.school);}
  if(charge.double)damage*=2;q.petCharge=null;
 }
 return Math.max(1,Math.ceil(damage));
}
function applySchool(r,e,school){
 var duration=1+schoolDuration(r,school);
 if(school==='fire')e.burn=Math.max(e.burn||0,duration+2);
 else if(school==='water'||school==='air')e.stun=Math.max(e.stun||0,duration);
 else if(school==='earth')e.guard=Math.min(e.guard||0,-2);
 else if(school==='dark')e.poison=Math.max(e.poison||0,duration+1);
 else if(school==='light')r.shield=(r.shield||0)+Math.max(1,Math.ceil((r.summon||{}).maxHp*.05)||1);
}
function petAfterHit(r,p,e,damage,h){
 if(e.titleHeroTurn===r.turn&&has(r,'wt_pair'))e.titlePairReady=true;
 var rate=has(r,'wt_insatiable')?.30:val(r,'wt_blood',[.15,.20,.25]);
 var cap=has(r,'wt_insatiable')?.20:val(r,'wt_feast',[.12,.15,.18])||val(r,'wt_blood',[.08,.10,.12]);
 if(rate)p.hp=Math.min(p.maxHp,p.hp+Math.min(Math.ceil(damage*rate),Math.ceil(p.maxHp*cap)));
 if(e.hp<=0&&!e.ethereal){var heal=has(r,'wt_redfeast')?.15:val(r,'wt_victory',[.05,.07,.09]);p.hp=Math.min(p.maxHp,p.hp+Math.ceil(p.maxHp*heal));if(has(r,'wt_redfeast'))r.hp=Math.min(h.stats().hp,r.hp+Math.ceil(h.stats().hp*.05));}
}
var harm=['attack','burn','stun','drain','chain','aoe','burnall','freezeall','holy','weakness','drainall','earthquake','sunfall','soulcovenant','firstlight'];
function effectMultiplier(r,sp){
 var chosen=state(r).school===sp.school,n=1;
 if(chosen)n+=val(r,'mt_effect',[.10,.15,.20])+(has(r,'mt_lord')?.20:0);
 if(['heal','shield','healshield','lastlight','blessing','timestop','stun','freezeall','weakness','burn','burnall','drain','drainall'].includes(sp.kind))n+=val(r,'mt_expand',[.15,.20,.25]);
 return n;
}
function previewMultiplier(r,sp){
 var n=1;
 if(harm.includes(sp.kind)){
  n+=val(r,'mt_power',[.08,.12,.16]);
  if(state(r).school===sp.school)n+=val(r,'mt_school',[.10,.15,.20])+val(r,'mt_elemental',[.10,.15,.20])+(has(r,'mt_lord')?.25:0);
  n*=1-val(r,'mt_familiar',[.10,.15,.20]);
 }else {n*=effectMultiplier(r,sp);if(['heal','shield','healshield','lastlight'].includes(sp.kind))n*=1+schoolDuration(r,sp.school);}
 return n;
}
function schoolDuration(r,school){return state(r).school===school?(has(r,'mt_architect')?2:has(r,'mt_seal')?1:0):0;}
function effectTurns(r,sp,base){return Math.max(1,Math.ceil(base*effectMultiplier(r,sp)))+schoolDuration(r,sp.school);}
function spellHit(r,sp,e,raw,h){
 var q=state(r),pen=has(r,'mt_arcane')?8:val(r,'mt_pierce',[2,3,4]);
 var amount=Math.max(1,raw-Math.max(0,(e.def||0)-pen));
 if(e.hp<e.maxHp*.30)amount*=1+val(r,'mt_execute',[.20,.30,.40]);
 if(e.titleSpellChain){amount*=1+(has(r,'mt_unbound')?.35:val(r,'mt_chain',[.10,.15,.20]));e.titleSpellChain=false;}
 if(e.titleControlled&&has(r,'mt_consequence')){amount*=1.25;e.titleControlled=false;}
 return Math.max(1,Math.ceil(amount));
}
function afterSpellHit(r,sp,e,before,damage,h){
 var q=state(r);q.castDamage=Math.max(q.castDamage||0,Math.min(before,damage));
 if(e.hp>0){
  if(['burn','burnall'].includes(sp.kind)){e.burn=Math.max(e.burn||0,effectTurns(r,sp,3));e.titleBurnFactor=effectMultiplier(r,sp);}
  if(['stun','freezeall'].includes(sp.kind)){e.stun=Math.max(e.stun||0,effectTurns(r,sp,e.boss?1:2));e.titleControlled=true;}
  if(sp.kind==='weakness'){e.titleControlled=true;e.guard=-Math.max(1,Math.ceil(2*effectMultiplier(r,sp)));}
  if(['burn','burnall','stun','freezeall','weakness'].includes(sp.kind)&&has(r,'mt_chain'))e.titleSpellChain=true;
 }else{
  if(!e.ethereal&&!q.castManaReward){var restored=val(r,'mt_resonance',[2,3,4]);if(restored){r.mp=Math.min(h.stats().mp,r.mp+restored);q.castManaReward=true;}}
  var excess=Math.max(0,damage-before);
  if(has(r,'mt_chord')&&excess>0&&!q.spellSplash){
   var next=h.targets().filter(function(t){return t.foe!==e&&t.foe.hp>0;}).sort(function(a,b){return Math.abs(a.id-(e.tileId||0))-Math.abs(b.id-(e.tileId||0));})[0];
   if(next){q.spellSplash=true;h.hit(next,excess*.5);q.spellSplash=false;}
   else {var guard=h.roomTargets().find(function(g){return g!==e&&g.hp>0;});if(guard)h.hitRoom(guard,excess*.5);}
  }
 }
}
function spellCast(r,sp){var q=state(r);q.castManaReward=false;q.castDamage=0;q.casting=sp.id;}
function finishSpell(r,sp){
 var q=state(r);
 if(has(r,'mt_channel')&&sp.school===q.school&&q.castDamage>0){
  q.charges=(q.charges||0)+1;var damage=q.castDamage*val(r,'mt_channel',[.30,.45,.60]);
  q.petCharge={school:sp.school,damage:Math.ceil(damage),double:has(r,'mt_archsummon')&&q.charges%3===0};
 }
 q.casting=null;
}
function manaMultiplier(r){return 1-val(r,'mt_economy',[.08,.12,.16]);}
function canCast(r,sp){if(sp.rank<=2||sp.rank===6||sp.rank<=2+level(r,'mt_initiate'))return null;return 'Нужен «Посвящённый эфира» подходящей ступени';}
function skills(r){return data.filter(function(t){return ['lt_crossbow','lt_hound','lt_silence','lt_exchange'].includes(t.id)&&ownedLevel(r,t.id)>0;});}
function toolOf(r){var q=state(r),t=byId[q.active];return t?{name:t.name,kind:'lantern-skill',icon:({lt_crossbow:'crossbow',lt_hound:'paw',lt_silence:'moon',lt_exchange:'mana'})[t.id],id:t.id,cooldown:Math.max(0,(q.cooldowns[t.id]||0)-(r.turn||0))}:null;}
function useTool(r,h,selected){
 var q=state(r),id=q.active,st=h.stats(),cd=0;
 if(!id||!has(r,id))return {ok:false,message:'Изучите навык III ранга Фонарщика.'};
 if((q.cooldowns[id]||0)>r.turn)return {ok:false,message:'До восстановления: '+(q.cooldowns[id]-r.turn)+' ходов.'};
 if(id==='lt_crossbow'){
  var room=h.roomTargets(),target=h.targets().find(function(t){return String(t.id)===String(selected);}),guard=room.find(function(g){return String(g.slot)===String(selected);});
  if(!target&&!guard)return {ok:false,message:'Выберите обнаруженного противника.'};
  var foe=target?target.foe:guard;
  var power=st.atk*1.5*(1+val(r,'lt_bolt',[.20,.35,.50]))*((foe.elite||foe.boss)&&has(r,'lt_killer')?1.35:1);
  if(target)h.hit(target,power);else h.hitRoom(guard,Math.max(1,power-(guard.def||0)));
  if(has(r,'lt_explosive')){
   if(target){var near=window.ClickerRules.near(target.id),other=h.targets().find(function(t){return t!==target&&near.includes(t.id);});if(other)h.hit(other,power*.5);}
   else {var otherGuard=room.find(function(g){return g!==guard&&Math.abs(g.slot-guard.slot)===1;});if(otherGuard)h.hitRoom(otherGuard,Math.max(1,power*.5-(otherGuard.def||0)));}
  }
  cd=val(r,'lt_reload',[9,8,7])||10;
 }else if(id==='lt_hound'){
  if(r.titleHound&&r.titleHound.hp>0)return {ok:false,message:'Гончая уже призвана.'};
  var price=Math.ceil(st.hp*(has(r,'lt_guide')&&q.houndDied?.05:.10));if(r.hp<=price)return {ok:false,message:'Недостаточно HP для безопасного призыва.'};
  r.hp-=price;r.titleHound={name:'Походная гончая',hp:Math.ceil(st.hp*.4),maxHp:Math.ceil(st.hp*.4),atk:Math.max(1,Math.ceil(st.atk*.5)),def:1};syncPet(r,r.titleHound);hintSupply(r);q.houndDied=false;cd=12;
 }else if(id==='lt_silence'){
  q.quiet=val(r,'lt_quiet',[2,2,3])||1;q.rangedDelay=val(r,'lt_disrupt',[1,2,3]);
  if(has(r,'lt_deadtime')&&!q.deadtime){q.deadtime=true;q.bossQuiet=q.quiet+1;}
  cd=10;
 }else{
  var toMana=selected==='mana',need=Math.ceil((toMana?st.hp:st.mp)*.20),pool=toMana?r.hp:r.mp;
  if(pool<need||(toMana&&pool===need))return {ok:false,message:'Недостаточно ресурса для обмена.'};
  var rate=has(r,'lt_equal')?.20:val(r,toMana?'lt_lifemana':'lt_manalife',[.18,.21,.24])||.15;
  if(toMana){if(r.mp>=st.mp)return {ok:false,message:'Мана уже полная.'};r.hp-=need;r.mp=Math.min(st.mp,r.mp+Math.ceil(st.mp*rate));}
  else{if(r.hp>=st.hp)return {ok:false,message:'Здоровье уже полное.'};r.mp-=need;r.hp=Math.min(st.hp,r.hp+Math.ceil(st.hp*rate));}
  cd=8;
 }
 q.cooldowns[id]=r.turn+cd;return {ok:true,message:byId[id].name+' · без затраты хода.',free:true};
}
function turn(r,h){
 var q=state(r);q.freezeTimers=q.quiet>0;q.freezeRanged=q.rangedDelay>0;q.freezeBoss=q.bossQuiet>0;
 if(q.quiet>0)q.quiet--;if(q.rangedDelay>0)q.rangedDelay--;if(q.bossQuiet>0)q.bossQuiet--;
 var p=r.titleHound;if(p&&p.hp>0){
  syncPet(r,p);var t=h.targets().find(h.reachable),g=h.roomTargets()[0];
  if(t){var before=t.foe.hp,damage=petHit(r,p,t.foe,Math.max(1,p.atk-(t.foe.def||0)),h);h.provoke(t.foe,'hound');t.foe.hp=Math.max(0,t.foe.hp-damage);petAfterHit(r,p,t.foe,Math.min(before,damage),h);if(!t.foe.hp)h.kill(t);}
  else if(g){var before=g.hp,damage=petHit(r,p,g,Math.max(1,p.atk-(g.def||0)),h);h.provoke(g,'hound');h.hitRoom(g,damage);petAfterHit(r,p,g,Math.min(before,damage),h);}
 }
}
function frozen(r,e){var q=state(r);return !!(q.freezeTimers||(e.ranged&&q.freezeRanged)||((e.boss||e.elite)&&q.freezeBoss));}
function physicalMultiplier(r,e){var n=1+val(r,'wt_breaker',[.05,.10,.15])+(state(r).fervor||0)*.03;if(e&&has(r,'wt_execution')&&e.hp<e.maxHp*(has(r,'wt_punisher')?.45:val(r,'wt_verdict',[.35,.40,.45])||.30))n*=1+(has(r,'wt_punisher')?.30:val(r,'wt_execution',[.15,.20,.25]));return n;}
function resource(r,h,name,qty){var q=state(r);q.resources=(q.resources||0)+1;var extra=0;if(r.titleHound&&r.titleHound.hp>0&&q.resources<=level(r,'lt_pack'))extra++;if(has(r,'lt_collector')&&q.resources%3===0)extra+=3;if(extra)h.addMaterial(name,extra);return extra;}
function tonic(r,kind){if(!has(r,'lt_tonic')||Math.random()>=.20)return false;var key=kind==='mp'?'titleTonicPow':'titleTonicAtk';if((r[key]||0)>=3)return false;r[key]=(r[key]||0)+1;return true;}
window.CryptTitlesRuntime={data:data,level:level,ownedLevel:ownedLevel,borrowedTitle:borrowedTitle,has:has,init:init,cost:cost,unlocked:unlocked,pathConflict:pathConflict,upgraded:upgraded,statBonuses:statBonuses,refreshHints:refreshHints,onFloor:floor,onTurn:turn,onKill:onKill,attack:attack,previewMultiplier:previewMultiplier,spellMultiplier:previewMultiplier,spellCast:spellCast,finishSpell:finishSpell,spellHit:spellHit,afterSpellHit:afterSpellHit,effectTurns:effectTurns,effectMultiplier:effectMultiplier,schoolDuration:schoolDuration,manaMultiplier:manaMultiplier,canCast:canCast,toolOf:toolOf,useTool:useTool,skills:skills,frozen:frozen,summoned:summoned,syncPet:syncPet,petHit:petHit,petAfterHit:petAfterHit,physicalMultiplier:physicalMultiplier,petDamage:petDamage,interceptChance:interceptChance,protectFatal:protectFatal,resource:resource,tonic:tonic,
 // Compatibility endpoints for unrelated equipment and old save readers. Removed titles have no effects.
 rank5:function(){return 0;},masterKeys:function(){return [];},masteryStatValues:function(){return [];},masteryUpgrade:function(){return false;},titleSets:function(){return [];},titleSetEquipped:function(){return 0;},curSup:function(r,k){return r.titleSupplies&&r.titleSupplies[k]||0;},scrollCount:function(r,s,n){return n;},beforeAttack:function(){return false;},counterImmune:function(){return false;},consumeEcho:function(){return false;},incoming:function(r,e,n){return n;},onCorpse:function(r,entry,h){h.addSoul({kind:'unique',name:entry.soul,storyId:entry.id});return true;},onScrap:function(){},summonPanther:function(){return {ok:false,message:'Старое звание заменено деревом Фонарщика.'};}};
})();
