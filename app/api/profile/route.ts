import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";

function present(row: typeof profiles.$inferSelect) {
  return {
    income: row.incomeCents / 100,
    savingsTarget: row.savingsTargetCents / 100,
    flexibleSpent: row.flexibleSpentCents / 100,
    daysUntilPayday: row.daysUntilPayday,
  };
}

export async function GET() {
  try {
    const [row] = await getDb().select().from(profiles).where(eq(profiles.id, 1)).limit(1);
    return Response.json({ profile: row ? present(row) : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load plan";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const income = Number(payload.income);
    const savingsTarget = Number(payload.savingsTarget);
    const flexibleSpent = Number(payload.flexibleSpent);
    const daysUntilPayday = Math.round(Number(payload.daysUntilPayday));

    if (
      !Number.isFinite(income) || income <= 0 || income > 10_000_000 ||
      !Number.isFinite(savingsTarget) || savingsTarget < 0 ||
      !Number.isFinite(flexibleSpent) || flexibleSpent < 0 ||
      daysUntilPayday < 1 || daysUntilPayday > 62
    ) {
      return Response.json({ error: "Enter a valid monthly plan" }, { status: 400 });
    }

    const values = {
      id: 1,
      incomeCents: Math.round(income * 100),
      savingsTargetCents: Math.round(savingsTarget * 100),
      flexibleSpentCents: Math.round(flexibleSpent * 100),
      daysUntilPayday,
      updatedAt: sql<string>`CURRENT_TIMESTAMP`,
    };

    const [row] = await getDb()
      .insert(profiles)
      .values(values)
      .onConflictDoUpdate({ target: profiles.id, set: values })
      .returning();

    return Response.json({ profile: present(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save plan";
    return Response.json({ error: message }, { status: 500 });
  }
}
