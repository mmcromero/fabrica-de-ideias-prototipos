# Avisaqui — laboratório fiel RC4 (não publicado)

## Referência confirmada
- Origem: `mmcromero/pager-virtual`, commit `8d789e98e04577f6f8b7518b5bf3b183bc31a19c`, versão `0.1.20-rc.4`.
- Origem dos arquivos: `src/public/` (22 arquivos).
- Destino isolado: `projetos/pager-virtual/ha-rc4/` no repositório público do laboratório.
- A versão em execução no Home Assistant foi **relatada pelo Work**, não inspecionada independentemente nesta execução.

## Fidelidade e isolamento
- Os **15 arquivos de recurso (JS de bibliotecas/jogos, SVG, manifestos)** apresentam SHA Git blob igual ao original.
- Os **7 documentos HTML** preservam a estrutura, estilos e JavaScript do produto, exceto inserção de `mock-api.js` e ajuste do prefixo de API em `login.html`, `setup.html`, `admin.html`, `impressao.html` para aceitar o caminho do GitHub Pages. Portanto, esses sete HTML **não são byte a byte idênticos**.
- `index.html` replica `landing.html`, como entrada do protótipo.
- `mock-api.js` intercepta chamadas HTTP de API, simula perfis, pedidos, estados, sequência, histórico, restaurante, terminais e integração sem conexão ao backend real. Recursos externos ficam sem operação.
- Dados de pedidos são **fictícios**, mantidos no armazenamento local do navegador para navegação entre abas; nenhuma credencial real ou banco de produção é utilizado.
- Botão flutuante `Prévia` dá acesso às telas reais `landing`, `login`, `admin`, `kds`, `impressao`, `cliente` e `setup`, sem redesenhar os arquivos-base.

## Acesso fictício (somente após publicação autorizada)
- Perfis: `master`, `gerente`, `operador`.
- Senha fictícia: `AvisaquiDemo123!`.
- Endereço planejado do Pages: `https://mmcromero.github.io/fabrica-de-ideias-prototipos/projetos/pager-virtual/ha-rc4/`.
- Não é a página antiga `projetos/pager-virtual/index.html`.

## Verificações executadas
- Git tree: 22 arquivos originais presentes, 15 blobs idênticos, 7 HTML com diferenças localizadas na integração.
- Parser JavaScript: sete telas com scripts inline e camada mock com sintaxe válida.
- Sete verificações funcionais isoladas do mock: login master, gerente, operador; senha inválida; cadastro manual; alteração de status; bloqueio de origem HTTP externa.
- Caminhos, recursos e scripts relativos conferidos por inspeção estática.

## Limitações e próximos passos
- **Não houve teste real em navegador, celular ou comparação de pixels.** Não homologar a interface visual nem declarar equivalência operacional completa.
- A landing e as telas podem conter funcionalidades de navegador desativadas ou simuladas de forma diferente do produto real. Não usar como produção.
- Não integrar PR nem substituir o card da vitrine até autorização expressa e validação visual.
- Nenhum arquivo do aplicativo privado, do Home Assistant ou de outros produtos foi alterado.
