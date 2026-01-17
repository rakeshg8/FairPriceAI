import { getCohereClient } from "./embeddingService";
import { supabase } from "@/lib/supabase";

/**
 * Find similar products from Supabase using Cohere embeddings.
 */
export async function findSimilarProducts(query: string) {
  try {
    if (!query || query.trim().length < 2) {
      console.warn("⚠️ Empty or too short query provided.");
      return [];
    }

    // Step 1: Get embedding from Cohere
    const cohereClient = getCohereClient();
    const embedResponse = await cohereClient.embed({
      model: "embed-english-v3.0",
      texts: [query],
      input_type: "search_query", // use "search_query" for queries
    });

    const embeddings = embedResponse.embeddings;
    if (!embeddings || embeddings.length === 0) {
      console.error("❌ Cohere returned empty embedding:", embedResponse);
      return [];
    }

    const queryEmbedding = embeddings[0];

    // Step 2: Perform similarity search in Supabase
    const { data, error } = await supabase.rpc("match_product_embeddings", {
      query_embedding: queryEmbedding,
      match_threshold: 0.75,
      match_count: 5,
    });

    if (error) {
      console.error("❌ Error in similarity search:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("🔥 findSimilarProducts() failed:", err);
    return [];
  }
}

