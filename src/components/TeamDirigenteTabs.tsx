"use client";

import React, { useState } from "react";
import { TeamExportButtons } from "./TeamExportButtons";

interface Member {
  id: string;
  type: string;
  subcategory: string;
  teamId: string;
  name: string | null;
  nickname: string | null;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  homePhone: string | null;
  husbandName: string | null;
  husbandNickname?: string | null;
  husbandEmail: string | null;
  husbandBirthDate: string | null;
  husbandPhone: string | null;
  wifeName: string | null;
  wifeNickname?: string | null;
  wifeEmail: string | null;
  wifeBirthDate: string | null;
  wifePhone: string | null;
}

interface TeamDirigenteTabsProps {
  team: {
    id: string;
    name: string;
    members: Member[];
  };
  system: "SEGUEME" | "EJC";
}

function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function TeamDirigenteTabs({ team, system }: TeamDirigenteTabsProps) {
  const subcategoriesOrder =
    system === "EJC"
      ? [
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
        ]
      : [
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

  // Group members by subcategory
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

  const [activeTab, setActiveTab] = useState<string | null>(null);

  const currentTab = activeTab && activeSubcategories.includes(activeTab)
    ? activeTab
    : (activeSubcategories[0] || null);

  if (activeSubcategories.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        Nenhum integrante cadastrado nesta equipe.
      </div>
    );
  }

  const membersList = currentTab ? grouped[currentTab] : [];

  return (
    <div className="space-y-6">
      {/* Tabs visual bar */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
        {activeSubcategories.map((sub) => {
          const isActive = currentTab === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setActiveTab(sub)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all border ${
                isActive
                  ? "bg-gray-800 text-white border-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-sm"
                  : "bg-white hover:bg-gray-150 text-gray-700 border-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-gray-300 dark:border-zinc-800"
              }`}
            >
              {sub} ({grouped[sub].length})
            </button>
          );
        })}
      </div>

      {/* Grid of Members of current Tab */}
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
                      {isJovem
                        ? system === "EJC"
                          ? "Jovem"
                          : `Jovem • ${m.nickname}`
                        : "Casal"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div className="space-y-3">
                {isJovem ? (
                  <div className="text-xs space-y-2 text-gray-650 dark:text-gray-350">
                    {system !== "EJC" && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-16">Nascimento:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{formatDate(m.birthDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 w-16">Telefone:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{m.phone}</span>
                    </div>
                    {system !== "EJC" && m.email && (
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
                      {system !== "EJC" && m.homePhone && (
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
                        <p className="font-bold text-gray-800 dark:text-gray-300 truncate5 flex">Ele ({m.husbandName?.split(" ")[0]})</p>
                        {system !== "EJC" && (
                          <p className="text-gray-500">Nasc: <span className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(m.husbandBirthDate)}</span></p>
                        )}
                        <p className="text-gray-500 truncate">Cel: <span className="font-semibold text-gray-800 dark:text-gray-200">{m.husbandPhone}</span></p>
                      </div>

                      {/* Wife Column */}
                      <div className="p-2 bg-gray-50/20 dark:bg-zinc-850/10 rounded-xl border border-gray-200 dark:border-zinc-800/80 space-y-1.5">
                        <p className="font-bold text-gray-800 dark:text-gray-300 truncate5 flex">Ela ({m.wifeName?.split(" ")[0]})</p>
                        {system !== "EJC" && (
                          <p className="text-gray-500">Nasc: <span className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(m.wifeBirthDate)}</span></p>
                        )}
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
}
