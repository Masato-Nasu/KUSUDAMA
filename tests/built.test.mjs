import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const {Miniflare}=createRequire(realpathSync('node_modules/wrangler/package.json'))('miniflare');
const files=(await readdir('dist/server',{recursive:true})).filter(f=>f.endsWith('.js')&&f!=='index.js');
const modules=['index.js',...files].map(f=>({type:'ESModule',path:resolve('dist/server',f)}));
const mf=new Miniflare({modules,modulesRootPath:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'test'},assets:{directory:'dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true}}});
try{
 const db=await mf.getD1Database('DB');for(const file of (await readdir('drizzle')).filter(file=>file.endsWith('.sql')).sort()){for(const sql of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint')){await db.exec(sql.replaceAll('\n',' '));}}
 const page=await mf.dispatchFetch('https://test.local/');assert.equal(page.status,200);assert.match(await page.text(),/おめでとう/);
 const result=await mf.dispatchFetch('https://test.local/api/gifts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'おめでとう'})});assert.equal(result.status,201);const ownerCookie=result.headers.get('set-cookie').split(';')[0],gift=await result.json();
 const sent=await mf.dispatchFetch('https://test.local/api/gifts/sent',{headers:{Cookie:ownerCookie}});assert.equal((await sent.json()).gifts[0].id,gift.id);
 const historyPage=await mf.dispatchFetch('https://test.local/?sent=1');assert.equal(historyPage.status,200);
 const receive=await mf.dispatchFetch('https://test.local/api/gifts/'+gift.id,{headers:{Authorization:'Bearer '+gift.key}});assert.equal((await receive.json()).state,'closed');
 for(const path of ['/gold-ball.png','/ceremony-materials.png','/manifest.webmanifest','/sw.js','/icon.svg'])assert.equal((await mf.dispatchFetch('https://test.local'+path)).status,200);
 console.log('PASS: built homepage, API creation and recipient routes, image, manifest, service worker, icon.');
}finally{await mf.dispose()}
