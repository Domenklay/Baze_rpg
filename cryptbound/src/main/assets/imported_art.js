/* One action = one original pose frame for one second, shared by all hero portraits. */
(function(){
'use strict';
var map={necromancer:'mage_m',executioner:'strength_m',scout:'rogue_m',sorceress:'mage_f',guardian:'strength_f',assassin:'rogue_f'};
var last=Object.create(null),selected=Object.create(null);
function art(kind,pose){
 var key=map[kind]||map.necromancer;
 if(pose!=='attack'&&pose!=='skill')return '<img class="clicker-hero-art" src="imported/'+key+'_idle.png" draggable="false" alt=""/>';
 var r=window.Crypt&&window.Crypt.state&&window.Crypt.state().run,token=r?(r.fxUntil+':'+(r.poseToken||0)):0,group=key+':'+pose;
 if(!selected[group]||selected[group].token!==token){
  var choices=[0,1,2].filter(function(n){return n!==last[group];});
  var index=choices[Math.floor(Math.random()*choices.length)];last[group]=index;selected[group]={token:token,index:index};
 }
 var frame=selected[group].index,suffix=frame?'_'+(frame+1):'';
 return '<img class="clicker-hero-art single-pose pose-'+pose+'" src="imported/'+key+'_'+pose+suffix+'.png" style="animation-delay:'+Math.min(0,(r?r.fxUntil-Date.now()-1000:0))+'ms" draggable="false" alt=""/>';
}
window.CryptArt.hero=art;window.CryptArt.miniHero=art;window.CryptArt.artKey=function(id){return map[id]||'mage_m';};
})();
