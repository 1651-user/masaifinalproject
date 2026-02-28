
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function migrate() {
    
    
    console.log('Adding helpful_count column to reviews table...');

    const { error } = await supabase.rpc('exec_sql', {
        query: 'ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;'
    });

    if (error) {
        console.log('RPC not available, trying direct approach...');
        
        const { error: testError } = await supabase
            .from('reviews')
            .update({ helpful_count: 0 })
            .eq('id', '00000000-0000-0000-0000-000000000000');

        if (testError && testError.message.includes('helpful_count')) {
            console.error('Column does not exist. Please add it manually in Supabase Dashboard:');
            console.error('Go to Table Editor > reviews > Add Column:');
            console.error('  Name: helpful_count');
            console.error('  Type: int4 (integer)');
            console.error('  Default: 0');
        } else {
            console.log('Column already exists or was added successfully!');
        }
    } else {
        console.log('Migration successful!');
    }
}

migrate();
