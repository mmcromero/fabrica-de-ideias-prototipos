# GALERIA-VOTO-001 v0.1 — Padrão reutilizável

Status: galeria Bipou/Avisaqui publicada e conectada ao Cloudflare Worker + D1; interface visual aprovada. Reutilização exige configuração específica para cada nova galeria. Consulte também [guia geral](../../../GALERIA-DE-LOGOS.md).

## Regras
- Cada visitante escolhe exatamente três logos distintos, na ordem: 1º = 3 pontos, 2º = 2 pontos, 3º = 1 ponto.
- A galeria exibe as regras no topo e não mostra pontos nos cartões.
- O ranking aparece somente no rodapé, em painel `details` fechado por padrão.
- O visitante pode rever e reenviar as escolhas; o backend deve **substituir** a cédula anterior do mesmo identificador, nunca somar duas vezes.
- Sem login. Identificador aleatório por navegador, guardado em localStorage; não impede fraude, limpeza de dados ou múltiplos dispositivos.
- Cada galeria usa um identificador único e uma lista fixa de logos.

## Reutilização
Copiar/adaptar `galeria-votos.js`, `galeria-votos.css` e `galeria.json` para a pasta de logos de cada projeto, preservando caminhos relativos. Cada cartão tem `data-logo-id`, `data-logo-label` e um botão `.vote-pick`.

## API utilizada na galeria de referência
`GET {apiBaseUrl}/galleries/{galleryId}/results` → `{ "results": [{"id":"logo-id","points":3}] }`.

`PUT {apiBaseUrl}/galleries/{galleryId}/ballots` → JSON `{"voterId":"UUID","choices":["id-1","id-2","id-3"]}`.

O servidor deve validar origem/CORS, galeria, três IDs distintos e válidos, tamanho dos campos, formato do identificador e limite de requisições. A gravação deve ser atômica, substituindo a votação anterior por `(galleryId,voterId)`. O servidor calcula a pontuação; nunca aceita pontos enviados pelo cliente. Os resultados devem ser agregados sem expor identificadores. Não usar token secreto no HTML ou JS público.

Na galeria Bipou/Avisaqui, `apiBaseUrl` aponta para o Worker público já configurado. Em uma galeria nova, `apiBaseUrl: null` mantém o envio desabilitado até que o serviço de persistência seja autorizado, configurado e testado. Nunca exibir votos fictícios como reais.

## Validação e limites
A leitura e gravação real foram verificadas por retorno da API; a interface foi exercitada no navegador e o botão foi aprovado visualmente. Não há evidência de homologação completa em todos os navegadores e tamanhos de tela, nem teste de carga. A API atual não possui proteção forte contra múltiplos votos ou painel administrativo. O código de referência não é um pacote independente: novos IDs de galeria e logos exigem registro no Worker. **Não publicar dados sensíveis neste repositório público.**
