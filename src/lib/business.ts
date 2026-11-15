import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireSessionUser() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) redirect("/login");

  return user;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "minha-agenda";
  let candidate = root;
  let counter = 1;

  while (await prisma.business.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${root}-${counter}`;
  }

  return candidate;
}

export async function requireBusiness() {
  const user = await requireSessionUser();

  const existing = await prisma.business.findUnique({
    where: { ownerId: user.id },
  });

  if (existing) return existing;

  const name = user.name?.trim() || "Meu negócio";

  return prisma.business.create({
    data: {
      ownerId: user.id,
      name,
      slug: await uniqueSlug(name),
      services: {
        create: {
          name: "Atendimento",
          durationMin: 30,
          priceCents: 0,
        },
      },
      hours: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          opensAt: "09:00",
          closesAt: "18:00",
        })),
      },
    },
  });
}

export async function ownedBusinessOrNull(userId: string) {
  return prisma.business.findUnique({ where: { ownerId: userId } });
}
