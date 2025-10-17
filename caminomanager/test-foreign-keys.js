// Test script to verify foreign key queries work correctly
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase URL and anon key
const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
  console.log('Testing basic queries...');
  
  try {
    // Test countries query (no foreign keys)
    console.log('\n1. Testing countries query:');
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*', { count: 'exact' });
    
    if (countriesError) {
      console.error('Countries error:', countriesError);
    } else {
      console.log('Countries count:', countries?.length);
      console.log('Sample country:', countries?.[0]);
    }
    
    // Test states query (with foreign key)
    console.log('\n2. Testing states query with foreign key:');
    const { data: states, error: statesError } = await supabase
      .from('states')
      .select('*, countries:country_id(name)', { count: 'exact' });
    
    if (statesError) {
      console.error('States error:', statesError);
    } else {
      console.log('States count:', states?.length);
      console.log('Sample state:', states?.[0]);
    }
    
    // Test cities query (with multiple foreign keys)
    console.log('\n3. Testing cities query with multiple foreign keys:');
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*, countries:country_id(name), states:state_id(name)', { count: 'exact' });
    
    if (citiesError) {
      console.error('Cities error:', citiesError);
    } else {
      console.log('Cities count:', cities?.length);
      console.log('Sample city:', cities?.[0]);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Uncomment the line below to run the test
// testQueries();

console.log('Test script ready. Update the Supabase credentials and uncomment testQueries() to run.');