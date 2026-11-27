import { afterEach, describe, expect, it, vi } from "vitest";

import {
  addDaysToIso,
  formatDateShort,
  formatDateTimeLong,
  formatDuration,
  formatPrice,
  formatTime,
  isoDateInTz,
  upcomingDays,
  weekdayName,
  weekdayOfIsoDate,
} from "./time";

const SP = "America/Sao_Paulo";

// O Intl usa espaço não separável (U+00A0) ao formatar moeda; normaliza para comparar.
function plain(value: string) {
  return value.replace(/\u00a0/g, " ");
}

describe("isoDateInTz", () => {
  it("usa o fuso do negócio, não o UTC", () => {
    const instant = new Date("2026-11-27T02:30:00Z");
    expect(isoDateInTz(instant, SP)).toBe("2026-11-26");
    expect(isoDateInTz(instant, "UTC")).toBe("2026-11-27");
    expect(isoDateInTz(instant, "Asia/Tokyo")).toBe("2026-11-27");
  });

  it("atravessa a virada de ano", () => {
    expect(isoDateInTz(new Date("2026-01-01T02:00:00Z"), SP)).toBe("2025-12-31");
  });
});

describe("weekdayOfIsoDate", () => {
  it("retorna o dia da semana do ISO (0 = domingo)", () => {
    expect(weekdayOfIsoDate("2026-11-27")).toBe(5);
    expect(weekdayOfIsoDate("2026-11-29")).toBe(0);
    expect(weekdayOfIsoDate("2026-12-31")).toBe(4);
  });
});

describe("addDaysToIso", () => {
  it("avança dias e atravessa mês e ano", () => {
    expect(addDaysToIso("2026-11-27", 1)).toBe("2026-11-28");
    expect(addDaysToIso("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDaysToIso("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("respeita ano bissexto", () => {
    expect(addDaysToIso("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDaysToIso("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("upcomingDays", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("começa hoje no fuso do negócio e marca isToday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-27T15:00:00Z")); // 12:00 em São Paulo

    const days = upcomingDays(SP, 3);

    expect(days.map((day) => day.iso)).toEqual([
      "2026-11-27",
      "2026-11-28",
      "2026-11-29",
    ]);
    expect(days.map((day) => day.isToday)).toEqual([true, false, false]);
    expect(days[0].weekday).toBe("sex");
    expect(days[0].day).toBe("27");
    expect(days[0].month).toBe("nov");
  });

  it("já considera o dia anterior quando em São Paulo ainda é ontem", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-27T02:30:00Z")); // 23:30 do dia 26 em São Paulo

    expect(upcomingDays(SP, 1)[0].iso).toBe("2026-11-26");
  });
});

describe("weekdayName", () => {
  it("mapeia 0-6 para português", () => {
    expect(weekdayName(0)).toBe("domingo");
    expect(weekdayName(5)).toBe("sexta");
    expect(weekdayName(6)).toBe("sábado");
  });

  it("devolve string vazia fora do intervalo", () => {
    expect(weekdayName(7)).toBe("");
    expect(weekdayName(-1)).toBe("");
  });
});

describe("formatTime", () => {
  it("formata no fuso do negócio em 24h", () => {
    expect(formatTime(new Date("2026-11-27T17:30:00Z"), SP)).toBe("14:30");
    expect(formatTime(new Date("2026-11-27T12:05:00Z"), "UTC")).toBe("12:05");
  });
});

describe("formatDateShort", () => {
  it("mostra dia da semana, dia e mês abreviados", () => {
    expect(plain(formatDateShort(new Date("2026-11-27T15:00:00Z"), SP))).toBe(
      "sex, 27 de nov",
    );
  });
});

describe("formatDateTimeLong", () => {
  it("mostra data completa com hora", () => {
    const text = plain(formatDateTimeLong(new Date("2026-11-27T12:30:00Z"), SP));
    expect(text).toContain("sexta-feira, 27 de novembro");
    expect(text).toContain("09:30");
  });
});

describe("formatPrice", () => {
  it("esconde centavos quando são zero", () => {
    expect(plain(formatPrice(1000))).toBe("R$ 10");
    expect(plain(formatPrice(0))).toBe("R$ 0");
  });

  it("mostra centavos quando existem", () => {
    expect(plain(formatPrice(1050))).toBe("R$ 10,50");
    expect(plain(formatPrice(5))).toBe("R$ 0,05");
  });
});

describe("formatDuration", () => {
  it("usa minutos abaixo de uma hora", () => {
    expect(formatDuration(30)).toBe("30 min");
    expect(formatDuration(59)).toBe("59 min");
  });

  it("usa horas cheias e com resto", () => {
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(90)).toBe("1h30");
    expect(formatDuration(125)).toBe("2h05");
  });
});
