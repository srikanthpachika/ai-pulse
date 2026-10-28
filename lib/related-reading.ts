type Item={url?:string;title?:string;name?:string;summary?:string;description?:string;provider?:string;company?:string;owner?:string;category?:string;date?:string;model?:string};
const words=(s:string)=>new Set(s.toLowerCase().match(/[a-z0-9]{4,}/g)?.filter(w=>!['with','from','that','this','model','models','using','latest','about','their'].includes(w))||[]);
export function relatedReading(current:Item,currentUrl:string,candidates:Item[]){
 const terms=words([current.title,current.name,current.model,current.summary].join(' '));
 const provider=current.provider||current.company||current.owner;
 const seen=new Set([currentUrl]);
 return candidates.filter(i=>{if(!i.url?.startsWith('https://')||seen.has(i.url)||!(i.title||i.name))return false;seen.add(i.url);return true}).map(i=>{
 const overlap=[...words([i.title,i.name,i.model,i.summary].join(' '))].filter(w=>terms.has(w)).length;
 const score=overlap*2+(provider&&(i.provider||i.company||i.owner)===provider?3:0)+(current.category&&i.category===current.category?1:0);
 return {item:i,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||(Date.parse(b.item.date||'')||0)-(Date.parse(a.item.date||'')||0)).slice(0,3).map(({item})=>({url:item.url!,title:item.title||item.name!,summary:item.summary||item.description||'',provider:item.provider||item.company||item.owner||'The AI Notes'}));
}
export function readingMinutes(item:Record<string,any>){return Math.max(1,Math.ceil([item.title,item.summary,item.body,item.description,item.useCase,item.coding,item.routing,item.output,item.fit].filter(Boolean).join(' ').trim().split(/\s+/).filter(Boolean).length/220));}
