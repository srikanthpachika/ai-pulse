import {env} from 'cloudflare:workers';
import {adminUnlocked} from '../../../../lib/admin-password';
import {json,sameOrigin} from '../../../../lib/community';
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'Origin not allowed'},403);if(!await adminUnlocked(req,'admin'))return json({error:'Admin sign in required'},401);if(!env.BUCKET)return json({error:'Image storage unavailable'},503);try{
 if(Number(req.headers.get('content-length')||0)>5*1024*1024+20000)return json({error:'Use an image under 5 MB.'},413);
 const file=(await req.formData()).get('image');if(!(file instanceof File)||!file.size||file.size>5*1024*1024)return json({error:'Choose a PNG, JPEG or WebP image under 5 MB.'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());let type='',ext='';if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10){type='image/png';ext='png'}else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){type='image/jpeg';ext='jpg'}else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'){type='image/webp';ext='webp'}else return json({error:'Only PNG, JPEG and WebP images are supported.'},400);
 const id=crypto.randomUUID()+'.'+ext;await env.BUCKET.put('editorial-images/'+id,bytes,{httpMetadata:{contentType:type}});return json({ok:true,url:'/api/images?id='+id});
 }catch{return json({error:'Image upload failed. Please try again.'},400)}}
