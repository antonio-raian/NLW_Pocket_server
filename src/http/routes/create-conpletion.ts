import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { createGoalCompletion } from "../../functions/create-goal-complition";

export const createCompletionRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/goal-completion",
    { schema: { body: z.object({ goalId: z.string() }) } },
    async (request) => {
      const body = request.body;
      const result = await createGoalCompletion(body);
      return result;
    }
  );
};
