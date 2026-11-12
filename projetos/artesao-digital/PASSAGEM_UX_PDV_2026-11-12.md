# Artesão Digital — passagem de bastão UX/PDV
**Data:** 12/11/2026 (BRT)  
**Identificação:** PAIR-PROT-001 / UX-PDV — continuidade do Chat 2  
**Origem:** UX do PDV — Chat 2  
**Destino:** próximo chat ou profissional que retomar a homologação  
**Assunto:** estado do protótipo navegável e ponto exato de pausa  
**Situação:** REGISTRADA; **correção 1 integrada, HOMOLOGAÇÃO VISUAL PENDENTE**  
**Próximo responsável:** UX/PO em teste de navegador; assistente /pair executa correções posteriores, uma por vez.

## LEIA PRIMEIRO: ponto de retomada
**Não iniciar correção 2.** O último ajuste foi a **Correção 1: barra horizontal dos módulos no desktop**. PR [#8](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/8), merge `fdc1008095626eb4ef982be430493319df888777`. O assistente confirmou os arquivos na `main` e a sintaxe JS; **o proprietário ainda não confirmou visualmente a correção**. Não afirmar que foi homologada ou que o Pages foi inspecionado visualmente.

**Primeiro teste ao retomar:** abrir o [protótipo](https://mmcromero.github.io/fabrica-de-ideias-prototipos/projetos/artesao-digital/?rev=fdc1008), entrar, conferir no **desktop** se há uma barra **Produtos | PDV** diretamente abaixo do header, em linha horizontal e sem hambúrguer; conferir que no **mobile** a navegação por menu hambúrguer permanece. Pedir somente o resultado deste teste. Se houver desvio, corrigir **somente este ponto**, integrar ao laboratório e testar novamente. Se aprovado, registrar aprovação e passar ao próximo item apontado pelo proprietário.

## Método de trabalho aprovado
- **/pair v2.0 ativo** nesta continuidade: sem Codex, Work ou agentes externos de programação; ChatGPT atua em pair programming com ferramentas diretas disponíveis.
- Fluxo obrigatório: **proprietário aponta um erro → assistente corrige somente esse erro → testa o que puder → cria branch/PR → publica após autorização vigente do proprietário → fornece link → proprietário confere → só então próximo erro**.
- O proprietário **já autorizou expressamente a rotina de correções e publicação do protótipo**, sem pedir nova autorização repetida para cada correção dentro deste escopo. Fora do protótipo, exigir autorização específica.
- **Protótipo navegável é a base visual/estrutural para a implementação futura**. O Codex deverá reproduzir os elementos e padrões homologados, sem simplificar ou reinterpretar. Não substituir imagens originais por redesenhos.
- Não acumular uma lista de correções para implementar em lote. Não dar por aprovado um teste não executado pelo proprietário.

## Escopo e repositório
- Laboratório público: `mmcromero/fabrica-de-ideias-prototipos`.
- Pasta canônica: `projetos/artesao-digital/` (não usar o caminho legado `pdv-v3/` para novas alterações).
- Página: `index.html`; Produtos: `produtos.js`, `produtos.css`; ativos na pasta do projeto.
- Catálogo da vitrine: `prototipos.json`. As regras vigentes de branch, PR, privacidade e publicação estão no **README.md da main** e devem ser relidas antes de editar.
- O GitHub Pages é **estático e demonstrativo**: não há login real, credenciais reais ou backend. Não publicar dados pessoais, tokens nem código interno.
- **Não alterar** o aplicativo de produção, `mmcromero/fabricacao_e_orcamentos`, o Forja 01 ou o Home Assistant como parte desta homologação; não tocar em outros projetos do laboratório.
- PRs passados: [#3](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/3) estrutura oficial integrada; [#6](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/6) módulo Produtos integrado, merge `27d718de53f22fe3401edf04609d2540de7838d4`; [#8](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/8) correção menu desktop, merge `fdc1008095626eb4ef982be430493319df888777`.

## Fluxo integrado em teste
**Landing simulada → inscrição ou login → Produtos (página inicial após entrar) → PDV → Sair/logout → destino de acesso.**
- A landing contém opções para cadastrar e entrar. Formulários e login são demonstrativos.
- Produtos é o módulo inicial pós-login; inclui catálogo, busca/filtros, inclusão/edição e informações de fabricação opcionais.
- PDV é o foco da homologação visual. Preservar regras funcionais já aprovadas e a referência visual original.
- No código consultado em 12/11/2026, a ação `exit-pdv` faz `go('login')`, portanto o destino **implementado** do logout é a tela de login. **Falta testar e aprovar** esse comportamento no navegador.
- A execução real e completa do fluxo desktop/mobile **não foi homologada nesta conversa**.

## Correção 1: regra visual específica
Em 12/11/2026, o proprietário enviou captura como **referência apenas da faixa horizontal de módulos em PC**. Ignorar o header antigo, alertas e botão Sair daquela imagem.
- **Desktop:** barra de módulos horizontal **logo abaixo do cabeçalho principal**, com **somente Produtos e PDV por enquanto**, mas expansível a módulos futuros. Sem menu hambúrguer no desktop.
- **Mobile:** menu hambúrguer para navegação de módulos. Não copiar o menu completo de módulos antigos; funcionalidades ativas atuais são apenas Produtos e PDV.
- **Preservar o header atual** do protótipo (logotipo, alertas, configurações, Sair).
- PR #8 acrescentou `.ap-module-nav` em `produtos.css` e lógica da navegação em `produtos.js`, sem modificar o código real do aplicativo. Verificação estrutural e sintaxe JS foram aprovadas, mas **não há aceite visual do proprietário**.

## Outras decisões preservadas (não implementar agora sem chegar ao ponto correspondente)
- Páginas públicas de inscrição, login e convite compartilham **um rodapé único** com links legais e acesso administrativo; após login o acesso administrativo deixa de aparecer.
- Área autenticada: evitar repetição dos links legais e avisos de demonstração indevidos.
- Botão Google: símbolo multicolorido e apresentação própria; no protótipo é simulado.
- PDV com fluxo de vendas em quatro etapas e regras aprovadas de carrinho, descontos, sessões, Pix, offline, estoque, pagamentos e consignação. As regras detalhadas devem ser buscadas no histórico/documentação antes de alterar essas áreas.
- A arte `Fluxo de Vendas do Artesão Digital.png` e `pdv_artesao_digital_ux_v2.html` foram citadas como referências originais. **Seu conteúdo não foi integralmente recuperado nesta retomada**. Não alegar comparação pixel a pixel ou homologação fiel sem obter os arquivos.
- A implementação do aplicativo real tinha duplicação de rodapé em `dev.28`, registrada para correção futura; alterações no protótipo não resolvem automaticamente a aplicação real.

## Evidência, limitações e rastreabilidade
- A leitura do README atual, `prototipos.json`, PR #6 e PR #8 foi realizada em 12/11/2026. O PR #8 está integrado; arquivos foram relidos após merge.
- A versão pública do Pages pode ter atraso de atualização/cache. A presença dos arquivos na `main` **não comprova** renderização ou navegação correta no navegador.
- Referência histórica adicional: [Issue #10 do aplicativo](https://github.com/mmcromero/fabricacao_e_orcamentos/issues/10), onde foram anotadas etapas anteriores da prototipagem. Não criar Issue duplicada.
- Esta passagem documenta **o que foi confirmado, o que foi relatado e o que está pendente**. Não concede autorização para alterar o aplicativo real.

## Comando sugerido para o próximo chat
`/pair — Leia projetos/artesao-digital/PASSAGEM_UX_PDV_2026-11-12.md e README.md do repositório mmcromero/fabrica-de-ideias-prototipos. Continue exatamente na validação visual da Correção 1 (menu Produtos | PDV no desktop), sem iniciar outro ajuste antes do aceite. Corrija e publique um ponto por vez no laboratório, sem tocar no aplicativo real.`
