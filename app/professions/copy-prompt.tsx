'use client';
import {useState} from 'react';
export default function CopyPrompt({text}:{text:string}){const [status,setStatus]=useState('');return <><button className="secondary" onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('Copied')}catch{setStatus('Select and copy the prompt below.')}}}>Copy prompt</button><span role="status"> {status}</span></>}
