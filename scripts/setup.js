#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚌 College Bus Booking System Setup');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Please create .env.local file with your Supabase credentials:');
  console.log('');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Dependencies installed');
} else {
  console.log('❌ Dependencies not installed');
  console.log('📦 Run: npm install');
  console.log('');
}

console.log('\n📋 Next Steps:');
console.log('1. Set up Supabase database using database/setup.sql');
console.log('2. Configure environment variables in .env.local');
console.log('3. Run: npm run dev');
console.log('4. Open http://localhost:3000');
console.log('');

console.log('🎯 Features:');
console.log('- 55-seater bus layout with interactive seats');
console.log('- Gender-based booking (pink seats for females)');
console.log('- Sports team allocations with limits');
console.log('- College registration number validation');
console.log('- Real-time statistics and availability');
console.log('- Supabase database integration');
console.log('');

console.log('📚 For detailed instructions, see README.md');
console.log('🔗 Supabase setup: https://supabase.com');
console.log('🚀 Deploy to Vercel: https://vercel.com');
