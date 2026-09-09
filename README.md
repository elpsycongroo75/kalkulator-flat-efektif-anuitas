# Kalkulator Suku Bunga Bank: Flat ⇄ Efektif ⇄ Anuitas

Aplikasi web interaktif modern untuk konversi suku bunga bank, simulasi jadwal angsuran (amortisasi), perhitungan bunga harian (*daily interest*), dan ekspor laporan Excel interaktif (`.xlsx`). Dibangun murni menggunakan **Vanilla JavaScript** tanpa framework berat sehingga sangat cepat, ringan, dan siap dideploy gratis di **Vercel**.

## 🚀 Fitur Utama

1. **Konversi Suku Bunga Dua Arah (Dual-Direction)**
   - **Flat ke Efektif & Anuitas**: Menggunakan metode numerik Newton-Raphson / IRR perbankan standar Bank Indonesia & OJK, dilengkapi formula estimasi $r_{eff} \approx \frac{2n}{n+1} \times r_{flat}$.
   - **Efektif / Anuitas ke Flat**: Menghitung kembali suku bunga flat ekuivalen dari cicilan anuitas maupun sliding rate.

2. **Tabel Jadwal Angsuran & Komparasi 3 Metode**
   - Komparasi berdampingan: **Flat vs Efektif (Menurun/Sliding) vs Anuitas**.
   - Ringkasan KPI: Cicilan Awal, Cicilan Akhir, Total Beban Bunga, dan Estimasi Penghematan Bunga.
   - Tabel angsuran detail per bulan dengan pagination cerdas.
   - Grafik interaktif (Chart.js): Bar chart komposisi Pokok vs Bunga, dan Line chart kurva penurunan Baki Debet.

3. **Kalkulator Bunga Harian (*Daily Interest Simulator*)**
   - Mendukung konvensi hari perbankan: **Actual/360** (standar bank komersial Indonesia), **Actual/365**, dan **30/360**.
   - Simulasi hari berjalan (*accrued interest*) dan kalkulasi pelunasan dipercepat (*early payoff penalty*).

4. **Ekspor Excel Interaktif (.xlsx)**
   - Menghasilkan file Excel multi-sheet terformat rapi:
     1. Ringkasan & Komparasi Metode
     2. Jadwal Angsuran Anuitas
     3. Jadwal Angsuran Efektif Menurun
     4. Jadwal Angsuran Flat
     5. Simulasi Bunga Harian
   - Lengkap dengan formula penjumlahan `=SUM()`.

## 📦 Menjalankan Secara Lokal

Karena proyek ini murni Vanilla JavaScript dengan modul ES6, cukup jalankan server statis lokal:

```bash
# Menggunakan Python
python -m http.server 3000

# Atau menggunakan Node.js
npx serve .
```

Buka peramban di `http://localhost:3000`.

## ☁️ Deploy di Vercel Gratisan (Hobby Tier)

1. Fork atau push repositori ini ke akun GitHub Anda.
2. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **Add New Project**.
3. Hubungkan repositori GitHub ini.
4. Pada bagian **Framework Preset**, biarkan **Other** (karena murni statis HTML/JS).
5. Klik **Deploy**. Selesai dalam hitungan detik!

## 📚 Dasar Rumus Finansial

- **Bunga Flat:**
  $$\text{Bunga/Bulan} = \frac{P \times r_{flat}}{12}, \quad \text{Pokok/Bulan} = \frac{P}{n}$$
- **Bunga Efektif (Sliding):**
  $$\text{Bunga Bulan } k = S_{k-1} \times \frac{r_{eff}}{12}, \quad \text{Pokok/Bulan} = \frac{P}{n}$$
- **Bunga Anuitas:**
  $$PMT = P \times \frac{i(1+i)^n}{(1+i)^n - 1}, \quad \text{di mana } i = \frac{r_{ann}}{12}$$
- **Bunga Harian:**
  $$\text{Bunga Harian} = \frac{\text{Pokok} \times r}{\text{Basis Hari (360/365)}} \times \text{Hari Berjalan}$$

---
Dibuat untuk para praktisi perbankan, Relationship Manager (RM), debitur, dan pelaku usaha di Indonesia.
