import VisitTracker from './visit-tracker';
import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'AI Pulse — Stay ahead of what’s next',description:'Explore the latest AI news, model launches and product features from leading AI companies.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<VisitTracker/></body></html>}
