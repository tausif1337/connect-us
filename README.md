# Connect Us

A modern React Native mobile application built with Expo, featuring Firebase authentication and a clean, responsive UI using NativeWind (Tailwind CSS).

## 📱 Features

- ✅ **User Authentication**
  - Email/Password signup and login
  - Secure authentication with Firebase Auth
  - Persistent login sessions with AsyncStorage
  - Protected routes with automatic navigation

- ✅ **User Profile Management**
  - Profile photo upload with Cloudinary integration
  - Customizable bio
  - Public/Private profile toggle
  - Profile data stored in Firebase Firestore
  - Real-time profile updates

- ✅ **Settings & Preferences**
  - Push notifications toggle
  - Dark mode preference
  - Email updates configuration
  - Privacy policy and terms access
  - Secure logout functionality

- ✅ **Bottom Tab Navigation**
  - Home screen with welcome message
  - Profile screen with image upload
  - Settings screen for preferences
  - Smooth navigation experience

- ✅ **Modern UI/UX**
  - Clean and minimal design
  - Responsive layouts
  - NativeWind (Tailwind CSS) for styling
  - Form validation and error handling
  - Consistent styling across screens

- ✅ **TypeScript**
  - Full TypeScript support
  - Type-safe navigation
  - Better developer experience

## 🛠️ Technologies Used

- **Framework:** React Native (Expo SDK 54)
- **Language:** TypeScript
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Image Upload:** Cloudinary
- **Image Picker:** Expo Image Picker
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **Styling:** NativeWind (Tailwind CSS)
- **State Management:** React Context API
- **Storage:** AsyncStorage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Firebase Account** (for authentication)
- For iOS development: **Xcode** (macOS only)
- For Android development: **Android Studio**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd connect-us
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Email/Password** authentication:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" and click the web icon (`</>`)
   - Copy the Firebase configuration object

### 4. Setup Firebase Firestore

1. In Firebase Console, enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Choose "Start in production mode" or "Test mode"
   - Select your preferred location

### 5. Setup Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

Replace the placeholder values with your actual Firebase configuration.

### 6. Setup Cloudinary (for image uploads)

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name from the dashboard
3. Create an upload preset:
   - Go to Settings → Upload → Add upload preset
   - Set preset name to `profile_uploads`
   - Set signing mode to "Unsigned"
4. Update the Cloudinary URL in `src/uploadImageToCloudinary.ts` with your cloud name

To ignore this error "ERROR  Error loading user posts: [FirebaseError: Missing or insufficient permissions.]" just go to firebase console and enable the read and write permissions for the firestore database.

Firebase Console -> Firestore Database -> Rules -> Edit rules -> Paste the above code -> Publish

"allow read, write: if true;"




 


### 7. Run the App

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS Simulator (macOS only)
- Press `a` for Android Emulator
- Press `w` for Web
- Scan the QR code with Expo Go app on your physical device

Or run platform-specific commands:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 Project Structure

```
connect-us/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication context
│   ├── screens/
│   │   ├── LoginScreen.tsx           # Login screen
│   │   ├── SignupScreen.tsx          # Signup screen
│   │   ├── HomeScreen.tsx            # Home screen (protected)
│   │   ├── ProfileScreen.tsx         # Profile management screen
│   │   └── SettingsScreen.tsx        # Settings and preferences screen
│   ├── types/
│   │   └── navigation.ts             # Navigation type definitions
│   ├── firebase.ts                   # Firebase configuration
│   └── uploadImageToCloudinary.ts    # Cloudinary image upload utility
├── assets/                           # Images and icons
├── App.tsx                           # Main app component with navigation
├── app.json                          # Expo configuration
├── babel.config.js                   # Babel configuration
├── metro.config.js                   # Metro bundler configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── global.css                        # Global styles
├── index.ts                          # App entry point
└── package.json                      # Dependencies and scripts
```

## 🎯 Available Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run android` - Run on Android emulator
- `npm run web` - Run on web browser

## 🔐 Authentication Flow

1. **Signup:** Users can create a new account with email, password, and display name
2. **Login:** Users can sign in with their email and password
3. **Protected Routes:** 
   - Authenticated users are automatically directed to the Home screen with bottom tabs
   - Unauthenticated users see the Login/Signup screens
4. **Persistent Sessions:** Login state is preserved using AsyncStorage
5. **Logout:** Users can sign out from the Settings screen

## 🎨 Screens

### Login Screen
- Email and password input fields
- Form validation and error handling
- Navigation to Signup screen
- Clean, minimal design

### Signup Screen
- Display name, email, and password fields
- Form validation and error handling
- Automatic login after successful signup
- Navigation to Login screen

### Home Screen (Protected)
- Welcome message with user's display name
- User information display
- Bottom tab navigation
- Clean, modern interface

### Profile Screen (Protected)
- Profile photo upload and display
- Image selection via Expo Image Picker
- Cloudinary integration for image storage
- Editable bio field (multiline text input)
- Public/Private profile toggle
- Save functionality with Firestore integration
- Display account email
- Real-time profile updates

### Settings Screen (Protected)
- Account information display
- Edit Profile navigation
- Preferences:
  - Push notifications toggle
  - Dark mode toggle
  - Email updates toggle
- About section:
  - Privacy Policy
  - Terms of Service
  - App version display
- Logout functionality with confirmation

## 🐛 Troubleshooting

### NativeWind styles not working
- Ensure `global.css` is imported in `App.tsx`
- Verify `metro.config.js` is configured correctly
- Restart the development server

### Firebase not initializing
- Check that `.env` file exists with correct `EXPO_PUBLIC_` prefixed variables
- Restart the development server after adding environment variables
- Verify Firebase project settings

### Navigation errors
- Ensure all navigation types are correctly defined in `src/types/navigation.ts`
- Check that screens are properly imported in `App.tsx`

### TypeScript errors
- Run `npm install` to ensure all type definitions are installed
- Check `tsconfig.json` configuration
- Verify all imports are correct

## 📚 Documentation

For a detailed step-by-step guide on building this app from scratch, see [STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md).

## 🔮 Future Enhancements

- [ ] Password reset functionality
- [ ] Social authentication (Google, Apple)
- [ ] Actual push notifications implementation
- [ ] Dark mode theme implementation
- [ ] Email notifications system
- [ ] User search and discovery
- [ ] Friend requests and connections
- [ ] Chat/messaging features
- [ ] Activity feed
- [ ] Privacy policy and terms content

## 📄 License

This project is private.

## 👤 Author

Connect Us - React Native App

---

**Note:** Make sure to keep your `.env` file secure and never commit it to version control. It's already included in `.gitignore`.
