import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { AppointmentStatus } from "@utils/enum";
import { CRON_EXPRESSIONS } from "@utils/constants";

const prisma = new PrismaClient();

cron.schedule(CRON_EXPRESSIONS.EVERY_10_SECONDS, async () => {
  const now = new Date();
  try {
    // Step 1: Find appointments that need to be updated
    const appointments = await prisma.appointment.findMany({
      where: {
        endTime: {
          lte: now,
        },
        status: {
          not: AppointmentStatus.COMPLETED,
        },
      },
      select: {
        id: true,
      },
    });

    if (appointments.length === 0) {
      console.log("ℹ️  No appointments to update.");
      return;
    }

    const appointmentIds = appointments.map((a) => a.id);
    console.log("🆔 Updating appointments with IDs:", appointmentIds);

    // Step 2: Update them
    await prisma.appointment.updateMany({
      where: {
        id: {
          in: appointmentIds,
        },
      },
      data: {
        status: AppointmentStatus.COMPLETED,
      },
    });

    console.log("✅ Marked past appointments as COMPLETED.");
  } catch (err) {
    console.error("❌ Error updating appointments:", err);
  }
});
