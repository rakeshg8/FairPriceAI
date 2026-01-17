import 'dotenv/config'; 
import { findSimilarProducts } from "./retrievalService";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";


const llm = new ChatOpenAI({
  model: "gpt-4-turbo",
  temperature: 0.4,
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function getRAGContext(productName: string, mrp: number) {
  // 1️⃣ Retrieve similar items
  const similarProducts = await findSimilarProducts(productName);

  if (!similarProducts || similarProducts.length === 0) {
    return "No similar products found in the database.";
  }

  const productSummaries = similarProducts
    .map(
      (p: any) =>
        `Product: ${p.product_name}, MRP: ₹${p.mrp}, Description: ${p.description}, Similarity: ${p.similarity?.toFixed(
          2
        )}`
    )
    .join("\n");

  // 2️⃣ Summarize with LLM
  const template = PromptTemplate.fromTemplate(`
You are an AI assistant that summarizes similar products to help a price estimation system.

Based on the following product data:
{productSummaries}

Summarize 3–4 main insights about average prices, material quality, or brand value trends
that could help estimate a fair price for a new product: "{{productName}}" (MRP ₹{{mrp}}).
`);

  const chain = template.pipe(llm).pipe(new StringOutputParser());

  const ragContext = await chain.invoke({
    productSummaries,
    productName,
    mrp,
  });

  return ragContext;
}

