import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
const origin="https://mmcromero.github.io";
const gallery="pager-virtual-bipou-avisaqui";
const base="https://example.workers.dev/galleries/"+gallery;
const rows=new Map();
const env={DB:{prepare(sql){let args=[];return {bind(...v){args=v;return this;},async all(){return {results:[...rows.values()].filter(x=>x.gallery_id===args[0])};},async run(){const [gallery_id,voter_id,first_id,second_id,third_id]=args;rows.set(gallery_id+":"+voter_id,{gallery_id,first_id,second_id,third_id});return {success:true};}};}}};
const ids=["bipou-cloche-acustica","bipou-monograma-b","avisaqui-sino-linear"];
const voter="123e4567-e89b-42d3-a456-426614174000";
function request(path,method="GET",body,site=origin){return worker.fetch(new Request(base+path,{method,headers:{"Origin":site,"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)}),env);}
test("rejeita origem externa",async()=>{const r=await request("/results","GET",undefined,"https://evil.example");assert.equal(r.status,403);});
test("CORS preflight permitido",async()=>{const r=await request("/ballots","OPTIONS");assert.equal(r.status,204);assert.equal(r.headers.get("Access-Control-Allow-Origin"),origin);});
test("rejeita voto repetido e ID inválido",async()=>{assert.equal((await request("/ballots","PUT",{voterId:voter,choices:[ids[0],ids[0],ids[2]]})).status,400);assert.equal((await request("/ballots","PUT",{voterId:voter,choices:[...ids.slice(0,2),"desconhecido"]})).status,400);});
test("registra, pontua e substitui sem duplicar",async()=>{
 assert.equal((await request("/ballots","PUT",{voterId:voter,choices:ids})).status,200);
 let r=await (await request("/results")).json();assert.equal(r.results.find(x=>x.id===ids[0]).points,3);
 assert.equal((await request("/ballots","PUT",{voterId:voter,choices:[ids[2],ids[1],ids[0]]})).status,200);
 r=await (await request("/results")).json();
 assert.equal(r.results.find(x=>x.id===ids[0]).points,1);
 assert.equal(r.results.find(x=>x.id===ids[2]).points,3);
});
