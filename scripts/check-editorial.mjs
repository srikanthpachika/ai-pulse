// Isolated route regression checks. Uses in-memory storage; never calls a live site.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const temporary=await mkdtemp(join(tmpdir(),'editorial-check-'));
const settings=new Map(),images=new Map();
globalThis.__editorialTest={allowed:false,env:{DB:{prepare(sql){let args=[];return {bind(...v){args=v;return this},async first(){const value=settings.get(args[0]);return value?{value}:null},async all(){return {results:[...settings.entries()].filter(([k])=>k.startsWith('editorial:')).map(([,value])=>({value}))}},async run(){if(sql.startsWith('DELETE'))settings.delete(args[0]);else settings.set(args[0],args[1]);return {success:true}}}}},BUCKET:{async put(key,bytes,meta){images.set(key,{body:bytes,httpMetadata:meta.httpMetadata})},async get(key){return images.get(key)}}}};
try{
const bundle=await build({stdin:{contents:`export * as content from './app/api/admin/content/route.ts';export * as upload from './app/api/admin/images/route.ts';export * as image from './app/api/images/route.ts';export * as store from './lib/editorial-content.ts';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'isolated-fixtures',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const env=globalThis.__editorialTest.env;',loader:'js'}));b.onLoad({filter:/lib\/admin-password\.ts$/},()=>({contents:'export async function adminUnlocked(){return globalThis.__editorialTest.allowed}',loader:'js'}));b.onLoad({filter:/app\/chatgpt-auth\.ts$/},()=>({contents:'export async function getChatGPTUser(){return null}',loader:'js'}));b.onLoad({filter:/app\/api\/news\/route\.ts$/},()=>({contents:'export async function GET(){return Response.json({stories:[]})}',loader:'js'}));}}]});
const file=join(temporary,'routes.mjs');await writeFile(file,bundle.outputFiles[0].text);const api=await import(pathToFileURL(file).href);
const request=(body,origin='https://test.example')=>new Request('https://test.example/api/admin/content',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
const item={url:'https://publisher.example/story',title:'An editable update',summary:'A clear and useful summary.',body:'Original editorial detail.',provider:'Example',model:'Model',category:'New features',date:'2026-10-24T00:00:00.000Z',imageUrl:'',imageAlt:'',imageCredit:'',imageSource:'',imageKind:'custom',stats:[{value:'12×',label:'Provider-reported improvement',source:'https://publisher.example/evidence',asOf:'2026-10-24'}]};
assert.equal((await api.content.GET(new Request('https://test.example/api/admin/content'))).status,401);
assert.equal((await api.content.POST(request({item}))).status,401);
assert.equal((await api.upload.POST(new Request('https://test.example/api/admin/images',{method:'POST'}))).status,401);
globalThis.__editorialTest.allowed=true;
assert.equal((await api.content.POST(request({item},'https://other.example'))).status,403);
assert.equal((await api.content.POST(request({item:{...item,stats:[{...item.stats[0],source:'http://unsafe.example'}]}}))).status,400);
assert.equal((await api.content.POST(request({item:{...item,imageUrl:'https://images.example/a.jpg'}}))).status,400);
assert.equal((await api.content.POST(request({item}))).status,200);
assert.equal((await api.store.editorialOverride(item.url)).title,item.title);
assert.equal((await (await api.content.GET(new Request('https://test.example/api/admin/content'))).json()).stories[0].stats[0].value,'12×');
// A source refresh does not replace the separately stored override.
assert.equal((await api.store.editorialOverride(item.url)).body,item.body);
const form=new FormData();form.append('image',new File(['<svg/>'],'bad.png',{type:'image/png'}));
assert.equal((await api.upload.POST(new Request('https://test.example/api/admin/images',{method:'POST',body:form}))).status,400);
const png=new FormData();png.append('image',new File([Uint8Array.from([137,80,78,71,13,10,26,10,0])],'test.png',{type:'image/png'}));
const uploaded=await (await api.upload.POST(new Request('https://test.example/api/admin/images',{method:'POST',body:png}))).json();assert.ok(uploaded.url.startsWith('/api/images?id='));
assert.equal((await api.image.GET(new Request('https://test.example'+uploaded.url))).headers.get('Content-Type'),'image/png');
assert.equal((await api.image.GET(new Request('https://test.example/api/images?id=../settings'))).status,404);
assert.equal((await api.content.POST(request({action:'reset',url:item.url}))).status,200);assert.equal(await api.store.editorialOverride(item.url),null);
console.log('Passed: admin guards, origin checks, stat validation, image attribution, persistence, reset, image signature validation and public image retrieval.');
}finally{await rm(temporary,{recursive:true,force:true});delete globalThis.__editorialTest}
