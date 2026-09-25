/**
 * Excel Export Engine using ExcelJS
 * Standar Pelaporan Keuangan & Perbankan Profesional
 * Dilengkapi border rapi, format akuntansi ("Rp #,##0"), warna terstruktur, dan rumus Excel
 */

export const ExcelExport = {
  /**
   * Styling Header Kolom Tabel
   */
  styleHeaderRow(row, bgArgb = 'FF1E3A8A', fontArgb = 'FFFFFFFF') {
    row.eachCell((cell) => {
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
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });
    row.height = 28;
  },

  /**
   * Styling Sel Data
   */
  styleDataCell(cell, isNumber = false, isCurrency = false, isPercent = false, align = 'left', isMicroPercent = false) {
    cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
    cell.alignment = { vertical: 'middle', horizontal: align };

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
   * Styling Baris Total (Akuntansi: Garis Ganda di Bawah)
   */
  styleTotalRow(row) {
    row.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });
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

    // Judul Dokumen
    wsSummary.mergeCells('A1:H1');
    const titleCell = wsSummary.getCell('A1');
    titleCell.value = 'LAPORAN SIMULASI & KOMPARASI SUKU BUNGA BANK';
    titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FF1E3A8A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    wsSummary.getRow(1).height = 32;

    wsSummary.mergeCells('A2:H2');
    const subTitle = wsSummary.getCell('A2');
    subTitle.value = `Tanggal Simulasi: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} | Standar Otoritas Jasa Keuangan (OJK) & Bank Indonesia`;
    subTitle.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
    wsSummary.getRow(2).height = 18;

    // Parameter Pinjaman
    wsSummary.getCell('A4').value = 'PARAMETER PINJAMAN UTAMA';
    wsSummary.getCell('A4').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };

    const paramItems = [
      ['Plafon Pokok Pinjaman (P)', params.principal, true, false],
      ['Tenor Pinjaman', `${params.nMonths} Bulan (${(params.nMonths / 12).toFixed(1)} Tahun)`, false, false],
      ['Suku Bunga Acuan (% p.a.)', params.rateAnnual / 100, false, true],
      ['Basis Perhitungan Hari', `${params.dayCountConvention} (${dailyData.basisDays} Hari/Tahun)`, false, false],
      ['Tanggal Mulai Kredit', params.startDate, false, false]
    ];

    let rowIdx = 5;
    paramItems.forEach(([label, val, isCur, isPct]) => {
      const r = wsSummary.getRow(rowIdx);
      r.getCell(1).value = label;
      this.styleDataCell(r.getCell(1), false, false, false, 'left');
      r.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
      r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

      r.getCell(2).value = val;
      this.styleDataCell(r.getCell(2), typeof val === 'number', isCur, isPct, isCur || isPct ? 'right' : 'left');
      rowIdx++;
    });

    // Tabel Komparasi 3 Metode Bunga
    rowIdx += 2;
    wsSummary.getCell(`A${rowIdx}`).value = 'TABEL PERBANDINGAN 3 METODE PERHITUNGAN BUNGA (HEAD-TO-HEAD)';
    wsSummary.getCell(`A${rowIdx}`).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
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
    this.styleHeaderRow(compHeader, 'FF1E3A8A');
    rowIdx++;

    const compRows = [
      [
        'Bunga Efektif (Sliding)',
        effData.rateAnnual / 100,
        Math.round(effData.firstInstallment),
        Math.round(effData.lastInstallment),
        Math.round(effData.totalInterest),
        Math.round(effData.totalPayment),
        0,
        '⭐ PALING HEMAT (Bunga menurun seiring sisa utang. Rekomendasi: Investasi & Modal Kerja)'
      ],
      [
        'Bunga Anuitas (Cicilan Rata)',
        annData.rateAnnual / 100,
        Math.round(annData.firstInstallment),
        Math.round(annData.lastInstallment),
        Math.round(annData.totalInterest),
        Math.round(annData.totalPayment),
        Math.round(annData.totalInterest - effData.totalInterest),
        '⚖️ CICILAN STABIL (Beban terukur per bulan. Standar Resmi KPR Bank)'
      ],
      [
        'Bunga Flat (Tetap)',
        flatData.rateAnnual / 100,
        Math.round(flatData.firstInstallment),
        Math.round(flatData.lastInstallment),
        Math.round(flatData.totalInterest),
        Math.round(flatData.totalPayment),
        Math.round(flatData.totalInterest - effData.totalInterest),
        '⚠️ PALING BOROS (Bunga selalu dari plafon awal walau pokok dicicil. Umum pada KKB/KTA)'
      ]
    ];

    compRows.forEach((item) => {
      const r = wsSummary.getRow(rowIdx);
      r.values = item;
      this.styleDataCell(r.getCell(1), false, false, false, 'left');
      r.getCell(1).font = { name: 'Calibri', size: 10, bold: true };
      this.styleDataCell(r.getCell(2), false, false, true, 'right');
      this.styleDataCell(r.getCell(3), false, true, false, 'right');
      this.styleDataCell(r.getCell(4), false, true, false, 'right');
      this.styleDataCell(r.getCell(5), false, true, false, 'right');
      r.getCell(5).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
      this.styleDataCell(r.getCell(6), false, true, false, 'right');
      r.getCell(6).font = { name: 'Calibri', size: 10, bold: true };
      this.styleDataCell(r.getCell(7), false, true, false, 'right');
      this.styleDataCell(r.getCell(8), false, false, false, 'left');
      rowIdx++;
    });

    // Box Insight Penghematan Finansial
    rowIdx++;
    const savings = Math.round(flatData.totalInterest - effData.totalInterest);
    const savingsPercent = ((savings / flatData.totalInterest) * 100).toFixed(1);

    wsSummary.mergeCells(`A${rowIdx}:H${rowIdx}`);
    const insightCell = wsSummary.getCell(`A${rowIdx}`);
    insightCell.value = `💡 INSIGHT PENGHEMATAN NASABAH: Nasabah MENGHEMAT Rp ${savings.toLocaleString('id-ID')} (${savingsPercent}%) jika memilih skema Bunga Efektif dibanding Bunga Flat pada suku bunga yang sama (${params.rateAnnual}% p.a.)!`;
    insightCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    insightCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } };
    insightCell.border = {
      top: { style: 'medium', color: { argb: 'FF10B981' } },
      bottom: { style: 'medium', color: { argb: 'FF10B981' } },
      left: { style: 'medium', color: { argb: 'FF10B981' } },
      right: { style: 'medium', color: { argb: 'FF10B981' } }
    };
    wsSummary.getRow(rowIdx).height = 28;

    // =============================================================
    // HELPER JADWAL ANGSURAN BULANAN
    // =============================================================
    const addScheduleWorksheet = (sheetName, data, headerColor = 'FF1E3A8A') => {
      const ws = wb.addWorksheet(sheetName, { views: [{ showGridLines: true }] });

      ws.mergeCells('A1:G1');
      const h1 = ws.getCell('A1');
      h1.value = `JADWAL ANGSURAN BULANAN - ${data.name.toUpperCase()}`;
      h1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: headerColor } };
      ws.getRow(1).height = 28;

      ws.getCell('A2').value = `Plafon: Rp ${params.principal.toLocaleString('id-ID')} | Tenor: ${params.nMonths} Bulan | Bunga: ${data.rateAnnual}% p.a. | Basis: ${params.dayCountConvention}`;
      ws.getCell('A2').font = { name: 'Calibri', italic: true, size: 9, color: { argb: 'FF64748B' } };

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
      this.styleHeaderRow(headRow, headerColor);

      let rNum = 5;
      data.schedule.forEach((item) => {
        const row = ws.getRow(rNum);
        row.values = [
          item.month,
          item.dueDate,
          Math.round(item.initialBalance),
          Math.round(item.principal),
          Math.round(item.interest),
          Math.round(item.totalInstallment),
          Math.round(item.remainingBalance)
        ];

        this.styleDataCell(row.getCell(1), false, false, false, 'center');
        this.styleDataCell(row.getCell(2), false, false, false, 'center');
        this.styleDataCell(row.getCell(3), false, true, false, 'right');
        this.styleDataCell(row.getCell(4), false, true, false, 'right');
        this.styleDataCell(row.getCell(5), false, true, false, 'right');
        this.styleDataCell(row.getCell(6), false, true, false, 'right');
        row.getCell(6).font = { name: 'Calibri', size: 10, bold: true };
        this.styleDataCell(row.getCell(7), false, true, false, 'right');
        rNum++;
      });

      // Baris Total dengan Rumus SUM Excel
      const totRow = ws.getRow(rNum);
      totRow.getCell(1).value = 'TOTAL KESELURUHAN';
      totRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      totRow.getCell(4).value = { formula: `SUM(D5:D${rNum - 1})` };
      totRow.getCell(5).value = { formula: `SUM(E5:E${rNum - 1})` };
      totRow.getCell(6).value = { formula: `SUM(F5:F${rNum - 1})` };
      totRow.getCell(7).value = 0;

      for (let c = 1; c <= 7; c++) {
        if (c >= 3) {
          totRow.getCell(c).numFmt = '"Rp "#,##0;("Rp "#,##0);"-"';
        }
      }
      this.styleTotalRow(totRow);
    };

    // =============================================================
    // HELPER TABEL BUNGA HARIAN LENGKAP DENGAN METODE AKURAT
    // =============================================================
    const addDailyWorksheet = (sheetName, methodType, headerColor = 'FF059669') => {
      const ws = wb.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
      const basis = dailyData.basisDays;
      const daysCount = Math.max(30, Math.min(params.nMonths * 30, dailyData.days || 60));

      // Ambil simulasi harian akurat untuk metode ini dari comparison
      const methodMap = {
        'EFEKTIF': dailyData.comparison ? dailyData.comparison.effective : null,
        'FLAT': dailyData.comparison ? dailyData.comparison.flat : null,
        'ANUITAS': dailyData.comparison ? dailyData.comparison.annuity : null
      };
      const methodSim = methodMap[methodType] || dailyData;
      const scheduleRows = methodSim.dailySchedule || [];

      ws.mergeCells('A1:G1');
      const h1 = ws.getCell('A1');
      h1.value = `SIMULASI BUNGA HARIAN & PELUNASAN DI PERCEPAT (${methodType.toUpperCase()})`;
      h1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: headerColor } };
      ws.getRow(1).height = 28;

      const methodDesc = methodType === 'EFEKTIF' 
        ? 'Baki Debet Menurun Sesuai Angsuran Pokok Rata (⭐ Paling Hemat)'
        : methodType === 'FLAT' 
          ? 'Beban Bunga Tetap Dihitung dari 100% Plafon Awal P (⚠️ Paling Boros)' 
          : 'Baki Debet Menurun Sesuai Kurva Angsuran Anuitas Tetap (KPR)';

      ws.getCell('A2').value = `Plafon: Rp ${params.principal.toLocaleString('id-ID')} | Rate: ${params.rateAnnual}% p.a. | Basis: ${params.dayCountConvention} (${basis} Hari/Thn) | Karakteristik: ${methodDesc}`;
      ws.getCell('A2').font = { name: 'Calibri', italic: true, size: 9, color: { argb: 'FF64748B' } };

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
      this.styleHeaderRow(headRow, headerColor);

      let rNum = 5;
      // scheduleRows sudah diambil dari methodSim

      scheduleRows.forEach((item) => {
        const row = ws.getRow(rNum);
        row.values = [
          item.day,
          item.date,
          Math.round(item.balance),
          item.dailyRatePercent / 100,
          Math.round(item.dailyInterest),
          Math.round(item.accruedInterest),
          Math.round(item.payoff)
        ];

        this.styleDataCell(row.getCell(1), false, false, false, 'center');
        this.styleDataCell(row.getCell(2), false, false, false, 'center');
        this.styleDataCell(row.getCell(3), false, true, false, 'right');
        this.styleDataCell(row.getCell(4), false, false, false, 'right', true);
        this.styleDataCell(row.getCell(5), false, true, false, 'right');
        this.styleDataCell(row.getCell(6), false, true, false, 'right');
        this.styleDataCell(row.getCell(7), false, true, false, 'right');
        row.getCell(7).font = { name: 'Calibri', size: 10, bold: true };
        rNum++;
      });

      // Baris Total Akumulasi
      const lastItem = scheduleRows[scheduleRows.length - 1];
      const totRow = ws.getRow(rNum);
      totRow.getCell(1).value = `POSISI HARI KE-${lastItem ? lastItem.day : daysCount}`;
      totRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      totRow.getCell(3).value = lastItem ? Math.round(lastItem.balance) : 0;
      totRow.getCell(5).value = lastItem ? Math.round(lastItem.dailyInterest) : 0;
      totRow.getCell(6).value = lastItem ? Math.round(lastItem.accruedInterest) : 0;
      totRow.getCell(7).value = lastItem ? Math.round(lastItem.payoff) : 0;

      for (let c = 1; c <= 7; c++) {
        if (c === 3 || c === 5 || c === 6 || c === 7) {
          totRow.getCell(c).numFmt = '"Rp "#,##0;("Rp "#,##0);"-"';
        }
      }
      this.styleTotalRow(totRow);
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

    // Auto-fit kolom di semua worksheet
    wb.eachSheet((worksheet) => {
      worksheet.columns.forEach((column) => {
        let maxLen = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value ? (typeof cell.value === 'object' && cell.value.formula ? 'Rp 999,999,999' : cell.value.toString()) : '';
          if (val.length > maxLen) maxLen = val.length;
        });
        column.width = Math.max(maxLen + 4, 14);
      });
    });

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
