# AVISAQUI — Referência visual única e matriz de integração (UX-M007)

**Situação:** RECONCILIADA EM BRANCH ISOLADA; REVISÃO VISUAL E INTEGRAÇÃO REAL PENDENTES  
**Data da leitura:** 16/11/2026  
**Branch de trabalho:** `prototype/avisaqui-landing-canonica-pr71-20261116`  
**Origem da branch:** PR #71 `eb7c951afa99e473f0356a29396b376a4f073406`, ainda `draft`, sem merge  
**Versão RC conferida:** `mmcromero/pager-virtual`, `release/avisaqui-rc-002`, HEAD `d3bb96f280f8d182f596bda35b4980d60ad74a37`.

## Decisão canônica de fidelidade

1. **Landing oficial, intocável:** `mmcromero/pager-virtual/src/public/landing.html`. Blob Git `5a001d4db706247ac0453cfe02f3e9b85d6627d5` em `main` e na RC 002. Não a reconstruir, simplificar ou substituir por arquivos de demonstração.
2. **Landing de navegação no protótipo:** a seleção «Landing» em `ux-master-v2/index.html` encaminha para `../landing/`, página completa publicada no laboratório. A versão pública é uma **derivação não idêntica** da landing oficial; há diferença de conteúdo/JS. Não afirmar equivalência exata.
3. **Referência operacional do protótipo:** `ux-master-v2/index.html` + `pareamento.html`, usando a linha de decisões já incorporadas à `main` (PRs #60–#70). O PR #71 foi preservado como **candidato de revisão apenas da impressão**. O seu conteúdo foi reaproveitado como ponto inicial da branch de trabalho, sem integrá-lo à `main`.
4. **Produto oficial:** implementar somente alterações visualmente aprovadas, mantendo rotas, dados persistentes, segurança e comportamento não alterado pelo proprietário. Protótipo não é código executável de produção e o PR #71 ainda exige aceite.

## Matriz tela a tela: protótipo → produto oficial

| Tela/área navegável | Fonte de UI no protótipo | Arquivo real RC 002 | Estado observado / ação |
|---|---|---|---|
| **Landing** | `../landing/index.html`; seção interna simplificada `#landing` preservada mas contornada pela navegação | `src/public/landing.html` | **Preservar original**, sem copiar a derivação pública. A diferença visual/textual é pendência do laboratório, não autorização para editar a landing privada |
| **Master Admin** | `ux-master-v2/index.html#master` | `src/public/admin.html` | Protótipo demonstrativo com gestão de restaurantes/interessados/configuração; integração real e comparação visual ainda pendentes |
| **Gerente** | `ux-master-v2/index.html#manager` | `src/public/admin.html` (visão por papel) | Protótipo demonstra contexto e navegação; controle de acesso e sessão real devem permanecer no backend |
| **KDS** | `ux-master-v2/index.html#kds` | `src/public/kds.html` | Visual simulado; manter pedidos, QR, contingência manual e regras reais até aceite detalhado |
| **Cliente** | `ux-master-v2/index.html#client` | `src/public/cliente.html` | **Simplificado**; não substituir HTML real por card demonstrativo. Preservar SSE, pedido pronto e jogos até comparação funcional |
| **Login** | `ux-master-v2/index.html#login` | `src/public/login.html` | **Simplificado**; login demonstrativo não substitui autenticação real |
| **Primeiro acesso** | `ux-master-v2/index.html#setup` | `src/public/setup.html` | **Simplificado**; não substituir fluxo de cadastro real. RC ainda traz título «Bipou», diferença textual a revisar, sem mudança automática |
| **Integração de impressão** | `ux-master-v2/index.html#printing` | `src/public/impressao.html` | **Descompasso funcional confirmado**: RC ainda tem seção de credencial/agente Windows anterior. Protótipo propõe caixas, novo pareamento, histórico e legado preservado. PR #71 é **draft** e tem ajustes específicos apenas desta tela, ainda sem aceite |
| **Pareamento de caixas** | `ux-master-v2/index.html#pairing` → `pareamento.html` | Módulos isolados nos PRs #23 (Windows) e #26 (Backend/UX); ausente na RC 002 | **Não integrado/homologado**. Requer API, sessão gerente, Origin/tenant, HTTPS, QR→aprovação→resgate→ACK e gate Windows, antes de ativação |

**Nota:** a existência de um arquivo na branch isolada não comprova que esteja na RC ou instalado no ambiente ativo.

## Arquivos conferidos e integridade

| Arquivo | Blob Git observado |
|---|---|
| RC `src/public/landing.html` | `5a001d4db706247ac0453cfe02f3e9b85d6627d5` |
| RC `src/public/admin.html` | `bf14af2302491273508b6599358ecd27d2b1bfc5` |
| RC `src/public/kds.html` | `3ecf401acf64aaed58c95af88ad0eec532af5dc8` |
| RC `src/public/cliente.html` | `3ee736bba683f2c7d38d427f13733c66c8d46010` |
| RC `src/public/login.html` | `bf2cc5221be672835641875f1b0efc32293525ac` |
| RC `src/public/setup.html` | `2249e7ca2491ea0c39e6a112780455e28c5709ca` |
| RC `src/public/impressao.html` | `bd36f6e91b352a44f77572a38f349297e54b8ccd` |
| Protótipo `ux-master-v2/pareamento.html` | `7a6d04183cc107f8ea4ec1c9138ed435b5055849` |
| Protótipo landing pública `landing/index.html` | `dbfa3eacff933de7716f667981817c4e36cc304e` |

## Regras de reconciliação de PR #71

- PR #71 alterou **somente** `ux-master-v2/index.html`. A alteração proposta mantém as outras áreas navegáveis e ajusta impressão, indisponibilidade de distribuição Windows, informações de comunicação não verificada, aviso de dados demonstrativos e controles de QA via `?qa=1`.
- A branch isolada **herda integralmente** essa revisão sem merge, e acrescenta apenas o desvio de navegação para a landing completa, no commit `c4c158ffedd05facb2fb1fd36d25c5c08a550ceb`.
- O conteúdo `#landing` simplificado continua preservado internamente, sem exclusão ou substituição destrutiva. **Não há permissão para apagar** antes de aceite e revisão da dependência de navegação.
- A homologação visual de impressão do PR #71 ainda não ocorreu; não chamar de aprovado apenas por estar na branch.

## Ordem de implementação real (após aceite técnico/visual)

1. **Congelar a referência visual aprovada**: landing oficial, cabeçalho e contexto de restaurante nas telas administrativas, navegação e impressão; garantir que a revisão do PR #71 recebeu parecer.
2. **Fechar backend e UI do pareamento** entre PR #23 / PR #26, mantendo a RC `release/avisaqui-rc-002` protegida até decisão do Tech Lead/Segurança. Preparar gestão de caixas com dados efetivos do restaurante, não com números/telemetria supostos.
3. **Preservar legados e funcionalidades atuais**: credenciais anteriores, eventos, KDS, cliente, QR, autenticação e impressão física independente; nenhuma migração destrutiva.
4. **Comparar o produto funcionando com cada tela aprovada** em navegador desktop e mobile; corrigir diferenças antes de GO de pacote, com CI final gratuito autorizado.
5. **Homologação Windows física exige autorização específica**. Sem publicação, deploy, impressão ou downloads comerciais durante a preparação.

## Divergências objetivas que permanecem

- Landing pública da Fábrica não é byte a byte igual à landing oficial, embora preserve grande parte da estrutura; o laboratório completo **não pode ser vendido como cópia perfeita** da produção.
- Cliente, Login e Primeiro acesso têm representações simplificadas e não são baseline visual fiel para sobrescrever suas telas reais.
- Impressão, status de caixas, autenticação gerencial e pareamento ainda não estão integrados/homologados na RC 002.
- Revisão visual interativa de `#printing` do PR #71 e comparação mobile/desktop em navegador real permanecem pendentes.
- CI GitHub Actions e instalação/deploy não são executados neste trabalho; política AVISAQUI-CI-CUSTO-001 de custo zero permanece vigente.

**Nenhuma autorização implícita para apagar arquivos, alterar landing, iniciar CI, fazer merge ou publicar.**

## UX-M008 — fidelidade visual dirigida: Cliente / Login / Primeiro acesso

**Commit de código:** `922574ba03a5fbbd33805f2940dc346b320047af` na branch isolada, sem merge/publicação.  
**Arquivo de interface alterado:** apenas `ux-master-v2/index.html`.  
**Novo blob verificado por releitura:** `45e31128b8ccc04ca2a425bb3ba87d4371fc1549`.

### Alterações demonstrativas (sem copiar API ou autenticação da RC)

- **Cliente:** estrutura aproximada da RC `src/public/cliente.html`: barra de acessibilidade (alto contraste, Texto A+), identificação do restaurante, cartão da senha de retirada, estado Em Preparo, texto explicativo, botão de aviso, diagnóstico e espaço dos jogos. Nenhum alerta push, SSE, jogos ou vibração real foi conectado. Os controles de acessibilidade alternam somente estilos locais.
- **Login:** cartão, cabeçalho, textos, usuário/senha, tamanhos, cores e botão de entrada aproximados da RC `src/public/login.html`. Seletor de perfil fictício preservado, recolhido sob «Escolher perfil da simulação», para manter demonstração de Master/Gerente/Operador. Não existe `fetch` de login nem sessão real.
- **Primeiro acesso:** estrutura de quatro campos, cartão, títulos e botões aproximados da RC `src/public/setup.html`; substituído o nome legado «Bipou» pelo nome de produto já aprovado «Avisaqui», **somente no protótipo**. Código de configuração é campo apenas ilustrativo; sem validação de token real, para evitar coleta de segredos. Formulário mantém simulação de navegação para login e mínimo demonstrativo de 12 caracteres para senha.
- **Preservação:** HTML das áreas Master, Gerente, KDS, Landing simplificada (contornada), Impressão PR #71 e Pareamento permaneceu byte a byte idêntico durante a substituição. Alterações adicionais restritas a CSS namespaced `.rc-*` e handlers demonstrativos de Cliente (som, acessibilidade, diagnóstico).
- **Landing:** a navegação canônica para `../landing/` continua. Blob da landing na branch permaneceu `dbfa3eacff933de7716f667981817c4e36cc304e`. Pareamento externo manteve blob `7a6d04183cc107f8ea4ec1c9138ed435b5055849`.

### Evidências e limites

Releitura do GitHub: nove seções de navegação presentes uma vez cada, formulários `login-form` e `setup-form` uma vez cada, um `</style>` e um `</script>`, controles de acessibilidade presentes, e referências de origem intactas. **Validação estática concluída**. Não houve teste visual de navegador, captura de tela, automação de fluxo, comparação pixel a pixel, API real nem homologação funcional; não afirmar equivalência visual perfeita.

**Pendências:** homologar Cliente mobile/desktop; confrontar comportamento de leitura de status, jogos e notificações; aceitar ou devolver a impressão do PR #71; fechar Login e Primeiro acesso com identidade visual e documentação de cadastro atuais; integrar tela gerencial e pair-v1 na RC somente sob gate de Tech Lead/Segurança. O protótipo público permanece sem publicação desta branch.
