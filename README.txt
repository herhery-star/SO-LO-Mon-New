SO-LO Monitoring PWA

Isi paket:
- index.html                  Aplikasi utama
- manifest.webmanifest        Konfigurasi PWA
- service-worker.js           Cache aplikasi
- icons/                      Icon Android dari gambar yang diberikan

PENTING:
PWA tidak boleh dijalankan langsung dari file:///.
Upload seluruh isi folder ini ke hosting HTTPS, misalnya GitHub Pages.
Setelah dibuka melalui Chrome Android, pilih menu ⋮ > Install app / Tambahkan ke layar utama.

Catatan:
Aplikasi dapat dipasang seperti aplikasi Android. Data Supabase tetap membutuhkan
koneksi internet untuk membaca/menulis data. Service worker membuat aplikasi dan
asset dapat dimuat lebih cepat serta menyediakan dasar cache offline.
