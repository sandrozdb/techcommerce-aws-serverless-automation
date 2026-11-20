import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeOrders } from '../src/core/report.mjs';
const order = (id, amount, qty = 1) => ({orderId:id,status:'VALIDADO',totalCents:amount,items:[{sku:'SKU-1',quantity:qty,unitPrice:amount/100}]});

test('gera resumo financeiro de pedidos validados', () => {
  const result = summarizeOrders([order('A', 1099, 2), order('B', 2900)], '2026-11-20T10:00:00.000Z');
  assert.deepEqual({orders:result.ordersCount,items:result.itemsSold,cents:result.totalCents}, {orders:2,items:3,cents:3999});
});
test('gera relatório vazio em vez de falhar sem pedidos', () => {
  const result = summarizeOrders([]);
  assert.equal(result.ordersCount, 0);
  assert.equal(result.totalBRL, 0);
});
test('desconsidera identificadores repetidos por precaução', () => {
  const result = summarizeOrders([order('A', 1099), order('A', 1099)]);
  assert.equal(result.ordersCount, 1);
  assert.equal(result.duplicatesIgnored, 1);
});
test('falha diante de dados persistidos incoerentes', () => {
  assert.throws(() => summarizeOrders([{orderId:'X',status:'PENDENTE',totalCents:99,items:[]}]));
});
