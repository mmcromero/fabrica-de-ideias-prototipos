# PROD-UX-003 — Produtos: lista, origens, estoque, catálogo e ações em lote

**Estado:** protótipo implementado para teste visual e funcional; **não homologado**.  
**Origem:** decisões do proprietário na revisão de Produtos, 12/11/2026.  
**Destino posterior:** Tech Lead, Governança e Codex de desenvolvimento; **não executar mudança no aplicativo real por este documento**.  
**Próximo responsável:** proprietário testa a UI; /pair corrige o ponto reprovado.  

## 1. Objetivo e padrões visuais
- Produtos e PDV compartilham o cabeçalho `moduleHeading`, navegação desktop/mobile e identidade visual.
- Desktop: tabela compacta com foto, produto/SKU e três faixas de preço, categoria, origem, estoque, No catálogo e ações.
- Mobile: linhas compactas; busca visível; dois botões lado a lado, **Filtros** e **Ações em lote**. Cada botão abre/fecha painel inferior e substitui o outro quando ativado.
- Desktop: **Ações em lote** expandem **abaixo da busca/filtros e acima da lista**, nunca no rodapé.
- A seleção das ações em lote é **independente** de No catálogo. Caixas individuais aparecem no modo lote; checkbox de catálogo aparece sempre.
- Pesquisa nome/SKU, filtros combináveis de origem/categoria; paginação padrão 10, opções 10/20/30/40/50; página volta à 1 ao mudar filtro. Preferência da demo armazenada localmente. Padrão do aplicativo real documentado em `apps/umdoislab/DOCS.md`: 10/20/30/40/50/Todos.

## 2. Origens e identidade — decisão nova do proprietário
- Três origens: **Próprio**, **De cliente**, **Consignado**.
- O **mesmo nome e SKU podem coexistir entre origens distintas**. Não são a mesma ficha nem o mesmo saldo.
- A demo usa IDs internos separados; proíbe repetir SKU dentro da mesma origem, admite SKU igual entre origens.
- **Ponto a detalhar no backend real:** chave técnica não deve ser somente SKU; usar ID único da ficha/posição e origem, e IDs de fornecedor/cliente/lote quando aplicáveis. Sem migração automática ou junção de saldos.
- Próprios: estoque do artesão; cliente: unidades destinadas/reservadas ao cliente, sem contar como disponibilidade comercial própria; consignados: estoque recebido de terceiros, com propriedade/repasse do terceiro.
- Cadastro da demo inclui origem, pessoa relacionada quando aplicável, quantidades por cor/variação, preços, marcação No catálogo; consignado inclui **repasse unitário ilustrativo**.
- **Limitação explícita:** a demo não modela remessas múltiplas, fornecedores múltiplos, reservas transacionais, movimentação física nem financeiro real; o número exibido é soma das variações da ficha local. Os valores e dados são fictícios. Não usar dados de clientes reais no Pages.

## 3. Regras de consignação existentes a preservar na implementação real
Fontes canônicas consultadas:
- `docs/especificacoes/Artesao_Digital_Especificacao_Consolidada_v2.md`
- `apps/umdoislab/pilot/B8-SESSOES-CONSIGNACOES.md`
- `docs/especificacoes/PROMPT_FINAL_CODEX_ARTESAO_DIGITAL.md`

**Divergência registrada:** essas fontes colocam consignados de terceiros exclusivamente no **Estoque**, fora do cadastro de Produtos. A nova orientação do proprietário pede cadastro/visibilidade de consignados **dentro da área Produtos**. A Governança/Tech Lead deve resolver a integração sem duplicar entidades nem perder históricos; esta mudança de navegação não autoriza migração destrutiva.

**Preservar ao integrar:**
- Recebimento consignado não é compra, não cria dívida imediata.
- Consignado possui fornecedor, quantidade por remessa/lote, preço e repasse **fixo por unidade**; congelar valor pactuado por remessa.
- FIFO por recebimento/lote ao consumir consignados, preservando acordos históricos.
- Venda baixa o saldo correto e gera obrigação de repasse separada da receita; desconto não diminui automaticamente o repasse.
- Prioridade no PDV quando próprio e consignado coexistem: **consumir próprio primeiro**, depois consignado; a interface pode apresentar linha única com rastreio interno de origem.
- Produto feito para cliente fica reservado, com destino e histórico; não virar estoque próprio nem catálogo público automaticamente. Transferência de excedentes exige decisão explícita.
- Múltiplos consignantes exigem rastreabilidade por origem, lote, quantidade e responsável.
- Regras do repasse por venda ou por recebimento efetivo precisam respeitar decisão comercial específica e fluxos do PDV; não simplificar por total genérico.

## 4. Catálogo, privacidade e aplicação futura
- `catalogVisible` controla a presença na seleção comercial do catálogo de produtos. Não se confunde com publicidade externa.
- Em documentos existentes, a marcação de catálogo **não autoriza divulgação pública**; produto de cliente pode ficar marcado, mas permanece privado e não vira estoque próprio.
- A regra informada pelo proprietário é disponibilizar itens marcados para PDV, orçamento e futura exportação selecionável por faixa de preço.
- **Atenção à integração real:** disponibilizar para escolha não autoriza automaticamente venda de estoque reservado de cliente; regras de origem, saldo e privacidade têm prioridade. A futura geração/compartilhamento de PDF ainda não está implementada no aplicativo.
- O protótipo grava marcação local na ficha, mas **não integra automaticamente filtros do PDV nem exporta PDF**. É necessário implementar e testar isso no motor real quando autorizado.

## 5. Ações em lote
- Modos de selecionar: individual, página atual e todos os resultados filtrados (inclui páginas não visíveis). Limpar seleção.
- Ações exibidas: arquivar (reversível e com histórico no aplicativo real), incluir/retirar catálogo, tornar privado; todas requerem confirmação.
- Cadastro e edição preservam filtros/independência de origem; ação mais (...) oferece Ver detalhes, Editar e Arquivar.
- Dados do protótipo são persistidos só em `localStorage`; confirmação no navegador é ilustrativa. Não simula concorrência, logs, rollback ou contratos da API.

## 6. Critérios para teste e homologação
1. Desktop: conferir cabeçalho idêntico ao PDV, largura, ordem da tabela, lista, filtros, paginação e painel de ações em lote **logo abaixo dos filtros**.
2. Celular: filtros e ações em lote em dois botões; abrir um substitui o outro; X/área externa fecha; seleção e catálogo são distintos.
3. Novo produto em cada origem, inclusive **SKU igual em origens diferentes**; validar rejeição do SKU duplicado na mesma origem.
4. Conferir quantidades por cor, atualização do saldo, filtro por origem, categoria, marcar/desmarcar catálogo e ações em lote.
5. Usar somente dados fictícios. Nenhum teste de navegação real foi realizado no GitHub Pages neste registro.
6. **Não declarar homologação até aceite visual do proprietário**. Não iniciar correções de outro módulo sem sua solicitação.

## 7. Arquivos do protótipo
- `produtos.js`: cadastro, modelo de demonstração, lista, ações e filtros.
- `produtos.css`: tabela desktop, cartões mobile, painéis inferiores.
- `index.html`: módulo anterior existente e cabeçalho compartilhado, preservados.
- `UX_HEADER_001.md`, `UX_NAV_002.md`: padrões compartilhados anteriores.

## 8. Encaminhamento à Governança (PREPARADO)
**Origem:** UX /pair. **Destino:** Gerência do Projeto/Governança → Tech Lead → DEV (Codex, após autorização).  
**Referência:** PROD-UX-003 e documentos canônicos indicados.  
**Ação:** decidir como a área Produtos incorpora a operação de cadastro e consulta de consignação hoje pertencente a Estoque, sem duplicação, perda de FIFO/repasse, mudanças silenciosas de SKU ou violação de privacidade. Consolidar documentação oficial antes de programar o aplicativo real.  
**Situação:** PREPARADA neste documento; **não afirmar ENVIADA ou RECEBIDA por outro chat**.
