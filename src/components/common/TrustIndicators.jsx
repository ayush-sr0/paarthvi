import React from 'react';
import { Leaf, Mountain, Sparkles, ShieldCheck, Truck } from 'lucide-react';

export const TrustIndicators = () => {
  const indicators = [
    {
      icon: <Leaf className="text-primary" size={28} />,
      title: '100% Organic Herbs',
      desc: 'Sourced from organic farms and wild forests',
    },
    {
      icon: <Mountain className="text-primary" size={28} />,
      title: 'Himalayan Sourced',
      desc: 'High-altitude Shilajit & wild Amla',
    },
    {
      icon: <Sparkles className="text-primary" size={28} />,
      title: 'Kshirpak Processed',
      desc: 'Traditional slow-cooked milk infusions',
    },
    {
      icon: <ShieldCheck className="text-primary" size={28} />,
      title: 'GMP Certified Quality',
      desc: 'Strict batch testing & safety standards',
    },
    {
      icon: <Truck className="text-primary" size={28} />,
      title: 'Reliable All-India Delivery',
      desc: 'Free shipping on orders above ₹499',
    },
  ];

  return (
    <section className="bg-surface-container-low border-y border-outline/10 py-10 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
        {indicators.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center group">
            <div className="w-14 h-14 rounded-full bg-primary-container/20 flex items-center justify-center mb-3 group-hover:bg-primary-container transition-colors duration-300">
              {item.icon}
            </div>
            <h4 className="font-display text-sm font-bold text-on-surface mb-1">{item.title}</h4>
            <p className="font-body text-xs text-on-surface-variant max-w-[160px]">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
