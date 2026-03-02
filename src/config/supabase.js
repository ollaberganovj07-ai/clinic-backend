// src/config/supabase.js
require('cross-fetch/polyfill');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is missing from .env file');
  throw new Error('Missing env: SUPABASE_URL');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing from .env file');
  throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY');
}

console.log('✅ Supabase URL:', SUPABASE_URL);
console.log('✅ Supabase client initializing...');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { 
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
    fetch: (url, options = {}) => {
      console.log('🌐 Fetching:', url);
      return fetch(url, {
        ...options,
        timeout: 10000,
      }).catch(err => {
        console.error('❌ Fetch error:', err.message);
        if (err.cause) {
          console.error('❌ Caused by:', err.cause.message);
        }
        throw err;
      });
    },
  },
});

console.log('✅ Supabase client initialized successfully');

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    const { data, error } = await supabase.from('doctors').select('count').limit(1);
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection test error:', err.message);
    return false;
  }
}

module.exports = { supabase, testConnection };
