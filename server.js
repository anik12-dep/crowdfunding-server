const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectToMongoDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Crowdfunding Server is Running");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToMongoDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
