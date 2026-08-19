import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, Package, ShoppingBag, Layers, RefreshCw, Star, AlertTriangle, Activity, FileText, CheckCircle, Search, Plus, Edit, Trash2, HelpCircle, MessageSquare, Send, X, Image as ImageIcon, BookOpen, TrendingUp, Search as SearchIcon, Award, UserCheck } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Overview State
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Orders State
  const [adminOrders, setAdminOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  // Products & Inventory State
  const [adminProducts, setAdminProducts] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  // CMS Banners State
  const [bannersList, setBannersList] = useState([]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    id: null,
    title: '',
    subtitle: '',
    cta_text: 'Shop Now',
    cta_url: '/shop',
    desktop_image: '',
    mobile_image: '',
    display_order: 0,
    active: 1,
  });

  // CMS Blog Posts State
  const [blogList, setBlogList] = useState([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogForm, setBlogForm] = useState({
    id: null,
    title: '',
    slug: '',
    cover_image: '',
    author: 'Ayurvedic Advisory Panel',
    publish_date: new Date().toISOString().slice(0, 10),
    category: 'Wellness',
    excerpt: '',
    content: '',
  });

  // Returns & Reviews State
  const [returnsList, setReturnsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

  // Support Desk State
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedAdminTicket, setSelectedAdminTicket] = useState(null);
  const [adminTicketMessages, setAdminTicketMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [supportFilterStatus, setSupportFilterStatus] = useState('');
  const [supportFilterPriority, setSupportFilterPriority] = useState('');
  const [assignedAgentInput, setAssignedAgentInput] = useState('');

  // Analytics & System State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Product Add Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    slug: '',
    category_id: 1,
    mrp: 599,
    selling_price: 499,
    short_desc: '',
    description: '',
    ingredients: '',
    key_ingredients: '',
    benefits: '',
    usage_directions: '',
    warnings: '',
    storage_info: '',
    net_qty: '200 ml',
    manufacturer_info: 'Parthvi Herbal Formulations Pvt Ltd',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      setLoadingOverview(true);
      api.getAdminOverview().then(data => {
        if (data.success) setOverview(data);
        setLoadingOverview(false);
      });
    } else if (activeTab === 'orders') {
      api.getAdminOrders(orderStatusFilter).then(data => {
        if (data.success) setAdminOrders(data.orders || []);
      });
    } else if (activeTab === 'products') {
      api.getAdminProducts().then(data => {
        if (data.success) setAdminProducts(data.products || []);
      });
    } else if (activeTab === 'inventory') {
      api.getAdminInventory().then(data => {
        if (data.success) {
          setInventoryList(data.inventory || []);
          setBatchList(data.batches || []);
        }
      });
    } else if (activeTab === 'banners') {
      api.getAdminBanners().then(data => {
        if (data.success) setBannersList(data.banners || []);
      });
    } else if (activeTab === 'blog') {
      api.getBlogPosts().then(data => {
        if (data.success) setBlogList(data.posts || []);
      });
    } else if (activeTab === 'returns') {
      api.getAdminReturns().then(data => {
        if (data.success) setReturnsList(data.returns || []);
      });
    } else if (activeTab === 'reviews') {
      api.getAdminReviews().then(data => {
        if (data.success) setReviewsList(data.reviews || []);
      });
    } else if (activeTab === 'support') {
      api.getAdminTickets(supportFilterStatus, supportFilterPriority).then(data => {
        if (data.success) setSupportTickets(data.tickets || []);
      });
    } else if (activeTab === 'analytics') {
      api.getAdminAnalytics().then(data => {
        if (data.success) setAnalyticsData(data);
      });
    } else if (activeTab === 'system') {
      api.getAdminErrorLogs(errorSeverityFilter).then(data => {
        if (data.success) {
          setErrorLogs(data.logs || []);
          setErrorSpikeInfo(data.spike_detector || null);
        }
      });
      api.getAdminWebhooks().then(data => {
        if (data.success) setWebhooksList(data.webhooks || []);
      });
      api.getAdminAuditLogs().then(data => {
        if (data.success) setAuditLogs(data.logs || []);
      });
    }
  }, [activeTab, orderStatusFilter, supportFilterStatus, supportFilterPriority, errorSeverityFilter]);

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId, status) => {
    const res = await api.updateOrderStatus(orderId, status);
    if (res.success) {
      api.getAdminOrders(orderStatusFilter).then(data => {
        if (data.success) setAdminOrders(data.orders || []);
      });
    } else if (res.error) {
      alert(`Status update failed: ${res.error}`);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const res = await api.createProduct(newProd);
    if (res.success) {
      setShowAddProductModal(false);
      api.getAdminProducts().then(data => {
        if (data.success) setAdminProducts(data.products || []);
      });
    }
  };

  const handleStockAdjustment = async (variantId, currentStock) => {
    const newStockStr = prompt('Enter new stock quantity:', currentStock);
    if (newStockStr !== null) {
      const newStock = parseInt(newStockStr);
      if (!isNaN(newStock)) {
        await api.updateInventoryStock(variantId, newStock, 'Manual Admin Adjustment');
        api.getAdminInventory().then(data => {
          if (data.success) setInventoryList(data.inventory || []);
        });
      }
    }
  };

  // Banner Handlers
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (bannerForm.id) {
      await api.updateBanner(bannerForm.id, bannerForm);
    } else {
      await api.createBanner(bannerForm);
    }
    setShowBannerModal(false);
    api.getAdminBanners().then(data => { if (data.success) setBannersList(data.banners || []); });
  };

  const handleDeleteBanner = async (bannerId) => {
    if (confirm('Delete this hero banner?')) {
      await api.deleteBanner(bannerId);
      api.getAdminBanners().then(data => { if (data.success) setBannersList(data.banners || []); });
    }
  };

  const handleToggleBannerActive = async (banner) => {
    await api.updateBanner(banner.id, { active: banner.active === 1 ? 0 : 1 });
    api.getAdminBanners().then(data => { if (data.success) setBannersList(data.banners || []); });
  };

  // Blog Handlers
  const handleSaveBlogPost = async (e) => {
    e.preventDefault();
    if (blogForm.id) {
      await api.updateBlogPost(blogForm.id, blogForm);
    } else {
      await api.createBlogPost(blogForm);
    }
    setShowBlogModal(false);
    api.getBlogPosts().then(data => { if (data.success) setBlogList(data.posts || []); });
  };

  const handleDeleteBlogPost = async (postId) => {
    if (confirm('Delete this blog article?')) {
      await api.deleteBlogPost(postId);
      api.getBlogPosts().then(data => { if (data.success) setBlogList(data.posts || []); });
    }
  };

  // Returns & Reviews Handlers
  const handleUpdateReturn = async (returnId, status, refundAmount) => {
    await api.updateReturnStatus(returnId, status, refundAmount);
    api.getAdminReturns().then(data => {
      if (data.success) setReturnsList(data.returns || []);
    });
  };

  const handleUpdateReview = async (reviewId, status) => {
    await api.updateReviewStatus(reviewId, status);
    api.getAdminReviews().then(data => {
      if (data.success) setReviewsList(data.reviews || []);
    });
  };

  const handleUpdateErrorStatus = async (logId, status) => {
    await api.updateErrorLogStatus(logId, status);
    api.getAdminErrorLogs(errorSeverityFilter).then(data => {
      if (data.success) {
        setErrorLogs(data.logs || []);
        setErrorSpikeInfo(data.spike_detector || null);
      }
    });
  };

  const handleRetryWebhook = async (webhookId) => {
    const res = await api.retryWebhook(webhookId);
    if (res.success) {
      alert(res.message);
      api.getAdminWebhooks().then(data => {
        if (data.success) setWebhooksList(data.webhooks || []);
      });
    }
  };

  // Support Desk Handlers
  const handleOpenAdminTicket = async (ticketId) => {
    const res = await api.getAdminTicketDetail(ticketId);
    if (res.success) {
      setSelectedAdminTicket(res.ticket);
      setAdminTicketMessages(res.messages || []);
      setAssignedAgentInput(res.ticket.assigned_to || '');
    }
  };

  const handleAdminTicketReply = async () => {
    if (!adminReplyText.trim() || !selectedAdminTicket) return;
    const res = await api.replyToTicket(selectedAdminTicket.id, adminReplyText);
    if (res.success) {
      setAdminReplyText('');
      handleOpenAdminTicket(selectedAdminTicket.id);
      api.getAdminTickets(supportFilterStatus, supportFilterPriority).then(data => {
        if (data.success) setSupportTickets(data.tickets || []);
      });
    }
  };

  const handleAdminTicketStatusUpdate = async (ticketId, status, priority) => {
    await api.updateAdminTicket(ticketId, status, priority);
    if (selectedAdminTicket && selectedAdminTicket.id === ticketId) {
      setSelectedAdminTicket(prev => ({ ...prev, status, priority }));
    }
    api.getAdminTickets(supportFilterStatus, supportFilterPriority).then(data => {
      if (data.success) setSupportTickets(data.tickets || []);
    });
  };

  const handleAssignAgent = async () => {
    if (!selectedAdminTicket || !assignedAgentInput.trim()) return;
    const res = await api.assignTicket(selectedAdminTicket.id, assignedAgentInput.trim());
    if (res.success) {
      handleOpenAdminTicket(selectedAdminTicket.id);
      api.getAdminTickets(supportFilterStatus, supportFilterPriority).then(data => {
        if (data.success) setSupportTickets(data.tickets || []);
      });
    }
  };

  if (!user || user.role === 'CUSTOMER') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 font-body">
        <Shield size={48} className="text-error mx-auto" />
        <h2 className="font-display text-2xl font-bold text-error">Access Restricted</h2>
        <p className="text-xs text-on-surface-variant">Administrative permissions are required to access this portal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">

      {/* Admin Header */}
      <div className="bg-primary text-on-primary rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <span className="font-label text-[10px] uppercase tracking-widest text-gold-leaf font-bold block mb-1">
            Role-Based Admin Console ({user.role})
          </span>
          <h1 className="font-display text-2xl font-bold">Parthvi Operations Control</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-gold-leaf text-primary font-label text-xs font-bold uppercase px-3 py-1.5 rounded-full">
            Role: {user.role}
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-outline/20 font-label text-xs uppercase font-bold tracking-wider overflow-x-auto gap-4">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
          { id: 'orders', label: 'Orders State Machine', icon: <ShoppingBag size={16} /> },
          { id: 'products', label: 'Products & Variants', icon: <Package size={16} /> },
          { id: 'inventory', label: 'Inventory & FEFO Batches', icon: <Layers size={16} /> },
          { id: 'banners', label: 'Hero Banners CMS', icon: <ImageIcon size={16} /> },
          { id: 'blog', label: 'Blog Manager CMS', icon: <BookOpen size={16} /> },
          { id: 'returns', label: 'Returns & Refunds', icon: <RefreshCw size={16} /> },
          { id: 'reviews', label: 'Review Moderation', icon: <Star size={16} /> },
          { id: 'support', label: 'Support Desk', icon: <HelpCircle size={16} /> },
          { id: 'analytics', label: 'Analytics Suite', icon: <TrendingUp size={16} /> },
          { id: 'system', label: 'System Observability', icon: <AlertTriangle size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id ? 'border-gold-leaf text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {loadingOverview || !overview ? (
            <p className="text-xs font-body text-on-surface-variant">Loading operational metrics...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface p-5 rounded-xl border border-outline/20 space-y-1">
                  <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold">Today's Revenue</span>
                  <p className="font-display text-2xl font-bold text-primary">₹{overview.metrics.today_sales}</p>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-outline/20 space-y-1">
                  <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold">Total Revenue</span>
                  <p className="font-display text-2xl font-bold text-primary">₹{overview.metrics.total_revenue}</p>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-outline/20 space-y-1">
                  <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold">Total Orders</span>
                  <p className="font-display text-2xl font-bold text-on-surface">{overview.metrics.total_orders}</p>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-outline/20 space-y-1">
                  <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold">Pending Orders</span>
                  <p className="font-display text-2xl font-bold text-gold-leaf">{overview.metrics.pending_orders}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-error-container/20 border border-error/40 p-5 rounded-xl space-y-2">
                  <h4 className="font-display text-base font-bold text-error flex items-center gap-2">
                    <AlertTriangle size={18} /> Low Stock Alert
                  </h4>
                  <p className="text-xs font-body text-on-surface-variant">
                    {overview.metrics.low_stock_items} product variants are below their safety reorder threshold.
                  </p>
                </div>

                <div className="bg-gold-leaf/10 border border-gold-leaf/40 p-5 rounded-xl space-y-2">
                  <h4 className="font-display text-base font-bold text-gold-leaf flex items-center gap-2">
                    <Layers size={18} /> FEFO Expiry Warning
                  </h4>
                  <p className="text-xs font-body text-on-surface-variant">
                    {overview.metrics.expiring_batches} batches are expiring within 90 days.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Orders State Machine */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary">Order State Machine</h3>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface border border-outline/30 rounded-lg text-xs font-label uppercase"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10">
            {adminOrders.map((o) => (
              <div key={o.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-body">
                <div>
                  <span className="font-bold text-primary font-label text-sm block">{o.order_number}</span>
                  <p className="text-on-surface">{o.guest_name} ({o.guest_phone})</p>
                  <p className="text-on-surface-variant">Method: {o.payment_method} | Paid: {o.payment_status}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-display text-base font-bold text-primary">₹{o.total_amount}</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                    className="px-3 py-1.5 bg-surface-container border border-gold-leaf/40 rounded-lg font-label font-bold text-primary text-xs"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="PACKED">PACKED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="RETURN_APPROVED">RETURN_APPROVED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Products & Variants */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary">Product Catalogue Management</h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-primary text-on-primary font-label text-xs font-bold uppercase px-4 py-2 rounded-full inline-flex items-center gap-1"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10">
            {adminProducts.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs font-body">
                <div>
                  <h4 className="font-bold text-on-surface font-display text-sm">{p.name}</h4>
                  <p className="text-on-surface-variant">Category: {p.category_name} | Total Stock: {p.total_stock || 0}</p>
                </div>
                <span className="font-label font-bold text-primary">₹{p.selling_price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Inventory & FEFO */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="font-display text-xl font-bold text-primary">Inventory & FEFO Batch Tracker</h3>

          <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10 text-xs font-body">
            {inventoryList.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-on-surface">{item.product_name} ({item.attribute_value})</p>
                  <span className="text-on-surface-variant">SKU: {item.sku} | Reserved: {item.reserved_stock} | Sold: {item.sold_stock}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-bold font-label ${item.available_stock <= item.low_stock_threshold ? 'text-error' : 'text-primary'}`}>
                    Available: {item.available_stock}
                  </span>
                  <button
                    onClick={() => handleStockAdjustment(item.variant_id, item.available_stock)}
                    className="border border-outline/30 px-3 py-1 rounded text-[11px] font-label uppercase font-bold hover:bg-surface-container"
                  >
                    Adjust Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Hero Banners CMS (FR-037) */}
      {activeTab === 'banners' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary">Hero Banners CMS</h3>
            <button
              onClick={() => {
                setBannerForm({ id: null, title: '', subtitle: '', cta_text: 'Shop Now', cta_url: '/shop', desktop_image: '', mobile_image: '', display_order: 0, active: 1 });
                setShowBannerModal(true);
              }}
              className="bg-primary text-on-primary font-label text-xs font-bold uppercase px-4 py-2 rounded-full inline-flex items-center gap-1"
            >
              <Plus size={16} /> New Hero Banner
            </button>
          </div>

          {/* Banner Modal */}
          {showBannerModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf">
                <button onClick={() => setShowBannerModal(false)} className="absolute top-4 right-4"><X size={20} /></button>
                <h3 className="font-display text-lg font-bold text-primary">{bannerForm.id ? 'Edit Hero Banner' : 'Create Hero Banner'}</h3>
                <form onSubmit={handleSaveBanner} className="space-y-3 font-body text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Banner Title</label>
                    <input type="text" value={bannerForm.title} onChange={e => setBannerForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Restore Balance with Sacred Ayurveda" className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Subtitle</label>
                    <input type="text" value={bannerForm.subtitle} onChange={e => setBannerForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Brief marketing description..." className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">CTA Text</label>
                      <input type="text" value={bannerForm.cta_text} onChange={e => setBannerForm(p => ({ ...p, cta_text: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">CTA URL</label>
                      <input type="text" value={bannerForm.cta_url} onChange={e => setBannerForm(p => ({ ...p, cta_url: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Desktop Image URL</label>
                    <input type="url" value={bannerForm.desktop_image} onChange={e => setBannerForm(p => ({ ...p, desktop_image: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Display Order</label>
                      <input type="number" value={bannerForm.display_order} onChange={e => setBannerForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Status</label>
                      <select value={bannerForm.active} onChange={e => setBannerForm(p => ({ ...p, active: parseInt(e.target.value) }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg">
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:bg-primary-container">
                    Save Banner
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bannersList.map(b => (
              <div key={b.id} className="bg-surface rounded-xl border border-outline/20 overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="h-40 relative">
                  <img src={b.desktop_image} alt={b.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded ${b.active === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                    {b.active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="p-4 space-y-2 text-xs font-body">
                  <h4 className="font-display font-bold text-primary text-sm">{b.title}</h4>
                  <p className="text-on-surface-variant line-clamp-2">{b.subtitle}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-outline/10">
                    <span className="font-label text-[10px] text-gold-leaf font-bold">CTA: {b.cta_text} ({b.cta_url})</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleBannerActive(b)} className="border border-outline/30 px-2 py-1 rounded text-[10px] font-label font-bold uppercase">
                        {b.active === 1 ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => { setBannerForm(b); setShowBannerModal(true); }} className="p-1 text-primary hover:bg-primary/10 rounded">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteBanner(b.id)} className="p-1 text-error hover:bg-error-container/20 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {bannersList.length === 0 && (
              <p className="col-span-2 p-6 text-center text-on-surface-variant text-xs">No banners created yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Blog Manager CMS (FR-038) */}
      {activeTab === 'blog' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary">Blog Post Manager CMS</h3>
            <button
              onClick={() => {
                setBlogForm({ id: null, title: '', slug: '', cover_image: '', author: 'Ayurvedic Advisory Panel', publish_date: new Date().toISOString().slice(0, 10), category: 'Wellness', excerpt: '', content: '' });
                setShowBlogModal(true);
              }}
              className="bg-primary text-on-primary font-label text-xs font-bold uppercase px-4 py-2 rounded-full inline-flex items-center gap-1"
            >
              <Plus size={16} /> New Article
            </button>
          </div>

          {/* Blog Modal */}
          {showBlogModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf max-h-[85vh] overflow-y-auto">
                <button onClick={() => setShowBlogModal(false)} className="absolute top-4 right-4"><X size={20} /></button>
                <h3 className="font-display text-lg font-bold text-primary">{blogForm.id ? 'Edit Blog Article' : 'Publish New Article'}</h3>
                <form onSubmit={handleSaveBlogPost} className="space-y-3 font-body text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Article Title</label>
                    <input type="text" value={blogForm.title} onChange={e => {
                      const t = e.target.value;
                      setBlogForm(p => ({ ...p, title: t, slug: p.slug || t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }));
                    }} placeholder="Article title" className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">URL Slug</label>
                    <input type="text" value={blogForm.slug} onChange={e => setBlogForm(p => ({ ...p, slug: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <input type="text" value={blogForm.category} onChange={e => setBlogForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" required />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Author</label>
                      <input type="text" value={blogForm.author} onChange={e => setBlogForm(p => ({ ...p, author: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" required />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Cover Image URL</label>
                    <input type="url" value={blogForm.cover_image} onChange={e => setBlogForm(p => ({ ...p, cover_image: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Excerpt</label>
                    <textarea value={blogForm.excerpt} onChange={e => setBlogForm(p => ({ ...p, excerpt: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg resize-none" placeholder="Short summary..." />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Full Content</label>
                    <textarea value={blogForm.content} onChange={e => setBlogForm(p => ({ ...p, content: e.target.value }))} rows={6} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg resize-none font-mono text-[11px]" placeholder="Detailed article content..." required />
                  </div>
                  <button type="submit" className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:bg-primary-container">
                    Save & Publish Article
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10 font-body text-xs">
            {blogList.map(post => (
              <div key={post.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={post.cover} alt={post.title} className="w-16 h-12 object-cover rounded-lg shrink-0" />
                  <div>
                    <span className="font-label text-[10px] font-bold text-gold-leaf uppercase">{post.category} · {post.date}</span>
                    <h4 className="font-display font-bold text-primary text-sm">{post.title}</h4>
                    <p className="text-on-surface-variant text-[11px]">By {post.author}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => { setBlogForm(post); setShowBlogModal(true); }} className="p-1.5 text-primary hover:bg-primary/10 rounded">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteBlogPost(post.id)} className="p-1.5 text-error hover:bg-error-container/20 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Returns & Refunds */}
      {activeTab === 'returns' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="font-display text-xl font-bold text-primary">Returns & Refunds Desk</h3>

          <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10 text-xs font-body">
            {returnsList.map((r) => (
              <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-primary font-label text-sm block">Return #{r.id} · Order {r.order_number}</span>
                  <p className="text-on-surface">Reason: {r.reason}</p>
                  <span className="text-on-surface-variant">User: {r.user_email || 'N/A'} | Amount: ₹{r.refund_amount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-label font-bold uppercase px-2.5 py-1 rounded text-[10px] bg-gold-leaf/20 text-gold-leaf">
                    {r.status}
                  </span>
                  {r.status === 'REQUESTED' && (
                    <button
                      onClick={() => handleUpdateReturn(r.id, 'APPROVED', r.refund_amount)}
                      className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-3 py-1.5 rounded-full hover:bg-primary-container"
                    >
                      Approve Return
                    </button>
                  )}
                  {(r.status === 'APPROVED' || r.status === 'REQUESTED') && (
                    <button
                      onClick={() => handleUpdateReturn(r.id, 'REFUNDED', r.refund_amount)}
                      className="bg-gold-leaf text-primary font-label text-[10px] font-bold uppercase px-3 py-1.5 rounded-full hover:bg-gold-leaf/80"
                    >
                      Process Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
            {returnsList.length === 0 && (
              <p className="p-6 text-center text-on-surface-variant text-xs">No return requests found.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 8: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="font-display text-xl font-bold text-primary">Customer Review Moderation</h3>

          <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10 text-xs font-body">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{rev.user_name}</span>
                    <span className="text-gold-leaf font-bold">★ {rev.rating}/5</span>
                    {rev.verified_purchase === 1 && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">Verified</span>
                    )}
                  </div>
                  <p className="font-bold text-on-surface">{rev.product_name}</p>
                  <p className="text-on-surface-variant italic">"{rev.review_text}"</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-label text-[10px] font-bold uppercase px-2 py-1 rounded ${
                    rev.status === 'APPROVED' ? 'bg-tertiary/20 text-tertiary' :
                    rev.status === 'REJECTED' ? 'bg-error-container/40 text-error' :
                    'bg-gold-leaf/20 text-gold-leaf'
                  }`}>{rev.status}</span>

                  {rev.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateReview(rev.id, 'APPROVED')}
                      className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-3 py-1.5 rounded-full hover:bg-primary-container"
                    >
                      Approve
                    </button>
                  )}
                  {rev.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateReview(rev.id, 'REJECTED')}
                      className="border border-error/30 text-error font-label text-[10px] font-bold uppercase px-3 py-1.5 rounded-full hover:bg-error-container/20"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
            {reviewsList.length === 0 && (
              <p className="p-6 text-center text-on-surface-variant text-xs">No reviews pending moderation.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 9: Support Desk */}
      {activeTab === 'support' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-display text-xl font-bold text-primary">Customer Support Desk</h3>

            <div className="flex items-center gap-2">
              <select
                value={supportFilterStatus}
                onChange={e => setSupportFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-outline/30 rounded-lg text-xs font-label uppercase"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              <select
                value={supportFilterPriority}
                onChange={e => setSupportFilterPriority(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-outline/30 rounded-lg text-xs font-label uppercase"
              >
                <option value="">All Priorities</option>
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10 text-xs font-body max-h-[600px] overflow-y-auto">
              {supportTickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleOpenAdminTicket(t.id)}
                  className={`p-4 cursor-pointer transition-colors space-y-1 ${selectedAdminTicket?.id === t.id ? 'bg-gold-leaf/10 border-l-4 border-gold-leaf' : 'hover:bg-surface-container/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-label text-[10px] font-bold text-gold-leaf">{t.ticket_code}</span>
                    <span className={`font-label text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      t.priority === 'URGENT' ? 'bg-error text-on-error' :
                      t.priority === 'HIGH' ? 'bg-error-container/60 text-error' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>{t.priority}</span>
                  </div>
                  <p className="font-bold text-on-surface truncate">{t.subject}</p>
                  <p className="text-[11px] text-on-surface-variant">{t.user_name} ({t.user_email})</p>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant pt-1">
                    <span>Category: {t.category}</span>
                    <span className="font-bold text-primary uppercase">{t.status}</span>
                  </div>
                </div>
              ))}
              {supportTickets.length === 0 && (
                <p className="p-6 text-center text-on-surface-variant">No support tickets match filters.</p>
              )}
            </div>

            <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline/20 p-6 flex flex-col justify-between max-h-[600px]">
              {selectedAdminTicket ? (
                <>
                  <div className="border-b border-outline/10 pb-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-label text-[10px] uppercase text-gold-leaf font-bold">{selectedAdminTicket.ticket_code}</span>
                        <h4 className="font-display text-lg font-bold text-primary">{selectedAdminTicket.subject}</h4>
                        <p className="text-xs font-body text-on-surface-variant">From: {selectedAdminTicket.user_name} ({selectedAdminTicket.user_email})</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={selectedAdminTicket.status}
                          onChange={e => handleAdminTicketStatusUpdate(selectedAdminTicket.id, e.target.value, selectedAdminTicket.priority)}
                          className="px-2 py-1 bg-surface-container border border-outline/30 rounded text-xs font-label uppercase font-bold text-primary"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="WAITING_CUSTOMER">WAITING_CUSTOMER</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>

                        <select
                          value={selectedAdminTicket.priority}
                          onChange={e => handleAdminTicketStatusUpdate(selectedAdminTicket.id, selectedAdminTicket.status, e.target.value)}
                          className="px-2 py-1 bg-surface-container border border-outline/30 rounded text-xs font-label uppercase font-bold text-error"
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="URGENT">URGENT</option>
                        </select>
                      </div>
                    </div>

                    {/* Agent Assignment Bar */}
                    <div className="flex items-center gap-2 pt-2 text-xs font-body border-t border-outline/10">
                      <UserCheck size={14} className="text-gold-leaf" />
                      <span className="font-semibold text-on-surface">Assigned Agent:</span>
                      <input
                        type="text"
                        value={assignedAgentInput}
                        onChange={e => setAssignedAgentInput(e.target.value)}
                        placeholder="Staff Name / Email"
                        className="px-2 py-1 bg-surface-container border border-outline/30 rounded text-xs outline-none"
                      />
                      <button onClick={handleAssignAgent} className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                        Assign
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 py-4 my-2">
                    {adminTicketMessages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-xl text-xs font-body ${msg.sender_type === 'SUPPORT' ? 'bg-primary/10 ml-6 border border-primary/20' : 'bg-surface-container-low mr-6'}`}>
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1">
                          <span>{msg.sender_name} ({msg.sender_type})</span>
                          <span>{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-on-surface">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-outline/10 flex gap-2">
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={e => setAdminReplyText(e.target.value)}
                      placeholder="Type admin response..."
                      className="flex-1 px-3 py-2 bg-surface-container border border-outline/30 rounded-lg text-xs font-body outline-none focus:border-gold-leaf"
                      onKeyDown={e => e.key === 'Enter' && handleAdminTicketReply()}
                    />
                    <button onClick={handleAdminTicketReply} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label text-xs font-bold uppercase inline-flex items-center gap-1">
                      <Send size={14} /> Send Reply
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-on-surface-variant">
                  <HelpCircle size={36} className="text-gold-leaf" />
                  <p className="text-xs font-body">Select a support ticket from the list to view thread and respond.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 10: Behavioral Analytics, Visual Funnel & Insights (FR-041–FR-044) */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <h3 className="font-display text-xl font-bold text-primary">Behavioral Analytics & Conversion Funnel</h3>

          {/* Visual Conversion Funnel Chart */}
          <div className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-4 font-body text-xs">
            <div className="flex items-center justify-between border-b border-outline/10 pb-3">
              <div>
                <h4 className="font-display text-base font-bold text-primary">Visual Conversion Funnel</h4>
                <p className="text-on-surface-variant text-[11px]">Step-by-step visitor drop-off and conversion rates</p>
              </div>
              <span className="bg-gold-leaf/20 text-gold-leaf font-label text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                Overall Conversion: {analyticsData.funnel[analyticsData.funnel.length - 1]?.conversion || 0}%
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {analyticsData.funnel.map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-on-surface">{f.stage}</span>
                    <span className="text-primary font-label">{f.count} users ({f.conversion}%)</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden p-0.5 border border-outline/10">
                    <div
                      className="bg-gradient-to-r from-primary to-gold-leaf h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, f.conversion)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-3 text-xs font-body">
              <h4 className="font-display text-base font-bold text-primary flex items-center gap-1.5">
                <SearchIcon size={16} className="text-gold-leaf" /> Top Searched Keywords
              </h4>
              <div className="divide-y divide-outline/10">
                {analyticsData.search_analytics?.popular_keywords?.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <span className="font-bold text-on-surface">"{item.query}"</span>
                    <span className="bg-primary/10 text-primary font-label text-[10px] font-bold px-2 py-0.5 rounded-full">{item.count} searches</span>
                  </div>
                ))}
                {(!analyticsData.search_analytics?.popular_keywords || analyticsData.search_analytics.popular_keywords.length === 0) && (
                  <p className="text-on-surface-variant py-4">No search events recorded yet.</p>
                )}
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-3 text-xs font-body">
              <h4 className="font-display text-base font-bold text-error flex items-center gap-1.5">
                <AlertTriangle size={16} /> Zero-Result Search Queries
              </h4>
              <p className="text-on-surface-variant text-[11px]">Queries that returned 0 product results</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {analyticsData.search_analytics?.no_result_queries?.map((q, idx) => (
                  <span key={idx} className="bg-error-container/30 text-error font-label text-xs font-bold px-3 py-1 rounded-full border border-error/20">
                    "{q}"
                  </span>
                ))}
                {(!analyticsData.search_analytics?.no_result_queries || analyticsData.search_analytics.no_result_queries.length === 0) && (
                  <p className="text-on-surface-variant py-2">No zero-result searches detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* Automated Optimization Insights */}
          <div className="space-y-3">
            <h4 className="font-display text-base font-bold text-primary">Automated Optimization Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyticsData.insights.map((ins, idx) => (
                <div key={idx} className="bg-surface p-5 rounded-2xl border border-gold-leaf/30 space-y-2 text-xs font-body shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className={`font-label font-bold text-[9px] uppercase px-2 py-0.5 rounded inline-block ${
                      ins.type === 'CRITICAL' ? 'bg-error text-on-error' :
                      ins.type === 'WARNING' ? 'bg-gold-leaf text-primary' :
                      'bg-primary text-on-primary'
                    }`}>{ins.category}</span>
                    <h5 className="font-display text-sm font-bold text-primary pt-1">{ins.title}</h5>
                    <p className="text-on-surface-variant leading-relaxed">{ins.description}</p>
                  </div>
                  <button onClick={() => alert(`Action initiated: ${ins.action}`)} className="w-full border border-outline/30 font-label text-[10px] font-bold uppercase py-2 rounded-full hover:bg-surface-container mt-2">
                    {ins.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: System Observability & Webhook Inspector (FR-046 – FR-049) */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <h3 className="font-display text-xl font-bold text-primary">System Observability & Webhook Inspector</h3>

          {/* Error Spike Detector Banner (FR-047) */}
          {errorSpikeInfo && errorSpikeInfo.spike_detected && (
            <div className="bg-error-container/30 border-2 border-error p-5 rounded-2xl flex items-center justify-between gap-4 animate-bounce">
              <div className="space-y-1">
                <h4 className="font-display text-base font-bold text-error flex items-center gap-2">
                  <AlertTriangle size={20} /> Error Spike Detected!
                </h4>
                <p className="text-xs font-body text-on-surface font-semibold">{errorSpikeInfo.message}</p>
              </div>
              <button
                onClick={() => setErrorSeverityFilter('ERROR')}
                className="bg-error text-on-error font-label text-xs font-bold uppercase px-4 py-2 rounded-full shrink-0 hover:bg-error/80"
              >
                Inspect Errors
              </button>
            </div>
          )}

          {/* Centralized Error Logs & Severity Filter (FR-046) */}
          <div className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-4 text-xs font-body">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/10 pb-3">
              <div>
                <h4 className="font-display text-base font-bold text-error">Centralized Error Logs</h4>
                <p className="text-[11px] text-on-surface-variant">Real-time system exceptions & severity tracking</p>
              </div>

              <select
                value={errorSeverityFilter}
                onChange={e => setErrorSeverityFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface-container border border-outline/30 rounded-lg text-xs font-label uppercase font-bold text-primary"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="ERROR">ERROR</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
              </select>
            </div>

            <div className="divide-y divide-outline/10 max-h-72 overflow-y-auto">
              {errorLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        log.severity === 'CRITICAL' ? 'bg-error text-on-error' :
                        log.severity === 'ERROR' ? 'bg-error-container/60 text-error' :
                        log.severity === 'WARNING' ? 'bg-gold-leaf/20 text-gold-leaf' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>[{log.severity}]</span>
                      <span className="font-bold text-on-surface truncate">{log.message}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Endpoint: {log.endpoint || 'N/A'} | Category: {log.category} | Time: {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={log.status}
                      onChange={e => handleUpdateErrorStatus(log.id, e.target.value)}
                      className="px-2 py-1 bg-surface-container border border-outline/30 rounded text-[11px] font-label font-bold uppercase"
                    >
                      <option value="NEW">NEW</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="IGNORED">IGNORED</option>
                    </select>
                  </div>
                </div>
              ))}
              {errorLogs.length === 0 && (
                <p className="py-6 text-center text-on-surface-variant">No error logs matching criteria.</p>
              )}
            </div>
          </div>

          {/* Webhook Inspector & Retry Callbacks (FR-048, FR-049) */}
          <div className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-4 text-xs font-body">
            <div className="border-b border-outline/10 pb-3">
              <h4 className="font-display text-base font-bold text-primary">Webhook Inspector & Callback Retry</h4>
              <p className="text-[11px] text-on-surface-variant">Review raw Razorpay webhook event payloads and re-trigger processing</p>
            </div>

            <div className="divide-y divide-outline/10 max-h-72 overflow-y-auto">
              {webhooksList.map((wh) => (
                <div key={wh.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label text-xs font-bold text-primary">{wh.event_type}</span>
                      <span className={`font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded ${wh.processed === 1 ? 'bg-primary/10 text-primary' : 'bg-gold-leaf/20 text-gold-leaf'}`}>
                        {wh.processed === 1 ? 'PROCESSED' : 'UNPROCESSED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Provider: {wh.provider} | Event ID: {wh.event_id} | Received: {new Date(wh.created_at || Date.now()).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRawWebhook(wh)}
                      className="border border-outline/30 text-on-surface font-label text-[10px] font-bold uppercase px-3 py-1.5 rounded-full hover:bg-surface-container"
                    >
                      View Raw Payload
                    </button>
                    <button
                      onClick={() => handleRetryWebhook(wh.id)}
                      className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-3 py-1.5 rounded-full hover:bg-primary-container inline-flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Retry Callback
                    </button>
                  </div>
                </div>
              ))}
              {webhooksList.length === 0 && (
                <p className="py-6 text-center text-on-surface-variant">No webhook events logged yet.</p>
              )}
            </div>
          </div>

          {/* Raw Webhook Payload Modal */}
          {selectedRawWebhook && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf max-h-[80vh] overflow-y-auto">
                <button onClick={() => setSelectedRawWebhook(null)} className="absolute top-4 right-4"><X size={20} /></button>
                <div>
                  <span className="font-label text-[10px] uppercase text-gold-leaf font-bold">{selectedRawWebhook.provider} · Event #{selectedRawWebhook.id}</span>
                  <h3 className="font-display text-lg font-bold text-primary">{selectedRawWebhook.event_type}</h3>
                  <p className="text-xs text-on-surface-variant">Event ID: {selectedRawWebhook.event_id}</p>
                </div>

                <div className="bg-black/90 text-green-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedRawWebhook.payload_json}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const id = selectedRawWebhook.id;
                      setSelectedRawWebhook(null);
                      handleRetryWebhook(id);
                    }}
                    className="bg-primary text-on-primary font-label text-xs font-bold uppercase px-6 py-2.5 rounded-full hover:bg-primary-container inline-flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Re-Execute Webhook Callback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs */}
          <div className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-3 text-xs font-body">
            <h4 className="font-label text-xs uppercase font-bold text-gold-leaf mb-2">Admin Audit Trail</h4>
            <div className="divide-y divide-outline/10 max-h-60 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-on-surface">{log.action} on {log.entity} (#{log.entity_id})</p>
                    <span className="text-[10px] text-on-surface-variant">By: {log.admin_email}</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
