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
  let filter='',availabilityFilter='all',chosenId=null,draft=null;
  const ownQty=p=>Math.max(0,Number(data.central[p.id]??0));
  const profile=p=>profiles[p.id]||{description:'',variants:[{color:'Padrão',qty:ownQty(p)}],manufacturing:{materials:'',machine:0,manual:0,notes:''}};
  const field=(id,label,value,extra='')=>`<label for="${id}">${label}<input id="${id}" value="${esc(value)}" ${extra}></label>`;
  const button=(label,action,id='',kind='outline')=>`<button type="button" class="ap-btn ap-btn--${kind}" data-product-action="${action}" data-product-id="${esc(id)}">${label}</button>`;
  function card(p){
    const v=profile(p).variants||[],qty=ownQty(p);
    return `<article class="ap-card">
      <div class="ap-thumbnail" aria-hidden="true">${icon('box')}</div>
      <div class="ap-card-body"><div class="ap-card-header"><div><h3>${esc(p.name)}</h3><p>${esc(p.sku)} · ${esc(p.category||'Sem categoria')}</p></div>
      <span class="ap-tag ${qty===0?'ap-tag--zero':''}">${qty?'Em estoque':'Sem estoque próprio'}</span></div>
      <div class="ap-card-facts"><div><strong>${money(p.prices.retail)}</strong><small>Varejo</small></div><div><strong>${qty}</strong><small>Unidades próprias</small></div></div>
      <p class="ap-subtle">${v.length>1?v.length+' cores / variações':v[0]?.color==='Padrão'?'Sem variações':esc(v[0]?.color||'Sem variações')}</p>
      <div class="ap-card-actions">${button('Ver detalhes','show',p.id)}${button('Editar','edit',p.id,'soft')}</div>
      </div></article>`;
  }
  function filtered(){
    return products.filter(p=>{
      if(filter&&!filterText(p.name+' '+p.sku+' '+p.category).includes(filterText(filter)))return false;
      return availabilityFilter==='all'||(availabilityFilter==='available'&&ownQty(p)>0)||(availabilityFilter==='zero'&&ownQty(p)===0);
    });
  }
  function cards(){
    const rows=filtered();return rows.length?rows.map(card).join(''):
      `<div class="ap-empty"><strong>Nenhum produto encontrado</strong><p>Experimente outra busca ou filtro.</p>${button('Limpar filtros','clear')}</div>`;
  }
  function listView(){
    const total=products.reduce((n,p)=>n+ownQty(p),0),zeros=products.filter(p=>!ownQty(p)).length;
    return {body:`<section class="ap-root">
      <div class="ap-page-heading">${moduleHeading('box','Produtos','Organize o catálogo, os preços e as quantidades em um só lugar.')}
       <div class="ap-primary-actions">${button('+ Novo produto','new','','primary')}</div></div>
      <div class="ap-stats"><div><strong>${products.length}</strong><span>Produtos cadastrados</span></div>
       <div><strong>${total}</strong><span>Unidades próprias na base</span></div><div><strong>${zeros}</strong><span>Sem estoque próprio</span></div></div>
      <div class="ap-tools"><label>Buscar produto<input id="ap-search" type="search" placeholder="Nome, SKU ou categoria" value="${esc(filter)}"></label>
       <label>Disponibilidade<select id="ap-availability">
        <option value="all" ${availabilityFilter==='all'?'selected':''}>Todos os produtos</option>
        <option value="available" ${availabilityFilter==='available'?'selected':''}>Com estoque</option>
        <option value="zero" ${availabilityFilter==='zero'?'selected':''}>Sem estoque</option></select></label></div>
      <div class="ap-list-title"><h2>Catálogo</h2><span id="ap-count">${filtered().length} produtos</span></div>
      <div class="ap-grid" id="ap-cards">${cards()}</div>
     </section>`};
  }
  function detailsView(){
    const p=products.find(x=>x.id===chosenId);if(!p)return listView();
    const meta=profile(p),m=meta.manufacturing||{},v=meta.variants||[];
    return {body:`<section class="ap-root">
      <div>${button('‹ Voltar ao catálogo','back')}</div>
      <div class="ap-page-heading"><div><p class="ap-overline">Ficha do produto</p><h1 tabindex="-1">${esc(p.name)}</h1>
       <p class="ap-muted">${esc(p.sku)} · ${esc(p.category||'Sem categoria')}</p></div>${button('Editar produto','edit',p.id,'primary')}</div>
      <div class="ap-columns">
       <section class="ap-panel"><h2>Informações gerais</h2>
        <div class="ap-image-placeholder" aria-label="Sem foto cadastrada">${icon('box')}<span>Foto do produto</span></div>
        <p class="ap-muted">${esc(meta.description||'Descrição não informada.')}</p>
        <div class="ap-rows"><div>Atacado<strong>${money(p.prices.wholesale)}</strong></div><div>Loja de fábrica<strong>${money(p.prices.factory)}</strong></div><div>Varejo<strong>${money(p.prices.retail)}</strong></div></div>
       </section>
       <section class="ap-panel"><h2>Cores e quantidades</h2>
        <p class="ap-muted">Estoque próprio na base: <strong>${ownQty(p)} un.</strong></p>
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
    draft={name:p?.name||'',sku:p?.sku||'',category:p?.category||'',description:v?.description||'',
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
         <label class="ap-full">Descrição<textarea id="ap-description" rows="3" maxlength="500">${esc(d.description)}</textarea></label>
        </div></section>
        <section class="ap-panel"><div class="ap-section-head"><div><h2>Cores e quantidades</h2>
          <p class="ap-muted">Cada cor tem sua quantidade. Os preços são do produto.</p></div>${button('+ Adicionar cor','add-color')}</div>
          <div class="ap-colors">${d.variants.map((v,i)=>`<div class="ap-color-row">
            ${field('ap-color-'+i,'Cor ou variação',v.color,'maxlength="60" required')}
            ${field('ap-qty-'+i,'Quantidade',v.qty,'type="number" min="0" step="1" max="999999" required')}
            <button class="ap-remove" type="button" data-product-action="remove-color" data-product-id="${i}" ${d.variants.length===1?'disabled':''} aria-label="Remover variação ${i+1}">×</button></div>`).join('')}</div>
          <p class="ap-help">As quantidades desta ficha representam o saldo próprio na base principal.</p>
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
    if(products.some(p=>p.id!==chosenId&&p.sku.toLowerCase()===d.sku.toLowerCase()))return error('Já existe um produto com este SKU.');
    if(!Object.values(d.prices).some(p=>p>0))return error('Informe pelo menos um preço de venda.');
    if(d.variants.some(v=>!v.color||!Number.isInteger(v.qty)||v.qty<0||v.qty>999999))return error('Revise as cores e as quantidades.');
    const names=d.variants.map(v=>filterText(v.color));
    if(new Set(names).size!==names.length)return error('Cada variação precisa ter um nome diferente.');
    let p=products.find(x=>x.id===chosenId);
    if(!p){const last=Math.max(0,...products.map(x=>Number(x.id.slice(1))||0));p={id:'p'+(last+1)};products.push(p);}
    Object.assign(p,{name:d.name,sku:d.sku,category:d.category||'Sem categoria',prices:{...d.prices}});
    profiles[p.id]={description:d.description,variants:d.variants.map(v=>({...v})),manufacturing:{...d.manufacturing}};
    data.central[p.id]=d.variants.reduce((n,v)=>n+v.qty,0);
    productCategories.splice(0,productCategories.length,...new Set(products.map(p=>p.category)));
    try{localStorage.setItem(KEY,JSON.stringify({products:products.map(p=>({...p})),profiles}));}catch{feedback('Não foi possível salvar este catálogo no navegador.');}
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
  moduleNav.innerHTML=`<button type="button" data-product-action="module-products">${icon('box')}<span>Produtos</span></button><button type="button" data-product-action="pdv">${icon('store')}<span>PDV</span></button>`;
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
    if(screen==='entry')$('bottom-nav').hidden=true;
    if(screen==='ap-detail'||screen==='ap-editor'){
      $('bottom-nav').hidden=true;$('event-bar').hidden=true;$('demo-status').hidden=true;
    }
  };
  // Menu principal mobile: painel lateral sobreposto, separado da navegação interna do PDV.
  const moduleDrawer=document.createElement('div');
  moduleDrawer.className='ap-drawer-layer';
  moduleDrawer.hidden=true;
  moduleDrawer.innerHTML=`<div class="ap-drawer-backdrop" data-close-module-drawer></div>
    <aside class="ap-drawer" role="dialog" aria-modal="true" aria-label="Menu principal">
      <div class="ap-drawer-head"><strong>Menu principal</strong><button type="button" class="ap-drawer-close" aria-label="Fechar menu" data-close-module-drawer>${icon('close')}</button></div>
      <nav aria-label="Módulos"><button type="button" data-drawer-screen="global-products">${icon('box')}<span>Produtos</span></button>
      <button type="button" data-drawer-screen="entry">${icon('store')}<span>PDV</span></button></nav>
    </aside>`;
  document.body.appendChild(moduleDrawer);
  let focusBeforeDrawer=null;
  function closeModuleDrawer(){
    if(moduleDrawer.hidden)return;
    moduleDrawer.hidden=true;
    document.body.classList.remove('ap-drawer-open');
    $('back').setAttribute('aria-expanded','false');
    focusBeforeDrawer?.focus({preventScroll:true});
    focusBeforeDrawer=null;
  }
  function openModuleDrawer(){
    if(!window.matchMedia('(max-width:767px)').matches)return;
    focusBeforeDrawer=document.activeElement;
    moduleDrawer.hidden=false;
    document.body.classList.add('ap-drawer-open');
    $('back').setAttribute('aria-expanded','true');
    moduleDrawer.querySelector('.ap-drawer-close').focus({preventScroll:true});
  }
  $('back').removeEventListener('click',globalMenu);
  $('back').setAttribute('aria-controls','ap-mobile-modules');
  moduleDrawer.id='ap-mobile-modules';
  $('back').setAttribute('aria-expanded','false');
  $('back').addEventListener('click',openModuleDrawer);
  moduleDrawer.addEventListener('click',event=>{
    const route=event.target.closest('[data-drawer-screen]');
    if(route){const target=route.dataset.drawerScreen;closeModuleDrawer();go(target);return;}
    if(event.target.closest('[data-close-module-drawer]'))closeModuleDrawer();
  });
  document.addEventListener('keydown',event=>{
    if(moduleDrawer.hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeModuleDrawer();}
    if(event.key==='Tab'){
      const controls=[...moduleDrawer.querySelectorAll('button')];
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  window.matchMedia('(min-width:768px)').addEventListener('change',event=>{if(event.matches)closeModuleDrawer();});
  document.addEventListener('click',event=>{
    const b=event.target.closest('button[data-product-action]');if(!b)return;
    const action=b.dataset.productAction,id=b.dataset.productId||'';
    if(action==='pdv')go('entry');
    if(action==='module-products')go('global-products');
    if(action==='new')startEdit();
    if(action==='show'){chosenId=id;go('ap-detail');}
    if(action==='edit')startEdit(id||chosenId);
    if(action==='back')go('global-products');
    if(action==='cancel'){const goTo=chosenId?'ap-detail':'global-products';draft=null;go(goTo);}
    if(action==='clear'){filter='';availabilityFilter='all';go('global-products');}
    if(action==='add-color'){collect();draft.variants.push({color:'',qty:0});go('ap-editor');}
    if(action==='remove-color'&&draft?.variants.length>1){collect();draft.variants.splice(Number(id),1);go('ap-editor');}
  });
  function updateList(){if($('ap-cards'))$('ap-cards').innerHTML=cards();if($('ap-count'))$('ap-count').textContent=filtered().length+' produtos';}
  document.addEventListener('input',event=>{
    if(event.target.id==='ap-search'){filter=event.target.value;updateList();}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='ap-availability'){availabilityFilter=event.target.value;updateList();}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='ap-product-form'){event.preventDefault();save();}
  });
})();