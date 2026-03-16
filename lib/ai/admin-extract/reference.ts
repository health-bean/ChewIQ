import { db } from "@/lib/db";
import {
  symptomsDatabase,
  supplementsDatabase,
  medicationsDatabase,
  detoxTypes,
} from "@/lib/db/schema";
import { eq, ilike, asc } from "drizzle-orm";
import type {
  ListReferenceDataInput,
  AddReferenceItemInput,
  DeleteReferenceItemInput,
} from "./types";

// Map table names to their Drizzle table objects for DRY operations
const TABLE_MAP = {
  symptoms: symptomsDatabase,
  supplements: supplementsDatabase,
  medications: medicationsDatabase,
  detox_types: detoxTypes,
} as const;

export async function handleListReferenceData(input: ListReferenceDataInput) {
  const table = TABLE_MAP[input.table];
  if (!table) return { error: `Unknown table: ${input.table}` };

  const rows = await db
    .select()
    .from(table)
    .orderBy(asc(table.category), asc(table.name));

  return { table: input.table, count: rows.length, items: rows };
}

export async function handleAddReferenceItem(input: AddReferenceItemInput) {
  const table = TABLE_MAP[input.table];
  if (!table) return { error: `Unknown table: ${input.table}` };

  const [existing] = await db
    .select({ id: table.id })
    .from(table)
    .where(ilike(table.name, input.name))
    .limit(1);

  if (existing) {
    return { error: `${input.table} item "${input.name}" already exists.` };
  }

  const values: Record<string, unknown> = {
    name: input.name,
    category: input.category,
    description: input.description ?? null,
  };

  // supplements has commonDosage field
  if (input.table === "supplements" && input.common_dosage) {
    values.commonDosage = input.common_dosage;
  }

  const [inserted] = await db
    .insert(table)
    .values(values as typeof table.$inferInsert)
    .returning({ id: table.id, name: table.name, category: table.category });

  return { success: true, table: input.table, item: inserted };
}

export async function handleDeleteReferenceItem(input: DeleteReferenceItemInput) {
  const table = TABLE_MAP[input.table];
  if (!table) return { error: `Unknown table: ${input.table}` };

  const [item] = await db
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(ilike(table.name, input.name))
    .limit(1);

  if (!item) {
    return { error: `${input.table} item "${input.name}" not found.` };
  }

  await db.delete(table).where(eq(table.id, item.id));
  return { success: true, message: `Deleted ${input.table} item "${item.name}".` };
}
