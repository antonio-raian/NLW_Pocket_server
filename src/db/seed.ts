import dayjs from "dayjs";
import { client, db } from ".";
import { goalCompleted, goals } from "./schema";

async function seed() {
  await db.delete(goalCompleted);
  await db.delete(goals);

  const result = await db
    .insert(goals)
    .values([
      {
        title: "Learn TypeScript",
        desiredWeeklyFrequency: 3,
      },
      {
        title: "Learn GraphQL",
        desiredWeeklyFrequency: 3,
      },
      {
        title: "Learn Prisma",
        desiredWeeklyFrequency: 3,
      },
    ])
    .returning();

  const startweek = dayjs().startOf("week");

  await db.insert(goalCompleted).values([
    {
      goalId: result[0].id,
      completedAt: startweek.toDate(),
    },
    {
      goalId: result[1].id,
      completedAt: startweek.add(1, "day").toDate(),
    },
  ]);
}

seed().finally(() => client.end());
