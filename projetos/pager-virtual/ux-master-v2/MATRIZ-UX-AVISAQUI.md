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
| Pareamento QR | Não implementado na main | QR temporário, autorização gerente/Master, prova de posse e entrega individual | PC mostra QR; gerente autoriza; agente confirma separadamente |
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
3. **Aprovado:** mostrar *autorização recebida*, **não** *vinculado* até a confirmação separada do agente.
4. **Resgate sem resposta:** consultar estado com o mesmo pedido; não emitir automaticamente nova credencial.
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
