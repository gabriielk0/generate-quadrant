"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTeam(name: string, system: string = "SEGUEME") {
  if (!name || name.trim() === "") {
    return { error: "O nome da equipe é obrigatório." };
  }

  try {
    const existing = await db.team.findFirst({
      where: {
        name: name.trim(),
        system,
      },
    });

    if (existing) {
      return { error: "Já existe uma equipe com este nome neste sistema." };
    }

    const team = await db.team.create({
      data: {
        name: name.trim(),
        system,
      },
    });

    revalidatePath("/");
    revalidatePath("/ejc");
    return { success: true, team };
  } catch (error: any) {
    console.error("Erro ao criar equipe:", error);
    return { error: "Ocorreu um erro ao criar a equipe." };
  }
}

export async function updateTeam(id: string, name: string, system: string = "SEGUEME") {
  if (!id) {
    return { error: "O ID da equipe é obrigatório." };
  }
  if (!name || name.trim() === "") {
    return { error: "O nome da equipe é obrigatório." };
  }

  try {
    const existing = await db.team.findFirst({
      where: {
        name: name.trim(),
        system,
        NOT: { id },
      },
    });

    if (existing) {
      return { error: "Já existe uma equipe com este nome neste sistema." };
    }

    const team = await db.team.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });

    revalidatePath("/");
    revalidatePath("/ejc");
    return { success: true, team };
  } catch (error: any) {
    console.error("Erro ao editar equipe:", error);
    return { error: "Ocorreu um erro ao editar a equipe." };
  }
}

