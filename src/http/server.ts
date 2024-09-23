import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { creategoal } from "../functions/create-goal";
import { createGoalCompletion } from "../functions/create-goal-complition";
import { getWeekPendingGoals } from "../functions/get-week-pending-goals";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get("/", async () => {
  return { hello: "world" };
});

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

app.get("/pending-goals", async () => {
  const pendingGoals = await getWeekPendingGoals();
  return pendingGoals;
});

app.post(
  "/goal-completion",
  { schema: { body: z.object({ goalId: z.string() }) } },
  async (request) => {
    const body = request.body;
    const result = await createGoalCompletion(body);
    return result;
  }
);

app.listen({ port: 3000 }).then(() => {
  console.log("Server listening on port 3000");
});
