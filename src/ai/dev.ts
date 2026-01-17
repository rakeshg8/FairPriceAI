import { config } from 'dotenv';
config();

import '@/ai/flows/interpret-price-verdict.ts';
import '@/ai/flows/suggest-product-components.ts';
import '@/ai/flows/analyze-product-cost.ts';