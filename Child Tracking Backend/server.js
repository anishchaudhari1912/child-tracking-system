const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./Config/db");
const userRoutes = require("./routes/userRoutes");
const childRoutes = require("./routes/childRoutes");
const locationRoutes = require("./routes/locationRoutes");

const app = express();

/* ✅ LOGGER FIRST */
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

/* ✅ CORS */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://child-tracking-system.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



/* ✅ BODY PARSER */
app.use(express.json());

/* ✅ ROUTES */
app.use("/user", userRoutes);
app.use("/child", childRoutes);
app.use("/location", locationRoutes);

/* ✅ ROOT ROUTE */
app.get("/", (req, res) => {
  res.send("Child Tracking Backend Running");
});

/* ✅ 404 (ALWAYS LAST) */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
