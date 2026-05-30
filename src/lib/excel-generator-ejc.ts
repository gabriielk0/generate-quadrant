import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface Member {
  id: string;
  type: string;
  subcategory: string;
  teamId: string;
  name: string | null;
  nickname: string | null;
  birthDate: Date | string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  homePhone: string | null;
  husbandName: string | null;
  husbandNickname?: string | null;
  husbandEmail: string | null;
  husbandBirthDate: Date | string | null;
  husbandPhone: string | null;
  wifeName: string | null;
  wifeNickname?: string | null;
  wifeEmail: string | null;
  wifeBirthDate: Date | string | null;
  wifePhone: string | null;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

// Date formatter helper (DD/MM/YYYY)
function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper to set Rich Text values for cells with bold labels in Black
function setCellRichTextEJC(cell: ExcelJS.Cell, label: string, value: string) {
  cell.value = {
    richText: [
      { text: label, font: { bold: true, name: "Segoe UI", size: 9, color: { argb: "FF000000" } } }, // Black
      { text: value || "-", font: { name: "Segoe UI", size: 9, color: { argb: "FF000000" } } } // Black value
    ]
  };
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
}

export async function generateExcelQuadrantEJC(teams: Team[]) {
  const workbook = new ExcelJS.Workbook();
  
  const subcategoriesOrder = [
    "Montagem",
    "Finanças",
    "Palestra",
    "Fichas",
    "Pós-Encontro",
    "Círculo Amarelo",
    "Círculo Azul",
    "Círculo Rosa",
    "Círculo Verde",
    "Círculo Vermelho",
    "Jovens coordenadores",
    "Coordenador(a)",
    "Casal coordenador",
    "Casal",
    "Casal apoio",
    "Jovens apoio",
    "Casais membros",
    "Jovens membros",
    "Integrantes",
  ];

  teams.forEach((team) => {
    // Worksheet name limit is 31 characters
    const sheetName = team.name.substring(0, 30).replace(/[\\*?:/[\]]/g, "_");
    const worksheet = workbook.addWorksheet(sheetName);

    // Set column widths (A spacing, B to K 10 columns)
    worksheet.columns = [
      { key: "A", width: 3 },   // Empty spacing
      { key: "B", width: 12 },  // B
      { key: "C", width: 12 },  // C
      { key: "D", width: 12 },  // D
      { key: "E", width: 12 },  // E
      { key: "F", width: 12 },  // F
      { key: "G", width: 12 },  // G
      { key: "H", width: 12 },  // H
      { key: "I", width: 12 },  // I
      { key: "J", width: 12 },  // J
      { key: "K", width: 12 }   // K
    ];

    // Team Title Row (B2 to K2)
    worksheet.mergeCells("B2:K2");
    const titleCell = worksheet.getCell("B2");
    titleCell.value = team.name.toUpperCase();
    titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF000000" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(2).height = 30;

    // Apply Light Green bottom border to Team title
    const greenBorderBottom = { style: "medium" as const, color: { argb: "FF86EFAC" } };
    for (let c = 2; c <= 11; c++) {
      worksheet.getCell(2, c).border = { bottom: greenBorderBottom };
    }

    let currentRow = 4;

    // Group members by subcategory
    const grouped: Record<string, Member[]> = {};
    team.members.forEach((m) => {
      if (!grouped[m.subcategory]) {
        grouped[m.subcategory] = [];
      }
      grouped[m.subcategory].push(m);
    });

    // Sort members within each subcategory alphabetically
    Object.keys(grouped).forEach((sub) => {
      grouped[sub].sort((a, b) => {
        const nameA = a.type === "JOVEM" ? (a.name || "") : (a.husbandName || a.wifeName || "");
        const nameB = b.type === "JOVEM" ? (b.name || "") : (b.husbandName || b.wifeName || "");
        return nameA.localeCompare(nameB, "pt-BR");
      });
    });

    // Sort subcategories
    const activeSubcategories = Object.keys(grouped).sort((a, b) => {
      const idxA = subcategoriesOrder.indexOf(a);
      const idxB = subcategoriesOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    activeSubcategories.forEach((sub) => {
      const members = grouped[sub];

      // Subcategory Header (plain text row in black)
      worksheet.getCell(currentRow, 2).value = sub.toUpperCase() + ` (${members.length})`;
      worksheet.getCell(currentRow, 2).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF000000" } };
      worksheet.getRow(currentRow).height = 20;

      currentRow += 2; // Spacing after header

      members.forEach((m) => {
        const isJovem = m.type === "JOVEM";
        const startCol = 2; // Col B
        const endCol = 11;  // Col K

        if (isJovem) {
          // Jovem Box: 2 rows
          const row1 = currentRow;
          const row2 = currentRow + 1;

          worksheet.getRow(row1).height = 20;
          worksheet.getRow(row2).height = 20;

          // Merge Cells
          // Row 1: Nome (B:I, index 2-9) | Tel (J:K, index 10-11)
          worksheet.mergeCells(row1, 2, row1, 9);
          worksheet.mergeCells(row1, 10, row1, 11);

          // Row 2: Endereço (B:K, index 2-11)
          worksheet.mergeCells(row2, 2, row2, 11);

          // Set values
          setCellRichTextEJC(worksheet.getCell(row1, 2), "Nome: ", m.name || "");
          setCellRichTextEJC(worksheet.getCell(row1, 10), "Tel.: ", m.phone || "");
          setCellRichTextEJC(worksheet.getCell(row2, 2), "End.: ", m.address || "");

          // Set borders cell by cell in Black
          const thinBorder = { style: "thin" as const, color: { argb: "FF000000" } };
          for (let r = row1; r <= row2; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const cell = worksheet.getCell(r, c);
              const border: any = {};

              border.top = thinBorder;
              border.bottom = thinBorder;
              if (c === startCol) border.left = thinBorder;
              if (c === endCol) border.right = thinBorder;

              // Row 1 Splitters: Nome (2-9) | Tel (10-11)
              if (r === row1) {
                if (c === 9) border.right = thinBorder;
                if (c === 10) border.left = thinBorder;
              }

              cell.border = border;
            }
          }

          currentRow += 3; // 2 rows of box + 1 row spacing
        } else {
          // Casal Box: 3 rows
          const startRow = currentRow;
          const endRow = currentRow + 2;

          for (let r = startRow; r <= endRow; r++) {
            worksheet.getRow(r).height = 20;
          }

          // Row 1 (Ele): Nome ELE (B:I, index 2-9) | Tel (J:K, index 10-11)
          worksheet.mergeCells(startRow, 2, startRow, 9);
          worksheet.mergeCells(startRow, 10, startRow, 11);

          // Row 2 (Ela): Nome ELA (B:I, index 2-9) | Tel (J:K, index 10-11)
          worksheet.mergeCells(startRow + 1, 2, startRow + 1, 9);
          worksheet.mergeCells(startRow + 1, 10, startRow + 1, 11);

          // Row 3 (Endereço): Endereço (B:K, index 2-11)
          worksheet.mergeCells(startRow + 2, 2, startRow + 2, 11);

          // Set values
          setCellRichTextEJC(worksheet.getCell(startRow, 2), "Nome ELE: ", m.husbandName || "");
          setCellRichTextEJC(worksheet.getCell(startRow, 10), "Tel.: ", m.husbandPhone || "");
          
          setCellRichTextEJC(worksheet.getCell(startRow + 1, 2), "Nome ELA: ", m.wifeName || "");
          setCellRichTextEJC(worksheet.getCell(startRow + 1, 10), "Tel.: ", m.wifePhone || "");
          
          setCellRichTextEJC(worksheet.getCell(startRow + 2, 2), "End.: ", m.address || "");

          // Set borders cell by cell in Black
          const thinBorder = { style: "thin" as const, color: { argb: "FF000000" } };
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const cell = worksheet.getCell(r, c);
              const border: any = {};

              border.top = thinBorder;
              border.bottom = thinBorder;
              if (c === startCol) border.left = thinBorder;
              if (c === endCol) border.right = thinBorder;

              // Row 1 and 2 Splitters (Ele & Ela): 2-9, 10-11
              if (r === startRow || r === startRow + 1) {
                if (c === 9) border.right = thinBorder;
                if (c === 10) border.left = thinBorder;
              }

              cell.border = border;
            }
          }

          currentRow += 4; // 3 rows of box + 1 row spacing
        }
      });
    });
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const filename = teams.length === 1
    ? `Quadrante_${teams[0].name.replace(/\s+/g, "_")}.xlsx`
    : "quadrante_ejc.xlsx";
  saveAs(blob, filename);
}
