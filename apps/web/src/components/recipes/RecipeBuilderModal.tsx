'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X, Plus, Utensils, Save, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number; // Base serving size in grams
}

interface RecipeIngredient extends FoodItem {
  quantityG: number;
}

export const RecipeBuilderModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'builder' | 'search'>('builder');
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['foods', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(searchTerm)}`, { credentials: 'include' });
      return res.json();
    },
    enabled: activeView === 'search' && searchTerm.length > 1,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipeName,
          servings,
          ingredients: ingredients.map(ing => ({
            foodId: ing.id,
            quantityG: ing.quantityG,
          })),
        }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to save recipe');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setRecipeName('');
    setServings(1);
    setIngredients([]);
    setActiveView('builder');
    setSearchTerm('');
    onClose();
  };

  const addIngredient = (food: FoodItem) => {
    setIngredients(prev => [...prev, { ...food, quantityG: food.servingSize }]);
    setActiveView('builder');
  };

  const updateQuantity = (id: string, quantity: number) => {
    setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, quantityG: Math.max(0, quantity) } : ing));
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  // Live Macro Calculations
  const totals = ingredients.reduce((acc, ing) => {
    const ratio = ing.quantityG / ing.servingSize;
    return {
      calories: acc.calories + (ing.calories * ratio),
      protein: acc.protein + (ing.proteinG * ratio),
      carbs: acc.carbs + (ing.carbsG * ratio),
      fat: acc.fat + (ing.fatG * ratio),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const perServing = {
    calories: Math.round(totals.calories / servings),
    protein: Math.round(totals.protein / servings),
    carbs: Math.round(totals.carbs / servings),
    fat: Math.round(totals.fat / servings),
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
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Utensils className="w-6 h-6 text-primary" />
                Recipe Builder
              </h2>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeView === 'builder' && (
                <div className="space-y-6">
                  {/* Recipe Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1 text-muted-foreground">Recipe Name</label>
                      <input
                        type="text"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        placeholder="e.g., Chicken Stir Fry"
                        className="w-full bg-muted/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-muted-foreground">Servings</label>
                      <input
                        type="number"
                        value={servings}
                        onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-muted/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Add Ingredient Button */}
                  <button
                    onClick={() => setActiveView('search')}
                    className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Ingredient
                  </button>

                  {/* Ingredients List */}
                  <div className="space-y-3">
                    {ingredients.map((ing) => {
                      const ratio = ing.quantityG / ing.servingSize;
                      return (
                        <GlassCard key={ing.id} className="bg-muted/20">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{ing.name}</h4>
                            <button onClick={() => removeIngredient(ing.id)} className="text-red-500 hover:bg-background p-1 rounded-md">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={ing.quantityG}
                                onChange={(e) => updateQuantity(ing.id, parseFloat(e.target.value) || 0)}
                                className="w-24 bg-background/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-sm text-muted-foreground">grams</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              = <span className="font-medium text-foreground">{Math.round(ing.calories * ratio)} cal</span>
                            </div>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeView === 'search' && (
                <div>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search foods to add..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-muted/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    {searchResults?.map((food: FoodItem) => (
                      <motion.div
                        key={food.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 cursor-pointer flex justify-between items-center"
                        onClick={() => addIngredient(food)}
                      >
                        <div>
                          <h3 className="font-medium">{food.name}</h3>
                          <p className="text-xs text-muted-foreground">{food.calories} cal per {food.servingSize}g</p>
                        </div>
                        <Plus className="w-5 h-5 text-primary" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer (Macro Summary & Save) */}
            {ingredients.length > 0 && activeView === 'builder' && (
              <div className="p-6 border-t border-border/50 bg-background/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Macros per serving:</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="font-bold">{perServing.calories} kcal</span>
                    <span className="text-blue-500">P: {perServing.protein}g</span>
                    <span className="text-amber-500">C: {perServing.carbs}g</span>
                    <span className="text-purple-500">F: {perServing.fat}g</span>
                  </div>
                </div>
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={!recipeName || saveMutation.isPending}
                  className="w-full py-4 premium-gradient text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saveMutation.isPending ? 'Saving Recipe...' : 'Save Recipe'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
