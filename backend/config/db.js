import mongoose from "mongoose";

export default async function db() {
  if (!process.env.MONGODB) {
    throw new Error("MONGODB environment variable is not defined");
  }

  if (mongoose.connection.readyState >= 1) {
    console.log("Already connected");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("database connected");
  } catch (e) {
    console.log("MongoDB connection error:", e);
    throw e;
  }
}
