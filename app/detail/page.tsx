import {cache} from 'react';
import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import {GET} from '../api/detail/route';
import {articlePath,isEditorialArticle} from '../../lib/editorial-index';
import DetailView from './detail-view';
const load=cache(async(url:string)=>{const r=await GET(new Request('https://theainotes.com/api/detail?url='+encodeURIComponent(url)));return r.ok?await r.json():null;});
type Props={searchParams:Promise<{url?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
 const {url=''}=await searchParams;const data:any=await load(url);
 if(!data)return {title:'Story unavailable | The AI Notes',robots:{index:false,follow:true}};
 const i=data.item,title=(i.title||i.name)+' | The AI Notes',description=i.summary||i.description||i.fit||'Practical AI news and community discussion.';
 const original=isEditorialArticle({...i,url});
 return {title,description,robots:{index:false,follow:true},alternates:{canonical:original?'https://theainotes.com'+articlePath({...i,url}):undefined},openGraph:{title,description,type:'article'}};
}
export default async function DetailPage({searchParams}:Props){
 const {url=''}=await searchParams;const data:any=await load(url);if(!data)notFound();
 if(isEditorialArticle({...data.item,url}))redirect(articlePath({...data.item,url}));
 return <DetailView initialData={data} initialUrl={url}/>;
}
