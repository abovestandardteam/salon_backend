export const CONSTANTS = {
  customer: {
    createSuccess: "Customer created successfully.",
    updateSuccess: "Customer updated successfully.",
    deleteSuccess: "Customer deleted successfully.",
    foundSuccess: "Customer found successfully.",
    notFound: "Customer not found.",
    mobileAlreadyExists: "Mobile number already in use by another user",
  },
  service: {
    createSuccess: "Service created successfully.",
    updateSuccess: "Service updated successfully.",
    deleteSuccess: "Service deleted successfully.",
    foundSuccess: "Service found successfully.",
    notFound: "Service not found.",
    isInUse:
      "Cannot delete service because it is associated with a pending appointment.",
  },
  appointment: {
    createSuccess: "Appointment booked successfully.",
    updateSuccess: "Appointment updated successfully.",
    deleteSuccess: "Appointment deleted successfully.",
    foundSuccess: "Appointment found successfully.",
    notFound: "Appointment not found.",
    notBookableInPast: "Cannot book an appointment in the past.",
  },
  leave: {
    createSuccess: "Leave created successfully.",
    updateSuccess: "Leave updated successfully.",
    deleteSuccess: "Leave deleted successfully.",
    foundSuccess: "Leave found successfully.",
    notFound: "Leave not found.",
  },
  salon: {
    createSuccess: "Salon created successfully.",
    updateSuccess: "Salon updated successfully.",
    deleteSuccess: "Salon deleted successfully.",
    foundSuccess: "Salon found successfully.",
    close: "Salon is closed today.",
    notFound: "Salon not found.",
  },
  salonUser: {
    createSuccess: "User created successfully.",
    updateSuccess: "User updated successfully.",
    deleteSuccess: "User deleted successfully.",
    foundSuccess: "User found successfully.",
    notFound: "User not found.",
    invalidCredntials: "Invalid credentials",
    loginSuccess: "Login successful.",
  },
  common: {
    error: "Something went wrong.",
    pleaseLogin: "Please login to continue.",
  },
};

export const CRON_EXPRESSIONS = {
  EVERY_5_SECONDS: "*/5 * * * * *",
  EVERY_10_SECONDS: "*/10 * * * * *",
  EVERY_MINUTE: "* * * * *",
  EVERY_5_MINUTES: "*/5 * * * *",
  EVERY_10_MINUTES: "*/10 * * * *",
  EVERY_30_MINUTES: "*/30 * * * *",
  EVERY_HOUR: "0 * * * *",
  EVERY_DAY_MIDNIGHT: "0 0 * * *",
};
