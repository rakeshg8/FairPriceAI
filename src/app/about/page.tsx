import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Sparkles, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="space-y-8">
          <div className="text-center">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl font-bold font-headline text-foreground">
              About FairPrice AI
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Your Intelligent Fair Price Estimator
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert mx-auto text-foreground">
            <p>
              FairPrice AI is an innovative application designed to bring transparency
              to product pricing. In a market flooded with complex products and
              fluctuating prices, it's often difficult to know if you're getting
              a fair deal. Our mission is to empower consumers with AI-driven
              insights to make more informed purchasing decisions.
            </p>
            <p>
              Using state-of-the-art generative AI, our application analyzes a
              product based on its name, photo, and retail price. It breaks the
              product down into its core components, estimates the cost of each part,
              and provides a comprehensive verdict on whether the product is
              overpriced, underpriced, or fairly priced.
            </p>
            <h2 className="text-2xl font-bold font-headline text-foreground">How It Works</h2>
            <ol>
              <li>
                <strong>Submit Product Details:</strong> You provide the product's
                name, its Maximum Retail Price (MRP), and a clear photo.
              </li>
              <li>
                <strong>AI Analysis:</strong> Our powerful AI model gets to work.
                It identifies the product and its components from the image and
                description.
              </li>
              <li>
                <strong>Cost Estimation:</strong> The AI estimates the manufacturing
                or material cost for each component, drawing on a vast knowledge
                base.
              </li>
              <li>
                <strong>Verdict & Breakdown:</strong> You receive a final verdict,
                a detailed cost breakdown visualized in a chart, and a clear
                explanation of the price analysis.
              </li>
            </ol>
            <p>
              This project is powered by cutting-edge technology, including Next.js,
              Firebase for authentication and data storage, and Google's Genkit for
              the AI backend. We're constantly working to improve our models and
              provide the most accurate estimates possible.
            </p>
            <h2 className="text-2xl font-bold font-headline text-foreground">Contact Us</h2>
            <p>
              Have questions, feedback, or suggestions? We'd love to hear from you. You can reach out to us via email.
            </p>
            <div className="flex items-center gap-2">
                <Mail size={20} />
                <a href="mailto:yramulu613@gmail.com" className="not-prose text-primary hover:underline">
                    yramulu613@gmail.com
                </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
