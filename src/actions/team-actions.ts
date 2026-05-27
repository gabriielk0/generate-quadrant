"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTeam(name: string) {
  if (!name || name.trim() === "") {
    return { error: "O nome da equipe é obrigatório." };
  }

  try {
    const existing = await db.team.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return { error: "Já existe uma equipe com este nome." };
    }

    const team = await db.team.create({
      data: {
        name: name.trim(),
      },
    });

    revalidatePath("/");
    return { success: true, team };
  } catch (error: any) {
    console.error("Erro ao criar equipe:", error);
    return { error: "Ocorreu um erro ao criar a equipe." };
  }
}
