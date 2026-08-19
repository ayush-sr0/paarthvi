import express from 'express';
import { query, get, run } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to log admin actions in audit_logs
const logAuditAction = async (req, action, entity, entity_id, prev_val = null, new_val = null) => {
  try {
    await run(
      `INSERT INTO audit_logs (admin_id, admin_email, action, entity, entity_id, prev_value_json, new_value_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user?.id || 0,
        req.user?.email || 'admin@parthvi.com',
        action,
        entity,
        String(entity_id),
        prev_val ? JSON.stringify(prev_val) : null,
        new_val ? JSON.stringify(new_val) : null,
      ]
    );
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
};

// =================== CMS Banners ===================

// GET /api/cms/banners — Public endpoint to get active banners for storefront
router.get('/banners', async (req, res, next) => {
  try {
    const banners = await query('SELECT * FROM cms_banners WHERE active = 1 ORDER BY display_order ASC, id DESC');
    res.json({ success: true, banners });
  } catch (err) {
    next(err);
  }
});

// GET /api/cms/admin/banners — Admin endpoint to list all banners (including inactive)
router.get('/admin/banners', requireAuth, requireRole(['SUPER_ADMIN', 'CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const banners = await query('SELECT * FROM cms_banners ORDER BY display_order ASC, id DESC');
    res.json({ success: true, banners });
  } catch (err) {
    next(err);
  }
});

// POST /api/cms/banners — Admin create banner
router.post('/banners', requireAuth, requireRole(['SUPER_ADMIN', 'CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const { title, subtitle, cta_text, cta_url, desktop_image, mobile_image, display_order, active } = req.body;

    if (!title || !desktop_image) {
      return res.status(400).json({ success: false, error: 'Banner title and desktop image are required' });
    }

    const result = await run(
      `INSERT INTO cms_banners (title, subtitle, cta_text, cta_url, desktop_image, mobile_image, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        subtitle || '',
        cta_text || 'Shop Now',
        cta_url || '/shop',
        desktop_image,
        mobile_image || desktop_image,
        display_order || 0,
        active !== undefined ? (active ? 1 : 0) : 1,
      ]
    );

    await logAuditAction(req, 'CREATE_BANNER', 'BANNER', result.lastID, null, { title });
    res.json({ success: true, banner_id: result.lastID, message: 'Hero banner created successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cms/banners/:id — Admin update banner
router.put('/banners/:id', requireAuth, requireRole(['SUPER_ADMIN', 'CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    const existing = await get('SELECT * FROM cms_banners WHERE id = ?', [bannerId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }

    const { title, subtitle, cta_text, cta_url, desktop_image, mobile_image, display_order, active } = req.body;

    await run(
      `UPDATE cms_banners
       SET title = ?, subtitle = ?, cta_text = ?, cta_url = ?, desktop_image = ?, mobile_image = ?, display_order = ?, active = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : existing.title,
        subtitle !== undefined ? subtitle : existing.subtitle,
        cta_text !== undefined ? cta_text : existing.cta_text,
        cta_url !== undefined ? cta_url : existing.cta_url,
        desktop_image !== undefined ? desktop_image : existing.desktop_image,
        mobile_image !== undefined ? mobile_image : existing.mobile_image,
        display_order !== undefined ? display_order : existing.display_order,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        bannerId,
      ]
    );

    await logAuditAction(req, 'UPDATE_BANNER', 'BANNER', bannerId, existing, req.body);
    res.json({ success: true, message: 'Banner updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cms/banners/:id — Admin delete banner
router.delete('/banners/:id', requireAuth, requireRole(['SUPER_ADMIN', 'CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    const existing = await get('SELECT * FROM cms_banners WHERE id = ?', [bannerId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }

    await run('DELETE FROM cms_banners WHERE id = ?', [bannerId]);
    await logAuditAction(req, 'DELETE_BANNER', 'BANNER', bannerId, existing, null);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
});

// =================== CMS Blog Posts ===================

// GET /api/cms/blog-posts — Public list of blog posts
router.get('/blog-posts', async (req, res, next) => {
  try {
    const posts = await query('SELECT * FROM blog_posts ORDER BY publish_date DESC, id DESC');
    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
});

// GET /api/cms/blog-posts/:slug — Public blog post detail
router.get('/blog-posts/:slug', async (req, res, next) => {
  try {
    const post = await get('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
});

// POST /api/cms/blog-posts — Admin create blog post
router.post('/blog-posts', requireAuth, requireRole(['SUPER_ADMIN', 'CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const { title, slug, cover_image, author, publish_date, category, content, excerpt, related_products_json, seo_title, seo_meta } = req.body;

    if (!title || !slug || !content || !cover_image) {
      return res.status(400).json({ success: false, error: 'Title, slug, content, and cover image are required' });
    }

    const existing = await get('SELECT id FROM blog_posts WHERE slug = ?', [slug]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Blog post with this slug already exists' });
    }

    const result = await run(
      `INSERT INTO blog_posts (title, slug, cover_image, author, publish_date, category, content, excerpt, related_products_json, seo_title, seo_meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        cover_image,
        author || 'Ayurvedic Advisory Panel',
        publish_date || new Date().toISOString().slice(0, 10),
        category || 'Wellness',
        content,
        excerpt || content.substring(0, 150) + '...',
        related_products_json ? JSON.stringify(related_products_json) : null,
        seo_title || title,
        seo_meta || excerpt || '',
      ]
    );

    await logAuditAction(req, 'CREATE_BLOG_POST', 'BLOG', result.lastID, null, { title, slug });
    res.json({ success: true, post_id: result.lastID, message: 'Blog post published successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cms/blog-posts/:id — Admin update blog post
router.put('/blog-posts/:id', requireAuth, requireRole(['SUPER_ADMIN', 'CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const postId = req.params.id;
    const existing = await get('SELECT * FROM blog_posts WHERE id = ?', [postId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    const { title, slug, cover_image, author, publish_date, category, content, excerpt, related_products_json, seo_title, seo_meta } = req.body;

    await run(
      `UPDATE blog_posts
       SET title = ?, slug = ?, cover_image = ?, author = ?, publish_date = ?, category = ?, content = ?, excerpt = ?, related_products_json = ?, seo_title = ?, seo_meta = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : existing.title,
        slug !== undefined ? slug : existing.slug,
        cover_image !== undefined ? cover_image : existing.cover_image,
        author !== undefined ? author : existing.author,
        publish_date !== undefined ? publish_date : existing.publish_date,
        category !== undefined ? category : existing.category,
        content !== undefined ? content : existing.content,
        excerpt !== undefined ? excerpt : existing.excerpt,
        related_products_json !== undefined ? JSON.stringify(related_products_json) : existing.related_products_json,
        seo_title !== undefined ? seo_title : existing.seo_title,
        seo_meta !== undefined ? seo_meta : existing.seo_meta,
        postId,
      ]
    );

    await logAuditAction(req, 'UPDATE_BLOG_POST', 'BLOG', postId, existing, req.body);
    res.json({ success: true, message: 'Blog post updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cms/blog-posts/:id — Admin delete blog post
router.delete('/blog-posts/:id', requireAuth, requireRole(['SUPER_ADMIN', 'CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const postId = req.params.id;
    const existing = await get('SELECT * FROM blog_posts WHERE id = ?', [postId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    await run('DELETE FROM blog_posts WHERE id = ?', [postId]);
    await logAuditAction(req, 'DELETE_BLOG_POST', 'BLOG', postId, existing, null);
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
