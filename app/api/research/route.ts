import {writerAllowed} from '../../../lib/community';
import {readResearch,writeResearch,updateSchema,instructions} from '../../../lib/research';
// All writes require an administrator identity or the dedicated writer credential.
export async function GET(){try{return Response.json({...await readResearch(),instructions},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Research storage is temporarily unavailable'},{status:503})}}
export async function POST(request:Request){
 if(!await writerAllowed(request))return Response.json({error:"Writer authorization required"},{status:403});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origin not allowed'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'JSON required'},{status:415});
 try{const body=await request.text();if(body.length>150000)return Response.json({error:'Payload too large'},{status:413});const parsed=updateSchema.safeParse(JSON.parse(body));if(!parsed.success)return Response.json({error:'Invalid research update',details:parsed.error.issues},{status:400});const state=await writeResearch(parsed.data);return Response.json({ok:true,runId:state.runId,updatedAt:state.updatedAt,total:state.stories.length},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Unable to save research; retry with the same runId'},{status:503})}
}
