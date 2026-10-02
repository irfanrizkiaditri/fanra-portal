# Fanra AI Portal - Design Direction

## Identity
Portal kendali pribadi untuk Irfan. Bukan produk publik, bukan landing page.
Tampilan: panel kontrol rumah yang bersih, terang, dan mudah dibaca cepat.

## Personality
Tenang dan fungsional. Tidak ada buzzword, tidak ada gradien mencolok.
Prioritasnya adalah: dalam 2 detik buka halaman, langsung tahu service mana yang hidup.

## Palette
- Base: putih bersih (#ffffff) dan off-white (#f6f7f9) untuk permukaan
- Teks utama: #14181f (hampir hitam, kontras tinggi di latar putih)
- Teks sekunder: #5a6472 (lolos AA untuk teks normal di putih)
- Border: #e2e6ec
- Accent utama: #0f8a5f (hijau Empuk, dipakai hanya untuk status online dan CTA utama)
- Accent status: #c0392b (merah bata, hanya untuk offline/error)
- Total: 2 core (putih, hampir hitam) + 1 accent hijau + 1 accent status merah

## Typography
- Sans: Geist (bawaan proyek, sudah terpasang). Dipilih karena ringan dan terbaca di angka.
- Mono: Geist Mono untuk data teknis (URL, port, timestamp, JSON).
- Bukan pilihan default template: tidak ada monospace heading besar.

## Mood
Cerah, lapang, seperti panel administrasi yang dirawat. Whitespace besar antar bagian.

## Dials
ENERGY 1 / RHYTHM 2 / MOTION 1
- ENERGY 1: tenang, linear, tidak ada gradien atau glow
- RHYTHM 2: grid konsisten dengan beberapa jeda (hero lebar, kartu grid, chat full-width)
- MOTION 1: hanya hover state, tidak ada animasi loop

## Catatan
- Tema terang saja (light only), tidak ada toggle dark. Alasan: ini panel kontrol yang
  dibaca cepat di siang hari, dan R-34 mengharuskan setiap tema yang dikirim berfungsi penuh.
- Tidak ada statistik yang tidak punya sumber. Status service adalah data nyata dari API.
