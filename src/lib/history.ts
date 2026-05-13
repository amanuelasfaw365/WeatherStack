import { prisma } from "./prisma";

const MAX_HISTORY = 5;

export async function upsertSearchHistory(
  userId: string,
  data: { country: string; city?: string; lat?: number; lon?: number }
) {
  const existing = await prisma.searchHistory.findFirst({
    where: { userId, country: data.country },
  });

  if (existing) {
    await prisma.searchHistory.update({
      where: { id: existing.id },
      data: { searchedAt: new Date(), city: data.city, lat: data.lat, lon: data.lon },
    });
  } else {
    await prisma.searchHistory.create({
      data: { userId, ...data },
    });

    const count = await prisma.searchHistory.count({ where: { userId } });
    if (count > MAX_HISTORY) {
      const oldest = await prisma.searchHistory.findFirst({
        where: { userId },
        orderBy: { searchedAt: "asc" },
      });
      if (oldest) await prisma.searchHistory.delete({ where: { id: oldest.id } });
    }
  }
}

export async function getUserHistory(userId: string) {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { searchedAt: "desc" },
    take: MAX_HISTORY,
  });
}
