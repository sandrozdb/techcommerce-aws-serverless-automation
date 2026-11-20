import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const input = process.argv[2];
if (!input) {
  console.error('Uso: npm run event:valid OU node scripts/enviar-pedido.mjs examples/pedido-valido.json');
  process.exitCode = 1;
} else {
  const region = process.env.AWS_REGION || 'sa-east-1';
  const busName = process.env.EVENT_BUS_NAME || 'techcommerce-events';
  const detail = JSON.parse(await readFile(resolve(input), 'utf8'));
  const client = new EventBridgeClient({ region });
  const response = await client.send(new PutEventsCommand({ Entries: [{
    EventBusName: busName,
    Source: 'techcommerce.orders',
    DetailType: 'PedidoCriado',
    Detail: JSON.stringify(detail)
  }] }));
  if (response.FailedEntryCount) throw new Error(`Falha ao publicar evento: ${JSON.stringify(response.Entries)}`);
  console.info(JSON.stringify({ published: true, eventId: response.Entries?.[0]?.EventId, eventBus: busName, region, orderId: detail.orderId }, null, 2));
}
