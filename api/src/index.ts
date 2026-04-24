import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import uploadRoutes from "./routes/upload";
import messagesRoutes from "./routes/messages";
import companionsRoutes from "./routes/companions";
import usersRoutes from "./routes/users";
import bookingsRoutes from "./routes/bookings";
import favoritesRoutes from "./routes/favorites";
import reviewsRoutes from "./routes/reviews";
import companionProfileRoutes from "./routes/companion-profile";
import verificationRoutes, { companionStatusRouter } from "./routes/verification";

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/companions", companionsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/companion", companionProfileRoutes);
app.use("/api/companion", companionStatusRouter);
app.use("/api/verification", verificationRoutes);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
