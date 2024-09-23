import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getWeekSumary } from "../../functions/get-week-sumary";

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/summary", async () => {
    const result = await getWeekSumary();
    return result;
  });
};
