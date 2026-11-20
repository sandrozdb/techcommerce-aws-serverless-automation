import { readFile } from 'node:fs/promises';
import { validateOrder } from '../src/core/order.mjs';
import { summarizeOrders } from '../src/core/report.mjs';

const sample = JSON.parse(await readFile(new URL('../examples/pedido-valido.json', import.meta.url), 'utf8'));
const result = validateOrder(sample);
if (!result.valid) throw new Error(`Pedido inválido: ${result.errors.join(', ')}`);
console.log('Validação local:', JSON.stringify(result.order, null, 2));
console.log('Relatório local:', JSON.stringify(summarizeOrders([result.order]), null, 2));
console.log('\nEsta demonstração NÃO usa AWS. As evidências AWS exigem deploy real e CloudWatch.');
