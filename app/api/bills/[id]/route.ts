import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bills } from "../../../../db/schema";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return Response.json({ error: "Invalid commitment id" }, { status: 400 });
  }

  try {
    await getDb().delete(bills).where(eq(bills.id, numericId));
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove commitment";
    return Response.json({ error: message }, { status: 500 });
  }
}
