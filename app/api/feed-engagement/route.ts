import {db} from '../../../lib/community';
// Aggregate only public counts. No identities or pending comments are exposed.
export async function GET(){try{const rows=await db().prepare(`SELECT post_key,SUM(up) AS up,SUM(down) AS down,SUM(views) AS views,SUM(comments) AS comments FROM (
 SELECT post_key,SUM(CASE WHEN value=1 THEN 1 ELSE 0 END) AS up,SUM(CASE WHEN value=-1 THEN 1 ELSE 0 END) AS down,0 AS views,0 AS comments FROM reactions GROUP BY post_key
 UNION ALL SELECT post_key,0,0,COUNT(*),0 FROM views GROUP BY post_key
 UNION ALL SELECT post_key,0,0,0,COUNT(*) FROM comments WHERE status='approved' GROUP BY post_key
) GROUP BY post_key ORDER BY SUM(up)+SUM(views)+SUM(comments) DESC LIMIT 2000`).all();return Response.json({counts:Object.fromEntries(rows.results.map((r:any)=>[r.post_key,{up:Number(r.up),down:Number(r.down),views:Number(r.views),comments:Number(r.comments)}])),asOf:new Date().toISOString()},{headers:{'Cache-Control':'public, max-age=60'}})}catch{return Response.json({error:'Engagement rankings are temporarily unavailable.'},{status:503})}}
