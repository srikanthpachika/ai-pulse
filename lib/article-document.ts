import {z} from 'zod';
export const documentSchema=z.object({url:z.string().regex(/^\/api\/documents\?id=[a-f0-9-]+\.pdf$/),name:z.string().trim().min(1).max(200)}).nullable().optional();
