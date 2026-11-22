# Evidências reais da implementação AWS

Implantação e execução verificadas em **22/11/2026**, stack `techcommerce-serverless`, região `sa-east-1`.

Oito capturas foram produzidas durante a demonstração, correlacionadas a:

1. `01-lambdas.png` — as duas funções AWS Lambda com runtime Node.js 22.
2. `02-eventbridge-regra.png` — regra de `PedidoCriado` habilitada no barramento.
3. `03-eventbridge-destino.png` — destino da regra: Lambda `validar-pedido`.
4. `04-cloudwatch-validacao.png` — log `ORDER_VALIDATED` do pedido `PED-2026-001`.
5. `05-s3-pedido-validado.png` — objeto JSON validado em `orders/validated/`.
6. `06-eventbridge-scheduler.png` — agendamento `rate(5 minutes)`, desabilitado após a prova.
7. `07-cloudwatch-relatorio.png` — log `REPORT_GENERATED` da segunda Lambda.
8. `08-s3-relatorio.png` — JSON de relatório salvo em `reports/`.

**Situação da pasta:** os prints foram enviados durante a documentação do projeto, mas **ainda não foram commitados aqui**. Não confunda este índice com arquivos de imagens já presentes no GitHub.

**Resultados verificados:** 13 testes locais aprovados; evento `PedidoCriado` aceito; validação no CloudWatch; pedido no S3 com valor R$ 209,30; relatório automático consolidando 1 pedido, 3 itens, R$ 209,30 e 0 duplicatas. Scheduler foi desabilitado ao final.

Antes de publicar imagens em um repositório aberto, oculte números de conta, ARNs completos e outras informações desnecessárias. Nunca publique credenciais ou dados reais de clientes.
