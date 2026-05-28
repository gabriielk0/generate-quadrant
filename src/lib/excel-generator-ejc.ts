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

// Helper to format name with nickname
function formatNameWithNickname(name: string | null | undefined, nickname: string | null | undefined): string {
  if (!name) return "";
  if (nickname && nickname.trim() !== "") {
    return `${name} (${nickname})`;
  }
  return name;
}

// Helper to set Rich Text values for cells with bold labels in EJC colors
function setCellRichTextEJC(cell: ExcelJS.Cell, label: string, value: string) {
  cell.value = {
    richText: [
      { text: label, font: { bold: true, name: "Segoe UI", size: 9, color: { argb: "FF1E3A8A" } } }, // Dark Blue
      { text: value || "-", font: { name: "Segoe UI", size: 9, color: { argb: "FF000000" } } } // Black value
    ]
  };
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
}

export async function generateExcelQuadrantEJC(teams: Team[]) {
  const workbook = new ExcelJS.Workbook();
  
  const subcategoriesOrder = [
    "Coordenador(a)",
    "Casal coordenador",
    "Casal",
    "Casal apoio",
    "Casais membros",
    "Jovens coordenadores",
    "Jovens apoio",
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
    titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(2).height = 30;

    // Apply Yellow bottom border to Team title
    const yellowBorderBottom = { style: "medium" as const, color: { argb: "FFEAB308" } };
    for (let c = 2; c <= 11; c++) {
      worksheet.getCell(2, c).border = { bottom: yellowBorderBottom };
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

      // Subcategory Header (plain text row in blue)
      worksheet.getCell(currentRow, 2).value = sub.toUpperCase() + ` (${members.length})`;
      worksheet.getCell(currentRow, 2).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF1E3A8A" } };
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
          // Row 1: Nome (B:G, index 2-7) | Celular (H:I, index 8-9) | Nascimento (J:K, index 10-11)
          worksheet.mergeCells(row1, 2, row1, 7);
          worksheet.mergeCells(row1, 8, row1, 9);
          worksheet.mergeCells(row1, 10, row1, 11);

          // Row 2: E-mail (B:F, index 2-6) | Endereço (G:K, index 7-11)
          worksheet.mergeCells(row2, 2, row2, 6);
          worksheet.mergeCells(row2, 7, row2, 11);

          // Set values
          setCellRichTextEJC(worksheet.getCell(row1, 2), "Nome (Apelido): ", formatNameWithNickname(m.name, m.nickname));
          setCellRichTextEJC(worksheet.getCell(row1, 8), "Celular: ", m.phone || "");
          setCellRichTextEJC(worksheet.getCell(row1, 10), "Nascimento: ", formatDate(m.birthDate));
          setCellRichTextEJC(worksheet.getCell(row2, 2), "E-mail: ", m.email || "-");
          setCellRichTextEJC(worksheet.getCell(row2, 7), "Endereço: ", m.address || "");

          // Set borders cell by cell in EJC Blue
          const thinBorder = { style: "thin" as const, color: { argb: "FF1E3A8A" } };
          for (let r = row1; r <= row2; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const cell = worksheet.getCell(r, c);
              const border: any = {};

              // Top border of box or inner horizontal
              border.top = thinBorder;
              // Bottom border of box or inner horizontal
              border.bottom = thinBorder;
              // Outer vertical left
              if (c === startCol) border.left = thinBorder;
              // Outer vertical right
              if (c === endCol) border.right = thinBorder;

              // Row 1 Splitters: Nome (2-7) | Celular (8-9) | Nascimento (10-11)
              if (r === row1) {
                if (c === 7) border.right = thinBorder;
                if (c === 8) border.left = thinBorder;
                if (c === 9) border.right = thinBorder;
                if (c === 10) border.left = thinBorder;
              }

              // Row 2 Splitter: E-mail (2-6) | Endereço (7-11)
              if (r === row2) {
                if (c === 6) border.right = thinBorder;
                if (c === 7) border.left = thinBorder;
              }

              cell.border = border;
            }
          }

          currentRow += 3; // 2 rows of box + 1 row spacing
        } else {
          // Casal Box: 4 rows
          const startRow = currentRow;
          const endRow = currentRow + 3;

          for (let r = startRow; r <= endRow; r++) {
            worksheet.getRow(r).height = 20;
          }

          // Row 1 (Ele): Nome (B:G, index 2-7) | Celular (H:I, index 8-9) | Nascimento (J:K, index 10-11)
          worksheet.mergeCells(startRow, 2, startRow, 7);
          worksheet.mergeCells(startRow, 8, startRow, 9);
          worksheet.mergeCells(startRow, 10, startRow, 11);

          // Row 2 (Ela): Nome (B:G, index 2-7) | Celular (H:I, index 8-9) | Nascimento (J:K, index 10-11)
          worksheet.mergeCells(startRow + 1, 2, startRow + 1, 7);
          worksheet.mergeCells(startRow + 1, 8, startRow + 1, 9);
          worksheet.mergeCells(startRow + 1, 10, startRow + 1, 11);

          // Row 3 (Emails): E-mail Ele (B:F, index 2-6) | E-mail Ela (G:K, index 7-11)
          worksheet.mergeCells(startRow + 2, 2, startRow + 2, 6);
          worksheet.mergeCells(startRow + 2, 7, startRow + 2, 11);

          // Row 4 (Endereço): Endereço (B:K, index 2-11)
          worksheet.mergeCells(startRow + 3, 2, startRow + 3, 11);

          // Set values
          setCellRichTextEJC(worksheet.getCell(startRow, 2), "Nome (Apelido) ELE: ", formatNameWithNickname(m.husbandName, m.husbandNickname));
          setCellRichTextEJC(worksheet.getCell(startRow, 8), "Celular ELE: ", m.husbandPhone || "");
          setCellRichTextEJC(worksheet.getCell(startRow, 10), "Nasc. ELE: ", formatDate(m.husbandBirthDate));
          
          setCellRichTextEJC(worksheet.getCell(startRow + 1, 2), "Nome (Apelido) ELA: ", formatNameWithNickname(m.wifeName, m.wifeNickname));
          setCellRichTextEJC(worksheet.getCell(startRow + 1, 8), "Celular ELA: ", m.wifePhone || "");
          setCellRichTextEJC(worksheet.getCell(startRow + 1, 10), "Nasc. ELA: ", formatDate(m.wifeBirthDate));
          
          setCellRichTextEJC(worksheet.getCell(startRow + 2, 2), "E-mail ELE: ", m.husbandEmail || "-");
          setCellRichTextEJC(worksheet.getCell(startRow + 2, 7), "E-mail ELA: ", m.wifeEmail || "-");
          
          setCellRichTextEJC(worksheet.getCell(startRow + 3, 2), "Endereço: ", m.address || "");

          // Set borders cell by cell in EJC Blue
          const thinBorder = { style: "thin" as const, color: { argb: "FF1E3A8A" } };
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const cell = worksheet.getCell(r, c);
              const border: any = {};

              // Border rules for all cells
              border.top = thinBorder;
              border.bottom = thinBorder;
              if (c === startCol) border.left = thinBorder;
              if (c === endCol) border.right = thinBorder;

              // Row 1 and 2 Splitters (Ele & Ela): 2-7, 8-9, 10-11
              if (r === startRow || r === startRow + 1) {
                if (c === 7) border.right = thinBorder;
                if (c === 8) border.left = thinBorder;
                if (c === 9) border.right = thinBorder;
                if (c === 10) border.left = thinBorder;
              }

              // Row 3 Splitter (Emails): 2-6, 7-11
              if (r === startRow + 2) {
                if (c === 6) border.right = thinBorder;
                if (c === 7) border.left = thinBorder;
              }

              cell.border = border;
            }
          }

          currentRow += 5; // 4 rows of box + 1 row spacing
        }
      });
    });
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "quadrante_ejc.xlsx");
}
