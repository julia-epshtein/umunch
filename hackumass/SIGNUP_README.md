# Sign Up Page - ATOM Principles

This signup page is built following **Atomic Design** principles, which organizes components into a clear hierarchy:

## 🧬 Component Structure

### Atoms (Basic Building Blocks)
Located in `components/atoms/`

- **Button.tsx** - Reusable button component with variants (primary, secondary, outline)
- **Input.tsx** - Text input field with consistent styling
- **Label.tsx** - Form label with optional required indicator
- **ErrorText.tsx** - Error message display

### Molecules (Simple Component Combinations)
Located in `components/molecules/`

- **FormField.tsx** - Combines Label + Input + ErrorText for complete form fields
- **LinkText.tsx** - Combines text with clickable link for navigation

### Organisms (Complex UI Sections)
Located in `components/organisms/`

- **SignUpForm.tsx** - Complete signup form with validation logic
  - Form state management
  - Email validation
  - Password strength validation
  - Password confirmation matching
  - Error handling

### Pages (Screens)
Located in `app/`

- **signup.tsx** - Sign up screen that uses the SignUpForm organism

## 🎨 Features

- ✅ Form validation (email format, password length, password match)
- ✅ Error messages for each field
- ✅ Loading state during submission
- ✅ Responsive design with NativeWind (Tailwind CSS)
- ✅ Keyboard-aware scrolling
- ✅ Type-safe with TypeScript
- ✅ Navigation to login page

## 🚀 Usage

Navigate to the signup page by running your Expo app and clicking "Go to Sign Up" on the home screen, or directly access `/signup`.

## 📦 Component Imports

You can import components individually or from the index files:

```typescript
// Individual import
import { Button } from './components/atoms/Button';

// From index
import { Button, Input, Label } from './components/atoms';

// Or from root components
import { SignUpForm } from './components';
```

## 🎯 Validation Rules

- **Full Name**: Required
- **Email**: Required, must be valid email format
- **Password**: Required, minimum 8 characters
- **Confirm Password**: Required, must match password

## 🔄 Future Enhancements

- Add password strength indicator
- Add social login options
- Implement actual API integration
- Add email verification
- Add terms & conditions checkbox
