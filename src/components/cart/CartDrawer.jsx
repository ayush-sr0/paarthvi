import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartSummary,
    updateQuantity,
    removeFromCart,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();
  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = 499;
  const progressPercent = Math.min(100, (cartSummary.subtotal / freeShippingThreshold) * 100);
  const amountNeeded = Math.max(0, freeShippingThreshold - cartSummary.subtotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon.trim());
      setInputCoupon('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface text-on-surface shadow-2xl flex flex-col border-l border-gold-leaf/30 animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-outline/20 flex items-center justify-between bg-sacred-palace">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-primary" size={22} />
              <h2 className="font-display text-lg font-bold text-primary">Your Ayurvedic Cart</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-on-surface-variant hover:text-primary transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-primary-container/20 px-6 py-3 border-b border-outline/10 text-xs font-body">
            {amountNeeded > 0 ? (
              <p className="text-on-surface mb-1.5">
                Add <span className="font-bold text-primary">₹{amountNeeded}</span> more for <span className="font-bold text-gold-leaf">Free Shipping</span>!
              </p>
            ) : (
              <p className="text-primary font-bold mb-1.5 flex items-center gap-1">
                🎉 Congratulations! You have unlocked Free Shipping.
              </p>
            )}
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-leaf transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartSummary.items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary mx-auto flex items-center justify-center">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-display text-lg font-bold text-on-surface">Your cart is empty</h3>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  Explore our authentic Ayurvedic hair oils, Shilajit resin, and vitality supplements.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="bg-primary text-on-primary font-label text-xs uppercase tracking-wider font-bold px-6 py-2.5 rounded-full hover:bg-primary-container transition-colors"
                >
                  Browse Shop
                </button>
              </div>
            ) : (
              cartSummary.items.map((item) => (
                <div
                  key={item.variant_id}
                  className="p-3 bg-surface-container-low rounded-lg border border-outline/10 flex gap-3 items-center glow-hover"
                >
                  <img
                    src={item.main_image}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-md shrink-0 border border-outline/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-bold text-on-surface truncate">{item.product_name}</h4>
                    <span className="text-xs text-on-surface-variant block mb-1">
                      {item.attribute_name}: {item.attribute_value}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-label text-xs font-bold text-primary">₹{item.unit_price}</span>
                      {Number(item.mrp) > Number(item.unit_price) && (
                        <span className="text-[11px] text-on-surface-variant line-through">₹{item.mrp}</span>
                      )}
                    </div>

                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-outline/30 rounded-md bg-surface">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="p-1 text-on-surface-variant hover:text-primary"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-2 text-xs font-label font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="p-1 text-on-surface-variant hover:text-primary"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.variant_id)}
                      className="text-error text-xs hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {cartSummary.items.length > 0 && (
            <div className="p-4 sm:p-6 bg-sacred-palace border-t border-outline/20 space-y-4">
              
              {/* Coupon Form */}
              {cartSummary.applied_coupon ? (
                <div className="flex items-center justify-between bg-gold-leaf/10 border border-gold-leaf/40 px-3 py-2 rounded-lg text-xs font-body">
                  <div className="flex items-center gap-2 text-gold-leaf font-bold">
                    <Tag size={14} />
                    <span>Coupon '{cartSummary.applied_coupon.code}' applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-error font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. AYURVEDA20)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 px-3 py-2 bg-surface border border-outline/30 rounded-md text-xs outline-none focus:border-gold-leaf uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-secondary text-on-secondary font-label text-xs font-bold uppercase px-4 py-2 rounded-md hover:bg-primary transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs font-body border-t border-outline/10 pt-3">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>₹{cartSummary.subtotal}</span>
                </div>
                {cartSummary.discount_amount > 0 && (
                  <div className="flex justify-between text-gold-leaf font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{cartSummary.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated Tax (12% GST)</span>
                  <span>₹{cartSummary.tax_amount}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping Fee</span>
                  <span>{cartSummary.shipping_fee === 0 ? 'FREE' : `₹${cartSummary.shipping_fee}`}</span>
                </div>
                <div className="flex justify-between font-display text-base font-bold text-primary pt-2 border-t border-outline/20">
                  <span>Total Amount</span>
                  <span>₹{cartSummary.total_amount}</span>
                </div>
              </div>

              {/* Checkout Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full border border-primary text-primary font-label text-xs font-bold uppercase tracking-wider py-3 rounded-full hover:bg-primary/5 transition-colors"
                >
                  View Full Cart
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider py-3 rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-1 shadow-md"
                >
                  Checkout <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
