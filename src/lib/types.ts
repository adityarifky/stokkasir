export type Transaction = {
  id: string;
  date: string;
  item: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  actor: string; // Supplier or Destination
};

export type StockItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
};
