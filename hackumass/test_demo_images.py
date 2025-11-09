#!/usr/bin/env python3
"""
Test script to verify Hugging Face image fetching works for demo meals.
Run this to test the backend image service before running the full demo.
"""

import sys
import json
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_path))

from app.food_image_service import get_food_image_service

# Demo meal names from Roman Pisani's hardcoded meals
AI_SUGGESTIONS = [
    'Grilled Chicken Breast',
    'Rice Pilaf',
    'Beef Kebab',
    'Falafel Wrap',
    'Lamb Biryani',
]

REGULAR_MEALS = [
    'Scrambled Eggs',
    'Turkey Sandwich',
    'Caesar Salad',
    'Pasta Marinara',
    'Chicken Stir Fry',
    'French Fries',
    'Greek Yogurt Parfait',
    'Veggie Burger',
    'Fruit Smoothie',
    'Pancakes with Syrup',
]

def test_image_fetching():
    """Test fetching images for all demo meals."""
    print("=" * 80)
    print("TESTING HUGGING FACE IMAGE FETCHING FOR ROMAN PISANI DEMO")
    print("=" * 80)
    print()
    
    # Initialize the service (this will load the dataset)
    print("Initializing Food Image Service...")
    service = get_food_image_service()
    print()
    
    if not service.dataset:
        print("❌ ERROR: Failed to load dataset!")
        return False
    
    print(f"✅ Dataset loaded with {len(service.dataset)} items")
    print(f"✅ Index created with {len(service.food_index)} unique food names")
    print()
    
    # Test AI suggestions
    print("-" * 80)
    print("TESTING AI SUGGESTIONS (5 Halal Meals)")
    print("-" * 80)
    
    ai_results = []
    for food_name in AI_SUGGESTIONS:
        result = service.get_food_image(food_name)
        ai_results.append(result)
        
        if result and result.get('image_url'):
            print(f"✅ {food_name}")
            print(f"   Matched: {result.get('matched_name')}")
            print(f"   Score: {result.get('match_score', 1.0):.2f}")
            print(f"   URL: {result.get('image_url')[:80]}...")
        else:
            print(f"❌ {food_name} - No image found")
        print()
    
    # Test regular meals
    print("-" * 80)
    print("TESTING REGULAR MEALS (10 Items)")
    print("-" * 80)
    
    regular_results = []
    for food_name in REGULAR_MEALS:
        result = service.get_food_image(food_name)
        regular_results.append(result)
        
        if result and result.get('image_url'):
            print(f"✅ {food_name}")
            print(f"   Matched: {result.get('matched_name')}")
            print(f"   Score: {result.get('match_score', 1.0):.2f}")
            print(f"   URL: {result.get('image_url')[:80]}...")
        else:
            print(f"❌ {food_name} - No image found")
        print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    ai_success = sum(1 for r in ai_results if r and r.get('image_url'))
    regular_success = sum(1 for r in regular_results if r and r.get('image_url'))
    total_success = ai_success + regular_success
    total_meals = len(AI_SUGGESTIONS) + len(REGULAR_MEALS)
    
    print(f"AI Suggestions: {ai_success}/{len(AI_SUGGESTIONS)} images found")
    print(f"Regular Meals: {regular_success}/{len(REGULAR_MEALS)} images found")
    print(f"Total: {total_success}/{total_meals} images found ({total_success/total_meals*100:.1f}%)")
    print()
    
    if total_success == total_meals:
        print("🎉 SUCCESS! All meals have images!")
        return True
    elif total_success > 0:
        print("⚠️  PARTIAL SUCCESS: Some meals have images")
        print("   Items without images will display with placeholder icons")
        return True
    else:
        print("❌ ERROR: No images found for any meals")
        return False

if __name__ == '__main__':
    try:
        success = test_image_fetching()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
