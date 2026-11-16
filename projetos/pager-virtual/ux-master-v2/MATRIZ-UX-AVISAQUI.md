# AVISAQUI — Matriz funcional do protótipo UX

**Referências conferidas:** `mmcromero/pager-virtual` (`main`), `docs/AVISAQUI_PRINT_APP_001.md`, `src/routes/integracao-impressao.js`, especificação AVISAQUI-PAIR-001 v0.1 (PR #16, comentário #6903159572), parecer de Segurança/Arquitetura #6903317586 e passagem UX 2/2. Pacote de desenvolvimento: RC 002 (`release/avisaqui-rc-002`).  
**Destino:** laboratório estático `projetos/pager-virtual/ux-master-v2/`. **Não é especificação de API aprovada nem código de produção.**

## Regras de trabalho

- Prints da versão 0.1.18-rc.1 mostram **o estado atual**, não aprovam o comportamento futuro.
- Manter os recursos existentes que continuam necessários; não reproduzir a rotina antiga como se fosse o novo fluxo.
- O seletor superior do protótipo é o ponto único de navegação; as quatro etapas internas do pareamento pertencem a **Integração de impressão**.
- Não houve aprovação para mudar impressão física, Home Assistant, Windows, servidor, banco ou RC 002.
- Dados fictícios, sem chamadas a API, autenticação, segredos ou persistência; ações são demonstrações visuais.

## Matriz de telas

| Área do menu | Fonte atual / referência | Comportamento no protótipo | Situação |
|---|---|---|---|
| Master Admin | `src/public/admin.html` RC 002 | Restaurantes, interessados, ajustes e acessos; revisão mobile aprovada parcialmente | Protótipo UX |
| Gerente | `src/public/admin.html` | Terminais, acesso ao KDS, minha conta e gestão de computadores | Protótipo UX |
| KDS | `src/public/kds.html` | Pedidos, chamada, finalização, QR do pedido, pedido manual e numeração | Simulação fiel à referência, não homologada |
| Cliente | `src/public/cliente.html` | Acompanhamento e estado do pedido | Simulação simplificada; fidelidade visual ainda pendente |
| Landing | `src/public/landing.html` | Apresentação e interesse no piloto | Simulação simplificada; fidelidade ainda pendente |
| Login | `src/public/login.html` | Entrada por perfis demonstrativos, sem autenticar | Simulação simplificada |
| Primeiro acesso | `src/public/setup.html` | Cadastro fictício demonstrativo | Simulação simplificada |
| Integração de impressão | `src/public/impressao.html` + AVISAQUI-PAIR-001 | Novo pareamento como caminho principal, recebimentos, pendências e agente Windows; credenciais anteriores em seção de migração | **Nova experiência proposta para revisão** |
| Pareamento de caixas | PR #16, comentários #6903159572 / #6903317586 | PC/QR, celular gerente, vinculados e conciliação dentro do navegador superior | **Nova experiência proposta para revisão** |

## Inventário funcional da impressão

| Função / regra | Existe hoje | Futuro aprovado / recomendado | Representação no laboratório |
|---|---|---|---|
| Chave manual do agente | `POST /api/integracoes/impressao/chave` | Preservar chaves legadas em migração aditiva; novos caixas por pareamento | Consulta recolhível de legado, sem criar chave real |
| Listagem de chaves | `GET /api/integracoes/impressao/chaves` | Gestão de computadores e credenciais individuais | Credencial anterior demonstrativa + computadores vinculados |
| Revogação de chave | `DELETE /api/integracoes/impressao/chaves/:id` | Revogação individual por computador e registro de eventos pendentes | Confirmação em ambas as áreas; sem apagar histórico |
| Eventos recentes | `GET /api/integracoes/impressao/eventos` | Exibir origem, caixa, evento, horários e situação, quando disponíveis | Histórico de eventos e pendências fictícias |
| Envio do agente | `POST /api/integracoes/impressao/pedidos` | Origem e dispositivo estáveis, idempotência, conciliação de números ativos | Apenas encenação visual, sem API |
| Pedido manual | KDS atual | Preservar a contingência | Tela KDS preservada |
| Impressão física | Separada do agente | Deve permanecer independente | Mensagem explicativa; nenhuma ação de impressão real |
| Pareamento QR | Não implementado na main | QR temporário, gerente autoriza, agente recebe e conclui sem intervenção humana | PC mostra QR; gerente autoriza; simulação conclui vínculo automaticamente após confirmação fictícia do agente |
| Código temporário | Não implementado | Alternativa ao QR, mesma solicitação | Campo demonstrativo e código fictício |
| Computadores vinculados | Não implementado | Nome editável, ID permanente, responsável, vínculo e comunicação separados | Gerenciamento demonstrativo |
| Conciliação | Registro `PENDENTE_DUPLICADO`, sem resolução completa na UI | Enviar KDS / Já entregue / Manter para revisão conforme permissão e contrato | Tela de pendências com confirmação; não cria chamadas |

## Contratos técnicos e rotas: não confundir atual com futuro

**Rotas confirmadas na main, apenas leitura de código:**
- `POST /api/integracoes/impressao/chave`
- `GET /api/integracoes/impressao/chaves`
- `DELETE /api/integracoes/impressao/chaves/:id`
- `GET /api/integracoes/impressao/eventos`
- `POST /api/integracoes/impressao/pedidos`

**Rotas propostas na especificação, ainda NÃO implementadas / NÃO homologadas:**
- `POST /api/agentes/pareamentos`: solicitar vínculo.
- `GET /api/agentes/pareamentos/:id/estado`: consultar estado da solicitação.
- `POST /api/gerente/agentes/pareamentos/:id/aprovar|recusar`: decisão autenticada.
- `POST /api/agentes/pareamentos/:id/resgatar`: prova de posse, confirmação segura e resgate idempotente.
- `GET/PATCH/DELETE /api/gerente/agentes/dispositivos/:id`: consultar/renomear/revogar dispositivos.

Os nomes e contratos finais são responsabilidade do Tech Lead. **Não gerar requisições para essas URLs no protótipo.**

## Estados e regras de UX

1. **Aguardando:** PC mostra QR e código da mesma solicitação, nome sugerido e prazo demonstrativo.
2. **Sem sessão:** login do gerente no próprio celular; operador e gerente de outro restaurante não autorizam.
3. **Aprovado:** mostrar *autorização aprovada*, **não** *vinculado* até confirmação técnica do agente. No fluxo comercial, o agente conclui automaticamente, sem exigir botão ou nova confirmação no PC.
4. **Resgate sem resposta:** o aplicativo recupera automaticamente a mesma operação protegida quando a conexão volta; não emitir outra credencial. O botão de consulta é apenas um cenário de laboratório.
5. **Vinculado:** nome/ID do caixa, aprovador, vínculo e comunicação separados.
6. **Expirado/recusado/cancelado:** invalidar apresentação da solicitação; oferecer nova sem reaproveitar dados antigos.
7. **Revogado:** bloquear novos envios na solução real, sem apagar eventos, sem afetar outros caixas.
8. **Duplicado:** não presumir pedido entregue e não gerar chamadas indistinguíveis; mostrar informações para análise e decisões humanas.
9. **Offline:** informação de falha, preservação de pendências e impressão física independente.

## Dependências aguardando Tech Lead / Segurança / Windows

- Contratos finais e mapeamento exato das respostas de API e HTTP.
- Expiração, tamanho do código, tentativas e tratamento concorrente: **5 minutos / 8 dígitos / 5 tentativas são propostas, não parâmetros homologados**.
- Critério temporal para mostrar comunicação online/offline; sem o critério, exibir *comunicação não verificada*.
- Chave de posse, resgate idempotente após perda de resposta, recuperação/reinstalação e conta Windows real.
- Controle de acesso por restaurante, login, CSRF e trilha de auditoria.
- Migração aditiva de chaves anteriores, revogação de eventos pendentes e substituição de computador.
- Política definitiva da conciliação, inclusive pedidos antigos, manuais, reimpressão e dois caixas com o mesmo número.
- Confirmação do agente Windows sobre telas ou textos que dependam de sua implementação.

## Pendências UX já identificadas

- Revisão fiel das telas **cliente**, **landing**, **login** e **primeiro acesso**: continuam resumidas no laboratório.
- Imagem do restaurante na listagem Master Admin (pedido anterior do proprietário).
- Homologação mobile 320–430 px e desktop, foco dos modais, navegação de teclado, mensagens de erro e novos fluxos.
- Aprovação visual de cada alteração antes de transformar o protótipo em interface real.

**Estado:** especificação e protótipo de UX em evolução; implantação real bloqueada até o processo de aprovação. O código do laboratório não comprova conformidade de back-end, Segurança ou Windows.

## Atualização de UX — passagem Equipe X / Windows (15/11/2026)

Fonte recebida: GOV-COM-003, devolutiva Arquitetura e Segurança para Equipe X, PR #23 e contrato Windows v0.2 em `docs/AVISAQUI_PAIR_001_CONTRATO_WINDOWS.md` (branch `feat/avisaqui-pair-001-nucleo`). **Esta fonte autoriza continuidade isolada, não merge, deploy ou distribuição comercial.**

| Necessidade | Comportamento no laboratório | Dependência real |
|---|---|---|
| Download Windows | Botão `Baixar Avisaqui para Windows` desativado até existir uma versão aprovada; versão, data, disponibilidade, erro e cenário fictício de versão aprovada | Registro e artefato imutável, armazenamento durável, sessão gerente/master, integridade/proveniência, aprovação manual de publicação |
| QR e código | Continuam na etapa do PC, sem senha/credencial; código fictício de 8 dígitos | Contratos finais QR, expiração, desafios e limites de abuso |
| Aprovação mobile | Exige confirmação do gerente/Master na simulação; perfis sem permissão ou restaurante diferente são recusados visualmente | Autenticação, CSRF e isolamento real |
| Conclusão de vínculo | Após aprovação, transição visual para `aprovado` e `vinculado` **automática** na simulação, sem clique adicional no computador | API transacional + cliente Windows + prova de posse + ACK, resgate seguro |
| Falha de rede | Estado de aprovação é preservado; nova consulta ou restauração simulam recuperar a operação original, sem emitir segunda credencial | Envelopamento criptografado de resposta, confirmação e recuperação idempotente aprovados em contrato único |
| Credenciais antigas | Área de migração e revogação permanece; nenhum legado é invalidado automaticamente | Migração aditiva aprovada |

**Contratos ainda não homologados:** o contrato Windows v0.2 descreve Ed25519 e prova `avisaqui-pair-proof-v1`, mas o parecer posterior exige desafio por operação de uso único e resposta protegida/idempotente. Backend e Windows devem fechar juntos formato, finalidade, expiração, ACK, chaves e recuperação; **o protótipo não implementa criptografia**. Propostas iniciais de 8 dígitos, 5 minutos, 5 tentativas e consulta de 5 segundos não são limites homologados.

**Distribuição:** não existe versão comercial aprovada, URL final ou arquivo Windows autorizado nesta fonte. O protótipo não publica e não oferece downloads de executáveis. A simulação de disponibilidade não deve ser interpretada como autorização real.

**Pendente:** testes de acesso, estado, segurança, contratos, disponibilidade, UX mobile e compatibilidade de captura/Windows. Impressão física e contingência manual não são alteradas.

## Identidade visual e contexto de restaurante — revisão UX

**Decisão do proprietário:** toda tela operada no contexto de um restaurante deve mostrar **nome + logotipo** de forma visível, inclusive quando o Master Admin seleciona um restaurante. Não basta o logotipo do próprio Avisaqui.

**Protótipo unificado:** a lista geral do Master não indica restaurante ativo; ao acionar **Entrar** em um restaurante, a seleção passa para KDS e é preservada ao navegar por Gerente, Integração de impressão e Pareamento. Um cabeçalho de contexto informa nome, imagem demonstrativa, papel e identificador. A seleção de outro restaurante altera o cabeçalho e a lista demonstrativa de caixas, sem reutilizar os dispositivos do anterior. A etapa de autorização mobile repete o nome do restaurante.

**Sem logo real:** neste laboratório foram criados dois logotipos **fictícios** de demonstração para Restaurante Exemplo e Café Demonstrativo. Restaurantes novos recebem imagem ilustrativa de reserva. Não existe envio, guarda ou serviço de logos implementado no Avisaqui real por esta mudança.

**Responsabilidades futuras:** Tech Lead/Backend deve fornecer restaurante e URL/arquivo de logo autorizados por sessão e isolamento entre estabelecimentos. Windows deve refletir a identidade validada após o vínculo; antes disso, nome do restaurante é apenas o contexto da solicitação a confirmar. Nenhuma mensagem visual deve substituir verificação server-side de restaurante. Homologação visual mobile/desktop e dados reais permanecem pendentes.

## Padrão de cabeçalho operacional — revisão visual 16/11/2026

**Decisão visual do proprietário:** em todas as páginas internas com sessão, o **logo oficial Avisaqui** aparece na primeira faixa, à esquerda, e o botão **Sair** na mesma faixa, à direita. O **contexto do restaurante (logo, nome e papel/identificador)** vem imediatamente abaixo. O conteúdo começa após essa identificação.

**Aplicação no laboratório:** Master Admin já utiliza marca e Sair no cabeçalho (sem indicar restaurante ativo na lista geral); Gerente, KDS, Integração de impressão e Pareamento passaram a utilizar o mesmo padrão. O retorno ao KDS, abrir KDS e retorno à impressão permanecem nas ações próprias do conteúdo. O pareamento aberto fora do iframe também exibe marca, Sair e contexto na mesma ordem. Ao incorporar o pareamento no navegador principal, seu cabeçalho próprio permanece oculto para evitar duplicidade.

**Exceções de contexto:** landing, login, primeiro acesso e página pública do cliente não representam uma sessão administrativa; preservam entrada/voltar em vez de inserir um logout fictício. O primeiro acesso passou a mostrar o logo Avisaqui na parte superior.

**Limites:** Sair é navegação demonstrativa, não encerramento de sessão real. O laboratório continua isolado da API e do Windows. A conformidade visual em telas móveis e desktop precisa de homologação em navegador.
