"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const JovemSchema = z.object({
  name: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  nickname: z.string().min(1, "Apelido é obrigatório"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
});

const CasalSchema = z.object({
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  homePhone: z.string().optional().or(z.literal("")),
  // Husband
  husbandName: z.string().min(3, "Nome do esposo deve ter pelo menos 3 caracteres"),
  husbandNickname: z.string().optional().or(z.literal("")),
  husbandEmail: z.string().email("E-mail do esposo inválido").or(z.literal("")),
  husbandBirthDate: z.string().min(1, "Data de nascimento do esposo é obrigatória"),
  husbandPhone: z.string().min(1, "Celular do esposo é obrigatório"),
  // Wife
  wifeName: z.string().min(3, "Nome da esposa deve ter pelo menos 3 caracteres"),
  wifeNickname: z.string().optional().or(z.literal("")),
  wifeEmail: z.string().email("E-mail da esposa inválido").or(z.literal("")),
  wifeBirthDate: z.string().min(1, "Data de nascimento da esposa é obrigatória"),
  wifePhone: z.string().min(1, "Celular da esposa é obrigatório"),
});

export async function createMember(
  teamId: string,
  type: "JOVEM" | "CASAL",
  subcategory: string,
  rawData: any
) {
  if (!teamId) {
    return { error: "A equipe é obrigatória." };
  }
  if (!subcategory || subcategory.trim() === "") {
    return { error: "A subcategoria é obrigatória." };
  }

  try {
    // 1. Check if team exists
    const teamExists = await db.team.findUnique({
      where: { id: teamId },
    });
    if (!teamExists) {
      return { error: "A equipe selecionada não existe." };
    }

    // 2. Validate and Save depending on type
    if (type === "JOVEM") {
      const parsed = JovemSchema.safeParse(rawData);
      if (!parsed.success) {
        return {
          error: "Dados inválidos. Por favor, verifique os campos destacados.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      }

      const { name, nickname, birthDate, phone, email, address } = parsed.data;

      const member = await db.member.create({
        data: {
          type,
          subcategory,
          teamId,
          name,
          nickname,
          birthDate: birthDate ? new Date(birthDate + "T00:00:00") : null,
          phone,
          email: email || null,
          address,
        },
      });

      revalidatePath("/");
      revalidatePath("/ejc");
      return { success: true, member };
    } else if (type === "CASAL") {
      const parsed = CasalSchema.safeParse(rawData);
      if (!parsed.success) {
        return {
          error: "Dados inválidos. Por favor, verifique os campos destacados.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      }

      const {
        address,
        homePhone,
        husbandName,
        husbandNickname,
        husbandEmail,
        husbandBirthDate,
        husbandPhone,
        wifeName,
        wifeNickname,
        wifeEmail,
        wifeBirthDate,
        wifePhone,
      } = parsed.data;

      const member = await db.member.create({
        data: {
          type,
          subcategory,
          teamId,
          address,
          homePhone: homePhone || null,
          husbandName,
          husbandNickname: husbandNickname || null,
          husbandEmail: husbandEmail || null,
          husbandBirthDate: husbandBirthDate ? new Date(husbandBirthDate + "T00:00:00") : null,
          husbandPhone,
          wifeName,
          wifeNickname: wifeNickname || null,
          wifeEmail: wifeEmail || null,
          wifeBirthDate: wifeBirthDate ? new Date(wifeBirthDate + "T00:00:00") : null,
          wifePhone,
        },
      });

      revalidatePath("/");
      revalidatePath("/ejc");
      return { success: true, member };
    } else {
      return { error: "Tipo de integrante inválido." };
    }
  } catch (error: any) {
    console.error("Erro ao cadastrar integrante:", error);
    return { error: "Ocorreu um erro no servidor ao cadastrar o integrante." };
  }
}

export async function updateMember(
  id: string,
  type: "JOVEM" | "CASAL",
  subcategory: string,
  rawData: any
) {
  if (!id) {
    return { error: "O ID do integrante é obrigatório." };
  }
  if (!subcategory || subcategory.trim() === "") {
    return { error: "A subcategoria é obrigatória." };
  }

  try {
    if (type === "JOVEM") {
      const parsed = JovemSchema.safeParse(rawData);
      if (!parsed.success) {
        return {
          error: "Dados inválidos. Por favor, verifique os campos destacados.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      }

      const { name, nickname, birthDate, phone, email, address } = parsed.data;

      const member = await db.member.update({
        where: { id },
        data: {
          type,
          subcategory,
          name,
          nickname,
          birthDate: birthDate ? new Date(birthDate + "T00:00:00") : null,
          phone,
          email: email || null,
          address,
          // Reset Casal fields if type is changed to JOVEM
          homePhone: null,
          husbandName: null,
          husbandNickname: null,
          husbandEmail: null,
          husbandBirthDate: null,
          husbandPhone: null,
          wifeName: null,
          wifeNickname: null,
          wifeEmail: null,
          wifeBirthDate: null,
          wifePhone: null,
        },
      });

      revalidatePath("/");
      revalidatePath("/ejc");
      return { success: true, member };
    } else if (type === "CASAL") {
      const parsed = CasalSchema.safeParse(rawData);
      if (!parsed.success) {
        return {
          error: "Dados inválidos. Por favor, verifique os campos destacados.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      }

      const {
        address,
        homePhone,
        husbandName,
        husbandNickname,
        husbandEmail,
        husbandBirthDate,
        husbandPhone,
        wifeName,
        wifeNickname,
        wifeEmail,
        wifeBirthDate,
        wifePhone,
      } = parsed.data;

      const member = await db.member.update({
        where: { id },
        data: {
          type,
          subcategory,
          address,
          homePhone: homePhone || null,
          husbandName,
          husbandNickname: husbandNickname || null,
          husbandEmail: husbandEmail || null,
          husbandBirthDate: husbandBirthDate ? new Date(husbandBirthDate + "T00:00:00") : null,
          husbandPhone,
          wifeName,
          wifeNickname: wifeNickname || null,
          wifeEmail: wifeEmail || null,
          wifeBirthDate: wifeBirthDate ? new Date(wifeBirthDate + "T00:00:00") : null,
          wifePhone,
          // Reset Jovem fields if type is changed to CASAL
          name: null,
          nickname: null,
          birthDate: null,
          phone: null,
          email: null,
        },
      });

      revalidatePath("/");
      revalidatePath("/ejc");
      return { success: true, member };
    } else {
      return { error: "Tipo de integrante inválido." };
    }
  } catch (error: any) {
    console.error("Erro ao atualizar integrante:", error);
    return { error: "Ocorreu um erro no servidor ao atualizar o integrante." };
  }
}

