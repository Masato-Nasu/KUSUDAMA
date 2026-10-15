/** Reuse one media element: iPhone in-app browsers can route this differently from Web Audio. */
export class OpeningMedia{
 private audio:HTMLAudioElement;
 private preload:HTMLAudioElement;
 private priming:Promise<void>|null=null;
 private requested=false;
 private playing=false;
 private disposed=false;
 constructor(){
  this.audio=new Audio('/audio-silence.wav');this.audio.preload='auto';
  this.audio.setAttribute('playsinline','');
  this.preload=new Audio('/opening.mp3');this.preload.preload='auto';
  this.audio.load();this.preload.load();
 }
 prepare(){
  if(this.disposed)return;
  if(this.requested){
   // If opening completed before the finger lifted, retry directly in touchend too.
   if(!this.playing)void this.audio.play().then(()=>{this.playing=true;}).catch(()=>{});
   return;
  }
  if(this.priming)return;
  // play() stays directly in the gesture, before any fetch or promise continuation.
  // The short silent file primes this element without sounding before a successful opening.
  try{
   this.priming=this.audio.play().then(()=>{
    if(!this.requested&&!this.disposed){this.audio.pause();this.audio.currentTime=0;}
   }).catch(()=>{}).finally(()=>{this.priming=null;});
  }catch{this.priming=null;}
 }
 async play():Promise<boolean>{
  if(this.disposed||this.requested)return false;
  this.requested=true;
  try{
   this.audio.pause();this.audio.src='/opening.mp3';this.audio.currentTime=0;
   await this.audio.play();this.playing=true;return !this.disposed;
  }catch{return false;}
 }
 dispose(){
  this.disposed=true;
  for(const audio of [this.audio,this.preload]){audio.pause();audio.removeAttribute('src');audio.load();}
 }
}
