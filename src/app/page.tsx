import { db } from "@/lib/db";
import { Dashboard } from "@/components/Dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Segue-me | Gestão de Equipes e Quadrantes",
  description:
    "Sistema de cadastro e gerenciamento de integrantes (Jovens e Casais) para as equipes do Encontro de Jovens com Cristo (Segue-me).",
};

export default async function Home() {
  // Fetch teams with their members, ordered by team name alphabetically
  const teams = await db.team.findMany({
    include: {
      members: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Serialize Date objects into ISO strings for safe transmission from Server Component to Client Component
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
      // Convert Date objects to strings
      birthDate: member.birthDate ? member.birthDate.toISOString() : null,
      phone: member.phone,
      email: member.email,
      address: member.address,
      homePhone: member.homePhone,
      husbandName: member.husbandName,
      husbandEmail: member.husbandEmail,
      husbandBirthDate: member.husbandBirthDate ? member.husbandBirthDate.toISOString() : null,
      husbandPhone: member.husbandPhone,
      wifeName: member.wifeName,
      wifeEmail: member.wifeEmail,
      wifeBirthDate: member.wifeBirthDate ? member.wifeBirthDate.toISOString() : null,
      wifePhone: member.wifePhone,
    })),
  }));

  return (
    <div className="flex flex-col flex-1 h-full min-h-screen">
      <Dashboard initialTeams={serializedTeams} />
    </div>
  );
}
