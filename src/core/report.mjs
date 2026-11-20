/** Agregação pura para o relatório de pedidos validados. */
export function summarizeOrders(orders, generatedAt = new Date().toISOString()) {
  const ids = new Set();
  let totalCents = 0;
  let itemsSold = 0;
  let duplicatesIgnored = 0;
  for (const order of orders) {
    if (!order || order.status !== 'VALIDADO' || typeof order.orderId !== 'string' ||
        !Number.isSafeInteger(order.totalCents) || order.totalCents < 0 ||
        !Array.isArray(order.items)) {
      throw new Error('Objeto de pedido persistido inválido.');
    }
    if (ids.has(order.orderId)) { duplicatesIgnored++; continue; }
    ids.add(order.orderId);
    totalCents += order.totalCents;
    if (!Number.isSafeInteger(totalCents)) throw new Error('Total financeiro excede o limite seguro.');
    for (const item of order.items) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new Error('Quantidade de item inválida.');
      itemsSold += item.quantity;
    }
  }
  return {
    reportType: 'TECHCOMMERCE_SUMMARY',
    generatedAt,
    ordersCount: ids.size,
    itemsSold,
    totalCents,
    totalBRL: totalCents / 100,
    duplicatesIgnored,
    scope: 'Todos os pedidos validados persistidos no bucket de demonstração'
  };
}
