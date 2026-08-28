import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { run, get, query } from './database.js';

export const seedDatabase = async () => {
  // Repair any existing product statuses & add shipping columns.
  // Each statement runs independently so one failure doesn't block later migrations.
  const migrations = [
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS target_dosha VARCHAR(100) DEFAULT 'TRIDOSAHIC'",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill VARCHAR(100)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_url TEXT",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS manifest_url TEXT",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(50)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_address_id VARCHAR(50)",
    "ALTER TABLE batches DROP CONSTRAINT IF EXISTS batches_product_id_fkey, ADD CONSTRAINT batches_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE",
    "ALTER TABLE batches DROP CONSTRAINT IF EXISTS batches_variant_id_fkey, ADD CONSTRAINT batches_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE",
    "ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_variant_id_fkey, ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE",
    "ALTER TABLE inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_variant_id_fkey, ADD CONSTRAINT inventory_transactions_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE",
    "ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL, DROP CONSTRAINT IF EXISTS order_items_product_id_fkey, ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL",
    "ALTER TABLE order_items ALTER COLUMN variant_id DROP NOT NULL, DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey, ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL",
    "ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_order_id_fkey, ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE",
  ];




  for (const sql of migrations) {
    try {
      await run(sql);
    } catch (err) {
      console.warn(`[seeds] Migration skipped ("${sql.slice(0, 60)}..."): ${err.message}`);
    }
  }



  console.log('Seeding Paarthvi Ayurveda authentic products...');

  let superAdminId, demoCustomerId;
  const existingAdmin = await get("SELECT * FROM users WHERE email = 'admin@parthvi.com'");
  if (!existingAdmin) {
    const adminPass = await bcrypt.hash('adminpassword123', 10);
    const orderPass = await bcrypt.hash('orderpassword123', 10);
    const customerPass = await bcrypt.hash('customer123', 10);

    const superAdmin = await run(
      "INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      ['Super Admin', 'admin@parthvi.com', adminPass, '+91 9876543210', 'SUPER_ADMIN']
    );
    superAdminId = superAdmin.lastID;

    await run(
      "INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5)",
      ['Order Manager', 'orders@parthvi.com', orderPass, '+91 9876543211', 'ORDER_MANAGER']
    );

    const demoCustomer = await run(
      "INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      ['Ayush Sharma', 'ayush@example.com', customerPass, '+91 9988776655', 'CUSTOMER']
    );
    demoCustomerId = demoCustomer.lastID;

    await run(
      "INSERT INTO addresses (user_id, name, phone, street_address, city, state, pincode, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)",
      [demoCustomerId, 'Ayush Sharma', '+91 9988776655', '42 Vrindavan Gardens, Near ISKCON Temple', 'Mathura', 'Uttar Pradesh', '281001']
    );
  }

  // 2. Categories
  const categoriesData = [
    { name: 'Hair Care', slug: 'hair-care', image: '/products/hair-xl.jpg', description: 'Nourishing botanical hair oils, herbal shampoos, and scalp revitalizers' },
    { name: 'Nutrition & Supplements', slug: 'nutrition-supplements', image: '/products/gain-up.jpg', description: 'Pure herbal formulations, Chyawanprash, vitality boosters, and wellness capsules' },
    { name: 'Herbal Wellness', slug: 'herbal-wellness', image: '/products/sukero.jpg', description: 'Time-tested Ayurvedic herbs for immunity, stress relief, and holistic health' },
    { name: 'Daily Wellness', slug: 'daily-wellness', image: '/products/chyawanprash.jpg', description: 'Essential herbal teas, kadhas, and natural digestive elixirs' },
    { name: 'Personal Care', slug: 'personal-care', image: '/products/joint-support.jpg', description: 'Organic soaps, ubtan body scrubs, Kumkumadi facial oils, and rose water' },
    { name: "Men's Wellness", slug: 'mens-wellness', image: '/products/shilajit-resin.jpg', description: 'Vigour boosters, stamina rasayanas, and beard care oils' },
    { name: "Women's Wellness", slug: 'womens-wellness', image: '/products/thyro-pro.jpg', description: 'Hormonal balance syrups, glow rasayanas, and post-natal care' },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    let existingCat = await get("SELECT id FROM categories WHERE slug = $1", [c.slug]);
    if (!existingCat) {
      existingCat = await run(
        "INSERT INTO categories (name, slug, image, description, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [c.name, c.slug, c.image, c.description, Object.keys(catMap).length + 1]
      );
      catMap[c.slug] = existingCat.lastID;
    } else {
      await run("UPDATE categories SET image = $1, description = $2 WHERE id = $3", [c.image, c.description, existingCat.id]);
      catMap[c.slug] = existingCat.id;
    }
  }


  // Clear old products to avoid duplicates when re-seeding
  await run('DELETE FROM product_images');
  await run('DELETE FROM inventory_transactions');
  await run('DELETE FROM inventory');
  await run('DELETE FROM batches');
  await run('DELETE FROM order_items');
  await run('DELETE FROM payments');
  await run('DELETE FROM orders');
  await run('DELETE FROM product_variants');
  await run('DELETE FROM products');




  // 3. Products
  const productsData = [
    {
      name: 'Sukero Capsules (Diabetes Management)',
      slug: 'sukero-diabetes-management',
      cat: 'herbal-wellness',
      mrp: 899, price: 699, featured: true, bestseller: true, is_new: false,
      image: '/products/sukero.jpg',
      images: ['/products/sukero-2.jpg'],
      short_desc: '100% Natural & Vegetarian Ayurvedic Capsules for Blood Sugar Management & Insulin Support.',
      description: 'Sukero Capsules combine 15 potent Ayurvedic botanicals including Jamun Seeds, Karela, Gudmar, Vijaysar, and Methi to help manage blood sugar levels, support insulin function, and boost metabolic energy.',
      ingredients: 'Jamun Seeds 30mg, Neem 50mg, Tulsi 50mg, Ashwagandha 60mg, Bael Leaves 40mg, Vijaysar 60mg, Methi 60mg, Saunf 70mg, Gudmar 60mg, Harshringara 30mg, Karela 70mg, Manjeeth 50mg, Chiraita 70mg, Shatavari 30mg, Dalchini 20mg (Total 700mg per capsule).',
      key_ingredients: 'Jamun Seeds, Karela, Gudmar, Vijaysar, Neem & Ashwagandha',
      benefits: 'Helps in blood sugar management, supports healthy insulin function, boosts energy & stamina, improves digestion & metabolism.',
      usage_directions: 'Take 1 capsule twice daily after meals with water, or as directed by a physician.',
      warnings: 'Consult a physician before use if pregnant or nursing.',
      storage_info: 'Store in a cool, dry place away from direct sunlight.',
      net_qty: '60 Capsules',
      target_dosha: 'KAPHA',
      manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd, Gaur City Center, Greater Noida, Uttar Pradesh - 201318.',


      variants: [
        { sku: 'SUKERO-60CAP', attrName: 'Pack Size', attrVal: '60 Capsules Bottle', mrp: 899, price: 699, stock: 150 },
        { sku: 'SUKERO-120CAP', attrName: 'Pack Size', attrVal: '120 Capsules Value Pack', mrp: 1599, price: 1249, stock: 80 },
      ]
    },
    {
      name: 'Thyro Pro Capsules (Thyroid Management)',
      slug: 'thyro-pro-thyroid-management',
      cat: 'nutrition-supplements',
      mrp: 999, price: 749, featured: true, bestseller: true, is_new: false,
      image: '/products/thyro-pro.jpg',
      images: ['/products/thyro-pro-2.jpg'],
      short_desc: '100% Natural & Vegetarian Capsules supporting optimal thyroid gland functioning & hormonal balance.',
      description: 'Formulated with classical herbs such as Kachnar, Sharpunkha, Giloy, and Anantamul, Thyro Pro helps balance thyroid hormone levels, boost sluggish metabolism, and reduce body fatigue.',
      ingredients: 'Kachnar 60mg, Sharpunkha 60mg, Giloy 60mg, Punarnava 60mg, Bharangi 70mg, Anantamul 70mg, Shatavari 70mg, Ashwagandha 70mg, Kaiphal 70mg (Total 580mg per capsule).',
      key_ingredients: 'Kachnar, Giloy, Anantamul, Punarnava, Shatavari & Ashwagandha',
      benefits: 'Supports optimal thyroid health, balances hormones, boosts metabolism, enhances energy levels, stress support.',
      usage_directions: 'Take 1 capsule twice daily after meals with lukewarm water, or as directed by an Ayurvedic physician.',
      warnings: 'Store in a cool dry place.',
      storage_info: 'Store in a cool, dry place away from direct sunlight.',
      net_qty: '60 Capsules',
      target_dosha: 'PITTA,KAPHA',
      manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd, Gaur City Center, Greater Noida, Uttar Pradesh - 201318.',


      variants: [
        { sku: 'THYRO-60CAP', attrName: 'Pack Size', attrVal: '60 Capsules Bottle', mrp: 999, price: 749, stock: 120 },
      ]
    },
    {
      name: 'Gain Up Lean Mass Gainer Powder',
      slug: 'gain-up-lean-mass-gainer',
      cat: 'mens-wellness',
      mrp: 1299, price: 999, featured: true, bestseller: true, is_new: false,
      image: '/products/gain-up.jpg',
      images: ['/products/gain-up-2.jpg'],
      short_desc: '100% Ayurvedic Lean Mass, Muscle, Height & Weight Gainer in Natural Chocolate Flavour.',
      description: 'Paarthvi Ayurveda Gain Up is an authentic herbal mass gainer enriched with Ashwagandha, Safed Musli, Shatavari, Gokshura, and Kaunch Beej to support healthy muscle growth, weight gain, and energy levels.',
      ingredients: 'Ashwagandha 500mg, Safed Musli 250mg, Shatavari 250mg, Gokshura 250mg, Kaunch Beej 250mg, Vidarikand 250mg, Shankhpushpi 250mg, Jaiphal 100mg, Javitri 100mg, Dalchini 50mg, Kali Mirch 50mg, Tej Patra 50mg, Sonth 50mg, Pippali 50mg, Elaichi 50mg, Mishri 9000mg per 20g.',
      key_ingredients: 'Ashwagandha, Safed Musli, Shatavari, Gokshura & Kaunch Beej',
      benefits: 'Promotes muscle gain, height gain, weight gain, and natural stamina enhancement.',
      usage_directions: 'Take 1-2 scoops (20g) twice a day in 200ml warm milk.',
      warnings: 'Store in a cool dry place.',
      storage_info: 'Store in a cool, dry place. Keep away from direct sunlight.',
      net_qty: '500g Powder',
      target_dosha: 'VATA,KAPHA',
      manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd, Gaur City Center, Greater Noida, Uttar Pradesh - 201318.',


      variants: [
        { sku: 'GAINUP-500G', attrName: 'Pack Size', attrVal: '500g Jar (Chocolate)', mrp: 1299, price: 999, stock: 100 },
        { sku: 'GAINUP-1KG', attrName: 'Pack Size', attrVal: '1kg Twin Pack', mrp: 2399, price: 1799, stock: 60 },
      ]
    },
    {
      name: 'Paarthvi Chyawanprash Avaleha',
      slug: 'paarthvi-chyawanprash-avaleha',
      cat: 'daily-wellness',
      mrp: 599, price: 449, featured: true, bestseller: true, is_new: false,
      image: '/products/chyawanprash.jpg',
      images: ['/products/chyawanprash-2.jpg', '/products/chyawanprash-3.jpg', '/products/chyawanprash-4.jpg', '/products/chyawanprash-5.jpg', '/products/chyawanprash-back.jpg'],
      short_desc: 'Classical Ayurvedic Avaleha with 20+ powerful herbs for Strength, Stamina & Immunity.',
      description: 'Crafted following classical Ayurvedic rasayana preparation, Paarthvi Chyawanprash Avaleha combines organic Amla, Shatavari, Ashwagandha, Guduchi, and Dashmool to boost natural immunity and vitality.',
      ingredients: 'Organic Amla (Emblica Officinalis), Guduchi, Ashwagandha, Shatavari, Bala, Yashtimadhu, Pippali, Dashmool (10 roots), Pure Honey, Ghee, Jaggery (Guda), Sharkara.',
      key_ingredients: 'Organic Fresh Amla, Guduchi, Ashwagandha, Shatavari & Dashmool',
      benefits: 'Helps boost immunity, improves strength, stamina and overall health. 100% Natural, No Preservatives, No Artificial Colors.',
      usage_directions: 'Take 1-2 teaspoonfuls (10-15g) twice daily with warm milk or lukewarm water.',
      warnings: 'Store in a cool dry place.',
      storage_info: 'Store in a dry place. Keep container tightly closed.',
      net_qty: '500 g',
      target_dosha: 'TRIDOSAHIC',
      manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd, Gaur City Center, Greater Noida, Uttar Pradesh - 201318.',


      variants: [
        { sku: 'CHYAWAN-500G', attrName: 'Pack Size', attrVal: '500g Jar', mrp: 599, price: 449, stock: 200 },
        { sku: 'CHYAWAN-1KG', attrName: 'Pack Size', attrVal: '1kg Family Jar', mrp: 1099, price: 799, stock: 150 },
      ]
    },
    {
      name: 'Lean Up Capsules (Weight Management & Detox)',
      slug: 'lean-up-weight-management-detox',
      cat: 'daily-wellness',
      mrp: 899, price: 649, featured: true, bestseller: true, is_new: true,
      image: '/products/lean-up.jpg',
      images: ['/products/lean-up-2.jpg'],
      short_desc: '100% Natural & Vegetarian Capsules for Weight Management, Digestion & Detoxification.',
      description: 'Lean Up is a synergistic Ayurvedic blend of Triphala, Methi, Ginger, Saunf, Ajwain, Aloe Vera, and Guggal formulated to aid digestion, boost metabolism, reduce body sluggishness, and support body weight control.',
      ingredients: 'Triphala 120mg, Methi 40mg, Dhaniya 40mg, Ginger 40mg, Saunf 40mg, Black Pepper 40mg, Jeera 40mg, Garlic 40mg, Ajwain 35mg, Laung 35mg, Hing 35mg, Gulab 35mg, Tulsi 35mg, Citrus Limon 35mg, Aloe Vera 35mg, Edible Common Salt 35mg, Kokam 35mg, Guggal 35mg (Total 680mg per capsule).',
      key_ingredients: 'Triphala, Guggal, Saunf, Methi, Kokam & Ajwain',
      benefits: 'Supports weight management, aids digestion, detoxifies the body, boosts metabolism.',
      usage_directions: 'Take 1 capsule twice daily after meals with warm water, or as directed by a physician.',
      warnings: 'Store in a cool dry place.',
      storage_info: 'Store in a cool, dry place. Protect from direct sunlight.',
      net_qty: '60 Capsules',
      target_dosha: 'KAPHA,PITTA',
      manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd, Gaur City Center, Greater Noida, Uttar Pradesh - 201318.',


      variants: [
        { sku: 'LEANUP-60CAP', attrName: 'Pack Size', attrVal: '60 Capsules Bottle', mrp: 899, price: 649, stock: 110 },
      ]
    },
    {
      name: 'Hair XL Capsules (Supports Healthy Hair)',
      slug: 'hair-xl-supports-healthy-hair',
      cat: 'hair-care',
      mrp: 799, price: 599, featured: true, bestseller: true, is_new: false,
      image: '/products/hair-xl.jpg',
      images: ['/products/hair-xl-2.jpg', '/products/hair-xl-3.jpg'],
      short_desc: '100% Herbal & Natural Dietary Supplement for Hair Fall Control, Scalp Revitalization & Hair Growth.',
      description: 'Hair XL Capsules combine 13 revered scalp and hair herbs including Bhringaraj, Amla, Neem, Curry Leaf (Kadi Leaf), Moringa, Jatamansi, and Brahmi to strengthen hair follicles and reduce hair fall and greying.',
      ingredients: 'Bhringaraj 70mg, Gurhal 50mg, Jatamansi 30mg, Amla 90mg, Neem 90mg, Moringa 50mg, Kadi Leaf 90mg, Ashwagandha 80mg, Gotu Kola 20mg, Methi 50mg, Mulethi 50mg, Brahmi 50mg, Aloe Vera 30mg.',
      key_ingredients: 'Bhringaraj, Amla, Neem, Curry Leaf, Jatamansi & Brahmi',
      benefits: 'Controls hair fall, nourishes scalp, prevents early greying, supports strong and shiny hair.',
      usage_directions: 'Take 1 capsule twice daily after meals with warm water, or as directed by a physician.',
      warnings: 'Keep out of reach of children.',
      storage_info: 'Store in a cool, dry place. Protect from direct sunlight.',
      net_qty: '60 Capsules',
      target_dosha: 'VATA,PITTA',
      manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd, Gaur City Center, Greater Noida, Uttar Pradesh - 201318.',


      variants: [
        { sku: 'HAIRXL-60CAP', attrName: 'Pack Size', attrVal: '60 Capsules Bottle', mrp: 799, price: 599, stock: 180 },
      ]
    },
    {
      name: 'Paarthvi Veda Shilajit Resin (75% Fulvic Acid)',
      slug: 'shilajit-resin-75-fulvic-acid',
      cat: 'mens-wellness',
      mrp: 1499, price: 999, featured: true, bestseller: true, is_new: true,
      image: '/products/shilajit-resin.jpg',
      images: ['/products/shilajit-resin-2.jpg', '/products/shilajit-resin-3.jpg', '/products/shilajit-resin-4.jpg', '/products/shilajit-resin-5.jpg'],
      short_desc: 'Pure Himalayan Shilajit Resin fortified with Ashwagandha & Gokshura for Peak Performance & Vitality.',
      description: 'Extracted from high-altitude Himalayan rock exudates, Paarthvi Veda Shilajit Resin contains 75% Fulvic Acid. Synergistically blended with Ashwagandha and Gokshura to maximize cellular energy, stamina, and physical recovery.',
      ingredients: 'Pure Himalayan Shilajit Resin (75% Fulvic Acid), Shodhita Ashwagandha Extract, Gokshura Extract.',
      key_ingredients: '75% Fulvic Acid Shilajit Resin, Ashwagandha & Gokshura',
      benefits: 'Strength & stamina booster, pure Shilajit resin, supports overall wellbeing, aids cellular recovery.',
      usage_directions: 'Take a pea-sized amount (250-500mg). Dissolve in lukewarm water or milk and consume once daily for best results.',
      warnings: 'Store in a cool dry place.',
      storage_info: 'Store in a cool, dry place away from heat and direct sunlight.',
      net_qty: '20 g Jar',
      target_dosha: 'VATA,KAPHA',
      manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd, Gaur City Center, Greater Noida, Uttar Pradesh - 201318.',


      variants: [
        { sku: 'SHILAJIT-20G', attrName: 'Size', attrVal: '20g Glass Jar', mrp: 1499, price: 999, stock: 95 },
        { sku: 'SHILAJIT-50G', attrName: 'Size', attrVal: '50g Value Pack Jar', mrp: 2999, price: 1999, stock: 40 },
      ]
    },
    {
      name: 'Joint Support Capsules (Joint Pain, Arthritis & Gout)',
      slug: 'joint-support-arthritis-gout',
      cat: 'herbal-wellness',
      mrp: 899, price: 649, featured: true, bestseller: true, is_new: false,
      image: '/products/joint-support.jpg',
      short_desc: '100% Natural & Vegetarian Capsules for Joint Pain, Arthritis, Gout & Mobility Support.',
      description: 'Paarthvi Ayurveda Joint Support is a targeted herbal formula designed to relieve joint pain and stiffness, support cartilage health, improve mobility and flexibility, and assist in managing uric acid levels.',
      ingredients: 'Shallaki (Boswellia Serrata), Guggulu (Commiphora Mukul), Nirgundi, Sonth (Ginger), Ashwagandha, Haldi (Turmeric).',
      key_ingredients: 'Shallaki, Guggulu, Nirgundi, Ginger & Turmeric',
      benefits: 'Relieves joint pain & stiffness, supports cartilage & joint health, improves flexibility & mobility, helps manage uric acid & arthritis.',
      usage_directions: 'Take 1 capsule twice daily after meals with water, or as directed by a physician.',
      warnings: 'Store in a cool dry place.',
      storage_info: 'Store in a cool, dry place. Keep away from direct sunlight.',
      net_qty: '60 Capsules',
      target_dosha: 'VATA',
      manufacturer_info: 'Paarthvi Herbal Formulations Pvt Ltd, Gaur City Center, Greater Noida, Uttar Pradesh - 201318.',


      variants: [
        { sku: 'JOINTSUP-60CAP', attrName: 'Pack Size', attrVal: '60 Capsules Bottle', mrp: 899, price: 649, stock: 130 },
      ]
    }
  ];

  for (const p of productsData) {
    const categoryId = catMap[p.cat] || 1;
    const res = await run(
      `INSERT INTO products (
        name, slug, category_id, brand, short_desc, description, mrp, selling_price,
        is_featured, is_bestseller, is_new, target_dosha, status, ingredients, key_ingredients, benefits,
        usage_directions, warnings, storage_info, net_qty, manufacturer_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING id`,
      [
        p.name, p.slug, categoryId, 'Parthvi Ayurveda', p.short_desc, p.description,
        p.mrp, p.price, p.featured, p.bestseller, p.is_new, p.target_dosha || 'TRIDOSAHIC', 'PUBLISHED', p.ingredients,
        p.key_ingredients, p.benefits, p.usage_directions, p.warnings,
        p.storage_info, p.net_qty, p.manufacturer_info
      ]
    );


    const productId = res.lastID;
    await run("INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, 1)", [productId, p.image]);
    if (p.images && p.images.length > 0) {
      for (let idx = 0; idx < p.images.length; idx++) {
        await run("INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3)", [productId, p.images[idx], idx + 2]);
      }
    }

    for (const v of p.variants) {
      const vRes = await run(
        `INSERT INTO product_variants (product_id, sku, attribute_name, attribute_value, mrp, selling_price, weight_g)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [productId, v.sku, v.attrName, v.attrVal, v.mrp, v.price, 300]
      );
      const variantId = vRes.lastID;

      await run(
        `INSERT INTO inventory (variant_id, available_stock, reserved_stock, sold_stock, low_stock_threshold)
         VALUES ($1, $2, 0, 20, 10)`,
        [variantId, v.stock]
      );

      await run(
        `INSERT INTO batches (product_id, variant_id, batch_number, mfg_date, expiry_date, quantity, mrp, supplier_cost)
         VALUES ($1, $2, $3, '2025-06-01', '2027-06-01', $4, $5, $6)`,
        [productId, variantId, `BATCH-${v.sku}-2025`, v.stock, v.mrp, Math.round(v.price * 0.4)]
      );
    }
  }

  // 4. Banners
  await run(
    `INSERT INTO cms_banners (title, subtitle, cta_text, cta_url, desktop_image, mobile_image, display_order, active)
     VALUES ($1, $2, $3, $4, $5, $6, 1, TRUE)`,
    [
      'Restore Balance with Sacred Ayurveda',
      'Discover our premium collection of authentic herbal remedies crafted to harmonize your mind, body, and spirit.',
      'Shop Now',
      '/shop',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkIoC79wqGR-6Vhm8oo35VT590u1_5XFguygcZr8AyxLW4VzQ5NVW5DMwpthxTb6vmn_kPPb2PEoRcLE60GmOsdsZsuYbjY15z_XvrPLQ_ieJxA3z3LlmtVq4UeQEFgUMmtuKBOBNOOWXExk1aPjCJZvaQCIy0WVxuKJh8W8X8d0sPj3jo5y2LzMD8bTuQUVPgp90TRBDqUtUnB99B90lDEXdQa_U38Btqy2vdqmDTenXyEJ5cQ08TWg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkIoC79wqGR-6Vhm8oo35VT590u1_5XFguygcZr8AyxLW4VzQ5NVW5DMwpthxTb6vmn_kPPb2PEoRcLE60GmOsdsZsuYbjY15z_XvrPLQ_ieJxA3z3LlmtVq4UeQEFgUMmtuKBOBNOOWXExk1aPjCJZvaQCIy0WVxuKJh8W8X8d0sPj3jo5y2LzMD8bTuQUVPgp90TRBDqUtUnB99B90lDEXdQa_U38Btqy2vdqmDTenXyEJ5cQ08TWg'
    ]
  );

  // 5. Coupons
  await run(
    `INSERT INTO coupons (code, discount_type, discount_value, min_cart_value, max_discount, start_date, expiry_date, usage_limit, per_user_limit, active)
     VALUES ('AYURVEDA20', 'PERCENT', 20, 499, 300, '2025-01-01', '2028-12-31', 500, 2, TRUE)
     ON CONFLICT (code) DO NOTHING`
  );

  console.log('✅ Database seeded with products, categories, banners, and coupons!');
};


if (process.argv[1] && process.argv[1].endsWith('seeds.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Failed to seed database:', err);
      process.exit(1);
    });
}

