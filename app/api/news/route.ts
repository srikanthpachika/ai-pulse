import {articleStatSeeds} from '../../../lib/article-stat-seeds';
import {env} from 'cloudflare:workers';
import {editorialOverrides} from '../../../lib/editorial-content';
import {readResearch} from '../../../lib/research';
import {sources,fallback, type Story} from '../../data';
import {feedText as clean,feedSummary} from '../../../lib/feed-text';
export async function GET(){
 const research=await readResearch().catch(()=>null);
 const results=await Promise.all(sources.filter(s=>s.url).map(async s=>{try{
 const res=await fetch(s.url,{signal:AbortSignal.timeout(9000),headers:{'Accept':'application/rss+xml, application/atom+xml, text/xml'}});if(!res.ok)throw Error('feed');
 const xml=await res.text();const blocks=xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/g)||[];
 const stories:Story[]=blocks.slice(0,18).map(b=>{const tag=(t:string)=>clean(b.match(new RegExp('<'+t+'[^>]*>([\\s\\S]*?)<\\/'+t+'>','i'))?.[1]||'');const title=tag('title');const url=tag('link')||b.match(/<link[^>]*href=["']([^"']+)["']/)?.[1]||'';const rawDate=tag('pubDate')||tag('published')||tag('updated');const parsed=new Date(rawDate);return {title,url,summary:feedSummary(tag('description')||tag('summary'),s.name),date:isNaN(+parsed)?'':parsed.toISOString(),provider:s.name,category:/introduc|launch|release|new |model|feature|updat|gemini|copilot/i.test(title)?'New features':'Industry'};}).filter(a=>a.title&&/^https:\/\//.test(a.url)&&a.date&&new Date(a.date).getTime()<=Date.now()+86400000);
 return {name:s.name,ok:stories.length>0,stories};}catch{return {name:s.name,ok:false,stories:[] as Story[]};}}));
 const unique=new Map<string,Story>();for(const a of [...(research?.stories||[]),...results.flatMap(r=>r.stories),...fallback])if(!unique.has(a.url))unique.set(a.url,{...a,title:clean(a.title),summary:feedSummary(a.summary,a.provider)});
 if(env.BUCKET){try{const archived=await env.BUCKET.get('content/feed-history.json');const history=new Map<string,Story>((archived?await archived.json<Story[]>():[]).map(s=>[s.url,s]));for(const s of unique.values())history.set(s.url,s);await env.BUCKET.put('content/feed-history.json',JSON.stringify([...history.values()].sort((a,b)=>+new Date(b.date)-+new Date(a.date)).slice(0,2000)),{httpMetadata:{contentType:'application/json'}})}catch{}}
 for(const [url,s] of unique){if(!s.stats&&articleStatSeeds[url])unique.set(url,{...s,stats:articleStatSeeds[url]});}
 const overrides=await editorialOverrides().catch(()=>[]);for(const patch of overrides){if(unique.has(patch.url))unique.set(patch.url,{...unique.get(patch.url),...patch});}
 return Response.json({stories:[...unique.values()].sort((a,b)=>+new Date(b.date)-+new Date(a.date)),checkedAt:new Date().toISOString(),research:research?{updatedAt:research.updatedAt,coverage:research.coverage,notes:research.notes}:null,feeds:results.map(({name,ok})=>({name,ok}))},{headers:{'Cache-Control':'no-store'}});
}
