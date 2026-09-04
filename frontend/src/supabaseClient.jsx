import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://owfllocsyuskoxykbppc.supabase.co";
const supabaseAnonKey = "sb_publishable_IvAIl0WFb36XWkaGgsg5iw_rvCV3KLY";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);