# Laboratório público dos jogos Avisaqui

Ambiente de homologação estático e simulado. Não conecta a pedidos reais, KDS, notificações ou servidor. O botão 'Simular pedido pronto' encerra o jogo em execução. O catálogo é consultado ao abrir a página ou selecionar 'Atualizar biblioteca'.

**Código público:** somente módulos de jogos, sem dados reais, credenciais ou código de servidor. Não substitui testes de integração do Avisaqui (Issue #21 do repositório privado).

**Estado:** PR em revisão. Não homologado nem publicado até merge autorizado.

## Jogos disponíveis nesta branch

1. **Pong** — primeiro no catálogo; adaptação **local e estática** da experiência Pong. O Pong original do Avisaqui utiliza API e SSE para conectar celulares; esta versão de laboratório NÃO valida esse multiplayer real. Modos: individual contra CPU e dupla no mesmo aparelho.
2. **Jogo da Velha** — individual contra CPU e dupla local.

Os jogos só são carregados após seleção. A simulação de pedido pronto encerra o jogo. O teste final em navegador móvel e a publicação no Pages ainda precisam ser confirmados.
