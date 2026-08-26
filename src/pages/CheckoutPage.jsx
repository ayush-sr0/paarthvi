import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { ShieldCheck, Truck, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Download, RefreshCw, FileText } from 'lucide-react';

export const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartSummary, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Customer Contact State
  const [contact, setContact] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone || '' : '',
  });

  // Shipping Address State
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // RAZORPAY or COD

  // Placed Order State
  const [placedOrder, setPlacedOrder] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  // Pincode validation effect
  useEffect(() => {
    if (address.pincode.length === 6) {
      api.checkPincode(address.pincode).then(data => {
        if (data.success) {
          setPincodeStatus(data);
        }
      });
    } else {
      setPincodeStatus(null);
    }
  }, [address.pincode]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    const checkoutPayload = {
      items: cartSummary.items,
      shipping_address: {
        name: contact.name,
        phone: contact.phone,
        ...address,
      },
      payment_method: paymentMethod,
      coupon_code: cartSummary.applied_coupon?.code || null,
      guest_email: contact.email,
      guest_name: contact.name,
      guest_phone: contact.phone,
    };

    try {
      const res = await api.initiateCheckout(checkoutPayload);
      if (!res.success) {
        setError(res.error || 'Failed to place order');
        setLoading(false);
        return;
      }

      if (paymentMethod === 'RAZORPAY') {
        // Trigger Razorpay Sandbox modal
        const options = {
          key: res.key_id || 'rzp_test_ParthviAyurveda2026',
          amount: Math.round(res.amount * 100),
          currency: 'INR',
          name: 'Parthvi Ayurveda',
          description: `Payment for Order ${res.order_number}`,
          image: '/products/chyawanprash.jpg',

          order_id: res.razorpay_order_id,
          handler: async function (response) {
            // Verify payment
            const verifyRes = await api.verifyPayment({
              order_id: res.order_id,
              razorpay_order_id: response.razorpay_order_id || res.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_mock_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'mock_signature',
            });

            if (verifyRes.success) {
              setPlacedOrder({
                order_id: res.order_id,
                order_number: res.order_number,
                invoice_number: verifyRes.invoice_number,
                amount: res.amount,
                payment_method: 'RAZORPAY',
                status: 'CONFIRMED',
              });

              // Fetch GST invoice
              const invRes = await api.getInvoice(res.order_id);
              if (invRes.success) setInvoiceData(invRes.invoice);

              clearCart();
              setStep(7);
            } else {
              setError(verifyRes.error || 'Payment verification failed');
            }
            setLoading(false);
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setError('Payment window closed before completion');
            },
          },
          prefill: {
            name: contact.name,
            email: contact.email,
            contact: contact.phone,
          },
          theme: { color: '#16351d' },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Fallback simulation for sandbox if script blocked
          setTimeout(async () => {
            const verifyRes = await api.verifyPayment({
              order_id: res.order_id,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: `pay_simulated_${Date.now()}`,
              razorpay_signature: 'simulated_signature',
            });
            if (verifyRes.success) {
              setPlacedOrder({
                order_id: res.order_id,
                order_number: res.order_number,
                invoice_number: verifyRes.invoice_number,
                amount: res.amount,
                payment_method: 'RAZORPAY',
                status: 'CONFIRMED',
              });

              const invRes = await api.getInvoice(res.order_id);
              if (invRes.success) setInvoiceData(invRes.invoice);

              clearCart();
              setStep(7);
            }
            setLoading(false);
          }, 1500);
        }
      } else {
        // COD Order placed
        setPlacedOrder({
          order_id: res.order_id,
          order_number: res.order_number,
          invoice_number: `INV-${res.order_id}`,
          amount: res.amount,
          payment_method: 'COD',
          status: 'CONFIRMED',
        });

        const invRes = await api.getInvoice(res.order_id);
        if (invRes.success) setInvoiceData(invRes.invoice);

        clearCart();
        setStep(7);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during checkout');
      setLoading(false);
    }
  };

  if (step === 7 && placedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-8 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-primary-container/20 text-primary mx-auto flex items-center justify-center border-2 border-gold-leaf shadow-lg">
          <CheckCircle size={48} />
        </div>

        <div>
          <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-1">
            Order Placed Successfully
          </span>
          <h1 className="font-display text-3xl font-bold text-primary mb-2">
            Thank You for Your Order!
          </h1>
          <p className="font-body text-xs text-on-surface-variant max-w-md mx-auto">
            Your order <span className="font-bold text-primary">{placedOrder.order_number}</span> has been confirmed and sent to our herbal processing unit in Greater Noida.
          </p>

        </div>

        {/* GST Invoice Details Card */}
        {invoiceData && (
          <div className="bg-surface rounded-2xl border border-gold-leaf/30 p-6 md:p-8 text-left space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline/10 pb-4 gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-primary">{invoiceData.store_info.name}</h3>
                <p className="text-[11px] text-on-surface-variant font-body">{invoiceData.store_info.address}</p>
                <p className="text-[11px] text-gold-leaf font-body">GSTIN: {invoiceData.store_info.gstin} | FSSAI: {invoiceData.store_info.fssai_lic}</p>
              </div>
              <div className="sm:text-right">
                <span className="font-label text-xs font-bold text-primary block">Invoice: {invoiceData.invoice_number}</span>
                <span className="text-[11px] text-on-surface-variant block">Date: {new Date(invoiceData.invoice_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Item Breakdown */}
            <div className="divide-y divide-outline/10 text-xs font-body">
              {invoiceData.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-on-surface">{item.description}</p>
                    <span className="text-[10px] text-on-surface-variant">HSN: {item.hsn_sac} | Qty: {item.quantity}</span>
                  </div>
                  <span className="font-label font-bold text-primary">₹{item.total_price}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline/20 pt-3 text-xs font-body space-y-1 text-right">
              <p>Subtotal: ₹{invoiceData.pricing.subtotal}</p>
              <p>CGST (6%) + SGST (6%): ₹{invoiceData.pricing.tax_amount}</p>
              <p className="font-display text-base font-bold text-primary">Total Amount: ₹{invoiceData.pricing.total_amount}</p>
            </div>

            <button
              onClick={() => window.print()}
              className="border border-primary text-primary hover:bg-primary hover:text-on-primary font-label text-xs font-bold uppercase px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 mx-auto"
            >
              <Download size={14} /> Download / Print Official GST Invoice
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/account?tab=orders`}
            className="bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-primary-container transition-colors shadow-md"
          >
            Track Order Status
          </Link>
          <Link
            to="/shop"
            className="border border-outline/30 text-on-surface font-label text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-surface-container transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      
      {/* Checkout Title */}
      <div className="border-b border-outline/10 pb-4 flex items-center justify-between">
        <div>
          <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-1">
            Express Checkout
          </span>
          <h1 className="font-display text-3xl font-bold text-primary">Complete Your Order</h1>
        </div>
        <Link to="/cart" className="text-xs font-label uppercase text-primary hover:text-gold-leaf font-bold flex items-center gap-1">
          <ArrowLeft size={14} /> Return to Cart
        </Link>
      </div>

      {error && (
        <div className="bg-error-container/40 border border-error text-error p-4 rounded-xl text-xs font-body">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Checkout Form Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Contact Details */}
          <div className="bg-surface rounded-2xl border border-outline/20 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-leaf text-primary text-xs font-bold flex items-center justify-center">1</span>
              Customer Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                  required
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-on-surface-variant font-semibold mb-1">Mobile Phone (+91) *</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="bg-surface rounded-2xl border border-outline/20 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-leaf text-primary text-xs font-bold flex items-center justify-center">2</span>
              Delivery Address (India)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              <div className="sm:col-span-2">
                <label className="block text-on-surface-variant font-semibold mb-1">Flat / House / Street Address *</label>
                <input
                  type="text"
                  placeholder="e.g. 42 Vrindavan Gardens, Near Temple"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                  required
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">City / Town *</label>
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                  required
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">State *</label>
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-on-surface-variant font-semibold mb-1">Pincode (6 Digits) *</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 281001"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface-container border border-outline/30 rounded-lg outline-none focus:border-gold-leaf"
                  required
                />
                {pincodeStatus && (
                  <p className={`text-[11px] mt-1 ${pincodeStatus.serviceable ? 'text-primary font-bold' : 'text-error'}`}>
                    {pincodeStatus.serviceable
                      ? `✓ Serviceable via Express Courier (${pincodeStatus.estimated_days} Days delivery)`
                      : '❌ Pincode currently unavailable'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method Selection */}
          <div className="bg-surface rounded-2xl border border-outline/20 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-leaf text-primary text-xs font-bold flex items-center justify-center">3</span>
              Select Payment Method
            </h3>

            <div className="space-y-3 font-body text-xs">
              <label
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'RAZORPAY' ? 'border-gold-leaf bg-gold-leaf/10' : 'border-outline/20 hover:border-gold-leaf'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="text-primary" size={20} />
                  <div>
                    <span className="font-bold text-on-surface block">Razorpay Payment Gateway</span>
                    <span className="text-on-surface-variant text-[11px]">UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'RAZORPAY' ? 'border-gold-leaf bg-gold-leaf' : 'border-outline/40'}`}>
                  {paymentMethod === 'RAZORPAY' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'COD' ? 'border-gold-leaf bg-gold-leaf/10' : 'border-outline/20 hover:border-gold-leaf'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Truck className="text-primary" size={20} />
                  <div>
                    <span className="font-bold text-on-surface block">Cash on Delivery (COD)</span>
                    <span className="text-on-surface-variant text-[11px]">Pay cash upon package delivery</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-gold-leaf bg-gold-leaf' : 'border-outline/40'}`}>
                  {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !contact.name || !contact.email || !address.street || !address.pincode}
            className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider py-4 rounded-full hover:bg-primary-container transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Initiating Order Transaction...</span>
            ) : (
              <>
                <span>Pay & Confirm Order (₹{cartSummary.total_amount})</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

        </div>

        {/* Order Summary Sidebar Column */}
        <div>
          <div className="bg-surface rounded-2xl border border-outline/20 p-6 space-y-4 shadow-sm sticky top-24">
            <h3 className="font-display text-lg font-bold text-primary border-b border-outline/10 pb-3">
              Order Summary ({cartSummary.items.length} items)
            </h3>

            <div className="divide-y divide-outline/10 max-h-60 overflow-y-auto pr-1">
              {cartSummary.items.map((item) => (
                <div key={item.variant_id} className="py-2.5 flex items-center justify-between text-xs font-body">
                  <div className="flex items-center gap-2">
                    <img src={item.main_image} alt="" className="w-10 h-10 object-cover rounded border border-outline/20" />
                    <div>
                      <p className="font-bold text-on-surface line-clamp-1">{item.product_name}</p>
                      <span className="text-[10px] text-on-surface-variant">{item.attribute_value} × {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-label font-bold text-primary">₹{item.total_price}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs font-body border-t border-outline/10 pt-3">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>₹{cartSummary.subtotal}</span>
              </div>
              {cartSummary.discount_amount > 0 && (
                <div className="flex justify-between text-gold-leaf font-bold">
                  <span>Discount</span>
                  <span>-₹{cartSummary.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>GST Tax (12%)</span>
                <span>₹{cartSummary.tax_amount}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping Fee</span>
                <span>{cartSummary.shipping_fee === 0 ? 'FREE' : `₹${cartSummary.shipping_fee}`}</span>
              </div>
              <div className="flex justify-between font-display text-lg font-bold text-primary pt-2 border-t border-outline/20">
                <span>Total Amount</span>
                <span>₹{cartSummary.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
