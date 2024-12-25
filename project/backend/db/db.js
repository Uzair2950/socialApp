// const { MongoClient } = require('mongodb');

// const uri = "mongodb://localhost:27017/";
// const client = new MongoClient(uri);

// async function run() {
//     try {
//         await client.connect();
//         console.log("Connected to MongoDB");
//     } finally {
//         await client.close();
//     }
// }

// run().catch(console.dir);
import mongoose from 'mongoose';

const uri = "mongodb://localhost:27017/";
const DB_NAME = "SocialApp"; // Updated database name

const connectDB = async () => {
    try {
        // Connect to MongoDB using Mongoose with the SocialApp database
        await mongoose.connect(`${uri}${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to SocialApp database with Mongoose");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

// Call the connectDB function
connectDB();
