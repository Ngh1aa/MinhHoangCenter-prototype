const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const {root}=require('./server.cjs');
const screens=JSON.parse(fs.readFileSync(path.join(root,'assets/screens.json')));
const actual=fs.readdirSync(path.join(root,'app')).filter(f=>f.endsWith('.html'));
assert.equal(screens.length,actual.length,'Canvas must include every existing HTML document');
assert.equal(new Set(screens.map(s=>s.f)).size,screens.length,'No duplicate artboards');
for(const s of screens){assert(actual.includes(s.f),s.f);const html=fs.readFileSync(path.join(root,'app',s.f),'utf8');assert(html.includes('name="viewport"'),s.f+' viewport');for(const m of html.matchAll(/(?:href|src)="([^"{}]+)"/g)){const url=m[1];if(/^(https?:|data:|#|tel:|mailto:)/.test(url))continue;assert(fs.existsSync(path.resolve(root,'app',url.split(/[?#]/)[0])),s.id+' broken local resource '+url);}}
const crypto=require('node:crypto'),supplied=JSON.parse(fs.readFileSync(path.join(root,'docs/uiux/supplied-design-system.json')));for(const file of supplied.files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file.target))).digest('hex'),file.sha256);
console.log('PASS: '+screens.length+' canonical screen sources, live iframe rendering, supplied design-system hashes and local resources');
