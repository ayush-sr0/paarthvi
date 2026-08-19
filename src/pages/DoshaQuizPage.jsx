import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/SEO';
import { Sparkles, CheckCircle, ArrowRight, RefreshCw, ShoppingBag, Leaf, Heart } from 'lucide-react';

export const DoshaQuizPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess } = useToast();

  const questions = [
    {
      id: 1,
      question: 'How would you describe your natural skin type & texture?',
      options: [
        { text: 'Dry, thin, fine pores, prone to roughness or chapping', dosha: 'VATA' },
        { text: 'Sensitive, warm, fair or flushed, prone to redness/acne', dosha: 'PITTA' },
        { text: 'Oily, smooth, thick, soft, moist, resistant to aging', dosha: 'KAPHA' },
      ],
    },
    {
      id: 2,
      question: 'What is your primary hair texture and scalp condition?',
      options: [
        { text: 'Dry, frizzy, coarse, brittle, or split ends', dosha: 'VATA' },
        { text: 'Fine, thin, oily scalp, early graying or hair thinning', dosha: 'PITTA' },
        { text: 'Thick, lustrous, wavy/curly, strong hair roots', dosha: 'KAPHA' },
      ],
    },
    {
      id: 3,
      question: 'How is your daily energy level and digestive appetite?',
      options: [
        { text: 'Irregular appetite, quick energy bursts followed by fatigue', dosha: 'VATA' },
        { text: 'Strong intense hunger, quick digestion, irritable if meals delayed', dosha: 'PITTA' },
        { text: 'Slow steady digestion, loves heavy foods, tends to store weight', dosha: 'KAPHA' },
      ],
    },
    {
      id: 4,
      question: 'What is your typical sleep pattern & climate preference?',
      options: [
        { text: 'Light/disturbed sleep, cold hands/feet, loves warm weather', dosha: 'VATA' },
        { text: 'Moderate sleep, easily overheated, prefers cool breezes', dosha: 'PITTA' },
        { text: 'Deep heavy sleep, struggles waking early, dislikes cold damp climate', dosha: 'KAPHA' },
      ],
    },
    {
      id: 5,
      question: 'How do you handle stress or mental pressure?',
      options: [
        { text: 'Anxiety, restlessness, overthinking, racing thoughts', dosha: 'VATA' },
        { text: 'Frustration, impatience, perfectionism, strong drive', dosha: 'PITTA' },
        { text: 'Calm, patient, deliberate, sometimes resistant to change', dosha: 'KAPHA' },
      ],
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);

  const handleSelectOption = (dosha) => {
    const updatedAnswers = [...answers, dosha];
    setAnswers(updatedAnswers);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate dominant dosha
      const counts = { VATA: 0, PITTA: 0, KAPHA: 0 };
      updatedAnswers.forEach(d => { counts[d] = (counts[d] || 0) + 1; });

      const total = updatedAnswers.length;
      const vataPct = Math.round((counts.VATA / total) * 100);
      const pittaPct = Math.round((counts.PITTA / total) * 100);
      const kaphaPct = Math.round((counts.KAPHA / total) * 100);

      let dominant = 'VATA';
      if (counts.PITTA > counts.VATA && counts.PITTA >= counts.KAPHA) dominant = 'PITTA';
      if (counts.KAPHA > counts.VATA && counts.KAPHA > counts.PITTA) dominant = 'KAPHA';

      setQuizResult({
        dominant,
        vataPct,
        pittaPct,
        kaphaPct,
      });
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizResult(null);
  };

  // Formulation recommendations based on dominant dosha
  const getRecommendations = (dosha) => {
    if (dosha === 'VATA') {
      return [
        { variantId: 1, name: 'Maha Bhringraj Hair Oil', desc: 'Deeply warm sesame & milk decoction to nourish dry roots & stop frizz.', price: 499 },
        { variantId: 5, name: 'Ashwagandha Vitality Rasayana', desc: 'Grounding adaptogen to soothe Vata anxiety & improve sleep quality.', price: 699 },
      ];
    } else if (dosha === 'PITTA') {
      return [
        { variantId: 4, name: 'Kumkumadi Radiance Face Elixir', desc: 'Cooling saffron & lotus seed oil to soothe redness & balance Pitta skin.', price: 899 },
        { variantId: 1, name: 'Kshirpak Herbal Hair Oil', desc: 'Cooling scalp treatment with Brahmi to calm heat & hair thinning.', price: 499 },
      ];
    } else {
      return [
        { variantId: 6, name: 'Himalayan Pure Shilajit Resin', desc: 'Purified mineral pitch to ignite slow Kapha metabolism & boost daily stamina.', price: 1299 },
        { variantId: 5, name: 'Triphala Digestive Churna', desc: 'Classic 3-fruit herbal blend to clear Kapha sluggishness & detoxify digestives.', price: 349 },
      ];
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      <SEO
        title="Ayurvedic Dosha Consultation & Quiz — Parthvi Ayurveda"
        description="Discover your unique Vata, Pitta, or Kapha Ayurvedic constitution and get personalized herbal formulation recommendations."
      />

      {/* Hero Header */}
      <div className="bg-primary text-on-primary rounded-2xl p-8 text-center space-y-3 relative overflow-hidden shadow-lg border border-gold-leaf/30">
        <div className="w-12 h-12 rounded-full bg-gold-leaf/20 text-gold-leaf flex items-center justify-center mx-auto mb-2">
          <Sparkles size={24} />
        </div>
        <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold">Ayurvedic Wisdom Engine</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Discover Your Prakriti (Dosha Profile)</h1>
        <p className="font-body text-xs md:text-sm text-on-primary/90 max-w-xl mx-auto leading-relaxed">
          Answer 5 simple lifestyle questions to identify your dominant Vata, Pitta, or Kapha dosha constitution and receive personalized herbal recommendations.
        </p>
      </div>

      {!quizResult ? (
        /* Quiz Active Card */
        <div className="bg-surface rounded-2xl border border-outline/20 p-6 md:p-10 space-y-6 max-w-2xl mx-auto shadow-md">
          {/* Progress Bar */}
          <div className="space-y-1 font-body text-xs">
            <div className="flex justify-between font-bold text-on-surface-variant">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Completed</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-gold-leaf h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="font-display text-xl font-bold text-primary">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3 pt-2">
            {questions[currentQuestion].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt.dosha)}
                className="w-full text-left p-4 rounded-xl border border-outline/20 hover:border-gold-leaf hover:bg-gold-leaf/5 transition-all text-xs font-body text-on-surface space-y-1 group"
              >
                <div className="flex items-center justify-between font-bold text-primary group-hover:text-gold-leaf">
                  <span>{opt.text}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Quiz Result & Personalized Recommendations */
        <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
          <div className="bg-surface rounded-2xl border border-gold-leaf p-8 space-y-6 text-center shadow-xl">
            <span className="font-label text-xs uppercase tracking-widest text-gold-leaf font-bold block">Your Ayurvedic Profile</span>
            <h2 className="font-display text-3xl font-bold text-primary">
              Dominant Constitution: <span className="text-gold-leaf">{quizResult.dominant} DOSHA</span>
            </h2>

            {/* Dosha Breakdown Bars */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-2 font-body text-xs">
              <div className="bg-surface-container p-3 rounded-xl border border-outline/20 space-y-1">
                <span className="font-bold text-primary block">VATA</span>
                <span className="font-display text-lg font-bold text-on-surface">{quizResult.vataPct}%</span>
              </div>
              <div className="bg-surface-container p-3 rounded-xl border border-outline/20 space-y-1">
                <span className="font-bold text-primary block">PITTA</span>
                <span className="font-display text-lg font-bold text-on-surface">{quizResult.pittaPct}%</span>
              </div>
              <div className="bg-surface-container p-3 rounded-xl border border-outline/20 space-y-1">
                <span className="font-bold text-primary block">KAPHA</span>
                <span className="font-display text-lg font-bold text-on-surface">{quizResult.kaphaPct}%</span>
              </div>
            </div>

            <p className="font-body text-xs text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              {quizResult.dominant === 'VATA' && 'Vata governs movement, circulation, and nervous activity. Balancing Vata requires warming, grounding, and deeply hydrating herbal lipid preparations.'}
              {quizResult.dominant === 'PITTA' && 'Pitta governs heat, metabolism, and transformation. Balancing Pitta requires cooling, soothing, and inflammation-balancing botanical oils.'}
              {quizResult.dominant === 'KAPHA' && 'Kapha governs structure, lubrication, and stability. Balancing Kapha requires invigorating, detoxifying, and metabolic-stimulating Rasayana herbs.'}
            </p>

            <button onClick={handleResetQuiz} className="border border-outline/30 text-on-surface font-label text-xs uppercase font-bold px-4 py-2 rounded-full inline-flex items-center gap-1 hover:bg-surface-container">
              <RefreshCw size={14} /> Retake Assessment
            </button>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-primary text-center">
              Recommended Formulations for Your Constitution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getRecommendations(quizResult.dominant).map((item, idx) => (
                <div key={idx} className="bg-surface p-6 rounded-2xl border border-outline/20 space-y-3 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="font-label text-[10px] font-bold uppercase text-gold-leaf">Targeted {quizResult.dominant} Remedy</span>
                    <h4 className="font-display text-base font-bold text-primary">{item.name}</h4>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-outline/10 flex items-center justify-between">
                    <span className="font-display text-base font-bold text-primary">₹{item.price}</span>
                    <button
                      onClick={() => {
                        addToCart(item.variantId, 1);
                        showSuccess(`Added ${item.name} to cart!`);
                      }}
                      className="bg-primary text-on-primary font-label text-xs uppercase font-bold px-4 py-2 rounded-full hover:bg-primary-container inline-flex items-center gap-1"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
