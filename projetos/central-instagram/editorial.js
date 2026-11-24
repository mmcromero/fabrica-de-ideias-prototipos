/* Central Instagram: Editorial persistente, mesma sessão administrativa. */
(() => {
  'use strict';
  const UI=window.CentralUI;
  const MAX_UPLOAD = 25 * 1024 * 1024;
  const FORMATS = {feed:'Publicação',carousel:'Carrossel',story:'Story',reel:'Reel'};
  const STATUS = {draft:'Aguardando aprovação',approved:'Aprovada',scheduled:'Agendada',leased:'Em processamento',publishing:'Publicando',published:'Publicada',failed:'Envio interrompido',needs_review:'Verificar resultado'};
  const state = {
    view:'overview', posts:[], media:[], currentPostId:null, currentPostVersion:null, currentMediaIds:[],
    pickerIds:[], month:new Date(), pendingSchedule:null, toastTimer:null,
    currentSlideCaptions:{}, currentPreviewIndex:0, modalPostId:null, modalPreviewIndex:0,
    publication:{}, history:{status:'idle'}, accountUsername:'', pendingPublish:null, busy:false,actionPending:false,
    dataFingerprint:null,refreshPending:null,uploadLabel:'',editorPreviewKey:null,pendingDelete:null,storyTimer:null
  };
  let editorClean='';
  const viewScroll=new Map(),expandedPosts=new Set();
  const $ = id => document.getElementById(id);
  const all = selector => [...document.querySelectorAll(selector)];
  const escapeName = value => String(value || '').trim();
  const friendlyDate = epoch => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(epoch));
  const formatMonth = d => new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC',month:'long',year:'numeric'}).format(d);
  const previewUrl = item => item ? item.url : '';
  const formatLabel = value => FORMATS[value] || 'Publicação';
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  const clear = node => {UI.releaseMedia(node);node.replaceChildren();};
  const actionLabels={upload:'Enviando mídia…',draft:'Salvando rascunho…',approve:'Aprovando conteúdo…',
    schedule:'Confirmando agendamento…',cancel:'Cancelando agendamento…',check:'Verificando publicação…',
    publish:'Preparando publicação…',activate:'Confirmando envio agendado…',reset:'Liberando conteúdo para edição…',
    reconcile:'Verificando o resultado…',retry:'Conferindo nova tentativa…',
    delete_post:'Excluindo publicação local…',delete_remote:'Excluindo no Instagram…',delete_media:'Excluindo mídia…',metrics:'Consultando curtidas e comentários…',
    history_start:'Iniciando sincronização…',history_cancel:'Solicitando cancelamento…'};

let demoAccount='atelier_demo',demoSerial=20;
const demoAccounts=[{name:'Ateliê Exemplo',user:'atelier_demo'},{name:'Loja Exemplo',user:'loja_demo'}];
const stores={};
function demoStore(){if(!stores[demoAccount]){const media=[{id:'m1',name:'Coleção de exemplo.png',type:'image/png',url:'./midia-1.svg',size:24576},{id:'m2',name:'Novidades.png',type:'image/png',url:'./midia-2.svg',size:18432},{id:'m3',name:'Detalhes.png',type:'image/png',url:'./midia-3.svg',size:12288}];const make=(id,caption,status,mediaIds,extra={})=>({id,caption,status,mediaIds,format:mediaIds.length>1?'carousel':'feed',captionMode:'general',slideCaptions:mediaIds.map(()=>''),version:1,revision:1,approvedRevision:status==='draft'?null:1,...extra});stores[demoAccount]={media,posts:[make('p1','Conheça nossa coleção de exemplo','draft',['m1']),make('p2','Novidades da semana','approved',['m2']),make('p3','Confira os detalhes','scheduled',['m1','m3'],{scheduledAt:Date.now()+86400000,publishAuthorized:false}),make('p4','Uma criação especial','published',['m3'],{publishedAt:Date.now()-86400000,remoteId:'DEMO-P4',metrics:{status:'ready',likes:42,comments:5,checkedAt:Date.now(),extra:{shares:3,saves:8}}})],history:{status:'idle'},messages:[{name:'Contato exemplo A',text:'Olá! Gostaria de conhecer os produtos.',origin:'Webhook',status:'pending'},{name:'Contato exemplo B',text:'Qual é o prazo de entrega?',origin:'Consulta manual à Meta',status:'bot'}]};}return stores[demoAccount]}
async function api(path,{action,data={},file}={}){const d=demoStore();if(!action&&path==='state')return {posts:d.posts.map(p=>({...p})),media:d.media.map(m=>({...m,usageCount:d.posts.filter(p=>p.mediaIds.includes(m.id)).length})),history:d.history,publication:{},accountUsername:demoAccount,instagramAccountId:'DEMO-'+demoAccount};const p=d.posts.find(x=>x.id===path.split('/')[1]);if(action==='draft'){const old=d.posts.find(x=>x.id===data.id);const next={...data,id:old?.id||'p'+(++demoSerial),version:(old?.version||0)+1,revision:(old?.revision||0)+1,status:'draft',approvedRevision:null};if(old)d.posts.splice(d.posts.indexOf(old),1,next);else d.posts.unshift(next);return {id:next.id}}if(action==='upload'){const id='m'+(++demoSerial);d.media.push({id,name:file.name,type:file.type,url:URL.createObjectURL(file),size:file.size});return {id}}if(action==='history_start'||action==='history_cancel'){d.history={status:'idle',message:action==='history_start'?'Sincronização simulada: histórico fictício disponível.':'Simulação cancelada.',checkedAt:Date.now()};return {}}if(action==='delete_media'){if(d.posts.some(x=>x.mediaIds.includes(data.mediaId)))throw Error('Mídia em uso.');d.media=d.media.filter(x=>x.id!==data.mediaId);return {deleted:true}}if(!p)throw Error('Registro demonstrativo inexistente.');switch(action){case 'approve':p.status='approved';p.approvedRevision=p.revision;break;case 'schedule':if(p.status!=='approved')throw Error('Aprove antes de agendar.');p.status='scheduled';p.scheduledAt=Date.parse(data.localTime+'-03:00');p.publishAuthorized=false;break;case 'cancel':p.status='approved';p.scheduledAt=null;p.publishAuthorized=false;break;case 'activate':p.publishAuthorized=true;break;case 'publish':p.status='published';p.publishedAt=Date.now();p.remoteId='DEMO-'+p.id;p.publicationMessage='Publicação simulada. Nada enviado ao Instagram.';break;case 'metrics':p.metrics={status:'ready',likes:42,comments:5,checkedAt:Date.now(),extra:{shares:3,saves:8}};return {metrics:p.metrics};case 'delete_post':case 'delete_remote':d.posts=d.posts.filter(x=>x!==p);return {deleted:true,deletedMedia:0,freedBytes:0};case 'reset':case 'reconcile':case 'retry':p.status='draft';break;default:throw Error('Ação indisponível na demonstração.')}p.version++;return {ok:true}}
  async function refresh(fresh=false) {
    if(state.refreshPending){
      if(!fresh)return state.refreshPending;
      try{await state.refreshPending;}catch(_){ /* fetch a fresh state after a mutation */ }
    }
    state.refreshPending=(async()=>{
    const result = await api('state');
    state.history=result.history || {status:'idle'};renderHistoryProgress();
    state.publication=result.publication || {};state.accountUsername=result.accountUsername || '';state.instagramAccountId=result.instagramAccountId || '';
    all('[data-preview-account]').forEach(node=>node.textContent=state.accountUsername);
    all('.phone-top .avatar').forEach(node=>node.textContent=state.accountUsername.slice(0,2).toUpperCase());
    const fingerprint=JSON.stringify([result.posts,result.media]);
    if(fingerprint!==state.dataFingerprint){
      state.posts=result.posts;state.media=result.media;state.dataFingerprint=fingerprint;render();
    }
    })();
    try{return await state.refreshPending;}finally{state.refreshPending=null;}
  }
  function toast(message, kind='success') {
    $('toast').textContent = message;
    $('toast').classList.toggle('error',kind==='error');
    $('toast').classList.add('visible');
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(()=>$('toast').classList.remove('visible'),3800);
  }
  function clearOperationFeedback(id) {
    const target=$(id);
    if(!target)return;
    target.textContent='';
    target.setAttribute('role','status');
    target.setAttribute('aria-live','polite');
  }
  function actionErrorFeedback(id,error) {
    const target=$(id);
    if(!target)return;
    const sessionEnded=error?.status===403;
    target.textContent=sessionEnded
      ? 'Não foi possível confirmar a operação. Verifique sua sessão e entre novamente se necessário.'
      : 'Não foi possível confirmar a operação. O resultado do salvamento é desconhecido. '
        +'Atualize a página e confira os dados antes de tentar novamente.';
    target.setAttribute('role','alert');
    target.setAttribute('aria-live','assertive');
    target.scrollIntoView({block:'nearest'});
  }
  function clearDraftFeedback() {
    const feedback=$('form-feedback');
    feedback.textContent='';
    feedback.setAttribute('role','status');
    feedback.setAttribute('aria-live','polite');
    feedback.removeAttribute('tabindex');
  }
  function draftConflictFeedback() {
    const feedback=$('form-feedback');
    feedback.textContent='Não foi salvo: esta publicação foi alterada em outra aba. '
      +'Seu texto continua neste formulário, mas não foi gravado. '
      +'Copie o texto se precisar e abra a publicação novamente em Revisão e envios → Editar para usar a versão atual.';
    feedback.setAttribute('role','alert');
    feedback.setAttribute('aria-live','assertive');
    feedback.tabIndex=-1;
    feedback.focus({preventScroll:true});
    feedback.scrollIntoView({block:'nearest'});
    toast('Salvamento recusado: outra aba alterou esta publicação.','error');
  }
  function show(view, {fromHistory=false}={}) {
    if (!['overview','library','editor','approval','calendar','history','messages','settings'].includes(view)) return;
    if(state.view!==view)viewScroll.set(state.view,window.scrollY);
    state.view = view;
    document.body.dataset.editorView=view;
    // Ações globais são contextuais: não aparecem em Atendimento, Gestão ou no próprio editor.
    const contextActions=document.querySelector('.ui-context-actions');
    if(contextActions) contextActions.hidden=view!=='overview';
    $('resume-editor').hidden=view==='editor' || editorSignature()===editorClean;
    const panels=all('[data-panel]');
    UI.switchPanel(panels,$('view-'+view)).then(()=>{if(state.view===view)window.scrollTo({top:viewScroll.get(view)||0});});UI.closeMenu();
    all('[data-view]').forEach(node=>{
      const primary=node.dataset.primary;
      const active=primary
        ? (primary==='editorial'?['overview','calendar','editor','library','approval','history'].includes(view):primary==='inbox'?view==='messages':view==='settings')
        : node.dataset.view===view;
      node.classList.toggle('active',active);
      if(active)node.setAttribute('aria-current','page');else node.removeAttribute('aria-current');
      if(node.matches('.ui-tab'))node.setAttribute('aria-selected',String(active));
    });
    const tabsets=all('[data-tabset]');
    const editorialView=['overview','calendar','editor','library','approval','history'].includes(view);
    tabsets.forEach(set=>{set.hidden=(set.dataset.tabset==='editorial'?!editorialView:view!=='settings');});
    if(view==='settings')UI.tabs.select('demo-settings',document.querySelector('[data-ui-tab][aria-selected="true"]')?.dataset.uiTab||'connection');
    all('[data-setting-tab]').forEach(node=>node.classList.toggle('active',node.dataset.settingTab===(document.querySelector('#demo-settings [data-ui-pane]:not([hidden])')?.dataset.uiPane||'connection'));
    const accountHandle=$('settings-account-handle');if(accountHandle)accountHandle.textContent='@'+demoAccount;
    $('current-section').textContent = ({overview:'Visão geral',library:'Biblioteca',editor:state.currentPostId?'Editar publicação':'Criar publicação',approval:'Revisão e envios',calendar:'Calendário',history:'Histórico',messages:'Caixa de entrada',settings:'Configurações Meta'})[view];
    if(!fromHistory && location.hash!=='#'+view)history.pushState(null,'','#'+view);
    render();
  }
  function formatHint() {
    const fmt = $('post-format').value;
    $('selection-hint').textContent=({
      feed:'De 1 a 20 imagens JPG ou PNG, entre 4:5 e 1,91:1; 2 ou mais formam um carrossel. A imagem para envio deve ter até 8 MB. PNG é enviado como JPEG, com fundo branco na transparência.',
      story:'Uma imagem ou MP4 de 3 a 60 segundos. Inclua o texto na própria mídia; deixe a legenda vazia. Requer conta Empresa.',
      reel:'Um MP4 de 3 segundos a 15 minutos. Limite de upload da Central: 25 MiB.'
    })[fmt] || 'Selecione uma mídia.';
  }
  function selectedMedia() {
    return state.currentMediaIds.map(id=>state.media.find(m=>m.id===id)).filter(Boolean);
  }
  function editorSignature(){
    return JSON.stringify([$('post-format').value,$('post-caption').value,captionMode(),
      state.currentMediaIds,state.currentMediaIds.map(id=>state.currentSlideCaptions[id] || '')]);
  }
  function mediaValid(format, items) {
    if (format === 'carousel') return items.length >= 2 && items.length <= 20 && items.every(m=>m.type.startsWith('image/'));
    if (format === 'feed') return items.length === 1 && items[0].type.startsWith('image/');
    if (format === 'reel') return items.length === 1 && items[0].type === 'video/mp4';
    return format === 'story' && items.length === 1;
  }
  function newDraft(format='feed') {
    if(state.actionPending || state.busy)return UI.announce('Aguarde a conclusão da operação atual.');
    if(!UI.dirty.confirmLeave())return;
    state.currentPostId=null;
    state.currentPostVersion=null;
    state.currentMediaIds=[];
    state.currentSlideCaptions={};
    state.currentPreviewIndex=0;
    state.editorPreviewKey=null;
    document.querySelector('input[name="caption-mode"][value="general"]').checked=true;
    $('post-format').value=format === 'carousel' ? 'feed' : (FORMATS[format] ? format : 'feed');
    $('post-caption').value='';
    $('editor-heading').textContent='Nova publicação';
    clearDraftFeedback();
    formatHint();
    renderSelection();
    editorClean=editorSignature();UI.tabs.select('editor-preview','content');
    show('editor');
  }
  function loadDraft(id) {
    const post=state.posts.find(p=>p.id===id);
    if (!post) return toast('Publicação não encontrada.');
    if(!['draft','approved','scheduled'].includes(post.status))return toast('Conteúdo bloqueado para revisão.');
    if(!UI.dirty.confirmLeave())return;
    state.currentPostId=id;
    state.editorPreviewKey=null;
    state.currentPostVersion=post.version;
    state.currentMediaIds=[...post.mediaIds];
    state.currentSlideCaptions={};
    post.mediaIds.forEach((id,i)=>{state.currentSlideCaptions[id]=post.slideCaptions?.[i] || '';});
    state.currentPreviewIndex=0;
    const mode=post.captionMode==='per_slide' ? 'per_slide' : 'general';
    document.querySelector('input[name="caption-mode"][value="'+mode+'"]').checked=true;
    $('post-format').value=post.format==='carousel' ? 'feed' : post.format;
    $('post-caption').value=post.caption;
    $('editor-heading').textContent='Editar publicação';
    clearDraftFeedback();
    formatHint();
    renderSelection();
    editorClean=editorSignature();UI.tabs.select('editor-preview','content');
    show('editor');
  }
  function render() {
    $('count-all').textContent=state.posts.length;
    $('count-draft').textContent=state.posts.filter(p=>p.status==='draft').length;
    $('count-approved').textContent=state.posts.filter(p=>p.status==='approved').length;
    $('count-scheduled').textContent=state.posts.filter(p=>p.status==='scheduled').length;
    if(state.view==='overview')renderUpcoming();
    else if(state.view==='library')renderLibrary();
    else if(state.view==='approval')renderApprovals();
    else if(state.view==='calendar')renderCalendar();
    else if(state.view==='history')renderHistory();
    else if(state.view==='editor')renderSelection();else if(['messages','settings'].includes(state.view))renderDemoViews();
  }
  function empty(target,message) { clear(target); target.append(el('div','empty',message)); }
  function badge(status) { return el('span','chip '+status,STATUS[status] || 'Revisão necessária'); }
  function calendarTime(post) { return post.status==='published' ? post.publishedAt : post.scheduledAt || post.pendingScheduledAt || null; }
  function pendingApproval(post) { return post.status==='draft' && !!post.pendingScheduledAt; }
  function expiredReservation(post) {
    return post.status==='approved' && !!post.pendingScheduledAt &&
      post.pendingScheduledAt<=Date.now();
  }
  function postText(post) {
    const caption=typeof post.remoteDetails?.caption==='string'?post.remoteDetails.caption:post.caption;
    return caption?.trim() || post.slideCaptions?.find(t=>t.trim())?.trim() || '';
  }
  function postRow(post, options={}) {
    const row=el('article','item');
    const details=el('details','post-details');details.open=expandedPosts.has(post.id);
    details.append(el('summary','',post.status==='published'?'Detalhes e mais métricas':'Ver detalhes da publicação'));
    const full=el('div','post-details-content');
    full.append(el('p','post-full-caption',postText(post) || 'Publicação sem legenda'));
    if(post.remoteDetails?.seenAt)full.append(el('small','','Consultada na Meta: '+friendlyDate(post.remoteDetails.seenAt)));
    details.append(full);
    details.addEventListener('toggle',()=>{if(details.isConnected){if(details.open)expandedPosts.add(post.id);else expandedPosts.delete(post.id);}});
    if(pendingApproval(post))row.classList.add('pending-review');
    else if(expiredReservation(post))row.classList.add('expired-reservation');
    const preview=el('button','post-preview-trigger');
    preview.type='button';
    preview.setAttribute('aria-label','Visualizar publicação: '+(postText(post).slice(0,60)||formatLabel(post.format)));
    preview.addEventListener('click',()=>openPostPreview(post.id));
    const first=state.media.find(m=>m.id===post.mediaIds?.[0]);
    const thumb=el('span','post-preview-thumb');
    if(first) {
      const media=el(first.type.startsWith('image/')?'img':'video');
      UI.media(media,previewUrl(first),thumb);
      if(media.tagName==='IMG')media.alt='Miniatura da publicação';
      else{media.muted=true;media.playsInline=true;}
      thumb.append(media);
    } else thumb.append(el('span','post-thumb-fallback','Sem imagem'));
    const content=el('span','item-content');
    const text=postText(post);
    const title=text.split(/\n/)[0].trim().slice(0,62) || 'Publicação sem legenda';
    content.append(el('strong','post-title',title));
    content.append(el('span','post-open-hint','Abrir conteúdo completo'));
    const date=calendarTime(post);
    content.append(el('small','post-kind',formatLabel(post.format)+(date ? ' · '+friendlyDate(date) : '')));
    if(post.source==='instagram')content.append(el('small','history-origin','Importada do Instagram · somente histórico'));
    (post.remoteDetails?.mediaWarnings || []).forEach(warning=>content.append(el('small','metrics-error',warning)));
    if(pendingApproval(post)){
      content.append(el('span','chip awaiting-review','Aguardando nova aprovação'));
    }else if(expiredReservation(post)){
      content.append(el('span','chip expired-review','Horário expirado · Reagende'));
    }else{
      content.append(post.status==='scheduled' && !post.publishAuthorized
        ? el('span','chip awaiting-review','Confirme o envio deste agendamento') : badge(post.status));
    }
    if(post.publicationMessage)content.append(el('small','publication-error',post.publicationMessage));
    if(post.status==='publishing'){
      const progress=el('span','ui-job-progress');
      const label=({create:'Preparando mídias para o Instagram…',poll:'A Meta está processando a mídia…',ready:'Mídia pronta. Preparando o envio…',confirm:'Conferindo o resultado na Meta…'})[post.publicationPhase] || 'Preparando a publicação…';
      progress.append(el('span','',label));const track=el('span','ui-progress');track.dataset.indeterminate='true';
      track.setAttribute('role','progressbar');track.setAttribute('aria-label',label);track.append(el('span','ui-progress-fill'));progress.append(track);content.append(progress);
    }
    preview.append(thumb,content);
    row.append(preview);
    const actions=el('div','item-actions');
    const edit=el('button','btn quiet','Editar');edit.type='button';edit.disabled=!['draft','approved','scheduled'].includes(post.status);edit.addEventListener('click',()=>loadDraft(post.id));actions.append(edit);
    if(options.approval && post.status==='draft'){
      const approve=el('button','btn primary','Aprovar');approve.type='button';
      approve.addEventListener('click',()=>guard(()=>approvePost(post.id)));actions.append(approve);
    }
    if(options.approval && post.status==='approved'){
      const schedule=el('button','btn primary','Agendar');schedule.type='button';
      schedule.addEventListener('click',()=>schedulePost(post.id));actions.append(schedule);
      const publish=el('button','btn primary','Publicar agora');publish.type='button';
      publish.addEventListener('click',()=>confirmPublication(post,'publish'));actions.append(publish);
    }
    if(options.approval && post.status==='scheduled'){
      const cancel=el('button','btn quiet','Cancelar agenda');cancel.type='button';
      cancel.addEventListener('click',()=>guard(()=>cancelSchedule(post.id)));actions.append(cancel);
    }
    if(post.status==='scheduled' && !post.publishAuthorized){
      const activate=el('button','btn primary','Confirmar envio agendado');activate.type='button';
      activate.addEventListener('click',()=>confirmPublication(post,'activate'));actions.append(activate);
    }
    if(['failed','needs_review'].includes(post.status)){
      const recover=el('button','btn quiet',post.publicationAttempted?'Verificar resultado':'Voltar ao rascunho');recover.type='button';
      recover.addEventListener('click',()=>guard(()=>recoverPost(post,post.publicationAttempted?'reconcile':'reset')));actions.append(recover);
      if(post.publicationAttempted){
        const retry=el('button','btn quiet','Liberar nova tentativa');retry.type='button';
        retry.addEventListener('click',()=>guard(()=>recoverPost(post,'retry')));actions.append(retry);
      }
    }
    if(post.status==='published'){
      if(post.remoteDeletion && ['issued','unknown','confirmed'].includes(post.remoteDeletion.status))
        row.append(el('p','feedback',post.remoteDeletion.status==='confirmed'?'Excluída no Instagram; limpeza local pendente.':'Exclusão no Instagram: resultado pendente de confirmação.'));
      const metrics=post.metrics || {};
      const brief=el('div','post-metrics post-metrics-brief');brief.dataset.status=metrics.status || 'not_checked';
      const numbers=el('div','post-metrics');
      numbers.setAttribute('role','group');numbers.setAttribute('aria-label','Curtidas e comentários desta publicação');
      const count=value=>typeof value==='number'?new Intl.NumberFormat('pt-BR').format(value):(metrics.checkedAt?'Não informado':'—');
      brief.append(el('span','metric-likes','Curtidas: '+count(metrics.likes)),el('span','metric-comments','Comentários: '+count(metrics.comments)));
      const extra=metrics.extra || {};
      numbers.append(el('span','metric-shares','Compartilhamentos: '+(typeof extra.shares==='number'?new Intl.NumberFormat('pt-BR').format(extra.shares):'Não informado')),
        el('span','metric-saves','Salvamentos: '+(typeof extra.saves==='number'?new Intl.NumberFormat('pt-BR').format(extra.saves):'Não informado')));
      if(metrics.extraCheckedAt)numbers.append(el('small','','Compartilhamentos/salvamentos consultados em '+friendlyDate(metrics.extraCheckedAt)));
      if(metrics.extraError)numbers.append(el('small','metrics-note',metrics.extraError));
      numbers.append(el('small','metrics-time',metrics.checkedAt?'Última consulta confirmada: '+friendlyDate(metrics.checkedAt):'Ainda não consultado na Meta.'));
      if(metrics.status==='error')brief.append(el('small','metrics-error',metrics.error));
      else if(metrics.status==='ready' && (metrics.likes===null || metrics.comments===null))numbers.append(el('small','metrics-note','A Meta não informou todas as contagens. Isso não significa zero.'));
      row.append(brief);full.append(numbers);
      const update=el('button','btn quiet','Atualizar métricas');update.type='button';update.disabled=!post.remoteId;
      if(update.disabled)update.title='O ID remoto desta publicação ainda não está disponível.';
      update.addEventListener('click',()=>guard(()=>refreshMetrics(post)));actions.append(update);
      const inCalendar=el('button','btn quiet','No calendário');inCalendar.type='button';inCalendar.disabled=!post.publishedAt;
      inCalendar.addEventListener('click',()=>openCalendarAt(post.publishedAt));actions.append(inCalendar);
      const remote=post.remoteDetails?.permalink || post.permalink;
      const hasLink=typeof remote==='string' && /^https:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[A-Za-z0-9_/-]+$/.test(remote);
      const expired=post.format==='story' && post.publishedAt && Date.now()>=post.publishedAt+86400000;
      if(post.format==='story'){
        const note=expired?'Story: prazo público de 24 horas transcorrido. Consulte o arquivo no aplicativo Instagram.'
          :'Story: link temporário, disponível por até 24 horas. O arquivo privado do Instagram não é aberto pela Central.';
        numbers.append(el('small','story-availability',note));
      }
      if(post.remoteDeletion?.status!=='confirmed' && (post.format!=='story' || !expired && hasLink)){
        const link=el('a','btn quiet',post.format==='story'?'Abrir Story (até 24h)':hasLink?'Ver no Instagram':'Abrir perfil no Instagram');
        link.href='#history';link.addEventListener('click',e=>{e.preventDefault();toast('Perfil externo desativado na demonstração.');});
        link.target='_blank';link.rel='noopener noreferrer';actions.append(link);
      }
    }
    if(options.approval){
      const remove=el('button','btn quiet danger','Excluir');remove.type='button';
      remove.disabled=!['draft','approved','scheduled','failed','published'].includes(post.status) ||
        (post.publicationAttempted && post.status!=='published') || (post.source==='instagram' && historyActive());
      if(remove.disabled)remove.title='Confira o resultado do envio antes de excluir.';
      remove.addEventListener('click',()=>requestDeletion('post',post));actions.append(remove);
    }
    row.append(details,actions);
    return row;
  }
  function renderUpcoming() {
    const target=$('upcoming-list');
    const items=state.posts.filter(p=>p.status==='scheduled').sort((a,b)=>a.scheduledAt-b.scheduledAt).slice(0,5);
    if(!items.length)return empty(target,'Nenhuma publicação agendada. Crie uma publicação para começar.');
    clear(target);items.forEach(p=>target.append(postRow(p)));
  }
  function renderApprovals() {
    clearTimeout(state.storyTimer);
    const target=$('approval-list');
    const items=state.posts;
    if(!items.length)return empty(target,'Nenhuma publicação criada. Use “Nova publicação” para começar.');
    clear(target);items.forEach(p=>target.append(postRow(p,{approval:true})));
    const expiries=items.filter(p=>p.status==='published' && p.format==='story' && p.publishedAt)
      .map(p=>p.publishedAt+86400000-Date.now()).filter(delay=>delay>0);
    if(expiries.length)state.storyTimer=setTimeout(()=>{if(state.view==='approval')renderApprovals();},Math.min(...expiries)+50);
  }
  function historyActive(){return ['queued','running'].includes(state.history.status);}
  function renderHistoryProgress(){
    const job=state.history,active=historyActive(),target=$('history-progress');
    $('history-start').disabled=active || state.actionPending || state.busy;
    $('history-download').disabled=active;
    if(active && typeof job.download==='boolean')$('history-download').checked=job.download;
    $('history-cancel').hidden=!active;$('history-cancel').disabled=!!job.cancel || state.actionPending;
    clear(target);target.append(el('p','',job.message || 'Nenhuma sincronização iniciada nesta conta.'));
    if(job.checkedAt)target.append(el('small','','Concluída em '+friendlyDate(job.checkedAt)));
    if(active){
      target.setAttribute('aria-busy','true');const track=el('div','ui-progress');track.setAttribute('role','progressbar');track.setAttribute('aria-label',job.phase==='media'?'Baixando mídias':'Consultando histórico');
      const fill=el('span','ui-progress-fill');track.append(fill);
      if(job.phase==='media' && job.totalFiles){
        const value=Math.min(100,100*(job.processedFiles || 0)/job.totalFiles);
        track.dataset.indeterminate='false';track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(Math.round(value)));fill.style.transform='scaleX('+(value/100)+')';
      }else track.dataset.indeterminate='true';target.append(track);
    }else target.removeAttribute('aria-busy');
  }
  function metricValue(post,kind){
    const m=post.metrics || {},values=[m.likes,m.comments,m.extra?.shares,m.extra?.saves].filter(v=>typeof v==='number');
    if(kind==='interactions')return values.length?values.reduce((a,b)=>a+b,0):null;
    return kind==='shares'?m.extra?.shares:m[kind];
  }
  function renderHistory(){
    renderHistoryProgress();
    const allPosts=state.posts.filter(p=>p.status==='published'),fmt=$('history-format').value,sort=$('history-sort').value;
    const posts=allPosts.filter(p=>fmt==='all' || p.format===fmt).sort((a,b)=>sort==='date'
      ? (b.publishedAt || 0)-(a.publishedAt || 0)
      : (metricValue(b,sort) ?? -1)-(metricValue(a,sort) ?? -1));
    const summary=$('history-summary');clear(summary);
    summary.append(el('strong','',posts.length+' publicação(ões) no filtro'));
    for(const [kind,label] of [['likes','Curtidas'],['comments','Comentários'],['shares','Compartilhamentos'],['interactions','Interações conhecidas']]){
      const values=posts.map(p=>metricValue(p,kind)).filter(v=>typeof v==='number');
      summary.append(el('span','',label+': '+(values.length?new Intl.NumberFormat('pt-BR').format(values.reduce((a,b)=>a+b,0)):'—')+' · dados em '+values.length+'/'+posts.length));
    }
    const target=$('history-list');clear(target);
    if(!posts.length)return empty(target,'Ainda não há publicações neste histórico. Sincronize a conta ou publique pela Central.');
    posts.forEach(post=>target.append(postRow(post,{approval:true})));
  }
  function openCalendarAt(timestamp){
    if(!timestamp)return;
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit'}).formatToParts(new Date(timestamp));
    state.month=new Date(Date.UTC(Number(parts.find(p=>p.type==='year').value),Number(parts.find(p=>p.type==='month').value)-1,1));show('calendar');
  }
  function monitorMediaLoad(media, target) {
    media.addEventListener('error',()=>{
      if(!target.isConnected)return;
      const message=el('span','media-load-failed',
        'Não foi possível carregar esta mídia. Atualize a página para tentar novamente.');
      message.setAttribute('role','status');
      target.append(message);
    },{once:true});
  }
  function mediaCard(item, selected=false, clickable=false) {
    const node=el(clickable?'button':'div','media-card'+(selected?' selected':''));
    if(clickable)node.type='button';
    const visual=el('div','media-card-visual');
    const url=previewUrl(item);
    const media=el(item.type.startsWith('image/')?'img':'video');
    UI.media(media,url,visual);
    if(media.tagName==='IMG')media.alt=item.name;
    else{media.muted=true;media.playsInline=true;}
    monitorMediaLoad(media,visual);
    visual.append(media);node.append(visual);
    const info=el('div','media-card-info');info.append(el('strong','',item.name),el('small','',Math.max(1,Math.round(item.size/1024))+' KB'));
    node.append(info);return node;
  }
  function renderLibrary() {
    const grid=$('media-grid');clear(grid);
    if(!state.media.length)return empty(grid,'Sua biblioteca está vazia. Adicione imagens ou vídeos.');
    state.media.forEach(m=>{
      const card=mediaCard(m);card.dataset.mediaId=m.id;
      const remove=el('button','btn quiet danger','Excluir mídia');remove.type='button';
      remove.disabled=m.usageCount>0;
      if(remove.disabled){
        const usage='Em uso por '+m.usageCount+' publicação(ões).';remove.title=usage;
        card.append(el('small','media-usage',usage));
      }
      remove.addEventListener('click',()=>requestDeletion('media',m));card.append(remove);grid.append(card);
    });
  }
  function renderPicker() {
    const grid=$('picker-grid');clear(grid);
    if(!state.media.length)return empty(grid,'Adicione arquivos pela Biblioteca antes de selecionar.');
    state.media.forEach(m=>{
      const button=mediaCard(m,state.pickerIds.includes(m.id),true);
      button.setAttribute('aria-pressed',String(state.pickerIds.includes(m.id)));
      button.addEventListener('click',()=>{
        if(state.pickerIds.includes(m.id))state.pickerIds=state.pickerIds.filter(id=>id!==m.id);
        else if(state.pickerIds.length<20)state.pickerIds.push(m.id);
        else return toast('Limite de 20 itens por publicação.');
        renderPicker();
      });
      grid.append(button);
    });
  }
  function effectiveFormat() {
    return $('post-format').value==='feed' && selectedMedia().length>=2
      ? 'carousel' : $('post-format').value;
  }
  function captionMode() {
    return document.querySelector('input[name="caption-mode"]:checked')?.value==='per_slide'
      ? 'per_slide' : 'general';
  }
  function renderCaptionControls() {
    const items=selectedMedia();
    const isCarousel=effectiveFormat()==='carousel' && items.every(m=>m.type.startsWith('image/'));
    $('carousel-caption-options').classList.toggle('hidden',!isCarousel);
    const perSlide=isCarousel && captionMode()==='per_slide';
    $('general-caption-field').classList.toggle('hidden',perSlide);
    const target=$('slide-caption-fields');clear(target);
    target.classList.toggle('hidden',!perSlide);
    if(!perSlide)return;
    items.forEach((item,i)=>{
      const row=el('div','slide-caption-row');
      const label=el('label','',('Imagem '+(i+1)+' de '+items.length));
      const input=el('textarea','slide-caption-input');
      input.rows=3;input.maxLength=2200;
      input.value=state.currentSlideCaptions[item.id] || '';
      input.placeholder='Legenda desta imagem (somente editorial local)';
      label.append(input);row.append(label);
      input.addEventListener('input',()=>{
        state.currentSlideCaptions[item.id]=input.value;
        renderEditorPreview();
      });
      target.append(row);
    });
  }
  function drawMediaFrame(target,captionTarget,items,index,caption,mode,slideCaptions,onChange) {
    clear(target);
    const item=items[index];
    if(!item) {
      target.append(el('span','','Selecione uma mídia para visualizar'));
      captionTarget.textContent=caption?.trim() || 'Sua legenda aparece aqui.';
      return;
    }
    const media=el(item.type.startsWith('image/')?'img':'video');
    media.className='phone-frame-media';
    if(media.tagName==='IMG') media.alt='Imagem '+(index+1)+' da publicação';
    else{media.controls=true;media.muted=true;media.playsInline=true;}
    UI.media(media,previewUrl(item),target);
    monitorMediaLoad(media,target);
    target.append(media);
    if(items.length>1) {
      const controls=el('div','phone-carousel-controls');
      const prev=el('button','carousel-arrow','‹');prev.type='button';prev.disabled=index===0;
      prev.setAttribute('aria-label','Imagem anterior');
      prev.addEventListener('click',()=>onChange(index-1));
      const counter=el('span','carousel-counter',(index+1)+' / '+items.length);
      const next=el('button','carousel-arrow','›');next.type='button';next.disabled=index===items.length-1;
      next.setAttribute('aria-label','Próxima imagem');
      next.addEventListener('click',()=>onChange(index+1));
      controls.append(prev,counter,next);target.append(controls);
    }
    captionTarget.textContent=(mode==='per_slide'
      ? (slideCaptions[index] || '')
      : (caption || '')).trim() || 'Sem legenda nesta imagem.';
  }
  function renderEditorPreview() {
    const items=selectedMedia();
    state.currentPreviewIndex=Math.min(state.currentPreviewIndex,Math.max(0,items.length-1));
    const mode=effectiveFormat()==='carousel' && captionMode()==='per_slide'?'per_slide':'general';
    const key=JSON.stringify([items.map(item=>item.id),state.currentPreviewIndex]);
    if(state.editorPreviewKey===key){
      $('preview-caption').textContent=(mode==='per_slide'
        ? state.currentSlideCaptions[items[state.currentPreviewIndex]?.id] || ''
        : $('post-caption').value).trim() || (items.length?'Sem legenda nesta imagem.':'Sua legenda aparece aqui.');
      return;
    }
    state.editorPreviewKey=key;
    drawMediaFrame($('phone-media'),$('preview-caption'),items,state.currentPreviewIndex,
      $('post-caption').value,mode,items.map(item=>state.currentSlideCaptions[item.id] || ''),
      index=>{state.currentPreviewIndex=index;renderEditorPreview();});
  }
  function renderModalPreview() {
    const post=state.posts.find(p=>p.id===state.modalPostId);
    if(!post)return;
    const items=post.mediaIds.map(id=>state.media.find(m=>m.id===id)).filter(Boolean);
    state.modalPreviewIndex=Math.min(state.modalPreviewIndex,Math.max(0,items.length-1));
    drawMediaFrame($('modal-phone-media'),$('modal-preview-caption'),items,state.modalPreviewIndex,
      post.caption,post.captionMode||'general',post.slideCaptions||[],
      index=>{state.modalPreviewIndex=index;renderModalPreview();});
    $('modal-preview-description').textContent=formatLabel(post.format)+' · '+(STATUS[post.status] || 'Revisão necessária');
    const alt=post.remoteDetails?.altTexts?.[state.modalPreviewIndex];
    $('modal-media-details').hidden=!post.remoteDetails?.altTexts;
    $('modal-media-alt').textContent=alt || 'A Meta não retornou texto alternativo para esta mídia.';
  }
  function openPostPreview(id) {
    const post=state.posts.find(p=>p.id===id);
    if(!post)return toast('Publicação indisponível.');
    state.modalPostId=id;state.modalPreviewIndex=0;
    renderModalPreview();
    UI.dialog.open($('preview-dialog'));
  }
  function renderSelection(){
    const target=$('selected-media');clear(target);
    const items=selectedMedia();
    if(!items.length)target.append(el('span','','Nenhuma mídia selecionada.'));
    for(const item of items){
      const thumb=el('span','selected-thumb',item.name);
      const remove=el('button','','×');remove.type='button';remove.setAttribute('aria-label','Remover '+item.name);
      remove.addEventListener('click',()=>{
        state.currentMediaIds=state.currentMediaIds.filter(id=>id!==item.id);
        state.currentPreviewIndex=0;
        renderSelection();
      });
      thumb.append(remove);target.append(thumb);
    }
    $('caption-count').textContent=$('post-caption').value.length+'/2200';
    renderCaptionControls();
    renderEditorPreview();
  }
  async function uploadFiles(files) {
    let added=0, skipped=0;
    let index=0;
    try{
    for(const file of files){
      index++;
      if(!['image/jpeg','image/png','video/mp4'].includes(file.type) || file.size===0 || file.size>MAX_UPLOAD){skipped++;continue;}
      const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
      const valid=file.type==='image/jpeg' ? bytes[0]===255 && bytes[1]===216 && bytes[2]===255
        :file.type==='image/png' ? [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)
        :bytes.length>=12 && String.fromCharCode(...bytes.slice(4,8))==='ftyp';
      if(!valid){skipped++;continue;}
      state.uploadLabel='Enviando mídia '+index+' de '+files.length;
      await api('media',{action:'upload',file});
      added++;
    }
    await refresh();
    clearOperationFeedback('library-feedback');
    toast(added+' arquivo(s) salvo(s) na biblioteca da Central.'+(skipped?' '+skipped+' ignorado(s) por formato ou tamanho.':''));
    }finally{state.uploadLabel='';}
  }
  async function savePost(navigate=false) {
    UI.tabs.select('editor-preview','content');
    const media=selectedMedia(),format=effectiveFormat();
    const mode=format==='carousel' && captionMode()==='per_slide'?'per_slide':'general';
    const caption=mode==='per_slide'?'':$('post-caption').value.trim();
    const slideCaptions=media.map(item=>mode==='per_slide'
      ? (state.currentSlideCaptions[item.id] || '').trim() : '');
    if(!FORMATS[format] || caption.length>2200 || slideCaptions.some(t=>t.length>2200)){
      $('form-feedback').textContent='Confira o formato e as legendas.';return;
    }
    if(!mediaValid(format,media)){
      $('form-feedback').textContent='Selecione mídias compatíveis com o formato. '+$('selection-hint').textContent;return;
    }
    const current=state.posts.find(p=>p.id===state.currentPostId);
    if(current && !['draft','approved','scheduled'].includes(current.status)){
      $('form-feedback').textContent='Esta publicação não pode ser editada.';return;
    }
    const changed=!current || current.format!==format || current.caption!==caption ||
      JSON.stringify(current.mediaIds)!==JSON.stringify(state.currentMediaIds) ||
      (current.captionMode || 'general')!==mode ||
      JSON.stringify(current.slideCaptions || current.mediaIds.map(()=>''))!==JSON.stringify(slideCaptions);
    if(current && !changed){editorClean=editorSignature();toast('Conteúdo sem alterações.');if(navigate)show('approval');return;}
    const data={format,caption,mediaIds:[...state.currentMediaIds],captionMode:mode,slideCaptions};
    if(current){data.id=current.id;data.version=state.currentPostVersion;}
    const saved=await api('drafts',{action:'draft',data});
    state.currentPostId=saved.id;
    clearDraftFeedback();
    await refresh();
    state.currentPostVersion=state.posts.find(p=>p.id===saved.id)?.version;
    editorClean=editorSignature();
    toast('Rascunho salvo. A revisão anterior, se houver, foi invalidada.');
    if(navigate)show('approval');
  }
  async function approvePost(id) {
    const post=state.posts.find(p=>p.id===id);
    if(!post || post.status!=='draft')return;
    const items=post.mediaIds.map(mid=>state.media.find(m=>m.id===mid)).filter(Boolean);
    if(!mediaValid(post.format,items))return toast('Não é possível aprovar: confira as mídias.');
    await api('posts/'+id+'/approve',{action:'approve',data:{version:post.version}});
    await refresh();
    const updated=state.posts.find(p=>p.id===id);
    if(updated?.status==='scheduled')toast('Aprovada. Agendamento original restaurado. Nenhum envio foi realizado.');
    else if(updated?.pendingScheduledAt)toast('Aprovada. A data anterior já passou; escolha novo horário.');
    else toast('Publicação aprovada. Nenhum envio foi realizado.');
  }
  function renderScheduleSummary(post, targetId='schedule-post-preview') {
    const target=$(targetId);clear(target);
    const thumb=el('span','schedule-post-thumb');
    const first=state.media.find(media=>media.id===post.mediaIds?.[0]);
    if(first){
      const media=el(first.type.startsWith('image/')?'img':'video');
      if(media.tagName==='IMG')media.alt='Miniatura da publicação selecionada';
      else{media.muted=true;media.playsInline=true;}
      UI.media(media,previewUrl(first),thumb);
      thumb.append(media);
    }else thumb.append(el('span','schedule-thumb-fallback','Sem miniatura'));
    const body=el('div','schedule-post-content');
    const caption=postText(post);
    const title=caption.split(/\n/)[0].trim().slice(0,62) || 'Publicação sem legenda';
    const summary=caption.slice(title.length).trim() || caption;
    body.append(el('strong','schedule-post-title',title));
    body.append(el('span','schedule-post-excerpt',summary.slice(0,150) || 'Sem legenda'));
    body.append(el('small','schedule-post-kind',formatLabel(post.format)));
    target.append(thumb,body);
  }
  function scheduleFeedback(message,kind='error') {
    const target=$('schedule-feedback');
    target.textContent=message;
    target.classList.toggle('schedule-error',kind==='error' && !!message);
    target.setAttribute('role',kind==='error' && message?'alert':'status');
    target.setAttribute('aria-live',kind==='error' && message?'assertive':'polite');
  }
  function saoPauloMinute(date=new Date()) {
    const parts=new Intl.DateTimeFormat('en-US',{
      timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',hourCycle:'h23'
    }).formatToParts(date);
    const part=name=>parts.find(item=>item.type===name)?.value;
    return part('year')+'-'+part('month')+'-'+part('day')+'T'+part('hour')+':'+part('minute');
  }
  function schedulePost(id) {
    const post=state.posts.find(p=>p.id===id);
    if(!post || post.status!=='approved' || post.revision!==post.approvedRevision)return toast('Aprove a revisão atual primeiro.');
    state.pendingSchedule=id;
    renderScheduleSummary(post);
    scheduleFeedback(post.pendingScheduledAt
      ? 'O horário anterior ('+friendlyDate(post.pendingScheduledAt)+') já passou. Informe uma nova data.'
      : '', 'info');
    $('schedule-at').value='';
    UI.dialog.open($('schedule-dialog'));
  }
  async function submitSchedule(event) {
    event.preventDefault();
    const post=state.posts.find(p=>p.id===state.pendingSchedule);
    if(!post || post.status!=='approved' || post.revision!==post.approvedRevision){
      scheduleFeedback('Esta publicação mudou. Feche esta janela e abra Agendar novamente.');
      return;
    }
    const val=$('schedule-at').value;
    if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(val)){
      scheduleFeedback('Informe uma data e um horário válidos.');
      return;
    }
    if(val<=saoPauloMinute()){
      scheduleFeedback('A data e o horário escolhidos já passaram. Selecione um horário futuro para agendar.');
      return;
    }
    if(state.busy)return;
    state.busy=true;
    const submit=$('schedule-form').querySelector('button[type="submit"]');
    const release=UI.hold(submit,'Agendando…');
    scheduleFeedback('Conferindo o acesso e confirmando o agendamento…','info');
    try{
      await api('posts/'+post.id+'/schedule',{action:'schedule',data:{version:post.version,localTime:val}});
    }catch(error){
      if(error.status===422 && /Data deve ser futura/i.test(error.message)){
        scheduleFeedback('A data e o horário escolhidos já passaram. Selecione um horário futuro para agendar.');
      }else if(error.status===409){
        scheduleFeedback('Esta publicação foi alterada em outra aba. Feche esta janela e tente agendar a versão atual.');
      }else if(error.status===403){
        scheduleFeedback('Sua sessão expirou. Entre novamente para continuar.');
      }else if(error.unexpectedResponse){
        scheduleFeedback('Não foi possível confirmar o agendamento. O servidor respondeu de forma inesperada. Tente novamente.');
      }else{
        scheduleFeedback('Não foi possível agendar. '+(error.message || 'Verifique a data e tente novamente.'));
      }
      return; // Keep the modal, selected post and entered date visible on errors.
    }finally{
      state.busy=false;release();
    }
    UI.dialog.close($('schedule-dialog'));state.pendingSchedule=null;
    await refresh();toast('Agendamento confirmado para @'+state.accountUsername+'.');
    show('calendar');
  }
  function confirmPublication(post,action) {
    state.pendingPublish={id:post.id,version:post.version,action};
    renderScheduleSummary(post,'publish-post-preview');
    $('publish-account').textContent='Conta de destino: @'+state.accountUsername;
    $('publish-explanation').textContent=action==='activate'
      ? 'Este agendamento será confirmado apenas na simulação.'
      : 'Esta publicação será simulada. Nenhum conteúdo será enviado ao Instagram.';
    $('publish-feedback').textContent='';$('confirm-publish').disabled=false;
    UI.dialog.open($('publish-dialog'));
  }
  async function submitPublication() {
    if(state.busy || !state.pendingPublish)return;
    state.busy=true;const release=UI.hold($('confirm-publish'),'Preparando envio…');
    $('publish-feedback').textContent='Conferindo o acesso e preparando o envio…';
    const pending=state.pendingPublish;
    try{
      await api('posts/'+pending.id+'/'+pending.action,{action:pending.action,data:{version:pending.version}});
      UI.dialog.close($('publish-dialog'));state.pendingPublish=null;
      await refresh();toast(pending.action==='activate'?'Envio agendado confirmado.':'Publicação simulada. Nenhum conteúdo foi enviado.');
    }catch(error){$('publish-feedback').textContent=error.message || 'Não foi possível preparar o envio.';}
    finally{state.busy=false;release();}
  }
  async function recoverPost(post,action) {
    const data={version:post.version};
    if(action==='retry'){
      if(!window.confirm('Confira o perfil @'+state.accountUsername+' no Instagram. Você confirma que este conteúdo NÃO foi publicado e quer liberar outra tentativa com o mesmo contêiner?'))return;
      data.confirmNotPublished=true;
    }
    await api('posts/'+post.id+'/'+action,{action,data});await refresh();
    toast(action==='reset'?'Conteúdo liberado para edição.':'Verificação solicitada. Acompanhe o resultado.');
  }
  async function refreshMetrics(post){
    const result=await api('posts/'+post.id+'/metrics',{action:'metrics',data:{version:post.version}});
    await refresh(true);
    toast(result.metrics.status==='ready'?'Consulta simulada. Métricas fictícias atualizadas.'
      : result.metrics.error,result.metrics.status==='ready'?'success':'error');
  }
  const bytesLabel=value=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(value/1024/1024)+' MB';
  function updateDeleteChoice(){
    const pending=state.pendingDelete;if(!pending)return;
    const remote=pending.kind==='post' && $('delete-remote').checked;
    const uncertain=['issued','unknown'].includes(pending.remoteDeletion?.status);
    $('delete-remote-confirm-option').hidden=!remote;
    $('delete-retry-option').hidden=!remote || !uncertain;
    $('confirm-delete').textContent=remote?'Excluir da Central e do Instagram':pending.kind==='post'?'Excluir somente da Central':'Excluir arquivo da Central';
    $('confirm-delete').disabled=remote && (!$('delete-remote-confirm').checked || (uncertain && !$('delete-retry').checked));
    $('delete-consequence').textContent=remote
      ? (pending.remoteDeletion?.status==='confirmed'?'A Meta já confirmou a exclusão. Será concluída somente a limpeza local.':
          'Esta publicação será excluída do Instagram da conta indicada. Não é possível desfazer. Em carrosséis, todas as imagens serão excluídas juntas. A Central aguardará a confirmação da Meta antes de remover o registro local.')
      : pending.kind==='media'?'O arquivo será apagado do armazenamento da Central. Esta ação não pode ser desfeita.':
          (pending.status==='scheduled'?'O agendamento será cancelado. ':'')+'O registro será apagado somente da Central. Conteúdo já publicado continuará no Instagram. Esta ação local não pode ser desfeita.'+
          (pending.source==='instagram'?' Uma nova sincronização poderá importar o registro novamente.':'');
  }
  function requestDeletion(kind,item){
    if(state.busy || state.actionPending)return UI.announce('Aguarde a conclusão da operação atual.');
    state.pendingDelete={...item,kind,instagramAccountId:state.instagramAccountId};
    $('delete-title').textContent=kind==='post'?'Excluir publicação':'Excluir mídia da biblioteca';
    $('delete-description').textContent=kind==='post'
      ? 'Conta @'+state.accountUsername+' · '+(postText(item).slice(0,120) || 'Publicação sem legenda')
      : 'Conta @'+state.accountUsername+' · '+item.name+' · '+bytesLabel(item.size);
    $('delete-scope').hidden=kind!=='post';
    $('delete-remote-option').hidden=kind!=='post' || item.status!=='published' || !item.remoteId;
    const pendingRemote=['issued','unknown','confirmed'].includes(item.remoteDeletion?.status);
    $('delete-local').disabled=pendingRemote;
    $('delete-local').checked=!pendingRemote;$('delete-remote').checked=pendingRemote;
    $('delete-remote-confirm').checked=false;$('delete-retry').checked=false;
    $('delete-media-option').hidden=kind!=='post';$('delete-unused-media').checked=true;
    $('delete-settings-help').hidden=true;
    $('delete-feedback').textContent=item.remoteDeletion?.message || '';
    updateDeleteChoice();UI.dialog.open($('delete-dialog'));
  }
  async function submitDeletion(){
    if(state.busy || state.actionPending || !state.pendingDelete)return;
    const pending=state.pendingDelete;
    const remote=pending.kind==='post' && $('delete-remote').checked;
    if(remote && (!$('delete-remote-confirm').checked || (!pending.remoteId || !pending.instagramAccountId)))return;
    state.busy=true;
    const release=UI.hold($('confirm-delete'),'Excluindo…');
    $('delete-feedback').textContent=remote?'Conferindo acesso e solicitando exclusão no Instagram…':'Excluindo somente da Central, na conta selecionada…';
    all('#delete-dialog input').forEach(input=>input.disabled=true);
    try{
      const action=remote?'delete_remote':pending.kind==='post'?'delete_post':'delete_media';
      const data=pending.kind==='post'?{version:pending.version,deleteUnusedMedia:$('delete-unused-media').checked}:{mediaId:pending.id};
      if(remote)Object.assign(data,{instagramAccountId:pending.instagramAccountId,remoteId:pending.remoteId,confirmRemote:true,retryUncertain:$('delete-retry').checked});
      const result=await api(pending.kind==='post'?'posts/'+pending.id+'/delete':'drafts',{action,data});
      if(remote && !result.deleted){
        await refresh(true);
        pending.remoteDeletion=state.posts.find(post=>post.id===pending.id)?.remoteDeletion || {status:result.status};
        $('delete-feedback').textContent=result.error || 'Não foi possível confirmar a exclusão. O registro foi preservado.';
        $('delete-settings-help').hidden=!String(result.error || '').includes('instagram_manage_contents');
        return;
      }
      if(pending.kind==='post' && state.currentPostId===pending.id){state.currentPostId=null;state.currentPostVersion=null;}
      await refresh();state.currentMediaIds=state.currentMediaIds.filter(id=>state.media.some(m=>m.id===id));state.editorPreviewKey=null;
      UI.dialog.close($('delete-dialog'));state.pendingDelete=null;
      toast((remote?'Exclusão remota simulada. ':'Exclusão da Central concluída. ')+(result.deletedMedia || 0)+' mídia(s) removida(s); '+bytesLabel(result.freedBytes || 0)+' liberados.'+
        (result.keptMedia?' '+result.keptMedia+' mídia(s) preservada(s) por uso em outra publicação.':'')+
        (result.pendingBytes?' Limpeza de '+bytesLabel(result.pendingBytes)+' pendente; será retomada ao abrir a conta.':''));
    }catch(error){$('delete-feedback').textContent=error.message || 'Não foi possível confirmar a exclusão. Atualize e confira os dados.';}
    finally{state.busy=false;release();all('#delete-dialog input').forEach(input=>input.disabled=false);
      if(state.pendingDelete){$('delete-local').disabled=['issued','unknown','confirmed'].includes(state.pendingDelete.remoteDeletion?.status);updateDeleteChoice();}}
  }
  async function cancelSchedule(id) {
    const post=state.posts.find(p=>p.id===id);
    if(!post || post.status!=='scheduled')return;
    await api('posts/'+id+'/cancel',{action:'cancel',data:{version:post.version}});
    await refresh();toast('Agendamento cancelado.');
  }
  function renderCalendar() {
    const start=new Date(Date.UTC(state.month.getUTCFullYear(),state.month.getUTCMonth(),1));
    $('month-label').textContent=formatMonth(start);
    $('calendar-month').value=start.getUTCFullYear()+'-'+String(start.getUTCMonth()+1).padStart(2,'0');
    const target=$('calendar-grid');clear(target);
    const firstWeekday=start.getUTCDay();
    const monthDays=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate();
    const cells=Math.ceil((firstWeekday+monthDays)/7)*7;
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    for(let index=0;index<cells;index++){
      const date=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),index-firstWeekday+1));
      const iso=date.toISOString().slice(0,10);
      const outside=date.getUTCMonth()!==start.getUTCMonth();
      const cell=el('div','calendar-day'+(outside?' outside':'')+(iso===today?' today':''));
      cell.append(el('span','day-number',date.getUTCDate()));
      const events=state.posts.filter(p=>calendarTime(p) &&
        (p.status==='published' || p.status==='scheduled' || pendingApproval(p) || expiredReservation(p)) &&
        new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(calendarTime(p)))===iso);
      events.forEach(post=>{
        const summary=postText(post);
        const needsReview=pendingApproval(post),expired=expiredReservation(post);
        const prefix=post.status==='published'?'Publicada':needsReview?'Aprovação pendente':expired?'Horário expirado':formatLabel(post.format);
        const text=el('div','calendar-event'+(needsReview?' awaiting-review':expired?' expired-review':''),
          prefix+' · '+(summary.slice(0,15)||'Sem legenda'));
        text.title=prefix+' · '+summary;
        if(needsReview || post.status==='published'){
          text.setAttribute('role','button');text.tabIndex=0;
          text.setAttribute('aria-label','Ver publicação: '+summary.slice(0,60));
          const focusItem=()=>{const item=document.getElementById('calendar-post-'+post.id);item?.scrollIntoView({block:'nearest'});item?.querySelector('.post-preview-trigger')?.focus({preventScroll:true});};
          text.addEventListener('click',focusItem);
          text.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();focusItem();}});
        }
        cell.append(text);
      });
      target.append(cell);
    }
    const list=$('calendar-list');clear(list);
    const monthPrefix=start.getUTCFullYear()+'-'+String(start.getUTCMonth()+1).padStart(2,'0');
    const scheduled=state.posts.filter(p=>
      p.status==='scheduled' || pendingApproval(p) || expiredReservation(p) ||
      p.status==='published' && p.publishedAt && saoPauloMinute(new Date(p.publishedAt)).startsWith(monthPrefix))
      .sort((a,b)=>calendarTime(a)-calendarTime(b));
    if(!scheduled.length)return empty(list,'Nenhuma publicação neste mês ou agenda pendente.');
    scheduled.forEach(p=>{
      const row=postRow(p,{approval:true});
      row.id='calendar-post-'+p.id;
      list.append(row);
    });
  }
  function wireEvents() {
    $('history-start').addEventListener('click',()=>guard(async()=>{await api('drafts',{action:'history_start',data:{downloadMedia:$('history-download').checked}});await refresh(true);toast('Sincronização iniciada. Acompanhe o progresso no Histórico.');}));
    $('history-cancel').addEventListener('click',()=>guard(async()=>{await api('drafts',{action:'history_cancel',data:{}});await refresh(true);}));
    ['history-sort','history-format'].forEach(id=>$(id).addEventListener('change',renderHistory));
    $('calendar-month').addEventListener('change',()=>{const val=$('calendar-month').value;if(/^\d{4}-\d{2}$/.test(val)){state.month=new Date(val+'-01T12:00:00Z');renderCalendar();}});
    $('confirm-delete').addEventListener('click',submitDeletion);
    ['delete-local','delete-remote','delete-remote-confirm','delete-retry'].forEach(id=>$(id).addEventListener('change',updateDeleteChoice));
    ['close-delete-dialog','cancel-delete'].forEach(id=>$(id).addEventListener('click',()=>{if(!state.busy)UI.dialog.close($('delete-dialog'));}));
    $('confirm-publish').addEventListener('click',submitPublication);
    $('close-publish-dialog').addEventListener('click',()=>{if(!state.busy)UI.dialog.close($('publish-dialog'));});
    all('[data-view]').forEach(node=>node.addEventListener('click',()=>{
      if(state.actionPending || state.busy)return UI.announce('Aguarde a conclusão da operação atual.');
      if(node.dataset.view==='editor')newDraft();else show(node.dataset.view);
    }));
    all('[data-setting-tab]').forEach(node=>node.addEventListener('click',()=>UI.tabs.select('demo-settings',node.dataset.settingTab,{write:true})));
    all('[data-goto]').forEach(node=>node.addEventListener('click',()=>show(node.dataset.goto)));
    all('[data-new-format]').forEach(node=>node.addEventListener('click',()=>newDraft(node.dataset.newFormat)));
    const mobileMenuToggle=$('mobile-main-menu-toggle');
    const primaryNavigation=$('primary-navigation');
    mobileMenuToggle.addEventListener('click',()=>{
      const open=mobileMenuToggle.getAttribute('aria-expanded')!=='true';
      mobileMenuToggle.setAttribute('aria-expanded',String(open));
      primaryNavigation.dataset.open=String(open);
    });
    primaryNavigation.addEventListener('click',event=>{
      if(event.target.closest('[data-view]')){
        mobileMenuToggle.setAttribute('aria-expanded','false');
        primaryNavigation.dataset.open='false';
      }
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        mobileMenuToggle.setAttribute('aria-expanded','false');
        primaryNavigation.dataset.open='false';
      }
    });
    $('resume-editor').addEventListener('click',()=>show('editor'));
    $('clear-editor').addEventListener('click',()=>newDraft());
    $('post-format').addEventListener('change',()=>{state.currentPreviewIndex=0;formatHint();renderSelection();});
    $('post-caption').addEventListener('input',renderSelection);
    all('input[name="caption-mode"]').forEach(node=>node.addEventListener('change',()=>{state.currentPreviewIndex=0;renderSelection();}));
    $('save-draft').addEventListener('click',()=>guard(()=>savePost(false)));
    $('post-form').addEventListener('submit',e=>{e.preventDefault();guard(()=>savePost(true));});
    $('upload-trigger').addEventListener('click',()=>$('media-input').click());
    $('media-input').addEventListener('change',e=>guard(async()=>{await uploadFiles(e.target.files);e.target.value='';}));
    $('open-library-picker').addEventListener('click',()=>{state.pickerIds=[...state.currentMediaIds];renderPicker();UI.dialog.open($('media-dialog'));});
    $('close-media-dialog').addEventListener('click',()=>UI.dialog.close($('media-dialog')));
    $('apply-media-selection').addEventListener('click',()=>{state.currentMediaIds=[...state.pickerIds];state.currentPreviewIndex=0;UI.dialog.close($('media-dialog'));renderSelection();});
    $('close-preview-dialog').addEventListener('click',()=>UI.dialog.close($('preview-dialog')));
    $('preview-dialog').addEventListener('click',event=>{if(event.target===$('preview-dialog'))UI.dialog.close($('preview-dialog'));});
    $('preview-dialog').addEventListener('close',()=>{state.modalPostId=null;});
    $('close-schedule-dialog').addEventListener('click',()=>{if(!state.busy)UI.dialog.close($('schedule-dialog'));});
    $('schedule-form').addEventListener('submit',e=>{e.preventDefault();guard(()=>submitSchedule(e));});
    $('refresh-content').addEventListener('click',()=>guard(async()=>{
      const operation=UI.start('Atualizando o conteúdo desta conta…');
      try{await refresh();render();toast('Conteúdo atualizado.');}finally{operation.end();}
    }));
    $('prev-month').addEventListener('click',()=>{state.month=new Date(Date.UTC(state.month.getUTCFullYear(),state.month.getUTCMonth()-1,1));renderCalendar();});
    $('next-month').addEventListener('click',()=>{state.month=new Date(Date.UTC(state.month.getUTCFullYear(),state.month.getUTCMonth()+1,1));renderCalendar();});
  }
  async function guard(action) {
    if(state.actionPending || state.busy)return UI.announce('Aguarde a conclusão da operação atual.');
    state.actionPending=true;
    const button=document.activeElement;
    const label=({'check-publication':'Verificando…','refresh-content':'Atualizando…','save-draft':'Salvando…','upload-trigger':'Enviando…'})[button?.id] || 'Processando…';
    const release=UI.hold(button,label);
    try {await action();} catch(err) {
      console.error('Erro no laboratório editorial:',err?.name || 'Error');
      if(err?.status===409 && state.view==='editor' && state.currentPostId){
        draftConflictFeedback();
        return; // Do not replace unsaved text or imply a successful save.
      }
      if(state.view==='editor')actionErrorFeedback('form-feedback',err);
      else if(state.view==='library')actionErrorFeedback('library-feedback',err);
      toast(err.unexpectedResponse
        ? 'O servidor respondeu de forma inesperada. Operação não confirmada.'
        : (err.message || 'Não foi possível concluir a operação.'),'error');
      try {await refresh();} catch (_) { /* keep the error visible */ }
    }finally{state.actionPending=false;release();renderHistoryProgress();}
  }
function renderDemoViews(){
 const d=demoStore();
 if(state.view==='messages'){
  const list=$('demo-inbox'),detail=$('demo-inbox-detail'),search=$('demo-inbox-search');
  if(!list||!detail)return;
  const query=(search?.value||'').trim().toLocaleLowerCase('pt-BR');
  const filter=document.querySelector('[data-inbox-filter].active')?.dataset.inboxFilter||'all';
  const messages=d.messages.filter(m=>(!query||(m.name+' '+m.text).toLocaleLowerCase('pt-BR').includes(query))&&(filter==='all'||m.status===filter));
  $('demo-inbox-count').textContent=d.messages.length+' '+(d.messages.length===1?'conversa':'conversas');
  $('demo-inbox-total').textContent=String(messages.length);
  list.replaceChildren();
  messages.forEach((m,i)=>{
   const button=el('button','inbox-conversation'+(window.demoSelectedMessage===m.name?' active':''),'');
   button.type='button';const initials=m.name.split(/\\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
   button.append(el('span','inbox-person-avatar',initials));
   const copy=el('span','inbox-conversation-copy');
   const line=el('span','inbox-conversation-line');line.append(el('strong','',m.name));
   copy.append(line,el('p','',m.text));
   const meta=el('span','inbox-conversation-meta');meta.append(el('time','',i===0?'Agora':'Há 18 min'));
   const status=el('span','inbox-status '+(m.status==='pending'?'pending':m.status==='done'?'done':''),({human:'Em atendimento',bot:'Automação',pending:'Aguardando',done:'Concluída'}[m.status]||'Recebida'));meta.append(status);
   button.append(copy,meta);button.addEventListener('click',()=>{window.demoSelectedMessage=m.name;renderDemoViews();});list.append(button);
  });
  if(!messages.length){list.append(el('div','inbox-no-results','Nenhuma conversa encontrada.'));}
  const selected=d.messages.find(m=>m.name===window.demoSelectedMessage)||messages[0]||d.messages[0];
  if(selected){
   window.demoSelectedMessage=selected.name;detail.replaceChildren();
   const head=el('div','inbox-detail-head');
   const initials=selected.name.split(/\\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
   head.append(el('span','inbox-person-avatar',initials));
   const name=el('div','inbox-detail-name');name.append(el('strong','',selected.name),el('small','',selected.origin+' · conversa demonstrativa'));head.append(name);
   const actions=el('div','inbox-detail-actions');
   for(const [status,label] of [['human','Assumir'],['pending','Aguardar'],['done','Concluir']]){
    const btn=el('button','btn '+(status==='human'?'primary':'quiet'),label);btn.type='button';btn.disabled=selected.status===status;
    btn.addEventListener('click',()=>{selected.status=status;window.demoSelectedMessage=selected.name;renderDemoViews();toast('Estado atualizado na demonstração.');});
    actions.append(btn);
   }
   head.append(actions);
   const thread=el('div','inbox-thread');thread.append(el('div','inbox-thread-date','HOJE'));
   const bubble=el('div','inbox-bubble',selected.text);bubble.append(el('time','', 'Mensagem recebida · '+(selected.origin==='Webhook'?'Webhook':'consulta manual simulada')));thread.append(bubble);
   detail.append(head,thread,el('div','inbox-thread-note','Demonstração local · respostas e integrações externas desativadas'));
  }else{
   detail.replaceChildren();const empty=el('div','inbox-empty-detail');empty.append(el('span','inbox-empty-icon','⌕'),el('strong','','Nenhuma conversa encontrada'),el('p','','Altere a busca ou o filtro para visualizar conversas.'));detail.append(empty);
  }
 }
 if(false && state.view==='accounts'){
  const list=$('demo-accounts');list.replaceChildren();
  for(const acc of demoAccounts){const card=el('article','panel');card.append(el('h2','',acc.name),el('p','muted','@'+acc.user));const btn=el('button','btn primary',acc.user===demoAccount?'Conta ativa':'Selecionar conta');btn.disabled=acc.user===demoAccount;btn.addEventListener('click',async()=>{if(!UI.dirty.confirmLeave())return;demoAccount=acc.user;state.currentPostId=null;state.currentPostVersion=null;state.currentMediaIds=[];state.currentSlideCaptions={};$('post-caption').value='';editorClean=editorSignature();$('demo-account-select').value=acc.user;await refresh(true);renderDemoViews();toast('Conta fictícia selecionada.');});card.append(btn);list.append(card)}
 }
}function wireDemo(){
 $('demo-account-select').value=demoAccount;
 $('demo-account-select').addEventListener('change',async event=>{const next=event.target.value;if(!demoAccounts.some(acc=>acc.user===next))return;if(!UI.dirty.confirmLeave()){event.target.value=demoAccount;return;}demoAccount=next;state.currentPostId=null;state.currentPostVersion=null;state.currentMediaIds=[];state.currentSlideCaptions={};$('post-caption').value='';editorClean=editorSignature();$('demo-account-name').textContent=demoAccounts.find(a=>a.user===next).name;$('demo-account-handle').textContent='@'+next;document.querySelector('.ui-demo-avatar').textContent=demoAccounts.find(a=>a.user===next).name[0];await refresh(true);renderDemoViews();toast('Conta fictícia selecionada.');});
 $('demo-refresh-inbox').addEventListener('click',()=>toast('Atualização simulada. Nenhuma consulta à Meta.'));
 $('demo-inbox-search').addEventListener('input',()=>renderDemoViews());
 document.querySelectorAll('[data-inbox-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-inbox-filter]').forEach(x=>x.classList.toggle('active',x===button));renderDemoViews();}));
 $('demo-add-account').addEventListener('click',()=>{const name=$('demo-name').value.trim();if(!name)return toast('Digite um nome fictício.','error');demoAccounts.push({name,user:'demo_'+(++demoSerial)});$('demo-name').value='';renderDemoViews();toast('Cadastro fictício criado.');});
 document.querySelectorAll('[data-demo-action]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.demoAction+' — simulação, sem conexão externa.')));
}  async function init() {
    wireEvents();wireDemo();
    const initial=location.hash.slice(1);
    if(['overview','library','editor','approval','calendar','history','messages','settings'].includes(initial))state.view=initial;
    editorClean=editorSignature();UI.dirty.register('editor',()=>editorSignature()!==editorClean);
    addEventListener('popstate',()=>show(location.hash.slice(1)||'overview',{fromHistory:true}));
    const load=async()=>{await refresh();formatHint();show(state.view,{fromHistory:true});UI.ready();};
    try{
      await load();
    }catch(err){UI.initialError(load);}
    setInterval(()=>{
      if(document.visibilityState==='visible' && historyActive() && !state.actionPending && !state.busy)refresh().catch(()=>{});
    },2500);
    setInterval(()=>{
        if(document.visibilityState==='visible' && !state.busy &&
           !state.actionPending && !document.body.dataset.uiLoading &&
           state.posts.some(post=>post.status==='publishing' || (post.status==='scheduled' && post.publishAuthorized))){
          refresh().catch(()=>toast('Não foi possível atualizar o resultado. Use Atualizar para conferir.','error'));
        }
    },10000);
  }
  document.addEventListener('DOMContentLoaded',init,{once:true});
})();
