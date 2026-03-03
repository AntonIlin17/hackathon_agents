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
        audit_log: [],
      },
    },
    { upsert: true }
  );
  return getScene(sceneId);
}

async function appendAudit(sceneId, entry) {
  const db = await getDb("parahelper_conversations");
  await db.collection("scene_sessions").updateOne(
    { scene_id: sceneId },
    {
      $push: {
        audit_log: {
          ...entry,
          at: new Date(),
        },
      },
    }
  );
}

module.exports = { getScene, upsertScene, appendAudit };
