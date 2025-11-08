# UMunch

A React Native mobile application built with Expo Router for tracking meals, workouts, and nutritional goals at UMass dining halls.

## Features

- User authentication (Login/Signup)
- Personalized user profiles with health information
- Dietary restrictions management
- Goal setting and tracking
- Activity level selection
- Dining hall selection and meal tracking
- Workout logging
- Dashboard with calendar view

## Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Language**: TypeScript
- **UI Architecture**: Atomic Design Pattern (Atoms, Molecules, Organisms, Templates)

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

## Installation

1. Clone the repository:
```bash
git clone https://github.com/julia-epshtein/umunch.git
cd umunch/hackumass
```

2. Install dependencies:
```bash
npm install
```

## Running the App

Start the Expo development server:
```bash
npx expo start
```

Then choose your platform:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your physical device

Or run directly on a specific platform:
```bash
npx expo start --ios      # iOS
npx expo start --android  # Android
npx expo start --web      # Web
```

## Project Structure

```
hackumass/
├── app/                      # App screens and routing
│   ├── _layout.tsx          # Root layout with navigation
│   ├── index.tsx            # Entry point (redirects to login)
│   ├── login.tsx            # Login screen
│   ├── signup.tsx           # Signup screen
│   ├── user-info.tsx        # User information form
│   ├── dietary-restrictions.tsx
│   ├── goals.tsx
│   ├── activity-level.tsx
│   ├── dining-hall.tsx
│   ├── dashboard.tsx
│   ├── calendar.tsx
│   ├── meal.tsx
│   ├── workout.tsx
│   └── profile.tsx
├── components/              # Reusable components
│   ├── atoms/              # Basic building blocks
│   ├── molecules/          # Simple component groups
│   ├── organisms/          # Complex component compositions
│   └── templates/          # Page-level templates
├── global.css              # Global styles
└── package.json            # Dependencies and scripts
```

## Development

The app uses Atomic Design principles for component organization:
- **Atoms**: Basic UI elements (Button, Input, Label, etc.)
- **Molecules**: Simple component combinations (FormField, Card, etc.)
- **Organisms**: Complex features (SignUpForm, MealTracker, etc.)
- **Templates**: Page layouts (BottomNavigation, etc.)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test on both iOS and Android if possible
4. Submit a pull request

## Backend Setup

The backend is built with FastAPI and integrates with Snowflake for data warehousing.

### Backend Tech Stack

- **Framework**: FastAPI (Python)
- **Database**: Snowflake
- **Authentication**: JWT tokens
- **API Documentation**: OpenAPI/Swagger

### Backend Prerequisites

- Python 3.9 or later
- pip (Python package manager)
- Snowflake account and credentials
- Virtual environment tool (venv or conda)

### Setting up the Backend

1. Navigate to the backend directory:
```bash
cd umunch/hackumass/backend
```

2. Create and activate a virtual environment:
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (create a .env file):
```bash
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
SNOWFLAKE_WAREHOUSE=your_warehouse
GEMINI_API_KEY=your_gemini_key

# Server configuration (update SERVER_HOST with your local IP)
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

**Finding your local IP address:**
- macOS/Linux: Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: Run `ipconfig` and look for IPv4 Address

5. Update the frontend .env file (in `hackumass/.env`):
```bash
# Update with your computer's IP address
EXPO_PUBLIC_API_HOST=your_local_ip
EXPO_PUBLIC_API_PORT=8000
```

5. Update the frontend .env file (in `hackumass/.env`):
```bash
# Update with your computer's IP address
EXPO_PUBLIC_API_HOST=your_local_ip
EXPO_PUBLIC_API_PORT=8000
```

6. Start the development server:
```bash
# Use the start script (automatically reads .env file)
./start_server.sh
```

The start script will:
- Load configuration from your .env file
- Start the server with the configured host and port
- Display the network URLs where your API is accessible

The API will be available at:
- **From your computer**: http://localhost:8000
- **From network devices**: http://YOUR_IP:8000 (configured in .env)
- API documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

**Note**: The IP address is now configured in the .env files for both backend and frontend. Update these files when your IP address changes.

### Food Image Integration

The backend integrates with the [Hugging Face MM-Food-100K dataset](https://huggingface.co/datasets/Codatta/MM-Food-100K) to provide images for menu items.

**Testing the integration:**
```bash
cd hackumass/backend
source venv/bin/activate  # if not already activated
python test_food_images.py
```

**New API Endpoints:**

1. **Get menu with images**:
   ```
   GET /meals/menu?dining_hall_code=BERKSHIRE&meal_type_code=LUNCH
   ```

2. **Get food image**:
   ```
   GET /meals/image/{food_name}
   ```

See `backend/FOOD_IMAGE_INTEGRATION.md` for detailed documentation on:
- How the image matching works
- Frontend integration examples
- Performance optimization tips
- Troubleshooting guide

### API Structure

The backend provides RESTful endpoints for:
- User authentication (signup/login)
- User profile management
- Dietary preferences
- Meal tracking
- Workout logging
- Analytics events

See the API documentation at `/docs` for detailed endpoint specifications.

## License

This project was created for HackUMass.
