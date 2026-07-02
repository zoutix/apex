'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, X, Star, Barcode, Plus, Minus } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { useDebounce } from '@/hooks/useDebounce';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number;
  isFavorite?: boolean;
}

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMealType = 'LUNCH' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'favorites'>('search');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState(defaultMealType);
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['foods', 'search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(debouncedSearch)}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return res.json();
    },
    enabled: activeTab === 'search' && debouncedSearch.length > 1,
  });

  const { data: favoriteFoods } = useQuery({
    queryKey: ['foods', 'favorites'],
    queryFn: async () => {
      const res = await fetch('/api/foods/favorites', { credentials: 'include' });
      return res.json();
    },
    enabled: activeTab === 'favorites',
  });

  const logMutation = useMutation({
    mutationFn: async (data: { foodId: string; servings: number; mealType: string }) => {
      const res = await fetch('/api/foods/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to log food');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      handleClose();
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (foodId: string) => {
      const res = await fetch(`/api/foods/favorites/${foodId}/toggle`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });

  const handleClose = () => {
    setSearchTerm('');
    setSelectedFood(null);
    setServings(1);
    onClose();
  };

  const handleLog = () => {
    if (!selectedFood) return;
    logMutation.mutate({
      foodId: selectedFood.id,
      servings,
      mealType,
    });
  };

  const currentList = activeTab === 'search' ? searchResults : activeTab === 'favorites' ? favoriteFoods : [];

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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedFood ? 'Add to Diary' : 'Add Food'}
                </h2>
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!selectedFood && (
                <>
                  {/* Tabs */}
                  <div className="flex gap-2 mb-4 bg-muted/50 p-1 rounded-xl">
                    {(['search', 'recent', 'favorites'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-medium capitalize rounded-lg transition-colors ${
                          activeTab === tab ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  {activeTab === 'search' && (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search for foods or brands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-muted/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        autoFocus
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {selectedFood ? (
                <AddFoodDetailView 
                  food={selectedFood} 
                  servings={servings}
                  setServings={setServings}
                  mealType={mealType}
                  setMealType={setMealType}
                  onLog={handleLog}
                  isLogging={logMutation.isPending}
                />
              ) : (
                <div className="p-4 space-y-2">
                  {isSearching && (
                    <div className="text-center py-8 text-muted-foreground">Searching...</div>
                  )}
                  {!isSearching && currentList?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {activeTab === 'search' && searchTerm.length > 1 ? 'No foods found.' : 
                       activeTab === 'favorites' ? 'No favorite foods yet.' : 
                       'Start typing to search.'}
                    </div>
                  )}
                  {currentList?.map((food: FoodItem) => (
                    <motion.div
                      key={food.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors flex justify-between items-center"
                      onClick={() => setSelectedFood(food)}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{food.name}</h3>
                        {food.brand && <p className="text-sm text-muted-foreground">{food.brand}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {food.calories} cal • P: {food.proteinG}g • C: {food.carbsG}g • F: {food.fatG}g
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteMutation.mutate(food.id);
                        }}
                        className="p-2 hover:bg-background rounded-full transition-colors"
                      >
                        <Star 
                          className={`w-5 h-5 ${food.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} 
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Sub-component for the detail view when a food is selected
const AddFoodDetailView: React.FC<{
  food: FoodItem;
  servings: number;
  setServings: (v: number) => void;
  mealType: string;
  setMealType: (v: string) => void;
  onLog: () => void;
  isLogging: boolean;
}> = ({ food, servings, setServings, mealType, setMealType, onLog, isLogging }) => {
  const calc = (val: number) => (val * servings).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold">{food.name}</h3>
        {food.brand && <p className="text-sm text-muted-foreground">{food.brand}</p>}
        <p className="text-xs text-muted-foreground mt-1">Per {food.servingSize}g serving</p>
      </div>

      {/* Meal Type Selector */}
      <div>
        <label className="block text-sm font-medium mb-2 text-muted-foreground">Meal</label>
        <div className="grid grid-cols-4 gap-2">
          {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`py-2 text-xs font-medium rounded-xl capitalize transition-colors ${
                mealType === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Servings Adjuster */}
      <div>
        <label className="block text-sm font-medium mb-2 text-muted-foreground">Servings</label>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setServings(Math.max(0.25, servings - 0.25))}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xl font-bold w-12 text-center">{servings}</span>
          <button 
            onClick={() => setServings(servings + 0.25)}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Macro Preview */}
      <GlassCard className="bg-muted/30">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Calories</p>
            <p className="font-bold text-lg">{calc(food.calories)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Protein</p>
            <p className="font-bold text-lg text-blue-500">{calc(food.proteinG)}g</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Carbs</p>
            <p className="font-bold text-lg text-amber-500">{calc(food.carbsG)}g</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fat</p>
            <p className="font-bold text-lg text-purple-500">{calc(food.fatG)}g</p>
          </div>
        </div>
      </GlassCard>

      {/* Log Button */}
      <button
        onClick={onLog}
        disabled={isLogging}
        className="w-full py-4 premium-gradient text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLogging ? 'Adding...' : 'Add to Diary'}
      </button>
    </div>
  );
};
