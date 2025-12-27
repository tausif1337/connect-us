# Google Authentication Setup Guide

This guide will walk you through setting up Google Sign-In for the Connect Us app using Firebase Authentication.

## Prerequisites

- Firebase project created
- Expo project configured
- Node.js and npm installed

## Step 1: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** in the providers list
5. Toggle **Enable**
6. Note down the **Web client ID** shown (you'll need this later)
7. Click **Save**

## Step 2: Configure Google Cloud Console

### 2.1 Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select the same project as your Firebase project
3. Navigate to **APIs & Services** → **Credentials**

### 2.2 Create iOS OAuth Client ID

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Application type**: **iOS**
3. Enter:
   - **Name**: Connect Us iOS
   - **Bundle ID**: `com.connectus.app`
4. Click **Create**
5. Copy the **Client ID** (format: `xxx.apps.googleusercontent.com`)

### 2.3 Create Android OAuth Client ID

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Application type**: **Android**
3. Enter:
   - **Name**: Connect Us Android
   - **Package name**: `com.connectus.app`
   - **SHA-1 certificate fingerprint**: (see below how to get it)

#### Getting SHA-1 for Development:

```bash
# For Debug keystore (development)
keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey
# Password: android
```

Copy the **SHA-1** value and paste it in Google Cloud Console.

4. Click **Create**
5. Copy the **Client ID**

#### Getting SHA-1 for Production:

When building for production with EAS Build, you'll need to:

```bash
# After creating your first build, get the SHA-1 from Expo
eas credentials
```

Then add this SHA-1 to your Google Cloud Console Android client.

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your credentials:

```env
# Firebase Configuration (from Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=yyy.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=zzz.apps.googleusercontent.com
```

## Step 4: Test the Integration

### Development Testing

1. Start the Expo development server:
```bash
npm start
```

2. Test on different platforms:
   - **iOS Simulator**: Press `i`
   - **Android Emulator**: Press `a`
   - **Physical Device**: Scan the QR code with Expo Go app

### Testing Google Sign-In

1. Open the app and navigate to Login or Signup screen
2. Tap "Continue with Google"
3. Select your Google account
4. Grant permissions
5. You should be signed in automatically

## Step 5: OAuth Consent Screen (Required for Production)

Before publishing your app, configure the OAuth consent screen:

1. Go to **Google Cloud Console** → **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - **App name**: Connect Us
   - **User support email**: your-email@example.com
   - **Developer contact information**: your-email@example.com
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Save and continue

## Troubleshooting

### "Sign-in failed" error

- Verify all Client IDs are correctly added to `.env`
- Check that bundle identifiers in `app.json` match those in Google Cloud Console
- Ensure Google Sign-In is enabled in Firebase Console

### iOS specific issues

- Make sure the iOS Client ID is created in Google Cloud Console
- Verify the Bundle ID matches: `com.connectus.app`
- Check that the scheme `connectus` is set in `app.json`

### Android specific issues

- Ensure you've added the correct SHA-1 fingerprint
- For development, use the debug keystore SHA-1
- For production, add the EAS build SHA-1
- Package name must match: `com.connectus.app`

### "Invalid client ID" error

- Double-check that you're using the correct Client ID for each platform
- The Web Client ID from Firebase is different from iOS/Android Client IDs
- Make sure there are no trailing spaces in your `.env` file

### Redirect URI issues

- Verify the scheme in `app.json` is set to `connectus`
- Check that bundle identifiers are correctly configured

## Features Implemented

✅ Google Sign-In on Login screen
✅ Google Sign-In on Signup screen
✅ Automatic user profile creation in Firestore
✅ Error handling with user-friendly messages
✅ Loading states during authentication
✅ Integration with existing AuthContext
✅ Proper redirect URI configuration

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use different credentials for development and production**
3. **Regularly rotate OAuth credentials**
4. **Monitor authentication attempts in Firebase Console**
5. **Keep dependencies updated**

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Expo Google Sign-In Guide](https://docs.expo.dev/guides/google-authentication/)
- [Google Cloud Console](https://console.cloud.google.com)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase Console for authentication logs
3. Check Expo development tools for runtime errors
