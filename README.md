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

## License

This project was created for HackUMass.
