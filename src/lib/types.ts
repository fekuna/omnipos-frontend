export interface Category {
  id: string;
  merchant_id: string;
  parent_id?: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
}

export interface ListCategoriesResponse {
  categories: Category[];
  total: number;
}

export interface Product {
  id: string;
  merchant_id: string;
  category_id?: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  base_price: number;
  cost_price?: number;
  tax_rate?: number;
  has_variants: boolean;
  track_inventory: boolean;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface ListProductsResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
}

// Order Types

export enum PaymentMethod {
  PAYMENT_METHOD_UNSPECIFIED = 0,
  PAYMENT_METHOD_CASH = 1,
  PAYMENT_METHOD_QRIS = 2,
  PAYMENT_METHOD_DEBIT = 3,
  PAYMENT_METHOD_CREDIT = 4,
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: number;
  payment_method: PaymentMethod;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  items: OrderItem[];
  created_at: string;
}

export interface CreateOrderItemInput {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number; // Sent for locking/validation
  notes?: string;
}

export interface CreateOrderRequest {
  store_id?: string;
  customer_id?: string;
  payment_method: PaymentMethod;
  items: CreateOrderItemInput[];
  paid_amount: number;
}

export interface CreateOrderResponse {
  order: Order;
}

export interface ListOrdersRequest {
  page: number;
  page_size: number;
  store_id?: string;
  customer_id?: string;
  status?: number;
  start_date?: string;
  end_date?: string;
}

export interface ListOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
}

// Customer Types

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CreateCustomerResponse {
  id: string;
}

export interface ListCustomersResponse {
  customers: Customer[];
  total: number;
}

// Payment Types

export enum PaymentStatus {
  PAYMENT_STATUS_UNSPECIFIED = 0,
  PAYMENT_STATUS_PENDING = 1,
  PAYMENT_STATUS_SUCCESS = 2,
  PAYMENT_STATUS_FAILED = 3,
  PAYMENT_STATUS_REFUNDED = 4,
}

export interface Payment {
  id: string;
  merchant_id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number?: string;
  provider?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  provider?: string;
}


export interface CreatePaymentResponse {
  payment: Payment;
}

// User & Role Types (RBAC)

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  merchant_id?: string;
  is_system: boolean;
  permissions: Permission[];
}

export interface User {
  id: string;
  merchant_id: string;
  username: string;
  email: string;
  full_name: string;
  role_id: string;
  status: string;
  last_login_at?: { seconds: number; nanos: number }; // timestamppb
  created_at: { seconds: number; nanos: number };
  updated_at: { seconds: number; nanos: number };
  role?: Role;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permission_ids: string[];
}

export interface ListRolesResponse {
  roles: Role[];
  total: number;
}

export interface ListPermissionsResponse {
  permissions: Permission[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  full_name: string;
  role_id: string;
  password?: string; // Optional if invite flow, but required for direct create
}

export interface UpdateUserRequest {
  id: string; // Param, usually not in body for PUT but defined here for complete object
  full_name?: string;
  role_id?: string;
  status?: string;
  password?: string;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
}
