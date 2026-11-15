// Módulo opcional: importado somente após toque em Jogar.
import {obterCatalogo,criarSessaoJogos} from './catalogo.js?v=57';
// Elementos e estilos são criados apenas após o clique do cliente.
const estilo=document.createElement('link');estilo.rel='stylesheet';estilo.href=new URL('./games-ui.css?v=57',import.meta.url).href;document.head.append(estilo);
document.body.insertAdjacentHTML('beforeend',`
<section id="game-screen" hidden aria-label="Jogos">
 <div class="game-top"><div><strong>🔔 Pedido #206</strong> <span id="game-order-status">⏳ Em preparo</span></div><button id="game-exit" class="secondary">✕ Sair</button><div class="game-sim"><span>Laboratório</span><button id="game-ready" class="secondary">Simular pedido pronto</button></div></div>
 <div id="rotate-hint" hidden><span class="rotate-icon" aria-hidden="true">📱↻</span><strong>Gire o celular</strong><p>Este jogo funciona melhor com o celular na horizontal.</p><button id="rotate-exit" class="secondary">← Voltar aos jogos</button></div>
 <div class="game-body"><div id="stage"></div></div>
</section>`);
const el=id=>document.getElementById(id);
const sessao=criarSessaoJogos();
let ativo=false,etapa='catalogo',jogo=null,modo='solo',geracao=0,scrollY=0;
const orientacao=()=>matchMedia('(orientation:landscape)').matches?'landscape':'portrait';
const painel=el('game-screen'),stage=el('stage');
const info=el('game-order-status');
function dimensoes(){if(!ativo)return;const vp=window.visualViewport;painel.style.width=Math.floor(vp?.width||innerWidth)+'px';painel.style.height=Math.floor(vp?.height||innerHeight)+'px';painel.style.transform=vp?'translate('+Math.round(vp.offsetLeft)+'px,'+Math.round(vp.offsetTop)+'px)':'none';}
function layout(){
 const naPartida=etapa==='partida'||etapa==='rotacao';
 const desejada=naPartida?(jogo?.orientation||'portrait'):'portrait';
 const precisa=orientacao()!==desejada;
 painel.classList.toggle('landscape',naPartida&&desejada==='landscape');
 painel.classList.toggle('game-portrait',!naPartida||desejada==='portrait');
 const aviso=el('rotate-hint');
 aviso.hidden=!precisa;
 aviso.querySelector('p').textContent=desejada==='landscape'?'Gire o celular para a horizontal antes de jogar.':'Coloque o celular em pé para continuar.';
 painel.querySelector('.game-body').hidden=precisa;
 dimensoes();
 if(etapa==='rotacao'&&!precisa)iniciarPartida();
}
function encerrarPartida(){geracao++;sessao.encerrar();stage.replaceChildren();}
function fechar(){if(!ativo)return;encerrarPartida();ativo=false;document.body.classList.remove('game-active');painel.hidden=true;painel.style.transform='';window.scrollTo(0,scrollY);}
function cabecalho(titulo){const h=document.createElement('h2');h.textContent=titulo;return h;}
function botao(texto,acao,classe='secondary'){const b=document.createElement('button');b.type='button';b.className=classe;b.textContent=texto;b.addEventListener('click',acao);return b;}
function ilustracao(item){
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 240 144');
 svg.setAttribute('role','img');
 svg.setAttribute('aria-label','Ilustração do jogo '+item.title);
 svg.classList.add('games-art');
 const criar=(tag,atributos)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(atributos))el.setAttribute(k,String(v));svg.append(el);return el;};
 criar('rect',{x:0,y:0,width:240,height:144,rx:16,fill:'#12263c'});
 if(item.id==='pong'){
  criar('path',{d:'M120 10 V134',stroke:'#54748a','stroke-width':3,'stroke-dasharray':'8 9'});
  criar('rect',{x:28,y:34,width:12,height:65,rx:6,fill:'#67d4ff'});
  criar('rect',{x:200,y:49,width:12,height:65,rx:6,fill:'#ffb66d'});
  criar('circle',{cx:133,cy:68,r:10,fill:'#fff'});
  criar('path',{d:'M91 82 L117 71',stroke:'#fff','stroke-width':3,'stroke-linecap':'round',opacity:'.5'});
 }else if(item.id==='jogo-da-velha'){
  for(const x of [95,145])criar('path',{d:`M${x} 18 V126`,stroke:'#6b89a2','stroke-width':5,'stroke-linecap':'round'});
  for(const y of [48,96])criar('path',{d:`M47 ${y} H193`,stroke:'#6b89a2','stroke-width':5,'stroke-linecap':'round'});
  for(const [x,y] of [[70,32],[170,112],[120,72]])criar('path',{d:`M${x-11} ${y-11} L${x+11} ${y+11} M${x+11} ${y-11} L${x-11} ${y+11}`,stroke:'#67d4ff','stroke-width':6,'stroke-linecap':'round'});
  for(const [x,y] of [[170,32],[70,72]])criar('circle',{cx:x,cy:y,r:15,fill:'none',stroke:'#ffb66d','stroke-width':6});
 }else{
  const simbolos={
   'jogo-da-memoria':'🃏','cobrinha':'🐍','quebra-cabeca':'🧩','forca':'🔤',
   'campo-minado':'💣','ligue-os-pontos':'🔷','batalha-naval':'🚢',
   'quiz-relampago':'⚡','sudoku':'🔢','blocos':'🧱',
   'corrida-de-carros':'🏎️','air-hockey':'🏒','labirinto':'🌀',
   'jogo-das-diferencas':'🔍'
  };
  criar('circle',{cx:120,cy:70,r:51,fill:'#203f57',stroke:'#3e7089','stroke-width':3});
  const t=criar('text',{x:120,y:91,'text-anchor':'middle','font-size':62,'font-family':'system-ui,sans-serif'});
  t.textContent=simbolos[item.id]||'🎮';
 }
 return svg;
}
function mostrarCatalogo(){encerrarPartida();etapa='catalogo';jogo=null;stage.replaceChildren();layout();const box=document.createElement('section');box.className='games-choose';const titulo=cabecalho('🎮 Escolha um jogo');const lista=document.createElement('div');lista.className='games-list';const aviso=document.createElement('p');aviso.textContent='Carregando jogos…';box.append(titulo,lista,aviso);stage.append(box);const token=geracao;
obterCatalogo().then(jogos=>{if(!ativo||token!==geracao)return;aviso.textContent=jogos.length+' jogos disponíveis';for(const item of jogos){const card=document.createElement('article');card.className='games-option';const h=document.createElement('h3');h.textContent=item.title;const p=document.createElement('p');p.textContent=item.description;const indisponivel=item.status==='construction';
const acao=botao(indisponivel?'Em construção':'Escolher',()=>mostrarJogadores(item),'primary');
acao.disabled=indisponivel;
if(indisponivel){acao.setAttribute('aria-label',item.title+' em construção');card.classList.add('games-unavailable');}
card.append(ilustracao(item),h,p,acao);lista.append(card);}}).catch(()=>{if(token===geracao)aviso.textContent='Não foi possível carregar o catálogo. Tente novamente.';});}
function mostrarJogadores(item){encerrarPartida();jogo=item;etapa='jogadores';modo='solo';stage.replaceChildren();layout();const box=document.createElement('section');box.className='games-choose';const titulo=cabecalho(item.title+' · Jogadores');const escolhas=document.createElement('div');escolhas.className='games-list';const descricao=document.createElement('p');descricao.setAttribute('role','status');const quantidade=item.playerCounts||[1,2];const opcoes=[];let selecionado=quantidade[0];function selecionar(n){selecionado=n;modo=n===1?'solo':'dupla-local';for(const [numero,b] of opcoes){const marcado=numero===n;b.setAttribute('aria-pressed',String(marcado));b.textContent=(marcado?'✓ ':'')+numero+(numero===1?' jogador':' jogadores');}descricao.textContent=n===1?'Contra o computador.':'Jogadores no mesmo aparelho.';}
for(const n of quantidade){const b=botao('',()=>selecionar(n));opcoes.push([n,b]);escolhas.append(b);}const acoes=document.createElement('div');acoes.className='games-actions';acoes.append(botao('← Voltar aos jogos',mostrarCatalogo),botao('Começar partida',confirmar,'primary'));box.append(titulo,escolhas,descricao,acoes);stage.append(box);selecionar(selecionado);}
function confirmar(){if(!jogo)return;encerrarPartida();etapa='rotacao';stage.replaceChildren();layout();}
async function iniciarPartida(){if(!ativo||etapa!=='rotacao')return;etapa='partida';layout();stage.replaceChildren();const token=++geracao;try{const ok=await sessao.abrir(jogo,stage,{modo,autoStart:true,onExit:()=>{if(token===geracao)mostrarCatalogo();}});if(!ativo||token!==geracao)return;if(!ok)mostrarCatalogo();}catch(e){console.error(e);if(token===geracao){mostrarCatalogo();}}}
function abrir(){if(ativo||document.body.dataset.pedidoPronto==='true')return;ativo=true;scrollY=window.scrollY;document.body.classList.add('game-active');painel.hidden=false;info.textContent='⏳ Em preparo';mostrarCatalogo();}
el('game-exit').addEventListener('click',()=>etapa==='partida'?mostrarCatalogo():fechar());
el('rotate-exit').addEventListener('click',mostrarCatalogo);
window.addEventListener('avisaqui:pedido-pronto',fechar);
el('game-ready').addEventListener('click',()=>el('ready').click());
window.addEventListener('avisaqui:pedido-reiniciado',fechar);
window.addEventListener('resize',()=>{dimensoes();if(ativo)layout();},{passive:true});
window.addEventListener('orientationchange',layout,{passive:true});
window.visualViewport?.addEventListener('resize',dimensoes,{passive:true});
window.visualViewport?.addEventListener('scroll',dimensoes,{passive:true});
export {abrir,fechar};
