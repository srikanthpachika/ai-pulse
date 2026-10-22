import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
export function db(){if(!env.DB)throw new Error('Database not ready');return env.DB}
export const json=(d:unknown,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
export async function identity(){const user=await getChatGPTUser();return {user,isAdmin:!!user&&!!env.ADMIN_EMAIL&&user.email.toLowerCase()===env.ADMIN_EMAIL.toLowerCase()}}
export function sameOrigin(req:Request){const o=req.headers.get('origin');return !o||o===new URL(req.url).origin}
export async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('')}
export async function writerAllowed(req:Request){const {isAdmin}=await identity();if(isAdmin)return true;const token=req.headers.get('x-aipulse-writer');if(!token||!env.RESEARCH_WRITER_SHA256)return false;const hash=await digest(token);let diff=hash.length^env.RESEARCH_WRITER_SHA256.length;for(let i=0;i<hash.length;i++)diff|=hash.charCodeAt(i)^env.RESEARCH_WRITER_SHA256.charCodeAt(i);return diff===0}
export async function authorKey(req:Request,userId?:string){if(userId)return 'user:'+await digest(userId);if(!env.COMMENT_HASH_SALT)throw Error('Anonymous posting is not configured');const address=req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||'shared';return 'anon:'+await digest(env.COMMENT_HASH_SALT+address+'|'+(req.headers.get('user-agent')||''))}
export const defaultSettings={enabled:true,anonymous:true,approval:true,closed:[] as string[]};
export async function getSettings(){const row=await db().prepare('SELECT value FROM settings WHERE key=?').bind('comments').first<{value:string}>();return row?{...defaultSettings,...JSON.parse(row.value)}:defaultSettings}
export async function rateLimit(key:string,limit=10){const bucket=key+':'+Math.floor(Date.now()/3600000);const row=await db().prepare('INSERT INTO rate_limits (key,count) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(bucket).first<{count:number}>();return !!row&&row.count<=limit}
export async function bodyJson(req:Request){if(!req.headers.get('content-type')?.includes('application/json'))throw Error('JSON required');const text=await req.text();if(text.length>100000)throw Error('Request too large');return JSON.parse(text)}
