import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();

  try {
    await prisma.business.count();
    return Response.json({ status: "ok" });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "unknown";

    // Só o código sai na resposta: a mensagem do driver pode expor host e credenciais.
    return Response.json(
      { status: "degraded", database: { reachable: false, code } },
      { status: 503 },
    );
  }
}
