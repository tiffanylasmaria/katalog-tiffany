# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**

**Hasil:**

**Perbaikan:**

## US-02 Detail produk

**Prompt:**

**Hasil:**

**Perbaikan:**

## US-03 Pesan via WhatsApp

**Prompt:**

**Hasil:**

**Perbaikan:**

## US-04 Login admin

**Prompt:**

**Hasil:**

**Perbaikan:**

## US-05 Ganti password

**Prompt:**

**Hasil:**

**Perbaikan:**

## US-06 Proteksi halaman admin

**Prompt:**

**Hasil:**

**Perbaikan:**

## Debugging dan fitur bonus

Tambahkan bagian baru untuk setiap error yang kamu perbaiki atau fitur bonus yang kamu kerjakan.

### Perbaikan proteksi admin dan Next.js

**Masalah:**
Deployment dari branch `master` masih memakai ekspor `middleware` di `proxy.js`, sehingga proteksi rute tidak dijalankan pada Next.js 16. Konfigurasi Supabase yang kosong juga belum ditangani secara eksplisit.

**Perbaikan:**
Gunakan ekspor bernama `proxy` sesuai Next.js 16 dan alihkan rute admin ke login saat URL atau publishable key Supabase kosong. Next.js diperbarui ke 16.4.3.

**Verifikasi:**
Build berhasil, rute admin tanpa konfigurasi dialihkan ke login, dan `npm audit` melaporkan 0 kerentanan.
