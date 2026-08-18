-- SQLite Database Schema for Parthvi Ayurveda E-Commerce Platform

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER', -- SUPER_ADMIN, PRODUCT_MANAGER, ORDER_MANAGER, CONTENT_MANAGER, SUPPORT_MANAGER, CUSTOMER
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id INTEGER NOT NULL,
  brand TEXT DEFAULT 'Parthvi Ayurveda',
  short_desc TEXT,
  description TEXT,
  mrp REAL NOT NULL,
  selling_price REAL NOT NULL,
  is_featured INTEGER DEFAULT 0,
  is_bestseller INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PUBLISHED', -- PUBLISHED, DRAFT, ARCHIVED
  ingredients TEXT,
  key_ingredients TEXT,
  benefits TEXT,
  usage_directions TEXT,
  warnings TEXT,
  storage_info TEXT,
  net_qty TEXT,
  manufacturer_info TEXT,
  returnable INTEGER DEFAULT 1,
  return_window_days INTEGER DEFAULT 7,
  seo_title TEXT,
  seo_meta TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  attribute_name TEXT NOT NULL, -- Size, Pack, Weight, Flavour
  attribute_value TEXT NOT NULL, -- 100ml, Pack of 2, 60 Capsules
  mrp REAL NOT NULL,
  selling_price REAL NOT NULL,
  weight_g INTEGER DEFAULT 250,
  barcode TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  variant_id INTEGER NOT NULL,
  batch_number TEXT NOT NULL,
  mfg_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  mrp REAL NOT NULL,
  supplier_cost REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER UNIQUE NOT NULL,
  available_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  sold_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL,
  change_qty INTEGER NOT NULL,
  reason TEXT NOT NULL,
  admin_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE TABLE IF NOT EXISTS carts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id INTEGER NOT NULL,
  variant_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE TABLE IF NOT EXISTS wishlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wishlist_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- PERCENT, FLAT
  discount_value REAL NOT NULL,
  min_cart_value REAL DEFAULT 0,
  max_discount REAL DEFAULT 0,
  start_date DATE,
  expiry_date DATE,
  usage_limit INTEGER DEFAULT 1000,
  per_user_limit INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS coupon_usages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL,
  user_id INTEGER,
  order_id INTEGER,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  guest_email TEXT,
  guest_name TEXT,
  guest_phone TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURN_APPROVED, RETURN_REJECTED, RETURNED, REFUND_INITIATED, REFUNDED
  subtotal REAL NOT NULL,
  tax_amount REAL NOT NULL,
  shipping_fee REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL, -- RAZORPAY, COD
  payment_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipping_address_json TEXT NOT NULL,
  invoice_number TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  variant_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  unit_price REAL NOT NULL,
  mrp REAL NOT NULL,
  quantity INTEGER NOT NULL,
  total_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS payment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT DEFAULT 'RAZORPAY',
  event_type TEXT NOT NULL,
  event_id TEXT UNIQUE NOT NULL,
  payload_json TEXT NOT NULL,
  processed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  carrier TEXT DEFAULT 'Delhivery',
  tracking_number TEXT,
  status TEXT DEFAULT 'PENDING',
  label_url TEXT,
  shipped_at DATETIME,
  delivered_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS returns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  order_item_id INTEGER NOT NULL,
  user_id INTEGER,
  reason TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'REQUESTED', -- REQUESTED, APPROVED, REJECTED, RETURNED, REFUND_INITIATED, REFUNDED
  refund_amount REAL NOT NULL,
  refund_method TEXT DEFAULT 'ORIGINAL_PAYMENT',
  transaction_ref TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id INTEGER,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  verified_purchase INTEGER DEFAULT 0,
  status TEXT DEFAULT 'APPROVED', -- PENDING, APPROVED, REJECTED
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_code TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  order_id INTEGER,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
  status TEXT DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED
  subject TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL, -- CUSTOMER, SUPPORT
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cms_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_url TEXT DEFAULT '/shop',
  desktop_image TEXT NOT NULL,
  mobile_image TEXT,
  display_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT NOT NULL,
  author TEXT DEFAULT 'Ayurvedic Advisory Panel',
  publish_date DATE NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  related_products_json TEXT,
  seo_title TEXT,
  seo_meta TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id INTEGER,
  page TEXT NOT NULL,
  product_id INTEGER,
  category_id INTEGER,
  order_id INTEGER,
  device TEXT DEFAULT 'DESKTOP',
  browser TEXT DEFAULT 'CHROME',
  metadata_json TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  severity TEXT NOT NULL, -- INFO, WARNING, ERROR, CRITICAL
  category TEXT NOT NULL, -- FRONTEND, BACKEND, PAYMENT, INVENTORY, CHECKOUT, API
  message TEXT NOT NULL,
  stack_trace TEXT,
  endpoint TEXT,
  status TEXT DEFAULT 'NEW', -- NEW, INVESTIGATING, RESOLVED, IGNORED
  occurrence_count INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  prev_value_json TEXT,
  new_value_json TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
