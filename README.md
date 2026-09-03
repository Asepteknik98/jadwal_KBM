# Personal Teaching Schedule

Website pribadi untuk mencatat dan mengingat jadwal mengajar mingguan di SMK Jaya Buana. Aplikasi dibuat ringan, responsif, dan dapat dijalankan sebagai static website tanpa backend.

## Fitur

- Dashboard dengan tanggal dan jam lokal secara realtime.
- Ringkasan serta daftar jadwal mengajar hari ini.
- Deteksi kelas yang sedang berlangsung.
- Jadwal mingguan dari Senin sampai Jumat.
- Kelola jadwal: tambah, edit, dan hapus.
- Penyimpanan lokal menggunakan IndexedDB.
- Pengaturan nama pengguna dan nama sekolah.
- Download dan restore backup dalam format JSON.
- Reset data dengan konfirmasi dua tahap.
- Tampilan responsif untuk desktop dan ponsel.

## Teknologi

- HTML5
- CSS3
- Vanilla JavaScript
- IndexedDB

Tidak memerlukan Node.js, database server, framework, atau proses build.

## Cara Clone

Pastikan [Git](https://git-scm.com/) sudah terpasang, kemudian jalankan:

```bash
git clone https://github.com/Asepteknik98/jadwal_KBM.git
cd jadwal_KBM
```

## Cara Menjalankan

### Menggunakan VS Code

1. Buka folder `jadwal_KBM` di Visual Studio Code.
2. Pasang ekstensi **Live Server** jika belum tersedia.
3. Klik kanan `index.html`.
4. Pilih **Open with Live Server**.

### Menggunakan Python

Jika Python sudah tersedia, jalankan dari folder project:

```bash
python -m http.server 8000
```

Kemudian buka `http://localhost:8000` di browser.

`index.html` juga dapat dibuka langsung, tetapi local server direkomendasikan agar perilaku browser dan IndexedDB lebih konsisten.

## Cara Menggunakan

1. Buka menu **Kelola Jadwal**.
2. Pilih **Tambah Jadwal**.
3. Isi hari, sesi, rentang Jam Ke, waktu, kelas, dan mata pelajaran.
4. Simpan jadwal.
5. Lihat hasilnya melalui **Jadwal Mingguan** atau **Dashboard**.
6. Gunakan **Backup & Pengaturan** untuk menyimpan identitas dan mengunduh cadangan data.

## Backup Data

Data hanya tersimpan di browser dan perangkat yang digunakan. Lakukan backup secara berkala:

1. Buka **Backup & Pengaturan**.
2. Pilih **Download Backup**.
3. Simpan file JSON di tempat yang aman.
4. Gunakan **Restore Backup** untuk memulihkan data.

Restore akan mengganti jadwal dan pengaturan yang sedang tersimpan.

## Struktur Project

```text
jadwal_KBM/
├── assets/
│   ├── icons/
│   └── images/
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── database.js
│   ├── schedule.js
│   ├── dashboard.js
│   ├── settings.js
│   └── backup.js
├── index.html
└── README.md
```

## Issue dan Keterbatasan

- Data tidak tersinkronisasi otomatis antarperangkat karena tidak menggunakan backend.
- Menghapus data browser dapat menghapus jadwal jika belum membuat backup.
- Jadwal lama yang dibuat sebelum rentang Jam Ke ditambahkan tetap dibaca sebagai satu Jam Ke dan dapat diperbarui melalui menu edit.
- Jadwal berikutnya dan countdown masih berupa placeholder.
- Tombol tema belum diaktifkan.
- Notifikasi pengingat belum tersedia.

Jika menemukan masalah, silakan membuat laporan melalui [GitHub Issues](https://github.com/Asepteknik98/jadwal_KBM/issues). Sertakan browser, perangkat, langkah untuk memunculkan masalah, dan tangkapan layar jika memungkinkan.

## Rencana Fitur

- Validasi jadwal yang waktunya bentrok.
- Jadwal berikutnya dan countdown realtime.
- Notifikasi sebelum waktu mengajar.
- Tema terang dan gelap.
- Penyempurnaan aksesibilitas dan pengujian lintas browser.

## Kontribusi

Project ini terbuka untuk dipelajari dan dikembangkan kembali.

1. Fork repository ini.
2. Buat branch fitur: `git checkout -b fitur/nama-fitur`.
3. Commit perubahan Anda.
4. Push branch ke repository hasil fork.
5. Buat pull request dengan penjelasan perubahan yang jelas.
