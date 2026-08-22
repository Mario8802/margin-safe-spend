import { asc } from "drizzle-orm";
import { getDb } from "../../../db";
import { bills } from "../../../db/schema";

const frequencies = new Set(["monthly", "quarterly", "yearly"]);
const colors = new Set(["blue", "violet", "orange", "green", "pink", "yellow"]);

function present(row: typeof bills.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    amount: row.amountCents / 100,
    frequency: row.frequency,
    category: row.category,
    dueDay: row.dueDay,
    color: row.color,
  };
}

export async function GET() {
  try {
    const rows = await getDb().select().from(bills).orderBy(asc(bills.dueDay), asc(bills.id));
    return Response.json({ bills: rows.map(present) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load commitments";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "").trim().slice(0, 80);
    const category = String(payload.category ?? "Other").trim().slice(0, 40) || "Other";
    const frequency = String(payload.frequency ?? "monthly");
    const color = String(payload.color ?? "blue");
    const amount = Number(payload.amount);
    const dueDay = Math.round(Number(payload.dueDay));

    if (!name || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
      return Response.json({ error: "Enter a valid name and positive amount" }, { status: 400 });
    }
    if (!frequencies.has(frequency) || !colors.has(color) || dueDay < 1 || dueDay > 31) {
      return Response.json({ error: "Invalid frequency, colour, or due day" }, { status: 400 });
    }

    const [row] = await getDb()
      .insert(bills)
      .values({
        name,
        amountCents: Math.round(amount * 100),
        frequency: frequency as "monthly" | "quarterly" | "yearly",
        category,
        dueDay,
        color,
      })
      .returning();

    return Response.json({ bill: present(row) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save commitment";
    return Response.json({ error: message }, { status: 500 });
  }
}
