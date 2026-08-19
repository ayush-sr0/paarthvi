import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { ArrowRight, Star, Heart, ShoppingBag, CheckCircle, ChevronLeft, ChevronRight, Play, Gift, Sparkles, Leaf, Mountain, ShieldCheck, HeartHandshake } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useCart();

  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const [banners, setBanners] = useState([
    {
      title: 'Restore Balance with Sacred Ayurveda',
      subtitle: 'Discover our premium collection of authentic herbal remedies crafted to harmonize your mind, body, and spirit.',
      ctaText: 'Shop Now',
      ctaUrl: '/shop',
      desktopImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkIoC79wqGR-6Vhm8oo35VT590u1_5XFguygcZr8AyxLW4VzQ5NVW5DMwpthxTb6vmn_kPPb2PEoRcLE60GmOsdsZsuYbjY15z_XvrPLQ_ieJxA3z3LlmtVq4UeQEFgUMmtuKBOBNOOWXExk1aPjCJZvaQCIy0WVxuKJh8W8X8d0sPj3jo5y2LzMD8bTuQUVPgp90TRBDqUtUnB99B90lDEXdQa_U38Btqy2vdqmDTenXyEJ5cQ08TWg',
    },
    {
      title: 'Pure Ingredients. Conscious Living.',
      subtitle: 'Himalayan Shilajit, Kshirpak Hair Oils, & Kesar Rasayanas for daily vitality and holistic harmony.',
      ctaText: 'View Best Sellers',
      ctaUrl: '/shop?sort=bestseller',
      desktopImage: 'https://images.unsplash.com/photo-1512290900673-0ff7656910be?auto=format&fit=crop&q=80&w=1600',
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

      {/* Advertising Festive Banner (Reference code.html) */}
      <section className="px-margin-mobile md:px-margin-desktop">
        <div className="w-full bg-secondary-container rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-outline/20 shadow-sm">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none bg-[url('https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
          <div className="relative z-10 max-w-lg mb-6 md:mb-0">
            <span className="font-label text-xs uppercase tracking-widest text-on-secondary-container mb-2 block font-bold">
              Festive Offer
            </span>
            <h2 className="font-display text-2xl md:text-3xl leading-tight text-on-secondary-container mb-3 font-bold">
              Deepavali Wellness Set
            </h2>
            <p className="font-body text-sm text-on-secondary-container/90 mb-6 leading-relaxed">
              Illuminate your health this season with our curated collection of sacred oils and herbs. Enjoy 20% off for a limited time.
            </p>
            <Link
              to="/shop?sort=bestseller"
              className="border-2 border-on-secondary-container text-on-secondary-container hover:bg-on-secondary-container hover:text-secondary-container font-label text-xs uppercase font-bold px-6 py-3 rounded-full transition-colors inline-flex items-center gap-2"
            >
              Claim Offer <Gift size={16} />
            </Link>
          </div>
          <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-surface overflow-hidden shadow-lg rotate-3 hover:rotate-0 transition-transform duration-500">
            <img
              alt="Wellness Set"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhnbEkvwPmmaWdBDj2CFybQA46jEnjXabzCAabB6oljjU8tTYVQENN4lAt5spkYgwAZR2j-JZfhH4pAnuVtq0yr18aJypvzSgPvvnoFr8klSWAkLbW9OpOA6LlZh7orRUZ6eOnBxw6y58KAy6avGaGlf6oTWjNNvLOPi4lrJzKMHXPfGoIIVlQsJZfnK5iyOsd0YwSF0wGdormMpt6JqkM-DJvTDAgDX-qwuqmOX7YlgJs6OvVK5xzkg"
            />
          </div>
        </div>
      </section>

      {/* Benefits Infographic (Reference code.html) */}
      <section className="px-margin-mobile md:px-margin-desktop py-8 bg-surface-container-low border-y border-outline/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors duration-300">
              <Leaf size={28} />
            </div>
            <h3 className="font-display text-base font-bold text-on-surface mb-1">100% Organic</h3>
            <p className="font-body text-xs text-on-surface-variant">Pure, untainted ingredients from nature.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors duration-300">
              <Mountain size={28} />
            </div>
            <h3 className="font-display text-base font-bold text-on-surface mb-1">Himalayan Sourced</h3>
            <p className="font-body text-xs text-on-surface-variant">Roots and herbs from sacred altitudes.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors duration-300">
              <HeartHandshake size={28} />
            </div>
            <h3 className="font-display text-base font-bold text-on-surface mb-1">Ethically Crafted</h3>
            <p className="font-body text-xs text-on-surface-variant">Prepared with mindfulness and reverence.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors duration-300">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-display text-base font-bold text-on-surface mb-1">GMP Certified</h3>
            <p className="font-body text-xs text-on-surface-variant">Highest standards of quality control.</p>
          </div>
        </div>
      </section>

      {/* Popular Catalog Links - Sacred Offerings (Reference code.html) */}
      <section className="px-margin-mobile md:px-margin-desktop">
        <h2 className="font-display text-2xl md:text-3xl text-on-background mb-8 text-center font-bold">
          Sacred Offerings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/shop?category=nutrition-supplements"
            className="group relative h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <img
              alt="Dosha Balancing"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTnRYq9N4tNYCBNHtwC-9UKO16ekI_k5V8PyYQl--a4OjeDqHIgZzu5t4Eso_fB3VPqTxe4zl4GxlTl9NXzlji4fR8bO-sKyU8hveO2fFbcP5L-fUT8uoa8xmoo61r_SMjrftYhm5_9tu85Vl7M48XEDWOAWiWm_5oOWo-GudwqC57ggpbLKdDg3y4Xo4CYKOklG1lgeFGD1xnWouleXxJcf-8eKrZbVAZyvWDlUSWt3lfkzdg1z_qOQ"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/40 to-transparent flex items-end p-6">
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-1">Dosha Balancing</h3>
                <span className="text-xs text-on-surface-variant font-label uppercase flex items-center gap-1 group-hover:text-secondary transition-colors font-bold">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>

          <Link
            to="/shop?category=hair-care"
            className="group relative h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <img
              alt="Sacred Oils"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtBTO3te9frWis1VqUj7GWYnH-aAdC6ZBZ_42IOKfqa7KvQxcYVMVqqHA60fIy6NQClOJx0wBoKMO9lOxA_d93HGs_ITOMcx6nlwiD-tIffpBXhhbkYA8IP3DFOdFnkAiViZOXA3PAILKPFD9h8O1-3a1BA3tvpLtzTKhhJ5zw_9ZwUjn7q8N6ILI7tMlykM-dkGNKBHuDHbKDM8yvFEv2ugBH-MigsRU1d57XjW66K2uJ5bG9IA8hWA"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/40 to-transparent flex items-end p-6">
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-1">Sacred Oils</h3>
                <span className="text-xs text-on-surface-variant font-label uppercase flex items-center gap-1 group-hover:text-secondary transition-colors font-bold">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>

          <Link
            to="/shop?category=herbal-wellness"
            className="group relative h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <img
              alt="Herbal Apothecary"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH33w-PXNVmO1ZqPjsi4EcEDwv-WvX7MVXdcCqmn9WgawL2C896vjmujbj6OeInFkgSPganzDbp44cgTdy5tTmGDkJ2_Q5OD1pPKAvguRBnKjRVAjBk8OsKgAFNayCRAc408HdhQ8Q_QiGyxCAttbVUIuwm5PKpljKzSd4keZW16OhOklcKazIWPhIlR5-P87vM3C3aMXBjNZc3mwNKY_4dWBp6rerIA8iqulhMxKE6jCb22vQ9pMTJg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/40 to-transparent flex items-end p-6">
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-1">Herbal Apothecary</h3>
                <span className="text-xs text-on-surface-variant font-label uppercase flex items-center gap-1 group-hover:text-secondary transition-colors font-bold">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
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
              className="bg-surface rounded-xl overflow-hidden border border-outline/20 shadow-sm flex flex-col justify-between group glow-hover"
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
                  {product.mrp > product.selling_price && (
                    <span className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">
                      {Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)}% OFF
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleWishlist(product.id)}
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
                    {product.mrp > product.selling_price && (
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
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_gUEvKP2UO1InWig03CSZ6bg_KjrOERTishrMoNRrBFoSzl-n4WPg9c53FgM1QWvZQM6s62YypoCXFhrAvaVk9S8I_NrpvE7XdMxIcBQT6LbCZREURsnUIwYdwWqrlFQBXDKKUEyZNI5Z2nH-QP2FYTWSdB0SQXvOazIwMcrTJydeVSRhhF45C6bRNZqY62QCqxP0L78DOGDn8YJqbAIBP_E8NZfgJ01x4rgxcCMK29LO8CTHUn_abA')`,
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

      {/* Wellness Wisdom Highlights (Reference code.html) */}
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
                alt="Meditation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVotFW5CynC3Rp_CzdRGfSKdlD2J5BAtONdQYZfBCCwr5nF4wnRWK0IFVAGIb0nQSMtpqddh9IOzkwoMhQg20BHszA522FFxblkh_y5VEzYv7leKTl5tJ6tFjxS2mENoftk-pELG2s5018cre3o7lGQ2hg_dkz00kxjLtuf6OTSPeS7L_KQ_zcpyzXYpYBUBsCR4fT7bYWijm0LlzcPeMgqbEHx-iVo8sTLZ0nr4bDMzBsiTE8GkZLRQ"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-label uppercase text-secondary font-bold block">Mind & Spirit</span>
              <h3 className="font-display text-lg font-bold text-on-surface">Aligning Your Chakras for Autumn</h3>
              <p className="font-body text-xs text-on-surface-variant line-clamp-2">
                As the seasons change, our internal energies shift. Learn simple daily practices to maintain balance.
              </p>
              <Link to="/wellness-knowledge" className="text-primary font-label font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-gold-leaf transition-colors pt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          <article className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline/10 hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden">
              <img
                alt="Herbal Tea"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1JVwkFejMCQIB5aWtSkrtZ8mSV0vT-mdsjKGehrHACWQt9kh2ldu1jqp4ZE3b68rQ7gXRCjBmeipSaf25AD8ZIpGNQ9KnTifd479gAX6a5ogWJCY2BVkfBnxiAVsdIOwX9ycDfPUYO3wTc9zRCcVLCE9HsgMKKf4zPiDqklSaMxl_RlsDl2DwNa8eSIrrRcVCwb5qOaL42NMDo1pVqs0WV2UA9mNHFkUd_LxcAZ0x17tEX_LdZxePLQ"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-label uppercase text-secondary font-bold block">Nutrition</span>
              <h3 className="font-display text-lg font-bold text-on-surface">The Golden Power of Turmeric</h3>
              <p className="font-body text-xs text-on-surface-variant line-clamp-2">
                Beyond curries, turmeric is a powerhouse of anti-inflammatory properties central to Ayurvedic healing.
              </p>
              <Link to="/wellness-knowledge" className="text-primary font-label font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-gold-leaf transition-colors pt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          <article className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline/10 hover:shadow-md transition-shadow group hidden md:block">
            <div className="h-48 overflow-hidden">
              <img
                alt="Yoga"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANTkE0W2RhvLFM7OrKJ3P-3nOiju22M60OxKF0nZ0uAVcpQE8QJUi18iH2DpDe7xdpzlPSMTx-FWvAfxTp1Nus1TfitsMNxoKIA0hUOGiS-7NDUmzUDfYFP7FIHSRKTZYM5a2VcX7pkVGQlVaMzuHvFAXrykjJcivgD1mBV7mv7xS8OFpBC4mJXR89Qr47H3a8GKRMsu5lhg8JWZQS9PMCG9YH_C3oaKRW8vxw7jN2RmeQcRbGILOuVg"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-label uppercase text-secondary font-bold block">Lifestyle</span>
              <h3 className="font-display text-lg font-bold text-on-surface">Morning Dinacharya Routine</h3>
              <p className="font-body text-xs text-on-surface-variant line-clamp-2">
                Start your day aligned with the sun. A guide to the traditional Ayurvedic morning routine.
              </p>
              <Link to="/wellness-knowledge" className="text-primary font-label font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-gold-leaf transition-colors pt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Social Sanctuary / Community Grid (Reference code.html) */}
      <section className="px-margin-mobile md:px-margin-desktop py-4">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-on-background mb-1">Our Community</h2>
          <p className="font-body text-xs text-on-surface-variant">
            Join our sanctuary on <span className="text-primary font-bold">@ParthviAyurveda</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {[
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBBmjY3ttD1mSv3AfCN1uMHSpL2S7D2fdLMTJ5hsCqQ1Vdz15SKBRojQf1a_10F-8sm2-PZEewlwiZasvgSL0kjCmRya8Ufe4mbl0WzImb-kwLfi9hUWgvtngLRak7mxSW8Uv4pYYu0WYr68617VfeLWjWmQlrJ3_UG2oJ0ei2VQdAt4--nQdg3-8CgzaEinZ1RztDjRVzRgnne2oVLSPGYCBE50rN-_v8V4Y13YxHhYwOpOmAjk221Fw',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDrFPYJxewnSGFkjpaP3aYlHcgmDpX2KiBcs_NrUKDYvF39hUHI_k02F6IRmhQqg-Pnsu8bc1q6BHW-lvbjjim1KTaeFZSmXbp4Kgc7TRxLbIfQ44yji8USGGwk0yKKzCnzYKTlDxGokuSKgaegixf87ABBssbGoLJATLm4x8MsRKXzm11kFlr3_kDOboYJioXiwKhC7vl1dhHexrLtZEdsjHpEeCcNQMlP_w5gPffg5n8_1blPpt9uzg',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCXFWrvLC-oObeB0r56lyWOHFSvl7KJl4H0EDrALuIDJwir3qpdkQUB2jbHCMY45hs4LufigOuqbqNaFTINwN8Xoy3UEivzj2g9xm5vmFs-Db_nTfNrYT9NdkaNlR9EAm-1rIo0o20rfFQDnGoe5K8q-8NNAhmrI_toGM0CVpIeo525jiVZIsMnGJ8yb1cMOpkj_YUnDsTlBbNACBdWY_z4bF7SQ0Ry5DAm4KrcXcjOkdQBWD_Qz5hiDw',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuD5edmXfZH308Tm5FwrAepW2CLrpM4tDzm7Xvg6K5wk09Me3H5Y-jqXi9Fahyd9AKXFpeXqYvgBODy42QeRQ1EZ7XTbH8jRcQXLb4RNe_cG-9w0anDmODTTZCBnEL7K9AVJPGSaIA71d-blA-AUoiA-pRh3BdkmyDKiTIDTl--kk5ZpCDZaaig_F_YRSMf0rI1v_s2wcEueBflyLumrOYFVokv9xWoGywCAUTNSHmFKK86vwjvE7snIvA',
          ].map((imgUrl, idx) => (
            <div key={idx} className="block relative aspect-square overflow-hidden group rounded-lg">
              <img
                src={imgUrl}
                alt="Community Post"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <Heart className="text-white" size={28} fill="currentColor" />
              </div>
            </div>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-3xl w-full p-6 relative border border-gold-leaf shadow-2xl">
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
