import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

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

interface EJCPDFDocumentProps {
  teams: Team[];
  modo: "COMPLETO" | "LGPD";
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
  if (!name) return "-";
  if (nickname && nickname.trim() !== "") {
    return `${name} (${nickname})`;
  }
  return name;
}

const styles = StyleSheet.create({
  pagePortrait: {
    padding: 24,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  teamContainer: {
    marginBottom: 20,
  },
  teamTitleContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#EAB308", // Yellow border
    paddingBottom: 4,
  },
  teamTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A8A", // Dark Blue
    textTransform: "uppercase",
    textAlign: "center",
  },
  subcategoryContainer: {
    marginBottom: 12,
  },
  subcategoryTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A8A", // Dark Blue
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    textAlign: "left",
  },
  // Box with thin dark blue borders
  memberBox: {
    borderWidth: 0.8,
    borderColor: "#1E3A8A",
    borderStyle: "solid",
    marginBottom: 6,
    backgroundColor: "#ffffff",
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  gridRowBorderBottom: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#1E3A8A",
  },
  stackedItemSeparator: {
    borderTopWidth: 0.8,
    borderTopColor: "#1E3A8A",
  },
  // Individual Layout cells (3 parts: 60%, 20%, 20%)
  cellNome3part: {
    width: "60%",
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRightWidth: 0.8,
    borderRightColor: "#1E3A8A",
    justifyContent: "center",
  },
  cellTel3part: {
    width: "20%",
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRightWidth: 0.8,
    borderRightColor: "#1E3A8A",
    justifyContent: "center",
  },
  cellAniv3part: {
    width: "20%",
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    justifyContent: "center",
  },
  // Cells for 2 parts (50%, 50%)
  cell2part: {
    width: "50%",
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRightWidth: 0.8,
    borderRightColor: "#1E3A8A",
    justifyContent: "center",
  },
  cell2partLast: {
    width: "50%",
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    justifyContent: "center",
  },
  // Full width cell (100% width)
  cellFullWidth: {
    width: "100%",
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    justifyContent: "center",
  },
  // Text Styles
  labelBlue: {
    fontFamily: "Helvetica-Bold",
    color: "#1E3A8A", // Dark Blue label
    fontSize: 7.5,
  },
  valueBlack: {
    color: "#000000",
    fontFamily: "Helvetica",
    fontSize: 7.5,
  },
  // LGPD Clean Styles (No boxes, no grids)
  lgpdRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB", // Subtle separator line
  },
  lgpdHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6", // Light grey bg
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#1E3A8A", // EJC Blue bottom border for header
  },
  lgpdHeaderCellText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A8A", // Dark Blue
    textTransform: "uppercase",
    paddingHorizontal: 6,
  },
  lgpdCellText: {
    fontSize: 8,
    color: "#000000",
    fontFamily: "Helvetica",
    paddingHorizontal: 6,
  },
  lgpdCellTextBold: {
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 24,
    right: 24,
    textAlign: "center",
    fontSize: 7,
    color: "#4b5563",
    borderTopWidth: 0.5,
    borderTopColor: "#9ca3af",
    paddingTop: 4,
  },
});

// Columns width for LGPD
const LGPD_COL_WIDTHS = {
  nome: "50%",
  apelido: "25%",
  nascimento: "25%",
};

export function EJCPDFDocument({ teams, modo }: EJCPDFDocumentProps) {
  const subcategoriesOrder = [
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

  // Helper to render Jovem/Individual rows
  const renderJovemRows = (m: Member) => (
    <>
      {/* Row 1: Nome (Apelido): (60%) / Celular: (20%) / Nascimento: (20%) */}
      <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
        <View style={styles.cellNome3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Nome (Apelido): </Text>
            {formatNameWithNickname(m.name, m.nickname)}
          </Text>
        </View>
        <View style={styles.cellTel3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Celular: </Text>
            {m.phone || "-"}
          </Text>
        </View>
        <View style={styles.cellAniv3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Nascimento: </Text>
            {formatDate(m.birthDate)}
          </Text>
        </View>
      </View>

      {/* Row 2: E-mail: (50%) / Endereço: (50%) */}
      <View style={styles.gridRow}>
        <View style={styles.cell2part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>E-mail: </Text>
            {m.email || "-"}
          </Text>
        </View>
        <View style={styles.cell2partLast}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Endereço: </Text>
            {m.address || "-"}
          </Text>
        </View>
      </View>
    </>
  );

  // Helper to render Casal rows
  const renderCasalRows = (m: Member) => (
    <>
      {/* Row 1 (Ele): Nome (Apelido) ELE: (60%) / Celular ELE: (20%) / Nasc. ELE: (20%) */}
      <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
        <View style={styles.cellNome3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Nome (Apelido) ELE: </Text>
            {formatNameWithNickname(m.husbandName, m.husbandNickname)}
          </Text>
        </View>
        <View style={styles.cellTel3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Celular ELE: </Text>
            {m.husbandPhone || "-"}
          </Text>
        </View>
        <View style={styles.cellAniv3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Nasc. ELE: </Text>
            {formatDate(m.husbandBirthDate)}
          </Text>
        </View>
      </View>

      {/* Row 2 (Ela): Nome (Apelido) ELA: (60%) / Celular ELA: (20%) / Nasc. ELA: (20%) */}
      <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
        <View style={styles.cellNome3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Nome (Apelido) ELA: </Text>
            {formatNameWithNickname(m.wifeName, m.wifeNickname)}
          </Text>
        </View>
        <View style={styles.cellTel3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Celular ELA: </Text>
            {m.wifePhone || "-"}
          </Text>
        </View>
        <View style={styles.cellAniv3part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Nasc. ELA: </Text>
            {formatDate(m.wifeBirthDate)}
          </Text>
        </View>
      </View>

      {/* Row 3 (Emails): E-mail ELE: (50%) / E-mail ELA: (50%) */}
      <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
        <View style={styles.cell2part}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>E-mail ELE: </Text>
            {m.husbandEmail || "-"}
          </Text>
        </View>
        <View style={styles.cell2partLast}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>E-mail ELA: </Text>
            {m.wifeEmail || "-"}
          </Text>
        </View>
      </View>

      {/* Row 4 (Endereço): Endereço: (100% width) */}
      <View style={styles.gridRow}>
        <View style={styles.cellFullWidth}>
          <Text style={styles.valueBlack}>
            <Text style={styles.labelBlue}>Endereço: </Text>
            {m.address || "-"}
          </Text>
        </View>
      </View>
    </>
  );

  if (modo === "COMPLETO") {
    return (
      <Document>
        <Page size="A4" orientation="portrait" style={styles.pagePortrait}>
          {teams.map((team) => {
            // Group members by subcategory
            const grouped: Record<string, Member[]> = {};
            team.members.forEach((m) => {
              if (!grouped[m.subcategory]) {
                grouped[m.subcategory] = [];
              }
              grouped[m.subcategory].push(m);
            });

            // Sort active subcategories based on order list
            const activeSubcategories = Object.keys(grouped).sort((a, b) => {
              const idxA = subcategoriesOrder.indexOf(a);
              const idxB = subcategoriesOrder.indexOf(b);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return a.localeCompare(b);
            });

            return (
              <View key={team.id} style={styles.teamContainer}>
                {/* Centralized Team Name with Yellow border bottom */}
                <View style={styles.teamTitleContainer} wrap={false}>
                  <Text style={styles.teamTitle}>
                    {team.name.toUpperCase()}
                  </Text>
                </View>

                {/* Subcategories */}
                {activeSubcategories.map((sub) => {
                  const members = grouped[sub];
                  const isIntegrantesSub =
                    sub.trim().toLowerCase() === "integrantes" ||
                    sub.trim().toLowerCase() === "integrante" ||
                    sub.trim().toLowerCase().includes("membros");

                  return (
                    <View key={sub} style={styles.subcategoryContainer}>
                      {/* Left-aligned Subcategory Title (navy blue) */}
                      <Text style={styles.subcategoryTitle}>
                        {sub}
                      </Text>

                      {isIntegrantesSub ? (
                        /* Stacked single-box layout for members */
                        <View style={styles.memberBox}>
                          {members.map((m, idx) => (
                            <View
                              key={m.id}
                              style={idx > 0 ? styles.stackedItemSeparator : undefined}
                              wrap={false}
                            >
                              {m.type === "JOVEM" ? renderJovemRows(m) : renderCasalRows(m)}
                            </View>
                          ))}
                        </View>
                      ) : (
                        /* Individual boxes for each member */
                        members.map((m) => (
                          <View key={m.id} style={styles.memberBox} wrap={false}>
                            {m.type === "JOVEM" ? renderJovemRows(m) : renderCasalRows(m)}
                          </View>
                        ))
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
          
          {/* Footer - repeated on every page */}
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages} • EJC Formato Completo`
            }
            fixed
          />
        </Page>
      </Document>
    );
  }

  // LGPD REDUCED MODE (No boxes, no grids, portrait linear list)
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.pagePortrait}>
        {teams.map((team) => {
          // Flat list of individuals
          const flatList: {
            id: string;
            nomeCompleto: string;
            apelido: string;
            nascimento: Date | string | null;
            subcategory: string;
          }[] = [];

          // Group and sort members by subcategory to maintain hierarchy
          const grouped: Record<string, Member[]> = {};
          team.members.forEach((m) => {
            if (!grouped[m.subcategory]) {
              grouped[m.subcategory] = [];
            }
            grouped[m.subcategory].push(m);
          });

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
            members.forEach((m) => {
              if (m.type === "JOVEM") {
                flatList.push({
                  id: m.id,
                  nomeCompleto: m.name || "",
                  apelido: m.nickname || "",
                  nascimento: m.birthDate,
                  subcategory: sub,
                });
              } else {
                if (m.husbandName) {
                  flatList.push({
                    id: `${m.id}-ele`,
                    nomeCompleto: m.husbandName,
                    apelido: m.husbandNickname || "",
                    nascimento: m.husbandBirthDate,
                    subcategory: sub,
                  });
                }
                if (m.wifeName) {
                  flatList.push({
                    id: `${m.id}-ela`,
                    nomeCompleto: m.wifeName,
                    apelido: m.wifeNickname || "",
                    nascimento: m.wifeBirthDate,
                    subcategory: sub,
                  });
                }
              }
            });
          });

          // Group the flat individuals by subcategory for the PDF layout (so they stay grouped visually)
          const flatGrouped: Record<string, typeof flatList> = {};
          flatList.forEach((item) => {
            if (!flatGrouped[item.subcategory]) {
              flatGrouped[item.subcategory] = [];
            }
            flatGrouped[item.subcategory].push(item);
          });

          return (
            <View key={team.id} style={styles.teamContainer}>
              {/* Centralized Team Name with Yellow border bottom */}
              <View style={styles.teamTitleContainer} wrap={false}>
                <Text style={styles.teamTitle}>
                  {team.name.toUpperCase()} (LGPD)
                </Text>
              </View>

              {activeSubcategories.map((sub) => {
                const subItems = flatGrouped[sub];
                if (!subItems || subItems.length === 0) return null;

                return (
                  <View key={sub} style={styles.subcategoryContainer}>
                    {/* Left-aligned Subcategory Title */}
                    <Text style={styles.subcategoryTitle}>
                      {sub}
                    </Text>

                    {/* Header Row */}
                    <View style={styles.lgpdHeader}>
                      <View style={{ width: LGPD_COL_WIDTHS.nome }}>
                        <Text style={styles.lgpdHeaderCellText}>Nome Completo</Text>
                      </View>
                      <View style={{ width: LGPD_COL_WIDTHS.apelido }}>
                        <Text style={styles.lgpdHeaderCellText}>Apelido</Text>
                      </View>
                      <View style={{ width: LGPD_COL_WIDTHS.nascimento }}>
                        <Text style={styles.lgpdHeaderCellText}>Nascimento</Text>
                      </View>
                    </View>

                    {/* Data Rows */}
                    {subItems.map((item) => (
                      <View key={item.id} style={styles.lgpdRow}>
                        <View style={{ width: LGPD_COL_WIDTHS.nome }}>
                          <Text style={[styles.lgpdCellText, styles.lgpdCellTextBold]}>
                            {item.nomeCompleto}
                          </Text>
                        </View>
                        <View style={{ width: LGPD_COL_WIDTHS.apelido }}>
                          <Text style={styles.lgpdCellText}>
                            {item.apelido || "-"}
                          </Text>
                        </View>
                        <View style={{ width: LGPD_COL_WIDTHS.nascimento }}>
                          <Text style={styles.lgpdCellText}>
                            {formatDate(item.nascimento)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages} • EJC Ficha LGPD (Reduzida)`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
