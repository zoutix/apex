'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GlassCard } from '@/components/ui/Card';
import { Scale, Activity, Droplet, TrendingDown } from 'lucide-react';

type Range = 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('week');
  const queryClient = useQueryClient();

  // Fetch Nutrition Data
  const { data: nutritionData, isLoading: loadingNutrition } = useQuery({
    queryKey: ['analytics', 'nutrition', range],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/nutrition?range=${range}`, { credentials: 'include' });
      return res.json();
    },
  });

  // Fetch Body Metrics
  const { data: bodyData, isLoading: loadingBody } = useQuery({
    queryKey: ['analytics', 'body', range],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/body-metrics?range=${range}`, { credentials: 'include' });
      return res.json();
    },
  });

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Range Selector */}
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
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 text-sm font-medium capitalize rounded-lg transition-colors ${
                  range === r ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Weight Progress Chart */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Weight Progress</h3>
                <p className="text-sm text-muted-foreground">Weight over time (kg)</p>
              </div>
            </div>
            {loadingBody ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading data...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={bodyData || []}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'rgb(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="weightKg" stroke="rgb(var(--primary))" strokeWidth={3} fill="url(#weightGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>

          {/* Calorie Intake Chart */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-orange-500/10">
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Calorie Intake</h3>
                <p className="text-sm text-muted-foreground">Daily calories consumed</p>
              </div>
            </div>
            {loadingNutrition ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading data...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nutritionData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'rgb(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </GlassCard>

          {/* Macros Breakdown Chart */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <TrendingDown className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Macronutrient Trends</h3>
                <p className="text-sm text-muted-foreground">Protein, Carbs, and Fat (g)</p>
              </div>
            </div>
            {loadingNutrition ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading data...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nutritionData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} stroke="rgb(var(--muted-foreground))" fontSize={12} />
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
          </GlassCard>

          {/* Body Measurements Table/List */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <Scale className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Body Measurements</h3>
                <p className="text-sm text-muted-foreground">Latest recorded metrics</p>
              </div>
            </div>
            <div className="space-y-4">
              {bodyData && bodyData.length > 0 ? (
                <>
                  <MeasurementRow label="Weight" value={bodyData[bodyData.length-1].weightKg} unit="kg" />
                  <MeasurementRow label="Body Fat" value={bodyData[bodyData.length-1].bodyFatPercentage} unit="%" />
                  <MeasurementRow label="Waist" value={bodyData[bodyData.length-1].waistCm} unit="cm" />
                  <MeasurementRow label="Chest" value={bodyData[bodyData.length-1].chestCm} unit="cm" />
                  <MeasurementRow label="Arms" value={bodyData[bodyData.length-1].armsCm} unit="cm" />
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No body metrics logged yet. Start tracking to see your progress!
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
};

const MeasurementRow: React.FC<{ label: string; value?: number | null; unit: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between items-center pb-3 border-b border-border/50 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold">
      {value ? `${value} ${unit}` : 'Not recorded'}
    </span>
  </div>
);
