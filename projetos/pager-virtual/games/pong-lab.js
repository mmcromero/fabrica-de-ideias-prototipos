// Laboratório público: adaptação local do Pong experimental.
// O Pong original depende de API/SSE do Avisaqui; esta versão não usa servidor.
export function iniciarJogo({container,modo='solo',onExit=()=>{}}) {
  const root=document.createElement('section');
  const title=document.createElement('h3');title.textContent='Pong — laboratório local';
  const info=document.createElement('p');info.setAttribute('role','status');
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=360;
  canvas.style.cssText='display:block;width:100%;max-width:600px;aspect-ratio:5/3;background:#102b39;border-radius:12px;touch-action:none';
  const hint=document.createElement('p');hint.textContent=modo==='solo'?'Arraste na tela para mover a raquete azul.':'Dupla local: toque à esquerda ou direita para mover cada raquete.';
  const quit=document.createElement('button');quit.type='button';quit.textContent='Sair do jogo';
  root.append(title,info,canvas,hint,quit);container.append(root);
  const ctx=canvas.getContext('2d');let active=true,frame=0,last=0;
  const p=[180,180],score=[0,0],ball={x:300,y:180,vx:3.2,vy:2.1};
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function pointer(e){if(!active)return;const rect=canvas.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width*600,y=(e.clientY-rect.top)/rect.height*360;
    const side=modo==='solo'?0:(x<300?0:1);p[side]=clamp(y,35,325);}
  canvas.addEventListener('pointerdown',pointer);canvas.addEventListener('pointermove',pointer);
  function reset(direction){ball.x=300;ball.y=180;ball.vx=3.2*direction;ball.vy=(Math.random()-.5)*4;}
  function draw(){ctx.fillStyle='#102b39';ctx.fillRect(0,0,600,360);ctx.strokeStyle='#4b7581';ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(300,0);ctx.lineTo(300,360);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#fff';ctx.font='24px sans-serif';ctx.fillText(String(score[0]),255,32);ctx.fillText(String(score[1]),330,32);
    ctx.fillStyle='#65d4f0';ctx.fillRect(18,p[0]-35,12,70);ctx.fillStyle='#ffb66d';ctx.fillRect(570,p[1]-35,12,70);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,8,0,Math.PI*2);ctx.fill();}
  function tick(time){if(!active)return;const dt=Math.min(2,(time-last)/16.67||1);last=time;
    if(modo==='solo')p[1]=clamp(p[1]+clamp(ball.y-p[1],-2.6*dt,2.6*dt),35,325);
    ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
    if(ball.y<=8||ball.y>=352){ball.y=clamp(ball.y,8,352);ball.vy*=-1;}
    if(ball.vx<0&&ball.x<=38&&ball.x>=24&&Math.abs(ball.y-p[0])<=43){ball.x=38;ball.vx=Math.abs(ball.vx)*1.025;ball.vy+=(ball.y-p[0])*.025;}
    if(ball.vx>0&&ball.x>=562&&ball.x<=576&&Math.abs(ball.y-p[1])<=43){ball.x=562;ball.vx=-Math.abs(ball.vx)*1.025;ball.vy+=(ball.y-p[1])*.025;}
    if(ball.x<0){score[1]++;reset(1);}if(ball.x>600){score[0]++;reset(-1);}
    info.textContent='Azul '+score[0]+' × '+score[1]+' Laranja';draw();frame=requestAnimationFrame(tick);}
  function destroy(){if(!active)return;active=false;cancelAnimationFrame(frame);canvas.removeEventListener('pointerdown',pointer);canvas.removeEventListener('pointermove',pointer);root.remove();onExit();}
  quit.addEventListener('click',destroy);frame=requestAnimationFrame(tick);return destroy;
}
