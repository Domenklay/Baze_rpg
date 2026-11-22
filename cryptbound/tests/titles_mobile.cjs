'use strict';
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),{chromium}=require('playwright');
(async()=>{const root=path.resolve(__dirname,'../src/main/assets'),server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+(req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0])));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(f,(err,d)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[path.extname(f)]||'application/octet-stream');res.end(d)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
const exe=process.env.CHROMIUM_PATH||['chromium','google-chrome'].map(x=>{try{return cp.execFileSync('which',[x],{encoding:'utf8'}).trim()}catch{return null}}).find(Boolean);browser=await chromium.launch({executablePath:exe,args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.url())});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.Crypt);const action=(a,id)=>page.evaluate(([a,id])=>Crypt.debug.action(a,id),[a,id]);
for(const size of [{width:360,height:640},{width:390,height:844}]){
 await page.setViewportSize(size);await action('begin','necromancer');
 for(const tree of [0,1,2]){
  await action('tree',String(tree));await action('ui-panel','talents');
  const report=await page.evaluate(()=>({count:document.querySelectorAll('.talent-dot').length,text:document.querySelector('.talent-inspector').textContent,overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(report.count,tree===1?26:25);assert.equal(report.overflow,false);assert.ok(report.text.length>20);assert.equal(await page.locator('.talent-dot b').first().evaluate(e=>getComputedStyle(e).color),'rgb(53, 36, 23)');
  const nodes=await page.locator('.talent-dot').evaluateAll(es=>es.map(e=>e.dataset.id));
  for(const id of nodes){await action('title-detail',id);assert.ok(await page.locator('.talent-inspector h3').textContent());}
  if(size.width===390)await page.screenshot({path:'/workspace/titles-v3-'+tree+'.png'});
  await action('close');
 }
}
await action('begin','scout');for(const id of ['lt_eye','lt_supply','lt_exchange'])await action('talent',id);await action('title-tool');assert.equal(await page.locator('[data-action="title-tool-use"]').count(),2);await page.screenshot({path:'/workspace/titles-v3-lantern.png'});await action('close');
assert.deepEqual(errors,[]);console.log('PASS mobile titles: all 76 node descriptions selectable at 360×640 and 390×844, three trees, no page overflow, dedicated lantern exchange dialog');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
