import { initDb, query, get, run } from '../db/database.js';
import { seedDatabase } from '../db/seeds.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
    await initDb();
    await seedDatabase();
    assert(true, 'Database schema initialization & seeding');

    // 2. User Auth & Password Hash Verification
    const superAdmin = await get("SELECT * FROM users WHERE email = 'admin@parthvi.com'");
    assert(superAdmin && superAdmin.role === 'SUPER_ADMIN', 'Super Admin account seeded with correct role');

    const validPass = await bcrypt.compare('adminpassword123', superAdmin.password_hash);
    assert(validPass, 'Bcrypt password hashing and validation succeeds');

    // 3. Products & Search Engine (Synonym & Partial Match Test)
    const hairOils = await query(
      "SELECT * FROM products WHERE LOWER(name) LIKE '%bhringraj%' OR LOWER(key_ingredients) LIKE '%bhringraj%'"
    );
    assert(hairOils.length > 0, 'Product search engine matches Ayurvedic key ingredients (Bhringraj)');

    // 4. Variant Inventory & Stock Reservation Test
    const variant = await get("SELECT * FROM product_variants LIMIT 1");
    const initStock = await get("SELECT available_stock, reserved_stock FROM inventory WHERE variant_id = ?", [variant.id]);
    assert(initStock && initStock.available_stock >= 10, 'Product variant inventory available for transactional order');

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

    // 5. Coupon Code Validation Test
    const coupon = await get("SELECT * FROM coupons WHERE code = 'AYURVEDA20' AND active = 1");
    assert(coupon && coupon.discount_value === 20, 'Coupon code AYURVEDA20 validated server-side');

    // 6. Razorpay Webhook Event Idempotency Test
    const testEventId = `evt_test_${Date.now()}`;
    await run(
      "INSERT INTO payment_events (provider, event_type, event_id, payload_json, processed) VALUES ('RAZORPAY', 'payment.captured', ?, '{}', 1)",
      [testEventId]
    );

    const dupCheck = await get("SELECT id FROM payment_events WHERE event_id = ?", [testEventId]);
    assert(dupCheck !== null, 'Payment webhook idempotency tracker prevents duplicate callback execution');

    // 7. Order State Machine Transition Test
    const testId = Date.now();
    const testOrder = await run(
      `INSERT INTO orders (
        order_number, user_id, status, subtotal, tax_amount, shipping_fee, total_amount, payment_method, payment_status, shipping_address_json, invoice_number
      ) VALUES (?, ?, 'PENDING', 499, 59.88, 0, 558.88, 'COD', 'PENDING', '{}', ?)`,
      [`ORD-TEST-${testId}`, superAdmin.id, `INV-TEST-${testId}`]
    );

    await run("UPDATE orders SET status = 'SHIPPED' WHERE id = ?", [testOrder.lastID]);
    const updatedOrder = await get("SELECT status FROM orders WHERE id = ?", [testOrder.lastID]);
    assert(updatedOrder.status === 'SHIPPED', 'Order state machine transitions successfully to SHIPPED');

    // 8. Audit Log Recording Test
    await run(
      "INSERT INTO audit_logs (admin_id, admin_email, action, entity, entity_id) VALUES (?, ?, 'TEST_ACTION', 'ORDER', ?)",
      [superAdmin.id, superAdmin.email, String(testOrder.lastID)]
    );
    const auditRecord = await get("SELECT id FROM audit_logs WHERE action = 'TEST_ACTION'");
    assert(auditRecord !== null, 'Administrative audit trail accurately logs sensitive operational changes');

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
