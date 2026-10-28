import {cache} from 'react';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {GET} from '../api/detail/route';
import DetailView from './detail-view';
const load=cache(async(url:string)=>{const r=await GET(new Request('https://theainotes.com/api/detail?url='+encodeURIComponent(url)));return r.ok?await r.json():null;});
type Props={searchParams:Promise<{url?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{const {url=''}=await searchParams;const data:any=await load(url);if(!data)return {title:'Story unavailable | The AI Notes',robots:{index:false}};const i=data.item,title=(i.title||i.name)+' | The AI Notes',description=i.summary||i.description||i.fit||'Practical AI news and community discussion.';return {title,description,alternates:{canonical:'https://theainotes.com/detail?url='+encodeURIComponent(url)},openGraph:{title,description,type:'article'}};}
export default async function DetailPage({searchParams}:Props){const {url=''}=await searchParams;const data=await load(url);if(!data)notFound();return <DetailView initialData={data} initialUrl={url}/>;}
