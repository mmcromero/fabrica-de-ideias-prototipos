// Módulo opcional: importado somente após toque em Jogar.
import {obterCatalogo,criarSessaoJogos} from './catalogo.js?v=50';
// Elementos e estilos são criados apenas após o clique do cliente.
const estilo=document.createElement('link');estilo.rel='stylesheet';estilo.href=new URL('./games-ui.css?v=50',import.meta.url).href;document.head.append(estilo);
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
function mostrarCatalogo(){encerrarPartida();etapa='catalogo';jogo=null;stage.replaceChildren();layout();const box=document.createElement('section');box.className='games-choose';const titulo=cabecalho('🎮 Escolha um jogo');const lista=document.createElement('div');lista.className='games-list';const aviso=document.createElement('p');aviso.textContent='Carregando jogos…';box.append(titulo,lista,aviso);stage.append(box);const token=geracao;
obterCatalogo().then(jogos=>{if(!ativo||token!==geracao)return;aviso.textContent=jogos.length+' jogos disponíveis';for(const item of jogos){const card=document.createElement('article');card.className='games-option';const h=document.createElement('h3');h.textContent=item.title;const p=document.createElement('p');p.textContent=item.description;card.append(h,p,botao('Escolher',()=>mostrarJogadores(item),'primary'));lista.append(card);}}).catch(()=>{if(token===geracao)aviso.textContent='Não foi possível carregar o catálogo. Tente novamente.';});}
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
