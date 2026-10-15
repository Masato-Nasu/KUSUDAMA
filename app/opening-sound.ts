/** A small champagne-cork pop followed by a brief, soft release of air. */
export function playOpeningSound(context:AudioContext){
 if(context.state==='closed')return;
 const sampleRate=context.sampleRate,duration=.42,buffer=context.createBuffer(1,Math.ceil(sampleRate*duration),sampleRate),samples=buffer.getChannelData(0);
 let seed=190717,softNoise=0;
 const smoothing=1-Math.exp(-2*Math.PI*2400/sampleRate);
 for(let i=0;i<samples.length;i++){
  const t=i/sampleRate;
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const noise=(seed/4294967296)*2-1;
  softNoise+=smoothing*(noise-softNoise);
  const attack=Math.min(1,t/.0015);
  // The bottle's short, descending hollow resonance supplies the rounded "pon".
  const phase=2*Math.PI*(175*t+(220/70)*(1-Math.exp(-70*t)));
  const body=(.24*Math.sin(phase)*Math.exp(-68*t)+.045*Math.sin(2*Math.PI*650*t)*Math.exp(-95*t))*attack;
  const cork=(noise-softNoise)*.19*Math.exp(-105*t)*attack;
  const airAge=Math.max(0,t-.014),airAttack=Math.min(1,airAge/.009);
  const air=softNoise*.055*airAttack*Math.exp(-16*airAge);
  samples[i]=(body+cork+air)*.75;
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
   data[i]=((high-low)*.11+(noise-high)*.014)*flutter*flutter*envelope;
  }
 }
 const rustle=context.createBufferSource();rustle.buffer=paper;rustle.connect(context.destination);rustle.onended=()=>rustle.disconnect();rustle.start(now+.045);
}
