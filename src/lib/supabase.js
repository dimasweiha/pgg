import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi di .env — ' +
      'koneksi Supabase belum aktif. Isi dulu di .env (lihat .env.example).'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      // Simpan sesi login di localStorage, biar tetap login setelah refresh
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
)
