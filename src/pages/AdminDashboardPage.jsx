import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, Package, ShoppingBag, Layers, RefreshCw, Star, AlertTriangle, Activity, FileText, CheckCircle, Search, Plus, Edit, Trash2, HelpCircle, MessageSquare, Send, X, Image as ImageIcon, BookOpen, TrendingUp, Search as SearchIcon, Award, UserCheck, Truck, Printer, ExternalLink } from 'lucide-react';


export const AdminDashboardPage = () => {
  const { user, login } = useAuth();
  const [adminEmailInput, setAdminEmailInput] = useState('admin@parthvi.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('adminpassword123');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState(null);

  const handleAdminSignIn = async (e) => {
    if (e) e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError(null);
    const res = await login(adminEmailInput, adminPasswordInput);
    setAdminLoginLoading(false);
    if (!res.success) {
      setAdminLoginError(res.error || 'Invalid admin credentials');
    }
  };

  // Auto-login as Admin when navigating to /admin
  useEffect(() => {
    if (!user || user.role === 'CUSTOMER') {
      login('admin@parthvi.com', 'adminpassword123');
    }
  }, [user]);


  const [activeTab, setActiveTab] = useState('overview');

  // Overview State
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Orders State
  const [adminOrders, setAdminOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  // Products & Inventory State
  const [adminProducts, setAdminProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
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
  const [webhooksList, setWebhooksList] = useState([]);
  const [errorSeverityFilter, setErrorSeverityFilter] = useState('');
  const [errorSpikeInfo, setErrorSpikeInfo] = useState(null);
  const [selectedRawWebhook, setSelectedRawWebhook] = useState(null);

  // Selloship Shipping Modal State
  const [trackingModalData, setTrackingModalData] = useState({ open: false, waybill: '', tracking: null });
  const [manifestModalData, setManifestModalData] = useState({ open: false, manifestNumber: null, downloadUrl: null });

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
    manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd',
    image_url: '/products/chyawanprash.jpg',
  });

  // Product Edit Modal State
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [editProdImages, setEditProdImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    api.getCategories().then(data => {
      if (data.success) setCategoriesList(data.categories || []);
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user || user.role === 'CUSTOMER') return;

    if (activeTab === 'overview') {
      setLoadingOverview(true);
      api.getAdminOverview().then(data => {
        if (data.success) setOverview(data);
        setLoadingOverview(false);
        window.scrollTo(0, 0);
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
  }, [user, activeTab, orderStatusFilter, supportFilterStatus, supportFilterPriority, errorSeverityFilter]);


  if (!user || user.role === 'CUSTOMER') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 font-body">
        <div className="bg-surface rounded-2xl p-8 border border-gold-leaf/40 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Shield size={32} />
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-primary">Admin Control Portal</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Sign in with your administrative credentials to manage products, pricing, orders, and inventory.
            </p>
          </div>

          {adminLoginError && (
            <div className="bg-error-container/20 border border-error/30 text-error text-xs p-3 rounded-lg">
              {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4 text-left text-xs">
            <div>
              <label className="block font-semibold mb-1 text-on-surface">Admin Email</label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none font-body"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-on-surface">Password</label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none font-body"
                required
              />
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:bg-primary-container transition-colors shadow-md disabled:opacity-50"
            >
              {adminLoginLoading ? 'Signing In...' : 'Sign In to Admin Portal'}
            </button>
          </form>

          <div className="border-t border-outline/10 pt-4">
            <button
              type="button"
              onClick={() => handleAdminSignIn(null)}
              className="w-full bg-gold-leaf text-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
            >
              ⚡ 1-Click Quick Admin Access
            </button>
            <span className="text-[11px] text-on-surface-variant block mt-2">
              Default Demo Account: admin@parthvi.com
            </span>
          </div>
        </div>
      </div>
    );
  }




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

  // Selloship 2.0 Shipping Handlers
  const handleCreateWaybill = async (orderId) => {
    const res = await api.createSelloshipWaybill(orderId);
    if (res.success) {
      alert(`Selloship Waybill generated: ${res.waybill} (${res.courier_name})`);
      const updated = await api.getAdminOrders(orderStatusFilter);
      if (updated.success) setAdminOrders(updated.orders || []);
    } else {
      alert(`Waybill creation failed: ${res.error || 'Unknown error'}`);
    }
  };

  const handleCancelWaybill = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this Selloship waybill?')) return;
    const res = await api.cancelSelloshipWaybill(orderId);
    if (res.success) {
      alert(res.message || 'Waybill cancelled successfully');
      const updated = await api.getAdminOrders(orderStatusFilter);
      if (updated.success) setAdminOrders(updated.orders || []);
    } else {
      alert(`Cancellation failed: ${res.error || 'Unknown error'}`);
    }
  };

  const handleTrackPackage = async (waybill) => {
    const res = await api.trackSelloshipPackage(waybill);
    if (res.success) {
      setTrackingModalData({ open: true, waybill, tracking: res.tracking });
    } else {
      alert('Failed to retrieve parcel tracking details');
    }
  };

  const handleGenerateManifest = async () => {
    const waybillsToManifest = adminOrders.filter((o) => o.waybill).map((o) => o.waybill);
    if (waybillsToManifest.length === 0) {
      alert('No orders with active Selloship waybills found to generate manifest.');
      return;
    }
    const res = await api.generateSelloshipManifest(waybillsToManifest);
    if (res.success) {
      setManifestModalData({ open: true, manifestNumber: res.manifestNumber, downloadUrl: res.manifestDownloadUrl });
    } else {
      alert('Failed to generate manifest');
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

  const handleEditProduct = async (product) => {
    setEditProd({ ...product });
    setShowEditProductModal(true);
    const imgData = await api.getProductImages(product.id);
    setEditProdImages(imgData.success ? imgData.images : []);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    const res = await api.updateProduct(editProd.id, {
      name: editProd.name,
      slug: editProd.slug,
      category_id: editProd.category_id,
      short_desc: editProd.short_desc,
      description: editProd.description,
      mrp: parseFloat(editProd.mrp),
      selling_price: parseFloat(editProd.selling_price),
      is_featured: editProd.is_featured ? 1 : 0,
      is_bestseller: editProd.is_bestseller ? 1 : 0,
      is_new: editProd.is_new ? 1 : 0,
      target_dosha: editProd.target_dosha || 'TRIDOSAHIC',
      status: editProd.status,

      ingredients: editProd.ingredients,
      key_ingredients: editProd.key_ingredients,
      benefits: editProd.benefits,
      usage_directions: editProd.usage_directions,
      warnings: editProd.warnings,
      storage_info: editProd.storage_info,
      net_qty: editProd.net_qty,
      manufacturer_info: editProd.manufacturer_info,
    });
    setEditSaving(false);
    if (res.success) {
      setShowEditProductModal(false);
      api.getAdminProducts().then(data => {
        if (data.success) setAdminProducts(data.products || []);
      });
    } else {
      alert(`Update failed: ${res.error}`);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!confirm(`Delete "${product.name}"? This will also remove all variants and images.`)) return;
    const res = await api.deleteProduct(product.id);
    if (res.success) {
      // Remove immediately from local state so the list updates without waiting for a refetch.
      setAdminProducts(prev => prev.filter(p => p.id !== product.id));
      // Sync in background to pick up any server-side changes.
      api.getAdminProducts().then(data => {
        if (data.success) setAdminProducts(data.products || []);
      });
    } else {
      alert(`Delete failed: ${res.error}`);
    }
  };


  const handleAddImage = async () => {
    if (!newImageUrl.trim() || !editProd) return;
    const res = await api.addProductImage(editProd.id, newImageUrl.trim());
    if (res.success) {
      setNewImageUrl('');
      const imgData = await api.getProductImages(editProd.id);
      setEditProdImages(imgData.success ? imgData.images : []);
    } else {
      alert(`Failed to add image: ${res.error}`);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Remove this image from the gallery?')) return;
    await api.deleteProductImage(editProd.id, imageId);
    const imgData = await api.getProductImages(editProd.id);
    setEditProdImages(imgData.success ? imgData.images : []);
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

      {/* Tab 2: Orders State Machine & Selloship 2.0 Integration */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-outline/20">
            <div>
              <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
                <Truck className="text-gold-leaf" size={22} /> Order & Selloship Fulfillment
              </h3>
              <p className="text-xs text-on-surface-variant">Automated waybill generation, PDF shipping labels, and live tracking powered by Selloship 2.0</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleGenerateManifest}
                className="bg-gold-leaf/20 hover:bg-gold-leaf/30 text-primary border border-gold-leaf/40 text-xs font-bold font-label px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Generate consolidated manifest PDF for packed/shipped orders"
              >
                <Printer size={15} /> Batch Manifest PDF
              </button>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface-container border border-outline/30 rounded-lg text-xs font-label uppercase outline-none focus:border-gold-leaf"
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
          </div>

          <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10 shadow-sm">
            {adminOrders.map((o) => (
              <div key={o.id} className="p-4 sm:p-5 space-y-3 font-body text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary font-label text-sm">{o.order_number}</span>
                      {o.waybill && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 rounded text-[10px] font-bold font-mono">
                          AWB: {o.waybill} ({o.courier_name || 'Selloship Partner'})
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface mt-0.5">{o.guest_name || 'Customer'} ({o.guest_phone || 'No phone'})</p>
                    <p className="text-on-surface-variant">Method: <strong className="text-primary">{o.payment_method}</strong> | Payment Status: <strong className="text-primary">{o.payment_status}</strong></p>
                  </div>

                  <div className="flex items-center gap-3">
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

                {/* Selloship 2.0 Action Toolbar */}
                <div className="pt-2 border-t border-outline/10 flex flex-wrap items-center justify-between gap-2 bg-surface-container/30 p-2.5 rounded-lg">
                  {o.waybill ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={o.shipping_label_url || `https://selloship.com/labels/${o.waybill}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary text-on-primary hover:bg-primary-hover px-2.5 py-1 rounded text-[11px] font-bold font-label flex items-center gap-1 transition-colors"
                      >
                        <FileText size={13} /> Shipping Label PDF <ExternalLink size={11} />
                      </a>
                      <button
                        onClick={() => handleTrackPackage(o.waybill)}
                        className="bg-surface border border-outline/40 text-on-surface hover:border-gold-leaf px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Truck size={13} className="text-gold-leaf" /> Track Parcel
                      </button>
                      <button
                        onClick={() => handleCancelWaybill(o.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                      >
                        Cancel Waybill
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-on-surface-variant italic">No waybill generated yet</span>
                      <button
                        onClick={() => handleCreateWaybill(o.id)}
                        className="bg-gold-leaf text-primary font-bold font-label text-[11px] px-3 py-1.5 rounded-md hover:bg-gold-leaf/90 flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Package size={14} /> Generate Waybill & Label (Selloship 2.0)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tracking Modal */}
          {trackingModalData.open && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
              <div className="bg-surface rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-gold-leaf/40 relative my-auto">
                <button onClick={() => setTrackingModalData({ open: false, waybill: '', tracking: null })} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary"><X size={20} /></button>
                <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2"><Truck className="text-gold-leaf" size={20} /> Live Selloship Tracking</h3>
                
                <div className="space-y-3 font-body text-xs">
                  <div className="bg-surface-container p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-on-surface-variant">Waybill (AWB): <strong className="text-primary font-mono">{trackingModalData.waybill}</strong></p>
                      <p className="text-on-surface-variant">Carrier: <strong className="text-primary">{trackingModalData.tracking?.carrier || 'Delhivery'}</strong></p>
                    </div>
                    <span className="px-2.5 py-1 bg-gold-leaf/20 text-primary font-bold rounded-full text-[10px]">
                      {trackingModalData.tracking?.currentStatus || 'IN_TRANSIT'}
                    </span>
                  </div>

                  <h4 className="font-label font-bold text-primary text-xs uppercase pt-2">Status Timeline</h4>
                  <div className="space-y-2 border-l-2 border-gold-leaf/40 pl-3">
                    {(trackingModalData.tracking?.events || []).map((ev, idx) => (
                      <div key={idx} className="relative">
                        <div className="w-2 h-2 rounded-full bg-gold-leaf absolute -left-[17px] top-1" />
                        <p className="font-bold text-primary">{ev.status}</p>
                        <p className="text-on-surface-variant text-[11px]">{ev.location} • {new Date(ev.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manifest Modal */}
          {manifestModalData.open && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
              <div className="bg-surface rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-gold-leaf/40 relative text-center my-auto">
                <button onClick={() => setManifestModalData({ open: false, manifestNumber: null, downloadUrl: null })} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary"><X size={20} /></button>
                <Printer className="mx-auto text-gold-leaf" size={36} />
                <h3 className="font-display text-lg font-bold text-primary">Manifest Generated</h3>
                <p className="text-xs text-on-surface-variant">Manifest Number: <strong className="text-primary font-mono">{manifestModalData.manifestNumber}</strong></p>
                <div className="pt-3">
                  <a
                    href={manifestModalData.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-label font-bold text-xs uppercase shadow-md hover:bg-primary-hover transition-all"
                  >
                    <FileText size={16} /> Download Manifest PDF
                  </a>
                </div>
              </div>
            </div>
          )}

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

          {/* Add Product Modal */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
              <div className="bg-surface rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl border border-gold-leaf relative my-auto">
                <button onClick={() => setShowAddProductModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary"><X size={20} /></button>
                <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2"><Plus size={18} /> Add New Formulation / Product</h3>


                <form onSubmit={handleCreateProduct} className="space-y-4 font-body text-xs">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Product Name *</label>
                      <input
                        type="text"
                        value={newProd.name}
                        onChange={e => {
                          const val = e.target.value;
                          const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setNewProd(p => ({ ...p, name: val, slug: p.slug ? p.slug : generatedSlug }));
                        }}
                        placeholder="e.g. Sukero Capsules (Diabetes Management)"
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">URL Slug *</label>
                      <input
                        type="text"
                        value={newProd.slug}
                        onChange={e => setNewProd(p => ({ ...p, slug: e.target.value }))}
                        placeholder="e.g. sukero-diabetes-management"
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Category & Pricing */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Category *</label>
                      <select
                        value={newProd.category_id}
                        onChange={e => setNewProd(p => ({ ...p, category_id: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                      >
                        {categoriesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">MRP (₹) *</label>
                      <input
                        type="number"
                        value={newProd.mrp}
                        onChange={e => setNewProd(p => ({ ...p, mrp: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Selling Price (₹) *</label>
                      <input
                        type="number"
                        value={newProd.selling_price}
                        onChange={e => setNewProd(p => ({ ...p, selling_price: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Net Quantity</label>
                      <input
                        type="text"
                        value={newProd.net_qty}
                        onChange={e => setNewProd(p => ({ ...p, net_qty: e.target.value }))}
                        placeholder="e.g. 60 Capsules / 500g"
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Target Dosha (Quiz Recommendation)</label>
                      <select
                        value={newProd.target_dosha || 'TRIDOSAHIC'}
                        onChange={e => setNewProd(p => ({ ...p, target_dosha: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none font-bold text-primary"
                      >
                        <option value="TRIDOSAHIC">Tridoshic (All Doshas / Universal)</option>
                        <option value="VATA">Vata (Air & Space)</option>
                        <option value="PITTA">Pitta (Fire & Water)</option>
                        <option value="KAPHA">Kapha (Earth & Water)</option>
                        <option value="VATA,PITTA">Vata & Pitta</option>
                        <option value="KAPHA,PITTA">Kapha & Pitta</option>
                        <option value="VATA,KAPHA">Vata & Kapha</option>
                      </select>
                    </div>
                  </div>


                  {/* Main Product Image URL & Local File Upload */}
                  <div className="border border-outline/20 p-3 rounded-xl space-y-2 bg-surface-container-low">
                    <label className="block font-semibold text-primary flex items-center gap-1">
                      <ImageIcon size={14} /> Main Product Image *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="text"
                        value={newProd.image_url}
                        onChange={e => setNewProd(p => ({ ...p, image_url: e.target.value }))}
                        placeholder="/products/your-image.jpg or https://..."
                        className="flex-1 w-full px-3 py-2 bg-surface border border-outline/30 rounded-lg focus:border-gold-leaf outline-none text-xs"
                      />
                      <label className="bg-surface-container-high hover:bg-gold-leaf hover:text-white px-3 py-2 rounded-lg cursor-pointer border border-outline/30 font-label text-xs font-bold whitespace-nowrap">
                        Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64Data = reader.result;
                                const res = await api.uploadImage(base64Data, file.name);
                                if (res.success && res.url) {
                                  setNewProd(p => ({ ...p, image_url: res.url }));
                                } else {
                                  alert(`Image upload failed: ${res.error || 'Unknown error'}`);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {newProd.image_url && (
                      <div className="flex items-center gap-2 pt-1">
                        <img src={newProd.image_url} alt="Preview" className="w-12 h-12 object-cover rounded border border-outline/30" />
                        <span className="text-[10px] text-on-surface-variant font-mono">Saved Path: {newProd.image_url}</span>
                      </div>
                    )}
                  </div>


                  {/* Short Description */}
                  <div>
                    <label className="block font-semibold mb-1 text-on-surface">Short Summary / Tagline</label>
                    <input
                      type="text"
                      value={newProd.short_desc}
                      onChange={e => setNewProd(p => ({ ...p, short_desc: e.target.value }))}
                      placeholder="100% Natural & Vegetarian Capsules for..."
                      className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                    />
                  </div>

                  {/* Badges & Flags */}
                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!newProd.is_featured} onChange={e => setNewProd(p => ({ ...p, is_featured: e.target.checked ? 1 : 0 }))} className="accent-gold-leaf w-4 h-4" />
                      <span className="font-semibold text-on-surface">Featured Formulation</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!newProd.is_bestseller} onChange={e => setNewProd(p => ({ ...p, is_bestseller: e.target.checked ? 1 : 0 }))} className="accent-gold-leaf w-4 h-4" />
                      <span className="font-semibold text-on-surface">Best Seller</span>
                    </label>
                  </div>

                  {/* Detailed Description Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Full Description</label>
                      <textarea
                        rows={3}
                        value={newProd.description}
                        onChange={e => setNewProd(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Key Ingredients</label>
                      <textarea
                        rows={3}
                        value={newProd.key_ingredients}
                        onChange={e => setNewProd(p => ({ ...p, key_ingredients: e.target.value }))}
                        placeholder="Jamun Seeds, Karela, Gudmar, Vijaysar..."
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Ingredients (Full Compositions)</label>
                      <textarea
                        rows={2}
                        value={newProd.ingredients}
                        onChange={e => setNewProd(p => ({ ...p, ingredients: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Benefits & Indications</label>
                      <textarea
                        rows={2}
                        value={newProd.benefits}
                        onChange={e => setNewProd(p => ({ ...p, benefits: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Usage Directions / Dosage</label>
                      <input
                        type="text"
                        value={newProd.usage_directions}
                        onChange={e => setNewProd(p => ({ ...p, usage_directions: e.target.value }))}
                        placeholder="Take 1 capsule twice daily after meals with water"
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Storage & Manufacturer Info</label>
                      <input
                        type="text"
                        value={newProd.storage_info}
                        onChange={e => setNewProd(p => ({ ...p, storage_info: e.target.value }))}
                        placeholder="Store in a cool dry place away from direct sunlight"
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button type="submit" className="flex-1 bg-primary text-on-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:bg-primary-container">
                      Publish Product
                    </button>
                    <button type="button" onClick={() => setShowAddProductModal(false)} className="px-6 border border-outline/30 rounded-full font-label text-xs font-bold">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {showEditProductModal && editProd && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
              <div className="bg-surface rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl border border-gold-leaf relative my-auto">
                <button onClick={() => setShowEditProductModal(false)} className="absolute top-4 right-4"><X size={20} /></button>
                <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2"><Edit size={18} /> Edit Product & Gallery Images</h3>


                <form onSubmit={handleUpdateProduct} className="space-y-4 font-body text-xs">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">Product Name *</label>
                      <input type="text" value={editProd.name || ''} onChange={e => setEditProd(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none" required />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-on-surface">URL Slug *</label>
                      <input type="text" value={editProd.slug || ''} onChange={e => setEditProd(p => ({ ...p, slug: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none" required />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-on-surface">Short Description</label>
                    <input type="text" value={editProd.short_desc || ''} onChange={e => setEditProd(p => ({ ...p, short_desc: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">MRP (₹)</label>
                      <input type="number" value={editProd.mrp || ''} onChange={e => setEditProd(p => ({ ...p, mrp: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Price (₹)</label>
                      <input type="number" value={editProd.selling_price || ''} onChange={e => setEditProd(p => ({ ...p, selling_price: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Status</label>
                      <select value={editProd.status || 'PUBLISHED'} onChange={e => setEditProd(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none">
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Net Qty</label>
                      <input type="text" value={editProd.net_qty || ''} onChange={e => setEditProd(p => ({ ...p, net_qty: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Target Dosha</label>
                      <select value={editProd.target_dosha || 'TRIDOSAHIC'} onChange={e => setEditProd(p => ({ ...p, target_dosha: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none font-bold text-primary">
                        <option value="TRIDOSAHIC">Tridoshic (Universal)</option>
                        <option value="VATA">Vata</option>
                        <option value="PITTA">Pitta</option>
                        <option value="KAPHA">Kapha</option>
                        <option value="VATA,PITTA">Vata & Pitta</option>
                        <option value="KAPHA,PITTA">Kapha & Pitta</option>
                        <option value="VATA,KAPHA">Vata & Kapha</option>
                      </select>
                    </div>
                  </div>


                  {/* Flags */}
                  <div className="flex flex-wrap gap-4">
                    {[['is_featured', 'Featured'], ['is_bestseller', 'Best Seller'], ['is_new', 'New Arrival']].map(([field, label]) => (
                      <label key={field} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!editProd[field]} onChange={e => setEditProd(p => ({ ...p, [field]: e.target.checked ? 1 : 0 }))} className="accent-gold-leaf w-4 h-4" />
                        <span className="font-semibold text-on-surface">{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Detailed Fields */}
                  {[['description', 'Full Description', 3], ['ingredients', 'Ingredients (full list)', 2], ['key_ingredients', 'Key Ingredients', 1], ['benefits', 'Benefits', 2], ['usage_directions', 'Usage Directions', 2], ['warnings', 'Warnings & Precautions', 1], ['storage_info', 'Storage Info', 1], ['manufacturer_info', 'Manufacturer Info', 1]].map(([field, label, rows]) => (
                    <div key={field}>
                      <label className="block font-semibold mb-1 text-on-surface">{label}</label>
                      <textarea
                        rows={rows}
                        value={editProd[field] || ''}
                        onChange={e => setEditProd(p => ({ ...p, [field]: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none resize-none"
                      />
                    </div>
                  ))}

                  {/* Image Gallery Manager */}
                  <div className="border-t border-outline/10 pt-4 space-y-3">
                    <h4 className="font-display text-sm font-bold text-primary flex items-center gap-2"><ImageIcon size={16} /> Image Gallery</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {editProdImages.map(img => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.image_url}
                            alt=""
                            className="w-full h-20 object-cover rounded-lg border border-outline/20"
                            onError={e => { e.target.style.background = '#1a1a1a'; }}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-black/60 text-white rounded-b-lg px-1 py-0.5 truncate">#{img.display_order}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        placeholder="/products/your-image.jpg or https://..."
                        className="flex-1 px-3 py-2 bg-surface-container border border-outline/30 rounded-lg focus:border-gold-leaf outline-none text-xs"
                      />
                      <label className="bg-surface-container-high hover:bg-gold-leaf hover:text-white px-3 py-2 rounded-lg cursor-pointer border border-outline/30 font-label text-xs font-bold text-center whitespace-nowrap">
                        Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64Data = reader.result;
                                const res = await api.uploadImage(base64Data, file.name);
                                if (res.success && res.url) {
                                  setNewImageUrl(res.url);
                                } else {
                                  alert(`Image upload failed: ${res.error || 'Unknown error'}`);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />

                      </label>
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="bg-gold-leaf text-primary font-label text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 whitespace-nowrap"
                      >
                        + Add to Gallery
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={editSaving} className="flex-1 bg-primary text-on-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:bg-primary-container disabled:opacity-50">
                      {editSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setShowEditProductModal(false)} className="px-6 border border-outline/30 rounded-full font-label text-xs font-bold">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


          {/* Products Table */}
          <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10">
            {adminProducts.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs font-body">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-on-surface font-display text-sm">{p.name}</h4>
                    {p.is_bestseller === 1 && <span className="bg-gold-leaf/20 text-gold-leaf font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded">Bestseller</span>}
                    {p.is_featured === 1 && <span className="bg-primary/10 text-primary font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded">Featured</span>}
                    {p.is_new === 1 && <span className="bg-green-500/10 text-green-500 font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded">New</span>}
                    <span className={`font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded ${p.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-outline/20 text-on-surface-variant'}`}>{p.status}</span>
                  </div>
                  <p className="text-on-surface-variant mt-0.5">
                    {p.category_name} · Stock: {p.total_stock ?? 0} · SKU range: {p.id}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-label font-bold text-primary text-sm block">₹{p.selling_price}</span>
                    {Number(p.mrp) > Number(p.selling_price) && <span className="text-on-surface-variant line-through text-[11px]">₹{p.mrp}</span>}

                  </div>
                  <button
                    onClick={() => handleEditProduct(p)}
                    className="border border-outline/30 bg-surface-container px-3 py-1.5 rounded-lg text-[11px] font-label font-bold uppercase hover:border-gold-leaf hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p)}
                    className="border border-red-500/30 bg-red-500/5 text-red-500 px-3 py-1.5 rounded-lg text-[11px] font-label font-bold uppercase hover:bg-red-500/10 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
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
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
              <div className="bg-surface rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf my-auto">
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
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
              <div className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf max-h-[85vh] overflow-y-auto my-auto">
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
              <p className="text-[11px] text-on-surface-variant">Review raw Cashfree webhook event payloads and re-trigger processing</p>

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
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
              <div className="bg-surface rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf max-h-[80vh] overflow-y-auto my-auto">
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
