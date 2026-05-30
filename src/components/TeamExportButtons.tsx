"use client";

import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { QuadrantePDFDocument } from "./QuadrantePDFDocument";
import { EJCPDFDocument } from "./EJCPDFDocument";
import { generateExcelQuadrant } from "@/lib/excel-generator";
import { generateWordQuadrant } from "@/lib/word-generator";
import { generateExcelQuadrantEJC } from "@/lib/excel-generator-ejc";
import { generateWordQuadrantEJC } from "@/lib/word-generator-ejc";
import { File, FileText, Sheet, FilePenLine } from "lucide-react";

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

interface TeamExportButtonsProps {
  team: Team;
  system?: "SEGUEME" | "EJC";
}

export function TeamExportButtons({ team, system = "SEGUEME" }: TeamExportButtonsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-1 animate-pulse">
        <div className="w-7 h-7 bg-gray-150 dark:bg-zinc-800 rounded-lg" />
        <div className="w-7 h-7 bg-gray-150 dark:bg-zinc-800 rounded-lg" />
        <div className="w-7 h-7 bg-gray-150 dark:bg-zinc-800 rounded-lg" />
        <div className="w-7 h-7 bg-gray-150 dark:bg-zinc-800 rounded-lg" />
      </div>
    );
  }

  const teamNameClean = team.name.replace(/\s+/g, "_");

  // Word Export Trigger
  const handleWordExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsGeneratingWord(true);
    try {
      if (system === "EJC") {
        await generateWordQuadrantEJC([team]);
      } else {
        await generateWordQuadrant([team]);
      }
    } catch (err) {
      console.error("Erro ao exportar Word individual:", err);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  // Excel Export Trigger
  const handleExcelExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsGeneratingExcel(true);
    try {
      if (system === "EJC") {
        await generateExcelQuadrantEJC([team]);
      } else {
        await generateExcelQuadrant([team]);
      }
    } catch (err) {
      console.error("Erro ao exportar Excel individual:", err);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const pdfDocument = system === "EJC"
    ? <EJCPDFDocument teams={[team]} modo="COMPLETO" />
    : <QuadrantePDFDocument teams={[team]} modo="COMPLETO" />;

  const lgpdDocument = system === "EJC"
    ? <EJCPDFDocument teams={[team]} modo="LGPD" />
    : <QuadrantePDFDocument teams={[team]} modo="LGPD" />;

  const buttonClass = "w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-850 flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 p-0.5 rounded-lg border border-gray-150 dark:border-zinc-800">
      {/* PDF Completo */}
      <div onClick={(e) => e.stopPropagation()}>
        <PDFDownloadLink
          document={pdfDocument}
          fileName={`Quadrante_Completo_${teamNameClean}.pdf`}
          style={{ textDecoration: "none" }}
        >
          {({ loading }) => (
            <button
              type="button"
              className={buttonClass}
              title="Exportar PDF Completo"
              disabled={loading}
            >
              <FileText className="h-4 w-4" />
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* PDF LGPD */}
      <div onClick={(e) => e.stopPropagation()}>
        <PDFDownloadLink
          document={lgpdDocument}
          fileName={`Quadrante_LGPD_${teamNameClean}.pdf`}
          style={{ textDecoration: "none" }}
        >
          {({ loading }) => (
            <button
              type="button"
              className={buttonClass}
              title="Exportar PDF LGPD"
              disabled={loading}
            >
              <File className="h-4 w-4" />
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Excel */}
      <button
        type="button"
        className={buttonClass}
        onClick={handleExcelExport}
        disabled={isGeneratingExcel}
        title={isGeneratingExcel ? "Gerando Excel..." : "Exportar Excel"}
      >
        <Sheet className="h-4 w-4" />
      </button>

      {/* Word */}
      <button
        type="button"
        className={buttonClass}
        onClick={handleWordExport}
        disabled={isGeneratingWord}
        title={isGeneratingWord ? "Gerando Word..." : "Exportar Word"}
      >
        <FilePenLine className="h-4 w-4" />
      </button>
    </div>
  );
}
