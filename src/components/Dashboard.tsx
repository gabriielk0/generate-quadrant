"use client";

import React, { useState } from "react";
import { TeamModal } from "./TeamModal";
import { MemberForm } from "./MemberForm";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Search, Eye, Lock } from "lucide-react";
import { generateExcelQuadrant } from "@/lib/excel-generator";
import { generateWordQuadrant } from "@/lib/word-generator";
import { PDFExportButtons } from "./PDFExportButtons";


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

interface DashboardProps {
  initialTeams: Team[];
  system?: "SEGUEME" | "EJC";
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

export function Dashboard({ initialTeams, system = "SEGUEME" }: DashboardProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    initialTeams.length > 0 ? initialTeams[0].id : null
  );
  
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"COMPLETA" | "LGPD">("COMPLETA");
  const [searchQuery, setSearchQuery] = useState("");

  // Editing states
  const [editingTeam, setEditingTeam] = useState<{ id: string; name: string } | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);


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
    <div className="flex flex-1 flex-col lg:flex-row h-full min-h-screen bg-gray-50 dark:bg-zinc-950">
      
      {/* Sidebar - Teams List */}
      <aside className="w-full lg:w-80 bg-white dark:bg-zinc-900 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-zinc-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
          {/* Proeminent Back Button to the Main Dashboard */}
          <Link
            href={system === "EJC" ? "/ejc" : "/"}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all border border-gray-300 dark:border-zinc-700 shadow-sm shrink-0 flex items-center justify-center"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {system === "EJC" ? "EJC" : "Segue-me"}
            </h1>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Cadastro e Edição
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTeam(null);
              setIsTeamModalOpen(true);
            }}
            className="ml-auto p-2 text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-750 rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0"
            title="Nova Equipe"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <p className="px-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Equipes ({teams.length})
          </p>
          {teams.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-xs text-gray-400 dark:text-gray-500">Nenhuma equipe criada.</p>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="text-xs font-bold text-gray-800 dark:text-gray-200 hover:underline mt-2"
              >
                Criar primeira equipe
              </button>
            </div>
          ) : (
            teams.map((team) => {
              const isActive = team.id === selectedTeamId;
              return (
                <div
                  key={team.id}
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setIsMemberFormOpen(false);
                    setEditingMember(null);
                  }}
                  className={`w-full px-4 py-3 rounded-xl transition-all flex items-center justify-between cursor-pointer group/item ${
                    isActive
                      ? "bg-gray-800 text-white shadow-md shadow-gray-800/10"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="font-medium truncate mr-2">{team.name}</span>
                  <div className="flex items-center gap-2">
                    {/* Pencil Edit button for Team */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTeam(team);
                      }}
                      className={`p-1.5 rounded-lg transition-all opacity-0 group-hover/item:opacity-100 focus:opacity-100 ${
                        isActive
                          ? "text-gray-300 hover:text-white hover:bg-gray-700"
                          : "text-gray-400 hover:text-gray-700 hover:bg-gray-250 dark:hover:text-gray-250 dark:hover:bg-zinc-700"
                      }`}
                      title="Editar Equipe"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-bold ${
                        isActive
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-150 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {team.members.length}
                    </span>
                  </div>
                </div>
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
            <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-850 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTeam.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Gerencie os integrantes e edite as informações desta equipe.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 dark:bg-zinc-850 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode("COMPLETA")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      viewMode === "COMPLETA"
                        ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-450"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ficha Completa
                  </button>
                  <button
                    onClick={() => setViewMode("LGPD")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      viewMode === "LGPD"
                        ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-450"
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Ficha LGPD (Reduzida)
                  </button>
                </div>

                {/* Excel and Word Export Buttons for Segue-me / EJC Export Buttons */}
                {system === "EJC" ? (
                  <PDFExportButtons teams={[selectedTeam]} system="EJC" />
                ) : (
                  <>
                    {/* Excel Export Button */}
                    <button
                      onClick={async () => {
                        setIsGeneratingExcel(true);
                        try {
                          if (selectedTeam) {
                            await generateExcelQuadrant([selectedTeam]);
                          }
                        } catch (err) {
                          console.error("Erro ao gerar Excel:", err);
                        } finally {
                          setIsGeneratingExcel(false);
                        }
                      }}
                      disabled={isGeneratingExcel}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 ${
                        isGeneratingExcel
                          ? "bg-emerald-300 dark:bg-emerald-900/50 text-emerald-100 cursor-wait"
                          : "bg-emerald-600 hover:bg-emerald-550 text-white"
                      }`}
                      title="Exportar dados desta equipe para planilha Excel"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {isGeneratingExcel ? "Exportando..." : "Exportar Excel"}
                    </button>

                    {/* Word Export Button */}
                    <button
                      onClick={async () => {
                        setIsGeneratingWord(true);
                        try {
                          if (selectedTeam) {
                            await generateWordQuadrant([selectedTeam]);
                          }
                        } catch (err) {
                          console.error("Erro ao gerar Word:", err);
                        } finally {
                          setIsGeneratingWord(false);
                        }
                      }}
                      disabled={isGeneratingWord}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 ${
                        isGeneratingWord
                          ? "bg-blue-300 dark:bg-blue-900/50 text-blue-100 cursor-wait"
                          : "bg-blue-600 hover:bg-blue-550 text-white"
                      }`}
                      title="Exportar dados desta equipe para documento Word"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {isGeneratingWord ? "Exportando..." : "Exportar Word"}
                    </button>
                  </>
                )}

                {!isMemberFormOpen && (
                  <button
                    onClick={() => {
                      setEditingMember(null);
                      setIsMemberFormOpen(true);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 active:scale-95 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Integrante
                  </button>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
              
              {/* Dynamic Add/Edit Member Form */}
              {isMemberFormOpen && (
                <div className="max-w-4xl mx-auto transition-all duration-300">
                  <MemberForm
                    teamId={selectedTeam.id}
                    teamName={selectedTeam.name}
                    editingMember={editingMember || undefined}
                    system={system}
                    onCancel={() => {
                      setIsMemberFormOpen(false);
                      setEditingMember(null);
                    }}
                    onSuccess={() => {
                      setIsMemberFormOpen(false);
                      setEditingMember(null);
                    }}
                  />
                </div>
              )}

              {/* Members Display */}
              {!isMemberFormOpen && (
                <div className="space-y-6">
                  {/* Search input */}
                  <div className="w-full max-w-md relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-450">
                      <Search className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Pesquisar integrantes da equipe..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {selectedTeam.members.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900/50 max-w-xl mx-auto mt-6">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-450">
                        <Search className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Nenhum integrante cadastrado</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                        Adicione novos jovens ou casais a esta equipe para montar o quadrante.
                      </p>
                      <button
                        onClick={() => setIsMemberFormOpen(true)}
                        className="mt-5 px-5 py-2.5 text-xs font-semibold text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Integrante
                      </button>
                    </div>
                  ) : viewMode === "COMPLETA" ? (
                    /* VIEW: COMPLETA (Grouped by Subcategory) */
                    <div className="space-y-10">
                      {Object.entries(getGroupedMembers(selectedTeam.members)).map(([sub, list]) => (
                        <div key={sub} className="space-y-4">
                          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-150 dark:border-zinc-850 pb-2">
                            {sub} ({list.length})
                          </h3>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {list.map((m) => {
                              const isJovem = m.type === "JOVEM";
                              return (
                                <div
                                  key={m.id}
                                  className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700"
                                >
                                  {/* Card Header */}
                                  <div className="flex items-start justify-between mb-4 gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
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
                                      <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                                          {isJovem ? m.name : `${m.husbandName} & ${m.wifeName}`}
                                        </h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                          {isJovem ? `Jovem • ${m.nickname}` : "Casal"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Action Buttons & Tag */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      {/* Edit Member button */}
                                      <button
                                        onClick={() => {
                                          setEditingMember(m);
                                          setIsMemberFormOpen(true);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-all"
                                        title="Editar Integrante"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700">
                                        {isJovem ? "Solteiro" : "Casal"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Card Content */}
                                  <div className="space-y-4 flex-1">
                                    {isJovem ? (
                                      /* Jovem Details */
                                      <div className="space-y-2.5 text-xs text-gray-650 dark:text-gray-350">
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-400 w-16">Nascimento:</span>
                                          <span className="font-semibold text-gray-900 dark:text-gray-150">{formatDate(m.birthDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-400 w-16">Telefone:</span>
                                          <span className="font-semibold text-gray-900 dark:text-gray-150">{m.phone}</span>
                                        </div>
                                        {m.email && (
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-gray-400 w-16">E-mail:</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-150 truncate" title={m.email}>{m.email}</span>
                                          </div>
                                        )}
                                        <div className="flex items-start gap-1 pt-2 border-t border-gray-100 dark:border-zinc-850">
                                          <span className="text-gray-400 shrink-0">Endereço:</span>
                                          <span className="font-medium text-gray-800 dark:text-gray-300 leading-tight">{m.address}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Casal Details */
                                      <div className="space-y-4">
                                        {/* Shared info block */}
                                        <div className="bg-gray-50/50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-gray-200/60 dark:border-zinc-850 text-xs space-y-1.5 text-gray-650 dark:text-gray-350">
                                          <div className="flex items-start gap-1">
                                            <span className="text-gray-400 shrink-0">End:</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200 leading-tight">{m.address}</span>
                                          </div>
                                          {m.homePhone && (
                                            <div className="flex items-center gap-1">
                                              <span className="text-gray-400">Fone Fixo:</span>
                                              <span className="font-semibold text-gray-800 dark:text-gray-200">{m.homePhone}</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Individual columns */}
                                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                                          {/* Husband Details */}
                                          <div className="p-2.5 bg-gray-50/20 dark:bg-zinc-850/10 rounded-xl border border-gray-200/50 dark:border-zinc-800/80 space-y-1.5">
                                            <p className="font-bold text-gray-800 dark:text-gray-350 truncate">Ele ({m.husbandName?.split(" ")[0]})</p>
                                            <p className="text-gray-500">Nasc: <span className="font-semibold text-gray-800 dark:text-gray-205">{formatDate(m.husbandBirthDate)}</span></p>
                                            <p className="text-gray-500 truncate">Cel: <span className="font-semibold text-gray-800 dark:text-gray-205">{m.husbandPhone}</span></p>
                                            {m.husbandEmail && <p className="text-gray-500 truncate" title={m.husbandEmail}>Email: <span className="font-semibold text-gray-800 dark:text-gray-205">{m.husbandEmail}</span></p>}
                                          </div>

                                          {/* Wife Details */}
                                          <div className="p-2.5 bg-gray-50/20 dark:bg-zinc-850/10 rounded-xl border border-gray-200/50 dark:border-zinc-800/80 space-y-1.5">
                                            <p className="font-bold text-gray-800 dark:text-gray-350 truncate">Ela ({m.wifeName?.split(" ")[0]})</p>
                                            <p className="text-gray-500">Nasc: <span className="font-semibold text-gray-800 dark:text-gray-205">{formatDate(m.wifeBirthDate)}</span></p>
                                            <p className="text-gray-500 truncate">Cel: <span className="font-semibold text-gray-800 dark:text-gray-205">{m.wifePhone}</span></p>
                                            {m.wifeEmail && <p className="text-gray-500 truncate" title={m.wifeEmail}>Email: <span className="font-semibold text-gray-800 dark:text-gray-205">{m.wifeEmail}</span></p>}
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
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-950/20 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-2">
                        <Lock className="h-4.5 w-4.5 text-gray-500" />
                        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Registros Nivelados (LGPD)
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-950/40 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-zinc-800">
                              <th className="px-6 py-4">Nome Completo</th>
                              <th className="px-6 py-4">Apelido / Papel</th>
                              <th className="px-6 py-4">Subcategoria (Equipe)</th>
                              <th className="px-6 py-4">Data de Nascimento</th>
                              <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150 dark:divide-zinc-850 text-sm">
                            {getLGPDMembers(selectedTeam.members).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                                  Nenhum resultado encontrado para a pesquisa.
                                </td>
                              </tr>
                            ) : (
                              getLGPDMembers(selectedTeam.members).map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-150">
                                    {item.name}
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {item.roleOrNickname}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-zinc-700">
                                      {item.subcategory}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                                    {formatDate(item.birthDate)}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => {
                                        const baseId = item.id.replace("-ele", "").replace("-ela", "");
                                        const original = selectedTeam.members.find((m) => m.id === baseId);
                                        if (original) {
                                          setEditingMember(original);
                                          setIsMemberFormOpen(true);
                                        }
                                      }}
                                      className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 dark:hover:text-gray-250 dark:hover:bg-zinc-800 rounded-lg transition-all inline-flex items-center gap-1"
                                      title="Editar Integrante"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      <span className="text-xs font-medium">Editar</span>
                                    </button>
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-zinc-950">
            <div className="w-16 h-16 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center shadow-sm mb-4 text-gray-450">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Nenhuma Equipe Selecionada</h3>
            <p className="text-xs text-gray-500 dark:text-gray-450 mt-1 max-w-sm">
              Crie uma equipe na barra lateral ou selecione uma equipe existente para gerenciar os participantes do {system === "EJC" ? "EJC" : "Segue-me"}.
            </p>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="mt-6 px-5 py-2.5 text-xs font-semibold text-white bg-gray-800 hover:bg-gray-700 active:scale-95 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Nova Equipe
            </button>
          </div>
        )}
      </main>

      {/* Team Modal */}
      <TeamModal
        isOpen={isTeamModalOpen || !!editingTeam}
        editingTeam={editingTeam || undefined}
        system={system}
        onClose={() => {
          setIsTeamModalOpen(false);
          setEditingTeam(null);
        }}
      />
    </div>
  );
}
