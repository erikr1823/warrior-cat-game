// Online leaderboard configuration (Supabase).
//
// HOW TO SET UP:
//   1. In Supabase -> Project Settings -> API, copy the "anon public" key.
//   2. Replace PASTE_YOUR_ANON_PUBLIC_KEY_HERE below with that key.
//   3. Use the BASE project URL (already set), NOT the /rest/v1 URL.
//
// SECURITY: Only ever use the PUBLIC "anon" key here. Never paste the secret
// service_role key into front-end code — it would be visible to everyone.

export const LeaderboardConfig = {
  enabled: true,
  supabaseUrl: "https://dmyntrmatdwztjdzukju.supabase.co",
  supabaseAnonKey: "sb_publishable_qza_K84xyu-igwYGP7NJNA_l9B_0j2A",
  tableName: "leaderboard_scores",
};

export function isLeaderboardConfigured() {
  return (
    LeaderboardConfig.enabled === true &&
    typeof LeaderboardConfig.supabaseUrl === "string" &&
    typeof LeaderboardConfig.supabaseAnonKey === "string" &&
    LeaderboardConfig.supabaseUrl.startsWith("http") &&
    LeaderboardConfig.supabaseUrl !== "SUPABASE_URL_HERE" &&
    LeaderboardConfig.supabaseAnonKey !== "SUPABASE_ANON_KEY_HERE" &&
    LeaderboardConfig.supabaseAnonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRteW50cm1hdGR3enRqZHp1a2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTcxOTksImV4cCI6MjA5ODI3MzE5OX0.BdrLzb46gJANinCyaVsqIsg8jYAcVKSF3ck5arY7i_E" &&
    LeaderboardConfig.supabaseAnonKey.length > 0
  );
}
