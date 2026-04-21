// Configuration file - Keep this file secure and never commit to public repositories
const CONFIG = {
    SUPABASE_URL: 'https://bkbwsdjnlswppbezmvig.supabase.co',
    SUPABASE_KEY: 'sb_publishable_FF0gpAOw9R8Abcnex94cww_-7oDtq4q'
};

// For development only - In production, use environment variables
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
