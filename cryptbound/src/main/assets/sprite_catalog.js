/* Approved T1/T2 sprites and resource icons imported from the user's RPG Clicker Infinity.
 * Everything resolves to packaged offline assets. Unknown monsters keep their SVG portraits. */
(function(){
'use strict';
var routes=Object.create(null);
["beeswarm","barkweaverspider","forestslime","mossslime","sporepuff","amberslime","livingroot","thornvine","woodimp","forestwisp"].forEach(function(k,i){routes['r1_'+(10+i)]='t1/'+k;});
["caveblindtooth","quartzlizard","blindmoledigger","undergroundeel","micamoth","mirrorbeetle","crystalweaverspider","blindmanyleg","luminomycete","mosscrawler"].forEach(function(k,i){routes['r5_'+i]='t2/'+k;});
// Newly painted missing forest species; existing published monster sheets stay intact.
['rootbadger','thiefsquirrel','spinyhedgehog','barkbeetle','soldierant'].forEach(function(name,i){routes['r1_'+(5+i)]='t1/'+name;});
var materialIds=["adamantite_ingot","adamantite_ore","amber_resin","ancient_knot","ancient_wood","animal_hide","arcane_thread","ash_wood","astral_dust","bandit_badge","bark","bark_inkwell","bear_claw","bear_hide","birch_wood","black_fish","black_reed","blackspore","boar_meat","boar_tusk","bog_pearl","bog_spores","brightflower","bronze_ingot","calm_essence","cave_bat_leather","cave_lichen","coal","copper_ingot","copper_ore","cursed_cloth","deer_antler","deer_meat","dire_fang","elk_antler","energy_essence","equipment_scrap_t1","equipment_scrap_t2","flexible_bowstring","flexible_branch","flint","focus_essence","forest_blue_crystal","forest_chest","forest_core","forest_mint","forest_slime","forest_token","fox_hide","fox_tail","frog_duckweed","game_meat","gentian","glowing_moss","glued_core","gold","gold_ingot","gold_ore","golem_shard","granite","green_resin","griffin_feather","hardened_resin","hardwood_core","hardwood_plank","hellebore","hollow_wood","honeyflower","hunting_trophy","hydra_heart","iron_ingot","iron_moss","iron_ore","ironwood","lake_scales","leather","light_essence","lotus_fiber","mature_oak_wood","mini_forest_barkbeetle_mother_trophy","mini_forest_boar_slasher_trophy","mini_forest_grove_keeper_trophy","mini_forest_root_guardian_trophy","mini_forest_wolf_alpha_trophy","mini_highland_armored_bat_trophy","mini_highland_bandit_chief_trophy","mini_highland_basilisk_trophy","mini_highland_crystal_elemental_trophy","mini_highland_granite_guardian_trophy","mini_marsh_drowned_guard_trophy","mini_marsh_elder_witch_trophy","mini_marsh_serpent_trophy","mini_marsh_spore_matriarch_trophy","mini_marsh_toad_king_trophy","mist_sedge","mithril_ingot","mithril_ore","moon_dew","mountain_crystal","mountain_reed","mountain_rosehip","mountain_thyme","mountain_trout","nacre_shell","nightflower","oak_wood","pine_wood","plant_fiber","plant_ink","plantain","prickly_fern","rabbit_foot","rabbit_hide","rabbit_meat","rainbow_crystal","raw_essence","red_bark","red_tree_sap","reinforced_leather","resilient_bark","resin_lacquer","river_algae","river_pearl","river_reed","river_roach","river_scales","river_shell","root_fiber","silver_ingot","silver_ore","silverleaf","sleep_grass","smoky_quartz","snake_root","soft_moss","soft_stuffing","soul_essence","spirit_dust","spirit_root","spring_pearl","star_ingot","star_ore","steel_ingot","stone","stone_abrasive","stone_block","stonebloom","straight_branch","swamp_algae","swamp_eel","swamp_lotus","swamp_wormwood","t2_ametra_origin_facet","t2_animated_stone_shard","t2_ash_echo","t2_ash_flower","t2_basalt","t2_black_captain_seal","t2_blackglass_pearl","t2_blazing_alpha_fang","t2_canyon_dense_wood","t2_canyon_silverfish","t2_canyon_stiff_feather","t2_canyon_thick_hide","t2_cave_moss","t2_chipped_stone_head","t2_crescent_claw","t2_crystal_echo","t2_crystal_matriarch_thread","t2_crystal_shell_plate","t2_echo_condensate","t2_echo_priest_seal","t2_fireproof_binding","t2_glowing_bioslime","t2_hargul_armor_segment","t2_heat_resistant_wood","t2_heatproof_scale","t2_light_guardian_prism","t2_light_oak","t2_lightfin_fish","t2_lightstone","t2_limestone","t2_living_geode_core","t2_longhorn_sinew","t2_marble","t2_milky_quartz","t2_mirror_chitin","t2_obelisk_core","t2_obsidian","t2_obsidian_edge","t2_obsidian_executioner_blade","t2_old_pack_fang","t2_prismatic_pearl","t2_quartz_lens","t2_raider_fastener","t2_reinforced_stone_plate","t2_rift_black_chitin","t2_rift_energy_clot","t2_rock_root","t2_royal_blind_fang","t2_ruined_gear_fragment","t2_salt_trails_seal","t2_sandstone","t2_sarkat_fossil_rib","t2_scarlet_pearl","t2_scorpion_matriarch_stinger","t2_sheet_mica","t2_silk_membrane","t2_slag_matriarch_seed","t2_smothering_essence","t2_spiky_chitin","t2_thermal_perch","t2_underground_hide","t2_volcanic_core","thick_branch","thought_essence","thunderleaf","tin_ingot","tin_ore","trance_essence","treant_heart","tree_resin","tree_seed","troll_blood","venom_gland","vine","violet_flower","void_essence","white_bark","white_pollen","white_sap","witch_amber","wolf_fang","wolf_hide","wood","wood_plank","wood_shavings","wood_thorn","wooden_blank","wooden_plate","wooden_reel","wooden_wedge","world_tree_wood","woven_base","woven_cord","wyvern_scale","yew_wood","young_wood"];
var available=Object.create(null);materialIds.forEach(function(id){available[id]=true;});
var aliasesRaw={"Шкура животного":"animal_hide","волчий клык":"wolf_fang","волчьи клыки":"wolf_fang","Клык вожака":"dire_fang","Клык секача":"boar_tusk","кабаньи клыки":"boar_tusk","лисий хвост":"fox_tail","кроличья лапка":"rabbit_foot","Мясо дичи":"game_meat","мясо дичи":"game_meat","лесная сердцевина":"forest_core","Лесная сердцевина":"forest_core","лесной синий кристалл":"forest_blue_crystal","Лесная слизь":"forest_slime","Янтарная смола":"amber_resin","Древесина":"wood","древесина":"wood","Кора":"bark","кора":"bark","Камень":"stone","камень":"stone","Гранит":"granite","Осколок голема":"golem_shard","осколки голема":"golem_shard","Гибкая ветвь":"flexible_branch","ровная ветвь":"straight_branch","упругая жила":"flexible_bowstring","Упругая жила":"flexible_bowstring","тетива":"flexible_bowstring","Проклятая ткань":"cursed_cloth","проклятая ткань":"cursed_cloth","Кожа нетопыря":"cave_bat_leather","Горный кристалл":"mountain_crystal","Чистый горный кристалл":"mountain_crystal","Знак разбойника":"bandit_badge","Знаки разбойника":"bandit_badge","Болотные споры":"bog_spores","грибные споры":"bog_spores","Ведьмин янтарь":"witch_amber","ведьмин янтарь":"witch_amber","сердце гидры":"hydra_heart","сердце древня":"treant_heart","кровь тролля":"troll_blood","ядовитая железа":"venom_gland","Ядовитые железы":"venom_gland","сырая эссенция":"raw_essence","Сырая эссенция":"raw_essence","черноспор":"blackspore","Пыль духов":"spirit_dust","пыль духов":"spirit_dust","Духовный след":"spirit_dust","мягкий мох":"soft_moss","Мягкий мех":"animal_hide","Корневое волокно":"root_fiber","Семя дерева":"tree_seed","Духовный корень":"spirit_root","Духовная сердцевина корня":"spirit_root","Кварцевая крошка":"t2_milky_quartz","Плотная шкура каньона":"t2_canyon_thick_hide","Жёсткое перо каньона":"t2_canyon_stiff_feather","Огнестойкая связка":"t2_fireproof_binding","Шкура подземного зверя":"t2_underground_hide","Зеркальный хитин":"t2_mirror_chitin","Панцирная кристаллопластина":"t2_crystal_shell_plate","Конденсат эха":"t2_echo_condensate","Живое ядро жеоды":"t2_living_geode_core","Нить кристальной матки":"t2_crystal_matriarch_thread","Изначальная грань Аметры":"t2_ametra_origin_facet","Королевский слепой зуб":"t2_royal_blind_fang","Призма светового стража":"t2_light_guardian_prism","Печать жреца эха":"t2_echo_priest_seal","Клык пылающего вожака":"t2_blazing_alpha_fang","Броневой сегмент Харгула":"t2_hargul_armor_segment","Вулканический сердечник":"t2_volcanic_core","Маточное шлаковое зерно":"t2_slag_matriarch_seed","Сердечник обелиска":"t2_obelisk_core","Окаменелое ребро Сарката":"t2_sarkat_fossil_rib","Печать соляных троп":"t2_salt_trails_seal","Сгусток энергии разлома":"t2_rift_energy_clot","Крепёж налётчика":"t2_raider_fastener","Лезвие обсидианового палача":"t2_obsidian_executioner_blade","Маточный спороцвет":"bog_spores","Обломок руинного снаряжения":"t2_ruined_gear_fragment","Хитин":"t2_spiky_chitin","хитин":"t2_spiky_chitin","Шипастый хитин":"t2_spiky_chitin","Серповидный коготь":"t2_crescent_claw","Светящаяся биослизь":"t2_glowing_bioslime","Тлеющая сущность":"t2_smothering_essence","Старые записи":"bark_inkwell","старые записи":"bark_inkwell","Металлолом":"equipment_scrap_t1","Осколок воспоминания":"spirit_dust","Болотная полынь":"swamp_wormwood","Болотная слизь":"forest_slime","Древняя змеиная чешуя":"river_scales","Змеиная чешуя":"river_scales","Змеиный яд":"venom_gland","Знак рощи":"forest_token","Клык старого вожака":"t2_old_pack_fang","Крепкое маховое перо":"griffin_feather","Маточная смола":"hardened_resin","Осколок ожившего камня":"t2_animated_stone_shard","Печать главаря":"bandit_badge","Печать утопленника":"mini_marsh_drowned_guard_trophy","Прочная болотная чешуя":"river_scales","Прочная перепонка":"t2_silk_membrane","Птичье перо":"griffin_feather","Светящийся секрет":"light_essence","Тёмная слизь":"forest_slime","Чешуя василиска":"river_scales","Чёрная печать капитана":"t2_black_captain_seal","Чёрный хитин разлома":"t2_rift_black_chitin","Ядовитое жало матриарха":"t2_scorpion_matriarch_stinger","Ядро гранитного стража":"golem_shard","белая пыльца":"white_pollen","болотная слизь":"forest_slime","пещерная слизь":"t2_glowing_bioslime","рога козерога":"elk_antler","твёрдая сердцевина":"hardwood_core"};
var aliases=Object.create(null);
function norm(v){return String(v||'').toLowerCase().replace(/ё/g,'е').replace(/[«»]/g,'').replace(/\s+/g,' ').trim();}
Object.keys(aliasesRaw).forEach(function(name){aliases[norm(name)]=aliasesRaw[name];});
function materialStem(name){
 var key=norm(name),fromName=key.replace(/[^a-z0-9_]+/g,'_');
 var stem=aliases[key]||fromName;
 return available[stem]?stem:null;
}
function materialIcon(name){
 var stem=materialStem(name);
 if(!stem){
  var concept=(window.CryptConceptMaterials||{})[name];
  if(concept&&/^t\\d+_concept_[a-z0-9_]+$/.test(concept))
   return '<img class="crypt-resource-icon" src="imported/concepts/'+concept+'.svg" alt="" loading="lazy" draggable="false"/>';
  return '<span class="crypt-resource-fallback" aria-hidden="true">◆</span>';
 }
 return '<img class="crypt-resource-icon" src="imported/materials/'+stem+'.svg" alt="" loading="lazy" draggable="false"/>';
}
// Static portraits are extracted from the source game's named 3×4 atlas or hunting sprites.
var portraitRoutes={r1_0:'wolf',r1_1:'boar',r1_2:'fox',r1_3:'deer',r1_4:'rabbit',r1_20:'wolf',r1_21:'boar',r1_25:'treant',r2_0:'bat',r2_7:'bear',r2_8:'bandit',r2_9:'bandit',r2_10:'bandit',r2_12:'golem',r2_20:'bat',r2_21:'bandit',r2_22:'golem',r2_25:'troll',r3_0:'mushroom',r3_4:'toad',r3_11:'wolf',r3_16:'witch',r3_20:'mushroom',r3_21:'toad',r3_23:'witch',r3_25:'hydra'};
function monster(e,pose){
 var path=e&&routes[e.id],portrait=e&&portraitRoutes[e.id];if(!path&&!portrait)return null;
 pose=pose==='attack'||pose==='skill'?pose:'idle';
 var src=path?'imported/enemies/'+path+'/'+pose+'.png':'imported/enemies/portraits/'+portrait+'.png';
 return '<img class="crypt-monster-sprite pose-'+pose+'" src="'+src+'"'+(pose!=='idle'&&e.spriteFxUntil?' style="animation-delay:'+Math.min(0,e.spriteFxUntil-Date.now()-1000)+'ms"':'')+' alt="" draggable="false"/>';
}
function gearIcon(it){
 var icons=window.CryptEquipmentIcons||{},id=it&&it.catalogId;
 if(it&&typeof id==='string'){
  var all=(window.ClickerData&&window.ClickerData.gear)||[];
  var original=all.find(function(item){return item.id===id;});
  if(it.slot==='bracer'&&original&&original.slot==='shoulders'){
   var bracer='adapted_'+original.set+'_bracer';
   if(icons[bracer])id=bracer;
  }else if(it.slot==='cloak'&&original&&original.slot==='legs'){
   var cape=all.find(function(item){return item.set===original.set&&item.slot==='shoulders';});
   if(cape&&icons[cape.id])id=cape.id;
  }
 }
 var src=id&&icons[id];
 return src?'<img class="painted-gear" src="'+src+'" alt="" draggable="false"/>':null;
}
function canonicalMaterial(name){
 if(/animal_hide\s*,\s*game_meat/i.test(name))return 'Шкура животного';
 if(/^game_meat\s*\(/i.test(name))return 'Мясо дичи';
 if(/^spirit_dust\s*,\s*raw_essence/i.test(name))return 'Пыль духов';
 if(/^stone\s*,\s*spirit_dust/i.test(name)||/^stone\s*\(/i.test(name))return 'Камень';
 if(norm(name)==='кора; пчелиный воск')return 'Кора';
 return name;
}
window.CryptSprites={monster:monster,gearIcon:gearIcon,portraitRoutes:portraitRoutes,materialIcon:materialIcon,materialStem:materialStem,canonicalMaterial:canonicalMaterial,monsterRoutes:routes,materialIds:materialIds};
})();
