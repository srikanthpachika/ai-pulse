import {cache} from 'react';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {readResearch} from '../../../lib/research';
import {editorialOverrides} from '../../../lib/editorial-content';
import {fallback} from '../../data';
import blogSeeds from '../../blog-seeds.json';
import {GET} from '../../api/detail/route';
import {articleId,articlePath,isEditorialArticle} from '../../../lib/editorial-index';
import DetailView from '../../detail/detail-view';
type Props={params:Promise<{slug:string}>};
const load=cache(async(slug:string)=>{
 const research=await readResearch().catch(()=>null);
 const patches=await editorialOverrides().catch(()=>[]);
 const candidates=[...(research?.stories||[]),...(research?.news||[]),...fallback] as Array<{url:string;title:string;body?:string;indexable?:boolean}>;
 const found=candidates.find(c=>slug.endsWith('-'+articleId(c.url)));
 if(!found)return null;
 const response=await GET(new Request('https://theainotes.com/api/detail?url='+encodeURIComponent(found.url)));
 if(!response.ok)return null;
 const data:any=await response.json();
 const patch=patches.find(p=>p.url===found.url);
 const item={...data.item,...patch,body:patch?.body||data.item.body||(blogSeeds as Record<string,string>)[found.url]};
 return isEditorialArticle({...item,url:found.url})?{...data,item,url:found.url}:null;
});
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const data=await load(slug);
 if(!data)return {title:'Article unavailable | The AI Notes',robots:{index:false}};
 const i=data.item;const title=i.title+' | The AI Notes';
 return {title,description:i.summary||i.description,alternates:{canonical:'https://theainotes.com'+articlePath({...i,url:data.url})},openGraph:{title,description:i.summary||i.description,type:'article'}};
}
export default async function Article({params}:Props){
 const {slug}=await params;const data=await load(slug);
 if(!data)notFound();
 return <DetailView initialData={data} initialUrl={data.url}/>;
}
