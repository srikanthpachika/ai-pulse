import type {QuickBrief} from './quick-brief';
type Item={quickBrief?:QuickBrief|null;summary?:string;body?:string;title?:string};
const words=(s:string)=>s.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
const stop=new Set('a an the and or of to in on for with is are was were it its this that as by from has have can will'.split(' '));
const clean=(s:string)=>s.replace(/<[^>]*>/g,' ').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`]/g,'').replace(/\s+/g,' ').trim();
const sentences=(s:string)=>Array.from(new Intl.Segmenter('en',{granularity:'sentence'}).segment(s),v=>v.segment.trim()).filter(Boolean);
function similar(a:string,b:string){
 const x=new Set(words(a).filter(w=>!stop.has(w))),y=new Set(words(b).filter(w=>!stop.has(w)));
 if(!x.size||!y.size)return false;
 return [...x].filter(w=>y.has(w)).length/Math.min(x.size,y.size)>=.65;
}
// Extract facts from existing editorial content; never invent missing takeaways.
export function briefPoints(item:Item){
 const excluded=[clean(item.summary||''),...sentences(clean(item.summary||'')),clean(item.title||'')].filter(Boolean);
 const candidates:{text:string;rank:number;order:number}[]=[];
 function add(raw:string,rank=0){
  const text=clean(raw).replace(/^(?:What changed|Who benefits|Why it matters|Limits|Limitations|Practical next step|Next step):\s*/i,'');
  const count=words(text).length;
  if(count<6||count>45||excluded.some(s=>similar(text,s)))return;
  candidates.push({text,rank,order:candidates.length});
 }
 let discussion=false;
 for(const line of (item.body||'').replace(/<\/(?:p|li|h[1-6])>/gi,'\n').split(/\n+/)){
  const raw=line.trim().replace(/^#{1,6}\s+/,'').replace(/^(?:[-*•]|\d+[.)])\s+/,'');
  if(/^(?:Discussion|Community question|Your take)(?:\s*:|\s*$)/i.test(raw)){discussion=true;continue;}
  if(!raw)continue;
  if(discussion)continue;
  const parts=sentences(clean(raw));
  for(let i=0;i<parts.length;i++){
   // Keep an attached qualification with its claim; skip overlong claims instead of truncating.
   let part=parts[i];
   while(i+1<parts.length&&/^(?:However|But|Yet|Although|Except|This does not|It does not|These results|That result)\b/i.test(parts[i+1]))part+=' '+parts[++i];
   const rank=/\b(?:available|access|price|cost|supports?|includes?|requires?|limited|preview|beta|license|only|cannot|not yet|rollout)\b/i.test(part)?2:1;
   add(part,rank);
  }
 }
 const b=item.quickBrief;
 if(b){add(b.change,1);add(b.benefit,1);add(b.caveat,2);if(b.nextStep)add('Suggested next step: '+b.nextStep,0);}
 const selected:typeof candidates=[];let total=0;
 for(const c of candidates.sort((a,b)=>b.rank-a.rank||a.order-b.order)){
  const count=words(c.text).length;
  if(total+count>100||selected.some(p=>similar(c.text,p.text)))continue;
  selected.push(c);total+=count;if(selected.length===4)break;
 }
 return selected.sort((a,b)=>a.order-b.order).map(c=>c.text.charAt(0).toUpperCase()+c.text.slice(1));
}
