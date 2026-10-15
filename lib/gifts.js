import {normalizeMessage,messageError} from './message-layout.js';
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer',...headers}});
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('');
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
export async function handleGift(request,db){
 try{
 const url=new URL(request.url),parts=url.pathname.split('/').filter(Boolean),id=parts[2],action=parts[3];
 const cookie=request.headers.get('cookie')?.match(/(?:^|;\s*)kusudama_owner=([a-f0-9]{48})/)?.[1];
 if(request.method==='POST' && request.headers.get('origin') && request.headers.get('origin')!==url.origin)return json({error:'この画面からもう一度お試しください。'},403);
 if(request.method==='POST'&&!id){
 if(Number(request.headers.get('content-length')||0)>4096)return json({error:'メッセージが長すぎます。'},413);
 const body=await request.text();if(body.length>4096)return json({error:'メッセージが長すぎます。'},413);
 const message=normalizeMessage(JSON.parse(body).message),validation=messageError(message);
 if(validation)return json({error:validation},400);
 const owner=cookie||token(),ownerHash=await hash(owner);
 const recent=await db.prepare('SELECT COUNT(*) AS count FROM gifts WHERE owner=? AND created_at>?').bind(ownerHash,Date.now()-3600000).first();
 if(recent.count>=30)return json({error:'少し時間をおいてからお作りください。'},429);
 const giftId=token(),key=token(),statusKey=token();
 await db.prepare('INSERT INTO gifts(id,message,recipient,status_key,owner,created_at) VALUES(?,?,?,?,?,?)').bind(giftId,message,await hash(key),await hash(statusKey),ownerHash,Date.now()).run();
 return json({id:giftId,key,statusKey},201,{'Set-Cookie':`kusudama_owner=${owner}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`});
 }
 if(!id||!/^[a-f0-9]{48}$/.test(id))return json({error:'くす玉が見つかりません。'},404);
 const key=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 const row=await db.prepare('SELECT * FROM gifts WHERE id=?').bind(id).first();
 if(!row)return json({error:'くす玉が見つかりません。'},404);
 const digest=await hash(key);
 if(action==='status'&&request.method==='GET'){
 if(digest!==row.status_key)return json({error:'確認用URLをお確かめください。'},403);
 return json({opened:!!row.opened_at});
 }
 if(digest!==row.recipient)return json({error:'贈られたURLをお確かめください。'},403);
 const ownerMatch=cookie&&await hash(cookie)===row.owner;
 const receipt=request.headers.get('x-open-receipt')||'';
 const validReceipt=/^[a-f0-9]{48}$/.test(receipt),receiptHash=validReceipt?await hash(receipt):'';
 if(request.method==='GET'){
 if(row.opened_at){if(validReceipt&&row.receipt===receiptHash)return json({state:'opened',message:row.message});return json({state:'used'});}
 return json({state:ownerMatch?'sender':'closed'});
 }
 if(request.method==='POST'&&action==='open'){
 if(ownerMatch)return json({error:'このくす玉は、受け取った方だけが開けられます。'},403);
 if(!validReceipt)return json({error:'もう一度紐を引いてください。'},400);
 const opened=await db.prepare('UPDATE gifts SET opened_at=?,receipt=? WHERE id=? AND opened_at IS NULL RETURNING message').bind(Date.now(),receiptHash,id).first();
 if(opened)return json({state:'opened',message:opened.message});
 const latest=await db.prepare('SELECT receipt,message FROM gifts WHERE id=?').bind(id).first();
 if(latest.receipt===receiptHash)return json({state:'opened',message:latest.message});
 return json({state:'used'},409);
 }
 return json({error:'この操作はできません。'},405);
 }catch{return json({error:'通信できませんでした。少し待って、もう一度お試しください。'},500);}
}
