# PROD-TECH-005 — Ficha técnica de fabricação (protótipo)

**Origem:** UX /pair — solicitação de montar área Dados de fabricação, sem inventar campos.
**Destino:** continuidade de homologação visual e, depois, Tech Lead / DEV.
**Estado:** IMPLEMENTADA NO LABORATÓRIO; HOMOLOGAÇÃO VISUAL PENDENTE.
**Próximo responsável:** proprietário testa a página de editar/cadastrar Produtos; /pair corrige somente os pontos reprovados.

## Fontes consultadas no repositório principal
- `apps/umdoislab/src/ProductForm.tsx` — seção colapsável de produção, etapa adicional e resultados
- `apps/umdoislab/src/ProductionFields.tsx` — materiais, referência cadastrada, consumo, custos e etiqueta
- `apps/umdoislab/src/MaterialFields.tsx` — nome, forma de custo, quantidade/unidade/preço da compra
- `apps/umdoislab/src/DurationFields.tsx` — horas/minutos/segundos
- `apps/umdoislab/src/ProductPackaging.tsx` — embalagem de custo manual ou cadastrada
- `apps/umdoislab/server/material-model.ts` — unidades, compatibilidade e cálculo proporcional
- `apps/umdoislab/server/manufacturing-model.ts` — modelos de etapas/custo, distinção entre custo e preços comerciais
- `apps/umdoislab/DOCS.md` — referência de materiais e edição conservadora

## Estrutura visual implementada
1. **Dados de fabricação (ficha técnica)**: seção opcional recolhida, com `Produção` e possibilidade de **Etapa adicional**.
2. **Tempo de máquina** e **Tempo de trabalho humano**: horas, minutos e segundos.
3. **Materiais utilizados**: botão **Adicionar material**, uma linha por material, remoção individual; aceitar repetições legítimas do mesmo material.
4. **Seleção de material cadastrado**: ao escolher referência, nome/forma de custo/quantidade de compra/unidade/preço ficam em **leitura**; só quantidade e unidade utilizada continuam editáveis. Alterar referência deve ser feito no cadastro de materiais do Estoque no aplicativo real.
5. **Material novo**: nome, forma de custo (`Preço por quantidade comprada` ou `Custo direto em reais`); se quantidade, quantidade da compra, unidade da compra, nome da unidade própria (se selecionada) e preço pago; quantidade utilizada e unidade compatível. Se custo direto, `Custo utilizado (R$)`.
6. **Conversões** preservadas: g/kg, ml/l, mm/cm/m e unidades; massa não se converte em volume, comprimento nem unidade específica. Custos proporcionais seguem o modelo existente, sem arredondar consumo intermediário.
7. **Embalagem do produto**: custo manual ou referência cadastrada classificada em Estoque como embalagem do produto. Evitar contagem dupla. Cadastro de classificação e compra não é simulado no laboratório; sem materiais classificados, a opção cadastrada fica pendente de dados reais.
8. **Etiqueta (R$)** conforme o formulário existente.
9. **Resultados calculados**: prévia do subtotal referente a materiais, embalagem e etiqueta. Custo total e três preços calculados não são simulados sem parâmetros reais. Preços comerciais só se alteram por escolha explícita.
10. **Edição**: dados da ficha e referências locais são preservados ao salvar o produto no `localStorage` do navegador. Materiais novos completos podem ser reutilizados em outra ficha do protótipo.
11. **Dados anteriores do protótipo**: texto livre legado de materiais/observações é preservado em leitura; não é descartado nem interpretado como estrutura técnica sem decisão do usuário.

## Limites técnicos explícitos
- **Somente laboratório público e dados demonstrativos**: não há integração com a base real de Materiais e Estoque, compras/lotes, movimentos físicos, fabricação concluída ou backend de preços.
- Em produção, as referências atuais e os custos históricos são preservados segundo as regras do motor; este protótipo não substitui a API.
- Não alterar o PDV, Forja 01, repositório principal, schemas ou bancos.
- A origem Consignado continua disponível na ficha comercial do protótipo, mas **não cria ficha de fabricação própria para mercadoria recebida de terceiro** sem análise do Tech Lead.

## Aceite pendente
- No desktop e mobile, abrir **Produtos → Novo produto → Dados de fabricação**.
- Adicionar dois materiais; usar um custo por compra (ex.: kg/g) e outro custo direto. Conferir unidades, custo e remoção.
- Salvar produto, editar novamente e selecionar um material agora cadastrado. Conferir referência somente leitura e consumo editável.
- Ativar/desativar etapa adicional; testar embalagem manual, etiqueta e preservação de valores.
- Verificar que produto pode ser salvo sem ficha técnica e sem alterar preços.
- Comparar com `ProductionFields.tsx` e `MaterialFields.tsx` antes de aprovação final; **nenhum teste visual no navegador foi realizado nesta entrega**.

**Comunicação:** documentação REGISTRADA no PR deste laboratório. Não declarar homologação nem distribuição automática ao Tech Lead.
