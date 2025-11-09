# app/gemini_client.py
import json
import google.generativeai as genai
from .config import settings

# Make sure Gemini is configured once
genai.configure(api_key=settings.gemini_api_key)


def recommend_meals_json(user: dict, dining_halls: list[dict], meal_type: str) -> dict:
    """
    This is the cleaned-up version of your gemini_recommender.py logic.
    It returns parsed JSON instead of just printing text.
    """

    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""
You are a nutrition assistant helping a student choose meals.

User info (JSON):
{json.dumps(user, indent=2, default=str)}

Dining hall options (JSON; each row has hall_name/location, item name, kcal, macros, allergens, etc):
{json.dumps(dining_halls, indent=2, default=str)}

The student is eating **{meal_type.lower()}**.

For EACH dining hall (Worcester, Franklin, Berkshire, Hampshire), pick the top 5 meal options that:
- Do NOT include any of the user's allergies
- Respect the user's diet type if provided
- Are at least 100 calories so the meal is filling
- Help keep them near or under their daily calorie target if the data is available

Return VALID JSON **only** in this format:

{{
  "recommendations": {{
    "Worcester": [
      {{
        "itemName": "string",
        "estimatedCalories": number,
        "reason": "string"
      }}
    ],
    "Franklin": [
      {{
        "itemName": "string",
        "estimatedCalories": number,
        "reason": "string"
      }}
    ],
    "Berkshire": [
      {{
        "itemName": "string",
        "estimatedCalories": number,
        "reason": "string"
      }}
    ],
    "Hampshire": [
      {{
        "itemName": "string",
        "estimatedCalories": number,
        "reason": "string"
      }}
    ]
  }}
}}

Do not include any extra text outside that JSON structure.
"""

    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"},
    )

    # Parse the JSON Gemini returns
    return json.loads(response.text)





# import google.generativeai as genai
# from .config import settings

# genai.configure(api_key=settings.gemini_api_key)

# MODEL_NAME = "gemini-1.5-flash"

# def ask_umunch(snapshot: dict, menus: list[dict], question: str) -> str:
#     model = genai.GenerativeModel(MODEL_NAME)

#     prompt = f"""
# You are UMunch, a nutrition and macro coach for UMass students using UMass dining halls.

# User question:
# {question}

# User daily snapshot (JSON):
# {snapshot}

# Today's menu items (JSON, list of foods with hall_name, item_name, kcal, protein_g, carb_g, fat_g):
# {menus}

# Use this data to:
# 1) Summarize how the user is doing vs their calorie and macro targets today.
# 2) Recommend 1–3 meal options from the menu that move them toward their goals.
# 3) Avoid items that conflict with allergies or diet preferences if present.
# Keep it friendly, concrete, and student-friendly.
# """
#     response = model.generate_content(prompt)
#     return response.text
