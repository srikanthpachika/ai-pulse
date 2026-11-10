import {hiddenContent} from '../../lib/hidden-content';
import {readResearch} from '../../lib/research';
import {editorialOverrides} from '../../lib/editorial-content';
import {articlePath,isEditorialArticle} from '../../lib/editorial-index';
import blogSeeds from '../blog-seeds.json';
import professions from '../professions/data.json';
import {guides} from '../guides/data';
const esc=(x:string)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export async function GET(){
 const hidden=new Set((await hiddenContent()).map(s=>s.url));
 const r=await readResearch().catch(()=>null);
 const patches=await editorialOverrides().catch(()=>[]);
 const stories=[...(r?.stories||[]),...(r?.news||[])];
 const articlePaths=stories.filter(s=>!hidden.has(s.url)).map(s=>{
   const patch=patches.find(p=>p.url===s.url);
   const item={...s,...patch,body:patch?.body||s.body||(blogSeeds as Record<string,string>)[s.url]};
   return isEditorialArticle(item)?articlePath(item):null;
 }).filter((s):s is string=>!!s);
 const paths=['/','/about','/contact','/editorial-policy','/privacy','/guides','/newsletter','/compare','/professions',...guides.map(g=>'/guides/'+g.slug),...professions.flatMap(p=>['/professions/'+p.slug,...p.useCases.map(u=>'/professions/'+p.slug+'/'+u.slug)]),...articlePaths];
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...new Set(paths)].map(path=>'<url><loc>'+esc('https://theainotes.com'+path)+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}});
}
