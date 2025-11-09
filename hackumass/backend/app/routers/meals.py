from fastapi import APIRouter, Query
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from ..db import fetch_one, fetch_all, execute
from ..food_image_service import get_food_image_service

router = APIRouter()

class MealLog(BaseModel):
    external_user_key: str
    dining_hall_code: str   # e.g. 'BERKSHIRE'
    meal_type_code: str     # 'BREAKFAST','LUNCH','DINNER','SNACK'
    kcal_total: float
    protein_total_g: float
    carb_total_g: float
    fat_total_g: float

@router.post("/meals")
def log_meal(meal: MealLog):
    user = fetch_one(
        "SELECT user_id FROM users WHERE external_user_key = %s",
        (meal.external_user_key,),
    )
    if not user:
        return {"error": "user_not_found"}

    dh = fetch_one(
        "SELECT dining_hall_id FROM dining_halls WHERE hall_code = %s",
        (meal.dining_hall_code.upper(),),
    )
    mt = fetch_one(
        "SELECT meal_type_id FROM meal_types WHERE meal_type_code = %s",
        (meal.meal_type_code.upper(),),
    )

    if not dh or not mt:
        return {"error": "invalid_hall_or_meal_type"}

    execute(
        """
        INSERT INTO food_logs (
            user_id, date_id, meal_type_id, dining_hall_id,
            kcal_total, protein_total_g, carb_total_g, fat_total_g,
            logged_mode
        )
        VALUES (%s, CURRENT_DATE(), %s, %s, %s, %s, %s, %s, 'MANUAL')
        """,
        (
            user["USER_ID"],
            mt["MEAL_TYPE_ID"],
            dh["DINING_HALL_ID"],
            meal.kcal_total,
            meal.protein_total_g,
            meal.carb_total_g,
            meal.fat_total_g,
        ),
    )

    return {"status": "ok"}


@router.get("/meals/menu")
def get_menu_with_images(
    dining_hall_code: Optional[str] = Query(None),
    meal_type_code: Optional[str] = Query(None)
):
    """
    Get menu items with images from Hugging Face dataset.
    Optionally filter by dining hall and meal type.
    """
    # Query the nov_12_2025 table with correct fully qualified name
    query = """
        SELECT 
            FOOD_ID,
            NAME,
            MEAL,
            LOCATION,
            CATEGORY,
            CALORIES,
            PROTEIN,
            CARBS,
            FAT
        FROM umunch_db.dining_data.nov_12_2025
    """
    
    params = []
    
    if dining_hall_code:
        # Map hall codes to location names (matching your data)
        hall_location_map = {
            'BERKSHIRE': 'Berkshire',
            'WORCESTER': 'Worcester',
            'FRANKLIN': 'Frank',
            'HAMPSHIRE': 'Hampshire'
        }
        location_name = hall_location_map.get(dining_hall_code.upper())
        if location_name:
            query += " WHERE LOCATION = %s"
            params.append(location_name)
    
    if meal_type_code:
        # Add meal type filter (breakfast, lunch, dinner)
        if 'WHERE' in query:
            query += " AND MEAL = %s"
        else:
            query += " WHERE MEAL = %s"
        params.append(meal_type_code.lower())
    
    # Limit results to 10 items for faster response
    query += " LIMIT 10"
    
    menu_items = fetch_all(query, tuple(params) if params else None)
    
    if not menu_items:
        return {"menu_items": []}
    
    # Map location back to hall code
    location_to_code = {
        'Berkshire': 'BERKSHIRE',
        'Worcester': 'WORCESTER',
        'Frank': 'FRANKLIN',
        'Hampshire': 'HAMPSHIRE'
    }
    
    # Return menu items without image lookups (fetch images separately if needed)
    enhanced_items = []
    for item in menu_items:
        food_name = item.get('NAME')
        location = item.get('LOCATION')
        meal_type = item.get('MEAL')
        
        enhanced_item = {
            "menu_item_id": item.get('FOOD_ID'),
            "name": food_name,
            "kcal": item.get('CALORIES'),
            "protein_g": item.get('PROTEIN'),
            "carb_g": item.get('CARBS'),
            "fat_g": item.get('FAT'),
            "hall_name": f"{location} Dining Commons" if location else "Unknown",
            "hall_code": location_to_code.get(location, 'UNKNOWN'),
            "meal_type_name": meal_type.capitalize() if meal_type else None,
            "meal_type_code": meal_type.upper() if meal_type else None,
            "category": item.get('CATEGORY'),
        }
        
        enhanced_items.append(enhanced_item)
    
    return {"menu_items": enhanced_items}


@router.get("/meals/image/{food_name}")
def get_food_image_endpoint(food_name: str):
    """
    Get image URL for a specific food item by name.
    Returns image URL from the MM-Food-100K dataset.
    """
    image_service = get_food_image_service()
    image_info = image_service.get_food_image(food_name)
    
    if not image_info or not image_info.get('image_url'):
        return {
            "error": "Image not found",
            "food_name": food_name,
            "has_image": False
        }
    
    return {
        "food_name": food_name,
        "matched_name": image_info.get('matched_name'),
        "match_score": image_info.get('match_score'),
        "has_image": True,
        "image_url": image_info.get('image_url'),
        "nutritional_profile": image_info.get('nutritional_profile'),
        "ingredients": image_info.get('ingredients'),
        "cooking_method": image_info.get('cooking_method')
    }


@router.post("/meals/images/batch")
def get_food_images_batch(food_names: list[str]):
    """
    Get image URLs for multiple food items at once.
    Much faster than calling /meals/image/{food_name} multiple times.
    """
    image_service = get_food_image_service()
    results = {}
    
    for food_name in food_names:
        image_info = image_service.get_food_image(food_name)
        if image_info and image_info.get('image_url'):
            results[food_name] = {
                "has_image": True,
                "image_url": image_info.get('image_url'),
                "matched_name": image_info.get('matched_name'),
                "match_score": image_info.get('match_score')
            }
        else:
            results[food_name] = {
                "has_image": False,
                "image_url": None
            }
    
    return results

