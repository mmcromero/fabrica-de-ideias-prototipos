# UX-NAV-002 — Navegação e rodapés do Artesão Digital
**Revisão:** 13/11/2026 — substitui o comportamento anterior de gaveta lateral.
**Estado:** implementado no protótipo; homologação visual e funcional pendente.
**Origem:** revisão visual do proprietário com capturas da aplicação atual.
**Escopo:** laboratório de protótipos, sem alterar aplicativo real.

## Navegação
- Desktop: barra clara abaixo do cabeçalho verde, com Produtos, PDV e Ajuda. Os demais módulos serão incluídos quando existirem no protótipo.
- Mobile: cabeçalho verde com logo atual da 12 Lab e controles. Imediatamente **abaixo**, uma barra clara apresenta o ícone e a palavra **Menu**.
- Ao tocar, a própria barra alterna para **Fechar menu** com X e expande verticalmente os itens de navegação abaixo dela, como na aplicação atual. Escape ou seleção recolhem a lista. Não usar gaveta sobreposta nem modal para o menu principal.
- Produtos e PDV direcionam ao módulo correspondente. Ajuda abre uma orientação demonstrativa identificada como protótipo; o sistema real mantém seu módulo próprio de Ajuda.
- Mobile mantém ocultos os botões horizontais do desktop.
- O menu principal é distinto dos controles operacionais internos do PDV; esses ficam para homologação específica.

## Rodapé
- As páginas **públicas** (inscrição, login, convite e administração de acesso) têm um único rodapé: Ajuda, Termos de Uso, Política de Privacidade, Política de Cookies e Acesso administrativo. A última linha identifica a demonstração; não inventar uma versão real.
- As áreas **internas** possuem rodapé próprio: Suporte técnico, Ajuda, Termos e Política de Privacidade e identificação do protótipo.
- O rodapé interno é um elemento **separado** das ações de venda do PDV; jamais substituir a barra de ações contextual.
- Suporte e Ajuda no laboratório são apenas modais explicativos: **não enviam chamados nem simulam sucesso de atendimento**. Os links legais apontam à origem pública canônica.
- Acesso administrativo não é exibido como link no rodapé autenticado. Não duplicar rodapés.
- O visual e os textos do protótipo não substituem regras oficiais de autenticação, suporte ou versionamento.

## Testes pendentes
1. Celular: conferir posição do logo, barra clara, Menu → Fechar menu, navegação/fechamento e Ajuda.
2. Desktop: verificar barra de módulos e Ajuda.
3. Inscrição, login e convite: um rodapé, links públicos e acesso administrativo.
4. Produtos, PDV e telas internas: rodapé comum, sem remover botões de venda específicos.
5. Confirmar nenhum deslocamento, corte de conteúdo ou sobreposição em 360 e 390 px.

**Fonte de comparação:** `apps/umdoislab/src/AreaNav.tsx` e `apps/umdoislab/pilot/DOCS.md`, além das capturas fornecidas pelo proprietário.

**Próximo responsável:** proprietário avalia no navegador; /pair corrige um ponto por vez. A versão final só é considerada homologada após aceite.
