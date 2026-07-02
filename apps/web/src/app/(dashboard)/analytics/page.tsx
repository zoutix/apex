"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useNutritionAnalytics, useBodyMetrics } from "@/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

type Range = 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('week');
  
  const { data: nutritionData, isLoading: loadingNutrition } = useNutritionAnalytics(range);
  const { data: bodyData, isLoading: loadingBody } = useBodyMetrics(range);

  const chartData = nutritionData?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: d.calories,
    protein: d.protein,
    carbs: d.carbs,
    fat: d.fat,
  })) || [];

  const weightData = bodyData?.filter(d => d.weightKg !== null).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: d.weightKg,
  })) || [];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Progress</h1>
          <p className="text-muted-foreground mt-1">Track your metrics and visualize your journey.</p>
        </div>
        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
          {(['week', 'month', 'year'] as Range[]).map((r) => (
            <Button
              key={r}
              variant={range === r ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRange(r)}
              className={range === r ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" /> Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBody ? (
              <Skeleton className="h-[300px] w-full" />
            ) : weightData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No weight data logged in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'rgb(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="rgb(var(--primary))" strokeWidth={3} fill="url(#weightGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" /> Calorie Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingNutrition ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No nutrition data logged in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'rgb(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Macronutrient Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingNutrition ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No macro data logged in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'rgb(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="carbs" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fat" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
