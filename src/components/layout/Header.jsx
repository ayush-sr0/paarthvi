import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { ShoppingBag, Heart, User, Search, Menu, X, Shield, Home, Sparkles, BookOpen } from 'lucide-react';

export const Header = () => {
  const { user } = useAuth();
  const { totalCartCount, wishlist, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularKeywords, setPopularKeywords] = useState([]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const sessionId = localStorage.getItem('parthvi_session') || 'sess_search';
      api.searchSuggest(searchQuery, sessionId).then(data => {
        if (data.success) {
          setSuggestions(data.suggestions || []);
          if (data.popular) setPopularKeywords(data.popular);
        }
      });
    } else {
      setSuggestions([]);
      setPopularKeywords(['Hair Oil', 'Ashwagandha', 'Shilajit', 'Kumkumadi', 'Triphala']);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-primary text-on-primary text-xs font-label py-2 px-4 text-center tracking-wider flex justify-center items-center gap-2">
        <span className="bg-gold-leaf/30 text-gold-leaf px-2 py-0.5 rounded text-[10px] uppercase font-bold">Festive Offer</span>
        <span>Pure Ayurvedic Formulations | Free Express Shipping on orders over ₹499</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-outline/20 transition-all duration-300">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3.5 flex items-center justify-between gap-4">
          
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-primary-container/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
              <span className="material-symbols-outlined text-2xl">spa</span>
            </div>
            <div>
              <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-primary block leading-none">
                Parthvi Ayurveda
              </span>
              <span className="font-label text-[10px] text-gold-leaf tracking-widest uppercase block mt-0.5">
                Authentic Heritage Wellness
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-label text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
            <Link to="/" className={`hover:text-primary transition-colors ${location.pathname === '/' ? 'text-primary font-bold' : ''}`}>Home</Link>
            <Link to="/shop" className={`hover:text-primary transition-colors ${location.pathname === '/shop' ? 'text-primary font-bold' : ''}`}>Shop</Link>
            <Link to="/shop?category=hair-care" className="hover:text-primary transition-colors">Hair Care</Link>
            <Link to="/shop?category=nutrition-supplements" className="hover:text-primary transition-colors">Nutrition</Link>
            <Link to="/shop?sort=bestseller" className="hover:text-primary transition-colors">Best Sellers</Link>
            <Link to="/wellness-knowledge" className="hover:text-primary transition-colors">Wellness Guide</Link>
            {user && user.role !== 'CUSTOMER' && (
              <Link to="/admin" className="text-gold-leaf font-bold hover:underline flex items-center gap-1">
                <Shield size={14} /> Admin Portal
              </Link>
            )}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 md:gap-5 text-on-surface">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:text-primary transition-colors flex items-center gap-2 text-xs font-label uppercase"
              aria-label="Search Store"
            >
              <Search size={20} />
              <span className="hidden sm:inline text-on-surface-variant font-medium">Search</span>
            </button>

            {/* Account Icon */}
            <Link
              to={user ? '/account' : '/account?login=true'}
              className="p-2 hover:text-primary transition-colors relative"
              aria-label="User Account"
            >
              <User size={20} />
              {user && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-leaf"></span>}
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/account?tab=wishlist"
              className="p-2 hover:text-primary transition-colors relative hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-leaf text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-primary text-on-primary hover:bg-primary-container px-3.5 py-2 rounded-full flex items-center gap-2 transition-colors shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingBag size={18} />
              <span className="font-label text-xs font-bold">{totalCartCount}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-surface border-b border-outline/20 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col space-y-3 font-label text-sm uppercase tracking-wider font-semibold text-on-surface">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>All Products</Link>
              <Link to="/shop?category=hair-care" onClick={() => setIsMobileMenuOpen(false)}>Hair Care</Link>
              <Link to="/shop?category=nutrition-supplements" onClick={() => setIsMobileMenuOpen(false)}>Nutrition & Supplements</Link>
              <Link to="/shop?category=personal-care" onClick={() => setIsMobileMenuOpen(false)}>Personal Care</Link>
              <Link to="/wellness-knowledge" onClick={() => setIsMobileMenuOpen(false)}>Wellness Knowledge</Link>
              <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>My Account & Orders</Link>
              {user && user.role !== 'CUSTOMER' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-gold-leaf font-bold">
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-gold-leaf/30 relative">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary"
            >
              <X size={20} />
            </button>

            <h3 className="font-display text-lg font-bold text-primary mb-3">Search Ayurvedic Catalogue</h3>
            
            <form onSubmit={handleSearchSubmit} className="relative mb-6">
              <input
                type="text"
                placeholder="Search products, ingredients (e.g. hair oil, Ashwagandha, Shilajit)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline/30 focus:border-gold-leaf outline-none text-sm font-body"
                autoFocus
              />
              <Search className="absolute left-4 top-3.5 text-on-surface-variant" size={20} />
            </form>

            {/* Popular Search Badges */}
            {popularKeywords.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Popular Searches</span>
                <div className="flex flex-wrap gap-2">
                  {popularKeywords.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(kw);
                        setIsSearchOpen(false);
                        navigate(`/shop?search=${encodeURIComponent(kw)}`);
                      }}
                      className="text-xs bg-surface-container-high hover:bg-primary hover:text-on-primary px-3 py-1 rounded-full transition-colors font-body"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-suggest Results */}
            {suggestions.length > 0 && (
              <div>
                <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Matching Products</span>
                <div className="divide-y divide-outline/10 max-h-60 overflow-y-auto">
                  {suggestions.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/product/${p.slug}`);
                      }}
                      className="py-2.5 flex items-center justify-between hover:bg-surface-container px-2 rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.main_image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                        <div>
                          <p className="font-display text-sm font-bold text-on-surface">{p.name}</p>
                          <span className="text-xs text-on-surface-variant">{p.category_name}</span>
                        </div>
                      </div>
                      <span className="font-label text-xs font-bold text-primary">₹{p.selling_price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar (Mobile Only - Reference code.html) */}
      <nav className="bg-surface-container text-primary font-label text-[10px] uppercase tracking-wider border-t border-outline/20 shadow-[0px_-4px_20px_rgba(22,53,29,0.1)] fixed bottom-0 w-full z-40 flex md:hidden justify-around items-center px-4 py-2">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            location.pathname === '/' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant'
          }`}
        >
          <Home size={18} />
          <span className="mt-0.5">Home</span>
        </Link>
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            location.pathname === '/shop' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant'
          }`}
        >
          <ShoppingBag size={18} />
          <span className="mt-0.5">Shop</span>
        </Link>
        <Link
          to="/wellness-knowledge"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            location.pathname === '/wellness-knowledge' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant'
          }`}
        >
          <BookOpen size={18} />
          <span className="mt-0.5">Wellness</span>
        </Link>
        <Link
          to="/account"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            location.pathname === '/account' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant'
          }`}
        >
          <User size={18} />
          <span className="mt-0.5">Profile</span>
        </Link>
      </nav>
    </>
  );
};
