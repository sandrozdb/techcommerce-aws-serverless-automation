import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { validateOrder } from '../core/order.mjs';

const s3 = new S3Client({});

/** Alvo da regra EventBridge (event.detail-type = PedidoCriado). */
export async function handler(event) {
  if (event?.source !== 'techcommerce.orders' || event?.['detail-type'] !== 'PedidoCriado') {
    throw new Error('Evento fora do contrato techcommerce.orders/PedidoCriado.');
  }
  const { valid, errors, order } = validateOrder(event.detail);
  if (!valid) {
    console.warn(JSON.stringify({ action: 'ORDER_REJECTED', eventId: event.id ?? null, errors }));
    return { status: 'REJEITADO', errors };
  }
  const bucket = process.env.BUCKET_NAME;
  if (!bucket) throw new Error('Variável BUCKET_NAME obrigatória.');
  const payload = {
    ...order,
    validatedAt: new Date().toISOString(),
    eventId: event.id ?? null
  };
  const key = `orders/validated/${order.orderId}.json`;
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(payload, null, 2),
    ContentType: 'application/json; charset=utf-8'
  }));
  console.info(JSON.stringify({ action: 'ORDER_VALIDATED', orderId: order.orderId, totalCents: order.totalCents, key }));
  return { status: 'VALIDADO', orderId: order.orderId, totalBRL: order.totalBRL, key };
}
