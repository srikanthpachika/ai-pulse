import {feedText,feedSummary} from '../../../lib/feed-text';
import {env} from 'cloudflare:workers';
import {readResearch} from '../../../lib/research';
import {fallback,sources} from '../../data';
import seeds from '../../discover-seed.json';
import blogSeeds from '../../blog-seeds.json';
import {seedModels} from '../../model-seeds';
import {GET as getNews} from '../news/route';
export async function GET(request:Request){
 const url=new URL(request.url).searchParams.get('url');
 if(!url||url.length>2000||!url.startsWith('https://'))return Response.json({error:'Select a valid The AI Notes story.'},{status:400});
 const research=await readResearch().catch(()=>null);
 const repo=[...(research?.repos||[]),...seeds.repos].find(r=>r.url===url);
 const news=[...(research?.news||[]),...seeds.news].find(n=>n.url===url);
 const model=[...(research?.modelProfiles||[]),...Object.values(seedModels)].find((m:any)=>m.source===url) as any;
 const source=sources.find(s=>s.home===url);
 let item:any;let kind='story';
 if(repo){item=repo;kind='repo'}else if(news){item=news;kind='news'}else if(model){item=model;kind='model'}else if(source){item=source;kind='publisher'}else{
 item=[...(research?.stories||[]),...fallback].find(s=>s.url===url);
 if(!item&&env.BUCKET){try{const archive=await env.BUCKET.get('content/feed-history.json');const all=archive?await archive.json<any[]>():[];item=all.find(s=>s.url===url)}catch{}}
 if(!item){try{const response=await getNews();const feed:any=await response.json();item=feed.stories.find((s:any)=>s.url===url)}catch{}}
 }
 if(!item)return Response.json({error:'This item is no longer in the available feed. Return to Discover to choose another story.'},{status:404});
 if(!item.body&&(blogSeeds as Record<string,string>)[url])item={...item,body:(blogSeeds as Record<string,string>)[url]};
 item={...item,...(item.title?{title:feedText(item.title)}:{}),...(item.summary?{summary:feedText(item.summary)||feedSummary('',item.provider||item.publisher)}:{}),...(item.description?{description:feedText(item.description)}:{})};
 return Response.json({kind,item},{headers:{'Cache-Control':'public, max-age=60'}});
}
