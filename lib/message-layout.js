const segmenter=new Intl.Segmenter('ja',{granularity:'grapheme'});
export const normalizeMessage=value=>String(value??'').replace(/\r\n?/g,'\n').trim();
export const messageCharacters=value=>Array.from(segmenter.segment(String(value)),item=>item.segment);
export const messageLength=value=>messageCharacters(String(value).replace(/[\r\n]/g,'')).length;
export function messageError(value){
 const text=normalizeMessage(value);
 if(!text)return 'メッセージを入力してください。';
 if(messageLength(text)>36)return 'メッセージは改行を除いて36文字以内で入力してください。';
 if(text.split('\n').length>3)return '垂れ幕は3列までです。改行は2回までにしてください。';
 return '';
}
export function messageColumns(value){
 const text=normalizeMessage(value);
 if(text.includes('\n'))return text.split('\n').map(messageCharacters);
 const chars=messageCharacters(text),count=Math.max(1,Math.ceil(chars.length/12)),per=Math.max(1,Math.ceil(chars.length/count));
 return Array.from({length:count},(_,i)=>chars.slice(i*per,(i+1)*per));
}
