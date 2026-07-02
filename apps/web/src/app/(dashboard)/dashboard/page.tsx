"use client";

import { motion } from "framer-motion";
import { Flame, Droplet, Footprints, Dumbbell, Apple, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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

export default function DashboardPage() {
  const caloriePercentage = Math.min((dashboardData.caloriesEaten / dashboardData.goalCalories) * 100, 100);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today&apos;s Dashboard</h1>
          <p className="text-muted-foreground mt-1">Keep up the great work, you&apos;re almost there!</p>
        </div>
        <Button variant="primary" leftIcon={<Apple className="w-4 h-4" />}>Add Food</Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-1 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--muted))" strokeWidth="8" />
              <motion.circle 
                cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--primary))" strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray="282.7"
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
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-primary" /> Macronutrients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(dashboardData.macros).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-muted-foreground">{key}</span>
                    <span className="font-medium">{val.current}g / {val.goal}g</span>
                  </div>
                  <Progress value={(val.current / val.goal) * 100} className="w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-500" /> Water Intake
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 justify-between">
              <div className="flex items-end gap-2 mt-4">
                <span className="text-4xl font-bold">{dashboardData.water.current}</span>
                <span className="text-muted-foreground mb-1">/ {dashboardData.water.goal} ml</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[250, 500, 750, 1000].map((amount) => (
                  <Button key={amount} variant="outline" size="sm">
                    +{amount}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Footprints className="w-5 h-5 text-amber-500" /> Steps</span>
              <span className="text-sm font-normal text-muted-foreground">{dashboardData.steps} / 10,000</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(dashboardData.steps / 10000) * 100} variant="warning" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-500" /> Exercise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.exerciseCalories} kcal</div>
            <p className="text-sm text-muted-foreground mt-1">Burned today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-500" /> Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">82.5 kg</div>
            <p className="text-sm text-emerald-500 mt-1">-0.5 kg this week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
