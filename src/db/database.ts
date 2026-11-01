import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'telebiz_platform.db');
export const db = new Database(dbPath);

// Enable WAL mode and foreign keys for production reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_telebiz_salt_2026').digest('hex');
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      platform_role TEXT NOT NULL DEFAULT 'user', -- 'super_admin' | 'user'
      telegram_id TEXT,
      telegram_username TEXT,
      preferred_language TEXT NOT NULL DEFAULT 'en', -- 'en' | 'am' | 'om'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      revoked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'retail' | 'restaurant' | 'hotel' | 'salon' | 'real_estate' | 'digital' | 'education' | 'services' | 'community'
      status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'paused' | 'suspended' | 'pending_review'
      creation_method TEXT NOT NULL DEFAULT 'self_service', -- 'self_service' | 'done_for_you' | 'ai_builder'
      dfy_status TEXT NOT NULL DEFAULT 'not_applicable', -- 'not_applicable' | 'requested' | 'in_review' | 'configuring' | 'ready_for_preview' | 'published'
      dfy_notes TEXT DEFAULT '',
      plan_id TEXT NOT NULL DEFAULT 'growth', -- 'free' | 'growth' | 'enterprise'
      billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly' | 'yearly'
      subscription_status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'grace_period' | 'past_due' | 'suspended'
      subscription_expires_at TEXT NOT NULL,
      grace_period_days INTEGER NOT NULL DEFAULT 7,
      primary_color TEXT NOT NULL DEFAULT '#0F172A',
      accent_color TEXT NOT NULL DEFAULT '#0284C7',
      logo_text TEXT NOT NULL DEFAULT 'TB',
      description TEXT NOT NULL DEFAULT '',
      about_text TEXT NOT NULL DEFAULT '',
      contact_phone TEXT NOT NULL DEFAULT '',
      contact_email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      working_hours_json TEXT NOT NULL DEFAULT '{}',
      custom_domain TEXT DEFAULT '',
      restricted_features_json TEXT NOT NULL DEFAULT '[]',
      telegram_bot_token_masked TEXT DEFAULT '',
      telegram_bot_username TEXT DEFAULT '',
      telegram_channel_username TEXT DEFAULT '',
      telegram_webhook_active INTEGER NOT NULL DEFAULT 0,
      mini_app_published INTEGER NOT NULL DEFAULT 1,
      mini_app_version INTEGER NOT NULL DEFAULT 1,
      ai_generations_used INTEGER NOT NULL DEFAULT 0,
      ai_generations_limit INTEGER NOT NULL DEFAULT 25,
      owner_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_branches (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      manager_name TEXT NOT NULL,
      working_hours TEXT NOT NULL,
      is_main INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open'
    );

    CREATE TABLE IF NOT EXISTS mini_app_versions (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      layout_json TEXT NOT NULL,
      theme_json TEXT NOT NULL,
      pages_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published'
      created_by TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL, -- 'owner' | 'admin' | 'manager' | 'sales' | 'support' | 'product_manager' | 'analyst'
      permissions_json TEXT NOT NULL DEFAULT '[]',
      branch_id TEXT,
      schedule_json TEXT NOT NULL DEFAULT '{"shift":"Mon-Fri 08:30-17:30"}',
      status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'invited' | 'revoked'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      category_name TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      compare_at_price REAL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      stock INTEGER NOT NULL DEFAULT 50,
      sku TEXT NOT NULL,
      variations_json TEXT NOT NULL DEFAULT '[]',
      featured INTEGER NOT NULL DEFAULT 0,
      available INTEGER NOT NULL DEFAULT 1,
      image_type TEXT NOT NULL DEFAULT 'coffee',
      views_count INTEGER NOT NULL DEFAULT 0,
      likes_count INTEGER NOT NULL DEFAULT 0,
      purchases_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services_listings (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_mins INTEGER NOT NULL DEFAULT 60,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      capacity INTEGER NOT NULL DEFAULT 1,
      available_slots_json TEXT NOT NULL DEFAULT '["09:00","10:30","14:00","16:00"]',
      available INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      telegram_id TEXT DEFAULT '',
      telegram_username TEXT DEFAULT '',
      segment TEXT NOT NULL DEFAULT 'first_time', -- 'vip' | 'returning' | 'first_time'
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      referral_code TEXT NOT NULL,
      consent_marketing INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL DEFAULT 'telegram_mini_app', -- 'telegram_mini_app' | 'telegram_channel' | 'web_store' | 'referral'
      visits_count INTEGER NOT NULL DEFAULT 1,
      total_spent REAL NOT NULL DEFAULT 0,
      last_seen_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      order_number TEXT NOT NULL,
      customer_id TEXT REFERENCES customers(id),
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'telegram', -- 'telegram' | 'web'
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      discount_code TEXT DEFAULT '',
      total REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled' | 'refunded'
      delivery_status TEXT NOT NULL DEFAULT 'awaiting_dispatch',
      delivery_address TEXT DEFAULT '',
      assigned_employee_id TEXT,
      payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid' | 'pending_verification' | 'paid' | 'failed' | 'refunded'
      payment_method TEXT NOT NULL DEFAULT 'telebirr', -- 'telegram_stars' | 'telebirr' | 'cbe_birr' | 'card' | 'cash_on_delivery'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      booking_number TEXT NOT NULL,
      service_id TEXT REFERENCES services_listings(id),
      service_name TEXT NOT NULL,
      customer_id TEXT REFERENCES customers(id),
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'requested', -- 'requested' | 'confirmed' | 'completed' | 'cancelled'
      payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid' | 'paid' | 'refunded'
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      notes TEXT DEFAULT '',
      assigned_employee_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL, -- 'platform' | 'business'
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      reference_code TEXT UNIQUE NOT NULL,
      order_id TEXT,
      booking_id TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      method TEXT NOT NULL,
      provider_tx_id TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'initiated', -- 'initiated' | 'verified' | 'failed' | 'refunded'
      verified_at TEXT,
      verified_by TEXT,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
 
    CREATE TABLE IF NOT EXISTS business_payment_methods (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      method_name TEXT NOT NULL,
      account_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_business_payment_methods_business
      ON business_payment_methods(business_id, is_active, sort_order);

    CREATE TABLE IF NOT EXISTS payment_instruction_snapshots (
      payment_id TEXT PRIMARY KEY REFERENCES payments(id) ON DELETE CASCADE,
      payment_method_id TEXT NOT NULL DEFAULT '',
      method_name TEXT NOT NULL,
      account_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      created_at TEXT NOT NULL
    );


    CREATE TABLE IF NOT EXISTS support_conversations (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL DEFAULT 'business', -- 'business' | 'platform'
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      telegram_chat_id TEXT DEFAULT '',
      channel TEXT NOT NULL DEFAULT 'telegram_bot', -- 'telegram_bot' | 'telegram_business' | 'web_chat' | 'platform_support'
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'pending' | 'resolved' | 'escalated'
      assigned_employee_id TEXT,
      unread_count INTEGER NOT NULL DEFAULT 0,
      first_response_mins INTEGER DEFAULT 4,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL, -- 'customer' | 'agent' | 'bot_auto' | 'internal_note'
      sender_name TEXT NOT NULL,
      body TEXT NOT NULL,
      is_internal_note INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS canned_replies (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      shortcut TEXT NOT NULL,
      content TEXT NOT NULL,
      is_faq INTEGER NOT NULL DEFAULT 0,
      auto_trigger_keyword TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id TEXT,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL, -- 'app_visit' | 'page_view' | 'product_view' | 'product_like' | 'buy_click' | 'checkout_init' | 'order_submit' | 'payment_attempt' | 'payment_confirmed' | 'purchase_complete'
      page_name TEXT DEFAULT 'home',
      product_id TEXT,
      source TEXT NOT NULL DEFAULT 'telegram', -- 'telegram' | 'web' | 'channel'
      device_type TEXT NOT NULL DEFAULT 'mobile_tg', -- 'mobile_tg' | 'mobile_web' | 'desktop_web'
      duration_secs INTEGER NOT NULL DEFAULT 45,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addons (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      monthly_price REAL NOT NULL,
      yearly_price REAL NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      features_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS business_addons (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      addon_id TEXT NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'trial' | 'promotional' | 'disabled'
      pricing_override REAL,
      expires_at TEXT,
      granted_by TEXT DEFAULT 'self',
      created_at TEXT NOT NULL,
      UNIQUE(business_id, addon_id)
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed'
      discount_value REAL NOT NULL,
      min_order_amount REAL NOT NULL DEFAULT 0,
      usage_count INTEGER NOT NULL DEFAULT 0,
      max_uses INTEGER NOT NULL DEFAULT 100,
      active INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'broadcast' | 'abandoned_cart' | 'promo_alert'
      target_segment TEXT NOT NULL,
      message_body TEXT NOT NULL,
      sent_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'sent',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      branch_id TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      incurred_date TEXT NOT NULL,
      recorded_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      business_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      previous_value TEXT DEFAULT '',
      new_value TEXT DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);

  // Check if already seeded
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count > 0) {
    return;
  }

  seedInitialPlatformData();
}

function seedInitialPlatformData() {
  const now = new Date('2026-11-01T08:00:00Z');
  const iso = (daysOffset = 0, hoursOffset = 0) => {
    const d = new Date(now.getTime() + daysOffset * 86400000 + hoursOffset * 3600000);
    return d.toISOString();
  };

  // 1. Seed Users (Super Admin + Business Owners + Employees)
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, password_hash, platform_role, telegram_id, telegram_username, preferred_language, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('usr_superadmin', 'admin@telebiz.os', 'Dawit Mekonnen (Platform Super Admin)', hashPassword('admin123'), 'super_admin', '10099881', 'dawit_telebiz_hq', 'en', iso(-90));
  insertUser.run('usr_owner_1', 'hana@tomocacraft.et', 'Hana Tadesse', hashPassword('owner123'), 'user', '24489102', 'hana_roasters', 'en', iso(-60));
  insertUser.run('usr_owner_2', 'abebe@abyssiniahotel.et', 'Abebe Bikila', hashPassword('owner123'), 'user', '39918273', 'abebe_hospitality', 'am', iso(-45));
  insertUser.run('usr_owner_3', 'chaltu@oliabeauty.et', 'Chaltu Gemechu', hashPassword('owner123'), 'user', '58817264', 'chaltu_olia', 'om', iso(-30));
  insertUser.run('usr_owner_4', 'yonas@addisrealty.et', 'Yonas Kebede', hashPassword('owner123'), 'user', '77419283', 'yonas_realty', 'en', iso(-15));

  // 2. Seed Add-ons Marketplace
  const insertAddon = db.prepare(`
    INSERT INTO addons (id, slug, name, category, description, monthly_price, yearly_price, is_active, features_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const addonsList = [
    ['add_support', 'customer-support-inbox', 'Omnichannel Support Inbox Pro', 'Support', 'Multi-agent Telegram Bot & Business connected-bot inbox, internal notes, SLA timers, and auto-replies.', 850, 8500, 1, JSON.stringify(['Unlimited support agents', 'Telegram Business connected-bot sync', 'SLA response tracking', 'Canned replies & FAQ triggers'])],
    ['add_analytics', 'advanced-funnel-analytics', '10-Stage Funnel & Cohort Analytics', 'Analytics', 'Deep conversion tracking from Mini App open to verified payment with exportable CSV reports.', 650, 6500, 1, JSON.stringify(['10-step funnel attribution', 'High-interest low-conversion alerts', 'CSV & executive report exports'])],
    ['add_ai_builder', 'ai-mini-app-generator', 'AI Mini App Architect & Assistant', 'AI', 'Conversational AI storefront layout generator, multilingual copywriter, and catalog optimizer.', 1200, 12000, 1, JSON.stringify(['100 monthly AI layout generations', 'Amharic & Afaan Oromoo translation assist', 'Smart section builder'])],
    ['add_loyalty', 'loyalty-and-referrals', 'Loyalty Points, VIP Tiers & Referrals', 'Marketing', 'Automated point accrual per verified order, Telegram referral deep-links, and segmented broadcasts.', 700, 7000, 1, JSON.stringify(['Telegram referral links', 'VIP customer tiers', 'Abandoned cart Telegram alerts'])],
    ['add_custom_domain', 'custom-web-domain', 'Custom Web Domain & SSL Bridge', 'Infrastructure', 'Serve your Telegram Mini App simultaneously as a standalone custom-domain PWA for non-Telegram customers.', 450, 4500, 1, JSON.stringify(['Custom domain routing', 'Automatic TLS certificate', 'Unified cart across Web & Telegram'])],
    ['add_dfy_design', 'custom-dfy-concierge', 'Done-For-You Bespoke Design & Setup', 'Services', 'Dedicated platform specialists build, brand, upload catalog, and wire your Telegram Bot end-to-end.', 4500, 45000, 1, JSON.stringify(['Dedicated launch engineer', 'Full product & menu upload', 'BotFather & Webhook configuration'])]
  ];
  for (const a of addonsList) insertAddon.run(...a);

  // 3. Seed Businesses across categories & creation methods
  const insertBusiness = db.prepare(`
    INSERT INTO businesses (
      id, slug, name, category, status, creation_method, dfy_status, dfy_notes,
      plan_id, billing_cycle, subscription_status, subscription_expires_at, grace_period_days,
      primary_color, accent_color, logo_text, description, about_text,
      contact_phone, contact_email, address, working_hours_json, custom_domain,
      restricted_features_json, telegram_bot_token_masked, telegram_bot_username,
      telegram_channel_username, telegram_webhook_active, mini_app_published,
      mini_app_version, ai_generations_used, ai_generations_limit, owner_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultHours = JSON.stringify({
    mon_fri: '08:00 - 20:00',
    sat: '09:00 - 21:00',
    sun: '10:00 - 18:00'
  });

  // Business 1: Kaffa Origin Roasters & Retail (Online store & retail / Self-service + AI)
  insertBusiness.run(
    'biz_kaffa', 'kaffa-roasters', 'Kaffa Origin Roasters & Craft Store', 'retail', 'active', 'self_service', 'not_applicable', '',
    'enterprise', 'yearly', 'active', iso(305), 14,
    '#0F172A', '#0284C7', 'KO',
    'Single-origin Ethiopian specialty coffee beans, ceramic pour-over equipment, and artisan leather goods delivered via Telegram & Web.',
    'Founded in Addis Ababa, Kaffa Origin partners directly with washing stations in Yirgacheffe, Guji, and Sidama to roast and ship peak-harvest micro-lots.',
    '+251 911 234 567', 'orders@kaffaorigin.et', 'Bole Atlas, Cape Verde St, Addis Ababa', defaultHours, 'shop.kaffaorigin.et',
    '[]', '718293:AAH...9xKq', '@KaffaOriginBot', '@KaffaOriginChannel', 1, 1, 3, 6, 100, 'usr_owner_1', iso(-60)
  );

  // Business 2: Skylight Heritage Boutique Hotel (Hotels & accommodation / Done-For-You)
  insertBusiness.run(
    'biz_hotel', 'skylight-heritage-hotel', 'Skylight Heritage Boutique Hotel', 'hotel', 'active', 'done_for_you', 'published',
    'Completed custom room booking engine, airport shuttle add-ons, and Telegram Stars deposit flow.',
    'growth', 'monthly', 'active', iso(22), 7,
    '#1E293B', '#0D9488', 'SH',
    'Luxury boutique suites, executive conference rooms, and curated culinary dining in the heart of Addis Ababa.',
    'Featuring 42 architect-designed suites with panoramic city views, private spa treatments, and instant Telegram room reservation.',
    '+251 922 876 543', 'reservations@skylightheritage.et', 'Kazanchis Business District, Addis Ababa', defaultHours, 'book.skylightheritage.et',
    '[]', '649182:AAH...3mPz', '@SkylightStayBot', '@SkylightHeritageDeals', 1, 1, 2, 3, 25, 'usr_owner_2', iso(-45)
  );

  // Business 3: Olia Botanical Salon & Spa (Beauty salons & appointment booking / AI Builder)
  insertBusiness.run(
    'biz_salon', 'olia-botanical-spa', 'Olia Botanical Salon & Wellness Spa', 'salon', 'active', 'ai_builder', 'not_applicable', '',
    'growth', 'monthly', 'grace_period', iso(-2), 7,
    '#18181B', '#E11D48', 'OB',
    'Holistic organic hair styling, Moroccan hammam rituals, and clinical skincare appointments bookable in 30 seconds.',
    'Olia combines indigenous botanical oils with certified aesthetic specialists across two Addis Ababa branches.',
    '+251 933 456 789', 'care@oliabotanical.et', 'Old Airport, Bisrate Gebriel, Addis Ababa', defaultHours, '',
    '[]', '882910:AAH...7wLp', '@OliaSpaBookingBot', '', 1, 1, 1, 11, 25, 'usr_owner_3', iso(-30)
  );

  // Business 4: Finfinnee Urban Realty & Lofts (Real estate / Done-For-You In Progress)
  insertBusiness.run(
    'biz_realty', 'finfinnee-urban-realty', 'Finfinnee Urban Realty & Apartments', 'real_estate', 'active', 'done_for_you', 'configuring',
    'Client requested interactive floorplan gallery, viewing appointment scheduler, and diaspora USD/ETB pricing toggle.',
    'growth', 'yearly', 'active', iso(180), 7,
    '#0F172A', '#4F46E5', 'FR',
    'Verified residential penthouses, commercial retail spaces, and scheduled private property viewings.',
    'Direct developer listings with transparent title deeds, virtual walkthroughs, and instant viewing appointments.',
    '+251 944 112 233', 'listings@finfinneerealty.et', 'Sarbet, Behind AU Headquarters, Addis Ababa', defaultHours, 'finfinneerealty.et',
    '[]', '512904:AAH...2kVn', '@FinfinneeRealtyBot', '@FinfinneeProperties', 1, 0, 1, 2, 25, 'usr_owner_4', iso(-15)
  );

  // 4. Seed Business Branches
  const insertBranch = db.prepare(`
    INSERT INTO business_branches (id, business_id, name, address, phone, manager_name, working_hours, is_main, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBranch.run('br_kaffa_1', 'biz_kaffa', 'Bole Atlas Flagship Roastery', 'Cape Verde St, Bole Atlas, Addis Ababa', '+251 911 234 567', 'Hana Tadesse', '07:30 - 21:00', 1, 'open');
  insertBranch.run('br_kaffa_2', 'biz_kaffa', 'Kazanchis Espresso & Pickup Bar', 'Tito St, Kazanchis, Addis Ababa', '+251 911 998 877', 'Robel Girma', '08:00 - 19:30', 0, 'open');
  insertBranch.run('br_hotel_1', 'biz_hotel', 'Kazanchis Main Tower', 'Kazanchis Business District', '+251 922 876 543', 'Abebe Bikila', '24 Hours', 1, 'open');
  insertBranch.run('br_salon_1', 'biz_salon', 'Old Airport Sanctuary', 'Bisrate Gebriel, Addis Ababa', '+251 933 456 789', 'Chaltu Gemechu', '09:00 - 20:00', 1, 'open');

  // 5. Seed Mini App Versions (Layout & Builder state)
  const insertVersion = db.prepare(`
    INSERT INTO mini_app_versions (id, business_id, version_number, layout_json, theme_json, pages_json, status, created_by, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultLayout = JSON.stringify([
    { id: 'sec_hero', type: 'hero', title: 'Peak-Harvest Specialty Coffee & Craft Goods', subtitle: 'Order directly inside Telegram or Web for 45-minute express delivery across Addis Ababa.', ctaText: 'Explore Catalog', visible: true },
    { id: 'sec_featured', type: 'featured_products', title: 'Featured Micro-Lot Releases', subtitle: 'Roasted fresh every Tuesday and Friday morning.', visible: true },
    { id: 'sec_catalog', type: 'product_grid', title: 'Complete Store Catalog', subtitle: 'Filter by category, roast profile, or brewing gear.', visible: true },
    { id: 'sec_bookings', type: 'booking_widget', title: 'Book a Private Cupping & Tasting Session', subtitle: 'Reserve a 60-minute guided sensory tasting at our Bole Atlas Roastery.', visible: true },
    { id: 'sec_promo', type: 'promo_banner', title: 'Use code TELEBIZ15 for 15% off your first Telegram Mini App order', subtitle: 'Valid on all whole-bean and ground specialty bags.', visible: true },
    { id: 'sec_about', type: 'business_info', title: 'Roastery Hours, Branches & Direct Support', subtitle: 'Verified Telegram Business Merchant', visible: true }
  ]);

  const defaultTheme = JSON.stringify({
    primaryColor: '#0F172A',
    accentColor: '#0284C7',
    cardRadius: '12px',
    showStockBadges: true,
    enableTelegramStars: true,
    enableWebCheckout: true
  });

  const defaultPages = JSON.stringify([
    { slug: 'home', title: 'Storefront', enabled: true },
    { slug: 'catalog', title: 'Products', enabled: true },
    { slug: 'bookings', title: 'Reservations', enabled: true },
    { slug: 'about', title: 'About & Branches', enabled: true },
    { slug: 'policies', title: 'Terms & Refund Policy', enabled: true }
  ]);

  insertVersion.run('ver_kaffa_1', 'biz_kaffa', 1, defaultLayout, defaultTheme, defaultPages, 'published', 'Hana Tadesse', 'Initial store launch', iso(-55));
  insertVersion.run('ver_kaffa_2', 'biz_kaffa', 2, defaultLayout, defaultTheme, defaultPages, 'published', 'Hana Tadesse', 'Added private cupping booking widget', iso(-20));
  insertVersion.run('ver_kaffa_3', 'biz_kaffa', 3, defaultLayout, defaultTheme, defaultPages, 'published', 'Hana Tadesse', 'Updated harvest promotion banner', iso(-2));
  insertVersion.run('ver_hotel_1', 'biz_hotel', 1, defaultLayout, defaultTheme, defaultPages, 'published', 'Dawit Mekonnen (Platform Super Admin)', 'DFY initial hospitality build', iso(-40));
  insertVersion.run('ver_salon_1', 'biz_salon', 1, defaultLayout, defaultTheme, defaultPages, 'published', 'Chaltu Gemechu', 'AI-generated spa booking layout', iso(-28));

  // 6. Seed Employees across roles
  const insertEmployee = db.prepare(`
    INSERT INTO employees (id, business_id, user_id, name, email, role, permissions_json, branch_id, schedule_json, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEmployee.run('emp_1', 'biz_kaffa', 'usr_owner_1', 'Hana Tadesse', 'hana@tomocacraft.et', 'owner', JSON.stringify(['all']), 'br_kaffa_1', JSON.stringify({ shift: 'Mon-Sat 08:00-18:00' }), 'active', iso(-60));
  insertEmployee.run('emp_2', 'biz_kaffa', null, 'Robel Girma', 'robel@kaffaorigin.et', 'manager', JSON.stringify(['orders.manage', 'products.manage', 'bookings.manage', 'support.reply', 'analytics.view']), 'br_kaffa_2', JSON.stringify({ shift: 'Mon-Fri 08:00-17:30' }), 'active', iso(-50));
  insertEmployee.run('emp_3', 'biz_kaffa', null, 'Meron Hailu', 'meron@kaffaorigin.et', 'support', JSON.stringify(['support.reply', 'orders.view', 'bookings.view']), 'br_kaffa_1', JSON.stringify({ shift: 'Mon-Sat 09:00-18:00' }), 'active', iso(-40));
  insertEmployee.run('emp_4', 'biz_kaffa', null, 'Natnael Bekele', 'natnael@kaffaorigin.et', 'sales', JSON.stringify(['orders.manage', 'customers.view', 'promotions.view']), 'br_kaffa_1', JSON.stringify({ shift: 'Tue-Sun 10:00-19:00' }), 'active', iso(-32));
  insertEmployee.run('emp_5', 'biz_kaffa', null, 'Lidiya Assefa', 'lidiya@kaffaorigin.et', 'product_manager', JSON.stringify(['products.manage', 'builder.edit']), 'br_kaffa_1', JSON.stringify({ shift: 'Mon-Fri 09:00-17:00' }), 'active', iso(-25));
  insertEmployee.run('emp_6', 'biz_kaffa', null, 'Samuel Tesfaye', 'samuel@kaffaorigin.et', 'analyst', JSON.stringify(['analytics.view', 'reports.export']), 'br_kaffa_1', JSON.stringify({ shift: 'Remote Flexible' }), 'active', iso(-18));
  insertEmployee.run('emp_7', 'biz_hotel', 'usr_owner_2', 'Abebe Bikila', 'abebe@abyssiniahotel.et', 'owner', JSON.stringify(['all']), 'br_hotel_1', JSON.stringify({ shift: 'Mon-Sat 08:00-18:00' }), 'active', iso(-45));
  insertEmployee.run('emp_8', 'biz_salon', 'usr_owner_3', 'Chaltu Gemechu', 'chaltu@oliabeauty.et', 'owner', JSON.stringify(['all']), 'br_salon_1', JSON.stringify({ shift: 'Mon-Sat 09:00-19:00' }), 'active', iso(-30));

  // 7. Seed Products
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, business_id, category_name, name, description, price, compare_at_price,
      currency, stock, sku, variations_json, featured, available, image_type,
      views_count, likes_count, purchases_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    'prd_1', 'biz_kaffa', 'Single-Origin Beans', 'Yirgacheffe Halo Beriti Grade 1 (500g)',
    'Washed process micro-lot with jasmine aromatics, bergamot, and white peach finish. Roasted for filter and espresso.',
    980, 1150, 'ETB', 42, 'KF-YRG-500',
    JSON.stringify(['Whole Bean', 'Espresso Grind', 'V60 Filter Grind']),
    1, 1, 'coffee', 428, 119, 64, iso(-55)
  );
  insertProduct.run(
    'prd_2', 'biz_kaffa', 'Single-Origin Beans', 'Guji Uraga Anaerobic Natural (500g)',
    'Experimental 72-hour fermentation lot bursting with wild strawberry, dark cacao, and syrupy body.',
    1250, 1400, 'ETB', 18, 'KF-GUJ-500',
    JSON.stringify(['Whole Bean', 'Filter Grind']),
    1, 1, 'coffee', 362, 94, 48, iso(-50)
  );
  insertProduct.run(
    'prd_3', 'biz_kaffa', 'Brewing Hardware', 'Artisan Matte Ceramic V60 Pour-Over Kit',
    'Includes hand-glazed thermal retention ceramic dripper, 600ml borosilicate range server, and 100 unbleached filters.',
    3450, 3900, 'ETB', 9, 'KF-HW-V60',
    JSON.stringify(['Obsidian Matte', 'Warm Travertine']),
    1, 1, 'ceramic', 510, 142, 14, iso(-45) // High interest, lower conversion -> highlighted in Product Analytics!
  );
  insertProduct.run(
    'prd_4', 'biz_kaffa', 'Leather & Carry', 'Handcrafted Cognac Highland Leather Tote',
    'Full-grain Ethiopian highland leather everyday work & travel tote with brass hardware and padded 16-inch laptop sleeve.',
    6800, 7500, 'ETB', 6, 'KF-LTH-01',
    JSON.stringify(['Cognac Tan', 'Espresso Brown']),
    0, 1, 'leather', 389, 128, 9, iso(-35)
  );
  insertProduct.run(
    'prd_5', 'biz_kaffa', 'Cold Brew & RTD', 'Nitro Cold Brew 6-Pack Cans (250ml)',
    'Velvety nitrogen-infused Sidama cold brew with zero added sugar. Chilled express courier delivery.',
    1100, null, 'ETB', 35, 'KF-NTR-06',
    JSON.stringify(['Original Black', 'Cardamom Infused']),
    0, 1, 'coldbrew', 215, 53, 39, iso(-25)
  );

  // Products for Hotel & Salon
  insertProduct.run(
    'prd_h1', 'biz_hotel', 'Dining & Packages', 'Executive Sunday Brunch & Pool Pass (For 2)',
    'All-inclusive artisan buffet, live jazz courtyard seating, and heated infinity pool access.',
    4200, 4800, 'ETB', 25, 'SH-BRN-02', JSON.stringify(['Standard Seating', 'VIP Cabana']), 1, 1, 'hotel', 195, 64, 28, iso(-40)
  );
  insertProduct.run(
    'prd_s1', 'biz_salon', 'Botanical Skincare', 'Cold-Pressed Moringa & Frankincense Elixir (50ml)',
    'Pure wild-harvested Ethiopian frankincense and moringa seed facial oil for deep overnight restoration.',
    1850, 2100, 'ETB', 19, 'OB-ELX-50', JSON.stringify(['50ml Dropper']), 1, 1, 'salon', 164, 51, 22, iso(-25)
  );

  // 8. Seed Services & Bookable Listings
  const insertService = db.prepare(`
    INSERT INTO services_listings (id, business_id, name, description, duration_mins, price, currency, capacity, available_slots_json, available, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertService.run('srv_1', 'biz_kaffa', 'Private Roastery Sensory Cupping & Tasting', 'Guided 60-minute tasting of 5 export-grade Ethiopian micro-lots with our head Q-Grader.', 60, 850, 'ETB', 6, JSON.stringify(['10:00', '14:00', '16:30']), 1, iso(-50));
  insertService.run('srv_2', 'biz_kaffa', 'Home Barista Espresso Calibration Workshop', 'Hands-on extraction, grind dial-in, and milk micro-foam masterclass.', 90, 1600, 'ETB', 4, JSON.stringify(['11:00', '15:00']), 1, iso(-40));
  insertService.run('srv_h1', 'biz_hotel', 'Panoramic Diplomatic Suite (Per Night)', 'King suite with private terrace, airport VIP pickup, and complimentary breakfast.', 1440, 14500, 'ETB', 5, JSON.stringify(['14:00 Check-in']), 1, iso(-42));
  insertService.run('srv_s1', 'biz_salon', 'Signature Moroccan Hammam & Botanical Massage', '90-minute eucalyptus steam, black soap exfoliation, and warm aromatherapy massage.', 90, 3200, 'ETB', 2, JSON.stringify(['09:30', '11:30', '14:30', '17:00']), 1, iso(-28));

  // 9. Seed Customers
  const insertCustomer = db.prepare(`
    INSERT INTO customers (
      id, business_id, name, phone, email, telegram_id, telegram_username,
      segment, loyalty_points, referral_code, consent_marketing, source,
      visits_count, total_spent, last_seen_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCustomer.run('cus_1', 'biz_kaffa', 'Biniyam Alemayehu', '+251 911 405 102', 'biniyam@gmail.com', '8192011', 'bini_addis', 'vip', 480, 'REF-BINI88', 1, 'telegram_mini_app', 14, 14250, iso(0, -1), iso(-52));
  insertCustomer.run('cus_2', 'biz_kaffa', 'Selamawit Tekle', '+251 912 839 201', 'selam.t@yahoo.com', '8192022', 'selam_t', 'returning', 220, 'REF-SELA21', 1, 'telegram_channel', 7, 6480, iso(0, -3), iso(-38));
  insertCustomer.run('cus_3', 'biz_kaffa', 'Kaleb Desta', '+251 913 771 920', 'kaleb@outlook.com', '', '', 'returning', 110, 'REF-KALE90', 1, 'web_store', 4, 4430, iso(-1), iso(-21));
  insertCustomer.run('cus_4', 'biz_kaffa', 'Fikirte Mulugeta', '+251 911 662 319', 'fikirte@gmail.com', '8192044', 'fikir_m', 'first_time', 60, 'REF-FIKI12', 1, 'telegram_mini_app', 2, 1960, iso(0, -2), iso(-4));
  insertCustomer.run('cus_5', 'biz_kaffa', 'Dagmawi Solomon', '+251 921 550 811', 'dagi@gmail.com', '8192055', 'dagi_sol', 'first_time', 35, 'REF-DAGI77', 0, 'referral', 1, 1250, iso(0, -5), iso(0, -6));
  insertCustomer.run('cus_h1', 'biz_hotel', 'Ambassador Dr. Sofia Mengistu', '+251 911 100 200', 'sofia@uneca.org', '9001122', 'sofia_diplomat', 'vip', 950, 'REF-SOFI01', 1, 'telegram_mini_app', 5, 43500, iso(-1), iso(-35));

  // 10. Seed Orders & Verified Payments (Distinguishing submitted orders vs verified payments)
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, business_id, order_number, customer_id, customer_name, customer_phone,
      source, items_json, subtotal, discount_amount, discount_code, total, currency,
      status, delivery_status, delivery_address, assigned_employee_id,
      payment_status, payment_method, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (
      id, scope, business_id, reference_code, order_id, booking_id,
      amount, currency, method, provider_tx_id, status, verified_at, verified_by, description, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Order 1: Today - Completed & Paid via Telebirr
  insertOrder.run(
    'ord_1001', 'biz_kaffa', 'ORD-2026-1001', 'cus_1', 'Biniyam Alemayehu', '+251 911 405 102',
    'telegram', JSON.stringify([{ productId: 'prd_1', name: 'Yirgacheffe Halo Beriti Grade 1 (500g)', qty: 2, price: 980 }, { productId: 'prd_2', name: 'Guji Uraga Anaerobic Natural (500g)', qty: 1, price: 1250 }]),
    3210, 0, '', 3210, 'ETB', 'completed', 'delivered', 'Bole Medhanialem, Morning Star Mall 4th Fl', 'emp_2', 'paid', 'telebirr', iso(0, -4)
  );
  insertPayment.run('pay_1001', 'business', 'biz_kaffa', 'TX-TB-992817', 'ord_1001', null, 3210, 'ETB', 'telebirr', 'TLB202611019928', 'verified', iso(0, -4), 'Webhook Verifier', 'Order ORD-2026-1001 payment', iso(0, -4));

  // Order 2: Today - Confirmed & Paid via Telegram Stars
  insertOrder.run(
    'ord_1002', 'biz_kaffa', 'ORD-2026-1002', 'cus_4', 'Fikirte Mulugeta', '+251 911 662 319',
    'telegram', JSON.stringify([{ productId: 'prd_1', name: 'Yirgacheffe Halo Beriti Grade 1 (500g)', qty: 2, price: 980 }]),
    1960, 0, '', 1960, 'ETB', 'confirmed', 'preparing_package', 'CMC Michael, Sunshine Real Estate #14', 'emp_4', 'paid', 'telegram_stars', iso(0, -2)
  );
  insertPayment.run('pay_1002', 'business', 'biz_kaffa', 'TX-STR-881204', 'ord_1002', null, 1960, 'ETB', 'telegram_stars', 'TGX_STARS_77412', 'verified', iso(0, -2), 'Telegram Stars Bot API', 'Order ORD-2026-1002 payment', iso(0, -2));

  // Order 3: Today - Pending Order awaiting payment verification (Shows distinction between submitted order and verified payment!)
  insertOrder.run(
    'ord_1003', 'biz_kaffa', 'ORD-2026-1003', 'cus_5', 'Dagmawi Solomon', '+251 921 550 811',
    'telegram', JSON.stringify([{ productId: 'prd_2', name: 'Guji Uraga Anaerobic Natural (500g)', qty: 1, price: 1250 }]),
    1250, 0, '', 1250, 'ETB', 'pending', 'awaiting_dispatch', 'Kazanchis, Near Elilly Hotel', 'emp_4', 'pending_verification', 'cbe_birr', iso(0, -1)
  );
  insertPayment.run('pay_1003', 'business', 'biz_kaffa', 'TX-CBE-774190', 'ord_1003', null, 1250, 'ETB', 'cbe_birr', 'FT26305K991', 'initiated', null, null, 'Order ORD-2026-1003 pending verification', iso(0, -1));

  // Order 4: 2 Days Ago - Completed & Paid via Web Card
  insertOrder.run(
    'ord_1004', 'biz_kaffa', 'ORD-2026-1004', 'cus_3', 'Kaleb Desta', '+251 913 771 920',
    'web', JSON.stringify([{ productId: 'prd_3', name: 'Artisan Matte Ceramic V60 Pour-Over Kit', qty: 1, price: 3450 }, { productId: 'prd_1', name: 'Yirgacheffe Halo Beriti Grade 1 (500g)', qty: 1, price: 980 }]),
    4430, 0, '', 4430, 'ETB', 'completed', 'delivered', 'Old Airport, Near ICS Campus', 'emp_2', 'paid', 'card', iso(-2)
  );
  insertPayment.run('pay_1004', 'business', 'biz_kaffa', 'TX-CRD-662910', 'ord_1004', null, 4430, 'ETB', 'card', 'CHAPA_TX_883920', 'verified', iso(-2), 'Webhook Verifier', 'Order ORD-2026-1004 payment', iso(-2));

  // Order 5: 5 Days Ago - Completed & Paid via Telebirr
  insertOrder.run(
    'ord_1005', 'biz_kaffa', 'ORD-2026-1005', 'cus_2', 'Selamawit Tekle', '+251 912 839 201',
    'telegram', JSON.stringify([{ productId: 'prd_4', name: 'Handcrafted Cognac Highland Leather Tote', qty: 1, price: 6800 }]),
    6800, 320, 'TELEBIZ15', 6480, 'ETB', 'completed', 'delivered', 'Sarbet, Adams Pavilion 2nd Fl', 'emp_2', 'paid', 'telebirr', iso(-5)
  );
  insertPayment.run('pay_1005', 'business', 'biz_kaffa', 'TX-TB-551829', 'ord_1005', null, 6480, 'ETB', 'telebirr', 'TLB202610275518', 'verified', iso(-5), 'Webhook Verifier', 'Order ORD-2026-1005 payment', iso(-5));

  // Order 6: 12 Days Ago - Completed & Paid
  insertOrder.run(
    'ord_1006', 'biz_kaffa', 'ORD-2026-1006', 'cus_1', 'Biniyam Alemayehu', '+251 911 405 102',
    'telegram', JSON.stringify([{ productId: 'prd_4', name: 'Handcrafted Cognac Highland Leather Tote', qty: 1, price: 6800 }, { productId: 'prd_5', name: 'Nitro Cold Brew 6-Pack Cans (250ml)', qty: 2, price: 1100 }]),
    9000, 0, '', 9000, 'ETB', 'completed', 'delivered', 'Bole Medhanialem, Morning Star Mall', 'emp_2', 'paid', 'telebirr', iso(-12)
  );
  insertPayment.run('pay_1006', 'business', 'biz_kaffa', 'TX-TB-449102', 'ord_1006', null, 9000, 'ETB', 'telebirr', 'TLB202610194491', 'verified', iso(-12), 'Webhook Verifier', 'Order ORD-2026-1006 payment', iso(-12));

  // Order for Hotel
  insertOrder.run(
    'ord_h1', 'biz_hotel', 'ORD-SH-2001', 'cus_h1', 'Ambassador Dr. Sofia Mengistu', '+251 911 100 200',
    'telegram', JSON.stringify([{ productId: 'prd_h1', name: 'Executive Sunday Brunch & Pool Pass (For 2)', qty: 2, price: 4200 }]),
    8400, 0, '', 8400, 'ETB', 'completed', 'delivered', 'In-House Suite 402', 'emp_7', 'paid', 'card', iso(-3)
  );
  insertPayment.run('pay_h1', 'business', 'biz_hotel', 'TX-SH-99102', 'ord_h1', null, 8400, 'ETB', 'card', 'CHAPA_SH_99102', 'verified', iso(-3), 'Webhook Verifier', 'Hotel Brunch Order', iso(-3));

  // Platform Subscription & Add-on Payments (Separate scope = 'platform')
  insertPayment.run('pay_plat_1', 'platform', 'biz_kaffa', 'PLAT-SUB-8801', null, null, 24000, 'ETB', 'cbe_birr', 'CBE_CORP_8801', 'verified', iso(-60), 'Platform Billing', 'Enterprise Yearly Plan Subscription', iso(-60));
  insertPayment.run('pay_plat_2', 'platform', 'biz_kaffa', 'PLAT-ADD-8802', null, null, 8500, 'ETB', 'telebirr', 'TLB_CORP_8802', 'verified', iso(-58), 'Platform Billing', 'Omnichannel Support Inbox Pro (Yearly)', iso(-58));
  insertPayment.run('pay_plat_3', 'platform', 'biz_hotel', 'PLAT-DFY-8803', null, null, 4500, 'ETB', 'cbe_birr', 'CBE_CORP_8803', 'verified', iso(-45), 'Platform Billing', 'Done-For-You Bespoke Concierge Setup', iso(-45));
  insertPayment.run('pay_plat_4', 'platform', 'biz_realty', 'PLAT-SUB-8804', null, null, 14500, 'ETB', 'card', 'CHAPA_PLAT_8804', 'verified', iso(-15), 'Platform Billing', 'Growth Yearly Plan + DFY Retainer', iso(-15));

  // 11. Seed Bookings & Reservations
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, business_id, booking_number, service_id, service_name, customer_id,
      customer_name, customer_phone, booking_date, booking_time, guests,
      status, payment_status, amount, currency, notes, assigned_employee_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBooking.run('bkg_1', 'biz_kaffa', 'BKG-2026-501', 'srv_1', 'Private Roastery Sensory Cupping & Tasting', 'cus_1', 'Biniyam Alemayehu', '+251 911 405 102', '2026-11-03', '14:00', 2, 'confirmed', 'paid', 1700, 'ETB', 'Interested in washed Guji micro-lots.', 'emp_2', iso(-1));
  insertBooking.run('bkg_2', 'biz_kaffa', 'BKG-2026-502', 'srv_2', 'Home Barista Espresso Calibration Workshop', 'cus_2', 'Selamawit Tekle', '+251 912 839 201', '2026-11-05', '11:00', 1, 'requested', 'unpaid', 1600, 'ETB', 'Bringing Rocket Appartamento portafilter.', 'emp_2', iso(0, -3));
  insertBooking.run('bkg_h1', 'biz_hotel', 'BKG-SH-901', 'srv_h1', 'Panoramic Diplomatic Suite (Per Night)', 'cus_h1', 'Ambassador Dr. Sofia Mengistu', '+251 911 100 200', '2026-11-10', '14:00 Check-in', 2, 'confirmed', 'paid', 29000, 'ETB', '2 nights, airport VIP pickup requested.', 'emp_7', iso(-2));

  // 12. Seed Customer Support Conversations & Platform Support
  const insertConv = db.prepare(`
    INSERT INTO support_conversations (
      id, scope, business_id, customer_id, customer_name, telegram_chat_id,
      channel, subject, status, assigned_employee_id, unread_count, first_response_mins, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMsg = db.prepare(`
    INSERT INTO support_messages (id, conversation_id, sender_type, sender_name, body, is_internal_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertConv.run('cnv_1', 'business', 'biz_kaffa', 'cus_1', 'Biniyam Alemayehu (@bini_addis)', 'tg_chat_8192011', 'telegram_bot', 'Grind size adjustment for ORD-2026-1002 & wholesale inquiry', 'open', 'emp_3', 1, 3, iso(0, -3), iso(0, -1));
  insertMsg.run('msg_1', 'cnv_1', 'customer', 'Biniyam Alemayehu', 'Selam! Can I request V60 medium-fine grind on the Guji bag in my order? Also do you offer 5kg office subscriptions?', 0, iso(0, -3));
  insertMsg.run('msg_2', 'cnv_1', 'agent', 'Meron Hailu (Support)', 'Selam Biniyam! We have updated your roast note to V60 medium-fine grind. For 5kg office subscriptions, we offer a 18% recurring discount.', 0, iso(0, -2));
  insertMsg.run('msg_3', 'cnv_1', 'internal_note', 'Meron Hailu (Support)', 'INTERNAL NOTE: VIP customer with 14+ orders. Flagged for Robel to share wholesale tier sheet.', 1, iso(0, -2));
  insertMsg.run('msg_4', 'cnv_1', 'customer', 'Biniyam Alemayehu', 'That sounds great! Please send the 5kg monthly contract link right here in Telegram.', 0, iso(0, -1));

  insertConv.run('cnv_2', 'business', 'biz_kaffa', 'cus_5', 'Dagmawi Solomon (@dagi_sol)', 'tg_chat_8192055', 'telegram_business', 'CBE Birr reference FT26305K991 submitted for ORD-2026-1003', 'pending', 'emp_4', 0, 5, iso(0, -1), iso(0, -1));
  insertMsg.run('msg_5', 'cnv_2', 'customer', 'Dagmawi Solomon', 'Hi, I transferred 1,250 ETB via CBE Birr for order ORD-2026-1003. Ref is FT26305K991.', 0, iso(0, -1));
  insertMsg.run('msg_6', 'cnv_2', 'bot_auto', 'Kaffa Auto-Assistant', 'Thank you! Our finance team is verifying transaction FT26305K991 and will dispatch your courier shortly.', 0, iso(0, -1));

  // Platform Owner <-> Business Owner Support Thread
  insertConv.run('cnv_plat_1', 'platform', 'biz_realty', 'usr_owner_4', 'Yonas Kebede (Finfinnee Urban Realty)', 'tg_chat_77419283', 'platform_support', 'DFY Mini App Custom Floorplan Module & Webhook Setup', 'open', 'usr_superadmin', 1, 8, iso(-2), iso(0, -2));
  insertMsg.run('msg_p1', 'cnv_plat_1', 'customer', 'Yonas Kebede (Owner)', 'Hello TeleBiz DFY Team, we uploaded the 6 penthouse floorplans. Can you enable the appointment slot picker for diaspora buyers?', 0, iso(-2));
  insertMsg.run('msg_p2', 'cnv_plat_1', 'agent', 'Dawit Mekonnen (Platform Super Admin)', 'Hi Yonas! We configured the slot picker and connected @FinfinneeRealtyBot. Ready for your preview before publishing.', 0, iso(0, -2));

  // 13. Seed Canned Replies & FAQs
  const insertCanned = db.prepare(`
    INSERT INTO canned_replies (id, business_id, title, shortcut, content, is_faq, auto_trigger_keyword)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertCanned.run('can_1', 'biz_kaffa', 'Express Delivery SLA', '/delivery', 'All orders placed before 17:00 are delivered within 45–60 minutes across Addis Ababa via our insulated bike couriers.', 1, 'delivery');
  insertCanned.run('can_2', 'biz_kaffa', 'Payment Verification Info', '/verify', 'Once your Telebirr, CBE Birr, or Telegram Stars transaction is confirmed by the gateway, your order status automatically updates to Confirmed.', 1, 'payment');
  insertCanned.run('can_3', 'biz_kaffa', 'Roast Schedule', '/roast', 'We roast fresh micro-lots every Tuesday and Friday morning at our Bole Atlas Flagship Roastery.', 1, 'fresh');

  // 14. Seed 10-Stage Sales Funnel Analytics Events (Realistic counts descending properly across stages)
  const insertEvent = db.prepare(`
    INSERT INTO analytics_events (id, business_id, customer_id, session_id, event_type, page_name, product_id, source, device_type, duration_secs, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const funnelPlan: Array<{ type: string; count: number }> = [
    { type: 'app_visit', count: 148 },
    { type: 'page_view', count: 132 },
    { type: 'product_view', count: 108 },
    { type: 'product_like', count: 64 },
    { type: 'buy_click', count: 46 },
    { type: 'checkout_init', count: 34 },
    { type: 'order_submit', count: 24 },
    { type: 'payment_attempt', count: 22 },
    { type: 'payment_confirmed', count: 19 },
    { type: 'purchase_complete', count: 18 }
  ];

  const sources = ['telegram', 'telegram', 'telegram', 'channel', 'web'];
  const devices = ['mobile_tg', 'mobile_tg', 'mobile_tg', 'mobile_web', 'desktop_web'];
  const pages = ['home', 'catalog', 'product_detail', 'bookings', 'checkout'];
  const products = ['prd_1', 'prd_2', 'prd_3', 'prd_4', 'prd_5'];

  let evIdx = 1;
  for (const stage of funnelPlan) {
    for (let i = 0; i < stage.count; i++) {
      const daysAgo = -(i % 14);
      insertEvent.run(
        `ev_${evIdx++}`,
        'biz_kaffa',
        `cus_${(i % 5) + 1}`,
        `sess_${(i % 45) + 100}`,
        stage.type,
        pages[i % pages.length],
        products[i % products.length],
        sources[i % sources.length],
        devices[i % devices.length],
        65 + (i % 180),
        iso(daysAgo, -(i % 12))
      );
    }
  }

  // 15. Seed Business Active Add-ons
  const insertBizAddon = db.prepare(`
    INSERT INTO business_addons (id, business_id, addon_id, status, pricing_override, expires_at, granted_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBizAddon.run('ba_1', 'biz_kaffa', 'add_support', 'active', null, iso(305), 'self', iso(-58));
  insertBizAddon.run('ba_2', 'biz_kaffa', 'add_analytics', 'active', null, iso(305), 'self', iso(-58));
  insertBizAddon.run('ba_3', 'biz_kaffa', 'add_ai_builder', 'active', null, iso(305), 'self', iso(-45));
  insertBizAddon.run('ba_4', 'biz_kaffa', 'add_loyalty', 'promotional', 0, iso(60), 'usr_superadmin', iso(-30));
  insertBizAddon.run('ba_5', 'biz_hotel', 'add_dfy_design', 'active', null, iso(365), 'usr_superadmin', iso(-45));

  // 16. Seed Promotions, Campaigns & Expenses
  const insertPromo = db.prepare(`
    INSERT INTO promotions (id, business_id, code, name, discount_type, discount_value, min_order_amount, usage_count, max_uses, active, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPromo.run('prm_1', 'biz_kaffa', 'TELEBIZ15', 'First Telegram Mini App Order 15% Off', 'percentage', 15, 800, 19, 200, 1, iso(60));
  insertPromo.run('prm_2', 'biz_kaffa', 'HARVEST300', 'Peak Harvest 300 ETB Off Orders Over 2,500 ETB', 'fixed', 300, 2500, 8, 100, 1, iso(30));

  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, business_id, name, type, target_segment, message_body, sent_count, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCampaign.run('cmp_1', 'biz_kaffa', 'Tuesday Fresh Roast Drop Alert', 'broadcast', 'vip', 'Fresh Guji Anaerobic Natural micro-lot just came out of the roaster! Tap below to open our Telegram Mini App and reserve your bag.', 142, 'sent', iso(-3));
  insertCampaign.run('cmp_2', 'biz_kaffa', 'Abandoned Cart 1-Hour Reminder', 'abandoned_cart', 'returning', 'Your specialty coffee selection is still waiting in your cart. Complete checkout in 1 tap via Telebirr or Telegram Stars.', 38, 'active_automation', iso(-10));

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, business_id, branch_id, category, title, amount, currency, incurred_date, recorded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertExpense.run('exp_1', 'biz_kaffa', 'br_kaffa_1', 'Inventory & Raw Beans', 'Yirgacheffe Washing Station Lot Purchase (120kg)', 48500, 'ETB', '2026-10-20', 'Hana Tadesse', iso(-11));
  insertExpense.run('exp_2', 'biz_kaffa', 'br_kaffa_1', 'Packaging & Print', 'Matte Valve Coffee Pouches & Custom Labels', 9200, 'ETB', '2026-10-25', 'Robel Girma', iso(-6));
  insertExpense.run('exp_3', 'biz_kaffa', 'br_kaffa_2', 'Logistics & Couriers', 'Addis Express Bike Courier Weekly Settlement', 4600, 'ETB', '2026-10-30', 'Robel Girma', iso(-2));

  // 17. Seed Administrative Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, business_id, action, target_type, target_id, previous_value, new_value, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('aud_1', 'usr_superadmin', 'Dawit Mekonnen (Platform Super Admin)', 'super_admin', 'biz_kaffa', 'GRANT_PROMOTIONAL_ADDON', 'business_addon', 'add_loyalty', 'none', 'promotional (60 days free)', 'Early adopter enterprise partner reward', iso(-30));
  insertAudit.run('aud_2', 'usr_superadmin', 'Dawit Mekonnen (Platform Super Admin)', 'super_admin', 'biz_hotel', 'PUBLISH_DFY_MINI_APP', 'business', 'biz_hotel', 'dfy_status: ready_for_preview', 'dfy_status: published', 'Owner approved room reservation flow and webhook test', iso(-40));
  insertAudit.run('aud_3', 'usr_superadmin', 'Dawit Mekonnen (Platform Super Admin)', 'super_admin', 'biz_salon', 'TRIGGER_GRACE_PERIOD_NOTICE', 'subscription', 'biz_salon', 'status: active', 'status: grace_period (7 days)', 'Monthly renewal invoice pending settlement; sales data preserved', iso(-2));
}
