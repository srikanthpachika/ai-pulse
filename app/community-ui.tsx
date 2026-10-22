'use client';
import Engagement from './engagement';
import SiteNav from './site-nav';
import AdSlot from './ad-slot';
import {useEffect,useState} from 'react';
export const detail=(url:string)=>'/detail?url='+encodeURIComponent(url);
export const discuss=(key:string,title:string)=>key.startsWith('https://')?detail(key)+'#discussion':'/discussion?post='+encodeURIComponent(key)+'&title='+encodeURIComponent(title);
export function Shell({children}:{children:React.ReactNode}){return <><SiteNav/><main className="community-page"><AdSlot placement="leaderboard"/>{children}<AdSlot placement="footer"/></main><footer><a href="/">← Back to AI Pulse</a><span>Useful ideas. Thoughtful conversations.</span></footer></>}
export function SignIn({path='/account'}:{path?:string}){return <a className="primary" target="_top" href={'/signin-with-chatgpt?return_to='+encodeURIComponent(path)}>Continue with ChatGPT →</a>}
export async function send(url:string,body:unknown){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d:any=await r.json();if(!r.ok)throw Error(d.error||'Unable to save');return d}
export function EditorialPosts(){const [posts,setPosts]=useState<any[]>([]);useEffect(()=>{fetch('/api/posts').then(r=>r.json()).then((d:any)=>setPosts(d.posts||[])).catch(()=>{})},[]);return posts.length?<section className="discovery-section"><div className="eyebrow">FROM THE EDITOR</div><h2>Fresh perspectives</h2><div className="grid">{posts.map(p=><article className="content-card" key={p.id}><span className="tag green">{p.kind} · {p.model||p.provider}</span><h3><a className="card-title-link" href={'/post?id='+p.id}>{p.title}</a></h3><p>{p.summary}</p><a className="read" href={'/post?id='+p.id}>Read & discuss →</a><Engagement expandable postKey={'post:'+p.id} title={p.title} href={'/post?id='+p.id} summary={p.summary} body={p.body}/></article>)}</div></section>:null}
