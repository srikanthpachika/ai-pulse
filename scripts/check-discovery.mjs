import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
const r=await build({stdin:{contents:"export * from './lib/feed-ranking';export * from './lib/video';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false});
const {sortFeed,videoEmbed,validVideoUrl}=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));
const items=[{url:'a',date:'2026-10-20'},{url:'b',date:'2026-10-21'},{url:'c',date:'2026-10-22'}];
const counts={a:{up:9,down:0,comments:1,views:10},b:{up:1,down:0,comments:5,views:7}};
assert.equal(sortFeed(items,'liked',counts)[0].url,'a');assert.equal(sortFeed(items,'discussed',counts)[0].url,'b');assert.equal(sortFeed(items,'viewed',counts)[0].url,'a');assert.equal(sortFeed(items,'liked',{})[0].url,'c');
assert.equal(videoEmbed('https://www.youtube.com/watch?v=abcdefghijk').src,'https://www.youtube-nocookie.com/embed/abcdefghijk');assert.equal(videoEmbed('https://youtube.com.evil.example/watch?v=abcdefghijk'),null);assert.equal(videoEmbed('javascript:alert(1)'),null);assert.equal(validVideoUrl('https://user:password@example.com/video'),false);assert.equal(videoEmbed('https://vimeo.com/123456').provider,'Vimeo');
console.log('Ranking, newest tie-breaks, empty counts, embed allowlist and unsafe URL checks passed.');
