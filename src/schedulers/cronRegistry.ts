const cronJobs = ["./appointment-completed.ts", "./appointment-reminder.ts"];

cronJobs.forEach(async (jobPath) => {
  try {
    await import(jobPath);
    console.log(`✅ Cron job loaded: ${jobPath}`);
  } catch (err) {
    console.error(`❌ Failed to load cron job: ${jobPath}`, err);
  }
});
