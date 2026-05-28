"use client";

import React, { useState, useEffect } from "react";
import { createMember, updateMember } from "@/actions/member-actions";

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

interface MemberFormProps {
  teamId: string;
  teamName: string;
  editingMember?: Member;
  onCancel: () => void;
  onSuccess: () => void;
  system?: "SEGUEME" | "EJC";
}

export function MemberForm({
  teamId,
  teamName,
  editingMember,
  onCancel,
  onSuccess,
  system = "SEGUEME",
}: MemberFormProps) {
  const [type, setType] = useState<"JOVEM" | "CASAL">("JOVEM");
  const [subcategory, setSubcategory] = useState("");
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState("");
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Subcategory options based on member type (fixed options + "Outro")
  const subcategoryOptions = {
    JOVEM: [
      { value: "Jovens membros", label: "Jovem Membro" },
      { value: "Jovens apoio", label: "Jovem Apoio" },
      { value: "Jovens coordenadores", label: "Jovem Coordenador" },
      { value: "Outro", label: "Outro (Digitar)" },
    ],
    CASAL: [
      { value: "Casais membros", label: "Casal Membro" },
      { value: "Casal apoio", label: "Casal Apoio" },
      { value: "Casal coordenador", label: "Casal Coordenador" },
      { value: "Casal tesoureiro", label: "Casal Tesoureiro" },
      { value: "Outro", label: "Outro (Digitar)" },
    ],
  };

  // Jovem Form State
  const [jovemData, setJovemData] = useState({
    name: "",
    nickname: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
  });

  // Casal Form State
  const [casalData, setCasalData] = useState({
    address: "",
    homePhone: "",
    husbandName: "",
    husbandNickname: "",
    husbandEmail: "",
    husbandBirthDate: "",
    husbandPhone: "",
    wifeName: "",
    wifeNickname: "",
    wifeEmail: "",
    wifeBirthDate: "",
    wifePhone: "",
  });

  // Initialize or Sync form state with editingMember
  useEffect(() => {
    if (editingMember) {
      const memberType = editingMember.type as "JOVEM" | "CASAL";
      setType(memberType);

      // Check if subcategory is in standard list
      const standardValues = subcategoryOptions[memberType].map((o) => o.value);
      const isCustom = !standardValues.includes(editingMember.subcategory);

      if (isCustom) {
        setSubcategory("Outro");
        setIsCustomSubcategory(true);
        setCustomSubcategory(editingMember.subcategory);
      } else {
        setSubcategory(editingMember.subcategory);
        setIsCustomSubcategory(false);
        setCustomSubcategory("");
      }

      if (memberType === "JOVEM") {
        setJovemData({
          name: editingMember.name || "",
          nickname: editingMember.nickname || "",
          birthDate: editingMember.birthDate
            ? new Date(editingMember.birthDate).toISOString().split("T")[0]
            : "",
          phone: editingMember.phone || "",
          email: editingMember.email || "",
          address: editingMember.address || "",
        });
      } else {
        setCasalData({
          address: editingMember.address || "",
          homePhone: editingMember.homePhone || "",
          husbandName: editingMember.husbandName || "",
          husbandNickname: (editingMember as any).husbandNickname || "",
          husbandEmail: editingMember.husbandEmail || "",
          husbandBirthDate: editingMember.husbandBirthDate
            ? new Date(editingMember.husbandBirthDate).toISOString().split("T")[0]
            : "",
          husbandPhone: editingMember.husbandPhone || "",
          wifeName: editingMember.wifeName || "",
          wifeNickname: (editingMember as any).wifeNickname || "",
          wifeEmail: editingMember.wifeEmail || "",
          wifeBirthDate: editingMember.wifeBirthDate
            ? new Date(editingMember.wifeBirthDate).toISOString().split("T")[0]
            : "",
          wifePhone: editingMember.wifePhone || "",
        });
      }
    } else {
      // Default reset
      const defaultType = "JOVEM";
      setType(defaultType);
      setSubcategory(subcategoryOptions[defaultType][0].value);
      setIsCustomSubcategory(false);
      setCustomSubcategory("");
      setJovemData({
        name: "",
        nickname: "",
        birthDate: "",
        phone: "",
        email: "",
        address: "",
      });
      setCasalData({
        address: "",
        homePhone: "",
        husbandName: "",
        husbandNickname: "",
        husbandEmail: "",
        husbandBirthDate: "",
        husbandPhone: "",
        wifeName: "",
        wifeNickname: "",
        wifeEmail: "",
        wifeBirthDate: "",
        wifePhone: "",
      });
    }
    setError(null);
    setFieldErrors({});
  }, [editingMember]);

  const handleTypeChange = (newType: "JOVEM" | "CASAL") => {
    setType(newType);
    setSubcategory(subcategoryOptions[newType][0].value);
    setIsCustomSubcategory(false);
    setCustomSubcategory("");
    setError(null);
    setFieldErrors({});
  };

  const handleSubcategorySelect = (val: string) => {
    setSubcategory(val);
    if (val === "Outro") {
      setIsCustomSubcategory(true);
      setCustomSubcategory("");
    } else {
      setIsCustomSubcategory(false);
      setCustomSubcategory("");
    }
  };

  const handleJovemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJovemData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleCasalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCasalData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setFieldErrors({});

    const finalSubcategory = isCustomSubcategory ? customSubcategory : subcategory;

    if (isCustomSubcategory && !customSubcategory.trim()) {
      setError("Por favor, digite a subcategoria personalizada.");
      setIsPending(false);
      return;
    }

    const dataToSend = type === "JOVEM" ? jovemData : casalData;
    
    const res = editingMember
      ? await updateMember(editingMember.id, type, finalSubcategory, dataToSend)
      : await createMember(teamId, type, finalSubcategory, dataToSend);

    setIsPending(false);

    if (res?.error) {
      setError(res.error);
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
    } else {
      // Clear forms if creating
      if (!editingMember) {
        setJovemData({
          name: "",
          nickname: "",
          birthDate: "",
          phone: "",
          email: "",
          address: "",
        });
        setCasalData({
          address: "",
          homePhone: "",
          husbandName: "",
          husbandNickname: "",
          husbandEmail: "",
          husbandBirthDate: "",
          husbandPhone: "",
          wifeName: "",
          wifeNickname: "",
          wifeEmail: "",
          wifeBirthDate: "",
          wifePhone: "",
        });
      }
      onSuccess();
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-950/20 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">
            {editingMember ? "Editar Integrante" : "Adicionar Integrante"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Equipe: <span className="font-semibold text-gray-800 dark:text-gray-200">{teamName}</span>
          </p>
        </div>
        <button
          onClick={onCancel}
          type="button"
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Toggle Jovem vs Casal */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Tipo de Integrante
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange("JOVEM")}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === "JOVEM"
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-950 dark:text-gray-450"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Jovem
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("CASAL")}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === "CASAL"
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-950 dark:text-gray-450"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Casal
            </button>
          </div>
        </div>

        {/* Subcategory Select & Manual Custom Field */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="subcategory" className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Subcategoria (Função)
            </label>
            <select
              id="subcategory"
              value={subcategory}
              onChange={(e) => handleSubcategorySelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-xs md:text-sm"
            >
              {subcategoryOptions[type].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isCustomSubcategory && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <label htmlFor="custom-subcategory" className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Digite a Função Manualmente
              </label>
              <input
                id="custom-subcategory"
                type="text"
                value={customSubcategory}
                onChange={(e) => setCustomSubcategory(e.target.value)}
                placeholder="Ex: Casal Padrinho, Jovens Palestrantes"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs md:text-sm"
              />
            </div>
          )}
        </div>

        <hr className="border-gray-200 dark:border-zinc-800" />

        {error && (
          <div className="p-4 bg-gray-100 dark:bg-zinc-800/40 border border-gray-300 dark:border-zinc-700/60 rounded-xl text-xs text-gray-800 dark:text-gray-300 font-medium">
            {error}
          </div>
        )}

        {/* DYNAMIC FORM FIELDS */}
        <div className="transition-all duration-300">
          {type === "JOVEM" ? (
            /* JOVEM FORM FIELDS */
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={jovemData.name}
                    onChange={handleJovemChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    placeholder="Nome completo"
                  />
                  {fieldErrors.name && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="nickname" className="text-xs font-medium text-gray-700 dark:text-gray-300">Apelido</label>
                  <input
                    id="nickname"
                    type="text"
                    name="nickname"
                    value={jovemData.nickname}
                    onChange={handleJovemChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    placeholder="Como prefere ser chamado"
                  />
                  {fieldErrors.nickname && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.nickname[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="birthDate" className="text-xs font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={jovemData.birthDate}
                    onChange={handleJovemChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                  />
                  {fieldErrors.birthDate && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.birthDate[0]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="text-xs font-medium text-gray-700 dark:text-gray-300">Telefone / Celular</label>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={jovemData.phone}
                    onChange={handleJovemChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                  />
                  {fieldErrors.phone && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.phone[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={jovemData.email}
                  onChange={handleJovemChange}
                  placeholder="jovem@email.com"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                />
                {fieldErrors.email && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.email[0]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="address" className="text-xs font-medium text-gray-700 dark:text-gray-300">Endereço Completo</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={jovemData.address}
                  onChange={handleJovemChange}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                />
                {fieldErrors.address && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.address[0]}</p>
                )}
              </div>
            </div>
          ) : (
            /* CASAL FORM FIELDS */
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
              {/* Shared Fields */}
              <div className="bg-gray-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-gray-200 dark:border-zinc-800/80 space-y-4">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dados Compartilhados do Casal
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="casal-address" className="text-xs font-medium text-gray-700 dark:text-gray-300">Endereço Completo</label>
                    <input
                      id="casal-address"
                      type="text"
                      name="address"
                      value={casalData.address}
                      onChange={handleCasalChange}
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.address && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.address[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="homePhone" className="text-xs font-medium text-gray-700 dark:text-gray-300">Telefone Residencial</label>
                    <input
                      id="homePhone"
                      type="text"
                      name="homePhone"
                      value={casalData.homePhone}
                      onChange={handleCasalChange}
                      placeholder="(00) 0000-0000"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.homePhone && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.homePhone[0]}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Side-by-side Columns for Ele / Ela */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ELE (Esposo) */}
                <div className="bg-gray-50/20 dark:bg-zinc-900/10 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800/80 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                      <span className="text-gray-700 dark:text-gray-300 text-xs font-bold">Ele</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Dados do Esposo</h4>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="husbandName" className="text-xs font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                    <input
                      id="husbandName"
                      type="text"
                      name="husbandName"
                      value={casalData.husbandName}
                      onChange={handleCasalChange}
                      placeholder="Nome dele"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.husbandName && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.husbandName[0]}</p>
                    )}
                  </div>

                  {system === "EJC" && (
                    <div className="space-y-1">
                      <label htmlFor="husbandNickname" className="text-xs font-medium text-gray-700 dark:text-gray-300">Apelido</label>
                      <input
                        id="husbandNickname"
                        type="text"
                        name="husbandNickname"
                        value={casalData.husbandNickname}
                        onChange={handleCasalChange}
                        placeholder="Como prefere ser chamado"
                        className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                      />
                      {fieldErrors.husbandNickname && (
                        <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.husbandNickname[0]}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="husbandBirthDate" className="text-xs font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
                    <input
                      id="husbandBirthDate"
                      type="date"
                      name="husbandBirthDate"
                      value={casalData.husbandBirthDate}
                      onChange={handleCasalChange}
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.husbandBirthDate && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.husbandBirthDate[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="husbandPhone" className="text-xs font-medium text-gray-700 dark:text-gray-300">Celular</label>
                    <input
                      id="husbandPhone"
                      type="text"
                      name="husbandPhone"
                      value={casalData.husbandPhone}
                      onChange={handleCasalChange}
                      placeholder="(00) 90000-0000"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.husbandPhone && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.husbandPhone[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="husbandEmail" className="text-xs font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                    <input
                      id="husbandEmail"
                      type="email"
                      name="husbandEmail"
                      value={casalData.husbandEmail}
                      onChange={handleCasalChange}
                      placeholder="esposo@email.com"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.husbandEmail && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.husbandEmail[0]}</p>
                    )}
                  </div>
                </div>

                {/* ELA (Esposa) */}
                <div className="bg-gray-50/20 dark:bg-zinc-900/10 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800/80 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                      <span className="text-gray-750 dark:text-gray-300 text-xs font-bold">Ela</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Dados da Esposa</h4>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="wifeName" className="text-xs font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                    <input
                      id="wifeName"
                      type="text"
                      name="wifeName"
                      value={casalData.wifeName}
                      onChange={handleCasalChange}
                      placeholder="Nome dela"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.wifeName && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.wifeName[0]}</p>
                    )}
                  </div>

                  {system === "EJC" && (
                    <div className="space-y-1">
                      <label htmlFor="wifeNickname" className="text-xs font-medium text-gray-700 dark:text-gray-300">Apelido</label>
                      <input
                        id="wifeNickname"
                        type="text"
                        name="wifeNickname"
                        value={casalData.wifeNickname}
                        onChange={handleCasalChange}
                        placeholder="Como prefere ser chamada"
                        className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                      />
                      {fieldErrors.wifeNickname && (
                        <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.wifeNickname[0]}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="wifeBirthDate" className="text-xs font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
                    <input
                      id="wifeBirthDate"
                      type="date"
                      name="wifeBirthDate"
                      value={casalData.wifeBirthDate}
                      onChange={handleCasalChange}
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.wifeBirthDate && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.wifeBirthDate[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="wifePhone" className="text-xs font-medium text-gray-700 dark:text-gray-300">Celular</label>
                    <input
                      id="wifePhone"
                      type="text"
                      name="wifePhone"
                      value={casalData.wifePhone}
                      onChange={handleCasalChange}
                      placeholder="(00) 90000-0000"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.wifePhone && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.wifePhone[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="wifeEmail" className="text-xs font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                    <input
                      id="wifeEmail"
                      type="email"
                      name="wifeEmail"
                      value={casalData.wifeEmail}
                      onChange={handleCasalChange}
                      placeholder="esposa@email.com"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs"
                    />
                    {fieldErrors.wifeEmail && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{fieldErrors.wifeEmail[0]}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-250 dark:border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 rounded-xl transition-all shadow-sm flex items-center"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Salvando...
              </>
            ) : (
              "Salvar Integrante"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
