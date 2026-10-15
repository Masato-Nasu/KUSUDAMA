'use client';
import {forwardRef,useEffect,useImperativeHandle,useRef} from 'react';
import {messageColumns} from '../lib/message-layout.js';
import {imageFilename} from '../lib/export-name.js';
export type SceneHandle={save:()=>Promise<void>;capture:()=>string};
type Props={opened:boolean;message:string;interactive?:boolean;busy?:boolean;restored?:boolean;onPull?:()=>void;onReadySound?:()=>void};
const colors=['#bb263c','#d1aa3e','#387eaf','#dd7e9f','#497d59','#c8682d'];
export const Scene=forwardRef<SceneHandle,Props>(function Scene({opened,message,interactive,busy,restored,onPull,onReadySound},ref){
 const canvas=useRef<HTMLCanvasElement>(null),img=useRef<HTMLImageElement|null>(null),material=useRef<HTMLImageElement|null>(null),start=useRef<number|null>(null),pull=useRef(0),progress=useRef(0),openedAt=useRef(0),props=useRef({opened,message,interactive,busy,onPull,onReadySound});
 props.current={opened,message,interactive,busy,onPull,onReadySound};
 useEffect(()=>{if(opened){openedAt.current=performance.now()-((restored||window.matchMedia('(prefers-reduced-motion: reduce)').matches)?5000:0);}else{progress.current=0;openedAt.current=0;}},[opened,restored]);
 useImperativeHandle(ref,()=>({capture:()=>canvas.current?.toDataURL('image/png')||'',save:async()=>{
 const el=canvas.current;if(!el)return;const blob=await new Promise<Blob|null>(r=>el.toBlob(r,'image/png'));if(!blob)throw new Error('保存できませんでした');
 const filename=imageFilename(),file=new File([blob],filename,{type:'image/png'});
 if(navigator.canShare?.({files:[file]})&&/iPhone|iPad|Android/.test(navigator.userAgent)){try{await navigator.share({files:[file],title:'KUSUDAMA'});return;}catch(e){if((e as Error).name==='AbortError')return;}}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }}));
 useEffect(()=>{
 const image=new Image();image.src='/gold-ball.png';image.onload=()=>{img.current=image};
 const propsImage=new Image();propsImage.src='/ceremony-materials.png';propsImage.onload=()=>{material.current=propsImage};
 let frame=0;
 const draw=(now:number)=>{
 const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
 const W=520,H=680,ratio=2; if(el.width!==W*ratio){el.width=W*ratio;el.height=H*ratio;}
 ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
 const p=props.current;
 if(p.opened)progress.current=Math.min(1,(now-openedAt.current)/1250);
 else if(start.current===null&&!p.busy)pull.current*=.82;
 const t=progress.current,e=1-Math.pow(1-t,3),r=164-64*e,cx=260,cy=211-11*e,top=cy-r;
 // Shared coordinates keep every attachment on the rotating shell, not in screen space.
 const insideShell=(side:number,u:number,v:number)=>{const angle=-side*e*1.03,dx=side*r*u,dy=r*v;return {x:cx+dx*Math.cos(angle)-dy*Math.sin(angle),y:top+dx*Math.sin(angle)+dy*Math.cos(angle)}};
 const shake=p.opened?Math.sin(t*25)*(1-t)*5:pull.current/85*Math.sin(now*.04)*3;
 ctx.save();ctx.translate(shake,0);
 // A real hanging point; the gold cord continues above the frame.
 ctx.strokeStyle='#ba943d';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,top+7);ctx.stroke();
 if(t>0){
 // Long curled paper tapes emerge from within the opening.
 for(let i=0;i<18;i++){
 const side=i%2?1:-1,spread=(35+(i*29)%165)*e,drop=(175+(i*43)%190)*e;
 const x=cx+side*spread,y=cy+drop;
 const origin=insideShell(side,.18+(i%3)*.05,.72+(i%4)*.07);
 const tape=ctx.createLinearGradient(cx-180,0,cx+180,0);tape.addColorStop(0,colors[i%colors.length]);tape.addColorStop(.35,'#e9d9b8');tape.addColorStop(.5,colors[i%colors.length]);tape.addColorStop(.8,colors[i%colors.length]);tape.addColorStop(1,'#f6dfb1');ctx.strokeStyle=tape;ctx.lineWidth=2.3+(i%3);ctx.shadowColor='#4c351b22';ctx.shadowBlur=2;ctx.shadowOffsetX=1;ctx.shadowOffsetY=2;ctx.beginPath();ctx.moveTo(origin.x,origin.y);
 ctx.bezierCurveTo(cx+side*(130+20*Math.sin(i)),cy+15*e,x+side*40,y-80,x,y-30);
 ctx.bezierCurveTo(x-side*32,y+3,x+side*35,y+25,x+side*12,y+39);ctx.stroke();ctx.shadowColor='transparent';ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
 }
 // A photographed fabric banner; the message is printed over its cloth surface.
 const bh=352*e,by=225;
 // Two fine silk suspension cords run from inside each shell to the banner's top dowel.
 // These are painted before the shells, so their upper ends remain hidden inside the foil.
 for(const side of [-1,1]){
 const origin=insideShell(side,.25,.85),endX=cx+side*49,endY=by-1;
 const dx=endX-origin.x,dy=endY-origin.y,length=Math.hypot(dx,dy);
 ctx.save();ctx.translate(origin.x,origin.y);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);
 ctx.shadowColor='#5a1a2428';ctx.shadowBlur=1.5;ctx.shadowOffsetX=1;
 if(material.current)ctx.drawImage(material.current,235,27,35,830,-1.6,0,3.2,length+3);
 else{ctx.strokeStyle='#a72d3e';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,length+3);ctx.stroke();}
 ctx.restore();
 }
 ctx.save();ctx.beginPath();ctx.rect(193,by-5,134,bh+10);ctx.clip();
 ctx.shadowColor='#38251025';ctx.shadowBlur=8;ctx.shadowOffsetX=3;ctx.shadowOffsetY=4;ctx.fillStyle='#faf7ed';ctx.fillRect(203,by,114,352);ctx.shadowColor='transparent';ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
 if(material.current){const im=material.current;ctx.drawImage(im,555,52,387,1418,193,by-6,134,364);}
 else{const g=ctx.createLinearGradient(203,0,317,0);g.addColorStop(0,'#e0d6bf');g.addColorStop(.3,'#fffdf5');g.addColorStop(.8,'#f1ecde');g.addColorStop(1,'#d6cbb4');ctx.fillStyle=g;ctx.fillRect(203,by,114,352);ctx.strokeStyle='#a8303d';ctx.lineWidth=1.5;ctx.strokeRect(207,by+3,106,344);}
 const columns=messageColumns(p.message),cols=columns.length,longest=Math.max(1,...columns.map(column=>column.length)),step=Math.min(25,280/Math.max(longest-1,1)),size=Math.min(cols===1?25:cols===2?23:22,step*.94);
 ctx.font=`700 ${size}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif`;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.globalCompositeOperation='multiply';ctx.fillStyle='#29251f';
 columns.forEach((column,col)=>column.forEach((char,row)=>{const x=260+(cols-1)*15-col*30,y=by+36+row*step;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin((col*12+row)*17)*.008);ctx.fillText(char,0,0);ctx.restore();}));
 ctx.globalCompositeOperation='source-over';
 // Subtle folds also shade the ink, making it part of the physical fabric.
 for(let y=by+55;y<by+340;y+=58){const fold=ctx.createLinearGradient(0,y-4,0,y+5);fold.addColorStop(0,'#fff0');fold.addColorStop(.4,'#6c573710');fold.addColorStop(.55,'#fff6');fold.addColorStop(1,'#fff0');ctx.fillStyle=fold;ctx.fillRect(210,y-4,100,9);}
 ctx.restore();
 // Confetti settles into the saved composition after the burst.
 const age=(now-openedAt.current)/1000;
 for(let i=0;i<115;i++){
 const seed=Math.sin(i*127.1)*43758.5453,f=seed-Math.floor(seed),side=Math.cos(i*2.4),vel=100+f*250;
 const a=Math.min(age,2.6),x=cx+side*vel*a*.45,y=cy- Math.sin(i*1.9)*120*a+45*a*a;
 if(y>650||x<12||x>508)continue;
 ctx.save();ctx.translate(x,y);ctx.rotate(i+Math.min(age,3)*side*3);ctx.fillStyle=colors[i%6];ctx.globalAlpha=Math.min(t*5,1);ctx.fillRect(-3,-2,5+f*4,3+f*5);ctx.restore();
 }
 }
 // Paint shells last to occlude ribbon and support-cord origins inside the kusudama.
 // Two rigid hemispheres hinge apart at the shared upper suspension point.
 for(const side of [-1,1]){
 ctx.save();ctx.translate(cx,top);ctx.rotate(-side*e*1.03);ctx.translate(-cx,-top);
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,side<0?Math.PI/2:-Math.PI/2,side<0?Math.PI*1.5:Math.PI/2);ctx.closePath();ctx.clip();
 if(img.current){const im=img.current;ctx.drawImage(im,im.width*.038,im.height*.047,im.width*.923,im.height*.915,cx-r,cy-r,r*2,r*2);}
 else{const gold=ctx.createRadialGradient(cx-70,cy-80,4,cx,cy,r);gold.addColorStop(0,'#fff3ab');gold.addColorStop(.45,'#e5b633');gold.addColorStop(1,'#95600c');ctx.fillStyle=gold;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();}
 ctx.restore();
 if(t>0){ctx.strokeStyle='#b18a37';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,top);ctx.lineTo(cx,cy+r);ctx.stroke();}
 ctx.restore();
 }
 // Once released, the pull cord slips down and disappears; banner suspension cords stay.
 const ropeDrop=Math.min(1,t/.65);
 if(ropeDrop<1){
 const anchorX=cx,anchorY=375+700*ropeDrop*ropeDrop;
 const ropeLength=152+pull.current,ropeWidth=48;
 ctx.save();ctx.globalAlpha=1-ropeDrop;ctx.translate(anchorX,anchorY-6);ctx.rotate(p.opened?Math.sin(ropeDrop*3)*.08:Math.sin(now*.002)*.015);
 ctx.shadowColor='#6d17232b';ctx.shadowBlur=3;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;
 if(material.current){const im=material.current;ctx.drawImage(im,138,27,219,1473,-ropeWidth/2,0,ropeWidth,ropeLength+20);}
 else{const red=ctx.createLinearGradient(-3,0,3,0);red.addColorStop(0,'#69111e');red.addColorStop(.35,'#ee6271');red.addColorStop(.6,'#b92034');red.addColorStop(1,'#771526');ctx.strokeStyle=red;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(3,50,-3,ropeLength-40,0,ropeLength);ctx.stroke();ctx.fillStyle='#b52232';ctx.beginPath();ctx.ellipse(0,ropeLength,6,9,0,0,Math.PI*2);ctx.fill();for(let i=0;i<11;i++){ctx.strokeStyle=i%2?'#cf3a49':'#921e30';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(i*.7-3.5,ropeLength+5);ctx.lineTo(i-5,ropeLength+27);ctx.stroke();}}
 ctx.restore();
 }
 ctx.restore();frame=requestAnimationFrame(draw);
 };frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[]);
 // Native, explicitly non-passive listeners let iOS cancel page panning before a pull starts.
 function canBegin(clientX:number,clientY:number,el:HTMLCanvasElement){
  const p=props.current;if(!p.interactive||p.opened||p.busy||start.current!==null)return false;
  const box=el.getBoundingClientRect(),x=(clientX-box.left)/box.width*520,y=(clientY-box.top)/box.height*680;
  return Math.abs(x-260)<=85&&y>=340&&y<=610;
 }
 function begin(clientX:number,clientY:number,el:HTMLCanvasElement){
  if(!canBegin(clientX,clientY,el))return false;
  start.current=clientY;props.current.onReadySound?.();return true;
 }
 function drag(clientY:number,el:HTMLCanvasElement){
  if(start.current===null)return;
  const scale=680/el.getBoundingClientRect().height;
  pull.current=Math.min(90,Math.max(0,(clientY-start.current)*scale));
  if(pull.current>=78){start.current=null;props.current.onPull?.();}
 }
 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  let finger:number|null=null;
  const touchStart=(ev:TouchEvent)=>{
   if(finger!==null)return;
   const touch=ev.changedTouches[0];
   if(touch&&begin(touch.clientX,touch.clientY,el)){
    finger=touch.identifier;if(ev.cancelable)ev.preventDefault();
   }
  };
  const touchMove=(ev:TouchEvent)=>{
   if(finger===null)return;
   // Keep blocking scroll until this finger lifts, including after the opening threshold.
   if(ev.cancelable)ev.preventDefault();
   const touch=Array.from(ev.changedTouches).find(t=>t.identifier===finger);
   if(touch)drag(touch.clientY,el);
  };
  const touchEnd=(ev:TouchEvent)=>{
   if(!Array.from(ev.changedTouches).some(t=>t.identifier===finger))return;
   finger=null;start.current=null;
   if(ev.type==='touchend')props.current.onReadySound?.();
  };
  el.addEventListener('touchstart',touchStart,{passive:false});
  el.addEventListener('touchmove',touchMove,{passive:false});
  el.addEventListener('touchend',touchEnd);
  el.addEventListener('touchcancel',touchEnd);
  return()=>{
   el.removeEventListener('touchstart',touchStart);el.removeEventListener('touchmove',touchMove);
   el.removeEventListener('touchend',touchEnd);el.removeEventListener('touchcancel',touchEnd);
   start.current=null;
  };
 },[]);
 function down(ev:React.PointerEvent<HTMLCanvasElement>){
  if(ev.pointerType==='touch'){
   // Keep the original audio unlock on pointerdown, before touchstart cancels page panning.
   // Touch movement is handled below by native listeners, so this must not start a second drag.
   if(canBegin(ev.clientX,ev.clientY,ev.currentTarget))props.current.onReadySound?.();
   return;
  }
  if(!ev.isPrimary||ev.button!==0)return;
  if(begin(ev.clientX,ev.clientY,ev.currentTarget)){
   ev.preventDefault();ev.currentTarget.setPointerCapture(ev.pointerId);
  }
 }
 function move(ev:React.PointerEvent<HTMLCanvasElement>){if(ev.pointerType!=='touch')drag(ev.clientY,ev.currentTarget);}
 function end(ev:React.PointerEvent<HTMLCanvasElement>){if(ev.pointerType!=='touch')start.current=null;}
 return <canvas ref={canvas} className={`scene ${interactive?'touchable':''}`} aria-label={opened?message:'金色のくす玉と赤い紐'} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}/>;
});
