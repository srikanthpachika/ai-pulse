// Small, attributed editorial callouts; admin overrides take precedence.
const storage='https://openai.com/index/scaling-storage-one-billion-users-part-two/';
const minimax='https://www.minimax.io/blog/minimax-m31f';
export const articleStatSeeds:Record<string,{value:string;label:string;source:string;asOf:string}[]>={
 [storage]:[{value:'12×',label:'Read-latency improvement reported by OpenAI',source:storage,asOf:'2026-10-23'},{value:'~10 ms',label:'Global median read latency reported by OpenAI',source:storage,asOf:'2026-10-23'}],
 [minimax]:[{value:'$0.15 / 1M',label:'Input tokens · provider launch pricing (USD)',source:minimax,asOf:'2026-10-19'},{value:'$0.60 / 1M',label:'Output tokens · provider launch pricing (USD)',source:minimax,asOf:'2026-10-19'}]
};
