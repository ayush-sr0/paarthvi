import React, { useEffect } from 'react';

/**
 * SEO & Structured Data (JSON-LD) Component
 * Dynamically injects title, meta description, Open Graph tags, and JSON-LD schema into document head.
 */
export const SEO = ({
  title = 'Parthvi Ayurveda — Authentic Herbal Remedies & Modern Wellness',
  description = 'Discover sacred Ayurvedic formulations, Himalayan Shilajit, Kshirpak hair oils, and organic wellness rasayanas crafted to harmonize body, mind, and spirit.',
  image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkIoC79wqGR-6Vhm8oo35VT590u1_5XFguygcZr8AyxLW4VzQ5NVW5DMwpthxTb6vmn_kPPb2PEoRcLE60GmOsdsZsuYbjY15z_XvrPLQ_ieJxA3z3LlmtVq4UeQEFgUMmtuKBOBNOOWXExk1aPjCJZvaQCIy0WVxuKJh8W8X8d0sPj3jo5y2LzMD8bTuQUVPgp90TRBDqUtUnB99B90lDEXdQa_U38Btqy2vdqmDTenXyEJ5cQ08TWg',
  url = window.location.href,
  schema = null,
}) => {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper: update or create meta tag
    const updateMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Meta description & Open Graph
    updateMeta('description', description);
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:url', url, 'property');

    // 3. JSON-LD Structured Data Schema
    let scriptEl = document.getElementById('json-ld-schema');
    if (schema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'json-ld-schema';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schema);
    } else if (scriptEl) {
      scriptEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Parthvi Ayurveda',
        url: 'https://parthvi.com',
        logo: 'https://parthvi.com/logo.png',
        sameAs: ['https://instagram.com/ParthviAyurveda'],
      });
    }

    return () => {
      // Clean up script on unmount
      if (scriptEl) {
        scriptEl.textContent = '';
      }
    };
  }, [title, description, image, url, schema]);

  return null;
};
