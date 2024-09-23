import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createCompletionRoute } from "./routes/create-conpletion";
import { createGoalsRoute } from "./routes/create-goals";
import { getPendingRoute } from "./routes/get-pending-goal";
import { getWeekSummaryRoute } from "./routes/get-week-summary";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get("/", async () => {
  return { hello: "world" };
});

app.register(createGoalsRoute);
app.register(createCompletionRoute);
app.register(getPendingRoute);
app.register(getWeekSummaryRoute);

app.listen({ port: 3000 }).then(() => {
  console.log("Server listening on port 3000");
});
