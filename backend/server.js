import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import assignmentRoute from "./routes/assignment.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

// ROUTES
app.get("/", (req, res) => {
  res.status(200).send("server is running.");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoute);

// START SERVER AND CONNECT TO DB
app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});
