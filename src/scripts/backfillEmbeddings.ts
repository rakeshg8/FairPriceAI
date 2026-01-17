import 'dotenv/config';  // 👈 This loads .env automatically
import { backfillMissingEmbeddings } from "@/services/embeddingService";
(async () => {
  try {
    await backfillMissingEmbeddings(100); // adjust batch size
    
    console.log("Backfill complete");
  } catch (e) {
    console.error(e);
  }
})();
