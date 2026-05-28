import { db } from "@/lib/db";
import { Dashboard } from "@/components/Dashboard";
import { DashboardList } from "@/components/DashboardList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EJC | Gestão de Equipes e Quadrantes",
  description:
    "Sistema de cadastro e gerenciamento de integrantes (Jovens e Casais) para as equipes do Encontro de Jovens com Cristo (EJC).",
};

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function EJCPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const view = resolvedParams.view || "quadrante";

  if (view === "manage") {
    // Fetch EJC teams only
    const teams = await db.team.findMany({
      where: {
        system: "EJC",
      },
      include: {
        members: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Serialize Date objects into ISO strings
    const serializedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      members: team.members.map((member) => ({
        id: member.id,
        type: member.type,
        subcategory: member.subcategory,
        teamId: member.teamId,
        name: member.name,
        nickname: member.nickname,
        birthDate: member.birthDate ? member.birthDate.toISOString() : null,
        phone: member.phone,
        email: member.email,
        address: member.address,
        homePhone: member.homePhone,
        husbandName: member.husbandName,
        husbandNickname: member.husbandNickname,
        husbandEmail: member.husbandEmail,
        husbandBirthDate: member.husbandBirthDate ? member.husbandBirthDate.toISOString() : null,
        husbandPhone: member.husbandPhone,
        wifeName: member.wifeName,
        wifeNickname: member.wifeNickname,
        wifeEmail: member.wifeEmail,
        wifeBirthDate: member.wifeBirthDate ? member.wifeBirthDate.toISOString() : null,
        wifePhone: member.wifePhone,
      })),
    }));

    return (
      <div className="flex flex-col flex-1 h-full min-h-screen">
        <Dashboard initialTeams={serializedTeams} system="EJC" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-screen">
      <DashboardList system="EJC" />
    </div>
  );
}
