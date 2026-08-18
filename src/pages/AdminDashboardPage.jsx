import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, Package, ShoppingBag, Layers, RefreshCw, Star, AlertTriangle, Activity, FileText, CheckCircle, Search, Plus, Edit } from 'lucide-react';

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

  // Returns & Reviews State
  const [returnsList, setReturnsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

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
    } else if (activeTab === 'returns') {
      api.getAdminReturns().then(data => {
        if (data.success) setReturnsList(data.returns || []);
      });
    } else if (activeTab === 'reviews') {
      api.getAdminReviews().then(data => {
        if (data.success) setReviewsList(data.reviews || []);
      });
    } else if (activeTab === 'analytics') {
      api.getAdminAnalytics().then(data => {
        if (data.success) setAnalyticsData(data);
      });
    } else if (activeTab === 'system') {
      api.getAdminErrorLogs().then(data => {
        if (data.success) setErrorLogs(data.logs || []);
      });
      api.getAdminAuditLogs().then(data => {
        if (data.success) setAuditLogs(data.logs || []);
      });
    }
  }, [activeTab, orderStatusFilter]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    const res = await api.updateOrderStatus(orderId, status);
    if (res.success) {
      api.getAdminOrders(orderStatusFilter).then(data => {
        if (data.success) setAdminOrders(data.orders || []);
      });
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
          { id: 'returns', label: 'Returns & Refunds', icon: <RefreshCw size={16} /> },
          { id: 'reviews', label: 'Review Moderation', icon: <Star size={16} /> },
          { id: 'analytics', label: 'Analytics Suite', icon: <FileText size={16} /> },
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
              {/* KPI Cards Grid */}
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

              {/* Low Stock & Expiring Batches Alert Cards */}
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
                  
                  {/* Status Transition Control */}
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                    className="px-3 py-1.5 bg-surface-container border border-gold-leaf/40 rounded-lg font-label font-bold text-primary"
                  >
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

      {/* Tab 7: Analytics Suite */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <h3 className="font-display text-xl font-bold text-primary">Conversion Funnel & Insights</h3>

          {/* Funnel Table */}
          <div className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-3 text-xs font-body">
            <h4 className="font-label text-xs uppercase font-bold text-gold-leaf mb-2">Multi-Stage Funnel</h4>
            {analyticsData.funnel.map((f, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-outline/10">
                <span className="font-bold text-on-surface">{f.stage}</span>
                <span className="font-label font-bold text-primary">{f.count} ({f.conversion}%)</span>
              </div>
            ))}
          </div>

          {/* Optimization Insights */}
          <div className="space-y-3">
            <h4 className="font-label text-xs uppercase font-bold text-gold-leaf">Automated Optimization Insights</h4>
            {analyticsData.insights.map((ins, idx) => (
              <div key={idx} className="bg-gold-leaf/10 border border-gold-leaf/30 p-4 rounded-xl space-y-1 text-xs font-body">
                <span className="font-bold text-primary font-label uppercase text-[10px] block">{ins.category}</span>
                <h5 className="font-bold text-on-surface">{ins.title}</h5>
                <p className="text-on-surface-variant">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: System Observability */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <h3 className="font-display text-xl font-bold text-primary">System Observability & Audit Logs</h3>

          {/* Error Logs */}
          <div className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-3 text-xs font-body">
            <h4 className="font-label text-xs uppercase font-bold text-error mb-2">Centralized Error Logs</h4>
            <div className="divide-y divide-outline/10 max-h-60 overflow-y-auto">
              {errorLogs.map((log) => (
                <div key={log.id} className="py-2 space-y-0.5">
                  <div className="flex justify-between font-bold text-on-surface">
                    <span>[{log.severity}] {log.message}</span>
                    <span className="text-[10px] text-on-surface-variant">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Endpoint: {log.endpoint || 'N/A'} | Status: {log.status}</p>
                </div>
              ))}
            </div>
          </div>

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
