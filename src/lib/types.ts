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
  id:string;
  name: string;
  sku: string;
  unit: 'Pack' | 'Pcs' | 'Roll' | 'Box';
  quantity: number;
  lowStockThreshold: number;
};
