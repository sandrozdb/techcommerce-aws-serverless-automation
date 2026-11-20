import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { summarizeOrders } from '../core/report.mjs';

const s3 = new S3Client({});
const PREFIX = 'orders/validated/';
const MAX_ORDERS = 1000; // Escopo do exercício, não um pipeline de produção.

/** Alvo de uma programação recorrente no Amazon EventBridge Scheduler. */
export async function handler(event = {}) {
  const bucket = process.env.BUCKET_NAME;
  if (!bucket) throw new Error('Variável BUCKET_NAME obrigatória.');
  const keys = [];
  let continuationToken;
  do {
    const page = await s3.send(new ListObjectsV2Command({
      Bucket: bucket, Prefix: PREFIX, ContinuationToken: continuationToken
    }));
    for (const object of page.Contents ?? []) {
      if (object.Key?.endsWith('.json')) keys.push(object.Key);
      if (keys.length > MAX_ORDERS) throw new Error(`Limite demonstrativo de ${MAX_ORDERS} pedidos excedido.`);
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    if (page.IsTruncated && !continuationToken) throw new Error('Paginação S3 inválida.');
  } while (continuationToken);

  const orders = [];
  for (const key of keys) {
    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!object.Body) throw new Error(`Objeto sem corpo: ${key}`);
    orders.push(JSON.parse(await object.Body.transformToString()));
  }
  const report = summarizeOrders(orders);
  const key = `reports/summary-${report.generatedAt.replace(/[:.]/g, '-')}.json`;
  await s3.send(new PutObjectCommand({
    Bucket: bucket, Key: key,
    Body: JSON.stringify({ ...report, trigger: event?.source ?? 'scheduler' }, null, 2),
    ContentType: 'application/json; charset=utf-8'
  }));
  console.info(JSON.stringify({ action: 'REPORT_GENERATED', reportKey: key, ordersCount: report.ordersCount, totalCents: report.totalCents }));
  return { status: 'GERADO', reportKey: key, ...report };
}
