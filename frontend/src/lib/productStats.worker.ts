export interface Product {
  type?: string;
}

export interface StatsMessage {
  products: Product[];
}

export interface StatsResult {
  typeCounts: Record<string, number>;
}

self.onmessage = function (e: MessageEvent<StatsMessage>) {
  const { products } = e.data;
  const typeCounts: Record<string, number> = {};
  for (const p of products) {
    if (p.type) typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
  }
  const result: StatsResult = { typeCounts };
  (self as any).postMessage(result);
};
