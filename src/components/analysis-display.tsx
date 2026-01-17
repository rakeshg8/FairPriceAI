'use client'

import { useState } from 'react'
import type { UserInput } from '@/lib/types'
import type { AnalyzeProductCostOutput } from '@/ai/flows/analyze-product-cost'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { User, Bot, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { CostPieChart } from '@/components/cost-pie-chart'
import { VerdictBadge } from '@/components/verdict-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AnalysisDisplayProps {
  userInput: UserInput
  analysis: AnalyzeProductCostOutput | null
  isLoading: boolean
  onReset: () => void
}

const UserMessage = ({ userInput }: { userInput: UserInput }) => (
  <div className="flex justify-end animate-in fade-in duration-500 slide-in-from-bottom-5">
    <div className="flex items-start gap-3 sm:gap-4 flex-row-reverse w-full max-w-full sm:max-w-[80%]">
      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary">
        <AvatarFallback>
          <User className="h-4 w-4 sm:h-5 sm:w-5"/>
        </AvatarFallback>
      </Avatar>
      <Card className="bg-primary text-primary-foreground shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2">
            <p className="font-semibold text-sm sm:text-base">{userInput.productName}</p>
            <p className="text-xs sm:text-sm">
              Provided MRP: <strong>₹{userInput.mrp.toFixed(2)}</strong>
            </p>
            <Image
              src={userInput.photoDataUri}
              alt={userInput.productName}
              width={200}
              height={200}
              className="rounded-lg mt-2 w-full h-auto object-cover max-h-64"
              data-ai-hint="product photo"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

const AssistantLoading = () => (
  <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-500 slide-in-from-bottom-5">
    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-muted">
      <AvatarFallback className="bg-primary/10 text-primary">
        <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
      </AvatarFallback>
    </Avatar>
    <div className="p-3 sm:p-4 rounded-lg bg-muted text-card-foreground shadow-sm w-full max-w-full sm:max-w-[80%] space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin h-5 w-5" />
        <p className="font-semibold text-sm sm:text-base">Analyzing your product...</p>
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 sm:h-40 w-full" />
    </div>
  </div>
)

const AssistantResult = ({
  analysis,
  onReset,
}: {
  analysis: AnalyzeProductCostOutput
  onReset: () => void
}) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)

  const handleFeedback = (newFeedback: 'like' | 'dislike') => {
    if (feedback) return; // Prevent changing feedback
    setFeedback(newFeedback)
    // Here you would typically call an action to save the feedback
    console.log(`Feedback received: ${newFeedback}`)
  }

  return (
    <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-500 slide-in-from-bottom-5">
      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-muted">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
        </AvatarFallback>
      </Avatar>
      <Card className="bg-muted text-card-foreground shadow-sm w-full max-w-full sm:max-w-[80%]">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-base sm:text-xl">Analysis Result</CardTitle>
            <VerdictBadge verdict={analysis.verdict} />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4 space-y-4">
          <div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Verdict Explanation</h3>
              <p className="text-sm sm:text-base">{analysis.priceAnalysis}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Cost Breakdown</h3>
            <CostPieChart
              data={analysis.components}
              total={analysis.totalEstimatedCost}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  feedback === 'like' && 'bg-green-500/20 text-green-500',
                )}
                onClick={() => handleFeedback('like')}
                disabled={!!feedback}
              >
                <ThumbsUp size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                   feedback === 'dislike' && 'bg-red-500/20 text-red-500',
                )}
                onClick={() => handleFeedback('dislike')}
                disabled={!!feedback}
              >
                <ThumbsDown size={16} />
              </Button>
            </div>
            <Button onClick={onReset} className="bg-accent hover:bg-accent/90 text-accent-foreground">Analyze Another Product</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalysisDisplay({
  userInput,
  analysis,
  isLoading,
  onReset,
}: AnalysisDisplayProps) {
  return (
    <div className="space-y-6">
      <UserMessage userInput={userInput} />
      {isLoading ? (
        <AssistantLoading />
      ) : analysis ? (
        <AssistantResult analysis={analysis} onReset={onReset} />
      ) : null}
    </div>
  )
}
