// src/lib/history.ts
import { supabase } from './supabase';

export async function saveAnalysisToHistory(
  userId: string,
  productName: string,
  mrp: number,
  imageUrl: string,
  aiResult: any
) {
  const { error } = await supabase.from('user_history').insert([
    {
      user_id: userId,
      product_name: productName,
      mrp,
      image_url: imageUrl,
      ai_result: aiResult,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('❌ Supabase insert error:', error.message);
    throw new Error(error.message);
  }

  console.log('✅ Analysis saved successfully!');
}
