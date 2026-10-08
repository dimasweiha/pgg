# DESIGN.md — Grati Garden Leads Dashboard

Panduan visual supaya semua halaman konsisten. AI agent wajib mengikuti ini untuk setiap komponen UI baru — jangan improvisasi border/rounded/spacing sendiri di tiap step.

> **Revisi besar (Okt 2026)**: arah desain diganti dari "sidebar charcoal gelap + aksen biru" menjadi **light sidebar + header putih + aksen warna**, mengikuti referensi dashboard modern yang disetujui Dimas (screenshot SalesX-style). Aksen kini **biru muda sky** (revisi 5 Okt: violet → sky).

## 1. Arah Desain

Light theme menyeluruh, bersih dan flat:

- **Sidebar kiri putih** (bukan gelap) dengan ikon per menu, search box, dan user card di bawah
- **Header atas putih** (sticky, blur tipis) berisi judul halaman aktif
- Konten: background terang sangat tipis, card putih, tanpa gradient/shadow berlebihan
- Font: **Inter** (dimuat via Google Fonts di `index.html`)

## 2. Warna (Tailwind Config)

Token didefinisikan di `tailwind.config.js` — jangan hardcode hex di komponen.

| Token | Hex | Pemakaian |
|---|---|---|
| `primary-50` | `#f0f9ff` (sky-50) | Background nav aktif, avatar, hover ikon Edit |
| `primary-100` | `#e0f2fe` (sky-100) | Variasi soft biru |
| `primary-600` | `#0ea5e9` (sky-500) | **Aksen utama** — tombol primer, nav aktif, logo, link aksi, chart utama, checkbox/radio aktif |
| `primary-700` | `#0284c7` (sky-600) | Hover tombol/link |
| `bg-base` | `#ffffff` | Background konten utama — **putih penuh** (revisi: sebelumnya `#f7f7fb`; pemisahan card murni lewat border) |
| `surface` | `#ffffff` | Background card, sidebar, header, input |
| `border-default` | `#e9e9f0` | Border card, tabel, input, sidebar, header |
| `text-primary` | `#1c1d22` | Teks utama |
| `text-secondary` | `#71727e` | Teks sekunder/label |

> **Revisi tema (Dimas, 5 Okt)**: aksen utama diubah dari violet (#6d5ae8) ke **biru muda sky** (#0ea5e9) via redefinisi token `primary-*` di `tailwind.config.js` — semua komponen otomatis ikut. Chart: Total/Iklan `#0ea5e9`, donut Organik `#7dd3fc` (sky-300). State aktif filter boleh pakai class `sky-*` langsung (hasil identik).

**Warna status** (dipakai di `StatusBadge`):

| Status | Background | Teks |
|---|---|---|
| `proses` | `#fef3c7` (amber-100) | `#92400e` (amber-800) |
| `deal` | `#d1fae5` (emerald-100) | `#065f46` (emerald-800) |
| `no_deal` | `#fee2e2` (red-100) | `#991b1b` (red-800) |

**Warna aging** (Umur Leads, intensitas makin merah sesuai lama stuck — hanya di **teks kolom Umur** + pill Tingkat; baris TIDAK diberi background kuning/merah — revisi Dimas 5 Okt):

| Level | Warna teks kolom Umur |

| Normal (< batas waktu) | netral (`text-primary`) |
| Waspada (batas waktu s/d 2x) | `#92400e` (amber-800) |
| Kritis (> 2x batas waktu) | `#991b1b` (red-800) |

**Warna chart**:

| Kebutuhan | Warna |
|---|---|
| Seri utama / Total / Iklan | `#0ea5e9` (sky-500, = primary-600) |
| Seri kedua / Organik | `#7dd3fc` (sky-300, donut) / `#f59e0b` (amber-500, seri lain) |
| Deal | `#10b981` (emerald-500) |
| No Deal | `#f43f5e` (rose-500) |
| Grid line | `#e9e9f0` |

## 3. Border & Rounded

- Card: `rounded-xl` (12px), `border border-border-default`, tanpa shadow (boleh `hover:shadow-sm` untuk SummaryCard)
- Tombol, input, select, textarea: `rounded-lg` (8px)
- Badge/status pill: `rounded-full`
- Logo brand: `rounded-xl`, nav item: `rounded-lg`
- Tabel: tanpa border luar, tiap baris `border-b border-border-default`, header `bg-gray-50`
- Input focus: `border-primary-600` + `ring-2 ring-primary-600/20`

## 4. Spacing

- Padding dalam card: `p-6` (card utama), `p-5` (SummaryCard), `p-4` (compact)
- Gap antar card dalam grid: `gap-4`; antar section: `space-y-6`
- Sidebar: lebar `w-64`, brand `px-5 py-5`, search `px-4`, nav item `px-3 py-2.5` dalam container `px-3`
- Konten utama: `max-w-[1400px] mx-auto px-6 lg:px-8 py-8`
- Header: tinggi `h-16`, `px-6 lg:px-8`

## 5. Tipografi

- Font: **Inter** dengan fallback `system-ui` (sudah di tailwind config + Google Fonts)
- Judul halaman: di **header** (`text-lg font-semibold`), bukan di dalam halaman — diambil dari route via `pageTitle()` di Layout
- Heading card (`h2`): `text-lg font-semibold text-text-primary`
- Body: `text-sm text-text-primary`; label form: `text-xs font-medium text-text-secondary` (tanpa uppercase)
- Angka besar summary: `text-3xl font-bold tracking-tight`

## 6. Komponen Reusable (Konsistensi Wajib)

| Komponen | Spesifikasi |
|---|---|
| `Login` (redesign 8 Okt) | **Modern simple**: foto kawasan full layar + **gradasi hitam** `from-black/60 via-black/45 to-black/70` (atas gelap untuk judul, tengah lebih terang agar foto terlihat, bawah gelap). Judul **"Perumahan Grati Garden"** `text-3xl font-bold` putih `drop-shadow-lg` + "Leads Dashboard" `text-white/80`. Card form **`rounded-2xl bg-white p-8 shadow-2xl`** (putih solid — revisi Dimas: `bg-white/95` terlihat abu di atas foto gelap); input `py-3` dengan label uppercase `font-semibold`; tombol Masuk `py-3 font-semibold`. Footer kecil "© {tahun} Perumahan Grati Garden" `text-white/70`. Tanpa logo kotak "GG", tanpa teks "akses terbatas". Foto: `src/assets/kawasan.webp` |
| `Card` | `rounded-xl border border-border-default bg-surface p-6` |
| `SummaryCard` | baris 1: label `text-sm text-secondary`; baris 2: angka `text-2xl font-bold` + delta % hijau ↑ / merah ↓ (`text-sm`); **footer** `border-t`: selisih `+N` tebal + "dari bulan lalu" abu + arrow → (pembanding = bulan kalender lalu). Tanpa icon — keep it clean |
| `StatusBadge` | `rounded-full px-2.5 py-0.5 text-xs font-medium` + warna status |
| `Performa Iklan` (fitur baru 7 Okt) | Halaman `#/iklan` (nav `Megaphone`) — angka operasional iklan harian, porting sheet Excel Dimas (input manual, BUKAN turunan leads; keputusan via pertanyaan: manual / tanpa Total Spent / per tanggal gabungan). 1 baris = 1 tanggal, SEMUA tanggal bulan terpilih tampil (baris tanpa data redup). Kolom: Tanggal (kiri, badge "Hari ini" sky) / Spent Meta Ads / Result Dashboard / Cost per Result (auto) / Real Chat / Cost per Real Chat (auto) / MQL / MQL Ratio (auto, %) / No Respon / Aksi. Picker bulan custom (‹ Bulan Tahun ›, tombol "Bulan ini" bila bulan aktif bukan bulan tampil). Klik ikon `Pencil` → modal `IklanHarianModal` input 5 angka (spent + 4 counter, `inputMode=numeric`, tanpa default kecuali edit) → `upsertIklanHarian` (onConflict tanggal). Baris TOTAL: jumlah semua + rasio keseluruhan, bg-gray-50 semibold. Rasio dihitung frontend (`src/lib/iklan.js`): pembagi 0 → "-". DB: tabel `iklan_harian` via `supabase/patch-005-iklan-harian.sql` (tanggal unique, RLS authenticated) |
| Cursor interaktif (revisi 7 Okt) | **Global** di `index.css` `@layer base`: semua yang bisa diklik pakai **cursor tangan** (keputusan Dimas — "tiap button, icon, menu, apapun yang bisa diklik"). Tailwind v3 preflight tidak lagi set `cursor:pointer` ke button, jadi aturan eksplisit: `button:not(:disabled)`, `[role='button']`, `[role='option']` (belum disabled), `a`, `label:has(> input[type='checkbox'])`, `summary` → `cursor: pointer`; `button:disabled` → `cursor: not-allowed` |
| `Button` (primary) | `rounded-lg bg-primary-600 text-white hover:bg-primary-700 px-3.5 py-2`, focus ring `primary-600/30` |
| `Button` (secondary) | `rounded-lg border border-border-default bg-surface hover:bg-gray-50` |
| `Button` (danger) | `rounded-lg bg-red-600 text-white hover:bg-red-700` |
| `Input` / `Select` | `rounded-lg border-border-default bg-surface px-3 py-2`, focus `border-primary-600 ring-2 ring-primary-600/20` |
| `DatePicker` | **Kalender popover custom** (bukan `type="date"` native — keputusan Dimas). Trigger button: icon `CalendarDays` + label `d MMM yyyy` atau placeholder abu "Pilih tanggal"; **tanpa nilai default** (form tidak mengisi otomatis). Popover `rounded-xl shadow-lg`: header nav bulan (chevron kiri/kanan + "Bulan Tahun"), grid 7 kolom (Min–Sab), tanggal terpilih pill `bg-sky-500` putih, hari ini teks `sky-600`, footer "Hari ini" + "Bersihkan". Trigger aktif saat open: `border-sky-500 ring-sky-500/20`. Tutup: klik luar / Esc. Dipakai di LeadsForm (Tanggal Masuk & Tanggal Keputusan) |
| `DropdownSelect` | **Dropdown custom** (bukan `<select>` native — keputusan Dimas). Trigger button: label terpilih atau placeholder abu + `ChevronDown` (berputar saat open). Popover `rounded-xl shadow-lg max-h-60 overflow-y-auto`: opsi terpilih `bg-sky-50 text-sky-700` + icon `Check`; support `hint` (mis. "(nonaktif)") & opsi **`disabled`** — tampil abu-abu `text-text-secondary/60` + cursor not-allowed, tidak bisa dipilih tapi tetap terlihat (sales nonaktif; keputusan Dimas 6 Okt). **Tanpa nilai default** — form Leads membuka dengan placeholder ("Pilih jenis leads", "— Belum ditentukan —"). Tutup: klik luar / Esc |
| Popover di dalam modal | **`position: fixed`** via `useFixedPopover` (revisi Dimas 6 Okt — kalender/dropdown di modal Leads harus terlihat **penuh tanpa scroll**). Posisi dihitung dari `getBoundingClientRect()` trigger, mengikuti scroll (capture) & resize. Kalender (DatePicker): **selalu buka ke bawah** (revisi lanjutan 6 Okt). DropdownSelect: flip ke atas bila ruang bawah kurang |
| Batas Waktu (Umur Leads, revisi 6 Okt) | **DropdownSelect custom, tanpa default** (keputusan Dimas — konsisten dengan semua dropdown form). Opsi: "Semua leads" + "Lebih dari N hari" (3/7/14/21/30). `threshold: null` = belum dipilih → tabel menampilkan **semua leads**, kartu Waspada/Kritis menampilkan "—". Pilihan dipersist via zustand localStorage (`umur-batas-waktu`) |
| Toast notif (revisi 6 Okt) | Gaya modern-simple (bukan default hitam react-hot-toast): kartu **putih** `rounded-xl` + border `#e5e7eb` + shadow lembut, teks `#1a1d23` 14px medium. Ikon bulat berwarna: sukses hijau `#16a34a`, error merah `#dc2626` (durasi lebih lama 4,5 dtk), loading sky. Posisi `top-right`, konfigurasi global di `App.jsx` (`toastOptions.style`) |
| `Pengaturan` (revisi 7 Okt) | Halaman `#/pengaturan` — kelola master data **Sales & Campaign Iklan** (fitur campaign Step 1), dua seksi bertumpuk dengan pola tabel identik: Nama (kiri) / Status / Aksi (center); pill status hijau "Aktif" / abu "Nonaktif"; aksi icon-only: `Pencil` ubah nama, `Power` aktif⇄nonaktif (hover amber/emerald), `Trash2` hapus via ConfirmDialog. Tambah via modal (nama wajib unik — duplikat ditolak DB, error 23505 diterjemahkan). Sales/campaign nonaktif nanti hilang dari dropdown form leads tapi tetap tampil di riwayat lama; hapus campaign ditolak (23503) bila masih ada leads terhubung (relevan sejak Step 2). Implementasi: tabel generik `MasterTable` + modal generik `NameFormModal` dikonfigurasi lewat `MASTER_KINDS` (label/fetch/create/rename/setActive/remove/placeholder per kind); data sales & campaign dimuat paralel `Promise.all`. Campaign: tabel `campaigns` via `supabase/patch-003-campaigns.sql` (Dimas jalankan sendiri di SQL Editor) |
| `LeadsForm` (revisi 5 Okt) | Tanggal & dropdown semua custom (DatePicker + DropdownSelect di atas). **Omset dihapus dari form** — keputusan Dimas: saat deal "kita gak tahu pastinya berapa" → payload selalu `omset: null` (bisa diisi langsung di DB nanti). Tanggal masuk & keputusan tidak auto-terisi; tanggal keputusan wajib saat status deal/no_deal (validasi submit). **Dropdown "Nama Campaign" (Step 2, 7 Okt): muncul kondisional hanya saat Jenis = Iklan** (`watch('jenis')`), tanpa default (placeholder "— Pilih campaign —"), opsi campaign nonaktif disabled + hint "(nonaktif)"; jenis kembali organik → `campaign_id` dikirim null. Data: `campaignList` di-fetch `fetchCampaigns()` di Leads.jsx, nested `campaign:campaign_id (id, nama)` di LEADS_SELECT. Prasyarat DB: `patch-003` + `patch-004-leads-campaign-id.sql` (kolom `leads.campaign_id`) |
| Export Excel (revisi 6 Okt) | Kolom: Tgl Masuk, Nama, No. HP, Jenis, Sales, Blok Unit, Status, Lama Proses (hari), Catatan — **tanpa Omset & tanpa baris TOTAL OMSET** (keputusan Dimas, konsisten dengan form yang tidak lagi mengisi omset). No. HP diformat string agar "0" depan tidak hilang |
| `DateRangePicker` | **Satu button** gaya Meta Ads: label rentang aktif + icon kalender + chevron; klik → popover `rounded-xl shadow-lg` berisi sidebar preset radio (Hari ini, Kemarin, Maksimal, 7/14/28/30 hari, Minggu ini/lalu, Bulan ini/lalu) + **dual calendar** klik-pilih-range (hover preview, start/end pill sky) + input kustom + Batal/Update. **Saat terbuka, trigger ikut aktif**: `border-sky-500 bg-sky-50` — konsisten dengan tombol Filter. Dipakai di Dashboard & Leads |
| `FilterButton` (Leads) | **Satu button** "Filter" (icon `SlidersHorizontal` + chevron) menggantikan 3 dropdown Sales/Status/Jenis (keputusan Dimas). Klik → popover `w-72 rounded-xl border shadow-lg max-h-[70vh] overflow-y-auto` berisi 3 seksi checklist **multi-pilih**: Sales (dari tabel sales), Status, Jenis — tiap seksi ada link "Bersihkan" saat berisi pilihan + link "Hapus semua pilihan" di bawah saat ada pilihan aktif. Ceklis pakai komponen `Checkbox` custom: kotak `rounded border-border-default` → saat tercentang `bg-sky-500` dengan **centang putih** (icon `Check` 12px strokeWidth 3 — bukan checkbox native accent, revisi Dimas 6 Okt). **Saat aktif** (popover terbuka atau ada pilihan): `border-sky-500 bg-sky-50 text-sky-700` + badge angka `bg-sky-500` — aturan sama untuk semua trigger filter yang aktif. Tutup: klik luar / Esc. Data di-fetch pakai PostgREST `.in()` (array kosong = tanpa filter) |
| Search bar (Leads) | **Tanpa card** — baris search & filter langsung di atas tabel: field search memanjang (`flex-1`, ikon Search, fokus `border-sky-500 ring-sky-500/20`) + 2 button **mentok kanan** (wrapper `ml-auto flex gap-3`: Filter + DateRangePicker, tanpa lebar tetap). Tanpa tombol Reset terpisah |
| `Table` | header `bg-gray-50 text-xs uppercase`, baris `border-b hover:bg-gray-50`. Tabel Leads & Umur: **semua kolom center termasuk Aksi, kecuali Nama (kiri)**. Tabel Unit Breakdown: **semua kolom center, kecuali Blok Unit (kiri)**; label blok tampil kapital huruf awal ("blok a2" → "Blok A2" — chart & tabel, revisi Dimas 6 Okt). Urutan Leads: Nama, No. HP, Jenis, Sales, **Tgl Masuk**, Blok Unit, Status, Lama Proses, Aksi (keputusan Dimas). **Aksi Leads 3 tombol (revisi 7 Okt): `Info` (icon Info, hover sky) + `Edit` (Pencil, hover sky) + `Hapus` (Trash2, hover merah)**. Label halaman Bahasa Indonesia (revisi 6 Okt): menu & judul "Umur Leads" (ex Aging Leads), Threshold → "Batas Waktu", kolom "Umur"/"Tingkat", level Warning/Critical → "Waspada"/"Kritis", Leads "Lama/Aging" → "Lama Proses" |
| `LeadInfoModal` (redesign 8 Okt) | Modal lihat detail leads **read-only**, portal ke body. **Redesign (Dimas kurang suka versi list datar)**: header identitas — avatar inisial bulat `bg-primary-50` + nama + StatusBadge sejajar, no. HP di bawahnya; body grid **tile 2 kolom** (`bg-gray-50 rounded-lg`, label uppercase 10px + nilai medium): Jenis, Sales, Campaign (full-width, hanya iklan), Tanggal Masuk, Umur/Lama Proses, Blok Unit, Tanggal Keputusan (bila bukan proses), Catatan (full-width, bila ada); footer border-t dengan tombol **"Chat WhatsApp"** (link `wa.me`, normalisasi 08xx→62xx, ikon MessageCircle) + "Tutup" (primary). Panel `rounded-2xl max-w-lg shadow-xl` |
| Layout container (revisi 7 Okt) | `<main>` **tanpa `max-w-[1400px]`/`mx-auto`** — konten full width mengikuti sisa area kanan sidebar (permintaan Dimas; sebelumnya ada space kiri-kanan di layar lebar). Padding tetap `px-6 py-8 lg:px-8` |
| `Modal` | overlay hitam transparan + panel `rounded-xl border p-6 max-w-2xl`. **Render via `createPortal(document.body)`** (fix 7 Okt): backdrop `fixed z-50` selalu menutup seluruh layar termasuk header & sidebar — tidak ada lagi "putih2 nyisa" di atas popup akibat stacking context ancestor. ConfirmDialog ikut portal |
| Aksi tabel (Leads & Aging) | **Icon-only** (keputusan Dimas): Edit/Update Status = `Pencil` 16px ghost button (`rounded-lg p-1.5 text-text-secondary hover:bg-primary-50 hover:text-primary-600`), Hapus = `Trash2` (`hover:bg-red-50 hover:text-red-600`), selalu `title`/`aria-label` |
| Link hapus | `text-red-600` |

## 7. Sidebar & Header

**Judul halaman** (revisi Dimas 6 Okt): dirender **di dalam konten** tiap halaman, di atas baris penjelasan — `h1 text-xl font-semibold text-text-primary` + deskripsi `mt-0.5 text-sm text-text-secondary` (kiri), aksi/controls sejajar bawah di kanan. Header sticky TIDAK menampilkan judul lagi (cuma tombol menu mobile + badge "Data per hari ini" + avatar mobile). Judul per halaman: Dashboard / Leads / Umur Leads / Unit Breakdown / Pengaturan.

**Collapse sidebar** (revisi Dimas 6 Okt): tombol `PanelLeftClose`/`PanelLeftOpen` di kiri header (desktop) melipat sidebar `w-64` → `w-[76px]` mode ikon saja — brand jadi monogram teks **"PGG"** center (revisi 8 Okt, kotak logo "GG" dihapus), search & label "Main Menu" disembunyikan, nav item jadi icon dengan `title` tooltip, footer avatar + logout tersusun vertikal. Lebar bertransisi 200ms; status persist via `localStorage('sidebar-collapsed')`.

**Sidebar** (desktop ≥ lg, `hidden lg:flex`, sticky h-screen):

- `w-64 bg-surface border-r border-border-default`
- Brand: **teks "Perumahan Grati Garden"** (revisi 8 Okt — kotak logo "GG" dihapus) + subjudul "Leads Dashboard" 2 baris; collapsed → monogram teks "PGG"
- Search: **pindah ke header** (revisi 8 Okt — header dulu kosong melompong); sidebar kini langsung label seksi
- Label seksi `MAIN MENU` — `text-[11px] font-medium uppercase tracking-wider text-text-secondary`
- Nav item: `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm` + ikon lucide 18px
  - Aktif: `bg-primary-50 font-medium text-primary-600`
  - Non-aktif: `text-text-secondary hover:bg-gray-50 hover:text-text-primary`
- Bawah: border-t + user card (avatar inisial `bg-primary-50 text-primary-600` + email truncate + tombol logout icon, hover merah)
- Mobile (< lg): sidebar hilang; header menampilkan tombol Menu yang membuka nav + logout sebagai panel dropdown

**Header** (sticky, `bg-surface/90 backdrop-blur`, border-b):

- Kiri: (mobile: hamburger) + judul halaman dinamis dari route
- Kanan: chip tanggal "Data per hari ini" (hidden < sm) + avatar (mobile)

## 8. Chart (Recharts)

- **Tren leads**: grouped bar 4 seri — Total `#0ea5e9`, Deal `#10b981`, No Deal `#f43f5e`, Proses `#f59e0b`. **Granularitas otomatis** mengikuti panjang rentang filter: ≤14 hari → harian ("Sen 29/9"), ≤120 hari → mingguan ("28 Sep–4 Okt"), >120 hari → bulanan ("Sep 2026"). Periode kosong tetap muncul (bar 0). Badge granularitas ("Per hari"/"Per minggu"/"Per bulan") di header card. Toggle manual Minggu/Bulan dihapus (keputusan Dimas)
- **Jenis leads**: donut dua tonal sky — Iklan `#0ea5e9`, Organik `#7dd3fc` (bukan dua warna keras)
- Grid `#e9e9f0`, hanya garis horizontal (bar horizontal: hanya vertikal)
- Bar: `radius` 4px di ujung atas
- Tooltip: putih, `rounded-md border-border-default`, shadow tipis
- **Leaderboard sales**: tabel minimalis ala referensi (Product info style) — header polos tanpa bg/uppercase (`text-sm font-medium text-text-secondary`), baris `border-t` dengan hover lembut; kolom Sales = **teks saja** (tanpa avatar), title-case ("Ica", bukan "ICA"); kolom angka biasa; kolom terakhir % Deal = **teks polos** ("50%", "—" kalau kosong) tanpa pill/warna. Tanpa kolom omset (dihapus atas permintaan Dimas)

## 9. Aturan untuk AI Agent

- Jangan memperkenalkan warna/rounded/spacing baru di luar dokumen ini tanpa diminta eksplisit.
- Komponen baru wajib masuk tabel Section 6 setelah dibuat.
- Warna kustom hanya lewat token `tailwind.config.js`; palette Tailwind standar (gray, amber, emerald, red) boleh dipakai langsung.
- Ikon: **lucide-react** (sudah terpasang), ukuran 16–20px, `strokeWidth 2`.
