import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { run, get, query } from './database.js';

export const seedDatabase = async () => {
  // Check if admin user already exists
  const existingAdmin = await get("SELECT * FROM users WHERE email = 'admin@parthvi.com'");
  if (existingAdmin) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding Parthvi Ayurveda database...');

  // 1. Users
  const adminPass = await bcrypt.hash('adminpassword123', 10);
  const orderPass = await bcrypt.hash('orderpassword123', 10);
  const customerPass = await bcrypt.hash('customer123', 10);

  const superAdmin = await run(
    "INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    ['Super Admin', 'admin@parthvi.com', adminPass, '+91 9876543210', 'SUPER_ADMIN']
  );

  await run(
    "INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5)",
    ['Order Manager', 'orders@parthvi.com', orderPass, '+91 9876543211', 'ORDER_MANAGER']
  );

  const demoCustomer = await run(
    "INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    ['Ayush Sharma', 'ayush@example.com', customerPass, '+91 9988776655', 'CUSTOMER']
  );

  await run(
    "INSERT INTO addresses (user_id, name, phone, street_address, city, state, pincode, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)",
    [demoCustomer.lastID, 'Ayush Sharma', '+91 9988776655', '42 Vrindavan Gardens, Near ISKCON Temple', 'Mathura', 'Uttar Pradesh', '281001']
  );

  // 2. Categories
  const categoriesData = [
    { name: 'Hair Care', slug: 'hair-care', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtBTO3te9frWis1VqUj7GWYnH-aAdC6ZBZ_42IOKfqa7KvQxcYVMVqqHA60fIy6NQClOJx0wBoKMO9lOxA_d93HGs_ITOMcx6nlwiD-tIffpBXhhbkYA8IP3DFOdFnkAiViZOXA3PAILKPFD9h8O1-3a1BA3tvpLtzTKhhJ5zw_9ZwUjn7q8N6ILI7tMlykM-dkGNKBHuDHbKDM8yvFEv2ugBH-MigsRU1d57XjW66K2uJ5bG9IA8hWA', description: 'Nourishing botanical hair oils, herbal shampoos, and scalp revitalizers' },
    { name: 'Nutrition & Supplements', slug: 'nutrition-supplements', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTnRYq9N4tNYCBNHtwC-9UKO16ekI_k5V8PyYQl--a4OjeDqHIgZzu5t4Eso_fB3VPqTxe4zl4GxlTl9NXzlji4fR8bO-sKyU8hveO2fFbcP5L-fUT8uoa8xmoo61r_SMjrftYhm5_9tu85Vl7M48XEDWOAWiWm_5oOWo-GudwqC57ggpbLKdDg3y4Xo4CYKOklG1lgeFGD1xnWouleXxJcf-8eKrZbVAZyvWDlUSWt3lfkzdg1z_qOQ', description: 'Pure herbal formulations, Chyawanprash, vitality boosters, and wellness capsules' },
    { name: 'Herbal Wellness', slug: 'herbal-wellness', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH33w-PXNVmO1ZqPjsi4EcEDwv-WvX7MVXdcCqmn9WgawL2C896vjmujbj6OeInFkgSPganzDbp44cgTdy5tTmGDkJ2_Q5OD1pPKAvguRBnKjRVAjBk8OsKgAFNayCRAc408HdhQ8Q_QiGyxCAttbVUIuwm5PKpljKzSd4keZW16OhOklcKazIWPhIlR5-P87vM3C3aMXBjNZc3mwNKY_4dWBp6rerIA8iqulhMxKE6jCb22vQ9pMTJg', description: 'Time-tested Ayurvedic herbs for immunity, stress relief, and holistic health' },
    { name: 'Daily Wellness', slug: 'daily-wellness', image: 'https://images.unsplash.com/photo-1512290900673-0ff7656910be?auto=format&fit=crop&q=80&w=600', description: 'Essential herbal teas, kadhas, and natural digestive elixirs' },
    { name: 'Personal Care', slug: 'personal-care', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWnxnpE8wdajXKLcwiFWUz7B-5TiqapQwTxnY0kkPWSy6Mcj7aBjApOwyXwNKsbm_qFW_zeflpYfiOUEqhT4EY0ydhwp2zQjAGq8sHlboShIADMPV63mrMlqf9ht6AHyl74mMjPgnHumtRGFw-B3eTkVtmSFYXqokv6pkYAKwDsRfmA7A6-hQxlLRBOSdF1jV9PVj54mtdp_WDf-e4fa0MrcO0uhfVB9Q6VHeQXs3PaBr25eHXMzhxaw', description: 'Organic soaps, ubtan body scrubs, Kumkumadi facial oils, and rose water' },
    { name: "Men's Wellness", slug: 'mens-wellness', image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600', description: 'Vigour boosters, stamina rasayanas, and beard care oils' },
    { name: "Women's Wellness", slug: 'womens-wellness', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600', description: 'Hormonal balance syrups, glow rasayanas, and post-natal care' },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const res = await run(
      "INSERT INTO categories (name, slug, image, description, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [c.name, c.slug, c.image, c.description, Object.keys(catMap).length + 1]
    );
    catMap[c.slug] = res.lastID;
  }

  // 3. Products
  const productsData = [
    {
      name: 'Ashwagandha Root Powder',
      slug: 'ashwagandha-root-powder',
      cat: 'nutrition-supplements',
      mrp: 599, price: 499, featured: true, bestseller: true, is_new: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCb-RgsboX1Akv4b04ivSLHtRXmvJaWjy3bY2LWsJdKDJLYuM1c4Eb9JmjPi651ISnd_zm2pkIbS2bCrZMZALwkwrrm2-QNoiEEB1StYgY8gLiBsPLYDvA2ev94ui-Cs8IW5KK7BkUdThLT8oxKyJiMLfoW9yah7VgFowHGDQFUvqYciLIM6V4Rglt7ezVGK-ZTLb4f4ZbDIz1ZKMzavGgkMsynkp4bVbl5fiD20NuX6YSeuht81QS7A',
      short_desc: 'Organic Nagori Ashwagandha root powder enriched with Kashmiri Kesar and Safed Musli.',
      description: 'Handpicked Nagori Ashwagandha roots processed with Kashmiri Saffron and Shodhita Safed Musli.',
      ingredients: 'Withania Somnifera (Ashwagandha) Root Powder, Crocus Sativus (Kesar), Chlorophytum Borivilianum (Safed Musli)',
      key_ingredients: 'Grade-A Ashwagandha Root, Kashmiri Kesar Stigmas, Safed Musli',
      benefits: 'Helps combat daily stress, boosts vitality and energy levels, supports natural immunity.',
      usage_directions: 'Take 1 teaspoon (approx 3-5g) twice daily with warm milk or lukewarm water.',
      warnings: 'Consult a physician before use if pregnant or nursing.',
      storage_info: 'Store in an airtight container in a cool, dry place.',
      net_qty: '250 g',
      manufacturer_info: 'Parthvi Herbal Formulations Pvt Ltd, Haridwar, Uttarakhand.',
      variants: [
        { sku: 'ASHWA-250G', attrName: 'Pack Size', attrVal: '250g Jar', mrp: 599, price: 499, stock: 150 },
        { sku: 'ASHWA-500G', attrName: 'Pack Size', attrVal: '500g Value Pack', mrp: 999, price: 799, stock: 80 },
      ]
    },
    {
      name: 'Kumkumadi Facial Oil',
      slug: 'kumkumadi-facial-oil',
      cat: 'personal-care',
      mrp: 1299, price: 999, featured: true, bestseller: true, is_new: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWnxnpE8wdajXKLcwiFWUz7B-5TiqapQwTxnY0kkPWSy6Mcj7aBjApOwyXwNKsbm_qFW_zeflpYfiOUEqhT4EY0ydhwp2zQjAGq8sHlboShIADMPV63mrMlqf9ht6AHyl74mMjPgnHumtRGFw-B3eTkVtmSFYXqokv6pkYAKwDsRfmA7A6-hQxlLRBOSdF1jV9PVj54mtdp_WDf-e4fa0MrcO0uhfVB9Q6VHeQXs3PaBr25eHXMzhxaw',
      short_desc: 'Precious facial oil infused with Kashmiri Saffron, Sandalwood, and Lotus stamens.',
      description: 'Formulated according to Ashtanga Hridaya, Kumkumadi Oil combines 26 herbal ingredients.',
      ingredients: 'Kashmiri Saffron, Sandalwood, Lotus Pollen, Licorice, Manjistha, Vetiver, Sesame Oil',
      key_ingredients: 'Pure Kesar (Saffron), Chandan (Sandalwood), Manjistha',
      benefits: 'Enhances skin luminosity, reduces appearance of blemish marks, deeply hydrates skin barrier.',
      usage_directions: 'Cleanse face thoroughly. Take 3-4 drops on palms, gently massage onto face and neck.',
      warnings: 'For external skin application only. Perform patch test.',
      storage_info: 'Store in a dark glass bottle away from direct light.',
      net_qty: '30 ml',
      manufacturer_info: 'Parthvi Cosmetics & Herbals, Jaipur, Rajasthan.',
      variants: [
        { sku: 'KUMKUMADI-30ML', attrName: 'Size', attrVal: '30ml Dropper', mrp: 1299, price: 999, stock: 90 },
      ]
    },
    {
      name: 'Triphala Digestion Blend',
      slug: 'triphala-digestion-blend',
      cat: 'daily-wellness',
      mrp: 399, price: 299, featured: true, bestseller: true, is_new: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY5Hjd3yliPS_A_jL50m32pdOziP1exX5-bJyOgRmrGFRCrKPw2bsAHeWe20hs4aZkYAaj_qM3OGcTvEfR9C7vt6h0WMsjCOmhBJ7ew9efXhBkCFR3a2756BNZ6imbkNLv1j7PJ6OXSPJqw29wXrTqnJ3wOb12MWa5tKIHGwJgo2awASFJWYnCVI9VwxyiFtibICru7J0rs5knA4h-ei_eLMFgQbGi9Yju0uBIkKPiqfz7O9orvW25NQ',
      short_desc: 'Equal balance of Haritaki, Bibhitaki, and Amalaki for gentle daily bowel regularity.',
      description: 'Triphala is Ayurveda\'s foundational formula for digestive harmony and internal cleansing.',
      ingredients: 'Haritaki (Terminalia Chebula), Bibhitaki (Terminalia Bellirica), Amalaki (Emblica Officinalis)',
      key_ingredients: 'Organic Haritaki, Bibhitaki, and Amla (1:1:1 ratio)',
      benefits: 'Promotes gentle daily digestion, supports intestinal health, rich in Vitamin C.',
      usage_directions: 'Take 1 to 2 tablets with warm water before going to sleep.',
      warnings: 'Not suitable during active loose motions.',
      storage_info: 'Store in a dry place at temperature below 30°C.',
      net_qty: '120 Tablets',
      manufacturer_info: 'Parthvi Herbal Formulations Pvt Ltd, Haridwar.',
      variants: [
        { sku: 'TRIPHALA-120TAB', attrName: 'Pack Size', attrVal: '120 Tablets', mrp: 399, price: 299, stock: 200 },
      ]
    },
    {
      name: 'Golden Turmeric Elixir',
      slug: 'golden-turmeric-elixir',
      cat: 'herbal-wellness',
      mrp: 699, price: 549, featured: true, bestseller: true, is_new: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwOxOhfbUg-6TkymptFccDQncyJachD0sT_7hN2JyI-FZFNGAmuvzIpM6zcmhYUocAS5I48F1JIZHZ_3OqA3B_JzKv0YEoeAoCKg5FDrapdzSPH1XHsdFPhd4flsG1LFB02URbAPSdNyXsZ0uoc9Q_YCh1DTz_pz16ypuL1f9sM_Vb9H2NQ-RzQY2opxHrHN0Zwx-DfLoIQ0u-I10cic2Gz8Q44BzKRgc-6o5sLeYAwcsOuMoDKtl6Nw',
      short_desc: 'High-potency Curcumin extract with Piperine (Black Pepper) for maximum absorption.',
      description: 'Standardized 95% Curcuminoids extracted from Lakadong Turmeric, fortified with Piperine.',
      ingredients: 'Curcuma Longa Extract (95% Curcuminoids), Piper Nigrum Extract (Piperine 95%)',
      key_ingredients: 'Curcumin 95% + Piperine bio-enhancer',
      benefits: 'Supports healthy inflammatory response, promotes joint comfort and cellular wellness.',
      usage_directions: 'Take 1 capsule twice daily after meals.',
      warnings: 'Keep in a cool dry location.',
      storage_info: 'Store in cool dry conditions.',
      net_qty: '60 Capsules',
      manufacturer_info: 'Parthvi Organics, Solan, HP.',
      variants: [
        { sku: 'CURCUMIN-60CAP', attrName: 'Count', attrVal: '60 Veg Capsules', mrp: 699, price: 549, stock: 120 }
      ]
    },
    {
      name: 'Maha Bhringraj Divine Hair Oil',
      slug: 'maha-bhringraj-divine-hair-oil',
      cat: 'hair-care',
      mrp: 599, price: 499, featured: true, bestseller: true, is_new: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtBTO3te9frWis1VqUj7GWYnH-aAdC6ZBZ_42IOKfqa7KvQxcYVMVqqHA60fIy6NQClOJx0wBoKMO9lOxA_d93HGs_ITOMcx6nlwiD-tIffpBXhhbkYA8IP3DFOdFnkAiViZOXA3PAILKPFD9h8O1-3a1BA3tvpLtzTKhhJ5zw_9ZwUjn7q8N6ILI7tMlykM-dkGNKBHuDHbKDM8yvFEv2ugBH-MigsRU1d57XjW66K2uJ5bG9IA8hWA',
      short_desc: 'Traditional Ayurvedic hair oil cooked with 21 potent herbs including Bhringraj, Amla, and Sesame oil.',
      description: 'Maha Bhringraj Divine Hair Oil is crafted following ancient Kshirpak Vidhi.',
      ingredients: 'Bhringraj, Amla, Brahmi, Jatamansi, Sesame Oil, Coconut Oil',
      key_ingredients: 'Pure Bhringraj, Indian Gooseberry (Amla), Brahmi & Cold-Pressed Sesame Oil',
      benefits: 'Supports hair follicle health, nourishes scalp, reduces hair dryness.',
      usage_directions: 'Gently warm oil. Apply generously to scalp and massage with fingertips.',
      warnings: 'For external use only.',
      storage_info: 'Store in a cool, dry place.',
      net_qty: '200 ml',
      manufacturer_info: 'Parthvi Herbal Formulations Pvt Ltd, Haridwar.',
      variants: [
        { sku: 'HAIR-OIL-200ML', attrName: 'Size', attrVal: '200ml', mrp: 599, price: 499, stock: 200 },
      ]
    }
  ];

  for (const p of productsData) {
    const categoryId = catMap[p.cat] || 1;
    const res = await run(
      `INSERT INTO products (
        name, slug, category_id, brand, short_desc, description, mrp, selling_price,
        is_featured, is_bestseller, is_new, ingredients, key_ingredients, benefits,
        usage_directions, warnings, storage_info, net_qty, manufacturer_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING id`,
      [
        p.name, p.slug, categoryId, 'Parthvi Ayurveda', p.short_desc, p.description,
        p.mrp, p.price, p.featured, p.bestseller, p.is_new, p.ingredients,
        p.key_ingredients, p.benefits, p.usage_directions, p.warnings,
        p.storage_info, p.net_qty, p.manufacturer_info
      ]
    );

    const productId = res.lastID;
    await run("INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, 1)", [productId, p.image]);

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
     VALUES ('AYURVEDA20', 'PERCENT', 20, 499, 300, '2025-01-01', '2028-12-31', 500, 2, TRUE)`
  );

  console.log('✅ Database seeded with products, categories, banners, and coupons!');
};

if (process.argv[1] && process.argv[1].endsWith('seeds.js')) {
  seedDatabase().catch(err => {
    console.error('Failed to seed database:', err);
    process.exit(1);
  });
}
