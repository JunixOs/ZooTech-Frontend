import { VacunoActivityPoint } from '../application/vacuno.service';

export interface ActivityReportMetadata {
  fechaInicio: string;
  fechaFin: string;
  mayor: number;
  menor: number;
}

export function downloadActivityExcel(
  points: VacunoActivityPoint[],
  metadata: ActivityReportMetadata,
): void {
  const rows: Array<Array<string | number>> = [
    ['Reporte', 'Vacunos en actividad'],
    ['Fecha inicio', metadata.fechaInicio],
    ['Fecha fin', metadata.fechaFin],
    ['Mayor numero de vacunos en actividad', metadata.mayor],
    ['Menor numero de vacunos en actividad', metadata.menor],
    [],
    ['Fecha', 'Cantidad de vacunos en actividad'],
    ...points.map((point) => [point.fecha, point.cantidad]),
  ];

  const sheetData = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, columnIndex) => createCell(cell, columnIndex, rowIndex))
        .join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');

  const files: Record<string, string> = {
    '[Content_Types].xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '</Types>',
    '_rels/.rels':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>',
    'xl/workbook.xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets><sheet name="Vacunos en actividad" sheetId="1" r:id="rId1"/></sheets>' +
      '</workbook>',
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      '</Relationships>',
    'xl/worksheets/sheet1.xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetData>' +
      sheetData +
      '</sheetData></worksheet>',
  };

  const workbook = createZip(files);

  saveBlob(
    new Blob([toArrayBuffer(workbook)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    'vacunos-en-actividad.xlsx',
  );
}

export function downloadActivityPdf(
  points: VacunoActivityPoint[],
  metadata: ActivityReportMetadata,
): void {
  const previewRows = points.slice(0, 34);
  const lines = [
    'Reporte: Vacunos en actividad',
    `Fecha inicio: ${metadata.fechaInicio}`,
    `Fecha fin: ${metadata.fechaFin}`,
    `Mayor numero de vacunos en actividad: ${metadata.mayor}`,
    `Menor numero de vacunos en actividad: ${metadata.menor}`,
    '',
    'Fecha        Cantidad',
    ...previewRows.map((point) => `${point.fecha}   ${point.cantidad}`),
  ];

  saveBlob(new Blob([createPdf(lines)], { type: 'application/pdf' }), 'vacunos-en-actividad.pdf');
}

function createCell(value: string | number, columnIndex: number, rowIndex: number): string {
  const reference = `${columnName(columnIndex)}${rowIndex + 1}`;

  if (typeof value === 'number') {
    return `<c r="${reference}"><v>${value}</v></c>`;
  }

  return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function columnName(index: number): string {
  let result = '';
  let current = index + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}

function createZip(files: Record<string, string>): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const localHeader = createLocalHeader(nameBytes, data, crc);
    const centralHeader = createCentralHeader(nameBytes, data, crc, offset);

    localParts.push(localHeader, data);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralOffset = offset;
  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const endRecord = createEndRecord(centralParts.length, centralSize, centralOffset);

  return concatBytes([...localParts, ...centralParts, endRecord]);
}

function createLocalHeader(nameBytes: Uint8Array, data: Uint8Array, crc: number): Uint8Array {
  const header = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, data.length, true);
  view.setUint32(22, data.length, true);
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true);
  header.set(nameBytes, 30);
  return header;
}

function createCentralHeader(
  nameBytes: Uint8Array,
  data: Uint8Array,
  crc: number,
  offset: number,
): Uint8Array {
  const header = new Uint8Array(46 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, data.length, true);
  view.setUint32(24, data.length, true);
  view.setUint16(28, nameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  header.set(nameBytes, 46);
  return header;
}

function createEndRecord(entryCount: number, centralSize: number, centralOffset: number): Uint8Array {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return record;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function createPdf(lines: string[]): string {
  const content = lines
    .map((line, index) => `BT /F1 11 Tf 50 ${780 - index * 18} Td (${escapePdf(line)}) Tj ET`)
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapePdf(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
