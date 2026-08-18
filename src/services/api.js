const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('parthvi_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(name, email, password, phone) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addAddress(address) {
    const res = await fetch(`${API_BASE}/auth/address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(address),
    });
    return res.json();
  },

  // Products & Search
  async getCategories() {
    const res = await fetch(`${API_BASE}/products/categories`);
    return res.json();
  },

  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`);
    return res.json();
  },

  async getProductBySlug(slug) {
    const res = await fetch(`${API_BASE}/products/${slug}`);
    return res.json();
  },

  async searchSuggest(q, sessionId) {
    const res = await fetch(`${API_BASE}/products/search/suggest?q=${encodeURIComponent(q)}&session_id=${sessionId}`);
    return res.json();
  },

  // Cart & Checkout
  async syncCart(items, couponCode = null) {
    const res = await fetch(`${API_BASE}/cart/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, coupon_code: couponCode }),
    });
    return res.json();
  },

  async checkPincode(pincode) {
    const res = await fetch(`${API_BASE}/checkout/pincode/${pincode}`);
    return res.json();
  },

  async initiateCheckout(checkoutPayload) {
    const res = await fetch(`${API_BASE}/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(checkoutPayload),
    });
    return res.json();
  },

  async verifyPayment(paymentPayload) {
    const res = await fetch(`${API_BASE}/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload),
    });
    return res.json();
  },

  // Orders
  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async trackOrder(orderNumber) {
    const res = await fetch(`${API_BASE}/orders/track/${orderNumber}`);
    return res.json();
  },

  async getInvoice(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/invoice`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async cancelOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async submitReturn(orderId, orderItemId, reason, imageUrl) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ order_item_id: orderItemId, reason, image_url: imageUrl }),
    });
    return res.json();
  },

  // Admin APIs
  async getAdminOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getAdminOrders(status = '', search = '') {
    const res = await fetch(`${API_BASE}/admin/orders?status=${status}&search=${search}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminProducts() {
    const res = await fetch(`${API_BASE}/admin/products`, { headers: getAuthHeaders() });
    return res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async getAdminInventory() {
    const res = await fetch(`${API_BASE}/admin/inventory`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateInventoryStock(variantId, availableStock, reason) {
    const res = await fetch(`${API_BASE}/admin/inventory/${variantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ available_stock: availableStock, reason }),
    });
    return res.json();
  },

  async getAdminReturns() {
    const res = await fetch(`${API_BASE}/admin/returns`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateReturnStatus(returnId, status, refundAmount) {
    const res = await fetch(`${API_BASE}/admin/returns/${returnId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status, refund_amount: refundAmount }),
    });
    return res.json();
  },

  async getAdminReviews() {
    const res = await fetch(`${API_BASE}/admin/reviews`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateReviewStatus(reviewId, status) {
    const res = await fetch(`${API_BASE}/admin/reviews/${reviewId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminErrorLogs() {
    const res = await fetch(`${API_BASE}/admin/system/error-logs`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getAdminAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/system/audit-logs`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers: getAuthHeaders() });
    return res.json();
  },

  // Analytics Event Track
  async trackEvent(eventName, page, metadata = {}) {
    let sessionId = localStorage.getItem('parthvi_session');
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      localStorage.setItem('parthvi_session', sessionId);
    }
    try {
      await fetch(`${API_BASE}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ event_name: eventName, session_id: sessionId, page, metadata }),
      });
    } catch (e) {}
  },
};
