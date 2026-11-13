/* Original painted environmental objects; existing hero/monster art is untouched. */
(function(){
'use strict';
var art=window.CryptArt,oldTile=art.tile,oldBase=art.tileBase;
var props={chest:0,coin:1,key:2,exit:3,stairs:3,altar:4,potion:5,shop:6,event:7,puzzle:7,corpse:8,chamber:9,secret:10,trap:11,loot:0};
function prop(kind){return '<img class="painted-prop" src="ui/objects/prop-'+String(props[kind]).padStart(2,'0')+'.png" alt="" draggable="false"/>';}
art.tile=function(kind,monster){return Object.prototype.hasOwnProperty.call(props,kind)?prop(kind):oldTile(kind,monster);};
art.tileBase=function(kind){return Object.prototype.hasOwnProperty.call(props,kind)?prop(kind):oldBase?oldBase(kind):oldTile(kind);};
})();
