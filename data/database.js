import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "commerceApp",
    });

    console.log(`Server connected to database ${connection.host}`);
  } catch (e) {
    console.log(`Database connection failed with error ${e.message}`);
    console.log(e);
    process.exit(1);
  }
};
