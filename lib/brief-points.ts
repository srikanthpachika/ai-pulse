import type {QuickBrief} from './quick-brief';
type Item={quickBrief?:QuickBrief|null;summary?:string;body?:string};
const words=(s:string)=>s.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
function similar(a:string,b:string){const x=new Set(words(a)),y=new Set(words(b));if(!x.size||!y.size)return false;return [...x].filter(w=>y.has(w)).length/Math.min(x.size,y.size)>.72}
// Extract existing editorial text only; never generate missing facts or cut off caveats.
export function briefPoints(item:Item){
 const candidates:string[]=[];
 for(const block of (item.body||'').split(/\n\s*\n/)){
  const text=block.trim().replace(/^#{1,3}\s+[^\n]+\n/,'').replace(/^(What changed|Who benefits|Why it matters|Limits|Limitations):\s*/i,'').replace(/\n/g,' ').trim();
  if(!text||/^(Discussion|Community question):/i.test(text)||text.length<35)continue;
  if(words(text).length<=55)candidates.push(text);
 }
 const b=item.quickBrief;
 if(b&&candidates.length<2)candidates.push(b.caveat,'Suggested next step: '+b.nextStep,b.benefit,b.change);
 const result:string[]=[];let total=0;
 for(const text of candidates){const count=words(text).length;if(count>55||total+count>105||similar(text,item.summary||'')||result.some(p=>similar(text,p)))continue;result.push(text.charAt(0).toUpperCase()+text.slice(1));total+=count;if(result.length===4)break;}
 return result;
}
