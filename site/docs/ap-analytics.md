# Accounts Payable Analytics

A demonstração web carrega `../data/payables.json`, com moeda BRL e data de referência no campo `asOf`. A base contém um título por linha, com emissão, vencimento, empresa, fornecedor, categoria, valor e data de pagamento opcional. O painel filtra o mês pelo vencimento e agrupa pagamentos pelo mês efetivo de pagamento.

## Modelo dimensional sugerido

- FatoTitulos, uma linha por invoiceId. Chaves para DimEmpresa, DimFornecedor e DimCategoria. Valor em decimal fixo.
- DimVencimento relacionada a dueDate, DimPagamento relacionada a paidDate e DimEmissao relacionada a issueDate. Cada dimensão tem calendário contínuo e chave de data única. Use relacionamentos 1:N, com filtro da dimensão para o fato.
- Referencia, tabela desconectada com a data de asOf. Uma mudança de referência altera o recorte de saldos e pagamentos.

## Power Query

1. Importe o JSON baixado pelo painel com a opção JSON. Use `Json.Document(File.Contents(CaminhoJSON))` com um parâmetro local para o caminho do arquivo.
2. Transforme a lista `invoices` com `Table.FromRecords(Fonte[invoices])`. Faça `Date.FromText(Fonte[asOf])` em consulta separada e converta em tabela de uma linha.
3. Defina IDs e dimensões como texto, datas como date e valor como Currency.Type. Preserve nulos em paidDate. Verifique ID único, valor positivo e vencimento posterior à emissão.
4. Crie dimensões por referência, selecionando apenas as chaves correspondentes, e remova duplicatas. Crie calendários com datas, ano, mês e uma coluna de ordenação ano-mês.
5. Para reproduzir as faixas de aging no snapshot fixo, calcule `Duration.Days(Referencia - [dueDate])`, atribua rótulos e ordene por índice. Para aging com referência variável, use medida com limites de faixa desconectados.

## DAX sugerido

Convenção abaixo usa vírgula como separador de argumentos. Em instalações com separador regional, ajuste para ponto e vírgula.

```dax
Valor Títulos = SUM(FatoTitulos[amount])

Total em Aberto =
VAR Ref = SELECTEDVALUE(Referencia[Data])
RETURN IF(NOT ISBLANK(Ref),
    CALCULATE([Valor Títulos],
        KEEPFILTERS(ISBLANK(FatoTitulos[paidDate]) || FatoTitulos[paidDate] > Ref)))

Total Pago =
VAR Ref = SELECTEDVALUE(Referencia[Data])
RETURN IF(NOT ISBLANK(Ref),
    CALCULATE([Valor Títulos],
        KEEPFILTERS(NOT ISBLANK(FatoTitulos[paidDate]) && FatoTitulos[paidDate] <= Ref)))

Total Vencido =
VAR Ref = SELECTEDVALUE(Referencia[Data])
RETURN IF(NOT ISBLANK(Ref),
    CALCULATE([Total em Aberto], KEEPFILTERS(FatoTitulos[dueDate] < Ref)))

Desembolso Previsto =
VAR Ref = SELECTEDVALUE(Referencia[Data])
RETURN IF(NOT ISBLANK(Ref),
    CALCULATE([Total em Aberto], KEEPFILTERS(FatoTitulos[dueDate] >= Ref)))
```

Use Total em Aberto por faixa de aging, Total Pago por mês de DimPagamento e Desembolso Previsto por mês de DimVencimento. Valide que vencido mais previsto coincide com aberto para o mesmo recorte.

## English summary

The web demo provides synthetic BRL invoice data for a future Power BI report. Expand the invoices list in Power Query, preserve nullable payment dates and create company, supplier, category and role-playing date dimensions. Use the reference date to classify open, overdue, paid and forecast amounts. Forecast excludes overdue invoices. No PBIX is supplied.