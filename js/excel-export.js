/**
 * Excel Export Engine using ExcelJS
 * Standar Pelaporan Keuangan & Perbankan Profesional (OJK & BI)
 * - Lebar kolom proporsional (100% muat satu layar, tidak melebar karena sel merge)
 * - Freeze panes pada header tabel
 * - Zebra striping & border tegas (#CBD5E1)
 * - Format angka akuntansi ("Rp "#,##0) & rumus SUM aktif
 */

export const ExcelExport = {
  /**
   * Styling Header Kolom Tabel
   */
  styleHeaderRow(row, bgArgb = 'FF1E3A8A', fontArgb = 'FFFFFFFF', maxCols = 7) {
    for (let c = 1; c <= maxCols; c++) {
      const cell = row.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgArgb }
      };
      cell.font = {
        name: 'Calibri',
        size: 10,
        bold: true,
        color: { argb: fontArgb }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF0F172A' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF475569' } },
        right: { style: 'thin', color: { argb: 'FF475569' } }
      };
    }
    row.height = 28;
  },

  /**
   * Styling Sel Data dengan Zebra Striping & Border Jelas
   */
  styleDataCell(cell, { isNumber = false, isCurrency = false, isPercent = false, isMicroPercent = false, align = 'left', isEvenRow = false, bold = false, textColor = 'FF1E293B' } = {}) {
    cell.font = { name: 'Calibri', size: 10, bold, color: { argb: textColor } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isEvenRow ? 'FFF8FAFC' : 'FFFFFFFF' }
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
    cell.alignment = { vertical: 'middle', horizontal: align, wrapText: false };

    if (isCurrency) {
      cell.numFmt = '"Rp "#,##0;("Rp "#,##0);"-"';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
    } else if (isMicroPercent) {
      cell.numFmt = '0.000000%';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
    } else if (isPercent) {
      cell.numFmt = '0.00%';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
    } else if (isNumber) {
      cell.numFmt = '#,##0';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
    }
  },

  /**
   * Styling Baris Total (Garis Ganda Akuntansi)
   */
  styleTotalRow(row, maxCols = 7) {
    for (let c = 1; c <= maxCols; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF94A3B8' } },
        right: { style: 'thin', color: { argb: 'FF94A3B8' } }
      };
    }
    row.height = 26;
  },

  /**
   * Helper Mendapatkan Class Workbook ExcelJS
   */
  async getExcelJSClass() {
    if (typeof ExcelJS !== 'undefined') return ExcelJS;
    if (typeof window !== 'undefined' && window.ExcelJS) return window.ExcelJS;
    try {
      const mod = await import('exceljs');
      return mod.default || mod;
    } catch {
      return null;
    }
  },

  /**
   * Ekspor Workbook Lengkap / Sesuai Pilihan Pengguna
   */
  async exportAmortizationWorkbook({ flatData, effData, annData, dailyData, params, exportMode = 'ALL' }) {
    const ExcelClass = await this.getExcelJSClass();

    if (!ExcelClass) {
      alert('Library ExcelJS sedang dimuat atau tidak tersedia. Pastikan koneksi internet aktif.');
      return null;
    }

    const wb = new ExcelClass.Workbook();
    wb.creator = 'Kalkulator Suku Bunga Bank';
    wb.created = new Date();

    // =============================================================
    // SHEET 1: RINGKASAN & KOMPARASI METODE
    // =============================================================
    const wsSummary = wb.addWorksheet('1. Ringkasan & Komparasi', {
      views: [{ showGridLines: true }]
    });

    // Set Lebar Kolom Eksplisit & Proporsional untuk Sheet 1 (Kolom A s.d. H)
    wsSummary.columns = [
      { key: 'colA', width: 28 }, // Metode / Label Parameter
      { key: 'colB', width: 18 }, // Suku Bunga / Nilai Parameter
      { key: 'colC', width: 20 }, // Cicilan Bulan 1
      { key: 'colD', width: 20 }, // Cicilan Terakhir
      { key: 'colE', width: 20 }, // Total Bunga
      { key: 'colF', width: 22 }, // Total Pembayaran
      { key: 'colG', width: 20 }, // Selisih vs Efektif
      { key: 'colH', width: 42 }  // Karakteristik & Rekomendasi
    ];

    // Banner Judul Utama
    wsSummary.mergeCells('A1:H1');
    const titleCell = wsSummary.getCell('A1');
    titleCell.value = 'LAPORAN SIMULASI & KOMPARASI SUKU BUNGA BANK';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsSummary.getRow(1).height = 30;

    wsSummary.mergeCells('A2:H2');
    const subTitle = wsSummary.getCell('A2');
    subTitle.value = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}  |  Standar Perhitungan Otoritas Jasa Keuangan (OJK) & Bank Indonesia`;
    subTitle.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF334155' } };
    subTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    subTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsSummary.getRow(2).height = 20;

    // Bagian 1: Parameter Pinjaman Utama (Tabel Ringkas 2 Kolom A & B-C)
    wsSummary.getCell('A4').value = 'I. PARAMETER PINJAMAN UTAMA';
    wsSummary.getCell('A4').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E3A8A' } };
    wsSummary.getRow(4).height = 22;

    const paramItems = [
      ['Plafon Pokok Pinjaman (P)', `Rp ${Math.round(params.principal).toLocaleString('id-ID')}`],
      ['Tenor Pinjaman', `${params.nMonths} Bulan (${(params.nMonths / 12).toFixed(1)} Tahun)`],
      ['Suku Bunga Acuan (% p.a.)', `${params.rateAnnual.toFixed(2)}% per tahun`],
      ['Basis Perhitungan Hari', `${params.dayCountConvention} (${dailyData.basisDays} Hari/Tahun)`],
      ['Tanggal Mulai Kredit', params.startDate]
    ];

    let rowIdx = 5;
    paramItems.forEach(([label, valStr], idx) => {
      const r = wsSummary.getRow(rowIdx);
      r.height = 21;

      // Kolom A: Label
      const cLabel = r.getCell(1);
      cLabel.value = label;
      this.styleDataCell(cLabel, { align: 'left', bold: true, isEvenRow: true, textColor: 'FF334155' });

      // Merge B & C agar nilai parameter leluasa dan rata kiri seragam
      wsSummary.mergeCells(`B${rowIdx}:C${rowIdx}`);
      const cVal = r.getCell(2);
      cVal.value = valStr;
      this.styleDataCell(cVal, { align: 'left', bold: idx === 0 || idx === 2, isEvenRow: false, textColor: 'FF0F172A' });
      this.styleDataCell(r.getCell(3), { align: 'left', isEvenRow: false });
      rowIdx++;
    });

    // Bagian 2: Tabel Komparasi 3 Metode Bunga (Bulanan / Tahunan)
    rowIdx += 1;
    wsSummary.getCell(`A${rowIdx}`).value = 'II. TABEL PERBANDINGAN 3 METODE PERHITUNGAN BUNGA (TENOR PENUH)';
    wsSummary.getCell(`A${rowIdx}`).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E3A8A' } };
    wsSummary.getRow(rowIdx).height = 22;
    rowIdx++;

    const compHeader = wsSummary.getRow(rowIdx);
    compHeader.values = [
      'Metode Perhitungan',
      'Suku Bunga p.a.',
      'Cicilan Bulan 1 (Rp)',
      'Cicilan Terakhir (Rp)',
      'Total Bunga (Rp)',
      'Total Pembayaran (Rp)',
      'Selisih vs Efektif (Rp)',
      'Karakteristik & Rekomendasi'
    ];
    this.styleHeaderRow(compHeader, 'FF1E3A8A', 'FFFFFFFF', 8);
    rowIdx++;

    const compRows = [
      [
        '1. Bunga Efektif (Sliding)',
        effData.rateAnnual / 100,
        Math.round(effData.firstInstallment),
        Math.round(effData.lastInstallment),
        Math.round(effData.totalInterest),
        Math.round(effData.totalPayment),
        0,
        'PALING HEMAT (Bunga turun tiap bulan sesuai sisa utang)'
      ],
      [
        '2. Bunga Anuitas (Cicilan Rata)',
        annData.rateAnnual / 100,
        Math.round(annData.firstInstallment),
        Math.round(annData.lastInstallment),
        Math.round(annData.totalInterest),
        Math.round(annData.totalPayment),
        Math.round(annData.totalInterest - effData.totalInterest),
        'CICILAN STABIL (Angsuran bulanan tetap, standar KPR)'
      ],
      [
        '3. Bunga Flat (Tetap)',
        flatData.rateAnnual / 100,
        Math.round(flatData.firstInstallment),
        Math.round(flatData.lastInstallment),
        Math.round(flatData.totalInterest),
        Math.round(flatData.totalPayment),
        Math.round(flatData.totalInterest - effData.totalInterest),
        'PALING BOROS (Bunga selalu dari 100% plafon awal)'
      ]
    ];

    compRows.forEach((item, idx) => {
      const r = wsSummary.getRow(rowIdx);
      r.height = 24;
      r.values = item;
      const isEven = idx % 2 === 1;

      this.styleDataCell(r.getCell(1), { align: 'left', bold: true, isEvenRow: isEven });
      this.styleDataCell(r.getCell(2), { isPercent: true, isEvenRow: isEven });
      this.styleDataCell(r.getCell(3), { isCurrency: true, isEvenRow: isEven });
      this.styleDataCell(r.getCell(4), { isCurrency: true, isEvenRow: isEven });
      this.styleDataCell(r.getCell(5), { isCurrency: true, bold: true, textColor: idx === 0 ? 'FF065F46' : 'FFB91C1C', isEvenRow: isEven });
      this.styleDataCell(r.getCell(6), { isCurrency: true, bold: true, isEvenRow: isEven });
      this.styleDataCell(r.getCell(7), { isCurrency: true, bold: true, isEvenRow: isEven });
      this.styleDataCell(r.getCell(8), { align: 'left', isEvenRow: isEven });
      rowIdx++;
    });

    // Box Insight Penghematan Finansial
    rowIdx++;
    const savings = Math.round(flatData.totalInterest - effData.totalInterest);
    const savingsPercent = ((savings / flatData.totalInterest) * 100).toFixed(1);

    wsSummary.mergeCells(`A${rowIdx}:H${rowIdx}`);
    const insightCell = wsSummary.getCell(`A${rowIdx}`);
    insightCell.value = `KESIMPULAN: Nasabah MENGHEMAT Rp ${savings.toLocaleString('id-ID')} (${savingsPercent}%) jika memilih skema Bunga Efektif dibanding Bunga Flat pada suku bunga yang sama (${params.rateAnnual}% p.a.)!`;
    insightCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    insightCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } };
    insightCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    for (let c = 1; c <= 8; c++) {
      wsSummary.getRow(rowIdx).getCell(c).border = {
        top: { style: 'medium', color: { argb: 'FF10B981' } },
        bottom: { style: 'medium', color: { argb: 'FF10B981' } },
        left: c === 1 ? { style: 'medium', color: { argb: 'FF10B981' } } : undefined,
        right: c === 8 ? { style: 'medium', color: { argb: 'FF10B981' } } : undefined
      };
    }
    wsSummary.getRow(rowIdx).height = 26;

    // Bagian 3: Tabel Komparasi Bunga Harian pada Hari ke-D
    if (dailyData && dailyData.comparison) {
      rowIdx += 2;
      wsSummary.getCell(`A${rowIdx}`).value = `III. KOMPARASI BUNGA HARIAN PADA HARI KE-${dailyData.days}`;
      wsSummary.getCell(`A${rowIdx}`).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF065F46' } };
      wsSummary.getRow(rowIdx).height = 22;
      rowIdx++;

      const dHeader = wsSummary.getRow(rowIdx);
      dHeader.values = [
        'Metode Bunga Harian',
        'Rate Harian (%)',
        'Bunga Hari Ini (Rp)',
        'Akumulasi Bunga (Rp)',
        'Sisa Pokok (Rp)',
        'Total Pelunasan (Rp)',
        'Selisih vs Efektif (Rp)',
        'Keterangan Perhitungan Harian'
      ];
      this.styleHeaderRow(dHeader, 'FF059669', 'FFFFFFFF', 8);
      rowIdx++;

      const cEff = dailyData.comparison.effective;
      const cAnn = dailyData.comparison.annuity;
      const cFlat = dailyData.comparison.flat;

      const dRows = [
        [
          'Bunga Harian Efektif',
          cEff.dailyRatePercent / 100,
          Math.round(cEff.dailyInterestAmount),
          Math.round(cEff.totalAccruedInterest),
          Math.round(cEff.remainingBalance),
          Math.round(cEff.totalEarlyPayoff),
          0,
          'Bunga harian menurun setiap bulan mengikuti sisa pokok'
        ],
        [
          'Bunga Harian Anuitas',
          cAnn.dailyRatePercent / 100,
          Math.round(cAnn.dailyInterestAmount),
          Math.round(cAnn.totalAccruedInterest),
          Math.round(cAnn.remainingBalance),
          Math.round(cAnn.totalEarlyPayoff),
          Math.round(cAnn.totalAccruedInterest - cEff.totalAccruedInterest),
          'Bunga harian mengikuti sisa pokok kurva anuitas'
        ],
        [
          'Bunga Harian Flat',
          cFlat.dailyRatePercent / 100,
          Math.round(cFlat.dailyInterestAmount),
          Math.round(cFlat.totalAccruedInterest),
          Math.round(cFlat.remainingBalance),
          Math.round(cFlat.totalEarlyPayoff),
          Math.round(cFlat.totalAccruedInterest - cEff.totalAccruedInterest),
          'Bunga harian tetap konstan dari 100% plafon awal'
        ]
      ];

      dRows.forEach((item, idx) => {
        const r = wsSummary.getRow(rowIdx);
        r.height = 23;
        r.values = item;
        const isEven = idx % 2 === 1;

        this.styleDataCell(r.getCell(1), { align: 'left', bold: true, isEvenRow: isEven });
        this.styleDataCell(r.getCell(2), { isMicroPercent: true, isEvenRow: isEven });
        this.styleDataCell(r.getCell(3), { isCurrency: true, isEvenRow: isEven });
        this.styleDataCell(r.getCell(4), { isCurrency: true, bold: true, textColor: idx === 0 ? 'FF065F46' : 'FFB91C1C', isEvenRow: isEven });
        this.styleDataCell(r.getCell(5), { isCurrency: true, isEvenRow: isEven });
        this.styleDataCell(r.getCell(6), { isCurrency: true, bold: true, isEvenRow: isEven });
        this.styleDataCell(r.getCell(7), { isCurrency: true, bold: true, isEvenRow: isEven });
        this.styleDataCell(r.getCell(8), { align: 'left', isEvenRow: isEven });
        rowIdx++;
      });
    }

    // =============================================================
    // HELPER JADWAL ANGSURAN BULANAN (KOLOM A s.d. G PROPORSIONAL)
    // =============================================================
    const addScheduleWorksheet = (sheetName, data, headerColor = 'FF1E3A8A') => {
      const ws = wb.addWorksheet(sheetName, {
        views: [{ state: 'frozen', ySplit: 4, showGridLines: true }]
      });

      // Set Lebar Kolom Eksplisit agar rapi dan muat 1 layar penuh
      ws.columns = [
        { key: 'c1', width: 12 }, // Bulan Ke
        { key: 'c2', width: 16 }, // Jatuh Tempo
        { key: 'c3', width: 22 }, // Baki Debet Awal
        { key: 'c4', width: 22 }, // Angsuran Pokok
        { key: 'c5', width: 20 }, // Angsuran Bunga
        { key: 'c6', width: 22 }, // Total Angsuran
        { key: 'c7', width: 22 }  // Baki Debet Akhir
      ];

      ws.mergeCells('A1:G1');
      const h1 = ws.getCell('A1');
      h1.value = `JADWAL ANGSURAN BULANAN - ${data.name.toUpperCase()}`;
      h1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
      h1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } };
      h1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.getRow(1).height = 28;

      ws.mergeCells('A2:G2');
      const h2 = ws.getCell('A2');
      h2.value = `Plafon: Rp ${params.principal.toLocaleString('id-ID')}  |  Tenor: ${params.nMonths} Bulan  |  Bunga: ${data.rateAnnual}% p.a.  |  Basis: ${params.dayCountConvention}`;
      h2.font = { name: 'Calibri', italic: true, size: 9, color: { argb: 'FF334155' } };
      h2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.getRow(2).height = 19;

      const headRow = ws.getRow(4);
      headRow.values = [
        'Bulan Ke',
        'Jatuh Tempo',
        'Baki Debet Awal (Rp)',
        'Angsuran Pokok (Rp)',
        'Angsuran Bunga (Rp)',
        'Total Angsuran (Rp)',
        'Baki Debet Akhir (Rp)'
      ];
      this.styleHeaderRow(headRow, headerColor, 'FFFFFFFF', 7);

      let rNum = 5;
      data.schedule.forEach((item, idx) => {
        const row = ws.getRow(rNum);
        row.height = 20;
        row.values = [
          item.month,
          item.dueDate,
          Math.round(item.initialBalance),
          Math.round(item.principal),
          Math.round(item.interest),
          Math.round(item.totalInstallment),
          Math.round(item.remainingBalance)
        ];
        const isEven = idx % 2 === 1;

        this.styleDataCell(row.getCell(1), { align: 'center', bold: true, isEvenRow: isEven });
        this.styleDataCell(row.getCell(2), { align: 'center', isEvenRow: isEven });
        this.styleDataCell(row.getCell(3), { isCurrency: true, isEvenRow: isEven });
        this.styleDataCell(row.getCell(4), { isCurrency: true, isEvenRow: isEven });
        this.styleDataCell(row.getCell(5), { isCurrency: true, textColor: 'FFB91C1C', isEvenRow: isEven });
        this.styleDataCell(row.getCell(6), { isCurrency: true, bold: true, isEvenRow: isEven });
        this.styleDataCell(row.getCell(7), { isCurrency: true, isEvenRow: isEven });
        rNum++;
      });

      // Baris Total dengan Rumus SUM Excel
      const totRow = ws.getRow(rNum);
      totRow.getCell(1).value = 'TOTAL';
      totRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      totRow.getCell(2).value = `${data.schedule.length} Bln`;
      totRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      totRow.getCell(3).value = Math.round(params.principal);
      totRow.getCell(4).value = { formula: `SUM(D5:D${rNum - 1})` };
      totRow.getCell(5).value = { formula: `SUM(E5:E${rNum - 1})` };
      totRow.getCell(6).value = { formula: `SUM(F5:F${rNum - 1})` };
      totRow.getCell(7).value = 0;

      for (let c = 3; c <= 7; c++) {
        totRow.getCell(c).numFmt = '"Rp "#,##0;("Rp "#,##0);"-"';
        totRow.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' };
      }
      this.styleTotalRow(totRow, 7);
    };

    // =============================================================
    // HELPER TABEL BUNGA HARIAN LENGKAP (KOLOM A s.d. G PROPORSIONAL)
    // =============================================================
    const addDailyWorksheet = (sheetName, methodType, headerColor = 'FF059669') => {
      const ws = wb.addWorksheet(sheetName, {
        views: [{ state: 'frozen', ySplit: 4, showGridLines: true }]
      });

      // Set Lebar Kolom Eksplisit agar Kolom A ("Hari Ke") TIDAK MELEBAR karena judul!
      ws.columns = [
        { key: 'd1', width: 12 }, // Hari Ke
        { key: 'd2', width: 16 }, // Tanggal Proyeksi
        { key: 'd3', width: 22 }, // Baki Debet Pokok (Rp)
        { key: 'd4', width: 18 }, // Suku Bunga Harian (%)
        { key: 'd5', width: 20 }, // Bunga Harian (Rp)
        { key: 'd6', width: 22 }, // Akumulasi Bunga (Rp)
        { key: 'd7', width: 25 }  // Total Pelunasan Hari Ini (Rp)
      ];

      const basis = dailyData.basisDays;
      const methodMap = {
        'EFEKTIF': dailyData.comparison ? dailyData.comparison.effective : null,
        'FLAT': dailyData.comparison ? dailyData.comparison.flat : null,
        'ANUITAS': dailyData.comparison ? dailyData.comparison.annuity : null
      };
      const methodSim = methodMap[methodType] || dailyData;
      const scheduleRows = methodSim.dailySchedule || [];

      ws.mergeCells('A1:G1');
      const h1 = ws.getCell('A1');
      h1.value = `SIMULASI BUNGA HARIAN & PELUNASAN DIPERCEPAT - METODE ${methodType.toUpperCase()}`;
      h1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
      h1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } };
      h1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.getRow(1).height = 28;

      const methodDesc = methodType === 'EFEKTIF' 
        ? 'Baki Debet Menurun Sesuai Angsuran Pokok Rata (Paling Hemat)'
        : methodType === 'FLAT' 
          ? 'Beban Bunga Tetap Dihitung dari 100% Plafon Awal (Paling Boros)' 
          : 'Baki Debet Menurun Sesuai Kurva Angsuran Anuitas Tetap (KPR)';

      // Merge A2:G2 agar sub-judul rapi dan tidak merusak lebar Kolom A
      ws.mergeCells('A2:G2');
      const h2 = ws.getCell('A2');
      h2.value = `Plafon: Rp ${params.principal.toLocaleString('id-ID')}  |  Rate: ${params.rateAnnual}% p.a.  |  Basis: ${params.dayCountConvention} (${basis} Hari/Thn)  |  Skema: ${methodDesc}`;
      h2.font = { name: 'Calibri', italic: true, size: 9, color: { argb: 'FF334155' } };
      h2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      h2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.getRow(2).height = 19;

      const headRow = ws.getRow(4);
      headRow.values = [
        'Hari Ke',
        'Tanggal Proyeksi',
        'Baki Debet Pokok (Rp)',
        'Suku Bunga Harian (%)',
        'Bunga Harian (Rp)',
        'Akumulasi Bunga (Rp)',
        'Total Pelunasan Hari Ini (Rp)'
      ];
      this.styleHeaderRow(headRow, headerColor, 'FFFFFFFF', 7);

      let rNum = 5;
      scheduleRows.forEach((item, idx) => {
        const row = ws.getRow(rNum);
        row.height = 20;
        row.values = [
          item.day,
          item.date,
          Math.round(item.balance),
          item.dailyRatePercent / 100,
          Math.round(item.dailyInterest),
          Math.round(item.accruedInterest),
          Math.round(item.payoff)
        ];
        const isEven = idx % 2 === 1;

        this.styleDataCell(row.getCell(1), { align: 'center', bold: true, isEvenRow: isEven });
        this.styleDataCell(row.getCell(2), { align: 'center', isEvenRow: isEven });
        this.styleDataCell(row.getCell(3), { isCurrency: true, isEvenRow: isEven });
        this.styleDataCell(row.getCell(4), { isMicroPercent: true, isEvenRow: isEven });
        this.styleDataCell(row.getCell(5), { isCurrency: true, textColor: 'FFB91C1C', isEvenRow: isEven });
        this.styleDataCell(row.getCell(6), { isCurrency: true, bold: true, textColor: 'FF92400E', isEvenRow: isEven });
        this.styleDataCell(row.getCell(7), { isCurrency: true, bold: true, textColor: 'FF065F46', isEvenRow: isEven });
        rNum++;
      });

      // Baris Total Akumulasi Akhir
      const lastItem = scheduleRows[scheduleRows.length - 1];
      const totRow = ws.getRow(rNum);
      totRow.getCell(1).value = 'AKHIR';
      totRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      totRow.getCell(2).value = `Hari ke-${lastItem ? lastItem.day : 0}`;
      totRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      totRow.getCell(3).value = lastItem ? Math.round(lastItem.balance) : 0;
      totRow.getCell(4).value = lastItem ? lastItem.dailyRatePercent / 100 : 0;
      totRow.getCell(4).numFmt = '0.000000%';
      totRow.getCell(5).value = { formula: `SUM(E5:E${rNum - 1})` };
      totRow.getCell(6).value = lastItem ? Math.round(lastItem.accruedInterest) : 0;
      totRow.getCell(7).value = lastItem ? Math.round(lastItem.payoff) : 0;

      for (let c = 3; c <= 7; c++) {
        if (c !== 4) {
          totRow.getCell(c).numFmt = '"Rp "#,##0;("Rp "#,##0);"-"';
        }
        totRow.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' };
      }
      this.styleTotalRow(totRow, 7);
    };

    // =============================================================
    // BUILD WORKSHEETS BERDASARKAN OPSI EXPORT_MODE
    // =============================================================
    if (exportMode === 'ALL' || exportMode === 'DAILY_EFEKTIF') {
      addDailyWorksheet('2. Bunga Harian - Efektif', 'EFEKTIF', 'FF059669');
    }
    if (exportMode === 'ALL' || exportMode === 'DAILY_FLAT') {
      addDailyWorksheet('3. Bunga Harian - Flat', 'FLAT', 'FFD97706');
    }
    if (exportMode === 'ALL' || exportMode === 'DAILY_ANUITAS') {
      addDailyWorksheet('4. Bunga Harian - Anuitas', 'ANUITAS', 'FF4F46E5');
    }

    if (exportMode === 'ALL' || exportMode === 'SCHEDULE_ONLY') {
      addScheduleWorksheet('5. Jadwal Anuitas', annData, 'FF4F46E5');
      addScheduleWorksheet('6. Jadwal Efektif', effData, 'FF059669');
      addScheduleWorksheet('7. Jadwal Flat', flatData, 'FFD97706');
    }

    // Download file di browser
    if (typeof window !== 'undefined' && window.document) {
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      const modeSuffix = exportMode.toLowerCase().replace('_', '-');
      a.download = `Simulasi_Bunga_Bank_${params.principal}_${params.nMonths}Bln_${modeSuffix}_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    return wb;
  }
};
