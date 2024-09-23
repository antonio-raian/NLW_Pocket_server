import { db } from "../db";
import { goals } from "../db/schema";

export interface CreateGoalRequest {
  title: string;
  desiredWeeklyFrequency: number;
}
export async function creategoal({
  title,
  desiredWeeklyFrequency,
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({ title, desiredWeeklyFrequency })
    .returning();

  return { goal: result[0] };
}
