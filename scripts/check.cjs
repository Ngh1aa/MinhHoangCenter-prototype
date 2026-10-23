const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const {root}=require('./server.cjs');
const screens=JSON.parse(fs.readFileSync(path.join(root,'assets/screens.json')));
const actual=fs.readdirSync(path.join(root,'app')).filter(f=>f.endsWith('.html'));
assert.equal(screens.length,actual.length,'Canvas must include every existing HTML document');
assert.equal(new Set(screens.map(s=>s.f)).size,screens.length,'No duplicate artboards');
for(const s of screens){assert(actual.includes(s.f),s.f);const html=fs.readFileSync(path.join(root,'app',s.f),'utf8');assert(html.includes('name="viewport"'),s.f+' viewport');for(const m of html.matchAll(/(?:href|src)="([^"{}]+)"/g)){const url=m[1];if(/^(https?:|data:|#|tel:|mailto:)/.test(url))continue;assert(fs.existsSync(path.resolve(root,'app',url.split(/[?#]/)[0])),s.id+' broken local resource '+url);}}
const crypto=require('node:crypto'),supplied=JSON.parse(fs.readFileSync(path.join(root,'docs/uiux/supplied-design-system.json')));for(const file of supplied.files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file.target))).digest('hex'),file.sha256);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/static-screens/manifest.json')));assert.equal(manifest.mode,'static-dom');assert.equal(manifest.documents.length,screens.length);
const digest=crypto.createHash('sha256');for(const file of ['assets/screens.json',...screens.map(s=>'app/'+s.f),'app/tailwind.css','app/refinement.css','app/interactions.js','app/support.js','scripts/capture.cjs'])digest.update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r/g,''));assert.equal(manifest.sourceSha256,digest.digest('hex'),'Static screens are stale; run npm run capture');
for(const s of screens){const snapshot=JSON.parse(fs.readFileSync(path.join(root,'assets/static-screens',s.id+'.json')));assert.equal(snapshot.id,s.id);assert(!/<script|<iframe|\bon\w+=|\bhref=/i.test(snapshot.html),s.id+' must be inert markup');}
assert(!/<iframe/i.test(fs.readFileSync(path.join(root,'index.html'),'utf8')));
console.log('PASS: '+screens.length+' current static HTML/SVG snapshots, no prototype frames, supplied design-system hashes and local resources');
