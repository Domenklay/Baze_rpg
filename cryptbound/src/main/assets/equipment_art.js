/* Original equipment glyphs for nine inventory slots. */
(function(){
'use strict';
var old=window.CryptArt.item;
var newSlots={
 shoulders:'<path d="M13 37L31 13 48 28 62 13 86 37 95 66 72 87 61 60 50 44 38 60 27 87 5 66Z" fill="{metal}" stroke="#130d10" stroke-width="6"/><path d="M16 43l17-15 17 20 16-20 17 15" fill="none" stroke="{shine}" stroke-width="5"/><path d="M31 36l-8 30m48-31l8 30" stroke="#2b1d1d" stroke-width="4"/>',
 gloves:'<path d="M25 19L37 17 46 54 47 12 58 13 59 50 65 19 76 25 66 64 78 45 88 52 69 91 37 90 15 49 24 42 39 60Z" fill="{metal}" stroke="#120f12" stroke-width="6"/><path d="M39 65l22 8 10-14M24 50l19 20" stroke="{shine}" stroke-width="4" fill="none"/><path d="M39 83l29-2" stroke="#38282a" stroke-width="5"/>',
 belt:'<path d="M12 37Q50 51 89 37L88 71Q49 83 12 71Z" fill="{metal}" stroke="#120e10" stroke-width="6"/><path d="M10 47q40 18 80 0" fill="none" stroke="{shine}" stroke-width="5"/><rect x="35" y="37" width="31" height="37" fill="#2c2322" stroke="{shine}" stroke-width="6"/><rect x="44" y="48" width="12" height="15" fill="{metal}"/>',
 legs:'<path d="M26 15L78 15 89 45 68 88 53 85 51 55 40 86 20 90 11 46Z" fill="{metal}" stroke="#151012" stroke-width="6"/><path d="M50 15L52 54M22 39l21 12m27-16l-13 18" fill="none" stroke="{shine}" stroke-width="5"/><path d="M17 75l20 5m29-3l16 6" stroke="#24191b" stroke-width="4"/>',
 boots:'<path d="M21 14L48 17 46 52 59 73 53 90 8 90 8 75 22 62ZM59 17L85 13 78 58 94 70 95 90 54 90 51 76 64 54Z" fill="{metal}" stroke="#141012" stroke-width="5"/><path d="M21 36l25 3m16-2l21-3M20 71l31 0m18 0l21 0" stroke="{shine}" stroke-width="5"/><path d="M8 86h46m3 0h39" stroke="#322423" stroke-width="7"/>'
};
var colors=[
 ['#8c8580','#c1ada0'],
 ['#628c78','#9cd0ae'],
 ['#58799e','#a0bedb'],
 ['#81629b','#c6a4dc'],
 ['#b58249','#f2cf8d']
];
window.CryptArt.item=function(slot,rarity){
 if(slot==='relic')return old('amulet',rarity);
 if(slot==='weapon'||slot==='armor'||slot==='helm')return old(slot,rarity);
 var tmpl=newSlots[slot];if(!tmpl)return old('armor',rarity);
 var color=colors[Math.max(0,Math.min(4,rarity||0))];
 var shape=tmpl.replace(/\{metal\}/g,color[0]).replace(/\{shine\}/g,color[1]);
 return '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 104" aria-hidden="true">'+shape+'</svg>';
};
window.CryptArt.tileBase=function(t){
 if(t==='key')return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><circle cx="34" cy="35" r="19" fill="none" stroke="#d8b979" stroke-width="10"/><path d="M48 47l38 38m-13-15l10-10m-4 18l9-9" stroke="#d8b979" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M31 24l9 12" stroke="#fff1be" stroke-width="4"/></svg>';
 if(t==='loot')return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><path d="M22 20L76 18 82 74 52 90 16 71Z" fill="#614239" stroke="#170f10" stroke-width="7"/><path d="M17 43L81 39M39 22l2 60m26-61l-2 56" stroke="#b68851" stroke-width="7"/><path d="M42 35L59 35 61 56 45 59Z" fill="#e6c588" stroke="#35211d" stroke-width="4"/></svg>';
 return window.CryptArt.tile(t);
};
})();