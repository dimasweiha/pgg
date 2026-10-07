/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Design token — referensi UI: light sidebar + header putih + aksen biru muda
        // (revisi Dimas: aksen violet → sky Tailwind, konsisten dengan filter)
        primary: {
          50: '#f0f9ff', // sky-50
          100: '#e0f2fe', // sky-100
          600: '#0ea5e9', // sky-500 — aksen utama
          700: '#0284c7', // sky-600 — hover
        },
        'bg-base': '#ffffff', // Background konten utama (putih penuh, permintaan Dimas)
        surface: '#ffffff', // Background card, sidebar, header
        'border-default': '#e9e9f0', // Border card, tabel, input, sidebar
        'text-primary': '#1c1d22',
        'text-secondary': '#71727e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
