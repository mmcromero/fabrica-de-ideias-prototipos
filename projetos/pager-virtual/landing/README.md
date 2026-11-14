# Avisaqui — Landing page pública e passagem de bastão

**Data:** 14/11/2026  
**Estado:** documentação preparada; homologação visual e funcional ainda pendente  
**Origem:** revisão da landing page com o proprietário  
**Destino:** Tech Lead / UX  
**Próximo responsável:** Tech Lead para revisão de escopo e UX para homologação

## Identidade aprovada
- **Nome oficial:** **Avisaqui** (uma palavra, A maiúsculo, demais letras minúsculas). Nunca escrever “Avisa Aqui” como marca.
- **Slogan:** **O AVISO QUE CHEGA NA HORA**.
- **Marca:** “Sino amigável”, chamada de opção 4 na aprovação; arquivo original `../logos/opcao-5-avisaqui-acolhedor.svg` (numeração do arquivo diferente da opção aprovada). **Não alterar o original.**
- **Identificadores legados:** `pager-virtual` e Bipou permanecem em caminhos/repositórios e histórico técnico. Não renomear caminhos sem plano de migração.
- **Identidade visual:** fundo azul-marinho, sino em tons de laranja, detalhes verdes, tipografia branca. Preservar coordenadas do sino, pêndulo verde, nome e slogan.

## Arquivos públicos
- `index.html` nesta pasta: landing page estática, responsiva, CSS/JS incorporados.
- `avisaqui-marca.svg`: **derivação visual** do SVG aprovado, mantendo símbolo/nome e slogan nas coordenadas originais, removendo selos e alegações antigas de domínio. Não é substituição do original.
- `../index.html`: protótipo anterior de KDS acessado pelo login demonstrativo.
- `../logos/opcao-5-avisaqui-acolhedor.svg`: SVG original aprovado, preservado.

**Página:** https://mmcromero.github.io/fabrica-de-ideias-prototipos/projetos/pager-virtual/landing/  
**Protótipo KDS:** https://mmcromero.github.io/fabrica-de-ideias-prototipos/projetos/pager-virtual/

## Estrutura da landing
1. Barra de navegação, marca textual e acesso demonstrativo.
2. Hero com marca, proposta de valor, CTAs e ilustração de pedido pronto.
3. Vantagens sobre o pager físico.
4. Como funciona: registro, QR Code, acompanhamento e aviso.
5. **Sinal fraco? A gente pensou nisso.** — seção aprovada sobre arquitetura leve.
6. Painel KDS e recursos ilustrativos.
7. Integração com PDV, com detalhes em acordeão.
8. Acessibilidade como objetivo, não certificação.
9. Chamada de interesse no piloto, rodapé e login demonstrativo.

### Texto aprovado sobre conexão limitada
**Sinal fraco? A gente pensou nisso.**

Nem todo lugar tem uma conexão perfeita. Por isso, o Avisaqui foi desenvolvido com uma estrutura leve, que utiliza poucos dados e transmite apenas as informações necessárias.

Tudo para facilitar o acompanhamento dos pedidos, mesmo em locais onde o sinal de internet é limitado, como praças de alimentação e subsolos de shoppings.

*O funcionamento depende de uma conexão ativa com a internet, por Wi-Fi ou rede móvel. A entrega dos avisos não é garantida durante a ausência de conexão.*

A arquitetura privada prevê cliente leve, dados mínimos no QR/link e SSE para mudanças de estado. **Metas de peso e desempenho não são resultados medidos/homologados.** Não prometer funcionamento sem internet nem entrega garantida.

## UX e acessibilidade
- Mobile-first; até 900 px, menu compacto com botão **Menu**, `aria-expanded`, `aria-controls`, Escape, clique fora e fechamento após selecionar link.
- Desktop mantém links horizontais.
- Acordeão de PDV em fluxo de página, fechado por padrão; fechamento por clique externo ou saída de foco.
- Login demonstrativo com usuário/senha fictícios, **sem autenticação real**; redireciona ao protótipo KDS.
- Sem garantias de vibração, som ou notificações com aparelho bloqueado; dependem de navegador, permissões e testes.
- WCAG 2.1 AA é referência de projeto, **não conformidade certificada**.
- CTA de interesse abre `mailto:` **sem destinatário definido**; não captura leads. Necessita decisão antes de divulgação comercial.

## Histórico de implementação — repositório público
| PR | Alteração |
|---|---|
| [#30](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/30) | Landing inicial |
| [#31](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/31) | Correção de recorte do logo |
| [#32](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/32) | Posição original do slogan e preservação do sino |
| [#33](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/33) | Seção sobre sinal fraco |
| [#34](https://github.com/mmcromero/fabrica-de-ideias-prototipos/pull/34) | Menu mobile compacto e acessível |

Os PRs #30–#34 foram integrados à `main`. Isso **não comprova** homologação visual, publicação Pages acessível ou funcionamento em todos os navegadores.

## Divergências com o escopo canônico do piloto — atenção P0
A documentação privada `docs/PROD_MODOS_001_PLANOS_E_CONCESSOES.md` prevalece para comunicação. O piloto aprovado é **somente** QR individual, acompanhamento do pedido e aviso de pronto, com acesso temporário e controlado. **Não anunciar** como entregues no piloto WhatsApp manual, captura automática de PDV/nota, planos futuros, preços, fila virtual ou recursos ainda não homologados.

**Divergência identificada:** a landing atual ainda exibe seções/menções a WhatsApp manual e integração PDV, mesmo com ressalvas, e descreve capacidades de KDS além da oferta aprovada. **Revisão editorial pelo Tech Lead e UX necessária antes de uso comercial.** Não alterar silenciosamente o escopo de produto; separar demonstração futura de oferta do piloto.

## Verificações pendentes
- [ ] Inspecionar a página publicada em GitHub Pages e registrar evidência.
- [ ] Homologar 360, 390, 768, 900, 901 e 1280 px, sem rolagem horizontal ou corte.
- [ ] Testar abertura/fechamento do menu por toque, teclado e leitor de tela.
- [ ] Testar links, acordeão, login demonstrativo e CTAs.
- [ ] Revisar texto público contra PROD-MODOS-001 e corrigir divergências após aprovação.
- [ ] Definir destino real do CTA de inscrição, sem coletar dados antes de política aprovada.
- [ ] Verificar contraste, foco, rótulos, WCAG e redução de movimento.
- [ ] Validar tamanho real da página e comunicação sob conexão limitada antes de alegar desempenho.

**Limites:** esta documentação não autoriza modificar a aplicação privada, alterar servidor, publicar Home Assistant ou declarar homologação.
