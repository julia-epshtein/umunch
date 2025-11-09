# UMunch - Detailed Project Context

## Table of Contents

1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [AI Integration](#ai-integration)
6. [API Documentation](#api-documentation)
7. [Development Setup](#development-setup)

## Project Overview

UMunch is a comprehensive nutrition and fitness tracking application specifically designed for UMass dining hall users. It combines mobile app functionality with AI-powered insights and recommendations.

### Key Features

- User authentication and profile management
- Personalized meal tracking in UMass dining halls
- Workout logging and fitness goals
- AI-powered nutritional insights
- Dietary restrictions and allergen management
- Activity level tracking
- Personalized recommendations

## Frontend Architecture

### Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (TailwindCSS for React Native)
- **State Management**: Local state with Context API
- **Data Persistence**: Expo SecureStore for auth tokens

### Component Architecture (Atomic Design)

1. **Atoms** (Basic Building Blocks)

```typescript
// Button.tsx
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

// Input.tsx
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
}
```

2. **Molecules** (Component Combinations)

```typescript
// FormField.tsx
interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
}

// Card.tsx
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}
```

3. **Organisms** (Complex Components)

```typescript
// SignUpForm.tsx - Complete signup form with validation
interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// MealTracker.tsx - Complex meal logging component
interface MealTrackerProps {
  onMealLogged: (meal: MealData) => void;
  diningHall: string;
}
```

### Screen Flows & Data Models

1. **Authentication Flow**

```typescript
// User Authentication Models
interface AuthPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}
```

2. **Onboarding Flow** (5 steps)

```typescript
// Step 1: User Info
interface UserProfile {
  dateOfBirth: Date;
  height: {
    feet: number;
    inches: number;
  };
  weight: number;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say" | "other";
  otherGender?: string;
}

// Step 2: Dietary Preferences
interface DietaryPreferences {
  restrictions: Array<{
    id: string;
    name: string;
    description: string;
    selected: boolean;
  }>;
  allergies: Array<{
    id: string;
    name: string;
    selected: boolean;
  }>;
  otherAllergies?: string;
}

// Step 3: Goals
interface UserGoals {
  selectedGoals: string[]; // Multiple from predefined list
  customGoals?: string[];
}

// Step 4: Activity Level
type ActivityLevel =
  | "notVeryActive"
  | "lightlyActive"
  | "active"
  | "veryActive";

// Step 5: Dining Preferences
interface DiningPreferences {
  preferredHall: string;
  otherHall?: string;
}
```

3. **Main App Features**

```typescript
// Meal Logging
interface MealData {
  id: string;
  userId: string;
  name: string;
  ingredients: string[];
  calories: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  diningHall: string;
  timestamp: Date;
  nutritionalInfo?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Workout Logging
interface WorkoutData {
  id: string;
  userId: string;
  type: string;
  duration: number;
  distance?: number;
  calories: number;
  timestamp: Date;
}

// Dashboard Data
interface DashboardStats {
  dailyCalories: {
    consumed: number;
    burned: number;
    target: number;
  };
  meals: MealData[];
  workouts: WorkoutData[];
  insights: InsightData[];
}
```

## Backend Architecture

### Technology Stack

- **Framework**: FastAPI (Python)
- **Database**: Snowflake
- **AI**: Google Gemini API
- **Authentication**: JWT with bearer tokens
- **API Documentation**: OpenAPI/Swagger

### Core Components

1. **FastAPI Application Structure**

```python
backend/
├── app/
│   ├── routers/
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── onboarding.py   # User setup flow
│   │   ├── meals.py        # Meal tracking
│   │   ├── workouts.py     # Workout tracking
│   │   ├── dashboard.py    # User dashboard data
│   │   └── coach.py        # AI insights & recommendations
│   ├── models/
│   │   ├── user.py         # Pydantic models
│   │   ├── meal.py
│   │   └── workout.py
│   ├── services/
│   │   ├── auth.py         # Authentication logic
│   │   ├── snowflake.py    # Database operations
│   │   └── gemini.py       # AI integration
│   ├── config.py           # Configuration management
│   └── main.py             # Application entry point
```

2. **Key Backend Services**

```python
# Authentication Service
class AuthService:
    async def create_user(self, user_data: UserCreate) -> User:
        # Hash password
        # Store in Snowflake
        # Generate JWT
        pass

    async def authenticate(self, credentials: AuthCredentials) -> str:
        # Verify credentials
        # Return JWT token
        pass

# Snowflake Service
class SnowflakeService:
    async def execute_query(self, query: str, params: dict) -> List[Dict]:
        # Execute Snowflake query
        # Return results
        pass

    async def batch_insert(self, table: str, records: List[Dict]):
        # Batch insert records
        pass

# Gemini AI Service
class GeminiService:
    async def analyze_meal(self, meal_data: MealData, user_profile: UserProfile) -> Dict:
        # Generate meal insights
        pass

    async def get_recommendations(self, user_data: UserData) -> List[Recommendation]:
        # Generate personalized recommendations
        pass
```

### API Endpoints & Logic

1. **Authentication Endpoints**

```python
@router.post("/auth/signup")
async def signup(user_data: UserCreate):
    # Validate email format
    # Check password strength
    # Create user record
    # Generate JWT token
    return {"token": token, "user": user_data}

@router.post("/auth/login")
async def login(credentials: AuthCredentials):
    # Validate credentials
    # Generate JWT token
    return {"token": token}
```

2. **Meal Tracking Endpoints**

```python
@router.post("/meals")
async def log_meal(meal: MealCreate, current_user: User = Depends(get_current_user)):
    # Store meal data
    # Generate insights
    # Update user stats
    return {"meal": saved_meal, "insights": insights}

@router.get("/meals")
async def get_meals(
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: User = Depends(get_current_user)
):
    # Fetch meals from date range
    # Calculate statistics
    return {"meals": meals, "stats": stats}
```

## Database Schema

### Snowflake Tables & Relationships

1. **Core Tables**

```sql
-- Users and Authentication
CREATE TABLE USERS (
    USER_ID VARCHAR PRIMARY KEY,
    FULL_NAME VARCHAR NOT NULL,
    EMAIL VARCHAR UNIQUE NOT NULL,
    PASSWORD_HASH VARCHAR NOT NULL,
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    LAST_LOGIN TIMESTAMP_NTZ
);

-- User Profiles
CREATE TABLE PROFILES (
    USER_ID VARCHAR PRIMARY KEY REFERENCES USERS(USER_ID),
    DATE_OF_BIRTH DATE NOT NULL,
    HEIGHT_FEET NUMBER,
    HEIGHT_INCHES NUMBER,
    WEIGHT_LBS NUMBER,
    GENDER VARCHAR,
    OTHER_GENDER VARCHAR,
    UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- User Preferences
CREATE TABLE PREFERENCES (
    USER_ID VARCHAR PRIMARY KEY REFERENCES USERS(USER_ID),
    DIETARY_RESTRICTIONS VARIANT, -- JSON array
    ALLERGIES VARIANT,           -- JSON array
    GOALS VARIANT,               -- JSON array
    ACTIVITY_LEVEL VARCHAR,
    PREFERRED_DINING_HALL VARCHAR,
    UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Meal Tracking
CREATE TABLE MEALS (
    MEAL_ID VARCHAR PRIMARY KEY,
    USER_ID VARCHAR REFERENCES USERS(USER_ID),
    NAME VARCHAR NOT NULL,
    INGREDIENTS VARIANT,         -- JSON array
    CALORIES NUMBER,
    NUTRITIONAL_INFO VARIANT,    -- JSON object
    MEAL_TYPE VARCHAR,
    DINING_HALL VARCHAR,
    TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    AI_INSIGHTS VARIANT          -- JSON object
);

-- Workout Tracking
CREATE TABLE WORKOUTS (
    WORKOUT_ID VARCHAR PRIMARY KEY,
    USER_ID VARCHAR REFERENCES USERS(USER_ID),
    TYPE VARCHAR NOT NULL,
    DURATION_MIN NUMBER NOT NULL,
    DISTANCE_KM NUMBER,
    CALORIES NUMBER,
    TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- AI Insights
CREATE TABLE INSIGHTS (
    INSIGHT_ID VARCHAR PRIMARY KEY,
    USER_ID VARCHAR REFERENCES USERS(USER_ID),
    TYPE VARCHAR NOT NULL,
    CONTENT VARIANT,            -- JSON object
    TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

2. **Key Queries**

```sql
-- Daily Nutrition Summary
SELECT
    DATE(m.TIMESTAMP) as date,
    COUNT(*) as meal_count,
    SUM(m.CALORIES) as total_calories,
    ARRAY_AGG(OBJECT_CONSTRUCT(
        'name', m.NAME,
        'calories', m.CALORIES,
        'mealType', m.MEAL_TYPE
    )) as meals
FROM MEALS m
WHERE m.USER_ID = ?
AND DATE(m.TIMESTAMP) = CURRENT_DATE()
GROUP BY DATE(m.TIMESTAMP);

-- Weekly Progress
SELECT
    DATE_TRUNC('week', m.TIMESTAMP) as week,
    AVG(m.CALORIES) as avg_daily_calories,
    COUNT(DISTINCT DATE(m.TIMESTAMP)) as days_tracked,
    SUM(w.CALORIES) as calories_burned
FROM MEALS m
LEFT JOIN WORKOUTS w
    ON m.USER_ID = w.USER_ID
    AND DATE(m.TIMESTAMP) = DATE(w.TIMESTAMP)
WHERE m.USER_ID = ?
GROUP BY week
ORDER BY week DESC
LIMIT 4;
```

## AI Integration

### Gemini API Implementation

1. **Configuration**

```python
class GeminiConfig:
    API_KEY: str = os.getenv("GEMINI_API_KEY")
    MODEL: str = "gemini-pro"
    MAX_OUTPUT_TOKENS: int = 1024
```

2. **Insight Generation**

```python
class GeminiService:
    def __init__(self, config: GeminiConfig):
        self.client = genai.Client(api_key=config.API_KEY)
        self.model = self.client.get_model(config.MODEL)

    async def analyze_meal(self, meal_data: MealData, user_profile: UserProfile) -> Dict:
        prompt = f"""
        Analyze this meal choice for a user with the following profile:
        - Goals: {user_profile.goals}
        - Dietary restrictions: {user_profile.dietary_restrictions}
        - Activity level: {user_profile.activity_level}

        Meal details:
        - Name: {meal_data.name}
        - Ingredients: {', '.join(meal_data.ingredients)}
        - Calories: {meal_data.calories}

        Provide:
        1. Nutritional assessment
        2. Goal alignment
        3. Recommendations for improvement
        4. Alternative suggestions if needed
        """

        response = await self.model.generate_content(prompt)
        return self._parse_response(response)

    async def get_weekly_insights(self, user_data: UserWeeklyData) -> List[Insight]:
        prompt = f"""
        Analyze this user's weekly nutrition and fitness data:
        - Average daily calories: {user_data.avg_daily_calories}
        - Workout frequency: {user_data.workout_frequency}
        - Most common meals: {user_data.common_meals}

        Goals: {user_data.goals}

        Provide:
        1. Progress assessment
        2. Pattern identification
        3. Actionable recommendations
        4. Suggested modifications
        """

        response = await self.model.generate_content(prompt)
        return self._parse_weekly_insights(response)
```

### Integration Points

1. **Meal Logging Flow**

```python
@router.post("/meals")
async def log_meal(meal: MealCreate, current_user: User = Depends(get_current_user)):
    # Save meal to Snowflake
    meal_id = await db.insert_meal(meal)

    # Get user profile for context
    user_profile = await db.get_user_profile(current_user.id)

    # Generate AI insights
    insights = await gemini_service.analyze_meal(meal, user_profile)

    # Save insights
    await db.save_meal_insights(meal_id, insights)

    return {
        "meal": meal,
        "insights": insights
    }
```

2. **Weekly Review Generation**

```python
@router.get("/insights/weekly")
async def get_weekly_insights(current_user: User = Depends(get_current_user)):
    # Gather weekly data
    weekly_data = await db.get_weekly_summary(current_user.id)

    # Generate insights
    insights = await gemini_service.get_weekly_insights(weekly_data)

    # Save and return
    await db.save_weekly_insights(current_user.id, insights)
    return {"insights": insights}
```

## Development Setup

### Prerequisites

1. Node.js & npm (Frontend)
2. Python 3.9+ (Backend)
3. Snowflake account
4. Google Cloud project with Gemini API access

### Environment Setup

1. Frontend (.env):

```
API_URL=http://localhost:8000
```

2. Backend (.env):

```
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
GEMINI_API_KEY=your_api_key
JWT_SECRET=your_secret_key
```

### Running the Project

1. Frontend:

```bash
cd hackumass
npm install
npx expo start
```

2. Backend:

```bash
cd hackumass/backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Testing

1. API Testing (using Swagger):

- Visit http://localhost:8000/docs
- Authorize with JWT token
- Test endpoints

2. Frontend Testing:

- Use Expo Go app
- Scan QR code
- Test on physical device
