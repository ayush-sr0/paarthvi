import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Package, MapPin, Heart, HelpCircle, LogOut, Download, ShoppingBag, RefreshCw, Star, MessageSquare, Send, X, ChevronDown, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';

export const AccountPage = () => {
  const { user, login, loginWithGoogle, register, logout } = useAuth();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'orders';

  // Auth Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Google login failed');
    }
  };


  // Address Form State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: null,
    name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  // Address Handlers
  const fetchAddresses = () => {
    api.getMe().then(data => {
      if (data.success) setAddresses(data.addresses || []);
    });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    let res;
    if (addressForm.id) {
      res = await api.updateAddress(addressForm.id, addressForm);
    } else {
      res = await api.addAddress(addressForm);
    }
    if (res.success) {
      showSuccess(addressForm.id ? 'Address updated!' : 'Address added!');
      setShowAddressModal(false);
      fetchAddresses();
    } else {
      showError(res.error || 'Failed to save address');
    }
  };

  const handleEditAddress = (addr) => {
    setAddressForm({
      id: addr.id,
      name: addr.name,
      phone: addr.phone,
      street_address: addr.street_address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default === 1,
    });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (confirm('Delete this address?')) {
      const res = await api.deleteAddress(addressId);
      if (res.success) {
        showSuccess('Address deleted');
        fetchAddresses();
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    const res = await api.setDefaultAddress(addressId);
    if (res.success) {
      showSuccess('Default address updated');
      fetchAddresses();
    }
  };

  // Orders State
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState(null);

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Support State
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'ORDER', message: '', order_id: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [replyText, setReplyText] = useState('');

  // Return Modal State
  const [returnModal, setReturnModal] = useState(null); // { orderId, items }
  const [returnItemId, setReturnItemId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnImageUrl, setReturnImageUrl] = useState('');

  useEffect(() => {
    if (user) {
      if (activeTab === 'orders') {
        setLoadingOrders(true);
        api.getMyOrders().then(data => {
          if (data.success) setOrders(data.orders || []);
          setLoadingOrders(false);
        });
      } else if (activeTab === 'addresses') {
        api.getMe().then(data => {
          if (data.success) setAddresses(data.addresses || []);
        });
      } else if (activeTab === 'wishlist') {
        setLoadingWishlist(true);
        api.getWishlist().then(data => {
          if (data.success) setWishlistItems(data.items || []);
          setLoadingWishlist(false);
        });
      } else if (activeTab === 'support') {
        setLoadingTickets(true);
        api.getMyTickets().then(data => {
          if (data.success) setTickets(data.tickets || []);
          setLoadingTickets(false);
        });
      }
    }
  }, [user, activeTab]);

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
    if (res.success) setSelectedOrderTracking(res.order);
  };

  const handleDownloadInvoice = async (orderId) => {
    const res = await api.getInvoice(orderId);
    if (res.success && res.invoice_html) {
      const win = window.open('', '_blank');
      win.document.write(res.invoice_html);
    } else if (res.success && res.invoice) {
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>Invoice ${res.invoice.invoice_number}</title></head><body style="font-family:sans-serif;padding:30px;"><h2>${res.invoice.store_info.name}</h2><p>Invoice: ${res.invoice.invoice_number} | Order: ${res.invoice.order_number}</p><hr/><p>Total: ₹${res.invoice.pricing.total_amount}</p><button onclick="window.print()">Print</button></body></html>`);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      const res = await api.cancelOrder(orderId);
      if (res.success) {
        api.getMyOrders().then(data => { if (data.success) setOrders(data.orders || []); });
      }
    }
  };

  // Return handlers
  const handleOpenReturn = (order) => {
    setReturnModal({ orderId: order.id, items: order.items || [] });
    setReturnItemId('');
    setReturnReason('');
    setReturnImageUrl('');
  };

  const handleSubmitReturn = async () => {
    if (!returnItemId || !returnReason) return;
    const res = await api.submitReturn(returnModal.orderId, parseInt(returnItemId), returnReason, returnImageUrl || null);
    if (res.success) {
      setReturnModal(null);
      api.getMyOrders().then(data => { if (data.success) setOrders(data.orders || []); });
    }
  };

  // Wishlist handlers
  const handleMoveToCart = async (productId) => {
    const res = await api.moveWishlistToCart(productId);
    if (res.success) {
      addToCart(res.variant_id, 1);
      setWishlistItems(prev => prev.filter(i => i.product_id !== productId));
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    const res = await api.toggleWishlistItem(productId);
    if (res.success) {
      setWishlistItems(prev => prev.filter(i => i.product_id !== productId));
    }
  };

  // Support handlers
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const res = await api.createTicket(newTicket.subject, newTicket.category, newTicket.message, newTicket.order_id || null);
    if (res.success) {
      setShowNewTicket(false);
      setNewTicket({ subject: '', category: 'ORDER', message: '', order_id: '' });
      api.getMyTickets().then(data => { if (data.success) setTickets(data.tickets || []); });
    }
  };

  const handleOpenTicket = async (ticketId) => {
    const res = await api.getTicketDetail(ticketId);
    if (res.success) {
      setSelectedTicket(res.ticket);
      setTicketMessages(res.messages || []);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    const res = await api.sendTicketMessage(selectedTicket.id, replyText);
    if (res.success) {
      setReplyText('');
      handleOpenTicket(selectedTicket.id);
    }
  };

  // Login/Register Screen
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
            <div className="bg-error-container/30 border border-error text-error p-3 rounded-lg text-xs font-body">{authError}</div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white text-gray-700 font-label text-xs font-bold uppercase tracking-wider py-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-outline/20"></div>
            <span className="flex-shrink mx-3 font-label text-[10px] text-on-surface-variant uppercase font-bold">Or with email</span>
            <div className="flex-grow border-t border-outline/20"></div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 font-body text-xs">

            {isRegistering && (
              <div>
                <label className="block font-semibold mb-1 text-on-surface">Full Name</label>
                <input type="text" placeholder="Enter full name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" required />
              </div>
            )}
            <div>
              <label className="block font-semibold mb-1 text-on-surface">Email Address</label>
              <input type="email" placeholder="name@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-on-surface">Password</label>
              <input type="password" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" required />
            </div>
            {isRegistering && (
              <div>
                <label className="block font-semibold mb-1 text-on-surface">Mobile Phone (+91)</label>
                <input type="tel" placeholder="+91 9876543210" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" />
              </div>
            )}
            <button type="submit" className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider py-3.5 rounded-full hover:bg-primary-container transition-colors shadow-md">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          <div className="text-center pt-2 border-t border-outline/10 text-xs font-body">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-gold-leaf font-bold hover:underline">
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
          <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-1">Customer Dashboard</span>
          <h1 className="font-display text-2xl font-bold text-primary">Namaste, {user.name}!</h1>
          <p className="font-body text-xs text-on-surface-variant mt-0.5">{user.email} | Phone: {user.phone || 'Not provided'}</p>
        </div>
        <button onClick={logout} className="border border-outline/30 text-error hover:bg-error-container/20 font-label text-xs font-bold uppercase px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5 w-fit">
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-outline/10 font-label text-xs uppercase font-bold tracking-wider overflow-x-auto gap-6">
        {[
          { id: 'orders', label: 'My Orders', icon: <Package size={16} />, count: orders.length },
          { id: 'wishlist', label: 'Wishlist', icon: <Heart size={16} /> },
          { id: 'addresses', label: 'Address Book', icon: <MapPin size={16} /> },
          { id: 'support', label: 'Support', icon: <HelpCircle size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id ? 'border-gold-leaf text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.icon} {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* ============ ORDERS TAB ============ */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <p className="text-xs font-body text-on-surface-variant text-center py-8">Fetching order history...</p>
          ) : orders.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center border border-outline/20 space-y-3">
              <Package size={32} className="text-gold-leaf mx-auto" />
              <h3 className="font-display text-lg font-bold text-primary">No orders placed yet</h3>
              <button onClick={() => navigate('/shop')} className="bg-primary text-on-primary font-label text-xs uppercase px-6 py-2.5 rounded-full inline-block">Start Shopping</button>
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
                      <span className="bg-gold-leaf/20 text-gold-leaf font-label text-[10px] font-bold uppercase px-2.5 py-1 rounded">{o.status}</span>
                      <span className="font-display text-base font-bold text-primary">₹{o.total_amount}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {o.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-body">
                        <span>{item.product_name} ({item.variant_name}) × {item.quantity}</span>
                        <span className="font-bold">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-outline/10 flex flex-wrap gap-3">
                    <button onClick={() => handleTrackOrder(o.order_number)} className="bg-primary text-on-primary font-label text-xs font-bold uppercase px-4 py-2 rounded-full hover:bg-primary-container transition-colors">
                      Track Order
                    </button>
                    <button onClick={() => handleDownloadInvoice(o.id)} className="border border-outline/30 text-on-surface font-label text-xs font-bold uppercase px-4 py-2 rounded-full hover:bg-surface-container transition-colors inline-flex items-center gap-1">
                      <Download size={14} /> GST Invoice
                    </button>
                    {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status) && (
                      <button onClick={() => handleCancelOrder(o.id)} className="border border-error/30 text-error font-label text-xs font-bold uppercase px-4 py-2 rounded-full hover:bg-error-container/20 transition-colors">
                        Cancel Order
                      </button>
                    )}
                    {o.status === 'DELIVERED' && (
                      <button onClick={() => handleOpenReturn(o)} className="border border-gold-leaf/40 text-gold-leaf font-label text-xs font-bold uppercase px-4 py-2 rounded-full hover:bg-gold-leaf/10 transition-colors inline-flex items-center gap-1">
                        <RefreshCw size={14} /> Request Return
                      </button>
                    )}
                    {['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED', 'REFUND_INITIATED', 'REFUNDED'].includes(o.status) && (
                      <span className="bg-gold-leaf/10 text-gold-leaf font-label text-[10px] font-bold uppercase px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                        <RefreshCw size={12} /> Return: {o.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tracking Timeline Modal */}
          {selectedOrderTracking && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf">
                <button onClick={() => setSelectedOrderTracking(null)} className="absolute top-4 right-4 text-lg font-bold"><X size={20} /></button>
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

          {/* Return Request Modal */}
          {returnModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf">
                <button onClick={() => setReturnModal(null)} className="absolute top-4 right-4"><X size={20} /></button>
                <h3 className="font-display text-lg font-bold text-primary">Request Return</h3>
                <div className="space-y-3 font-body text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Select Item to Return</label>
                    <select value={returnItemId} onChange={e => setReturnItemId(e.target.value)} className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" required>
                      <option value="">Choose item...</option>
                      {returnModal.items.map(item => (
                        <option key={item.id} value={item.id}>{item.product_name} ({item.variant_name}) × {item.quantity} — ₹{item.total_price}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Return Reason</label>
                    <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" required>
                      <option value="">Choose reason...</option>
                      <option value="Damaged/Broken product">Damaged/Broken product</option>
                      <option value="Wrong product received">Wrong product received</option>
                      <option value="Quality not as expected">Quality not as expected</option>
                      <option value="Product expired or near expiry">Product expired or near expiry</option>
                      <option value="Allergic reaction or skin irritation">Allergic reaction or skin irritation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Supporting Image URL (optional)</label>
                    <input type="url" value={returnImageUrl} onChange={e => setReturnImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" />
                  </div>
                  <button onClick={handleSubmitReturn} disabled={!returnItemId || !returnReason} className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:bg-primary-container transition-colors disabled:opacity-50">
                    Submit Return Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ WISHLIST TAB ============ */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {loadingWishlist ? (
            <p className="text-xs font-body text-on-surface-variant text-center py-8">Loading wishlist...</p>
          ) : wishlistItems.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center border border-outline/20 space-y-3">
              <Heart size={32} className="text-gold-leaf mx-auto" />
              <h3 className="font-display text-lg font-bold text-primary">Your wishlist is empty</h3>
              <p className="text-xs font-body text-on-surface-variant">Browse our Ayurvedic formulations and save your favourites</p>
              <button onClick={() => navigate('/shop')} className="bg-primary text-on-primary font-label text-xs uppercase px-6 py-2.5 rounded-full inline-block">Explore Products</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistItems.map(item => (
                <div key={item.product_id} className="bg-surface rounded-xl border border-outline/20 overflow-hidden shadow-sm group">
                  <div className="relative">
                    <img src={item.main_image} alt={item.name} className="w-full h-48 object-cover" onClick={() => navigate(`/product/${item.slug}`)} style={{ cursor: 'pointer' }} />
                    <button onClick={() => handleRemoveFromWishlist(item.product_id)} className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm p-1.5 rounded-full text-error hover:bg-error-container/30 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-[10px] font-label uppercase text-gold-leaf font-bold">{item.category_name}</p>
                    <h4 className="font-display text-sm font-bold text-primary cursor-pointer hover:text-gold-leaf" onClick={() => navigate(`/product/${item.slug}`)}>{item.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-lg font-bold text-primary">₹{item.selling_price}</span>
                      {item.mrp > item.selling_price && <span className="text-xs text-on-surface-variant line-through">₹{item.mrp}</span>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleMoveToCart(item.product_id)} disabled={item.total_stock <= 0} className="flex-1 bg-primary text-on-primary font-label text-[10px] font-bold uppercase py-2 rounded-full hover:bg-primary-container transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1">
                        <ShoppingBag size={12} /> {item.total_stock > 0 ? 'Move to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ ADDRESSES TAB (FR-003) ============ */}
      {activeTab === 'addresses' && (
        <div className="space-y-4 font-body text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary">Saved Delivery Addresses</h3>
            <button
              onClick={() => {
                setAddressForm({ id: null, name: '', phone: '', street_address: '', city: '', state: '', pincode: '', is_default: false });
                setShowAddressModal(true);
              }}
              className="bg-primary text-on-primary font-label text-xs font-bold uppercase px-4 py-2 rounded-full inline-flex items-center gap-1"
            >
              <Plus size={14} /> Add New Address
            </button>
          </div>

          {/* Address Modal */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf">
                <button onClick={() => setShowAddressModal(false)} className="absolute top-4 right-4"><X size={20} /></button>
                <h3 className="font-display text-lg font-bold text-primary">{addressForm.id ? 'Edit Address' : 'Add New Address'}</h3>
                <form onSubmit={handleSaveAddress} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Full Name</label>
                      <input type="text" value={addressForm.name} onChange={e => setAddressForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg outline-none" required />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Phone Number</label>
                      <input type="tel" value={addressForm.phone} onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg outline-none" required />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Street Address</label>
                    <textarea value={addressForm.street_address} onChange={e => setAddressForm(p => ({ ...p, street_address: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg outline-none resize-none" required />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">City</label>
                      <input type="text" value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg outline-none" required />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">State</label>
                      <input type="text" value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg outline-none" required />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Pincode</label>
                      <input type="text" value={addressForm.pincode} onChange={e => setAddressForm(p => ({ ...p, pincode: e.target.value }))} className="w-full px-3 py-2 bg-surface-container border border-outline/30 rounded-lg outline-none" required />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer">
                    <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm(p => ({ ...p, is_default: e.target.checked }))} className="rounded accent-gold-leaf" />
                    <span>Set as default shipping address</span>
                  </label>
                  <button type="submit" className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:bg-primary-container">
                    Save Address
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div key={a.id} className="bg-surface p-5 rounded-xl border border-outline/20 space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">{a.name} ({a.phone})</p>
                    {a.is_default === 1 && (
                      <span className="bg-gold-leaf/20 text-gold-leaf font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded">Default</span>
                    )}
                  </div>
                  <p className="text-on-surface-variant">{a.street_address}, {a.city}, {a.state} - {a.pincode}</p>
                </div>

                <div className="pt-2 border-t border-outline/10 flex items-center justify-between">
                  {a.is_default !== 1 ? (
                    <button onClick={() => handleSetDefaultAddress(a.id)} className="text-[10px] font-label font-bold text-gold-leaf hover:underline uppercase">
                      Set Default
                    </button>
                  ) : (
                    <span></span>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleEditAddress(a)} className="p-1.5 text-primary hover:bg-primary/10 rounded">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteAddress(a.id)} className="p-1.5 text-error hover:bg-error-container/20 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {addresses.length === 0 && (
            <div className="bg-surface rounded-2xl p-12 text-center border border-outline/20 space-y-3">
              <MapPin size={32} className="text-gold-leaf mx-auto" />
              <h3 className="font-display text-lg font-bold text-primary">No saved addresses</h3>
              <p className="text-xs text-on-surface-variant">Add a delivery address for faster checkout</p>
              <button
                onClick={() => {
                  setAddressForm({ id: null, name: '', phone: '', street_address: '', city: '', state: '', pincode: '', is_default: true });
                  setShowAddressModal(true);
                }}
                className="bg-primary text-on-primary font-label text-xs uppercase px-6 py-2.5 rounded-full inline-block"
              >
                Add Address
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============ SUPPORT TAB ============ */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary">Support Tickets</h3>
            <button onClick={() => setShowNewTicket(true)} className="bg-primary text-on-primary font-label text-xs font-bold uppercase px-4 py-2 rounded-full inline-flex items-center gap-1">
              <MessageSquare size={14} /> New Ticket
            </button>
          </div>

          {/* New Ticket Modal */}
          {showNewTicket && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf">
                <button onClick={() => setShowNewTicket(false)} className="absolute top-4 right-4"><X size={20} /></button>
                <h3 className="font-display text-lg font-bold text-primary">Create Support Ticket</h3>
                <form onSubmit={handleCreateTicket} className="space-y-3 font-body text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Category</label>
                    <select value={newTicket.category} onChange={e => setNewTicket(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf">
                      <option value="ORDER">Order Issue</option>
                      <option value="PRODUCT">Product Query</option>
                      <option value="PAYMENT">Payment Issue</option>
                      <option value="DELIVERY">Delivery Issue</option>
                      <option value="RETURN">Return/Refund</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Related Order Number (optional)</label>
                    <input type="text" value={newTicket.order_id} onChange={e => setNewTicket(p => ({ ...p, order_id: e.target.value }))} placeholder="e.g. ORD-20260819-1234" className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Subject</label>
                    <input type="text" value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))} placeholder="Brief summary of your issue" className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf" required />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Message</label>
                    <textarea value={newTicket.message} onChange={e => setNewTicket(p => ({ ...p, message: e.target.value }))} rows={4} placeholder="Describe your issue in detail..." className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf resize-none" required />
                  </div>
                  <button type="submit" className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase py-3 rounded-full hover:bg-primary-container transition-colors">Submit Ticket</button>
                </form>
              </div>
            </div>
          )}

          {/* Ticket Detail Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-gold-leaf max-h-[80vh] overflow-hidden flex flex-col">
                <button onClick={() => { setSelectedTicket(null); setTicketMessages([]); }} className="absolute top-4 right-4"><X size={20} /></button>
                <div>
                  <span className="font-label text-[10px] uppercase text-gold-leaf font-bold">{selectedTicket.ticket_code} · {selectedTicket.status}</span>
                  <h3 className="font-display text-lg font-bold text-primary">{selectedTicket.subject}</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 py-2">
                  {ticketMessages.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-xl text-xs font-body ${msg.sender_type === 'CUSTOMER' ? 'bg-surface-container-low ml-4' : 'bg-primary/10 mr-4 border border-primary/20'}`}>
                      <span className="font-bold text-[10px] text-on-surface-variant block mb-1">{msg.sender_name} · {new Date(msg.created_at).toLocaleString()}</span>
                      <p className="text-on-surface">{msg.message}</p>
                    </div>
                  ))}
                </div>
                {!['RESOLVED', 'CLOSED'].includes(selectedTicket.status) && (
                  <div className="flex gap-2 pt-2 border-t border-outline/10">
                    <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." className="flex-1 px-3 py-2 bg-surface-container border border-outline/30 rounded-lg text-xs outline-none focus:border-gold-leaf" onKeyDown={e => e.key === 'Enter' && handleSendReply()} />
                    <button onClick={handleSendReply} className="bg-primary text-on-primary p-2 rounded-full"><Send size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tickets List */}
          {loadingTickets ? (
            <p className="text-xs font-body text-on-surface-variant text-center py-8">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center border border-outline/20 space-y-3">
              <HelpCircle size={32} className="text-gold-leaf mx-auto" />
              <h3 className="font-display text-lg font-bold text-primary">No support tickets</h3>
              <p className="text-xs font-body text-on-surface-variant">Need help? Create a support ticket and our team will assist you.</p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10">
              {tickets.map(ticket => (
                <div key={ticket.id} className="p-4 flex items-center justify-between gap-4 text-xs font-body cursor-pointer hover:bg-surface-container/50 transition-colors" onClick={() => handleOpenTicket(ticket.id)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-label text-[10px] font-bold text-gold-leaf">{ticket.ticket_code}</span>
                      <span className={`font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        ticket.status === 'OPEN' ? 'bg-primary/10 text-primary' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-gold-leaf/20 text-gold-leaf' :
                        ticket.status === 'RESOLVED' ? 'bg-tertiary/20 text-tertiary' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>{ticket.status}</span>
                    </div>
                    <p className="font-bold text-on-surface truncate">{ticket.subject}</p>
                    <span className="text-[10px] text-on-surface-variant">{ticket.category} · {new Date(ticket.updated_at).toLocaleDateString()}</span>
                  </div>
                  <ChevronDown size={16} className="text-on-surface-variant shrink-0 -rotate-90" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
