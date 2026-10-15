export function imageFilename(){
 const now=new Date(),part=n=>String(n).padStart(2,'0');
 const date=`${now.getFullYear()}${part(now.getMonth()+1)}${part(now.getDate())}`;
 const time=`${part(now.getHours())}${part(now.getMinutes())}${part(now.getSeconds())}-${String(now.getMilliseconds()).padStart(3,'0')}`;
 const unique=Array.from(crypto.getRandomValues(new Uint8Array(3)),v=>v.toString(16).padStart(2,'0')).join('');
 return `KUSUDAMA-${date}-${time}-${unique}.png`;
}
