// GALERIA-VOTO-001 — Worker público; banco D1 configurado como env.DB.
// Nenhuma credencial deve ser incluída neste arquivo.
const GALLERIES = {
  "pager-virtual-bipou-avisaqui": [
    "bipou-cloche-acustica","bipou-monograma-b","bipou-sorriso-hospitalidade",
    "avisaqui-sino-amigavel","bipou-pulso-circular","bipou-balao-sonoro",
    "bipou-cloche-minimalista","avisaqui-sino-linear","avisaqui-pin-aviso",
    "avisaqui-check-notificacao"
  ]
};
const ALLOWED_ORIGINS = new Set(["https://mmcromero.github.io"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function headers(origin) {
  const h = {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin"};
  if (ALLOWED_ORIGINS.has(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, PUT, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "600";
  }
  return h;
}
function json(data,status,origin) {return new Response(JSON.stringify(data),{status,headers:headers(origin)});}
export default {
  async fetch(request,env) {
    const origin=request.headers.get("Origin")||"";
    if(request.method==="OPTIONS") {
      if(!ALLOWED_ORIGINS.has(origin))return json({error:"Origem não autorizada"},403,origin);
      return new Response(null,{status:204,headers:headers(origin)});
    }
    // A API de escrita aceita somente o site oficial; CORS não é autenticação.
    if(!ALLOWED_ORIGINS.has(origin))return json({error:"Origem não autorizada"},403,origin);
    if(!env.DB)return json({error:"Banco indisponível"},503,origin);
    const url=new URL(request.url);
    const match=/^\/galleries\/([a-z0-9-]+)\/(results|ballots)$/.exec(url.pathname);
    if(!match||!Object.hasOwn(GALLERIES,match[1]))return json({error:"Galeria não encontrada"},404,origin);
    const gallery=match[1],kind=match[2],allowed=GALLERIES[gallery];
    try {
      if(kind==="results"&&request.method==="GET") {
        const rows=await env.DB.prepare("SELECT first_id,second_id,third_id FROM ballots WHERE gallery_id=?").bind(gallery).all();
        const scores=new Map(allowed.map(id=>[id,0]));
        for(const row of rows.results||[]) {
          for(const [id,points] of [[row.first_id,3],[row.second_id,2],[row.third_id,1]]) {
            if(scores.has(id))scores.set(id,scores.get(id)+points);
          }
        }
        return json({results:[...scores].map(([id,points])=>({id,points}))},200,origin);
      }
      if(kind==="ballots"&&request.method==="PUT") {
        const type=request.headers.get("Content-Type")||"";
        if(!/^application\/json(?:\s*;|$)/i.test(type))return json({error:"Tipo de conteúdo inválido"},415,origin);
        const length=Number(request.headers.get("Content-Length")||0);
        if(length>2048)return json({error:"Corpo muito grande"},413,origin);
        const raw=await request.text();
        if(raw.length>2048)return json({error:"Corpo muito grande"},413,origin);
        let data;
        try {data=JSON.parse(raw);}catch{return json({error:"JSON inválido"},400,origin);}
        if(!data||typeof data!=="object"||Array.isArray(data)||!UUID_RE.test(data.voterId||"")||
           !Array.isArray(data.choices)||data.choices.length!==3||
           new Set(data.choices).size!==3||!data.choices.every(id=>typeof id==="string"&&allowed.includes(id)))
          return json({error:"Voto inválido"},400,origin);
        await env.DB.prepare(
          "INSERT INTO ballots (gallery_id,voter_id,first_id,second_id,third_id) VALUES (?,?,?,?,?) "+
          "ON CONFLICT(gallery_id,voter_id) DO UPDATE SET first_id=excluded.first_id,second_id=excluded.second_id,third_id=excluded.third_id,updated_at=CURRENT_TIMESTAMP"
        ).bind(gallery,data.voterId,...data.choices).run();
        return json({ok:true},200,origin);
      }
      return json({error:"Método não permitido"},405,origin);
    }catch {
      return json({error:"Erro ao consultar ou gravar votos"},500,origin);
    }
  }
};
