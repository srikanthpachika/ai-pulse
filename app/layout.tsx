import VisitTracker from './visit-tracker';
import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'The AI Notes — AI News, Model Releases & Community',description:'Your daily notes on AI news, new model features, real implementations, open-source code, and community ideas.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<VisitTracker/></body></html>}
