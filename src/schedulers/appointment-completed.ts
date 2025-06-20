import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { CRON_EXPRESSIONS } from "@utils/constants";

const prisma = new PrismaClient();

cron.schedule(CRON_EXPRESSIONS.EVERY_30_MINUTES, async () => {
  const now = new Date();

  try {
    await prisma.appointment.updateMany({
      where: {
        startTime: {
          lte: now,
        },
        status: {
          not: "COMPLETED",
        },
      },
      data: {
        status: "COMPLETED",
      },
    });

    console.log("✅ Marked past appointments as COMPLETED");
  } catch (err) {
    console.error("❌ Error updating appointments:", err);
  }
});
