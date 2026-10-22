import {db,digest} from './community';
type PasswordRecord={salt:string;hash:string;iterations:number};
const key='admin-password-v1';
const hex=(a:ArrayBuffer)=>Array.from(new Uint8Array(a),b=>b.toString(16).padStart(2,'0')).join('');
const equal=(a:string,b:string)=>{let n=a.length^b.length;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0};
export async function passwordRecord(){const r=await db().prepare('SELECT value FROM settings WHERE key=?').bind(key).first<{value:string}>();return r?JSON.parse(r.value) as PasswordRecord:null}
async function derive(password:string,salt:string,iterations:number){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations},k,256))}
export async function setAdminPassword(password:string){const salt=crypto.randomUUID();const record={salt,iterations:100000,hash:await derive(password,salt,100000)};await db().prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key,JSON.stringify(record)).run();return record}
export async function verifyPassword(password:string,record:PasswordRecord){return equal(await derive(password,record.salt,record.iterations),record.hash)}
async function sign(text:string,record:PasswordRecord){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(record.hash),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(text)))}
export async function sessionCookie(userId:string,record:PasswordRecord){const payload=Math.floor(Date.now()/1000+3600)+'.'+await digest(userId)+'.'+crypto.randomUUID();return '__Host-aipulse-admin='+payload+'.'+await sign(payload,record)+'; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600'}
export const clearCookie='__Host-aipulse-admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
export async function adminUnlocked(req:Request,userId:string){const record=await passwordRecord();if(!record)return false;const raw=req.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('__Host-aipulse-admin='))?.split('=').slice(1).join('=');if(!raw)return false;const parts=raw.split('.');if(parts.length!==4||Number(parts[0])<=Date.now()/1000||Number(parts[0])>Date.now()/1000+3600||parts[1]!==await digest(userId))return false;return equal(parts[3],await sign(parts.slice(0,3).join('.'),record))}
