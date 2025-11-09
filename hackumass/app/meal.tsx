import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, Animated, Image, TextInput, ActivityIndicator } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { DiningHallButton } from '../components/molecules/DiningHallButton';
import { SearchBar } from '../components/molecules/SearchBar';
import { Card } from '../components/molecules/Card';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { invalidateDashboardCache } from './dashboard';

// API Configuration
// Use localhost for web, 10.0.2.2 for Android emulator, or your computer's IP for physical device/iOS simulator
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  
  // For iOS simulator or physical device, use your computer's local IP from environment
  // Fallback to hardcoded IP if environment variable is not set
  const apiHost = process.env.EXPO_PUBLIC_API_HOST;
  const apiPort = process.env.EXPO_PUBLIC_API_PORT || '8000';
  return `http://${apiHost}:${apiPort}`;
};

// Memoize the API URL so it's only computed once
const API_BASE_URL = getApiBaseUrl();

interface MenuItem {
  menu_item_id: number;
  name: string;
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  hall_name: string;
  hall_code: string;
  has_image: boolean;
  matched_food_name?: string;
  match_score?: number;
  image_url?: string;
  calories?: number; // Alias for kcal
  ingredients?: string[]; // Additional field
}

export default function MealPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);

  // 🎭 DEMO: Get actual user from auth - ONLY hardcode for specific demo emails
  // TODO: Replace with actual auth context/AsyncStorage
  const loggedInUserEmail = ''; // This should come from your auth system
  const loggedInUserName = ''; // This should come from your auth system
  
  // Only apply hardcoded data if the logged-in user matches demo users
  const isDemoTiffany = loggedInUserEmail === 'tgray@gmail.com' || loggedInUserName === 'Tiffany Gray';
  const isDemoRoman = loggedInUserEmail === 'roman.pisani@example.com' || loggedInUserName === 'Roman Pisani';
  
  // 🎭 DEMO: Hardcoded Halal AI Suggestions for Roman Pisani at Berkshire (without images initially)
  const ROMAN_BERK_AI_SUGGESTIONS_BASE = [
    {
      name: 'Grilled Chicken Breast',
      calories: 165,
      reason: 'Excellent lean protein source, perfect for muscle building goals',
    },
    {
      name: 'Rice Pilaf',
      calories: 206,
      reason: 'Complex carbs for sustained energy during workouts',
    },
    {
      name: 'Beef Kebab',
      calories: 250,
      reason: 'High protein halal option with healthy fats for weight gain',
    },
    {
      name: 'Falafel Wrap',
      calories: 333,
      reason: 'Plant-based protein with good calorie density',
    },
    {
      name: 'Lamb Biryani',
      calories: 420,
      reason: 'Calorie-dense halal meal with protein and carbs for muscle gain',
    },
  ];

  // 🎭 DEMO: Hardcoded Regular Meals for Roman Pisani at Berkshire (without images initially)
  const ROMAN_BERK_REGULAR_MEALS_BASE: MenuItem[] = [
    {
      menu_item_id: 1001,
      name: 'Scrambled Eggs',
      kcal: 140,
      calories: 140,
      protein_g: 12,
      carb_g: 2,
      fat_g: 10,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Eggs', 'Butter', 'Salt'],
    },
    {
      menu_item_id: 1002,
      name: 'Turkey Sandwich',
      kcal: 320,
      calories: 320,
      protein_g: 28,
      carb_g: 35,
      fat_g: 8,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Turkey', 'Bread', 'Lettuce', 'Tomato'],
    },
    {
      menu_item_id: 1003,
      name: 'Caesar Salad',
      kcal: 184,
      calories: 184,
      protein_g: 8,
      carb_g: 12,
      fat_g: 12,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Croutons'],
    },
    {
      menu_item_id: 1004,
      name: 'Pasta Marinara',
      kcal: 350,
      calories: 350,
      protein_g: 12,
      carb_g: 65,
      fat_g: 5,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Pasta', 'Tomato Sauce', 'Garlic', 'Herbs'],
    },
    {
      menu_item_id: 1005,
      name: 'Chicken Stir Fry',
      kcal: 380,
      calories: 380,
      protein_g: 35,
      carb_g: 28,
      fat_g: 14,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Chicken', 'Mixed Vegetables', 'Soy Sauce'],
    },
    {
      menu_item_id: 1006,
      name: 'French Fries',
      kcal: 312,
      calories: 312,
      protein_g: 4,
      carb_g: 41,
      fat_g: 15,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Potatoes', 'Oil', 'Salt'],
    },
    {
      menu_item_id: 1007,
      name: 'Greek Yogurt Parfait',
      kcal: 180,
      calories: 180,
      protein_g: 15,
      carb_g: 25,
      fat_g: 3,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Greek Yogurt', 'Granola', 'Berries', 'Honey'],
    },
    {
      menu_item_id: 1008,
      name: 'Veggie Burger',
      kcal: 290,
      calories: 290,
      protein_g: 18,
      carb_g: 38,
      fat_g: 9,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Veggie Patty', 'Bun', 'Lettuce', 'Tomato'],
    },
    {
      menu_item_id: 1009,
      name: 'Fruit Smoothie',
      kcal: 220,
      calories: 220,
      protein_g: 6,
      carb_g: 48,
      fat_g: 2,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Banana', 'Strawberries', 'Milk', 'Yogurt'],
    },
    {
      menu_item_id: 1010,
      name: 'Pancakes with Syrup',
      kcal: 425,
      calories: 425,
      protein_g: 8,
      carb_g: 75,
      fat_g: 12,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Flour', 'Eggs', 'Milk', 'Maple Syrup'],
    },
  ];

  // 🎭 DEMO: Hardcoded Healthy AI Suggestions for Tiffany Gray at any dining hall
  const TIFFANY_AI_SUGGESTIONS_BASE = [
    {
      name: 'Greek Yogurt Parfait',
      calories: 180,
      reason: 'High protein, low calorie breakfast option with probiotics',
    },
    {
      name: 'Grilled Salmon',
      calories: 280,
      reason: 'Rich in omega-3s and lean protein for healthy eating',
    },
    {
      name: 'Quinoa Bowl',
      calories: 220,
      reason: 'Complete protein with fiber and essential nutrients',
    },
    {
      name: 'Green Smoothie',
      calories: 150,
      reason: 'Packed with vitamins and minerals, naturally energizing',
    },
    {
      name: 'Grilled Chicken Salad',
      calories: 300,
      reason: 'Lean protein with fresh vegetables for balanced nutrition',
    },
  ];

  // 🎭 DEMO: Hardcoded Healthy Regular Meals for Tiffany Gray
  const TIFFANY_REGULAR_MEALS_BASE: MenuItem[] = [
    {
      menu_item_id: 2001,
      name: 'Acai Bowl',
      kcal: 350,
      calories: 350,
      protein_g: 8,
      carb_g: 65,
      fat_g: 12,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Acai', 'Granola', 'Banana', 'Berries', 'Honey'],
    },
    {
      menu_item_id: 2002,
      name: 'Avocado Toast',
      kcal: 280,
      calories: 280,
      protein_g: 10,
      carb_g: 30,
      fat_g: 15,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Whole Wheat Bread', 'Avocado', 'Tomato', 'Egg'],
    },
    {
      menu_item_id: 2003,
      name: 'Kale Salad',
      kcal: 220,
      calories: 220,
      protein_g: 12,
      carb_g: 18,
      fat_g: 10,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Kale', 'Lemon Dressing', 'Chickpeas', 'Seeds'],
    },
    {
      menu_item_id: 2004,
      name: 'Grilled Vegetable Wrap',
      kcal: 310,
      calories: 310,
      protein_g: 14,
      carb_g: 42,
      fat_g: 10,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Whole Wheat Wrap', 'Zucchini', 'Peppers', 'Hummus'],
    },
    {
      menu_item_id: 2005,
      name: 'Brown Rice Bowl',
      kcal: 380,
      calories: 380,
      protein_g: 18,
      carb_g: 55,
      fat_g: 12,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Brown Rice', 'Tofu', 'Broccoli', 'Sesame Sauce'],
    },
    {
      menu_item_id: 2006,
      name: 'Lentil Soup',
      kcal: 240,
      calories: 240,
      protein_g: 16,
      carb_g: 38,
      fat_g: 3,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Lentils', 'Vegetables', 'Herbs', 'Broth'],
    },
    {
      menu_item_id: 2007,
      name: 'Egg White Omelette',
      kcal: 200,
      calories: 200,
      protein_g: 20,
      carb_g: 8,
      fat_g: 8,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Egg Whites', 'Spinach', 'Tomatoes', 'Mushrooms'],
    },
    {
      menu_item_id: 2008,
      name: 'Fruit Salad',
      kcal: 120,
      calories: 120,
      protein_g: 2,
      carb_g: 30,
      fat_g: 1,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Mixed Berries', 'Melon', 'Pineapple', 'Mint'],
    },
    {
      menu_item_id: 2009,
      name: 'Grilled Fish Tacos',
      kcal: 340,
      calories: 340,
      protein_g: 28,
      carb_g: 35,
      fat_g: 10,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Grilled Fish', 'Corn Tortilla', 'Cabbage', 'Lime'],
    },
    {
      menu_item_id: 2010,
      name: 'Sweet Potato Bowl',
      kcal: 290,
      calories: 290,
      protein_g: 10,
      carb_g: 52,
      fat_g: 7,
      hall_name: 'Berkshire Dining Commons',
      hall_code: 'BERKSHIRE',
      has_image: false,
      ingredients: ['Sweet Potato', 'Black Beans', 'Corn', 'Avocado'],
    },
  ];

  // Helper function to fetch images for hardcoded meals from the backend
  const fetchImagesForHardcodedMeals = useCallback(async (meals: any[]) => {
    try {
      const foodNames = meals.map(meal => meal.name);
      const imageResponse = await fetch(`${API_BASE_URL}/meals/images/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodNames),
      });
      
      if (imageResponse.ok) {
        const imageResults = await imageResponse.json();
        
        // Update meals with images from Hugging Face
        return meals.map(meal => ({
          ...meal,
          image_url: imageResults[meal.name]?.image_url || null,
          has_image: !!imageResults[meal.name]?.image_url,
        }));
      }
    } catch (error) {
      console.error('Error fetching images for hardcoded meals:', error);
    }
    
    return meals;
  }, []);

  // UMass Dining Halls - matching what students expect
  const diningHalls = ['Berkshire', 'Worcester', 'Frank', 'Hampshire'];

  // Removed the useEffect that was fetching images on mount
  // Images for AI suggestions will be fetched when they're actually viewed (lazy loading)

  // Fetch AI recommendations from Gemini when dining hall is selected
  const fetchAiRecommendations = useCallback(async (hallName: string) => {
    setLoadingAiSuggestions(true);
    try {
      // 🎭 DEMO: Use hardcoded data for Roman Pisani at Berkshire
      if (isDemoRoman && hallName === 'Berkshire') {
        // Fetch images for the hardcoded AI suggestions
        const mealsWithImages = await fetchImagesForHardcodedMeals(ROMAN_BERK_AI_SUGGESTIONS_BASE);
        setAiSuggestions(mealsWithImages);
        setLoadingAiSuggestions(false);
        return;
      }
      
      // 🎭 DEMO: Use hardcoded healthy meals for Tiffany Gray at any dining hall
      if (isDemoTiffany) {
        // Fetch images for Tiffany's healthy AI suggestions
        const mealsWithImages = await fetchImagesForHardcodedMeals(TIFFANY_AI_SUGGESTIONS_BASE);
        setAiSuggestions(mealsWithImages);
        setLoadingAiSuggestions(false);
        return;
      }
      
      // Map display names to hall codes
      const hallCodeMap: Record<string, string> = {
        'Berkshire': 'Berkshire',
        'Worcester': 'Worcester',
        'Frank': 'Franklin',
        'Hampshire': 'Hampshire',
      };

      const diningHall = hallCodeMap[hallName] || hallName;
      
      const response = await fetch(`${API_BASE_URL}/coach/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meal_type: 'lunch', // TODO: Make this dynamic based on time of day
          dining_hall: diningHall,
          user_id: 101, // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the recommendations to match our MenuItem interface
      const suggestions = data.recommendations.map((rec: any) => ({
        name: rec.itemName,
        calories: Math.round(rec.estimatedCalories),
        reason: rec.reason,
        image_url: null, // Will be populated below
      }));

      // Fetch images for all AI suggestions in batch
      const foodNames = suggestions.map((s: any) => s.name);
      try {
        const imageResponse = await fetch(`${API_BASE_URL}/meals/images/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(foodNames),
        });
        
        if (imageResponse.ok) {
          const imageResults = await imageResponse.json();
          // Update cache
          setImageCache(prev => ({ 
            ...prev, 
            ...Object.fromEntries(
              Object.entries(imageResults).map(([name, data]: [string, any]) => [name, data.image_url])
            )
          }));
          
          // Add images to suggestions
          suggestions.forEach((suggestion: any) => {
            const imageData = imageResults[suggestion.name];
            if (imageData?.image_url) {
              suggestion.image_url = imageData.image_url;
            }
          });
        }
      } catch (error) {
        console.error('Error fetching AI suggestion images:', error);
      }

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      // Fallback to empty array on error
      setAiSuggestions([]);
    } finally {
      setLoadingAiSuggestions(false);
    }
  }, []);

  // Memoized fetch food image function to prevent recreating on every render
  const fetchFoodImage = useCallback(async (foodName: string): Promise<string | null> => {
    // Check cache first
    if (imageCache[foodName]) {
      return imageCache[foodName];
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/meals/image/${encodeURIComponent(foodName)}`
      );
      const data = await response.json();
      
      if (data.has_image && data.image_url) {
        setImageCache(prev => ({ ...prev, [foodName]: data.image_url }));
        return data.image_url;
      }
    } catch (error) {
      console.error('Error fetching food image:', error);
    }
    
    return null;
  }, [imageCache]); // Depend on imageCache

  // Memoized fetch menu items function
  const fetchMenuItems = useCallback(async (hallName: string) => {
    setLoadingMenu(true);
    setApiError(null);
    try {
      // 🎭 DEMO: Use hardcoded data for Roman Pisani at Berkshire
      if (isDemoRoman && hallName === 'Berkshire') {
        // Fetch images for the hardcoded regular meals
        const mealsWithImages = await fetchImagesForHardcodedMeals(ROMAN_BERK_REGULAR_MEALS_BASE);
        setMenuItems(mealsWithImages);
        setLoadingMenu(false);
        return;
      }
      
      // 🎭 DEMO: Use hardcoded healthy meals for Tiffany Gray at any dining hall
      if (isDemoTiffany) {
        // Fetch images for Tiffany's healthy regular meals
        const mealsWithImages = await fetchImagesForHardcodedMeals(TIFFANY_REGULAR_MEALS_BASE);
        setMenuItems(mealsWithImages);
        setLoadingMenu(false);
        return;
      }      console.log('Fetching menu from:', API_BASE_URL);
      
      // Map display names to hall codes
      const hallCodeMap: Record<string, string> = {
        'Berkshire': 'BERKSHIRE',
        'Worcester': 'WORCESTER',
        'Frank': 'FRANKLIN',
        'Hampshire': 'HAMPSHIRE',
      };

      const hallCode = hallCodeMap[hallName];
      
      if (!hallCode) {
        console.log(`No hall code mapping for ${hallName}, using mock data`);
        setMenuItems([]);
        setLoadingMenu(false);
        return;
      }

      const url = `${API_BASE_URL}/meals/menu?dining_hall_code=${hallCode}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const items = data.menu_items || [];
      
      console.log(`Fetched ${items.length} menu items`);
      
      // Fetch all images in one batch request
      const foodNames = items.map((item: MenuItem) => item.name);
      let imageResults: Record<string, any> = {};
      
      try {
        const imageResponse = await fetch(`${API_BASE_URL}/meals/images/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(foodNames),
        });
        
        if (imageResponse.ok) {
          imageResults = await imageResponse.json();
          // Update cache
          setImageCache(prev => ({ ...prev, ...Object.fromEntries(
            Object.entries(imageResults).map(([name, data]: [string, any]) => [name, data.image_url])
          )}));
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
      
      // Combine menu items with images
      const itemsWithImages = items.map((item: MenuItem) => {
        const imageData = imageResults[item.name];
        return {
          ...item,
          image_url: imageData?.image_url || null,
          ingredients: ['View details for nutrition info'], // Placeholder
          calories: Math.round(item.kcal),
        };
      });

      setMenuItems(itemsWithImages);
    } catch (error) {
      console.error('Error fetching menu:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errorMessage);
      // Fallback to empty array if API fails
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  }, []); // Empty deps - function doesn't depend on any props/state

  // Fetch menu items when dining hall is selected
  useEffect(() => {
    if (selectedHall && step === 2) {
      fetchMenuItems(selectedHall);
      fetchAiRecommendations(selectedHall);
    }
  }, [selectedHall, step, fetchMenuItems, fetchAiRecommendations]); // Include both fetch functions

  // All menu items from API go to "Available Meals"
  // AI suggestions are static and independent

  const handleStep1Next = () => {
    if (selectedHall) {
      setStep(2);
    }
  };

  const handleMealSelect = (meal: any) => {
    setSelectedMeal(meal);
    setStep(3);
  };

  const handleConfirmMeal = () => {
    // Invalidate dashboard cache so it fetches fresh data
    invalidateDashboardCache();
    
    setShowConfirmation(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      setShowConfirmation(false);
      setStep(1);
      setSelectedHall(null);
      setSelectedMeal(null);
      setSearchQuery('');
      router.push('/dashboard');
    }, 1500);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedMeal(null);
    } else if (step === 2) {
      setStep(1);
      setSelectedHall(null);
      setSearchQuery('');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-4xl font-bold text-gray-900">
            {step === 2 && selectedHall ? selectedHall : 'Add Meal'}
          </Text>
        </View>

        {/* Progress indicator */}
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-2">
            Step {step} of 3
          </Text>
          <View className="h-2 bg-gray-200 rounded-full">
            <View 
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </View>
        </View>

        {/* Step 1: Select Dining Hall */}
        {step === 1 && (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Where are you eating today?
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              Select your dining hall location
            </Text>
            {diningHalls.map((hall) => (
              <DiningHallButton
                key={hall}
                label={hall}
                selected={selectedHall === hall}
                onPress={() => setSelectedHall(hall)}
              />
            ))}
            <TouchableOpacity
              onPress={handleStep1Next}
              disabled={!selectedHall}
              className={`mt-6 py-4 rounded-xl items-center ${
                selectedHall ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <Text className={`font-semibold text-lg ${
                selectedHall ? 'text-white' : 'text-gray-500'
              }`}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Choose or Search Meal */}
        {step === 2 && (
          <View>
            {/* Search Bar with Find meal from text and Microphone */}
            <View className="mb-6 flex-row items-center">
              <View className="flex-1">
                <View className="flex-row items-center bg-white rounded-xl px-4 h-14 border border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="search" size={20} color="#6b7280" style={{ marginRight: 12 }} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Find meal from ${selectedHall}...`}
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-gray-900 text-base"
                  />
                </View>
              </View>
              <TouchableOpacity
                className="ml-3 w-14 h-14 bg-teal-500 rounded-xl items-center justify-center"
                style={{
                  shadowColor: '#14b8a6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="mic" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {loadingMenu && (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#14b8a6" />
                <Text className="text-gray-600 mt-4">Loading menu items...</Text>
              </View>
            )}

            {/* Error Message */}
            {!loadingMenu && apiError && (
              <View className="py-12 px-6 items-center">
                <View className="bg-red-50 rounded-2xl p-6 w-full">
                  <Ionicons name="alert-circle" size={48} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 12 }} />
                  <Text className="text-lg font-bold text-red-900 text-center mb-2">
                    Connection Error
                  </Text>
                  <Text className="text-sm text-red-700 text-center mb-4">
                    {apiError}
                  </Text>
                  <Text className="text-xs text-red-600 text-center mb-4">
                    API URL: {API_BASE_URL}
                  </Text>
                  <TouchableOpacity
                    onPress={() => selectedHall && fetchMenuItems(selectedHall)}
                    className="bg-red-600 py-3 px-6 rounded-xl items-center"
                  >
                    <Text className="text-white font-semibold">Try Again</Text>
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-500 text-center mt-4">
                    Make sure your backend is running on {API_BASE_URL}
                  </Text>
                </View>
              </View>
            )}

            {/* Show content only when not loading */}
            {!loadingMenu && !apiError && (
              <>
                {menuItems.length === 0 ? (
                  <View className="py-12 items-center">
                    <Ionicons name="restaurant-outline" size={64} color="#d1d5db" />
                    <Text className="text-gray-600 mt-4 text-center">
                      No menu items available for {selectedHall}
                    </Text>
                    <Text className="text-gray-400 mt-2 text-center text-sm">
                      Try selecting a different dining hall
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* AI Suggestions Section - Horizontal Carousel */}
                    {(loadingAiSuggestions || aiSuggestions.length > 0) && (
                      <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                          <Ionicons name="sparkles" size={20} color="#14b8a6" style={{ marginRight: 8 }} />
                          <Text className="text-xl font-bold text-gray-900">AI Recommendations</Text>
                        </View>
                        
                        {loadingAiSuggestions ? (
                          <View className="py-8 items-center">
                            <ActivityIndicator size="small" color="#14b8a6" />
                            <Text className="text-gray-600 mt-2 text-sm">Getting personalized suggestions...</Text>
                          </View>
                        ) : (
                          <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={180}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingRight: 24 }}
                          >
                {aiSuggestions.map((suggestion, index) => {
                  const bgColors = ['#fff7ed', '#eff6ff', '#f5f3ff', '#fefce8', '#f0fdfa', '#fdf2f8'];
                  const bgColor = bgColors[index % bgColors.length];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleMealSelect(suggestion)}
                      className="mr-3"
                    >
                      <View
                        className="rounded-2xl overflow-hidden"
                        style={{ 
                          width: 160,
                          height: 200, // Uniform height for all cards
                          backgroundColor: bgColor,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        {/* Top Icons */}
                        <View className="absolute top-2 left-2 right-2 z-10 flex-row justify-between items-start">
                          <View className="w-6 h-6 bg-teal-500 rounded-full items-center justify-center">
                            <Ionicons name="sparkles" size={14} color="white" />
                          </View>
                          <View className="bg-white/90 px-2 py-1 rounded-lg">
                            <Text className="text-xs font-semibold text-gray-900">
                              {suggestion.calories} kcal
                            </Text>
                          </View>
                        </View>

                        {/* Image Placeholder - Centered */}
                        <View className="w-full h-32 bg-gray-200 items-center justify-center">
                          {suggestion.image_url ? (
                            <Image source={{ uri: suggestion.image_url }} className="w-full h-full" resizeMode="cover" />
                          ) : (
                            <Ionicons name="restaurant" size={48} color="#9ca3af" />
                          )}
                        </View>

                        {/* Content - Dish Name Below */}
                        <View className="p-3 items-center flex-1 justify-center">
                          <Text className="text-base font-semibold text-gray-900 text-center" numberOfLines={2}>
                            {suggestion.name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
                        )}
            </View>
            )}

            {/* Available Meals - 2 Column Grid - Show ALL items from API */}
            {!loadingMenu && menuItems.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-3">Available Meals</Text>
              <View className="flex-row flex-wrap justify-between">
                {menuItems.map((meal, index) => {
                  const bgColors = ['#fff7ed', '#eff6ff', '#f5f3ff', '#fefce8', '#f0fdfa', '#fdf2f8'];
                  const bgColor = bgColors[index % bgColors.length];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleMealSelect(meal)}
                      className="w-[48%] mb-3"
                    >
                      <View
                        className="rounded-2xl overflow-hidden"
                        style={{ 
                          backgroundColor: bgColor,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        {/* Top Right Calories */}
                        <View className="absolute top-2 right-2 z-10">
                          <View className="bg-white/90 px-2 py-1 rounded-lg">
                            <Text className="text-xs font-semibold text-gray-900">
                              {meal.calories} kcal
                            </Text>
                          </View>
                        </View>

                        {/* Image Placeholder */}
                        <View className="w-full h-32 bg-gray-200 items-center justify-center">
                          {meal.image_url ? (
                            <Image source={{ uri: meal.image_url }} className="w-full h-full" resizeMode="cover" />
                          ) : (
                            <Ionicons name="restaurant" size={40} color="#9ca3af" />
                          )}
                        </View>

                        {/* Content */}
                        <View className="p-3">
                          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
                            {meal.name}
                          </Text>
                          <Text className="text-xs text-gray-600" numberOfLines={2}>
                            {meal.ingredients ? meal.ingredients.join(', ') : 'View details'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            )}
                  </>
                )}
              </>
            )}
          </View>
        )}

        {/* Step 3: Confirm Meal Details */}
        {step === 3 && selectedMeal && (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Confirm Meal Details
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              Review your meal selection
            </Text>

            <Card className="mb-6 bg-teal-50">
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Dining Hall</Text>
                <Text className="text-lg font-semibold text-gray-900">{selectedHall}</Text>
              </View>
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Meal Name</Text>
                <Text className="text-lg font-semibold text-gray-900">{selectedMeal.name}</Text>
              </View>
              {selectedMeal.ingredients && (
                <View className="mb-4">
                  <Text className="text-sm text-gray-500 mb-1">Ingredients</Text>
                  <Text className="text-base text-gray-700">
                    {selectedMeal.ingredients.join(', ')}
                  </Text>
                </View>
              )}
              <View>
                <Text className="text-sm text-gray-500 mb-1">Calories</Text>
                <Text className="text-2xl font-bold text-teal-600">{selectedMeal.calories} cal</Text>
              </View>
            </Card>

            <TouchableOpacity
              onPress={handleConfirmMeal}
              className="mt-6 py-4 rounded-xl items-center bg-teal-500"
            >
              <Text className="font-semibold text-lg text-white">
                Confirm & Add Meal
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Meal Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            }}
            className="bg-white rounded-3xl p-8 mx-6 w-11/12 items-center"
          >
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark" size={32} color="#15803d" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Meal Added!</Text>
            {selectedMeal && (
              <>
                <Text className="text-lg text-gray-700 mb-1">{selectedMeal.name}</Text>
                <Text className="text-sm text-gray-600 mb-4">{selectedMeal.calories} calories</Text>
              </>
            )}
            <Text className="text-sm text-gray-500 text-center mb-6">
              Redirecting to dashboard...
            </Text>
          </Animated.View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}
