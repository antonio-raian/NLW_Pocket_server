import dayjs from "dayjs";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompleted, goals } from "../db/schema";

export interface CreateGoalCompletionRequest {
  goalId: string;
}
export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();
  const goalsCompletedCounts = db.$with("goals_completed_counts").as(
    db
      .select({
        goalId: goalCompleted.goalId,
        completionCount: count(goalCompleted.id).as("count"),
      })
      .from(goalCompleted)
      .where(
        and(
          gte(goalCompleted.completedAt, firstDayOfWeek),
          lte(goalCompleted.completedAt, lastDayOfWeek),
          eq(goalCompleted.goalId, goalId)
        )
      )
      .groupBy(goalCompleted.goalId)
  );

  const data = await db
    .with(goalsCompletedCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount:
        sql/*sql*/ `COALESCE(${goalsCompletedCounts.completionCount}, 0)`.mapWith(
          Number
        ),
    })
    .from(goals)
    .where(eq(goals.id, goalId))
    .leftJoin(goalsCompletedCounts, eq(goals.id, goalsCompletedCounts.goalId));

  const { completionCount, desiredWeeklyFrequency } = data[0];

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error("Goal is already completed");
  }

  const result = await db.insert(goalCompleted).values({ goalId }).returning();

  return { goal: result[0] };
}
