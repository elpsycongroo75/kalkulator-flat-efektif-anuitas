/**
 * Excel Export Engine using SheetJS (XLSX)
 * Standar Pelaporan Keuangan Perbankan
 */

export const ExcelExport = {
  exportAmortizationWorkbook({ flatData, effData, annData, dailyData, params }) {
    if (typeof XLSX === 'undefined') {
      alert('Library SheetJS (XLSX) sedang dimuat. Silakan coba sesaat lagi.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // 1. SHEET: RINGKASAN & KOMPARASI
    const summaryData = [
      ['LAPORAN SIMULASI & KOMPARASI SUKU BUNGA BANK'],
      ['Kalkulator Bunga Flat vs Efektif vs Anuitas'],
      ['Tanggal Cetak:', new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })],
      [],
      ['PARAMETER PINJAMAN'],
      ['Plafon Pokok Pinjaman (P)', params.principal, 'IDR'],
      ['Tenor Pinjaman (Bulan)', params.nMonths, 'Bulan'],
      ['Tenor Pinjaman (Tahun)', (params.nMonths / 12).toFixed(2), 'Tahun'],
      ['Suku Bunga Acuan (% p.a.)', params.rateAnnual / 100, 'Persen'],
      ['Basis Perhitungan Hari', params.dayCountConvention, 'Hari'],
      ['Tanggal Mulai Angsuran', params.startDate],
      [],
      ['TABEL PERBANDINGAN METODE BUNGA'],
      [
        'Metode Perhitungan',
        'Suku Bunga (% p.a.)',
        'Cicilan Pertama',
        'Cicilan Terakhir',
        'Total Bunga Dibayar',
        'Total Pembayaran (Pokok+Bunga)',
        'Selisih Bunga vs Anuitas'
      ],
      [
        'Bunga Flat (Tetap)',
        flatData.rateAnnual + '%',
        Math.round(flatData.firstInstallment),
        Math.round(flatData.lastInstallment),
        Math.round(flatData.totalInterest),
        Math.round(flatData.totalPayment),
        Math.round(flatData.totalInterest - annData.totalInterest)
      ],
      [
        'Bunga Efektif (Menurun/Sliding)',
        effData.rateAnnual + '%',
        Math.round(effData.firstInstallment),
        Math.round(effData.lastInstallment),
        Math.round(effData.totalInterest),
        Math.round(effData.totalPayment),
        Math.round(effData.totalInterest - annData.totalInterest)
      ],
      [
        'Bunga Anuitas (Cicilan Rata)',
        annData.rateAnnual + '%',
        Math.round(annData.firstInstallment),
        Math.round(annData.lastInstallment),
        Math.round(annData.totalInterest),
        Math.round(annData.totalPayment),
        0
      ],
      [],
      ['CATATAN & ANALISIS FINANSIAL:'],
      ['1. Bunga Flat menghitung bunga atas pokok awal secara konstan hingga akhir masa kredit.'],
      ['2. Bunga Efektif menghitung bunga atas sisa baki debet pokok pinjaman (angsuran terus menurun).'],
      ['3. Bunga Anuitas menghasilkan total angsuran bulanan yang tepat sama (porsi bunga menurun, porsi pokok membesar).'],
      ['4. Pada nominal suku bunga nominal yang sama, total beban bunga Flat jauh lebih tinggi dibandingkan Efektif dan Anuitas.']
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 32 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 28 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan & Komparasi');

    // HELPER JADWAL SHEET
    const createScheduleSheet = (data, title) => {
      const rows = [
        [title.toUpperCase()],
        ['Plafon: ' + params.principal.toLocaleString('id-ID'), 'Tenor: ' + params.nMonths + ' Bulan', 'Suku Bunga: ' + data.rateAnnual + '% p.a.'],
        [],
        [
          'Bulan Ke',
          'Tanggal Jatuh Tempo',
          'Baki Debet Awal (Rp)',
          'Angsuran Pokok (Rp)',
          'Angsuran Bunga (Rp)',
          'Total Angsuran (Rp)',
          'Baki Debet Akhir (Rp)'
        ]
      ];

      data.schedule.forEach(item => {
        rows.push([
          item.month,
          item.dueDate,
          Math.round(item.initialBalance),
          Math.round(item.principal),
          Math.round(item.interest),
          Math.round(item.totalInstallment),
          Math.round(item.remainingBalance)
        ]);
      });

      // Total Row
      rows.push([
        'TOTAL',
        '',
        '',
        Math.round(data.principal),
        Math.round(data.totalInterest),
        Math.round(data.totalPayment),
        0
      ]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 22 },
        { wch: 20 },
        { wch: 20 },
        { wch: 22 },
        { wch: 22 }
      ];
      return ws;
    };

    // 2. SHEET: JADWAL ANUITAS
    const wsAnnuity = createScheduleSheet(annData, 'Jadwal Angsuran Bunga Anuitas (Cicilan Tetap)');
    XLSX.utils.book_append_sheet(wb, wsAnnuity, 'Jadwal Anuitas');

    // 3. SHEET: JADWAL EFEKTIF
    const wsEff = createScheduleSheet(effData, 'Jadwal Angsuran Bunga Efektif (Bunga Menurun / Sliding)');
    XLSX.utils.book_append_sheet(wb, wsEff, 'Jadwal Efektif');

    // 4. SHEET: JADWAL FLAT
    const wsFlat = createScheduleSheet(flatData, 'Jadwal Angsuran Bunga Flat (Tetap)');
    XLSX.utils.book_append_sheet(wb, wsFlat, 'Jadwal Flat');

    // 5. SHEET: BUNGA HARIAN & EARLY PAYOFF
    if (dailyData) {
      const dailyRows = [
        ['SIMULASI PERHITUNGAN BUNGA HARIAN & PELUNASAN DIPERCEPAT'],
        ['Basis Hari: ' + dailyData.convention + ' (' + dailyData.basisDays + ' hari/tahun)'],
        [],
        ['Parameter Bunga Harian', 'Nilai', 'Satuan'],
        ['Plafon Pokok', dailyData.principal, 'IDR'],
        ['Suku Bunga Tahunan', dailyData.rateAnnual + '%', 'p.a.'],
        ['Suku Bunga Efektif per Hari', dailyData.dailyRatePercent.toFixed(6) + '%', 'per hari'],
        ['Nominal Bunga per Hari', Math.round(dailyData.dailyInterestAmount), 'IDR/hari'],
        ['Hari Berjalan Simulasi', dailyData.days, 'Hari'],
        ['Akumulasi Bunga Berjalan', Math.round(dailyData.totalAccruedInterest), 'IDR'],
        ['Biaya Penalti Pelunasan Dipercepat', dailyData.penaltyPercent + '%', 'Persen'],
        ['Nominal Penalti', Math.round(dailyData.penaltyFee), 'IDR'],
        ['TOTAL ESTIMASI PELUNASAN HARI INI', Math.round(dailyData.totalEarlyPayoff), 'IDR'],
        [],
        ['TABEL SIMULASI BUNGA HARIAN BERBAGAI PERIODE'],
        ['Periode Hari', 'Bunga Flat (Rp)', 'Bunga Efektif (Rp)', 'Total Pelunasan (Pokok+Bunga)']
      ];

      const sampleDays = [1, 7, 14, 30, 45, 60, 90, 120, 180, 270, 360];
      sampleDays.forEach(d => {
        const accrued = Math.round(dailyData.dailyInterestAmount * d);
        dailyRows.push([
          d + ' Hari',
          accrued,
          accrued,
          Math.round(dailyData.principal + accrued)
        ]);
      });

      const wsDaily = XLSX.utils.aoa_to_sheet(dailyRows);
      wsDaily['!cols'] = [{ wch: 34 }, { wch: 22 }, { wch: 22 }, { wch: 26 }];
      XLSX.utils.book_append_sheet(wb, wsDaily, 'Bunga Harian');
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Simulasi_Bunga_Bank_${params.principal}_${params.nMonths}Bln_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  }
};
