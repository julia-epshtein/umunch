import google.generativeai as genai
from .config import settings

genai.configure(api_key=settings.gemini_api_key)

MODEL_NAME = "gemini-1.5-flash"

def ask_umunch(snapshot: dict, menus: list[dict], question: str) -> str:
    model = genai.GenerativeModel(MODEL_NAME)

    prompt = f"""
You are UMunch, a nutrition and macro coach for UMass students using UMass dining halls.

User question:
{question}

User daily snapshot (JSON):
{snapshot}

Today's menu items (JSON, list of foods with hall_name, item_name, kcal, protein_g, carb_g, fat_g):
{menus}

Use this data to:
1) Summarize how the user is doing vs their calorie and macro targets today.
2) Recommend 1–3 meal options from the menu that move them toward their goals.
3) Avoid items that conflict with allergies or diet preferences if present.
Keep it friendly, concrete, and student-friendly.
"""
    response = model.generate_content(prompt)
    return response.text
