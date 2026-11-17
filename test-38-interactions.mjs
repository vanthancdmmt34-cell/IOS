import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import pg from 'pg';
const ROOT='/root/hoc-lap-trinh-study'; const DATA_DIR=path.join(ROOT,'data');
function readEnv(){const o={};for(const l of fs.readFileSync(path.join(ROOT,'.env'),'utf8').split('\n')){const m=l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);if(m)o[m[1]]=m[2].replace(/^['"]|['"]$/g,'');}return o;}
const env=readEnv(); const key=fs.readFileSync(path.join(DATA_DIR,'secret.key'));
const pool=new pg.Pool({host:env.PGHOST||'127.0.0.1',port:Number(env.PGPORT||5432),user:env.PGUSER||'postgres',password:env.PGPASSWORD||'',database:env.PGDATABASE||'pylab_study'});
const r=await pool.query("SELECT v FROM site_settings WHERE k='system'"); await pool.end();
const st=JSON.parse(r.rows[0].v); const enc=st.secrets&&st.secrets.GEMINI_API_KEY;
const [iv,tag,ct]=String(enc).split('.').map(x=>Buffer.from(x,'base64'));
const d=crypto.createDecipheriv('aes-256-gcm',key,iv); d.setAuthTag(tag);
const apiKey=Buffer.concat([d.update(ct),d.final()]).toString('utf8');
const MODEL='gemini-3.8-flash-lite-tts'; const text='The quick brown fox jumps over the lazy dog.';
const body={model:MODEL,input:[{type:'user_input',content:[{type:'text',text,annotations:[{type:'speech_metadata',style:'Read exactly this text in English, clearly and naturally at a moderate pace, like a language teacher modelling pronunciation.'}]}]}],response_format:{type:'audio'},generation_config:{speech_config:[{voice:'Kore'}]}};
const t0=Date.now();
const res=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
const raw=await res.text(); let data={}; try{data=JSON.parse(raw);}catch{}
console.log('Model:',MODEL,'| HTTP:',res.status,'| thoi gian:',((Date.now()-t0)/1000).toFixed(1)+'s');
if(!res.ok) console.log('LOI:',String(data?.error?.message||raw).slice(0,200)); else console.log('THANH CONG: tra ve am thanh, do dai phan hoi:',raw.length,'ky tu');
