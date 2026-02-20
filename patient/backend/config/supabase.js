const { createClient } = require("@supabase/supabase-js");

let supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials. Check your .env file.");
}

// Normalize and validate URL
supabaseUrl = String(supabaseUrl).trim();
if (!/^https?:\/\//i.test(supabaseUrl)) {
  // If user provided only the project ref (e.g. 'abc123'), construct full URL
  const refOnly = supabaseUrl.match(/^[A-Za-z0-9_-]+$/);
  if (refOnly) {
    supabaseUrl = `https://${supabaseUrl}.supabase.co`;
  }
}

console.log("[supabase] using SUPABASE_URL=", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
