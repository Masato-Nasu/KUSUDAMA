// Render the same synthesized effect to a media file for iPhone in-app browsers.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const js=ts.transpileModule(fs.readFileSync('app/opening-sound.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exported={},sources=[],rate=44100;
const context={state:'running',sampleRate:rate,currentTime:0,destination:{},createBuffer:(channels,length)=>{const data=Array.from({length:channels},()=>new Float32Array(length));return {data,length,getChannelData:i=>data[i]};},createBufferSource:()=>{const s={connect(){},disconnect(){},start(time){s.time=time;}};sources.push(s);return s;}};
vm.runInNewContext(js,{exports:exported});exported.playOpeningSound(context);
function wav(file,silence){
 const frames=silence?2205:Math.ceil(rate*1.5),channels=silence?1:2,data=Buffer.alloc(frames*channels*2),head=Buffer.alloc(44);
 for(let frame=0;frame<frames&&!silence;frame++)for(let channel=0;channel<channels;channel++){
  let sample=0;for(const source of sources){const index=frame-Math.round(source.time*rate),samples=source.buffer.data[channel%source.buffer.data.length];if(index>=0&&index<samples.length)sample+=samples[index];}
  data.writeInt16LE(Math.round(Math.max(-.9,Math.min(.9,sample*1.6))*32767),(frame*channels+channel)*2);
 }
 head.write('RIFF');head.writeUInt32LE(36+data.length,4);head.write('WAVEfmt ',8);head.writeUInt32LE(16,16);head.writeUInt16LE(1,20);head.writeUInt16LE(channels,22);head.writeUInt32LE(rate,24);head.writeUInt32LE(rate*channels*2,28);head.writeUInt16LE(channels*2,32);head.writeUInt16LE(16,34);head.write('data',36);head.writeUInt32LE(data.length,40);fs.writeFileSync(file,Buffer.concat([head,data]));
}
wav('/tmp/kusudama-opening.wav',false);wav('public/audio-silence.wav',true);

require('node:child_process').execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i','/tmp/kusudama-opening.wav','-codec:a','libmp3lame','-b:a','128k','public/opening.mp3']);
