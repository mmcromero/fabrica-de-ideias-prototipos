# Central Instagram e Editorial — Protótipo UX 0.1.50

**Referência de interface:** revisão de UX do protótipo após o lote de Caixa de entrada, alinhada às decisões do `CENTRAL-DESIGN-SYSTEM-001` e `UX-STD-001` do produto real (`mmcromero/instagram-automacoes`, branch `desenvolvimento`). O protótipo permanece um laboratório demonstrativo, não a fonte canônica do produto.

## Padrões aplicados
- App Shell sem sidebar, com três destinos principais no cabeçalho: Caixa de entrada, Editorial e Configurações Meta.
- Seletor global de conta no cabeçalho; não existe destino separado de Contas conectadas.
- Caixa de entrada é destino direto, sem submenu.
- Editorial possui submenu local abaixo do título de cada tela, usando o mesmo componente visual e espaçamento das abas de Configurações Meta: Visão geral, Calendário, Criar publicação, Biblioteca, Revisão e envios e Histórico. Não existe submenu editorial no topo global.
- Configurações Meta possui abas internas: Conexão, Diagnósticos, Ferramentas e Atendimento.
- A ação Adicionar conta aparece no cabeçalho da página Configurações Meta.
- Cabeçalho compacto; título, ações contextuais e submenu seguem o mesmo alinhamento e ritmo vertical nas áreas Editorial e Configurações Meta. No mobile, as abas internas rolam horizontalmente.

## Correspondência com o produto
A estrutura de Configurações Meta segue o padrão de abas locais documentado em `interface_ui.py` no produto real. O conteúdo deste protótipo é demonstrativo e não representa leitura de OAuth, permissões, diagnósticos, atendimento ou APIs reais.

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
