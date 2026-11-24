# Central Instagram e Editorial — Protótipo UX 0.1.47

**Referência de interface:** revisão de UX do protótipo após o lote de Caixa de entrada, alinhada às decisões do `CENTRAL-DESIGN-SYSTEM-001` e `UX-STD-001` do produto real (`mmcromero/instagram-automacoes`, branch `desenvolvimento`). O protótipo permanece um laboratório demonstrativo, não a fonte canônica do produto.

## Padrões aplicados
- App Shell com navegação agrupada em Editorial, Atendimento e Gestão.
- Identificação da conta fora da sidebar; seletor global fictício no cabeçalho.
- Breadcrumb compacto e título funcional único por tela.
- Barra de ações globais restrita à Visão geral; cada outra tela apresenta ações próprias do contexto.
- Caixa de entrada com uma única ação **Atualizar mensagens**, busca, filtros, lista e painel de conversa.
- Hierarquia de títulos e espaçamento estrutural compartilhados.
- Layout adaptativo; a navegação e os controles são demonstrativos.

## Escopo da revisão atual
A revisão reorganiza o shell, a hierarquia, as ações contextuais e os padrões compartilhados de página. Não redesenha em profundidade o editor, seus campos, prévia, agenda, operações de publicação, APIs ou regras de negócio. As telas restantes devem ser avaliadas em uso navegável; ajustes específicos serão priorizados por tarefa e evidência, sem alterar o produto real por consequência.

## Limites do protótipo
Contas, mensagens, publicações, mídia, configurações, filtros e ações são fictícios. Não há conexão Meta, OAuth, credenciais, rede, n8n ou backend real. Nenhuma ação publica, exclui ou envia mensagens ao Instagram. O seletor alterna apenas perfis fictícios.

O protótipo não substitui testes e homologação da aplicação real. Não usar dados exibidos aqui como evidência de funcionamento de integração.

## Fluxo de trabalho UX
Este protótipo é a bancada preferencial para avaliar e ajustar propostas visuais antes da implementação. Após aprovação visual do proprietário, mudanças aprovadas devem ser portadas para `mmcromero/instagram-automacoes`, branch permanente `desenvolvimento`, preservando APIs, contratos, rotas e funcionalidades. Correções de lógica/integração seguem coordenadas com a equipe responsável no produto real.

## Referências normativas
- [CENTRAL-DESIGN-SYSTEM-001](https://github.com/mmcromero/instagram-automacoes/blob/desenvolvimento/docs/ux/CENTRAL-DESIGN-SYSTEM-001.md)
- [CENTRAL-UX-ENGINEERING-REFERENCES-001](https://github.com/mmcromero/instagram-automacoes/blob/desenvolvimento/docs/ux/CENTRAL-UX-ENGINEERING-REFERENCES-001.md)
- [UX-STD-001 v0.1](https://github.com/mmcromero/instagram-automacoes/blob/desenvolvimento/docs/ux/UX-STD-001_v0.1.md)
- [PRODUTO-PRINCIPIOS-001](https://github.com/mmcromero/instagram-automacoes/blob/desenvolvimento/docs/PRODUTO-PRINCIPIOS-001.md)

## Validação
Alterações de fonte verificadas no GitHub. O deploy do Pages deve ser conferido separadamente. Teste visual em navegador, 320/360/390 px, tablet, desktop, teclado e dispositivo real ainda é necessário; não declarar homologação apenas pelo commit ou build.
