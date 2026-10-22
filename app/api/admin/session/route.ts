import {identity,json,sameOrigin,bodyJson,rateLimit,digest} from '../../../../lib/community';
import {passwordRecord,setAdminPassword,verifyPassword,sessionCookie,clearCookie,adminUnlocked} from '../../../../lib/admin-password';
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Origin not allowed'},403);
 try{
  const input=await bodyJson(req);
  if(input.action==='logout')return Response.json({ok:true},{headers:{'Set-Cookie':clearCookie,'Cache-Control':'no-store'}});
  const address=req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||'shared';
  if(!await rateLimit('admin-login:'+await digest(address),10))return json({error:'Too many attempts. Try again in the next hour.'},429);
  if(typeof input.password!=='string'||input.password.length<12||input.password.length>128)return json({error:'Use a password with 12–128 characters.'},400);
  let record=await passwordRecord();
  if(!record){
   const {isAdmin}=await identity();
   if(!isAdmin)return json({error:'Site-owner verification is required only for initial password setup.'},403);
   if(input.action!=='setup'||input.username!=='admin')return json({error:'Set the password for username admin first.'},428);
   record=await setAdminPassword(input.password);
  }else if(input.action==='change'){
   if(!await adminUnlocked(req,'admin'))return json({error:'Sign in before changing the password.'},403);
   record=await setAdminPassword(input.password);
  }else{
   const valid=await verifyPassword(input.password,record);
   if(input.action!=='login'||input.username!=='admin'||!valid)return json({error:'Invalid username or password.'},401);
  }
  return Response.json({ok:true},{headers:{'Set-Cookie':await sessionCookie('admin',record),'Cache-Control':'no-store'}});
 }catch{return json({error:'Unable to update admin session.'},503)}
}
