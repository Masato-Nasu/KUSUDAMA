import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync('app/opening-media.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const elements=[];
class Audio{
 constructor(src){this.src=src;this.calls=[];elements.push(this);}
 setAttribute(){}load(){}removeAttribute(){this.src='';}pause(){this.calls.push('pause');}
 play(){this.calls.push(this.src);return this.reject?Promise.reject(new Error('blocked')):Promise.resolve();}
}
const exported={};vm.runInNewContext(js,{exports:exported,Audio});
const media=new exported.OpeningMedia(),audio=elements[0];
media.prepare();assert.deepEqual(audio.calls,['/audio-silence.wav']);
// A late priming promise must never pause or reset an opening that already started.
assert.equal(await media.play(),true);assert.equal(audio.src,'/opening.mp3');
await new Promise(resolve=>setTimeout(resolve,0));
assert.deepEqual(audio.calls,['/audio-silence.wav','pause','/opening.mp3']);
media.prepare();assert.equal(audio.src,'/opening.mp3');assert.equal(await media.play(),false);
media.dispose();assert.equal(await media.play(),false);
const blocked=new exported.OpeningMedia();elements[2].reject=true;
blocked.prepare();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(await blocked.play(),false);
elements[2].reject=false;blocked.prepare();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(elements[2].src,'/opening.mp3');
console.log('PASS: one primed media element, no premature effect, no late pause, no duplicate playback, disposal, blocked playback and touch-end retry');
