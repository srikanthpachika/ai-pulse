import {readResearch} from './research';
import {editorialOverrides} from './editorial-content';
import {fallback} from '../app/data';
import {feedText} from './feed-text';
export async function newsletterItems(){
 const research=await readResearch().catch(()=>null),patches=await editorialOverrides().catch(()=>[]);
 const unique=new Map<string,any>();
 for(const item of [...(research?.stories||[]),...(research?.news||[]),...fallback])if(!unique.has(item.url))unique.set(item.url,item);
 return {updatedAt:research?.updatedAt||null,items:[...unique.values()].map(i=>({...i,...patches.find(p=>p.url===i.url)})).filter(i=>Number.isFinite(Date.parse(i.date))&&Date.parse(i.date)<=Date.now()).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,20).map(i=>({url:i.url,title:feedText(i.title),summary:feedText(i.summary),provider:i.provider||i.publisher,date:i.date}))};
}
export const xml=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export function newsletterRss(items:{url:string;title:string;summary:string;date:string}[]){return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The AI Notes</title><link>https://theainotes.com/newsletter</link><description>AI releases, useful features and real implementations. Original summaries from The AI Notes.</description><language>en-us</language>${items.map(i=>{const link='https://theainotes.com/detail?url='+encodeURIComponent(i.url);return `<item><title>${xml(i.title)}</title><link>${xml(link)}</link><guid isPermaLink="true">${xml(link)}</guid><description>${xml(i.summary)}</description><pubDate>${new Date(i.date).toUTCString()}</pubDate></item>`}).join('')}</channel></rss>`;}
