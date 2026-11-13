# Pager Virtual — Documentação Técnica & Estratégica

Este documento consolida a visão de produto, arquitetura técnica, modelo econômico e as estratégias de integração com PDVs legados do projeto **Pager Virtual**.

---

## 1. Visão Geral do Produto

* **Problema:** Pagers físicos de praça de alimentação ("discos voadores" de plástico) custam caro (R$ 1.500 a R$ 4.000 o kit), quebram com frequência, perdem alcance de rádio e são frequentemente furtados ou jogados no lixo com as bandejas.
* **Solução:** Um Pager 100% digital acionado via **QR Code impresso na nota fiscal / comanda** ou exibido no display do caixa.
* **Experiência do Cliente:** Sem download de aplicativo (Web pura). Acompanhamento de status em tempo real, alarme sonoro com Web Audio API, vibração no bolso e acessibilidade plena (leitores de tela TalkBack e VoiceOver).
* **Pós-venda:** A página converte-se em pesquisa de satisfação (NPS) e entrega de cupom promocional para a próxima visita.

---

## 2. Pilares de Acessibilidade (WCAG 2.1 AA)

1. **Leitores de Tela:** Uso de regiões dinâmicas `aria-live="assertive"` para anunciar em áudio cada transição de status ("Pedido #42 pronto para retirada no Balcão 02").
2. **Alertas Multissensoriais:**
   * **Visual:** Piscar tela com alto contraste e tamanho mínimo de fonte legível.
   * **Sonoro:** Síntese de frequências harmônicas (Web Audio API) que dispensam download de MP3 e contornam políticas de autoplay após primeiro toque.
   * **Háptico:** Padrão de vibração via `navigator.vibrate` para clientes com deficiência auditiva.
3. **Contraste e Escala:** Botões de alternância para alto contraste e ampliação de texto no cabeçalho.

---

## 3. Estratégias de Integração com PDVs (Sem Retrabalho no Balcão)

O maior desafio prático é evitar que o atendente precise digitar o pedido duas vezes (uma no PDV e outra no sistema de pager). Abaixo estão os métodos mapeados:

### A) Métodos "Fora da Caixinha" (Para Sistemas Legados Sem API / Webhook)

1. **Interceptador de Spooler de Impressão (Virtual Printer Driver) — ⭐ Recomendado:**
   * **Como funciona:** Um serviço leve de 5 MB instalado no Windows do caixa cria uma impressora virtual que recebe os comandos ESC/POS do PDV.
   * **Ação:** Lê os bytes brutos da impressão em milissegundos, extrai o número do pedido e os itens, envia para a API do Pager Virtual, **injeta os comandos do QR Code no rodapé da impressão** e despacha o documento para a impressora térmica física (Epson, Elgin, Bematech).
   * **Vantagem:** Funciona em 100% dos PDVs do mercado sem precisar de autorização, parceria ou liberação de código das fornecedoras de software.

2. **Leitor de Código de Barras na Cozinha (Baixa com 1 Bip):**
   * **Como funciona:** As comandas já impressas pelo restaurante costumam conter um código de barras com o número do pedido.
   * **Ação:** Um leitor óptico USB de R$ 60 fica na estufa/balcão de saída dos pratos. Ao terminar de montar a bandeja, o cozinheiro apenas passa o papel pelo laser. O bip dispara automaticamente a notificação no celular do cliente.
   * **Vantagem:** O cozinheiro não toca em telas com luvas engorduradas e a ação dura menos de 1 segundo.

3. **Hardware Sniffer USB/Serial (Dongle em Série):**
   * **Como funciona:** Um microcontrolador de baixo custo (ESP32 ou Raspberry Pi Pico W) conectado fisicamente entre o computador e a impressora térmica.
   * **Ação:** Intercepta o fluxo de dados serial/USB, captura o número do pedido e injeta o QR Code na impressão física.

4. **OCR Visual de Tela (Screen Scraper):**
   * Monitoramento de telas de KDS existentes via OCR leve (Tesseract) para identificar pedidos finalizados sem acesso ao banco de dados.

---

### B) Métodos Padrão (Sistemas com Integração Aberta)

1. **Webhooks de KDS:** Sistemas como Linx Degust, TOTVS Chef, Saipos e ConnectPlug disparam eventos HTTP quando um pedido é enviado à cozinha ou finalizado.
2. **API REST / GraphQL:** Conexão direta por endpoints autenticados para abertura e encerramento de comandas.

---

## 4. Arquitetura de Software & Custos (Tudo em BRL)

### Fase Piloto (Custo Zero)
* **Servidor:** Raspberry Pi 4 (8 GB de RAM) local rodando Docker.
* **Protocolo de Tempo Real:** Server-Sent Events (SSE) ou MQTT via WebSockets (baixo consumo de RAM/CPU).
* **Banco de Dados:** SQLite em modo WAL (Write-Ahead Logging).
* **Exposição Externa:** DuckDNS + Caddy/Nginx com certificado SSL gratuito (Let's Encrypt).

### Fase de Produção (Escala Comercial)
* **Hospedagem:** VPS Linux nacional (Hostinger Brasil, Locaweb ou KingHost) com cobrança fixa em Reais (R$ 40 a R$ 75/mês).
* **Domínio:** `.com.br` no Registro.br (R$ 40/ano).
* **Modelo de Negócio (SaaS B2B):** Assinatura de R$ 89,00 a R$ 119,00 / mês por restaurante (pedidos ilimitados).
* **Margem Bruta Estimada:** Superior a 90% a partir do quinto cliente pagante.

---

## 5. Estrutura de Arquivos no Repositório

```text
projetos/pager-virtual/
├── index.html                  # Painel do Restaurante / Display do Caixa com QR Code e Controles
├── cliente.html                # Visão Pura do Cliente (aberta via leitura do QR Code)
├── qrcode.min.js               # Gerador autônomo de QR Code local
├── mqtt.min.js                 # Biblioteca cliente para sincronização em tempo real
└── ARQUITETURA_E_INTEGRACOES.md # Este documento de referência técnica e estratégica
```

---
*Documento registrado e versionado no repositório `fabrica-de-ideias-prototipos` em 13/11/2026.*
