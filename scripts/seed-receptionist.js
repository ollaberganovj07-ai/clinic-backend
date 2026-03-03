/**
 * Seed script: Create test Receptionist user
 * Run with: node scripts/seed-receptionist.js
 * Ensure server is running on port 3000 first.
 */
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const RECEPTIONIST = {
  name: 'Test Receptionist',
  email: 'reception@hospital.com',
  password: 'password123',
  role: 'receptionist',
};

async function seedReceptionist() {
  console.log('🌱 Seeding receptionist user...');
  console.log('   Email:', RECEPTIONIST.email);
  console.log('   Role:', RECEPTIONIST.role);
  console.log('');

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(RECEPTIONIST),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.log('✅ Receptionist created successfully!');
      console.log('   User:', data.data?.user?.name, `(${data.data?.user?.email})`);
      console.log('');
      console.log('📋 Login credentials:');
      console.log('   Email: reception@hospital.com');
      console.log('   Password: password123');
      console.log('');
      console.log('🚀 You can now log in at http://localhost:3000');
    } else {
      if (data.message?.includes('allaqachon') || data.message?.includes('already')) {
        console.log('ℹ️  User already exists. You can use these credentials to login:');
        console.log('   Email: reception@hospital.com');
        console.log('   Password: password123');
      } else {
        console.error('❌ Failed:', data.message || res.statusText);
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('');
    console.log('   Make sure the server is running: npm run dev');
  }
}

seedReceptionist();
