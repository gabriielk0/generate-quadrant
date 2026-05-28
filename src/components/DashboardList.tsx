import React from "react";
import { db } from "@/lib/db";
import { PDFExportButtons } from "./PDFExportButtons";
import Link from "next/link";

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

export async function DashboardList({ system = "SEGUEME" }: { system?: "SEGUEME" | "EJC" }) {
  // 1. Fetch teams with their members ordered alphabetically by team name
  const teams = await db.team.findMany({
    where: {
      system,
    },
    include: {
      members: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // 2. Serialize Date objects to ISO strings for Safe Client/Server Component communication
  const serializedTeams = teams.map((team) => ({
    id: team.id,
    name: team.name,
    members: team.members.map((member) => ({
      id: member.id,
      type: member.type,
      subcategory: member.subcategory,
      teamId: member.teamId,
      name: member.name,
      nickname: member.nickname,
      birthDate: member.birthDate ? member.birthDate.toISOString() : null,
      phone: member.phone,
      email: member.email,
      address: member.address,
      homePhone: member.homePhone,
      husbandName: member.husbandName,
      husbandNickname: member.husbandNickname,
      husbandEmail: member.husbandEmail,
      husbandBirthDate: member.husbandBirthDate ? member.husbandBirthDate.toISOString() : null,
      husbandPhone: member.husbandPhone,
      wifeName: member.wifeName,
      wifeNickname: member.wifeNickname,
      wifeEmail: member.wifeEmail,
      wifeBirthDate: member.wifeBirthDate ? member.wifeBirthDate.toISOString() : null,
      wifePhone: member.wifePhone,
    })),
  }));

  // Hierarchical order for subcategories
  const subcategoriesOrder = [
    "Casal coordenador",
    "Casal apoio",
    "Casais membros",
    "Jovens coordenadores",
    "Jovens apoio",
    "Jovens membros",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <header className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {system === "EJC" ? "EJC - Quadrantes" : "Segue-me - Quadrantes"}
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Visualização unificada de todas as equipes, integrantes e exportação para PDF do {system === "EJC" ? "EJC" : "Segue-me"}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* Toggle button to CRUD view */}
            <Link
              href={system === "EJC" ? "/ejc?view=manage" : "/?view=manage"}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gerenciar Cadastro
            </Link>

            {/* Client Export Buttons */}
            <PDFExportButtons teams={serializedTeams} system={system} />
          </div>
        </header>

        {/* Content Body: Teams Accordion */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 px-1">
            Equipes do Encontro ({serializedTeams.length})
          </h2>

          {serializedTeams.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-gray-250 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-3xl max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-gray-450">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Nenhuma equipe criada</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Cadastre a primeira equipe e adicione integrantes para poder visualizar o Quadrante.
              </p>
              <Link
                href={system === "EJC" ? "/ejc?view=manage" : "/?view=manage"}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-all shadow-md shadow-gray-800/10"
              >
                Cadastrar Nova Equipe
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {serializedTeams.map((team) => {
                // Group members by subcategory
                const grouped: Record<string, typeof team.members> = {};
                team.members.forEach((m) => {
                  if (!grouped[m.subcategory]) {
                    grouped[m.subcategory] = [];
                  }
                  grouped[m.subcategory].push(m);
                });

                // Get subcategories that have members, sorted with custom ones at the end
                const activeSubcategories = Object.keys(grouped).sort((a, b) => {
                  const idxA = subcategoriesOrder.indexOf(a);
                  const idxB = subcategoriesOrder.indexOf(b);
                  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                  if (idxA !== -1) return -1;
                  if (idxB !== -1) return 1;
                  return a.localeCompare(b);
                });

                return (
                  <details
                    key={team.id}
                    className="group border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm transition-all duration-200 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer select-none font-bold text-lg md:text-xl text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-zinc-800/20 list-none">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <span>{team.name}</span>
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block mt-0.5">
                            {team.members.length} {team.members.length === 1 ? "integrante" : "integrantes"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl group-open:hidden border border-gray-200 dark:border-zinc-700">
                          Expandir
                        </span>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl hidden group-open:inline border border-gray-150 dark:border-zinc-755">
                          Recolher
                        </span>
                        <svg
                          className="h-5 w-5 text-gray-400 transform group-open:rotate-180 transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </summary>

                    <div className="p-6 border-t border-gray-150 dark:border-zinc-850 bg-gray-50/10 dark:bg-zinc-950/10 space-y-10">
                      {activeSubcategories.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                          Nenhum integrante cadastrado nesta equipe.
                        </div>
                      ) : (
                        activeSubcategories.map((sub) => {
                          const membersList = grouped[sub];
                          return (
                            <div key={sub} className="space-y-4">
                              {/* Subcategory Label */}
                              <div className="flex items-center gap-3">
                                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                  {sub}
                                </h3>
                                <span className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                                  {membersList.length}
                                </span>
                              </div>

                              {/* Members Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {membersList.map((m) => {
                                  const isJovem = m.type === "JOVEM";
                                  return (
                                    <div
                                      key={m.id}
                                      className="rounded-2xl border border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md transition-all hover:border-gray-300 dark:hover:border-zinc-700 flex flex-col justify-between"
                                    >
                                      {/* Header of member card */}
                                      <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                                            {isJovem ? (
                                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                              </svg>
                                            ) : (
                                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                              </svg>
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-50 truncate text-sm">
                                              {isJovem ? m.name : `${m.husbandName} & ${m.wifeName}`}
                                            </h4>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                                              {isJovem ? `Jovem • ${m.nickname}` : "Casal"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Content Details */}
                                      <div className="space-y-3">
                                        {isJovem ? (
                                          <div className="text-xs space-y-2 text-gray-650 dark:text-gray-350">
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400 w-16">Nascimento:</span>
                                              <span className="font-bold text-gray-900 dark:text-gray-100">{formatDate(m.birthDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400 w-16">Telefone:</span>
                                              <span className="font-bold text-gray-900 dark:text-gray-100">{m.phone}</span>
                                            </div>
                                            {m.email && (
                                              <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-gray-400 w-16">E-mail:</span>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 truncate" title={m.email}>{m.email}</span>
                                              </div>
                                            )}
                                            <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-2 flex items-start gap-1">
                                              <span className="text-gray-400 shrink-0">End:</span>
                                              <span className="font-medium text-gray-800 dark:text-gray-200 leading-tight">{m.address}</span>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="space-y-3.5">
                                            {/* Shared Info */}
                                            <div className="bg-gray-50/50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800/60 text-xs space-y-1.5 text-gray-650 dark:text-gray-350">
                                              <div className="flex items-start gap-1">
                                                <span className="text-gray-400 shrink-0">End:</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200 leading-tight">{m.address}</span>
                                              </div>
                                              {m.homePhone && (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-gray-400">Fixo:</span>
                                                  <span className="font-semibold text-gray-800 dark:text-gray-200">{m.homePhone}</span>
                                                </div>
                                              )}
                                            </div>

                                            {/* Husband / Wife Grid */}
                                            <div className="grid grid-cols-2 gap-3 text-[11px]">
                                              {/* Husband Column */}
                                              <div className="p-2 bg-gray-50/20 dark:bg-zinc-850/10 rounded-xl border border-gray-200 dark:border-zinc-800/80 space-y-1.5">
                                                <p className="font-bold text-gray-800 dark:text-gray-300 truncate">Ele ({m.husbandName?.split(" ")[0]})</p>
                                                <p className="text-gray-500">Nasc: <span className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(m.husbandBirthDate)}</span></p>
                                                <p className="text-gray-500 truncate">Cel: <span className="font-semibold text-gray-800 dark:text-gray-200">{m.husbandPhone}</span></p>
                                              </div>

                                              {/* Wife Column */}
                                              <div className="p-2 bg-gray-50/20 dark:bg-zinc-850/10 rounded-xl border border-gray-200 dark:border-zinc-800/80 space-y-1.5">
                                                <p className="font-bold text-gray-800 dark:text-gray-300 truncate">Ela ({m.wifeName?.split(" ")[0]})</p>
                                                <p className="text-gray-500">Nasc: <span className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(m.wifeBirthDate)}</span></p>
                                                <p className="text-gray-500 truncate">Cel: <span className="font-semibold text-gray-800 dark:text-gray-200">{m.wifePhone}</span></p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
