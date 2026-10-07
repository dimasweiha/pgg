import { create } from 'zustand'
import { supabase } from '../lib/supabase'

/**
 * Auth store — single admin (Dimas), session Supabase Auth.
 * Session disimpan di localStorage oleh supabase-js, store ini
 * hanya mirror state supaya komponen bisa reactive ke status login.
 */
export const useAuthStore = create((set) => ({
  session: null,
  ready: false, // true setelah session awal selesai dimuat (cek localStorage + server)

  setSession: (session) => set({ session, ready: true }),

  /** Init sekali di App mount: ambil session + subscribe perubahan */
  init: async () => {
    const { data } = await supabase.auth.getSession()
    set({ session: data.session, ready: true })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, ready: true })
    })
  },

  /** Login email/password. Return error message string, atau null kalau sukses. */
  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  },

  /** Logout + reset state */
  logout: async () => {
    await supabase.auth.signOut()
    set({ session: null })
  },
}))
