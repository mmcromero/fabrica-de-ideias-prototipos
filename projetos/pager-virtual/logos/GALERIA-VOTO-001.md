# GALERIA-VOTO-001 v0.1 — Padrão reutilizável

Status: interface implementada em branch; persistência compartilhada pendente.

## Regras
- Cada visitante escolhe exatamente três logos distintos, na ordem: 1º = 3 pontos, 2º = 2 pontos, 3º = 1 ponto.
- A galeria exibe as regras no topo e não mostra pontos nos cartões.
- O ranking aparece somente no rodapé, em painel `details` fechado por padrão.
- O visitante pode rever e reenviar as escolhas; o backend deve **substituir** a cédula anterior do mesmo identificador, nunca somar duas vezes.
- Sem login. Identificador aleatório por navegador, guardado em localStorage; não impede fraude, limpeza de dados ou múltiplos dispositivos.
- Cada galeria usa um identificador único e uma lista fixa de logos.

## Reutilização
Copiar/adaptar `galeria-votos.js`, `galeria-votos.css` e `galeria.json` para a pasta de logos de cada projeto, preservando caminhos relativos. Cada cartão tem `data-logo-id`, `data-logo-label` e um botão `.vote-pick`.

## API mínima necessária (ainda não configurada)
`GET {apiBaseUrl}/galleries/{galleryId}/results` → `{ "results": [{"id":"logo-id","points":3}] }`.

`PUT {apiBaseUrl}/galleries/{galleryId}/ballots` → JSON `{"voterId":"UUID","choices":["id-1","id-2","id-3"]}`.

O servidor deve validar origem/CORS, galeria, três IDs distintos e válidos, tamanho dos campos, formato do identificador e limite de requisições. A gravação deve ser atômica, substituindo a votação anterior por `(galleryId,voterId)`. O servidor calcula a pontuação; nunca aceita pontos enviados pelo cliente. Os resultados devem ser agregados sem expor identificadores. Não usar token secreto no HTML ou JS público.

Enquanto `apiBaseUrl` for `null`, os controles permitem escolher os favoritos, mas **não permitem enviar** nem exibem contagem fictícia. Para ativar votos compartilhados é necessário provisionar e testar um serviço de persistência, com autorização separada para serviço externo.

## Validação pendente
Testes em navegador desktop/mobile e integração real da API. Não declarar votação compartilhada ativa antes disso.
