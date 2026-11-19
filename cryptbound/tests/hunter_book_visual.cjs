/* Real Chrome layout checks on a native portrait viewport.
 * Uses the local browser; npm ci --prefix cryptbound/tests. Run: node cryptbound/tests/hunter_book_visual.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const http=require('node:http');
let fixtureUrl;
const assets=path.resolve(__dirname,'../src/main/assets');
const chrome=['google-chrome','chromium','chromium-browser'].find(exe=>{
 try{cp.execFileSync('which',[exe],{stdio:'ignore'});return true;}catch(e){return false;}
});
if(!chrome)throw Error('Chromium/Google Chrome required for layout verification');
const html="<!DOCTYPE html><html lang=\"ru\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<link rel=\"stylesheet\" href=\"style.css\"><link rel=\"stylesheet\" href=\"overhaul.css\"><link rel=\"stylesheet\" href=\"v03.css\"><link rel=\"stylesheet\" href=\"v04.css\">\n<link rel=\"stylesheet\" href=\"dungeons.css\"><link rel=\"stylesheet\" href=\"compact.css\"><link rel=\"stylesheet\" href=\"refined.css\"><link rel=\"stylesheet\" href=\"painted.css\"><link rel=\"stylesheet\" href=\"hunter_bestiary.css\"><link rel=\"stylesheet\" href=\"illustrated.css\">\n</head><body><div id=\"app\"></div><div id=\"overlay\"></div><script src=\"sprite_catalog.js\"></script><script src=\"hunter_bestiary.js\"></script>\n<script>(function(){\n const H=window.CryptHunterBook,meta={hunterBook:{owned:true,counts:{r1_0:23,r1_2:8,r1_4:12,r1_6:6,r1_8:4,r1_10:17},trophies:{},unread:false}};\n document.getElementById('overlay').innerHTML='<div class=\"veil\"><div class=\"dialog hb-dialog\">'+H.render(meta,'beasts','r1_0')+'</div></div>';\n function r(el){const q=el.getBoundingClientRect();return {x:q.x,y:q.y,right:q.right,bottom:q.bottom,w:q.width,h:q.height};}\n function report(){\n const book=document.querySelector('.hb-window'),inner=document.querySelector('.hb-inner'),list=document.querySelector('.hb-beast-list'),\n detail=document.querySelector('.hb-detail'),rows=[...document.querySelectorAll('.hb-beast')],first=rows[0],\n name=first.querySelector('.hb-label-row b'),count=first.querySelector('.hb-count'),desc=document.querySelector('.hb-detail .hb-description');\n const data={vw:innerWidth,vh:innerHeight,book:r(book),inner:r(inner),left:r(list),right:r(detail),first:r(first),name:r(name),count:r(count),\n rowHeight:Math.max(...rows.map(x=>r(x).h)),rowScrollHeight:list.scrollHeight,rowClientHeight:list.clientHeight,\n descriptionColor:getComputedStyle(desc).color,desc:r(desc),milestones:[...document.querySelectorAll('.hb-milestones>div')].map(r),\n documentWidth:document.documentElement.scrollWidth,\n images:[...document.querySelectorAll('.hb-small-portrait img,.hb-hero-portrait img')].map(x=>({src:x.getAttribute('src'),ok:x.complete&&x.naturalWidth>0}))};\n document.title='HUNTER_METRICS_'+btoa(JSON.stringify(data));\n }\n setTimeout(report,400);\n})();</script></body></html>";
async function runAt(browser,w,h){
 const page=await browser.newPage({viewport:{width:w,height:h}});
 await page.goto(fixtureUrl);
 await page.waitForFunction(()=>document.title.startsWith('HUNTER_METRICS_'));
 const dump=await page.title();
 const match=dump.match(/HUNTER_METRICS_([A-Za-z0-9+/=]+)/);
 assert.ok(match,'Missing layout report');
 const z=JSON.parse(Buffer.from(match[1],'base64').toString('utf8')),eps=3;
 assert.ok(z.book.w>250&&z.book.h>430,'Book needs its full illustrated area');
 assert.ok(z.left.w>80&&z.right.w>80,'Both book pages must be visible');
 assert.ok(z.left.right<=z.right.x+eps,'List overlaps detail');
 assert.ok(z.left.y>=z.inner.y-eps&&z.right.y>=z.inner.y-eps,'Page content starts outside parchment');
 assert.ok(z.left.bottom<=z.inner.bottom+eps&&z.right.bottom<=z.inner.bottom+eps,'Page contents overflow vertically');
 assert.ok(z.rowHeight<=56,'Creature row is too tall: '+z.rowHeight);
 assert.ok(z.name.right<=z.count.x+eps,'Creature name overlaps its count');
 assert.ok(z.first.right<=z.left.right+eps,'Row extends past left parchment');
 assert.ok(z.desc.x>=z.right.x-eps&&z.desc.right<=z.right.right+eps,'Description escapes right parchment');
 assert.equal(z.descriptionColor,'rgb(62, 41, 27)','Description ink must be dark, not white on beige');
 for(const cell of z.milestones)assert.ok(cell.right<=z.right.right+eps,'Reward box exceeds the page');
 assert.ok(z.documentWidth<=z.vw+eps,'Horizontal scroll detected');
 assert.ok(z.images.some(x=>x.ok),'Existing creature sprite did not load');
 await page.close();
 console.log('PASS '+w+'x'+h+' viewport '+z.vw+'x'+z.vh+' pages '+Math.round(z.left.w)+'/'+Math.round(z.right.w)+' row '+z.rowHeight);
}
(async()=>{
 const server=http.createServer((req,res)=>{const name=decodeURIComponent(req.url.split('?')[0]);if(name==='/fixture'){res.setHeader('Content-Type','text/html');res.end(html);return;}const file=path.resolve(assets,'.'+name);if(!file.startsWith(assets+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':name.endsWith('.svg')?'image/svg+xml':'image/png');res.end(data);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));fixtureUrl='http://127.0.0.1:'+server.address().port+'/fixture';
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||cp.execFileSync('which',[chrome],{encoding:'utf8'}).trim(),args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const [w,h] of [[544,915],[390,844],[320,568]])await runAt(browser,w,h);}
 finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
