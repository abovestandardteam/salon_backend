import { admin } from "config/firebase";

export const sendNotification = async (
  token: string,
  title: string,
  body: string
): Promise<void> => {
  const message: admin.messaging.Message = {
    token,
    notification: {
      title,
      body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Notification error:", error);
  }
};
