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
  husbandEmail: string | null;
  husbandBirthDate: Date | string | null;
  husbandPhone: string | null;
  wifeName: string | null;
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

// Helper to set Rich Text values for cells with bold labels
function setCellRichText(cell: ExcelJS.Cell, label: string, value: string) {
  cell.value = {
    richText: [
      { text: label, font: { bold: true, name: "Segoe UI", size: 9, color: { argb: "FF000000" } } },
      { text: value || "-", font: { name: "Segoe UI", size: 9, color: { argb: "FF1F2937" } } } // Gray 800
    ]
  };
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
}

export async function generateExcelQuadrant(teams: Team[]) {
  const workbook = new ExcelJS.Workbook();
  
  const subcategoriesOrder = [
    "Casal coordenador",
    "Casal apoio",
    "Casais membros",
    "Jovens coordenadores",
    "Jovens apoio",
    "Jovens membros",
  ];

  teams.forEach((team) => {
    // Worksheet name limit is 31 characters
    const sheetName = team.name.substring(0, 30).replace(/[\\*?:/[\]]/g, "_");
    const worksheet = workbook.addWorksheet(sheetName);

    // Set column widths (Indent, B to G for left side, H to J for right side)
    worksheet.columns = [
      { key: "A", width: 3 },   // Empty spacing
      { key: "B", width: 12 },  // Left side
      { key: "C", width: 12 },
      { key: "D", width: 12 },
      { key: "E", width: 12 },
      { key: "F", width: 12 },
      { key: "G", width: 12 },  // Splitter at Col G/H (index 7/8)
      { key: "H", width: 14 },  // Right side
      { key: "I", width: 14 },
      { key: "J", width: 14 }
    ];

    // Team Title Row
    worksheet.mergeCells("B2:J2");
    const titleCell = worksheet.getCell("B2");
    titleCell.value = `EQUIPE: ${team.name.toUpperCase()}`;
    titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF000000" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(2).height = 30;

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

      // Subcategory Header (plain text row)
      worksheet.getCell(currentRow, 2).value = sub.toUpperCase() + ` (${members.length})`;
      worksheet.getCell(currentRow, 2).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF000000" } };
      worksheet.getRow(currentRow).height = 20;

      currentRow += 2; // Spacing after header

      members.forEach((m) => {
        const isJovem = m.type === "JOVEM";
        const startCol = 2; // Col B
        const endCol = 10;  // Col J

        if (isJovem) {
          // Jovem Box: 2 rows
          const row1 = currentRow;
          const row2 = currentRow + 1;

          worksheet.getRow(row1).height = 20;
          worksheet.getRow(row2).height = 20;

          // Merge Cells
          // Row 1: Nome (B:G, index 2-7) | Nascimento (H:J, index 8-10)
          worksheet.mergeCells(row1, 2, row1, 7);
          worksheet.mergeCells(row1, 8, row1, 10);

          // Row 2: Endereço (B:D, index 2-4) | E-mail (E:G, index 5-7) | Telefone (H:J, index 8-10)
          worksheet.mergeCells(row2, 2, row2, 4);
          worksheet.mergeCells(row2, 5, row2, 7);
          worksheet.mergeCells(row2, 8, row2, 10);

          // Set values
          setCellRichText(worksheet.getCell(row1, 2), "Nome: ", m.name || "");
          setCellRichText(worksheet.getCell(row1, 8), "Nasc: ", formatDate(m.birthDate));
          setCellRichText(worksheet.getCell(row2, 2), "End: ", m.address || "");
          setCellRichText(worksheet.getCell(row2, 5), "E-mail: ", m.email || "-");
          setCellRichText(worksheet.getCell(row2, 8), "Tel: ", m.phone || "");

          // Set borders cell by cell
          const thinBorder = { style: "thin" as const, color: { argb: "FF000000" } };
          for (let r = row1; r <= row2; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const cell = worksheet.getCell(r, c);
              const border: any = {};

              // Top border of box or inner horizontal
              if (r === row1) border.top = thinBorder;
              else border.top = thinBorder;

              // Bottom border of box or inner horizontal
              if (r === row2) border.bottom = thinBorder;
              else border.bottom = thinBorder;

              // Outer vertical left
              if (c === startCol) border.left = thinBorder;
              // Outer vertical right
              if (c === endCol) border.right = thinBorder;

              // Row 1 Splitter (Col G/H, index 7/8)
              if (r === row1) {
                if (c === 7) border.right = thinBorder;
                if (c === 8) border.left = thinBorder;
              }

              // Row 2 Splitters: B:D (index 2-4) | E:G (index 5-7) | H:J (index 8-10)
              if (r === row2) {
                // Splitter 1: between Col D and E (index 4/5)
                if (c === 4) border.right = thinBorder;
                if (c === 5) border.left = thinBorder;
                // Splitter 2: between Col G and H (index 7/8)
                if (c === 7) border.right = thinBorder;
                if (c === 8) border.left = thinBorder;
              }

              cell.border = border;
            }
          }

          currentRow += 3; // 2 rows of box + 1 row spacing
        } else {
          // Casal Box: 5 rows
          const startRow = currentRow;
          const endRow = currentRow + 4;

          // Merge cells on all 5 rows: B:G (left, index 2-7) | H:J (right, index 8-10)
          for (let r = startRow; r <= endRow; r++) {
            worksheet.getRow(r).height = 20;
            worksheet.mergeCells(r, 2, r, 7);
            worksheet.mergeCells(r, 8, r, 10);
          }

          // Set values
          setCellRichText(worksheet.getCell(startRow, 2), "Ele: ", m.husbandName || "");
          setCellRichText(worksheet.getCell(startRow, 8), "Nasc: ", formatDate(m.husbandBirthDate));
          
          setCellRichText(worksheet.getCell(startRow + 1, 2), "E-mail: ", m.husbandEmail || "-");
          setCellRichText(worksheet.getCell(startRow + 1, 8), "Cel: ", m.husbandPhone || "");
          
          setCellRichText(worksheet.getCell(startRow + 2, 2), "Ela: ", m.wifeName || "");
          setCellRichText(worksheet.getCell(startRow + 2, 8), "Nasc: ", formatDate(m.wifeBirthDate));
          
          setCellRichText(worksheet.getCell(startRow + 3, 2), "E-mail: ", m.wifeEmail || "-");
          setCellRichText(worksheet.getCell(startRow + 3, 8), "Cel: ", m.wifePhone || "");
          
          setCellRichText(worksheet.getCell(startRow + 4, 2), "End: ", m.address || "");
          setCellRichText(worksheet.getCell(startRow + 4, 8), "Tel. Resid: ", m.homePhone || "-");

          // Set borders cell by cell
          const thinBorder = { style: "thin" as const, color: { argb: "FF000000" } };
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const cell = worksheet.getCell(r, c);
              const border: any = {};

              // Top border of box or inner horizontal
              if (r === startRow) border.top = thinBorder;
              else border.top = thinBorder;

              // Bottom border of box or inner horizontal
              if (r === endRow) border.bottom = thinBorder;
              else border.bottom = thinBorder;

              // Outer vertical left
              if (c === startCol) border.left = thinBorder;
              // Outer vertical right
              if (c === endCol) border.right = thinBorder;

              // Vertical Splitter (between Col G and H, index 7/8)
              if (c === 7) border.right = thinBorder;
              if (c === 8) border.left = thinBorder;

              cell.border = border;
            }
          }

          currentRow += 6; // 5 rows of box + 1 row spacing
        }
      });
    });
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "quadrante_segue_me.xlsx");
}
