import {z} from 'zod';
export const galleryImageSchema=z.object({url:z.string().max(2000).refine(s=>/^https:\/\//.test(s)||/^\/api\/images\?id=[a-f0-9-]+\.(webp|png|jpg)$/.test(s),'Use HTTPS or an uploaded image'),alt:z.string().trim().min(1).max(300),caption:z.string().max(500).default(''),credit:z.string().trim().min(1).max(200),align:z.enum(['left','center','right']).optional(),width:z.enum(['full','half']).optional(),afterParagraph:z.number().int().min(1).max(500)});
export const gallerySchema=z.array(galleryImageSchema).max(12);
export type GalleryImage=z.infer<typeof galleryImageSchema>;
