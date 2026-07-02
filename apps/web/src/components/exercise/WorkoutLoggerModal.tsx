'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X, Plus, Dumbbell, Clock, Flame, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';

interface Exercise {
  id: string;
  name: string;
  type: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY';
  muscleGroup?: string;
}

interface ActiveSet {
  setNumber: number;
  reps: string;
  weightKg: string;
}

interface ActiveExercise extends Exercise {
  sets: ActiveSet[];
}

export const WorkoutLoggerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'search' | 'session'>('search');
  const [sessionExercises, setSessionExercises] = useState<ActiveExercise[]>([]);
  const [duration, setDuration] = useState(30);
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['exercises', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include',
      });
      return res.json();
    },
    enabled: activeView === 'search' && searchTerm.length > 1,
  });

  const logMutation = useMutation({
    mutationFn: async () => {
      // Format sets for backend
      const mappedSets = sessionExercises.flatMap(ex => 
        ex.sets.map(s => ({
          exerciseId: ex.id,
          setNumber: s.setNumber,
          reps: parseInt(s.reps) || 0,
          weightKg: parseFloat(s.weightKg) || 0,
        }))
      );

      // Rough calorie estimation for UI demonstration
      const estimatedCalories = duration * 8; 

      const res = await fetch('/api/exercises/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationMin: duration,
          caloriesBurned: estimatedCalories,
          sets: mappedSets,
        }),
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to log workout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      queryClient.invalidateQueries({ queryKey: ['workoutHistory'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setSearchTerm('');
    setSessionExercises([]);
    setActiveView('search');
    setDuration(30);
    onClose();
  };

  const addExerciseToSession = (exercise: Exercise) => {
    setSessionExercises(prev => [
      ...prev,
      { ...exercise, sets: [{ setNumber: 1, reps: '10', weightKg: '20' }] },
    ]);
    setActiveView('session');
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof ActiveSet, value: string) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      updated[exIndex].sets[setIndex] = { ...updated[exIndex].sets[setIndex], [field]: value };
      return updated;
    });
  };

  const addSet = (exIndex: number) => {
    setSessionExercises(prev => {
      const updated = [...prev];
      const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
      updated[exIndex].sets.push({
        setNumber: lastSet.setNumber + 1,
        reps: lastSet.reps,
        weightKg: lastSet.weightKg,
      });
      return updated;
    });
  };

  const removeExercise = (exIndex: number) => {
    setSessionExercises(prev => prev.filter((_, i) => i !== exIndex));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveView('search')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${activeView === 'search' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  Find Exercises
                </button>
                <button 
                  onClick={() => setActiveView('session')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${activeView === 'session' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  Current Session
                  {sessionExercises.length > 0 && (
                    <span className="bg-background/30 px-2 py-0.5 rounded-full text-xs">{sessionExercises.length}</span>
                  )}
                </button>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeView === 'search' && (
                <div>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search exercises (e.g., Bench Press, Running)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-muted/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    {isLoading && <div className="text-center py-4 text-muted-foreground">Loading...</div>}
                    {!isLoading && searchResults?.map((ex: Exercise) => (
                      <motion.div
                        key={ex.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors flex justify-between items-center cursor-pointer"
                        onClick={() => addExerciseToSession(ex)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <Dumbbell className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{ex.name}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{ex.type} {ex.muscleGroup && `• ${ex.muscleGroup}`}</p>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeView === 'session' && (
                <div className="space-y-6">
                  {sessionExercises.length === 0 ? (
                    <div className="text-center py-12">
                      <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your session is empty. Add some exercises!</p>
                      <button 
                        onClick={() => setActiveView('search')}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium"
                      >
                        Search Exercises
                      </button>
                    </div>
                  ) : (
                    <>
                      {sessionExercises.map((ex, exIndex) => (
                        <GlassCard key={ex.id} className="bg-muted/20">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">{ex.name}</h3>
                            <button onClick={() => removeExercise(exIndex)} className="p-2 hover:bg-background rounded-lg text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Sets Header */}
                          <div className="grid grid-cols-12 gap-2 px-2 mb-2 text-xs text-muted-foreground font-medium uppercase">
                            <div className="col-span-2">Set</div>
                            <div className="col-span-5">Weight (kg)</div>
                            <div className="col-span-5">Reps</div>
                          </div>

                          <div className="space-y-2">
                            {ex.sets.map((set, setIndex) => (
                              <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-2 text-sm font-medium text-muted-foreground">{set.setNumber}</div>
                                <input
                                  type="number"
                                  value={set.weightKg}
                                  onChange={(e) => updateSet(exIndex, setIndex, 'weightKg', e.target.value)}
                                  className="col-span-5 bg-background/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                                  className="col-span-5 bg-background/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => addSet(exIndex)}
                            className="mt-4 w-full py-2 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:bg-background/50 transition-colors"
                          >
                            + Add Set
                          </button>
                        </GlassCard>
                      ))}

                      {/* Workout Summary & Log */}
                      <GlassCard className="bg-background/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Duration (min)</span>
                          </div>
                          <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                            className="w-20 bg-muted/50 rounded-lg px-3 py-1 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm mb-6">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span>Estimated Calories</span>
                          </div>
                          <span className="font-bold">{duration * 8} kcal</span>
                        </div>

                        <button
                          onClick={() => logMutation.mutate()}
                          disabled={logMutation.isPending}
                          className="w-full py-4 premium-gradient text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {logMutation.isPending ? 'Logging Workout...' : 'Complete & Log Workout'}
                        </button>
                      </GlassCard>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
