const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sigrkpzjiqhhldjyvlyu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '...'; // Wait, I need the key from .env

const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const envUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim() || supabaseUrl;
const envKey = env.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(envUrl, envKey);

async function check() {
  const { data } = await supabase.from('site_settings').select('*').single();
  console.log('SiteSettings:', data);
}

check();
