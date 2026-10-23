const fs=require('node:fs');const path=require('node:path');const {root}=require('./server.cjs');
const dest=path.join(root,'dist');fs.mkdirSync(dest,{recursive:true});
for(const entry of ['index.html','canvas.js','canvas.css','.nojekyll','app','assets'])fs.cpSync(path.join(root,entry),path.join(dest,entry),{recursive:true});
console.log('Static GitHub Pages bundle prepared: dist/');
