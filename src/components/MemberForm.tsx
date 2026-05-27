"use client";

import React, { useState, useEffect } from "react";
import { createMember } from "@/actions/member-actions";

interface MemberFormProps {
  teamId: string;
  teamName: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function MemberForm({ teamId, teamName, onCancel, onSuccess }: MemberFormProps) {
  const [type, setType] = useState<"JOVEM" | "CASAL">("JOVEM");
  const [subcategory, setSubcategory] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Subcategory options based on member type
  const subcategoryOptions = {
    JOVEM: [
      { value: "Jovens membros", label: "Jovem Membro" },
      { value: "Jovens apoio", label: "Jovem Apoio" },
      { value: "Jovens coordenadores", label: "Jovem Coordenador" },
    ],
    CASAL: [
      { value: "Casais membros", label: "Casal Membro" },
      { value: "Casal apoio", label: "Casal Apoio" },
      { value: "Casal coordenador", label: "Casal Coordenador" },
    ],
  };

  // Set default subcategory when type changes
  useEffect(() => {
    setSubcategory(subcategoryOptions[type][0].value);
    setFieldErrors({});
    setError(null);
  }, [type]);

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
    husbandEmail: "",
    husbandBirthDate: "",
    husbandPhone: "",
    wifeName: "",
    wifeEmail: "",
    wifeBirthDate: "",
    wifePhone: "",
  });

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

    const dataToSend = type === "JOVEM" ? jovemData : casalData;
    const res = await createMember(teamId, type, subcategory, dataToSend);

    setIsPending(false);

    if (res?.error) {
      setError(res.error);
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
    } else {
      // Clear forms
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
        husbandEmail: "",
        husbandBirthDate: "",
        husbandPhone: "",
        wifeName: "",
        wifeEmail: "",
        wifeBirthDate: "",
        wifePhone: "",
      });
      onSuccess();
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Adicionar Integrante
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Equipe: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{teamName}</span>
          </p>
        </div>
        <button
          onClick={onCancel}
          type="button"
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Toggle Jovem vs Casal */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Tipo de Integrante
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setType("JOVEM")}
              className={`py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === "JOVEM"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Jovem
            </button>
            <button
              type="button"
              onClick={() => setType("CASAL")}
              className={`py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === "CASAL"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Casal
            </button>
          </div>
        </div>

        {/* Subcategory Select */}
        <div className="space-y-2">
          <label htmlFor="subcategory" className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Subcategoria (Função)
          </label>
          <select
            id="subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          >
            {subcategoryOptions[type].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <hr className="border-zinc-100 dark:border-zinc-850" />

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
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
                  <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome Completo</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={jovemData.name}
                    onChange={handleJovemChange}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nome completo"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="nickname" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Apelido</label>
                  <input
                    id="nickname"
                    type="text"
                    name="nickname"
                    value={jovemData.nickname}
                    onChange={handleJovemChange}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Como prefere ser chamado"
                  />
                  {fieldErrors.nickname && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.nickname[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="birthDate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Data de Nascimento</label>
                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={jovemData.birthDate}
                    onChange={handleJovemChange}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {fieldErrors.birthDate && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.birthDate[0]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefone / Celular</label>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={jovemData.phone}
                    onChange={handleJovemChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.phone[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={jovemData.email}
                  onChange={handleJovemChange}
                  placeholder="jovem@email.com"
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.email[0]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="address" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Endereço Completo</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={jovemData.address}
                  onChange={handleJovemChange}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {fieldErrors.address && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.address[0]}</p>
                )}
              </div>
            </div>
          ) : (
            /* CASAL FORM FIELDS */
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
              {/* Shared Fields */}
              <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 space-y-4">
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dados Compartilhados do Casal
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="casal-address" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Endereço Completo</label>
                    <input
                      id="casal-address"
                      type="text"
                      name="address"
                      value={casalData.address}
                      onChange={handleCasalChange}
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {fieldErrors.address && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.address[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="homePhone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefone Residencial</label>
                    <input
                      id="homePhone"
                      type="text"
                      name="homePhone"
                      value={casalData.homePhone}
                      onChange={handleCasalChange}
                      placeholder="(00) 0000-0000"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {fieldErrors.homePhone && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.homePhone[0]}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Side-by-side Columns for Ele / Ela */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ELE (Esposo) */}
                <div className="bg-zinc-50/20 dark:bg-zinc-900/10 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-850 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">Ele</span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Dados do Esposo</h4>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="husbandName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome Completo</label>
                    <input
                      id="husbandName"
                      type="text"
                      name="husbandName"
                      value={casalData.husbandName}
                      onChange={handleCasalChange}
                      placeholder="Nome dele"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {fieldErrors.husbandName && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.husbandName[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="husbandBirthDate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Data de Nascimento</label>
                    <input
                      id="husbandBirthDate"
                      type="date"
                      name="husbandBirthDate"
                      value={casalData.husbandBirthDate}
                      onChange={handleCasalChange}
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {fieldErrors.husbandBirthDate && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.husbandBirthDate[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="husbandPhone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Celular</label>
                    <input
                      id="husbandPhone"
                      type="text"
                      name="husbandPhone"
                      value={casalData.husbandPhone}
                      onChange={handleCasalChange}
                      placeholder="(00) 90000-0000"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {fieldErrors.husbandPhone && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.husbandPhone[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="husbandEmail" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">E-mail</label>
                    <input
                      id="husbandEmail"
                      type="email"
                      name="husbandEmail"
                      value={casalData.husbandEmail}
                      onChange={handleCasalChange}
                      placeholder="esposo@email.com"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {fieldErrors.husbandEmail && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.husbandEmail[0]}</p>
                    )}
                  </div>
                </div>

                {/* ELA (Esposa) */}
                <div className="bg-zinc-50/20 dark:bg-zinc-900/10 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-850 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center">
                      <span className="text-pink-600 dark:text-pink-400 text-sm font-bold">Ela</span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Dados da Esposa</h4>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="wifeName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome Completo</label>
                    <input
                      id="wifeName"
                      type="text"
                      name="wifeName"
                      value={casalData.wifeName}
                      onChange={handleCasalChange}
                      placeholder="Nome dela"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {fieldErrors.wifeName && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.wifeName[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="wifeBirthDate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Data de Nascimento</label>
                    <input
                      id="wifeBirthDate"
                      type="date"
                      name="wifeBirthDate"
                      value={casalData.wifeBirthDate}
                      onChange={handleCasalChange}
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {fieldErrors.wifeBirthDate && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.wifeBirthDate[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="wifePhone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Celular</label>
                    <input
                      id="wifePhone"
                      type="text"
                      name="wifePhone"
                      value={casalData.wifePhone}
                      onChange={handleCasalChange}
                      placeholder="(00) 90000-0000"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {fieldErrors.wifePhone && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.wifePhone[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="wifeEmail" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">E-mail</label>
                    <input
                      id="wifeEmail"
                      type="email"
                      name="wifeEmail"
                      value={casalData.wifeEmail}
                      onChange={handleCasalChange}
                      placeholder="esposa@email.com"
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {fieldErrors.wifeEmail && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.wifeEmail[0]}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2.5 text-sm font-medium text-zinc-750 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 rounded-xl transition-all shadow-sm flex items-center"
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
