import Decimal from "decimal.js";
import { PRODUCT_SPECS, type ProductId } from "@/lib/products/catalog";

const capacityByProduct = new Map<ProductId, Decimal>(
  PRODUCT_SPECS.map((product) => [product.id, new Decimal(product.capacityLitres)]),
);

export function calculateRequestedLitres(items: ReadonlyArray<{ productId: ProductId; quantity: number }>): Decimal {
  return items.reduce((total, item) => {
    const capacity = capacityByProduct.get(item.productId);
    if (!capacity) throw new Error(`Unknown product: ${item.productId}`);
    return total.plus(capacity.times(item.quantity));
  }, new Decimal(0));
}
