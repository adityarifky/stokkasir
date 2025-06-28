export type Transaction = {
  id: string;
  date: string;
  item: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  unit: 'Pack' | 'Pcs' | 'Roll' | 'Box';
  actor: string; // Supplier or Destination
  notes?: string;
};

export type StockItem = {
  id:string;
  name: string;
  sku: string;
  unit: 'Pack' | 'Pcs' | 'Roll' | 'Box';
  quantity: number;
  lowStockThreshold: number;
  urgentNote?: string;
};
