export const protectedRoutes = [
  // salon
  {
    path: "/salon/add",
    method: ["POST"],
  },

  // appointment
  {
    path: "/appointment/get-all",
    method: ["GET"],
  },

  // service
  {
    path: "/service/add",
    method: ["POST"],
  },
  {
    path: "/service/update/:id",
    method: ["PUT"],
  },
  {
    path: "/service/delete/:id",
    method: ["DELETE"],
  },

  // Leave
  {
    path: "/leave/add",
    method: ["POST"],
  },
];
