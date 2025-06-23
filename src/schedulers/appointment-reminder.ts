import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { AppointmentStatus } from "@utils/enum";
import { CRON_EXPRESSIONS } from "@utils/constants";
import { sendNotification } from "@utils/notification";
import { startOfDay, endOfDay } from "date-fns";
import { formatTime } from "@utils/helper";

const todayStart = startOfDay(new Date()); // 00:00:00
const todayEnd = endOfDay(new Date()); // 23:59:59

const prisma = new PrismaClient();

cron.schedule(CRON_EXPRESSIONS.EVERY_10_MINUTES, async () => {
  const now = new Date();

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: {
          notIn: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
        },
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        notificationSent: false,
      },
      include: {
        customer: {
          select: {
            notificationToken: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (appointments.length === 0) {
      console.log("⏰ No appointments reminder.");
      return;
    }

    for (const appt of appointments) {
      if (!appt.startTime) continue;
      const startDateTime = new Date(appt.startTime);
      const diffInMs = startDateTime.getTime() - now.getTime();
      const diffInMin = Math.floor(diffInMs / 1000 / 60);

      if (diffInMin < 0) {
        console.log(
          `⏰ Appointment already started ${Math.abs(diffInMin)} minutes ago`
        );
        continue;
      }

      if (
        diffInMin >= 4 &&
        diffInMin <= 6 &&
        appt.customer?.notificationToken &&
        !appt.notificationSent
      ) {
        // await sendNotification(
        //   appt.customer.notificationToken,
        //   "Appointment Reminder",
        //   `Hi ${
        //     appt.customer.firstName || "there"
        //   }, your appointment starts at ${formatTime(appt.startTime)}`
        // );
        console.log(`🔔 Sent reminder for appointment ID: ${appt.id}
                    Hi ${
                      appt.customer.firstName || "there"
                    }, your appointment starts at ${formatTime(appt.startTime)}
        )`);

        // ✅ Mark notification as sent
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { notificationSent: true },
        });
      }
    }
  } catch (err) {
    console.error("❌ Error in reminder cron job:", err);
  }
});
