# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Katalog (US-01)". Hubungkan halaman / ke tabel produk di Supabase menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY. Data diambil di sisi server. Setiap kartu menampilkan foto, kategori, nama, dan harga dalam format rupiah. Jika belum ada produk, tampilkan pesan yang jelas. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Halaman utama berhasil menampilkan produk dari Supabase. Data diambil di server menggunakan buatKlienServer(). Kartu produk menampilkan foto, kategori, nama, dan harga. Jika belum ada produk, muncul pesan "Belum ada produk".

**Perbaikan:**
SUPABASE_URL di .env.local semula berisi suffix /rest/v1/ yang menyebabkan URL ganda. Diperbaiki dengan membersihkan URL di server.js dan memperbarui .env.local.

## US-02 Detail produk

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Detail Produk (US-02)". Hubungkan halaman /produk/[id] ke Supabase: ambil satu produk berdasarkan id, tampilkan foto, kategori, nama, harga, dan deskripsi. Jika produk tidak ditemukan, tampilkan halaman "tidak ditemukan". Hapus CatatanBelumAktif.

**Hasil:**
Halaman detail produk berhasil mengambil data dari Supabase menggunakan .eq("id", id).maybeSingle(). Jika produk tidak ada, notFound() dipanggil. Semua kolom ditampilkan dengan benar.

**Perbaikan:**
Params di Next.js 16 berupa Promise, sehingga perlu await params sebelum mengambil id.

## US-03 Pesan via WhatsApp

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)". Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Hapus CatatanBelumAktif dari halaman detail produk.

**Hasil:**
Tombol berubah menjadi tag <a> dengan href ke wa.me, target="_blank", dan pesan otomatis yang sudah ter-encode. Berfungsi di HP dan laptop.

**Perbaikan:**
Nomor WhatsApp dibersihkan dari karakter non-angka menggunakan .replace(/\D/g, "") agar format internasional selalu benar.

## US-04 Login admin

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04. Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error. Buat tombol "Keluar" di components/NavAdmin.jsx berfungsi. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
Server Action masuk() memproses login via Supabase Auth. Login berhasil redirect ke /admin, gagal menampilkan pesan error. Tombol Keluar memanggil Server Action keluar() yang memanggil signOut() lalu redirect ke /admin/login.

**Perbaikan:**
Dibuat lib/supabase/auth.js menggunakan createServerClient dari @supabase/ssr dengan pola getAll/setAll untuk menangani cookie dengan benar di Server Action.

## US-05 Ganti password

**Prompt:**
Baca docs/user-stories.md bagian US-05. Buat Server Action gantiPassword() di app/admin/actions.js untuk admin yang sedang login. Validasi: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau error. Sambungkan ke form di app/admin/password/page.jsx. Hapus CatatanBelumAktif.

**Hasil:**
Server Action gantiPassword() berhasil dibuat. Validasi dilakukan di server: cek panjang password dan kecocokan konfirmasi. Sesi admin diperiksa dengan getUser() sebelum updateUser() dipanggil. Pesan berhasil atau error ditampilkan di halaman.

**Perbaikan:**
getUser() digunakan (bukan getSession()) untuk memverifikasi sesi ke server Supabase secara aman sebelum mengizinkan perubahan password.

## US-06 Proteksi halaman admin

**Prompt:**
Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06. Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
File proxy.js dibuat di root proyek dengan fungsi bernama proxy (bukan middleware, sesuai Next.js 16). Semua rute /admin kecuali /admin/login dilindungi: getUser() digunakan untuk memverifikasi sesi, dan pengguna yang belum login diarahkan ke /admin/login. Server Action gantiPassword() sudah memeriksa login sebelum mengubah data.

**Perbaikan:**
Nama fungsi awalnya middleware, lalu diperbaiki menjadi proxy sesuai konvensi Next.js 16 yang mensyaratkan nama fungsi sama dengan nama file.

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

### Perbaikan konfigurasi proxy dan Next.js

**Masalah:**
Proxy admin belum menangani konfigurasi Supabase yang kosong secara eksplisit. Dependensi Next.js 16.3.8 juga ditandai memiliki kerentanan kritis oleh `npm audit`.

**Perbaikan:**
Proxy kini mengalihkan semua rute admin selain `/admin/login` ke halaman login jika `SUPABASE_URL` atau `SUPABASE_PUBLISHABLE_KEY` kosong, sehingga rute admin gagal secara tertutup. Next.js diperbarui ke 16.4.3.

**Verifikasi:**
`npm run build` berhasil dan `npm audit` melaporkan 0 kerentanan.
