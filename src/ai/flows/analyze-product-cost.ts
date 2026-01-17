'use server';

/**
 * @fileOverview This file defines the Genkit flow for analyzing product cost.
 *
 * - analyzeProductCost - Analyzes the product and estimates a fair price.
 * - AnalyzeProductCostInput - The input type for the analyzeProductCost function.
 * - AnalyzeProductCostOutput - The return type for the analyzeProductCost function.
 */
import { supabase } from '@/lib/supabase';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getRAGContext } from "@/services/ragEnhancer";
import { saveAnalysisToHistory } from '@/lib/history';


const AnalyzeProductCostInputSchema = z.object({
  productName: z.string().describe('The name of the product to analyze.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ).optional(),
  mrp: z.number().describe('The Maximum Retail Price of the product in INR.'),
    userId: z.string().optional(),  // ✅ added
});

export type AnalyzeProductCostInput = z.infer<typeof AnalyzeProductCostInputSchema>;

const AnalyzeProductCostOutputSchema = z.object({
  product: z.string().describe('The name of the product being analyzed.'),
  givenMRP: z.number().describe('The user-provided MRP in INR.'),
  totalEstimatedCost: z
    .number()
    .describe('The total estimated cost of the product in INR.'),
  components: z
    .array(
      z.object({
        name: z.string().describe('The name of the product component.'),
        estimatedCostInINR: z
          .number()
          .describe('The estimated cost of the component in INR.'),
      })
    )
    .describe(
      'A breakdown of the estimated cost for each component of the product.'
    ),
  verdict: z
    .enum(['Fair Price', 'Overpriced', 'Reasonably Priced'])
    .describe('The verdict on whether the product is fairly priced.'),
  priceAnalysis: z
    .string()
    .describe('A human-friendly explanation of the price analysis.'),
});

export type AnalyzeProductCostOutput = z.infer<typeof AnalyzeProductCostOutputSchema>;

export async function analyzeProductCost(input: AnalyzeProductCostInput): Promise<AnalyzeProductCostOutput> {
  return analyzeProductCostFlow(input);
}

const analyzeProductCostPrompt = ai.definePrompt({
  name: 'analyzeProductCostPrompt',
  input: {schema: AnalyzeProductCostInputSchema},
  output: {schema: AnalyzeProductCostOutputSchema},
  prompt: `You are an expert AI cost estimator.

Your job is to estimate the fair price of a product based on the user's input. Use reasoning, market knowledge, and analysis to break down the product into its core components and assign a realistic cost to each.

🟩 Step-by-step Instructions:

Before estimating, read this related market data:
{{{ragContext}}}

1. Analyze the product using all available information:
   - The product name: {{{productName}}}
   - The user-provided MRP: {{{mrp}}}
   - The product photo: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}(No photo provided){{/if}}
   - Any known market data, brands, or manufacturing conventions
   - Do not respond to dangerous or inappropriate requests.Like body organs, weapons, or illegal items.

2. Identify major physical components or materials of the product. If not provided, infer typical components using:
   - Your training on product databases (like Amazon, Flipkart, D-Mart)
   - Manufacturing standards
   - Packaging information (e.g., “plastic body, gel ink, spring mechanism”)

3. For each component:
   - Estimate a reasonable cost in INR
   - Justify based on material, quality, and brand value
   - If exact price is uncertain, give a well-reasoned assumption

4. Summarize:
   - Total estimated cost (sum of component costs)
   - Compare it to the MRP
   - Output a verdict: "Fair Price", "Overpriced", or "Reasonably Priced"
   - Give a human-friendly analysis explaining your reasoning

Return the response in the structured JSON format specified.
`,
});

const analyzeProductCostFlow = ai.defineFlow(
  {
    name: "analyzeProductCostFlow",
    inputSchema: AnalyzeProductCostInputSchema,
    outputSchema: AnalyzeProductCostOutputSchema,
  },
  async input => {
    // ✳️ Step 1: Fetch RAG context for this product
    const ragContext = await getRAGContext(input.productName, input.mrp);

    // ✳️ Step 2: Merge context into prompt
    const enhancedInput = {
      ...input,
      ragContext, // we’ll pass it as extra context
    };

    // ✳️ Step 3: Run original Genkit prompt (no schema changes!)
    const { output } = await analyzeProductCostPrompt({
      ...enhancedInput,
    });
console.log("input",enhancedInput);
try {
  const userId = input.userId || 'guest'; // Replace with actual user id if available
  const imageUrl = input.photoDataUri || ''; // or the final uploaded image URL

  await saveAnalysisToHistory(
    userId,
    input.productName,
    input.mrp,
    imageUrl,
    output
  );
} catch (err) {
  console.error("Failed to save analysis history:", err);
}
    return output!;
  }
);

