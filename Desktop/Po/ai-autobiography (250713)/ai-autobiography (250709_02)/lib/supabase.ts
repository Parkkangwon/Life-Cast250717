import { createClient } from "@supabase/supabase-js"

// Provide fallback values for development/preview environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zqjsoxkjjigibrlukqk.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxanNveGtqaml1Z2licmx1a3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDA2MDgsImV4cCI6MjA2NzIxNjYwOH0.t4lbspOL7fayi35OYcvkwxqFoB0I6KedZmoWeN-MGfE"

// Ensure environment variables are available
if (typeof window !== 'undefined') {
  // Client-side: use window.__NEXT_DATA__ or localStorage if needed
  console.log('Supabase client initialized on client-side')
}

// Validate environment variables
if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
  console.warn("Supabase URL is not properly configured")
}

if (!supabaseAnonKey || supabaseAnonKey === "placeholder-key") {
  console.warn("Supabase API key is not properly configured")
}

// Create the Supabase client
let supabase: any = null

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log("Supabase client initialized successfully")
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
  // Create a fallback client with basic functionality
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: () => Promise.resolve({ error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({
        select: () => ({ single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
      }),
      update: () => ({ eq: () => Promise.resolve({ error: new Error("Supabase not configured") }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: new Error("Supabase not configured") }) }),
      upsert: () => ({
        select: () => ({ single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
      }),
    }),
  }
}

export { supabase }

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          google_id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          google_id: string
          email: string
          name: string
          avatar_url?: string | null
        }
        Update: {
          name?: string
          avatar_url?: string | null
        }
      }
      autobiographies: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          is_public: boolean
          slug: string | null
          sections: any[]
          generated_images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title?: string
          description?: string
          is_public?: boolean
          slug?: string | null
          sections: any[]
          generated_images?: string[]
        }
        Update: {
          title?: string
          description?: string
          is_public?: boolean
          slug?: string | null
          sections?: any[]
          generated_images?: string[]
        }
      }
      blog_views: {
        Row: {
          id: string
          autobiography_id: string
          viewer_ip: string | null
          viewed_at: string
        }
        Insert: {
          autobiography_id: string
          viewer_ip?: string | null
        }
      }
    }
  }
}
