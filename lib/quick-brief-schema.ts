import {z} from 'zod';
const point=z.string().trim().min(5).max(240);
export const quickBriefSchema=z.object({change:point,benefit:point,nextStep:point,caveat:point,question:point}).refine(b=>Object.values(b).join(' ').split(/\s+/).length<=110,'Keep the complete brief, including its question, within 110 words.');
