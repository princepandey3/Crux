import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

console.log("API Key starts with:", process.env.GOOGLE_API_KEY?.slice(0, 10));

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "text-embedding-004",
});

try {
  const result = await embeddings.embedQuery("test sentence");
  console.log("✅ Embedding works! Dimensions:", result.length);
} catch (e) {
  console.error("❌ Embedding failed:", e.message);
}
