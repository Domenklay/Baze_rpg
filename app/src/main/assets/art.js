/* Original vector artwork for Baze RPG: no third-party assets. */
(function(){
'use strict';
function svg(body,cls,view){return '<svg class="'+(cls||'figure-svg')+'" viewBox="'+(view||'0 0 220 260')+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+body+'</svg>';}
var outline=' stroke="#08090a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
var highlights='<path d="M52 242l12-9m5 13l11-9m8 8l7-12m11 11l10-6m23 5l9-10m12 13l7-12" stroke="#7b5d52" stroke-width="2" opacity=".55"/>';
function knight(){return svg(
'<ellipse cx="106" cy="247" rx="83" ry="8" fill="#070607" opacity=".7"/>'+
'<path d="M69 112L53 155 41 238 91 246 125 238 169 245 154 148 139 106Z" fill="#382b2a"'+outline+'/>'+
'<path d="M78 123l20 23 28-19 10 107-35 15-35-18Z" fill="#9a302d"'+outline+'/>'+
'<path d="M103 146L103 230M79 183l47 0" stroke="#c58a64" stroke-width="5"/>'+
'<path d="M65 103Q36 103 36 131L35 170 67 186 83 148Z" fill="#77726b"'+outline+'/>'+
'<path d="M146 104Q181 105 184 133L173 171 144 171 126 131Z" fill="#77716b"'+outline+'/>'+
'<path d="M49 126l25 2m-28 15l20 6m86-24l16 4m-17 13l18 2" stroke="#b8a395" stroke-width="3"/>'+
'<path d="M48 165L35 200l26 13 26-30-15-15Z" fill="#4f4d4c"'+outline+'/>'+
'<path d="M151 160l18 23 2 30-29 4-8-43Z" fill="#6d655c"'+outline+'/>'+
'<path d="M63 210l-4 39 37 2 4-31m34-3l-1 32 40 1-6-42" fill="#504240"'+outline+'/>'+
'<path d="M72 44Q95 13 135 40l13 47-13 42-63 0-20-41Z" fill="#77756c"'+outline+'/>'+
'<path d="M77 44q20-20 42-6l-15 61-26 19-11-27Z" fill="#b1a69a" opacity=".4"/>'+
'<path d="M66 85L145 78l-8 21-68 3Z" fill="#191a1c" stroke="#0c0b0b" stroke-width="4"/>'+
'<path d="M78 90L129 86" stroke="#bc9c73" stroke-width="3"/>'+
'<path d="M103 36l-1 39m-28 32l-5 16m62-20l7 13" stroke="#ddd0b4" stroke-width="3"/>'+
'<path d="M163 159l26-104 7-17 6 20-20 114-9 2Z" fill="#bcb3a3"'+outline+'/>'+
'<path d="M175 159l-10 34m-13-30l42 4" stroke="#d5b78f" stroke-width="6"/>'+
'<path d="M65 177l-21-8m99 30l20-13" stroke="#151112" stroke-width="5"/>'+highlights
,'figure-svg');}
function marauder(){return svg(
'<ellipse cx="107" cy="248" rx="86" ry="7" fill="#070607"/>'+
'<path d="M66 78Q41 110 32 151L43 244 104 253 171 244 161 136 143 74Z" fill="#42312c"'+outline+'/>'+
'<path d="M64 112l20 29 66-42-13 98-59 26Z" fill="#892b29" stroke="#080808" stroke-width="5"/>'+
'<path d="M71 116Q87 128 138 121m-50 31l46-15" stroke="#b9a083" stroke-width="7"/>'+
'<path d="M68 193l-14 51 40 6 22-63m18-1l6 62 35-6-13-61" fill="#4c4039"'+outline+'/>'+
'<path d="M71 79Q93 23 137 53l27 57-16 49-87-13-15-34Z" fill="#221c1c"'+outline+'/>'+
'<path d="M71 86Q90 52 126 64l20 27-15 30-50 16-26-12Z" fill="#8d7160"'+outline+'/>'+
'<path d="M76 108l51-2-10 8-37 2" fill="#0d0c0d"/>'+
'<path d="M85 110l15-1m17 0l8-4" stroke="#db5040" stroke-width="3"/>'+
'<path d="M89 135q28 17 50-6" stroke="#33201e" stroke-width="8" fill="none"/>'+
'<path d="M53 145l-24 42 35 18 26-41m61-16l30 34-31 25-24-44" fill="#4a3732"'+outline+'/>'+
'<path d="M60 178L11 147 17 138 72 163m91 27l38-58 11 4-31 73" fill="#b2b1a8"'+outline+'/>'+
'<path d="M37 163l24-24m112 49l13 14" stroke="#c59f74" stroke-width="6"/>'+
'<path d="M55 85l-5 32m93-43l8 27M77 211l-11 27" stroke="#c6a88a" stroke-width="3" opacity=".7"/>'
,'figure-svg');}
function occultist(){return svg(
'<ellipse cx="108" cy="247" rx="88" ry="7" fill="#080607"/>'+
'<path d="M72 89Q33 121 35 166L28 248 191 248 174 143 151 88Z" fill="#3c2b34"'+outline+'/>'+
'<path d="M91 127l18 27 28-31 23 111-58 20-47-14Z" fill="#642b31"'+outline+'/>'+
'<path d="M73 93Q76 31 115 26Q153 32 163 99L143 153 82 149 55 114Z" fill="#29202b"'+outline+'/>'+
'<path d="M84 88Q109 48 140 91l-9 47-40 0Z" fill="#080a0b" stroke="#111015" stroke-width="4"/>'+
'<path d="M92 105l12 3m18-2l10-6" stroke="#d14c44" stroke-width="4"/>'+
'<path d="M107 123l8 9 10-9" stroke="#cbb9a8" stroke-width="2" fill="none"/>'+
'<path d="M48 149l-24 42 27 26 38-46m75-25l28 44-34 23-24-46" fill="#3e3037"'+outline+'/>'+
'<path d="M53 185l-13 45m135-46l10 50" stroke="#b68b75" stroke-width="3"/>'+
'<path d="M177 209L189 38" stroke="#9b7655" stroke-width="9"/>'+
'<path d="M177 56l-17-18 25 7 9-31 12 35-10 15" fill="#a88960"'+outline+'/>'+
'<circle cx="191" cy="40" r="11" fill="#c44740" stroke="#250c0e" stroke-width="5"/>'+
'<path d="M75 166l10 11 10-11 10 11 9-11 9 11 8-11" fill="none" stroke="#b5775d" stroke-width="3"/>'
,'figure-svg');}
function skeleton(){return svg(
'<ellipse cx="112" cy="248" rx="90" ry="7" fill="#060606"/>'+
'<path d="M75 118l-24 57 14 69 38 4 9-60 18 61 33-7 8-77-27-53Z" fill="#433b3b"'+outline+'/>'+
'<path d="M80 116l8 67 54 4 11-71" fill="#aaa096"'+outline+'/>'+
'<path d="M88 121l57 17m-56 2l60 16m-59 4l59 11M117 120l2 59" stroke="#352a26" stroke-width="5"/>'+
'<path d="M91 48Q113 30 140 48L151 81 142 105 131 125 99 119 77 91Z" fill="#c7b89b"'+outline+'/>'+
'<path d="M89 75l23 6-12 19-17-9m41-12l18-5-4 22-19 1" fill="#171213"/>'+
'<path d="M108 95l8 13 9-13m-25 20l30 0m-23-6l0 12m11-12l0 12" stroke="#2b1c17" stroke-width="4"/>'+
'<path d="M74 131l-25 13-22 56 28 12 35-51m60-30l28 13 24 57-26 11-41-48" fill="#a99f8e"'+outline+'/>'+
'<path d="M33 199l13 23m143-22l-17 26" stroke="#b4a999" stroke-width="10"/>'+
'<path d="M22 206l-7-99 15-3 12 99" fill="#66615a"'+outline+'/>'+
'<path d="M13 109L31 62 52 107Z" fill="#8e8579"'+outline+'/>'+
'<path d="M56 218l-10 31m115-27l12 26" stroke="#181619" stroke-width="12"/>'
,'figure-svg');}
function rat(){return svg(
'<ellipse cx="112" cy="241" rx="99" ry="8" fill="#090809"/>'+
'<path d="M55 181q-38-28-48 13-4 32 34 28" stroke="#4b2928" stroke-width="11" fill="none"/>'+
'<path d="M33 185L44 157 67 139l16-27 24 14 16-14 27 19 15 18 26 13 10 48-27 20-105 3-41-17Z" fill="#53403c"'+outline+'/>'+
'<path d="M49 156l-7 38 21-40 19 25 9-40 23 34 22-45 9 39 20-9" fill="#907364" stroke="#141013" stroke-width="5"/>'+
'<path d="M160 153L204 151 216 171l-10 25-41 6-26-22Z" fill="#74554a"'+outline+'/>'+
'<path d="M185 156l14-31 14 24m-45 7l-12-29 29 15" fill="#8c6c5d"'+outline+'/>'+
'<circle cx="191" cy="174" r="5" fill="#ec5446"/>'+
'<path d="M199 186l17 1-9 14-22-2m-94 12l-10 31m50-34l9 32m38-35l3 35" stroke="#251d1c" stroke-width="11" stroke-linecap="round"/>'+
'<path d="M199 197l4 8 6-9" fill="#f0dac4" stroke="#110e0e" stroke-width="2"/>'
,'figure-svg');}
function cultist(){return svg(
'<ellipse cx="111" cy="246" rx="90" ry="7" fill="#060505"/>'+
'<path d="M74 92L45 150 35 242 185 243 168 143 137 90Z" fill="#49262b"'+outline+'/>'+
'<path d="M98 133l-18 102m43-111l33 112" stroke="#6e3f3b" stroke-width="6"/>'+
'<path d="M105 31Q143 33 157 87L167 129 136 156 75 151 51 115 69 62Z" fill="#6e302f"'+outline+'/>'+
'<path d="M89 77Q112 53 138 79L130 131 95 132 77 111Z" fill="#0d0c0d" stroke="#0a0808" stroke-width="5"/>'+
'<path d="M88 104l13-2m25-1l12 2" stroke="#d45243" stroke-width="5"/>'+
'<path d="M73 149l-26 14-25 45 34 11 33-38m64-38l31 16 20 47-37 15-31-38" fill="#4b282b"'+outline+'/>'+
'<path d="M176 192L193 36" stroke="#6f6058" stroke-width="8"/>'+
'<path d="M193 43L160 27Q173 74 210 82" fill="none" stroke="#b9b1a0" stroke-width="10"/>'+
'<path d="M74 177l40 23 39-22m-48-8l11 18 12-18" stroke="#a36351" stroke-width="4" fill="none"/>'
,'figure-svg');}
function wolf(){return svg(
'<ellipse cx="115" cy="243" rx="98" ry="8" fill="#080708"/>'+
'<path d="M21 190l20-29 20-2 18-36 20 17 18-26 25 20 19-17 18 31 19 2 8 36-26 35-139 4Z" fill="#504744"'+outline+'/>'+
'<path d="M24 193l-16-25 31 8 16-18 19 26 18-35 18 37 17-39 17 29 20-29 10 33" fill="#81776b" stroke="#141213" stroke-width="5"/>'+
'<path d="M143 150l25-30 24 29 22 8 6 35-30 30-51-16-10-28Z" fill="#70645c"'+outline+'/>'+
'<path d="M176 139l4-37 19 37m-44 14l-11-39 26 16" fill="#61564e"'+outline+'/>'+
'<path d="M177 169l12-3" stroke="#d74e42" stroke-width="7"/>'+
'<path d="M185 191l33-4-16 18-20-3m-142 1l-10 37m59-35l-8 34m67-33l4 33m44-38l10 38" stroke="#181517" stroke-width="10" stroke-linecap="round"/>'+
'<path d="M184 202l6 12 8-13 5 9 7-13" fill="#e4d4bf" stroke="#1b1111" stroke-width="2"/>'
,'figure-svg');}
function spider(){return svg(
'<ellipse cx="112" cy="243" rx="98" ry="8" fill="#080708"/>'+
'<path d="M76 176L31 129 10 141 56 207m33-28L44 97 12 105 65 218m65-31l50-88 32 9-51 107m-19-35l47-47 21 18-46 62" stroke="#29252b" stroke-width="14" stroke-linecap="round" fill="none"/>'+
'<path d="M72 185L23 218l16 20 58-29m64-24l43 25-17 30-61-25" stroke="#39343a" stroke-width="12" fill="none"/>'+
'<ellipse cx="89" cy="173" rx="60" ry="52" fill="#46353a"'+outline+'/>'+
'<path d="M39 171q21-39 50-37l25 55-33 24-40-17Z" fill="#6d3139" stroke="#201015" stroke-width="4"/>'+
'<path d="M54 169l25-23 30 19-29 29Z" fill="#a3423e" opacity=".7"/>'+
'<ellipse cx="157" cy="183" rx="42" ry="39" fill="#343033"'+outline+'/>'+
'<circle cx="145" cy="168" r="7" fill="#d74d45"/><circle cx="169" cy="169" r="7" fill="#d74d45"/>'+
'<path d="M146 208l4 22 13-20 10 22 4-24" fill="#cec2b0" stroke="#101010" stroke-width="3"/>'
,'figure-svg');}
function golem(){return svg(
'<ellipse cx="114" cy="249" rx="95" ry="7" fill="#070708"/>'+
'<path d="M57 114L25 155 33 210l30 14 24-33-9-70m79-12l37 44-8 53-33 19-22-41 2-57" fill="#5e595a"'+outline+'/>'+
'<path d="M76 97L134 85 166 127 163 217 132 241 78 236 54 185Z" fill="#585354"'+outline+'/>'+
'<path d="M95 36L144 33 162 66 148 115 90 122 64 79Z" fill="#666263"'+outline+'/>'+
'<path d="M97 70l17 7 3 28-22-9m35-19l19-12-10 35-18 8" fill="#121315" stroke="#111" stroke-width="4"/>'+
'<path d="M98 78l15 4m20-1l13-5" stroke="#d14c42" stroke-width="4"/>'+
'<path d="M95 123l11 30-18 37m50-56l-22 27 26 38M63 168l21 17m78-23l-20 20" stroke="#b8a99a" stroke-width="6" fill="none"/>'+
'<path d="M89 215l-13 35 41 0 3-35m15-1l-5 36 43 1-19-34" fill="#3f3b3e"'+outline+'/>'+
'<path d="M93 123l16 22-10 19 22 16-5 26" stroke="#a33c37" stroke-width="4" fill="none"/>'
,'figure-svg');}
function boss(){return svg(
'<ellipse cx="117" cy="248" rx="103" ry="7" fill="#060506"/>'+
'<path d="M59 117L28 155 32 242 193 241 182 147 150 102Z" fill="#56272b"'+outline+'/>'+
'<path d="M87 120l24 16 33-18 34 118-67 13-70-19Z" fill="#3d2425"'+outline+'/>'+
'<path d="M88 63L58 49 31 17 37 72l37 33M150 65l29-29 29-19-16 62-34 30" fill="#aa9782"'+outline+'/>'+
'<path d="M73 70Q104 34 146 67l14 50-29 29-43-7-27-28Z" fill="#c0a48d"'+outline+'/>'+
'<path d="M82 94l30-2-13 21-16-3m41-14l28-3-12 21-17-6" fill="#191013"/>'+
'<path d="M88 99l14-1m30 2l13-2" stroke="#e34939" stroke-width="4"/>'+
'<path d="M105 118l12 8 9-10m-26 23l36-1" fill="none" stroke="#312020" stroke-width="5"/>'+
'<path d="M66 157l-34 27 19 35 37-36m69-24l32 23-24 38-38-38" fill="#704340"'+outline+'/>'+
'<path d="M43 172l-17-43 13-4 21 49m111-4l20-52 16 10-26 55" fill="#a9a194"'+outline+'/>'+
'<path d="M69 212l-9 34m85-35l18 34" stroke="#151011" stroke-width="15"/>'
,'figure-svg');}
function figure(name){switch(name){case'knight':return knight();case'marauder':return marauder();case'occultist':return occultist();case'skeleton':return skeleton();case'rat':return rat();case'cultist':return cultist();case'wolf':return wolf();case'spider':return spider();case'golem':return golem();case'boss':return boss();default:return skeleton();}}
function icon(slot,rarity){var c=['#afa69a','#75b193','#77a9d7','#b18cde','#dfad68'][Math.max(0,Math.min(4,rarity||0))], shape='';
switch(slot){
case'weapon': shape='<path d="M16 76L66 24l17-8-7 19-52 49-8-8Z" fill="#9f9f9a" stroke="#191719" stroke-width="5"/><path d="M35 60l18 18M31 78l-13 8m30-7l-10 16" stroke="'+c+'" stroke-width="8"/><path d="M26 78l-9 10" stroke="#d7c29a" stroke-width="5"/>';break;
case'armor': shape='<path d="M21 21l24-12 11 11L69 9l23 12-12 25-6 48-52 0-6-48Z" fill="#817b72" stroke="#151213" stroke-width="6"/><path d="M39 22l18 15 15-15-2 53-14 13-14-12Z" fill="#493033" stroke="'+c+'" stroke-width="3"/><path d="M30 50l16 12m35-13l-13 14" stroke="#beb7a9" stroke-width="4"/>';break;
case'helm': shape='<path d="M19 56l8-30L53 12 80 26l9 30-9 36-53 0Z" fill="#928d87" stroke="#1a1718" stroke-width="6"/><path d="M27 52l52 0-9 16-39 0Z" fill="#141213" stroke="'+c+'" stroke-width="4"/><path d="M53 17l0 35" stroke="#d2c5b2" stroke-width="4"/>';break;
case'amulet': shape='<path d="M20 15Q52 67 84 15" fill="none" stroke="#bd9e77" stroke-width="6"/><path d="M52 36L78 58 52 96 27 58Z" fill="'+c+'" stroke="#180e13" stroke-width="6"/><path d="M52 46l13 13-13 24-12-24Z" fill="#2b2229" opacity=".5"/>';break;
default:shape='<circle cx="52" cy="52" r="23" fill="'+c+'"/>';
}
return svg(shape,'svg-icon','0 0 104 104');}
function landscape(zone){
var c=['#482323','#213c3a','#33323e','#552522'][zone]||'#482323', rock=['#302327','#243034','#292831','#312025'][zone]||'#302327';
var terrain='<path d="M0 228l48-31 71 18 90-23 54 25 94-19 71 22 89-17 102 25 81-19v140H0Z" fill="'+rock+'" stroke="#09090a" stroke-width="6"/>'+
'<path d="M0 265l81-24 74 27 104-30 91 27 85-12 80 25 96-20 109 12v70H0Z" fill="#1a191c" stroke="#09090b" stroke-width="4"/>';
var silhouettes='';
if(zone===0){ silhouettes='<path d="M5 214v-95h50v-27h33v45h33V75h33V40h38v27h32v98h25V83h30v-39h37v68h24v-42h39v30h43v109h47V71h38v33h33v-59h42v31h34v135Z" fill="#191718" stroke="#0b0a0b" stroke-width="7"/>'+
'<path d="M123 90v30m51-64v55m124-50v70m224-48v80m89-104v49" stroke="#7a463f" stroke-width="9"/>'+
'<path d="M183 166q24-40 44 0v45h-44m122-53q23-34 40 0v43h-40m221-12q25-43 45 0v28h-45" fill="#0c0c0e" stroke="#44302d" stroke-width="5"/>';
}else if(zone===1){for(var i=0;i<7;i++){var x=i*114-12; silhouettes+='<path d="M'+x+' 248q15-91 '+(x+19)+'-180l21 0q-9 111 17 170M'+(x+11)+' 142q-39-58-31-102M'+(x+26)+' 125q47-67 39-98m-30 102q-34-31-50-34" fill="none" stroke="#100f13" stroke-width="18" stroke-linecap="round"/>';}}else if(zone===2){silhouettes='<path d="M0 225v-108Q58 12 147 92q43-44 80-24 77-67 157 12Q479-3 562 103q69-57 158 16v115Z" fill="#17161d" stroke="#0c0a0e" stroke-width="11"/>'+
'<path d="M65 222V121q30-64 62 0v96M216 231V129q36-78 71 0v94M400 235V113q44-93 92 0v111M600 220V136q30-62 57 0v86" fill="#302b36" stroke="#080809" stroke-width="9"/>'+
'<path d="M79 160h31m117 11h43m139-27h65m141 20h35" stroke="#73565b" stroke-width="10"/>';
}else{silhouettes='<path d="M10 229l48-171 43 176 27-101 39 101 56-204 53 207 58-128 38 126 49-190 58 189 67-92 41 89 58-171 54 177 34-115 28 106" fill="#171416" stroke="#060507" stroke-width="7"/>'+
'<path d="M116 241l31-68 23 70m211 9l38-90 33 89m150-9l14-75 26 76" fill="#792921" stroke="#230b0b" stroke-width="6"/>';}
var hatches='';for(var j=0;j<21;j++){var hx=(j*53+27)%720,hy=222+(j*23)%110;hatches+='<path d="M'+hx+' '+hy+'l17 -3" stroke="'+c+'" stroke-width="2" opacity=".6"/>';}
return svg('<defs><linearGradient id="sky'+zone+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+c+'"/><stop offset=".65" stop-color="#181519"/><stop offset="1" stop-color="#0b0b0c"/></linearGradient></defs>'+
'<rect width="720" height="340" fill="url(#sky'+zone+')"/>'+
'<circle cx="548" cy="74" r="50" fill="#a34236" opacity=".78"/>'+
'<path d="M506 57l49 3m-20 32l46-12" stroke="#32191b" stroke-width="13" opacity=".4"/>'+
silhouettes+terrain+hatches+
'<path d="M0 288l100-12 60 20 76-9 92 12 83-18 72 19 120-12 117 9" fill="none" stroke="#594139" stroke-width="4" opacity=".5"/>'
,'scene-bg','0 0 720 340');
}
window.Art={figure:figure,icon:icon,landscape:landscape};
})();