import {z} from 'zod';
import {db,digest} from './community';
const https=z.string().max(2000).url().refine(s=>s.startsWith('https://'));
export const editorialSchema=z.object({
 url:https,title:z.string().trim().min(5).max(200),summary:z.string().trim().min(10).max(650),
 body:z.string().trim().max(30000),provider:z.string().trim().min(1).max(100),model:z.string().max(100),
 category:z.enum(['New features','Model release','Pricing & access','Research','Industry']),date:z.string().datetime(),
 imageUrl:z.union([z.literal(''),https,z.string().regex(/^\/api\/images\?id=[a-f0-9-]+\.(webp|png|jpg)$/)]),
 imageAlt:z.string().max(300),imageCredit:z.string().max(200),imageSource:z.union([z.literal(''),https]),
 imageKind:z.enum(['source','illustration','custom']),
 stats:z.array(z.object({value:z.string().trim().min(1).max(40),label:z.string().trim().min(1).max(100),source:https,asOf:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})).max(4)
});
export async function editorialOverrides(){const rows=await db().prepare("SELECT value FROM settings WHERE key LIKE 'editorial:%'").all<{value:string}>();return rows.results.map(r=>JSON.parse(r.value));}
export async function editorialOverride(url:string){const row=await db().prepare('SELECT value FROM settings WHERE key=?').bind('editorial:'+await digest(url)).first<{value:string}>();return row?JSON.parse(row.value):null;}
export async function saveEditorial(value:z.infer<typeof editorialSchema>){const v={...value,editorialUpdatedAt:new Date().toISOString()};await db().prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('editorial:'+await digest(v.url),JSON.stringify(v)).run();return v;}
