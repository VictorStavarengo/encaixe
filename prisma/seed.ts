import { randomUUID } from "node:crypto";
import "dotenv/config";
import { addDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const TZ = "America/Sao_Paulo";

function isoToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysIso(iso: string, days: number): string {
  return addDays(new Date(`${iso}T12:00:00Z`), days)
    .toISOString()
    .slice(0, 10);
}

function weekdayOf(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

function nextOpenDays(count: number): string[] {
  const days: string[] = [];
  let cursor = isoToday();

  while (days.length < count) {
    cursor = addDaysIso(cursor, 1);
    const weekday = weekdayOf(cursor);
    if (weekday >= 2 && weekday <= 6) days.push(cursor);
  }

  return days;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@encaixe.app" },
    update: { name: "Studio Navalha" },
    create: {
      id: "user_demo",
      email: "demo@encaixe.app",
      name: "Studio Navalha",
    },
  });

  await prisma.business.deleteMany({ where: { slug: "studio-navalha" } });

  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: "Studio Navalha",
      slug: "studio-navalha",
      phone: "(11) 98765-4321",
      address: "Rua Aurora, 214 · Vila Madalena, São Paulo",
      timezone: TZ,
      services: {
        create: [
          { name: "Corte masculino", durationMin: 45, priceCents: 6000, position: 0 },
          { name: "Barba na navalha", durationMin: 30, priceCents: 4000, position: 1 },
          { name: "Corte + barba", durationMin: 75, priceCents: 9000, position: 2 },
        ],
      },
      hours: {
        create: [2, 3, 4, 5, 6].map((weekday) => ({
          weekday,
          opensAt: "09:00",
          closesAt: "19:00",
        })),
      },
    },
    include: { services: true },
  });

  const corte = business.services.find((s) => s.name === "Corte masculino")!;
  const barba = business.services.find((s) => s.name === "Barba na navalha")!;
  const combo = business.services.find((s) => s.name === "Corte + barba")!;
  const days = nextOpenDays(4);

  const bookings = [
    {
      service: corte,
      day: days[0],
      time: "10:00",
      customerName: "Marina Alves",
      customerEmail: "marina.alves@email.com",
      customerPhone: "(11) 98811-2233",
      status: "CONFIRMED" as const,
      notes: null,
    },
    {
      service: combo,
      day: days[0],
      time: "14:00",
      customerName: "Rafael Souza",
      customerEmail: "rafael.souza@email.com",
      customerPhone: "(11) 97744-5566",
      status: "PENDING" as const,
      notes: "Primeira visita.",
    },
    {
      service: barba,
      day: days[1],
      time: "11:00",
      customerName: "Camila Reis",
      customerEmail: "camila.reis@email.com",
      customerPhone: null,
      status: "CONFIRMED" as const,
      notes: null,
    },
    {
      service: corte,
      day: days[2],
      time: "16:00",
      customerName: "Diego Martins",
      customerEmail: "diego.martins@email.com",
      customerPhone: "(11) 96633-7788",
      status: "PENDING" as const,
      notes: "Prefere máquina 2 nas laterais.",
    },
  ];

  for (const item of bookings) {
    const startsAt = fromZonedTime(`${item.day}T${item.time}:00`, TZ);
    const endsAt = new Date(startsAt.getTime() + item.service.durationMin * 60_000);

    const booking = await prisma.booking.create({
      data: {
        businessId: business.id,
        serviceId: item.service.id,
        serviceName: item.service.name,
        servicePriceCents: item.service.priceCents,
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        customerPhone: item.customerPhone,
        notes: item.notes,
        startsAt,
        endsAt,
        status: item.status,
        cancelToken: randomUUID(),
      },
    });

    if (item.status === "CONFIRMED") {
      await prisma.emailLog.create({
        data: {
          bookingId: booking.id,
          to: item.customerEmail,
          subject: `Agendamento confirmado · ${business.name}`,
          html: `<p>Olá, ${item.customerName}! Seu horário de ${item.service.name} no ${business.name} está confirmado para ${item.day} às ${item.time}.</p>`,
          provider: "preview",
        },
      });
    }
  }

  console.log(
    `Seed ok: ${business.name} (/b/${business.slug}) com ${business.services.length} serviços e ${bookings.length} agendamentos.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
