import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./src/routes/index.route";
import fileUpload from "express-fileupload";
import { authMiddleware } from "@middlewares/auth";
import "./src/schedulers/cronRegistry";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(fileUpload());

// Health check or root test route
app.get("/", (req, res) => {
  res.send("🚀 API is working!");
});

// Wrap async middleware manually
app.use((req, res, next) => {
  authMiddleware(req, res, next).catch(next);
});

// [ Routes ]
app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT} 🎉🎇`);
});
