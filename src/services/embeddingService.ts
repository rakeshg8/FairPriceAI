import 'dotenv/config';
import { pipeline } from "@xenova/transformers";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { CohereClient } from 'cohere-ai'; // Named import for the latest SDK

let cohereClient: CohereClient | null = null;


/** Initialize Cohere safely */
export function getCohereClient(): CohereClient {
  if (!cohereClient) {
    if (!process.env.CO_API_KEY)
      throw new Error('Missing CO_API_KEY in .env');
    cohereClient = new CohereClient({ apiKey: process.env.CO_API_KEY });
  }
  return cohereClient;
}

/** ------------------------------
 * 🧠 Get embedding vector from Cohere
 * ------------------------------ */
async function getCohereEmbedding(text: string): Promise<number[]> {
  const client = getCohereClient(); // always initialized
  try {
    const response = await client.embed({
      model: 'embed-english-v3.0',
      texts: [text], // latest SDK uses `input` instead of `texts`
      input_type: 'search_document',
    });

    const embedding = response.embeddings[0];

    if (!Array.isArray(embedding) || typeof embedding[0] !== 'number') {
      throw new Error('Invalid embedding format from Cohere');
    }

    return embedding;
  } catch (err) {
    console.error('⚠️ Cohere embedding error:', err);
    throw err;
  }
}

/** ------------------------------
 * 🧠 Store Single Product Embedding
 * ------------------------------ */
export async function storeProductEmbedding(
  productName: string,
  description: string,
  mrp: number
) {
  const text = `${productName}. ${description}. MRP: ${mrp} INR.`;
  const embedding = await getCohereEmbedding(text);

  const { error } = await supabase.from('product_embeddings').insert([
    { product_name: productName, description, mrp, embedding },
  ]);

  if (error) {
    console.error('❌ Error saving embedding:', error);
    throw error;
  } else {
    console.log('✅ Embedding stored successfully for', productName);
  }
}

/** ------------------------------
 * 🔁 Backfill Missing Embeddings
 * ------------------------------ */
export async function backfillMissingEmbeddings(batchSize = 20) {
  const { data: rows, error: fetchErr } = await supabase
    .from('product_embeddings')
    .select('id, product_name, description, mrp')
    .is('embedding', null)
    .limit(batchSize);

  if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
  if (!rows?.length) {
    console.log('✅ No missing embeddings to backfill.');
    return;
  }

  for (const row of rows) {
    const input = `${row.product_name}. ${row.description}. MRP: ${row.mrp} INR.`;
    try {
      const embedding = await getCohereEmbedding(input);

      const { error: updErr } = await supabase
        .from('product_embeddings')
        .update({ embedding })
        .eq('id', row.id);

      if (updErr)
        console.error(`❌ Update failed for ${row.product_name}`, updErr);
      else
        console.log(
          `✅ Embedded & updated: ${row.product_name} (${embedding.length} dims)`
        );
    } catch (e) {
      console.error(`⚠️ Embedding error for ${row.product_name}:`, e);
    }
  }
}
/** ------------------------------
 * ✅ Hugging Face Setup
 * ------------------------------ */
/*const HF_API_KEY = process.env.HF_API_KEY!;
if (!HF_API_KEY) throw new Error("Missing HF_API_KEY in .env");

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"; // 384 dims

/** Get embedding vector from Hugging Face Inference API */
/*async function getHfEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`, // ✅ FIXED URL
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
    inputs: [text], 
  options: { wait_for_model: true },
   parameters: { pooling: "mean", normalize: true }
}),

    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF inference error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Flatten if needed
  const embedding = Array.isArray(data[0]) ? data[0] : data;

  // Check if valid numeric vector
  if (!Array.isArray(embedding) || typeof embedding[0] !== "number") {
    throw new Error("Invalid embedding format received from Hugging Face");
  }

  return embedding;
}

/** ------------------------------
 * 🧠 Store Single Product Embedding
 * ------------------------------ */
/*export async function storeProductEmbedding(
  productName: string,
  description: string,
  mrp: number
) {
  const text = `${productName}. ${description}. MRP: ${mrp} INR.`;
  const embedding = await getHfEmbedding(text);

  const { error } = await supabase.from("product_embeddings").insert([
    { product_name: productName, description, mrp, embedding },
  ]);

  if (error) {
    console.error("❌ Error saving embedding:", error);
    throw error;
  } else {
    console.log("✅ Embedding stored successfully for", productName);
  }
}

/** ------------------------------
 * 🔁 Backfill Missing Embeddings
 * ------------------------------ */
/*export async function backfillMissingEmbeddings(batchSize = 20) {
  const { data: rows, error: fetchErr } = await supabase
    .from("product_embeddings")
    .select("id, product_name, description, mrp")
    .is("embedding", null)
    .limit(batchSize);

  if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
  if (!rows?.length) {
    console.log("✅ No missing embeddings to backfill.");
    return;
  }

  for (const row of rows) {
    const input = `${row.product_name}. ${row.description}. MRP: ${row.mrp} INR.`;
    try {
      const embedding = await getHfEmbedding(input);

      const { error: updErr } = await supabase
        .from("product_embeddings")
        .update({ embedding })
        .eq("id", row.id);

      if (updErr)
        console.error(`❌ Update failed for ${row.product_name}`, updErr);
      else
        console.log(
          `✅ Embedded & updated: ${row.product_name} (${embedding.length} dims)`
        );
    } catch (e) {
      console.error(`⚠️ Embedding error for ${row.product_name}:`, e);
    }
  }
}*/



/*  const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1" });
const EMBEDDING_MODEL = "mistralai/mistral-embed"; // ✅ supported by OpenRouter
export async function storeProductEmbedding(productName: string, description: string, mrp: number) {
  const embeddingResponse = await openai.embeddings.create({
    //model: "text-embedding-3-small"
     model: EMBEDDING_MODEL,
    input: `${productName}. ${description}. MRP: ${mrp} INR.`,
  });
console.log("reached");
  const embedding = embeddingResponse.data[0].embedding;

  const { error } = await supabase
    .from("product_embeddings")
    .insert([
      { product_name: productName, description, mrp, embedding },
    ]);

  if (error) console.error("Error saving embedding:", error);
  else console.log("✅ Embedding stored successfully.");
};

export async function backfillMissingEmbeddings(batchSize = 20) {
  // NOTE: Use service-role key in supabase client for server-only operations
  const { data: rows, error } = await supabase
    .from("product_embeddings")
    .select("id, product_name, description, mrp")
    .is("embedding", null)
    .limit(batchSize);

  if (error) throw new Error(`Fetch error: ${error.message}`);

  for (const row of rows || []) {
    const input = `${row.product_name}. ${row.description}. MRP: ${row.mrp} INR.`;
    try {
      const resp = await openai.embeddings.create({
        //model: "text-embedding-3-small",
         model: EMBEDDING_MODEL,
        input,
      });
      const embedding = resp.data[0].embedding;

      const { error: updErr } = await supabase
        .from("product_embeddings")
        .update({ embedding })
        .eq("id", row.id);

      if (updErr) console.error(`Update failed for ${row.product_name}`, updErr);
      else console.log(`✅ Embedded & updated: ${row.product_name}`);
    } catch (e) {
      console.error(`Embedding error for ${row.product_name}:`, e);
    }
  }
}*/
