import VisitTracker from './visit-tracker';
import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'The AI Notes — AI News, Model Releases & Community',description:'Your daily notes on AI news, new model features, real implementations, open-source code, and community ideas.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><head><link rel="alternate" type="application/rss+xml" title="The AI Notes" href="/feed.xml"/><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1938615558208926" crossOrigin="anonymous"></script></head><body>{children}<VisitTracker/></body></html>}
