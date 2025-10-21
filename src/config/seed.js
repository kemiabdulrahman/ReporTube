const bcrypt = require('bcryptjs');
const { pool } = require('./database');
require('dotenv').config();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@123',
      10
    );

    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [
        process.env.ADMIN_EMAIL || 'admin@reportube.com',
        adminPassword,
        'System Administrator',
        'admin',
      ]
    );
    console.log('✅ Admin user created');

    // Create sample subjects
    const subjects = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'English Language', code: 'ENG' },
      { name: 'Science', code: 'SCI' },
      { name: 'Social Studies', code: 'SST' },
      { name: 'Computer Studies', code: 'CMP' },
      { name: 'Physical Education', code: 'PHE' },
      { name: 'Arts', code: 'ART' },
      { name: 'Music', code: 'MUS' },
    ];

    for (const subject of subjects) {
      await pool.query(
        `INSERT INTO subjects (name, code, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO NOTHING`,
        [subject.name, subject.code, `${subject.name} curriculum`]
      );
    }
    console.log('✅ Sample subjects created');

    // Create sample classes
    const classes = [
      { name: 'JSS 1A', level: 'JSS 1', academic_year: '2023/2024' },
      { name: 'JSS 1B', level: 'JSS 1', academic_year: '2023/2024' },
      { name: 'JSS 2A', level: 'JSS 2', academic_year: '2023/2024' },
      { name: 'JSS 3A', level: 'JSS 3', academic_year: '2023/2024' },
    ];

    for (const cls of classes) {
      await pool.query(
        `INSERT INTO classes (name, level, academic_year)
         VALUES ($1, $2, $3)`,
        [cls.name, cls.level, cls.academic_year]
      );
    }
    console.log('✅ Sample classes created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@reportube.com'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
