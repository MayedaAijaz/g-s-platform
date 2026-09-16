import app from "./app.js";
import { env } from "./config/env.js";
import { db } from "./db/client.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `[GS Medcure API] ⚡ Running on port ${env.PORT} [${env.NODE_ENV}]`
  );
  console.log(`[GS Medcure API] ⚠️  SYNTHETIC DEMO DATA — not production data`);
});

process.on("SIGTERM", async () => {
  console.log("[GS Medcure API] SIGTERM received — shutting down gracefully");
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
});

export default server;
