/** Prime audio synchronously inside a tap, pointer-down, or touch-end handler. */
export function prepareOpeningAudio(previous:AudioContext|null):AudioContext|null{
 try{
  const session=(navigator as Navigator & {audioSession?:{type:string}}).audioSession;
  if(session)session.type='playback';
 }catch{/* Session selection is optional; older browsers still use Web Audio. */}
 try{
  const AudioConstructor=window.AudioContext||(window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!AudioConstructor)return null;
  const context=previous&&previous.state!=='closed'?previous:new AudioConstructor();
  // Starting a source during the gesture unlocks devices where resume alone is insufficient.
  const source=context.createBufferSource();source.buffer=context.createBuffer(1,1,context.sampleRate);
  source.connect(context.destination);source.onended=()=>source.disconnect();source.start(0);
  void context.resume().catch(()=>{});
  return context;
 }catch{return null;}
}

/** Await resume before scheduling the effect; a blocked context must not silently count as playback. */
export async function playPreparedOpeningAudio(context:AudioContext|null):Promise<boolean>{
 if(!context||context.state==='closed')return false;
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  if(context.state!=='running')await Promise.race([
   context.resume(),new Promise<void>(resolve=>{timer=setTimeout(resolve,1200);})
  ]);
  if(context.state!=='running')return false;
  playOpeningSound(context);return true;
 }catch{return false;}finally{if(timer!==undefined)clearTimeout(timer);}
}

/** A bright, three-note trumpet fanfare: two short calls and a held celebratory finish. */
export function playOpeningSound(context:AudioContext){
 if(context.state==='closed')return;
 const sampleRate=context.sampleRate,duration=1.4,buffer=context.createBuffer(2,Math.ceil(sampleRate*duration),sampleRate);
 const notes=[{at:0,length:.12,hz:392},{at:.16,length:.12,hz:392},{at:.32,length:.75,hz:523.251}];
 const dry=new Float32Array(buffer.length);
 for(const note of notes){
  let phase=0;
  for(let i=0;i<Math.ceil(note.length*sampleRate);i++){
   const t=i/sampleRate,index=Math.round(note.at*sampleRate)+i;
   const attack=Math.min(1,t/.012),release=Math.min(1,(note.length-t)/.075);
   const envelope=attack*release*(.8+.2*Math.exp(-t*22));
   const vibrato=t>.16?1+.003*Math.sin(2*Math.PI*5.5*t):1;
   phase+=2*Math.PI*note.hz*(1+.025*Math.exp(-t*60))*vibrato/sampleRate;
   let brass=0;
   for(let harmonic=1;harmonic<=9;harmonic++)brass+=Math.sin(phase*harmonic)*Math.exp(-harmonic*.26)/Math.pow(harmonic,.65);
   // A small upper brass harmony gives the held note a ceremonial finish.
   const harmony=note.at===.32?.035*(Math.sin(phase*1.25)+.65*Math.sin(phase*1.5)):0;
   dry[index]=envelope*(brass*.25+harmony);
  }
 }
 for(let channel=0;channel<2;channel++){
  const data=buffer.getChannelData(channel);
  for(let i=0;i<data.length;i++){
   let sample=dry[i];
   for(const [delay,gain]of [[.065+channel*.012,.14],[.125-channel*.009,.09],[.21,.045]]){
    const past=i-Math.round(delay*sampleRate);if(past>=0)sample+=dry[past]*gain;
   }
   data[i]=sample;
  }
 }
 const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);source.onended=()=>source.disconnect();const now=context.currentTime;source.start(now);
 // Fine, irregular paper rustles spread out after the cork releases.
 const paperDuration=1.35,paper=context.createBuffer(2,Math.ceil(sampleRate*paperDuration),sampleRate);
 for(let channel=0;channel<2;channel++){
  const data=paper.getChannelData(channel);let random=7919+channel*104729,low=0,high=0;
  const lowAlpha=1-Math.exp(-2*Math.PI*1800/sampleRate),highAlpha=1-Math.exp(-2*Math.PI*6500/sampleRate);
  for(let i=0;i<data.length;i++){
   const t=i/sampleRate;random=(Math.imul(random,1664525)+1013904223)>>>0;
   const noise=(random/4294967296)*2-1;low+=lowAlpha*(noise-low);high+=highAlpha*(noise-high);
   const flutter=.53+.24*Math.sin(2*Math.PI*9.3*t+channel*.8)+.18*Math.sin(2*Math.PI*14.7*t+1.2+channel*.4);
   const envelope=Math.min(1,t/.055)*Math.pow(Math.max(0,1-t/paperDuration),1.8);
   data[i]=((high-low)*.22+(noise-high)*.028)*flutter*flutter*envelope;
  }
 }
 const rustle=context.createBufferSource();rustle.buffer=paper;rustle.connect(context.destination);rustle.onended=()=>rustle.disconnect();rustle.start(now+.045);
}
