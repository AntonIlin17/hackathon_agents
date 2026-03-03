const { MongoClient } = require("mongodb");

let mongoClient;

async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment.");
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
  }
  return mongoClient;
}

async function getDb(dbName) {
  const client = await getMongoClient();
  return client.db(dbName);
}

async function closeMongo() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = undefined;
  }
}

module.exports = { getMongoClient, getDb, closeMongo };
