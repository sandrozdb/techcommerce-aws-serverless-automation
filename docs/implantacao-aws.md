# Implantação na AWS — roteiro de laboratório

> Você já tem conta AWS por causa do EasyFood. Crie recursos novos; não altere Cognito, buckets ou outros recursos do EasyFood.

## Pré-requisitos

- Conta AWS com permissões para Lambda, EventBridge, EventBridge Scheduler, S3, IAM e CloudFormation.
- AWS CLI autenticada (`aws sts get-caller-identity`), AWS SAM CLI e Node.js 22.
- Região sugerida: `sa-east-1` (São Paulo); use a mesma região em todos os recursos.
- Não suba `~/.aws/credentials`, tokens nem capturas com dados privados ao GitHub.

## Implantação recomendada — AWS SAM

Na raiz do projeto:

```bash
npm install
npm test
sam validate --lint
sam build
sam deploy --guided
```

Responda ao assistente de implantação com:

- Stack: `techcommerce-serverless`
- Região: `sa-east-1`
- Permitir criação de papéis IAM, quando solicitado (CAPABILITY_IAM).
- Confirmar o deploy após revisar as mudanças.

A stack criará um bucket S3 privado, um event bus, uma regra de evento, duas Lambdas e um agendamento. **O agendamento começa desabilitado.**

Anote o nome do bucket/event bus na seção **Outputs** do CloudFormation. O bus deve ser `techcommerce-events`.

## Teste A — disparo por evento da aplicação

No terminal autenticado:

```bash
export AWS_REGION=sa-east-1
export EVENT_BUS_NAME=techcommerce-events
npm run event:valid
```

No Windows PowerShell:

```powershell
$env:AWS_REGION = 'sa-east-1'
$env:EVENT_BUS_NAME = 'techcommerce-events'
npm run event:valid
```

**O que verificar:**

1. O comando devolveu um `eventId` e `FailedEntryCount = 0` implicitamente.
2. No CloudWatch, o log da função `techcommerce-serverless-validar-pedido` apresenta `ORDER_VALIDATED`.
3. No S3, existe `orders/validated/PED-2026-001.json` com `status: VALIDADO` e `totalCents: 20930`.

Teste também a rejeição:

```bash
npm run event:invalid
```

Verifique `ORDER_REJECTED` nos logs e a ausência de `orders/validated/PED-2026-002.json`.

> O EventBridge invoca o destino de maneira assíncrona: o `eventId` prova que o bus aceitou o evento, não que a Lambda concluiu. A conclusão deve ser confirmada nos logs e no S3.

## Teste B — execução agendada sem intervenção

1. No console AWS, abra **Amazon EventBridge → Scheduler → Schedules**.
2. Localize `techcommerce-serverless-relatorio-5min`.
3. Edite o agendamento e altere o estado para **Enabled**.
4. Aguarde uma execução **sem pressionar Testar na Lambda**.
5. Abra o CloudWatch Logs da função `techcommerce-serverless-gerar-relatorio` e procure `REPORT_GENERATED`.
6. No S3, verifique `reports/summary-...json`, com `ordersCount` e `totalBRL`.
7. **Desabilite o agendamento depois de capturar as evidências.**

Agendamentos do EventBridge Scheduler têm precisão de 60 segundos. O relatório agrega todos os pedidos validados armazenados; não é uma janela dos últimos 5 minutos.

## Capturas necessárias para o PDF

- Arquitetura/diagrama.
- Tela com as duas Lambdas.
- Regra `PedidoCriado` apontando para a Lambda.
- Terminal ou console publicando o evento e exibindo o ID.
- CloudWatch da validação `ORDER_VALIDATED`.
- Objeto JSON validado no S3.
- Schedule `rate(5 minutes)` habilitado durante o teste.
- CloudWatch da execução de relatório.
- Arquivo de relatório no S3.

Salve capturas reais em `docs/evidencias/`. Não publique números de conta, chaves nem dados reais de clientes.

## Depois do laboratório

Desabilite o Scheduler e revise custos. Para destruir recursos:

```bash
sam delete --stack-name techcommerce-serverless --region sa-east-1
```

O bucket usa `DeletionPolicy: Retain`; remova os dados **somente após salvar suas evidências** e exclua o bucket manualmente se não precisar mais dele.

## Se você preferir usar o console em vez do SAM

A topologia e os nomes estão em `docs/arquitetura.md` e `template.yaml`. No console crie: bucket privado, duas Lambdas Node.js 22 com `BUCKET_NAME`, roles com acesso restrito ao S3, event bus `techcommerce-events`, regra filtrando `source` e `detail-type` e Scheduler `rate(5 minutes)` com permissão `lambda:InvokeFunction`. O SAM automatiza essa configuração para reduzir erros de IAM.
