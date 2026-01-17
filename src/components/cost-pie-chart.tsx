'use client'

import { Pie, PieChart, Tooltip, Legend, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { useMemo } from 'react'

interface CostPieChartProps {
  data: {
    name: string
    estimatedCostInINR: number
  }[]
  total: number
}

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function CostPieChart({ data, total }: CostPieChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      name: item.name,
      value: item.estimatedCostInINR,
      fill: chartColors[index % chartColors.length],
    }))
  }, [data])

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      }
    })
    return config
  }, [chartData])

  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground">No cost breakdown available.</div>
  }

  return (
    <div className="relative">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px] sm:max-h-[300px]"
      >
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={50}
            strokeWidth={2}
            labelLine={false}
            label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                index,
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                if ((value/total) * 100 < 5) return null;

                return (
                  <text
                    x={x}
                    y={y}
                    fill="hsl(var(--primary-foreground))"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    className="text-xs font-bold"
                  >
                    {`${((value / total) * 100).toFixed(0)}%`}
                  </text>
                );
              }}
          >
             {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
          </Pie>
          <Legend
            content={({ payload }) => {
              return (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-4 text-xs">
                  {payload?.map((entry, index) => (
                    <li
                      key={`item-${index}`}
                      className="flex items-center gap-2 truncate"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="truncate text-muted-foreground">{entry.value}</span>
                      <span className="font-medium ml-auto">₹{(entry.payload as any)?.value.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )
            }}
          />
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">Est. Cost</p>
            <p className="font-headline text-xl sm:text-2xl font-bold">₹{total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
