/** Regras puras de negócio, sem dependência de infraestrutura. */
const IDENTIFIER = /^[a-zA-Z0-9_-]{1,64}$/;

export function priceToCents(price) {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  const scaled = price * 100;
  const rounded = Math.round(scaled);
  if (!Number.isSafeInteger(rounded) || Math.abs(scaled - rounded) > 1e-7) return null;
  return rounded;
}

export function validateOrder(order) {
  const errors = [];
  if (!order || typeof order !== 'object' || Array.isArray(order)) {
    return { valid: false, errors: ['Pedido deve ser um objeto JSON.'] };
  }
  if (typeof order.orderId !== 'string' || !IDENTIFIER.test(order.orderId)) errors.push('orderId ausente ou inválido (1-64 caracteres alfanuméricos, _ ou -).');
  if (typeof order.customerId !== 'string' || !IDENTIFIER.test(order.customerId)) errors.push('customerId ausente ou inválido.');
  if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > 50) {
    errors.push('items deve conter entre 1 e 50 produtos.');
  }

  let totalCents = 0;
  if (Array.isArray(order.items) && order.items.length > 0 && order.items.length <= 50) {
    for (const [index, item] of order.items.entries()) {
      const priceCents = priceToCents(item?.unitPrice);
      if (!item || typeof item.sku !== 'string' || !IDENTIFIER.test(item.sku)) errors.push(`Item ${index + 1}: SKU inválido.`);
      if (!Number.isSafeInteger(item?.quantity) || item.quantity < 1 || item.quantity > 999) {
        errors.push(`Item ${index + 1}: quantidade inválida.`);
      }
      if (priceCents === null) errors.push(`Item ${index + 1}: preço inválido (até 2 casas decimais).`);
      if (priceCents !== null && Number.isSafeInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 999) {
        totalCents += priceCents * item.quantity;
      }
    }
  }
  if (!Number.isSafeInteger(totalCents)) errors.push('Valor total excede o limite seguro de cálculo.');
  if (errors.length) return { valid: false, errors };
  return {
    valid: true,
    errors: [],
    order: {
      orderId: order.orderId,
      customerId: order.customerId,
      items: order.items.map(({ sku, quantity, unitPrice }) => ({ sku, quantity, unitPrice })),
      totalCents,
      totalBRL: totalCents / 100,
      status: 'VALIDADO'
    }
  };
}
