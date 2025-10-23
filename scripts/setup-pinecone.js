/**
 * 🚀 PINECONE SETUP SCRIPT
 *
 * Run this script to set up your Pinecone vector database:
 * 1. Create index
 * 2. Index existing content (courses, lessons, books)
 *
 * Usage: node scripts/setup-pinecone.js
 */

const { Pinecone } = require("@pinecone-database/pinecone");

const PINECONE_API_KEY =
  process.env.PINECONE_API_KEY ||
  "pcsk_2bEfDD_6MFHVBXm258jo9RGBW1HDfjTjLr7YqXaEgKPr1RXuQeFcQivj2UbSHE7kDLuqJE";
const INDEX_NAME = "dynasty-academy";
const DIMENSION = 1536; // OpenAI text-embedding-3-small dimensions

async function setupPinecone() {
  console.log("🚀 Starting Pinecone setup...\n");

  try {
    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });

    console.log("✅ Connected to Pinecone");

    // List existing indexes
    const indexes = await pinecone.listIndexes();
    console.log(
      `📊 Existing indexes: ${
        indexes.indexes?.map((i) => i.name).join(", ") || "none"
      }`
    );

    // Check if index already exists
    const indexExists = indexes.indexes?.some((i) => i.name === INDEX_NAME);

    if (indexExists) {
      console.log(`✅ Index "${INDEX_NAME}" already exists`);
    } else {
      console.log(`📦 Creating index "${INDEX_NAME}"...`);

      await pinecone.createIndex({
        name: INDEX_NAME,
        dimension: DIMENSION,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });

      console.log("✅ Index created successfully");
      console.log("⏳ Waiting for index to be ready...");

      // Wait for index to be ready
      let ready = false;
      while (!ready) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const description = await pinecone.describeIndex(INDEX_NAME);
        ready = description.status?.ready === true;
        console.log(`   Status: ${description.status?.state || "unknown"}`);
      }

      console.log("✅ Index is ready!");
    }

    // Get index stats
    const index = pinecone.index(INDEX_NAME);
    const stats = await index.describeIndexStats();

    console.log("\n📊 Index Statistics:");
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimension: ${stats.dimension || DIMENSION}`);

    if (stats.namespaces) {
      console.log("   Namespaces:");
      Object.entries(stats.namespaces).forEach(([name, ns]) => {
        console.log(`     - ${name}: ${ns.recordCount || 0} vectors`);
      });
    }

    console.log("\n🎉 Pinecone setup complete!");
    console.log("\n📝 Next steps:");
    console.log("   1. Make sure PINECONE_API_KEY is in your .env.local");
    console.log("   2. Run the app: npm run dev");
    console.log(
      "   3. Go to: http://localhost:3000/api/ai/index-content (POST request as admin)"
    );
    console.log("   4. This will index all your courses, lessons, and books");
    console.log("\n💡 Or use the admin dashboard to index content via UI\n");
  } catch (error) {
    console.error("❌ Error setting up Pinecone:", error);
    console.error("\nTroubleshooting:");
    console.error("  - Check your PINECONE_API_KEY is correct");
    console.error("  - Make sure you have an active Pinecone account");
    console.error("  - Check your internet connection");
    process.exit(1);
  }
}

setupPinecone();
