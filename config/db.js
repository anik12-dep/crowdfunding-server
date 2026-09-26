const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

async function disconnectFromMongoDB() {
  await client.close();
}

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB,
  client,
};
