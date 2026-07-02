'use client';

import { GlassCard } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { 
  Flame, Droplet, Footprints, Dumbbell, Apple, TrendingDown 
} from 'lucide-react';

// Mock data - In production, this is fetched via TanStack Query
const dashboardData = {
  caloriesRemaining: 540,
  caloriesEaten: 1460,
  exerciseCalories: 200,
  goalCalories: 2000,
  macros: {
    protein: { current: 120, goal: 150 },
    carbs: { current: 180, goal: 200 },
    fat: { current: 45, goal: 65 },
  },
  water: { current: 1500, goal: 2500 },
  steps: 8420,
};

const macroColors: Record<string, string> = {
  protein: 'bg-blue-500',
  carbs: 'bg-amber-500',
  fat: 'bg-purple-500',
};

export default function DashboardPage() {
  const caloriePercentage = Math.min((dashboardData.caloriesEaten / dashboardData.goalCalories) * 100, 100);

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Today's Dashboard</h1>
            <p className="text-muted-foreground mt-1">Keep up the great work, you're almost there!</p>
          </div>
          <div className="h-10 w-10 rounded-full premium-gradient" />
        </motion.div>

        {/* Top Grid: Calories & Macros */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calorie Ring */}
          <GlassCard className="lg:col-span-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--muted))" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--primary))" strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="282.7" // 2 * PI * 45
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 282.7 - (282.7 * caloriePercentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
              <div className="text-center z-10">
                <p className="text-5xl font-bold">{dashboardData.caloriesRemaining}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Remaining</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 w-full text-center">
              <div>
                <p className="text-xs text-muted-foreground">Eaten</p>
                <p className="font-semibold">{dashboardData.caloriesEaten}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exercise</p>
                <p className="font-semibold text-primary">{dashboardData.exerciseCalories}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Goal</p>
                <p className="font-semibold">{dashboardData.goalCalories}</p>
              </div>
            </div>
          </GlassCard>

          {/* Macros & Water */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Apple size={20} className="text-primary" /> Macronutrients
              </h3>
              <div className="space-y-4">
                {Object.entries(dashboardData.macros).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-muted-foreground">{key}</span>
                      <span className="font-medium">{val.current}g / {val.goal}g</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        className={`h-full ${macroColors[key]} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(val.current / val.goal) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col justify-between">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Droplet size={20} className="text-blue-500" /> Water Intake
              </h3>
              <div className="flex items-end gap-2 mt-4">
                <span className="text-4xl font-bold">{dashboardData.water.current}</span>
                <span className="text-muted-foreground mb-1">/ {dashboardData.water.goal} ml</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[250, 500, 750, 1000].map((amount) => (
                  <button key={amount} className="px-3 py-2 text-sm rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                    +{amount}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Bottom Grid: Activity & Weight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Footprints size={20} className="text-amber-500" /> Steps
              </h3>
              <span className="text-sm text-muted-foreground">{dashboardData.steps} / 10,000</span>
            </div>
            <div className="text-3xl font-bold">{dashboardData.steps}</div>
            <p className="text-sm text-muted-foreground mt-1">Keep moving!</p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Dumbbell size={20} className="text-purple-500" /> Exercise
              </h3>
            </div>
            <div className="text-3xl font-bold">{dashboardData.exerciseCalories} kcal</div>
            <p className="text-sm text-muted-foreground mt-1">Burned today</p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingDown size={20} className="text-green-500" /> Weight
              </h3>
            </div>
            <div className="text-3xl font-bold">82.5 kg</div>
            <p className="text-sm text-primary mt-1">-0.5 kg this week</p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
