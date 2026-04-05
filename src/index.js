import mongoose from "mongoose";
import app from "./app.js";
import config from "./config/index.js";

const startServer = async () => {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

startServer().catch(console.error);
