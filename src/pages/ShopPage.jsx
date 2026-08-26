import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { Filter, SlidersHorizontal, Star, Heart, ArrowUpDown, X, Check } from 'lucide-react';

export const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, toggleWishlist, wishlist } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State
  const selectedCategory = searchParams.get('category') || '';
  const selectedSort = searchParams.get('sort') || 'popular';
  const searchQuery = searchParams.get('search') || '';
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '0');
  const [priceRange, setPriceRange] = useState(searchParams.get('max_price') || '3000');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');

  useEffect(() => {
    api.getCategories().then(data => {
      if (data.success) setCategories(data.categories || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSort) params.sort = selectedSort;
    if (searchQuery) params.search = searchQuery;
    if (minPrice) params.min_price = minPrice;
    if (priceRange) params.max_price = priceRange;
    if (minRating) params.rating = minRating;

    api.getProducts(params).then(data => {
      if (data.success) {
        let items = data.products || [];
        if (inStockOnly) {
          items = items.filter(p => (p.total_stock || 50) > 0);
        }
        setProducts(items);
      }
      setLoading(false);
    });

    api.trackEvent('PAGE_VIEW', '/shop', { category: selectedCategory, search: searchQuery });
  }, [selectedCategory, selectedSort, searchQuery, minPrice, priceRange, minRating, inStockOnly]);

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) newParams.set('category', slug);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const handleSortChange = (sortVal) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortVal);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setMinPrice('0');
    setPriceRange('3000');
    setMinRating('');
    setInStockOnly(false);
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <SEO
        title="Ayurvedic Formulations Catalogue — Parthvi Ayurveda"
        description="Browse authentic Ayurvedic herbal remedies, Kshirpak oils, Himalayan Shilajit, and organic wellness supplements."
      />
      
      {/* Header & Title */}
      <div className="mb-8 border-b border-outline/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-1">
            Catalogue
          </span>
          <h1 className="font-display text-3xl font-bold text-primary">
            {selectedCategory
              ? categories.find(c => c.slug === selectedCategory)?.name || 'Ayurvedic Formulations'
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : 'All Ayurvedic Products'}
          </h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Showing {products.length} formulation{products.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden border border-outline/30 bg-surface px-4 py-2 rounded-lg text-xs font-label uppercase font-bold flex items-center gap-2 text-on-surface"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          <div className="flex items-center gap-2 bg-surface border border-outline/30 px-3 py-1.5 rounded-lg text-xs font-label uppercase">
            <ArrowUpDown size={14} className="text-on-surface-variant" />
            <span className="text-on-surface-variant hidden sm:inline">Sort By:</span>
            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-transparent font-bold text-primary outline-none cursor-pointer"
            >
              <option value="popular">Popular</option>
              <option value="bestseller">Best Selling</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6 bg-surface p-6 rounded-xl border border-outline/20 h-fit">
          <div className="flex items-center justify-between border-b border-outline/10 pb-4">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Filter size={18} /> Filters
            </h3>
            {(selectedCategory || searchQuery || minRating || priceRange !== '3000') && (
              <button onClick={clearFilters} className="text-xs font-label text-gold-leaf hover:underline">
                Clear All
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">
              Categories
            </h4>
            <div className="space-y-2 text-xs font-body">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left py-1.5 px-2 rounded transition-colors ${
                  !selectedCategory ? 'bg-primary-container/20 font-bold text-primary' : 'hover:bg-surface-container'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategorySelect(c.slug)}
                  className={`w-full text-left py-1.5 px-2 rounded transition-colors ${
                    selectedCategory === c.slug ? 'bg-primary-container/20 font-bold text-primary' : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="border-t border-outline/10 pt-4">
            <div className="flex justify-between items-center mb-2 text-xs font-label uppercase">
              <span className="text-on-surface-variant font-bold">Max Price</span>
              <span className="text-primary font-bold">₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full accent-gold-leaf cursor-pointer"
            />
          </div>

          {/* Minimum Rating */}
          <div className="border-t border-outline/10 pt-4">
            <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">
              Minimum Rating
            </h4>
            <div className="space-y-2 text-xs font-body">
              {['4', '3', '2'].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? '' : r)}
                  className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-2 transition-colors ${
                    minRating === r ? 'bg-primary-container/20 font-bold text-primary' : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <div className="flex text-gold-leaf">
                    {[...Array(parseInt(r))].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span>& Up</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="text-center py-20 text-on-surface-variant font-body">
              Loading authentic formulations...
            </div>
          ) : products.length === 0 ? (
            <div className="bg-surface rounded-xl p-12 text-center border border-outline/20 space-y-4">
              <span className="material-symbols-outlined text-4xl text-gold-leaf">spa</span>
              <h3 className="font-display text-xl font-bold text-primary">No formulations found</h3>
              <p className="font-body text-xs text-on-surface-variant max-w-sm mx-auto">
                No products match your selected filters. Try clearing filters or searching for alternative terms like "hair oil" or "ashwagandha".
              </p>
              <button
                onClick={clearFilters}
                className="bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-primary-container transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="bg-surface rounded-xl overflow-hidden border border-outline/20 shadow-sm flex flex-col justify-between group glow-hover cursor-pointer"
                >
                  {/* Product Image & Badges */}
                  <div className="relative h-60 overflow-hidden bg-surface-container-low">
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {product.is_bestseller === 1 && (
                        <span className="bg-gold-leaf text-primary font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">
                          Best Seller
                        </span>
                      )}
                      {product.mrp > product.selling_price && (
                        <span className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">
                          {Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
                        wishlist.includes(product.id)
                          ? 'bg-gold-leaf text-white'
                          : 'bg-surface/80 text-on-surface hover:text-gold-leaf'
                      }`}
                    >
                      <Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>


                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="font-label text-[10px] uppercase text-on-surface-variant tracking-widest block mb-1">
                        {product.category_name}
                      </span>
                      <Link
                        to={`/product/${product.slug}`}
                        className="font-display text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-1 block mb-2"
                      >
                        {product.name}
                      </Link>
                      <p className="font-body text-xs text-on-surface-variant line-clamp-2 mb-3">
                        {product.short_desc}
                      </p>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 text-gold-leaf text-xs mb-4">
                        <Star size={14} fill="currentColor" />
                        <span className="font-bold text-on-surface">{product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '5.0'}</span>
                        <span className="text-on-surface-variant text-[11px]">({product.review_count || 8} reviews)</span>
                      </div>
                    </div>

                    {/* Pricing & Add to Cart */}
                    <div className="pt-3 border-t border-outline/10 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-label text-base font-bold text-primary">₹{product.selling_price}</span>
                        {product.mrp > product.selling_price && (
                          <span className="text-xs text-on-surface-variant line-through ml-1.5">₹{product.mrp}</span>
                        )}
                      </div>

                      <Link
                        to={`/product/${product.slug}`}
                        className="bg-primary text-on-primary font-label text-xs uppercase font-bold px-3 py-2 rounded-full hover:bg-primary-container transition-colors inline-flex items-center gap-1"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

    </div>
  );
};
