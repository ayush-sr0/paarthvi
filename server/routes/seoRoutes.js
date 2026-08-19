import express from 'express';
import { query } from '../db/database.js';

const router = express.Router();

// GET /sitemap.xml — Dynamic XML Sitemap Generator
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = process.env.BASE_URL || 'https://parthvi.com';

    // Fetch active products
    const products = await query("SELECT slug, updated_at FROM products WHERE status = 'PUBLISHED'");
    // Fetch blog posts
    const posts = await query("SELECT slug, created_at FROM blog_posts");

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/shop', priority: '0.9', changefreq: 'daily' },
      { url: '/wellness-knowledge', priority: '0.8', changefreq: 'weekly' },
      { url: '/account', priority: '0.5', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Product Pages
    for (const p of products) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/product/${p.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(p.updated_at || Date.now()).toISOString().slice(0, 10)}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Blog Pages
    for (const post of posts) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(post.created_at || Date.now()).toISOString().slice(0, 10)}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// GET /robots.txt — Robots Control File
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://parthvi.com';

  const content = `User-agent: *
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.send(content);
});

export default router;
