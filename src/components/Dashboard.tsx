"use client";

import React, { useState } from "react";
import { TeamModal } from "./TeamModal";
import { MemberForm } from "./MemberForm";

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

interface DashboardProps {
  initialTeams: Team[];
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

export function Dashboard({ initialTeams }: DashboardProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    initialTeams.length > 0 ? initialTeams[0].id : null
  );
  
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"COMPLETA" | "LGPD">("COMPLETA");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync state with props when Server Component updates
  React.useEffect(() => {
    setTeams(initialTeams);
    if (initialTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(initialTeams[0].id);
    }
  }, [initialTeams]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  // Group members of the selected team by subcategory
  const getGroupedMembers = (members: Member[]) => {
    const filtered = members.filter((m) => {
      const search = searchQuery.toLowerCase().trim();
      if (!search) return true;

      if (m.type === "JOVEM") {
        return (
          m.name?.toLowerCase().includes(search) ||
          m.nickname?.toLowerCase().includes(search) ||
          m.email?.toLowerCase().includes(search) ||
          m.address?.toLowerCase().includes(search)
        );
      } else {
        return (
          m.husbandName?.toLowerCase().includes(search) ||
          m.wifeName?.toLowerCase().includes(search) ||
          m.husbandEmail?.toLowerCase().includes(search) ||
          m.wifeEmail?.toLowerCase().includes(search) ||
          m.address?.toLowerCase().includes(search)
        );
      }
    });

    const groups: Record<string, Member[]> = {};
    filtered.forEach((m) => {
      if (!groups[m.subcategory]) {
        groups[m.subcategory] = [];
      }
      groups[m.subcategory].push(m);
    });

    return groups;
  };

  // Flatten members for LGPD list view (Name, Role/Nickname, Birth Date)
  const getLGPDMembers = (members: Member[]) => {
    const list: { id: string; name: string; roleOrNickname: string; birthDate: Date | string | null; subcategory: string }[] = [];
    
    members.forEach((m) => {
      if (m.type === "JOVEM") {
        list.push({
          id: m.id,
          name: m.name || "",
          roleOrNickname: m.nickname || "Jovem",
          birthDate: m.birthDate,
          subcategory: m.subcategory,
        });
      } else {
        if (m.husbandName) {
          list.push({
            id: `${m.id}-ele`,
            name: m.husbandName,
            roleOrNickname: "Esposo",
            birthDate: m.husbandBirthDate,
            subcategory: m.subcategory,
          });
        }
        if (m.wifeName) {
          list.push({
            id: `${m.id}-ela`,
            name: m.wifeName,
            roleOrNickname: "Esposa",
            birthDate: m.wifeBirthDate,
            subcategory: m.subcategory,
          });
        }
      }
    });

    // Apply search filter
    const search = searchQuery.toLowerCase().trim();
    if (!search) return list;

    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.roleOrNickname.toLowerCase().includes(search) ||
        item.subcategory.toLowerCase().includes(search)
    );
  };

  return (
    <div className="flex flex-1 flex-col lg:flex-row h-full min-h-screen bg-zinc-50 dark:bg-zinc-950">
      
      {/* Sidebar - Teams List */}
      <aside className="w-full lg:w-80 bg-white dark:bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Segue-me
            </h1>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-0.5">
              Gestão de Quadrantes
            </p>
          </div>
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="p-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="Nova Equipe"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <p className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Equipes ({teams.length})
          </p>
          {teams.length === 0 ? (
            <div className="p-4 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">Nenhuma equipe criada.</p>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-2 underline"
              >
                Criar primeira equipe
              </button>
            </div>
          ) : (
            teams.map((team) => {
              const isActive = team.id === selectedTeamId;
              return (
                <button
                  key={team.id}
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setIsMemberFormOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="font-medium truncate mr-2">{team.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold ${
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {team.members.length}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedTeam ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {selectedTeam.name}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Gerencie os integrantes e visualize a ficha da equipe.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode("COMPLETA")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      viewMode === "COMPLETA"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ficha Completa
                  </button>
                  <button
                    onClick={() => setViewMode("LGPD")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      viewMode === "LGPD"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Ficha LGPD (Reduzida)
                  </button>
                </div>

                {!isMemberFormOpen && (
                  <button
                    onClick={() => setIsMemberFormOpen(true)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Integrante
                  </button>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
              
              {/* Dynamic Add Member Form (inline slide-over effect) */}
              {isMemberFormOpen && (
                <div className="max-w-4xl mx-auto transition-all duration-300">
                  <MemberForm
                    teamId={selectedTeam.id}
                    teamName={selectedTeam.name}
                    onCancel={() => setIsMemberFormOpen(false)}
                    onSuccess={() => {
                      setIsMemberFormOpen(false);
                    }}
                  />
                </div>
              )}

              {/* Members Display */}
              {!isMemberFormOpen && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="w-full max-w-md relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Pesquisar integrantes da equipe..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {selectedTeam.members.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-zinc-150 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900/50 max-w-xl mx-auto mt-6">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-450">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-250">Nenhum integrante cadastrado</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                        Adicione novos jovens ou casais a esta equipe para montar o quadrante.
                      </p>
                      <button
                        onClick={() => setIsMemberFormOpen(true)}
                        className="mt-5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Adicionar Integrante
                      </button>
                    </div>
                  ) : viewMode === "COMPLETA" ? (
                    /* VIEW: COMPLETA (Grouped by Subcategory) */
                    <div className="space-y-10">
                      {Object.entries(getGroupedMembers(selectedTeam.members)).map(([sub, list]) => (
                        <div key={sub} className="space-y-4">
                          <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                            {sub} ({list.length})
                          </h3>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {list.map((m) => {
                              const isJovem = m.type === "JOVEM";
                              return (
                                <div
                                  key={m.id}
                                  className={`rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col transition-all hover:shadow-md ${
                                    isJovem
                                      ? "border-emerald-100 dark:border-emerald-950/30 hover:border-emerald-200"
                                      : "border-indigo-100 dark:border-indigo-950/30 hover:border-indigo-200"
                                  }`}
                                >
                                  {/* Card Header */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                          isJovem
                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450"
                                            : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-450"
                                        }`}
                                      >
                                        {isJovem ? (
                                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        ) : (
                                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-zinc-50">
                                          {isJovem ? m.name : `${m.husbandName} & ${m.wifeName}`}
                                        </h4>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                                          {isJovem ? `Jovem • ${m.nickname}` : "Casal"}
                                        </p>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                        isJovem
                                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                          : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400"
                                      }`}
                                    >
                                      {isJovem ? "Solteiro" : "Casal"}
                                    </span>
                                  </div>

                                  {/* Card Content */}
                                  <div className="space-y-4 flex-1">
                                    {isJovem ? (
                                      /* Jovem Details */
                                      <div className="space-y-2.5 text-sm text-zinc-650 dark:text-zinc-350">
                                        <div className="flex items-center gap-2">
                                          <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          <span>Nascimento: <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatDate(m.birthDate)}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                          <span>Telefone: <span className="font-medium text-zinc-900 dark:text-zinc-100">{m.phone}</span></span>
                                        </div>
                                        {m.email && (
                                          <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="truncate">E-mail: <span className="font-medium text-zinc-900 dark:text-zinc-100">{m.email}</span></span>
                                          </div>
                                        )}
                                        <div className="flex items-start gap-2 pt-1.5 border-t border-zinc-50 dark:border-zinc-800/80">
                                          <svg className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                          <span className="leading-tight">Endereço: <span className="font-medium text-zinc-850 dark:text-zinc-200">{m.address}</span></span>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Casal Details */
                                      <div className="space-y-4">
                                        {/* Shared info block */}
                                        <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-850 text-sm space-y-2">
                                          <div className="flex items-start gap-2 text-zinc-650 dark:text-zinc-350">
                                            <svg className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="leading-tight">Endereço: <span className="font-medium text-zinc-800 dark:text-zinc-200">{m.address}</span></span>
                                          </div>
                                          {m.homePhone && (
                                            <div className="flex items-center gap-2 text-zinc-650 dark:text-zinc-350">
                                              <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                              </svg>
                                              <span>Fone Fixo: <span className="font-medium text-zinc-800 dark:text-zinc-200">{m.homePhone}</span></span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Individual columns */}
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                          {/* Husband Details */}
                                          <div className="p-3 bg-blue-50/20 dark:bg-blue-950/10 rounded-xl border border-blue-100/50 dark:border-blue-900/10 space-y-2">
                                            <p className="font-bold text-blue-700 dark:text-blue-400">Ele ({m.husbandName?.split(" ")[0]})</p>
                                            <p className="text-zinc-500 dark:text-zinc-400">Nasc: <span className="font-semibold text-zinc-850 dark:text-zinc-200">{formatDate(m.husbandBirthDate)}</span></p>
                                            <p className="text-zinc-500 dark:text-zinc-400 truncate">Cel: <span className="font-semibold text-zinc-850 dark:text-zinc-200">{m.husbandPhone}</span></p>
                                            {m.husbandEmail && <p className="text-zinc-500 dark:text-zinc-400 truncate" title={m.husbandEmail}>Email: <span className="font-semibold text-zinc-850 dark:text-zinc-200">{m.husbandEmail}</span></p>}
                                          </div>

                                          {/* Wife Details */}
                                          <div className="p-3 bg-pink-50/20 dark:bg-pink-950/10 rounded-xl border border-pink-100/50 dark:border-pink-900/10 space-y-2">
                                            <p className="font-bold text-pink-700 dark:text-pink-400">Ela ({m.wifeName?.split(" ")[0]})</p>
                                            <p className="text-zinc-500 dark:text-zinc-400">Nasc: <span className="font-semibold text-zinc-850 dark:text-zinc-200">{formatDate(m.wifeBirthDate)}</span></p>
                                            <p className="text-zinc-500 dark:text-zinc-400 truncate">Cel: <span className="font-semibold text-zinc-850 dark:text-zinc-200">{m.wifePhone}</span></p>
                                            {m.wifeEmail && <p className="text-zinc-500 dark:text-zinc-400 truncate" title={m.wifeEmail}>Email: <span className="font-semibold text-zinc-850 dark:text-zinc-200">{m.wifeEmail}</span></p>}
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
                      ))}
                    </div>
                  ) : (
                    /* VIEW: LGPD (Reduced Tabular Grid) */
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                        <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                          Registros Nivelados (LGPD)
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-950/40 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800">
                              <th className="px-6 py-4">Nome Completo</th>
                              <th className="px-6 py-4">Apelido / Papel</th>
                              <th className="px-6 py-4">Subcategoria (Equipe)</th>
                              <th className="px-6 py-4">Data de Nascimento</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-sm">
                            {getLGPDMembers(selectedTeam.members).length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-zinc-400 dark:text-zinc-500">
                                  Nenhum resultado encontrado para a pesquisa.
                                </td>
                              </tr>
                            ) : (
                              getLGPDMembers(selectedTeam.members).map((item) => (
                                <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                                    {item.name}
                                  </td>
                                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                    {item.roleOrNickname}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg">
                                      {item.subcategory}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                                    {formatDate(item.birthDate)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-950">
            <div className="w-16 h-16 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center shadow-sm mb-4 text-zinc-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Nenhuma Equipe Selecionada</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-450 mt-1 max-w-sm">
              Crie uma equipe na barra lateral ou selecione uma equipe existente para gerenciar os participantes do Segue-me.
            </p>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Criar Nova Equipe
            </button>
          </div>
        )}
      </main>

      {/* Team Modal */}
      <TeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} />
    </div>
  );
}
