import "dotenv/config";

const apiKey = process.env.GOOGLE_API_KEY;
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
);
const data = await response.json();

// Show only embedding models
const embeddingModels = data.models?.filter((m) =>
  m.supportedGenerationMethods?.includes("embedContent"),
);
console.log("Available embedding models:");
embeddingModels?.forEach((m) => console.log(" -", m.name));
