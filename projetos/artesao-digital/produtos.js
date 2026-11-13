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
  const persistProducts=()=>{try{localStorage.setItem(KEY,JSON.stringify({products:products.map(p=>({...p})),profiles,materialLibrary:techLibrary}));}catch{feedback('Falha ao gravar dados no navegador.');}};
  const getFiltered=()=>products.filter(p=>!p.archived&&(!filter||filterText(p.name+' '+p.sku+' '+p.category).includes(filterText(filter)))&&(originFilter==='all'||originOf(p)===originFilter)&&(categoryFilter==='all'||p.category===categoryFilter));
  const getPage=()=>{const rows=getFiltered();page=Math.min(Math.max(1,page),Math.max(1,Math.ceil(rows.length/pageSize)));return rows.slice((page-1)*pageSize,page*pageSize)};


  const TECH_UNITS={g:['Gramas (g)','mass',1],kg:['Quilos (kg)','mass',1000],ml:['Mililitros (ml)','volume',1],l:['Litros (l)','volume',1000],mm:['Milímetros (mm)','length',.1],cm:['Centímetros (cm)','length',1],m:['Metros (m)','length',100],un:['Unidades','count',1],custom:['Outra unidade','custom',1]};
  const techLibrary=Array.isArray(saved?.materialLibrary)?saved.materialLibrary.filter(m=>m&&m.name):[];
  let techOpen=false;
  const newTechMaterial=()=>({name:'',mode:'quantity',purchaseQuantity:null,purchasePrice:null,purchaseUnit:'kg',customUnit:'',quantity:null,unit:'g',referenceId:null});
  const newTechStep=()=>({machineSeconds:null,humanSeconds:null,materials:[],packaging:0,label:0,packagingMode:'manual',packagingMaterialId:null,packagingQuantity:1});
  const normalizeTech=m=>{
    if(m?.main?.materials)return structuredClone(m);
    const step=newTechStep();
    const machine=Number(m?.machine),manual=Number(m?.manual);
    step.machineSeconds=Number.isFinite(machine)?machine*60:null;
    step.humanSeconds=Number.isFinite(manual)?manual*60:null;
    return {main:step,base:null,legacyText:typeof m?.materials==='string'?m.materials:'',legacyNotes:typeof m?.notes==='string'?m.notes:''};
  };
  const techNumber=v=>v===''||v===undefined||v===null?null:Number(v);
  const techFloat=v=>Number.isFinite(Number(v))?Number(v):0;
  const techBRL=v=>v===null?'Pendente':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
  const techCompatible=(a,b)=>!!TECH_UNITS[a]&&!!TECH_UNITS[b]&&TECH_UNITS[a][1]===TECH_UNITS[b][1];
  const techCost=m=>{
    if(!m.name?.trim())return null;
    if(m.quantity===null||m.quantity===''||!Number.isFinite(Number(m.quantity))||Number(m.quantity)<0)return null;
    if(m.mode==='direct')return Number(m.quantity);
    if(!Number.isFinite(Number(m.purchaseQuantity))||Number(m.purchaseQuantity)<=0||m.purchasePrice===null||!Number.isFinite(Number(m.purchasePrice))||Number(m.purchasePrice)<0)return null;
    if(!techCompatible(m.purchaseUnit,m.unit))return null;
    if(m.purchaseUnit==='custom'&&!m.customUnit?.trim())return null;
    return Number(m.purchasePrice)*Number(m.quantity)*TECH_UNITS[m.unit][2]/(Number(m.purchaseQuantity)*TECH_UNITS[m.purchaseUnit][2]);
  };
  const techStepCost=st=>{
    let sum=0,complete=true;
    for(const m of st.materials||[]){const value=techCost(m);if(value===null)complete=false;else sum+=value;}
    if(st.packagingMode==='registered'){
      const pack=techLibrary.find(m=>String(m.id)===String(st.packagingMaterialId));
      const value=pack?techCost({...pack,quantity:st.packagingQuantity,unit:pack.purchaseUnit}):null;
      if(value===null)complete=false;else sum+=value;
    }else{
      if(st.packaging===null||!Number.isFinite(Number(st.packaging)))complete=false;
      else sum+=Number(st.packaging);
    }
    if(st.label===null||!Number.isFinite(Number(st.label)))complete=false;
    else sum+=Number(st.label);
    return complete?sum:null;
  };
  const techOpts=(values,current)=>values.map(([key,label])=>`<option value="${esc(key)}" ${String(current)===String(key)?'selected':''}>${esc(label)}</option>`).join('');
  const techUnitOpts=(material,used=false)=>techOpts(Object.entries(TECH_UNITS).filter(([key])=>!used||techCompatible(material.purchaseUnit,key)).map(([key,v])=>[key,key==='custom'&&material.customUnit?material.customUnit:v[0]]),used?material.unit:material.purchaseUnit);
  const techDuration=(label,step,key)=>{
    const secs=Number.isFinite(step[key])&&step[key]!==null?Number(step[key]):null;
    const h=secs===null?'':Math.floor(secs/3600),m=secs===null?'':Math.floor(secs%3600/60),x=secs===null?'':secs%60;
    return `<fieldset class="ap-tech-duration" data-tech-duration="${key}"><legend>${label}</legend><div class="ap-tech-three">${[['Horas',h],['Minutos',m],['Segundos',x]].map(([txt,val],i)=>`<label>${txt}<input type="number" data-tech-time="${key}" data-tech-part="${i}" min="0" max="${i===0?999999:59}" step="1" value="${val}"></label>`).join('')}</div></fieldset>`;
  };
  const techMaterialHTML=(mat,index,which)=>{
    const prefix=`${which}-${index}`,registered=!!mat.referenceId,amount=techCost(mat);
    return `<div class="ap-tech-material" data-tech-material="${index}" data-tech-step="${which}">
      <div class="ap-section-head"><h4>Material ${index+1}</h4><button type="button" class="ap-btn" data-tech-action="remove-material" data-tech-step="${which}" data-tech-index="${index}">Remover material</button></div>
      <label>Selecionar material cadastrado<select data-tech-ref="${prefix}">${techOpts([['','Referência do produto / preencher ou selecionar'],...techLibrary.map(m=>[m.id,m.name])],mat.referenceId||'')}</select></label>
      ${registered?`<div class="ap-tech-reference"><strong>Material cadastrado: ${esc(mat.name)}</strong><span>Forma de custo: ${mat.mode==='direct'?'Custo direto em reais':'Preço por quantidade comprada'}</span>${mat.mode==='quantity'?`<span>Referência de compra: ${mat.purchaseQuantity} ${esc(TECH_UNITS[mat.purchaseUnit]?.[0]||mat.customUnit)}</span><span>Preço da referência: ${techBRL(mat.purchasePrice)}</span>`:''}<small>Dados em leitura. A referência é gerenciada no Estoque.</small></div>`:
      `<div class="ap-tech-material-fields"><label>Nome do material<input data-tech-field="name" maxlength="200" value="${esc(mat.name)}" placeholder="Nome do material"></label>
      <label>Forma de custo<select data-tech-field="mode">${techOpts([['quantity','Preço por quantidade comprada'],['direct','Custo direto em reais']],mat.mode)}</select></label>
      ${mat.mode==='quantity'?`<label>Quantidade da compra<input type="number" data-tech-field="purchaseQuantity" min="0.000001" step="any" value="${mat.purchaseQuantity??''}"></label>
      <label>Unidade da compra<select data-tech-field="purchaseUnit">${techUnitOpts(mat)}</select></label>
      ${mat.purchaseUnit==='custom'?`<label>Nome da unidade<input data-tech-field="customUnit" maxlength="40" value="${esc(mat.customUnit)}"></label>`:''}
      <label>Preço pago pela compra (R$)<input type="number" min="0" step="any" data-tech-field="purchasePrice" value="${mat.purchasePrice??''}"></label>`:''}</div>`}
      <div class="ap-tech-material-fields"><label>${mat.mode==='direct'?'Custo utilizado (R$)':'Quantidade utilizada'}<input data-tech-field="quantity" type="number" min="0" step="any" value="${mat.quantity??''}"></label>
      ${mat.mode==='quantity'?`<label>Unidade utilizada<select data-tech-field="unit">${techUnitOpts(mat,true)}</select></label>`:''}</div>
      <p class="ap-tech-cost">${amount===null?'Custo pendente: complete a referência e o consumo.':'Custo utilizado: '+techBRL(amount)}</p>
      </div>`;
  };
  const techStepHTML=(step,which)=>{
    const sub=techStepCost(step),registered=step.packagingMode==='registered';
    return `<div class="ap-tech-step" data-tech-step-container="${which}">
      <h3>${which==='main'?'Produção':'Etapa adicional'}</h3>
      <div class="ap-tech-times">${techDuration('Tempo de máquina',step,'machineSeconds')}${techDuration('Tempo de trabalho humano',step,'humanSeconds')}</div>
      <fieldset class="ap-tech-materials"><legend>Materiais utilizados</legend>
        <div class="ap-tech-material-list">${(step.materials||[]).map((m,i)=>techMaterialHTML(m,i,which)).join('')}</div>
        <button type="button" class="ap-btn ap-btn--soft" data-tech-action="add-material" data-tech-step="${which}">+ Adicionar material</button>
        <p class="ap-help">Materiais novos completos ficam na base ao salvar o produto. Selecionar uma referência não modifica outros produtos.</p>
      </fieldset>
      <fieldset class="ap-tech-packaging"><legend>Embalagem do produto</legend>
        <label>Forma de custo da embalagem<select data-tech-packaging-mode>${techOpts([['manual','Custo manual'],['registered','Material cadastrado']],step.packagingMode||'manual')}</select></label>
        ${registered?`<label>Embalagem cadastrada<select data-tech-packaging-ref>${techOpts([['','Selecione'],...techLibrary.filter(m=>m.mode==='quantity').map(m=>[m.id,m.name])],step.packagingMaterialId||'')}</select></label>
          <label>Quantidade de embalagem por produto<input type="number" min="0.000001" step="any" data-tech-packaging-quantity value="${step.packagingQuantity??1}"></label>`:
          `<label>Embalagem de fabricação (R$)<input type="number" min="0" step="any" data-tech-packaging value="${step.packaging??0}"></label>`}
        <p class="ap-help">Use uma forma de custo, sem duplicar a embalagem entre materiais e custo manual.</p>
      </fieldset>
      <label>Etiqueta (R$)<input type="number" min="0" step="any" data-tech-label value="${step.label??0}"></label>
      <p class="ap-tech-subtotal">${sub===null?'Subtotal de materiais e embalagem pendente':'Materiais, embalagem e etiqueta: '+techBRL(sub)}. O custo total depende dos parâmetros operacionais.</p>
    </div>`;
  };
  const techFormHTML=manufacturing=>{
    const m=manufacturing||normalizeTech(null);
    return `<details class="ap-panel ap-manufacturing ap-technical" ${techOpen?'open':''}>
      <summary><span><strong>Dados de fabricação (ficha técnica)</strong><small>Opcional — conforme o cadastro do Artesão Digital</small></span><span aria-hidden="true">⌄</span></summary>
      <div class="ap-manufacturing-fields">
        ${m.legacyText?`<p class="ap-tech-legacy">Materiais do cadastro anterior preservados: ${esc(m.legacyText)}</p>`:''}
        ${m.legacyNotes?`<p class="ap-tech-legacy">Observações anteriores preservadas: ${esc(m.legacyNotes)}</p>`:''}
        ${techStepHTML(m.main||newTechStep(),'main')}
        <label class="ap-tech-add-step"><input id="ap-tech-add-step" type="checkbox" ${m.base?'checked':''}> Incluir etapa adicional de produção no custo</label>
        ${m.base?techStepHTML(m.base,'base'):''}
        <div class="ap-tech-results"><h3>Resultados calculados</h3>
          <p class="ap-muted">Custos dos materiais são estimados pelas referências informadas. O custo final e os preços sugeridos dependem dos parâmetros de fabricação do sistema real.</p>
          <p class="ap-tech-total">Materiais e embalagem: ${techStepCost(m.main)===null||(m.base&&techStepCost(m.base)===null)?'pendente':techBRL((techStepCost(m.main)||0)+(m.base?techStepCost(m.base)||0:0))}</p>
          <p class="ap-help">Os preços comerciais não são alterados automaticamente.</p>
        </div>
      </div>
    </details>`;
  };
  function collectTech(){
    if(!draft||screen!=='ap-editor')return;
    const m=draft.manufacturing;
    for(const container of document.querySelectorAll('[data-tech-step-container]')){
      const which=container.dataset.techStepContainer,step=m[which];
      if(!step)continue;
      for(const key of ['machineSeconds','humanSeconds']){
        const parts=[...container.querySelectorAll(`[data-tech-time="${key}"]`)].map(n=>n.value);
        step[key]=parts.every(v=>v==='')?null:parts.some((v,i)=>v!==''&&(!Number.isInteger(Number(v))||Number(v)<0||(i>0&&Number(v)>59)))?null:parts.reduce((sum,v,i)=>sum+Number(v||0)*[3600,60,1][i],0);
      }
      for(const row of container.querySelectorAll('[data-tech-material]')){
        const index=Number(row.dataset.techMaterial),mat=step.materials[index];if(!mat)continue;
        if(!mat.referenceId){
          for(const field of row.querySelectorAll('[data-tech-field]')){
            const k=field.dataset.techField;
            mat[k]=['purchaseQuantity','purchasePrice','quantity'].includes(k)?techNumber(field.value):field.value;
          }
        }else{
          const q=row.querySelector('[data-tech-field="quantity"]');if(q)mat.quantity=techNumber(q.value);
          const u=row.querySelector('[data-tech-field="unit"]');if(u)mat.unit=u.value;
        }
      }
      step.packagingMode=container.querySelector('[data-tech-packaging-mode]')?.value||'manual';
      step.packaging=techNumber(container.querySelector('[data-tech-packaging]')?.value??'0');
      step.packagingMaterialId=container.querySelector('[data-tech-packaging-ref]')?.value||null;
      step.packagingQuantity=techNumber(container.querySelector('[data-tech-packaging-quantity]')?.value??'1');
      step.label=techNumber(container.querySelector('[data-tech-label]')?.value??'0');
    }
  }
  function techErrors(m){
    const issues=[];
    for(const which of ['main','base']){
      const st=m[which];if(!st)continue;
      const title=which==='main'?'Produção':'Etapa adicional';
      for(const row of st.materials||[]){
        if(!row.name?.trim()){issues.push(title+': informe o nome de cada material.');continue;}
        if(techCost(row)===null)issues.push(title+': confira a referência e o consumo de '+row.name+'.');
      }
      if(st.packagingMode==='registered'&&!techLibrary.some(x=>String(x.id)===String(st.packagingMaterialId)))issues.push(title+': selecione uma embalagem cadastrada.');
      if(st.packagingMode==='registered'&&(!Number.isFinite(Number(st.packagingQuantity))||Number(st.packagingQuantity)<=0))issues.push(title+': confira a quantidade de embalagem.');
      if(st.packagingMode==='manual'&&(st.packaging===null||!Number.isFinite(Number(st.packaging))||Number(st.packaging)<0))issues.push(title+': confira o custo da embalagem.');
      if(st.label===null||!Number.isFinite(Number(st.label))||Number(st.label)<0)issues.push(title+': confira o custo da etiqueta.');
    }
    return issues;
  }

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
      <section class="ap-panel ap-tech-detail"><h2>Dados de fabricação</h2>
        ${(()=>{const f=normalizeTech(m),main=f.main||newTechStep(),materials=[...(main.materials||[]),...(f.base?.materials||[])];
        return `<div class="ap-rows"><div>Tempo de máquina<strong>${main.machineSeconds===null?'Não informado':Math.floor(main.machineSeconds/3600)+'h '+Math.floor(main.machineSeconds%3600/60)+'min '+main.machineSeconds%60+'s'}</strong></div>
        <div>Tempo de trabalho humano<strong>${main.humanSeconds===null?'Não informado':Math.floor(main.humanSeconds/3600)+'h '+Math.floor(main.humanSeconds%3600/60)+'min '+main.humanSeconds%60+'s'}</strong></div>
        <div>Materiais utilizados<strong>${materials.length} material(is)</strong></div>${materials.map(x=>`<div>${esc(x.name||'Material sem nome')}<strong>${techCost(x)===null?'Custo pendente':techBRL(techCost(x))}</strong></div>`).join('')}
        <div>Etapa adicional<strong>${f.base?'Incluída':'Não incluída'}</strong></div>
        </div>`})()}
        ${m?.legacyText?`<p class="ap-tech-legacy">Materiais anteriores: ${esc(m.legacyText)}</p>`:''}
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
      manufacturing:normalizeTech(v?.manufacturing)};
    techOpen=!!(draft.manufacturing.main.materials?.length||draft.manufacturing.base||draft.manufacturing.legacyText);
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
        ${techFormHTML(d.manufacturing)}
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
    collectTech();
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
    const issue=techErrors(d.manufacturing)[0];if(issue)return error(issue);
    let p=products.find(x=>x.id===chosenId);
    if(!p){const last=Math.max(0,...products.map(x=>Number(x.id.slice(1))||0));p={id:'p'+(last+1)};products.push(p);}
    Object.assign(p,{name:d.name,sku:d.sku,category:d.category||'Sem categoria',origin:d.origin,catalogVisible:d.catalogVisible,relatedParty:d.relatedParty,repasse:d.repasse,prices:{...d.prices}});
    profiles[p.id]={description:d.description,variants:d.variants.map(v=>({...v})),manufacturing:structuredClone(d.manufacturing)};
    for(const step of [d.manufacturing.main,d.manufacturing.base])for(const material of step?.materials||[]){
      if(material.referenceId||!material.name.trim()||techCost(material)===null)continue;
      const savedDefinition={name:material.name,mode:material.mode,purchaseQuantity:material.purchaseQuantity,purchasePrice:material.purchasePrice,purchaseUnit:material.purchaseUnit,customUnit:material.customUnit};
      if(!techLibrary.some(item=>JSON.stringify({name:item.name,mode:item.mode,purchaseQuantity:item.purchaseQuantity,purchasePrice:item.purchasePrice,purchaseUnit:item.purchaseUnit,customUnit:item.customUnit})===JSON.stringify(savedDefinition))){
        techLibrary.push({id:'m'+(techLibrary.length+1),...savedDefinition});
      }
    }
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
    const current=['global-products','ap-detail','ap-editor'].includes(screen)?'module-products':screen==='global-settings'?null:'pdv';
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
    syncHeaderActionState();
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
  function syncHeaderActionState(){
    const settingsButton=document.querySelector('.header-action[data-action="global-settings"]');
    const alertsButton=document.querySelector('.header-action[data-action="notifications"]');
    const inSettings=screen==='global-settings';
    const alertsOpen=dialog.open&&$('dialog-title').textContent==='Alertas';
    for(const [button,active] of [[settingsButton,inSettings],[alertsButton,alertsOpen]]){
      if(!button)continue;
      if(active){button.setAttribute('aria-current','page');button.dataset.active='true';}
      else{button.removeAttribute('aria-current');delete button.dataset.active;}
    }
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('button[data-action="notifications"]')){
      queueMicrotask(syncHeaderActionState);
    }
  });
  dialog.addEventListener('close',syncHeaderActionState);
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