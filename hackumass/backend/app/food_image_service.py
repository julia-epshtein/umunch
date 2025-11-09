"""
Service for fetching food images from Hugging Face MM-Food-100K dataset.
"""
from datasets import load_dataset
from typing import Optional, Dict
import re
from difflib import SequenceMatcher

class FoodImageService:
    def __init__(self):
        self.dataset = None
        self.food_index = {}
        self._load_dataset()
    
    def _load_dataset(self):
        """Load the MM-Food-100K dataset from Hugging Face."""
        try:
            print("Loading MM-Food-100K dataset from Hugging Face...")
            # Load the dataset - it may take a moment on first load
            self.dataset = load_dataset("Codatta/MM-Food-100K", split="train", streaming=False)
            
            # Create an index mapping food names to dataset entries for faster lookup
            print("Building food name index...")
            for idx, item in enumerate(self.dataset):
                # The dataset uses 'dish_name' field
                if 'dish_name' in item:
                    food_name = item.get('dish_name', '')
                    if food_name:
                        normalized_name = self._normalize_name(food_name)
                        
                        if normalized_name not in self.food_index:
                            self.food_index[normalized_name] = []
                        self.food_index[normalized_name].append(idx)
            
            print(f"Dataset loaded with {len(self.dataset)} food items")
            print(f"Index created with {len(self.food_index)} unique food names")
        except Exception as e:
            print(f"Error loading dataset: {e}")
            self.dataset = None
    
    def _normalize_name(self, name: str) -> str:
        """Normalize food name for better matching."""
        if not name:
            return ""
        # Convert to lowercase, remove special characters, and extra spaces
        normalized = re.sub(r'[^\w\s]', '', name.lower())
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        return normalized
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate similarity ratio between two strings."""
        return SequenceMatcher(None, str1, str2).ratio()
    
    def get_food_image(self, food_name: str, threshold: float = 0.7) -> Optional[Dict]:
        """
        Get food image URL for a given food name.
        
        Args:
            food_name: The name of the food item from Snowflake
            threshold: Similarity threshold for fuzzy matching (0.0 to 1.0)
        
        Returns:
            Dictionary with image information or None if not found
        """
        if not self.dataset:
            return None
        
        normalized_query = self._normalize_name(food_name)
        
        # First, try exact match
        if normalized_query in self.food_index:
            idx = self.food_index[normalized_query][0]
            item = self.dataset[idx]
            return self._extract_image_info(item, food_name)
        
        # If no exact match, try fuzzy matching
        best_match = None
        best_score = 0
        
        for indexed_name, indices in self.food_index.items():
            similarity = self._calculate_similarity(normalized_query, indexed_name)
            
            if similarity > best_score and similarity >= threshold:
                best_score = similarity
                best_match = indices[0]
        
        if best_match is not None:
            item = self.dataset[best_match]
            result = self._extract_image_info(item, food_name)
            if result:
                result['match_score'] = best_score
            return result
        
        return None
    
    def _extract_image_info(self, item: Dict, original_name: str) -> Optional[Dict]:
        """Extract image information from dataset item."""
        try:
            # The MM-Food-100K dataset provides image_url field
            image_url = item.get('image_url')
            dish_name = item.get('dish_name')
            
            if image_url:
                return {
                    'food_name': original_name,
                    'matched_name': dish_name,
                    'image_url': image_url,  # URL to the actual image
                    'has_image': True,
                    'nutritional_profile': item.get('nutritional_profile'),
                    'ingredients': item.get('ingredients'),
                    'cooking_method': item.get('cooking_method'),
                }
            return None
        except Exception as e:
            print(f"Error extracting image info: {e}")
            return None
    
    def get_multiple_images(self, food_names: list[str]) -> Dict[str, Optional[Dict]]:
        """
        Get images for multiple food items at once.
        
        Args:
            food_names: List of food names from Snowflake
        
        Returns:
            Dictionary mapping food names to their image information
        """
        results = {}
        for name in food_names:
            results[name] = self.get_food_image(name)
        return results


# Singleton instance
_food_image_service = None

def get_food_image_service() -> FoodImageService:
    """Get or create the singleton FoodImageService instance."""
    global _food_image_service
    if _food_image_service is None:
        _food_image_service = FoodImageService()
    return _food_image_service
