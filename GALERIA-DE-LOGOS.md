# Galerias de logotipos — padrão público da Fábrica de Ideias

## Finalidade e limites
Use este documento ao iniciar um projeto com conceitos de marca, comparação de logos ou votação. Este repositório é **público**: publique somente artes, protótipos e dados demonstrativos autorizados. Informações sensíveis, decisões internas, documentação privada, código de produto e credenciais pertencem ao **repositório específico do projeto**, com acesso adequado. Consulte também o [README](README.md).

## Exemplo implementado
- Galeria navegável: [Bipou/Avisaqui](projetos/pager-virtual/logos/index.html).
- Configuração: `projetos/pager-virtual/logos/galeria.json`.
- Interface reutilizável: `galeria-votos.js` e `galeria-votos.css`.
- Estrutura de cartão: `data-logo-id`, `data-logo-label`, botão `.vote-pick`.
- Documentação inicial: [GALERIA-VOTO-001](projetos/pager-virtual/logos/GALERIA-VOTO-001.md).
- Backend de referência: `projetos/pager-virtual/logos/backend/galeria-votos/` (Cloudflare Worker + D1).

**Estado confirmado:** a galeria Bipou/Avisaqui foi conectada ao Worker/D1 e a votação foi exercitada no navegador. O botão visual foi aprovado. Isso **não** significa que o componente esteja empacotado como biblioteca independente ou que outra galeria funcione sem adaptação.

## Comportamento de referência
1. Mostrar logos com prévia SVG, descrição pública e links para ativos autorizados.
2. Permitir selecionar exatamente três logos distintos, em ordem: 1º vale 3 pontos, 2º vale 2 e 3º vale 1.
3. Mostrar o estado da seleção no próprio cartão, com botão destacado e acessível. Preservar o estilo visual aprovado na galeria de referência.
4. Mostrar o ranking somente em painel recolhido ao fim da página, sem pontuação em cada cartão.
5. Permitir reenviar o voto: para o mesmo identificador de navegador, o backend substitui a cédula anterior, sem duplicar. A seleção local fica no `localStorage`.

## Reutilizar em um novo projeto
1. Criar ou usar `projetos/<id>/`, sem modificar projetos vizinhos.
2. Preparar a galeria com arquivos SVG públicos e metadados sem dados privados.
3. Adaptar a estrutura do `index.html` de referência e os três arquivos `galeria-votos.js`, `galeria-votos.css`, `galeria.json`. Manter os caminhos relativos, atributos de cada cartão e seletores usados pelo JavaScript.
4. Definir `id` de galeria exclusivo e IDs únicos para os logos em `galeria.json`. Conferir correspondência exata com os cartões.
5. Se houver votação compartilhada, registrar a nova galeria e seus logos na configuração `GALLERIES` do Worker, após autorização e revisão técnica; configurar `apiBaseUrl` com URL HTTPS aprovada. Não alterar o backend em produção só por copiar a interface.
6. Testar no navegador desktop e celular: imagens, seleção, remoção, três escolhas, envio, reenvio, resultado e estado de erro. Se não houver API, manter `apiBaseUrl: null` e o envio desabilitado; nunca simular votos reais.
7. Usar branch e PR; integrar e publicar somente após autorização conforme README.

## Segurança e limitações
- O Worker aceita apenas a origem configurada por CORS, mas **CORS não autentica votantes** nem impede requisições forjadas.
- A identificação por navegador não garante uma pessoa = um voto; outro navegador ou limpeza de armazenamento permite novo identificador.
- O backend de referência usa lista fixa de galerias/logos; não há cadastro automático nem painel administrativo para zerar votos.
- O endpoint de resultados da versão de referência lê cédulas para somar pontos; revisar escalabilidade e limites antes de uso em grande volume.
- Não colocar tokens, dados pessoais, informações internas ou configurações secretas em HTML, CSS, JS, SVG, JSON, documentação ou commits públicos.
- O armazenamento compartilhado é um serviço externo: exige autorização, configuração, proteção e testes próprios.

## Próxima evolução possível (não implementada)
Extrair a interface para um pacote reutilizável, registrar novas galerias por configuração validada e criar painel administrativo autenticado para gestão e reinício da votação. Essas funções não devem ser anunciadas como existentes.
