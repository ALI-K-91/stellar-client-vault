
// User types
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

// Field types for custom fields
export type FieldType = 'text' | 'number' | 'date' | 'email' | 'phone' | 'select' | 'checkbox';

export interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  entityType: 'client' | 'order';
  required: boolean;
  options?: string[]; // For select fields
  description?: string;
  createdAt: string;
}

// Client types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customFields: { [key: string]: any };
}

// Order status types
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'delivered';

// Order types
export interface Order {
  id: string;
  clientId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customFields: { [key: string]: any };
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  description?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  topClients: { name: string; orders: number; revenue: number }[];
}
