export interface UserOut {
  id: number;
  full_name: string;
  email: string;
  mobile?: string | null;
  status: string;
  customer_id?: number | null;
}

export interface Me {
  user: UserOut;
  role: string;
  permissions: string[];
  customer_id?: number | null;
}

export interface Product {
  id: number;
  product_code: string;
  name: string;
  generic_name?: string | null;
  description: string;
  category_id?: number | null;
  manufacturer_id?: number | null;
  brand_id?: number | null;
  hsn_code?: string | null;
  gst_percent: string;
  uom: string;
  mrp: string;
  wholesale_rate: string;
  purchase_rate: string;
  image_url?: string | null;
  reorder_level: number;
  is_active: boolean;
  available_stock: number;
}

export interface Named { id: number; name: string; }

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  unit_rate: string;
  gst_percent: string;
  available_stock: number;
  line_total: string;
}

export interface Cart {
  id: number | null;
  items: CartItem[];
  subtotal: string;
  tax_total: string;
  grand_total: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  hsn_code: string;
  quantity: number;
  fulfilled_quantity: number;
  unit_rate: string;
  gst_percent: string;
  line_subtotal: string;
  line_tax: string;
  line_total: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  status: string;
  subtotal: string;
  tax_total: string;
  grand_total: string;
  notes?: string;
  placed_at?: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface Customer {
  id: number;
  customer_code: string;
  pharmacy_name: string;
  owner_name: string;
  mobile: string;
  email?: string | null;
  gst_number?: string | null;
  drug_license_number?: string | null;
  city: string;
  state: string;
  credit_limit: string;
  payment_term: string;
  status: string;
  outstanding_amount: string;
  available_credit: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  order_id?: number | null;
  customer_id: number;
  invoice_date: string;
  due_date?: string | null;
  status: string;
  subtotal: string;
  cgst: string;
  sgst: string;
  igst: string;
  tax_total: string;
  grand_total: string;
  amount_paid: string;
  balance_due: string;
  items?: any[];
}
