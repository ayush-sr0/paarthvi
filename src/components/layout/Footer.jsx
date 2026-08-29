import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import { ShieldCheck, Lock, Truck, RefreshCw, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';


export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'privacy', 'shipping', 'refund', 'terms', 'disclaimer'

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-primary text-on-primary pt-16 pb-12 border-t border-gold-leaf/20 relative overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Top Newsletter Grid */}
        <div className="bg-primary-container/40 rounded-xl p-8 mb-12 border border-gold-leaf/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="font-label text-xs uppercase tracking-widest text-gold-leaf block mb-1">Stay Connected</span>
            <h3 className="font-display text-2xl font-bold mb-2">Subscribe to Ayurvedic Wisdom</h3>
            <p className="text-sm opacity-90 font-body">Receive curated herbal wellness tips, seasonal dinacharya guides, and exclusive festive offers.</p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            {subscribed ? (
              <div className="bg-gold-leaf/20 border border-gold-leaf text-gold-leaf px-6 py-3 rounded-full text-xs font-label uppercase font-bold flex items-center gap-2">
                <CheckCircle size={16} /> Subscribed to Newsletter
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-sacred-palace text-on-surface px-4 py-3 rounded-full outline-none text-sm w-full sm:w-72"
                  required
                />
                <button
                  type="submit"
                  className="bg-gold-leaf text-primary font-label text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-white transition-colors"
                >
                  Subscribe
                </button>
              </>
            )}
          </form>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 border-b border-white/10 pb-12">
          
          {/* Brand Philosophy Column */}
          <div className="space-y-4">
            <div className="mb-2">
              <Logo size="md" variant="light" />
            </div>

            <p className="text-xs leading-relaxed opacity-80 font-body">
              Restoring constitutional balance through time-honored Ayurvedic formulations, ethically sourced Himalayan herbs, and traditional Kshirpak Vidhi processing.
            </p>
            <div className="text-[11px] text-gold-leaf/90 space-y-1 pt-2">
              <p>Manufacturing Lic No: UT-AYU-342/2019</p>
              <p>FSSAI License: 12621005000432</p>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold mb-4">Shop Categories</h4>
            <ul className="space-y-2.5 text-xs font-body opacity-90">
              <li><Link to="/shop?category=hair-care" className="hover:text-gold-leaf transition-colors">Hair Oils & Cleansers</Link></li>
              <li><Link to="/shop?category=nutrition-supplements" className="hover:text-gold-leaf transition-colors">Ashwagandha & Rasayanas</Link></li>
              <li><Link to="/shop?category=personal-care" className="hover:text-gold-leaf transition-colors">Kumkumadi Facial Oils</Link></li>
              <li><Link to="/shop?category=daily-wellness" className="hover:text-gold-leaf transition-colors">Triphala & Gut Cleansers</Link></li>
              <li><Link to="/shop?sort=bestseller" className="hover:text-gold-leaf transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Customer Support Column */}
          <div>
            <h4 className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs font-body opacity-90">
              <li><Link to="/account?tab=orders" className="hover:text-gold-leaf transition-colors">Track Order Status</Link></li>
              <li><button onClick={() => setActiveModal('shipping')} className="hover:text-gold-leaf transition-colors">Shipping & Pincodes</button></li>
              <li><button onClick={() => setActiveModal('refund')} className="hover:text-gold-leaf transition-colors">Returns & Refunds Policy</button></li>
              <li><Link to="/account?tab=tickets" className="hover:text-gold-leaf transition-colors">Raise Support Ticket</Link></li>
              <li><button onClick={() => setActiveModal('disclaimer')} className="hover:text-gold-leaf transition-colors">Ayurvedic Disclaimer</button></li>
            </ul>
          </div>

          {/* Contact Information Column */}
          <div>
            <h4 className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-xs font-body opacity-90">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-gold-leaf shrink-0 mt-0.5" />
                <span>Parthvi Herbal Formulations, Gaur City Center, Greater Noida, Uttar Pradesh - 201318</span>
              </li>

              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold-leaf shrink-0" />
                <span>+91 98765 43210 (Mon-Sat, 9AM - 6PM)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gold-leaf shrink-0" />
                <span>care@parthvi.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Foundation & Compliance Context Note */}
        <div className="bg-primary-container/20 rounded-lg p-4 mb-8 text-[11px] text-center opacity-75 font-body leading-relaxed border border-gold-leaf/10">
          * Developed in association with ISKCON Foundation initiatives for natural, conscious living. Official ISKCON logos and trademarks are used only under authorization. Product information is based on classical Ayurvedic treatises (Charaka Samhita, Ashtanga Hridaya) and is not intended to replace professional medical advice.
        </div>

        {/* Bottom Rights & Policy Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-body opacity-70">
          <p>© 2026 Parthvi Ayurveda. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 font-label uppercase text-[10px]">
            <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <button onClick={() => setActiveModal('terms')} className="hover:underline">Terms of Service</button>
            <button onClick={() => setActiveModal('shipping')} className="hover:underline">Shipping Policy</button>
            <button onClick={() => setActiveModal('refund')} className="hover:underline">Refund Policy</button>
            <Link to="/admin" className="hover:underline text-gold-leaf/80">Admin Portal</Link>
          </div>

        </div>

      </div>

      {/* Policy Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto py-8 md:py-12">
          <div className="bg-surface text-on-surface rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto shadow-2xl relative border border-gold-leaf my-auto">

            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 font-bold text-lg">✕</button>
            
            {activeModal === 'privacy' && (
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-3">Privacy & Data Policy</h3>
                <p className="text-xs leading-relaxed text-on-surface-variant space-y-2">
                  Parthvi Ayurveda values your privacy. We collect minimal customer information required exclusively for account authentication, order processing, delivery, and customer service. We do not track payment credentials, CVV numbers, passwords, or sensitive health records. First-party analytics session data is anonymized.
                </p>
              </div>
            )}

            {activeModal === 'shipping' && (
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-3">Shipping & Delivery Policy</h3>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  We deliver to over 19,000 PIN codes across India via partner couriers (Delhivery, BlueDart). Orders over ₹499 qualify for complimentary shipping. Standard delivery timeframe is 2-4 business days for metro locations and 3-6 days for non-metro towns. Cash on Delivery (COD) is available on eligible PIN codes.
                </p>
              </div>
            )}

            {activeModal === 'refund' && (
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-3">Returns & Refunds Policy</h3>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  We offer a 7-day hassle-free return window for damaged, leaking, or incorrect items received. Upon verification by our support team, refunds are processed directly back to the original payment method within 5-7 working days.
                </p>
              </div>
            )}

            {activeModal === 'disclaimer' && (
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-3">Ayurvedic Health Disclaimer</h3>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Products sold on Parthvi Ayurveda are traditional herbal supplements and wellness formulations. Statements made regarding benefits are based on historical Ayurvedic literature and general wellness attributes. They are not intended to diagnose, treat, cure, or prevent any disease.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
