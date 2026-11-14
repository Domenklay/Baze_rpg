/* Forest quest v2: map 97 individually cropped transparent 128×128 PNGs to
 * scene portraits, inventory items and unique equipment. Old F01–F03 art IDs
 * remain untouched for the original sprites and backwards-compatible tests. */
(function(){'use strict';
var ROOT='forest_v2/';
var sceneSprites={
 3:'snare_wire',4:'fox_cage',5:'map_scrap',6:'injured_herbalist',
 7:'fallen_knight',8:'caravan_camp',9:'bee_hive',10:'wolf_den',
 11:'forest_guard',12:'tracker_camp',13:'raven_merchant',14:'woodcutter',
 15:'forest_well',16:'fox',17:'fallen_tree_passage',18:'rope_bridge',
 19:'ranger_watchtower',20:'wardens_note',21:'owl_shrine',22:'honey',
 23:'mushroom',24:'caravan_supply_cache',25:'alpha_wolf',26:'badger',
 27:'wolf_cub',28:'alpha_boar',29:'alpha_boar',30:'ancient_oak',
 31:'poacher_camp',32:'poacher_alarm_gate',33:'root_guardian',
 34:'ranger_aelin',35:'ranger_quartermaster',36:'caravan_supply_cache',
 37:'fungal_colony',38:'fungal_heart',39:'root_guardian',
 40:'grove_rune_stone',41:'moonlit_path',42:'rope_bridge',
 43:'grove_rune_stone',44:'grove_altar',45:'diseased_oak',
 46:'herbalist_mara',47:'forest_lantern',48:'fungal_colony',
 49:'forest_earth_portal',50:'grove_altar'
};
var itemSprites={
 snare_wire:'snare_wire',healing_salve:'healing_salve',
 herbal_recipe:'herbal_recipe',ration:'ration',cart_token:'cart_token',
 firewood:'firewood',waymark:'waymark',nectar:'flower_elixir',
 fox_scent:'fox_scent',knight_emblem:'ranger_emblem',
 armor_plate:'armor_plate',wardens_note:'wardens_note',
 cache_key:'cache_key',repair_straps:'repair_straps',
 bridge_hooks:'bridge_hooks',raven_feather:'raven_feather',
 raven_key:'raven_key',wolf_scent:'wolf_scent',wolf_bait:'wolf_bait',
 wolf_cub_token:'wolf_cub_token',pack_whistle:'pack_whistle',
 boar_lure:'boar_lure',forest_moss:'forest_moss',
 herbal_extract:'herbal_extract',poacher_names:'poacher_names',
 alarm_bell:'alarm_bell',scope_lens:'scope_lens',
 scout_powder:'scout_powder',oak_resin:'oak_resin',
 living_seed:'living_seed',tree_bark:'tree_bark',
 fungal_sample:'spore',fungus_essence:'spore',
 forest_compass:'forest_compass',lunar_dew:'flower_elixir',
 antivenom:'antivenom',ranger_flare:'ranger_flare',
 supply_crate:'supply_crate',acorn:'acorn',owl_feather:'owl_feather',
 forest_coin:'cart_token',map_scrap:'map_scrap',
 ranger_badge:'ranger_badge',honey:'honey',water:'water',
 mushroom:'mushroom',spore:'spore',smoker:'ranger_flare',
 axe:'woodcutter',rope:'rope',forest_moss_bundle:'forest_moss',
 living_seed_bundle:'living_seed',oak_rune:'oak_rune'
};
var gearSprites={
 fox_cloak:'fox_cloak',ranger_boots:'ranger_boots',
 ranger_bow:'ranger_bow',owl_charm:'owl_charm',
 warden_armor:'warden_armor',warden_ring:'warden_ring',
 moon_mantle:'moon_mantle',forager_bag:'forager_bag',
 forest_lantern:'forest_lantern',oak_amulet:'oak_amulet'
};
function pathOf(key){return typeof key==='string'&&/^[a-z0-9_]+$/.test(key)?ROOT+key+'.png':null;}
function scene(id){return pathOf(sceneSprites[Number(id)]);}
function item(id){return pathOf(itemSprites[id]);}
function gear(id){return pathOf(gearSprites[id]);}
var FE=window.CryptForestEvents;
if(FE){
 for(var id in sceneSprites){
  var def=FE.scene(Number(id));if(def)def.sprite=scene(Number(id));
 }
 for(var name in itemSprites){
  if(FE.itemDefs[name])FE.itemDefs[name][1]=item(name);
 }
}
window.CryptForestV2Art={ROOT:ROOT,sceneSprites:sceneSprites,itemSprites:itemSprites,gearSprites:gearSprites,
 scene:scene,item:item,gear:gear,pathOf:pathOf};
})();
