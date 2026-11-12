# UX-HEADER-001 — Cabeçalho único de módulos (protótipo)

**Situação:** regra proposta e implementada no protótipo; **aceite visual desktop/mobile pendente**.
**Escopo:** somente `projetos/artesao-digital/` no laboratório público.
**Origem:** revisão dos prints Produtos e PDV de 12/11/2026.
**Próximo responsável:** proprietário, para homologação da troca Produtos ↔ PDV; assistente /pair para correções pontuais.

## Regra visual
1. A área superior de conteúdo de cada módulo deve manter **o mesmo ponto inicial horizontal e vertical**, mesma família tipográfica, tamanhos responsivos, peso, altura de linha, ícone e distância entre título e descrição.
2. Quando o usuário alternar os módulos, apenas o **ícone**, o **texto do título**, a **descrição** e o conteúdo próprio devem mudar. O cabeçalho não deve saltar de posição.
3. Desktop e mobile devem usar o **mesmo componente** com regras responsivas centralizadas, sem redefinir medidas em cada módulo.
4. Não incluir rótulos supérfluos como **“Seu negócio”**. Links redundantes para outros módulos não pertencem às ações primárias de uma tela.
5. Ações específicas (por exemplo `+ Novo produto`) não devem redefinir a tipografia ou o alinhamento do cabeçalho.

## Fonte única no protótipo
- `index.html`: função `moduleHeading(symbol,label,description)`, estrutura `.entry-heading`, título `.screen-title`, descrição `.muted`, regras responsivas existentes. O PDV usa essa função.
- `produtos.js`: a página inicial Produtos chama **a mesma função**, sem criar outro `h1` com estilo próprio.
- `produtos.css`: `.ap-root` utiliza largura/padding/fonte do contêiner principal; nenhuma regra local deve fixar fonte/tamanho de `.screen-title`.
- Novos módulos, como Orçamentos: devem chamar `moduleHeading(icone,titulo,descricao)`, **não copiar nem reimplementar** CSS do cabeçalho.

## Teste de aceite
- Em desktop, alternar **Produtos → PDV → Produtos** e observar o canto inicial do ícone, posição, tipografia e descrição (sem pulo).
- Repetir em celular; verificar quebra de linha e ações secundárias sem deslocar o título.
- Confirmar que `+ Novo produto` continua disponível e que não existe `Abrir PDV` redundante.
- **Só marcar VALIDADO depois de inspeção visual**. Verificação do código, publicação no Git e sintaxe não equivalem à homologação em navegador.

## Limites de governança
Esta é uma regra de UX **do protótipo**. Não substitui `docs/arquitetura.md` ou normas canônicas do projeto principal; a incorporação à especificação oficial do Artesão Digital depende de revisão da Governança. Não houve alteração no aplicativo real, Forja 01 ou Home Assistant.
