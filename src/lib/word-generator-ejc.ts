import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
} from "docx";
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

const borderStyle = {
  style: BorderStyle.SINGLE,
  size: 8, // 1 pt border
  color: "000000", // Black border
};

const cellBorders = {
  top: borderStyle,
  bottom: borderStyle,
  left: borderStyle,
  right: borderStyle,
};

// Helper function to create a table cell with formatted bold label and regular value
function createCell(label: string, value: string | null | undefined, colSpan: number) {
  const widthDxa = colSpan * 450;
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: label,
            bold: true,
            size: 16, // 8 pt
            font: "Arial",
            color: "000000", // Black labels
          }),
          new TextRun({
            text: value || "-",
            size: 16, // 8 pt
            font: "Arial",
            color: "000000", // Black values
          }),
        ],
        spacing: { before: 40, after: 40 },
      }),
    ],
    columnSpan: colSpan,
    width: {
      size: widthDxa,
      type: WidthType.DXA,
    },
    borders: cellBorders,
    margins: {
      top: 60,
      bottom: 60,
      left: 100,
      right: 100,
    },
  });
}

export async function generateWordQuadrantEJC(teams: Team[]) {
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

  const docChildren: any[] = [];

  teams.forEach((team, teamIdx) => {
    // Team Title - uppercase, bold, blue, 12pt (size 24)
    docChildren.push(
      new Paragraph({
        pageBreakBefore: teamIdx > 0,
        children: [
          new TextRun({
            text: team.name.toUpperCase(),
            bold: true,
            size: 24, // 12 pt
            font: "Arial",
            color: "000000", // Black
          }),
        ],
        spacing: { before: 240, after: 120 },
        keepNext: true,
      })
    );

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

    // Sort active subcategories based on order and include custom categories at the end
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

      // Subcategory Separator Title - uppercase, bold, blue, 9pt (size 18)
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sub.toUpperCase(),
              bold: true,
              size: 18, // 9 pt
              font: "Arial",
              color: "000000", // Black
            }),
          ],
          spacing: { before: 180, after: 100 },
          keepNext: true,
        })
      );

      members.forEach((m) => {
        const isJovem = m.type === "JOVEM";

        if (isJovem) {
          // Jovem Table: 2 rows, 20 columns layout
          const table = new Table({
            width: {
              size: 9000,
              type: WidthType.DXA,
            },
            columnWidths: Array(20).fill(450),
            rows: [
              new TableRow({
                cantSplit: true,
                children: [
                  // Row 1: Nome (span 15) | Tel. (span 5)
                  createCell("Nome: ", m.name, 15),
                  createCell("Tel.: ", m.phone, 5),
                ],
              }),
              new TableRow({
                cantSplit: true,
                children: [
                  // Row 2: Endereço (span 20)
                  createCell("End.: ", m.address, 20),
                ],
              }),
            ],
          });

          docChildren.push(table);
        } else {
          // Casal Table: 3 rows, 20 columns layout
          const table = new Table({
            width: {
              size: 9000,
              type: WidthType.DXA,
            },
            columnWidths: Array(20).fill(450),
            rows: [
              // Row 1: Ele / Celular ELE
              new TableRow({
                cantSplit: true,
                children: [
                  createCell("Nome ELE: ", m.husbandName, 15),
                  createCell("Tel.: ", m.husbandPhone, 5),
                ],
              }),
              // Row 2: Ela / Celular ELA
              new TableRow({
                cantSplit: true,
                children: [
                  createCell("Nome ELA: ", m.wifeName, 15),
                  createCell("Tel.: ", m.wifePhone, 5),
                ],
              }),
              // Row 3: Endereço (span 20)
              new TableRow({
                cantSplit: true,
                children: [
                  createCell("End.: ", m.address, 20),
                ],
              }),
            ],
          });

          docChildren.push(table);
        }

        // Small separator paragraph between cards to prevent Word from merging adjacent tables
        docChildren.push(
          new Paragraph({
            children: [new TextRun("")],
            spacing: { before: 80, after: 80 },
          })
        );
      });
    });
  });

  // Create the Document with custom margins
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  // Generate buffer and download file
  const blob = await Packer.toBlob(doc);
  const filename = teams.length === 1
    ? `Quadrante_${teams[0].name.replace(/\s+/g, "_")}.docx`
    : "quadrante_ejc.docx";

  saveAs(blob, filename);
}
