# Estúdio de Branding — referência atualizada

Interface reutilizável GALERIA-VOTO-001 do Avisaqui (PR #28 integrado; JS blob `4a62fc41a3269d563163296dee504eced7994163`). A integração de produção Cloudflare Workers + D1 foi configurada após essa implementação. Esta POC usa exclusivamente participantes fictícios, cálculo 3–2–1 e substituição da escolha no modelo local; não acessa o serviço real, não provisiona infraestrutura, não comprova operação multi-dispositivo. As escolhas podem permanecer neste navegador. Teste isolado: ranking inicial 18 pontos; após voto 24; após substituição 24; duplicatas rejeitadas. Validação visual pendente.

## Correção de visualização — 22/11/2026

Os dez SVGs estavam presentes na pasta, mas eram apresentados por elementos `object`, cuja renderização pode falhar em navegadores móveis. Substituídos por imagens `img` com o SVG original incorporado como data URI, dimensões explícitas e redimensionamento responsivo. Os dez conteúdos incorporados foram decodificados e comparados integralmente com os arquivos originais; todos coincidem. Os links para abrir SVGs, os modos de fundo e os identificadores de votação permanecem intactos. CSP não permite mais objetos; rede continua bloqueada. Homologação visual em navegador móvel ainda não comprovada.
