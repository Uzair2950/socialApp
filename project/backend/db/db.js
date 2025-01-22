import mongoose from "mongoose";

const uri = "mongodb://localhost:27017/";
const DB_NAME = "SocialApp";

const connectDB = async () => {
    try {
        await mongoose.connect(`${uri}${DB_NAME}`);
        console.log(`Connected to ${DB_NAME} database with Mongoose`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
    }
};

export default connectDB;
