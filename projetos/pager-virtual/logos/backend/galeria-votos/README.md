# GALERIA-VOTO-001 — Backend compartilhado (Cloudflare Workers + D1)

## Estado
Código de API, banco e testes preparado no PR #28. **Nenhum serviço foi provisionado e nenhum voto real foi gravado.**

## Arquitetura
- GitHub Pages: interface pública, sem credenciais.
- Worker: recebe três IDs distintos e um UUID por navegador, valida e grava a cédula.
- D1: chave primária `(gallery_id,voter_id)`, reenvio substitui cédula anterior.
- Ranking: pontos 3–2–1 calculados no servidor, sem revelar UUID.
- CORS restrito à origem `https://mmcromero.github.io`; **CORS não impede requisições externas forjadas**. Não é proteção contra fraude.
- IDs de galeria e logos ficam em `src/index.js`; para novas galerias, incluir configuração aprovada nesse registro e no JSON da galeria.
- Limites de uso e retenção precisam ser definidos antes de disponibilizar publicamente; a implementação não contém rate limiting por IP. O proprietário aceitou votação simples sem antifraude forte.

## Testes
Na pasta `backend/galeria-votos`, executar `npm install` e `npm test`. Os testes usam D1 simulado e verificam CORS, validação, pontuação e substituição; não substituem teste de integração D1 real.

## Ativação (última etapa; exige acesso à conta Cloudflare)
1. Entrar na conta Cloudflare e criar o banco D1 `fabrica-ideias-galeria-votos` (plano e limites devem ser confirmados na conta).
2. Preencher `database_id` real em `wrangler.toml` e descomentar `[[d1_databases]]`.
3. Executar migração `npm run db:remote` após verificar a conta e o banco de destino.
4. Publicar Worker com `npm run deploy`, confirmar domínio e testar GET/PUT no endpoint real.
5. Alterar `apiBaseUrl` em `projetos/pager-virtual/logos/galeria.json` para a URL HTTPS do Worker.
6. Validar votos reais de dois navegadores, substituição e ranking, antes de integrar e publicar a galeria.

Não inserir API token, credenciais ou dados pessoais no repositório. Não fazer merge nem deploy sem autorização.
