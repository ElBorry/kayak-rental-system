import clientPromise from "../lib/mongodb-setup.js"; // Usa ".js" aquí porque estás en ES Modules

async function seedKayaks() {
  const client = await clientPromise;
  const db = client.db();

  const kayaks = [
    { id: "KAYAK-001", name: "Kayak 1", type: "simple", available: true },
    { id: "KAYAK-002", name: "Kayak 2", type: "simple", available: true },
    { id: "KAYAK-003", name: "Kayak 3", type: "simple", available: true },
    { id: "KAYAK-004", name: "Kayak 4", type: "simple", available: true },
    { id: "KAYAK-005", name: "Kayak 5", type: "simple", available: true },
    { id: "KAYAK-006", name: "Kayak 6", type: "simple", available: true },
    { id: "KAYAK-007", name: "Kayak 7", type: "simple", available: true },
    { id: "KAYAK-008", name: "Kayak 8", type: "simple", available: true },
    { id: "KAYAK-009", name: "Kayak 9", type: "simple", available: true },
    { id: "KAYAK-010", name: "Kayak 10", type: "simple", available: true },
    { id: "SUP-011", name: "Tabla Stand Up Paddle", type: "sup", available: true }
  ];

  await db.collection("kayaks").insertMany(kayaks);
  console.log("✅ Kayaks insertados en MongoDB");
}

seedKayaks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error insertando kayaks:", error);
    process.exit(1);
  });
