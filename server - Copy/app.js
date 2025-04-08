import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import SendBird from 'sendbird';
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import miscRoutes from "./routes/miscellaneousRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import NodeCache from "node-cache";
import sellerRoutes from "./routes/sellerRoutes.js";
import earningsRoutes from "./routes/earningsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerProductRoutes from "./routes/sellerProductRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
dotenv.config();
const app = express();
export const myCache = new NodeCache();

// Initialize SendBird client
const sb = new SendBird({
  appId: process.env.SENDBIRD_APP_ID
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// SendBird authentication endpoint
app.post("/chat/token", async (req, res) => {
  const { userId, username, groupName } = req.body;

  try {
    let user;
    let isExisting = false;

    // Try to get existing user
    try {
      user = await sb.connect(userId);
      isExisting = true;
    } catch (error) {
      // If user doesn't exist, create new user
      user = await sb.connect(userId);
      await sb.updateCurrentUserInfo(username, null);
    }

    // Create or get channel
    const params = new sb.GroupChannelParams();
    params.isPublic = true;
    params.name = groupName || 'General Chat';
    const channelUrl = (groupName || 'general').toLowerCase().replace(/[^a-z0-9]/g, '-');
    params.channelUrl = channelUrl;
    params.operatorUserIds = [userId];

    let channel;
    try {
      // Try to get existing channel
      channel = await sb.GroupChannel.getChannel(channelUrl);
    } catch (error) {
      // If channel doesn't exist, create new one
      channel = await sb.GroupChannel.createChannel(params);
    }

    // Add user to channel if not already a member
    if (!channel.members.some(member => member.userId === userId)) {
      await channel.join();
    }

    // Include the session token and existing user flag in the response
    res.json({
      session: user.token || user.accessToken,
      userId: user.userId,
      appId: process.env.SENDBIRD_APP_ID,
      channelUrl: channel.url,
      isExisting
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: "Error connecting to chat",
      error: error.message
    });
  }
});

// Join channel endpoint
app.post("/chat/join-channel", async (req, res) => {
  const { userId, channelUrl, username } = req.body;

  try {
    // Connect user if not already connected
    await sb.connect(userId);

    // Get the channel
    const channel = await sb.GroupChannel.getChannel(channelUrl);

    // Join the channel
    await channel.join();

    // Send join message
    const params = new sb.UserMessageParams();
    params.message = `${username} joined the channel`;
    await channel.sendUserMessage(params);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Error joining channel",
      error: error.message
    });
  }
});

// Other routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1", miscRoutes);
app.use("/api/v1/seller", sellerRoutes);
app.use("/api/v1/earnings", earningsRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/seller/products", sellerProductRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/ping", (req, res) => {
  res.send("Server is working");
});

app.all("*", (req, res) => {
  res.status(404).send(`!oops page not found`);
});

app.use(errorMiddleware);

export default app;
