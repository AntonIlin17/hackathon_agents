const { getDb } = require("./mongodb");

async function getScene(sceneId) {
  const db = await getDb("parahelper_conversations");
  return db.collection("scene_sessions").findOne({ scene_id: sceneId });
}

async function upsertScene(sceneId, updates) {
  const db = await getDb("parahelper_conversations");
  await db.collection("scene_sessions").updateOne(
    { scene_id: sceneId },
    {
      $set: {
        ...updates,
        scene_id: sceneId,
        updated_at: new Date(),
      },
      $setOnInsert: {
        created_at: new Date(),
      },
    },
    { upsert: true }
  );
  return getScene(sceneId);
}

module.exports = { getScene, upsertScene };
