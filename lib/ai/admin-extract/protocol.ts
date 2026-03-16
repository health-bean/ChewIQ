import { db } from "@/lib/db";
import { protocols, protocolRules } from "@/lib/db/schema";
import { eq, ilike, asc, and, sql } from "drizzle-orm";
import type { UpdateProtocolRuleInput } from "./types";

export async function handleListProtocols() {
  const allProtocols = await db
    .select({
      id: protocols.id,
      name: protocols.name,
      description: protocols.description,
      category: protocols.category,
      durationWeeks: protocols.durationWeeks,
      hasPhases: protocols.hasPhases,
      isActive: protocols.isActive,
    })
    .from(protocols)
    .orderBy(asc(protocols.name));

  const result = [];

  for (const protocol of allProtocols) {
    const rules = await db
      .select({
        id: protocolRules.id,
        ruleType: protocolRules.ruleType,
        propertyName: protocolRules.propertyName,
        propertyValues: protocolRules.propertyValues,
        status: protocolRules.status,
        ruleOrder: protocolRules.ruleOrder,
        notes: protocolRules.notes,
      })
      .from(protocolRules)
      .where(eq(protocolRules.protocolId, protocol.id))
      .orderBy(asc(protocolRules.ruleOrder));

    result.push({ ...protocol, rules });
  }

  return { protocols: result };
}

export async function handleUpdateProtocolRule(input: UpdateProtocolRuleInput) {
  const [protocol] = await db
    .select({ id: protocols.id, name: protocols.name })
    .from(protocols)
    .where(ilike(protocols.name, input.protocol_name))
    .limit(1);

  if (!protocol) {
    return { error: `Protocol "${input.protocol_name}" not found.` };
  }

  let existingConditions = and(
    eq(protocolRules.protocolId, protocol.id),
    eq(protocolRules.ruleType, input.rule_type)
  );

  if (input.property_name) {
    existingConditions = and(
      existingConditions,
      eq(protocolRules.propertyName, input.property_name)
    );
  }

  const [existing] = await db
    .select({ id: protocolRules.id })
    .from(protocolRules)
    .where(existingConditions!)
    .limit(1);

  if (existing) {
    await db
      .update(protocolRules)
      .set({
        propertyValues: input.property_values,
        status: input.status,
        notes: input.notes ?? null,
      })
      .where(eq(protocolRules.id, existing.id));

    return {
      success: true,
      action: "updated",
      protocol: protocol.name,
      rule: {
        ruleType: input.rule_type,
        propertyName: input.property_name,
        propertyValues: input.property_values,
        status: input.status,
        notes: input.notes,
      },
    };
  }

  const [maxOrder] = await db
    .select({ max: sql<number>`COALESCE(MAX(${protocolRules.ruleOrder}), 0)` })
    .from(protocolRules)
    .where(eq(protocolRules.protocolId, protocol.id));

  const nextOrder = (maxOrder?.max ?? 0) + 1;

  const [newRule] = await db
    .insert(protocolRules)
    .values({
      protocolId: protocol.id,
      ruleType: input.rule_type,
      propertyName: input.property_name ?? null,
      propertyValues: input.property_values,
      status: input.status,
      ruleOrder: nextOrder,
      notes: input.notes ?? null,
    })
    .returning({ id: protocolRules.id });

  return {
    success: true,
    action: "created",
    protocol: protocol.name,
    rule: {
      id: newRule.id,
      ruleType: input.rule_type,
      propertyName: input.property_name,
      propertyValues: input.property_values,
      status: input.status,
      ruleOrder: nextOrder,
      notes: input.notes,
    },
  };
}
