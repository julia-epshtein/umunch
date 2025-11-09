# app/debugGemini.py
from .services.user_service import get_user_data
from .services.dining_service import get_dining_hall_data
from .gemini_client import recommend_meals_json


def main():
    # 1) Get user
    user = get_user_data(101)

    # 2) Get dining hall rows for a meal type
    meal_type = "lunch"   # or "breakfast", "dinner"
    dining_rows = get_dining_hall_data(meal_type)
    print(f"\n🍽 Sample dining rows for {meal_type} (first 3):")
    for r in dining_rows[:3]:
        print(r)

    # 3) Ask Gemini for JSON recommendations
    recs = recommend_meals_json(user, dining_rows, meal_type)

    print("\n💬 Gemini recommendations JSON:")
    print(recs)


if __name__ == "__main__":
    main()
