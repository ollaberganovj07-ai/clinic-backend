// Test Supabase connection
require('dotenv').config();
require('cross-fetch/polyfill');

console.log('========================================');
console.log('🧪 Testing Supabase Connection');
console.log('========================================\n');

console.log('Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('\n========================================\n');

const { createClient } = require('@supabase/supabase-js');

try {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { 
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  console.log('✅ Supabase client created successfully\n');

  console.log('🔄 Testing database connection by querying doctors table...\n');

  supabase
    .from('doctors')
    .select('*')
    .limit(5)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Database query error:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Full error:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Successfully connected to Supabase!');
        console.log(`✅ Retrieved ${data.length} doctors from database\n`);
        if (data.length > 0) {
          console.log('Sample doctor:', JSON.stringify(data[0], null, 2));
        }
      }
      console.log('\n========================================');
      console.log('Test Complete');
      console.log('========================================');
    })
    .catch(err => {
      console.error('❌ Unexpected error:');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    });

} catch (err) {
  console.error('❌ Error creating Supabase client:');
  console.error(err);
}
