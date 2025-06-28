export type Transaction = {
  id: string;
  date: string;
  item: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  unit: 'Kg' | 'Gram' | 'ML' | 'L' | 'Pack' | 'Pcs';
  actor: string; // Supplier or Destination
  notes?: string;
};

export type StockItem = {
  id:string;
  name: string;
  sku: string;
  unit: 'Kg' | 'Gram' | 'ML' | 'L' | 'Pack' | 'Pcs';
  quantity: number;
  lowStockThreshold: number;
  urgentNote?: string;
};
