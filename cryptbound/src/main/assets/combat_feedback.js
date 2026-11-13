/* Transient battle presentation. Never stored in saves and never changes combat values. */
(function(){
'use strict';
var previous=null,pending=null,queue=[],history=[],anchors=Object.create(null),serial=0,resetTimer=0;
function run(){return window.Crypt&&window.Crypt.state&&window.Crypt.state().run;}
function units(){
 var r=run(),out=Object.create(null);if(!r)return out;
 out.hero={hp:Math.max(0,r.hp),shield:Math.max(0,(r.shield||0)+(r.setShieldRemaining||0))};
 if(r.summon)out.summon={hp:Math.max(0,r.summon.hp),shield:0};
 if(r.ghost)out.ghost={hp:Math.max(0,r.ghost.hp),shield:0};
 var cave=r.chamberActive!=null&&r.tiles[r.chamberActive];
 if(cave&&cave.room&&cave.kind==='chamber')cave.room.guards.forEach(function(g){out['guard:'+cave.id+':'+g.slot]={hp:Math.max(0,g.hp),shield:Math.max(0,g.guard||0)};});
 else r.tiles.forEach(function(t){if(t.foe)out['enemy:'+t.id]={hp:Math.max(0,t.foe.hp),shield:Math.max(0,t.foe.guard||0)};});
 return out;
}
function rememberAnchors(){
 if(!document.querySelectorAll)return;
 document.querySelectorAll('[data-unit]').forEach(function(el){if(!el.getBoundingClientRect)return;var rect=el.getBoundingClientRect();if(rect.width&&rect.height&&!anchors[el.dataset.unit])anchors[el.dataset.unit]={x:rect.left+rect.width/2,y:rect.top+rect.height*.18};});
}
function hide(){queue=[];var layer=document.getElementById('combat-fx');if(layer)layer.innerHTML='';}
function reset(keepPending){previous=null;if(!keepPending)pending=null;anchors=Object.create(null);hide();}
function begin(label,name){if(name==='begin')reset();previous=name==='begin'?null:units();pending=label||null;anchors=Object.create(null);rememberAnchors();}
function emit(actor,text,kind){
 var item={id:++serial,actor:actor,text:String(text),kind:kind||'action',at:Date.now()};
 queue.push(item);history.push(item);if(history.length>120)history.shift();
}
function capture(){
 if(!run()){previous=null;return;}
 var current=units();if(!previous){previous=current;return;}
 Object.keys(previous).forEach(function(id){if(!current[id]&&(id.indexOf('enemy:')===0||id.indexOf('guard:')===0))return;var a=previous[id],b=current[id]||{hp:0,shield:0};
  var hp=b.hp-a.hp,shield=b.shield-a.shield;
  if(hp)emit(id,(hp>0?'+':'−')+Math.abs(hp),hp>0?'heal':'damage');
  if(shield<0)emit(id,'−'+Math.abs(shield)+' щит','shield');
 });previous=current;
}
function commit(){if(pending){emit('hero',pending,'action');pending=null;}capture();}
function actorId(unit){
 var r=run();if(!r||!unit)return null;if(unit===r.summon)return 'summon';if(unit===r.ghost)return 'ghost';
 var cave=r.chamberActive!=null&&r.tiles[r.chamberActive];
 if(cave&&cave.room&&cave.room.guards.indexOf(unit)>=0)return 'guard:'+cave.id+':'+unit.slot;
 var t=r.tiles.find(function(t){return t.foe===unit;});return t?'enemy:'+t.id:null;
}
function actor(unit,pose,label){
 if(!unit)return;unit.spriteFx=pose;unit.spriteFxUntil=Date.now()+1000;
 var id=actorId(unit);if(id)emit(id,label||'Удар','action');
}
function paint(){
 if(!document.createElement){queue=[];return;}
 var modal=document.getElementById('overlay');if(modal&&modal.innerHTML){hide();return;}
 var layer=document.getElementById('combat-fx');if(!layer){layer=document.createElement('div');layer.id='combat-fx';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);}
 var batch=queue.splice(0),offset=Object.create(null),older=Array.from(layer.children);rememberAnchors();
 batch.sort(function(a,b){return Number(a.kind!=='action')-Number(b.kind!=='action');});
 batch.forEach(function(fx){
  if(Date.now()-fx.at>1500)return;
  var point=anchors[fx.actor];if(!point)return;
  var rise=offset[fx.actor]||0;
  var el=document.createElement('span');el.className='combat-float fx-'+fx.kind;el.dataset.actor=fx.actor;el.textContent=fx.text;
  el.style.left=Math.max(38,Math.min(window.innerWidth-38,point.x))+'px';el.style.top=Math.max(20,point.y-rise)+'px';
  layer.appendChild(el);var box=el.getBoundingClientRect();offset[fx.actor]=rise+box.height+4;var half=Math.min(box.width/2,window.innerWidth/2-4);el.style.left=Math.max(half+4,Math.min(window.innerWidth-half-4,point.x))+'px';setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},1200);
 });
 older.forEach(function(el){var amount=offset[el.dataset.actor]||0;if(amount)el.style.top=(parseFloat(el.style.top)-amount)+'px';});
}
function schedule(){
 clearTimeout(resetTimer);var r=run();if(!r)return;
 var until=[r.fxUntil||0];if(r.summon)until.push(r.summon.spriteFxUntil||0);if(r.ghost)until.push(r.ghost.spriteFxUntil||0);
 r.tiles.forEach(function(t){if(t.foe)until.push(t.foe.spriteFxUntil||0);if(t.room)t.room.guards.forEach(function(g){until.push(g.spriteFxUntil||0);});});
 var now=Date.now(),future=until.filter(function(v){return v>now;});if(!future.length)return;
 resetTimer=setTimeout(function(){if(window.Crypt)window.Crypt.debug.draw(true);},Math.max(16,Math.min.apply(Math,future)-now+15));
}
window.CryptFeedback={begin:begin,reset:reset,hide:hide,capture:capture,commit:commit,actor:actor,emit:emit,paint:paint,schedule:schedule,events:function(){return history.slice();}};
})();
