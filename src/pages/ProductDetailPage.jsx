import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { Star, Heart, ShoppingBag, ShieldCheck, CheckCircle, Truck, RefreshCw, AlertCircle, Share2 } from 'lucide-react';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    setLoading(true);
    api.getProductBySlug(slug).then(data => {
      if (data.success && data.product) {
        setProduct(data.product);
        const defaultVar = data.product.variants && data.product.variants[0] ? data.product.variants[0] : null;
        setSelectedVariant(defaultVar);
        const mainImg = data.product.images && data.product.images[0] ? data.product.images[0].image_url : '';
        setSelectedImage(mainImg);
      }
      setLoading(false);
    });

    api.trackEvent('PRODUCT_VIEW', `/product/${slug}`, { slug });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 text-center font-body text-on-surface-variant">
        Loading formulation details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold text-primary">Formulation Not Found</h2>
        <Link to="/shop" className="bg-primary text-on-primary font-label text-xs uppercase px-6 py-3 rounded-full inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.selling_price : product.selling_price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentStock = selectedVariant ? selectedVariant.available_stock : 50;

  const handleBuyNow = () => {
    if (selectedVariant) {
      addToCart(selectedVariant.id, quantity);
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-12">
      
      {/* Breadcrumb */}
      <nav className="text-xs font-label uppercase text-on-surface-variant flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category_slug}`} className="hover:text-primary">{product.category_name}</Link>
        <span>/</span>
        <span className="text-primary font-bold">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Gallery */}
        <div className="space-y-4">
          <div className="h-[450px] w-full rounded-2xl overflow-hidden bg-surface-container-low border border-gold-leaf/30 shadow-sm relative">
            <img
              src={selectedImage || product.images?.[0]?.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {currentMrp > currentPrice && (
              <span className="absolute top-4 left-4 bg-primary text-on-primary font-label text-xs font-bold uppercase px-3 py-1 rounded shadow-md">
                {Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img.image_url ? 'border-gold-leaf scale-95' : 'border-outline/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info & Actions */}
        <div className="space-y-6">
          <div>
            <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-1">
              {product.category_name}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
              {product.name}
            </h1>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
              {product.short_desc}
            </p>

            {/* Ratings & Reviews Count */}
            <div className="flex items-center gap-3 text-xs font-body border-y border-outline/10 py-3">
              <div className="flex items-center gap-1 text-gold-leaf">
                <Star size={16} fill="currentColor" />
                <span className="font-bold text-on-surface">{product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-on-surface-variant">|</span>
              <span className="text-on-surface-variant">{product.total_reviews} Customer Reviews</span>
              <span className="text-on-surface-variant">|</span>
              <span className="text-primary font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> 100% Authentic Formulation
              </span>
            </div>
          </div>

          {/* Price Block */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary">₹{currentPrice}</span>
            {currentMrp > currentPrice && (
              <span className="font-body text-base text-on-surface-variant line-through">₹{currentMrp}</span>
            )}
            <span className="text-xs font-label uppercase text-gold-leaf font-bold">Inclusive of all taxes</span>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface block mb-2">
                Select {product.variants[0].attribute_name}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg text-xs font-label uppercase font-bold border transition-colors ${
                      selectedVariant?.id === v.id
                        ? 'border-gold-leaf bg-gold-leaf/10 text-primary'
                        : 'border-outline/30 bg-surface text-on-surface-variant hover:border-gold-leaf'
                    }`}
                  >
                    {v.attribute_value} - ₹{v.selling_price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Counter & Stock Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-outline/30 rounded-lg bg-surface px-3 py-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-on-surface-variant hover:text-primary px-2 font-bold"
              >
                -
              </button>
              <span className="px-3 font-label text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(currentStock || 10, quantity + 1))}
                className="text-on-surface-variant hover:text-primary px-2 font-bold"
              >
                +
              </button>
            </div>

            <span className={`text-xs font-label font-bold uppercase ${currentStock > 0 ? 'text-primary' : 'text-error'}`}>
              {currentStock > 0 ? `In Stock (${currentStock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => selectedVariant && addToCart(selectedVariant.id, quantity)}
              disabled={currentStock <= 0}
              className="bg-primary text-on-primary font-label text-xs uppercase tracking-wider font-bold py-4 rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={currentStock <= 0}
              className="border-2 border-gold-leaf text-primary font-label text-xs uppercase tracking-wider font-bold py-4 rounded-full hover:bg-gold-leaf hover:text-primary transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Fast Delivery & Return Badges */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline/10 grid grid-cols-2 gap-3 text-xs font-body">
            <div className="flex items-center gap-2">
              <Truck className="text-gold-leaf" size={18} />
              <span>Ships in 24 Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="text-gold-leaf" size={18} />
              <span>7 Days Returnable</span>
            </div>
          </div>

        </div>
      </div>

      {/* Detailed Tabbed Sections */}
      <section className="bg-surface rounded-2xl border border-outline/20 p-6 md:p-10 space-y-6">
        
        {/* Tab Headers */}
        <div className="flex flex-wrap gap-4 border-b border-outline/10 pb-3 font-label text-xs uppercase font-bold tracking-wider">
          {['description', 'ingredients', 'benefits', 'usage', 'warnings', 'manufacturer'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-gold-leaf text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="text-sm font-body leading-relaxed text-on-surface-variant">
          {activeTab === 'description' && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-primary">About {product.name}</h3>
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-primary">Botanical Ingredients</h3>
              <p className="font-semibold text-on-surface">Key Botanicals: {product.key_ingredients}</p>
              <p>Full Composition: {product.ingredients}</p>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-primary">Ayurvedic Wellness Benefits</h3>
              <p>{product.benefits}</p>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-primary">Directions for Use</h3>
              <p>{product.usage_directions}</p>
            </div>
          )}

          {activeTab === 'warnings' && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-primary">Precautions & Storage</h3>
              <p className="text-error font-semibold">Precautions: {product.warnings}</p>
              <p>Storage: {product.storage_info}</p>
            </div>
          )}

          {activeTab === 'manufacturer' && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-primary">Regulatory & Manufacturer Info</h3>
              <p>Net Quantity: {product.net_qty}</p>
              <p>Manufacturer: {product.manufacturer_info}</p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-surface rounded-2xl border border-outline/20 p-6 md:p-10 space-y-6">
        <h3 className="font-display text-2xl font-bold text-primary">Customer Reviews</h3>
        
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-sacred-palace rounded-xl border border-outline/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-on-surface">{rev.user_name}</span>
                    {rev.verified_purchase === 1 && (
                      <span className="bg-primary/10 text-primary font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle size={10} /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex text-gold-leaf text-xs">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="font-body text-xs text-on-surface-variant">{rev.review_text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant font-body">No reviews submitted yet for this formulation.</p>
        )}
      </section>

    </div>
  );
};
