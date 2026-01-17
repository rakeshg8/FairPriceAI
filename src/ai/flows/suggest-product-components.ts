// This is an AI-powered function to suggest product components based on the product name and image.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProductComponentsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productPhotoDataUri: z
    .string()
    .describe(
      'A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Ensure proper escaping
    ),
});
export type SuggestProductComponentsInput = z.infer<typeof SuggestProductComponentsInputSchema>;

const SuggestProductComponentsOutputSchema = z.object({
  suggestedComponents: z
    .array(z.string())
    .describe('An array of suggested components for the product.'),
});
export type SuggestProductComponentsOutput = z.infer<typeof SuggestProductComponentsOutputSchema>;

export async function suggestProductComponents(
  input: SuggestProductComponentsInput
): Promise<SuggestProductComponentsOutput> {
  return suggestProductComponentsFlow(input);
}

const suggestProductComponentsPrompt = ai.definePrompt({
  name: 'suggestProductComponentsPrompt',
  input: {schema: SuggestProductComponentsInputSchema},
  output: {schema: SuggestProductComponentsOutputSchema},
  prompt: `You are an AI assistant designed to suggest potential components of a product based on its name and image.

  Given the following product name and image, please suggest a list of components that the product might be made of.

  Product Name: {{{productName}}}
  Product Image: {{media url=productPhotoDataUri}}

  Please return a JSON array of strings representing the suggested components.
  For example: [\