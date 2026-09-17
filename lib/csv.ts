const UTF8_BOM = "﻿";

// Characters that spreadsheet apps (Excel, Google Sheets, LibreOffice) treat
// as a formula prefix. Idea titles/descriptions and other free-text fields
// are participant-controlled, so a cell that happens to start with one of
// these can execute as a formula the moment a researcher opens the export
// (classic "CSV injection" — this is about protecting the researcher who
// opens the file, not the app itself).
const FORMULA_TRIGGER_CHARS = ["=", "+", "-", "@", "\t", "\r"];

function neutralizeFormula(str: string): string {
  if (str.length > 0 && FORMULA_TRIGGER_CHARS.includes(str[0])) {
    // Leading apostrophe forces spreadsheet apps to render the cell as
    // literal text instead of evaluating it.
    return `'${str}`;
  }
  return str;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = neutralizeFormula(String(value));
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  // UTF-8 BOM so Excel renders Turkish characters (İ, ş, ğ, ı, ö, ü, ç) correctly.
  return UTF8_BOM + lines.join("\r\n");
}
