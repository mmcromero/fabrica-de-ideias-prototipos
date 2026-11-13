# UX-FLOW-004 — Rodapé no fluxo e Configurações independentes do PDV

**Origem:** revisão do proprietário da experiência Produtos / PDV, 12/11/2026.  
**Estado:** implementado apenas no protótipo; **teste visual e funcional no navegador pendente**.  
**Destino:** continuidade UX e futura especificação do aplicativo, depois de homologação.  
**Próximo responsável:** proprietário verifica; assistente /pair corrige eventuais desvios, um de cada vez.

## Regras aprovadas
1. **Rodapé não fixo:** deve vir **depois de todo o conteúdo**, sem sobrepor nem reduzir a área útil do celular. Se houver conteúdo insuficiente, fica no fundo natural da janela. Vale para páginas públicas e internas. A barra operacional do PDV não se confunde com o rodapé institucional.
2. **Configurações gerais do sistema:** acesso pelo botão de Configurações no cabeçalho. Apresentar na **própria página** os grupos Geral/identidade, Produtos/estoque, PDV/pagamentos e Orçamentos/clientes/suporte. Não abrir a tela `pdv-settings` nem habilitar a navegação inferior PDV ao entrar pelas Configurações gerais.
3. **Configurações internas do PDV:** rota `pdv-settings` separada, acessível pelo fluxo **Mais → Configurações do PDV**. Preservar esta tela; a área geral pode reutilizar controles, mas não sua navegação.
4. **Botões do cabeçalho:** Alertas, Configurações e Sair ganham mudança de fundo ao passar mouse, pressionar/tocar e ao receber foco. Configurações fica marcada enquanto sua página estiver ativa. Alertas fica marcado enquanto o modal estiver aberto e desmarca ao fechar. Sair não tem estado persistente.
5. **Navegação de módulos:** ao entrar em Configurações gerais, desmarcar PDV. A tela de Configurações não é o PDV.
6. **Escopo:** somente protótipo estático. As opções ilustrativas de configuração não representam alterações reais no backend. Rodapé legal, Ajuda e Suporte técnico continuam preservados.

## Arquivos
- `index.html`: conteúdo por grupos da tela Configurações e regras responsivas de fluxo do rodapé e estados visuais dos botões.
- `produtos.js`: desmarcação do PDV no contexto Configurações gerais, estado de Alertas/Configurações e limpeza do estado do modal.
- Não alterar aplicativo real, Forja 01, Home Assistant ou dados dos usuários.

## Teste de aceite
- Mobile 360/390 px: lista longa deve empurrar rodapé para baixo; página curta deixa rodapé no fim da janela; não pode sobrepor a lista. Conferir login, Produtos e PDV.
- Desktop: repetir em tela curta e lista longa.
- Abrir Configurações no topo: fundo destacado, PDV desmarcado, grupos exibidos no conteúdo e sem barra inferior do PDV.
- Dentro do PDV, abrir **Mais → Configurações do PDV** e verificar que esse fluxo permanece independente.
- Alertas: realce enquanto aberto, retorna ao normal após fechar. Sair: realce somente durante hover/toque/foco.
- **Não homologar somente com verificação de código.** Aceite visual do proprietário pendente.
