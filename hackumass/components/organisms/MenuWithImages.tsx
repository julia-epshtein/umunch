// Example React Native component for displaying menu items with images
// Place this in your components/organisms folder

import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
// Use the unified API base URL
import { BASE_URL as API_BASE_URL } from '../../lib/api';

interface MenuItem {
  menu_item_id: number;
  name: string;
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  hall_name: string;
  has_image: boolean;
  matched_food_name?: string;
  match_score?: number;
}

interface MenuWithImagesProps {
  diningHallCode?: string;
  mealTypeCode?: string;
}

export const MenuWithImages: React.FC<MenuWithImagesProps> = ({ 
  diningHallCode, 
  mealTypeCode 
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuWithImages();
  }, [diningHallCode, mealTypeCode]);

  const fetchMenuWithImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (diningHallCode) params.append('dining_hall_code', diningHallCode);
      if (mealTypeCode) params.append('meal_type_code', mealTypeCode);

      const response = await fetch(`${API_BASE_URL}/meals/menu?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }

      const data = await response.json();
      setMenuItems(data.menu_items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.imageContainer}>
        {item.has_image ? (
          <FoodImage foodName={item.name} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.foodName}>{item.name}</Text>
        
        {item.matched_food_name && item.matched_food_name !== item.name && (
          <Text style={styles.matchedName}>
            Similar to: {item.matched_food_name}
          </Text>
        )}
        
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionText}>{item.kcal} kcal</Text>
          <Text style={styles.nutritionText}>P: {item.protein_g}g</Text>
          <Text style={styles.nutritionText}>C: {item.carb_g}g</Text>
          <Text style={styles.nutritionText}>F: {item.fat_g}g</Text>
        </View>
        
        <Text style={styles.hallName}>{item.hall_name}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading menu items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={menuItems}
      renderItem={renderMenuItem}
      keyExtractor={(item) => item.menu_item_id.toString()}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No menu items available</Text>
        </View>
      }
    />
  );
};

// Component for loading and displaying individual food images
interface FoodImageProps {
  foodName: string;
}

const FoodImage: React.FC<FoodImageProps> = ({ foodName }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImage();
  }, [foodName]);

  const loadImage = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/meals/image/${encodeURIComponent(foodName)}`
      );
      
      const data = await response.json();
      
      if (data.has_image && data.image_url) {
        setImageUrl(data.image_url);
      }
    } catch (err) {
      console.error('Error loading image:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.imageLoadingContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (!imageUrl) {
    return (
      <View style={styles.placeholderImage}>
        <Text style={styles.placeholderText}>No Image</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.foodImage}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  imageLoadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    flex: 1,
    padding: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  matchedName: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  nutritionText: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hallName: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

// Usage example:
/*
import { MenuWithImages } from './components/organisms/MenuWithImages';

// In your screen component:
<MenuWithImages 
  diningHallCode="BERKSHIRE"
  mealTypeCode="LUNCH"
/>
*/
