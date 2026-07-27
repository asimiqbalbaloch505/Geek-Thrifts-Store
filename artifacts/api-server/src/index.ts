import app from "./app";
import { logger } from "./lib/logger";
import { seedIfEmpty } from "./lib/seed";

// Vercel / Production par fallback port (e.g. 3000 ya 5000) allow karein crash karne ke bajaye
const port = Number(process.env["PORT"]) || 3000;

app.listen(port, async (err?: any) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  try {
    await seedIfEmpty();
  } catch (seedErr) {
    logger.error({ seedErr }, "Seeding failed, but server continues running");
  }
});

export default app;