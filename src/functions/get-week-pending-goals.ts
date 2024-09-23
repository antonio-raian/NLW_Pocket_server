import dayjs from "dayjs";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompleted, goals } from "../db/schema";

export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalsCreatedUpToWeek = db.$with("goals_created_up_to_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        created_at: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  );

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
          lte(goalCompleted.completedAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompleted.goalId)
  );

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalsCompletedCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount:
        sql/*sql*/ `COALESCE(${goalsCompletedCounts.completionCount}, 0)`.mapWith(
          Number
        ),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalsCompletedCounts,
      eq(goalsCreatedUpToWeek.id, goalsCompletedCounts.goalId)
    );

  return {
    pendingGoals,
  };
}
