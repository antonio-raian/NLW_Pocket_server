import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { creategoal } from "../../functions/create-goal";

export const createGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/goals",
    {
      schema: {
        body: z.object({
          title: z.string(),
          desiredWeeklyFrequency: z.number().min(1).max(7),
        }),
      },
    },
    async (request) => {
      const body = request.body;
      const { goal } = await creategoal(body);
      return goal;
    }
  );
};
