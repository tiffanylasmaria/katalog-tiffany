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

## US-07 List Produk

**Prompt:** Hubungkan daftar produk admin ke tabel `produk` di Supabase.

**Hasil:** Halaman admin memeriksa sesi admin di server, mengambil produk melalui koneksi Supabase bersesi, dan menampilkan status kosong atau pesan error.

## US-08 Tambah produk

**Prompt:** Aktifkan form tambah produk dengan Server Action yang memeriksa sesi admin.

**Hasil:** Server Action memvalidasi nama dan harga, menyimpan data ke Supabase, memperbarui cache katalog, lalu mengarahkan kembali ke `/admin`. Form menampilkan pesan jika penyimpanan gagal.

## US-09 Ubah produk

**Prompt:** Ambil produk untuk form ubah dari Supabase dan simpan perubahan melalui Server Action terlindungi.

**Hasil:** Halaman ubah mengambil data berdasarkan ID dari Supabase. Server Action memeriksa sesi, memvalidasi input, memperbarui produk, memperbarui cache, lalu mengarahkan kembali ke `/admin`.

## US-10 sampai US-50

**Prompt:** Kerjakan fitur bonus US-10–US-50 yang tercantum di `docs/user-stories.md`, dengan Supabase hanya di server dan aksi admin dilindungi sesi.

**Hasil:** Ditambahkan aksi hapus/urut/status produk, cari/filter/paginasi, harga diskon/stok/varian, galeri, upload Storage, keranjang, favorit, riwayat, bandingkan, ulasan dan moderasi, log klik/aktivitas, dashboard, banner, pengaturan toko, akun admin, impor/ekspor CSV, kategori, halaman tentang, dark mode, PWA, metadata, sitemap/robots, skeleton, dan fitur AI Gemini.

**Perbaikan:** Skema tambahan dan policy RLS ditulis secara idempotent di `docs/schema.sql`. Fitur AI memakai `GEMINI_API_KEY` di server saja; fitur ini menampilkan pesan bila kunci belum diatur.

## Catatan setelah penilaian

Prompt bertanda **[SENDIRI]** di bawah adalah instruksi tambahan yang ditulis di luar lembar user story. Isinya diringkas dari permintaan dan temuan penilaian, bukan kutipan kata demi kata.

### US-21 Keranjang: ubah jumlah dan hapus item

**Prompt [SENDIRI]:** Perbaiki US-21. Di keranjang, sediakan kontrol untuk mengubah jumlah tiap produk dan menghapus produk. Pastikan jumlah, total harga, penyimpanan browser, dan pesan WhatsApp massal mengikuti isi keranjang terbaru.

**Hasil:** Setiap baris keranjang kini memiliki input jumlah dan tombol Hapus. Perubahan jumlah dan penghapusan disimpan ke `localStorage`; total dan isi pesan WhatsApp dihitung dari daftar terbaru.

**Perbaikan:** Sebelumnya keranjang hanya menampilkan daftar dan total. Kontrol jumlah dibatasi minimal 1 dan maksimal 99 agar nilai yang tidak valid tidak tersimpan.

**Verifikasi:** `npm run build` berhasil. Perubahan sudah dideploy ke Production.

### US-37 Produk perbandingan yang tidak tersedia

**Prompt [SENDIRI]:** Perbaiki US-37. Jika produk yang tersimpan di daftar perbandingan sudah tidak ada atau tidak aktif, tampilkan pesan “Produk tidak ditemukan” yang jelas. Bersihkan ID produk usang supaya pengunjung bisa memilih produk lain. URL detail produk yang tidak ada harus mengembalikan HTTP 404.

**Hasil:** Halaman perbandingan menampilkan pesan khusus bila pilihan tidak ditemukan, menandai bila sebagian pilihan hilang, dan membersihkan ID yang tidak lagi tersedia dari `localStorage`.

**Perbaikan:** `notFound()` sebelumnya menampilkan konten 404 dengan status HTTP 200 karena batas loading global memulai streaming terlalu cepat. Loading dipindahkan ke bagian admin agar halaman detail dapat mengirim status 404.

**Verifikasi:** `npm run build` berhasil. Permintaan ke `/produk/987654321` pada situs Production mengembalikan HTTP 404. Deployment berstatus Ready.

### Penanganan kolom produk lama

**Prompt [SENDIRI]:** Jika kolom tambahan `aktif` atau `stok` belum ada di database lama, sesuaikan pencarian produk pada endpoint pertanyaan agar produk yang ada tetap dapat ditemukan. Jangan kirim kunci ke browser.

**Hasil:** Endpoint mencoba kolom fitur terlebih dahulu, lalu memakai kolom dasar produk saat kolom tambahan belum tersedia. Kunci tetap dibaca hanya dari environment server.

**Perbaikan:** Pengujian endpoint menunjukkan query gagal ketika skema belum memiliki kolom tambahan. Fallback untuk `stok` dan `aktif` ditambahkan.

**Verifikasi:** Build berhasil dan perubahan terdeploy. Panggilan langsung ke Google menolak nilai `GEMINI_API_KEY` yang ada saat itu (`API_KEY_INVALID`); fitur yang memerlukan Gemini belum terverifikasi berhasil sampai key valid dipasang di Vercel.

### Perbaikan proteksi admin dan Next.js

**Masalah:**
Deployment dari branch `master` masih memakai ekspor `middleware` di `proxy.js`, sehingga proteksi rute tidak dijalankan pada Next.js 16. Konfigurasi Supabase yang kosong juga belum ditangani secara eksplisit.

**Perbaikan:**
Gunakan ekspor bernama `proxy` sesuai Next.js 16 dan alihkan rute admin ke login saat URL atau publishable key Supabase kosong. Next.js diperbarui ke 16.4.3.

**Verifikasi:**
Build berhasil, rute admin tanpa konfigurasi dialihkan ke login, dan `npm audit` melaporkan 0 kerentanan.
