import dayjs from "dayjs";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompleted, goals } from "../db/schema";

export async function getWeekSumary() {
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

  const goalsCompletedInWeek = db.$with("goals_completed_in_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        createdAt: goalCompleted.completedAt,
        completedAtDate: sql`DATE(${goalCompleted.completedAt})`.as(
          "completedAtDate"
        ),
      })
      .from(goalCompleted)
      .innerJoin(goals, eq(goals.id, goalCompleted.goalId))
      .where(
        and(
          gte(goalCompleted.completedAt, firstDayOfWeek),
          lte(goalCompleted.completedAt, lastDayOfWeek)
        )
      )
  );

  const goasCompletedByWeekDay = db.$with("goals_completed_by_week_day").as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql/*sql*/ `
        JSON_AGG(
          JSONB_BUILD_OBJECT(
            'id', ${goalsCompletedInWeek.id},
            'title', ${goalsCompletedInWeek.title},
            'completedAtDate', ${goalsCompletedInWeek.completedAtDate}
          )
        )`.as("completions"),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
  );

  const data = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goasCompletedByWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
        Number
      ),
      total:
        sql`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql`JSON_OBJECT_AGG(${goasCompletedByWeekDay.completedAtDate}, ${goasCompletedByWeekDay.completions})`,
    })
    .from(goasCompletedByWeekDay);

  return { summary: data };
}
