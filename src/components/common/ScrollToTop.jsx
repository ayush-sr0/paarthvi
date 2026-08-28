import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Disable automatic browser scroll restoration globally
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

/**
 * ScrollToTop Component
 * Resets window scroll to top (0,0) on navigation while canceling pending delayed timers
 * if the user manually initiates a scroll.
 */
export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    let canceled = false;
    let timer1, timer2, timer3;

    const cancelDelayedTimers = () => {
      canceled = true;
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
    };

    const scrollToTop = () => {
      if (canceled) return;
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    // 1. Immediate navigation scroll reset
    scrollToTop();

    // 2. Delayed timers for layout shifts
    timer1 = setTimeout(scrollToTop, 50);
    timer2 = setTimeout(scrollToTop, 150);
    timer3 = setTimeout(scrollToTop, 350);

    // Cancel delayed timers if user scrolls manually
    const handleScroll = () => {
      if (window.scrollY > 10 || (document.documentElement && document.documentElement.scrollTop > 10)) {
        cancelDelayedTimers();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', cancelDelayedTimers, { passive: true });
    window.addEventListener('touchmove', cancelDelayedTimers, { passive: true });

    return () => {
      cancelDelayedTimers();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', cancelDelayedTimers);
      window.removeEventListener('touchmove', cancelDelayedTimers);
    };
  }, [pathname, search, hash]);

  return null;
};
