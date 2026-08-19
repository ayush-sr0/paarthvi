import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';

export const WellnessBlogPage = () => {
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'Understanding Kshirpak Vidhi: The Ancient Science of Herbal Hair Oils',
      slug: 'understanding-kshirpak-vidhi-herbal-hair-oils',
      category: 'Hair Care',
      author: 'Dr. Ananya Shastri (BAMS)',
      date: 'Feb 10, 2026',
      cover: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800',
      excerpt: 'Discover why slow-cooked herbal hair oils processed with goat or cow milk provide unmatched nourishment to scalp roots and hair follicles.',
      content: `Kshirpak Vidhi is one of the most revered pharmaceuticals processes described in Ayurvedic texts such as Charaka Samhita and Sharangdhara Samhita. It involves decocting herbs with milk and vegetable oils until all moisture evaporates, transferring lipid-soluble and water-soluble phyto-nutrients directly into the oil medium.

Traditional herbal hair oils like Maha Bhringraj Divine Hair Oil undergo a meticulous 72-hour Kshirpak process where fresh Bhringraj, Amla, Brahmi, and Nagarmotha are simmered with pure sesame oil and fresh milk. This prevents overheating and preserves sensitive active botanical compounds.`,
    },
    {
      id: 2,
      title: '5 Daily Dinacharya Rituals for Balanced Vata, Pitta, and Kapha',
      slug: '5-daily-dinacharya-rituals-balanced-doshas',
      category: 'Lifestyle',
      author: 'Vaidya Rajeshwar Sharma',
      date: 'Feb 14, 2026',
      cover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
      excerpt: 'Incorporate 5 simple Ayurvedic morning habits to maintain daily energy, mental clarity, and digestive ease.',
      content: `Dinacharya, or the Ayurvedic daily routine, aligns human circadian rhythms with nature’s cycles. Simple habits like warm water drinking, oil pulling (Gandusha), self-massage (Abhyanga), and mindfulness can rejuvenate your immune system.`,
    },
  ]);

  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    api.getBlogPosts().then(data => {
      if (data.success && data.posts && data.posts.length > 0) {
        setArticles(data.posts.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          author: p.author,
          date: p.publish_date,
          cover: p.cover_image,
          excerpt: p.excerpt,
          content: p.content,
        })));
      }
    });

    api.trackEvent('PAGE_VIEW', '/wellness-knowledge');
  }, []);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">

      <div className="border-b border-outline/10 pb-4">
        <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-1">
          Knowledge Base
        </span>
        <h1 className="font-display text-3xl font-bold text-primary">Ayurvedic Wellness & Heritage Guide</h1>
      </div>

      {selectedArticle ? (
        <article className="bg-surface rounded-2xl border border-outline/20 p-6 md:p-10 space-y-6 animate-in fade-in duration-200">
          <button onClick={() => setSelectedArticle(null)} className="text-xs font-label uppercase text-gold-leaf font-bold hover:underline">
            ← Back to Articles
          </button>

          <img src={selectedArticle.cover} alt={selectedArticle.title} className="w-full h-80 object-cover rounded-xl border border-outline/20" />

          <div>
            <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block mb-2">{selectedArticle.category}</span>
            <h2 className="font-display text-3xl font-bold text-primary mb-3">{selectedArticle.title}</h2>
            <div className="flex items-center gap-4 text-xs font-body text-on-surface-variant border-b border-outline/10 pb-4">
              <span className="flex items-center gap-1"><User size={14} /> {selectedArticle.author}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {selectedArticle.date}</span>
            </div>
          </div>

          <div className="font-body text-sm text-on-surface-variant leading-relaxed space-y-4 whitespace-pre-line">
            {selectedArticle.content}
          </div>
        </article>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art) => (
            <div key={art.id} className="bg-surface rounded-2xl overflow-hidden border border-outline/20 shadow-sm flex flex-col justify-between group glow-hover">
              <div className="h-52 overflow-hidden">
                <img src={art.cover} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-label text-[10px] uppercase text-gold-leaf font-bold tracking-widest block mb-1">{art.category}</span>
                  <h3 className="font-display text-xl font-bold text-primary mb-2 line-clamp-2">{art.title}</h3>
                  <p className="font-body text-xs text-on-surface-variant line-clamp-2 mb-4">{art.excerpt}</p>
                </div>
                <button
                  onClick={() => setSelectedArticle(art)}
                  className="text-xs font-label uppercase font-bold text-primary hover:text-gold-leaf inline-flex items-center gap-1"
                >
                  Read Full Guide <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
