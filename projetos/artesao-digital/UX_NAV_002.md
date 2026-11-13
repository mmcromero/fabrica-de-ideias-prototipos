# UX-NAV-002 — Menu principal mobile do Artesão Digital

**Estado:** implementado no protótipo, aguardando homologação visual e funcional do proprietário.  
**Origem:** decisão do proprietário na revisão de Produtos/PDV de 12/11/2026.  
**Destino futuro:** Governança / especificação canônica do aplicativo, após aceite.

## Comportamento aprovado para o protótipo
- **Desktop:** barra horizontal de módulos diretamente abaixo do cabeçalho; módulos iniciais: Produtos e PDV.
- **Mobile:** botão hambúrguer no cabeçalho abre painel lateral esquerdo **sobre** a tela, com fundo escurecido; menu de módulos sem duplicação no rodapé.
- O painel contém **Produtos** e **PDV**, fecha quando o usuário escolhe um módulo e só então navega.
- Pode fechar pelo botão X, ao clicar fora do painel ou pela tecla Esc. Tecla Tab mantém foco dentro do menu enquanto estiver aberto; ao fechar, foco retorna ao botão de abertura.
- A barra inferior de navegação não aparece na **tela de entrada do PDV**, porque não é o menu principal de módulos.
- **Controles internos do PDV** (ex.: Catálogo, Carrinho, Mais durante venda) não foram removidos: serão revistos separadamente na homologação do PDV. Não confundir com o menu principal do aplicativo.
- **Desktop e mobile são estados responsivos diferentes**, usando breakpoint de 768 px existente no protótipo.
- Preservar telas públicas, cadastro, Produtos, PDV e logout. Não tocar em servidores ou aplicativo real.

## Implementação
- `produtos.js`: criação e eventos do painel lateral; navegação; fechar ao selecionar; esconder barra inferior na entrada do PDV.
- `produtos.css`: camada, painel, fundo escuro, foco, animação e versão de movimento reduzido.
- Regras do laboratório: `README.md` na raiz e arquivo `UX_HEADER_001.md` na pasta do projeto.
- Teste estático e sintaxe **não substituem** inspeção visual mobile.

## Próximo teste (apenas este ponto)
1. No celular: entrar em Produtos, tocar no hambúrguer; verificar painel lateral por cima do conteúdo.
2. Escolher PDV: confirmar fechamento do painel e navegação. Reabrir e escolher Produtos; confirmar fechamento.
3. Verificar X e toque fora; conferir que a entrada do PDV não tem barra de navegação inferior de módulos.
4. No computador: confirmar barra horizontal de módulos e ausência de hambúrguer.
5. **Não avançar para nova mudança sem o aceite do proprietário.**
