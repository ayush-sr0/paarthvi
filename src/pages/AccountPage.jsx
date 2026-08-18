import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Package, MapPin, Heart, Star, HelpCircle, LogOut, Download, RefreshCw, FileText, CheckCircle, Clock } from 'lucide-react';

export const AccountPage = () => {
  const { user, login, register, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'orders';
  const showLoginParam = searchParams.get('login') === 'true';

  // Auth Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState(null);

  // Customer Dashboard State
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState(null);

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      api.getMyOrders().then(data => {
        if (data.success) setOrders(data.orders || []);
        setLoadingOrders(false);
      });
      api.getMe().then(data => {
        if (data.success) setAddresses(data.addresses || []);
      });
    }
  }, [user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (isRegistering) {
      const res = await register(authName, authEmail, authPassword, authPhone);
      if (!res.success) setAuthError(res.error || 'Registration failed');
    } else {
      const res = await login(authEmail, authPassword);
      if (!res.success) setAuthError(res.error || 'Invalid credentials');
    }
  };

  const handleTrackOrder = async (orderNumber) => {
    const res = await api.trackOrder(orderNumber);
    if (res.success) {
      setSelectedOrderTracking(res.order);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    const res = await api.getInvoice(orderId);
    if (res.success && res.invoice) {
      const win = window.open('', '_blank');
      win.document.write(`
        <html>
          <head><title>Invoice ${res.invoice.invoice_number}</title></head>
          <body style="font-family: sans-serif; padding: 30px;">
            <h2>${res.invoice.store_info.name}</h2>
            <p>Invoice: ${res.invoice.invoice_number} | Order: ${res.invoice.order_number}</p>
            <hr />
            <p>Customer: ${res.invoice.customer_info.name} (${res.invoice.customer_info.phone})</p>
            <p>Total Paid: ₹${res.invoice.pricing.total_amount}</p>
            <button onclick="window.print()">Print Invoice</button>
          </body>
        </html>
      `);
    }
  };

  // If customer is not logged in, render Login / Register Modal Card
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-margin-mobile py-16">
        <div className="bg-surface rounded-2xl border border-gold-leaf/30 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <span className="material-symbols-outlined text-3xl text-gold-leaf">spa</span>
            <h2 className="font-display text-2xl font-bold text-primary">
              {isRegistering ? 'Create Customer Account' : 'Welcome to Parthvi Ayurveda'}
            </h2>
            <p className="font-body text-xs text-on-surface-variant">
              {isRegistering ? 'Sign up to track orders & earn rewards' : 'Sign in to access your orders & address book'}
            </p>
          </div>

          {authError && (
            <div className="bg-error-container/30 border border-error text-error p-3 rounded-lg text-xs font-body">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 font-body text-xs">
            {isRegistering && (
              <div>
                <label className="block font-semibold mb-1 text-on-surface">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                  required
                />
              </div>
            )}
            <div>
              <label className="block font-semibold mb-1 text-on-surface">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-on-surface">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                required
              />
            </div>
            {isRegistering && (
              <div>
                <label className="block font-semibold mb-1 text-on-surface">Mobile Phone (+91)</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider py-3.5 rounded-full hover:bg-primary-container transition-colors shadow-md"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-outline/10 text-xs font-body">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-gold-leaf font-bold hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'New customer? Create an account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      
      {/* Account Header */}
      <div className="bg-surface rounded-2xl border border-outline/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-1">
            Customer Dashboard
          </span>
          <h1 className="font-display text-2xl font-bold text-primary">Namaste, {user.name}!</h1>
          <p className="font-body text-xs text-on-surface-variant mt-0.5">{user.email} | Phone: {user.phone || 'Not provided'}</p>
        </div>

        <button
          onClick={logout}
          className="border border-outline/30 text-error hover:bg-error-container/20 font-label text-xs font-bold uppercase px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5 w-fit"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-outline/10 font-label text-xs uppercase font-bold tracking-wider overflow-x-auto gap-6">
        <button
          onClick={() => setSearchParams({ tab: 'orders' })}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'orders' ? 'border-gold-leaf text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <Package size={16} /> My Orders ({orders.length})
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'addresses' })}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'addresses' ? 'border-gold-leaf text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <MapPin size={16} /> Address Book ({addresses.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <p className="text-xs font-body text-on-surface-variant text-center py-8">Fetching order history...</p>
          ) : orders.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center border border-outline/20 space-y-3">
              <Package size={32} className="text-gold-leaf mx-auto" />
              <h3 className="font-display text-lg font-bold text-primary">No orders placed yet</h3>
              <button onClick={() => navigate('/shop')} className="bg-primary text-on-primary font-label text-xs uppercase px-6 py-2.5 rounded-full inline-block">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-surface rounded-2xl border border-outline/20 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline/10 pb-3 gap-2">
                    <div>
                      <span className="font-label text-xs font-bold text-primary block">Order {o.order_number}</span>
                      <span className="text-[11px] text-on-surface-variant font-body">Placed on {new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-gold-leaf/20 text-gold-leaf font-label text-[10px] font-bold uppercase px-2.5 py-1 rounded">
                        {o.status}
                      </span>
                      <span className="font-display text-base font-bold text-primary">₹{o.total_amount}</span>
                    </div>
                  </div>

                  {/* Item preview */}
                  <div className="space-y-2">
                    {o.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-body">
                        <span>{item.product_name} ({item.variant_name}) × {item.quantity}</span>
                        <span className="font-bold">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-outline/10 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleTrackOrder(o.order_number)}
                      className="bg-primary text-on-primary font-label text-xs font-bold uppercase px-4 py-2 rounded-full hover:bg-primary-container transition-colors"
                    >
                      Track Order
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(o.id)}
                      className="border border-outline/30 text-on-surface font-label text-xs font-bold uppercase px-4 py-2 rounded-full hover:bg-surface-container transition-colors inline-flex items-center gap-1"
                    >
                      <Download size={14} /> GST Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tracking Timeline Modal */}
          {selectedOrderTracking && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf">
                <button onClick={() => setSelectedOrderTracking(null)} className="absolute top-4 right-4 text-lg font-bold">✕</button>
                
                <h3 className="font-display text-lg font-bold text-primary">Tracking Order {selectedOrderTracking.order_number}</h3>

                <div className="space-y-4 py-2">
                  {selectedOrderTracking.timeline?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs font-body">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold ${step.done ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <div>
                        <p className={`font-bold ${step.done ? 'text-primary' : 'text-on-surface-variant'}`}>{step.title}</p>
                        {step.timestamp && <span className="text-[10px] text-on-surface-variant">{new Date(step.timestamp).toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div key={a.id} className="bg-surface p-5 rounded-xl border border-outline/20 space-y-2 text-xs font-body">
                <p className="font-bold text-primary">{a.name} ({a.phone})</p>
                <p className="text-on-surface-variant">{a.street_address}, {a.city}, {a.state} - {a.pincode}</p>
                {a.is_default === 1 && (
                  <span className="bg-gold-leaf/20 text-gold-leaf font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded inline-block">
                    Default Address
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
