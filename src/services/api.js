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

  async syncGoogleUser(email, name, avatar_url) {
    const res = await fetch(`${API_BASE}/auth/supabase-google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, avatar_url }),
    });
    return res.json();
  },


  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addAddress(addressData) {
    const res = await fetch(`${API_BASE}/auth/address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(addressData),
    });
    return res.json();
  },

  async updateAddress(addressId, addressData) {
    const res = await fetch(`${API_BASE}/auth/address/${addressId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(addressData),
    });
    return res.json();
  },

  async deleteAddress(addressId) {
    const res = await fetch(`${API_BASE}/auth/address/${addressId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async setDefaultAddress(addressId) {
    const res = await fetch(`${API_BASE}/auth/address/${addressId}/default`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async releaseExpiredReservations() {
    const res = await fetch(`${API_BASE}/checkout/release-expired-reservations`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Products & Search
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/products/categories`);
      if (!res.ok) return { success: false, categories: [] };
      return await res.json();
    } catch (err) {
      return { success: false, categories: [] };
    }
  },

  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/products?${query}`);
      if (!res.ok) return { success: false, products: [] };
      return await res.json();
    } catch (err) {
      return { success: false, products: [] };
    }
  },

  async getComboProducts() {
    try {
      const res = await fetch(`${API_BASE}/products?is_combo=1`);
      if (!res.ok) return { success: false, products: [] };
      return await res.json();
    } catch (err) {
      return { success: false, products: [] };
    }
  },

  async getPopularProducts() {
    try {
      const res = await fetch(`${API_BASE}/products?is_popular=1`);
      if (!res.ok) return { success: false, products: [] };
      return await res.json();
    } catch (err) {
      return { success: false, products: [] };
    }
  },

  async getProductBySlug(slug) {
    try {
      const res = await fetch(`${API_BASE}/products/${slug}`);
      if (!res.ok) return { success: false, product: null };
      return await res.json();
    } catch (err) {
      return { success: false, product: null };
    }
  },

  async searchSuggest(q, sessionId) {
    try {
      const res = await fetch(`${API_BASE}/products/search/suggest?q=${encodeURIComponent(q)}&session_id=${sessionId}`);
      if (!res.ok) return { success: false, suggestions: [] };
      return await res.json();
    } catch (err) {
      return { success: false, suggestions: [] };
    }
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
    return this.verifyCashfreePayment(paymentPayload);
  },

  async verifyCashfreePayment(paymentPayload) {
    const res = await fetch(`${API_BASE}/payment/verify-cashfree`, {
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

  async updateProduct(productId, productData) {
    const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async deleteProduct(productId) {
    try {
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    } catch (err) {
      return { success: false, error: 'Network error — please check your connection and try again.' };
    }
  },


  async getProductImages(productId) {
    const res = await fetch(`${API_BASE}/admin/products/${productId}/images`, { headers: getAuthHeaders() });
    return res.json();
  },

  async addProductImage(productId, imageUrl) {
    const res = await fetch(`${API_BASE}/admin/products/${productId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    return res.json();
  },

  async uploadImage(imageData, filename) {
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ image: imageData, filename }),
    });
    return res.json();
  },


  async deleteProductImage(productId, imageId) {
    const res = await fetch(`${API_BASE}/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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

  async getAdminErrorLogs(severity = '', status = '') {
    const res = await fetch(`${API_BASE}/admin/system/error-logs?severity=${severity}&status=${status}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateErrorLogStatus(logId, status) {
    const res = await fetch(`${API_BASE}/admin/system/error-logs/${logId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminWebhooks() {
    const res = await fetch(`${API_BASE}/admin/system/webhooks`, { headers: getAuthHeaders() });
    return res.json();
  },

  async retryWebhook(webhookId) {
    const res = await fetch(`${API_BASE}/admin/system/webhooks/${webhookId}/retry`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
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

  // Wishlist APIs
  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getWishlistIds() {
    const res = await fetch(`${API_BASE}/wishlist/ids`, { headers: getAuthHeaders() });
    return res.json();
  },

  async toggleWishlistItem(productId) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ product_id: productId }),
    });
    return res.json();
  },

  async moveWishlistToCart(productId) {
    const res = await fetch(`${API_BASE}/wishlist/move-to-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ product_id: productId }),
    });
    return res.json();
  },

  // Reviews APIs
  async submitReview(productId, rating, reviewText) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ product_id: productId, rating, review_text: reviewText }),
    });
    return res.json();
  },

  // Support Ticket APIs (Customer)
  async createTicket(subject, category, message, orderId = null) {
    const res = await fetch(`${API_BASE}/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ subject, category, message, order_id: orderId }),
    });
    return res.json();
  },

  async getMyTickets() {
    const res = await fetch(`${API_BASE}/support/tickets`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getTicketDetail(ticketId) {
    const res = await fetch(`${API_BASE}/support/tickets/${ticketId}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async sendTicketMessage(ticketId, message) {
    const res = await fetch(`${API_BASE}/support/tickets/${ticketId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  // Admin Support Ticket APIs
  async getAdminTickets(status = '', priority = '') {
    const res = await fetch(`${API_BASE}/support/admin/tickets?status=${status}&priority=${priority}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getAdminTicketDetail(ticketId) {
    const res = await fetch(`${API_BASE}/support/admin/tickets/${ticketId}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateAdminTicket(ticketId, status, priority) {
    const res = await fetch(`${API_BASE}/support/admin/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status, priority }),
    });
    return res.json();
  },

  async replyToTicket(ticketId, message) {
    const res = await fetch(`${API_BASE}/support/admin/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  async assignTicket(ticketId, assignedTo) {
    const res = await fetch(`${API_BASE}/support/admin/tickets/${ticketId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
    return res.json();
  },

  // CMS Banners APIs
  async getCmsBanners() {
    try {
      const res = await fetch(`${API_BASE}/cms/banners`);
      if (!res.ok) return { success: false, banners: [] };
      return await res.json();
    } catch (err) {
      return { success: false, banners: [] };
    }
  },

  async getAdminBanners() {
    const res = await fetch(`${API_BASE}/cms/admin/banners`, { headers: getAuthHeaders() });
    return res.json();
  },

  async createBanner(bannerData) {
    const res = await fetch(`${API_BASE}/cms/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(bannerData),
    });
    return res.json();
  },

  async updateBanner(bannerId, bannerData) {
    const res = await fetch(`${API_BASE}/cms/banners/${bannerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(bannerData),
    });
    return res.json();
  },

  async deleteBanner(bannerId) {
    const res = await fetch(`${API_BASE}/cms/banners/${bannerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // CMS Blog Post APIs
  async getBlogPosts() {
    const res = await fetch(`${API_BASE}/cms/blog-posts`);
    return res.json();
  },

  async getBlogPostBySlug(slug) {
    const res = await fetch(`${API_BASE}/cms/blog-posts/${slug}`);
    return res.json();
  },

  async createBlogPost(postData) {
    const res = await fetch(`${API_BASE}/cms/blog-posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(postData),
    });
    return res.json();
  },

  async updateBlogPost(postId, postData) {
    const res = await fetch(`${API_BASE}/cms/blog-posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(postData),
    });
    return res.json();
  },

  async deleteBlogPost(postId) {
    const res = await fetch(`${API_BASE}/cms/blog-posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Selloship 2.0 Shipping APIs
  async createSelloshipWaybill(orderId, courierName = 'Delhivery') {
    const res = await fetch(`${API_BASE}/shipping/create-waybill/${orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ courierName }),
    });
    return res.json();
  },

  async trackSelloshipPackage(waybill) {
    const res = await fetch(`${API_BASE}/shipping/track/${waybill}`);
    return res.json();
  },

  async cancelSelloshipWaybill(orderId) {
    const res = await fetch(`${API_BASE}/shipping/cancel-waybill/${orderId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async generateSelloshipManifest(awbNumbers) {
    const res = await fetch(`${API_BASE}/shipping/manifest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ awbNumbers }),
    });
    return res.json();
  },
};

