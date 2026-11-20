import test from 'node:test';
import assert from 'node:assert/strict';
import { priceToCents, validateOrder } from '../src/core/order.mjs';
const valid = () => ({ orderId: 'PED-1', customerId: 'CLIENTE-1', items: [{sku: 'SKU-1', quantity: 2, unitPrice: 19.90}, {sku: 'SKU-2', quantity: 1, unitPrice: 9.99}] });

test('aceita pedido válido e soma em centavos, sem erro de ponto flutuante', () => {
  const result = validateOrder(valid());
  assert.equal(result.valid, true);
  assert.equal(result.order.totalCents, 4979);
  assert.equal(result.order.status, 'VALIDADO');
});
test('rejeita pedido sem identificação', () => {
  const order = valid(); delete order.orderId;
  assert.equal(validateOrder(order).valid, false);
});
test('rejeita pedido sem itens', () => {
  const order = valid(); order.items = [];
  assert.equal(validateOrder(order).valid, false);
});
test('rejeita quantidades iguais a zero ou negativas', () => {
  const order = valid(); order.items[0].quantity = 0;
  assert.equal(validateOrder(order).valid, false);
});
test('rejeita preços inválidos e excessivos em precisão', () => {
  assert.equal(priceToCents(-1), null);
  assert.equal(priceToCents(2.999), null);
  assert.equal(priceToCents(Number.POSITIVE_INFINITY), null);
});
test('rejeita identificadores com caracteres que poderiam alterar a chave S3', () => {
  const order = valid(); order.orderId = '../invasao';
  assert.equal(validateOrder(order).valid, false);
});
test('não aceita valores totais fornecidos pelo cliente como autoridade', () => {
  const order = valid(); order.totalBRL = 0.01;
  assert.equal(validateOrder(order).order.totalBRL, 49.79);
});
test('rejeita payload ausente ou não objeto', () => {
  assert.equal(validateOrder(null).valid, false);
  assert.equal(validateOrder([]).valid, false);
});

test('rejeita identificadores numéricos em vez de strings', () => {
  const order = valid(); order.orderId = 123;
  assert.equal(validateOrder(order).valid, false);
});
