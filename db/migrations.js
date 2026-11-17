// Numbered migrations for SQLite. Each migration runs in a single transaction and is recorded in
// schema_migrations. Safe to re-run multiple times (already-applied migrations are skipped).
// Rollback: each migration has a "down" script (reverse SQL); run with: node tools/migrate.js down <id>
// Before migrating in production: back up data/app.db.

export const MIGRATIONS = [
  {
    id: "2026_10_30_001_commerce_ai_plans",
    note: "Gói Pro, đăng ký thành viên, đơn hàng, giao dịch, AI Tutor, nhật ký kiểm toán, email người dùng.",
    up: `
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        months INTEGER NOT NULL CHECK (months > 0),
        price_vnd INTEGER NOT NULL CHECK (price_vnd >= 0),
        active INTEGER NOT NULL DEFAULT 1,
        sort INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id TEXT REFERENCES plans(id),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','expired','revoked')),
        starts_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        renew_reminder INTEGER NOT NULL DEFAULT 1,
        source TEXT NOT NULL DEFAULT 'order',
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id, expires_at);
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id TEXT NOT NULL REFERENCES plans(id),
        amount_vnd INTEGER NOT NULL CHECK (amount_vnd >= 0),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','expired','canceled')),
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        paid_at TEXT,
        payment_id INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at);
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        provider_txn_id TEXT NOT NULL,
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        amount_vnd INTEGER NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL CHECK (status IN ('matched','unmatched','mismatch','ignored','manual')),
        note TEXT NOT NULL DEFAULT '',
        raw_json TEXT NOT NULL DEFAULT '{}',
        received_at TEXT NOT NULL,
        UNIQUE (provider, provider_txn_id)
      );
      CREATE INDEX IF NOT EXISTS idx_pay_status ON payments(status, received_at);
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL DEFAULT '',
        exercise_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_aiconv_user ON ai_conversations(user_id, updated_at);
      CREATE TABLE IF NOT EXISTS ai_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user','assistant')),
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_aimsg_conv ON ai_messages(conversation_id, id);
      CREATE TABLE IF NOT EXISTS ai_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        model TEXT NOT NULL DEFAULT '',
        mode TEXT NOT NULL DEFAULT '',
        input_tokens INTEGER NOT NULL DEFAULT 0,
        output_tokens INTEGER NOT NULL DEFAULT 0,
        cost_usd_micro INTEGER NOT NULL DEFAULT 0,
        ok INTEGER NOT NULL DEFAULT 1,
        error TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_aiuse_user ON ai_usage(user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_aiuse_created ON ai_usage(created_at);
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id INTEGER,
        action TEXT NOT NULL,
        target TEXT NOT NULL DEFAULT '',
        detail TEXT NOT NULL DEFAULT '',
        ip TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
    `,
    // Add email column via ALTER (SQLite has no IF NOT EXISTS for columns) -> handled in code.
    after(db) {
      const cols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
      if (!cols.includes("email")) db.exec("ALTER TABLE users ADD COLUMN email TEXT");
      db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL AND email <> ''");
      const now = new Date().toISOString();
      const ins = db.prepare("INSERT OR IGNORE INTO plans (id, name, months, price_vnd, active, sort, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)");
      ins.run("pro_1m", "Pro 1 tháng", 1, 59000, 1, now);
      ins.run("pro_3m", "Pro 3 tháng", 3, 159000, 2, now);
      ins.run("pro_12m", "Pro 12 tháng", 12, 499000, 3, now);
    },
    down: `
      DROP INDEX IF EXISTS idx_users_email;
      DROP TABLE IF EXISTS audit_logs;
      DROP TABLE IF EXISTS ai_usage;
      DROP TABLE IF EXISTS ai_messages;
      DROP TABLE IF EXISTS ai_conversations;
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS subscriptions;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS plans;
    `,
    // Keep users.email column on rollback (older SQLite cannot safely drop columns); harmless to older code.
  },
  {
    id: "2026_10_30_003_order_claimed",
    note: "Thanh toán QR cá nhân: thời điểm học viên báo đã chuyển khoản.",
    up: "",
    after(db) {
      if (!db.prepare("PRAGMA table_info(orders)").all().some((c) => c.name === "claimed_at")) db.exec("ALTER TABLE orders ADD COLUMN claimed_at TEXT");
    },
    down: `ALTER TABLE orders DROP COLUMN claimed_at;`,
  },
  // ======================= 4.0.0: Bilingual LMS =======================
  {
    id: "2026_10_30_004_roles_lang",
    note: "Tách vai trò: admin (quản trị hệ thống), teacher (giáo viên có giấy phép), student, parent. Tài khoản 'teacher' cũ (đang là quản trị) chuyển thành 'admin'. Thêm ngôn ngữ người dùng.",
    up: "",
    after(db) {
      const cols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
      if (!cols.includes("lang")) db.exec("ALTER TABLE users ADD COLUMN lang TEXT NOT NULL DEFAULT 'vi'");
      const ids = db.prepare("SELECT id FROM users WHERE role = 'teacher'").all().map((r) => r.id);
      db.prepare("UPDATE users SET role = 'admin' WHERE role = 'teacher'").run();
      // Save list for accurate rollback
      db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (NULL, 'migration.roles', 'users', ?, '', ?)").run(JSON.stringify({ teacherToAdmin: ids }), new Date().toISOString());
    },
    downFn(db) {
      const r = db.prepare("SELECT detail FROM audit_logs WHERE action = 'migration.roles' ORDER BY id DESC LIMIT 1").get();
      const ids = r ? JSON.parse(r.detail).teacherToAdmin || [] : [];
      const up = db.prepare("UPDATE users SET role = 'teacher' WHERE id = ? AND role = 'admin'");
      for (const id of ids) up.run(id);
      db.prepare("UPDATE users SET role = 'student' WHERE role IN ('parent')").run();
      // Keep lang column (harmless to older versions)
    },
  },
  {
    id: "2026_10_30_005_entitlements",
    note: "Quyền học tập đa nguồn: cá nhân, quản trị tặng, giấy phép lớp, gia đình. Chép các kỳ Pro còn hạn sang.",
    up: `
      CREATE TABLE IF NOT EXISTS entitlements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        feature TEXT NOT NULL,
        source_type TEXT NOT NULL CHECK (source_type IN ('personal','admin_grant','license_seat','license_owner','family')),
        source_id INTEGER,
        starts_at TEXT NOT NULL,
        expires_at TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
        granted_by INTEGER,
        note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ent_user ON entitlements(user_id, feature, status);
      CREATE INDEX IF NOT EXISTS idx_ent_source ON entitlements(source_type, source_id);
    `,
    after(db) {
      const now = new Date().toISOString();
      const subs = db.prepare("SELECT * FROM subscriptions WHERE status IN ('active','canceled') AND expires_at > ?").all(now);
      const ins = db.prepare("INSERT INTO entitlements (user_id, feature, source_type, source_id, starts_at, expires_at, status, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', 'Chép từ subscriptions khi nâng cấp 4.0', ?, ?)");
      for (const s of subs) for (const f of ["pro", "ai_pro"]) ins.run(s.user_id, f, s.source === "admin" ? "admin_grant" : "personal", s.id, s.starts_at, s.expires_at, now, now);
    },
    down: `DROP TABLE IF EXISTS entitlements;`,
  },
  {
    id: "2026_10_30_006_plans_v2",
    note: "Gói theo loại (pro/family/teacher), số chỗ, gói chỉ báo giá, tính năng theo gói.",
    up: `
      CREATE TABLE IF NOT EXISTS plan_features (
        plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
        feature TEXT NOT NULL,
        value TEXT NOT NULL DEFAULT '1',
        PRIMARY KEY (plan_id, feature)
      );
    `,
    after(db) {
      const cols = db.prepare("PRAGMA table_info(plans)").all().map((c) => c.name);
      if (!cols.includes("kind")) db.exec("ALTER TABLE plans ADD COLUMN kind TEXT NOT NULL DEFAULT 'pro'");
      if (!cols.includes("seats")) db.exec("ALTER TABLE plans ADD COLUMN seats INTEGER NOT NULL DEFAULT 1");
      if (!cols.includes("quote_only")) db.exec("ALTER TABLE plans ADD COLUMN quote_only INTEGER NOT NULL DEFAULT 0");
      if (!cols.includes("name_en")) db.exec("ALTER TABLE plans ADD COLUMN name_en TEXT NOT NULL DEFAULT ''");
      const now = new Date().toISOString();
      db.exec("UPDATE plans SET name_en = 'Pro 1 month' WHERE id = 'pro_1m' AND name_en = ''; UPDATE plans SET name_en = 'Pro 3 months' WHERE id = 'pro_3m' AND name_en = ''; UPDATE plans SET name_en = 'Pro 12 months' WHERE id = 'pro_12m' AND name_en = '';");
      const ins = db.prepare("INSERT OR IGNORE INTO plans (id, name, name_en, months, price_vnd, active, sort, created_at, kind, seats, quote_only) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)");
      ins.run("family_1m", "Family 1 tháng (4 thành viên)", "Family 1 month (4 members)", 1, 149000, 10, now, "family", 4, 0);
      ins.run("family_3m", "Family 3 tháng (4 thành viên)", "Family 3 months (4 members)", 3, 399000, 11, now, "family", 4, 0);
      ins.run("family_12m", "Family 12 tháng (4 thành viên)", "Family 12 months (4 members)", 12, 1290000, 12, now, "family", 4, 0);
      ins.run("teacher_starter_1m", "Teacher Starter (10 học sinh) 1 tháng", "Teacher Starter (10 students) 1 month", 1, 199000, 20, now, "teacher", 10, 0);
      ins.run("teacher_standard_1m", "Teacher Standard (30 học sinh) 1 tháng", "Teacher Standard (30 students) 1 month", 1, 399000, 21, now, "teacher", 30, 0);
      ins.run("teacher_school_1m", "Teacher School (100 học sinh)", "Teacher School (100 students)", 1, 0, 22, now, "teacher", 100, 1);
      const f = db.prepare("INSERT OR IGNORE INTO plan_features (plan_id, feature, value) VALUES (?, ?, ?)");
      for (const p of db.prepare("SELECT id, kind, seats FROM plans").all()) {
        f.run(p.id, "pro", "1"); f.run(p.id, "ai_pro", "1");
        if (p.kind === "family") f.run(p.id, "family_seats", String(p.seats));
        if (p.kind === "teacher") { f.run(p.id, "class_create", "1"); f.run(p.id, "class_seats", String(p.seats)); f.run(p.id, "ai_teacher", "1"); }
      }
    },
    down: `DROP TABLE IF EXISTS plan_features; DELETE FROM plans WHERE kind IN ('family','teacher') AND id NOT IN (SELECT plan_id FROM orders);`,
  },
  {
    id: "2026_10_30_007_licenses",
    note: "Giấy phép giáo viên và chỗ học sinh.",
    up: `
      CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tier TEXT NOT NULL,
        seats INTEGER NOT NULL CHECK (seats > 0),
        starts_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
        source TEXT NOT NULL DEFAULT 'order',
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_lic_owner ON licenses(owner_id, status, expires_at);
      CREATE TABLE IF NOT EXISTS license_seats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_id INTEGER NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','released')),
        assigned_at TEXT NOT NULL,
        released_at TEXT,
        UNIQUE (license_id, user_id)
      );
    `,
    down: `DROP TABLE IF EXISTS license_seats; DROP TABLE IF EXISTS licenses;`,
  },
  {
    id: "2026_10_30_008_family",
    note: "Gói gia đình: nhóm, thành viên, chia sẻ tiến độ.",
    up: `
      CREATE TABLE IF NOT EXISTS family_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        seats INTEGER NOT NULL DEFAULT 4,
        starts_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS family_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','removed','declined')),
        share_progress INTEGER NOT NULL DEFAULT 0,
        invited_at TEXT NOT NULL,
        joined_at TEXT,
        UNIQUE (group_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_fm_user ON family_members(user_id, status);
    `,
    down: `DROP TABLE IF EXISTS family_members; DROP TABLE IF EXISTS family_groups;`,
  },
  {
    id: "2026_10_30_009_classrooms",
    note: "Lớp học, thành viên, lời mời.",
    up: `
      CREATE TABLE IF NOT EXISTS classrooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        join_code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','archived')),
        max_members INTEGER NOT NULL DEFAULT 0,
        require_approval INTEGER NOT NULL DEFAULT 0,
        starts_on TEXT,
        ends_on TEXT,
        created_by INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_class_teacher ON classrooms(teacher_id, status);
      CREATE TABLE IF NOT EXISTS class_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','removed','left')),
        joined_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE (class_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_cm_user ON class_members(user_id, status);
      CREATE TABLE IF NOT EXISTS class_invites (
        token TEXT PRIMARY KEY,
        class_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
        expires_at TEXT,
        max_uses INTEGER NOT NULL DEFAULT 0,
        uses INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `,
    down: `DROP TABLE IF EXISTS class_invites; DROP TABLE IF EXISTS class_members; DROP TABLE IF EXISTS classrooms;`,
  },
  {
    id: "2026_10_30_010_assignments",
    note: "Giao bài, đối tượng nhận, bài nộp + chấm tay.",
    up: `
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
        kind TEXT NOT NULL CHECK (kind IN ('exercise','custom')),
        ref_id TEXT,
        title TEXT NOT NULL,
        instructions TEXT NOT NULL DEFAULT '',
        custom_json TEXT NOT NULL DEFAULT '{}',
        due_at TEXT,
        allow_resubmit INTEGER NOT NULL DEFAULT 1,
        max_attempts INTEGER NOT NULL DEFAULT 0,
        target_all INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','closed','deleted')),
        created_by INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_asg_class ON assignments(class_id, status);
      CREATE TABLE IF NOT EXISTS assignment_targets (
        assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (assignment_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        attempt_no INTEGER NOT NULL,
        code TEXT NOT NULL,
        output TEXT NOT NULL DEFAULT '',
        passed INTEGER NOT NULL DEFAULT 0,
        auto_score INTEGER NOT NULL DEFAULT 0,
        manual_score INTEGER,
        feedback TEXT NOT NULL DEFAULT '',
        graded_by INTEGER,
        graded_at TEXT,
        late INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_asub ON assignment_submissions(assignment_id, user_id);
    `,
    down: `DROP TABLE IF EXISTS assignment_submissions; DROP TABLE IF EXISTS assignment_targets; DROP TABLE IF EXISTS assignments;`,
  },
  {
    id: "2026_10_30_011_class_tests",
    note: "Bài kiểm tra của lớp: câu hỏi, lượt làm.",
    up: `
      CREATE TABLE IF NOT EXISTS class_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        instructions TEXT NOT NULL DEFAULT '',
        duration_min INTEGER NOT NULL DEFAULT 30,
        open_at TEXT,
        due_at TEXT,
        max_attempts INTEGER NOT NULL DEFAULT 1,
        shuffle INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','closed','deleted')),
        created_by INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS class_test_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id INTEGER NOT NULL REFERENCES class_tests(id) ON DELETE CASCADE,
        idx INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('mcq','code')),
        points INTEGER NOT NULL DEFAULT 1,
        payload_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ctq ON class_test_questions(test_id, idx);
      CREATE TABLE IF NOT EXISTS class_test_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id INTEGER NOT NULL REFERENCES class_tests(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TEXT NOT NULL,
        ends_at TEXT NOT NULL,
        submitted_at TEXT,
        status TEXT NOT NULL DEFAULT 'doing' CHECK (status IN ('doing','done','late')),
        order_json TEXT NOT NULL DEFAULT '[]',
        answers_json TEXT NOT NULL DEFAULT '{}',
        detail_json TEXT NOT NULL DEFAULT '[]',
        score REAL,
        max_score REAL
      );
      CREATE INDEX IF NOT EXISTS idx_cta ON class_test_attempts(test_id, user_id);
    `,
    down: `DROP TABLE IF EXISTS class_test_attempts; DROP TABLE IF EXISTS class_test_questions; DROP TABLE IF EXISTS class_tests;`,
  },
  {
    id: "2026_10_30_012_i18n",
    note: "Ghi đè chuỗi giao diện tiếng Anh.",
    up: `
      CREATE TABLE IF NOT EXISTS ui_translations (
        lang TEXT NOT NULL,
        source TEXT NOT NULL,
        text TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (lang, source)
      );
    `,
    down: `DROP TABLE IF EXISTS ui_translations;`,
  },
  {
    id: "2026_10_30_013_payment_events",
    note: "Nhật ký mọi lần gọi webhook thanh toán.",
    up: `
      CREATE TABLE IF NOT EXISTS payment_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        verified INTEGER NOT NULL DEFAULT 0,
        reason TEXT NOT NULL DEFAULT '',
        txn_id TEXT,
        result TEXT NOT NULL DEFAULT '',
        ip TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_pe_created ON payment_events(created_at);
    `,
    down: `DROP TABLE IF EXISTS payment_events;`,
  },
  {
    id: "2026_10_30_014_teacher_students_logo",
    note: "Giáo viên quản lý học viên do mình tạo (users.managed_by) và logo hệ thống (brand_assets).",
    up: "",
    after(db) {
      const cols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
      if (!cols.includes("managed_by")) db.exec("ALTER TABLE users ADD COLUMN managed_by INTEGER REFERENCES users(id) ON DELETE SET NULL");
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_managed ON users(managed_by);
        CREATE TABLE IF NOT EXISTS brand_assets (
          kind TEXT PRIMARY KEY,
          mime TEXT NOT NULL,
          data BLOB NOT NULL,
          updated_by INTEGER,
          updated_at TEXT NOT NULL
        );`);
    },
    // Keep managed_by column on rollback (ignored by older versions)
    down: `DROP TABLE IF EXISTS brand_assets; DROP INDEX IF EXISTS idx_users_managed;`,
  },
  {
    id: "2026_11_01_015_entitlements_schema_fix",
    note: "Sửa schema bảng entitlements: thêm granted_by, updated_at; đồng bộ source_type từ cột source cũ (bản DB trước 4.0 thiếu cột).",
    up: "",
    after(db) {
      const cols = db.prepare("PRAGMA table_info(entitlements)").all().map((c) => c.name);
      if (!cols.includes("granted_by")) db.exec("ALTER TABLE entitlements ADD COLUMN granted_by INTEGER");
      if (!cols.includes("updated_at")) db.exec("ALTER TABLE entitlements ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''");
      // Older versions used column source (subscription/role/...) instead of source_type
      if (cols.includes("source") && cols.includes("source_type")) {
        db.exec(`UPDATE entitlements SET source_type = CASE
          WHEN source_type IS NOT NULL AND source_type != '' THEN source_type
          WHEN source = 'subscription' OR source = 'order' OR source = 'personal' THEN 'personal'
          WHEN source = 'admin' OR source = 'admin_grant' THEN 'admin_grant'
          WHEN source = 'family' THEN 'family'
          WHEN source = 'license' OR source = 'license_seat' THEN 'license_seat'
          WHEN source = 'license_owner' OR source = 'role' THEN 'license_owner'
          ELSE 'personal'
        END WHERE source_type IS NULL OR source_type = ''`);
      }
      // Backfill updated_at if empty
      db.exec("UPDATE entitlements SET updated_at = created_at WHERE updated_at IS NULL OR updated_at = ''");
      // Index supporting queries by source_type (if not already present)
      try { db.exec("CREATE INDEX IF NOT EXISTS idx_ent_source ON entitlements(source_type, source_id)"); } catch {}
      try { db.exec("CREATE INDEX IF NOT EXISTS idx_ent_user ON entitlements(user_id, feature, status)"); } catch {}
    },
    down: "", // Do not drop added columns (safe)
  },
  {
    id: "2026_11_01_016_notifications",
    note: "Thông báo trong ứng dụng: nộp bài, giấy phép, hết hạn Pro, lời nhắc giáo viên.",
    up: `
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind TEXT NOT NULL DEFAULT 'info',
        title TEXT NOT NULL,
        body TEXT NOT NULL DEFAULT '',
        link TEXT NOT NULL DEFAULT '',
        payload_json TEXT NOT NULL DEFAULT '{}',
        read_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read_at, id DESC);
    `,
    down: `DROP TABLE IF EXISTS notifications;`,
  },
  {
    id: "2026_11_01_017_password_resets",
    note: "Token đặt lại mật khẩu (quên mật khẩu tự phục hồi).",
    up: `
      CREATE TABLE IF NOT EXISTS password_resets (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        used_at TEXT,
        created_at TEXT NOT NULL,
        created_ip TEXT NOT NULL DEFAULT ''
      );
      CREATE INDEX IF NOT EXISTS idx_pwreset_user ON password_resets(user_id, expires_at);
    `,
    down: `DROP TABLE IF EXISTS password_resets;`,
  },
  {
    id: "2026_11_01_018_personal_learning_path",
    note: "Lưu bài đánh giá năng lực, lộ trình học cá nhân 7 ngày và trạng thái từng nhiệm vụ.",
    up: `
      CREATE TABLE IF NOT EXISTS learning_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind TEXT NOT NULL CHECK (kind IN ('entrance','weekly')),
        status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','expired')),
        questions_json TEXT NOT NULL,
        answers_json TEXT NOT NULL DEFAULT '[]',
        score INTEGER,
        max_score INTEGER NOT NULL DEFAULT 0,
        percent INTEGER,
        breakdown_json TEXT NOT NULL DEFAULT '[]',
        started_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        submitted_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_learning_assess_user ON learning_assessments(user_id, kind, started_at DESC);
      CREATE TABLE IF NOT EXISTS learning_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source_assessment_id INTEGER REFERENCES learning_assessments(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
        starts_at TEXT NOT NULL,
        ends_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_learning_plan_user ON learning_plans(user_id, status, created_at DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_plan_active ON learning_plans(user_id) WHERE status = 'active';
      CREATE TABLE IF NOT EXISTS learning_plan_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
        day_no INTEGER NOT NULL CHECK (day_no BETWEEN 1 AND 7),
        title TEXT NOT NULL,
        chapter_id TEXT,
        exercise_id TEXT,
        description TEXT NOT NULL DEFAULT '',
        estimated_minutes INTEGER NOT NULL DEFAULT 20,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
        completed_at TEXT,
        UNIQUE (plan_id, day_no)
      );
      CREATE INDEX IF NOT EXISTS idx_learning_day_plan ON learning_plan_days(plan_id, day_no);
    `,
    down: `DROP TABLE IF EXISTS learning_plan_days; DROP TABLE IF EXISTS learning_plans; DROP TABLE IF EXISTS learning_assessments;`,
  },
  {
    id: "2026_10_30_006_classes",
    note: "Compatibility marker for legacy release tooling; classrooms schema is created by migration 009_classrooms.",
    up: "",
    after(db) {
      if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'classrooms'").get()) throw new Error("Thiếu bảng classrooms; migration lớp học chưa được áp dụng.");
      // `classes` is a compatibility alias for older clients/migrations;
      // the canonical table is still `classrooms` and runtime logic never writes through the alias.
      const legacy = db.prepare("SELECT type FROM sqlite_master WHERE name = 'classes'").get();
      if (!legacy) db.exec(`CREATE VIEW classes AS SELECT id, teacher_id, name, join_code AS code, status, created_at FROM classrooms`);
    },
    down: `DROP VIEW IF EXISTS classes;`,
  },
  {
    id: "2026_10_30_007_assignments",
    note: "Compatibility marker for legacy release tooling; assignments schema is created by migration 010_assignments.",
    up: "",
    after(db) {
      if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'assignments'").get()) throw new Error("Thiếu bảng assignments; migration bài giao chưa được áp dụng.");
    },
  },
  {
    id: "2026_10_30_009_rubric",
    note: "Rubric chấm tay theo tiêu chí cho bài giao trong lớp.",
    up: `
      CREATE TABLE IF NOT EXISTS assignment_rubrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        max_score REAL NOT NULL CHECK (max_score > 0),
        position INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        UNIQUE (assignment_id, position)
      );
      CREATE INDEX IF NOT EXISTS idx_assignment_rubric_assignment ON assignment_rubrics(assignment_id, position);
      CREATE TABLE IF NOT EXISTS assignment_rubric_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        submission_id INTEGER NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        criterion_id INTEGER NOT NULL REFERENCES assignment_rubrics(id) ON DELETE CASCADE,
        score REAL NOT NULL CHECK (score >= 0),
        comment TEXT NOT NULL DEFAULT '',
        graded_by INTEGER,
        graded_at TEXT NOT NULL,
        UNIQUE (submission_id, criterion_id)
      );
      CREATE INDEX IF NOT EXISTS idx_assignment_rubric_scores_submission ON assignment_rubric_scores(submission_id);
    `,
    after(db) {
      const ac = db.prepare("PRAGMA table_info(assignments)").all().map((c) => c.name);
      if (!ac.includes("max_score")) db.exec("ALTER TABLE assignments ADD COLUMN max_score REAL NOT NULL DEFAULT 10");
    },
    down: `DROP TABLE IF EXISTS assignment_rubric_scores; DROP TABLE IF EXISTS assignment_rubrics;`,
  },
  {
    id: "2026_11_15_050_drop_programming_columns",
    note: "Bỏ cột liên kết cũ khỏi lộ trình học và hội thoại AI.",
    up: "",
    after(db) {
      const dropCol = (table, col) => {
        if (db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col)) db.exec(`ALTER TABLE ${table} DROP COLUMN ${col}`);
      };
      dropCol("learning_plan_days", "chapter_id");
      dropCol("learning_plan_days", "exercise_id");
      dropCol("ai_conversations", "exercise_id");
    },
  },
  {
    id: "2026_11_16_060_ensure_activity_streak_tables",
    note: "Đảm bảo bảng learning_activities và user_streaks tồn tại trên SQLite cài mới.",
    up: `
      CREATE TABLE IF NOT EXISTS learning_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        reference_id TEXT NOT NULL DEFAULT '',
        activity_date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_learning_activities_user_date ON learning_activities(user_id, activity_date);
      CREATE TABLE IF NOT EXISTS user_streaks (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_activity_date TEXT,
        updated_at TEXT NOT NULL
      );
    `,
    down: "",
  },
];

// backupDir: if provided and pending migrations exist on a non-empty DB, auto-backup first (VACUUM INTO: consistent snapshot).
export function migrate(db, log = console, backupDir = null) {
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const done = new Set(db.prepare("SELECT id FROM schema_migrations").all().map((r) => r.id));
  const applied = [];
  const pending = MIGRATIONS.filter((m) => !done.has(m.id));
  const hasUsers = (() => { try { return db.prepare("SELECT COUNT(*) AS n FROM users").get().n > 0; } catch { return false; } })();
  if (backupDir && pending.length && hasUsers) {
    const file = `${backupDir}/app.db.truoc-migrate-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
    log.log(`[migrate] Đã sao lưu CSDL trước khi nâng cấp: ${file}`);
  }
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    db.exec("BEGIN");
    try {
      if (m.up) db.exec(m.up);
      if (m.after) m.after(db);
      db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run(m.id, new Date().toISOString());
      db.exec("COMMIT");
      applied.push(m.id);
      log.log(`[migrate] Đã áp dụng ${m.id}`);
    } catch (e) {
      db.exec("ROLLBACK");
      throw new Error(`Migration ${m.id} lỗi, đã hoàn tác: ${e.message}`);
    }
  }
  return applied;
}

export function rollback(db, id) {
  const m = MIGRATIONS.find((x) => x.id === id);
  if (!m) throw new Error("Không có migration " + id);
  db.exec("BEGIN");
  try {
    if (m.downFn) m.downFn(db);
    if (m.down) db.exec(m.down);
    db.prepare("DELETE FROM schema_migrations WHERE id = ?").run(id);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}


export async function migratePg(db, schemaSql, log = console) {
  // The tracking table might not exist yet (fresh DB) or might already be in the draft;
  // if reading fails because the table is missing, treat as no migrations applied.
  let done;
  try {
    done = new Set((await db.prepare("SELECT id FROM schema_migrations").all()).map((r) => r.id));
  } catch (e) {
    if (!/does not exist/i.test(e.message)) throw e;
    done = new Set();
  }
  const pending = MIGRATIONS.filter((m) => !done.has(m.id));
  if (!pending.length) {
    log.log("[migrate-pg] Schema đã đủ, không có migration mới.");
    return [];
  }
  const probe = await db.prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'").get();
  const now = new Date().toISOString();
  await db.tx(async (t) => {
    if (!probe) await t.query(schemaSql);
    // Created after DDL since the draft may already create this table; IF NOT EXISTS keeps both paths safe.
    await t.query("CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
    const ins = t.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?) ON CONFLICT(id) DO NOTHING");
    for (const m of pending) await ins.run(m.id, now);
  });
  for (const m of pending) log.log(`[migrate-pg] Đã ghi nhận ${m.id} (qua schema draft PG)`);
  return pending.map((m) => m.id);
}
