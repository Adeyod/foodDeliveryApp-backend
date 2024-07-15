import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = () => {
  mongoose
    .connect(process.env.mongoDB_URL)
    .then(() => {
      console.log(
        `MongoDB connected successfully with host: ${mongoose.connection.host}`
      );
    })
    .catch((error) => {
      console.log('MongoDB failed to connect', error);
      process.exit(1);
    });
};

export default dbConfig;

// colors to use for UI
