'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ----------------------------
// 1. Input + Output Schemas
// ----------------------------
const SellerJustificationInput = z.object({
  sellerClaim: z.string(),
  c_est: z.number(),
  breakdown: z.any(),
  rag: z.array(z.any())
});

const SellerJustificationOutput = z.object({
  justificationScore: z.number(), // 0–1 scale
  robotExplanation: z.string(),    // what robot says back
  isValid: z.boolean()             // whether claim is reasonable
});

// ----------------------------
// 2. Define Prompt
// ----------------------------
const justifySellerClaimPrompt = ai.definePrompt({
  name: "justifySellerClaimPrompt",
  input: { schema: SellerJustificationInput },
  output: { schema: SellerJustificationOutput },
  prompt: `
You are a ROBOT BUYER in a negotiation.

You must evaluate a SELLER'S justification using only the following evidence:

🌱 FairPrice Estimate (c_est):
{{c_est}}

🧩 Component Breakdown:
{{breakdown}}

📚 Similar Product RAG Evidence:
{{rag}}

🗣 Seller's Claim:
"{{sellerClaim}}"

-------------------
Your tasks:
-------------------
1. Check if the seller's claim is reasonable based on:
   - component costs
   - brand quality signals
   - manufacturing difficulty
   - RAG similar product evidence

2. Give a justification score between 0 and 1:
   - 0.0 → completely false / unreasonable
   - 0.5 → partially correct
   - 1.0 → fully supported by evidence

3. Write a short buyer explanation:
   - polite
   - evidence-based
   - refers strictly to c_est + breakdown + RAG

4. Decide: isValid = true or false
   - true → seller argument is valid and may justify higher price
   - false → not enough evidence; robot keeps bargaining power

FORMAT:
{
  "justificationScore": number,
  "robotExplanation": string,
  "isValid": boolean
}
`
});

// ----------------------------
// 3. Define Flow
// ----------------------------
export const justifySellerClaim = ai.defineFlow(
  {
    name: "justifySellerClaimFlow",
    inputSchema: SellerJustificationInput,
    outputSchema: SellerJustificationOutput
  },
  async (input) => {
    const { output } = await justifySellerClaimPrompt(input);
    return output!;
  }
);
