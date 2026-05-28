"use client";

import React, { useState, useEffect } from "react";
import { createTeam, updateTeam } from "@/actions/team-actions";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTeam?: { id: string; name: string };
  system?: "SEGUEME" | "EJC";
}

export function TeamModal({ isOpen, onClose, editingTeam, system = "SEGUEME" }: TeamModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (editingTeam) {
      setName(editingTeam.name);
    } else {
      setName("");
    }
    setError(null);
  }, [editingTeam, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("O nome da equipe é obrigatório.");
      return;
    }

    setIsPending(true);
    setError(null);

    const res = editingTeam
      ? await updateTeam(editingTeam.id, name, system)
      : await createTeam(name, system);
      
    setIsPending(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden transform transition-all border border-gray-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {editingTeam ? "Editar Equipe" : "Nova Equipe"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-350 focus:outline-none"
          >
            <span className="sr-only">Fechar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="team-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome da Equipe
              </label>
              <input
                id="team-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="Ex: Equipe de Liturgia, Espiritualizadora"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                disabled={isPending}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-950/50 border-t border-gray-200 dark:border-zinc-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 rounded-xl transition-all shadow-sm flex items-center"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Salvando...
                </>
              ) : (
                editingTeam ? "Salvar Alterações" : "Criar Equipe"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
