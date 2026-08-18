import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export const CartPage = () => {
  const {
    cartSummary,
    updateQuantity,
    removeFromCart,
    clearCart,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();
  const [inputCoupon, setInputCoupon] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon.trim());
      setInputCoupon('');
    }
  };

  const freeShippingThreshold = 499;
  const amountNeeded = Math.max(0, freeShippingThreshold - cartSummary.subtotal);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-outline/10 pb-4 flex items-center justify-between">
        <div>
          <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-1">
            Shopping Cart
          </span>
          <h1 className="font-display text-3xl font-bold text-primary">Your Ayurvedic Cart</h1>
        </div>
        <Link to="/shop" className="text-xs font-label uppercase text-primary hover:text-gold-leaf font-bold flex items-center gap-1">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>
      </div>

      {cartSummary.items.length === 0 ? (
        <div className="bg-surface rounded-2xl p-16 text-center border border-outline/20 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary mx-auto flex items-center justify-center">
            <ShoppingBag size={32} />
          </div>
          <h2 className="font-display text-xl font-bold text-primary">Your cart is currently empty</h2>
          <p className="font-body text-xs text-on-surface-variant">
            Browse our classical herbal hair oils, Shilajit resin, and vitality formulations.
          </p>
          <Link
            to="/shop"
            className="bg-primary text-on-primary font-label text-xs uppercase tracking-wider font-bold px-8 py-3.5 rounded-full inline-block hover:bg-primary-container transition-colors shadow-md"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Item List Column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Free Shipping Alert Banner */}
            <div className="bg-primary-container/20 p-4 rounded-xl border border-gold-leaf/30 text-xs font-body flex items-center justify-between">
              <div>
                {amountNeeded > 0 ? (
                  <p className="text-on-surface">
                    Add <span className="font-bold text-primary">₹{amountNeeded}</span> more for <span className="font-bold text-gold-leaf">Free Shipping</span>!
                  </p>
                ) : (
                  <p className="text-primary font-bold">🎉 You qualify for Free All-India Express Delivery!</p>
                )}
              </div>
              <span className="font-label text-[10px] uppercase font-bold text-gold-leaf">Express Shipping</span>
            </div>

            {/* Cart Table */}
            <div className="bg-surface rounded-2xl border border-outline/20 overflow-hidden divide-y divide-outline/10">
              {cartSummary.items.map((item) => (
                <div key={item.variant_id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.main_image}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded-lg border border-outline/20 shrink-0"
                    />
                    <div>
                      <Link to={`/product/${item.product_slug}`} className="font-display text-base font-bold text-on-surface hover:text-primary transition-colors block">
                        {item.product_name}
                      </Link>
                      <span className="text-xs text-on-surface-variant block mb-1">
                        {item.attribute_name}: {item.attribute_value} (SKU: {item.sku})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-label text-sm font-bold text-primary">₹{item.unit_price}</span>
                        {item.mrp > item.unit_price && (
                          <span className="text-xs text-on-surface-variant line-through">₹{item.mrp}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline/10">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-outline/30 rounded-lg bg-surface px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="p-1 text-on-surface-variant hover:text-primary"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-xs font-label font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="p-1 text-on-surface-variant hover:text-primary"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="font-label text-sm font-bold text-primary min-w-[70px] text-right">
                      ₹{item.total_price}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.variant_id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={clearCart}
                className="text-xs font-label uppercase text-error hover:underline"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart Summary & Order Breakdown */}
          <div className="space-y-6">
            <div className="bg-surface rounded-2xl border border-outline/20 p-6 space-y-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-primary border-b border-outline/10 pb-3">
                Order Summary
              </h3>

              {/* Coupon Form */}
              {cartSummary.applied_coupon ? (
                <div className="bg-gold-leaf/10 border border-gold-leaf/30 p-3 rounded-xl flex items-center justify-between text-xs font-body">
                  <div className="flex items-center gap-2 text-gold-leaf font-bold">
                    <Tag size={16} />
                    <span>Code '{cartSummary.applied_coupon.code}' applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-error font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. AYURVEDA20)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 px-3 py-2 bg-surface-container border border-outline/30 rounded-lg text-xs outline-none focus:border-gold-leaf uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-secondary text-on-secondary font-label text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-primary transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Details */}
              <div className="space-y-3 text-xs font-body border-t border-outline/10 pt-4">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-bold text-on-surface">₹{cartSummary.subtotal}</span>
                </div>
                {cartSummary.discount_amount > 0 && (
                  <div className="flex justify-between text-gold-leaf font-bold">
                    <span>Coupon Savings</span>
                    <span>-₹{cartSummary.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>GST Tax (12% Ayurvedic Tax)</span>
                  <span>₹{cartSummary.tax_amount}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated Shipping</span>
                  <span className="font-bold">{cartSummary.shipping_fee === 0 ? 'FREE' : `₹${cartSummary.shipping_fee}`}</span>
                </div>

                <div className="flex justify-between font-display text-xl font-bold text-primary pt-3 border-t border-outline/20">
                  <span>Total Payable</span>
                  <span>₹{cartSummary.total_amount}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider py-4 rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-on-surface-variant text-center font-body pt-2">
                <ShieldCheck size={14} className="text-gold-leaf" />
                <span>256-Bit SSL Encrypted & Razorpay Verified Payment</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
