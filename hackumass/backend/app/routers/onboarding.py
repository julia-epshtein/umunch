from fastapi import APIRouter
from pydantic import BaseModel
from ..db import fetch_one, execute

router = APIRouter()

# 1) User info (DOB, height, weight, gender)
class UserInfo(BaseModel):
    external_user_key: str  # e.g. email or auth id
    date_of_birth: str      # ISO string from frontend (you can refine later)
    height_feet: int
    height_inches: int
    weight_lbs: float
    gender_identity: str

@router.post("/onboarding/user-info")
def save_user_info(info: UserInfo):
    height_in = info.height_feet * 12 + info.height_inches

    existing = fetch_one(
        "SELECT user_id FROM users WHERE external_user_key = %s",
        (info.external_user_key,),
    )
    if existing:
        execute(
            """
            UPDATE users
            SET height_in = %s,
                weight_lbs = %s,
                gender_identity = %s,
                age_years = 22       -- TODO: compute from DOB if you want
            WHERE external_user_key = %s
            """,
            (height_in, info.weight_lbs, info.gender_identity, info.external_user_key),
        )
    else:
        execute(
            """
            INSERT INTO users (external_user_key, height_in, weight_lbs, gender_identity, age_years)
            VALUES (%s, %s, %s, %s, 22)
            """,
            (info.external_user_key, height_in, info.weight_lbs, info.gender_identity),
        )

    return {"status": "ok"}


# 2) Dietary preferences + allergies
class DietInfo(BaseModel):
    external_user_key: str
    dietary_restrictions: list[str]
    allergies: list[str]

@router.post("/onboarding/diet")
def save_diet(info: DietInfo):
    diet_type = info.dietary_restrictions[0].upper() if info.dietary_restrictions else "NONE"
    execute(
        """
        UPDATE users
        SET diet_type = %s,
            allergies = PARSE_JSON(%s)
        WHERE external_user_key = %s
        """,
        (diet_type, str(info.allergies).replace("'", '"'), info.external_user_key),
    )
    return {"status": "ok"}


# 3) Goals & daily targets
class GoalsInfo(BaseModel):
    external_user_key: str
    goals: list[str]       # e.g. ['loseWeight','gainMuscle']

@router.post("/onboarding/goals")
def save_goals(info: GoalsInfo):
    if "loseWeight" in info.goals:
        goal_type = "CUT"
    elif "gainMuscle" in info.goals:
        goal_type = "BULK"
    else:
        goal_type = "MAINTAIN"

    user = fetch_one(
        "SELECT user_id, weight_lbs, height_in, activity_level FROM users WHERE external_user_key = %s",
        (info.external_user_key,),
    )
    if not user:
        return {"error": "user_not_found"}

    # Calculate BMR using Mifflin-St Jeor Formula
    weight_kg = user["WEIGHT_LBS"] * 0.453592
    height_cm = user["HEIGHT_IN"] * 2.54
    
    # Get gender for BMR calculation
    gender = fetch_one(
        "SELECT gender_identity FROM users WHERE user_id = %s",
        (user["USER_ID"],)
    )["GENDER_IDENTITY"]
    
    # BMR Formula
    if gender.upper() == "MALE":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * 20) + 5  # Assuming age 20 for now
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * 20) - 161
    
    # Activity level multipliers
    activity_multipliers = {
        "NOT_VERY_ACTIVE": 1.2,  # Sedentary
        "LIGHTLY_ACTIVE": 1.375, # Light exercise
        "ACTIVE": 1.55,          # Moderate exercise
        "VERY_ACTIVE": 1.725     # Heavy exercise
    }
    
    # Calculate TDEE (Total Daily Energy Expenditure)
    activity_multiplier = activity_multipliers.get(user["ACTIVITY_LEVEL"], 1.2)
    tdee = bmr * activity_multiplier
    
    # Adjust calories based on goal
    if goal_type == "CUT":
        kcal_target = tdee - 500  # 500 calorie deficit for weight loss
    elif goal_type == "BULK":
        kcal_target = tdee + 300  # 300 calorie surplus for muscle gain
    else:
        kcal_target = tdee       # Maintain weight
        
    # Calculate macro targets
    protein_target = weight_kg * 2.0  # 2g protein per kg body weight
    fat_target = (kcal_target * 0.25) / 9  # 25% of calories from fat
    remaining_calories = kcal_target - (protein_target * 4) - (fat_target * 9)
    carb_target = remaining_calories / 4  # Rest from carbs

    execute(
        """
        UPDATE users
        SET goal_type = %s
        WHERE user_id = %s
        """,
        (goal_type, user["USER_ID"]),
    )

    execute(
        """
        MERGE INTO user_daily_targets t
        USING (SELECT %s AS user_id, CURRENT_DATE() AS date_id) s
        ON t.user_id = s.user_id AND t.date_id = s.date_id
        WHEN MATCHED THEN UPDATE SET
            kcal_target = %s,
            protein_target_g = %s,
            carb_target_g = %s,
            fat_target_g = %s,
            goal_type = %s,
            activity_level = COALESCE(t.activity_level, %s),
            weight_lbs_snapshot = %s,
            height_in_snapshot = %s,
            target_source = 'AUTO_CALC'
        WHEN NOT MATCHED THEN INSERT (
            user_id, date_id, kcal_target, protein_target_g, carb_target_g, fat_target_g,
            goal_type, activity_level, weight_lbs_snapshot, height_in_snapshot, target_source
        ) VALUES (
            s.user_id, s.date_id, %s, %s, %s, %s,
            %s, %s, %s, %s, 'AUTO_CALC'
        );
        """,
        (
            user["USER_ID"],
            kcal_target, protein_target, carb_target, fat_target,
            goal_type, user["ACTIVITY_LEVEL"],
            user["WEIGHT_LBS"], user["HEIGHT_IN"],
            kcal_target, protein_target, carb_target, fat_target,
            goal_type, user["ACTIVITY_LEVEL"],
            user["WEIGHT_LBS"], user["HEIGHT_IN"],
        ),
    )

    return {"status": "ok"}


# 4) Activity level
class ActivityInfo(BaseModel):
    external_user_key: str
    activity_level: str   # 'notVeryActive','lightlyActive','active','veryActive'

@router.post("/onboarding/activity")
def save_activity(info: ActivityInfo):
    execute(
        """
        UPDATE users
        SET activity_level = %s
        WHERE external_user_key = %s
        """,
        (info.activity_level.upper(), info.external_user_key),
    )
    return {"status": "ok"}


# 5) Preferred dining halls
class HallsInfo(BaseModel):
    external_user_key: str
    preferred_halls: list[str]   # e.g. ['BERKSHIRE','WORCESTER']

@router.post("/onboarding/dining-halls")
def save_halls(info: HallsInfo):
    execute(
        """
        UPDATE users
        SET preferred_halls = PARSE_JSON(%s)
        WHERE external_user_key = %s
        """,
        (str(info.preferred_halls).replace("'", '"'), info.external_user_key),
    )
    return {"status": "ok"}
