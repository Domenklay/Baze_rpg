/* Approved six heroes from Domenklay/Rpg_clicker_infinity, bundled in APK. */
(function(){
'use strict';
var map={necromancer:'mage_m',executioner:'strength_m',scout:'rogue_m',
 sorceress:'mage_f',guardian:'strength_f',assassin:'rogue_f'};
function art(kind,pose){
 var key=map[kind]||map.necromancer;
 var action=pose==='attack'?'attack':pose==='skill'?'skill':'idle';
 return '<img class="clicker-hero-art clicker-hero-'+key+'" src="imported/'+key+'_'+action+'.png" draggable="false" alt="" />';
}
window.CryptArt.hero=art;
window.CryptArt.miniHero=art;
window.CryptArt.artKey=function(id){return map[id]||'mage_m';};
})();