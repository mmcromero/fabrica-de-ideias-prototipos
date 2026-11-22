const DEMO_KEY='avisaqui-portfolio-rc12-v1';
function seed(){return {orders:[41,42,43].map((n,i)=>({id:'id'+n,numero:n,token:'demo-'+n,itens:['Pedido demonstrativo '+n],status:'preparo',created_at:Date.now()-(3-i)*60000,restaurante_nome:'Restaurante Exemplo'})),seq:{modo:'manual',proximo_numero:44},devices:[{id:'d1',caixa_nome:'Caixa 01 (exemplo)',confirmado_em:Date.now(),last_seen_em:Date.now()},{id:'d2',caixa_nome:'Caixa 02 (exemplo)',confirmado_em:null}],restaurants:[{id:'r1',nome:'Restaurante Exemplo',slug:'restaurante-exemplo',ativo:true},{id:'r2',nome:'Café Exemplo',slug:'cafe-exemplo',ativo:true}],context:'r1',managers:[{id:'g1',nome:'Gerente Exemplo',login:'gerente-demo',ativo:true}],terminals:[{id:'t1',nome:'Caixa 01',login:'caixa-demo',ativo:true}]}}
function readDemo(){try{return JSON.parse(localStorage.getItem(DEMO_KEY))||seed()}catch{return seed()}}
function saveDemo(d){try{localStorage.setItem(DEMO_KEY,JSON.stringify(d))}catch{}}
try{if(!localStorage.getItem(DEMO_KEY))saveDemo(seed());}catch{}
function response(o,status=200){return {ok:status<300,status,json:async()=>JSON.parse(JSON.stringify(o)),text:async()=>JSON.stringify(o)}}
async function demoFetch(url,opts={}){const d=readDemo(),path=(String(url).split('/api/')[1]||'').split('?')[0],method=opts.method||'GET',data=JSON.parse(opts.body||'{}'),done=(o={ok:true})=>{saveDemo(d);return response(o)};
if(path==='auth/me'){const r=d.restaurants.find(x=>x.id===d.context);return response({nome:'Gerente Exemplo',login:'demo',papel:location.pathname.endsWith('/admin.html')?'master':'gerente',restaurante_id:r?.id||null,restaurante_nome:r?.nome||'',restaurante_slug:r?.slug||''})}
if(path==='auth/logout'||path==='auth/password')return response({ok:true});
if(path==='config/publica')return response({public_url:'',pair_v1_enabled:true});
if(path==='pedidos/historico'){const f=d.orders.filter(x=>x.status==='entregue');return response({total_hoje:f.length,pedidos:f})}
if(path==='pedidos/sequencia'){if(method==='PUT'){if(!Number.isInteger(data.proximo_numero)||data.proximo_numero<1)return response({error:'Número inválido'},400);d.seq={modo:data.modo,proximo_numero:data.proximo_numero};return done(d.seq)}return response(d.seq)}
if(path==='pedidos'){if(method==='POST'){const n=d.seq.modo==='automatico'?d.seq.proximo_numero:Number(data.numero);if(!Number.isInteger(n)||n<1||d.orders.some(x=>x.numero===n&&x.status!=='entregue'))return response({error:'Senha inválida ou já em atendimento.'},409);const id='id'+Date.now();const o={id,numero:n,token:'demo-'+id,itens:[],status:'preparo',created_at:Date.now(),cliente_nome:data.cliente_nome||'',cliente_telefone:'',restaurante_nome:'Restaurante Exemplo'};d.orders.push(o);if(d.seq.modo==='automatico')d.seq.proximo_numero++;return done(o)}return response(d.orders.filter(x=>x.status!=='entregue'))}
if(/^pedidos\/[^/]+\/status$/.test(path)){const o=d.orders.find(x=>x.id===path.split('/')[1]);if(!o||!['pronto','entregue'].includes(data.status))return response({error:'Pedido inválido'},400);o.status=data.status;if(data.status==='entregue')o.delivered_at=Date.now();return done(o)}
if(path==='windows/download/status')return response({available:false});
if(path==='agentes/dispositivos')return response(d.devices);
if(path.startsWith('agentes/dispositivos/')){const o=d.devices.find(x=>x.id===path.split('/')[2]);if(!o)return response({},404);if(method==='DELETE')o.revogado_em=Date.now();else o.caixa_nome=data.caixa_nome;return done(o)}
if(path==='integracoes/impressao/eventos')return response([{numero:41,situacao:'RECEBIDO',criado_em:Date.now(),evento_origem:'DEMO-001'},{numero:42,situacao:'PENDENTE',criado_em:Date.now(),evento_origem:'DEMO-002'}]);
if(path==='admin/interesses-piloto')return response([]);
if(path==='admin/restaurantes'){if(method==='POST'){d.restaurants.push({id:'r'+Date.now(),nome:data.nome,slug:data.slug,ativo:true});return done()}return response(d.restaurants)}
if(path.startsWith('admin/contexto/')){d.context=path.endsWith('/sair')?null:decodeURIComponent(path.split('/').pop());return done()}
if(/^admin\/restaurantes\/[^/]+\/logo$/.test(path))return done();
if(/\/gerentes(?:\/|$)/.test(path)){if(method==='GET')return response(d.managers);if(method==='POST'&&!path.endsWith('/senha'))d.managers.push({id:'g'+Date.now(),nome:data.nome,login:data.login,ativo:true});return done()}
if(path==='admin/terminais'){if(method==='POST'){d.terminals.push({id:'t'+Date.now(),nome:data.nome,login:data.login,ativo:true});return done()}return response(d.terminals)}
if(path.startsWith('admin/terminais/')){const t=d.terminals.find(x=>x.id===path.split('/')[2]);if(t&&typeof data.ativo==='boolean')t.ativo=data.ativo;return done()}
return response({error:'Operação não disponível na POC.'},404)}
class DemoEvents{constructor(url){this.url=url;this.last='';this.tick=()=>{if(!this.url.includes('/pedidos/stream/'))return;const token=decodeURIComponent(this.url.split('/').pop());const o=readDemo().orders.find(x=>x.token===token)||{status:'preparo',restaurante_nome:'Restaurante Exemplo'};const data=JSON.stringify(o);if(data!==this.last){this.last=data;this.onmessage?.({data})}};setTimeout(this.tick,0);window.addEventListener('storage',this.tick);this.timer=setInterval(this.tick,1000)}addEventListener(){}close(){clearInterval(this.timer);window.removeEventListener('storage',this.tick)}}
