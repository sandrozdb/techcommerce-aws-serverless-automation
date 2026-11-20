# Pitch acadêmico — até 4 minutos

**Roteiro proposto, não relato de execução. Grave apenas depois de obter evidências reais na AWS.**

### 0:00–0:35 — O problema
A TechCommerce cresceu e tem picos de demanda, mas algumas rotinas ainda dependem de servidores e ações manuais. Isso causa atrasos operacionais e pode tornar a operação cara e difícil de escalar.

### 0:35–1:20 — Arquitetura
Usamos AWS Lambda e EventBridge. Um evento `PedidoCriado` aciona a validação; pedidos aprovados vão ao S3. Uma segunda Lambda é acionada por um agendamento no EventBridge Scheduler para gerar relatórios, enquanto CloudWatch registra as execuções.

### 1:20–2:30 — Demonstração
Mostrar a regra de evento; publicar pedido fictício; conferir execução automática sem clicar em **Testar** na Lambda; apresentar log `ORDER_VALIDATED` e arquivo no S3. Depois apresentar o Scheduler habilitado e o log `REPORT_GENERATED`, além do relatório armazenado.

### 2:30–3:20 — Benefícios e limites
Processamento desacoplado, execução sob demanda, escalabilidade gerenciada, logs observáveis e cobrança proporcional ao consumo. A economia deve ser medida: não há garantia automática de custo menor. Para produção seriam necessárias DLQ, alertas, reprocessamento e proteção contra duplicidades.

### 3:20–3:45 — Fechamento
Mostramos duas formas de automação: por **evento de negócio** e por **agendamento**, reduzindo a necessidade de intervenções manuais na TechCommerce.
