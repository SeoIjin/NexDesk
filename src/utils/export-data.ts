export type ExportFormat = "PDF" | "CSV" | "Excel" | "JSON";
export type ExportRow = Record<string, unknown>;

type ExportOptions = {
  filename: string;
  title: string;
  rows: ExportRow[];
  format: ExportFormat;
};

const normalizeFilename = (filename: string) =>
  filename.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "export";

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const getHeaders = (rows: ExportRow[]) =>
  Array.from(new Set(rows.flatMap(row => Object.keys(row))));

const escapeCsv = (value: unknown) => {
  const text = formatValue(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const createCsv = (rows: ExportRow[], delimiter = ",") => {
  const headers = getHeaders(rows);
  const lines = [
    headers.map(header => escapeCsv(header)).join(delimiter),
    ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(delimiter)),
  ];
  return lines.join("\r\n");
};

const toPdfSafeText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrapLine = (line: string, maxLength = 92) => {
  if (line.length <= maxLength) return [line];
  const words = line.split(/\s+/);
  const wrapped: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxLength) {
      current += ` ${word}`;
    } else {
      wrapped.push(current);
      current = word;
    }
  }
  if (current) wrapped.push(current);
  return wrapped;
};

const createPdf = (title: string, rows: ExportRow[]) => {
  const headers = getHeaders(rows);
  const reportLines = [
    title,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    ...rows.flatMap((row, index) => [
      `${index + 1}. ${headers.map(header => `${header}: ${formatValue(row[header])}`).join(" | ")}`,
      "",
    ]),
  ].flatMap(line => wrapLine(toPdfSafeText(line)));

  const linesPerPage = 48;
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(reportLines.length / linesPerPage)) },
    (_, index) => reportLines.slice(index * linesPerPage, (index + 1) * linesPerPage),
  );

  const objects: string[] = [];
  const pageRefs = pages.map((_, index) => `${4 + index * 2} 0 R`).join(" ");
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((pageLines, index) => {
    const pageObject = 4 + index * 2;
    const contentObject = pageObject + 1;
    const content = [
      "BT",
      "/F1 10 Tf",
      "44 800 Td",
      "13 TL",
      ...pageLines.map(line => `(${line}) Tj T*`),
      "ET",
    ].join("\n");

    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = new TextEncoder().encode(pdf).length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
};

export function exportData({ filename, title, rows, format }: ExportOptions) {
  const safeFilename = normalizeFilename(filename);

  if (format === "JSON") {
    downloadBlob(
      `${safeFilename}.json`,
      new Blob([JSON.stringify({ title, generatedAt: new Date().toISOString(), data: rows }, null, 2)], {
        type: "application/json;charset=utf-8",
      }),
    );
    return;
  }

  if (format === "PDF") {
    downloadBlob(`${safeFilename}.pdf`, createPdf(title, rows));
    return;
  }

  if (format === "Excel") {
    const workbook = `\uFEFF${createCsv(rows, "\t")}`;
    downloadBlob(`${safeFilename}.xls`, new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" }));
    return;
  }

  downloadBlob(
    `${safeFilename}.csv`,
    new Blob([`\uFEFF${createCsv(rows)}`], { type: "text/csv;charset=utf-8" }),
  );
}
