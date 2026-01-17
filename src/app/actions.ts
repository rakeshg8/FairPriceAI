'use server';

import { z } from 'zod';
import { AnalyzeProductCostOutput } from '@/ai/flows/analyze-product-cost';
import { productAnalysisService } from '@/services/product-analysis-service';

const InputSchema = z.object({
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  mrp: z.coerce.number().positive({ message: "MRP must be a positive number." }),
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
});

export type AnalysisResult = {
  message: string;
  analysis?: AnalyzeProductCostOutput;
  error?: boolean;
}

export async function getPriceAnalysis(
  input: z.infer<typeof InputSchema>,
  userId: string
): Promise<AnalysisResult> {

  const validatedFields = InputSchema.safeParse(input);

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues.map(issue => issue.message).join(' ');
    return {
      message: `Invalid form data: ${errorMessages}`,
      error: true,
    };
  }

  try {
    const result = await productAnalysisService(validatedFields.data,userId  );
    return { message: 'Analysis complete.', analysis: result };
  } catch (error) {
    console.error("Error in getPriceAnalysis:", error);
    return { message: 'An unexpected error occurred while analyzing the product. Please try again later.', error: true };
  }
}



