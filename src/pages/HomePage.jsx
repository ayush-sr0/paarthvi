import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { ArrowRight, Star, Heart, ShoppingBag, CheckCircle, ChevronLeft, ChevronRight, Play, Sparkles, Leaf, Mountain, ShieldCheck, HeartHandshake } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useCart();

  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [comboProducts, setComboProducts] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const comboScrollRef = React.useRef(null);

  const defaultCategoryCards = [
    {
      id: 1,
      name: 'Hair Care',
      slug: 'hair-care',
      image: '/products/hair-xl.jpg'
    },
    {
      id: 2,
      name: 'Nutrition & Supplements',
      slug: 'nutrition-supplements',
      image: '/products/gain-up.jpg'
    },
    {
      id: 3,
      name: 'Herbal Wellness',
      slug: 'herbal-wellness',
      image: '/products/sukero.jpg'
    },
    {
      id: 4,
      name: 'Daily Wellness',
      slug: 'daily-wellness',
      image: '/products/chyawanprash.jpg'
    },
    {
      id: 5,
      name: 'Personal Care',
      slug: 'personal-care',
      image: '/products/joint-support.jpg'
    },
    {
      id: 6,
      name: "Men's Wellness",
      slug: 'mens-wellness',
      image: '/products/shilajit-resin.jpg'
    }
  ];


  const defaultComboProducts = [
    {
      id: 101,
      name: "Paarthvi Chyawanprash Avaleha",
      slug: "paarthvi-chyawanprash-avaleha",
      net_qty: "500 g",
      price: 449.00,
      mrp: 599.00,
      main_image: "/products/chyawanprash.jpg",
      avg_rating: 4.9,
      review_count: 28
    },
    {
      id: 102,
      name: "Paarthvi Veda Shilajit Resin (75% Fulvic Acid)",
      slug: "shilajit-resin-75-fulvic-acid",
      net_qty: "20 g",
      price: 999.00,
      mrp: 1499.00,
      main_image: "/products/shilajit-resin.jpg",
      avg_rating: 5.0,
      review_count: 34
    },
    {
      id: 103,
      name: "Gain Up Lean Mass Gainer Powder",
      slug: "gain-up-lean-mass-gainer",
      net_qty: "500 g",
      price: 999.00,
      mrp: 1299.00,
      main_image: "/products/gain-up.jpg",
      avg_rating: 4.8,
      review_count: 19
    },
    {
      id: 104,
      name: "Sukero Capsules (Diabetes Management)",
      slug: "sukero-diabetes-management",
      net_qty: "60 Capsules",
      price: 699.00,
      mrp: 899.00,
      main_image: "/products/sukero.jpg",
      avg_rating: 4.9,
      review_count: 25
    },
    {
      id: 105,
      name: "Thyro Pro Capsules (Thyroid Management)",
      slug: "thyro-pro-thyroid-management",
      net_qty: "60 Capsules",
      price: 749.00,
      mrp: 999.00,
      main_image: "/products/thyro-pro.jpg",
      avg_rating: 4.8,
      review_count: 16
    }
  ];


  const scrollCombos = (direction) => {
    if (comboScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      comboScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [banners, setBanners] = useState([
    {
      title: 'Paarthvi Chyawanprash Avaleha',
      subtitle: 'Classical 20+ Herbal Rasayana for Natural Immunity & Daily Vitality.',
      ctaText: 'Shop Chyawanprash',
      ctaUrl: '/product/paarthvi-chyawanprash-avaleha',
      desktopImage: '/products/chyawanprash.jpg',
    },
    {
      title: 'Pure Himalayan Shilajit Resin (75% Fulvic Acid)',
      subtitle: 'Fortified with Ashwagandha & Gokshura for Peak Energy & Cellular Stamina.',
      ctaText: 'Explore Shilajit Resin',
      ctaUrl: '/product/shilajit-resin-75-fulvic-acid',
      desktopImage: '/products/shilajit-resin.jpg',
    },
  ]);


  useEffect(() => {
    const interval = setInterval(() => {
      setBanners(prev => {
        if (prev.length === 0) return prev;
        setCurrentBannerIndex(curr => (curr + 1) % prev.length);
        return prev;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.getCmsBanners().then(data => {
      if (data.success && data.banners && data.banners.length > 0) {
        setBanners(data.banners.map(b => ({
          title: b.title,
          subtitle: b.subtitle,
          ctaText: b.cta_text || 'Shop Now',
          ctaUrl: b.cta_url || '/shop',
          desktopImage: b.desktop_image,
        })));
      }
    });

    api.getCategories().then(data => {
      if (data.success) setCategories(data.categories || []);
    });

    api.getProducts({ is_bestseller: 1 }).then(data => {
      if (data.success) setBestSellers(data.products || []);
    });

    api.getProducts().then(data => {
      if (data.success && data.products && data.products.length > 0) {
        setComboProducts(data.products);
      }
    });

    api.trackEvent('PAGE_VIEW', '/');
  }, []);

  return (
    <div className="space-y-12 md:space-y-20 pb-20 max-w-[1360px] mx-auto overflow-hidden">
      <SEO
        title="Parthvi Ayurveda — Authentic Herbal Remedies & Modern Wellness"
        description="Discover sacred Ayurvedic formulations, Himalayan Shilajit, Kshirpak hair oils, and organic wellness rasayanas crafted to harmonize body, mind, and spirit."
      />
      
      {/* Hero Section (Reference code.html) */}
      <section className="relative w-full px-margin-mobile md:px-margin-desktop pt-6">
        <div className="relative w-full h-[60vh] min-h-[400px] rounded-xl overflow-hidden border border-gold-leaf/30 bg-surface-container shadow-sm glow-hover transition-shadow duration-300">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${banner.desktopImage})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/50 to-transparent flex items-center p-8 md:p-16">
                <div className="max-w-md">
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface mb-4 leading-tight">
                    {banner.title}
                  </h1>
                  <p className="font-body text-sm md:text-base text-on-surface-variant mb-8 leading-relaxed">
                    {banner.subtitle}
                  </p>
                  <Link
                    to={banner.ctaUrl}
                    className="bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-label text-xs uppercase tracking-wider font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-sm inline-flex items-center gap-2 group"
                  >
                    {banner.ctaText}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Arrows */}
          <button
            onClick={() => setCurrentBannerIndex((currentBannerIndex - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-surface/80 hover:bg-primary hover:text-on-primary p-2 rounded-full transition-colors text-on-surface"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentBannerIndex((currentBannerIndex + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-surface/80 hover:bg-primary hover:text-on-primary p-2 rounded-full transition-colors text-on-surface"
          >
            <ChevronRight size={20} />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBannerIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentBannerIndex ? 'bg-gold-leaf w-6' : 'bg-primary/30'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Quick Access Grid */}
      <section className="px-margin-mobile md:px-margin-desktop py-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {(categories.length > 0 ? categories : defaultCategoryCards).slice(0, 6).map((cat, idx) => {
            const defaultMatch = defaultCategoryCards[idx % defaultCategoryCards.length];
            const rawTitle = cat.name || defaultMatch.name;
            const image = cat.image || cat.main_image || defaultMatch.image;
            const slug = cat.slug || defaultMatch.slug;

            const shortTitleMap = {
              'Hair Care': 'Hair Care',
              'Nutrition & Supplements': 'Nutrition',
              'Herbal Wellness': 'Herbal Care',
              'Daily Wellness': 'Daily Health',
              'Personal Care': 'Personal Care',
              "Men's Wellness": "Men's Health",
              "Women's Wellness": "Women's Care",
              'Health Care': 'Health Care',
              'Medicine': 'Medicine',
              'Nutraceuticals': 'Nutraceuticals'
            };
            const displayTitle = shortTitleMap[rawTitle] || rawTitle;

            return (
              <Link
                key={cat.id || idx}
                to={`/shop?category=${slug}`}
                className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-between text-center group transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-full aspect-square max-w-[110px] rounded-xl overflow-hidden mb-2 flex items-center justify-center border border-slate-100 shadow-inner">
                  <img
                    src={image}
                    alt={displayTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = defaultMatch.image;
                    }}
                  />
                </div>
                <span className="font-display font-bold text-xs sm:text-sm text-[#00A651] group-hover:text-emerald-800 tracking-tight leading-tight whitespace-nowrap">
                  {displayTitle}
                </span>
              </Link>
            );
          })}
        </div>
      </section>


      {/* Save on Combo Orders Product Carousel (Reference Image 2) */}
      <section className="px-margin-mobile md:px-margin-desktop py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Save on Combo Orders
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCombos('left')}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#EAF5EC] text-[#00A651] hover:bg-[#00A651] hover:text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              aria-label="Previous products"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollCombos('right')}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#EAF5EC] text-[#00A651] hover:bg-[#00A651] hover:text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              aria-label="Next products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={comboScrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {(comboProducts.length > 0 ? comboProducts : defaultComboProducts).map((product) => {
            const sellingPrice = product.selling_price || product.price;
            const mrpPrice = product.mrp;
            const discountPercent = mrpPrice && mrpPrice > sellingPrice
              ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)
              : null;
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.slug}`)}
                className="w-[240px] sm:w-[270px] flex-shrink-0 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative bg-[#F6F8F5] rounded-xl p-3 h-48 flex items-center justify-center mb-3 group-hover:bg-[#F0F4EF] transition-colors">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleWishlist(product.id);
                      }}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center transition-colors ${
                        isWishlisted ? 'text-[#00A651]' : 'text-slate-400 hover:text-[#00A651]'
                      }`}
                      aria-label="Toggle wishlist"
                    >
                      <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <img
                      src={product.main_image || product.image}
                      alt={product.name}
                      className="max-h-40 w-auto object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <Link
                    to={`/product/${product.slug}`}
                    className="font-display font-bold text-sm text-slate-800 line-clamp-1 block mb-1 group-hover:text-[#00A651] transition-colors"
                  >
                    {product.name}
                  </Link>

                  <span className="text-xs text-slate-400 font-medium block mb-2">
                    {product.net_qty || '580 g'}
                  </span>

                  <div className="flex items-center flex-wrap gap-1 mb-2">
                    <span className="font-bold text-base text-slate-900">
                      ₹ {sellingPrice}
                    </span>
                    {mrpPrice && mrpPrice > sellingPrice && (
                      <span className="text-xs text-slate-400 line-through ml-1">
                        M.R.P.: ₹{mrpPrice}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="bg-[#E8F5E9] text-[#00A651] text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                        {discountPercent}.00% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-3">
                    <Star size={13} fill="currentColor" />
                    <span>{product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '0'}</span>
                    <span className="text-slate-400 font-normal">({product.review_count || 0})</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.default_variant_id || product.id);
                  }}
                  className="w-full bg-[#00A651] hover:bg-[#008c44] text-white font-label font-bold text-xs py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-1 cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      </section>




      {/* Trending & Sale Products (Reference code.html) */}
      <section className="px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-8 border-b border-outline/20 pb-4">
          <div>
            <h2 className="font-display text-2xl text-on-background font-bold">Popular Now</h2>
            <p className="font-body text-xs text-on-surface-variant mt-1">Our most sought-after remedies.</p>
          </div>
          <Link to="/shop?sort=bestseller" className="hidden md:flex items-center gap-1 text-primary hover:text-secondary font-label text-xs uppercase font-bold transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.slice(0, 4).map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.slug}`)}
              className="bg-surface rounded-xl overflow-hidden border border-outline/20 shadow-sm flex flex-col justify-between group glow-hover cursor-pointer"
            >
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
                  {Number(product.mrp) > Number(product.selling_price) && (
                    <span className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">
                      {Math.round(((Number(product.mrp) - Number(product.selling_price)) / Number(product.mrp)) * 100)}% OFF
                    </span>
                  )}
                </div>

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

                  <div className="flex items-center gap-1 text-gold-leaf text-xs mb-4">
                    <Star size={14} fill="currentColor" />
                    <span className="font-bold text-on-surface">{product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '5.0'}</span>
                    <span className="text-on-surface-variant text-[11px]">({product.review_count || 14} reviews)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-label text-base font-bold text-primary">₹{product.selling_price}</span>
                    {Number(product.mrp) > Number(product.selling_price) && (
                      <span className="text-xs text-on-surface-variant line-through ml-1.5">₹{product.mrp}</span>
                    )}
                  </div>


                  <Link
                    to={`/product/${product.slug}`}
                    className="bg-primary text-on-primary font-label text-xs uppercase font-bold px-3.5 py-2 rounded-full hover:bg-primary-container transition-colors inline-flex items-center gap-1"
                  >
                    View Formulation
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sacred Motion Video Section (Reference code.html) */}
      <section className="px-margin-mobile md:px-margin-desktop my-8">
        <div
          onClick={() => setIsVideoModalOpen(true)}
          className="relative w-full h-[50vh] min-h-[300px] rounded-xl overflow-hidden shadow-md group cursor-pointer border border-outline/20"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{
              backgroundImage: `url('/products/chyawanprash.jpg')`,
            }}
          ></div>
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center group-hover:bg-black/50 transition-colors">
            <div className="w-20 h-20 rounded-full bg-surface/90 text-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">
              <Play size={32} className="ml-1" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-2 font-bold tracking-wide">
              The Journey of a Herb
            </h2>
            <p className="font-body text-sm text-white/90 max-w-lg">
              Experience the mindful harvesting and sacred Kshirpak preparation behind our remedies.
            </p>
          </div>
        </div>
      </section>

      {/* Wellness Wisdom Highlights */}
      <section className="px-margin-mobile md:px-margin-desktop bg-surface-container-low py-12 border-y border-outline/10">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl text-primary mb-3 font-bold">Wellness Wisdom</h2>
          <p className="font-body text-xs text-on-surface-variant max-w-2xl mx-auto">
            Insights from ancient texts applied to modern living.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline/10 hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden">
              <img
                alt="Sukero Diabetes Management"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="/products/sukero.jpg"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-label uppercase text-secondary font-bold block">Metabolic Care</span>
              <h3 className="font-display text-lg font-bold text-on-surface">Managing Blood Sugar Naturally</h3>
              <p className="font-body text-xs text-on-surface-variant line-clamp-2">
                How Sukero's synergy of Jamun, Gurmar, and Vijaysar aids insulin response and metabolic wellness.
              </p>
              <Link to="/product/sukero-diabetes-management" className="text-primary font-label font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-gold-leaf transition-colors pt-2">
                Read Formulation Details <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          <article className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline/10 hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden">
              <img
                alt="Gain Up Lean Mass Gainer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="/products/gain-up.jpg"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-label uppercase text-secondary font-bold block">Nutrition</span>
              <h3 className="font-display text-lg font-bold text-on-surface">Herbal Mass & Muscle Building</h3>
              <p className="font-body text-xs text-on-surface-variant line-clamp-2">
                Combine Ashwagandha and Shatavari for clean muscle tissue growth and stamina without synthetic fillers.
              </p>
              <Link to="/product/gain-up-lean-mass-gainer" className="text-primary font-label font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-gold-leaf transition-colors pt-2">
                Read Formulation Details <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          <article className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline/10 hover:shadow-md transition-shadow group hidden md:block">
            <div className="h-48 overflow-hidden">
              <img
                alt="Hair XL Hair Growth"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="/products/hair-xl.jpg"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-label uppercase text-secondary font-bold block">Hair XL</span>
              <h3 className="font-display text-lg font-bold text-on-surface">Revitalizing Scalp & Hair Follicles</h3>
              <p className="font-body text-xs text-on-surface-variant line-clamp-2">
                Bhringraj, Neem, and Curry Leaves work at the root to stop hair fall and trigger healthy growth.
              </p>
              <Link to="/product/hair-xl-supports-healthy-hair" className="text-primary font-label font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-gold-leaf transition-colors pt-2">
                Read Formulation Details <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Social Sanctuary / Community Grid */}
      <section className="px-margin-mobile md:px-margin-desktop py-4">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-on-background mb-1">Our Formulation Gallery</h2>
          <p className="font-body text-xs text-on-surface-variant">
            Authentic product range crafted by <span className="text-primary font-bold">@ParthviAyurveda</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {[
            { img: '/products/chyawanprash.jpg', slug: 'paarthvi-chyawanprash-avaleha' },
            { img: '/products/shilajit-resin.jpg', slug: 'shilajit-resin-75-fulvic-acid' },
            { img: '/products/hair-xl.jpg', slug: 'hair-xl-supports-healthy-hair' },
            { img: '/products/thyro-pro.jpg', slug: 'thyro-pro-thyroid-management' },
          ].map((item, idx) => (
            <Link key={idx} to={`/product/${item.slug}`} className="block relative aspect-square overflow-hidden group rounded-lg border border-outline/20">
              <img
                src={item.img}
                alt="Product Showcase"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <ShoppingBag className="text-white" size={28} />
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* SEO & Brand Mission Statement (Reference code.html) */}

      <section className="px-margin-mobile md:px-margin-desktop py-12 text-center max-w-4xl mx-auto">
        <div className="w-12 h-1 bg-gold-leaf mx-auto mb-6 rounded-full"></div>
        <h2 className="font-display text-2xl md:text-3xl text-primary mb-4 font-bold">
          Rooted in Ancient Wisdom, Crafted for Modern Life
        </h2>
        <p className="font-body text-xs md:text-sm text-on-surface-variant leading-relaxed">
          At Parthvi Ayurveda, our mission is to bring the timeless science of life into the rhythm of the modern world. We believe that true wellness is not merely the absence of illness, but a vibrant state of balance between body, mind, and consciousness. Sourced directly from ethical farmers in the Himalayan foothills and prepared following strict classical guidelines, our remedies offer a sanctuary of purity in a chaotic world. Reconnect with your true nature.
        </p>
      </section>

      {/* Video Modal Overlay */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
          <div className="bg-surface rounded-2xl max-w-3xl w-full p-6 relative border border-gold-leaf shadow-2xl my-auto">

            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="font-display text-xl font-bold text-primary mb-4">The Journey of a Herb</h3>
            <div className="w-full h-80 bg-black rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-body">
              <p className="p-4 text-center">
                [Herbal Preparation Video: Showing wild Amla harvesting, Kshirpak Kshira boiling, and traditional copper pot decoction]
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
