(function produtosAddon(){
  const KEY='artesao-digital-produtos-prototipo-v1';
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}})();
  const profiles=saved?.profiles&&typeof saved.profiles==='object'?saved.profiles:{};
  if(Array.isArray(saved?.products)){
    saved.products.forEach(p=>{
      if(!p||!/^p[0-9]+$/.test(p.id)||typeof p.name!=='string'||!p.prices)return;
      const current=products.find(x=>x.id===p.id);
      if(current)Object.assign(current,p);
      else products.push(p);
    });
    productCategories.splice(0,productCategories.length,...new Set(products.map(p=>p.category)));
  }
  // Exemplos sintéticos para testar SKU idêntico entre origens; não representam clientes reais.
  for(const sample of [
    {id:'p9001',name:'Porta-copos Botânica',sku:'AD-101',category:'Casa',origin:'consigned',relatedParty:'Consignante exemplo',repasse:600,catalogVisible:true,prices:{retail:1400,wholesale:950,factory:1150},variants:[{color:'Verde',qty:8},{color:'Areia',qty:4}]},
    {id:'p9002',name:'Porta-copos Botânica',sku:'AD-101',category:'Casa',origin:'client',relatedParty:'Cliente exemplo',repasse:0,catalogVisible:false,prices:{retail:1400,wholesale:950,factory:1150},variants:[{color:'Azul',qty:5}]}
  ]){
    if(!products.some(p=>p.id===sample.id))products.push({...sample,variants:undefined});
    if(!profiles[sample.id])profiles[sample.id]={description:'Registro fictício de teste.',variants:sample.variants,manufacturing:{materials:'',machine:0,manual:0,notes:''}};
  }
  let filter='',availabilityFilter='all',originFilter='all',categoryFilter='all',page=1,pageSize=Number(localStorage.getItem('ad-products-page-size')||10),bulk=false,selected=new Set(),sheetMode='',chosenId=null,draft=null;
  const ownQty=p=>Math.max(0,Number(data.central[p.id]??0));
  const profile=p=>profiles[p.id]||{description:'',variants:[{color:'Padrão',qty:ownQty(p)}],manufacturing:{materials:'',machine:0,manual:0,notes:''}};
const originOf=p=>p.origin||'own';
  const originNames={own:'Próprio',client:'De cliente',consigned:'Consignado'};
  const productQty=p=>(profile(p).variants||[]).reduce((n,v)=>n+Math.max(0,Number(v.qty)||0),0);
  const persistProducts=()=>{try{localStorage.setItem(KEY,JSON.stringify({products:products.map(p=>({...p})),profiles}));}catch{feedback('Falha ao gravar dados no navegador.');}};
  const getFiltered=()=>products.filter(p=>!p.archived&&(!filter||filterText(p.name+' '+p.sku+' '+p.category).includes(filterText(filter)))&&(originFilter==='all'||originOf(p)===originFilter)&&(categoryFilter==='all'||p.category===categoryFilter));
  const getPage=()=>{const rows=getFiltered();page=Math.min(Math.max(1,page),Math.max(1,Math.ceil(rows.length/pageSize)));return rows.slice((page-1)*pageSize,page*pageSize)};

  const field=(id,label,value,extra='')=>`<label for="${id}">${label}<input id="${id}" value="${esc(value)}" ${extra}></label>`;
  const button=(label,action,id='',kind='outline')=>`<button type="button" class="ap-btn ap-btn--${kind}" data-product-action="${action}" data-product-id="${esc(id)}">${label}</button>`;
  function listView(){
  const all=getFiltered(),visible=getPage(),count=all.length,pages=Math.max(1,Math.ceil(count/pageSize));
  const option=(value,label,current)=>`<option value="${esc(value)}" ${value===current?'selected':''}>${esc(label)}</option>`;
  const categories=[...new Set(products.map(p=>p.category||'Sem categoria'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const selectFilters=(mobile=false)=>`<label>Origem<select id="${mobile?'pl-sheet-origin':'pl-origin'}">${option('all','Todas as origens',originFilter)}${Object.entries(originNames).map(([v,n])=>option(v,n,originFilter)).join('')}</select></label>
  <label>Categoria<select id="${mobile?'pl-sheet-category':'pl-category'}">${option('all','Todas as categorias',categoryFilter)}${categories.map(c=>option(c,c,categoryFilter)).join('')}</select></label>`;
  const bulkTools=()=>`<div class="pl-bulk-tools"><strong>${selected.size} selecionado(s)</strong>
  <button type="button" data-pl-action="page-select">Selecionar página (${visible.length})</button>
  <button type="button" data-pl-action="all-select">Selecionar todos os ${count} resultados</button>
  <button type="button" data-pl-action="clear-select">Limpar seleção</button>
  <div class="pl-bulk-buttons">${[['archive','Arquivar'],['include','Incluir no catálogo'],['remove','Retirar do catálogo'],['private','Tornar privado']].map(([k,v])=>`<button type="button" data-pl-action="${k}" ${selected.size?'':'disabled'}>${v}</button>`).join('')}</div></div>`;
  const row=p=>{
    const qty=productQty(p),origin=originOf(p),vars=profile(p).variants||[];
    return `<article class="pl-row">
      ${bulk?`<label class="pl-rowcheck"><input type="checkbox" data-pl-select="${esc(p.id)}" ${selected.has(p.id)?'checked':''} aria-label="Selecionar ${esc(p.name)}"></label>`:''}
      <span class="pl-image" aria-hidden="true">${icon('box')}</span>
      <div class="pl-name"><strong>${esc(p.name)}</strong><small>${esc(p.sku)}</small>
      <div class="pl-prices"><span><small>Atacado</small>${money(p.prices.wholesale)}</span><span><small>Fábrica</small>${money(p.prices.factory)}</span><span><small>Varejo</small>${money(p.prices.retail)}</span></div></div>
      <span class="pl-category">${esc(p.category||'Sem categoria')}</span>
      <span class="pl-origin pl-origin--${origin}">${originNames[origin]||'Próprio'}</span>
      <div class="pl-stock"><strong class="${qty===0?'pl-zero':''}">${qty}</strong>${vars.length>1?`<small>${vars.length} variações</small>`:''}</div>
      <label class="pl-catalog"><input type="checkbox" data-pl-catalog="${esc(p.id)}" ${p.catalogVisible?'checked':''} aria-label="No catálogo: ${esc(p.name)}"><span>No catálogo</span></label>
      <div class="pl-actions">${button('Editar','edit',p.id)}<button type="button" data-pl-more="${esc(p.id)}" aria-label="Mais ações de ${esc(p.name)}">⋯</button></div>
    </article>`;
  };
  const pager=`<div class="pl-pager"><span>${count?((page-1)*pageSize+1):0}–${Math.min(page*pageSize,count)} de ${count} produtos</span>
  <label>Por página <select id="pl-size">${[10,20,30,40,50].map(n=>option(String(n),String(n),String(pageSize))).join('')}</select></label>
  <div><button type="button" data-pl-page="-1" ${page<=1?'disabled':''}>‹ Anterior</button><span>${page} de ${pages}</span><button type="button" data-pl-page="1" ${page>=pages?'disabled':''}>Próxima ›</button></div></div>`;
  const sheet=sheetMode?`<div class="pl-sheet-layer"><div class="pl-sheet-shade" data-pl-action="close-sheet"></div><section role="dialog" aria-modal="true" aria-label="${sheetMode==='filters'?'Filtros':'Ações em lote'}" class="pl-sheet">
    <header><strong>${sheetMode==='filters'?'Filtros':'Ações em lote'}</strong><button type="button" data-pl-action="close-sheet" aria-label="Fechar painel">×</button></header><div class="pl-sheet-tabs"><button type="button" data-pl-action="filters-sheet" aria-pressed="${sheetMode==='filters'}">☷ Filtros</button><button type="button" data-pl-action="bulk-sheet" aria-pressed="${sheetMode==='bulk'}">☑ Ações em lote</button></div>
    ${sheetMode==='filters'?`<div class="pl-sheet-fields">${selectFilters(true)}<button type="button" data-pl-action="clear-filters">Limpar filtros</button><button type="button" data-pl-action="apply-filters" class="pl-primary">Aplicar filtros</button></div>`:bulkTools()}
    </section></div>`:'';
  return {body:`<section class="ap-root pl-root"><div class="ap-page-heading">
    ${moduleHeading('box','Produtos','Organize o catálogo, os preços, o estoque e a origem dos seus produtos.')}
    <div class="ap-primary-actions">${button('+ Novo produto','new','','primary')}</div></div>
    <div class="pl-toolbar"><label class="pl-search">Buscar produto ou SKU<input id="pl-search" type="search" placeholder="Buscar produto ou SKU" value="${esc(filter)}"></label>
    <div class="pl-filters-desktop">${selectFilters()}</div><button type="button" class="pl-bulk-toggle" data-pl-action="toggle-bulk" aria-expanded="${bulk}">☷ Ações em lote</button></div>
    <div class="pl-mobile-controls"><button type="button" data-pl-action="filters-sheet">☷ Filtros</button><button type="button" data-pl-action="bulk-sheet">☑ Ações em lote</button></div>
    <div class="pl-results-count">${count} produtos encontrados ${originFilter!=='all'||categoryFilter!=='all'?'<button type="button" data-pl-action="clear-filters">Limpar filtros</button>':''}</div>
    ${bulk?`<div class="pl-bulk-desktop">${bulkTools()}</div>`:''}
    <div class="pl-table"><div class="pl-table-head">${bulk?'<span>Selecionar</span>':''}<span>Foto</span><span>Produto e preços</span><span>Categoria</span><span>Origem</span><span>Estoque</span><span>No catálogo</span><span>Ações</span></div>
      <div>${visible.length?visible.map(row).join(''):'<div class="pl-empty">Nenhum produto encontrado.</div>'}</div></div>
    ${pager}${sheet}</section>`};
}
  function detailsView(){
    const p=products.find(x=>x.id===chosenId);if(!p)return listView();
    const meta=profile(p),m=meta.manufacturing||{},v=meta.variants||[];
    return {body:`<section class="ap-root">
      <div>${button('‹ Voltar ao catálogo','back')}</div>
      <div class="ap-page-heading"><div><p class="ap-overline">Ficha do produto</p><h1 tabindex="-1">${esc(p.name)}</h1>
       <p class="ap-muted">${esc(p.sku)} · ${esc(p.category||'Sem categoria')} · ${originNames[originOf(p)]}</p></div>${button('Editar produto','edit',p.id,'primary')}</div>
      <div class="ap-columns">
       <section class="ap-panel"><h2>Informações gerais</h2>
        <div class="ap-image-placeholder" aria-label="Sem foto cadastrada">${icon('box')}<span>Foto do produto</span></div>
        <p class="ap-muted">${esc(meta.description||'Descrição não informada.')}</p>
        <div class="ap-rows"><div>Atacado<strong>${money(p.prices.wholesale)}</strong></div><div>Loja de fábrica<strong>${money(p.prices.factory)}</strong></div><div>Varejo<strong>${money(p.prices.retail)}</strong></div></div>
       </section>
       <section class="ap-panel"><h2>Cores e quantidades</h2>
        <p class="ap-muted">Saldo da origem: <strong>${productQty(p)} un.</strong></p>
        <div class="ap-rows">${v.map(x=>`<div>${esc(x.color)}<strong>${Number(x.qty)||0} un.</strong></div>`).join('')}</div>
        <p class="ap-help">Reservas, lotes e transferências continuam registrados na estrutura operacional existente.</p>
       </section>
      </div>
      <section class="ap-panel"><h2>Dados de fabricação</h2>
       ${m.materials||m.notes||Number(m.machine)||Number(m.manual)?
        `<div class="ap-rows"><div>Materiais<strong>${esc(m.materials||'Não informado')}</strong></div>
        <div>Tempo de máquina<strong>${Number(m.machine)||0} min</strong></div><div>Tempo de trabalho<strong>${Number(m.manual)||0} min</strong></div>
        ${m.notes?`<div>Observações<strong>${esc(m.notes)}</strong></div>`:''}</div>`:
        '<p class="ap-muted">Nenhum dado de fabricação informado. Você pode adicionar depois.</p>'}
      </section>
      <div class="ap-buttons-end">${button('Voltar ao catálogo','back')}${button('Editar produto','edit',p.id,'primary')}</div>
    </section>`};
  }
  function startEdit(id=null){
    const p=id?products.find(x=>x.id===id):null,v=p?profile(p):null;
    chosenId=p?.id||null;
    draft={name:p?.name||'',sku:p?.sku||'',category:p?.category||'',origin:p?.origin||'own',catalogVisible:!!p?.catalogVisible,relatedParty:p?.relatedParty||'',repasse:Number(p?.repasse)||0,description:v?.description||'',
      prices:{retail:p?.prices?.retail||0,wholesale:p?.prices?.wholesale||0,factory:p?.prices?.factory||0},
      variants:v?v.variants.map(x=>({...x})):[{color:'Padrão',qty:0}],
      manufacturing:{materials:v?.manufacturing?.materials||'',machine:v?.manufacturing?.machine||0,manual:v?.manufacturing?.manual||0,notes:v?.manufacturing?.notes||''}};
    go('ap-editor');
  }
  function editorView(){
    if(!draft)return listView();const d=draft;
    return {body:`<section class="ap-root">
      <div>${button('‹ Voltar aos produtos','cancel')}</div>
      <div><p class="ap-overline">Cadastro de produtos</p><h1 tabindex="-1">${chosenId?'Editar produto':'Novo produto'}</h1>
       <p class="ap-muted">A fabricação é opcional. Você pode registrar apenas os dados comerciais.</p></div>
      <form id="ap-product-form" class="ap-form">
        <section class="ap-panel"><h2>Dados do produto</h2><div class="ap-fields">
         ${field('ap-name','Nome do produto *',d.name,'maxlength="120" required')}
         ${field('ap-sku','Código / SKU *',d.sku,'maxlength="60" required')}
         ${field('ap-category','Categoria',d.category,'maxlength="80" placeholder="Ex.: Acessórios"')}
         <label>Origem<select id="ap-origin">
           <option value="own" ${d.origin==='own'?'selected':''}>Próprio</option>
           <option value="client" ${d.origin==='client'?'selected':''}>De cliente</option>
           <option value="consigned" ${d.origin==='consigned'?'selected':''}>Consignado</option>
         </select></label>
         <label class="ap-full" id="ap-related-field" ${d.origin==='own'?'hidden':''}>Cliente / consignante<input id="ap-related" maxlength="120" value="${esc(d.relatedParty)}" placeholder="Identifique o cliente ou consignante"></label>
         <label class="ap-full"><input type="checkbox" id="ap-visible" ${d.catalogVisible?'checked':''}> No catálogo</label>
         <label class="ap-full" id="ap-repasse-field" ${d.origin!=='consigned'?'hidden':''}>Repasse fixo por unidade (R$)<input id="ap-repasse" inputmode="decimal" value="${(d.repasse/100).toFixed(2)}"></label>
         <label class="ap-full">Descrição<textarea id="ap-description" rows="3" maxlength="500">${esc(d.description)}</textarea></label>
        </div></section>
        <section class="ap-panel"><div class="ap-section-head"><div><h2>Cores e quantidades</h2>
          <p class="ap-muted">Cada cor tem sua quantidade. Os preços são do produto.</p></div>${button('+ Adicionar cor','add-color')}</div>
          <div class="ap-colors">${d.variants.map((v,i)=>`<div class="ap-color-row">
            ${field('ap-color-'+i,'Cor ou variação',v.color,'maxlength="60" required')}
            ${field('ap-qty-'+i,'Quantidade',v.qty,'type="number" min="0" step="1" max="999999" required')}
            <button class="ap-remove" type="button" data-product-action="remove-color" data-product-id="${i}" ${d.variants.length===1?'disabled':''} aria-label="Remover variação ${i+1}">×</button></div>`).join('')}</div>
          <p class="ap-help">Quantidades por cor da origem escolhida. Estoque de cliente é reservado; consignado exige controle de fornecedor, lote e repasse na implementação real.</p>
        </section>
        <section class="ap-panel"><h2>Preços de venda</h2><p class="ap-muted">Informe pelo menos uma faixa. A fabricação não altera preços automaticamente.</p>
          <div class="ap-prices">
            ${field('ap-wholesale','Atacado (R$)',(d.prices.wholesale/100).toFixed(2),'inputmode="decimal"')}
            ${field('ap-factory','Loja de fábrica (R$)',(d.prices.factory/100).toFixed(2),'inputmode="decimal"')}
            ${field('ap-retail','Varejo (R$)',(d.prices.retail/100).toFixed(2),'inputmode="decimal"')}
          </div>
        </section>
        <details class="ap-panel ap-manufacturing" ${d.manufacturing.materials||d.manufacturing.notes||Number(d.manufacturing.machine)||Number(d.manufacturing.manual)?'open':''}>
          <summary><span><strong>Dados de fabricação</strong><small>Opcional — preencha quando desejar</small></span><span aria-hidden="true">⌄</span></summary>
          <div class="ap-manufacturing-fields">
            <label>Materiais e insumos<textarea id="ap-materials" rows="3" maxlength="600" placeholder="Materiais utilizados">${esc(d.manufacturing.materials)}</textarea></label>
            <div class="ap-fields">
              ${field('ap-machine','Tempo de máquina (min)',d.manufacturing.machine,'type="number" min="0" step="1"')}
              ${field('ap-manual','Tempo de trabalho (min)',d.manufacturing.manual,'type="number" min="0" step="1"')}
            </div>
            <label>Observações técnicas<textarea id="ap-notes" rows="3" maxlength="600">${esc(d.manufacturing.notes)}</textarea></label>
            <p class="ap-help">O cálculo de custos usará o cadastro de materiais e as regras existentes na implementação futura.</p>
          </div>
        </details>
        <p id="ap-error" class="ap-error" role="alert" hidden></p>
        <div class="ap-buttons-end">${button('Cancelar','cancel')}<button type="submit" class="ap-btn ap-btn--primary">${chosenId?'Salvar alterações':'Cadastrar produto'}</button></div>
      </form>
    </section>`};
  }
  function collect(){
    if(!draft)return;const value=id=>$(id)?.value??'';
    draft.name=value('ap-name').trim();draft.sku=value('ap-sku').trim();
    draft.category=value('ap-category').trim();draft.description=value('ap-description').trim();
    draft.origin=value('ap-origin')||'own';draft.catalogVisible=!!$('ap-visible')?.checked;draft.relatedParty=value('ap-related').trim();draft.repasse=cents(value('ap-repasse'));
    draft.prices={retail:cents(value('ap-retail')),factory:cents(value('ap-factory')),wholesale:cents(value('ap-wholesale'))};
    draft.variants=draft.variants.map((v,i)=>({color:value('ap-color-'+i).trim(),qty:Number(value('ap-qty-'+i))}));
    draft.manufacturing={materials:value('ap-materials').trim(),machine:Number(value('ap-machine'))||0,
      manual:Number(value('ap-manual'))||0,notes:value('ap-notes').trim()};
  }
  function error(message){
    const e=$('ap-error');if(e){e.hidden=false;e.textContent=message;e.scrollIntoView({block:'nearest'});}
  }
  function save(){
    const form=$('ap-product-form');if(!form?.reportValidity())return;
    collect();const d=draft;
    if(products.some(p=>p.id!==chosenId&&p.sku.toLowerCase()===d.sku.toLowerCase()&&(p.origin||'own')===d.origin))return error('Já existe um produto com este SKU e a mesma origem.');
    if(!['own','client','consigned'].includes(d.origin))return error('Escolha uma origem válida.');
    if(d.origin!=='own'&&!d.relatedParty)return error('Informe o cliente ou consignante.');
    if(d.origin==='consigned'&&d.repasse<0)return error('Revise o valor do repasse.');
    if(!Object.values(d.prices).some(p=>p>0))return error('Informe pelo menos um preço de venda.');
    if(d.variants.some(v=>!v.color||!Number.isInteger(v.qty)||v.qty<0||v.qty>999999))return error('Revise as cores e as quantidades.');
    const names=d.variants.map(v=>filterText(v.color));
    if(new Set(names).size!==names.length)return error('Cada variação precisa ter um nome diferente.');
    let p=products.find(x=>x.id===chosenId);
    if(!p){const last=Math.max(0,...products.map(x=>Number(x.id.slice(1))||0));p={id:'p'+(last+1)};products.push(p);}
    Object.assign(p,{name:d.name,sku:d.sku,category:d.category||'Sem categoria',origin:d.origin,catalogVisible:d.catalogVisible,relatedParty:d.relatedParty,repasse:d.repasse,prices:{...d.prices}});
    profiles[p.id]={description:d.description,variants:d.variants.map(v=>({...v})),manufacturing:{...d.manufacturing}};
    data.central[p.id]=d.variants.reduce((n,v)=>n+v.qty,0);
    productCategories.splice(0,productCategories.length,...new Set(products.map(p=>p.category)));
    persistProducts();
    persist();chosenId=p.id;draft=null;go('ap-detail');feedback('Produto salvo.');
  }

  // Reutiliza a navegação e preserva todas as rotas e operações atuais do PDV.
  views['global-products']=listView;
  views['ap-detail']=detailsView;
  views['ap-editor']=editorView;
  const originalGo=go;
  go=function(next){
    closeModuleDrawer();
    if(next==='entry'&&(screen==='login'||screen==='invite'))return originalGo('global-products');
    return originalGo(next);
  };
  // Módulos aprovados: barra abaixo do header no desktop; hambúrguer só no mobile.
  const moduleNav=document.createElement('nav');
  moduleNav.className='ap-module-nav';
  moduleNav.setAttribute('aria-label','Módulos do Artesão Digital');
  moduleNav.innerHTML=`<button type="button" data-product-action="module-products">${icon('box')}<span>Produtos</span></button><button type="button" data-product-action="pdv">${icon('store')}<span>PDV</span></button><button type="button" data-product-action="help">${icon('help')}<span>Ajuda</span></button>`;
  document.querySelector('.top').insertAdjacentElement('afterend',moduleNav);
  function syncModuleNav(){
    const publicScreens=['landing','signup','login','invite','admin-login','admin-home'];
    moduleNav.hidden=publicScreens.includes(screen);
    const current=['global-products','ap-detail','ap-editor'].includes(screen)?'module-products':'pdv';
    moduleNav.querySelectorAll('button').forEach(button=>{
      if(button.dataset.productAction===current)button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
  }
  syncModuleNav();
  const originalRender=render;
  render=function(){
    originalRender();
    syncModuleNav();
    syncPrototypeFooter();
    if(screen==='entry')$('bottom-nav').hidden=true;
    if(screen==='ap-detail'||screen==='ap-editor'){
      $('bottom-nav').hidden=true;$('event-bar').hidden=true;$('demo-status').hidden=true;
    }
  };

  // Navegação principal responsiva: faixa clara sob o cabeçalho, igual à aplicação atual.
  const mobileModuleBar=document.createElement('div');
  mobileModuleBar.className='ap-mobile-menu';
  mobileModuleBar.innerHTML=`<button type="button" class="ap-mobile-menu-toggle" aria-controls="ap-mobile-module-links" aria-expanded="false"><span class="ap-menu-symbol">${icon('menu')}</span><span class="ap-menu-word">Menu</span></button>
    <nav id="ap-mobile-module-links" aria-label="Módulos do Artesão Digital" hidden>
      <button type="button" data-mobile-module="global-products">${icon('box')}<span>Produtos</span></button>
      <button type="button" data-mobile-module="entry">${icon('store')}<span>PDV</span></button>
      <button type="button" data-mobile-module="help">${icon('help')}<span>Ajuda</span></button>
    </nav>`;
  moduleNav.insertAdjacentElement('afterend',mobileModuleBar);
  const toggleModuleMenu=mobileModuleBar.querySelector('.ap-mobile-menu-toggle');
  const moduleLinks=mobileModuleBar.querySelector('nav');
  function closeModuleDrawer(){
    moduleLinks.hidden=true;
    toggleModuleMenu.setAttribute('aria-expanded','false');
    toggleModuleMenu.querySelector('.ap-menu-symbol').innerHTML=icon('menu');
    toggleModuleMenu.querySelector('.ap-menu-word').textContent='Menu';
  }
  function openModuleMenu(){
    moduleLinks.hidden=false;
    toggleModuleMenu.setAttribute('aria-expanded','true');
    toggleModuleMenu.querySelector('.ap-menu-symbol').innerHTML=icon('close');
    toggleModuleMenu.querySelector('.ap-menu-word').textContent='Fechar menu';
  }
  toggleModuleMenu.addEventListener('click',()=>moduleLinks.hidden?openModuleMenu():closeModuleDrawer());
  mobileModuleBar.addEventListener('click',event=>{
    const target=event.target.closest('[data-mobile-module]');
    if(!target)return;
    const route=target.dataset.mobileModule;
    closeModuleDrawer();
    if(route==='help'){showPrototypeHelp();return;}
    go(route);
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!moduleLinks.hidden){closeModuleDrawer();toggleModuleMenu.focus();}});
  window.matchMedia('(min-width:768px)').addEventListener('change',event=>{if(event.matches)closeModuleDrawer();});
  function showPrototypeHelp(){
    modal('Ajuda · Artesão Digital',`<div class="stack"><p>Esta é uma demonstração navegável das telas. A Ajuda completa será integrada ao aplicativo real.</p><p>Use Produtos para consultar e cadastrar. Use PDV para testar o fluxo de venda.</p></div>`);
  }
  function showPrototypeSupport(){
    modal('Suporte técnico · Protótipo',`<div class="stack"><p>O envio de chamados depende da conta autenticada e do servidor real. Esta tela não envia informações.</p><p>O suporte funcional existente será preservado na implementação definitiva.</p></div>`);
  }
  const globalFooter=document.createElement('div');
  globalFooter.id='ap-global-footer';
  globalFooter.className='ap-internal-footer';
  footer.insertAdjacentElement('afterend',globalFooter);
  const internalFoot=`<nav class="ap-internal-footer-links" aria-label="Links do rodapé">
    <button type="button" data-prototype-footer="support">Suporte técnico</button>
    <button type="button" data-prototype-footer="help">Ajuda</button>
    <a href="https://artesaodigital.com.br/artesaos-piloto/legal" target="_blank" rel="noopener noreferrer">Termos e Política de Privacidade</a>
  </nav><small class="ap-footer-version">Artesão Digital · protótipo navegável</small>`;
  function syncPrototypeFooter(){
    const publicScreens=['landing','signup','login','invite','admin-login'];
    const isPublic=publicScreens.includes(screen);
    const isAdmin=screen==='admin-home';
    const isInternal=!isPublic&&!isAdmin;
    mobileModuleBar.hidden=!isInternal;
    if(!isInternal)closeModuleDrawer();
    globalFooter.hidden=!isInternal;
    if(isInternal)globalFooter.innerHTML=internalFoot;
  }
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-prototype-footer]')?.dataset.prototypeFooter;
    if(action==='help')showPrototypeHelp();
    if(action==='support')showPrototypeSupport();
  });
  document.addEventListener('click',event=>{
    const b=event.target.closest('button[data-product-action]');if(!b)return;
    const action=b.dataset.productAction,id=b.dataset.productId||'';
    if(action==='pdv')go('entry');
    if(action==='module-products')go('global-products');
    if(action==='help')showPrototypeHelp();
    if(action==='new')startEdit();
    if(action==='show'){chosenId=id;go('ap-detail');}
    if(action==='edit')startEdit(id||chosenId);
    if(action==='back')go('global-products');
    if(action==='cancel'){const goTo=chosenId?'ap-detail':'global-products';draft=null;go(goTo);}
    if(action==='clear'){filter='';availabilityFilter='all';go('global-products');}
    if(action==='add-color'){collect();draft.variants.push({color:'',qty:0});go('ap-editor');}
    if(action==='remove-color'&&draft?.variants.length>1){collect();draft.variants.splice(Number(id),1);go('ap-editor');}
  });
  document.addEventListener('click',function plClick(event){
  const bt=event.target.closest('[data-pl-action],[data-pl-more],[data-pl-page],[data-pl-archive]');
  if(!bt)return;
  if(bt.dataset.plArchive){const p=products.find(p=>p.id===bt.dataset.plArchive);if(p&&confirm('Arquivar '+p.name+'? O histórico será preservado.')){p.archived=true;selected.delete(p.id);persistProducts();dialog.close();render();}return;}
  if(bt.dataset.plPage){page+=Number(bt.dataset.plPage);render();return;}
  if(bt.dataset.plMore){const p=products.find(p=>p.id===bt.dataset.plMore);if(p)modal('Ações · '+p.name,`<div class="stack"><button type="button" class="ap-btn" data-product-action="show" data-product-id="${esc(p.id)}">Ver detalhes</button><button type="button" class="ap-btn" data-product-action="edit" data-product-id="${esc(p.id)}">Editar</button><button type="button" class="ap-btn" data-pl-archive="${esc(p.id)}">Arquivar</button></div>`);return;}
  const action=bt.dataset.plAction;
  if(action==='toggle-bulk'){bulk=!bulk;selected.clear();render();return;}
  if(action==='filters-sheet'){sheetMode=sheetMode==='filters'?'':'filters';render();return;}
  if(action==='bulk-sheet'){sheetMode=sheetMode==='bulk'?'':'bulk';bulk=!!sheetMode;render();return;}
  if(action==='close-sheet'){sheetMode='';render();return;}
  if(action==='apply-filters'){sheetMode='';page=1;render();return;}
  if(action==='clear-filters'){filter='';originFilter='all';categoryFilter='all';page=1;sheetMode='';render();return;}
  if(action==='page-select'){getPage().forEach(p=>selected.add(p.id));render();return;}
  if(action==='all-select'){getFiltered().forEach(p=>selected.add(p.id));render();return;}
  if(action==='clear-select'){selected.clear();render();return;}
  if(['archive','include','remove','private'].includes(action)){
    const rows=products.filter(p=>selected.has(p.id));
    if(!rows.length)return;
    const label={archive:'Arquivar',include:'Incluir no catálogo',remove:'Retirar do catálogo',private:'Tornar privados'}[action];
    if(!confirm(label+' '+rows.length+' produto(s)?'))return;
    for(const p of rows){
      if(action==='archive')p.archived=true;
      if(action==='include')p.catalogVisible=true;
      if(action==='remove')p.catalogVisible=false;
      if(action==='private')p.publicAuthorized=false;
    }
    selected.clear();persistProducts();render();feedback('Ação aplicada no protótipo.');return;
  }
});
  document.addEventListener('change',function plChange(event){
  const e=event.target;
  if(e.id==='ap-origin'){const o=e.value;$('ap-related-field').hidden=o==='own';$('ap-repasse-field').hidden=o!=='consigned';return;}
  if(e.id==='pl-origin'||e.id==='pl-sheet-origin'){originFilter=e.value;page=1;render();return;}
  if(e.id==='pl-category'||e.id==='pl-sheet-category'){categoryFilter=e.value;page=1;render();return;}
  if(e.id==='pl-size'){pageSize=Number(e.value)||10;localStorage.setItem('ad-products-page-size',String(pageSize));page=1;render();return;}
  if(e.dataset.plSelect){if(e.checked)selected.add(e.dataset.plSelect);else selected.delete(e.dataset.plSelect);render();return;}
  if(e.dataset.plCatalog){const p=products.find(p=>p.id===e.dataset.plCatalog);if(p){p.catalogVisible=e.checked;persistProducts();render();}return;}
});
  document.addEventListener('input',function plInput(event){
  if(event.target.id!=='pl-search')return;
  const index=event.target.selectionStart;filter=event.target.value;page=1;render();
  const el=document.getElementById('pl-search');el?.focus({preventScroll:true});try{el?.setSelectionRange(index,index)}catch{}
});
  function updateList(){render();}
  document.addEventListener('input',event=>{
    if(event.target.id==='ap-search'){filter=event.target.value;updateList();}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='ap-availability'){availabilityFilter=event.target.value;updateList();}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='ap-product-form'){event.preventDefault();save();}
  });
  render();
})();