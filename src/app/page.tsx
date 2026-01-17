'use client'

import { useState, useEffect } from 'react'
import type { AnalyzeProductCostOutput } from '@/ai/flows/analyze-product-cost'
import type { UserInput } from '@/lib/types'
import { getPriceAnalysis } from '@/app/actions'
import { Header } from '@/components/header'
import { ProductForm } from '@/components/product-form'
import { AnalysisDisplay } from '@/components/analysis-display'
import { useToast } from '@/hooks/use-toast'
import { Bot } from 'lucide-react'
import { AuthGuard } from '@/components/auth-guard'
import { Footer } from '@/components/footer'
import { useAuth } from '@/context/auth-context';

function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalyzeProductCostOutput | null>(null)
  const [userInput, setUserInput] = useState<UserInput | null>(null)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])
const { user } = useAuth();
  const handleAnalysis = async (data: UserInput) => {
    setIsLoading(true)
    setUserInput(data)
    setAnalysis(null)

    const result = await getPriceAnalysis(data, user?.uid || 'guest')

    if (result.error || !result.analysis) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.message,
      })
      handleReset()
    } else {
      setAnalysis(result.analysis)
    }

    setIsLoading(false)
  }

  const handleReset = () => {
    setIsLoading(false)
    setAnalysis(null)
    setUserInput(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto py-6 px-4 sm:px-6">
        <div className="space-y-6">
          <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-500">
            <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bot size={20} className="sm:h-6 sm:w-6" />
            </span>
            <div className="p-3 sm:p-4 rounded-lg bg-muted text-card-foreground shadow-sm max-w-[calc(100%-3rem)] sm:max-w-[80%]">
              <p className="font-headline text-base sm:text-lg mb-1">Welcome to FairPrice AI!</p>
              <p className="text-sm sm:text-base">
                Got a product in mind? Enter its details below, and I'll
                conduct a fair price analysis for you.
              </p>
            </div>
          </div>

          {isClient && !userInput ? (
            <ProductForm onSubmit={handleAnalysis} isLoading={isLoading} />
          ) : isClient && userInput ? (
            <AnalysisDisplay
              userInput={userInput}
              analysis={analysis}
              isLoading={isLoading}
              onReset={handleReset}
            />
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  )
}
