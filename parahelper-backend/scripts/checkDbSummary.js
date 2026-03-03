require("dotenv").config();
const { MongoClient } = require("mongodb");

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const admin = client.db().admin();
  const dbs = await admin.listDatabases();
  console.log("Databases:", dbs.databases.map((d) => d.name).join(", "));

  for (const dbInfo of dbs.databases) {
    if (!dbInfo.name.startsWith("parahelper")) continue;
    const db = client.db(dbInfo.name);
    const cols = await db.listCollections().toArray();
    console.log(`\nDB: ${dbInfo.name}`);
    for (const col of cols) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count}`);
    }
  }

  await client.close();
}

run().catch((err) => {
  console.error("DB check failed:", err.message);
  process.exit(1);
});
