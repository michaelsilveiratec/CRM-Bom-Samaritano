/**
 * Utilitário de Exportação de Dados — CSV e PDF
 * Eclesia CRM — Igreja Bom Samaritano
 */

// =============================================
// CSV EXPORT
// =============================================
export function exportToCSV(
  data: Record<string, string | number>[],
  headers: { key: string; label: string }[],
  filename: string
) {
  // BOM for UTF-8 encoding (fixes accents in Excel)
  const BOM = "\uFEFF";

  const headerRow = headers.map((h) => h.label).join(";");
  const rows = data.map((row) =>
    headers
      .map((h) => {
        let val = String(row[h.key] ?? "");
        // If it's a base64 image, don't dump it in CSV
        if (val.startsWith("data:image/")) {
          val = "Imagem (Ver no PDF)";
        }
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(";")
  );

  const csvContent = BOM + [headerRow, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

// =============================================
// PDF EXPORT (Pure HTML → Print)
// =============================================
export function exportToPDF(
  data: Record<string, string | number>[],
  headers: { key: string; label: string }[],
  title: string,
  _filename: string
) {
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const tableRows = data
    .map(
      (row, i) =>
        `<tr style="background:${i % 2 === 0 ? "#fafafa" : "#fff"}">
          ${headers
            .map(
              (h) => {
                const val = row[h.key] ?? "";
                const isImage = typeof val === 'string' && val.startsWith('data:image/');
                const displayVal = isImage 
                  ? `<img src="${val}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #e5e7eb;" />`
                  : val;
                
                return `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151;vertical-align:middle;">${displayVal}</td>`;
              }
            )
            .join("")}
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #fff;
          color: #111827;
          padding: 40px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #7c3aed;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .header h1 {
          font-size: 22px;
          font-weight: 800;
          color: #7c3aed;
          margin: 0;
        }
        .header .church {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
        }
        .header .date {
          font-size: 12px;
          color: #9ca3af;
        }
        .summary {
          background: #f5f3ff;
          border: 1px solid #ede9fe;
          border-radius: 8px;
          padding: 12px 20px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #4c1d95;
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        thead tr {
          background: #7c3aed;
        }
        thead th {
          padding: 10px 12px;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #ffffff;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
        }
        .btn-print {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: #7c3aed;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(124,58,237,0.4);
        }
        .btn-print:hover { background: #6d28d9; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>⛪ ${title}</h1>
          <div class="church">Igreja Bom Samaritano — Eclesia CRM</div>
        </div>
        <div class="date">Gerado em ${today}</div>
      </div>
      <div class="summary">Total de registros: ${data.length}</div>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h.label}</th>`).join("")}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">
        Documento gerado automaticamente pelo Eclesia CRM — Igreja Bom Samaritano &copy; ${new Date().getFullYear()}
      </div>
      <button class="btn-print no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

// =============================================
// HELPER: Trigger file download
// =============================================
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
