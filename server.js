import express from "express";
import userRoute from "./project/backend/routes/userRoutes.js";
import studentRoute from "./project/backend/routes/studentRoute.js"
import postRoute from "./project/backend/routes/postsRoute.js"
import postGroupRoute from "./project/backend/routes/postGroupRoute.js"
import notificationRoute from "./project/backend/routes/notificationRoute.js"
import feedRoute from "./project/backend/routes/feedRoute.js"
import communityRoute from "./project/backend/routes/communityRoute.js"
import chatRoute from "./project/backend/routes/chatRoute.js"
import chatGroupRoute from "./project/backend/routes/chatGroupRoute.js"
import connectDB from "./project/backend/db/db.js";
import cors from 'cors';  // Correct way to import cors

const app = express();
const PORT = 3000;

// Connect to the database
connectDB();

// Enable CORS for all routes (you can also configure it for specific routes)
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with the domain you want to allow
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
};
app.use(cors(corsOptions));

// Middleware for parsing JSON
app.use(express.json());

// Use the userRoutes for /user paths
app.use("/user", userRoute);

// Use the StudentRoutes for /Student Paths
app.use("/student",studentRoute)
app.use("postGroup",postGroupRoute)
app.use("notification",notificationRoute)
app.use("feed",feedRoute)
app.use("community",communityRoute)
app.use("chat",chatRoute)
app.use("chatGroup",chatGroupRoute)

app.use("/post", postRoute)
// Root route
app.get("/", (req, res) => {
    res.send("Backend server is running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
