/* GALERIA-VOTO-001 — interface reutilizável; sem backend configurado não simula votos reais. */
(function(){
"use strict";
const root=document.querySelector("[data-vote-gallery]");
if(!root)return;
const configUrl=root.dataset.config||"./galeria.json";
const cards=[...root.querySelectorAll(".card")];
const status=document.getElementById("vote-status");
const send=document.getElementById("vote-submit");
const clear=document.getElementById("vote-clear");
const results=document.getElementById("vote-results");
const ranking=document.getElementById("vote-ranking");
let chosen=[],config=null,api=null,ballotKey="";
const say=message=>{status.textContent=message;};
const ids=()=>chosen.map(x=>x.id);
function update(){
 cards.forEach(card=>{
  const id=card.dataset.logoId;
  const index=chosen.findIndex(x=>x.id===id);
  const btn=card.querySelector(".vote-pick");
  btn.setAttribute("aria-pressed",String(index>=0));
  btn.textContent=index>=0?(index+1)+"º favorito · "+(3-index)+" ponto"+(index===2?"":"s"):"Escolher como favorito";
  btn.disabled=index<0&&chosen.length===3;
 });
 send.disabled=chosen.length!==3||!api;
 document.getElementById("vote-selection").textContent=chosen.length===3?"Pronto para enviar: 1º "+chosen[0].label+", 2º "+chosen[1].label+", 3º "+chosen[2].label+".":chosen.length+" de 3 favoritos selecionados.";
}
function add(card){
 const id=card.dataset.logoId,label=card.dataset.logoLabel;
 const index=chosen.findIndex(x=>x.id===id);
 if(index>=0)chosen.splice(index,1);
 else if(chosen.length<3)chosen.push({id,label});
 update();
}
function render(items){
 ranking.replaceChildren();
 const sorted=[...items].sort((a,b)=>b.points-a.points||a.name.localeCompare(b.name,"pt-BR"));
 const max=Math.max(1,...sorted.map(x=>x.points));
 sorted.forEach((item,i)=>{
  const row=document.createElement("div");row.className="vote-row";
  const line=document.createElement("div");line.className="vote-row-line";
  const label=document.createElement("span");label.textContent=(i+1)+"º · "+item.name;
  const points=document.createElement("strong");points.textContent=item.points+" pts";
  line.append(label,points);
  const bar=document.createElement("div");bar.className="vote-bar";
  const fill=document.createElement("span");fill.style.width=(100*item.points/max)+"%";
  bar.append(fill);row.append(line,bar);ranking.append(row);
 });
}
async function refresh(){
 if(!api){ranking.textContent="A contagem compartilhada será exibida após configurar o armazenamento.";return;}
 try{
  const response=await fetch(api+"/galleries/"+encodeURIComponent(config.id)+"/results",{cache:"no-store"});
  if(!response.ok)throw Error("HTTP "+response.status);
  const payload=await response.json();
  if(!Array.isArray(payload.results))throw Error("Resposta inválida");
  const known=new Map(config.logos.map(x=>[x.id,x.name]));
  render(payload.results.filter(x=>known.has(x.id)&&Number.isFinite(x.points)&&x.points>=0).map(x=>({name:known.get(x.id),points:x.points})));
 }catch(e){ranking.textContent="Não foi possível carregar a classificação. Tente novamente mais tarde.";}
}
async function submit(){
 if(chosen.length!==3||!api)return;
 send.disabled=true;say("Enviando seus votos…");
 try{
  const response=await fetch(api+"/galleries/"+encodeURIComponent(config.id)+"/ballots",{
   method:"PUT",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({voterId:ballotKey,choices:ids()})
  });
  if(!response.ok)throw Error("HTTP "+response.status);
  localStorage.setItem("galeria-voto:"+config.id+":choices",JSON.stringify(ids()));
  say("Votos registrados. Você pode alterar suas escolhas e enviar novamente.");
  await refresh();
 }catch(e){say("Não foi possível registrar seus votos. Nenhum sucesso foi confirmado.");}
 finally{update();}
}
async function init(){
 try{
  const response=await fetch(configUrl,{cache:"no-store"});
  if(!response.ok)throw Error("Configuração indisponível");
  config=await response.json();
  if(!config.id||!Array.isArray(config.logos))throw Error("Configuração inválida");
  const known=new Map(config.logos.map(x=>[x.id,x]));
  if(known.size!==cards.length||cards.some(x=>!known.has(x.dataset.logoId)))throw Error("Lista de logos divergente");
  api=typeof config.apiBaseUrl==="string"&&/^https:\/\//.test(config.apiBaseUrl)?config.apiBaseUrl.replace(/\/$/,""):null;
  if(api){
   const key="galeria-voto:"+config.id+":voter";
   ballotKey=localStorage.getItem(key)||crypto.randomUUID();
   localStorage.setItem(key,ballotKey);
   try{const saved=JSON.parse(localStorage.getItem("galeria-voto:"+config.id+":choices")||"[]");if(Array.isArray(saved)&&saved.length===3&&new Set(saved).size===3&&saved.every(x=>known.has(x)))chosen=saved.map(id=>({id,label:known.get(id).name}));}catch(e){}
   say("Escolha seus três favoritos e envie seus votos.");
  }else say("Votação preparada. O envio ficará disponível após ativar o armazenamento compartilhado.");
  cards.forEach(card=>{const btn=card.querySelector(".vote-pick");btn.addEventListener("click",()=>add(card));});
  clear.addEventListener("click",()=>{chosen=[];update();});
  send.addEventListener("click",submit);
  results.addEventListener("toggle",()=>{if(results.open)refresh();});
  update();
 }catch(e){say("Não foi possível iniciar a votação: "+e.message);send.disabled=true;}
}
init();
})();
