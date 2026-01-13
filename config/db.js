import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

export const connectDB = async (retryCount = 0) => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const connection = await mongoose.connect(mongoURI, options);

        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);

        // Handle connection events
        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("🔄 MongoDB reconnected");
        });

    } catch (error) {
        console.error(`❌ MongoDB connection error (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);

        if (retryCount < MAX_RETRIES - 1) {
            console.log(`🔄 Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectDB(retryCount + 1);
        }

        console.error("❌ Max retries reached. Exiting...");
        process.exit(1);
    }
};