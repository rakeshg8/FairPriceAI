/**
 * @fileoverview Service for handling product price analysis.
 * This service implements a RAG (Retrieval-Augmented Generation) pattern.
 * It first attempts to fetch structured product data from Firestore.
 * If data is found, it uses that to augment the AI prompt.
 * If not found, it falls back to a general-purpose AI analysis.
 */

'use server';

import {
  analyzeProductCost,
  AnalyzeProductCostInput,
  AnalyzeProductCostOutput,
} from '@/ai/flows/analyze-product-cost';
import { fetchProductFromFirestore, ProductData } from './firestore-service';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeWithContextInputSchema = z.object({
  productName: z.string(),
  mrp: z.number(),
  brand: z.string(),
  category: z.string(),
  mrpRange: z.string(),
  components: z.array(z.object({
    name: z.string(),
    material: z.string(),
    estimatedCost: z.number(),
  })),
});

const analyzeWithContextPrompt = ai.definePrompt({
  name: 'analyzeWithContextPrompt',
  input: { schema: AnalyzeWithContextInputSchema },
  output: { schema: z.custom<AnalyzeProductCostOutput>() },
  prompt: `You are an expert AI cost estimator. You have been provided with structured data for a product. Your task is to analyze this information along with the user-provided MRP to determine if the price is fair.

Here is the product data we have from our database:
- Product Name: {{{productName}}}
- Brand: {{{brand}}}
- Category: {{{category}}}
- Typical MRP Range: {{{mrpRange}}}
- Known Components:
  {{#each components}}
  - Name: {{{this.name}}}, Material: {{{this.material}}}, Estimated Base Cost: {{{this.estimatedCost}}} INR
  {{/each}}

The user has provided an MRP of {{{mrp}}} INR for this product.

Please perform the following steps:
1.  Review the known component costs. These are base costs; adjust them slightly if the user's MRP suggests a premium version or special packaging.
2.  Calculate the total estimated cost by summing up the costs of all components.
3.  Compare the total estimated cost with the user's provided MRP.
4.  Formulate a verdict: "Fair Price", "Overpriced", or "Reasonably Priced".
5.  Write a concise, human-friendly analysis explaining your verdict. Mention if the user's price is within the typical MRP range.

Return the response in the structured JSON format specified.`,
});


/**
 * Performs a price analysis for a given product using a RAG approach.
 *
 * @param {AnalyzeProductCostInput} input - The product details for analysis.
 * @returns {Promise<AnalyzeProductCostOutput>} The result of the price analysis.
 */
export async function productAnalysisService(
  input: AnalyzeProductCostInput,
  userId: string
): Promise<AnalyzeProductCostOutput> {
  const productData = await fetchProductFromFirestore(input.productName);

  if (productData) {
    // Product found in Firestore, use the RAG-enhanced prompt
    console.log(`Found data for ${input.productName} in Firestore. Using RAG prompt.`);
    const contextInput = {
      productName: input.productName,
      mrp: input.mrp,
      ...productData,
       userId, 
    };
    const {output} = await analyzeWithContextPrompt(contextInput);
    if (!output) {
      throw new Error('AI analysis with context failed. The model may have returned an invalid response.');
    }
    return output;
  } else {
    // Product not found, use the general analysis flow
    console.log(`No data for ${input.productName} in Firestore. Using general analysis.`);
    const result = await analyzeProductCost({ ...input, userId });
    return result;
  }
}
