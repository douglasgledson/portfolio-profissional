# AP Workflow Manager

## Fluxo / Workflow

1. Solicitante cadastra um pedido ou lote de até 100 itens. / Requester creates one item or a batch of up to 100.
2. Financeiro valida e avança ou devolve. / Finance reviews and advances or returns the request.
3. Com os limites iniciais, itens a partir de R$ 1.000 passam pelo gestor e a partir de R$ 10.000 passam também pela diretoria. / Default thresholds are BRL 1,000 for manager and BRL 10,000 for director, with manager approval first.
4. Cada transição registra estágio, perfil e horário. / Each transition logs stage, role and time.

O SLA inicial é de 48 horas corridas. O prazo é calculado a partir da abertura e o percentual de encerramento no SLA inclui aprovadas e devolvidas. A matriz alterada pelo administrador é aplicada às solicitações novas. / The default SLA is 48 elapsed hours from creation. Closed within SLA includes approved and returned requests. Matrix edits apply to new requests.

Notificações mostram as últimas movimentações das solicitações. Fila, histórico e matriz são locais. Perfis podem ser alternados livremente para testar o fluxo. / Notifications show recent request activity. Queue, history and rules are local. Switch roles freely to test the workflow.

## Solução Power Platform / Power Platform solution

A [seção no portfólio](../index.html#projeto/ap-workflow/solucao-power-platform) apresenta a arquitetura de referência, o modelo de dados, as responsabilidades, a sequência de aprovação e exemplos de Power Fx. A demo web usa dados fictícios. / The portfolio section presents the reference architecture, data model, responsibilities, approval flow and Power Fx examples. The web demo uses fictional data.
