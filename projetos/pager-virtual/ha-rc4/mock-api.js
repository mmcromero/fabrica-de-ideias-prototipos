/* Laboratório Avisaqui: respostas demonstrativas isoladas, sem chamadas às APIs de produção. */
(() => {
  'use strict';
  const prefix = location.pathname.split('/').slice(0, -1).join('/');
  const storeKey = 'avisaqui-demo-rc4-orders';
  const roleKey = 'avisaqui-demo-rc4-role';
  const contextKey = 'avisaqui-demo-rc4-context';
  const defaultOrders = [
    {id:'demo-41',numero:41,token:'demo-41',status:'preparo',created_at:new Date(Date.now()-360000).toISOString(),itens:[],cliente_nome:'',cliente_telefone:'',restaurante_nome:'Restaurante Exemplo'},
    {id:'demo-42',numero:42,token:'demo-42',status:'preparo',created_at:new Date(Date.now()-180000).toISOString(),itens:[],cliente_nome:'',cliente_telefone:'',restaurante_nome:'Restaurante Exemplo'}
  ];
  let orders;
  try { orders=JSON.parse(sessionStorage.getItem(storeKey)||'null')||defaultOrders; }
  catch { orders=defaultOrders; }
  const save = () => sessionStorage.setItem(storeKey,JSON.stringify(orders));
  save();
  let role=sessionStorage.getItem(roleKey)||'master';
  const restaurants=[{id:'demo-rest',nome:'Restaurante Exemplo',slug:'restaurante-exemplo',ativo:true,logo_url:''}];
  const user = () => ({
    id:'demo-'+role,login:role,nome:role==='master'?'Master Demo':role==='gerente'?'Gerente Demo':'Operador Demo',
    papel:role,restaurante_id:'demo-rest',restaurante_nome:'Restaurante Exemplo',restaurante_slug:'restaurante-exemplo',restaurante_logo_url:''
  });
  let sequence={modo:'manual',proximo_numero:43};
  const nativeFetch=window.fetch.bind(window);
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
  const parse=(init)=>{try{return JSON.parse(init?.body||'{}')}catch{return {}}};
  const sync=new BroadcastChannel('avisaqui-demo-rc4');
  function notify(order) { sync.postMessage({id:order.id,token:order.token,numero:order.numero,status:order.status,restaurante_nome:order.restaurante_nome}); }
  window.fetch=async (resource,init={})=>{
    const u=new URL(typeof resource==='string'?resource:resource.url,location.href);
    const path=u.pathname; const method=(init.method||'GET').toUpperCase();
    const at=path.indexOf('/api/');
    if(at<0){
      if(u.origin!==location.origin) return json({error:'Integração externa desativada nesta prévia'},403);
      return nativeFetch(resource,init);
    }
    const p=path.slice(at); const body=parse(init);
    if(p==='/api/setup/status')return json({needs_setup:false});
    if(p==='/api/auth/login' && method==='POST'){
      const r=String(body.login||'').trim().toLowerCase();
      if(!['master','gerente','operador'].includes(r)||body.senha!=='AvisaquiDemo123!')
        return json({error:'Use master, gerente ou operador e a senha fictícia AvisaquiDemo123!'},401);
      role=r;sessionStorage.setItem(roleKey,role);return json({papel:role,nome:user().nome});
    }
    if(p==='/api/auth/me')return json(user());
    if(p==='/api/auth/logout'){sessionStorage.removeItem(roleKey);role='master';return json({ok:true})}
    if(p==='/api/auth/password')return json({ok:true});
    if(p==='/api/config/publica')return json({public_url:location.origin+prefix,restaurante_nome:'Restaurante Exemplo',modo:'manual'});
    if(p==='/api/admin/restaurantes' && method==='GET')return json(restaurants);
    if(p==='/api/admin/restaurantes' && method==='POST'){
      const id='demo-rest-'+(restaurants.length+1);const rest={id,nome:body.nome||'Novo restaurante',slug:body.slug||id,ativo:true,logo_url:''};restaurants.push(rest);return json(rest);
    }
    if(/^\/api\/admin\/restaurantes\/[^/]+\/logo$/.test(p))return json({ok:true});
    if(/^\/api\/admin\/restaurantes\/[^/]+\/gerentes/.test(p))return json(method==='GET'?[]:{id:'gerente-demo',ok:true});
    if(p==='/api/admin/interesses-piloto')return json([]);
    if(p==='/api/piloto/interesse')return json({ok:true,mensagem:'Interesse registrado apenas nesta demonstração.'});
    if(p==='/api/admin/terminais')return json(method==='GET'?[]:{id:'demo-terminal',ok:true});
    if(p.startsWith('/api/admin/terminais/'))return json({ok:true});
    if(p.startsWith('/api/admin/contexto/')){sessionStorage.setItem(contextKey,p);return json({ok:true})}
    if(p==='/api/pedidos/sequencia'){
      if(method==='PUT')sequence={modo:body.modo||'manual',proximo_numero:Number(body.proximo_numero)||sequence.proximo_numero};
      return json(sequence);
    }
    if(p==='/api/pedidos/historico')return json(orders.filter(o=>o.status==='entregue'));
    if(p==='/api/pedidos' && method==='GET')return json(orders.filter(o=>o.status!=='entregue'));
    if(p==='/api/pedidos' && method==='POST'){
      const numero=Number(body.numero)||sequence.proximo_numero++;
      if(orders.some(o=>o.numero===numero&&o.status!=='entregue'))return json({error:'Número já utilizado'},409);
      const order={id:'demo-'+numero,numero,token:'demo-'+numero,status:'preparo',created_at:new Date().toISOString(),itens:Array.isArray(body.itens)?body.itens:[],cliente_nome:body.cliente_nome||'',cliente_telefone:body.cliente_telefone||'',restaurante_nome:'Restaurante Exemplo'};
      orders.push(order);save();notify(order);return json(order,201);
    }
    const statusMatch=p.match(/^\/api\/pedidos\/([^/]+)\/status$/);
    if(statusMatch && method!=='GET'){
      const order=orders.find(o=>o.id===decodeURIComponent(statusMatch[1]));
      if(!order)return json({error:'Pedido não encontrado'},404);
      order.status=body.status||order.status;save();notify(order);return json(order);
    }
    if(p.startsWith('/api/integracoes/impressao/eventos'))return json([]);
    if(p==='/api/agentes/dispositivos')return json([]);
    if(p.startsWith('/api/agentes/'))return json({ok:true,dispositivos:[]});
    if(p==='/api/windows/download/status')return json({disponivel:false,available:false});
    if(p.startsWith('/api/push/'))return json({public_key:null,ok:false});
    if(p.startsWith('/api/jogos/'))return json({disponivel:false,available:false});
    return json({ok:true,items:[]});
  };
  window.EventSource=class {
    constructor(url){
      this.url=url;this.readyState=1;this.onmessage=null;this.onerror=null;this._events={};
      this._listener=event=>{
        const order=event.data;
        if(this.url.includes('/api/kds/stream')){
          const kind=order.status==='preparo'?'novo_pedido':'status_alterado';
          const payload={data:JSON.stringify({...order,itens:[],created_at:new Date().toISOString()})};
          (this._events[kind]||[]).forEach(fn=>fn(payload));
        }else if(this.url.includes(encodeURIComponent(order.token))){
          this.onmessage?.({data:JSON.stringify({status:order.status,restaurante_nome:'Restaurante Exemplo'})});
        }
      };
      sync.addEventListener('message',this._listener);
      if(this.url.includes('/api/pedidos/stream/')){
        const token=decodeURIComponent(this.url.split('/').pop());const order=orders.find(o=>o.token===token);
        if(order)queueMicrotask(()=>this.onmessage?.({data:JSON.stringify({status:order.status,restaurante_nome:order.restaurante_nome})}));
      }
    }
    addEventListener(name,fn){(this._events[name]||=new Set()).add(fn)}
    removeEventListener(name,fn){this._events[name]?.delete(fn)}
    close(){sync.removeEventListener('message',this._listener);this.readyState=2}
  };
  window.addEventListener('DOMContentLoaded',()=>{
    const anchor=document.createElement('button');
    anchor.type='button';anchor.textContent='Prévia ▾';
    anchor.setAttribute('aria-label','Abrir navegação do protótipo');
    anchor.style.cssText='position:fixed;bottom:10px;right:10px;z-index:2147483645;background:#14233b;color:white;border:1px solid #96b5f0;border-radius:999px;padding:10px 14px;font:600 13px system-ui;cursor:pointer';
    const nav=document.createElement('nav');nav.hidden=true;
    nav.setAttribute('aria-label','Telas do protótipo Avisaqui');
    nav.style.cssText='position:fixed;bottom:58px;right:10px;z-index:2147483645;max-width:calc(100vw - 20px);background:#14233b;color:white;padding:13px;border:1px solid #96b5f0;border-radius:12px;box-shadow:0 8px 32px #0008;font:14px system-ui';
    const screens=[['Início','landing.html'],['Login','login.html'],['Master / gerente','admin.html'],['Pedidos / KDS','kds.html'],['Impressão','impressao.html'],['Cliente','cliente.html?token=demo-41&pedido=41'],['Primeiro acesso','setup.html']];
    screens.forEach(([name,href])=>{const a=document.createElement('a');a.href='./'+href;a.textContent=name;a.style.cssText='display:block;color:#c6e5ff;padding:6px;text-decoration:underline';nav.appendChild(a)});
    anchor.addEventListener('click',()=>{nav.hidden=!nav.hidden;anchor.textContent=nav.hidden?'Prévia ▾':'Prévia ▴'});
    document.body.append(nav,anchor);
  });
})();
