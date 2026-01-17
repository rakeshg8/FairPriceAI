/**
 * @fileoverview Service for interacting with Firestore.
 * This service provides functions to fetch product data for the RAG implementation.
 */

'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Defines the structure of the product data stored in Firestore.
 */
export interface ProductData {
  brand: string;
  category: string;
  mrpRange: string;
  components: {
    name: string;
    material: string;
    estimatedCost: number;
  }[];
}

/**
 * Converts a product name into a Firestore-compatible document ID.
 * e.g., "Hauser XO Pen" -> "hauser_xo_pen"
 * @param {string} productName - The name of the product.
 * @returns {string} The formatted document ID.
 */
function formatProductId(productName: string): string {
  return productName.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Fetches a product's data from the 'products' collection in Firestore.
 *
 * @param {string} productName - The name of the product to fetch.
 * @returns {Promise<ProductData | null>} The product data if found, otherwise null.
 */
export async function fetchProductFromFirestore(
  productName: string
): Promise<ProductData | null> {
  const productId = formatProductId(productName);
  const docRef = doc(db, 'products', productId);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ProductData;
    } else {
      console.log(`No document found for product ID: ${productId}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching product from Firestore:', error);
    // In case of an error, we proceed as if the data was not found.
    return null;
  }
}
