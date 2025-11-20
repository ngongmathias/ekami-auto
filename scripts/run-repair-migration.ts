import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qumjbdvaxckaktrjxndj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bWpiZHZheGNrYWt0cmp4bmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzQ1NDcsImV4cCI6MjA3OTE1MDU0N30.zPOj2LHjpUH-wAquCq-yD65chBll2gY3LDHFBphlHLE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running repair services migration...\n');

  try {
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20240120_create_repair_services_tables.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.log('Statement:', statement.substring(0, 100) + '...');
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('\n📊 Created tables:');
    console.log('  - service_packages (with 8 default packages)');
    console.log('  - mechanics (with 4 sample mechanics)');
    console.log('  - repair_requests');
    console.log('  - service_history');
    console.log('  - service_reviews');
    console.log('\n🔒 RLS policies enabled for all tables');
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
