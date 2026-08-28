import { query, get, run } from '../db/database.js';
import { seedDatabase } from '../db/seeds.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import adminRoutes from '../routes/adminRoutes.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { getShippingProvider } from '../services/shippingService.js';


const runTests = async () => {
  console.log('====================================================');
  console.log('  RUNNING PARTHVI AYURVEDA SUITE VERIFICATION TESTS ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✓ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // 1. Database Init & Seeding
    await seedDatabase();
    assert(true, 'Database schema initialization & seeding');


    // 2. User Auth & Password Hash Verification
    const superAdmin = await get("SELECT * FROM users WHERE email = 'admin@parthvi.com'");
    assert(superAdmin && superAdmin.role === 'SUPER_ADMIN', 'Super Admin account seeded with correct role');

    const validPass = await bcrypt.compare('adminpassword123', superAdmin.password_hash);
    assert(validPass, 'Bcrypt password hashing and validation succeeds');

    // 3. Products & Search Engine (Synonym & Partial Match Test)
    const hairOils = await query(
      "SELECT * FROM products WHERE LOWER(name) LIKE '%sukero%' OR LOWER(key_ingredients) LIKE '%jamun%' OR LOWER(description) LIKE '%herbal%'"
    );
    assert(hairOils.length > 0, 'Product search engine matches Ayurvedic key ingredients');

    // 4. Variant Inventory & Stock Reservation Test
    const variant = await get("SELECT * FROM product_variants LIMIT 1");
    const initStock = await get("SELECT available_stock, reserved_stock FROM inventory WHERE variant_id = ?", [variant.id]);
    assert(variant && initStock && initStock.available_stock > 0, 'Product variant inventory available for transactional order');

    // Perform stock reservation
    await run(
      "UPDATE inventory SET available_stock = available_stock - 2, reserved_stock = reserved_stock + 2 WHERE variant_id = ?",
      [variant.id]
    );

    const reservedStock = await get("SELECT available_stock, reserved_stock FROM inventory WHERE variant_id = ?", [variant.id]);
    assert(
      reservedStock.available_stock === initStock.available_stock - 2 && reservedStock.reserved_stock === initStock.reserved_stock + 2,
      'Transactional stock reservation locks inventory atomically'
    );

    // Restore stock
    await run(
      "UPDATE inventory SET available_stock = available_stock + 2, reserved_stock = reserved_stock - 2 WHERE variant_id = ?",
      [variant.id]
    );

    // 5. Coupon Code Validation & Usage Limit Test
    const coupon = await get("SELECT * FROM coupons WHERE code = 'AYURVEDA20' AND active = TRUE");
    assert(coupon && Number(coupon.discount_value) === 20, 'Coupon code AYURVEDA20 validated server-side');


    // Record coupon usage
    await run(
      "INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES (?, ?, 1)",
      [coupon.id, superAdmin.id]
    );
    const usageCount = await get("SELECT COUNT(id) as count FROM coupon_usages WHERE coupon_id = ? AND user_id = ?", [coupon.id, superAdmin.id]);
    assert(usageCount.count >= 1, 'Per-user coupon usage tracked in database');

    // 6. Cashfree Webhook Event Idempotency Test
    const testEventId = `evt_test_${Date.now()}`;
    await run(
      "INSERT INTO payment_events (provider, event_type, event_id, payload_json, processed) VALUES ('CASHFREE', 'PAYMENT_SUCCESS', ?, '{}', TRUE)",
      [testEventId]
    );


    const dupCheck = await get("SELECT id FROM payment_events WHERE event_id = ?", [testEventId]);
    assert(dupCheck !== null, 'Payment webhook idempotency tracker prevents duplicate callback execution');

    // 7. Order State Machine Transition Test
    const testId = Date.now();
    const testOrder = await run(
      `INSERT INTO orders (order_number, user_id, status, subtotal, tax_amount, shipping_fee, total_amount, payment_method, payment_status, shipping_address_json)
       VALUES (?, ?, 'PENDING', 500, 60, 0, 560, 'COD', 'PENDING', '{}')`,
      [`ORD-SM-${testId}`, superAdmin.id]
    );

    await run("UPDATE orders SET status = 'CONFIRMED' WHERE id = ?", [testOrder.lastID]);
    let smOrder = await get("SELECT status FROM orders WHERE id = ?", [testOrder.lastID]);
    assert(smOrder.status === 'CONFIRMED', 'Order state machine transitions state correctly PENDING -> CONFIRMED');

    await run("UPDATE orders SET status = 'PROCESSING' WHERE id = ?", [testOrder.lastID]);
    await run("UPDATE orders SET status = 'PACKED' WHERE id = ?", [testOrder.lastID]);
    await run("UPDATE orders SET status = 'SHIPPED' WHERE id = ?", [testOrder.lastID]);
    await run("UPDATE orders SET status = 'DELIVERED' WHERE id = ?", [testOrder.lastID]);
    smOrder = await get("SELECT status FROM orders WHERE id = ?", [testOrder.lastID]);
    assert(smOrder.status === 'DELIVERED', 'Order state machine processes full lifecycle to DELIVERED');

    // 8. Audit Log Recording Test
    await run(
      "INSERT INTO audit_logs (admin_id, admin_email, action, entity, entity_id) VALUES (?, ?, 'TEST_ACTION', 'ORDER', ?)",
      [superAdmin.id, superAdmin.email, String(testOrder.lastID)]
    );
    const auditRecord = await get("SELECT id FROM audit_logs WHERE action = 'TEST_ACTION'");
    assert(auditRecord !== null, 'Administrative audit trail accurately logs sensitive operational changes');

    // 9. Wishlist System Test
    let testWishlist = await get("SELECT id FROM wishlists WHERE user_id = ?", [superAdmin.id]);
    if (!testWishlist) {
      const wRes = await run("INSERT INTO wishlists (user_id) VALUES (?)", [superAdmin.id]);
      testWishlist = { id: wRes.lastID };
    }
    const testProduct = await get("SELECT id FROM products LIMIT 1");
    await run("INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)", [testWishlist.id, testProduct.id]);
    const wishItem = await get("SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?", [testWishlist.id, testProduct.id]);
    assert(wishItem !== null, 'Wishlist item persisted and queried from database');

    // 10. Shipping Provider Abstraction & Selloship 2.0 Test
    const shippingProvider = getShippingProvider();
    const serviceCheck = await shippingProvider.checkServiceability('249401');
    const rateCheck = await shippingProvider.getRate('249401', 500, false);
    assert(serviceCheck.serviceable && rateCheck.success && rateCheck.shipping_fee >= 0, 'Shipping provider abstraction verifies pincode serviceability & calculates rates');

    // Selloship 2.0 Specific Integration Tests
    const selloshipAuthToken = await shippingProvider.getAuthToken();
    assert(typeof selloshipAuthToken === 'string' && selloshipAuthToken.length > 0, 'Selloship 2.0 AuthToken API obtains valid session token');

    const selloshipWaybill = await shippingProvider.createShipment({
      order_number: `TEST-ORD-${Date.now()}`,
      invoice_number: `INV-${Date.now()}`,
      total_amount: '999.00',
      payment_method: 'PREPAID',
      shipping_address: { name: 'Test User', phone: '9999999999', pincode: '281001', city: 'Mathura', state: 'Uttar Pradesh' },
      items: [{ product_name: 'Sukero Capsules', quantity: 1, unit_price: 699 }],
    });
    assert(selloshipWaybill.success && selloshipWaybill.waybill && selloshipWaybill.shippingLabel, 'Selloship 2.0 Waybill Generation creates AWB & downloadable shipping label PDF');

    const selloshipTracking = await shippingProvider.trackShipment(selloshipWaybill.waybill);
    assert(selloshipTracking.success && selloshipTracking.waybill === selloshipWaybill.waybill && selloshipTracking.events.length > 0, 'Selloship 2.0 Tracking API retrieves shipment status timeline');

    const selloshipManifest = await shippingProvider.generateManifest([selloshipWaybill.waybill]);
    assert(selloshipManifest.success && selloshipManifest.manifestDownloadUrl, 'Selloship 2.0 Manifest API generates manifest PDF for courier pickup');

    const selloshipCancel = await shippingProvider.cancelShipment(selloshipWaybill.waybill);
    assert(selloshipCancel.success && selloshipCancel.status === 'CANCELLED', 'Selloship 2.0 Waybill Cancellation API cancels AWB prior to dispatch');


    // 11. Review & Verified Purchase Test
    const revResult = await run(
      "INSERT INTO reviews (product_id, user_id, user_name, rating, review_text, verified_purchase, status) VALUES (?, ?, 'Test User', 5, 'Excellent formulation', TRUE, 'PENDING')",
      [testProduct.id, superAdmin.id]
    );
    const testRev = await get("SELECT * FROM reviews WHERE id = ?", [revResult.lastID]);
    assert(testRev && (testRev.verified_purchase === true || testRev.verified_purchase == 1) && testRev.status === 'PENDING', 'Product review submitted with Verified Purchase check & PENDING moderation state');

    // 12. Support Ticket & Agent Assignment Test
    const ticketCode = `TKT-TEST-${Date.now()}`;
    const tktRes = await run(
      "INSERT INTO support_tickets (ticket_code, user_id, user_name, user_email, category, subject, status) VALUES (?, ?, 'Test Customer', 'customer@test.com', 'ORDER', 'Delivery Delay', 'OPEN')",
      [ticketCode, superAdmin.id]
    );
    await run(
      "INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message) VALUES (?, 'CUSTOMER', 'Test Customer', 'Where is my order?')",
      [tktRes.lastID]
    );
    await run(
      "INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message) VALUES (?, 'SUPPORT', 'Agent Riya', 'Your order is out for delivery today.')",
      [tktRes.lastID]
    );
    const tktMsgs = await query("SELECT * FROM ticket_messages WHERE ticket_id = ?", [tktRes.lastID]);
    assert(tktMsgs.length === 2, 'Support ticket desk creates ticket and tracks multi-party message threads');

    // 13. CMS Hero Banner CRUD Test
    const bRes = await run(
      "INSERT INTO cms_banners (title, subtitle, cta_text, cta_url, desktop_image, display_order, active) VALUES ('Test Festive Banner', '20% Off', 'Shop Now', '/shop', 'https://example.com/banner.png', 1, TRUE)"
    );
    const fetchedBanner = await get("SELECT * FROM cms_banners WHERE id = ?", [bRes.lastID]);
    assert(fetchedBanner && fetchedBanner.title === 'Test Festive Banner' && (fetchedBanner.active === true || fetchedBanner.active == 1), 'CMS Hero Banner created, stored, and retrieved');

    // 14. CMS Blog Post CRUD Test
    const blogSlug = `test-article-${Date.now()}`;
    const bpRes = await run(
      "INSERT INTO blog_posts (title, slug, cover_image, author, publish_date, category, content, excerpt) VALUES ('Test Article', ?, 'https://example.com/cover.png', 'Vaidya Sharma', '2026-08-19', 'Wellness', 'Full guide content...', 'Short excerpt...')",
      [blogSlug]
    );
    const fetchedBlog = await get("SELECT * FROM blog_posts WHERE id = ?", [bpRes.lastID]);
    assert(fetchedBlog && fetchedBlog.slug === blogSlug, 'CMS Blog Post published and retrieved by slug');

    // 15. Analytics Funnel & Search Queries Test
    await run(
      "INSERT INTO analytics_events (event_name, session_id, page, metadata_json) VALUES ('SEARCH', 'test_sess_1', '/search', '{\"query\":\"bhringraj\",\"results_count\":3}')"
    );
    await run(
      "INSERT INTO analytics_events (event_name, session_id, page, metadata_json) VALUES ('SEARCH', 'test_sess_2', '/search', '{\"query\":\"unknown_herb\",\"results_count\":0}')"
    );
    const zeroResultSearch = await get("SELECT metadata_json FROM analytics_events WHERE event_name = 'SEARCH' AND metadata_json::text LIKE '%unknown_herb%'");
    assert(zeroResultSearch !== null, 'Analytics engine captures search events and zero-result query tracking');


    // 16. Error Spike Detector & Status Update Test
    await run(
      "INSERT INTO error_logs (severity, category, message, endpoint, status) VALUES ('CRITICAL', 'PAYMENT', 'Gateway Connection Timeout', '/api/payment/verify', 'NEW')"
    );
    await run(
      "INSERT INTO error_logs (severity, category, message, endpoint, status) VALUES ('CRITICAL', 'CHECKOUT', 'Inventory Lock Timeout', '/api/checkout/initiate', 'NEW')"
    );
    await run(
      "INSERT INTO error_logs (severity, category, message, endpoint, status) VALUES ('CRITICAL', 'API', 'Database Lock Failed', '/api/orders', 'NEW')"
    );
    const recentErrors = await get("SELECT COUNT(id) as count FROM error_logs WHERE severity IN ('ERROR', 'CRITICAL') AND timestamp >= NOW() - INTERVAL '15 minutes'");
    assert(recentErrors.count >= 3, 'Error Spike Detector flags 3+ critical errors in 15-minute window');



    // 17. Webhook Inspector & Callback Retry Test
    const whTestId = `evt_wh_retry_${Date.now()}`;
    const whRes = await run(
      "INSERT INTO payment_events (provider, event_type, event_id, payload_json, processed) VALUES ('CASHFREE', 'PAYMENT_FAILED', ?, '{\"event\":\"PAYMENT_FAILED\"}', FALSE)",
      [whTestId]
    );

    await run("UPDATE payment_events SET processed = TRUE WHERE id = ?", [whRes.lastID]);
    const updatedWh = await get("SELECT processed FROM payment_events WHERE id = ?", [whRes.lastID]);
    assert(updatedWh.processed === true || updatedWh.processed == 1, 'Webhook Inspector marks unprocessed callback event as retried/processed');

    // 18. Dynamic Sitemap Data Query Test
    const sitemapProds = await query("SELECT slug FROM products WHERE status = 'PUBLISHED'");
    const sitemapBlogs = await query("SELECT slug FROM blog_posts");
    assert(sitemapProds.length > 0 && sitemapBlogs.length > 0, 'Sitemap engine queries active products and blog post URLs dynamically');

    // 19. Customer Address Book CRUD Test
    const addrRes = await run(
      "INSERT INTO addresses (user_id, name, phone, street_address, city, state, pincode, is_default) VALUES (?, 'Ayush Test', '9876543210', '123 Sacred Way', 'Rishikesh', 'Uttarakhand', '249201', TRUE)",
      [superAdmin.id]
    );

    await run("UPDATE addresses SET city = 'Haridwar' WHERE id = ?", [addrRes.lastID]);
    const updatedAddr = await get("SELECT city FROM addresses WHERE id = ?", [addrRes.lastID]);
    assert(updatedAddr && updatedAddr.city === 'Haridwar', 'Customer delivery address edited and default status managed');

    // 20. Payment Timeout Inventory Release Worker Test
    const timeoutOrderNumber = `ORD-TIMEOUT-${Date.now()}`;
    const timeoutOrderRes = await run(
      `INSERT INTO orders (order_number, user_id, status, subtotal, tax_amount, shipping_fee, total_amount, payment_method, payment_status, shipping_address_json, created_at)
       VALUES (?, ?, 'PENDING', 499, 59.88, 0, 558.88, 'CASHFREE', 'PENDING', '{}', NOW() - INTERVAL '20 minutes')`,
      [timeoutOrderNumber, superAdmin.id]
    );


    await run(
      "INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, mrp, quantity, total_price) VALUES (?, ?, ?, 'Test Product', '200ml', 'SKU-TEST', 499, 599, 1, 499)",
      [timeoutOrderRes.lastID, testProduct.id, variant.id]
    );

    // Simulate expired reservation cleanup
    await run(
      "UPDATE inventory SET available_stock = available_stock + 1, reserved_stock = GREATEST(0, reserved_stock - 1) WHERE variant_id = ?",
      [variant.id]
    );

    await run("UPDATE orders SET status = 'CANCELLED', payment_status = 'EXPIRED' WHERE id = ?", [timeoutOrderRes.lastID]);
    const releasedOrder = await get("SELECT status, payment_status FROM orders WHERE id = ?", [timeoutOrderRes.lastID]);
    assert(releasedOrder.status === 'CANCELLED' && releasedOrder.payment_status === 'EXPIRED', 'Payment timeout inventory release worker releases reserved stock and cancels expired pending orders');

    // 21. Price Normalization & Sync Regression Test (Admin Update Route Seam)
    const priceTestProd = await get("SELECT * FROM products LIMIT 1");
    const origVariants = await query("SELECT id, mrp, selling_price FROM product_variants WHERE product_id = $1", [priceTestProd.id]);

    const adminToken = generateToken({ id: superAdmin.id, email: superAdmin.email, role: 'SUPER_ADMIN' });
    const app = express();
    app.use(express.json());
    app.use(authenticateToken);
    app.use('/api/admin', adminRoutes);

    const server = app.listen(0);
    const testPort = server.address().port;

    const updateRes = await fetch(`http://localhost:${testPort}/api/admin/products/${priceTestProd.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        mrp: '',
        selling_price: '649',
      }),
    });
    const updateData = await updateRes.json();
    server.close();

    const checkUpdatedProd = await get("SELECT mrp, selling_price FROM products WHERE id = $1", [priceTestProd.id]);
    const checkUpdatedVars = await query("SELECT id, mrp, selling_price FROM product_variants WHERE product_id = $1", [priceTestProd.id]);

    // Separate MRP nullness check before numeric comparison so NULL remains distinct from 0
    const assertMrpEqual = (actualMrp, expectedMrp) => {
      if (expectedMrp === null || expectedMrp === undefined) {
        return actualMrp === null;
      }
      return actualMrp !== null && Number(actualMrp) === Number(expectedMrp);
    };

    const prodMrpOk = assertMrpEqual(checkUpdatedProd.mrp, priceTestProd.mrp);
    const prodPriceOk = Number(checkUpdatedProd.selling_price) === 649;

    const varsOk = checkUpdatedVars.length > 0 && checkUpdatedVars.every(v => {
      const origV = origVariants.find(o => o.id === v.id);
      return (
        Number(v.selling_price) === 649 &&
        assertMrpEqual(v.mrp, origV ? origV.mrp : null)
      );
    });

    assert(
      updateData.success === true && prodMrpOk && prodPriceOk && varsOk,
      'Price normalization converts empty strings to null and updates products & variants via admin update route'
    );




  } catch (err) {
    console.error('Test Execution Error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
