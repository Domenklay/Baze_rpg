/* Fully offline 3-frame animation of six approved RPG Clicker Infinity heroes. */
(function(){
'use strict';
var map={necromancer:'mage_m',executioner:'strength_m',scout:'rogue_m',
 sorceress:'mage_f',guardian:'strength_f',assassin:'rogue_f'};
function art(kind,pose){
 var key=map[kind]||map.necromancer;
 if(pose!=='attack'&&pose!=='skill'){
  return '<img class="clicker-hero-art" src="imported/'+key+'_idle.png" draggable="false" alt="" />';
 }
 var files=['imported/'+key+'_'+pose+'.png','imported/'+key+'_'+pose+'_2.png','imported/'+key+'_'+pose+'_3.png'];
 return '<span class="clicker-hero-sequence seq-'+pose+'" aria-hidden="true">'+
  files.map(function(src,i){return '<img class="clicker-hero-art seq-frame frame-'+(i+1)+'" src="'+src+'" draggable="false" alt=""/>';}).join('')+'</span>';
}
window.CryptArt.hero=art;
window.CryptArt.miniHero=art;
window.CryptArt.artKey=function(id){return map[id]||'mage_m';};
})();