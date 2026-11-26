import {isEditorialArticle} from '../../../lib/editorial-index';
import {hiddenContent} from '../../../lib/hidden-content';
import {articleStatSeeds} from '../../../lib/article-stat-seeds';
import {editorialOverrides} from '../../../lib/editorial-content';
import {readResearch} from '../../../lib/research';
import {fallback, type Story} from '../../data';
import {feedText as clean,feedSummary} from '../../../lib/feed-text';
export async function GET(){
 const research=await readResearch().catch(()=>null);
 const unique=new Map<string,Story>();for(const a of [...(research?.stories||[]),...fallback])if(!unique.has(a.url))unique.set(a.url,{...a,title:clean(a.title),summary:feedSummary(a.summary,a.provider)});
 for(const [url,s] of unique){if(!s.stats&&articleStatSeeds[url])unique.set(url,{...s,stats:articleStatSeeds[url]});}
 const overrides=await editorialOverrides().catch(()=>[]);for(const patch of overrides){if(unique.has(patch.url))unique.set(patch.url,{...unique.get(patch.url),...patch});}
 // A feed entry is discovery, not automatically a reviewed editorial article.
 // Clients use this flag to distinguish outbound news from site-authored analysis.
 for(const [url,item] of unique)unique.set(url,{...item,editorial:isEditorialArticle(item)} as Story);
 const hidden=new Set((await hiddenContent()).map(s=>s.url));return Response.json({stories:[...unique.values()].filter(s=>!hidden.has(s.url)).sort((a,b)=>+new Date(b.date)-+new Date(a.date)),checkedAt:research?.updatedAt||null,research:research?{updatedAt:research.updatedAt,coverage:research.coverage,notes:research.notes}:null,feeds:[],mode:'curated'},{headers:{'Cache-Control':'no-store'}});
}
