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

interface QuadrantePDFDocumentProps {
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

const styles = StyleSheet.create({
  // Page style
  pagePortrait: {
    padding: 24,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  teamContainer: {
    marginBottom: 16,
  },
  subcategoryContainer: {
    marginBottom: 8,
  },
  photoPlaceholder: {
    borderWidth: 1,
    borderColor: "#000000",
    borderStyle: "dashed",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderRadius: 4,
  },
  photoText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#4b5563",
  },
  // Clean titles (no decoration, no borders, no bg)
  teamTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  subcategoryTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  // Box Layout (Modo COMPLETO)
  memberBox: {
    borderWidth: 1,
    borderColor: "#000000",
    borderStyle: "solid",
    marginBottom: 8,
    backgroundColor: "#ffffff",
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  gridRowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  // Columns for Jovem Row 1
  leftCellJovemL1: {
    width: "70%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    justifyContent: "center",
  },
  rightCellJovemL1: {
    width: "30%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: "center",
  },
  // Columns for Jovem Row 2
  cellJovemEndL2: {
    width: "45%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    justifyContent: "center",
  },
  cellJovemEmailL2: {
    width: "30%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    justifyContent: "center",
  },
  cellJovemTelL2: {
    width: "25%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: "center",
  },
  // Columns for Casal (5 rows layout)
  leftCellCasal: {
    width: "65%",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    justifyContent: "center",
  },
  rightCellCasal: {
    width: "35%",
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: "center",
  },
  cellText: {
    fontSize: 7.5,
    color: "#000000",
    fontFamily: "Helvetica",
    lineHeight: 1.2,
  },
  cellTextBold: {
    fontFamily: "Helvetica-Bold",
  },
  // LGPD Table Layout
  lgpdTable: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#000000",
    marginTop: 6,
    marginBottom: 12,
  },
  lgpdHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingVertical: 4,
  },
  lgpdHeaderCell: {
    paddingHorizontal: 6,
  },
  lgpdHeaderCellText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textTransform: "uppercase",
  },
  lgpdRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    alignItems: "center",
    minHeight: 18,
  },
  lgpdCell: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: "#000000",
  },
  lgpdCellLast: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  // Footer
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

// Column widths for LGPD Table
const LGPD_COL_WIDTHS = {
  nome: "50%",
  apelido: "25%",
  nascimento: "25%",
};

export function QuadrantePDFDocument({ teams, modo }: QuadrantePDFDocumentProps) {
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
    "Casal coordenador",
    "Casal apoio",
    "Casais membros",
    "Jovens coordenadores",
    "Jovens apoio",
    "Jovens membros",
  ];

  if (modo === "COMPLETO") {
    return (
      <Document>
        <Page size="A4" orientation="portrait" style={styles.pagePortrait}>
          {teams.map((team, teamIdx) => {
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

            return (
              <View key={team.id} style={styles.teamContainer} break={teamIdx > 0}>
                {/* Team Name Title - strictly upper case bold and no decorations */}
                <Text style={styles.teamTitle}>
                  {team.name.toUpperCase()}
                </Text>

                {/* Espaço para foto da equipe */}
                <View style={styles.photoPlaceholder} wrap={false}>
                  <Text style={styles.photoText}>FOTO DA EQUIPE</Text>
                </View>

                {/* Subcategories and Member Boxes */}
                {activeSubcategories.map((sub) => {
                  const members = grouped[sub];
                  return (
                    <View key={sub} style={styles.subcategoryContainer}>
                      {/* Subcategory Separator Title - strictly the subcategory name */}
                      <Text style={styles.subcategoryTitle}>
                        {sub}
                      </Text>

                      {/* Member Box Render */}
                      {members.map((m) => {
                        const isJovem = m.type === "JOVEM";

                        if (isJovem) {
                          return (
                            <View key={m.id} style={styles.memberBox} wrap={false}>
                              {/* Row 1: Nome Completo (~70%) / Nascimento (~30%) */}
                              <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
                                <View style={styles.leftCellJovemL1}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Nome: </Text>
                                    {m.name}
                                  </Text>
                                </View>
                                <View style={styles.rightCellJovemL1}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Nasc: </Text>
                                    {formatDate(m.birthDate)}
                                  </Text>
                                </View>
                              </View>

                              {/* Row 2: Endereço (~45%) / E-Mail (~30%) / Telefone (~25%) */}
                              <View style={styles.gridRow}>
                                <View style={styles.cellJovemEndL2}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>End: </Text>
                                    {m.address}
                                  </Text>
                                </View>
                                <View style={styles.cellJovemEmailL2}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>E-mail: </Text>
                                    {m.email || "-"}
                                  </Text>
                                </View>
                                <View style={styles.cellJovemTelL2}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Tel: </Text>
                                    {m.phone}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        } else {
                          // Casal Box (5 lines layout)
                          return (
                            <View key={m.id} style={styles.memberBox} wrap={false}>
                              {/* Row 1: Nome ELE / Nascimento ELE */}
                              <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
                                <View style={styles.leftCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Ele: </Text>
                                    {m.husbandName}
                                  </Text>
                                </View>
                                <View style={styles.rightCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Nasc: </Text>
                                    {formatDate(m.husbandBirthDate)}
                                  </Text>
                                </View>
                              </View>

                              {/* Row 2: E-mail ELE / Celular ELE */}
                              <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
                                <View style={styles.leftCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>E-mail: </Text>
                                    {m.husbandEmail || "-"}
                                  </Text>
                                </View>
                                <View style={styles.rightCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Cel: </Text>
                                    {m.husbandPhone}
                                  </Text>
                                </View>
                              </View>

                              {/* Row 3: Nome ELA / Nascimento ELA */}
                              <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
                                <View style={styles.leftCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Ela: </Text>
                                    {m.wifeName}
                                  </Text>
                                </View>
                                <View style={styles.rightCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Nasc: </Text>
                                    {formatDate(m.wifeBirthDate)}
                                  </Text>
                                </View>
                              </View>

                              {/* Row 4: E-mail ELA / Celular ELA */}
                              <View style={[styles.gridRow, styles.gridRowBorderBottom]}>
                                <View style={styles.leftCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>E-mail: </Text>
                                    {m.wifeEmail || "-"}
                                  </Text>
                                </View>
                                <View style={styles.rightCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Cel: </Text>
                                    {m.wifePhone}
                                  </Text>
                                </View>
                              </View>

                              {/* Row 5: Endereço / Telefone Residencial */}
                              <View style={styles.gridRow}>
                                <View style={styles.leftCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>End: </Text>
                                    {m.address}
                                  </Text>
                                </View>
                                <View style={styles.rightCellCasal}>
                                  <Text style={styles.cellText}>
                                    <Text style={styles.cellTextBold}>Tel. Resid: </Text>
                                    {m.homePhone || "-"}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        }
                      })}
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
              `Página ${pageNumber} de ${totalPages} • Formato Físico/Administrativo`
            }
            fixed
          />
        </Page>
      </Document>
    );
  }

  // LGPD MODE (Portrait, simple linear list, containing only: Nome, Apelido, Nascimento)
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.pagePortrait}>
        {teams.map((team, teamIdx) => {
          // Flatten list for LGPD
          const lgpdList: { id: string; name: string; papel: string }[] = [];

          // Sort members by subcategory hierarchy and alphabetically within subcategories
          const sortedMembers = [...team.members].sort((a, b) => {
            const idxA = subcategoriesOrder.indexOf(a.subcategory);
            const idxB = subcategoriesOrder.indexOf(b.subcategory);
            if (idxA !== idxB) {
              return idxA - idxB;
            }
            const nameA = a.type === "JOVEM" ? (a.name || "") : (a.husbandName || a.wifeName || "");
            const nameB = b.type === "JOVEM" ? (b.name || "") : (b.husbandName || b.wifeName || "");
            return nameA.localeCompare(nameB, "pt-BR");
          });

          sortedMembers.forEach((m) => {
            if (m.type === "JOVEM") {
              lgpdList.push({
                id: m.id,
                name: m.name || "",
                papel: `${m.nickname || "Jovem"} (${m.subcategory})`,
              });
            } else {
              if (m.husbandName) {
                lgpdList.push({
                  id: `${m.id}-husband`,
                  name: m.husbandName,
                  papel: `Esposo (${m.subcategory})`,
                });
              }
              if (m.wifeName) {
                lgpdList.push({
                  id: `${m.id}-wife`,
                  name: m.wifeName,
                  papel: `Esposa (${m.subcategory})`,
                });
              }
            }
          });

          const getBirthDate = (itemId: string) => {
            const baseId = itemId.replace("-husband", "").replace("-wife", "");
            const original = team.members.find((m) => m.id === baseId);
            if (!original) return "-";
            if (itemId.endsWith("-husband")) return formatDate(original.husbandBirthDate);
            if (itemId.endsWith("-wife")) return formatDate(original.wifeBirthDate);
            return formatDate(original.birthDate);
          };

          return (
            <View key={team.id} style={styles.teamContainer} break={teamIdx > 0}>
              {/* Team Name Title - strictly upper case bold and no decorations */}
              <Text style={styles.teamTitle}>
                {team.name.toUpperCase()}
              </Text>

              {/* Table */}
              <View style={styles.lgpdTable}>
                {/* Header Row */}
                <View style={styles.lgpdHeader}>
                  <View style={[styles.lgpdHeaderCell, { width: LGPD_COL_WIDTHS.nome }]}>
                    <Text style={styles.lgpdHeaderCellText}>Nome Completo</Text>
                  </View>
                  <View style={[styles.lgpdHeaderCell, { width: LGPD_COL_WIDTHS.apelido }]}>
                    <Text style={styles.lgpdHeaderCellText}>Apelido / Papel</Text>
                  </View>
                  <View style={[styles.lgpdHeaderCell, { width: LGPD_COL_WIDTHS.nascimento }]}>
                    <Text style={styles.lgpdHeaderCellText}>Data Nascimento</Text>
                  </View>
                </View>

                {/* Rows */}
                {lgpdList.length === 0 ? (
                  <View style={styles.lgpdRow}>
                    <View style={[styles.lgpdCellLast, { width: "100%", paddingVertical: 15, alignItems: "center" }]}>
                      <Text style={[styles.cellText, { color: "#4b5563" }]}>
                        Nenhum integrante cadastrado nesta equipe.
                      </Text>
                    </View>
                  </View>
                ) : (
                  lgpdList.map((item, idx) => (
                    <View
                      key={item.id}
                      style={[
                        styles.lgpdRow,
                        idx === lgpdList.length - 1 ? { borderBottomWidth: 0 } : {},
                      ]}
                    >
                      <View style={[styles.lgpdCell, { width: LGPD_COL_WIDTHS.nome }]}>
                        <Text style={[styles.cellText, styles.cellTextBold]}>{item.name}</Text>
                      </View>
                      <View style={[styles.lgpdCell, { width: LGPD_COL_WIDTHS.apelido }]}>
                        <Text style={styles.cellText}>{item.papel}</Text>
                      </View>
                      <View style={[styles.lgpdCellLast, { width: LGPD_COL_WIDTHS.nascimento }]}>
                        <Text style={styles.cellText}>{getBirthDate(item.id)}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages} • Versão Simplificada (LGPD)`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
