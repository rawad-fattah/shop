export type Category = "Dresses" | "Bags" | "Perfumes";

export type Product = {
  _id: string;
  name: string;
  category: Category;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  imageUrl?: string;
  lowStockThreshold: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Sale = {
  _id: string;
  product: { _id: string; name: string; category: Category } | string | null;
  quantitySold: number;
  sellingPrice: number;
  totalPrice: number;
  profit: number;
  date: string;
};

export type Purchase = {
  _id: string;
  product: { _id: string; name: string; category: Category } | string | null;
  quantity: number;
  costPerItem: number;
  totalCost: number;
  date: string;
};

export type DailyDashboardResponse = {
  totalSales: number;
  totalProfit: number;
  itemsSold: number;
  sales: Sale[];
};

export type MonthlyReportResponse = {
  start: string;
  end: string;
  totalRevenue: number;
  totalProfit: number;
  totalSalesRecords: number;
  bestSellingProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
};
