# Fábrica de Ideias — Protótipos

Laboratório **público** de interfaces estáticas. Este repositório serve apenas para visualização de protótipos; os códigos e dados de desenvolvimento permanecem nos repositórios próprios, preferencialmente privados.

## Para qualquer chatbot ou agente que publicar aqui

**Leia este README inteiro antes de modificar arquivos.** Estas regras são aplicáveis a qualquer projeto, inclusive Artesão Digital, Pode Vir e projetos futuros.

### 1. Verificação obrigatória antes de escrever
1. Confira o repositório exato: `mmcromero/fabrica-de-ideias-prototipos`.
2. Leia a `main` atual, este README, `prototipos.json` e os arquivos da pasta do seu projeto.
3. Confira se o identificador do projeto já existe. Se existir, **atualize a pasta existente**, sem criar duplicatas.
4. Confirme que o conteúdo a publicar não inclui segredos, tokens, dados reais de clientes, informações internas, código de servidor ou integrações com produção.
5. Se não tiver acesso de escrita, entregue os arquivos prontos e informe o que falta; não alegue ter publicado.

### 2. Regra obrigatória: repositório público, sem informações sensíveis
**Todo conteúdo deste repositório é público e pode ser copiado, indexado e preservado no histórico do Git.** Use-o somente para protótipos, apresentações públicas, artes e dados demonstrativos autorizados.

**É proibido incluir:** senhas, tokens, chaves de API, credenciais, dados pessoais ou de clientes, dados comerciais confidenciais, documentos internos, arquitetura sensível, backups, arquivos de produção, informações estratégicas não públicas ou código privado do produto.

**Destino correto:** documentação interna, decisões privadas, código de aplicação, integrações e dados sensíveis devem permanecer no **repositório específico do projeto**, com visibilidade e controles de acesso adequados. Não copie esses conteúdos para cá para facilitar a demonstração. O protótipo pode usar dados fictícios e interfaces simuladas, sem revelar a implementação privada.

Antes de publicar, revise também imagens, SVGs, comentários, JSON, arquivos de configuração e histórico de alterações. Se encontrar um segredo já publicado, interrompa a divulgação e trate sua revogação e remoção com os responsáveis; apagar o arquivo no próximo commit não elimina o histórico.

### 3. Pastas e nomes
- Cada projeto tem uma pasta exclusiva: `projetos/<id>/`.
- O `id` usa apenas letras minúsculas de a-z, números e hífens; exemplo: `artesao-digital`.
- A página principal de cada projeto é `projetos/<id>/index.html`.
- Arquivos adicionais (CSS, JS, imagens) ficam **dentro da pasta do próprio projeto**.
- Use links relativos, para funcionar sob `/fabrica-de-ideias-prototipos/` no GitHub Pages.
- Não edite, apague ou reorganize pastas de outros projetos.
- Não crie rotas antigas ou redirecionamentos de legado sem solicitação explícita.

### 4. Catálogo automático
O arquivo `prototipos.json` é a fonte de dados da vitrine. Para incluir ou atualizar um projeto, edite apenas seu registro, preservando todos os demais. Campos obrigatórios:
- `id`: identificador único da pasta;
- `nome`: título exibido no card;
- `descricao`: resumo público, sem informações confidenciais;
- `status`: texto curto, por exemplo `prototipo` ou `em-revisao`;
- `publicado`: booleano; somente `true` aparece na vitrine;
- `ordem`: número para ordenar os cards;
- `icone`: nome visual opcional; a vitrine possui fallback;
- `caminho`: **exatamente** `projetos/<id>/`.

A página inicial carrega o JSON e cria os cards automaticamente. **Não edite `index.html` para adicionar projetos.** Edite a página inicial apenas quando a alteração solicitada for no laboratório em si.

### 5. Fluxo de publicação seguro
1. Crie uma branch com nome descritivo, como `prototype/<id>-<objetivo>`, a partir da `main` mais recente.
2. Modifique somente `projetos/<id>/...` e seu registro em `prototipos.json`.
3. Teste sintaxe do JSON, existência de `index.html`, links relativos, navegação em celular e desktop e ausência de segredos.
4. Abra um Pull Request para `main`, com resumo, arquivos alterados, testes e limitações.
5. **Não faça merge, publique em produção ou mude configurações do Pages sem autorização explícita do proprietário.**
6. Antes de integrar, confira se `main` ou `prototipos.json` mudou desde a criação da branch. Se mudou, atualize sua branch e preserve os registros de outros projetos.
7. Após merge autorizado, verifique o endereço publicado e o card da vitrine. Um PR criado não equivale a publicação.

### 6. Segurança e limites
- GitHub Pages hospeda arquivos estáticos, não backend, banco de dados ou autenticação segura.
- Formulários e dados demonstrativos devem ser fictícios. Não solicite senhas reais.
- Não publique código proprietário do repositório privado sem autorização para aquele conteúdo.
- Não use dependências externas ou serviços novos sem aprovação.
- Não altere repositórios de desenvolvimento ou servidores ao publicar uma demo.
- Cada protótipo deve deixar claro quando é apenas demonstração.

### 7. Endereços
- Laboratório: https://mmcromero.github.io/fabrica-de-ideias-prototipos/
- Exemplo: https://mmcromero.github.io/fabrica-de-ideias-prototipos/projetos/pode-vir/

### 8. Identidade visual
A marca **Fábrica de Ideias** pertence à página do laboratório. As páginas de cada protótipo mantêm a identidade própria de seus produtos. A imagem de marca oficial deve ser publicada como ativo revisado, sem substituições improvisadas.

### 9. Galerias de logotipos e votação
- Consulte [GALERIA-DE-LOGOS.md](GALERIA-DE-LOGOS.md) antes de criar uma galeria.
- O exemplo funcional Bipou/Avisaqui fica em `projetos/pager-virtual/logos/`.
- A seleção de três favoritos e o ranking usam arquivos de interface reutilizáveis; **não existe ainda um componente plug-and-play totalmente independente**.
- Para ativar uma nova galeria, é necessário configurar IDs exclusivos, arquivos da interface e registro explícito no backend, sem compartilhar dados entre galerias.
- Não inclua segredos nem detalhes privados do projeto nos arquivos públicos da galeria.

### 10. Checklist de entrega
- [ ] README e catálogo lidos na versão atual
- [ ] Pasta exclusiva do projeto, sem alterações nos demais
- [ ] Catálogo válido e registro sem duplicação
- [ ] Dados sintéticos, nenhum segredo e informações privadas guardadas no repositório específico do projeto
- [ ] Para galerias, documentação e IDs conferidos
- [ ] Links relativos e telas verificadas
- [ ] PR criado, sem merge não autorizado
- [ ] URL pública verificada **após** publicação autorizada
