/* Approved T1/T2 sprites and resource icons imported from the user's RPG Clicker Infinity.
 * Everything resolves to packaged offline assets. Unknown monsters keep their SVG portraits. */
(function(){
'use strict';
var routes=Object.create(null);
["beeswarm","barkweaverspider","forestslime","mossslime","sporepuff","amberslime","livingroot","thornvine","woodimp","forestwisp"].forEach(function(k,i){routes['r1_'+(10+i)]='t1/'+k;});
["caveblindtooth","quartzlizard","blindmoledigger","undergroundeel","micamoth","mirrorbeetle","crystalweaverspider","blindmanyleg","luminomycete","mosscrawler"].forEach(function(k,i){routes['r5_'+i]='t2/'+k;});
var materialIds=["adamantite_ingot","adamantite_ore","amber_resin","ancient_knot","ancient_wood","animal_hide","arcane_thread","ash_wood","astral_dust","bandit_badge","bark_inkwell","bark","bear_claw","bear_hide","birch_wood","black_fish","black_reed","blackspore","boar_meat","boar_tusk","bog_pearl","bog_spores","brightflower","bronze_ingot","calm_essence","cave_bat_leather","cave_lichen","coal","copper_ingot","copper_ore","cursed_cloth","deer_antler","deer_meat","dire_fang","elk_antler","energy_essence","equipment_scrap_t1","equipment_scrap_t2","flexible_bowstring","flexible_branch","flint","focus_essence","forest_blue_crystal","forest_chest","forest_core","forest_mint","forest_slime","forest_token","fox_hide","fox_tail","frog_duckweed","game_meat","gentian","glowing_moss","glued_core","gold_ingot","gold_ore","gold","golem_shard","granite","green_resin","griffin_feather","hardened_resin","hardwood_core","hardwood_plank","hellebore","hollow_wood","honeyflower","hunting_trophy","hydra_heart"];
var available=Object.create(null);materialIds.forEach(function(id){available[id]=true;});
var aliasesRaw={"Шкура животного":"animal_hide","волчий клык":"wolf_fang","волчьи клыки":"wolf_fang","Клык вожака":"dire_fang","Клык секача":"boar_tusk","кабаньи клыки":"boar_tusk","лисий хвост":"fox_tail","кроличья лапка":"rabbit_foot","Мясо дичи":"game_meat","мясо дичи":"game_meat","лесная сердцевина":"forest_core","Лесная сердцевина":"forest_core","лесной синий кристалл":"forest_blue_crystal","Лесная слизь":"forest_slime","Янтарная смола":"amber_resin","Древесина":"wood","древесина":"wood","Кора":"bark","кора":"bark","Камень":"stone","камень":"stone","Гранит":"granite","Осколок голема":"golem_shard","осколки голема":"golem_shard","Гибкая ветвь":"flexible_branch","ровная ветвь":"straight_branch","упругая жила":"flexible_bowstring","Упругая жила":"flexible_bowstring","тетива":"flexible_bowstring","Проклятая ткань":"cursed_cloth","проклятая ткань":"cursed_cloth","Кожа нетопыря":"cave_bat_leather","Горный кристалл":"mountain_crystal","Чистый горный кристалл":"mountain_crystal","Знак разбойника":"bandit_badge","Знаки разбойника":"bandit_badge","Болотные споры":"bog_spores","грибные споры":"bog_spores","Ведьмин янтарь":"witch_amber","ведьмин янтарь":"witch_amber","сердце гидры":"hydra_heart","сердце древня":"treant_heart","кровь тролля":"troll_blood","ядовитая железа":"venom_gland","Ядовитые железы":"venom_gland","сырая эссенция":"raw_essence","Сырая эссенция":"raw_essence","черноспор":"blackspore","Пыль духов":"spirit_dust","пыль духов":"spirit_dust","Духовный след":"spirit_dust","мягкий мох":"soft_moss","Мягкий мех":"animal_hide","Корневое волокно":"root_fiber","Семя дерева":"tree_seed","Духовный корень":"spirit_root","Духовная сердцевина корня":"spirit_root","Кварцевая крошка":"t2_milky_quartz","Плотная шкура каньона":"t2_canyon_thick_hide","Жёсткое перо каньона":"t2_canyon_stiff_feather","Огнестойкая связка":"t2_fireproof_binding","Шкура подземного зверя":"t2_underground_hide","Зеркальный хитин":"t2_mirror_chitin","Панцирная кристаллопластина":"t2_crystal_shell_plate","Конденсат эха":"t2_echo_condensate","Живое ядро жеоды":"t2_living_geode_core","Нить кристальной матки":"t2_crystal_matriarch_thread","Изначальная грань Аметры":"t2_ametra_origin_facet","Королевский слепой зуб":"t2_royal_blind_fang","Призма светового стража":"t2_light_guardian_prism","Печать жреца эха":"t2_echo_priest_seal","Клык пылающего вожака":"t2_blazing_alpha_fang","Броневой сегмент Харгула":"t2_hargul_armor_segment","Вулканический сердечник":"t2_volcanic_core","Маточное шлаковое зерно":"t2_slag_matriarch_seed","Сердечник обелиска":"t2_obelisk_core","Окаменелое ребро Сарката":"t2_sarkat_fossil_rib","Печать соляных троп":"t2_salt_trails_seal","Сгусток энергии разлома":"t2_rift_energy_clot","Крепёж налётчика":"t2_raider_fastener","Лезвие обсидианового палача":"t2_obsidian_executioner_blade","Маточный спороцвет":"bog_spores","Обломок руинного снаряжения":"t2_ruined_gear_fragment","Хитин":"t2_spiky_chitin","хитин":"t2_spiky_chitin","Шипастый хитин":"t2_spiky_chitin","Серповидный коготь":"t2_crescent_claw","Светящаяся биослизь":"t2_glowing_bioslime","Тлеющая сущность":"t2_smothering_essence","Старые записи":"bark_inkwell","старые записи":"bark_inkwell","Металлолом":"equipment_scrap_t1","Осколок воспоминания":"spirit_dust"};
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
 if(!stem)return '<span class="crypt-resource-fallback" aria-hidden="true">◆</span>';
 return '<img class="crypt-resource-icon" src="imported/materials/'+stem+'.svg" alt="" loading="lazy" draggable="false"/>';
}
function monster(e,pose){
 var path=e&&routes[e.id];if(!path)return null;
 pose=pose==='attack'||pose==='skill'?pose:'idle';
 return '<img class="crypt-monster-sprite pose-'+pose+'" src="imported/enemies/'+path+'/'+pose+'.png" alt="" draggable="false"/>';
}
function canonicalMaterial(name){
 if(/animal_hide\s*,\s*game_meat/i.test(name))return 'Шкура животного';
 if(/^game_meat\s*\(/i.test(name))return 'Мясо дичи';
 if(/^spirit_dust\s*,\s*raw_essence/i.test(name))return 'Пыль духов';
 if(/^stone\s*,\s*spirit_dust/i.test(name)||/^stone\s*\(/i.test(name))return 'Камень';
 if(norm(name)==='кора; пчелиный воск')return 'Кора';
 return name;
}
window.CryptSprites={monster:monster,materialIcon:materialIcon,materialStem:materialStem,canonicalMaterial:canonicalMaterial,monsterRoutes:routes,materialIds:materialIds};
})();
