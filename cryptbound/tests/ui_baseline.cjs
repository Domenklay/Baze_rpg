/* Safeguard against accidentally shipping the pre-v0.7.2 UI again. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../src/main/assets');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'game.js'),'utf8');
const bookCss=fs.readFileSync(path.join(root,'hunter_bestiary.css'),'utf8');
for(const name of ['compact.css','refined.css','painted.css','hunter_bestiary.css',
                   'combat_feedback.js','ui-art.js','hunter_bestiary.js']){
 assert.ok(html.includes(name),'The painted v0.7.2 client is missing '+name);
 assert.ok(fs.existsSync(path.join(root,name)),'Required UI resource is absent: '+name);
}
for(const part of ['expedition-top','expedition-effects','battle-dock','inventory-upper',
                   'renderChamberTiles','function panelDialog','window.CryptFeedback',
                   'ui/locations/','function uiIcon']){
 assert.ok(js.includes(part),'The v0.7.2 client was overwritten: missing '+part);
}
assert.ok(js.includes('hb-v072-access'),'Book shortcut is not integrated into the v0.7.2 HUD');
assert.ok(js.includes('hb-inventory-access'),'Book is not integrated into the painted inventory');
assert.ok(bookCss.includes('hb-v072-access'),'Book shortcut misses painted UI styling');
const painted=fs.readFileSync(path.join(root,'painted.css'),'utf8');
assert.ok(painted.includes('--ui-frame'),'v0.7.2 illustrated panel nine-slice style missing');
console.log('PASS v0.7.2 painted UI preserved, b​​estiary integrated, all referenced assets present.');
