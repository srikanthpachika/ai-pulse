import {newsletterItems,newsletterRss} from '../../lib/newsletter';
export async function GET(){const {items}=await newsletterItems();return new Response(newsletterRss(items),{headers:{'Content-Type':'application/rss+xml; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});}
