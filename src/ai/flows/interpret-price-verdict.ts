// 'use server';
/**
 * @fileOverview A flow that generates a plain-language explanation of the AI's price verdict.
 *
 * - interpretPriceVerdict - A function that handles the interpretation of the price verdict.
 * - InterpretPriceVerdictInput - The input type for the interpretPriceVerdict function.
 * - InterpretPriceVerdictOutput - The return type for the interpretPriceVerdict function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretPriceVerdictInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  estimatedCost: z.number().describe('The estimated cost of the product.'),
  mrp: z.number().describe('The maximum retail price of the product.'),
  costBreakdown: z
    .record(z.string(), z.number())
    .describe('A breakdown of the cost of each component of the product.'),
  verdict: z
    .enum(['Fair Price', 'Overpriced', 'Underpriced'])
    .describe('The AI verdict on the price of the product.'),
});
export type InterpretPriceVerdictInput = z.infer<typeof InterpretPriceVerdictInputSchema>;

const InterpretPriceVerdictOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A plain-language explanation of the AI verdict, summarizing the key factors influencing the estimate.'
    ),
});
export type InterpretPriceVerdictOutput = z.infer<typeof InterpretPriceVerdictOutputSchema>;

export async function interpretPriceVerdict(input: InterpretPriceVerdictInput): Promise<InterpretPriceVerdictOutput> {
  return interpretPriceVerdictFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretPriceVerdictPrompt',
  input: {schema: InterpretPriceVerdictInputSchema},
  output: {schema: InterpretPriceVerdictOutputSchema},
  prompt: `You are an AI assistant that explains price verdicts to users.

  Based on the following information, provide a concise and easy-to-understand explanation of the AI's price verdict.

  Product Name: {{{productName}}}
  Estimated Cost: {{{estimatedCost}}}
  MRP: {{{mrp}}}
  Cost Breakdown: {{#each costBreakdown}}{{{@key}}}: {{{this}}}, {{/each}}
  Verdict: {{{verdict}}}

  Explanation:`,
});

const interpretPriceVerdictFlow = ai.defineFlow(
  {
    name: 'interpretPriceVerdictFlow',
    inputSchema: InterpretPriceVerdictInputSchema,
    outputSchema: InterpretPriceVerdictOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
