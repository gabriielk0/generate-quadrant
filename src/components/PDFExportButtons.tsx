"use client";

import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { QuadrantePDFDocument } from "./QuadrantePDFDocument";
import { EJCPDFDocument } from "./EJCPDFDocument";
import { generateExcelQuadrant } from "@/lib/excel-generator";
import { generateWordQuadrant } from "@/lib/word-generator";
import { generateExcelQuadrantEJC } from "@/lib/excel-generator-ejc";
import { generateWordQuadrantEJC } from "@/lib/word-generator-ejc";

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

interface PDFExportButtonsProps {
  teams: Team[];
  system?: "SEGUEME" | "EJC";
}

export function PDFExportButtons({ teams, system = "SEGUEME" }: PDFExportButtonsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="px-4 py-2.5 text-xs md:text-sm font-semibold text-gray-400 bg-gray-100 dark:bg-zinc-800 rounded-xl cursor-not-allowed animate-pulse"
          disabled
        >
          Carregando Exportadores...
        </button>
      </div>
    );
  }

  if (system === "EJC") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {/* PDF Completo Download */}
        <PDFDownloadLink
          document={<EJCPDFDocument teams={teams} modo="COMPLETO" />}
          fileName="quadrante_ejc_completo.pdf"
          style={{ textDecoration: "none" }}
        >
          {({ loading }) => (
            <span
              className={`px-4 py-2.5 text-xs md:text-sm font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                loading
                  ? "bg-blue-800 opacity-80 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 active:scale-95"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {loading ? "Gerando PDF..." : "Baixar PDF Completo"}
            </span>
          )}
        </PDFDownloadLink>

        {/* PDF LGPD Download */}
        <PDFDownloadLink
          document={<EJCPDFDocument teams={teams} modo="LGPD" />}
          fileName="quadrante_ejc_lgpd.pdf"
          style={{ textDecoration: "none" }}
        >
          {({ loading }) => (
            <span
              className={`px-4 py-2.5 text-xs md:text-sm font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                loading
                  ? "bg-slate-700 opacity-80 cursor-wait"
                  : "bg-slate-600 hover:bg-slate-500 active:scale-95"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              {loading ? "Gerando PDF..." : "Baixar PDF LGPD"}
            </span>
          )}
        </PDFDownloadLink>

        {/* Excel Export Button */}
        <button
          onClick={async () => {
            setIsGeneratingExcel(true);
            try {
              await generateExcelQuadrantEJC(teams);
            } catch (err) {
              console.error("Erro ao gerar Excel EJC:", err);
            } finally {
              setIsGeneratingExcel(false);
            }
          }}
          disabled={isGeneratingExcel}
          className={`px-4 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
            isGeneratingExcel
              ? "bg-emerald-300 dark:bg-emerald-900/50 text-emerald-100 cursor-wait"
              : "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {isGeneratingExcel ? "Gerando Excel..." : "Exportar Excel"}
        </button>

        {/* Word Export Button */}
        <button
          onClick={async () => {
            setIsGeneratingWord(true);
            try {
              await generateWordQuadrantEJC(teams);
            } catch (err) {
              console.error("Erro ao gerar Word EJC:", err);
            } finally {
              setIsGeneratingWord(false);
            }
          }}
          disabled={isGeneratingWord}
          className={`px-4 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
            isGeneratingWord
              ? "bg-blue-300 dark:bg-blue-900/50 text-blue-100 cursor-wait"
              : "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {isGeneratingWord ? "Gerando Word..." : "Exportar Word"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* PDF Completo Download */}
      <PDFDownloadLink
        document={<QuadrantePDFDocument teams={teams} modo="COMPLETO" />}
        fileName="quadrante_completo.pdf"
        style={{ textDecoration: "none" }}
      >
        {({ loading }) => (
          <span
            className={`px-4 py-2.5 text-xs md:text-sm font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
              loading
                ? "bg-gray-700 opacity-80 cursor-wait"
                : "bg-gray-800 hover:bg-gray-700 active:scale-95"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {loading ? "Gerando PDF..." : "Baixar PDF Completo"}
          </span>
        )}
      </PDFDownloadLink>

      {/* PDF LGPD Download */}
      <PDFDownloadLink
        document={<QuadrantePDFDocument teams={teams} modo="LGPD" />}
        fileName="quadrante_lgpd.pdf"
        style={{ textDecoration: "none" }}
      >
        {({ loading }) => (
          <span
            className={`px-4 py-2.5 text-xs md:text-sm font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
              loading
                ? "bg-gray-500 opacity-80 cursor-wait"
                : "bg-gray-600 hover:bg-gray-500 active:scale-95"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            {loading ? "Gerando PDF..." : "Baixar PDF LGPD"}
          </span>
        )}
      </PDFDownloadLink>

      {/* Excel Export Button */}
      <button
        onClick={async () => {
          setIsGeneratingExcel(true);
          try {
            await generateExcelQuadrant(teams);
          } catch (err) {
            console.error("Erro ao gerar Excel:", err);
          } finally {
            setIsGeneratingExcel(false);
          }
        }}
        disabled={isGeneratingExcel}
        className={`px-4 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
          isGeneratingExcel
            ? "bg-emerald-300 dark:bg-emerald-900/50 text-emerald-100 cursor-wait"
            : "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isGeneratingExcel ? "Gerando Excel..." : "Exportar Excel"}
      </button>

      {/* Word Export Button */}
      <button
        onClick={async () => {
          setIsGeneratingWord(true);
          try {
            await generateWordQuadrant(teams);
          } catch (err) {
            console.error("Erro ao gerar Word:", err);
          } finally {
            setIsGeneratingWord(false);
          }
        }}
        disabled={isGeneratingWord}
        className={`px-4 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
          isGeneratingWord
            ? "bg-blue-300 dark:bg-blue-900/50 text-blue-100 cursor-wait"
            : "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isGeneratingWord ? "Gerando Word..." : "Exportar Word"}
      </button>
    </div>
  );
}
